import { forwardRef, Module } from '@nestjs/common';
import { WsGateway } from './gateways/socket.gateway';

import { SocketService } from './services/socket.service';
import { SignalingGateway } from 'src/calls/gateways/signaling.gateway';
import { MediaGateway } from 'src/calls/gateways/media.gateway';

import { CallsModule } from 'src/calls/calls.module';

// import MediaServerClient from 'src/calls/sxervices/implementations/MediaServerClient';

import MediaService from 'src/calls/services/implementations/media.service';
import { Services } from 'src/common/constants/interfaces.constants';
import { ChatsGateway } from 'src/chats/gateways/chats.gateway';

@Module({
  imports: [forwardRef(() => CallsModule)],
  providers: [
    WsGateway,

    SignalingGateway,
    ChatsGateway,
    {
      provide: Services.SocketService,
      useClass: SocketService,
    },

    // MediaServerClient,
    MediaGateway,
    MediaService,
  ],
  exports: [WsGateway, Services.SocketService],
})
export class WebSocketModule {}
