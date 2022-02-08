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

        console.log('Websockets Client Connected to Network Node via Web Sockets .................. Connected to ' + thisObject.p2pNetworkNode.userProfile.config.codeName + ' -> ' + thisObject.p2pNetworkNode.node.name + ' -> ' + thisObject.host + ':' + thisObject.port)
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
                        console.log('Websockets Client Disconnected from Network Node via Web Sockets ............. Disconnected from ' + thisObject.p2pNetworkNode.userProfile.config.codeName + ' -> ' + thisObject.p2pNetworkNode.node.name + ' -> ' + thisObject.host + ':' + thisObject.port)
                    }
                    if (thisObject.onConnectionClosedCallBack !== undefined) {
                        thisObject.onConnectionClosedCallBack(thisObject.id)
                    }
                    thisObject.isConnected = false
                }

                function onError(err) {
                    if (err.message.indexOf('ECONNREFUSED') >= 0) {
                        console.log('[WARN] Web Sockets Network Client -> onError -> Nobody home at ' + thisObject.host + ':' + thisObject.port)
                        reject()
                        return
                    }
                    console.log('[ERROR] Web Sockets Network Client -> onError -> err.message = ' + err.message)
                    console.log('[ERROR] Web Sockets Network Client -> onError -> err.stack = ' + err.stack)
                    reject()
                    return
                }

            } catch (err) {
                console.log('[ERROR] Web Sockets Network Client -> setUpWebSocketClient -> err.stack = ' + err.stack)
            }
        }
    }
}