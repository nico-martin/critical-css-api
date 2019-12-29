import mongoose from 'mongoose';

export default mongoose.model(
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
