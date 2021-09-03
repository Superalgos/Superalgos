exports.newNetworkModulesWebSocketsInterface = function newNetworkModulesWebSocketsInterface() {

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    let socketServer
    let clientInterface
    let peerInterface

    let web3 = new SA.nodeModules.web3()

    return thisObject

    function finalize() {
        socketServer = undefined
        clientInterface = undefined
        peerInterface = undefined

        web3 = undefined
    }

    function initialize() {
        socketServer = new SA.nodeModules.ws.Server({ port: global.env.NETWORK_WEB_SOCKETS_INTERFACE_PORT })
        clientInterface = NT.projects.socialTrading.modules.clientInterface.newSocialTradingModulesClientInterface()
        peerInterface = NT.projects.socialTrading.modules.peerInterface.newSocialTradingModulesPeerInterface()

        setUpWebSocketServer()
    }

    function setUpWebSocketServer() {
        try {
            socketServer.on('connection', onConnection)

            function onConnection(socket) {
                let caller = {}
                let calledTimestamp = (new Date()).valueOf()

                socket.on('message', onMenssage)

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
                            socket.send(JSON.stringify(response))
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
                            socket.send(JSON.stringify(response))
                            return
                        }

                        switch (messageHeader.messageType) {
                            case "Handshake": {
                                handshakeProducedure(socket, caller, calledTimestamp, messageHeader)
                                break
                            }
                            case "Request": {

                                if (caller.userProfile === undefined) {
                                    let response = {
                                        result: 'Error',
                                        message: 'Handshake Not Done Yet.'
                                    }
                                    socket.send(JSON.stringify(response))
                                    return
                                }

                                switch (caller.role) {
                                    case 'Network Client': {
                                        let response = await clientInterface.messageReceived(messageHeader.payload, caller.userProfile)
                                        socket.send(JSON.stringify(response))
                                        break
                                    }
                                    case 'Network Peer': {
                                        let response = await peerInterface.messageReceived(messageHeader.payload)
                                        socket.send(JSON.stringify(response))
                                        break
                                    }
                                }
                                break
                            }
                            default: {
                                let response = {
                                    result: 'Error',
                                    message: 'messageType Not Supported.'
                                }
                                socket.send(JSON.stringify(response))
                                break
                            }
                        }
                    } catch (err) {
                        console.log('[ERROR] Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
                    }
                }
            }

            function handshakeProducedure(socket, caller, calledTimestamp, messageHeader) {
                /*
                The handshage producedure have 2 steps, we need to know 
                now which one we are at. 
                */
                if (messageHeader.step === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'step Not Provided.'
                    }
                    socket.send(JSON.stringify(response))
                    return
                }
                if (messageHeader.step !== 'One' && messageHeader.step !== 'Two') {
                    let response = {
                        result: 'Error',
                        message: 'step Not Supported.'
                    }
                    socket.send(JSON.stringify(response))
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
                        socket.send(JSON.stringify(response))
                        return
                    }

                    if (messageHeader.callerRole !== 'Network Client' && messageHeader.callerRole !== 'Network Peer') {
                        let response = {
                            result: 'Error',
                            message: 'callerRole Not Supported.'
                        }
                        socket.send(JSON.stringify(response))
                        return
                    }

                    caller.role = messageHeader.callerRole
                    /*
                    The caller needs to provide it's User Profile Handle.
                    */
                    if (messageHeader.callerProfileHandle === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'callerProfileHandle Not Provided.'
                        }
                        socket.send(JSON.stringify(response))
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
                        socket.send(JSON.stringify(response))
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
                        socket.send(JSON.stringify(response))
                        return
                    }
                    /*
                    We will sign for the caller it's handle to prove our
                    Network Node identity.
                    */
                    let signedMessage = {
                        callerProfileHandle: messageHeader.callerProfileHandle,
                        calledProfileHandle: NT.NETWORK_NODE_USER_PROFILE_HANDLE,
                        callerTimestamp: messageHeader.callerTimestamp,
                        calledTimestamp: calledTimestamp
                    }
                    let signature = web3.eth.accounts.sign(JSON.stringify(signedMessage), NT.NETWORK_NODE_USER_PROFILE_PRIVATE_KEY)

                    let response = {
                        result: 'Ok',
                        message: 'Handshake Step One Complete',
                        signature: JSON.stringify(signature)
                    }
                    socket.send(JSON.stringify(response))
                }

                function handshakeStepTwo() {
                    /*
                    We will check that the caller role has beed defined at Step One. 
                    */
                    if (caller.role === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'Handshake Step One Not Completed.'
                        }
                        socket.send(JSON.stringify(response))
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
                        socket.send(JSON.stringify(response))
                        return
                    }

                    let signature = JSON.parse(messageHeader.signature)
                    caller.blockchainAccount = web3.eth.accounts.recover(signature)

                    if (caller.blockchainAccount === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'Bad Signature.'
                        }
                        socket.send(JSON.stringify(response))
                        return
                    }
                    /*
                    The signature gives us the blockchain account, and the account the user profile.
                    */
                    let witnessUserProfile = NT.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_BLOCHAIN_ACCOUNT.get(caller.blockchainAccount)

                    if (witnessUserProfile === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'userProfile Not Found.'
                        }
                        socket.send(JSON.stringify(response))
                        return
                    }
                    /*
                    The user profile based on the blockchain account, based on the signature,
                    it is our witness user profile, to validate the caller.
                    */
                    let signedMessage = JSON.parse(signature.message)

                    if (signedMessage.callerProfileHandle !== witnessUserProfile.userProfileHandle) {
                        let response = {
                            result: 'Error',
                            message: 'callerProfileHandle Does Not Match witnessUserProfile.'
                        }
                        socket.send(JSON.stringify(response))
                        return
                    }
                    /*
                    We will check that the signature includes this Network Node handle, to avoid
                    man in the middle attackts.
                    */
                    if (signedMessage.calledProfileHandle !== NT.NETWORK_NODE_USER_PROFILE_HANDLE) {
                        let response = {
                            result: 'Error',
                            message: 'calledProfileHandle Does Not Match This Network Node Handle.'
                        }
                        socket.send(JSON.stringify(response))
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
                        socket.send(JSON.stringify(response))
                        return
                    }
                    /*
                    All validations have been completed, the Handshake Prcedure finished well.
                    */
                    /*
                    We will remember the user profile behind this caller.
                    */
                    caller.userProfile = witnessUserProfile

                    let response = {
                        result: 'Ok',
                        message: 'Handshake Successful.'
                    }
                    socket.send(JSON.stringify(response))
                }
            }

        } catch (err) {
            console.log('[ERROR] Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }
    }
}