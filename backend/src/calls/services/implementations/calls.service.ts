import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import MediaServerClient from './MediaServerClient';

import {
  Repositories,
  Services,
} from 'src/common/constants/interfaces.constants';
import {
  StartCallDto,
  LeaveCallDto,
  CallStatusDto,
} from 'src/calls/dto/startcall-dto';
import { CallsRepository } from 'src/calls/repositories/calls.repository';
import ApiResponse from 'src/common/ApiResponse';

import RoomManager from './RoomManager';
import Participant from '../rooms/Participant';
import { ISocketService } from 'src/socket/interfaces/socketService.interface';

import { callSocketEvents } from 'src/calls/gateways/events/calls.socketevents';
import {
  AnswerCallDto,
  IgnoreCallDto,
  InitiateTranslationDto,
  InviteUsersToCallDto,
  NotifyServerDto,
  RejectCallDto,
  TranslationErrorDto,
} from 'src/calls/dto/calls.dto';
import Room from '../rooms/Room';
import {
  CallType,
  removeParticipantResponse,
} from 'src/calls/types/calls.types';
// import { CallDocument } from 'src/calls/schemas/call.schema';
import { CallJobs, Queues } from 'src/common/constants/que.constant';
// import { NotificationService } from 'src/notifications/notification.service';
import { notifEvents } from 'src/notifications/notificationTypes';
import {
  findOnlineDeviceAndEmitEvent,
  getCallRecipients,
  informHostWhoAllAreOnOtherCall,
} from './calls.service.util';
import { getSocketId } from 'src/utils/socketStore';

@Injectable()
export default class CallService implements OnModuleInit {
  constructor(
    readonly callsRepository: CallsRepository,
    // readonly notificationService: NotificationService,

    readonly roomManager: RoomManager,
    readonly mediaServerClient: MediaServerClient,
    @Inject(forwardRef(() => Services.SocketService))
    readonly socketService: ISocketService,
  ) {}
  onModuleInit() {
    // clearAllPreviousRoom(this).catch((e) => {
    //   Logger.error(`Error: while clearing all previous rooms ${e.message}`);
    // });
    // scheduleRoomMonitorJob(this).catch((e) =>
    //   Logger.error(`while scheduling room monitor job ${e?.message}`),
    // );
  }

  private logger = new Logger('CallService');

  /**
   * Handles the initiation of a call
   * @param socket
   * @param payload
   * @param callback
   * @returns
   */

