exports.newDesktopAppBackend = function newDesktopAppBackend() {
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

    let thisObject = {
        webSocketsInterface: undefined,
        httpInterface: undefined,
        webAppInterface: undefined,
        p2pNetworkInterface: undefined,
        p2pNetworkClient: undefined,
        run: run
    }

    DK.desktopApp = thisObject

    return thisObject


    async function run(debugSettings) {


        /* Load Environment Variables */
        let ENVIRONMENT = require('../Environment.js');
        global.env = ENVIRONMENT.newEnvironment();

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
        let MULTI_PROJECT = require('../MultiProject.js');
        let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
        MULTI_PROJECT_MODULE.initialize(DK, 'DK')
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
        SA.version = require('../package.json').version
        /*
        Setting up the App Schema Memory Map.
        */
        let APP_SCHEMAS = require('../AppSchemas.js')
        let APP_SCHEMAS_MODULE = APP_SCHEMAS.newAppSchemas()
        await APP_SCHEMAS_MODULE.initialize()
        /*
        Setting up Secrets.
        */
        let SECRETS = require('../Secrets.js').newSecrets()
        SECRETS.initialize()


        /* Desktop App Interfaces */
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
            await thisObject.p2pNetworkClient.initialize(
                global.env.DESKTOP_APP_SIGNING_ACCOUNT,
                global.env.DESKTOP_TARGET_NETWORK_TYPE,
                global.env.DESKTOP_TARGET_NETWORK_CODENAME,
                global.env.DESKTOP_APP_MAX_OUTGOING_PEERS,
                global.env.DESKTOP_APP_MAX_OUTGOING_START_PEERS,
                thisObject.p2pNetworkInterface.eventReceived
            )
        }

        async function finalSetupInterfaces() {
            /* 
            These are the Network Interfaces by which the Web App interacts with this Desktop Client.
            */
            let express = require('./backend/src/expressServer.js')
            express.DesktopBackend(DK.desktopApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort, SA, DK);
            console.log(`express Interface ................................................ Listening at port ${DK.desktopApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort}`);
        }
    }
}


let app = this.newDesktopAppBackend();
app.run();