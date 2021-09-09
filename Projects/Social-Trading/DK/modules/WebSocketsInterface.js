exports.newDesktopModulesWebSocketsInterface = function newDesktopModulesWebSocketsInterface() {
    /*
    This module handles the websockets communication between the 
    Desktop App's Client and the Destop App's Web App.
    */
    let thisObject = {
        sendToWebApp: sendToWebApp,
        initialize: initialize,
        finalize: finalize
    }

    let socketServer
    let webAppInterface
    let webApp

    return thisObject

    function finalize() {
        socketServer = undefined
        webAppInterface = undefined
        webApp = undefined
    }

    function initialize() {
        socketServer = new SA.nodeModules.ws.Server({ port: global.env.DESKTOP_WEB_SOCKETS_INTERFACE_PORT })
        webAppInterface = DK.projects.socialTrading.modules.webAppInterface.newSocialTradingModulesWebAppInterface()

        setUpWebSocketServer()
    }

    function setUpWebSocketServer() {
        try {
            socketServer.on('connection', onConnectionOpened)

            function onConnectionOpened(socket)

            if (webApp !== undefined) {
                console.log('[ERROR] Only one websockets client allowed.')
                return
            }
            /*
            This function is executed every time a new Websockets connection
            is stablished.  
            */ {
                webApp = {
                    socket: socket
                }

                webApp.socket.on('close', onConnectionClosed)
                webApp.socket.on('message', onMenssage)

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
                            webApp.socket.send(JSON.stringify(response))
                            return
                        }

                        let response = await webAppInterface.messageReceived(messageHeader.payload)
                        webApp.socket.send(JSON.stringify(response))

                    } catch (err) {
                        console.log('[ERROR] Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
                    }
                }
            }

            function onConnectionClosed() {
                webApp = undefined
            }

        } catch (err) {
            console.log('[ERROR] Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }

        function sendToWebApp(message) {
            webApp.socket.send(JSON.stringify(message))
        }
    }
}