//import critical from 'critical';
import fs from 'fs';
import path from 'path';
import { Project, Requests, User } from '../database';
import * as criticalCSS from './../criticalCSS';
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

  generatingCritical(targetUrl, dimensionsArray).then(
    async response => {
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
            Object(project)._id,
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
    },
    err => {
      next({
        status: 500,
        code: 'generation_failed',
        text: err.message,
      });
    }
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
const generatingCritical = (
  targetUrl: string,
  targetDimensions: Array<criticalCSS.Dimension>
) => {
  console.log('Start CCSS for ', targetUrl);
  console.log('Start CCSS for dim ', targetDimensions);

  return new Promise((resolve, reject) => {
    criticalCSS
      .generate({
        src: targetUrl,
        dimensions: targetDimensions,
      })
      .then(css => {
        console.log('PCCSS done');
        resolve(css);
      })
      .catch(err => reject(err));
  });
  /*

  return new Promise((resolve, reject) => {
    critical
      .generate({
        base: tmpFolder,
        src: targetUrl,
        dest: 'main-critical.css',
        dimensions: targetDimensions,
        minify: true,
      })
      .then(output => {
        console.log('Critical successfully generated');
        resolve(output);
      })
      .error(err => {
        console.log('Critical Error ', err);
        reject(new Error('Failed generating CCSS'));
      })
      .catch(err => {
        if (err.code === 'ENOTFOUND') {
          console.log('URL not valid ');
          console.log('Host', err.host, err.port);
          reject(new Error('Not valid Host ' + err.host));
        } else {
          console.log('System error Message', err);
          reject(new Error('Critical System Error' + err));
        }
      });
  });
   */
};

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
