/*
The Superalgos Network offers 3 types of services:

    * Social Graph Service
    * Search Index Service
    * Private Message Service
    
Users can decide which services to run at their node.(TODO)

This module is the starting point of the Network Node.

*/

/* 
The NT object is accesible everywhere at the Superalgos Network. 
It provides access to all modules built for this Network.
*/
global.NT = {}
/* 
The SA object is accesible everywhere at the Superalgos Network. 
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
MULTI_PROJECT_MODULE.initialize(NT, 'NT')
MULTI_PROJECT_MODULE.initialize(SA, 'SA')
/*
Setting up external dependencies.
*/
SA.nodeModules = {
    fs: require('fs'),
    nodeFetch: require('node-fetch'),
    web3: require('web3'),
    ws: require('ws')
}

NT.NETWORK_NODE_USER_PROFILE_HANDLE = "Luis-Fernando-Molina" // TODO: remove this.
NT.NETWORK_NODE_USER_PROFILE_PRIVATE_KEY = "blablablablablablablablablablablablablablablablabla" // TODO: remove this.

NT.app = require('./Network/NetwokNode.js').newNetworkNode()
NT.app.run()

console.log('Superalgos Network is Running.')