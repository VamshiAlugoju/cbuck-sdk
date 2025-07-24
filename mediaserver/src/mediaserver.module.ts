import { Module } from '@nestjs/common';
import { AppController } from './mediaserver.controller';
import { MediaService } from './mediaserver.service';
import { AppService } from './main.service';
import { RoomManager } from './core/RoomManager';
import { TransportService } from './transport.service';
import { TranslationController } from './translation.controller';

@Module({
  imports: [],
  controllers: [AppController, TranslationController],
  providers: [MediaService, AppService, RoomManager, TransportService],
})
export class MediaserverModule { }
