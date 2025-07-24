import { Device, types } from "mediasoup-client";
import { Socket } from "socket.io-client";

// contexts

export interface ICallsContext {
  callDetails: CallDetails;
  getCallDetails: () => CallDetails | null;
  startCall: (params: StartCallParams) => void;
  rejectCall: () => void;
  muteCall: () => void;
  answerCall: ({ roomId }: AnswerCallPayload) => void;
  inviteUsers(contacts: any[]): void;
  upgrageToVideoCall: () => void;
  endCall: () => void;
  requestSwitchToVideo(): Promise<void>;
  callNotifications: callsNotificationType;
  hideCallNotification: (type: keyof callsNotificationType) => void;
  showCallNotification: (type: keyof callsNotificationType) => void;
  toggleAudioTrack(): Promise<void>;
  toggleVideoTrack(): Promise<void>;
  sharescreen(): Promise<void>;
  stopScreenSharing(): Promise<any>;
  cancelCall(): Promise<void>;
  removeParticipantFromCall: (participantId: string) => void;
  muteParticipantMedia(
    type: "audio" | "video",
    participentId: string
  ): Promise<void>;
  unmuteParticipantMedia(
    type: "audio" | "video",
    participentId: string
  ): Promise<void>;

  switchTovidoResponse(response: "accept" | "reject"): Promise<void>;
  producers: producerT;
  resetCallDetails: () => void;
  toggleSpeaker(speaker: boolean): void;
  acceptNewIncomingCall: () => void;
  rejectNewIncomingCall: () => void;
  newIncomingCall: boolean;
}

export type AnswerCallPayload = {
  roomId: string;
};

export type CallType = "audio" | "video";
export type StartCallParams = {
  recipients: string[];
  callType: CallType;
};
type CallState = "idle" | "incoming" | "outgoing" | "ongoing";
type ScreenShareState = "idle" | "pending" | "active";

export type RoomType = {
  roomId: string;
  recipients: string[];
  notifiedRecipents: string[];
  owner: Participant | null;
  callType: string | null;
  initialCallType: string;
  callId: string;
};

export interface Participant {
  participantId: string;
  userId: string;
  // producerId: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  audioConsumer: types.Consumer | null;
  videoConsumer: types.Consumer | null;
  client: ClientDetails;
  isVideoPaused?: boolean;
  isAudioPaused?: boolean;
  isScreenSharing?: boolean;
  audioProducerId?: string;
  translatedAudioTrack: MediaStreamTrack | null;
  translatedAudioConsumer: types.Consumer<types.AppData> | null;
}
export type producerT = {
  audioProducer?: types.Producer | null;
  videoProducer?: types.Producer | null;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  isVideoPaused?: boolean;
  isAudioPaused?: boolean;
  videoScreenShareProducer?: types.Producer | null;
  audioScreenShareProducer?: types.Producer | null;
  isScreenSharing?: boolean;
  videoStream?: MediaStream;
  facing_mode?: "front" | "back";
};

export interface ClientDetails {
  name: string;
  id: string;
  username: string;
  image?: string;
  bio?: string;
}

export type callsNotificationType = {
  showSwitchToVideoPopup: boolean;
  showAddPeoplePopup: boolean;
  showScreenShareRequest: boolean;
  screenSharer?: { clientId: string; clientDetails: any };
  isWaitingForScreenShareApproval: boolean;
  showReconnectCallPopup: boolean;
};

export type incomingCallData = {
  callerId: string;
  roomId: string;
  callType: CallType;
  recipients: string[];
  rtpCapabilities: any;
  callId: string;
  isGroupCall: boolean;
  initialCallType: CallType;
  recipentList: RecipientDetail[];
};

export type answerCallRes = {
  producers: any[];
  roomId: string;
  callType: CallType;
  rtpCapabilites: any;
  recipentId: string;
  callId: string;
  mediaServerData: any;
  initiatorId: string;
};

export type RecipientDetail = {
  _id: string;
  name: string;
  username: string;
  email: string;
  image: string;
};

export interface CallDetails {
  callId: string;
  roomId: string;
  initiatorId: string;
  state: CallState;
  type: CallType;
  startedAt?: Date;
  duration?: number;

  isGroupCall: boolean;
  initialCallType: CallType;
  // isVideoEnabled: boolean;
  // isAudioEnabled: boolean;
  isScreenSharing: boolean;

  participants: Participant[];

  networkQuality?: "good" | "poor" | "bad";
  errorState?: string;

  isRecording?: boolean;
  recordingStartedAt?: Date;

  recipients: string[];
  recipentList: RecipientDetail[];
  screenSharingState: ScreenShareState;
  activeScreenSharers: any[];
  initiatorDetails: string | null;
  callType: "audio" | "video" | null;
}

///

export type consumeRes = {
  error?: any;
  producerId: string;
  id: string;
  rtpParameters: any;
  kind: "audio" | "video";
  participantId: string;
  participant: any;
};

export type HandleMediasoupProducersProps = {
  getDevice: () => Device;
};

export type StartProducingOptions = {
  isScreenSharing?: boolean;
};

export type ProducerKind = "audio" | "video";

/*  call Event responses  */
export type StartCallRes = {
  error?: any;
  callerId: string;
  roomId: string;
  callType: CallType;
  recipients: string[];
  rtpCapabilities: any;
  callId: string;
  isGroupCall: boolean;
  initialCallType: CallType;
  initiatorId: string;
  recipentList: RecipientDetail[];
};
export type removeParticipantResponse = {
  status: boolean;
  response: string;
  callId?: string;
  participantId?: string;
  userIdOfParticipant?: string;
};
export type userIsOnOtherCallType = {
  onCallRecipients: RecipientDetail[];
  isGroupCall: boolean;
  areAllBusy: boolean;
};

export type IgnoreCallPayload = {
  roomId: string;
  userId: string;
  isGroupCall: boolean;
};
