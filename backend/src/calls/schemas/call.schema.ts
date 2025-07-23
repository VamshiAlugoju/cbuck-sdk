// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import {
//   Document,
//   HydratedDocument,
//   Schema as MongooseSchema,
//   Types,
// } from 'mongoose';
// import { CallType } from '../types/calls.types';
// import { User } from 'src/user.module/schemas/user.schema';
// import { Models } from 'src/common/constants/models';

// @Schema({ timestamps: true, collection: Models.Calls })
// export class Call {
//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
//   initiatorId: Types.ObjectId;

//   @Prop({ type: String, enum: Object.values(CallType), required: true })
//   callType: CallType;

//   @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: User.name }] })
//   invitedUserIds: Types.ObjectId[];

//   @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: User.name }] })
//   participants: Types.ObjectId[];

//   @Prop({ type: Date })
//   startedAt?: Date;

//   @Prop({ type: Date })
//   endedAt?: Date;

//   @Prop({ type: Date, default: null })
//   scheduledAt?: Date;

//   @Prop({ type: Object, default: {} })
//   metaData?: Record<string, any>;

//   @Prop({ type: Number })
//   duration?: number; // Duration in minutes
// }

// export type CallDocument = HydratedDocument<Call>;
// export const CallSchema = SchemaFactory.createForClass(Call);
