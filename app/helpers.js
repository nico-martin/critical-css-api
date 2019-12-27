import models from './models';
import sha1 from 'js-sha1';

export const getNewUserId = async () => {
  const latestUser = await models.User.find()
    .sort({ _id: -1 })
    .limit(1);
  if (!latestUser) {
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

  return userObject;
};

export const randomKey = (key = '') => {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
    c
  ) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

  return sha1(uuid + key);
};
