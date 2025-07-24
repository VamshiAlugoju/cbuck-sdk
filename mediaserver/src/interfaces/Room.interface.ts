import { types } from 'mediasoup';
import Participant from 'src/core/Participant';

export interface RoomStats {
  participantCount: number;
  transportCount: number;
  producerCount: number;
  consumerCount: number;
  pipeTransportCount: number;
  lastActive: number; // Timestamp
}

export interface IRoom {
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
  logEvent: (event: string, data?: any) => void; // Log room events
  monitorHealth: () => boolean; // Check room health

  // optional for now
  pipeTransports: Map<string, types.PipeTransport<types.AppData>>;
  createPipeTransport: (options: types.PipeTransportOptions) => Promise<types.PipeTransport>;
  pipeProducerToRouter: (producerId: string, targetRouter: types.Router) => Promise<void>;
  removePipeTransport: (pipeTransportId: string) => Promise<void>;
}
