import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  microsoftId: string;
  displayName: string;
  email: string;
  id: string;
  college: string;
  year: string;
  course: string;
  isProfileComplete: boolean;
}

const userSchema = new Schema({
  microsoftId: { type: String, required: true, unique: true },
  displayName: String,
  email: { type: String, required: true, unique: true },
  college: { type: String, required: false },
  year: { type: String, required: false },
  course: { type: String, required: false },
  isProfileComplete: { type: Boolean, default: false },
});

export default mongoose.model<IUser>('User', userSchema);
