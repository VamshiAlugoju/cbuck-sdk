import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class CleanupService implements OnApplicationShutdown {
  constructor() {}
  private logger = new Logger('CleanupService');

  async onApplicationShutdown(signal?: string) {
    console.log(`onApplicationShutdown triggered with signal: ${signal}`);
    await this.cleanup(signal);
  }

  async cleanup(signal?: string) {}
}
