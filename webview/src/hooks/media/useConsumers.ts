import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { Device, types } from "mediasoup-client";
import { type consumeRes, type Participant } from "../../types/calls.types";
import { Socket } from "socket.io-client";
// import useUser from "../useUser";
import { mediaSocketEvents } from "../../events";
import SocketClient from "../../socketClient";

interface HandleConsumersProps {
  // socket: Socket<any, any> | null;
  getDevice: () => Device;
}

export type ProducerSilentMap = { [key: string]: boolean };
type ScreenSharerInfo = {
  id: string;
  idx: number;
};
export type ConsumerCore = {
  remoteVideoData: Participant[];
  setRemoteVideoData: Dispatch<SetStateAction<Participant[]>>;
  producerSilentMap: ProducerSilentMap;
  createConsumerTransport: (roomId: string) => Promise<types.Transport>;
  updateRemoteVideoData: (
    participantId: string,
    data: Partial<Participant>
  ) => void;
  consume: (
    producerId: string,
    roomId: string,
    participantId: string,
    device: types.Device,
    isScreenSharing?: boolean,
    isTranslatedAudioProducer?: boolean,
    originalProducerId?: string
  ) => Promise<void>;
  stopConsuming: () => Promise<void>;
  removeRemoteVideo: ({
    participantId,
    isSharingScreen,
  }: {
    participantId: string;
    isSharingScreen: boolean;
  }) => void;
  getConsumerTransport: () => Promise<types.Transport<types.AppData>>;
  screenSharers: ScreenSharerInfo[];
  setScreenSharers: Dispatch<SetStateAction<ScreenSharerInfo[]>>;
};

