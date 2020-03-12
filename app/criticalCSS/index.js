import { isValidURL, debug, logError, cleanUpCSS } from './helpers';
import penthouse from 'penthouse';
import puppeteer from 'puppeteer';

const generate = opts =>
  new Promise(async (resolve, reject) => {
    opts = {
      src: '',
      dimensions: [
        {
          width: 1300,
          height: 900,
        },
      ],
      ...opts,
    };

    debug('get ccss with', opts);
    debug('isValidURL(opts.src)', isValidURL(opts.src));
    if (!isValidURL(opts.src)) {
      logError(`"${opts.src}" is not a valid URL`);
      reject(`"${opts.src}" is not a valid URL`);
    }

    const browser = await puppeteer.launch();
    const css = await fetchCSS(opts.src, browser);
    const loadDimensions = [];
    opts.dimensions.forEach(dim => {
      loadDimensions.push(
        generateForDimension(opts.src, dim.width, dim.height, css, browser)
      );
    });

    Promise.all(loadDimensions)
      .then(responses => {
        browser.close();
        debug(
          'CCSS Generater',
          responses.map(css => css.length)
        );
        resolve(cleanUpCSS(responses));
      })
      .catch(err => {
        browser.close();
        logError(err);
        reject(err);
      });
  });

const generateForDimension = async (url, width, height, css, browser) => {
  return new Promise((resolve, reject) =>
    penthouse({
      url,
      cssString: css,
      puppeteer: browser,
      width,
      height,
    })
      .then(css => {
        resolve(css);
      })
      .catch(err => {
        reject(err);
      })
  );
};

const fetchCSS = async (url, browser) => {
  const page = await browser.newPage();
  let css = '';
  page.on('response', async response => {
    if (response.request().resourceType() === 'stylesheet') {
      const newCss = await response.text();
      css += newCss;
    }
  });
  await page.goto(url);
  await browser.close();
  return css;
};

export default { generate };
