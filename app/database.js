import models from './models';
import {
  normalizeUser,
  getNewUserId,
  getNewProjectId,
  verifyBaseUrl,
} from './helpers';
import { generateToken } from './auth';
import sha1 from 'js-sha1';
import { randomBytes } from 'crypto';

export const User = {
  add: async userObject => {
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
  update: async (userID, userObject) => {
    userObject = normalizeUser(userObject);
    let user = await models.User.findOne({ id: userID });
    if (!user) {
      return false;
    }

    if ('email' in userObject) {
      const emailUser = await models.User.findOne({ email: userObject.email });
      if (emailUser && emailUser.id !== user.id) {
        console.log(emailUser.id, user.id);
        return false;
      }
    }

    await models.User.updateOne({ _id: user._id }, userObject);
    return await User.get(user.id);
  },
  delete: async id => {
    const deleted = await models.User.deleteOne({ id });
    return deleted.deletedCount === 1;
  },
  get: async id => {
    const user = await models.User.findOne({ id });
    const projects = await models.Project.find({ user: user._id });
    if (user) {
      return {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        credits: user.credits,
        projects: projects.map(project => {
          return {
            id: project.id,
            url: project.url,
            key: project.key,
          };
        }),
      };
    }
    return false;
  },
  getAll: async () => {
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
  verify: async (email, password) => {
    const user = await models.User.findOne({
      email,
      password: sha1(password),
    });
    if (user) {
      return generateToken(user.id);
    }
    return false;
  },
  creditsUpdate: async (userID, credits) => {
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
  creditsGet: async userID => {
    let user = await models.User.findOne({ id: userID });
    if (!user) {
      return false;
    }

    return user.credits ? user.credits : 0;
  },
};

export const Project = {
  add: async (userID, url) => {
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

    return {
      id: updtedProject.id,
      url: updtedProject.url,
      key: updtedProject.key,
    };
  },
  delete: async id => {
    const deleted = await models.Project.deleteOne({ id });
    return deleted.deletedCount === 1;
  },
  getByApiKey: async key => {
    const project = await models.Project.findOne({ key });
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
};

export const Requests = {
  add: async (projectID, file, date = new Date()) => {
    return await models.Requests.create({
      project: projectID,
      file,
      generated: date,
    });
  },
};
