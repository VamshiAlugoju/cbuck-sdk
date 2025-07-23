import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export enum CallStatus {
  OUTGOING = 'outgoing',
  RECEIVED = 'received',
  MISSED = 'missed',
}

export interface Call {
  id?: string;
  initiatorId: string;
  invitedUserIds: string[];
  participants: string[];
  status: CallStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CallRecord extends Call {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUpcomingCallsByUserParams {
  userId: string;
  page?: number;
  perPage?: number;
}

@Injectable()
export class CallsRepository {
  private calls = new Map<string, CallRecord>();

  // ✅ Create a new call
  async createCall(callData: Partial<Call>): Promise<CallRecord> {
    const id = uuidv4();
    const now = new Date();

    const newCall: CallRecord = {
      id,
      initiatorId: callData.initiatorId!,
      invitedUserIds: callData.invitedUserIds || [],
      participants: callData.participants || [],
      status: callData.status || CallStatus.OUTGOING,
      createdAt: now,
      updatedAt: now,
    };

    this.calls.set(id, newCall);
    return newCall;
  }

  // ✅ Find by ID
  async findById(callId: string): Promise<CallRecord | null> {
    return this.calls.get(callId) || null;
  }

  // ✅ Find by initiator
  async findByInitiator(initiatorId: string): Promise<CallRecord[]> {
    return Array.from(this.calls.values()).filter(
      (call) => call.initiatorId === initiatorId,
    );
  }

  // ✅ Find by ID and initiator
  async findByIdAndInitiator(
    id: string,
    initiatorId: string,
  ): Promise<CallRecord | null> {
    const call = this.calls.get(id);
    return call?.initiatorId === initiatorId ? call : null;
  }

  // ✅ Find by participant
  async findByParticipant(userId: string): Promise<CallRecord[]> {
    return Array.from(this.calls.values()).filter(
      (call) =>
        call.invitedUserIds.includes(userId) ||
        call.participants.includes(userId),
    );
  }

  // ✅ Update call
  async updateCall(
    callId: string,
    updateData: Partial<Call>,
  ): Promise<CallRecord | null> {
    const existing = this.calls.get(callId);
    if (!existing) return null;

    const updated: CallRecord = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };

    this.calls.set(callId, updated);
    return updated;
  }
}
