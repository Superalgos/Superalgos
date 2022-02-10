exports.newNetworkModulesP2PNetworkNodesConnectedTo = function newNetworkModulesP2PNetworkNodesConnectedTo() {
    /*
    This module holds the P2P Nodes we are coonected to.
    Here we implement the mechanism to connect via websockets
    to a set of Network Nodes and keep ourselves connected to them
    so that when it is needed we can send messages to them, but also
    we will receive incomming messages from them.
    
    If connections are lost, we will re establish them so as to keep
    ourselves connected to the configured amount of network nodes.

    When an outgoing message is received, it will be rounted to one 
    of our pool of connected nodes. 
    */
    let thisObject = {
        peers: undefined,
        sendMessage: sendMessage,

        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    const RECONNECT_DELAY = 10 * 1000
    const HEALTH_CHECK_DELAY = 1 * 1000
    let intervalIdConnectToPeers
    let intervalIdCheckConnectedToPeers

    return thisObject

    function finalize() {
        thisObject.peers = undefined
        clearInterval(intervalIdConnectToPeers)
        clearInterval(intervalIdCheckConnectedToPeers)
    }

    async function initialize(
        callerRole,
        p2pNetworkClientIdentity,
        p2pNetwork,
        p2pNetworkClient,
        maxOutgoingPeers
    ) {

        thisObject.peers = []

        connectToPeers()
        intervalIdConnectToPeers = setInterval(connectToPeers, RECONNECT_DELAY)
        intervalIdCheckConnectedToPeers = setInterval(checkConnectedPeers, HEALTH_CHECK_DELAY)

        async function connectToPeers() {

            if (thisObject.peers.length >= maxOutgoingPeers) {
                return
            }

            for (let i = 0; i < p2pNetwork.p2pNodesToConnect.length; i++) {
                if (thisObject.peers.length >= maxOutgoingPeers) {
                    break
                }

                let peer = {
                    p2pNetworkNode: undefined,
                    webSocketsClient: undefined
                }

                peer.p2pNetworkNode = p2pNetwork.p2pNodesToConnect[i]
                if (peer.p2pNetworkNode.node.networkInterfaces === undefined) {
                    continue
                }
                if (isPeerConnected(peer) === true) {
                    continue
                }
                peer.webSocketsClient = SA.projects.network.modules.webSocketsNetworkClient.newNetworkModulesWebSocketsNetworkClient()
                await peer.webSocketsClient.initialize(
                    callerRole,
                    p2pNetworkClientIdentity,
                    peer.p2pNetworkNode,
                    p2pNetworkClient,
                    onConnectionClosed
                )
                    .then(addPeer)
                    .catch(onError)

                function addPeer() {
                    thisObject.peers.push(peer)
                }

                function onError(err) {
                    if (err !== undefined) {
                        console.log('[ERROR] P2P Network Peers -> onError -> While connecting to node -> ' + peer.p2pNetworkNode.userProfile.config.codeName + ' -> ' + peer.p2pNetworkNode.node.name + ' -> ' + err.message)
                    } else {
                        console.log('[WARN] P2P Network Peers -> onError -> Peer Not Available at the Moment -> ' + peer.p2pNetworkNode.userProfile.config.codeName + ' -> ' + peer.p2pNetworkNode.node.name)
                    }
                }

                function onConnectionClosed(webSocketsClientId) {
                    for (let i = 0; i < thisObject.peers.length; i++) {
                        let connectedPeer = thisObject.peers[i]
                        if (connectedPeer.webSocketsClient.id === webSocketsClientId) {
                            thisObject.peers.splice(i, 1)
                            return
                        }
                    }
                }
            }

            function isPeerConnected(peer) {
                for (let i = 0; i < thisObject.peers.length; i++) {
                    let connectedPeer = thisObject.peers[i]
                    if (connectedPeer.p2pNetworkNode.node.id === peer.p2pNetworkNode.node.id) {
                        return true
                    }
                }
            }
        }

        function checkConnectedPeers() {
            for (let i = 0; i < thisObject.peers.length; i++) {
                let peer = thisObject.peers[i]
                if (peer.webSocketsClient.socketNetworkClients.isConnected !== true) {
                    thisObject.peers.splice(i, 1)
                    return
                }
            }
        }
    }

    async function sendMessage(message) {
        if (thisObject.peers.length === 0) {
            console.log('[WARN] There are no network nodes available to process this message. Please try again later.')
            let response = {
                result: 'Error',
                message: 'No Network Node Available.'
            }
            return response
        }
        /*
        This function will send the message from a random picked network node
        selected from the array of already connected peers.
        */
        let peerIndex = Math.max(Math.round(Math.random() * thisObject.peers.length) - 1, 0)
        let peer = thisObject.peers[peerIndex]
        if (peer === undefined) {
            console.log('[ERROR] Selected Peer Undefined. Please try again later.')
            let response = {
                result: 'Error',
                message: 'Peer Undefined.'
            }
            return response
        }
        let response = await peer.webSocketsClient.socketNetworkClients.sendMessage(message)
        if (response.result === 'Error' && response.message === 'Websockets Connection Not Ready.') {
            thisObject.peers.splice(peerIndex, 1)
        }
        return response
    }
}