exports.newNetworkModulesWebSocketsClient = function newNetworkModulesWebSocketsClient() {

    let thisObject = {
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    let socketClient
    let callbackFunction

    return thisObject

    function finalize() {
        socketClient.close()
        socketClient = undefined
        networkInterface = undefined
        peerInterface = undefined
    }

    function initialize() {
        socketClient = new SA.nodeModules.ws('ws://' + 'localhost' + ':' + global.env.NETWORK_WEB_SOCKETS_INTERFACE_PORT)
        //networkInterface = SA.projects.socialTrading.modules.networkInterface.newSocialTradingModulesNetworkInterface()

        setUpWebsocketClient()
    }

    function setUpWebsocketClient() {
        try {
            let handshakeDone = false

            socketClient.onopen = () => { onConnection() }
            socketClient.onmessage = socketMessage => { onMenssage(socketMessage) }
            socketClient.onerror = err => { onError(err) }

            function onConnection() {
                /*
                Send Handshake Message
                */
                socketClient.send('Handshake Message')
                console.log('Handshake Message Sent')
            }

            async function onMenssage(socketMessage) {
                try {

                    let response = JSON.parse(socketMessage.data)
                    /*
                    Chack if we are waiting for the Handshake response.
                    */
                    if (handshakeDone === false) {
                        if (response.result === 'Ok') {
                            handshakeDone = true
                            return
                        } else {
                            console.log('[ERROR] Web Sockets Client -> onMenssage -> handshakeDone -> message.response = ' + response.message)
                            return
                        }
                    } 

                    callbackFunction.receiveResponse(message)
                    callbackFunction = undefined

                } catch (err) {
                    callbackFunction = undefined
                    console.log('[ERROR] Web Sockets Client -> err.stack = ' + err.stack)
                }
            }

            function onError(err) {
                console.log('[ERROR] Web Sockets Client -> onError -> err.message = ' + err.message)
                console.log('[ERROR] Web Sockets Client -> onError -> err.stack = ' + err.stack)
            }

        } catch (err) {
            console.log('[ERROR] Web Sockets Client -> setUpWebsocketClient -> err.stack = ' + err.stack)
        }
    }

    function sendMessage(message, callback) {
        if (callbackFunction !== undefined) {
            console.log('[ERROR] Web Sockets Client -> sendMessage -> Cannot send more messages while waiting for a response.')
            return false
        }

        if (socketClient.readyState !== 1) { // 1 means connected and ready.
            console.log('[ERROR] Web Sockets Client -> sendMessage -> Cannot send message while connection is closed.')
            return false
        }

        try {
            callbackFunction = callback
            socketClient.send(message)
            return true
        } catch (err) {
            callbackFunction = false
            console.log('[ERROR] Web Sockets Client -> sendMessage -> err.stack = ' + err.stack)
            return false
        }
    }
}