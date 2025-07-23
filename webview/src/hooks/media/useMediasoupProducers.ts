import {
  type RefObject,
  type SetStateAction,
  useRef,
  useState,
  type Dispatch,
  useEffect,
} from "react";
import { types } from "mediasoup-client";

import type {
  producerT,
  StartProducingOptions,
  HandleMediasoupProducersProps,
} from "../../types/calls.types";
import SocketClient from "../../socketClient";

import { mediaSocketEvents } from "../../events";

export type ProducerCore = {
  createProducerTransport: (roomId: string, callType: string) => Promise<void>;
  setupProducerTransportEvents: (
    producerTransport: types.Transport,
    roomId: string
  ) => void;
  startProducing: (callType: string) => Promise<void>;
  produceAudio: ({ isScreenSharing }: StartProducingOptions) => Promise<void>;

  stopProducing: () => Promise<void>;
  producers: producerT;
  producerTransportRef: RefObject<types.Transport<types.AppData> | null>;

  setProducers: Dispatch<SetStateAction<producerT>>;
};

export function useMediasoupProducers({
  // socket,
  getDevice,
}: HandleMediasoupProducersProps): ProducerCore {
  const producerTransportRef = useRef<types.Transport | null>(null);
  const [producers, setProducers] = useState<producerT>({
    facing_mode: "front",
  });
  const createProducerTransport = async (roomId: string, callType: string) => {
    const socket = SocketClient.getSocket();
    const device = getDevice();
    if (!socket) {
      console.log("Socket not initialized");
      return;
    }

    socket.emit(
      mediaSocketEvents.CREATE_PRODUCER_TRANSPORT,
      { roomId, callType },
      async (transportOptions: any) => {
        try {
          const producerTransport =
            device.createSendTransport(transportOptions);
          producerTransportRef.current = producerTransport;

          setupProducerTransportEvents(producerTransport, roomId);
          await startProducing(callType);
        } catch (err) {
          console.error("❌ Failed to create producer transport:", err);
        }
      }
    );
  };

  const setupProducerTransportEvents = (
    producerTransport: types.Transport,
    roomId: string
  ) => {
    producerTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      const socket = SocketClient.getSocket();
      if (!socket) {
        console.log("Socket not initialized");
        return;
      }
      socket.emit(
        mediaSocketEvents.CONNECT_PRODUCER_TRANSPORT,
        { dtlsParameters, roomId },
        (data: any) =>
          data?.status
            ? callback()
            : errback(new Error("Failed to connect transport"))
      );
    });

    producerTransport.on(
      "produce",
      ({ kind, rtpParameters, appData }, callback, errback) => {
        const socket = SocketClient.getSocket();
        if (!socket) {
          console.log("Socket not initialized");
          return;
        }
        socket.emit(
          mediaSocketEvents.PRODUCE,
          {
            id: producerTransport.id,
            kind,
            rtpParameters,
            appData,
            roomId,
            isScreenShare: appData?.isScreenSharing
              ? appData.isScreenSharing
              : false,
          },
          (data: { id: string }) => callback({ id: data.id })
        );
      }
    );

    producerTransport.on("connectionstatechange", async (state) => {
      console.log("🚨 Producer transport connection state:", state);
      if (state === "failed") {
        console.warn("🚨 Producer transport connection failed.");
        const stats = await producerTransport.getStats();
        console.table(Array.from(stats));
      }
    });
  };

  const startProducing = async (callType: string) => {
    if (callType === "audio") {
      await produceAudio({});
    } else if (callType === "video") {
      await Promise.all([produceAudio({}), produceVideo({})]);
    }
  };

  const produceAudio = async ({ isScreenSharing }: StartProducingOptions) => {
    try {
      const transport = producerTransportRef.current;
      if (!transport) throw new Error("No transport available");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const track = stream.getAudioTracks()[0];
      if (!track) throw new Error("No audio track available");

      const audioProducer = await transport.produce({
        track: track, // Cast React Native WebRTC track to mediasoup-client compatible type
        appData: { isScreenSharing },
      });

      setProducers((prev) => {
        return {
          ...prev,
          audioProducer,
          audioTrack: track,
          isAudioPaused: false,
        };
      });
    } catch (err) {
      console.error("🎤 Failed to produce audio:", err);
    }
  };

  const produceVideo = async ({ isScreenSharing }: StartProducingOptions) => {
    try {
      const transport = producerTransportRef.current;
      if (!transport) throw new Error("No transport available");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      });

      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error("No video track available");
      const bitrate_480 = 700_000;
      const bitrate_720 = 1_500_000;
      const bitrate_360 = 500_000; // 500 kbps

      const videoProducer = await transport.produce({
        track: track as any,
        encodings: [
          {
            maxBitrate: bitrate_360, // ~360p
            scaleResolutionDownBy: 2.0, // 720 / 2 ≈ 360
          },
          {
            maxBitrate: bitrate_480, // ~480p
            scaleResolutionDownBy: 1.5, // 720 / 1.5 ≈ 480
          },
          {
            maxBitrate: bitrate_720, // ~720p
            scaleResolutionDownBy: 1.0, // no downscale
          },
        ],
        codecOptions: {
          // videoGoogleStartBitrate: 1000,
        },
        appData: { isScreenSharing },
      });

      setProducers((prev) => ({
        ...prev,
        videoProducer,
        videoTrack: track,
        isVideoPaused: false,
        videoStream: stream,
        isScreenSharing,
        facing_mode: "front",
      }));

      return videoProducer;
    } catch (err) {
      console.error("📹 Failed to produce video:", err);
    }
  };

  const stopProducing = async () => {
    producers?.audioProducer?.close();
    producers?.videoProducer?.close();
    producers?.videoScreenShareProducer?.close();
    producers?.audioScreenShareProducer?.close();
    producerTransportRef.current?.close();
    producerTransportRef.current = null;
    producers.videoStream?.getTracks().map((track) => {
      track.stop();
    });
    setProducers({});
  };

  return {
    createProducerTransport,
    stopProducing,
    produceAudio,
    startProducing,
    producers,
    producerTransportRef,
    setupProducerTransportEvents,
    setProducers,
  };
}
