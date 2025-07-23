// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// import { Models } from 'src/common/constants/models';
// import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
// import { User } from 'src/user.module/schemas/user.schema';
// import { Call } from './call.schema';
// @Schema({ timestamps: true, collection: Models.Feedbacks })
// export class Feedback {
//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: Call.name, required: true })
//   callId: Types.ObjectId;

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
//   userId: Types.ObjectId;

//   @Prop({ type: Number, required: true, min: 1, max: 5 })
//   rating: number;

//   @Prop({ type: Boolean, default: false })
//   isInitiator: boolean;

//   @Prop({ type: String })
//   comment?: string;
// }
// export type FeedbackDocument = HydratedDocument<Feedback>;
// export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
