exports.newDesktopModulesWebSocketsInterface = function newDesktopModulesWebSocketsInterface() {
    /*
    This module handles the websockets communication between the 
    Desktop App's Client and the Desktop App's Web App.
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
        let port = DK.desktopApp.p2pNetworkClientIdentity.node.config.webSocketsPort
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
                    console.log('[ERROR] Only one websockets client allowed.')
                    return
                }

                webApp = {
                    socket: socket
                }
                console.log('Desktop Web App Connected to Web Sockets Interface ........................... Connected to port ' + global.env.DESKTOP_WEB_SOCKETS_INTERFACE_PORT)

                webApp.socket.on('close', onConnectionClosed)
                webApp.socket.on('message', onMenssage)

                async function onMenssage(message) {
                    try {
                        let messageHeader
                        try {
                            messageHeader = JSON.parse(message)
                        } catch (err) {
                            let response = {
                                messageId: messageHeader.messageId,
                                result: 'Error',
                                message: 'messageHeader Not Coorrect JSON Format.'
                            }
                            webApp.socket.send(JSON.stringify(response))
                            return
                        }

                        await DK.desktopApp.webAppInterface.messageReceived(messageHeader.payload)
                            .then(sendResponseToWebApp)
                            .catch(onError)

                        function sendResponseToWebApp(response) {
                            response.messageId = messageHeader.messageId
                            webApp.socket.send(JSON.stringify(response))
                        }

                        function onError(errorMessage) {
                            console.log('[ERROR] Web Sockets Interface -> onMenssage -> errorMessage = ' + errorMessage)
                            let response = {
                                messageId: messageHeader.messageId,
                                result: 'Error',
                                message: errorMessage
                            }
                            webApp.socket.send(JSON.stringify(response))
                        }

                    } catch (err) {
                        console.log('[ERROR] Web Sockets Interface -> onMenssage -> err.stack = ' + err.stack)
                    }
                }
            }

            function onConnectionClosed() {
                webApp = undefined
                console.log('Desktop Web App Discoonnected from Web Sockets Interface ................... Disonnected from port ' + global.env.DESKTOP_WEB_SOCKETS_INTERFACE_PORT)
            }

        } catch (err) {
            console.log('[ERROR] Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }
    }

    function sendToWebApp(message) {
        webApp.socket.send(JSON.stringify(message))
    }
}