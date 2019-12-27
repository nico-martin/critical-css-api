import { isMaster, forbiddenObject, getUserByToken } from './../auth';
import { User } from './../database';

export const userGetAll = async (req, res, next) => {
  if (!isMaster(req.headers.auth)) {
    next(forbiddenObject);
  }
  const users = await User.getAll();
  res.send(users);
};

export const userGet = async (req, res, next) => {
  if (!isMaster(req.headers.auth)) {
    next(forbiddenObject);
  }
  const user = await User.get(parseInt(req.params.userID));
  if (!user) {
    next({
      status: 404,
      code: 'not_found',
      text: 'This user does not exist',
    });
  }
  res.send(user);
};

export const userPut = async (req, res, next) => {
  if (!isMaster(req.headers.auth)) {
    next(forbiddenObject);
  }
  const user = await User.add(req.body);
  res.send(user);
};

export const userDelete = async (req, res, next) => {
  if (!isMaster(req.headers.auth)) {
    next(forbiddenObject);
  }
  const user = await User.delete(parseInt(req.params.userID));
  res.send({ deleted: user });
};

export const userSignIn = async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    next();
  }
  const authToken = await User.verify(req.body.email, req.body.password);
  if (!authToken) {
    next();
  }
  res.send({ token: authToken });
};

export const userJwtValidate = (req, res, next) => {
  res.send({ user: getUserByToken(req.headers.auth) });
};
