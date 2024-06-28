import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.js';

export interface IReview extends Document {
  submitter: IUser['_id'];
  responses: any;
  submittedAt: Date;
}

const reviewSchema = new Schema({
  submitter: { type: Schema.Types.ObjectId, ref: 'User' },
  responses: { type: Schema.Types.Mixed },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>('Review', reviewSchema);