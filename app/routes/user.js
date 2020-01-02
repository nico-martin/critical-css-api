import {
  forbiddenObject,
  authenticate,
  authenticateClient,
  authenticateUser,
  authenticateMaster,
} from './../auth';
import { sendMail } from './../mail';
import { User } from './../database';

export const userGetAll = async (req, res, next) => {
  if (!authenticateMaster(req.headers)) {
    next(forbiddenObject);
  }
  await sendMail().catch(console.error);
  const users = await User.getAll();
  res.send(users);
};

export const userGet = async (req, res, next) => {
  const userID = authenticateUser(req.headers, req.params.userID);
  if (!userID) {
    next(forbiddenObject);
  }

  const user = await User.get(userID);
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
  if (!authenticateClient(req.headers)) {
    next(forbiddenObject);
  }
  const user = await User.add(req.body);
  if (!user) {
    next({
      status: 400,
      code: 'already_exists',
      text: 'This user already exists',
    });
  }
  res.send(user);
};

export const userUpdate = async (req, res, next) => {
  const userID = authenticateUser(req.headers, req.params.userID);
  if (!userID) {
    next(forbiddenObject);
  }

  const user = await User.update(userID, req.body);
  if (!user) {
    next({
      status: 400,
      code: 'update_failed',
      text:
        'User could not be updated. Either the user does not exist or the email is already in use',
    });
  }
  res.send(user);
};

export const userDelete = async (req, res, next) => {
  if (!authenticateMaster(req.headers)) {
    next(forbiddenObject);
  }
  const user = await User.delete(parseInt(req.params.userID));
  res.send({ deleted: user });
};

export const userSignIn = async (req, res, next) => {
  if (!authenticateClient(req.headers)) {
    next(forbiddenObject);
  }

  if (!req.body.email || !req.body.password) {
    next();
  }
  const authToken = await User.verify(req.body.email, req.body.password);
  if (!authToken) {
    next();
  }
  res.send({ token: authToken });
};

export const userUpdateCredits = async (req, res, next) => {
  if (!authenticateMaster(req.headers)) {
    next(forbiddenObject);
  }

  const userID = parseInt(req.body.userID);
  const credits = parseInt(req.body.credits);
  const newCredits = await User.creditsUpdate(userID, credits);
  if (newCredits === false) {
    next();
  }
  res.send({ credits: newCredits });
};

export const userJwtValidate = (req, res, next) => {
  const auth = authenticate(req.headers);
  res.send({ user: auth === 'master' ? false : auth });
};
