import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import Participant from './core/Participant';
import { AppService } from './main.service';
import { RoomManager } from './core/RoomManager';
import { StartCallDto, AnswerCallDto, ShareScreenDto, CreateroomDto } from './dto';
import Room from './core/Room';

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
}
