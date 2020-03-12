import mongoose from 'mongoose';
import { IProjectDB } from '../types/db';

export default mongoose.model<IProjectDB>(
  'Project',
  new mongoose.Schema({
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    key: {
      type: String,
    },
  })
);
