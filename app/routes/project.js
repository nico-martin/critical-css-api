import { forbiddenObject, authenticateUser } from './../auth';
import { Project, User } from './../database';

export const projectPut = async (req, res, next) => {
  const userID = authenticateUser(req.headers, req.body.userID);
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
  const project = await Project.getByID(parseInt(req.params.projectID));
  if (!project) {
    next({
      status: 404,
      code: 'project_not_found',
      text: 'This project does not exist',
    });
  }
  if (!authenticateUser(req.headers, project.user)) {
    next(forbiddenObject);
  }
  const projectDeleted = await Project.delete(parseInt(req.params.projectID));
  res.send({ deleted: projectDeleted });
};
