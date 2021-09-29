/*
The Superalgos Network offers 3 types of services:

    * Social Graph Service
    * Search Index Service
    * Private Message Service
    
Users can decide which services to run at their node.(TODO)

This module represents the Nodejs command that users have to start the Network Node..

*/

let APP_ROOT = require('./NetworkRoot.js')
let APP_ROOT_MODULE = APP_ROOT.newNetworkRoot()
APP_ROOT_MODULE.run()