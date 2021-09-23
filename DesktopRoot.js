exports.newDesktopRoot = function newDesktopRoot() {
    /*
    This module represents the execution root of the Desktop App.
    We use this module that is outside the Desktop folder to 
    load all node dependencies and get them ready to the actual App.
    */
    let thisObject = {
        run: run
    }

    return thisObject

    async function run() {
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
            util: require('util'),
            path: require('path'),
            web3: require('web3'),
            ws: require('ws'),
            open: require('open'),
            http: require('http'),
            octokit: require("@octokit/rest"),
            simpleGit: require('simple-git'),
            nodeFetch: require('node-fetch')
        }

        /*
        Setting up Secrets.
        */
        SA.secrets = {
            array: require('./My-Secrets/Secrets.json'),
            map: new Map()
        }
        for (let i = 0; i < SA.secrets.array.length; i++) {
            let secret = SA.secrets.array[i]
            SA.secrets.map.set (secret.codeName, secret)
        }

        run()

        async function run() {
            DK.app = require('./Desktop/DesktopApp.js').newDesktopApp()
            await DK.app.run()
            console.log('Superalgos Desktop App is Running!')
        }
    }
}