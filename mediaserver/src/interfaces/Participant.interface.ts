import { types } from 'mediasoup';
export interface IParticipant {
  participantId: string; // unique id generated in the main backend; in sync with the participant in the backend
  userId: string; // original userId;
  roomId: string;
  producerTransport: types.WebRtcTransport | null;
  consumerTransport: types.WebRtcTransport | null;
  producers: IClientProducer;
  consumers: Map<string, types.Consumer>;
  dataConsumer: types.DataConsumer;
  getDataConsumer: () => types.DataConsumer;
  getProducerTransport: () => types.WebRtcTransport | null;
  getConsumerTransport: () => types.WebRtcTransport | null;
  addProducerTransport: (transport: types.WebRtcTransport) => void;
  addConsumerTransport: (transport: types.WebRtcTransport) => void;
  cleanUp(): Promise<void>;
  produceVideo({ kind, appData, rtpParameters }: any): Promise<types.Producer<any>>;
  produceVideo({ kind, appData, rtpParameters }: any): Promise<types.Producer<any>>;
  log(data: any): void;
}

export interface IClientProducer {
  audio?: types.Producer | null;
  video?: types.Producer | null;
}

export interface TranslationChannel {
  intendedToUsers: string[]; // user who listens the translated audio
  targetLang: string;
  sendTransport: types.PlainTransport;
  recvTransport: types.PlainTransport;
  originalProducer: types.Producer;
  producer: types.Producer; // sends audio to ffmpeg
  consumer: types.Consumer; // receives audio from ffmpeg
}

export type CallTranslationContext = {
  roomId: string;
  consumerId: string;
  speaker: string;
  listener: string;
  originalProducerId: string;
  targetLang: string
}