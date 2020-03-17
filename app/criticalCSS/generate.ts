import { isValidURL, debug, logError, cleanUpCSS } from './helpers';
import penthouse from 'penthouse';
import puppeteer from 'puppeteer';

export interface Dimension {
  width: number;
  height: number;
}

export interface Options {
  src: string;
  dimensions: Array<Dimension>;
}

export const generate = (opts: Options) =>
  new Promise(async (resolve, reject) => {
    try {
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
      debug(`isValidURL(${opts.src})`, isValidURL(opts.src));
      if (!isValidURL(opts.src)) {
        debug('generate isValidURL', `"${opts.src}" is not a valid URL`);
        //logError(`"${opts.src}" is not a valid URL`);
        reject(`"${opts.src}" is not a valid URL`);
      }

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
      });
      const css = await fetchCSS(opts.src, browser);
      const loadDimensions: Array<Promise<string>> = [];
      opts.dimensions.forEach(dim => {
        loadDimensions.push(
          generateCssForDimension(opts.src, dim.width, dim.height, css, browser)
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
          debug('generate failed', err);
          reject('CCSS could not be generated');
        });
    } catch (e) {
      debug('generate catch', e);
      reject(e);
    }
  });

const generateCssForDimension = async (
  url: string,
  width: number,
  height: number,
  css: string,
  browser: puppeteer.Browser
): Promise<string> =>
  new Promise((resolve, reject) =>
    // @ts-ignore
    penthouse({
      url,
      cssString: css,
      puppeteer: browser,
      width,
      height,
    })
      .then((css: string) => {
        resolve(css);
      })
      .catch((err: Object) => {
        reject(err);
      })
  );

const fetchCSS = async (url: string, browser: puppeteer.Browser) => {
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
