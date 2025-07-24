import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RoomManager } from './core/RoomManager';
import Room from './core/Room';
import Participant from './core/Participant';
import {
  CreateTransportDto,
  ConnectTransportDto,
  ProduceDto,
  ConsumeDto,
  UnpauseDto,
  DataConsumerDto,
  CloneParticipantDto,
  StopScreenSharingDto,
} from './dto/transport.dto';
import { getPort } from './core/ports';
import { randomInt } from 'crypto';
import { AppData, Producer } from 'mediasoup/node/lib/types';

@Injectable()
export class TransportService {
  constructor(private readonly RoomManager: RoomManager) { }

  private async validateRoom(roomId: string): Promise<Room> {
    const room = await this.RoomManager.getRoomById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  private async validateParticipant(participantId: string, room: Room): Promise<Participant> {
    const participant = room.participants.get(participantId);
    if (!participant) {
      throw new NotFoundException(
        `Participant with participantId ${participantId} not found in the Room`,
      );
    }
    return participant;
  }

  async createProducerTransport(data: CreateTransportDto) {
    console.log();
    const { roomId, participantId } = data;
    const room = await this.validateRoom(roomId);
    const participant = await this.validateParticipant(participantId, room);
    const PUBLIC_IP = process.env.MEDIASOUP_PUBLIC_IP;
    const transport = await room.createTransportForParticipant(participant, 'producer', {
      listenIps: [{ ip: '0.0.0.0', announcedIp: PUBLIC_IP }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    return {
      transport: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
      roomId: room.roomId,
      type: 'producer',
    };
  }
  async connectProducerTransport(data: ConnectTransportDto) {
    const { roomId, participantId, dtlsParameters } = data;
    const room = await this.validateRoom(roomId);
    const participant = await this.validateParticipant(participantId, room);
    await participant.producerTransport?.connect({
      dtlsParameters: dtlsParameters,
    });
    return {
      success: true,
    };
  }

  async produce(data: ProduceDto) {
    const { roomId, participantId, kind, rtpParameters, appData } = data;
    const room = await this.validateRoom(roomId);
    const participant = await this.validateParticipant(participantId, room);

    if (kind === 'audio') {
      const producer = await participant.produceAudio({
        kind,
        rtpParameters,
        appData,
      });

      room.addProducer(producer);

      return { id: producer.id };
    }
    else if (kind === 'video') {
      const producer = await participant.produceVideo({
        kind,
        rtpParameters,
        appData,
      });
      room.addProducer(producer);
      return {
        id: producer.id,
        kind: producer.kind,
        rtpCapabilities: room?.getRtpCapabilities(),
      };
    }
    throw new BadRequestException('Invalid kind, must be "audio" or "video"');
  }

  async createConsumerTransport(data: CreateTransportDto) {
    const { roomId, participantId } = data;

    const room = await this.validateRoom(roomId);

    const participant = await this.validateParticipant(participantId, room);
    const PUBLIC_IP = process.env.MEDIASOUP_PUBLIC_IP;
    if (!PUBLIC_IP) {
      throw new InternalServerErrorException('PUBLIC_IP not found');
    }

    const transport = await room.createTransportForParticipant(participant, 'consumer', {
      listenIps: [{ ip: '0.0.0.0', announcedIp: PUBLIC_IP }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      enableSctp: true,
      numSctpStreams: { OS: 1024, MIS: 1024 },
      maxSctpMessageSize: 262144,
    });

    const transportRes = {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    };
    return {
      transport: transportRes,
      roomId: room.roomId,
      type: 'consumer',
    };
  }

  async connectConsumerTransport(data: ConnectTransportDto) {
    const { roomId, participantId, dtlsParameters } = data;
    const room = await this.validateRoom(roomId);
    const participant = await this.validateParticipant(participantId, room);
    const consumerTransport = participant.consumerTransport;
    const status = await consumerTransport?.connect({ dtlsParameters });

    return { status: true };
  }

  async consume(data: ConsumeDto) {
    const { roomId, producerId, participantId, producerClientId, rtpCapabilities } = data;
    const room = await this.validateRoom(roomId);
    const participant = await this.validateParticipant(participantId, room);
    const consumerTransport = participant.getConsumerTransport();

    const producer = await room?.getProducer(producerId);
    if (!producer) {
      throw new Error('Producer not found');
    }

    if (
      room?.router.canConsume({
        producerId: producer?.id,
        rtpCapabilities,
      })
    ) {
      const consumer = await consumerTransport?.consume({
        producerId: producerId,
        rtpCapabilities: rtpCapabilities,
        paused: true,
      });
      if (!consumer) {
        throw new Error('Failed to create consumer');
      }

      participant?.addConsumer(consumer);
      await room?.addConsumer(consumer);

      return {
        consumer: {
          id: consumer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        },
      };
    }
    throw new Error('Invalid rtpCapabilities');
  }

  async unpauseConsumer(data: UnpauseDto) {
    const { consumerId, roomId } = data;
    const room = await this.validateRoom(roomId);

    const consumer = room?.getConsumer(consumerId);
    if (!consumer) {
      throw new Error('Consumer not found');
    }
    await consumer.resume();
    return {
      status: true,
    };
  }

  async consumeDataConsumer({ roomId, participantId }: DataConsumerDto) {
    const room = await this.validateRoom(roomId);
    const participant = await this.validateParticipant(participantId, room);
    const consumerTransport = participant.getConsumerTransport();
    const { id: dataProducerId, sctpStreamParameters } = room.getDataProducerData();
    const consumer = await consumerTransport?.consumeData({
      dataProducerId: dataProducerId,
      ordered: true,
      paused: false,
    });
    if (!consumer) {
      throw new Error('Failed to create consumer');
    }

    participant.addDataConsumer(consumer);
    console.log(consumer.sctpStreamParameters);
    return {
      id: consumer.id,
      sctpStreamParameters: consumer.sctpStreamParameters,
      dataProducerId: dataProducerId,
    };
  }

  async cloneParticipant({ roomId, participant_id, old_participant_id }: CloneParticipantDto) {
    const room = await this.validateRoom(roomId);
    const participant = await this.validateParticipant(old_participant_id, room);
    const newParticipant = await participant.clone(participant_id);
    room.addParticipant(newParticipant);
    return {
      status: true,
    };
  }

  async stopScreenSharing({ participantId, roomId }: StopScreenSharingDto) {
    const room = await this.validateRoom(roomId);
    const participanat = await this.validateParticipant(participantId, room);
    room.stopScreenSharing(participanat);
    return {
      status: true,
    };
  }
}
