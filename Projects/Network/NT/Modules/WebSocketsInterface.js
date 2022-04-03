exports.newNetworkModulesWebSocketsInterface = function newNetworkModulesWebSocketsInterface() {
    /*
    This module represents the websockets interface of the Network Node.

    A Network Nodes is expected to receive requests from 2 different types
    of entities:

    1. Other Network Nodes.
    2. Client Apps. 

    This module deals with those 2 connection types and is the one receiving from
    and sending messages to those entities.
    */
    let thisObject = {
        socketInterfaces: undefined, 
        socketServer: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.socketServer = undefined
        thisObject.socketInterfaces.finalize()
        thisObject.socketInterfaces = undefined
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

            function onConnectionOpened(socket)
            /*
            This function is executed every time a new Websockets connection
            is established.
            */ {
                let caller = {
                    socket: socket,
                    userProfile: undefined,
                    userAppBlockchainAccount: undefined,
                    role: undefined
                }

                caller.socket.id = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
                caller.socket.on('close', onConnectionClosed)

                let calledTimestamp = (new Date()).valueOf()

                caller.socket.on('message', onMenssage)

                function onMenssage(message) {
                    thisObject.socketInterfaces.onMenssage(message, caller, calledTimestamp)
                }

                function onConnectionClosed() {
                    let socketId = this.id
                    thisObject.socketInterfaces.onConnectionClosed(socketId)
                }
            }
        } catch (err) {
            console.log('[ERROR] Web Sockets Interface -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }
    }
}