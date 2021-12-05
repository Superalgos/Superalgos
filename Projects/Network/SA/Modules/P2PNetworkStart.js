exports.newNetworkModulesP2PNetworkStart = function newNetworkModulesP2PNetworkStart() {
    /*
    This module assumes the p2p network is formed by network nodes connected to each other
    not randombly but as a directed acyclic graph.

    https://en.wikipedia.org/wiki/Directed_acyclic_graph

    This module will identify which are the Start Nodes of the DAG, and be ready to send
    messages via the http interface of nodes to some of them.
    */
    let thisObject = {
        peers: undefined,
        sendMessage: sendMessage,

        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    const RECONNECT_DELAY = 10 * 1000
    let intervalIdConnectToPeers

    return thisObject

    function finalize() {
        thisObject.peers = undefined
        clearInterval(intervalIdConnectToPeers)
    }

    async function initialize(
        callerRole,
        p2pNetworkClientIdentity,
        p2pNetwork,
        maxOutgoingPeers
    ) {

        thisObject.peers = []

        connectToPeers()
        intervalIdConnectToPeers = setInterval(connectToPeers, RECONNECT_DELAY);

        async function connectToPeers() {

            if (thisObject.peers.length >= maxOutgoingPeers) { return }

            for (let i = 0; i < p2pNetwork.p2pNodesToConnect.length; i++) {
                if (thisObject.peers.length >= maxOutgoingPeers) { break }

                let peer = {
                    p2pNetworkNode: undefined,
                    httpClient: undefined
                }

                peer.p2pNetworkNode = p2pNetwork.p2pNodesToConnect[i]
                if (isPeerConnected(peer) === true) { continue }
                if (isPeerOnline(peer) === false) { continue }

                thisObject.peers.push(peer)

            }

            function isPeerConnected(peer) {
                for (let i = 0; i < thisObject.peers.length; i++) {
                    let connectedPeer = thisObject.peers[i]
                    if (connectedPeer.p2pNetworkNode.node.id === peer.p2pNetworkNode.node.id) {
                        return true
                    }
                }
            }

            async function isPeerOnline(peer) {
                /*
                Test if the peer is actually online.
                */
                if (peer.httpClient === undefined) {
                    peer.httpClient = SA.projects.network.modules.webHttpNetworkClient.newNetworkModulesHttpNetworkClient()
                    peer.httpClient.initialize(callerRole, p2pNetworkClientIdentity, peer.p2pNetworkNode)
                }

                return true // TODO:: actually check if this node is online
            }
        }
    }

    async function sendMessage(message) {
        /*
        This function will send the message from a random picked network node
        selected from the array of already verified online peers.
        */
        let peerIndex = Math.max(Math.round(Math.random() * thisObject.peers.length) - 1, 0)
        let peer = thisObject.peers[peerIndex]
        return await peer.httpClient.sendMessage(message)
    }
}