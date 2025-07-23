import { Server, Socket } from 'socket.io';

export interface ISocketService {
  setServerInstance(server: Server): void;
  handleConnection(socket: Socket): Promise<void>;
  handleDisconnect(socket: Socket): Promise<void>;
  getServerInstance(): Server;
  emitEventInARoom(
    room_id: string,
    eventName: string,
    payload: any,
    excludeSocketId?: string,
  ): void;
}
