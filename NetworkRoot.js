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

    async function run() {
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
            fs: SA.nodeModules.fs,
            nodeFetch: require('node-fetch'),
            web3: require('web3'),
            ws: require('ws')
        }

        /*
        We will use this User Profile for testing purposes.
        {
            "githubUsername": "Test-Network-Node-Profile",
            "address": "0xa153469c57A91F5a59Fc6c45A37aD8dbad85e417",
            "privateKey": "0xac498ae59407e6b68429a814f64da2339550f93a767578e28c161ff119159271"
        }
        */
        NT.NETWORK_NODE_USER_PROFILE_HANDLE = "Test-Network-Node-Profile"
        NT.NETWORK_NODE_USER_PROFILE_PRIVATE_KEY = "0xac498ae59407e6b68429a814f64da2339550f93a767578e28c161ff119159271"

        NT.app = require('./Network/NetwokNode.js').newNetworkNode()
        NT.app.run()

        console.log('Superalgos Network is Running.')
    }
}