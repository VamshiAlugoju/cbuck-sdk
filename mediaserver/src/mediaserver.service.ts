import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import Participant from './core/Participant';
import { AppService } from './main.service';
import { RoomManager } from './core/RoomManager';
import { StartCallDto, AnswerCallDto, ShareScreenDto, CreateroomDto } from './dto';
import Room from './core/Room';
import { CreateroomDto } from './dto/createRoom.dto';
import { InitiateTranslationDto, StoppedTranslationDto } from './dto/transport.dto';
import { AppData, Producer } from 'mediasoup/node/lib/types';
import { getPort } from './core/ports';
import { randomInt } from 'crypto';
import { CallTranslationContext } from './interfaces/Participant.interface';

@Injectable()
export class MediaService {
  private logger = new Logger('MediaService');

  constructor(
    private readonly RoomManagerInstance: RoomManager,
    private readonly appService: AppService,
  ) {}

  private log(message: string) {
    this.logger.log(message);
  }

  private async validateRoom(roomId: string): Promise<Room> {
    const room = await this.RoomManagerInstance.getRoomById(roomId);
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

  public async startCall(data: StartCallDto) {
    // const userId = res.locals.userId;
    // get the roomId from the main backend || call service..
    const { callId, participantId, userId, roomId } = data;
    const prevRoom = await this.RoomManagerInstance.getRoomById(roomId);
    if (prevRoom) {
      throw new ConflictException(`A Room with roomId:${roomId} already exists.`);
    }
    const room = await this.RoomManagerInstance.createRoom(userId, callId, roomId);
    const rtpCapabilities = room.getRtpCapabilities();
    const owner = new Participant(userId, room.roomId, participantId);
    room.addOwner(owner);
    const serverDetails = this.appService.getInstanceDetails();

    this.log(`Caller ${userId} added to room ${room.roomId}`);
    return {
      rtpCapabilities,
      participantId: owner.participantId,
      roomId: room.roomId,
      workerId: room.workerId,
      serverDetails,
    };
  }
  async answerCall(data: AnswerCallDto) {
    const { roomId, userId, participantId } = data;
    const room = await this.RoomManagerInstance.getRoomById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found'); // not found error
    }
    const participant = new Participant(userId, roomId, participantId);
    await room.addParticipant(participant);
    const initialProducers = await room.getProducers();

    return {
      rtpCapabilities: room.getRtpCapabilities(),
      initialProducers,
    };
  }

  async clearParticipant(data: any) {
    const { roomId, participantId } = data;
    const room = await this.validateRoom(roomId);
    await room.removeParticipant(participantId);
    return {
      status: true,
    };
  }

  async closeRoom(data: any) {
    const { roomId } = data;
    const room = await this.RoomManagerInstance.getRoomById(roomId)!;
    if (!room) {
      throw new NotFoundException('Room not found'); // not found error
    }
    await this.RoomManagerInstance.closeRoom(roomId);
    return {
      status: true,
      roomId,
    };
  }

  public async createRoom(data: CreateroomDto) {
    const { callId, userId, roomId } = data;
    const prevRoom = await this.RoomManagerInstance.getRoomById(roomId);
    if (prevRoom) {
      throw new ConflictException(`A Room with roomId:${roomId} already exists.`);
    }
    const room = await this.RoomManagerInstance.createRoom(userId, callId, roomId);
    const rtpCapabilities = room.getRtpCapabilities();
    const serverDetails = this.appService.getInstanceDetails();

    this.log(`Caller ${userId} added to room ${room.roomId}`);
    return {
      rtpCapabilities,
      roomId: room.roomId,
      workerId: room.workerId,
      serverDetails,
    };
  }

  async closeAllRooms() {
    await this.RoomManagerInstance.closeAllRooms();
  }

  async shareScreen(body: ShareScreenDto) {
    const { userId, roomId, participantId } = body;
    const participant = new Participant(userId, roomId, participantId);
    return;
  }

