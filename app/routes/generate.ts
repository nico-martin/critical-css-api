//import critical from 'critical';
import fs from 'fs';
import path from 'path';
import { Project, Requests, User } from '../database';
import * as criticalCSS from './../criticalCSS/index';
import express from 'express';

const outputFolder = 'public/';
const tmpFolder = outputFolder + 'tmp/';
const cssFolder = outputFolder + 'css/';

export const validateToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.body.token;
  const targetUrl = req.body.url;
  const project = await Project.getByApiKey(token);
  if (!project || targetUrl.indexOf(project.url) !== 0) {
    next({
      status: 403,
      code: 'invalid_token',
      text: 'The given token is not valid or does not match the project url',
    });
  }

  res.send({
    valid: true,
  });
};

export const generateCriticalCSS = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const maxDimensionsSize = 3;
  const token = req.body.token;
  const targetUrl = req.body.url;
  const dimensions = req.body.dimensions;
  const requestKey =
    new Date().getTime().toString() +
    Math.floor(Math.random() * (9999 - 1000) + 1000);
  const requestTmpFolder = tmpFolder + requestKey + '/';

  !fs.existsSync(outputFolder) && fs.mkdirSync(outputFolder);
  !fs.existsSync(tmpFolder) && fs.mkdirSync(tmpFolder);
  !fs.existsSync(requestTmpFolder) && fs.mkdirSync(requestTmpFolder);
  !fs.existsSync(cssFolder) && fs.mkdirSync(cssFolder);

  let project = await Project.getByApiKey(token);
  if (!project || targetUrl.indexOf(project.url) !== 0) {
    next({
      status: 403,
      code: 'invalid_token',
      text: 'The given token is not valid or does not match the project url',
    });
  }

  const dimensionsArray = getDimensionsArray(dimensions);
  if (dimensionsArray.length > maxDimensionsSize) {
    next({
      status: 400,
      code: 'invalid_dimensions',
      text: `Max Dimensions Size of ${maxDimensionsSize} reached`,
    });
  }

  const credits = await User.creditsGet(Object(project).user);
  if (credits <= 0) {
    next({
      status: 400,
      code: 'no_credits',
      text: 'There are not enough credits',
    });
  }

  criticalCSS
    .generate({
      src: targetUrl,
      dimensions: dimensionsArray,
    })
    .then(async response => {
      const date = new Date();
      const folder = cssFolder + Object(project).user + '/';
      const key = (targetUrl + '-' + date.getTime())
        .replace('http://', '')
        .replace('https://', '')
        .replace('www.', '')
        .replace(/\./g, '-')
        .replace(/\//g, '-')
        .replace(/--/g, '-');

      const file = folder + key + '.css';
      !fs.existsSync(folder) && fs.mkdirSync(folder);
      fs.writeFile(file, response, async err => {
        if (err) {
          next({
            status: 500,
            code: 'generation_failed',
            text: 'CSS File could not be generated',
          });
        } else {
          await Requests.add(
            Object(project).ID,
            file.replace(outputFolder, ''),
            targetUrl,
            dimensionsArray,
            date
          );
          deleteTempFiles(requestTmpFolder);
          res.setHeader('Content-Type', 'text/css');
          res.status(201).send(response);
        }
      });
    })
    .catch((err: string) =>
      next({
        status: 500,
        code: 'generation_failed',
        text: err,
      })
    );
};

/**
 * Get an Array out of the JSON Request
 * @param dimensions
 * @returns {Array} with Dimensions
 */
const getDimensionsArray = (dimensions: Array<criticalCSS.Dimension>) => {
  let dimensionsArray = [];

  if (dimensions == null) {
    dimensionsArray.push({
      height: 800,
      width: 1024,
    });
  } else {
    for (let key in dimensions) {
      if (dimensions.hasOwnProperty(key)) {
        dimensionsArray.push({
          height: dimensions[key].height,
          width: dimensions[key].width,
        });
      }
    }
  }
  return dimensionsArray;
};

/**
 * Returns a Critical CSS File
 * @param targetUrl the URL that represents the target Website
 * @param targetDimensions  Json Obj. of Dimensions
 * @returns {Promise}   bool Promise
 */

const deleteTempFiles = (folder: string) => {
  fs.readdir(folder, (err, files) => {
    if (err) {
      console.log(err);
    }

    for (const file of files) {
      fs.unlink(path.join(folder, file), err => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
};
