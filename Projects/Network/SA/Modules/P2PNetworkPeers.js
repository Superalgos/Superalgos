exports.newNetworkModulesP2PNetworkPeers = function newNetworkModulesP2PNetworkPeers() {
    /*
    This module represents the P2P Nodes we are connected to.
    */
    let thisObject = {
        peers: undefined,

        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.peers = undefined
    }

    async function initialize() {
        /*
        On a first iteration, we will try to connect to 2 Network Peers, one upstream and one downstream,
        meaning one with higher ranking that us, and the other with lower ranking than us.
        */
        thisObject.peers = []
        let totalConnected = 0

        for (let i = 0; i < NT.networkNode.p2pNetwork.p2pNodesToConnect.length; i++) {
            if (totalConnected === 2) { break }
            let peer = {}
            peer.p2pNetworkNode = NT.networkNode.p2pNetwork.p2pNodesToConnect[i]
            peer.webSocketsClient = SA.projects.network.modules.webSocketsNetworkClient.newNetworkModulesWebSocketsNetworkClient()
            await peer.webSocketsClient.initialize('Network Peer', peer.p2pNetworkNode)
                .then(addPeer)
                .catch(onError)

            function addPeer() {
                thisObject.peers.push(peer)
                totalConnected++
            }

            function onError(err) {
                if (err !== undefined) {
                    console.log('[ERROR] P2P Network Peers -> onError -> While connecting to node -> ' + peer.p2pNetworkNode.userProfile.userProfileHandle + ' -> ' + peer.p2pNetworkNode.node.name + ' -> ' + err.message)
                } else {
                    console.log('[WARN] P2P Network Peers -> onError -> Peer Not Available at the Moment -> ' + peer.p2pNetworkNode.userProfile.userProfileHandle + ' -> ' + peer.p2pNetworkNode.node.name)
                }
            }
        }
    }
}