  async getDataProducerData(roomId: string) {
    const room = await this.validateRoom(roomId);
    return room.getDataProducerData();
  }

  async translate(data: InitiateTranslationDto) {
    // ---------------- Translation ----------------
    const { roomId, producerId, targetLang, initiatedUser } = data;
    const room = await this.validateRoom(roomId);
    const producer = await room.getProducer(producerId);
    if (!producer) {
      throw new NotFoundException('Producer not found');
    }
    const participant = room.getParticipantByProducerId(producerId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    try {
      const MEDIASOUP_IP = process.env.MEDIASOUP_PUBLIC_IP;
      const TRANSLATOR_IP = process.env.TRANSLATOR_IP || '10.10.0.203';
      let translationProducer: Producer<AppData> | null = null;
      const remoteRtpPort = getPort();

      // [Mediasoup -> Translator]
      const translationSendTransport = await room.createPlainRtpTransport('send');
      await translationSendTransport.connect({
        ip: TRANSLATOR_IP,
        port: remoteRtpPort,
      });
      const consumer = await translationSendTransport.consume({
        producerId: producer.id,
        rtpCapabilities: room.getRtpCapabilities(),
      });
      const translationReceiveTransport = await room.createPlainRtpTransport('recv');

      await translationReceiveTransport.connect({
        ip: MEDIASOUP_IP, // Translator will send audio to this IP
        port: translationReceiveTransport.tuple.localPort, // Translator will send audio to this port
      });

      // lets the python translation server know all the parameters for the connection
      const codec = consumer.rtpParameters.codecs[0];
      const payloadType = codec.payloadType;
      const codecName = codec.mimeType.split('/')[1];
      const clockRate = codec.clockRate;
      const channels = codec.channels || 2;
      const ssrc = randomInt(1, 0x7fffffff);
      const callContext: CallTranslationContext = {
        roomId: room.roomId,
        consumerId: consumer.id,
        speaker: participant.userId,
        listener: initiatedUser,
        originalProducerId: producer.id,
        targetLang: targetLang,
      };
      const payload = {
        producerId: producer.id,
        rtpPort: remoteRtpPort,
        ip: translationSendTransport.tuple.localIp,
        codec: codecName,
        clockRate,
        channels,
        payloadType,
        ssrc,
        outputPort: translationReceiveTransport.tuple.localPort,
        targetLang,
        // callContext
        sessionId: '',
      };

      fetch(`http://${TRANSLATOR_IP}:2002/translation/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('✅ Translation pipeline initiated:', data);
        })
        .catch((error) => {
          console.error('❌ Error initiating translation pipeline:', error);
        });

      // Then, a producer is created that will read from the translationReceiveTransport and send it to the client
      translationProducer = await translationReceiveTransport.produce({
        kind: 'audio',
        rtpParameters: {
          codecs: [
            {
              mimeType: 'audio/opus',
              payloadType,
              clockRate,
              channels,
            },
          ],
          encodings: [{ ssrc }],
        },
      });
      Logger.log(
        `Translation producer created with id: ${translationProducer.id}`,
        'Translation service',
      );

      room.addProducer(translationProducer);
      participant.addTranslationChannel({
        targetLang,
        sendTransport: translationSendTransport,
        recvTransport: translationReceiveTransport,
        originalProducer: producer,
        producer: translationProducer,
        consumer: consumer,
        intendedToUsers: [initiatedUser],
      });
      return {
        producerId: translationProducer.id,
        rtpCapabilities: room.getRtpCapabilities(),
      };
    } catch (error) {
      Logger.error(error);
    }

    // ---------------- Translation ----------------
  }

  async onTranslationStopped(data: StoppedTranslationDto) {
    const { callContext } = data;
    const { consumerId, roomId, originalProducerId } = callContext;
    const room = await this.validateRoom(roomId);
    const participant = room.getParticipantByProducerId(callContext.originalProducerId);
    participant?.closeTranslationChannel(originalProducerId, callContext.targetLang);
  }
}
