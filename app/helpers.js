import models from './models';
import sha1 from 'js-sha1';

export const getNewUserId = async () => {
  const latestUser = await models.User.find()
    .sort({ _id: -1 })
    .limit(1);
  if (!latestUser || Object.keys(latestUser).length === 0) {
    return 1;
  }
  return latestUser[0].id + 1;
};

export const normalizeUser = (user, acceptId = false) => {
  const keys = [
    'email',
    'firstname',
    'lastname',
    'password',
    ...(acceptId ? ['id'] : []),
  ];
  const userObject = {};

  Object.entries(user).map(e => {
    if (keys.indexOf(e[0]) !== -1) {
      userObject[e[0]] = e[1];
    }
  });

  if ('password' in userObject) {
    userObject.password = sha1(userObject.password);
  }

  return userObject;
};

export const getNewProjectId = async () => {
  const latesProject = await models.Project.find()
    .sort({ _id: -1 })
    .limit(1);
  if (!latesProject || Object.keys(latesProject).length === 0) {
    return 1;
  }
  return latesProject[0].id + 1;
};

export const verifyBaseUrl = url => {
  return url;
};
