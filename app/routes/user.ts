import express from 'express';
import {
  forbiddenObject,
  authenticate,
  authenticateClient,
  authenticateUser,
  authenticateMaster,
} from '../auth';
import { sendMail } from '../mail';
import { User } from '../database';

export const userGetAll = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!authenticateMaster(req.headers)) {
    next(forbiddenObject);
  }
  const users = await User.getAll();
  res.send(users);
};

export const userGet = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userID = authenticateUser(req.headers, req.params.userID);
  if (!userID) {
    next(forbiddenObject);
  }

  const user = await User.get(Number(userID));
  if (!user) {
    next({
      status: 404,
      code: 'not_found',
      text: 'This user does not exist',
    });
  }
  res.send(user);
};

export const userGetProjects = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userID = authenticateUser(req.headers, req.params.userID);
  if (!userID) {
    next(forbiddenObject);
  }

  const projects = await User.getProjects(Number(userID));
  if (!projects) {
    next({
      status: 404,
      code: 'not_found',
      text: 'This user does not exist',
    });
  }
  res.send(projects);
};

export const userPut = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

export const userUpdate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userID = authenticateUser(req.headers, req.params.userID);
  if (!userID) {
    next(forbiddenObject);
  }

  const user = await User.update(Number(userID), req.body);
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

export const userUpdatePassword = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userID = authenticateUser(req.headers, req.params.userID);
  if (!userID) {
    next(forbiddenObject);
  }

  if (!req.body.password) {
    next();
  }

  const password = await User.updatePassword(Number(userID), req.body.password);
  if (!password) {
    next({
      status: 400,
      code: 'update_failed',
      text:
        'User could not be updated. Either the user does not exist or the email is already in use',
    });
  }
  res.send({
    updated: true,
  });
};

export const userDelete = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!authenticateMaster(req.headers)) {
    next(forbiddenObject);
  }
  const user = await User.delete(parseInt(req.params.userID));
  res.send({ deleted: user });
};

export const userSignIn = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!authenticateClient(req.headers)) {
    next(forbiddenObject);
  }

  if (!req.body.email || !req.body.password) {
    next();
  }
  const authToken = await User.verify(
    req.body.email,
    req.body.password,
    req.body.remember
  );
  if (!authToken) {
    next();
  }
  res.send({ token: authToken });
};

export const userResetPassword = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!authenticateClient(req.headers)) {
    next(forbiddenObject);
  }

  if (!req.body.email) {
    next();
  }

  const user = await User.getByEmail(req.body.email);
  if (!user) {
    next({
      status: 404,
      code: 'not_found',
      text: 'This user does not exist',
    });
  }

  const password = await User.updatePassword(Object(user).id);

  if (!password) {
    next({
      status: 500,
      code: 'update_failed',
      text: 'User could not be updated',
    });
  }

  let mailContent = `<p>Hello ${
    Object(user).firstname ? Object(user).firstname + ' ' : ''
  }${Object(user).lastname ? Object(user).lastname + ' ' : ''}`;
  mailContent += `</p><p>You requested a temporary password for <a href="https://app.critial-css.io">https://app.critial-css.io</a>. Please change it after your next login.</p>`;
  mailContent += `<p>Password: <b>${password}</b></p><p>Kind regards</p>`;
  await sendMail(Object(user).email, 'Password Changed', mailContent);

  res.send({ updated: true });
};

export const userUpdateCredits = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

export const userJwtValidate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const auth = authenticate(req.headers);
  res.send({ user: auth === 'master' ? false : auth });
};
