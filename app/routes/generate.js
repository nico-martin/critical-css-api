import critical from 'critical';
import fs from 'fs';
import path from 'path';
import { Project } from './../database';

const targetFolder = 'dist/';

export const generateCriticalCSS = async (req, res, next) => {
  const maxDimensionsSize = 3;
  const token = req.body.token;
  const targetUrl = req.body.url;
  const dimensions = req.body.dimensions;

  const project = await Project.getByApiKey(token);
  if (!project || targetUrl.indexOf(project.url) !== 0) {
    next({
      status: 403,
      code: 'invalid_key',
      text: 'The given apiKey is not valid or does not match the project url',
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

  generatingCritical(targetUrl, dimensionsArray).then(
    response => {
      res.status(201).send({ css: response });
      deleteTempFiles();
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
function getDimensionsArray(dimensions) {
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
}

/**
 * Returns a Critical CSS File
 * @param targetUrl the URL that represents the target Website
 * @param targetDimensions  Json Obj. of Dimensions
 * @returns {Promise}   bool Promise
 */
function generatingCritical(targetUrl, targetDimensions) {
  console.log('Start CCSS for ', targetUrl);

  return new Promise((resolve, reject) => {
    critical
      .generate({
        base: targetFolder,
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
}

function deleteTempFiles() {
  fs.readdir(targetFolder, (err, files) => {
    if (err) {
      console.log(err);
    }

    for (const file of files) {
      fs.unlink(path.join(targetFolder, file), err => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}
