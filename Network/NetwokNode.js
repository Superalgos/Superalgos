exports.newNetworkNode = function newNetworkNode() {

    let thisObject = {
        appBootstrapingProcess: undefined,
        p2pNetwork: undefined,
        p2pNetworkPeers: undefined,
        p2pNetworkNode: undefined,
        webSocketsInterface: undefined,
        httpInterface: undefined,
        socialGraphService: undefined,
        storage: undefined,
        run: run
    }

    NT.networkNode = thisObject

    return thisObject

    async function run() {

        await setupNetwork()
        await setupServices()

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
            thisObject.appBootstrapingProcess = SA.projects.network.modules.appBootstrapingProcess.newNetworkModulesAppBootstrapingProcess()
            await thisObject.appBootstrapingProcess.initialize(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT, thisObject.p2pNetworkNode)
            /*
            Let's discover which are the nodes at the p2p network and have an array of nodes
            to which we can connect to. This module will run the rules of who we can connect to.
            */
            thisObject.p2pNetwork = SA.projects.network.modules.p2pNetwork.newNetworkModulesP2PNetwork()
            await thisObject.p2pNetwork.initialize('Network Peer')
            /*
            Set up a pool of connections to different network nodes, so that later
            we can send a message to any of them.
            */
            thisObject.p2pNetworkPeers = SA.projects.network.modules.p2pNetworkPeers.newNetworkModulesP2PNetworkPeers()
            await thisObject.p2pNetworkPeers.initialize(
                'Network Peer',
                thisObject.p2pNetworkNode,
                thisObject.p2pNetwork,
                thisObject.p2pNetworkInterface,
                global.env.P2P_NETWORK_NODE_MAX_OUTGOING_PEERS
            )
        }

        async function setupServices() {
            /*
            The Social Graph Service is the first and for now, the only service this Network Node provides.
            TODO: Only if the service is configured at the User Profile.
            */
            thisObject.socialGraphService = NT.projects.socialTrading.modules.socialGraph.newNetworkModulesSocialGraph()
            await thisObject.socialGraphService.initialize()
            /*
            The Storage deals with persisting the Social Graph.
            */
            thisObject.storage = NT.projects.socialTrading.modules.storage.newSocialTradingModulesStorage()
            thisObject.storage.initialize()
            /*
            Other Network Nodes and Client Apps will communicate with this Network Node via it's Websocket Interface.
            */
            thisObject.webSocketsInterface = NT.projects.network.modules.webSocketsInterface.newNetworkModulesWebSocketsInterface()
            thisObject.webSocketsInterface.initialize()
            console.log('Network Node Web Sockets Interface ........................................... Listening at port ' + NT.networkNode.p2pNetworkNode.node.config.webSocketsPort)
            /*
            Other Network Nodes and Client Apps will communicate with this Network Node via it's HTTP Interface.
            */
            thisObject.httpInterface = NT.projects.network.modules.httpInterface.newNetworkModulesHttpInterface()
            thisObject.httpInterface.initialize()
            console.log('Network Node Http Interface .................................................. Listening at port ' + NT.networkNode.p2pNetworkNode.node.config.webPort)
        }
    }
}
