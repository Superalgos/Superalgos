const express = require("./backend/src/index");
exports.newDesktopApp = function newDesktopApp() {

    let thisObject = {
        userProfiles: undefined,
        p2pNetworkClientIdentity: undefined,
        p2pNetwork: undefined,
        p2pNetworkPeers: undefined,
        webSocketsInterface: undefined,
        webAppInterface: undefined,
        p2pNetworkInterface: undefined,
        socialGraph: undefined,
        run: run
    }

    DK.desktopApp = thisObject

    return thisObject

    async function run() {

        await setupNetwork()
        await setupServices()

        async function setupNetwork() {
            /*
            We set up ourselves as a Network Client.
            */
            thisObject.p2pNetworkClientIdentity = SA.projects.network.modules.p2pNetworkClientIdentity.newNetworkModulesP2PNetworkClientIdentity()
            await thisObject.p2pNetworkClientIdentity.initialize()
            /*
            We will read all user profiles plugins and get from there our network identity.
            */
            thisObject.userProfiles = SA.projects.network.modules.userProfiles.newNetworkModulesUserProfiles()
            await thisObject.userProfiles.initialize(global.env.DESKTOP_APP_SIGNING_ACCOUNT, thisObject.p2pNetworkClientIdentity)
            /*
            We set up the P2P Network.
            */
            thisObject.p2pNetwork = SA.projects.network.modules.p2pNetwork.newNetworkModulesP2PNetwork()
            await thisObject.p2pNetwork.initialize('Network Client')
            /*
            Set up the connections to network nodes.
            */
            thisObject.p2pNetworkPeers = SA.projects.network.modules.p2pNetworkPeers.newNetworkModulesP2PNetworkPeers()
            await thisObject.p2pNetworkPeers.initialize(
                'Network Client',
                thisObject.p2pNetworkClientIdentity,
                thisObject.p2pNetwork,
                global.env.DESKTOP_APP_MAX_OUTGOING_PEERS
            )
        }

        async function setupServices() {
            /*
            This is where we will process all the messages comming from our web app.
            */
            thisObject.webAppInterface = DK.projects.socialTrading.modules.webAppInterface.newSocialTradingModulesWebAppInterface() // this sends events to the p2p network
            /*
            This is where we will process all the events comming from the p2p network.
            */
            thisObject.p2pNetworkInterface = DK.projects.socialTrading.modules.p2pNetworkInterface.newSocialTradingModulesP2PNetworkInterface() // this receives events from p2p network
            /*
            This is the Personal Social Graph for the user running this App.
            */
            thisObject.socialGraph = DK.projects.socialTrading.modules.socialGraph.newSocialTradingModulesSocialGraph() //
            await thisObject.socialGraph.initialize()


            let express = require('./backend/src/index')
            let expressPort = JSON.parse(DK.desktopApp.p2pNetworkClientIdentity.node.config).webPort;
            express.startExpress(expressPort,SA);
            console.log('express Interface ................................................ Listening at port ' + expressPort);

            /*TODO change this to have a definite port number*/
            let react = require('./frontend/scripts/start')
            let reactPort = (+JSON.parse(DK.desktopApp.p2pNetworkClientIdentity.node.config).webPort + 1);
            react.start(reactPort);
            console.log('react Interface ................................................ Listening at port ' + reactPort);
        }
    }
}
