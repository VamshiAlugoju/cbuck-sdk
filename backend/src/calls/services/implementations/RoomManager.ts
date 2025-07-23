import { uuid } from 'src/common/lib';
import { CallType } from '../../types/calls.types';
import { Injectable, Logger, LogLevel } from '@nestjs/common';
import Room, { ROOM_EVENTS } from '../rooms/Room';
import { roomEventEmitter } from '../events/room.events';

@Injectable()
export default class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private logger = new Logger('Room Manager');
  private logIntervalTime = 1 * 10 * 1000;
  log(msg: any, logLevel: LogLevel = 'log') {
    this.logger[logLevel](msg);
  }

  constructor() {
    this.listenRoomEvents();
  }

  async createRoom(
    callType: CallType,
    callId: string,
    recipents: string[],
    isGroupcall: boolean,
  ): Promise<Room> {
    const roomId = uuid();
    const room = new Room(roomId, callType, callId, recipents, isGroupcall);
    this.rooms.set(room.roomId, room);
    return room;
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  logRooms() {
    setInterval(() => {
      // this.log(`Rooms: ${this.rooms.size}`, 'verbose');
      this.rooms.forEach((room) => {
        const names = room.getNames();
        console.log(`Room ${room.roomId}: ${names}`);
      });
    }, this.logIntervalTime);
  }

  public removeRoom(roomId: string) {
    const room = this.getRoom(roomId);
    if (room) {
      this.rooms.delete(roomId);
    }
  }

  listenRoomEvents() {
    roomEventEmitter.on(ROOM_EVENTS.CLEANUP, (roomId: string) => {
      this.log(`RoomManager received cleanup event for room ${roomId}`);
      this.removeRoom(roomId);
    });
  }
  getAllRoom(){
    return this.rooms
  }
}
