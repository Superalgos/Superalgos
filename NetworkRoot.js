exports.newNetworkRoot = function newNetworkRoot() {
    /*
    This module represents the execution root of the Network Node.
    We use this module that is outside the Network folder to 
    load all node dependencies and get them ready to the actual node.
    */
    let thisObject = {
        run: run
    }

    return thisObject

    async function run(debugSettings, networkFilters) {
        /* 
        The NT object is accessible everywhere at the Superalgos Network.
        It provides access to all modules built for this Network.
        */
        global.NT = {}
        /* 
        The SA object is accessible everywhere at the Superalgos Network.
        It provides access to all modules built for Superalgos in general.
        */
        global.SA = {networkFilters}
        /* Load Environment Variables */
        let ENVIRONMENT = require('./Environment.js');
        let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
        global.env = ENVIRONMENT_MODULE

        if (debugSettings !== undefined && debugSettings.P2P_NETWORK_NODE_SIGNING_ACCOUNT !== undefined) {
            global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT = debugSettings.P2P_NETWORK_NODE_SIGNING_ACCOUNT
        }
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
            path: require('path'),
            util: require('util'),
            http: require('http'),
            nodeFetch: require('node-fetch'),
            web3: require('web3'),
            ws: require('ws'),
            simpleGit: require('simple-git'),
            graphql: require("@octokit/graphql"),
            axios: require('axios'),
            crypto: require('crypto'),
            octokit: require('@octokit/rest'),
            childProcess: require('child_process')
        }
        SA.version = require('./package.json').version

        const saLogsPath = SA.nodeModules.path.join(global.env.PATH_TO_LOG_FILES, 'Network')
        SA.logger = require('./loggerFactory').loggerFactory(saLogsPath, 'NT')

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

        /*
         * If the network is using a local database then check and run any migrations first
         */
        if(global.env.DATABASE.TYPE == 'database') {
            await SA.projects.localStorage.globals.persistence.newPersistenceStore(global.env.DATABASE.TYPE, 'migrate')
                .then(() => SA.logger.info('Database migrations have run'))
        }

        NT.app = require('./Network/NetwokApp.js').newNetworkApp()
        NT.app.run()
    }
}