/*
The Superalgos Desktop is one of the 3 clients of the Superalgos Network:

    * Superalgos Mobile
    * Superalgos Desktop
    * Superalgos Server
    
Users can unse any of these clients for their social trading activities.

This module is the starting point of the Superalgos Desktop App.

*/

/* 
The DK object is accesible everywhere at the Superalgos Desktop App. 
It provides access to all modules built for this App.
*/
global.DK = {}
/* 
The SA object is accesible everywhere at the Superalgos Desktop App. 
It provides access to all modules built for Superalgos in general.
*/
global.SA = {}
/* Load Environment Variables */
let ENVIRONMENT = require('./EnvironmentForDebug.js');
let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
global.env = ENVIRONMENT_MODULE
/*
First thing is to load the project schema file.
*/
global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
/* 
Setting up the modules that will be available, defined at the Project Schema file. 
*/
let MULTI_PROJECT = require('./MultiProject.js');
let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
MULTI_PROJECT_MODULE.initialize(DK, 'DK')
MULTI_PROJECT_MODULE.initialize(SA, 'SA')
/*
Setting up external dependencies.
*/
SA.nodeModules = {
    fs: require('fs'),
    web3: require('web3'),
    ws: require('ws')
}

DK.app = require('./Network/DesktopApp.js').newNetworkNode()
DK.app.run()

console.log('Superalgos Desktop is Running.')