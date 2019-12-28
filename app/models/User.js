import mongoose from 'mongoose';

export default mongoose.model(
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
  })
);
