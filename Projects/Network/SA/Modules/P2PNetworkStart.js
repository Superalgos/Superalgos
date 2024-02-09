exports.newNetworkModulesP2PNetworkStart = function newNetworkModulesP2PNetworkStart() {
    /*
    This module assumes the p2p network is formed by network nodes connected to each other
    not randombly but as a directed acyclic graph.

    https://en.wikipedia.org/wiki/Directed_acyclic_graph

    TODO: 
    This module will identify which are the Start Nodes of the DAG, and be ready to send
    messages via the http interface of nodes to some of them. 
    */
    let thisObject = {
        p2pNetworkClientIdentity: undefined,
        sendMessage: sendMessage,

        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    const NETWORK_SERVICES = ['Trading Signals', 'Network Statistics']
    const RECONNECT_DELAY = 10 * 1000
    let peersMap = new Map()
    let intervalIdConnectToPeers = new Map()
    let messagesToBeDelivered
    let web3

    return thisObject

    function finalize() {
        thisObject.p2pNetworkClientIdentity = undefined

        web3 = undefined
        peersMap = undefined
        messagesToBeDelivered = undefined
        clearInterval(intervalIdConnectToPeers)

        intervalIdConnectToPeers.forEach(clearIntervals)
        intervalIdConnectToPeers = undefined

        function clearIntervals(intervalId) {
            clearInterval(intervalId)
        }
    }

    async function initialize(
        callerRole,
        p2pNetworkClientIdentity,
        p2pNetwork,
        maxOutgoingPeers
    ) {
        thisObject.p2pNetworkClientIdentity = p2pNetworkClientIdentity
        web3 = new SA.nodeModules.web3()

        for (let i = 0; i < NETWORK_SERVICES.length; i++) {
            let networkService = NETWORK_SERVICES[i]
            let peers = []
            peersMap.set(networkService, peers)

            await initializeNetworkService(networkService)
        }

        async function initializeNetworkService(networkService) {
            messagesToBeDelivered = []
            let peers = peersMap.get(networkService)

            await connectToPeers()
            let intervalId = setInterval(connectToPeers, RECONNECT_DELAY);
            intervalIdConnectToPeers.set(networkService, intervalId)

            /*
            Here we will be retrying the connection to different hosts...
            */
            async function connectToPeers() {

                if (peers.length >= maxOutgoingPeers) { return }

                for (let i = 0; i < p2pNetwork.p2pNodesToConnect.length; i++) {
                    if (peers.length >= maxOutgoingPeers) { break }

                    let peer = {
                        p2pNetworkNode: undefined,
                        httpClient: undefined
                    }

                    peer.p2pNetworkNode = p2pNetwork.p2pNodesToConnect[i] // peer.p2pNetworkNode.node.networkServices.tradingSignals
                    switch (networkService) {
                        case 'Trading Signals': {
                            if (peer.p2pNetworkNode.node.networkServices === undefined || peer.p2pNetworkNode.node.networkServices.tradingSignals === undefined) {
                                // We will ignore all the Network Nodes that don't have this service defined.
                                continue
                            }
                            break
                        }
                        case 'Network Statistics': {
                            continue // This is not yet implemented.
                        }
                    }
                    /*
                    DEBUG NOTE: If you are having trouble undestanding why you can not connect to a certain network node, then you can activate the following Console Logs, otherwise you keep them commented out.
                    */
                    /*
                    SA.logger.info('Checking if the Network Node belonging to User Profile ' + peer.p2pNetworkNode.userProfile.name + ' is reachable via http to be ready to send a message to the ' + networkService + ' network service.')
                    */
                    if (isPeerConnected(peer) === true) { continue }

                    await isPeerOnline(peer)
                        .then(isOnline)
                        .catch(isOffline)

                    function isOnline() {
                        /*
                        SA.logger.info('This node is reponding to PING messages via http. Network Node belonging to User Profile ' + peer.p2pNetworkNode.userProfile.name + ' it is reachable via http.')
                        */
                        peers.push(peer)
                    }
                    function isOffline() {
                        /*
                        SA.logger.warn('Network Node belonging to User Profile ' + peer.p2pNetworkNode.userProfile.name + ' it is NOT reachable via http.')
                        */
                    }
                }

                function isPeerConnected(peer) {
                    for (let i = 0; i < peers.length; i++) {
                        let connectedPeer = peers[i]
                        if (connectedPeer.p2pNetworkNode.node.id === peer.p2pNetworkNode.node.id) {
                            return true
                        }
                    }
                }

                async function isPeerOnline(peer) {
                    /*
                    This function is to check if a network node is online and will 
                    receive an http request when needed.
                    */
                    let promise = new Promise(sendTestMessage)
                    return promise

                    async function sendTestMessage(resolve, reject) {
                        /*
                        Test if the peer is actually online.
                        */
                        if (peer.httpClient !== undefined) { return }

                        peer.httpClient = SA.projects.network.modules.webHttpNetworkClient.newNetworkModulesHttpNetworkClient()
                        peer.httpClient.initialize(callerRole, thisObject.p2pNetworkClientIdentity, peer.p2pNetworkNode)


                        await peer.httpClient.sendTestMessage(networkService)
                            .then(isConnected)
                            .catch(isNotConnected)

                        function isConnected() {
                            resolve()
                        }
                        function isNotConnected() {
                            reject()
                        }
                    }
                }
            }
        }
    }

    async function sendMessage(message) {

        let userApp = thisObject.p2pNetworkClientIdentity
        if (userApp === undefined) { return }
        if (userApp.node.config === undefined) { return }
        let userAppCodeName = userApp.node.config.codeName
        if (userAppCodeName === undefined) { return }
        let userAppCategory = userApp.node.parentNode
        if (userAppCategory === undefined) { return }

        let payload = JSON.stringify(message)
        let signature = await web3.eth.accounts.sign(JSON.stringify(payload), SA.secrets.signingAccountSecrets.map.get(userAppCodeName).privateKey)

        let messageHeader = {
            networkService: message.networkService,
            userApp: {
                categoryType: userAppCategory.type,
                appType: userApp.node.type,
                appId: userApp.node.id
            },
            signature: signature,
            payload: payload
        }

        let peers = peersMap.get(messageHeader.networkService)
        /*
        This function will send the messageHeader from a random picked network node
        selected from the array of already verified online peers.
        */
        let peerIndex = Math.max(Math.round(Math.random() * peers.length) - 1, 0)
        let peer = peers[peerIndex]
        /*
        Adding the messageHeader to the queue to be delivered
        */
        messagesToBeDelivered.push(messageHeader)

        if (peer === undefined) {
            SA.logger.error('Message can not be delivered to the P2P Network because the peer selected is undefined. Maybe there are no peers for the Network Service that wants to be accessed?')
            return
        }
        /*
        Iterate through all the Signals to be delivered, including the one that is being sent right now.
        */
        let notDeliveredMessages = []

        for (let i = 0; i < messagesToBeDelivered.length; i++) {
            let nextMessage = messagesToBeDelivered[i]

            await peer.httpClient.sendMessage(nextMessage)
                .then(messageSent)
                .catch(messageNotSent)

            function messageSent() {

            }
            function messageNotSent(error) {
                /*
                Store in memory all the signals that could not be delivered, but only once per signal.
                */
                if (notDeliveredMessages.includes(messageHeader) === false) {
                    notDeliveredMessages.push(messageHeader)
                }
            
                if (error !== undefined && error.code === 'ECONNREFUSED') {
                    /*
                    This is not an HTTP error that can be retried at the same host. It is a disconnection from the host and we will need to reconnect to the same host or others.
                    */
                    for (let i = 0; i < peers.length; i++) {
                        let connectedPeer = peers[i]
                        if (connectedPeer.p2pNetworkNode.node.id === peer.p2pNetworkNode.node.id) {
                            /*
                            Remove this peer from the array so that we will reconnect to an available one.
                            */
                            peers.splice(i, 1)
                            return
                        }
                    }
                }
            }
        }
        messagesToBeDelivered = notDeliveredMessages
    }
}