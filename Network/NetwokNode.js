exports.newNetworkNode = function newNetworkNode() {

    let thisObject = {
        userProfiles: undefined,
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
            We set up ourselves as a Network Node.
            */
            thisObject.p2pNetworkNode = SA.projects.network.modules.p2pNetworkNode.newNetworkModulesP2PNetworkNode()
            await thisObject.p2pNetworkNode.initialize()
            /*
            We will read all user profiles plugins and get from there our network identity.
            */
            thisObject.userProfiles = SA.projects.network.modules.userProfiles.newNetworkModulesUserProfiles()
            await thisObject.userProfiles.initialize(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT, thisObject.p2pNetworkNode)
            /*
            Let's discover who is at the p2p network.
            */
            thisObject.p2pNetwork = SA.projects.network.modules.p2pNetwork.newNetworkModulesP2PNetwork()
            await thisObject.p2pNetwork.initialize('Network Peer')
            /*
            Set up the connections to network nodes.
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
