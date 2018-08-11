import {configure, getLogger} from 'log4js';

configure('./helpers/log-configuration.json');
const logger = getLogger('app');
logger.debug("Some debug messages");

module.exports = logger;