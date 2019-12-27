import { isMaster, forbiddenObject, getUserByToken } from './../auth';
import { Project, User } from './../database';

export const projectPut = async (req, res, next) => {
  if (!isMaster(req.headers.auth)) {
    next(forbiddenObject);
  }

  let userID = false;
  if (isMaster(req.headers.auth) && req.body.userID) {
    userID = req.body.userID;
  } else {
    userID = getUserByToken(req.headers.token);
  }

  if (!userID || !req.body.url) {
    next();
  }

  const project = await Project.add(userID, req.body.url);
  if (!project) {
    next();
  }
  res.send({
    id: project.id,
    url: project.url,
    token: project.key,
  });
};

export const projectDelete = async (req, res, next) => {
  if (!isMaster(req.headers.auth)) {
    next(forbiddenObject);
  }

  const project = await Project.delete(parseInt(req.params.projectID));
  res.send({ deleted: project });
};
