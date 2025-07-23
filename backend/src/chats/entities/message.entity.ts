import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Models } from 'src/common/constants/models';




@Schema({ timestamps: true, collection: Models.messages })
export class Message {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  text: string;
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);