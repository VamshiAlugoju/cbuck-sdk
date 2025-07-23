import type {
  Config,
  CallDetails,
  Participant,
  StartCallParams,
} from './types.ts';
import type { WebView } from 'react-native-webview';
import React from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

class CallClient {
  private _callState: CallDetails;
  private _apiKey: string | undefined;
  private _uniqueId: string | undefined;
  public isValidated: boolean = false;
  // private _ackFromWeb: boolean = false;
  private _microphonePermission: boolean = false;

  private _webViewRef: React.RefObject<WebView<{}> | null> =
    React.createRef<WebView<{}> | null>();
  private _callbacks: {
    onIncomingCall?: (callDetails: CallDetails) => void;
    onCallStateChange?: (state: CallDetails) => void;
    onParticipantUpdate?: (participants: Participant[]) => void;
    onCallAnswered?: (callDetails: CallDetails) => void;
    onError?: (error: Error) => void;
  } = {};

  constructor() {
    this._callState = {
      callId: '',
      roomId: '',
      state: 'idle',
      type: 'audio',
      duration: 0,
      participants: [],
      initiatorId: '',
      recipients: [],
    };
  }

  public init(config: Config): void {
    // todo : validate with our backend
    if (this.isValidated) {
      console.warn('CallClient is already initialized');
      // return;
    }
    this._apiKey = config.apiKey;
    this._uniqueId = config.uniqueId;
    this.requestMicrophonePermission();
    this.isValidated = true;

    this.sendCustomRNMessage({
      type: 'init',
      data: {
        ...config,
      },
    });
  }

  public async requestMicrophonePermission(): Promise<void> {
    const granted = await requestMicrophonePermission();
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      this._microphonePermission = true;
    } else {
      this._microphonePermission = false;
    }
  }

  private validateSetup(): void {
    if (!this._webViewRef?.current) {
      throw new Error(
        'WebView ref is not initialized, Please initialize it first'
      );
    }
    if (!this._apiKey || !this._uniqueId) {
      throw new Error('CallClient is not initialized');
    }
    if (!this.isValidated) {
      throw new Error('Apikey is invalid');
    }
  }

  public getWebViewRef(): React.RefObject<WebView<{}> | null> {
    return this._webViewRef;
  }

  public setWebViewRef(ref: WebView<{}> | null): void {
    this._webViewRef.current = ref;
  }

  public startCall(params: StartCallParams): void {
    this.validateSetup();
    const payload: RNMessage = {
      type: 'startCall',
      data: {
        ...params,
        apiKey: this._apiKey,
        uniqueId: this._uniqueId,
      },
    };

    this.sendCustomRNMessage(payload);

    // Update call state
    this._callState = {
      ...this._callState,
      state: 'outgoing',
      type: params.callType,
      recipients: [params.recipientId],
    };
  }

  public acceptCall(): void {
    this.requestMicrophonePermission();
    if (!this._microphonePermission) {
      throw new Error('Microphone permission is not granted');
    }
    this.validateSetup();
    const payload: RNMessage = {
      type: 'acceptCall',
      data: {},
    };
    this.sendCustomRNMessage(payload);

    // Update call state
    this._callState = {
      ...this._callState,
      state: 'ongoing',
    };
  }

  public rejectCall(): void {
    this.validateSetup();
    const payload: RNMessage = {
      type: 'rejectCall',
      data: {},
    };
    this.sendCustomRNMessage(payload);

    // Update call state
    this._callState = {
      ...this._callState,
      state: 'idle',
    };
  }

  public endCall(): void {
    this.validateSetup();
    const payload: RNMessage = {
      type: 'endCall',
      data: {},
    };
    this.sendCustomRNMessage(payload);

    // Update call state
    this._callState = {
      ...this._callState,
      state: 'idle',
      participants: [],
    };
  }

  public reconnect(): void {
    this.validateSetup();
    const payload: RNMessage = {
      type: 'reconnect',
      data: {},
    };
    this.sendCustomRNMessage(payload);
  }

  public toggleAudioMute(): void {
    this.validateSetup();
    const payload: RNMessage = {
      type: 'toggleAudioMute',
      data: {},
    };
    this.sendCustomRNMessage(payload);
  }

  public toggleVideoMute(): void {
    this.validateSetup();
    const payload: RNMessage = {
      type: 'toggleVideoMute',
      data: {},
    };
    this.sendCustomRNMessage(payload);
  }

  public onIncomingCall(callback: (callDetails: CallDetails) => void): void {
    this._callbacks.onIncomingCall = callback;
  }

  public onCallStateChange(callback: (state: CallDetails) => void): void {
    this._callbacks.onCallStateChange = callback;
  }
  public onCallAnswered(callback: (callDetails: CallDetails) => void): void {
    this._callbacks.onCallAnswered = callback;
    this.callState.state = 'ongoing';
    this._callbacks.onCallStateChange?.(this.callState);
  }

  public onParticipantUpdate(
    callback: (participants: Participant[]) => void
  ): void {
    this._callbacks.onParticipantUpdate = callback;
  }

  public onError(callback: (error: Error) => void): void {
    this._callbacks.onError = callback;
  }

  public get callState(): CallDetails {
    return { ...this._callState };
  }

  // Method to handle incoming messages from WebView
  public handleWebViewMessage(message: any): void {
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      switch (data.type) {
        case 'incomingCall':
          this._callState = {
            ...this._callState,
            state: 'incoming',
            ...data.callDetails,
          };
          this._callbacks.onIncomingCall?.(this._callState);
          break;
        case 'callStateChange':
          this._callState = { ...this._callState, ...data.data };

          this._callbacks.onCallStateChange?.(this._callState);
          break;
        case 'callAnswered':
          this._callState = { ...this._callState, ...data.callDetails };
          this._callbacks.onCallAnswered?.(this._callState);
          break;
        case 'participantUpdate':
          this._callState = {
            ...this._callState,
            participants: data.participants,
          };
          this._callbacks.onParticipantUpdate?.(data.participants);
          break;
        case 'ackFromWeb':
          // this._ackFromWeb = true;
          break;
        case 'error':
          this._callbacks.onError?.(new Error(data.message));
          break;
        default:
          console.log('Client::Unknown message type:', data.type);
      }
    } catch (error) {
      this._callbacks.onError?.(error as Error);
    }
  }

  private sendCustomRNMessage = (payload: RNMessage) => {
    const jsToInject = `
      window.dispatchEvent(new CustomEvent('rn-message', {
        detail: ${JSON.stringify(payload)}
      }));
      true; // Necessary for Android
    `;
    this.getWebViewRef().current?.injectJavaScript(jsToInject);
  };

  public cleanUp() {
    this._callbacks.onIncomingCall = undefined;
    this._callbacks.onCallStateChange = undefined;
    this._callbacks.onCallAnswered = undefined;
    this._callbacks.onParticipantUpdate = undefined;
    this._callbacks.onError = undefined;
  }
}

type RNMessageType =
  | 'startCall'
  | 'acceptCall'
  | 'rejectCall'
  | 'endCall'
  | 'reconnect'
  | 'toggleAudioMute'
  | 'toggleVideoMute'
  | 'init';

type RNMessage = {
  type: RNMessageType;
  data: any;
};
// Create a singleton instance
const Client = new CallClient();
export default Client;

const requestMicrophonePermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'We need access to your microphone to make calls',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      }
    );
    console.log('Client::requestMicrophonePermission', granted);
    return granted;
  } else {
    return PermissionsAndroid.RESULTS.DENIED;
  }
};
