/*
The Superalgos Social Trade is one of the 3 clients of the Superalgos P2P Network:

    * Superalgos Mobile
    * Superalgos Social Trade
    * Superalgos Server
    
Users can use any of these clients for their social trading activities.

This module represents the Nodejs command that users have to start the Social Trade App..

*/

let APP_ROOT = require('./SocialTradingRoot.js')
let APP_ROOT_MODULE = APP_ROOT.newSocialTradingRoot()
APP_ROOT_MODULE.run({},'vueDev')