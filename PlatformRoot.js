
/*
This module represents the execution root of the Platform App.
We use this module that is outside the Platform folder to 
load all node dependencies and get them ready to the actual App.
*/

/* 
The PL object is accesible everywhere at the Superalgos Platform Client. 
It provides access to all modules built for this Client.
*/
global.PL = {}
/* 
The SA object is accesible everywhere at the Superalgos Desktop App. 
It provides access to all modules built for Superalgos in general.
*/
global.SA = {}
/* Load Environment Variables */
let ENVIRONMENT = require('./Environment.js');
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
MULTI_PROJECT_MODULE.initialize(PL, 'PL')
MULTI_PROJECT_MODULE.initialize(SA, 'SA')
/*
Setting up external dependencies.
*/
SA.nodeModules = {
    fs: require('fs'),
    util: require('util'),
    path: require('path'),
    ws: require('ws'),
    web3: require('web3'),
    ethers: require('ethers'),
    ethereumjsTx: require('ethereumjs-tx'),
    ethereumjsCommon: require('ethereumjs-common'),
    nodeFetch: require('node-fetch'),
    open: require('open'),
    http: require('http'),
    ccxt: require('ccxt'),
    octokit: require("@octokit/rest"),
    simpleGit: require('simple-git'),
    lookpath: require('lookpath')
}

run()

async function run() {
    PL.app = require('./Platform/PlatformApp.js').newPlatformApp()
    await PL.app.run()
    console.log('Superalgos Platform App is Running!')
}
