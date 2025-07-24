import { Logger } from '@nestjs/common';
import { types } from 'mediasoup';
import { IParticipant, IClientProducer, TranslationChannel } from 'src/interfaces/Participant.interface';

export default class Participant implements IParticipant {
  participantId: string;
  clonedParticipantId?: string;
  isScreenSharer: boolean = false;
  userId: string;
  roomId: string;
  producerTransport: types.WebRtcTransport<types.AppData> | null = null;
  consumerTransport: types.WebRtcTransport<types.AppData> | null = null;
  producers: IClientProducer = {};
  consumers: Map<string, types.Consumer<types.AppData>> = new Map();
  isConnected: boolean = false;
  mediaState: { audio: boolean; video: boolean } = {
    audio: false,
    video: false,
  };
  dataConsumer: types.DataConsumer<types.AppData>;
  translationChannels: Map<string, TranslationChannel> = new Map(); // TODO: Instead of array, use map (map the <producerId>@<targetLang>:TranslationChannel )
  constructor(userId: string, roomId: string, uniqueId: string) {
    this.roomId = roomId;
    this.userId = userId;
    this.participantId = uniqueId;
    this.logData();
  }
  private logger = new Logger('Participant');

  logData() { }

  log(data: any) {
    this.logger.log(data);
  }

  addProducerTransport(transport: types.WebRtcTransport) {
    this.producerTransport = transport;
  }
  addConsumerTransport(transport: types.WebRtcTransport) {
    this.consumerTransport = transport;
  }
  getProducerTransport() {
    return this.producerTransport;
  }
  addDataConsumer(dataConsumer: types.DataConsumer) {
    this.dataConsumer = dataConsumer;
  }
  getConsumerTransport() {
    return this.consumerTransport;
  }
  getDataConsumer() {
    return this.dataConsumer;
  }
  async cleanUp() {
    if (this.producerTransport) {
      this.producerTransport.close();
      this.producerTransport = null;
    }
    if (this.consumerTransport) {
      this.consumerTransport.close();
      this.consumerTransport = null;
    }
    this.producers.audio?.close();
    this.producers.video?.close();
    this.consumers.forEach((consumer) => consumer.close());
    this.consumers.clear();
    this.log(`Cleaned up participant ${this.participantId}`);
  }

  addConsumer(consumer: types.Consumer<types.AppData>) {
    this.consumers.set(consumer.id, consumer);
  }

  removeConsumer(consumerId: string) {
    this.consumers.delete(consumerId);
  }
  getConsumer(consumerId: string) {
    return this.consumers.get(consumerId);
  }
  setConnected(connected: boolean) {
    this.isConnected = connected;
    this.log(`Participant ${this.participantId} connected: ${connected}`);
  }
  updateMediaState(audio: boolean, video: boolean) {
    this.mediaState.audio = audio;
    this.mediaState.video = video;
  }
  replaceProducerTransport(transport: types.WebRtcTransport) {
    if (this.producerTransport) {
      this.producerTransport.close();
    }
    this.producerTransport = transport;
    this.log(`Replaced producer transport for ${this.participantId}`);
  }
  async produceAudio({ kind, appData, rtpParameters }: any) {
    if (!this.producerTransport) {
      throw 'Producer Transport not found';
    }
    const producer = await this.producerTransport.produce({
      kind: kind,
      appData: appData,
      rtpParameters: rtpParameters,
    });
    this.producers.audio = producer;
    return producer;
  }
  async produceVideo({ kind, appData, rtpParameters }: any) {
    if (!this.producerTransport) {
      throw 'Producer Transport not found';
    }
    const producer = await this.producerTransport.produce({
      kind: kind,
      appData: appData,
      rtpParameters: rtpParameters,
    });
    this.producers.video = producer;
    return producer;
  }

  async clone(newParticipatId: string) {
    const clone = new Participant(this.userId, this.roomId, newParticipatId);
    clone.producerTransport = this.producerTransport;
    clone.consumerTransport = this.consumerTransport;
    clone.isConnected = true;
    clone.clonedParticipantId = this.participantId;
    clone.isScreenSharer = true;
    return clone;
  }
  stopScreenSharing() {
    this.producers.audio?.close();
    this.producers.video?.close();
    this.consumers.forEach((consumer) => consumer.close());
    this.consumers.clear();
  }


  addTranslationChannel(channel: TranslationChannel) {
    const keyString = `${channel.originalProducer.id}@${channel.targetLang}`;
    this.translationChannels.set(keyString, channel);
  }

  closeTranslationChannel(originalProducerId: string, targetLang: string) {
    const keyString = `${originalProducerId}@${targetLang}`
    const translationChannel = this.translationChannels.get(keyString)
    if (!translationChannel) {
      this.logger.error(`Translation channel not found for producer ${originalProducerId}`);
      return;
    }
    translationChannel.producer.close()
    translationChannel.consumer.close()
    translationChannel.recvTransport.close()
    translationChannel.sendTransport.close()
    this.translationChannels.delete(keyString)
  }
}
