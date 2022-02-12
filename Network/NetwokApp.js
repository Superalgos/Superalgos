exports.newNetworkApp = function newNetworkApp() {

    let thisObject = {
        p2pNetworkReachableNodes: undefined,
        p2pNetworkNodesConnectedTo: undefined,
        p2pNetworkNode: undefined,
        webSocketsInterface: undefined,
        httpInterface: undefined,
        socialGraphNetworkService: undefined,
        tradingSignalsNetworkService: undefined,
        run: run
    }

    NT.networkApp = thisObject

    return thisObject

    async function run() {

        await setupNetwork()
        await setupNetworkServices()
        setupNetworkInterfaces()

        console.log('Network Type ................................................................. ' + thisObject.p2pNetworkNode.node.p2pNetworkReference.referenceParent.type)
        console.log('Network Code Name ............................................................ ' + thisObject.p2pNetworkNode.node.p2pNetworkReference.referenceParent.config.codeName)
        console.log('Network App .................................................................. Running')
        console.log(' ')

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
            await appBootstrapingProcess.run(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT, thisObject.p2pNetworkNode)
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
                console.log('Social Graph Network Service ................................................. Running')
            }

            if (
                thisObject.p2pNetworkNode.node.networkServices !== undefined &&
                thisObject.p2pNetworkNode.node.networkServices.tradingSignals !== undefined
            ) {
                thisObject.tradingSignalsNetworkService = NT.projects.tradingSignals.modules.tradingSignalsNetworkService.newTradingSignalsModulesTradingSignalsNetworkService()
                await thisObject.tradingSignalsNetworkService.initialize()
                console.log('Trading Signals Network Service .............................................. Running')
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
                console.log('Network Node Web Sockets Interface ........................................... Listening at port ' + NT.networkApp.p2pNetworkNode.node.networkInterfaces.websocketsNetworkInterface.config.webSocketsPort)
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
                console.log('Network Node Web Sockets Interface ........................................... Interface Node Id ' + '')
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
                console.log('Network Node Http Interface .................................................. Listening at port ' + NT.networkApp.p2pNetworkNode.node.networkInterfaces.httpNetworkInterface.config.httpPort)
            }
        }
    }
}
