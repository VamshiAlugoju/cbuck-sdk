import { Socket, io } from "socket.io-client";
import {
  incomingCallEvents,
  mediaSocketEvents,
  translationEvents,
} from "./events";
import { sendRNMessage } from "./utils/utils";

class SocketClient {
  private socket: Socket | null = null;
  private io = io;

  private constructor() { }

  static getInstance(): SocketClient {
    return new SocketClient();
  }

  connect(userId: string) {
    const socket = this.io("https://eb5d7e82c4a8.ngrok-free.app", {
      query: { userId },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("newSocket", socket.id, " f  ", userId);

      socket.onAny((event, ...args) => {
        console.log("socketClient:: incoming event=>", event, args);
      });
      socket.onAnyOutgoing((event, ...args) => {
        console.log("socketClient:: outgoing event=>", event, args);
      });
      sendRNMessage({
        type: "ackFromWeb",
        data: socket.id,
      });

      this.socket = socket;
    });
  }

  loadSocketListeners(
    handleIncomingCall: any,
    haddleNewProducer: any,
    handleCallAnswered: any,
    handleCallTerminated: any,
    handleReceiveMessage: any,
    onTranslationError: any,
    onCallRejected: any,
    onNewUserJoined: any,
    onUserLeft: any
  ) {
    const socket = this.getSocket();
    socket?.on(incomingCallEvents.INCOMING_CALL, handleIncomingCall);
    socket?.on(mediaSocketEvents.NEW_PRODUCER, haddleNewProducer);
    socket?.on(incomingCallEvents.CALL_ANSWERED, handleCallAnswered);
    socket?.on(incomingCallEvents.TERMINATE_CALL, handleCallTerminated);
    socket?.on(translationEvents.TRANSLATION_ERROR, onTranslationError);
    socket?.on("receive_message", handleReceiveMessage);
    socket?.on(incomingCallEvents.CALL_REJECTED, onCallRejected);
    socket?.on("user:online", onNewUserJoined);
    socket?.on("user:offline", onUserLeft);
  }

  removeSocketListeners(
    handleIncomingCall: any,
    haddleNewProducer: any,
    handleCallAnswered: any,
    handleCallTerminated: any,
    handleReceiveMessage: any,
    onTranslationError: any,
    onCallRejected: any,
  ) {
    const socket = this.getSocket();
    socket?.off(incomingCallEvents.INCOMING_CALL, handleIncomingCall);
    socket?.off(mediaSocketEvents.NEW_PRODUCER, haddleNewProducer);
    socket?.off(incomingCallEvents.CALL_ANSWERED, handleCallAnswered);
    socket?.off(incomingCallEvents.TERMINATE_CALL, handleCallTerminated);
    socket?.off(translationEvents.TRANSLATION_ERROR, onTranslationError);
    socket?.off("receive_message", handleReceiveMessage);
    socket?.off(incomingCallEvents.CALL_REJECTED, onCallRejected);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default SocketClient.getInstance();
