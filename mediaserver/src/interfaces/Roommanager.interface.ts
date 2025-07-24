import MediaWorker from 'src/core/Worker';
import Room from 'src/core/Room';

export interface IRoomManager {
  createRoom(owenerId: string, callId: string, roomId: string): Promise<Room>;
  getWorker(): Promise<MediaWorker>;
  joinRoom(): Promise<Room>;
  getRooms(): Room[];
  getRoomById(roomId: string): Promise<Room | undefined>;
  closeRoom(roomId: string): Promise<void>;
}
