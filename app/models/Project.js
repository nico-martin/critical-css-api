import mongoose from 'mongoose';

export default mongoose.model(
  'Project',
  new mongoose.Schema({
    id: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  })
);
