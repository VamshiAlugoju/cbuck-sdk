import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ISocketService } from '../interfaces/socketService.interface';

import CallService from 'src/calls/services/implementations/calls.service';

import { SocketEvents } from '../socket.events';
import { removeSocketSession, storeSocketSession } from 'src/utils/socketStore';
@Injectable()
export class SocketService implements ISocketService {
  private logger = new Logger('WsGateway');
  private io: Server;
  constructor(private readonly callService: CallService) {}
  setServerInstance(server: Server) {
    this.io = server;
  }

  private joinRelevantRoom(
    socket: Socket,
    { userId, deviceId }: { userId: string; deviceId: string },
  ) {
    socket.join(`user:${userId}`);
    socket.join(`user:${userId}:device:${deviceId}`);
    socket.join(SocketEvents.ONLINE_USERS);

    // All devices of a user	io.to('user:123').emit(...)
    // A specific device of user	io.to('user:123:device:xyz').emit(...)
    // All online users	io.to('online-users').emit(...)
    // Everyone except one socket	io.to('online-users').except(socketId).emit(...)
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Client Authenticated: ${socket.id}`);
    socket.emit('authenticated', socket.id);

    const { userId, deviceId } = socket.data ?? {};
    this.joinRelevantRoom(socket, { userId, deviceId });

    await storeSocketSession(userId, socket.id);

    this.emitEventInARoom(userId, 'user:connected', { userId }, socket.id);
  }

  async handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);

    const { userId } = socket.data ?? {};
    await removeSocketSession(userId);

    await this.callService.handleDisconnect(socket);
  }

  emitEventInARoom(
    room_id: string,
    eventName: string,
    payload: any,
    excludeSocketId?: string,
  ) {
    const room = this.io.to(room_id);

    if (excludeSocketId) {
      room.except(excludeSocketId).emit(eventName, payload);
    } else {
      room.emit(eventName, payload);
    }
  }

  getServerInstance() {
    return this.io;
  }

  // async getSocketsInARoom(room) {
  //   const clients = this.io.of('/').adapter.rooms.get(room);
  //   if (clients) {
  //     for (const socketId of clients) {
  //       const socket = this.io.of('/').sockets.get(socketId);
  //       console.log('Socket details:', socket?.id, socket?.handshake.query);
  //     }
  //   }
  // }
}
