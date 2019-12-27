import mongoose from 'mongoose';

import User from './User';
import Project from './Project';

export const connectDB = () => {
  return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
};

export default { User, Project };
