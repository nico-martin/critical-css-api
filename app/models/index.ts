import mongoose from 'mongoose';
import promiseRetry from 'promise-retry';
import User from './User';
import Project from './Project';
import Requests from './Requests';

const options = {
  useNewUrlParser: true,
  reconnectTries: 60,
  reconnectInterval: 1000,
  poolSize: 10,
  bufferMaxEntries: 0,
  useUnifiedTopology: true,
};

const promiseRetryOptions = {
  retries: options.reconnectTries,
  factor: 2,
  minTimeout: options.reconnectInterval,
  maxTimeout: 5000,
};

export const connectDB = () =>
  promiseRetry(
    retry =>
      mongoose.connect(String(process.env.DATABASE_URL), options).catch(retry),
    promiseRetryOptions
  );

export default { User, Project, Requests };
