import * as dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebSocketModule } from './socket/ws.module';
import { CallsModule } from './calls/calls.module';
import { MongooseModule } from '@nestjs/mongoose';
import { env } from './common/env';

console.log(env.mongodb_uri);

import { StaticModule } from './static/static.module';

@Module({
  imports: [
    CallsModule,
    WebSocketModule,
    MongooseModule.forRoot(env.mongodb_uri),
    StaticModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
