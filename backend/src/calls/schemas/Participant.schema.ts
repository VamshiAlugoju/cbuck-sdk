// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Schema as MongooseSchema } from 'mongoose';
// import { User } from 'src/user.module/schemas/user.schema';
// import { Call } from './call.schema';
// import { Models } from 'src/common/constants/models';

// @Schema({ timestamps: true, collection: Models.Participants })
// export class Participant {
//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
//   userId: string;
//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: Call.name, required: true })
//   callId: string;
//   @Prop({ type: MongooseSchema.Types.Date, default: null })
//   joinedAt: Date;
//   @Prop({ type: MongooseSchema.Types.Date, default: null })
//   leftAt: Date;
//   @Prop({ type: Boolean, default: false })
//   videoEnabled: boolean;
//   @Prop({ type: Boolean, default: false })
//   audioEnabled: boolean;
//   @Prop({ type: Boolean, default: false })
//   screenShareEnabled: boolean;
//   @Prop({ type: Object })
//   connectionDetails: object;
// }

// export interface IParticipant extends Document, Participant {}

// export const ParticipantSchema = SchemaFactory.createForClass(Participant);
