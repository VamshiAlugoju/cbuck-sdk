// src/common/base-logger.ts
import { Logger } from '@nestjs/common';

export abstract class BaseLogger {
  protected readonly logger: Logger;
  protected readonly SHOW_LOGS: boolean = true;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  protected log(message: any, force = false): void {
    if (!this.SHOW_LOGS && !force) return;
    this.logger.log(message);
  }

  protected logError(message: string, force = false): void {
    if (!this.SHOW_LOGS && !force) return;
    this.logger.error(message);
  }
}
