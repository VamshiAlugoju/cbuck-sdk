import { CallType } from '../../types/calls.types';
import Participant from './Participant';
import { roomEventEmitter } from '../events/room.events';

export const ROOM_EVENTS = {
  CLEANUP: 'room:cleanup',
};

interface IRoom {
  callType: CallType;
  roomId: string;
  initialCallType: string;
  callId: string;
  participants: Participant[]; // List of participant userIds
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  isGroupCall: boolean;
}

class Room implements IRoom {
  roomId: string;
  callId: string;
  owner: Participant;
  participants: Participant[] = [];
  isActive: boolean = true;
  createdAt: number;
  updatedAt: number;
  callType: CallType;
  initialCallType: string;
  isGroupCall: boolean;
  idleMinutes = Number(process.env.CALL_ROOM_IDLE_TIME) || 10;
  recipents: string[];
  MAX_SCREEN_SHARERS = 1;
  usersSharingScreen: string[] = [];
  private cleanupTimeout: NodeJS.Timeout | null = null;

  constructor(
    roomId: string,
    callType: CallType,
    callId: string,
    recipents: string[],
    isGroupCall: boolean = false,
  ) {
    this.roomId = roomId;
    this.callId = callId;
    this.callType = callType;
    this.createdAt = Date.now();
    this.updatedAt = this.createdAt;
    this.initialCallType = callType;
    this.isGroupCall = isGroupCall;
    this.recipents = recipents;
  }

  addParticipant(participant: Participant, isOwner?: boolean): void {
    this.participants.push(participant);
    this.updatedAt = Date.now();
    if (isOwner) {
      this.owner = participant;
    }
    this.cancelCleanupTimer();
  }

  removeParticipant(participant: Participant): void {
    this.participants = this.participants.filter(
      (p) => p.participantId !== participant.participantId,
    );
    this.updatedAt = Date.now();

    if (this.participants.length === 0) {
      this.startCleanupTimer();
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimeout = setTimeout(
      () => {
        console.log(
          `Room ${this.roomId} is empty for ${this.idleMinutes} mins. Cleaning up.`,
        );
        roomEventEmitter.emit(ROOM_EVENTS.CLEANUP, this.roomId);
      },
      this.idleMinutes * 60 * 1000,
    );
  }

  private cancelCleanupTimer(): void {
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
      this.cleanupTimeout = null;
    }
  }

  getParticipantByUserId(userId: string): Participant | undefined {
    return this.participants.find((p) => p.userId === userId);
  }

  getParticipantByParticipantId(
    participantId: string,
  ): Participant | undefined {
    return this.participants.find((p) => p.participantId === participantId);
  }

  getParticipants() {
    return Array.from(this.participants.values());
  }

  getParticipant(userId: string, isScreenSharing: boolean = false) {
    return this.participants.find((p) =>
      isScreenSharing
        ? p.userId === userId && p.isSharingScreen
        : p.userId === userId && !p.isSharingScreen,
    );
  }

  getParticipantById(id: string) {
    return this.participants.find((p) => p.participantId === id);
  }
  getOwner() {
    return this.owner;
  }
  getNames() {
    const names = this.participants.map((p) => p.client.name);
    return names;
  }

  getScreenSharers() {
    return this.participants.filter((p) => p.isSharingScreen);
  }

  // !! Modify this logic later, based on the requirement
  setScreenSharers(users: string[]) {
    this.usersSharingScreen = users;
  }

  cleanUp(): void {
    this.isActive = false;
    this.updatedAt = Date.now();
    this.participants = [];
    this.cancelCleanupTimer();
  }
}

export default Room;
