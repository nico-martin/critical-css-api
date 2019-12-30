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
  bufferMaxEntries: 0 // If not connected, return errors immediately rather than waiting for reconnect
};

const promiseRetryOptions = {
  retries: options.reconnectTries,
  factor: 2,
  minTimeout: options.reconnectInterval,
  maxTimeout: 5000
};

export const connectDB = () => {
  return promiseRetry((retry, number) => {
    console.log(`Try MongoDB Connect to ${process.env.DATABASE_URL} - No. ${number}`);
    return mongoose.connect(process.env.DATABASE_URL, options).catch(retry)
  }, promiseRetryOptions)
};

export default { User, Project, Requests };
