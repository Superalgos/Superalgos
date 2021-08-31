exports.newWebSocketsInterface = function newWebSocketsInterface() {

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    let socketServer
    let port = global.env.Network_WEB_SOCKETS_INTERFACE_PORT

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function run() {
        setUpWebSocketServer()
    }

    function setUpWebSocketServer() {
        try {
            socketServer = new SA.nodeModule.ws.Server({ port: port })
            socketServer.on('connection', onConnection)

            function onConnection(socket) {
                let caller = {}
                socket.on('message', onMenssage)


                function onMenssage(message) {
                    try {
                        let messageHeader = JSON.parse(message)
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
                                handShakeProducedure(socket, caller, messageHeader)
                                break

                            }
                            case "Request": {
                                break
                            }

                        }










                        let origin = messageArray[0]
                        let nonce = messageArray[1]
                        let messageToEventServer = messageArray[2]

                        if (origin === 'Web Browser') {
                            try {
                                JSON.parse(messageToEventServer)
                            } catch (err) {
                                console.log('[ERROR] Network -> Web Sockets Interface -> run -> setUpWebSocketServer -> Message received from the browser is not a valid JSON. message = ' + message.substring(0, 1000))
                                console.log('[ERROR] Network -> Web Sockets Interface -> run -> setUpWebSocketServer -> Message received from the browser is not a valid JSON. messageToEventServer = ' + messageToEventServer)
                                return
                            }

                            let acknowledgeMessage = {
                                action: 'Acknowledge',
                                nonce: nonce
                            }

                            socket.send(JSON.stringify(acknowledgeMessage))
                        }


                        CL.servers.EVENT_SERVER.onMessage(messageToEventServer, onResponse)

                        function onResponse(message) {
                            socket.send(message)
                        }
                    } catch (err) {
                        console.log('[ERROR] Network -> Web Sockets Interface -> run -> setUpWebSocketServer -> Nonce received is less than Last Nonce. err = ' + err.stack)
                    }
                }
            }


            function handShakeProducedure(socket, caller, messageHeader) {
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
                let userProfile = NT.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOCHAIN_ACCOUNT.set(blockchainAccount)

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
            console.log('[ERROR] Network -> Web Sockets Interface -> run -> setUpWebSocketServer -> err.message = ' + err.message.substring(0, 1000))
        }
    }
}