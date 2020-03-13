import mongoose from 'mongoose';
import { IRequestDB } from '../types/db';

export default mongoose.model<IRequestDB>(
  'Requests',
  new mongoose.Schema({
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    file: {
      type: String,
      required: true,
      unique: true,
    },
    generated: {
      type: Date,
      required: true,
    },
    url: {
      type: String,
    },
    sizes: {
      type: String,
    },
  })
);
