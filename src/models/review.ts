import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.js';

export interface IReview extends Document {
  submitter: IUser['_id'];
  subject: string;
  paper: string;
  tutor: string;
  knowledge: string;
  clarity: string;
  additionalComments: string;
  submittedAt: Date;
}

const reviewSchema = new Schema({
  submitter: { type: Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  paper: String,
  tutor: String,
  knowledge: String,
  clarity: String,
  additionalComments: String,
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>('Review', reviewSchema);