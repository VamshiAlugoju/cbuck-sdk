import { useRef } from "react";
import { Device, types } from "mediasoup-client";

import { useMediasoupProducers } from "./hooks/media/useMediasoupProducers";

import { useMediasoupConsumers } from "./hooks/media/useConsumers";

import { useEffect, useState } from "react";

import { outGoingCallEvents, translationEvents } from "./events";
import "./App.css";

import type {
  AnswerCallDto,
  CallTranslationContext,
  StartCallDto,
} from "./types";
import type { CallDetails } from "./types";
import type {
  answerCallRes,
  Participant,
  StartCallRes,
} from "./types/calls.types";
import type { DeviceCore } from "./context/RtcProvider";
import SocketClient from "./socketClient";
import { isOriginalAudioEnabled, sendRNMessage } from "./utils/utils";
import type { Message } from "postcss";
import { translateText } from "./chats/chatsLib";

const defaultCallDetails: CallDetails = {
  callId: "",
  roomId: "",
  state: "idle",
  type: "audio", // audio | video
  startedAt: undefined,
  duration: 0,

  participants: [],
  initiatorId: "",
  recipients: [],
};

type RNMessageType =
  | "startCall"
  | "acceptCall"
  | "rejectCall"
  | "endCall"
  | "reconnect"
  | "toggleAudioMute"
  | "toggleVideoMute"
  | "init"
  | "translateAudio"
  | "send_message"
  | "languageChange";

type RNMessage = {
  type: RNMessageType;
  data: any;
};