  async retryAsync<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
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
  private validateRoom(roomId: string) {
    const room = this.roomManager.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  validateParticipant(
    room: Room,
    userId: string,
    isScreenShare: boolean = false,
  ) {
    const participant = room.getParticipant(userId, isScreenShare);
    if (!participant) {
      throw new Error('Participant not found');
    }
    return participant;
  }

  async initiateCall(socket: Socket, payload: StartCallDto) {
    const initiatorId = payload.callerId;
    // Create a call record with provided details
    const allUniqueRecipient = [...new Set(payload.recipients)];
    const callRecord = await this.callsRepository.createCall({
      initiatorId,
      invitedUserIds: payload.recipients,
    });

    const { onCallRecipients, offCallRecipients } = await getCallRecipients(
      this,
      {
        allUniqueRecipient,
      },
    );
    const room = await this.roomManager.createRoom(
      payload.call_type,
      callRecord.id,
      payload.recipients,
      payload.recipients.length > 1,
    );

    // Create a participant
    const participant = new Participant(initiatorId, room.roomId, socket.id);

    // Fetch the RTP capabilities
    const { rtpCapabilities } = await this.mediaServerClient.getRTPCapabilities(
      initiatorId,
      callRecord.id,
      participant.participantId,
      room.roomId,
    );

    // Add the created participant to the room
    room.addParticipant(participant, true);

    const isGroupCall = payload.recipients.length > 1;
    const incomingCallPayload = {
      callerId: initiatorId,
      roomId: room.roomId,
      callType: payload.call_type,
      recipents: payload.recipients,
      recipentList: payload.recipients,
      rtpCapabilities,
      callId: callRecord.id,
      isGroupCall,
      initialCallType: payload.call_type,
      initiatorId: initiatorId,
      error: '',
    };

    const io = this.socketService.getServerInstance();
    const socketIds = await Promise.all(
      payload.recipients.map(async (item) => {
        const socketId = await getSocketId(item);
        return socketId;
      }),
    );

    socketIds.forEach(async (socketId) => {
      if (!socketId) {
        return;
      }
      io.to(socketId).emit(callSocketEvents.INCOMING_CALL, incomingCallPayload);
    });

    return incomingCallPayload;
  }

  async handleAnswerCall(socket: Socket, payload: AnswerCallDto) {
    // Get the initiator details

    const room = this.validateRoom(payload.roomId);
    if (!room) {
      return ApiResponse.notFoundError('Room not founded or ended');
    }
    const callrecordPromise = this.callsRepository.findById(room.callId);
    const [callRecord]: [callRecord: any | null] = await Promise.all([
      callrecordPromise,
    ]);

    if (!callRecord) {
      return { error: 'Internal server error, call not found' };
    }

    // Check if the room exists

    // Add a participant
    const participant = new Participant(
      socket.data.userId,
      payload.roomId,
      socket.id,
    );

    room.addParticipant(participant);
    const { rtpCapabilities, initialProducers } = await this.retryAsync(() => {
      return this.mediaServerClient.handleAnswerCall(
        payload.roomId,
        socket.data.userId,
        participant.participantId,
      );
    });

    const responsePayload = {
      producers: initialProducers,
      roomId: payload.roomId,
      callType: room.callType,
      rtpCapabilites: rtpCapabilities,
      recipentId: socket.data.userId,
      callId: room.callId,
      mediaServerData: initialProducers,
      // initiatorId: room?.owner?.client.id,
    };

    const { participants = [], invitedUserIds = [] } = callRecord;
    //add userId in participants and remove from invitedUserIds if exists
    const participantIds = [
      ...new Set([
        ...participants.map((p) => p.toString()),
        socket.data.userId as string,
      ]),
    ];

    const uniqueParticipants = participantIds.map((id) => id);

    const updatedInvitedUserIds = invitedUserIds.filter(
      (id) => id.toString() !== socket.data.userId,
    );

    this.callsRepository
      .updateCall(room.callId, {
        participants: uniqueParticipants,
        invitedUserIds: updatedInvitedUserIds,
      })
      .catch((err) =>
        Logger.error('something went wrong while updating participants'),
      );

    return responsePayload;
  }

  async endCall(socket: Socket, roomId: string) {
    const userId = socket.data.userId;
    const room = this.validateRoom(roomId);
    // const room = this.roomManager.getRoom(roomId);
    const io = this.socketService.getServerInstance();

    // Check if the room exists
    if (!room) {
      return ApiResponse.notFoundError('Room not found or ended already');
    }

    // Check if the participant is in the call
    const hostParticipant = room.getParticipantByUserId(userId);
    if (!hostParticipant) {
      return ApiResponse.invalidInitatorError(
        'No Participant, internal server error',
      );
    }

    const res = await this.mediaServerClient.endCall(roomId);
    if (!res) {
      return ApiResponse.unknownError('Unknown error from media server');
    }
    this.roomManager.removeRoom(roomId);

    const socketSet = new Set();
    // await Promise.all(
    //   room.recipents.map(async (recipient) => {
    //     try {
    //       // const recipientsActiveSessions =
    //       //   await this.sessionService.findOnlineDevices(recipient);
    //       // recipientsActiveSessions?.forEach(
    //       //   (session) => session?.socketId && socketSet.add(session.socketId),
    //       // );
    //     } catch (e) {
    //       Logger.error(
    //         'Error while getting active session or processing sessions',
    //         e.message,
    //       );
    //     }
    //   }),
    // );
    room.participants.forEach((pt) => {
      if (pt.participantId !== hostParticipant.participantId) {
        socketSet.add(pt.socketId);
      }
    });

    [...socketSet].forEach((socketId) => {
      io.to(socketId as string).emit(callSocketEvents.TERMINATE_CALL, {
        roomId,
      });
    });
    room.cleanUp();

    return { roomId };
  }

  async reconnect(socket: Socket, roomId: string) {
    // Check if the room exists
    const room = this.validateRoom(roomId);
    if (!room) {
      return ApiResponse.notFoundError('Room not founded or ended');
    }
    //  Check if the user is invited
    const participant = room.getParticipantByUserId(socket.data.userId);
    if (!participant) {
      return ApiResponse.invalidInitatorError('Unauthorized');
    }
    participant.setSocketId(socket.id);
    participant.reconnect();
    //  Notify mediaserver about the reconnection
    const { rtpCapabilities, initialProducers } =
      await this.mediaServerClient.handleAnswerCall(
        roomId,
        socket.userId,
        participant.participantId,
      );
    //  Send response
    const responsePayload = {
      producers: initialProducers,
      roomId: roomId,
      callType: room.callType,
      rtpCapabilites: rtpCapabilities,
      recipentId: socket.data.userId,
      callId: room.callId,
      mediaServerData: initialProducers,
    };

    return ApiResponse.success(responsePayload);
  }

  // async handleDisconnect(socket: Socket) {
  //   // If the user is on a call
  //   const roomId = await this.sessionService.getUserPreviousCallId(socket.id);
  //   if (roomId) {
  //     const room = this.roomManager.getRoom(roomId);
  //     if (room) {
  //       const participant = room.getParticipantByUserId(socket.data.userId);
  //       if (!participant) return;
  //       participant.disconnect();
  //       this.leaveCall(socket, { roomId }).catch((e) =>
  //         Logger.error('error on leave call', e.message),
  //       );
  //     }
  //   }
  //   return roomId;
  // }

  async notifyOwner(socket: Socket, payload: NotifyServerDto) {
    const { roomId } = payload;
    const room = this.validateRoom(roomId);
    if (!room) {
      return ApiResponse.notFoundError('Room not founded or ended');
    }
    const owner = room.getOwner();
    const io = this.socketService.getServerInstance();
    io.to(owner.socketId).emit(callSocketEvents.CALL_ANSWERED, payload);
  }

  async leaveCall(socket: Socket, payload: LeaveCallDto) {
    const room = this.validateRoom(payload.roomId);
    if (!room) {
      return ApiResponse.notFoundError('Room not founded or ended');
    }
    const participant = this.validateParticipant(room, socket.data.userId);

    // If the call is 1-to-1 or host left the call, terminate the call
    const hasHostLeft = socket.data.userId === room.owner.userId;
    const terminateCallCondition = room.participants.length <= 2 || hasHostLeft;
    if (terminateCallCondition) {
      const message = hasHostLeft ? 'Host left the call' : '';
      return await this.terminateCall(room, participant, message);
    }

    await this.mediaServerClient.leaveCall(
      room.roomId,
      participant.participantId,
    );
    room.removeParticipant(participant);
    const io = this.socketService.getServerInstance();
    room.getParticipants().forEach((pt) => {
      io.to(pt.socketId).emit(callSocketEvents.USER_LEFT_CALL, participant);
    });

    return { status: true };
  }

  async rejectCall(socket: Socket, payload: RejectCallDto) {
    const { roomId } = payload;
    const room = this.validateRoom(roomId);
    if (!room) {
      return ApiResponse.notFoundError('Room not founded or ended');
    }
    const io = this.socketService.getServerInstance();
    io.to(room.owner.socketId).emit(callSocketEvents.CALL_REJECTED, {
      userId: socket.data.userId,
    });
    room.getParticipants().forEach((pt) => {
      io.to(pt.socketId).emit(callSocketEvents.CALL_REJECTED, {
        userId: socket.data.userId,
      });
    });
    room.cleanUp();
    return { status: true };
  }

  getReceiverSocketId(room: Room, initiatorSocketId: string) {
    const receiverSocketId = room.participants.filter(
      (p) => p.socketId !== initiatorSocketId,
    )[0].socketId;

    return receiverSocketId;
  }

  // Terminate call
  private async terminateCall(
    room: Room,
    initiator: Participant,
    message?: string,
  ) {
    const roomId = room.roomId;
    const res = await this.mediaServerClient.endCall(roomId);
    if (!res) {
      return ApiResponse.unknownError('Unknown error from media server');
    }
    this.roomManager.removeRoom(roomId);

    const io = this.socketService.getServerInstance();

    await Promise.allSettled(
      room.recipents.map((userId) => {
        if (initiator.userId === userId) {
          return;
        }
        findOnlineDeviceAndEmitEvent(this, {
          userId,
          eventName: callSocketEvents.TERMINATE_CALL,
          data: { roomId },
        });
      }),
    );
    room.cleanUp();

    return { roomId, message };
  }

  async handleDisconnect(socket: Socket) {
    // If the user is on a call
    // const roomId = await this.sessionService.getUserPreviousCallId(socket.id);
    // if (roomId) {
    //   const room = this.roomManager.getRoom(roomId);
    //   if (room) {
    //     const participant = room.getParticipantByUserId(socket.data.userId);
    //     if (!participant) return;
    //     participant.disconnect();
    //     this.leaveCall(socket, { roomId }).catch((e) =>
    //       Logger.error('error on leave call', e.message),
    //     );
    //   }
    // }
    // // await this.callRedisService.removeUsersFromCall([socket.data.userId]);
    // return roomId;
  }

  async initiateTranslation(socket: Socket, payload: InitiateTranslationDto) {
    const { producerId, roomId, targetLang } = payload;
    const res = await this.mediaServerClient.translate(
      roomId,
      producerId,
      targetLang,
      socket.data.userId,
    );
    const translatedProducerId = res.producerId;
    return {
      producerId: translatedProducerId,
      roomId,
      status: true,
      rtpCapabilities: res.rtpCapabilities,
    };
  }

  async handleTranslationError(payload: TranslationErrorDto) {
    console.log(payload);
    const intendedTo = await getSocketId(payload.callContext.listener);
    if (!intendedTo) {
      return;
    }
    const io = this.socketService.getServerInstance();
    io.to(intendedTo).emit(callSocketEvents.TRANSLATION_ERROR, payload);
  }
}
