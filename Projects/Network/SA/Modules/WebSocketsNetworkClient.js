exports.newNetworkModulesWebSocketsNetworkClient = function newNetworkModulesWebSocketsNetworkClient() {

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

        /*
        DEBUG NOTE: If you are having trouble undestanding why you can not connect to a certain network node, then you can activate the following Console Logs, otherwise you keep them commented out.
        */
        SA.logger.debug('Websockets Client will try to Connect to Network Node via Web Sockets ........ Trying to Connect to ' + connectionInfo())
        

        let socket = new SA.nodeModules.ws('ws://' + thisObject.host + ':' + thisObject.port)
        // SA.logger.debug('created socket connection to '+ hostInfo())
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
        SA.logger.info('Websockets Client Connected to Network Node via Web Sockets .................. Connected to ' + connectionInfo())
        SA.logger.info('')
        thisObject.socketNetworkClients.isConnected = true

    }

    async function setUpWebSocketClient(socket) {

        return new Promise(connectToNewtwork)

        function connectToNewtwork(resolve, reject) {

            try {
                // will send a rejection response if this timeout is not cancelled in 30 seconds
                // the timeout is cancelled by any of the onopen, onclose or onerror functions
                let connectionTimeout = setTimeout(() => reject('Connection initialization timed out after 30 seconds trying to connect to ' + connectionInfo()), 30000)

                socket.onopen = () => { onConnectionOpened() }
                socket.onclose = () => { onConnectionClosed() }
                socket.onerror = err => { onError(err) }
                socket.on('ping', heartbeat)

                function onConnectionOpened() {
                    clearTimeout(connectionTimeout)
                    // SA.logger.debug('opened socket connection with '+ hostInfo())
                    heartbeat()
                    new Promise((handshakeResolution, handshakeRejection) => thisObject.socketNetworkClients.handshakeProcedure(handshakeResolution, handshakeRejection))
                        .then(() => resolve())
                        .catch(err => {
                            let message = 'handshake rejection'
                            if(err) {
                                message = err
                            }
                            reject(message)
                            socket.close()
                        })
                }
                
                function onConnectionClosed() {
                    if(connectionTimeout !== undefined) {
                        clearTimeout(connectionTimeout)
                    }

                    clearTimeout(socket.pingTimeout)
                    if (thisObject.socketNetworkClients.isConnected === true) {
                        SA.logger.info('')
                        SA.logger.info('Websockets Client Disconnected from Network Node via Web Sockets ............. Disconnected from ' + connectionInfo())
                        SA.logger.info('')
                    }
                    if (thisObject.onConnectionClosedCallBack !== undefined) {
                        thisObject.onConnectionClosedCallBack(thisObject.id)
                    }
                    thisObject.socketNetworkClients.isConnected = false
                }
                
                function onError(err) {
                    if(connectionTimeout !== undefined) {
                        clearTimeout(connectionTimeout)
                    }
                    if (err.message.indexOf('ECONNREFUSED') >= 0) {
                        /*
                        DEBUG NOTE: If you are having trouble undestanding why you can not connect to a certain network node, then you can activate the following Console Logs, otherwise you keep them commented out.
                        */ 
                        SA.logger.error('Web Sockets Network Client -> onError -> Nobody home at ' + hostInfo())
                        
                        reject('Web Sockets Network Client -> onError -> Nobody home at ' + hostInfo())
                        return
                    } else if (err.message.indexOf('ETIMEDOUT') >= 0) {
                        /*
                        DEBUG NOTE: If you are having trouble undestanding why you can not connect to a certain network node, then you can activate the following Console Logs, otherwise you keep them commented out.
                        */ 
                        SA.logger.error('Web Sockets Network Client -> onError -> Connection Timed out ' + hostInfo())
                        
                        reject('Web Sockets Network Client -> onError -> Connection Timed out ' + hostInfo())
                        return
                    }
                    SA.logger.error('Web Sockets Network Client -> onError -> err.message = ' + err.message)
                    SA.logger.error('Web Sockets Network Client -> onError -> err.stack = ' + err.stack)
                    reject('Web Sockets Network Client -> onError -> err.message = ' + err.message)
                    return
                }

                /* This function awaits a heartbeat from the server every 30 seconds + 15 seconds grace and re-initializes if not received. Prevents hidden connection drops. Ensure timeout matches with WebSocketsInterface.js
                Longer grace period is required due to large Bitcoin Factory files being transferred, this blocking the connection for the ping for a little while. 
                */
                function heartbeat() {
                    // SA.logger.debug('pinged from '+ hostInfo())
                    clearTimeout(socket.pingTimeout)
                    socket.pingTimeout = setTimeout(() => {
                        SA.logger.info('No Websockets heartbeat received from server, re-initializing connection...')
                        socket.terminate()
                    }, 30000 + 15000)
                }

            } catch (err) {
                SA.logger.error('Web Sockets Network Client -> setUpWebSocketClient -> err.stack = ' + err.stack)
            }
        }
    }

    function connectionInfo() {
        return thisObject.p2pNetworkNode.userProfile.config.codeName + ' -> ' + thisObject.p2pNetworkNode.node.name + ' -> ' + hostInfo()
    }

    function hostInfo() {
        return thisObject.host + ':' + thisObject.port
    }
}