function App() {
  const [userId, setUserId] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("eng");
  const targetLangRef = useRef("eng");

  useEffect(() => {
    const id = setInterval(() => {
      console.log("web:: targetLangRef -------------", targetLangRef.current);
    }, 10 * 1000);
    return () => clearInterval(id);
  }, []);

  const [originalAudioEnabled, setOriginalAudioEnabled] = useState(false);
  // const [apiKey, setApiKey] = useState("");

  const [callState, setCallState] = useState<CallDetails>(defaultCallDetails);

  async function init(payload: { apiKey: string; uniqueId: string }) {
    connectUser(payload.uniqueId);
    setUserId(payload.uniqueId);
    // setApiKey(payload.apiKey);
    const _enabled = await isOriginalAudioEnabled();
    setOriginalAudioEnabled(_enabled);
  }

  async function connectUser(userId: string) {
    try {
      SocketClient.connect(userId);
      setTimeout(() => {
        SocketClient.loadSocketListeners(
          handleIncomingCall,
          haddleNewProducer,
          handleCallAnswered,
          handleCallTerminated,
          handleReceiveMessage,
          onTranslationError,
          onCallRejected,
          onNewUserJoined,
          onUserLeft
        );
      }, 1000);
    } catch (err) {
      console.error("web::", err);
    }
  }

  useEffect(() => {
    const socket = SocketClient.getSocket();
    if (socket) {
      SocketClient.loadSocketListeners(
        handleIncomingCall,
        haddleNewProducer,
        handleCallAnswered,
        handleCallTerminated,
        handleReceiveMessage,
        onTranslationError,
        onCallRejected,
        onNewUserJoined,
        onUserLeft
      );
    }
    return SocketClient.removeSocketListeners(
      handleIncomingCall,
      haddleNewProducer,
      handleCallAnswered,
      handleCallTerminated,
      handleReceiveMessage,
      onTranslationError,
      onCallRejected
    );
  }, [targetLanguage]);

  async function onTranslationError(
    callTranslationContext: CallTranslationContext
  ) {
    console.log("onTranslationStopped", callTranslationContext);
    const callDetails = callState;
    if (!callDetails || callDetails.state !== "ongoing") return;
    const participant = mediaConsumers.remoteVideoData?.find(
      (p) => p.userId === callTranslationContext.callContext.speaker
    );
    if (!participant) {
      console.warn("Terminating translation failed, participant not found");
      return;
    }
    participant.translatedAudioConsumer?.close();
    participant.translatedAudioTrack?.stop();
    console.info("Terminated translation");
    if (!participant?.audioProducerId) {
      console.info("Reconnecting translation failed, audio producer not found");
      return;
    }
    initiateTranslation(
      callDetails.roomId,
      participant.audioProducerId,
      participant.participantId
    );
  }

  async function initiateTranslation(
    roomId: string,
    producerId: string,
    clientId: string
  ) {
    // if (!config.audioTranslationEnabled) return;
    console.info("Initiating translation for: ", clientId);
    // const targetLang = targetLanguage || "eng";
    const targetLang = targetLangRef.current || "eng";

    const socket = SocketClient.getSocket();
    socket?.emit(
      translationEvents.INITIATE_TRANSLATION,
      { roomId, producerId, targetLang },
      async (data: any) => {
        const device = mediaDevice.getDevice();
        let prevDevice = device;
        if (!device) {
          prevDevice = await mediaDevice.initializeDevice(
            roomId,
            data.rtpCapabilites
          );
        }
        mediaConsumers.consume(
          data.producerId,
          roomId,
          clientId,
          prevDevice!,
          false,
          true,
          producerId
        );
      }
    );
  }

  function translateAudio(data: { participantId: string; lang: string }) {}

  function handleStartCall(data: {
    apiKey: string;
    callType: "audio";
    recipientId: string;
    uniqueId: string;
  }) {
    console.log("web::", userId, data.recipientId, "handleStartCall");
    if (data.recipientId) {
      const payload: StartCallDto = {
        recipients: [data.recipientId],
        callerId: data.uniqueId,
        call_type: "video",
      };
      const socket = SocketClient.getSocket();
      socket?.emit(
        outGoingCallEvents.START_CALL,
        payload,
        async (data: StartCallRes) => {
          if (data.error) {
            return;
          }

          const { callId, roomId, initiatorId, rtpCapabilities } = data;

          await mediaDevice.initializeDevice(roomId, rtpCapabilities);
          await mediaProducers.createProducerTransport(roomId, "video");
          await mediaConsumers.createConsumerTransport(roomId);
          setCallState((prev) => ({
            ...prev,
            callId,
            roomId,
            initiatorId,
            participants: [],
            state: "outgoing",
            startedAt: new Date(),
          }));
        }
      );
    }
  }

  function acceptCall(data: { roomId: string; callId: string }) {
    if (!data.roomId || !data.callId) {
      console.log("web::", "No room id or call id");
      return;
    }
    const socket = SocketClient.getSocket();
    const payload: AnswerCallDto = {
      roomId: data.roomId,
      callId: data.callId,
      userId: userId,
    };
    socket?.emit(
      outGoingCallEvents.ANSWER_CALL,
      payload,
      async (data: answerCallRes) => {
        const { roomId, producers, rtpCapabilites, callType, callId } = data;
        const device = await mediaDevice.initializeDevice(
          roomId,
          rtpCapabilites
        );
        await mediaProducers.createProducerTransport(roomId, callType);
        await mediaConsumers.createConsumerTransport(roomId);
        socket?.emit(outGoingCallEvents.NOTIFY_OWNER, {
          roomId,
          callId,
          clientId: userId,
        });
        if (producers && producers.length > 0) {
          producers.forEach(async (producer: any) => {
            if (producer.kind === "audio") {
              initiateTranslation(
                roomId,
                producer.id,
                producer.producerClientId
              );
            }
            if (!originalAudioEnabled) return;
            const consumer = await mediaConsumers.consume(
              producer.id,
              roomId,
              producer.producerClientId,
              device,
              producer.isScreenSharer ? producer.isScreenSharer : false
            );
          });
        }

        setCallState((prev) => {
          return {
            ...prev,
            state: "ongoing",
            initiatorId: data.initiatorId,
            roomId,
          };
        });
      }
    );
  }

  function rejectCall() {
    const socket = SocketClient.getSocket();
    const payload = {
      roomId: callState.roomId,
    };
    socket?.emit(outGoingCallEvents.REJECT_CALL, payload);
    setCallState(defaultCallDetails);
  }

  function endCall() {
    const socket = SocketClient.getSocket();
    const payload = {
      roomId: callState.roomId,
    };
    socket?.emit(outGoingCallEvents.END_CALL, payload);
    mediaConsumers.stopConsuming();
    mediaProducers.stopProducing();
    removeDevice();
    setCallState(defaultCallDetails);
  }

  function reconnect() {}

  function toggleAudioMute() {}

  function toggleVideoMute() {}

  function onCallRejected() {
    setCallState(defaultCallDetails);
  }

  const mediaDevice = useDevice();
  const mediaProducers = useMediasoupProducers({
    getDevice: mediaDevice.getDevice,
  });

  const mediaConsumers = useMediasoupConsumers({
    // socket: SocketClient.getSocket(),
    getDevice: mediaDevice.getDevice,
  });

  // // 📡 Producer Event:
  async function haddleNewProducer(data: any) {
    try {
      const {
        producerId,
        kind,
        roomId,
        callType,
        rtpCapabilites,
        clientId,
        isScreenSharing,
      } = data;

      const device = mediaDevice.getDevice();
      let prevDevice = device;
      if (!device) {
        prevDevice = await mediaDevice.initializeDevice(roomId, rtpCapabilites);
      }
      if (kind === "audio") {
        initiateTranslation(roomId, producerId, clientId);
      }
      if (!originalAudioEnabled) return;
      mediaConsumers.consume(
        producerId,
        roomId,
        clientId,
        prevDevice!,
        isScreenSharing
      );
    } catch (err) {
      throw new Error("web::error when handling new producer");
    }
  }

  function removeDevice() {
    if (mediaDevice.deviceRef.current) {
      mediaConsumers.stopConsuming();
      mediaDevice.deviceRef.current = null;
      mediaConsumers.setRemoteVideoData([]);
      mediaProducers.stopProducing();
    }
  }

  async function cleanUpMediaTransports() {
    try {
      await mediaProducers.stopProducing();
      await mediaConsumers.stopConsuming();
    } catch (err) {
      console.log("web::", err);
    }
  }

  function handleIncomingCall(data: any) {
    console.log("web::", data, "handleIncomingCall at App.tsx ");
    setCallState((prev) => ({
      ...prev,
      state: "incoming",
      callId: data.callId,
      roomId: data.roomId,
    }));

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "incomingCall",
        data,
      })
    );
  }

  function handleCallAnswered(data: any) {
    console.log("web::", data, "handleCallAnswered at App.tsx ");
    setCallState((prev) => ({
      ...prev,
      state: "ongoing",
      callId: data.callId,
      roomId: data.roomId,
    }));
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "callAnswered",
        data,
      })
    );
  }

  function handleCallTerminated(data: any) {
    console.log("web::", data, "handleCallTerminated at App.tsx ");
    setCallState(defaultCallDetails);
    cleanUpMediaTransports();
    removeDevice();
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "callTerminated",
        data,
      })
    );
  }

  const [messages, setMessages] = useState<Message[]>([]);

  const handleReceiveMessage = async (message: Message) => {
    console.log("web::", message, "handleReceiveMessage at App.tsx ");
    if (targetLangRef.current && targetLangRef.current !== "eng") {
      const res = await translateText(message.text, message.targetLang);
      console.log("web:: translated response", res);
      message.text = res;
    }
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "receive_message",
        data: message,
      })
    );
  };

  type sendmessageT = {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    targetLang: string;
  };

  const handleSend = ({ text, receiverId, senderId, id }: sendmessageT) => {
    console.log("web::", text, receiverId, "handleSend at App.tsx ");
    const socket = SocketClient.getSocket();
    if (!socket) return;
    const targetLang = targetLangRef.current || "eng";

    const message: sendmessageT = {
      senderId,
      receiverId,
      text: text.trim(),
      id: id,
      targetLang: targetLang,
    };

    socket.emit("send_message", message);
  };

  const handleLanguageChange = (language: string) => {
    setTargetLanguage(language);
    targetLangRef.current = language;
  };

  const onNewUserJoined = (data: string) => {
    console.log("web::", data, "onNewUserJoined at App.tsx ");
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "userJoined",
        data,
      })
    );
  };

  const onUserLeft = (data: string) => {
    console.log("web::", data, "onUserLeft at App.tsx ");
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "userLeft",
        data,
      })
    );
  }

  useEffect(() => {
    // connectUser();
    return () => {
      cleanUpMediaTransports();
      removeDevice();
      SocketClient.removeSocketListeners(
        handleIncomingCall,
        haddleNewProducer,
        handleCallAnswered,
        handleCallTerminated,
        handleReceiveMessage,
        onTranslationError,
        onCallRejected
      );
    };
  }, []);

  const handleRNMessage = (payload: RNMessage) => {
    console.log("web::", payload, "handleRNMessage");
    switch (payload.type) {
      case "init":
        init(payload.data);
        break;
      case "startCall":
        handleStartCall(payload.data);
        break;
      case "acceptCall":
        acceptCall(callState);
        break;
      case "rejectCall":
        rejectCall();
        break;
      case "endCall":
        endCall();
        break;
      case "reconnect":
        reconnect();
        break;
      case "toggleAudioMute":
        toggleAudioMute();
        break;
      case "toggleVideoMute":
        toggleVideoMute();
        break;
      case "translateAudio":
        translateAudio(payload.data);
        break;
      case "send_message":
        handleSend(payload.data);
        break;
      case "languageChange":
        handleLanguageChange(payload.data);
        break;
    }
  };

  useEffect(() => {
    const handleRnEvent = (event: any) => {
      try {
        console.log("web::Received from React Native:", event.detail);
        handleRNMessage(event.detail);
      } catch (e) {
        console.error("web::Failed to parse message from React Native", e);
      }
    };

    window.addEventListener("rn-message", handleRnEvent);

    return () => {
      window.removeEventListener("rn-message", handleRnEvent);
    };
  }, [callState]);

  useEffect(() => {
    sendRNMessage({
      type: "callStateChange",
      data: callState,
    });
  }, [callState]);

  const [recipientId, setRecipientId] = useState("");

  return (
    <>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium">Your User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mt-1 block w-full border px-2 py-1"
          />
        </div>
        <div>
          <input
            type="text"
            onChange={(e) => setRecipientId(e.target.value)}
            placeholder="user to call"
          />
        </div>
        <div>
          {/* <button onClick={() => startCall(recipientId)} > Call</button> */}
        </div>
        {mediaConsumers.remoteVideoData.map((participant) => (
          <RenderAudioVideo
            key={participant.participantId}
            participant={participant}
          />
        ))}
      </div>
    </>
  );
}

function RenderAudioVideo({ participant }: { participant: Participant }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (participant.translatedAudioConsumer && audioRef.current) {
      const stream = new MediaStream();
      stream.addTrack(participant.translatedAudioConsumer.track);
      audioRef.current.srcObject = stream;
      console.log("web:: -------- stream played ");
      audioRef.current.play();
    }
  }, [participant]);
  return (
    <>
      <audio ref={audioRef} autoPlay hidden />
    </>
  );
}

export default App;

function useDevice(): DeviceCore {
  const deviceRef = useRef<Device | null>(null);

  const initializeDevice = async (
    roomId: string,
    rtpCapabilities: types.RtpCapabilities
  ) => {
    try {
      const newDevice = new Device();
      await newDevice.load({
        routerRtpCapabilities: rtpCapabilities,
      });
      deviceRef.current = newDevice;
      return Promise.resolve(newDevice);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  function getDevice() {
    if (!deviceRef.current) {
      throw new Error("web::Device not initialized");
    }
    return deviceRef.current;
  }

  return { getDevice, initializeDevice, deviceRef };
}
