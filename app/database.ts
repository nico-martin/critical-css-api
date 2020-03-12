import models from './models/index';
import { IProject, IUser, IRequest } from './types/db';
import {
  normalizeUser,
  getNewUserId,
  getNewProjectId,
  verifyBaseUrl,
} from './helpers';
import { generateToken } from './auth';
import sha1 from 'sha1';
import { randomBytes } from 'crypto';
import { makeRandomString } from './helpers';

export const User = {
  add: async (userObject: IUser): Promise<IUser | false> => {
    if (!userObject.email) {
      return false;
    }

    let user = await models.User.findOne({ email: userObject.email });
    if (user) {
      return false;
    }

    const newUserId = await getNewUserId();
    user = await models.User.create({
      email: userObject.email,
      id: newUserId,
      credits: 0,
    });

    return await User.update(user.id, userObject);
  },
  update: async (userID: number, userObject: IUser): Promise<IUser | false> => {
    //userObject = normalizeUser(userObject);
    let user = await models.User.findOne({ id: userID });
    if (!user) {
      return false;
    }

    if ('email' in userObject) {
      const emailUser = await models.User.findOne({ email: userObject.email });
      if (emailUser && emailUser.id !== user.id) {
        return false;
      }
    }

    await models.User.updateOne({ _id: user._id }, userObject);
    return await User.get(user.id);
  },
  updatePassword: async (
    userID: number,
    password: string = ''
  ): Promise<string | false> => {
    let user = await models.User.findOne({ id: userID });
    if (!user) {
      return false;
    }
    const passwordTemp = password === '';
    password = password === '' ? makeRandomString(6) : password;
    const passwordHash = sha1(password);
    await models.User.updateOne(
      { _id: user._id },
      {
        password: passwordHash,
        passwordTemp,
      }
    );
    return password;
  },
  delete: async (id: number): Promise<boolean> => {
    const deleted = await models.User.deleteOne({ id });
    return deleted.deletedCount === 1;
  },
  get: async (id: number): Promise<IUser | false> => {
    const user = await models.User.findOne({ id });
    //const projects = await models.Project.find({ user: user ? user._id : 0 });
    if (user) {
      return {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        credits: user.credits,
        passwordTemp: user.passwordTemp,
      };
    }
    return false;
  },
  getProjects: async (id: number): Promise<IProject[] | false> => {
    const user = await models.User.findOne({ id });
    if (!user) {
      return false;
    }
    const projects = await models.Project.find({ user: user._id });
    const projectPromises = projects.map(async project => {
      const requests = await Requests.getByProject(project._id);
      return {
        id: project.id,
        url: project.url,
        key: project.key,
        requests,
      };
    });
    return await Promise.all(projectPromises);
  },
  getByEmail: async (email: string): Promise<IUser | false> => {
    const user = await models.User.findOne({ email });
    if (!user) {
      return false;
    }
    return await User.get(user.id);
  },
  getAll: async (): Promise<Array<IUser>> => {
    const users = await models.User.find({});
    return users.map(user => {
      return {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      };
    });
  },
  verify: async (
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<string | false> => {
    const user = await models.User.findOne({
      email,
      password: sha1(password),
    });
    if (user) {
      return generateToken(user.id, remember ? 60 * 60 * 24 * 30 : 60 * 60 * 4);
    }
    return false;
  },
  creditsUpdate: async (
    userID: number,
    credits: number
  ): Promise<number | false> => {
    const oldCredits = await User.creditsGet(userID);
    if (oldCredits === false) {
      return false;
    }
    await models.User.updateOne(
      { id: userID },
      { credits: oldCredits + credits }
    );
    return await User.creditsGet(userID);
  },
  creditsGet: async (userID: number): Promise<number | false> => {
    let user = await models.User.findOne({ id: userID });
    if (!user) {
      return false;
    }

    return user.credits ? user.credits : 0;
  },
};

export const Project = {
  add: async (userID: number, url: string): Promise<IProject | false> => {
    const user = await models.User.findOne({
      id: userID,
    });
    if (!user) {
      return false;
    }
    url = verifyBaseUrl(url);
    let project = await models.Project.findOne({ url, user: user._id });
    if (!project) {
      const newId = await getNewProjectId();
      project = await models.Project.create({
        url,
        id: newId,
        user: user._id,
      });
    }

    await models.Project.updateOne(
      { _id: project._id },
      {
        key: randomBytes(35).toString('hex'),
      }
    );
    const updtedProject = await models.Project.findOne({ _id: project._id });

    return updtedProject
      ? {
          id: updtedProject.id,
          url: updtedProject.url,
          key: updtedProject.key,
        }
      : false;
  },
  delete: async (id: number): Promise<boolean> => {
    const deleted = await models.Project.deleteOne({ id });
    return deleted.deletedCount === 1;
  },
  getByID: async (id: number): Promise<IProject | false> => {
    const project = await models.Project.findOne({ id });
    if (!project) {
      return false;
    }
    const user = await models.User.findOne({ _id: project.user });
    return {
      _id: project._id,
      url: project.url,
      user: user.id,
    };
  },
  getByApiKey: async (key: string): Promise<IProject | false> => {
    const project = await models.Project.findOne({ key });
    if (!project) {
      return false;
    }
    return await Project.getByID(project.id);
  },
};

export const Requests = {
  add: async (
    projectID: number,
    file: string,
    url: string,
    sizes: Array<{ width: number; height: number }>,
    date: Date = new Date()
  ) => {
    const sizesStrings = sizes.reduce(
      (acc, size) => [size.width + 'x' + size.height, ...acc],
      []
    );

    return await models.Requests.create({
      project: projectID,
      file,
      generated: date,
      url,
      sizes: sizesStrings.join(', '),
    });
  },
  getByProject: async (projectID: string): Promise<IRequest> => {
    const requests = await models.Requests.find({ project: projectID });
    return requests.map((request: IRequest) => {
      return {
        file: request.file,
        generated: request.generated,
        sizes: request.sizes,
        url: request.url,
      };
    });
  },
};
