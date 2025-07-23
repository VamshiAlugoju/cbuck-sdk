import {
  CallSocketEventValue,
  callSocketEvents,
} from 'src/calls/gateways/events/calls.socketevents';
import CallService from './calls.service';

export type CallServiceContext = InstanceType<typeof CallService>;

export type getCallRecipientsType = {
  allUniqueRecipient: string[];
};
export type informHostWhoAllAreOnOtherCallPayload = {
  userId: string;
  onCallRecipients: string[];
  offCallRecipients: string[];
  isGroupCall: boolean;
  areAllBusy: boolean;
};
export type incomingCallPayloadType = {
  callerId: string;
  roomId: string;
  callType: string;
  recipents: string[];
  recipentList: any;
  rtpCapabilities: any;
  callId: string;
  isGroupCall: boolean;
  initialCallType: string;
  initiatorId: string | undefined;
  initiatorDetails: Record<string, any>;
};

type findOnlineDeviceAndEmitEventType = {
  userId: string;
  eventName: CallSocketEventValue;
  data: object;
};

// export async function sendFCMTokenNotification(
//   self: CallServiceContext,
//   payload: sendFCMTokenNotificationType,
// ) {
//   const recipientsActiveSessions = await self.sessionService.findOnlineDevices(
//     payload.userId,
//   );
//   recipientsActiveSessions.forEach((session) => {
//     if (session.fcmToken) {
//       self.notificationService.constructAndSendDataOnlyMessage(
//         session.fcmToken,
//         notifEvents.calls.incoming,
//         payload.data,
//       );
//     }
//   });
// }

// export async function clearRoomAndEndCall(
//   self: CallServiceContext,
//   roomId: string,
// ) {
//   await self.callRedisService.removeAllUsersFromRoom(roomId);
//   self.roomRedisService
//     .removeRoom(roomId)
//     .catch((e) =>
//       Logger.error(`error while removing room from redis ${e?.message}`),
//     );
//   self.roomManager.removeRoom(roomId);
//   self
//     .retryAsync(() => {
//       return self.mediaServerClient.endCall(roomId);
//     })
//     .catch((e) => Logger.error(`error while closing the call ${e?.message}`));
// }
// export async function emitEventViaSocketId(
//   self: CallServiceContext,
//   payload: emitEventViaSocketIdType,
// ) {
//   const io = self.socketService.getServerInstance();
//   const { socketId, eventName, data } = payload;
//   io.to(socketId).emit(eventName, data);
// }

// export async function informOnCallRecipientsOfNewCall(
//   self: CallServiceContext,
//   data: informOnCallRecipientsOfNewCallType,
// ): Promise<void> {
//   const { onCallRecipients, incomingCallPayload } = data;

//   const EmitEventResults = await Promise.allSettled(
//     onCallRecipients.map((recipientUserId) =>
//       findOnlineDeviceAndEmitEvent(self, {
//         eventName: callSocketEvents.NEW_INCOMING_CALL,
//         userId: recipientUserId,
//         data: incomingCallPayload,
//       }),
//     ),
//   );
//   //since user is already on call so no need of sending fcm notification
//   EmitEventResults.forEach((result, index) => {
//     if (result.status === 'rejected') {
//       Logger.error(
//         `Failed to notify recipient ${onCallRecipients[index]}:`,
//         result.reason,
//       );
//     } else {
//       Logger.log(`✅ Notified recipient ${onCallRecipients[index]}`);
//     }
//   });
// }

// export async function informOffCallRecipientsOfCall(
//   self: CallServiceContext,
//   data: informOffCallRecipientsOfNewCallType,
// ): Promise<void> {
//   const { offCallRecipients, incomingCallPayload } = data;

//   const EmitEventResults = await Promise.allSettled(
//     offCallRecipients.map((recipientUserId) =>
//       findOnlineDeviceAndEmitEvent(self, {
//         eventName: callSocketEvents.INCOMING_CALL,
//         userId: recipientUserId,
//         data: incomingCallPayload,
//       }),
//     ),
//   );

//   const sendNotificationResults = await Promise.allSettled(
//     offCallRecipients.map((recipientUserId) =>
//       sendFCMTokenNotification(self, {
//         userId: recipientUserId,
//         data: incomingCallPayload,
//       }),
//     ),
//   );

//   EmitEventResults.forEach((result, index) => {
//     if (result.status === 'rejected') {
//       Logger.error(
//         `Failed to notify recipient ${offCallRecipients[index]}:`,
//         result.reason,
//       );
//     } else {
//       Logger.log(` Notified recipient ${offCallRecipients[index]}`);
//     }
//   });
//   sendNotificationResults.forEach((result, index) => {
//     if (result.status === 'rejected') {
//       Logger.error(
//         `Failed to notify recipient ${offCallRecipients[index]}: via fcm`,
//         result.reason,
//       );
//     } else {
//       Logger.log(` Notified recipient ${offCallRecipients[index]} via fcm`);
//     }
//   });
// }
// export async function clearAllPreviousRoom(self: CallServiceContext) {
//   //get all room registered in redis
//   const allRooms = await self.roomRedisService.getAllRooms();
//   await self.roomRedisService.clearAllRooms();

