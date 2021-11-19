/*
This is to start a new instance of a test desktop app running with identity #2 as 
defined at the Environment.js file.
*/

let APP_ROOT = require('./DesktopRoot.js')
let APP_ROOT_MODULE = APP_ROOT.newDesktopRoot()
APP_ROOT_MODULE.run({DESKTOP_APP_SIGNING_ACCOUNT: 'Social-Trading-Desktop-App-2'})