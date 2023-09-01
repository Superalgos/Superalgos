exports.newSocialTradingAppBackend = function newSocialTradingAppBackend() {
    /*
The ST object is accessible everywhere at the Superalgos Social Trading App.
It provides access to all modules built for this App.
*/
    global.ST = {}
    /*
    The SA object is accessible everywhere at the Superalgos Social Trading App.
    It provides access to all modules built for Superalgos in general.
    */
    global.SA = {}

    let thisObject = {
        webSocketsInterface: undefined,
        httpInterface: undefined,
        webAppInterface: undefined,
        p2pNetworkInterface: undefined,
        p2pNetworkClient: undefined,
        run: run
    }

    ST.socialTradingApp = thisObject

    return thisObject


    async function run(debugSettings) {


        /* Load Environment Variables */
        let ENVIRONMENT = require('../../Environment.js');
        global.env = ENVIRONMENT.newEnvironment();

        if (debugSettings !== undefined && debugSettings.SOCIALTRADING_APP_SIGNING_ACCOUNT !== undefined) {
            global.env.SOCIALTRADING_APP_SIGNING_ACCOUNT = debugSettings.SOCIALTRADING_APP_SIGNING_ACCOUNT
        }
        /*
        First thing is to load the project schema file.
        */
        global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
        /*
        Setting up the modules that will be available, defined at the Project Schema file.
        */
        let MULTI_PROJECT = require('../../MultiProject.js');
        let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
        MULTI_PROJECT_MODULE.initialize(ST, 'ST')
        MULTI_PROJECT_MODULE.initialize(SA, 'SA')
        /*
        Setting up external dependencies.
        */
        /* TODO gonza, check whats not needed from here*/
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
            axios: require('axios'),
            crypto: require('crypto')
        }
        SA.version = require('../../package.json').version
        /*
        Setting up the App Schema Memory Map.
        */
        let APP_SCHEMAS = require('../../AppSchemas.js')
        let APP_SCHEMAS_MODULE = APP_SCHEMAS.newAppSchemas()
        await APP_SCHEMAS_MODULE.initialize()
        /*
        Setting up Secrets.
        */
        let SECRETS = require('../../Secrets.js').newSecrets()
        SECRETS.initialize()


        /* Social Trading App Interfaces */
        let WEB_APP_INTERFACE_MODULE = require('./Client/webAppInterface.js')
        let P2P_NETWORK_INTERFACE_MODULE = require('./Client/p2pNetworkInterface.js')

        await initialSetupInterfaces()
        await setupNetwork()
        await finalSetupInterfaces()

        async function initialSetupInterfaces() {
            /*
            This is what we are going to use to send messages to the P2P Network.
            */
            thisObject.webAppInterface = WEB_APP_INTERFACE_MODULE.newWebAppInterface()
            thisObject.webAppInterface.initialize()
            /*
            This is what we are going to use to receive events from the P2P Network.
            */
            thisObject.p2pNetworkInterface = P2P_NETWORK_INTERFACE_MODULE.newP2PNetworkInterface()
            thisObject.p2pNetworkInterface.initialize()
        }

        async function setupNetwork() {
            /*
            We set up the P2P Network Client.
            */
            thisObject.p2pNetworkClient = SA.projects.network.modules.p2pNetworkClient.newNetworkModulesP2PNetworkClient()
            /*
            Emulate the P2PClientNode that when we are at the Platform UI is defined by Users at the Task Level. In this 
            case the user does not need to set it up, so we do it here, with the right settings for the Social Trading App.
            */
            let P2P_NETWORK_CLIENT_DEFINITION = require('./Client/P2PNetworkClient2.json')

            let SOCIALTRADING_APP_UPDATE_PROFILES = false   /* Update all profiles from Github Repo */
            let SOCIALTRADING_BOT_REFERENCE                 /* Referenced Social Trading Bots connected to Task Servers, remains undefined here */

            thisObject.p2pNetworkClient = SA.projects.network.modules.p2pNetworkClient.newNetworkModulesP2PNetworkClient()
            await thisObject.p2pNetworkClient.initialize(
                global.env.SOCIALTRADING_APP_SIGNING_ACCOUNT,
                global.env.SOCIALTRADING_TARGET_NETWORK_TYPE,
                global.env.SOCIALTRADING_TARGET_NETWORK_CODENAME,
                global.env.SOCIALTRADING_APP_MAX_OUTGOING_PEERS,
                global.env.SOCIALTRADING_APP_MAX_OUTGOING_START_PEERS,
                thisObject.p2pNetworkInterface.eventReceived,
                P2P_NETWORK_CLIENT_DEFINITION,
                SOCIALTRADING_APP_UPDATE_PROFILES,
                SOCIALTRADING_BOT_REFERENCE
            )
        }

        async function finalSetupInterfaces() {
            /* 
            These are the Network Interfaces by which the Web App interacts with this Desktop Client.
            */
            let express = require('./backend/src/expressServer.js')
            express.DesktopBackend(ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort, SA, ST);
            console.log(`express Interface ................................................ Listening at port ${ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort}`);
        }
    }
}


let app = this.newSocialTradingAppBackend();
app.run();