import mongoose, { Document } from 'mongoose';

export interface IProject {
  _id?: string;
  id?: number;
  url: string;
  user?: mongoose.Schema.Types.ObjectId;
  key?: string;
}

export interface IProjectDB extends Document {
  id: number;
  url: string;
  user: mongoose.Schema.Types.ObjectId;
  key: string;
}

export interface IRequest {
  project: mongoose.Schema.Types.ObjectId;
  file: string;
  generated: Date;
  url: string;
  sizes: string;
}

export interface IRequestsDB extends Document {
  project: mongoose.Schema.Types.ObjectId;
  file: string;
  generated: Date;
  url: string;
  sizes: string;
}

export interface IUser {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  password?: string;
  passwordTemp?: boolean;
  credits?: number;
}

export interface IUserDB extends Document {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  passwordTemp: boolean;
  credits: number;
}
