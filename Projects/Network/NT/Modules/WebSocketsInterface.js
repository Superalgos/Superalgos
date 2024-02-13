/**
 * This module represents the websockets interface of the Network Node.
 *
 * A Network Nodes is expected to receive requests from 2 different types
 * of entities: 
 * 
 * 1. Other Network Nodes.
 * 2. Client Apps. 
 * 
 * This module deals with those 2 connection types and is the one receiving from
 * and sending messages to those entities.
 */
exports.newNetworkModulesWebSocketsInterface = function newNetworkModulesWebSocketsInterface() {
    let thisObject = {
        socketInterfaces: undefined, 
        socketServer: undefined,
        initialize: initialize,
        finalize: finalize
    }

    /**
     * @typedef {{
     *   id: string,
     *   socket: WebSocket,
     *   userProfile?: {
     *     id: string,
     *     name: string,
     *     ranking: number,
     *   },
     *   userAppBlockchainAccount?: any,
     *   role?: string
     * }} Caller
     */

    /**
     * Map of all active websocket connections
     * @type {Map<WebSocket,Caller>}
     */
    const clients = new Map();

    /**
     * Websocket ping interval
     * @type {NodeJS.Timeout}
     */
    let interval = undefined;

    return thisObject

    function finalize() {
        thisObject.socketServer = undefined
        thisObject.socketInterfaces.finalize()
        thisObject.socketInterfaces = undefined
        if(interval !== undefined) {
            clearInterval(interval)
        }
    }

    function initialize() {
        thisObject.socketInterfaces = NT.projects.network.modules.socketInterfaces.newNetworkModulesSocketInterfaces()
        thisObject.socketInterfaces.initialize()

        let port = NT.networkApp.p2pNetworkNode.node.networkInterfaces.websocketsNetworkInterface.config.webSocketsPort
        thisObject.socketServer = new SA.nodeModules.ws.Server({ port: port })
        setUpWebSocketServer()
    }

    function setUpWebSocketServer() {
        try {
            thisObject.socketServer.on('connection', onConnectionOpened)

            /*
             * Running a single interval to trigger all ping requests
             * at the same time. The isAlive property is set to false
             * so if a pong response is not received then on the next
             * interval the client will be removed from all lists and
             * the connection terminated.
             */
            interval = setInterval(ping(), 30000)

            function ping() {
                SA.logger.debug(`Number of websocket clients: ${clients.size}`);
                [...clients.keys()].forEach(socket => {
                    const client = clients.get(socket);
                    if(!client.isAlive) {
                        SA.logger.info('Server could not confirm client to be alive, terminating Websockets connection for ' + tailLogInfo(client))
                        thisObject.socketInterfaces.onConnectionClosed(client.id)
                        socket.terminate()
                        clients.delete(socket)
                        return
                    }
                    SA.logger.debug('Server-side heart beat pinged for ' + tailLogInfo(client))
                    client.isAlive = false
                    socket.ping()
                })
            }

            /**
             * This function is executed every time a new Websockets connection
             * is established
             * 
             * @param {WebSocket} socket
             */
            function onConnectionOpened(socket) {
                /** @type {Caller} */ let caller = {
                    id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    isAlive: true,
                    socket,
                    userProfile: undefined,
                    userAppBlockchainAccount: undefined,
                    role: undefined
                }
                clients.set(socket, caller);
                SA.logger.debug('Added new caller to network client list ' + caller.id)

                caller.socket.id = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
                caller.socket.on('close', onConnectionClosed)

                /* 
                 * Active bi-directional heartbeat of the websockets connection to detect and handle hidden connection drops 
                 */
                caller.socket.isAlive = true
                caller.socket.on('pong', heartbeat)

                let calledTimestamp = (new Date()).valueOf()

                caller.socket.on('message', onMessage)

                function onMessage(message) {
                    thisObject.socketInterfaces.onMessage(message, caller, calledTimestamp)
                }

                function heartbeat() {
                    caller.isAlive = true
                    SA.logger.debug('Incoming Pong received for ' + tailLogInfo(caller))
                }

                function onConnectionClosed() {
                    SA.logger.debug('Closing socket for ' + tailLogInfo(caller))
                    thisObject.socketInterfaces.onConnectionClosed(caller.id)
                    SA.logger.debug('Deleting socket client for ' + tailLogInfo(caller))
                    clients.delete(socket)
                }
            }
        } catch (err) {
            SA.logger.error('Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }

        /**
         * @param {{
         *   userProfile?: {
         *     name: string
         *   },
         *   id: string
         * }} caller 
         * @returns {string}
         */
        function tailLogInfo(caller) {
            if (caller.userProfile?.name !== undefined) {
                return ' user ' + caller.userProfile.name
            } else if (caller.id !== undefined) {
                return ' socket id ' + caller.id
            }
            return 'caller does not have a user profile name or caller id'
        }
    }
}