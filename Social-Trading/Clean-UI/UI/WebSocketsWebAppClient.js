function newWebSocketsWebAppClient() {

    let thisObject = {
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    let socketClient

    let called = {}
    let onMessageFunctionsMap = new Map()

    return thisObject

    function finalize() {
        socketClient.close()
        socketClient = undefined
        clientInterface = undefined

        called = undefined
        onMessageFunctionsMap = undefined
    }

    async function initialize() {

        socketClient = new WebSocket('ws://' + JSON.parse(UI.clientNode.config).host + ':' + JSON.parse(UI.clientNode.config).webSocketsPort)

        await setUpWebsocketClient()
    }

    async function setUpWebsocketClient() {

        return new Promise(connectToNewtwork)

        function connectToNewtwork(resolve, reject) {

            try {
                socketClient.onopen = () => { onConnection() }
                socketClient.onerror = err => { onError(err) }

                function onConnection() {
                    socketClient.onmessage = socketMessage => { onMessage(socketMessage) }
                    resolve()
                }

                function onError(err) {
                    console.log((new Date()).toISOString(), '[ERROR] Web Sockets WebApp Client -> onError -> err.message = ' + err.message)
                    console.log((new Date()).toISOString(), '[ERROR] Web Sockets WebApp Client -> onError -> err.stack = ' + err.stack)
                }

            } catch (err) {
                console.log((new Date()).toISOString(), '[ERROR] Web Sockets WebApp Client -> setUpWebsocketClient -> err.stack = ' + err.stack)
            }
        }
    }

    function sendMessage(message) {

        return new Promise(sendSocketMessage)

        function sendSocketMessage(resolve, reject) {

            if (socketClient.readyState !== 1) { // 1 means connected and ready.
                console.log((new Date()).toISOString(), '[ERROR] Web Sockets WebApp Client -> sendMessage -> Cannot send message while connection is closed.')
                reject('Websockets Connection Not Ready.')
                return
            }

            let socketMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                messageType: 'Request',
                payload: message
            }
            onMessageFunctionsMap.set(socketMessage.messageId, onMessageFunction)
            socketClient.send(
                JSON.stringify(socketMessage)
            )

            function onMessageFunction(response) {
                try {
                    if (response.result === 'Ok') {
                        resolve(response.data)
                    } else {
                        console.log((new Date()).toISOString(), '[ERROR] Web Sockets WebApp Client -> onMessage -> response.message = ' + response.message)
                        reject(response.message)
                    }

                } catch (err) {
                    callbackFunction = undefined
                    console.log((new Date()).toISOString(), '[ERROR] Web Sockets WebApp Client -> err.stack = ' + err.stack)
                }
            }
        }
    }

    function onMessage(socketMessage) {

        let message = JSON.parse(socketMessage.data)
        /*
        We get the function that is going to resolve or reject the promise given.
        */
        onMessageFunction = onMessageFunctionsMap.get(message.messageId)
        onMessageFunctionsMap.delete(message.messageId)

        if (onMessageFunction !== undefined) {
            /*
            The message received is a response to a message sent.
            */
            onMessageFunction(message)
        } else {
            /*
            The message received is a not response to a message sent.
            That means that is an event received from the Client App.
            */
            let event
            try {
                event = JSON.parse(message)
            } catch (err) {
                console.log((new Date()).toISOString(), '[ERROR] Web Sockets WebApp Client -> onMessage -> message = ' + message)
                console.log((new Date()).toISOString(), '[ERROR] Web Sockets WebApp Client -> onMessage -> err.stack = ' + err.stack)
                thisObject.socket.close()
                return
            }

            UI.webApp.messageReceived(JSON.stringify(event))
        }
    }
}