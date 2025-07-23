import { uuid } from 'src/common/lib';

interface IParticipant {
  participantId: string;
  userId: string;
  roomId: string;
  joinedAt: number;
  isConnected: boolean;
  client: Client;
  socketId: string;
}

type Client = {
  id: string;
  name: string;
  image?: string | null;
  username: string;
  bio?: string;
};

class Participant implements IParticipant {
  participantId: string;
  userId: string;
  roomId: string;
  joinedAt: number;
  isConnected: boolean;
  client: Client;
  socketId: string;
  isSharingScreen: boolean = false;

  constructor(
    userId: string,
    roomId: string,
    socketId: string,
    isSharingScreen?: boolean,
  ) {
    this.participantId = uuid();
    this.userId = userId;
    this.roomId = roomId;
    this.joinedAt = Date.now();
    this.socketId = socketId;
    this.isConnected = true;
    this.isSharingScreen = isSharingScreen || false;
  }

  disconnect(): void {
    this.isConnected = false;
  }

  reconnect(): void {
    this.isConnected = true;
  }
  addClientDetails(user: any) {
    const { name, image, username, bio, id } = user;
    this.client = { id, name, image, username, bio };
  }

  setSocketId(socketId: string) {
    this.socketId = socketId;
  }
}

export default Participant;
