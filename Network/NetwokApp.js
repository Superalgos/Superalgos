exports.newNetworkApp = function newNetworkApp() {

    let thisObject = {
        p2pNetworkReachableNodes: undefined,
        p2pNetworkNodesConnectedTo: undefined,
        p2pNetworkNode: undefined,
        webSocketsInterface: undefined,
        httpInterface: undefined,
        socialGraphNetworkService: undefined,
        machineLearningNetworkService: undefined,
        tradingSignalsNetworkService: undefined,
        run: run
    }

    NT.networkApp = thisObject
    const NETWORK_NODE_VERSION = 2

    return thisObject

    async function run() {

        await setupNetwork()
        await setupNetworkServices()
        setupNetworkInterfaces()

        SA.logger.info('Network Node User Profile Code Name .......................................... ' + thisObject.p2pNetworkNode.userProfile.config.codeName)
        SA.logger.info('Network Node User Profile Balance ............................................ ' + SA.projects.governance.utilities.balances.toSABalanceString(thisObject.p2pNetworkNode.userProfile.balance))
        SA.logger.info('Network Node Code Name ....................................................... ' + thisObject.p2pNetworkNode.node.config.codeName)
        SA.logger.info('Minimum User Profile Balance Required to Connect to this Network Node ........ ' + SA.projects.governance.utilities.balances.toSABalanceString(thisObject.p2pNetworkNode.node.config.clientMinimunBalance))
        SA.logger.info('Minimum Token Power Allocation Required to Connect to this Network Node ...... ' + SA.projects.governance.utilities.balances.toSABalanceString(thisObject.p2pNetworkNode.node.config.clientMinTokenAllocation))
        SA.logger.info('Network Node Version ......................................................... ' + NETWORK_NODE_VERSION)
        SA.logger.info('Network Type ................................................................. ' + thisObject.p2pNetworkNode.node.p2pNetworkReference.referenceParent.type)
        SA.logger.info('Network Code Name ............................................................ ' + thisObject.p2pNetworkNode.node.p2pNetworkReference.referenceParent.config.codeName)
        SA.logger.info('Network App .................................................................. Running')
        SA.logger.info(' ')

        async function setupNetwork() {
            /*
            We set up ourselves as a Network Node and store there
            an object representing ourselves (this instance). The properties of this object
            are going to be set afterwards at the bootstrapping process.
            */
            thisObject.p2pNetworkNode = SA.projects.network.modules.p2pNetworkNode.newNetworkModulesP2PNetworkNode()
            /*
            We will read all user profiles plugins and get from there our network identity.
            This is what we call the bootstrap process.
            */
            let appBootstrapingProcess = SA.projects.network.modules.appBootstrapingProcess.newNetworkModulesAppBootstrapingProcess()
            await appBootstrapingProcess.initialize(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT, thisObject.p2pNetworkNode, true, true)
            /*
            Let's discover which are the nodes at the p2p network and have an array of nodes
            to which we can connect to. This module will run the rules of who we can connect to.
            */
            thisObject.p2pNetworkReachableNodes = SA.projects.network.modules.p2pNetworkReachableNodes.newNetworkModulesP2PNetworkReachableNodes()
            await thisObject.p2pNetworkReachableNodes.initialize(
                'Network Peer',
                thisObject.p2pNetworkNode.node.p2pNetworkReference.referenceParent.config.codeName,
                thisObject.p2pNetworkNode.node.p2pNetworkReference.referenceParent.type,
                thisObject.p2pNetworkNode
            )
            /*
            Set up a pool of connections to different network nodes, so that later
            we can send a message to any of them.
            */
            thisObject.p2pNetworkNodesConnectedTo = SA.projects.network.modules.p2pNetworkNodesConnectedTo.newNetworkModulesP2PNetworkNodesConnectedTo()
            await thisObject.p2pNetworkNodesConnectedTo.initialize(
                'Network Peer',
                thisObject.p2pNetworkNode,
                thisObject.p2pNetworkReachableNodes,
                thisObject.p2pNetworkInterface,
                global.env.P2P_NETWORK_NODE_MAX_OUTGOING_PEERS
            )
        }

        async function setupNetworkServices() {
            if (
                thisObject.p2pNetworkNode.node.networkServices !== undefined &&
                thisObject.p2pNetworkNode.node.networkServices.socialGraph !== undefined
            ) {
                thisObject.socialGraphNetworkService = NT.projects.socialTrading.modules.socialGraphNetworkService.newSocialTradingModulesSocialGraphNetworkService()
                await thisObject.socialGraphNetworkService.initialize(
                    thisObject.p2pNetworkNode,
                    thisObject.p2pNetworkReachableNodes
                )
                SA.logger.info('Social Graph Network Service ................................................. Running')
            }

            if (
                thisObject.p2pNetworkNode.node.networkServices !== undefined &&
                thisObject.p2pNetworkNode.node.networkServices.machineLearning !== undefined
            ) {
                thisObject.machineLearningNetworkService = NT.projects.bitcoinFactory.modules.machineLearningNetworkService.newBitcoinFactoryModulesMachineLearningNetworkService()
                await thisObject.machineLearningNetworkService.initialize(
                    thisObject.p2pNetworkNode,
                    thisObject.p2pNetworkReachableNodes
                )
                SA.logger.info('Machine Learning Network Service ............................................. Running')
            }

            if (
                thisObject.p2pNetworkNode.node.networkServices !== undefined &&
                thisObject.p2pNetworkNode.node.networkServices.tradingSignals !== undefined
            ) {
                thisObject.tradingSignalsNetworkService = NT.projects.tradingSignals.modules.tradingSignalsNetworkService.newTradingSignalsModulesTradingSignalsNetworkService()
                await thisObject.tradingSignalsNetworkService.initialize()
                SA.logger.info('Trading Signals Network Service .............................................. Running')
            }
        }

        function setupNetworkInterfaces() {
            if (
                thisObject.p2pNetworkNode.node.networkInterfaces !== undefined &&
                thisObject.p2pNetworkNode.node.networkInterfaces.websocketsNetworkInterface !== undefined
            ) {
                /*
                 Other Network Nodes and Client Apps will communicate with this Network Node via it's Websocket Interface.
                 */
                thisObject.webSocketsInterface = NT.projects.network.modules.webSocketsInterface.newNetworkModulesWebSocketsInterface()
                thisObject.webSocketsInterface.initialize()
                SA.logger.info('Network Node Web Sockets Interface ........................................... Listening at port ' + NT.networkApp.p2pNetworkNode.node.networkInterfaces.websocketsNetworkInterface.config.webSocketsPort)
            }
            /*
             TODO this breaks the network if uncommented with a complete p2p node tree setted up
            if (
                thisObject.p2pNetworkNode.node.networkInterfaces !== undefined &&
                thisObject.p2pNetworkNode.node.networkInterfaces.webrtcNetworkInterface !== undefined
            ) {
                /!*
                 Other Network Nodes and Client Apps will communicate with this Network Node via it's WebRTC Interface.
                 *!/
                thisObject.webSocketsInterface = NT.projects.network.modules.webSocketsInterface.newNetworkModulesWebRTCInterface()
                thisObject.webSocketsInterface.initialize()
                SA.logger.info('Network Node Web Sockets Interface ........................................... Interface Node Id ' + '')
            }
             */
            if (
                thisObject.p2pNetworkNode.node.networkInterfaces !== undefined &&
                thisObject.p2pNetworkNode.node.networkInterfaces.httpNetworkInterface !== undefined
            ) {
                /*
                Other Network Nodes and Client Apps will communicate with this Network Node via it's HTTP Interface.
                */
                thisObject.httpInterface = NT.projects.network.modules.httpInterface.newNetworkModulesHttpInterface()
                thisObject.httpInterface.initialize()
                SA.logger.info('Network Node Http Interface .................................................. Listening at port ' + NT.networkApp.p2pNetworkNode.node.networkInterfaces.httpNetworkInterface.config.httpPort)
            }
        }
    }
}
