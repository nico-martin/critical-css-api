import 'dotenv/config';
import { ErrorReturn } from './types/express';

import { generateCriticalCSS, validateToken } from './routes/generate';
import {
  userGetAll,
  userGet,
  userGetProjects,
  userPut,
  userUpdate,
  userDelete,
  userSignIn,
  userResetPassword,
  userUpdateCredits,
  userJwtValidate,
  userUpdatePassword,
} from './routes/user';
import { projectPut, projectDelete } from './routes/project';

import { connectDB } from './models';

const PORT = process.env.PORT || 9092;

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import winston from 'winston';

const logger: winston.Logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (
  !process.env.DATABASE_URL ||
  !process.env.MASTER_KEY ||
  !process.env.JWT_SECRET ||
  !process.env.SMTP_HOST ||
  !process.env.SMTP_PORT ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS
) {
  console.log('ERROR: please make sure you defined all necessary env vars.');
} else {
  let app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(express.static('public'));

  app.post('/', generateCriticalCSS);
  app.post('/key/isValid', validateToken);

  /**
   * Users
   */

  app.get('/user/', userGetAll);
  app.get('/user/:userID', userGet);
  app.get('/user/:userID/projects', userGetProjects);
  app.put('/user/', userPut);
  app.put('/user/:userID', userUpdate);
  app.put('/user/password/:userID', userUpdatePassword);
  app.delete('/user/:userID', userDelete);
  app.post('/user/signin/', userSignIn);
  app.post('/user/reset-password/', userResetPassword);
  app.get('/user/jwt/validate/', userJwtValidate);
  app.put('/credits/', userUpdateCredits);

  /**
   * Projects
   */

  app.put('/project/', projectPut);
  app.delete('/project/:projectID/', projectDelete);

  /**
   * General error handling
   */

  app.all(
    '*',
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      next({
        status: 400,
        code: 'invalid_request',
        text: 'Invalid request',
      });
    }
  );

  app.use(
    (
      err: express.Errback,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const defaultError: ErrorReturn = {
        status: 500,
        code: 'error',
        text: 'An error occured',
        trace: '',
      };

      const error: ErrorReturn = {
        ...defaultError,
        ...err,
      };

      res.status(error.status).send({
        code: error.code,
        error: error.text,
        data: {
          status: error.status,
          trace: error.trace,
        },
      });
    }
  );

  /**
   * Listen
   */
  connectDB().then(async () => {
    app.listen(PORT, () => console.log(`APP listening to ${PORT}!`));
  });
}
