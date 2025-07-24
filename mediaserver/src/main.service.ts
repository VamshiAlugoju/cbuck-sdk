import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

type instanceDetails = {
  instaceId: string;
};

@Injectable()
export class AppService {
  private instanceDetails: instanceDetails;
  constructor() {
    const serverId = uuid();
    this.instanceDetails = {
      instaceId: serverId,
    };
  }

  getInstanceDetails() {
    return this.instanceDetails;
  }
}
