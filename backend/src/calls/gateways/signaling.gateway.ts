import {
  MessageBody,
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  CallStatusDto,
  LeaveCallDto,
  NotifyServerDto,
  StartCallDto,
} from '../dto/startcall-dto';
import { callSocketEvents } from './events/calls.socketevents';
import { WebSocketExceptionFilter } from 'src/socket/ws.exception';
import CallService from '../services/implementations/calls.service';
import { AnswerCallDto, InitiateTranslationDto } from '../dto/calls.dto';

@WebSocketGateway()
@UseFilters(new WebSocketExceptionFilter())
export class SignalingGateway {
  private logger = new Logger('CallsGateway');

  constructor(private readonly callService: CallService) {}

  @SubscribeMessage(callSocketEvents.START_CALL)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async onCallInitiate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: StartCallDto,
  ) {
    const initiatorId = socket.data.userId;
    this.logger.log(
      `user:${initiatorId} is starting a call with ${payload.recipients}`,
    );
    return await this.callService.initiateCall(socket, payload);
  }

  @SubscribeMessage(callSocketEvents.ANSWER_CALL)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async onAnswerCall(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: AnswerCallDto,
  ) {
    return await this.callService.handleAnswerCall(socket, payload);
  }

  @SubscribeMessage(callSocketEvents.END_CALL)
  async onEndCall(
    @ConnectedSocket() socket: Socket,
    @MessageBody('roomId') roomId: string,
  ) {
    return await this.callService.endCall(socket, roomId);
  }
  @SubscribeMessage(callSocketEvents.RECONNECT)
  async onReconnect(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: AnswerCallDto,
  ) {
    return await this.callService.handleAnswerCall(socket, payload);
  }

  @SubscribeMessage(callSocketEvents.NOTIFY_OWNER)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async notifyOwner(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: NotifyServerDto,
  ) {
    return await this.callService.notifyOwner(socket, payload);
  }
  @SubscribeMessage(callSocketEvents.REJECT_CALL)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async rejectCall(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: NotifyServerDto,
  ) {
    this.logger.log(
      `user:${socket.data.userId} is rejecting a call with ${payload.roomId}`,
    );
    return await this.callService.rejectCall(socket, payload);
  }

  /**
   * Leave call
   * @param socket
   * @param payload
   * @returns
   */
  @SubscribeMessage(callSocketEvents.LEAVE_CALL)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async onLeaveCall(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: LeaveCallDto,
  ) {
    this.logger.log(
      `user:${socket.data.userId} is leaving a call with ${payload.roomId}`,
    );
    return await this.callService.leaveCall(socket, payload);
  }

  @SubscribeMessage(callSocketEvents.INITIATE_TRANSLATION)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async onInitiateTranslation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: InitiateTranslationDto,
  ) {
    this.logger.log(`user:${socket.data.userId} is initiating translation`, payload);
    const data = await this.callService.initiateTranslation(socket, payload);
    return data;
  }
}
