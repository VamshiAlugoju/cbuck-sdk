import { types } from 'mediasoup';
import Participant from './Participant';
import { Logger } from '@nestjs/common';

interface RoomStats {
  participantCount: number;
  transportCount: number;
  producerCount: number;
  consumerCount: number;
  pipeTransportCount: number;
  lastActive: number; // Timestamp
}

interface IRoom {
  router: types.Router;
  roomId: string;
  workerId: string;
  participants: Map<string, Participant>;
  owner: Participant | null;
  ownerLimit: number;
  callId: string;
  isActive: boolean;
  producers: Map<string, types.Producer<types.AppData>>;
  consumers: Map<string, types.Consumer<types.AppData>>;
  webrtcTransports: Map<string, types.WebRtcTransport<types.AppData>>;
  lastActive: number;
  audioObserver: types.AudioLevelObserver;

  // Methods
  addOwner: (owner: Participant) => void;
  addParticipant: (participant: Participant) => Promise<void>;
  removeParticipant: (participantId: string) => Promise<void>;
  createTransportForParticipant: (
    participant: Participant,
    type: 'producer' | 'consumer',
    options: types.WebRtcTransportOptions,
  ) => Promise<types.WebRtcTransport>;
  getParticipantById: (id: string) => Participant | undefined;
  getParticipants: () => Map<string, Participant>;
  getRtpCapabilities: () => types.RtpCapabilities;
  getAllProducers: () => Map<string, types.Producer<types.AppData>>;
  getAllConsumers: () => Map<string, types.Consumer<types.AppData>>;
  updateActivity: () => void;
  closeRoom: () => Promise<void>;
  getRoomStats: () => RoomStats; // Basic stats about the room
  monitorHealth: () => boolean; // Check room health

  // optional for now
  pipeTransports: Map<string, types.PipeTransport<types.AppData>>;
  createPipeTransport: (options: types.PipeTransportOptions) => Promise<types.PipeTransport>;
  pipeProducerToRouter: (producerId: string, targetRouter: types.Router) => Promise<void>;
  removePipeTransport: (pipeTransportId: string) => Promise<void>;
  getDataProducerData(): {
    id: string;
    sctpStreamParameters: types.SctpStreamParameters | undefined;
  };
}

export default class Room implements IRoom {
  public router: types.Router; // Fixed typo
  public roomId: string;
  public owner: Participant | null = null; // Single owner as ID (can be changed back to Participant if needed)
  public participants = new Map<string, Participant>();
  public ownerLimit: number = Number(process.env.OWNER_LIMIT) || 1;
  public callId: string;
  public isActive: boolean;
  public workerId: string;
  public producers: Map<string, types.Producer<types.AppData>> = new Map();
  public consumers: Map<string, types.Consumer<types.AppData>> = new Map();
  public webrtcTransports: Map<string, types.WebRtcTransport<types.AppData>> = new Map();

  public pipeTransports: Map<string, types.PipeTransport<types.AppData>> = // New property
    new Map();
  public lastActive: number = Date.now();
  public audioObserver: types.AudioLevelObserver<types.AppData>;
  private timerId: NodeJS.Timeout | null = null;
  private idleTimerId: NodeJS.Timeout | null = null;
  private idleMinutes: number = 0;
  private dataTransport: types.WebRtcTransport;
  private dataProducer: types.DataProducer<types.AppData>;
  private roomIdleLimit = process.env.ROOMIDLELIMIT || 10;
  private audioprs = 0;
  constructor(
    router: types.Router,
    roomId: string,
    callId: string,
    workerId: string,
    audioLevelObserver: types.AudioLevelObserver<types.AppData>,
  ) {
    this.router = router;
    this.roomId = roomId;
    this.callId = callId;

    this.workerId = workerId;
    this.isActive = true;
    this.startLogging();
    this.audioObserver = audioLevelObserver;
    this.createDataTransport();
    this.registerEvents();
  }

  private logger = new Logger('Room');

  async registerEvents() {
    this.audioObserver.on('volumes', async (data) => {
      const payload = JSON.stringify({
        type: 'audio-volumes',
        volumes: data.map((v) => ({
          producerId: v.producer.id,
          volume: v.volume,
        })),
      });

      try {
        this.dataProducer.send(payload);
      } catch (err) {
        this.logger.error(`Failed to send volume data: ${err.message}`);
      }
    });
    this.audioObserver.on('silence', () => {
      this.logger.warn(`silence emitted `);
    });
  }

