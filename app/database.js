import models from './models';
import { normalizeUser, getNewUserId, randomKey } from './helpers';
import { generateToken } from './auth';
import sha1 from 'js-sha1';

export const User = {
  add: async userObject => {
    if (!userObject.email) {
      return false;
    }
    userObject = normalizeUser(userObject);
    let user = await models.User.findOne({ email: userObject.email });
    if (!user) {
      const newUserId = await getNewUserId();
      user = await models.User.create({
        email: userObject.email,
        id: newUserId,
      });
    }

    if ('password' in userObject) {
      userObject.password = sha1(userObject.password);
    }

    await models.User.updateOne({ _id: user._id }, userObject);
    const updatedUser = await models.User.findOne({
      email: userObject.email,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
    };
  },
  delete: async id => {
    const deleted = await models.User.deleteOne({ id });
    return deleted.deletedCount === 1;
  },
  get: async id => {
    const user = await models.User.findOne({ id });
    if (user) {
      return {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
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
};

/*
export const list = {
  save: async (uuid, values) => {
    let list = await models.List.findOne({uuid});
    if (!list) {
      list = await models.List.create({uuid})
    }

    await models.List.updateOne({_id: list._id}, values);
    return await models.List.findOne({uuid});
  },
  delete: async (uuid) => {
    return await models.List.deleteOne({uuid});
  }
};

export const item = {
  add: async (list, text) => {

  },
  delete: async (itemKey) => {

  }
};
 */
