import { Logger } from '@nestjs/common';
import { createWorker, types } from 'mediasoup';
import { IMediaWorker } from 'src/interfaces/Worker.interface';

export default class MediaWorker implements IMediaWorker {
  public workerId: string;
  public worker: types.Worker;
  private lastActivityTime: number;
  private active: boolean = true;
  private rooms: Set<string> = new Set(); // Track rooms using this worker

  constructor(worker: types.Worker, workerId: string) {
    this.workerId = workerId;
    this.worker = worker;
    this.lastActivityTime = Date.now();
    this.initializeEvents();
  }

  private logger = new Logger('Worker');
  log(data: any) {
    this.logger.log(`[Worker ${this.workerId}] ${data} `);
  }

  async getStats() {
    try {
      const data = await this.worker.getResourceUsage();
      this.log('Resource usage: ' + JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      this.log(`Error getting stats: ${error}`);
      this.active = false;
      return null;
    }
  }

  initializeEvents() {
    this.worker.on('died', (error) => {
      this.active = false;
      this.log(`Worker died unexpectedly: ${error}`);
      // Emit custom event that WorkerManager can listen to
      //   this.worker.emit("worker:died", this.workerId);
    });

    this.worker.on('@success', () => {
      this.log(`Worker up and running`);
    });
  }

  // Track activity for idle detection
  updateActivity() {
    this.lastActivityTime = Date.now();
  }

  getLastActivityTime(): number {
    return this.lastActivityTime;
  }

  // Check if worker is still operational
  isActive(): boolean {
    return this.active;
  }

  // Room tracking methods
  addRoom(roomId: string) {
    this.rooms.add(roomId);
    this.updateActivity();
  }

  removeRoom(roomId: string) {
    this.rooms.delete(roomId);
    this.updateActivity();
  }

  // Get the number of rooms this worker is handling
  getRoomCount(): number {
    return this.rooms.size;
  }

  // Check if this worker has capacity for a new room
  hasCapacity(maxRoomsPerWorker: number = 15): boolean {
    return this.rooms.size < maxRoomsPerWorker;
  }

  // Clean shutdown
  async close() {
    try {
      this.log(`Closing worker with ${this.rooms.size} active rooms`);
      await this.worker.close();
      this.active = false;
      return true;
    } catch (error) {
      this.log(`Error closing worker: ${error}`);
      return false;
    }
  }
}