export function useMediasoupConsumers({
  // socket,
  getDevice,
}: HandleConsumersProps): ConsumerCore {
  const consumerTransportRef = useRef<types.Transport | null>(null);
  const [remoteVideoData, setRemoteVideoData] = useState<Participant[]>([]);
  const dataConsumerRef = useRef<types.DataConsumer<types.AppData>>(null);
  const [screenSharers, setScreenSharers] = useState<ScreenSharerInfo[]>([]);
  const [producerSilentMap, setProducerSilentMap] = useState<ProducerSilentMap>(
    {}
  );

  const createConsumerTransport = async (
    roomId: string
  ): Promise<types.Transport> => {
    return new Promise((resolve, reject) => {
      const device = getDevice();

      const sctpCapabilities = device.sctpCapabilities;
      const socket = SocketClient.getSocket();
      if (!socket) {
        console.log("Socket not initialized");
        return;
      }
      socket.emit(
        mediaSocketEvents.CREATE_CONSUMER_TRANSPORT,
        { roomId, sctpCapabilities },
        (options: any) => {
          const transport = device.createRecvTransport(options);
          consumerTransportRef.current = transport;

          transport.on("connect", ({ dtlsParameters }, callback, errback) => {
            socket.emit(
              mediaSocketEvents.CONNECT_CONSUMER_TRANSPORT,
              { dtlsParameters, roomId },
              (res: any) => {
                res?.error ? errback(new Error("Connect failed")) : callback();
              }
            );
          });

          transport.on("connectionstatechange", (state) => {
            console.log("Consumer transport state:", state);
          });

          resolve(transport);
        }
      );
    });
  };

  const updateRemoteVideoData = (
    participantId: string,
    data: Partial<Participant>
  ) => {
    setRemoteVideoData((prev) => {
      return prev.map((p) => {
        if (p.participantId === participantId) {
          return { ...p, ...data };
        }
        return p;
      });
    });
  };

  const consume = async (
    producerId: string,
    roomId: string,
    participantId: string,
    device: types.Device,
    isScreenSharing = false,
    isTranslatedAudioProducer = false,
    originalProducerId?: string
  ) => {
    const socket = SocketClient.getSocket();
    const transport =
      consumerTransportRef.current || (await createConsumerTransport(roomId));
    const rtpCapabilities = device.rtpCapabilities;

    if (!socket) {
      console.log("Socket not initialized");
      return;
    }
    socket.emit(
      mediaSocketEvents.CONSUME,
      { rtpCapabilities, producerId, roomId, producerClientId: participantId },
      async (data: consumeRes) => {
        if (data.error) return console.error("Consume error:", data);

        const consumer = await transport.consume({
          id: data.id,
          producerId: data.producerId,
          kind: data.kind,
          rtpParameters: data.rtpParameters,
        });
        if (consumer.kind === "audio") {
          setProducerSilentMap((prev) => {
            return { ...prev, [consumer.producerId]: false };
          });
        }

        const track = consumer.track;
        track.onended = () => console.log("Track ended");
        track.onmute = () => console.log("Track muted");
        track.onunmute = () => console.log("Track unmuted");

        setTimeout(() => {
          if (dataConsumerRef.current === null) {
            socket.emit(
              mediaSocketEvents.CONSUME_DATA_PRODCUCER,
              { roomId },
              async (data: {
                id: string;
                sctpStreamParameters: types.SctpStreamParameters;
                dataProducerId: string;
              }) => {
                dataConsumerRef.current = await transport.consumeData({
                  id: data.id,
                  sctpStreamParameters: data.sctpStreamParameters,
                  dataProducerId: data.dataProducerId,
                });
                const consumer = dataConsumerRef.current;

                consumer.addListener("error", (err) => {
                  console.log(err, "error during consuemr createion");
                });

                consumer.on("message", (data) => {
                  const producerData = JSON.parse(data);
                  const threshold = -40;

                  if (producerData.type === "audio-volumes") {
                    const volumes: { producerId: string; volume: number }[] =
                      producerData.volumes;
                    setProducerSilentMap((prev) => {
                      const latestVal = { ...prev };
                      Object.keys(prev).forEach((item) => {
                        const volumeData = volumes.find((val) => {
                          return val.producerId === item;
                        });

                        if (volumeData) {
                          latestVal[item] = volumeData.volume < threshold;
                        } else {
                          latestVal[item] = true;
                        }
                      });
                      return latestVal;
                    });
                  }
                });
              }
            );
          }
        }, 1 * 1000);

        setRemoteVideoData((prev) => {
          const index = prev.findIndex(
            (p) => p.participantId === data.participantId
          );

          if (index !== -1) {
            const updated = [...prev];
            const existing = updated[index];

            if (data.kind === "audio" && isTranslatedAudioProducer) {
              existing.translatedAudioConsumer = consumer;
              existing.translatedAudioTrack = track;
              existing.audioProducerId = originalProducerId;
            } else if (data.kind === "audio" && !isTranslatedAudioProducer) {
              existing.audioConsumer = consumer;
              existing.audioTrack = track;
              existing.audioProducerId = data.producerId;
            } else if (data.kind === "video") {
              existing.videoConsumer = consumer;
              existing.videoTrack = track;
            }

            updated[index] = existing;
            return updated;
          } else {
            const newParticipant: Participant = {
              userId: `${data.participantId}`,
              participantId: data.participantId,
              audioConsumer: data.kind === "audio" ? consumer : null,
              videoConsumer: data.kind === "video" ? consumer : null,

              client: data.participant.client,
              isScreenSharing,
              translatedAudioConsumer:
                data.kind === "audio" && isTranslatedAudioProducer
                  ? consumer
                  : null,
              translatedAudioTrack:
                data.kind === "audio" && isTranslatedAudioProducer
                  ? track
                  : null,
            };
            if (data.kind === "audio") {
            }

            if (isScreenSharing) {
              setScreenSharers((prevScreenSharers) => {
                return [
                  ...prevScreenSharers,
                  { id: data.participantId, idx: prev.length },
                ];
              });
            }
            return [...prev, newParticipant];
          }
        });

        socket.emit(mediaSocketEvents.UNPAUSE, { id: data.id, roomId }, () =>
          consumer.resume()
        );
      }
    );
  };

  // const consume = async (
  //   producerId: string,
  //   roomId: string,
  //   participantId: string,
  //   device: types.Device,
  //   isScreenSharing = false
  // ) => {
  //   const transport =
  //     consumerTransportRef.current || (await createConsumerTransport(roomId));
  //   const rtpCapabilities = device.rtpCapabilities;

  //   const socket = SocketClient.getSocket();
  //   if (!socket) {
  //     console.log("Socket not initialized");
  //     return;
  //   }
  //   socket.emit(
  //     mediaSocketEvents.CONSUME,
  //     { rtpCapabilities, producerId, roomId, producerClientId: participantId },
  //     async (data: consumeRes) => {
  //       if (data.error) return console.error("Consume error:", data);

  //       const consumer = await transport.consume({
  //         id: data.id,
  //         producerId: data.producerId,
  //         kind: data.kind,
  //         rtpParameters: data.rtpParameters,
  //       });
  //       if (consumer.kind === "audio") {
  //         setProducerSilentMap((prev) => {
  //           return { ...prev, [consumer.producerId]: false };
  //         });
  //       }

  //       // setInterval(() => {
  //       //   consumer.getStats().then((stats) => {
  //       //     const statsArr = Array.from(stats.values());
  //       //     statsArr.forEach((stat) => {
  //       //       if (stat.type === "inbound-rtp") {
  //       //         console.log(stat);
  //       //       }
  //       //     });
  //       //   });
  //       // }, 3000);

  //       const track = consumer.track;
  //       track.onended = () => console.log("Track ended");
  //       track.onmute = () => console.log("Track muted");
  //       track.onunmute = () => console.log("Track unmuted");

  //       setRemoteVideoData((prev) => {
  //         const index = prev.findIndex(
  //           (p) => p.participantId === data.participantId
  //         );

  //         if (index !== -1) {
  //           const updated = [...prev];
  //           const existing = updated[index];

  //           if (data.kind === "audio") {
  //             existing.audioConsumer = consumer;
  //           } else if (data.kind === "video") {
  //             existing.videoConsumer = consumer;
  //           }

  //           updated[index] = existing;
  //           return updated;
  //         } else {
  //           const newParticipant: Participant = {
  //             userId: `${data.participantId}`,
  //             participantId: data.participantId,
  //             audioConsumer: data.kind === "audio" ? consumer : null,
  //             videoConsumer: data.kind === "video" ? consumer : null,

  //             client: data.participant.client,
  //             isScreenSharing,
  //           };
  //           if (data.kind === "audio") {
  //           }

  //           if (isScreenSharing) {
  //             setScreenSharers((prevScreenSharers) => {
  //               return [
  //                 ...prevScreenSharers,
  //                 { id: data.participantId, idx: prev.length },
  //               ];
  //             });
  //           }
  //           return [...prev, newParticipant];
  //         }
  //       });

  //       socket.emit(mediaSocketEvents.UNPAUSE, { id: data.id, roomId }, () =>
  //         consumer.resume()
  //       );
  //     }
  //   );
  // };

  const stopConsuming = async () => {
    remoteVideoData.forEach((participant) => {
      participant.audioConsumer?.close();
      participant.videoConsumer?.close();
      participant.audioTrack?.stop();
      participant.videoTrack?.stop();
    });

    consumerTransportRef.current?.close();
    consumerTransportRef.current = null;
    dataConsumerRef.current = null;
    setScreenSharers([]);
  };

  const removeRemoteVideo = useCallback(
    ({
      participantId,
      isSharingScreen,
    }: {
      participantId: string;
      isSharingScreen: boolean;
    }) => {
      console.log(
        participantId,
        isSharingScreen,
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>."
      );
      setRemoteVideoData((prev) => {
        const updated = prev.filter((p) => p.participantId !== participantId);
        const removed = prev.find((p) => p.participantId === participantId);

        if (removed) {
          removed.audioConsumer?.close();
          removed.videoConsumer?.close();
          removed.audioTrack?.stop();
          removed.videoTrack?.stop();
        }

        return updated;
      });
      if (isSharingScreen) {
        setScreenSharers((prev) => {
          const updated = prev.filter((ss) => ss.id !== participantId);
          return updated;
        });
      }
    },
    []
  );

  const getConsumerTransport = () => {
    if (!consumerTransportRef.current) {
      throw new Error("consumer transport not created");
    }
    return Promise.resolve(consumerTransportRef.current);
  };

  return {
    consume,
    stopConsuming,
    createConsumerTransport,
    remoteVideoData,
    setRemoteVideoData,
    removeRemoteVideo,
    getConsumerTransport,
    updateRemoteVideoData,
    producerSilentMap,
    screenSharers,
    setScreenSharers,
  };
}
