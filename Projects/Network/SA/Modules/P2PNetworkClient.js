exports.newNetworkModulesP2PNetworkClient = function newNetworkModulesP2PNetworkClient() {
    /*
    This module represents the P2P Network and it holds all the infranstructure
    needed to interact with it.
    */
    let thisObject = {
        appBootstrapingProcess: undefined,
        p2pNetworkClientIdentity: undefined,
        p2pNetworkReachableNodes: undefined,
        p2pNetworkPeers: undefined,
        p2pNetworkInterface: undefined,
        socialGraph: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize(
        signingAccount
    ) {

        await setupNetwork()
        await setupServices()

        async function setupNetwork() {
            /*
            We set up ourselves as a Network Client.
            */
            thisObject.p2pNetworkClientIdentity = SA.projects.network.modules.p2pNetworkClientIdentity.newNetworkModulesP2PNetworkClientIdentity()
            /*
            We will read all user profiles plugins and get from there our network identity.
            */
            thisObject.appBootstrapingProcess = SA.projects.network.modules.appBootstrapingProcess.newNetworkModulesAppBootstrapingProcess()
            await thisObject.appBootstrapingProcess.run(signingAccount, thisObject.p2pNetworkClientIdentity)
            /*
            We set up the P2P Network.
            */
            thisObject.p2pNetworkReachableNodes = SA.projects.network.modules.p2pNetworkReachableNodes.newNetworkModulesP2PNetworkReachableNodes()
            await thisObject.p2pNetworkReachableNodes.initialize(
                'Network Client',
                global.env.DESKTOP_TARGET_NETWORK_CODENAME,
                global.env.DESKTOP_TARGET_NETWORK_TYPE,
                thisObject.p2pNetworkClientIdentity
            )
            /*
            This is where we will process all the events comming from the p2p network.
            */
            thisObject.p2pNetworkInterface = SA.projects.socialTrading.modules.p2pNetworkInterface.newSocialTradingModulesP2PNetworkInterface()
            /*
            Set up the connections to network nodes.
            */
            thisObject.p2pNetworkPeers = SA.projects.network.modules.p2pNetworkPeers.newNetworkModulesP2PNetworkPeers()
            await thisObject.p2pNetworkPeers.initialize(
                'Network Client',
                thisObject.p2pNetworkClientIdentity,
                thisObject.p2pNetworkReachableNodes,
                thisObject.p2pNetworkInterface,
                global.env.DESKTOP_APP_MAX_OUTGOING_PEERS
            )
        }

        async function setupServices() {
            /*
            This is the Social Graph Network Service Client that will allow us to 
            send Queries or Events to it. 
            */
            thisObject.socialGraph = DK.projects.socialTrading.modules.socialGraph.newSocialTradingModulesSocialGraph()
            await thisObject.socialGraph.initialize()
        }
    }
}