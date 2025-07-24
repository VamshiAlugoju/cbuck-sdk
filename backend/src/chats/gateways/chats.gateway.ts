import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { BaseLogger } from 'src/common/BaseLogger';
import { WebSocketExceptionFilter } from 'src/socket/ws.exception';
import { chatEvents } from './chatSocketEvents';
import { Socket } from 'socket.io';
import { MessageHistoryDto, SendMessageDto } from '../dtos/chats.dto';
import { SocketService } from 'src/socket/services/socket.service';
import { getAllSessions, getSocketId } from 'src/utils/socketStore';
import { Services } from 'src/common/constants/interfaces.constants';
import { ISocketService } from 'src/socket/interfaces/socketService.interface';

@WebSocketGateway()
@UseFilters(new WebSocketExceptionFilter())
export class ChatsGateway extends BaseLogger {
  constructor(
    @Inject(forwardRef(() => Services.SocketService))
    readonly socketService: ISocketService,
  ) {
    super(ChatsGateway.name);
  }
  @SubscribeMessage(chatEvents.SEND_MESSAGE)
  async handleSendMessage(client: Socket, payload: SendMessageDto) {
    this.logger.log(`Received message: ${JSON.stringify(payload)}`);
    const io = this.socketService.getServerInstance();
    const receiverSockerId = await getSocketId(payload.receiverId);
    if (!receiverSockerId) {
      return {
        error: `Receiver with ID ${payload.receiverId} is not connected.`,
      };
    }
    io.to(receiverSockerId).emit(chatEvents.RECEIVE_MESSAGE, payload);
    this.logger.log(`Message sent to ${payload.receiverId}`);
  }
}
