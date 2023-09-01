const {newEnvironment} = require("../../Environment")

exports.newWebSocketsServer = function newWebSocketsServer() {
    
    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    const WEB_SOCKET = SA.nodeModules.ws
    const port =  newEnvironment().DASHBOARDS_WEB_SOCKETS_INTERFACE_PORT // '18043'
    let socketServer
    let UISocket

    const LOG_INFO = true
   
    return thisObject

    function initialize () {
        try {
            socketServer = new WEB_SOCKET.Server({ port: port })

            socketServer.on('connection', onConnection)

            function onConnection(socket) {
                if (LOG_INFO === true) {
                    SA.logger.info('New Websocket Connection.')
                }

                socket.on('message', onMessage)

                function onMessage(message) {
                    // Here is where all messages will be received through the websocket
            
                    try {
                        let messageArray = message.toString().split('|*|')

                        let timestamp = messageArray[0] // First argument is timestamp message was sent
                        let origin = messageArray[1] // Second argument should be the origin of the message
                        let messageType = messageArray[2] // Third is the type of message being sent
                        let messageString = messageArray[3] // Fourth is the messsage content unless it is a data type message. Then this will be the name of incoming data.
                        // All other data objects sent in the message will be appended starting on position 4 and onward.

                        // Handle messages from various sources 
                        if (origin !== "UI") {
                            if (messageType === "Info") {
                                if (LOG_INFO === true) {
                                    SA.logger.info(timestamp + ' ' + origin + ' --> ' + messageString)
                                }

                            } else if (messageType === "Error") {
                                SA.logger.error(timestamp + ' ' + origin + ' --> ' + messageString)

                            } else if (messageType === "Data") {
                                // Generic handlier for incoming data
                                // Expects valid JSON formatted data
                                let dataKey = origin + '-' + messageString 
                                let dataContent = []
                                try {
                                    for (let i = 4; i < messageArray.length; i++){
                                        try {
                                            let messageObject = JSON.parse(messageArray[i])
                                            dataContent.push(messageObject)
                                        } 
                                        catch (err) {
                                            SA.logger.error('Dashboard App -> Cannot parse data -> Data from: ', dataKey, ' -> ', err)
                                        }
                                    }
                                    
                                    // Forward data to UI
                                    if (UISocket !== undefined) {
                                        let message = timestamp + '|*|' + dataKey + '|*|' + JSON.stringify(dataContent)
                                        UISocket.send(message)
                                    } else {
                                        SA.logger.error('Dashboard App -> UI not connected -> can not forward data')
                                    }
                                }
                                catch (err) {
                                    SA.logger.error('Dashboard App -> Something went wrong while receiving data -> Data from: ', dataKey, ' -> ', err)
                                }
                            }

                        } else if (origin === "UI") {
                            // messages coming from UI
                            if (messageType === "Info") {
                                SA.logger.info('messageType Info ' + messageString)
                                if (UISocket === undefined) {
                                    UISocket = socket // Store UI socket for message forwarding
                                }
                                
                            } else if (messageType === "Startup") {
                                SA.logger.info('messageType Startup ' + messageString)
                                UISocket = socket // Store UI socket for message forwarding
                            }
                        }

                    } catch (err) {
                        SA.logger.error('Dashboards App -> Web Sockets Interface -> run -> onConnection -> onMessage. err = ' + err.stack)
                    }
                }
            }
        } catch (err) {
            SA.logger.error('Dashboards App -> Web Sockets Interface -> run -> err.message = ' + err.message)
            SA.logger.error('Dashboards App -> Web Sockets Interface -> run -> err.message = ' + err.stack)
        }
    }

    function finalize () {

    }
}
