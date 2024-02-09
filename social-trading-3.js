/*
This is to start a new instance of a test desktop app running with identity #3 as 
defined at the Environment.js file.
*/

let APP_ROOT = require('./SocialTradingRoot.js')
let APP_ROOT_MODULE = APP_ROOT.newSocialTradingRoot()
APP_ROOT_MODULE.run({SOCIALTRADING_APP_SIGNING_ACCOUNT: 'Social-Trading-Desktop-App-3'})