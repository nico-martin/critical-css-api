import models from './models';

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
};

const getNewUserId = async () => {
  const latestUser = await models.User.find()
    .sort({ _id: -1 })
    .limit(1);
  if (!latestUser) {
    return 1;
  }
  return latestUser[0].id + 1;
};

const normalizeUser = (user, acceptId = false) => {
  const keys = ['email', 'firstname', 'lastname', ...(acceptId ? ['id'] : [])];
  const userObject = {};

  Object.entries(user).map(e => {
    if (keys.indexOf(e[0]) !== -1) {
      userObject[e[0]] = e[1];
    }
  });

  return userObject;
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
