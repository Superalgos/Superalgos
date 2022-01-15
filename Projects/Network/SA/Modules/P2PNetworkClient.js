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
        p2pNetworkInterface: undefined,
        socialGraphNetworkServiceClient: undefined,
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
        maxOutgoingPeers
    ) {

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
            This is where we will process all the events comming from the p2p network.
            */
            thisObject.p2pNetworkInterface = SA.projects.socialTrading.modules.p2pNetworkInterface.newSocialTradingModulesP2PNetworkInterface()
            /*
            Set up the connections to network nodes.
            */
            thisObject.p2pNetworkNodesConnectedTo = SA.projects.network.modules.p2pNetworkNodesConnectedTo.newNetworkModulesP2PNetworkNodesConnectedTo()
            await thisObject.p2pNetworkNodesConnectedTo.initialize(
                'Network Client',
                thisObject.p2pNetworkClientIdentity,
                thisObject.p2pNetworkReachableNodes,
                thisObject.p2pNetworkInterface,
                maxOutgoingPeers
            )
        }

        async function setupNetworkServices() {
            /*
            This is the Social Graph Network Service Client that will allow us to 
            send Queries or Events to it. 
            */
            thisObject.socialGraphNetworkServiceClient = DK.projects.socialTrading.modules.socialGraphNetworkServiceClient.newSocialTradingModulesSocialGraphNetworkServiceClient()
            await thisObject.socialGraphNetworkServiceClient.initialize(
                userAppSigningAccountCodeName,
                thisObject.p2pNetworkNodesConnectedTo
            )
        }
    }
}