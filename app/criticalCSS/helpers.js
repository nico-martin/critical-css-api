import CleanCSS from 'clean-css';

export const isValidURL = url => {
  if (!url) {
    return false;
  }
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return pattern.test(url);
};

export const cleanUpCSS = CSSArray => {
  debug('CSS Before', CSSArray.join().length);
  const re = new CleanCSS({
    level: {
      1: {
        all: true,
      },
      2: {
        all: false,
        removeDuplicateFontRules: true,
        removeDuplicateMediaBlocks: true,
        removeDuplicateRules: true,
        removeEmpty: true,
        mergeMedia: true,
      },
    },
  }).minify(CSSArray.join()).styles;
  debug('CCSS After', re.length);
  return re;
};

export const debug = (title, value) => {
  /*
  console.log('+++DEBUG+++++++++++');
  console.log(title, value);

   */
};

export const logError = error => {
  /*
  console.log('***************************');
  console.log('ERROR:', error);
  console.log('***************************');

   */
};
