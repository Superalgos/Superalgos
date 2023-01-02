exports.newWebSocketsInterface = function newWebSocketsInterface() {
    /*
    This module handles the websockets communication between the 
    Social Trading App's Client and the Social Trading App's Web App.
    */
    let thisObject = {
        sendToWebApp: sendToWebApp,
        initialize: initialize,
        finalize: finalize
    }

    let socketServer
    let webApp

    return thisObject

    function finalize() {
        socketServer = undefined
        webApp = undefined
    }

    function initialize() {
        let port = ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webSocketsPort
        socketServer = new SA.nodeModules.ws.Server({ port: port })
        setUpWebSocketServer()
    }

    function setUpWebSocketServer() {
        try {
            socketServer.on('connection', onConnectionOpened)

            function onConnectionOpened(socket)
            /*
            This function is executed every time a new Websockets connection
            is established.
            */ {
                if (webApp !== undefined) {
                    console.log((new Date()).toISOString(), '[ERROR] Only one websockets client allowed.')
                    return
                }

                webApp = {
                    socket: socket
                }
                console.log('Social Trading Web App Connected to Web Sockets Interface ........................... Connected to port ' + ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webSocketsPort) //global.env.SOCIALTRADING_WEB_SOCKETS_INTERFACE_PORT)

                webApp.socket.on('close', onConnectionClosed)
                webApp.socket.on('message', onMessage)

                async function onMessage(message) {
                    try {
                        let messageHeader
                        try {
                            messageHeader = JSON.parse(message)
                        } catch (err) {
                            let response = {
                                messageId: messageHeader.messageId,
                                result: 'Error',
                                message: 'messageHeader Not Correct JSON Format.'
                            }
                            webApp.socket.send(JSON.stringify(response))
                            return
                        }

                        await ST.socialTradingApp.webAppInterface.sendMessage(messageHeader.payload)
                            .then(sendResponseToWebApp)
                            .catch(onError)

                        function sendResponseToWebApp(response) {
                            response.messageId = messageHeader.messageId
                            webApp.socket.send(JSON.stringify(response))
                        }

                        function onError(errorMessage) {
                            console.log((new Date()).toISOString(), '[ERROR] Web Sockets Interface -> onMessage -> errorMessage = ' + errorMessage)
                            let response = {
                                messageId: messageHeader.messageId,
                                result: 'Error',
                                message: errorMessage
                            }
                            webApp.socket.send(JSON.stringify(response))
                        }

                    } catch (err) {
                        console.log((new Date()).toISOString(), '[ERROR] Web Sockets Interface -> onMessage -> err.stack = ' + err.stack)
                    }
                }
            }

            function onConnectionClosed() {
                webApp = undefined
                console.log('Social Trading Web App Disconnected from Web Sockets Interface ..................... Disconnected from port ' + global.env.SOCIALTRADING_WEB_SOCKETS_INTERFACE_PORT)
            }

        } catch (err) {
            console.log((new Date()).toISOString(), '[ERROR] Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }
    }

    function sendToWebApp(message) {
        webApp.socket.send(JSON.stringify(message))
    }
}