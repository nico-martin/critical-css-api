import mongoose from 'mongoose';

export default mongoose.model(
  'User',
  new mongoose.Schema({
    id: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: false,
    },
    lastname: {
      type: String,
      required: false,
    },
    accessToken: {
      type: String,
      required: false,
    },
  })
);
