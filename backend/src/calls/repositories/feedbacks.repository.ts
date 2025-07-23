// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';

// import { Models } from 'src/common/constants/models';
// import { Feedback, FeedbackDocument } from '../schemas/feedback.schema';

// @Injectable()
// export class FeedbacksRepository {
//   constructor(
//     @InjectModel(Models.Feedbacks)
//     private readonly feedbackModel: Model<FeedbackDocument>,
//   ) {}

//   // ✅ Create a new feedback record
//   async createFeedback(
//     feedbackData: Partial<Feedback>,
//   ): Promise<FeedbackDocument> {
//     const feedback = new this.feedbackModel(feedbackData);
//     return feedback.save();
//   }
// }
