import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UnauthorizedException, UseFilters } from '@nestjs/common';
import { WebSocketExceptionFilter } from '../ws.exception';
import { ISocketService } from '../interfaces/socketService.interface';
import { Services } from 'src/common/constants/interfaces.constants';
import { getDateOrNull } from 'src/common/lib';

@UseFilters(new WebSocketExceptionFilter()) // Apply the filter
@WebSocketGateway({ cors: true, pingTimeout: 30000, pingInterval: 25000 })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(Services.SocketService)
    private readonly socketService: ISocketService,
  ) {}
  afterInit(server: Server) {
    this.socketService.setServerInstance(server);
  }

  async handleConnection(socket: Socket) {
    try {
      const userId = socket.handshake?.query?.userId as string;

      console.log(userId, 'triggered socket connection');
      const fcmToken = socket.handshake?.query?.fcmToken as string | undefined;
      const lastSynced = getDateOrNull(
        socket.handshake.query?.lastSynced as string,
      );

      if (!userId) {
        throw new UnauthorizedException('No userId provided');
      }

      socket.data.userId = userId;
      socket.data.fcmToken = fcmToken || null;
      socket.data.lastSynced = lastSynced || null;

      this.socketService.handleConnection(socket);
    } catch (error) {
      console.error(`Socket Auth Error: ${error.message}`);
      socket.emit('auth_error', {
        event: 'connection',
        message: `Unauthorized: ${error.message}`,
      });
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    this.socketService.handleDisconnect(socket);
  }
}
