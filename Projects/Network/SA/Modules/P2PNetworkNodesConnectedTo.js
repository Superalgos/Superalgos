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
        peers: [],
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
        clearTimeout(intervalIdConnectToPeers)
        // clearInterval(intervalIdCheckConnectedToPeers)
        SA.socketLogger.info('finalized P2PNetworkNodesConnectedTo')
    }

    async function initialize(
        callerRole,
        p2pNetworkClientIdentity,
        p2pNetwork,
        p2pNetworkClient,
        maxOutgoingPeers
    ) {
        SA.socketLogger.info('initializing P2PNetworkNodesConnectedTo with max outgoing peers ' + maxOutgoingPeers)
        thisObject.peers = []
        connectToPeers()
        // intervalIdCheckConnectedToPeers = setInterval(checkConnectedPeers, HEALTH_CHECK_DELAY)

        async function connectToPeers() {
            logPeers()
            if (thisObject.peers.length >= maxOutgoingPeers) {
                intervalIdConnectToPeers = setTimeout(connectToPeers, RECONNECT_DELAY)
                return
            }
            let processedPeers = []
            for (let i = 0; i < p2pNetwork.p2pNodesToConnect.length; i++) {
                SA.socketLogger.info('iteration ' + i)
                // if (thisObject.peers.length >= maxOutgoingPeers) {
                //     SA.socketLogger.info('breaking from loop due to max peers being met')
                //     break
                // }

                let peer = {
                    p2pNetworkNode: undefined,
                    webSocketsClient: undefined
                }

                // SA.socketLogger.info('init peer object')
                peer.p2pNetworkNode = p2pNetwork.p2pNodesToConnect[i]
                SA.socketLogger.info('current node is for ' + peerInfo(peer))
                if (peer.p2pNetworkNode.node.config.host === undefined ) {
                    // SA.socketLogger.info('host is undefined, moving to next iteration')
                    continue
                } else if (peer.p2pNetworkNode.node.networkInterfaces === undefined) {
                    // SA.socketLogger.info('networkInterfaces is undefined, moving to next iteration')
                    continue
                } else if (peer.p2pNetworkNode.node.networkInterfaces.websocketsNetworkInterface === undefined) {
                    // SA.socketLogger.info('websocketsNetworkInterface is undefined, moving to next iteration')
                    continue
                } else if (isPeerConnected(peer) === true) {
                    SA.socketLogger.info('peer is already connected')
                    continue
                }

                SA.socketLogger.info('initialising websocketClient for ' + peerInfo(peer))
                peer.webSocketsClient = SA.projects.network.modules.webSocketsNetworkClient.newNetworkModulesWebSocketsNetworkClient()
                const task = peer.webSocketsClient.initialize(
                    callerRole,
                    p2pNetworkClientIdentity,
                    peer.p2pNetworkNode,
                    p2pNetworkClient,
                    onConnectionClosed
                )
                    .then(addPeer)
                    .catch(onError)
                processedPeers.push(task)
                // automatically add to the peer group then remove is connection is unsuccessful
                thisObject.peers.push(peer)
                logPeers()
                function addPeer() {
                    SA.socketLogger.info('added peer ' + peerInfo(peer))
                    console.log('this is our connected network peers', thisObject.peers)
                }

                function onError(err) {
                    SA.socketLogger.error('Peer connection error for ' + peerInfo(peer))
                    // if (err !== undefined) {
                    //     SA.logger.error('P2P Network Peers -> onError -> While connecting to node -> ' + peer.p2pNetworkNode.userProfile.config.codeName + ' -> ' + peer.p2pNetworkNode.node.id + ' -> ' + err.message)
                    // } else {
                    //     /*
                    //     DEBUG NOTE: If you are having trouble undestanding why you can not connect to a certain network node, then you can activate the following Console Logs, otherwise you keep them commented out.
                    //     */      
                    //     //SA.logger.debug           
                    //     SA.socketLogger.info('P2P Network Peers -> onError -> Peer Not Available at the Moment -> ' + peer.p2pNetworkNode.userProfile.config.codeName + ' -> ' + peer.p2pNetworkNode.node.id)
                    // }
                    const idx = findPeerIndex(peer)
                    SA.socketLogger.info('peer index is ' + idx)
                    if(idx > -1) {
                        SA.socketLogger.info('splicing peers in onError(...)')
                        thisObject.peers.splice(idx, 1)
                    }
                }

                function onConnectionClosed(webSocketsClientId) {
                    for (let i = 0; i < thisObject.peers.length; i++) {
                        let connectedPeer = thisObject.peers[i]
                        if (connectedPeer.webSocketsClient.id === webSocketsClientId) {
                            SA.socketLogger.info('splicing peers in onConnectionClosed(...)')
                            thisObject.peers.splice(i, 1)
                            return
                        }
                    }
                }
            }

            SA.socketLogger.info('Waiting for all initialization tasks to complete')
            await Promise.all(processedPeers)
            SA.socketLogger.info('All initialization tasks completed')

            function isPeerConnected(peer) {
                return findPeerIndex(peer) > -1
            }

            function findPeerIndex(peer) {
                SA.socketLogger.info('finding peer ' + peerInfo(peer))
                logPeers()
                for (let i = 0; i < thisObject.peers.length; i++) {
                    if (thisObject.peers[i].p2pNetworkNode.node.id === peer.p2pNetworkNode.node.id) {
                        return i
                    }
                }
                return -1
            }

            function peerInfo(peer) {
                return `name: ${peer.p2pNetworkNode.userProfile.name}, id: ${peer.p2pNetworkNode.node.id}`
            }
            
            function logPeers() {
                const output = thisObject.peers.length == 0 ? '[]' : '[\n' + thisObject.peers.map(p => '\t' + peerInfo(p)).join('\n') + '\n]'
                SA.socketLogger.info('peers '+ output)
            }

            /* Reschedule execution after connectToPeers() execution finalizes. Not using intervals here to avoid duplicate connections. */
            intervalIdConnectToPeers = setTimeout(connectToPeers, RECONNECT_DELAY)
        }

        function checkConnectedPeers() {
            for (let i = 0; i < thisObject.peers.length; i++) {
                let peer = thisObject.peers[i]
                if (peer.webSocketsClient.socketNetworkClients.isConnected !== true) {
                    SA.socketLogger.info('splicing peers in checkConnectedPeers()')
                    thisObject.peers.splice(i, 1)
                    return
                }
            }
        }
    }

    async function sendMessage(message, networkNodeUserProfile, responseHandler) {
        if (thisObject.peers.length === 0) {
            SA.logger.warn('There are no network nodes available to process this message. Please try again later.')
            let response = {
                result: 'Error',
                message: 'No Network Node Available.'
            }
            return response
        }
        /*
        If an specific user profile was provided, we will use a Network Node belonging to this User Profile,
        otherwise we will use a random chosen network node.
        */
        let peer
        if (networkNodeUserProfile === undefined) {
            /*    
            We will send the message to a random picked network node
            selected from the array of already connected peers.
            */
            let peerIndex = Math.max(Math.round(Math.random() * thisObject.peers.length) - 1, 0)
            peer = thisObject.peers[peerIndex]
            if (peer === undefined) {
                SA.logger.error('Ramdomly Selected Peer Undefined. Please try again later.')
                let response = {
                    result: 'Error',
                    message: 'Peer Undefined.'
                }
                return response
            }
        } else {
            /*   p2pNetworkNode.userProfile.name 
            We will find a network node belonging to the provided user profile
            */
            for (let i = 0; i < thisObject.peers.length; i++) {
                let nextPeer = thisObject.peers[i]
                if (nextPeer.p2pNetworkNode.userProfile.name === networkNodeUserProfile) {
                    peer = nextPeer
                    break
                }
            }
            if (peer === undefined) {
                SA.logger.error('No Network Node belonging to User Profile = ' + networkNodeUserProfile + ' available at the moment. Please try again later.')
                let response = {
                    result: 'Error',
                    message: 'Peer Undefined.'
                }
                return response
            }
        }

        let response = await peer.webSocketsClient.socketNetworkClients.sendMessage(message, responseHandler)
        if (response.result === 'Error' && response.message === 'Websockets Connection Not Ready.') {
            SA.socketLogger.info('splicing peers in sendMessage(...)')
            thisObject.peers.splice(peerIndex, 1)
        }
        return response
    }
}