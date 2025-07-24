import { Module } from '@nestjs/common';
import { StaticService } from './static.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StaticSchema } from './static.schema';
import { StaticController } from './static.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Static', schema: StaticSchema }]),
  ],
  providers: [StaticService],
  controllers: [StaticController],
  exports: [StaticService],
})
export class StaticModule {}
