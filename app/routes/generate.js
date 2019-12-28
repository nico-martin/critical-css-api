import critical from 'critical';
import fs from 'fs';
import path from 'path';
import { Project, Requests } from './../database';

const outputFolder = 'output/';
const tmpFolder = outputFolder + 'tmp/';
const cssFolder = outputFolder + 'projects/';

export const generateCriticalCSS = async (req, res, next) => {
  const maxDimensionsSize = 3;
  const token = req.body.token;
  const targetUrl = req.body.url;
  const dimensions = req.body.dimensions;
  !fs.existsSync(outputFolder) && fs.mkdirSync(outputFolder);
  !fs.existsSync(tmpFolder) && fs.mkdirSync(tmpFolder);
  !fs.existsSync(cssFolder) && fs.mkdirSync(cssFolder);

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
    async response => {
      const date = new Date();
      const folder = cssFolder + project.user + '/';
      const key = (targetUrl + '-' + date.getTime())
        .replace('http://', '')
        .replace('https://', '')
        .replace('www.', '')
        .replace(/\./g, '-')
        .replace(/\//g, '-')
        .replace(/--/g, '-');

      const file = folder + key + '.css';
      !fs.existsSync(folder) && fs.mkdirSync(folder);
      fs.writeFile(file, response, err => {
        if (err) {
          next({
            status: 500,
            code: 'generation_failed',
            text: 'CSS File could not be generated',
          });
        } else {
          Requests.add(project._id, file, date);
          deleteTempFiles();
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
}

function deleteTempFiles() {
  fs.readdir(tmpFolder, (err, files) => {
    if (err) {
      console.log(err);
    }

    for (const file of files) {
      fs.unlink(path.join(tmpFolder, file), err => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}
