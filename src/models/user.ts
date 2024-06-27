import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  microsoftId: string;
  displayName: string;
  email: string;
  id: string;
}

const userSchema = new Schema({
  microsoftId: { type: String, required: true, unique: true },
  displayName: String,
  email: { type: String, required: true, unique: true },
});

export default mongoose.model<IUser>('User', userSchema);