//   await Promise.allSettled(
//     allRooms.map(async (roomId) => {
//       self.mediaServerClient.endCall(roomId);
//     }),
//   );
//   await self.roomRedisService.clearAllRooms();
// }
// export async function scheduleRoomMonitorJob(self: CallServiceContext) {
//   const repeat = await self.callQueue.repeat;
//   const jobs = await repeat.getRepeatableJobs();
//   for (const job of jobs) {
//     if (job.name === CallJobs.MonitorRoom) {
//       await self.callQueue.removeJobScheduler(job.key);
//     }
//   }
//   await self.callQueue.add(
//     CallJobs.MonitorRoom,
//     {},
//     {
//       repeat: {
//         every: 60 * 1000 * 10, // 1 minute
//       },
//       jobId: 'monitor-room-repeater',
//       removeOnComplete: true,
//       removeOnFail: true,
//     },
//   );
// }
// export async function monitorAndClearInActiveRooms(self: CallServiceContext) {
//   const allRoomsViaRedis = await self.roomRedisService.getAllRooms();
//   const allRooms = self.roomManager.getAllRoom();
//   // console.log(allRooms,allRoomsViaRedis, 'all rooms,,,,,,,');
//   await Promise.allSettled(
//     allRoomsViaRedis.map(async (roomId) => {
//       if (allRooms.has(roomId)) {
//         const room = allRooms.get(roomId);

//         const TEN_MINUTES = 10 * 60 * 1000;
//         const isInactiveRoom = Date.now() - room!.updatedAt > TEN_MINUTES;

//         if (isInactiveRoom) {
//           // it is inactive room clear it
//           self.roomManager.removeRoom(roomId);
//           self.mediaServerClient.closeRoom(roomId);
//           await self.roomRedisService.removeRoom(roomId);
//         }
//       } else {
//         //room not found in rooms but found in redis
//         self.mediaServerClient.closeRoom(roomId);
//         await self.roomRedisService.removeRoom(roomId);
//       }
//     }),
//   );
// }
// export async function validateRoomViaRedis(
//   self: CallServiceContext,
//   roomId: string,
// ) {
//   const room = self.roomManager.getRoom(roomId);
//   if (!room) {
//     const isRoomInRedis = await self.roomRedisService.isRoomExists(roomId);
//     if (isRoomInRedis) {
//       self
//         .retryAsync(() => {
//           return self.mediaServerClient.endCall(roomId);
//         })
//         .catch((e) => Logger.error(`error while deleting room ${e.message}`));

//       self.roomRedisService
//         .removeRoom(roomId)
//         .catch((e) => Logger.error(`${e.message}`));
//     }
//   }
//   return room;
// }

export async function findOnlineDeviceAndEmitEvent(
  self: CallServiceContext,
  payload: findOnlineDeviceAndEmitEventType,
  notificationPayload?: Object,
) {
  const io = self.socketService.getServerInstance();
}

export async function getCallRecipients(
  self: CallServiceContext,
  data: getCallRecipientsType,
) {
  const { allUniqueRecipient } = data;
  // const roomIds =
  //   await self.callRedisService.getUsersRoomIds(allUniqueRecipient); // (string | null)[]
  const onCallRecipients: string[] = [];
  const offCallRecipients: string[] = [];
  for (let i = 0; i < allUniqueRecipient.length; i++) {
    const userId = allUniqueRecipient[i];
    offCallRecipients.push(userId);
    // const roomId = roomIds[i];

    // if (roomId) {
    //   onCallRecipients.push(userId);
    // } else {
    // }
  }
  return { onCallRecipients, offCallRecipients };
}

export async function informHostWhoAllAreOnOtherCall(
  self: CallServiceContext,
  data: informHostWhoAllAreOnOtherCallPayload,
) {
  const { onCallRecipients, userId, isGroupCall, areAllBusy } = data;
  const usersDetail = await getUsersByUserIds(self, onCallRecipients);

  findOnlineDeviceAndEmitEvent(self, {
    eventName: callSocketEvents.USER_IS_ON_OTHER_CALL,
    userId,
    data: { onCallRecipients: usersDetail, isGroupCall, areAllBusy },
  });
}

export async function getUsersByUserIds(
  self: CallServiceContext,
  userIds: string[],
) {
  // const data = await self.userRepository.findUsersByConditionWithProjection(
  //   { _id: { $in: userIds.map((id) => new Types.ObjectId(id)) } },
  //   { name: 1, image: 1, email: 1, username: 1 },
  // );
  // return data;
  return [];
}
