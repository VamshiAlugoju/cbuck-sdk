import {
  MessageBody,
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
import { mediaSocketEvents } from './events/calls.socketevents';
import { WebSocketExceptionFilter } from 'src/socket/ws.exception';
import CallService from '../services/implementations/calls.service';
import {
  ConnectTransportDto,
  CreateTransportDto,
  ConsumeDto,
  ProduceDto,
  UnpauseDto,
} from '../dto/media.dto';
import MediaService from '../services/implementations/media.service';

@WebSocketGateway()
@UseFilters(new WebSocketExceptionFilter())
export class MediaGateway {
  private logger = new Logger('MediaGateway');

  constructor(
    private readonly callService: CallService,
    private readonly mediaService: MediaService,
  ) {}

  @SubscribeMessage(mediaSocketEvents.CREATE_PRODUCER_TRANSPORT)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createProducerTransport(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: CreateTransportDto,
  ) {
    return await this.mediaService.createProducerTransport(socket, payload);
  }

  @SubscribeMessage(mediaSocketEvents.CONNECT_PRODUCER_TRANSPORT)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async connectProducerTransport(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: ConnectTransportDto,
  ) {
    return await this.mediaService.connectProducerTransport(socket, payload);
  }
  @SubscribeMessage(mediaSocketEvents.PRODUCE)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async produce(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: ProduceDto,
  ) {
    return await this.mediaService.produce(socket, payload);
  }
  @SubscribeMessage(mediaSocketEvents.CREATE_CONSUMER_TRANSPORT)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createConsumerTransport(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: CreateTransportDto,
  ) {
    return await this.mediaService.createConsumerTransport(socket, payload);
  }
  @SubscribeMessage(mediaSocketEvents.CONNECT_CONSUMER_TRANSPORT)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async connectConsumerTransport(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: ConnectTransportDto,
  ) {
    return await this.mediaService.connectConsumerTransport(socket, payload);
  }
  @SubscribeMessage(mediaSocketEvents.CONSUME)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async consume(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: ConsumeDto,
  ) {
    return await this.mediaService.consume(socket, payload);
  }
  @SubscribeMessage(mediaSocketEvents.UNPAUSE)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async unPauseConsumer(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: UnpauseDto,
  ) {
    return await this.mediaService.unPauseConsumer(socket, payload);
  }
  // @SubscribeMessage(mediaSocketEvents.CONSUME_DATA_PRODCUCER)
  // @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  // async getDataProducer(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() payload: { roomId: string },
  // ) {
  //   return await this.mediaService.getDataProducer(socket, payload);
  // }
}
