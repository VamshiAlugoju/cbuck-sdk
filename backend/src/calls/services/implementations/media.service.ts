import { Inject, Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import MediaServerClient from './MediaServerClient';

import {
  Repositories,
  Services,
} from 'src/common/constants/interfaces.constants';
import RoomManager from './RoomManager';
import { ISocketService } from 'src/socket/interfaces/socketService.interface';

import { mediaSocketEvents } from 'src/calls/gateways/events/calls.socketevents';
import {
  CreateTransportDto,
  ConnectTransportDto,
  ConsumeDto,
  ProduceDto,
  UnpauseDto,
} from 'src/calls/dto/media.dto';
import Room from '../rooms/Room';
@Injectable()
export default class MediaService {
  constructor(
    // private readonly callsRepository: CallsRepository,
    private readonly roomManager: RoomManager,
    private readonly mediaServerClient: MediaServerClient,
    @Inject(Services.SocketService)
    private readonly socketService: ISocketService,
  ) {}

  private logger = new Logger('MediaService');

  private validateRoom(roomId: string) {
    const room = this.roomManager.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  private validateParticipant(
    room: Room,
    userId: string,
    isSharingScreen: boolean = false,
  ) {
    const participant = room.getParticipant(userId, isSharingScreen);
    if (!participant) {
      throw new Error('Participant not found');
    }
    return participant;
  }

  async retryAsync<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    shouldRetry?: (err: any) => boolean,
    delayMs: number = 0,
  ): Promise<T> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        return await fn();
      } catch (err: any) {
        if (err.code !== 'ECONNRESET') {
          throw err;
        }

        attempts++;
        if (attempts >= maxRetries) {
          throw err;
        }
      }
    }
    throw new Error('Retry attempts exhausted');
  }

  async createProducerTransport(socket: Socket, payload: CreateTransportDto) {
    try {
      const { roomId } = payload;
      const room = this.validateRoom(roomId);
      const participant = this.validateParticipant(room, socket.data.userId);
      const { transport } = await this.retryAsync<any>(() => {
        return this.mediaServerClient.createProducerTransport(
          roomId,
          participant.participantId,
        );
      });

      //   const res = await this.retryAsync(
      //     this.mediaServerClient.createProducerTransport(
      //       roomId,
      //       participant.participantId,
      //     ),
      //   );

      const { id, iceParameters, iceCandidates, dtlsParameters } = transport;
      return {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        type: 'producer',
      };
    } catch (err) {
      this.logger.error('Error creating producer transport', err);
      return {
        error: err.message,
      };
    }
  }

  async connectProducerTransport(socket: Socket, payload: ConnectTransportDto) {
    try {
      const { dtlsParameters, roomId } = payload;
      const room = this.validateRoom(roomId);
      const participant = this.validateParticipant(room, socket.data.userId);
      const data = await this.retryAsync(() => {
        return this.mediaServerClient.connectProducerTransport(
          roomId,
          participant.participantId,
          dtlsParameters,
        );
      });

      return {
        status: true,
      };
    } catch (err) {
      this.logger.error('Error connecting producer transport', err);
      return {
        error: err.message,
      };
    }
  }
  async produce(socket: Socket, payload: ProduceDto) {
    try {
      const { roomId, kind, rtpParameters, appData, isScreenShare } = payload;
      const room = this.validateRoom(roomId);
      const participant = this.validateParticipant(
        room,
        socket.data.userId,
        isScreenShare,
      );

      const { id, rtpCapabilites } = await this.retryAsync(() => {
        return this.mediaServerClient.produce(
          roomId,
          participant.participantId,
          kind,
          rtpParameters,
          appData,
        );
      });

      const participants = room.getParticipants();
      const io = this.socketService.getServerInstance();
      participants.forEach((pt) => {
        if (pt.userId !== participant.userId) {
          io.to(pt.socketId).emit(mediaSocketEvents.NEW_PRODUCER, {
            producerId: id,
            kind,
            roomId,
            rtpCapabilites,
            clientId: participant.participantId, // todo: remove this
            isScreenSharing: isScreenShare ? isScreenShare : false,
            participantId: participant.participantId,
          });
        }
      });
      return {
        id,
      };
    } catch (err) {
      this.logger.error('Error producing', err);
      return {
        error: err.message,
      };
    }
  }
  async createConsumerTransport(socket: Socket, payload: CreateTransportDto) {
    try {
      const { roomId } = payload;
      const room = this.validateRoom(roomId);
      const participant = this.validateParticipant(room, socket.data.userId);

      const { transport } = await this.retryAsync(() => {
        return this.mediaServerClient.createConsumerTransport(
          roomId,
          participant.participantId,
        );
      });

      const {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
      } = transport;
      return {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        type: 'consumer',
        sctpParameters,
      };
    } catch (err) {
      this.logger.error('Error creating consumer transport', err);
      return {
        error: err.message,
      };
    }
  }
  async connectConsumerTransport(socket: Socket, payload: ConnectTransportDto) {
    try {
      const { dtlsParameters, roomId } = payload;
      const room = this.validateRoom(roomId);
      const participant = this.validateParticipant(room, socket.data.userId);
      await this.retryAsync(() => {
        return this.mediaServerClient.connectConsumerTransport(
          roomId,
          participant.participantId,
          dtlsParameters,
        );
      });

      return {
        status: true,
      };
    } catch (err) {
      this.logger.error('Error connecting consumer transport', err);
      return {
        error: err.message,
      };
    }
  }
  async consume(socket: Socket, payload: ConsumeDto) {
    try {
      const { roomId, producerId, producerClientId, rtpCapabilities } = payload;
      const room = this.validateRoom(roomId);
      const participant = this.validateParticipant(room, socket.data.userId);
      const producerParticipant = room.getParticipantById(producerClientId)!;
      const data = await this.retryAsync(() => {
        return this.mediaServerClient.consume(
          roomId,
          participant.participantId,
          producerId,
          producerClientId,
          rtpCapabilities,
        );
      });
      const { id, rtpParameters, kind } = data.consumer;

      return {
        producerId: producerId,
        id,
        rtpParameters,
        kind,
        participantId: producerClientId,
        participant: producerParticipant,
      };
    } catch (err) {
      this.logger.error('Error consuming', err);
      return {
        error: err.message,
      };
    }
  }
  async unPauseConsumer(socket: Socket, payload: UnpauseDto) {
    const { id, roomId } = payload;
    const room = this.validateRoom(roomId);
    const data = await this.retryAsync(() => {
      return this.mediaServerClient.unpauseConsumer(room.roomId, id);
    });

    return {
      status: true,
    };
  }

  async getDataProducer(socket: Socket, payload: { roomId: string }) {
    const room = this.validateRoom(payload.roomId);
    const participant = this.validateParticipant(room, socket.data.userId);
    const data = await this.mediaServerClient.consumeData(
      payload.roomId,
      participant.participantId,
    );
    return data;
  }
}
