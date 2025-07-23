import { forwardRef, Module } from '@nestjs/common';

import MediaServerClient from './services/implementations/MediaServerClient';
import CallsService from './services/implementations/calls.service';

import RoomManager from './services/implementations/RoomManager';
import CallService from './services/implementations/calls.service';
import { CallsRepository } from './repositories/calls.repository';
import { Models } from 'src/common/constants/models';
import { WsGateway } from 'src/socket/gateways/socket.gateway';
import { WebSocketModule } from 'src/socket/ws.module';
import { CallsController } from './calls.controller';

// import { CallProcessor } from './calls.process';

import { Queues } from 'src/common/constants/que.constant';

@Module({
  providers: [
    CallService,
    MediaServerClient,
    RoomManager,
    CallsRepository,
    // CallProcessor,
  ],
  imports: [forwardRef(() => WebSocketModule)],
  exports: [CallService, MediaServerClient, RoomManager],
  controllers: [CallsController],
})
export class CallsModule {}
