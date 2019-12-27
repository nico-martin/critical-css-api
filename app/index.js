import 'dotenv/config';

import generateCriticalCSS from './routes/generateCriticalCSS';
import {
  userGetAll,
  userGet,
  userPut,
  userDelete,
  userSignIn,
  userJwtValidate,
} from './routes/user';
import { projectPut, projectDelete } from './routes/project';

import { connectDB } from './models';

const PORT = process.env.PORT || 9092;

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

let app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/', generateCriticalCSS);
app.post('/key/isValid', (req, res) => {
  res.status(200).send({
    valid: true,
  });
});

/**
 * Users
 */

app.get('/user/', userGetAll);
app.get('/user/:userID', userGet);
app.put('/user/', userPut);
app.delete('/user/:userID', userDelete);
app.post('/user/signin/', userSignIn);
app.get('/user/jwt/validate/', userJwtValidate);

/**
 * Projects
 */

app.put('/project/', projectPut);
app.delete('/project/:projectID/', projectDelete);

/**
 * General error handling
 */

app.all('*', (req, res, next) => {
  next({
    status: 400,
    code: 'invalid_request',
    text: 'Invalid request',
  });
});

app.use((err, req, res, next) => {
  const defaultError = {
    status: 500,
    code: 'error',
    text: 'An error occured',
    trace: '',
  };

  const error = {
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
});

/**
 * Listen
 */
connectDB().then(async () => {
  app.listen(PORT, () => console.log(`APP listening to ${PORT}!`));
});
