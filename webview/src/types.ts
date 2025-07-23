declare global {
  interface Window {
    ReactNativeWebView: {
      postMessage: (message: string) => void;
    };
  }
}

export type CallType = "audio" | "video";

// ✅ Recommended replacement for enums in frontend
export const CallStatus = {
  OUTGOING: "outgoing",
  RECEIVED: "received",
  MISSED: "missed",
} as const;

export type CallStatus = (typeof CallStatus)[keyof typeof CallStatus];

export interface StartCallDto {
  recipients: string[];
  callerId: string;
  call_type: CallType;
}

export interface NotifyServerDto {
  roomId: string;
}

export interface LeaveCallDto {
  roomId: string;
}

export interface CallStatusDto {
  roomId: string;
}

export interface CreateTransportDto {
  roomId: string;
}

export interface ConnectTransportDto {
  roomId: string;
  dtlsParameters: any;
}

export interface ProduceDto {
  roomId: string;
  kind: "audio" | "video";
  rtpParameters: any;
  appData: any;
  isScreenShare?: boolean;
}

export interface ConsumeDto {
  roomId: string;
  producerClientId: string;
  producerId: string;
  rtpCapabilities: any;
}

export interface UnpauseDto {
  id: string;
  roomId: string;
}

export interface AnswerCallDto {
  roomId: string;
  callId: string;
  userId: string;
}

export interface RejectCallDto {
  roomId: string;
}

export interface IgnoreCallDto {
  roomId: string;
}

export interface SwitchVideoDto {
  roomId: string;
}

export interface ScreenShareRequestDto {
  roomId: string;
}

export interface ScheduleCallDto {
  initiatorId?: string;
  invitedUserIds: string[];
  startTime: string;
  callType: CallType;
  expectedDuration: number;
}

export interface GetScheduledCallDto {
  callId: string;
}

export interface HandleScheduleCallDto {
  initiatorId: string;
  invitedUserIds: string[];
  startTime: string;
  callType: CallType;
  callId: string;
}

export interface ScheduleCallWithCallIdDto extends ScheduleCallDto {
  callId: string;
}

export interface FeedbackDto {
  callId: string;
  rating: number;
  comment?: string;
}

export interface FeedbackWithUserIdDto extends FeedbackDto {
  userId: string;
}

export interface InviteUsersToCallDto {
  roomId: string;
  invitedUserIds: string[];
}

export interface PaginationDto {
  page?: number;
  perPage?: number;
}

export interface GetScheduledCallListDto {
  initiatorPage?: number;
  initiatorPerPage?: number;
  invitedUsersPage?: number;
  invitedUsersPerPage?: number;
}

export interface GetScheduledCallListWithIdDto extends GetScheduledCallListDto {
  userId: string;
}

export interface RemoveParticipantFromCall {
  roomId: string;
  participantId: string;
}

export interface KeepCallAliveDto {
  roomId: string;
}

export type CallDetails = {
  callId: string;
  roomId: string;
  state: "idle" | "incoming" | "outgoing" | "ongoing";
  type: CallType;
  startedAt: Date | undefined;
  duration: number;

  participants: string[];
  initiatorId: string;
  recipients: string[];
};
