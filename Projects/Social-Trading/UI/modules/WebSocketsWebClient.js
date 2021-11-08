function newSocialTradingModulesWebSocketsWebClient() {

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

        socketClient = new WebSocket('ws://' + UI.environment.DESKTOP_WEB_SOCKETS_INTERFACE_HOST + ':' + UI.environment.DESKTOP_WEB_SOCKETS_INTERFACE_PORT)

        await setUpWebsocketClient()
    }

    async function setUpWebsocketClient() {

        return new Promise(connectToNewtwork)

        function connectToNewtwork(resolve, reject) {

            try {
                socketClient.onopen = () => { onConnection() }
                socketClient.onerror = err => { onError(err) }

                function onConnection() {
                    socketClient.onmessage = socketMessage => { onMenssage(socketMessage) }
                    resolve()
                }

                function onError(err) {
                    console.log('[ERROR] Web Sockets Client -> onError -> err.message = ' + err.message)
                    console.log('[ERROR] Web Sockets Client -> onError -> err.stack = ' + err.stack)
                }

            } catch (err) {
                console.log('[ERROR] Web Sockets Client -> setUpWebsocketClient -> err.stack = ' + err.stack)
            }
        }
    }

    function sendMessage(message) {

        return new Promise(sendSocketMessage)

        function sendSocketMessage(resolve, reject) {

            if (socketClient.readyState !== 1) { // 1 means connected and ready.
                console.log('[ERROR] Web Sockets Client -> sendMessage -> Cannot send message while connection is closed.')
                reject('Websockets Connection Not Ready.')
                return
            }

            let socketMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                messageType: 'Request',
                payload: message
            }
            onMessageFunctionsMap.set(socketMessage.messageId, onMenssageFunction)
            socketClient.send(
                JSON.stringify(socketMessage)
            )

            function onMenssageFunction(response) {
                try {
                    if (response.result === 'Ok') {
                        resolve(response.data)
                    } else {
                        console.log('[ERROR] Web Sockets Client -> onMenssage -> response.message = ' + response.message)
                        reject(response.message)
                    }

                } catch (err) {
                    callbackFunction = undefined
                    console.log('[ERROR] Web Sockets Client -> err.stack = ' + err.stack)
                }
            }
        }
    }

    function onMenssage(socketMessage) {

        let response = JSON.parse(socketMessage.data)
        /*
        We get the function that is going to resolve or reject the promise given.
        */
        onMenssageFunction = onMessageFunctionsMap.get(response.messageId)
        onMessageFunctionsMap.delete(response.messageId)
        onMenssageFunction(response)
    }
}