exports.newNetworkModulesSocketInterfaces = function newNetworkModulesSocketInterfaces() {
    /*
    Here is the common logic for different types of Sockets Interfaces, like
    Web Sockets and Web RTC.
    */
    let thisObject = {
        networkClients: undefined,
        networkPeers: undefined,
        callersMap: undefined,
        onMenssage: onMenssage,
        onConnectionClosed: onConnectionClosed,
        broadcastSignalsToClients: broadcastSignalsToClients,
        initialize: initialize,
        finalize: finalize
    }

    let web3
    return thisObject

    function initialize() {
        web3 = new SA.nodeModules.web3()
        thisObject.networkClients = []
        thisObject.networkPeers = []
        thisObject.callersMap = new Map()
    }

    function finalize() {
        thisObject.networkClients = undefined
        thisObject.networkPeers = undefined
        callersMap = undefined
        web3 = undefined
    }

    async function onMenssage(message, caller, calledTimestamp) {
        try {
            let socketMessage
            try {
                socketMessage = JSON.parse(message)
            } catch (err) {
                let response = {
                    result: 'Error',
                    message: 'socketMessage Not Coorrect JSON Format.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            We will run some validations.
            */
            if (socketMessage.messageType === undefined) {
                let response = {
                    result: 'Error',
                    message: 'messageType Not Provided.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }

            switch (socketMessage.messageType) {
                case "Handshake": {
                    handshakeProducedure(caller, calledTimestamp, socketMessage)
                    break
                }
                case "Request": {

                    if (caller.userProfile === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'Handshake Not Done Yet.'
                        }
                        response.messageId = socketMessage.messageId
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }

                    let payload
                    try {
                        payload = JSON.parse(socketMessage.payload)
                    } catch (err) {
                        let response = {
                            result: 'Error',
                            message: 'Payload Not Correct JSON Format.'
                        }
                        response.messageId = socketMessage.messageId
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                    }

                    if (payload.networkService === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'Network Service Undifined.'
                        }
                        response.messageId = socketMessage.messageId
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }

                    let response
                    let boradcastTo

                    switch (caller.role) {
                        case 'Network Client': {
                            switch (payload.networkService) {
                                case 'Social Graph': {
                                    if (NT.networkApp.socialGraphNetworkService !== undefined) {
                                        response = await NT.networkApp.socialGraphNetworkService.clientInterface.messageReceived(
                                            payload,
                                            caller.userProfile,
                                            thisObject.networkClients
                                        )
                                        boradcastTo = response.boradcastTo
                                        response.boradcastTo = undefined
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                    } else {
                                        let response = {
                                            result: 'Error',
                                            message: 'Social Graph Network Service Not Running.'
                                        }
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                        caller.socket.close()
                                        return
                                    }
                                    break
                                }
                                case 'Trading Signals': {
                                    break
                                }
                                default: {
                                    let response = {
                                        result: 'Error',
                                        message: 'Network Service Not Supported.'
                                    }
                                    response.messageId = socketMessage.messageId
                                    caller.socket.send(JSON.stringify(response))
                                    caller.socket.close()
                                    return
                                }
                            }
                            break
                        }
                        case 'Network Peer': {
                            switch (socketMessage.networkService) {
                                case 'Social Graph': {
                                    if (NT.networkApp.socialGraphNetworkService !== undefined) {
                                        response = await NT.networkApp.socialGraphNetworkService.peerInterface.messageReceived(
                                            payload,
                                            thisObject.networkClients
                                        )
                                        boradcastTo = response.boradcastTo
                                        response.boradcastTo = undefined
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                    } else {
                                        let response = {
                                            result: 'Error',
                                            message: 'Social Graph Network Service Not Running.'
                                        }
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                        caller.socket.close()
                                        return
                                    }
                                    break
                                }
                                case 'Trading Signals': {
                                    break
                                }
                                default: {
                                    let response = {
                                        result: 'Error',
                                        message: 'Network Service Not Supported.'
                                    }
                                    response.messageId = socketMessage.messageId
                                    caller.socket.send(JSON.stringify(response))
                                    caller.socket.close()
                                    return
                                }
                            }
                            break
                        }
                    }
                    /*
                    boradcastTo represents the clients we need to bloadcast this message to.
                    If it is an empty array, we wont broadcast to clients, but we will broadcast
                    to other peers. If it is undefined that means that it is not a type of 
                    message that should be broadcasted at all.
                    We need boradcastTo to be at least an empty 
                    */
                    if (
                        response.result === 'Ok' &&
                        boradcastTo !== undefined
                    ) {
                        broadcastToPeers(socketMessage, caller)
                        broadcastToClients(socketMessage, boradcastTo)
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
            console.log('[ERROR] Socket Interfaces -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }
    }

    function onConnectionClosed(socketId) {
        let caller = thisObject.callersMap.get(socketId)
        removeCaller(caller)
    }

    function handshakeProducedure(caller, calledTimestamp, socketMessage) {
        /*
        The handshake procedure have 2 steps, we need to know
        now which one we are at. 
        */
        if (socketMessage.step === undefined) {
            let response = {
                result: 'Error',
                message: 'step Not Provided.'
            }
            caller.socket.send(JSON.stringify(response))
            caller.socket.close()
            return
        }
        if (socketMessage.step !== 'One' && socketMessage.step !== 'Two') {
            let response = {
                result: 'Error',
                message: 'step Not Supported.'
            }
            caller.socket.send(JSON.stringify(response))
            caller.socket.close()
            return
        }
        switch (socketMessage.step) {
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
            if (socketMessage.callerRole === undefined) {
                let response = {
                    result: 'Error',
                    message: 'callerRole Not Provided.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }

            if (socketMessage.callerRole !== 'Network Client' && socketMessage.callerRole !== 'Network Peer') {
                let response = {
                    result: 'Error',
                    message: 'callerRole Not Supported.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }

            caller.role = socketMessage.callerRole
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
            if (socketMessage.callerProfileHandle === undefined) {
                let response = {
                    result: 'Error',
                    message: 'callerProfileHandle Not Provided.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            caller.userProfileHandle = socketMessage.callerProfileHandle
            /*
            The caller needs to provide a callerTimestamp.
            */
            if (socketMessage.callerTimestamp === undefined) {
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
            if (calledTimestamp - socketMessage.callerTimestamp > 60000) {
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
                callerProfileHandle: socketMessage.callerProfileHandle,
                calledProfileHandle: SA.secrets.signingAccountSecrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).userProfileHandle,
                callerTimestamp: socketMessage.callerTimestamp,
                calledTimestamp: calledTimestamp
            }
            let signature = web3.eth.accounts.sign(JSON.stringify(signedMessage), SA.secrets.signingAccountSecrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).privateKey)

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
            if (socketMessage.signature === undefined) {
                let response = {
                    result: 'Error',
                    message: 'signature Not Provided.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }

            let signature = JSON.parse(socketMessage.signature)
            caller.userAppBlockchainAccount = web3.eth.accounts.recover(signature)

            if (caller.userAppBlockchainAccount === undefined) {
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
            let userProfileByBlockchainAccount = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(caller.userAppBlockchainAccount)

            if (userProfileByBlockchainAccount === undefined) {
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
            if (signedMessage.callerProfileHandle !== userProfileByBlockchainAccount.config.signature.message) {
                let response = {
                    result: 'Error',
                    message: 'callerProfileHandle Does Not Match userProfileByBlockchainAccount.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            We will check that the signature includes this Network Node handle, to avoid
            man in the middle attacks.
            */
            if (signedMessage.calledProfileHandle !== SA.secrets.signingAccountSecrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).userProfileHandle) {
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
            We will remember the user profile behind this caller.
            */
            caller.userProfile = userProfileByBlockchainAccount
            /*
            We will check that if we are a node of a Permissioned Network, that whoever
            is connecting to us, has the permission to do so.
            */
            if (NT.networkApp.p2pNetworkNode.node.p2pNetworkReference.referenceParent.type === "Permissioned P2P Network") {
                let userProfileWithPermission = SA.projects.network.globals.memory.maps.PERMISSIONS_GRANTED_BY_USER_PRFILE_ID.get(caller.userProfile.id)
                if (userProfileWithPermission === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'User Profile Does Not Have Permission to This Permissioned P2P Network.'
                    }
                    caller.socket.send(JSON.stringify(response))
                    caller.socket.close()
                    return
                }
            }
            /*
            We will remember the caller itself.
            */
            addCaller(caller)
            /*
            All validations have been completed, the Handshake Procedure finished well.
            */
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

    function broadcastToPeers(socketMessage, caller) {
        /*
        The Boradcast to network peers is not done via 
        the network peers incomming connections, but
        on the outgoing connections only.
        */
        let callerIdToAVoid
        if (caller.role === 'Network Peer') {
            callerIdToAVoid = caller.socket.id
        }
        for (let i = 0; i < NT.networkApp.p2pNetworkNodesConnectedTo.peers.length; i++) {
            let peer = NT.networkApp.p2pNetworkNodesConnectedTo.peers[i]
            if (peer.p2pNetworkNode.node.id === callerIdToAVoid) { continue }
            peer.webSocketsClient.socketNetworkClients.sendMessage(socketMessage.payload)
                .catch(onError)

            function onError() {
                console.log('[ERROR] Socket Interfaces -> broadcastToPeers -> Sending Message Failed.')
            }
        }
    }

    function broadcastToClients(socketMessage, boradcastTo) {
        try {
            for (let i = 0; i < boradcastTo.length; i++) {
                let networkClient = boradcastTo[i]
                networkClient.socket.send(JSON.stringify(socketMessage))
            }
            return true
        } catch (err) {
            console.log('[ERROR] Socket Interfaces -> broadcastToClients -> err.stack = ' + err.stack)
        }
    }

    function broadcastSignalsToClients(socketMessage) {
        /*
        TODO: Replace this function with a mechanism to broadcast signals only to Followers.
        */
        try {
            for (let i = 0; i < thisObject.networkClients.length; i++) {
                let networkClient = thisObject.networkClients[i]
                networkClient.socket.send(JSON.stringify(socketMessage))
            }
            return true
        } catch (err) {
            console.log('[ERROR] Socket Interfaces -> broadcastSignalsToClients -> err.stack = ' + err.stack)
        }
    }
}