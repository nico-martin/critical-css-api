import models from './models/index';
import { IUser } from './types/db';

export const getNewUserId = async () => {
  const latestUser = await models.User.find()
    .sort({ _id: -1 })
    .limit(1);
  if (!latestUser || Object.keys(latestUser).length === 0) {
    return 1;
  }
  return latestUser[0].id + 1;
};

export const normalizeUser = (user: Object, acceptId = false) => {
  const keys = ['email', 'firstname', 'lastname', ...(acceptId ? ['id'] : [])];
  const userObject = {};

  Object.entries(user).map(e => {
    if (keys.indexOf(e[0]) !== -1) {
      // @ts-ignore
      userObject[e[0]] = String(e[1]);
    }
  });

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

export const verifyBaseUrl = (url: string) => {
  // todo: remove trainling slashes and check if is a valid URL
  return url;
};

export const makeRandomString = (length: number) => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
