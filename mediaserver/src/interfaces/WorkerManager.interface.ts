import MediaWorker from 'src/core/Worker';

export interface IWorkerManager {
  createWorker(): Promise<MediaWorker>;
  getWorker(): Promise<MediaWorker>;
  removeWorker(workerId: string): void;
  cleanupIdleWorkers(idleThresholdMs?: number): void;
  stopHealthMonitoring(): void;
  shutdown(): Promise<void>;
  getWorkerById(workerId: string): MediaWorker | undefined;
}
