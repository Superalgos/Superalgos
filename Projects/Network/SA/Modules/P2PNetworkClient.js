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
        machineLearningNetworkServiceClient: undefined,
        tradingSignalsNetworkServiceClient: undefined,
        eventReceivedCallbackFunction: undefined,
        pullProfiles: undefined,
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
        eventReceivedCallbackFunction,
        p2pNetworkClientNode,
        pullProfiles,
        socialTradingBotReference
    ) {

        thisObject.eventReceivedCallbackFunction = eventReceivedCallbackFunction // This is the function that will be called when an event / signal is received from the p2p Network.

        await setupNetwork()
        await setupNetworkServices()

        async function setupNetwork() {
            /*
            We set up ourselves as a Network Client.
            */
            thisObject.p2pNetworkClientIdentity = SA.projects.network.modules.p2pNetworkClientIdentity.newNetworkModulesP2PNetworkClientIdentity()
            /*
            We will read all User Profiles plugins and get from there our network identity.
            */
            thisObject.appBootstrapingProcess = SA.projects.network.modules.appBootstrapingProcess.newNetworkModulesAppBootstrapingProcess()
            await thisObject.appBootstrapingProcess.initialize(
                userAppSigningAccountCodeName,
                thisObject.p2pNetworkClientIdentity,
                pullProfiles
            )
            SA.logger.info('Network Client User Profile Code Name ........................................ ' + thisObject.p2pNetworkClientIdentity.userProfile.config.codeName)
            SA.logger.info('Network Client User Profile Balance .......................................... ' + SA.projects.governance.utilities.balances.toSABalanceString(thisObject.p2pNetworkClientIdentity.userProfile.balance))
            SA.logger.info('')
            /*
            We set up the P2P Network reacheable nodes. This means that we will filter out all the network nodes that do not have the
            network services this Task requires or the Network Interfaces this Task can speak to.
            */
            thisObject.p2pNetworkReachableNodes = SA.projects.network.modules.p2pNetworkReachableNodes.newNetworkModulesP2PNetworkReachableNodes()
            await thisObject.p2pNetworkReachableNodes.initialize(
                'Network Client',
                targetNetworkCodeName,
                targetNetworkType,
                thisObject.p2pNetworkClientIdentity,
                p2pNetworkClientNode,
                thisObject.p2pNetworkClientIdentity.userProfile.config.codeName,
                thisObject.p2pNetworkClientIdentity.userProfile.balance
            )
            /*
            Set up the connections to network nodes. These are websockets connections and in order to do this, 
            we need to know if the Network Client is willing to connect to the WebSockets Interface.

            Remember that p2pNetworkClientNode is undefined when this is run from a Network Node, not a Task Server. 
            */
            if (p2pNetworkClientNode === undefined || p2pNetworkClientNode.networkInterfaces.websocketsNetworkInterface !== undefined) {
                thisObject.p2pNetworkNodesConnectedTo = SA.projects.network.modules.p2pNetworkNodesConnectedTo.newNetworkModulesP2PNetworkNodesConnectedTo()
                await thisObject.p2pNetworkNodesConnectedTo.initialize(
                    'Network Client',
                    thisObject.p2pNetworkClientIdentity,
                    thisObject.p2pNetworkReachableNodes,
                    thisObject,
                    maxOutgoingPeers
                )
            }
            /*
            Set up the connection to start nodes.These are http connections and in order to do this, 
            we need to know if the Network Client is willing to connect to the HTTP Interface.

            Remember that p2pNetworkClientNode is undefined when this is run from a Network Node, not a Task Server. 
            */
            if (p2pNetworkClientNode === undefined || p2pNetworkClientNode.networkInterfaces.httpNetworkInterface !== undefined) {
                thisObject.p2pNetworkStart = SA.projects.network.modules.p2pNetworkStart.newNetworkModulesP2PNetworkStart()
                await thisObject.p2pNetworkStart.initialize(
                    'Network Client',
                    thisObject.p2pNetworkClientIdentity,
                    thisObject.p2pNetworkReachableNodes,
                    maxOutgoingStartPeers
                )
            }
        }

        async function setupNetworkServices() {
            /*
            This is the Social Graph Network Service Client that will allow us to 
            send Queries or Events to it's counterparty running inside a P2P Network Node. 

            Remember that p2pNetworkClientNode is undefined when this is run from a Network Node, not a Task Server. 
            */
            if (p2pNetworkClientNode === undefined || p2pNetworkClientNode.networkServices.socialGraph !== undefined) {
                thisObject.socialGraphNetworkServiceClient = SA.projects.socialTrading.modules.socialGraphNetworkServiceClient.newSocialTradingModulesSocialGraphNetworkServiceClient()
                await thisObject.socialGraphNetworkServiceClient.initialize(
                    userAppSigningAccountCodeName,
                    thisObject.p2pNetworkNodesConnectedTo
                )
            }
            /*
            This is the Machine Learning Network Service Client that will allow us to 
            send Messages to it's counterparty running inside a P2P Network Node. 

            Remember that p2pNetworkClientNode is undefined when this is run from a Network Node, not a Task Server. 
            */
            if (p2pNetworkClientNode === undefined || p2pNetworkClientNode.networkServices.machineLearning !== undefined) {
                thisObject.machineLearningNetworkServiceClient = SA.projects.bitcoinFactory.modules.machineLearningNetworkServiceClient.newBitcoinFactoryModulesMachineLearningNetworkServiceClient()
                await thisObject.machineLearningNetworkServiceClient.initialize(
                    userAppSigningAccountCodeName,
                    thisObject.p2pNetworkNodesConnectedTo
                )
            }
            /*
            This is the Trading Signals Network Service Client that will allow us to 
            send and receive Trading Signals to and from it's counterparty running inside a P2P Network Node. 

            Remember that p2pNetworkClientNode is undefined when this is run from a Network Node, not a Task Server. 
            */
            if (p2pNetworkClientNode === undefined || p2pNetworkClientNode.networkServices.tradingSignals !== undefined) {
                thisObject.tradingSignalsNetworkServiceClient = SA.projects.tradingSignals.modules.tradingSignalsNetworkServiceClient.newTradingSignalsModulesTradingSignalsNetworkServiceClient()
                await thisObject.tradingSignalsNetworkServiceClient.initialize(
                    userAppSigningAccountCodeName,
                    thisObject.p2pNetworkStart,
                    thisObject.p2pNetworkNodesConnectedTo,
                    socialTradingBotReference
                )
            }
        }
    }
}