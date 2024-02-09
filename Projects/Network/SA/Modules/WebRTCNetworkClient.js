exports.newNetworkModulesWebRTCNetworkClient = function newNetworkModulesWebRTCNetworkClient() {

    let thisObject = {
        socketNetworkClients: undefined,
        p2pNetworkNode: undefined,
        host: undefined,
        port: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.socketNetworkClients = undefined
        thisObject.p2pNetworkNode = undefined
        thisObject.host = undefined
        thisObject.port = undefined
    }

    async function initialize(
        callerRole,
        p2pNetworkClientIdentity,
        p2pNetworkNode,
        p2pNetworkClient,
        onConnectionClosedCallBack
    ) {

        thisObject.p2pNetworkNode = p2pNetworkNode
        thisObject.host = thisObject.p2pNetworkNode.node.config.host
        thisObject.port = thisObject.p2pNetworkNode.node.networkInterfaces.websocketsNetworkInterface.config.webSocketsPort

        let socket = new SA.nodeModules.ws('ws://' + thisObject.host + ':' + thisObject.port)

        thisObject.socketNetworkClients = SA.projects.network.modules.socketNetworkClients.newNetworkModulesSocketNetworkClients()
        thisObject.socketNetworkClients.initialize(
            socket,
            callerRole,
            p2pNetworkClientIdentity,
            p2pNetworkNode,
            p2pNetworkClient,
            onConnectionClosedCallBack
        )

        await setUpWebSocketClient(socket)

        SA.logger.info('')
        SA.logger.info('WebRTC Client Connected to Network Node via Web Sockets .................. Connected to ' + thisObject.p2pNetworkNode.userProfile.config.codeName + ' -> ' + thisObject.p2pNetworkNode.node.name + ' -> ' + thisObject.host + ':' + thisObject.port)
        SA.logger.info('')
        thisObject.socketNetworkClients.isConnected = true

    }

    async function setUpWebSocketClient(socket) {

        return new Promise(connectToNewtwork)

        function connectToNewtwork(resolve, reject) {

            try {

                socket.onopen = () => { onConnectionOpened() }
                socket.onclose = () => { onConnectionClosed() }
                socket.onerror = err => { onError(err) }

                function onConnectionOpened() {

                    thisObject.socketNetworkClients.handshakeProcedure(resolve, reject)

                }

                function onConnectionClosed() {
                    if (thisObject.isConnected === true) {
                        SA.logger.info('Websockets Client Disconnected from Network Node via Web Sockets ............. Disconnected from ' + thisObject.p2pNetworkNode.userProfile.config.codeName + ' -> ' + thisObject.p2pNetworkNode.node.name + ' -> ' + thisObject.host + ':' + thisObject.port)
                    }
                    if (thisObject.onConnectionClosedCallBack !== undefined) {
                        thisObject.onConnectionClosedCallBack(thisObject.id)
                    }
                    thisObject.isConnected = false
                }

                function onError(err) {
                    if (err.message.indexOf('ECONNREFUSED') >= 0) {
                        /*
                        DEBUG NOTE: If you are having trouble undestanding why you can not connect to a certain network node, then you can activate the following Console Logs, otherwise you keep them commented out.
                        */ 
                        /*                       
                        SA.logger.warn('Web Sockets Network Client -> onError -> Nobody home at ' + thisObject.host + ':' + thisObject.port)
                        */
                        reject()
                        return
                    }
                    SA.logger.error('Web Sockets Network Client -> onError -> err.message = ' + err.message)
                    SA.logger.error('Web Sockets Network Client -> onError -> err.stack = ' + err.stack)
                    reject()
                    return
                }

            } catch (err) {
                SA.logger.error('Web Sockets Network Client -> setUpWebSocketClient -> err.stack = ' + err.stack)
            }
        }
    }
}