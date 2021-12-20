exports.newNetworkModulesWebSocketsInterface = function newNetworkModulesWebSocketsInterface() {
    /*
    This module represents the websockets interface of the Network Node.

    A Network Nodes is expected to receive connection request from 2 different types
    of entities:

    1. Other Network Nodes.
    2. Clients / Apps. 

    This module deals with those 2 connection types and is the one receiving from
    and sending messages to those entities.
    */
    let thisObject = {
        socketServer: undefined,
        clientInterface: undefined,
        peerInterface: undefined,
        networkClients: undefined,
        networkPeers: undefined,
        callersMap: undefined,
        broadcastToClients: broadcastToClients,
        initialize: initialize,
        finalize: finalize
    }

    let web3 = new SA.nodeModules.web3()

    return thisObject

    function finalize() {
        thisObject.networkClients = undefined
        thisObject.networkPeers = undefined
        callersMap = undefined

        thisObject.socketServer = undefined
        thisObject.clientInterface = undefined
        thisObject.peerInterface = undefined

        web3 = undefined
    }

    function initialize() {
        let port = NT.networkNode.p2pNetworkNode.node.config.webSocketsPort

        thisObject.socketServer = new SA.nodeModules.ws.Server({ port: port })
        thisObject.clientInterface = NT.projects.socialTrading.modules.clientInterface.newSocialTradingModulesClientInterface()
        thisObject.peerInterface = NT.projects.socialTrading.modules.peerInterface.newSocialTradingModulesPeerInterface()

        thisObject.networkClients = []
        thisObject.networkPeers = []
        thisObject.callersMap = new Map()

        setUpWebSocketServer()
    }

    function setUpWebSocketServer() {
        try {
            thisObject.socketServer.on('connection', onConnectionOpened)

            function onConnectionOpened(socket)
            /*
            This function is executed every time a new Websockets connection
            is established.
            */ {
                let caller = {
                    socket: socket,
                    userProfile: undefined,
                    role: undefined,
                    node: undefined
                }

                caller.socket.id = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
                caller.socket.on('close', onConnectionClosed)

                let calledTimestamp = (new Date()).valueOf()

                caller.socket.on('message', onMenssage)

                async function onMenssage(message) {
                    try {
                        let messageHeader
                        try {
                            messageHeader = JSON.parse(message)
                        } catch (err) {
                            let response = {
                                result: 'Error',
                                message: 'messageHeader Not Coorrect JSON Format.'
                            }
                            caller.socket.send(JSON.stringify(response))
                            caller.socket.close()
                            return
                        }
                        /*
                        We will run some validations.
                        */
                        if (messageHeader.messageType === undefined) {
                            let response = {
                                result: 'Error',
                                message: 'messageType Not Provided.'
                            }
                            caller.socket.send(JSON.stringify(response))
                            caller.socket.close()
                            return
                        }

                        switch (messageHeader.messageType) {
                            case "Handshake": {
                                handshakeProducedure(caller, calledTimestamp, messageHeader)
                                break
                            }
                            case "Request": {

                                if (caller.userProfile === undefined) {
                                    let response = {
                                        result: 'Error',
                                        message: 'Handshake Not Done Yet.'
                                    }
                                    response.messageId = messageHeader.messageId
                                    caller.socket.send(JSON.stringify(response))
                                    caller.socket.close()
                                    return
                                }

                                let response
                                switch (caller.role) {
                                    case 'Network Client': {
                                        response = await thisObject.clientInterface.messageReceived(messageHeader.payload, caller.userProfile)
                                        response.messageId = messageHeader.messageId
                                        caller.socket.send(JSON.stringify(response))
                                        break
                                    }
                                    case 'Network Peer': {
                                        response = await thisObject.peerInterface.messageReceived(messageHeader.payload)
                                        response.messageId = messageHeader.messageId
                                        caller.socket.send(JSON.stringify(response))
                                        break
                                    }
                                }
                                if (response.result === 'Ok' && JSON.parse(messageHeader.payload).requestType === 'Event') {
                                    broadcastToPeers(messageHeader, caller)
                                    broadcastToClients(messageHeader, caller)
                                }
                                break
                            }
                            default: {
                                let response = {
                                    result: 'Error',
                                    message: 'messageType Not Supported.'
                                }
                                caller.socket.send(JSON.stringify(response))
                                caller.socket.close()
                                break
                            }
                        }
                    } catch (err) {
                        console.log('[ERROR] Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
                    }
                }
            }

            function onConnectionClosed() {
                let socketId = this.id
                let caller = thisObject.callersMap.get(socketId)
                removeCaller(caller)
            }

            function handshakeProducedure(caller, calledTimestamp, messageHeader) {
                /*
                The handshake procedure have 2 steps, we need to know
                now which one we are at. 
                */
                if (messageHeader.step === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'step Not Provided.'
                    }
                    caller.socket.send(JSON.stringify(response))
                    caller.socket.close()
                    return
                }
                if (messageHeader.step !== 'One' && messageHeader.step !== 'Two') {
                    let response = {
                        result: 'Error',
                        message: 'step Not Supported.'
                    }
                    caller.socket.send(JSON.stringify(response))
                    caller.socket.close()
                    return
                }
                switch (messageHeader.step) {
                    case 'One': {
                        handshakeStepOne()
                        break
                    }
                    case 'Two': {
                        handshakeStepTwo()
                        break
                    }
                }
                function handshakeStepOne() {
                    /*
                    The caller needs to identify itself as either a Network Client or Peer.
                    */
                    if (messageHeader.callerRole === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'callerRole Not Provided.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }

                    if (messageHeader.callerRole !== 'Network Client' && messageHeader.callerRole !== 'Network Peer') {
                        let response = {
                            result: 'Error',
                            message: 'callerRole Not Supported.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }

                    caller.role = messageHeader.callerRole
                    /*
                    We will check that we have not exeeded the max amount of callers.
                    */
                    switch (caller.role) {
                        case 'Network Client': {
                            if (thisObject.networkClients.length >= global.env.P2P_NETWORK_NODE_MAX_INCOMING_CLIENTS) {
                                let response = {
                                    result: 'Error',
                                    message: 'P2P_NETWORK_NODE_MAX_INCOMING_CLIENTS reached.'
                                }
                                caller.socket.send(JSON.stringify(response))
                                caller.socket.close()
                                return
                            }
                            break
                        }
                        case 'Network Peer': {
                            if (thisObject.networkPeers.length >= global.env.P2P_NETWORK_NODE_MAX_INCOMING_PEERS) {
                                let response = {
                                    result: 'Error',
                                    message: 'P2P_NETWORK_NODE_MAX_INCOMING_PEERS reached.'
                                }
                                caller.socket.send(JSON.stringify(response))
                                caller.socket.close()
                                return
                            }
                            break
                        }
                    }
                    /*
                    The caller needs to provide it's User Profile Handle.
                    */
                    if (messageHeader.callerProfileHandle === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'callerProfileHandle Not Provided.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    caller.userProfileHandle = messageHeader.callerProfileHandle
                    /*
                    The caller needs to provide a callerTimestamp.
                    */
                    if (messageHeader.callerTimestamp === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'callerTimestamp Not Provided.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    /*
                    The callerTimestamp can not be more that 1 minute old.
                    */
                    if (calledTimestamp - messageHeader.callerTimestamp > 60000) {
                        let response = {
                            result: 'Error',
                            message: 'callerTimestamp Too Old.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    /*
                    We will sign for the caller it's handle to prove our
                    Network Node identity.
                    */
                    let signedMessage = {
                        callerProfileHandle: messageHeader.callerProfileHandle,
                        calledProfileHandle: SA.secrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).userProfileHandle,
                        callerTimestamp: messageHeader.callerTimestamp,
                        calledTimestamp: calledTimestamp
                    }
                    let signature = web3.eth.accounts.sign(JSON.stringify(signedMessage), SA.secrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).privateKey)

                    let response = {
                        result: 'Ok',
                        message: 'Handshake Step One Complete',
                        signature: JSON.stringify(signature)
                    }
                    caller.socket.send(JSON.stringify(response))
                }

                function handshakeStepTwo() {
                    /*
                    We will check that the caller role has been defined at Step One.
                    */
                    if (caller.role === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'Handshake Step One Not Completed.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    /*
                    We will check the signature at the message. 
                    */
                    if (messageHeader.signature === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'signature Not Provided.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }

                    let signature = JSON.parse(messageHeader.signature)
                    caller.blockchainAccount = web3.eth.accounts.recover(signature)

                    if (caller.blockchainAccount === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'Bad Signature.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    /*
                    The signature gives us the blockchain account, and the account the user profile.
                    */
                    let witnessUserProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(caller.blockchainAccount)

                    if (witnessUserProfile === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'userProfile Not Found.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    let signedMessage = JSON.parse(signature.message)
                    /*
                    We will verify that the signature belongs to the signature.message.
                    To do this we will hash the signature.message and see if we get 
                    the same hash of the signature.
                    */
                    let hash = web3.eth.accounts.hashMessage(signature.message)
                    if (hash !== signature.messageHash) {
                        let response = {
                            result: 'Error',
                            message: 'signature.message Hashed Does Not Match signature.messageHash.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    /*
                    The user profile based on the blockchain account, based on the signature,
                    it is our witness user profile, to validate the caller.
                    */
                    if (signedMessage.callerProfileHandle !== witnessUserProfile.userProfileHandle) {
                        let response = {
                            result: 'Error',
                            message: 'callerProfileHandle Does Not Match witnessUserProfile.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    /*
                    We will check that the signature includes this Network Node handle, to avoid
                    man in the middle attacks.
                    */
                    if (signedMessage.calledProfileHandle !== SA.secrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).userProfileHandle) {
                        let response = {
                            result: 'Error',
                            message: 'calledProfileHandle Does Not Match This Network Node Handle.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    /*
                    We will check that the timestamp in the signature is the one we sent to the caller.
                    */
                    if (signedMessage.calledTimestamp !== calledTimestamp) {
                        let response = {
                            result: 'Error',
                            message: 'calledTimestamp Does Not Match calledTimestamp On Record.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    /*
                    All validations have been completed, the Handshake Procedure finished well.
                    */
                    /*
                    We will remember the user profile behind this caller.
                    */
                    caller.userProfile = witnessUserProfile
                    /*
                    We will remember the caller itself.
                    */
                    addCaller(caller)

                    let response = {
                        result: 'Ok',
                        message: 'Handshake Successful.'
                    }
                    caller.socket.send(JSON.stringify(response))
                }
            }

            function addCaller(caller) {

                thisObject.callersMap.set(caller.socket.id, caller)

                switch (caller.role) {
                    case 'Network Client': {
                        addToArray(thisObject.networkClients, caller)
                        break
                    }
                    case 'Network Peer': {
                        addToArray(thisObject.networkPeers, caller)
                        break
                    }
                }

                function addToArray(callersArray, caller) {
                    /*
                    We will add the caller to the existing array, first the ones with highest ranking.
                    */
                    for (let i = 0; i < callersArray.length; i++) {
                        let callerInArray = callersArray[i]
                        if (caller.userProfile.ranking > callerInArray.userProfile.ranking) {
                            callersArray.splice(i, 0, caller)
                            return
                        }
                    }
                    callersArray.push(caller)
                }
            }

            function removeCaller(caller) {
                if (caller === undefined) { return }

                thisObject.callersMap.delete(caller.socket.id)

                switch (caller.role) {
                    case 'Network Client': {
                        removeFromArray(thisObject.networkClients, caller)
                        break
                    }
                    case 'Network Peer': {
                        removeFromArray(thisObject.networkPeers, caller)
                        break
                    }
                }

                function removeFromArray(callersArray, caller) {
                    for (let i = 0; i < callersArray.length; i++) {
                        let callerInArray = callersArray[i]
                        if (caller.socket.id === callerInArray.socket.id) {
                            callersArray.splice(i, 1)
                            return
                        }
                    }
                }
            }

            function broadcastToPeers(messageHeader, caller) {
                /*
                The Boradcast to network peers is not done via 
                the network peers incomming connections, but
                on the outgoing connections only.
                */
                let callerIdToAVoid
                if (caller.role === 'Network Peer') {
                    callerIdToAVoid = caller.node.id
                }
                for (let i = 0; i < NT.networkNode.p2pNetworkPeers.peers.length; i++) {
                    let peer = NT.networkNode.p2pNetworkPeers.peers[i]
                    if (peer.p2pNetworkNode.node.id === callerIdToAVoid) { continue }
                    peer.webSocketsClient.sendMessage(messageHeader.payload)
                        .catch(onError)

                    function onError() {
                        console.log('[ERROR] Web Sockets Interface -> broadcastToPeers -> Sending Message Failed.')
                    }
                }
            }

        } catch (err) {
            console.log('[ERROR] Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }
    }

    function broadcastToClients(messageHeader, caller) {
        try {
            let callerIdToAVoid
            if (caller !== undefined && caller.role === 'Network Client') {
                callerIdToAVoid = caller.socket.id
            }
            for (let i = 0; i < thisObject.networkClients.length; i++) {
                let networkClient = thisObject.networkClients[i]
                if (networkClient.socket.id === callerIdToAVoid) { continue }
                networkClient.socket.send(messageHeader.payload)
            }
            return true
        } catch (err) {
            console.log('[ERROR] Web Sockets Interface -> broadcastToClients -> err.stack = ' + err.stack)
        }
    }
}