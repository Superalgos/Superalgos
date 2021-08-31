exports.newNetworkModulesWebSocketsInterface = function newNetworkModulesWebSocketsInterface() {

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    let socketServer
    let clientInterface
    let peerInterface

    return thisObject

    function finalize() {
        socketServer = undefined
        clientInterface = undefined
        peerInterface = undefined
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
                                handshakeProducedure(socket, caller, messageHeader)
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
                        }
                    } catch (err) {
                        console.log('[ERROR] Network -> Web Sockets Interface -> run -> setUpWebSocketServer -> err.stack = ' + err.stack)
                    }
                }
            }

            function handshakeProducedure(socket, caller, messageHeader) {
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
                We will identify the caller by the signature at the message. 
                */
                if (messageHeader.signature === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'signature Not Provided.'
                    }
                    socket.send(JSON.stringify(response))
                    return
                }

                let web3 = new SA.nodeModules.web3()
                let blockchainAccount = web3.eth.accounts.recover(messageHeader.signature)

                if (caller.blockchainAccount === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'Bad signature.'
                    }
                    socket.send(JSON.stringify(response))
                    return
                }
                /*
                The signature gives us the blockchain account, and the account the user profile.
                */
                let userProfile = NT.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_BLOCHAIN_ACCOUNT.set(blockchainAccount)

                if (userProfile === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'userProfile Not Found.'
                    }
                    socket.send(JSON.stringify(response))
                    return
                }
                /*
                We will remember the user profile behind this caller.
                */
                caller.userProfile = userProfile

                let response = {
                    result: 'Ok',
                    message: 'Handshake Successful.'
                }
                socket.send(JSON.stringify(response))
            }

        } catch (err) {
            console.log('[ERROR] Network -> Web Sockets Interface -> run -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }
    }
}