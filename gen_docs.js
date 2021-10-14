/* Load Environment Variables */
let ENVIRONMENT = require('./Environment.js');
let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
global.env = ENVIRONMENT_MODULE

