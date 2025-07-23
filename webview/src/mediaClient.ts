import type { Socket } from "socket.io-client";
import { mediaSocketEvents } from "./events";

let socket: Socket;

export function initMediaClient(s: Socket) {
  socket = s;
}

function validateSocket() {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
}

export function getRtpCapabilities(roomId: string) {
  validateSocket();
  socket.emit(mediaSocketEvents.GET_RTP_CAPABILITES, roomId);
}
