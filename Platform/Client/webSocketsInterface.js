exports.newWebSocketsInterface = function newWebSocketsInterface() {

    const LOG_INFO = false

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    const WEB_SOCKET = SA.nodeModules.ws
    let socketServer
    let port = global.env.CLIENT_WEB_SOCKETS_INTERFACE_PORT  

    return thisObject

    function finalize() {
        socketServer = undefined
    }

    function initialize() {
        setUpWebSocketServer()
    }

    function setUpWebSocketServer() {
        try {
            socketServer = new WEB_SOCKET.Server({ port: port })

            socketServer.on('connection', onConnection)

            function onConnection(socket) {

                let lastNonce = -1
                if (LOG_INFO === true) {
                    console.log('New Websocket Connection.')
                }

                socket.on('message', onMenssage)

                function onMenssage(message){

                    try {
                        if (LOG_INFO === true) {
                            console.log('Message Received: ' + message.substring(0, 1000))
                        }
        
                        let messageArray = message.toString().split('|*|')

                        let origin = messageArray[0]
                        let nonce = messageArray[1]
                        let messageToEventServer = messageArray[2]

                        if (origin === 'Web Browser') {
                            if (isNaN(nonce) || nonce === "") {
                                console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> Nonce is not a Number. message = ' + message.substring(0, 1000))
                                console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> Nonce is not a Number. nonce = ' + nonce)
                                return
                            }

                            if (nonce === "1") { // this happens once the browser is restarted, and the server is running since a previous session.
                                lastNonce = 0
                            }

                            if (Number(nonce) < Number(lastNonce)) {
                                console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> Nonce received is less than Last Nonce. message = ' + message.substring(0, 1000))
                                console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> Nonce received is less than Last Nonce. nonce = ' + nonce)
                                console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> Nonce received is less than Last Nonce. lastNonce = ' + lastNonce)
                                return
                            }

                            lastNonce = nonce

                            try {
                                JSON.parse(messageToEventServer)
                            } catch (err) {
                                console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> Message received from the browser is not a valid JSON. message = ' + message.substring(0, 1000))
                                console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> Message received from the browser is not a valid JSON. messageToEventServer = ' + messageToEventServer)
                                return
                            }

                            let acknowledgeMessage = {
                                action: 'Acknowledge',
                                nonce: nonce
                            }

                            socket.send(JSON.stringify(acknowledgeMessage))
                        }


                        PL.servers.EVENT_SERVER.onMessage(messageToEventServer, onResponse)

                        function onResponse(message) {
                            socket.send(message)
                        }
                    } catch (err) {
                        console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> Nonce received is less than Last Nonce. err = ' + err.stack)
                    }
                }
            }
        } catch (err) {
            console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> err.message = ' + err.message)
            console.log('[ERROR] Client -> Web Sockets Interface -> run -> setUpWebSocketServer -> err.message = ' + err.stack)
        }
    }
}