/*
This module represents the Nodejs command that users use to start the Network Node.
*/

let APP_ROOT = require('./NetworkRoot.js')
let APP_ROOT_MODULE = APP_ROOT.newNetworkRoot()
APP_ROOT_MODULE.run()