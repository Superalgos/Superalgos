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

    async function run(debugSettings) {
        /* 
        The NT object is accessible everywhere at the Superalgos Network.
        It provides access to all modules built for this Network.
        */
        global.NT = {}
        /* 
        The SA object is accessible everywhere at the Superalgos Network.
        It provides access to all modules built for Superalgos in general.
        */
        global.SA = {}
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
            simpleGit: require('simple-git')
        }
        /*
        Setting up Secrets.
        */
        try {
            SA.secrets = {
                array: require('./My-Secrets/Secrets.json').secrets,
                map: new Map()
            }
        } catch (err) {
            SA.secrets = {
                array: [],
                map: new Map()
            }
        }

        for (let i = 0; i < SA.secrets.array.length; i++) {
            let secret = SA.secrets.array[i]
            SA.secrets.map.set(secret.nodeCodeName, secret)
        }

        NT.app = require('./Network/NetwokNode.js').newNetworkNode()
        NT.app.run()

        console.log('Superalgos Network is Running.')
    }
}