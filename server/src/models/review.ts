import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { IUser } from './user.js';

export interface IReview extends Document {
  submitter: IUser['_id'];
  responses: { [key: string]: string };
  submittedAt: Date;
  college: string;
}

const reviewSchema = new Schema({
  submitter: { type: Schema.Types.ObjectId, ref: 'User' },
  responses: { type: Schema.Types.Mixed },
  submittedAt: { type: Date, default: Date.now },
  college: { type: String }
});

export default mongoose.model<IReview>('Review', reviewSchema);