/*
The Superalgos Desktop is one of the 3 clients of the Superalgos Network:

    * Superalgos Mobile
    * Superalgos Desktop
    * Superalgos Server
    
Users can unse any of these clients for their social trading activities.

This module represents the Nodejs command that users have to start the Desktop App..

*/

let APP_ROOT = require('./DesktopRoot.js')
let APP_ROOT_MODULE = APP_ROOT.newDesktopRoot()
APP_ROOT_MODULE.run()