import mongoose from 'mongoose';
import { IUserDB } from '../types/db';

export default mongoose.model<IUserDB>(
  'User',
  new mongoose.Schema({
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstname: {
      type: String,
      required: false,
    },
    lastname: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },

    passwordTemp: {
      type: Boolean,
    },
    credits: {
      type: Number,
    },
  })
);
