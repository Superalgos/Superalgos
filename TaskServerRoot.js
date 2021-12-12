
/*
This module represents the execution root of the Task Server.
We use this module that is outside the Task Server folder to 
load all node dependencies and get them ready to the actual App.
*/

/* 
The TS object is accessible everywhere at the Superalgos Platform Client.
It provides access to all modules built for the Task Server.
*/
global.TS = {}
/* 
The SA object is accessible everywhere at the Superalgos Desktop App.
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
global.PROJECTS_SCHEMA_MAP = new Map()

for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
    let projectDefinition = PROJECTS_SCHEMA[i]
    PROJECTS_SCHEMA_MAP.set(projectDefinition.name, projectDefinition)
}
/* 
Setting up the modules that will be available, defined at the Project Schema file. 
*/
let MULTI_PROJECT = require('./MultiProject.js');
let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
MULTI_PROJECT_MODULE.initialize(TS, 'TS')
MULTI_PROJECT_MODULE.initialize(SA, 'SA')
/*
Setting up external dependencies.
*/
SA.nodeModules = {
    fs: require('fs'),
    util: require('util'),
    path: require('path'),
    ws: require('ws'),
    ip: require('ip'),
    telegraf: require('telegraf'),
    https: require('https'),
    http: require('http'),
    web3: require('web3'),
    nodeFetch: require('node-fetch'),
    ccxt: require('ccxt'),
    ccxtMisc: require('./node_modules/ccxt/js/base/functions/misc'),
    lookpath: require('lookpath'),
    twitter: require('twitter-api-v2')
}
/*
Setting up Secrets.
*/
try {
    SA.secrets = {
        array: require('./My-Secrets/Secrets.json').secrets,
        map: new Map()
    }
} catch(err) {
    SA.secrets = {
        array: [],
        map: new Map()
    }
}

for (let i = 0; i < SA.secrets.array.length; i++) {
    let secret = SA.secrets.array[i]
    SA.secrets.map.set(secret.nodeCodeName, secret)
}

run()

async function run() {
    TS.app = require('./TaskServer/TaskServer.js').newTaskServer()
    await TS.app.run()
    console.log('Superalgos TaskServer is Running!')
}
