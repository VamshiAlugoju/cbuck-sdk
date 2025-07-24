import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StaticDocument = HydratedDocument<Static>;

@Schema({ timestamps: true, collection: 'Static' })
export class Static {
  @Prop({ required: true })
  apiURL: string;

  @Prop({ required: true })
  webURL: string;
}

export const StaticSchema = SchemaFactory.createForClass(Static);
