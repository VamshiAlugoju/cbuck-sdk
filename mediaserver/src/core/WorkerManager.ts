import { types as mediasoupTypes, createWorker as createMediaSoupWorker } from 'mediasoup';
import MediaWorker from './Worker';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { IWorkerManager } from 'src/interfaces/WorkerManager.interface';
import { Logger } from '@nestjs/common';
class WorkerManager implements IWorkerManager {
  private static instance: WorkerManager;
  private workers: Map<string, MediaWorker> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly MAX_WORKERS = os.cpus().length * 2;

  private constructor() {
    // this.startHealthMonitoring();
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  private logger = new Logger('WorkerManager');
  private log(message: string): void {
    this.logger.log(message);
  }

  // this doesn't handle the case: All workers are busy
  async createWorker(): Promise<MediaWorker> {
    try {
      if (this.workers.size >= this.MAX_WORKERS) {
        return await this.getLeastBusyWorker();
      }

      const worker = await createMediaSoupWorker({});
      const workerId = this.getWorkerId();
      const mediaWorker = new MediaWorker(worker, workerId);

      worker.on('died', () => {
        this.log(`Worker ${workerId} died unexpectedly`);
        this.removeWorker(workerId);
        this.createWorker().catch((err) => this.log(`Failed to create replacement worker: ${err}`));
      });

      this.workers.set(workerId, mediaWorker);
      return mediaWorker;
    } catch (err) {
      return Promise.reject(new Error(`Worker creation failed: ${err}`));
    }
  }

  getWorkerId(): string {
    return uuidv4();
  }

  async getWorker(): Promise<MediaWorker> {
    if (this.workers.size === 0) {
      return this.createWorker();
    }
    return await this.getLeastBusyWorker();
  }

  getWorkerById(workerId: string) {
    return this.workers.get(workerId);
  }

  private async getLeastBusyWorker(): Promise<MediaWorker> {
    let bestWorker: MediaWorker | null = null;
    let lowestCpuUsage = Number.MAX_VALUE;
    const coreUsages = this.getCpuCoreUsages();

    for (const worker of this.workers.values()) {
      if (!(await this.isWorkerHealthy(worker))) {
        continue;
      }
      const coreUsage = coreUsages.pop() ?? 100;
      if (coreUsage < lowestCpuUsage && coreUsage < 80) {
        lowestCpuUsage = coreUsage;
        bestWorker = worker;
      }
    }

    if (!bestWorker && this.workers.size < this.MAX_WORKERS) {
      const newWorker = await this.createWorker();
      return newWorker;
    }

    return bestWorker ?? Array.from(this.workers.values())[0];
  }

  private getCpuCoreUsages(): number[] {
    return os
      .cpus()
      .map((cpu) => {
        const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
        return ((total - cpu.times.idle) / total) * 100;
      })
      .sort((a, b) => a - b);
  }

  public removeWorker(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      try {
        worker.worker.close();
      } catch (error) {}
      this.workers.delete(workerId);
      this.log(`Worker ${workerId} removed. Active workers: ${this.workers.size}`);
    }
  }

  public cleanupIdleWorkers(idleThresholdMs: number = 600000): void {
    const now = Date.now();
    for (const [id, worker] of this.workers.entries()) {
      if (worker.getLastActivityTime() && now - worker.getLastActivityTime()! > idleThresholdMs) {
        this.log(
          `Removing idle worker ${id} - no activity for ${
            (now - worker.getLastActivityTime()!) / 1000
          }s`,
        );
        this.removeWorker(id);
      }
    }
  }

  private async isWorkerHealthy(worker: MediaWorker): Promise<boolean> {
    try {
      const usage = await worker.worker.getResourceUsage();
      return usage !== null && worker.isActive();
    } catch (error) {
      this.log(`Health check failed for worker ${worker.workerId}: ${error}`);
      return false;
    }
  }

  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      this.log(`Running health check on ${this.workers.size} workers`);

      for (const [id, worker] of this.workers.entries()) {
        if (!(await this.isWorkerHealthy(worker))) {
          this.log(`Worker ${id} failed health check, removing...`);
          this.removeWorker(id);
        }
      }

      this.cleanupIdleWorkers();
    }, 60 * 1000);
  }

  public stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  public async shutdown(): Promise<void> {
    this.stopHealthMonitoring();
    await Promise.all(
      Array.from(this.workers.entries()).map(async ([id, worker]) => {
        try {
          worker.worker.close();
          this.workers.delete(id);
          this.log(`Worker ${id} shut down successfully`);
        } catch (error) {}
      }),
    );
    this.log(`WorkerManager shutdown complete. All workers terminated.`);
  }
}

const WorkerManagerInstance = WorkerManager.getInstance();
export default WorkerManagerInstance;
