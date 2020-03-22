import { forbiddenObject, authenticateUser } from '../auth';
import { Project, User } from '../database';
import { untrailingSlashIt } from '../helpers';
import express from 'express';

export const projectPut = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userID = authenticateUser(req.headers, req.body.userID);
  if (!userID || !req.body.url) {
    next();
  }

  const project = await Project.add(
    Number(userID),
    untrailingSlashIt(req.body.url)
  );
  if (!project) {
    next();
  }
  res.send({
    ID: Object(project).ID,
    url: Object(project).url,
    token: Object(project).key,
  });
};

export const projectDelete = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const project = await Project.getByID(parseInt(req.params.projectID));
  if (!project) {
    next({
      status: 404,
      code: 'project_not_found',
      text: 'This project does not exist',
    });
  }
  if (!authenticateUser(req.headers, Object(project).user)) {
    next(forbiddenObject);
  }
  const projectDeleted = await Project.delete(parseInt(req.params.projectID));
  res.send({ deleted: projectDeleted });
};
