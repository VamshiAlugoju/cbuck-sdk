import { types } from 'mediasoup';
export interface IMediaWorker {
  workerId: string;
  worker: types.Worker;
  getStats(): Promise<types.WorkerResourceUsage | null>;
  updateActivity(): void;
  getLastActivityTime(): number;
  isActive(): boolean;
  addRoom(roomId: string): void;
  removeRoom(roomId: string): void;
  getRoomCount(): number;
  hasCapacity(maxRoomsPerWorker?: number): boolean;
  close(): Promise<boolean>;
}