  async createDataTransport() {
    const PUBLIC_IP = process.env.MEDIASOUP_PUBLIC_IP;
    this.dataTransport = await this.router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: PUBLIC_IP }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      enableSctp: true,
      numSctpStreams: { OS: 1024, MIS: 1024 },
      maxSctpMessageSize: 262144,
    });
    this.dataProducer = await this.dataTransport.produceData({
      label: 'volume',
      sctpStreamParameters: { streamId: 0, ordered: true },
    });
  }

  getDataProducerData() {
    return {
      id: this.dataProducer.id,
      sctpStreamParameters: this.dataProducer.sctpStreamParameters,
    };
  }

  log(data: any) {
    this.logger.log(data);
  }

  updateActivity() {
    this.isActive = true; // Could be extended to update a timestamp if needed
    this.lastActive = Date.now();
  }

  getRtpCapabilities(): types.RtpCapabilities {
    return this.router.rtpCapabilities; // Use router's actual RTP capabilities
  }

  getParticipantById(id: string): Participant | undefined {
    return this.participants.get(id);
  }

  getParticipants(): Map<string, Participant> {
    return this.participants;
  }

  addOwner(owner: Participant) {
    this.owner = owner;
    this.participants.set(owner.participantId, this.owner);
  }

  startLogging() {
    //log the room stats every 30 seconds
    this.timerId = setInterval(() => {
      // this.log(this.getRoomStats());
      console.log(this.participants.size);
    }, 30000);
  }

  async addParticipant(participant: Participant): Promise<void> {
    this.participants.set(participant.participantId, participant);
    this.updateActivity();
  }

  async removeParticipant(participantId: string): Promise<void> {
    const participant = this.participants.get(participantId);
    if (!participant) {
      return; // Participant not found, nothing to remove
    }
    await participant.cleanUp(); // Clean up participant's resources
    this.participants.delete(participantId);
    this.updateActivity();

    this.webrtcTransports.forEach((transport, id) => {
      if (transport.appData?.participantId === participantId) {
        transport.close();
        this.webrtcTransports.delete(id);
      }
    });
    this.producers.forEach((producer, id) => {
      if (producer.appData?.participantId === participantId) {
        producer.close();
        this.producers.delete(id);
      }
    });
    this.consumers.forEach((consumer, id) => {
      if (consumer.appData?.participantId === participantId) {
        consumer.close();
        this.consumers.delete(id);
      }
    });
  }

  async cloneParticipant(participant: Participant, new_participantId: string) {}

  async createTransportForParticipant(
    participant: Participant,
    type: 'producer' | 'consumer',
    options: types.WebRtcTransportOptions,
  ): Promise<types.WebRtcTransport> {
    const transport = await this.router.createWebRtcTransport({
      ...options,
      appData: { participantId: participant.participantId, type }, // Attach participant ID and type
    });
    this.webrtcTransports.set(transport.id, transport);

    if (type === 'producer') {
      participant.addProducerTransport(transport);
    } else {
      participant.addConsumerTransport(transport);
    }
    return transport;
  }

  getAllProducers(): Map<string, types.Producer<types.AppData>> {
    const allProducers = new Map<string, types.Producer<types.AppData>>();
    // todo : fix this
    // this.participants.forEach((participant) => {
    //   participant.producers.forEach((producer, id) =>
    //     allProducers.set(id, producer) 
    //   );
    // });
    return allProducers;
  }

  getAllConsumers(): Map<string, types.Consumer<types.AppData>> {
    const allConsumers = new Map<string, types.Consumer<types.AppData>>();
    this.participants.forEach((participant) => {
      participant.consumers.forEach((consumer, id) => allConsumers.set(id, consumer));
    });
    return allConsumers;
  }

  async addProducer(producer: types.Producer) {
    this.producers.set(producer.id, producer);
    if (producer.kind === 'audio') {
      await this.audioObserver.addProducer({ producerId: producer.id });
    }
  }
  async getProducer(producerId: string) {
    return this.producers.get(producerId);
  }

  async getProducers() {
    type MediasoupProducer = {
      producer: types.Producer;
      id: string;
      kind: 'audio' | 'video';
      rtpParameters: types.RtpParameters;
      producerClientId: string;
      isScreenSharer: boolean;
    };
    const participants = Array.from(this.participants.values());
    const initialProducers: MediasoupProducer[] = [];
    participants.forEach((participant) => {
      const audioProducer = participant.producers.audio;
      const videoProducer = participant.producers.video;
      if (audioProducer) {
        initialProducers.push({
          producer: audioProducer,
          id: audioProducer.id,
          kind: audioProducer.kind,
          rtpParameters: audioProducer.rtpParameters,
          producerClientId: participant.participantId,
          isScreenSharer: participant.isScreenSharer,
        });
      }
      if (videoProducer) {
        initialProducers.push({
          producer: videoProducer,
          id: videoProducer.id,
          kind: videoProducer.kind,
          rtpParameters: videoProducer.rtpParameters,
          producerClientId: participant.participantId,
          isScreenSharer: participant.isScreenSharer,
        });
      }
    });
    return initialProducers;
  }

  async addConsumer(consumer: types.Consumer) {
    this.consumers.set(consumer.id, consumer);
  }

  getConsumer(consumerId: string) {
    return this.consumers.get(consumerId);
  }

  getRoomStats(): RoomStats {
    return {
      participantCount: this.participants.size,
      transportCount: this.webrtcTransports.size,
      producerCount: this.getAllProducers().size,
      consumerCount: this.getAllConsumers().size,
      pipeTransportCount: this.pipeTransports.size,
      lastActive: this.lastActive,
    };
  }

  monitorHealth(): boolean {
    // Basic health check: room is active and has at least one participant or transport
    const hasActivity = this.participants.size > 0 || this.webrtcTransports.size > 0;
    const isRouterAlive = !this.router.closed;
    return this.isActive && hasActivity && isRouterAlive;
  }
  async trackIdleTime() {
    // if there is not activfity for 10 min close the room
    if (this.idleMinutes === this.roomIdleLimit) {
      await this.closeRoom();

      this.idleTimerId && clearInterval(this.idleTimerId);
      return;
    }
    this.idleTimerId = setInterval(() => {
      // if no one is in the room incrase teh idle minutes
      if (this.participants.size === 0) {
        this.idleMinutes++;
      }
      this.trackIdleTime();
    }, 1000 * 60);
  }
  async closeRoom(): Promise<void> {
    this.isActive = false;
    for (const participant of this.participants.values()) {
      await participant.cleanUp();
    }
    this.participants.clear();
    this.producers.forEach((producer) => producer.close());
    this.producers.clear();
    this.consumers.forEach((consumer) => consumer.close());
    this.consumers.clear();
    this.webrtcTransports.forEach((transport) => transport.close());
    this.webrtcTransports.clear();
    this.audioObserver.close();
    this.dataProducer.close();
    this.dataTransport.close();
    this.router.close();
    this.pipeTransports.forEach((transport) => transport.close());
    this.timerId && clearInterval(this.timerId);
    this.idleTimerId && clearInterval(this.idleTimerId);
  }

  async createPipeTransport(options: types.PipeTransportOptions): Promise<types.PipeTransport> {
    const pipeTransport = await this.router.createPipeTransport(options);
    this.pipeTransports.set(pipeTransport.id, pipeTransport);
    return pipeTransport;
  }

  async pipeProducerToRouter(producerId: string, targetRouter: types.Router): Promise<void> {
    //todo : check this.
    // if (!this.router.canConsume(producerId, targetRouter.rtpCapabilities)) {
    //   throw new Error("Target router cannot consume this producer");
    // }
    await this.router.pipeToRouter({
      producerId,
      router: targetRouter,
    });
  }

  async removePipeTransport(pipeTransportId: string): Promise<void> {
    const pipeTransport = this.pipeTransports.get(pipeTransportId);
    if (pipeTransport) {
      pipeTransport.close();
      this.pipeTransports.delete(pipeTransportId);
    }
  }

  stopScreenSharing(participant: Participant) {
    participant.stopScreenSharing();
    this.participants.delete(participant.participantId);
    this.updateActivity();
    this.producers.forEach((producer, id) => {
      if (producer.appData?.participantId === participant.participantId) {
        producer.close();
        this.producers.delete(id);
      }
    });
    this.consumers.forEach((consumer, id) => {
      if (consumer.appData?.participantId === participant.participantId) {
        consumer.close();
        this.consumers.delete(id);
      }
    });
  }
}

// if the room is idle for or if doesn't have any users for 10 min close the room. and make it inactive
// check the room for every minute if there are no users for 1o consucutive minutes close the room
