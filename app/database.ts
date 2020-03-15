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
      ID: newUserId,
      credits: 0,
    });

    return await User.update(user.ID, userObject);
  },
  update: async (userID: number, userObject: IUser): Promise<IUser | false> => {
    //userObject = normalizeUser(userObject);
    let user = await models.User.findOne({ ID: userID });
    if (!user) {
      return false;
    }

    if ('email' in userObject) {
      const emailUser = await models.User.findOne({ email: userObject.email });
      if (emailUser && emailUser.ID !== user.ID) {
        return false;
      }
    }

    await models.User.updateOne({ _id: user._id }, userObject);
    return await User.get(user.ID);
  },
  updatePassword: async (
    userID: number,
    password: string = ''
  ): Promise<string | false> => {
    let user = await models.User.findOne({ ID: userID });
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
  delete: async (ID: number): Promise<boolean> => {
    const deleted = await models.User.deleteOne({ ID });
    return deleted.deletedCount === 1;
  },
  get: async (ID: number): Promise<IUser | false> => {
    const user = await models.User.findOne({ ID });
    //const projects = await models.Project.find({ user: user ? user._id : 0 });
    if (user) {
      return {
        ID: user.ID,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        credits: user.credits,
        passwordTemp: user.passwordTemp,
      };
    }
    return false;
  },
  getProjects: async (ID: number): Promise<IProject[] | false> => {
    const user = await models.User.findOne({ ID });
    if (!user) {
      return false;
    }
    const projects = await models.Project.find({ user: user._id });
    const projectPromises = projects.map(async project => {
      const requests = await Requests.getByProject(Object(project).ID);
      return {
        ID: project.ID,
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
    return await User.get(user.ID);
  },
  getAll: async (): Promise<Array<IUser>> => {
    const users = await models.User.find({});
    return users.map(user => {
      return {
        ID: user.ID,
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
      return generateToken(user.ID, remember ? 60 * 60 * 24 * 30 : 60 * 60 * 4);
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
      { ID: userID },
      { credits: oldCredits + credits }
    );
    return await User.creditsGet(userID);
  },
  creditsGet: async (userID: number): Promise<number | false> => {
    let user = await models.User.findOne({ ID: userID });
    if (!user) {
      return false;
    }

    return user.credits ? user.credits : 0;
  },
};

export const Project = {
  add: async (userID: number, url: string): Promise<IProject | false> => {
    const user = await models.User.findOne({
      ID: userID,
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
        ID: newId,
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
          ID: updtedProject.ID,
          url: updtedProject.url,
          key: updtedProject.key,
        }
      : false;
  },
  delete: async (ID: number): Promise<boolean> => {
    const deleted = await models.Project.deleteOne({ ID });
    return deleted.deletedCount === 1;
  },
  getByID: async (ID: number): Promise<IProject | false> => {
    const project = await models.Project.findOne({ ID });
    if (!project) {
      return false;
    }
    const user = await models.User.findOne({ _id: Object(project).user });
    return {
      ID: Object(project).ID,
      url: Object(project).url,
      user: Object(user).ID,
    };
  },
  getByApiKey: async (key: string): Promise<IProject | false> => {
    const project = await models.Project.findOne({ key });
    if (!project) {
      return false;
    }
    return await Project.getByID(Object(project).ID);
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
    const sizesStrings = sizes.map(size => size.width + 'x' + size.height);
    const project = await models.Project.findOne({ ID: projectID });
    if (!project) {
      return [];
    }
    return await models.Requests.create({
      project: Object(project),
      file,
      generated: date,
      url,
      sizes: sizesStrings.join(', '),
    });
  },
  getByProject: async (projectID: number): Promise<Array<IRequest>> => {
    const project = await models.Project.findOne({ ID: projectID });
    if (!project) {
      return [];
    }
    const requests = await models.Requests.find({ project: Object(project) });
    return requests.length === 0
      ? []
      : requests.map(request => {
          return {
            file: Object(request).file,
            generated: Object(request).generated,
            sizes: Object(request).sizes,
            url: Object(request).url,
          };
        });
  },
};
