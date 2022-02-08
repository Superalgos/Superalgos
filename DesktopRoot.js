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

    async function run(debugSettings) {
        /* 
        The DK object is accessible everywhere at the Superalgos Desktop App.
        It provides access to all modules built for this App.
        */
        global.DK = {}
        /* 
        The SA object is accessible everywhere at the Superalgos Desktop App.
        It provides access to all modules built for Superalgos in general.
        */
        global.SA = {}
        /* Load Environment Variables */
        let ENVIRONMENT = require('./Environment.js');
        let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
        global.env = ENVIRONMENT_MODULE

        if (debugSettings !== undefined && debugSettings.DESKTOP_APP_SIGNING_ACCOUNT !== undefined) {
            global.env.DESKTOP_APP_SIGNING_ACCOUNT = debugSettings.DESKTOP_APP_SIGNING_ACCOUNT
        }
        /*
        First thing is to load the project schema file.
        */
        global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
        /* 
        Setting up the modules that will be available, defined at the Project Schema file. 
        */
        let MULTI_PROJECT = require('./MultiProject.js')
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
            nodeFetch: require('node-fetch'),
            graphql: require("@octokit/graphql"),
            axios: require('axios'),
            crypto: require('crypto')
        }
        SA.version = require('./package.json').version
        /* 
        Setting up the App Schema Memory Map. 
        */
        let APP_SCHEMAS = require('./AppSchemas.js')
        let APP_SCHEMAS_MODULE = APP_SCHEMAS.newAppSchemas()
        await APP_SCHEMAS_MODULE.initialize()
        /*
        Setting up Secrets.
        */
        let SECRETS = require('./Secrets.js').newSecrets()
        SECRETS.initialize()

        run()

        async function run() {
            DK.app = require('./Desktop/DesktopApp.js').newDesktopApp()
            await DK.app.run()
            console.log('Superalgos Desktop App is Running!')
        }
    }
}