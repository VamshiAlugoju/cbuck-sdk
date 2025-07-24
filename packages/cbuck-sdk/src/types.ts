// types/CallSdk.ts

import { WebView } from 'react-native-webview';
import type { RefObject } from 'react';

export interface Participant {
  participantId: string;
  uniqueId: string;
  audioStream: MediaStream;
  videoStream: MediaStream;
  isVideoPaused?: boolean;
  isAudioPaused?: boolean;
}

export type sendmessageParams = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
};

export interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
}

export type CallState = 'idle' | 'incoming' | 'ongoing' | 'outgoing';
export type CallType = 'audio' | 'video';

export interface CallDetails {
  callId: string;
  roomId: string;
  state: CallState;
  type: CallType;
  startedAt?: Date;
  duration: number;
  participants: Participant[];
  initiatorId: string;
  recipients: string[];
}

export type Config = {
  apiKey: string;
  uniqueId: string;
};

export type StartCallParams = {
  recipientId: string;
  callType: CallType;
};

export interface CallSdk {
  /** Initializes the SDK with API keys and user identity */
  init(config: Config): Promise<void>;

  /** Starts a new outgoing call */
  startCall(params: StartCallParams): Promise<void>;

  /** Accepts an incoming call */
  acceptCall(): Promise<void>;

  /** Rejects an incoming call */
  rejectCall(): Promise<void>;

  /** Ends the current call */
  endCall(): Promise<void>;

  /** Attempts to reconnect in case of disconnection */
  reconnect(): Promise<void>;

  /** Toggle local audio mute/unmute */
  toggleAudioMute(): void;

  /** Toggle local video on/off */
  toggleVideoMute(): void;

  /** Register callback for incoming calls */
  onIncomingCall(callback: (callDetails: CallDetails) => void): void;

  /** Subscribe to call state changes */
  onCallStateChange(callback: (state: CallDetails) => void): void;

  /** Listen for participant updates (join/leave/mute/etc) */
  onParticipantUpdate(callback: (participants: Participant[]) => void): void;

  /** Handle internal SDK errors */
  onError(callback: (error: Error) => void): void;

  /** Returns the current local audio track */
  audioTrack(): any | undefined;

  /** Returns the current local video track */
  videoTrack(): any | undefined;

  /** Reference to the underlying WebView */
  webViewRef: RefObject<WebView>;

  /** Read-only current call state */
  callState: CallDetails;
}
