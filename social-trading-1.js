/*
This is to start a new instance of a test social trading app running with identity #1 as 
defined at the Environment.js file.
*/

let APP_ROOT = require('./SocialTradingRoot.js')
let APP_ROOT_MODULE = APP_ROOT.newSocialTradingRoot()
APP_ROOT_MODULE.run({SOCIALTRADING_APP_SIGNING_ACCOUNT: 'Social-Trading-Desktop-App-1'})