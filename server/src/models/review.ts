import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { IUser } from './user.js';

export interface IReview extends Document {
  _id: ObjectId;
  submitter: IUser['_id'];
  responses: Record<string, string>;
  submittedAt: Date;
  college: string;
}

export interface IProcessedReview {
  _id: string;
  responses: Record<string, string>;
  submittedAt: Date;
  college: string;
  isOld: boolean;
}

const reviewSchema = new Schema({
  submitter: { type: Schema.Types.ObjectId, ref: 'User' },
  responses: { type: Schema.Types.Mixed },
  submittedAt: { type: Date, default: Date.now },
  college: { type: String },
});

export default mongoose.model<IReview>('Review', reviewSchema);
