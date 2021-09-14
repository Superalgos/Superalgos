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
    ws: require('ws'),
    open: require('open'),
<<<<<<< HEAD
    http: require('http')
=======
    http: require('http'),
    octokit: require("@octokit/rest"),
    simpleGit: require('simple-git')
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef
}

/*
We will use this User Profile for Testing Purposes.
{
    "githubUsername": "Test-Network-Client-Profile",
    "address": "0xA0dCDA81b42C5EBDc45EC2875C72274B67560246",
    "privateKey": "0x5fed4817a87431c8a328d0936561e63f45b6db289adac6125b9306ded644dfe9"
}
*/

DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID = "baa2f02c-2920-4edb-a103-d452fc61d82f"  
DK.TEST_NETWORK_CLIENT_USER_PROFILE_HANDLE = "Test-Network-Client-Profile"  
DK.TEST_NETWORK_CLIENT_USER_PROFILE_PRIVATE_KEY = "0x5fed4817a87431c8a328d0936561e63f45b6db289adac6125b9306ded644dfe9" 

<<<<<<< HEAD
DK.app = require('./Desktop/DesktopApp.js').newDesktopApp()
DK.app.run()

console.log('Superalgos Desktop is Running.')
=======
run() 

async function run() {
    DK.app = require('./Desktop/DesktopApp.js').newDesktopApp()
    await DK.app.run()
    console.log('Superalgos Desktop App is Running!')
} 
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef
