import mongoose, { Document } from 'mongoose';

export interface IProject {
  ID?: number;
  url: string;
  user?: mongoose.Schema.Types.ObjectId;
  key?: string;
}

export interface IProjectDB extends Document, IProject {}

export interface IRequest {
  project?: mongoose.Schema.Types.ObjectId;
  file: string;
  generated: Date;
  url: string;
  sizes: string;
}

export interface IRequestDB extends Document, IRequest {}

export interface IUser {
  ID: number;
  email: string;
  firstname: string;
  lastname: string;
  password?: string;
  passwordTemp?: boolean;
  credits?: number;
}

export interface IUserDB extends Document, IUser {}
