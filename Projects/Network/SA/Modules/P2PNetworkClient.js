exports.newNetworkModulesP2PNetworkClient = function newNetworkModulesP2PNetworkClient() {
    /*
    This module represents the P2P Network and it holds all the infranstructure
    needed to interact with it.
    */
    let thisObject = {
        appBootstrapingProcess: undefined,
        p2pNetworkClientIdentity: undefined,
        p2pNetworkReachableNodes: undefined,
        p2pNetworkNodesConnectedTo: undefined,
        p2pNetworkStart: undefined,
        socialGraphNetworkServiceClient: undefined,
        tradingSignalsNetworkServiceClient: undefined,
        eventReceivedCallbackFunction: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize(
        userAppSigningAccountCodeName,
        targetNetworkType,
        targetNetworkCodeName,
        maxOutgoingPeers,
        maxOutgoingStartPeers,
        eventReceivedCallbackFunction
    ) {

        thisObject.eventReceivedCallbackFunction = eventReceivedCallbackFunction

        await setupNetwork()
        await setupNetworkServices()

        async function setupNetwork() {
            /*
            We set up ourselves as a Network Client.
            */
            thisObject.p2pNetworkClientIdentity = SA.projects.network.modules.p2pNetworkClientIdentity.newNetworkModulesP2PNetworkClientIdentity()
            /*
            We will read all user profiles plugins and get from there our network identity.
            */
            thisObject.appBootstrapingProcess = SA.projects.network.modules.appBootstrapingProcess.newNetworkModulesAppBootstrapingProcess()
            await thisObject.appBootstrapingProcess.run(
                userAppSigningAccountCodeName,
                thisObject.p2pNetworkClientIdentity
            )
            /*
            We set up the P2P Network reacheable nodes.
            */
            thisObject.p2pNetworkReachableNodes = SA.projects.network.modules.p2pNetworkReachableNodes.newNetworkModulesP2PNetworkReachableNodes()
            await thisObject.p2pNetworkReachableNodes.initialize(
                'Network Client',
                targetNetworkCodeName,
                targetNetworkType,
                thisObject.p2pNetworkClientIdentity
            )
            /*
            Set up the connections to network nodes.
            */
            thisObject.p2pNetworkNodesConnectedTo = SA.projects.network.modules.p2pNetworkNodesConnectedTo.newNetworkModulesP2PNetworkNodesConnectedTo()
            await thisObject.p2pNetworkNodesConnectedTo.initialize(
                'Network Client',
                thisObject.p2pNetworkClientIdentity,
                thisObject.p2pNetworkReachableNodes,
                thisObject,
                maxOutgoingPeers
            )
            /*
            Set up the connection to start nodes.
            */
            thisObject.p2pNetworkStart = SA.projects.network.modules.p2pNetworkStart.newNetworkModulesP2PNetworkStart()
            await thisObject.p2pNetworkStart.initialize(
                'Network Client',
                thisObject.p2pNetworkClientIdentity,
                thisObject.p2pNetworkReachableNodes,
                maxOutgoingStartPeers
            )
        }

        async function setupNetworkServices() {
            /*
            This is the Social Graph Network Service Client that will allow us to 
            send Queries or Events to it's counterparty running inside a P2P Network Node. 
            */
            thisObject.socialGraphNetworkServiceClient = SA.projects.socialTrading.modules.socialGraphNetworkServiceClient.newSocialTradingModulesSocialGraphNetworkServiceClient()
            await thisObject.socialGraphNetworkServiceClient.initialize(
                userAppSigningAccountCodeName,
                thisObject.p2pNetworkNodesConnectedTo
            )
            /*
            This is the Trading Signals Network Service Client that will allow us to 
            send and receive Trading Signals to and from it's counterparty running inside a P2P Network Node. 
            */
            thisObject.tradingSignalsNetworkServiceClient = SA.projects.tradingSignals.modules.tradingSignalsNetworkServiceClient.newTradingSignalsModulesTradingSignalsNetworkServiceClient()
            await thisObject.tradingSignalsNetworkServiceClient.initialize(
                userAppSigningAccountCodeName,
                thisObject.p2pNetworkStart
            )
        }
    }
}