import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebSocketModule } from './socket/ws.module';
import { CallsModule } from './calls/calls.module';
import { MongooseModule } from '@nestjs/mongoose';
import { env } from './common/env';

@Module({
  imports: [CallsModule, WebSocketModule, MongooseModule.forRoot(env.mongodb_uri)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
