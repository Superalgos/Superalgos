
function newEventsServerClient(networkNode) {
    /* Web Sockets Connection */

    const MODULE_NAME = 'System Event Handler'
    const ERROR_LOG = true
    const INFO_LOG = true
    const logger = newWebDebugLog()


    let WEB_SOCKETS_CONNECTION

    let thisObject = {
        isConnected: isConnected,
        initialize: initialize,
        finalize: finalize,
        physics: physics,
        createEventHandler: createEventHandler,
        deleteEventHandler: deleteEventHandler,
        listenToEvent: listenToEvent,
        stopListening: stopListening,
        raiseEvent: raiseEvent
    }

    let eventListeners = new Map()
    let responseWaiters = new Map()
    let commandsWaitingConfirmation = new Map()
    let commandsSentByTimestamp = new Map()
    let nonce = 0
    let lastTryToReconnectDatetime

    return thisObject

    function initialize(callBackFunction) {
        setuptWebSockets(callBackFunction)
    }

    function finalize() {
        WEB_SOCKETS_CONNECTION.close()
        WEB_SOCKETS_CONNECTION.onerror = undefined
        WEB_SOCKETS_CONNECTION.onmessage = undefined
        WEB_SOCKETS_CONNECTION.onopen = undefined
        WEB_SOCKETS_CONNECTION = undefined

        eventListeners = undefined
        responseWaiters = undefined
        commandsWaitingConfirmation = undefined
        commandsSentByTimestamp = undefined
        nonce = undefined
        thisObject = undefined
    }

    function isConnected() {
        if (WEB_SOCKETS_CONNECTION !== undefined) {
            if (WEB_SOCKETS_CONNECTION.readyState === 1) {
                return true
            }
        }
    }

    function sendCommand(command, responseCallBack, eventsCallBack) {
        if (command.action === 'listenToEvent') {
            let key
            if (command.callerId !== undefined) {
                key = command.eventHandlerName + '-' + command.eventType + '-' + command.callerId
            } else {
                key = command.eventHandlerName + '-' + command.eventType
            }
            eventListeners.set(key, eventsCallBack)
        }
        if (command.callerId && responseCallBack) {
            responseWaiters.set(command.callerId, responseCallBack)
        }

        sendToWebSocketServer(command)
    }

    function sendToWebSocketServer(command) {
        if (commandsWaitingConfirmation === undefined) { return } // object already finalized

        nonce++
        let stringNonce = nonce.toString()
        let timestamp = (new Date()).valueOf()
        commandsWaitingConfirmation.set(stringNonce, command)
        commandsSentByTimestamp.set(stringNonce, timestamp)

        let messageToWebSocketServer = 'Web Browser' + '|*|' + stringNonce + '|*|' + JSON.stringify(command)

        if (WEB_SOCKETS_CONNECTION.readyState === 1) {
            WEB_SOCKETS_CONNECTION.send(messageToWebSocketServer)
        } else {
            //console.log('WebSocket message could not be sent because the connection was not ready. Will retry soon. Message = ' + JSON.stringify(command))
        }
    }

    function createEventHandler(eventHandlerName, callerId, responseCallBack) {
        let eventCommand = {
            action: 'createEventHandler',
            eventHandlerName: eventHandlerName,
            callerId: callerId
        }
        sendCommand(eventCommand, responseCallBack)
    }

    function deleteEventHandler(eventHandlerName, callerId, responseCallBack) {
        let eventCommand = {
            action: 'deleteEventHandler',
            eventHandlerName: eventHandlerName,
            callerId: callerId
        }
        sendCommand(eventCommand, responseCallBack)
    }

    function listenToEvent(eventHandlerName, eventType, extraData, callerId, responseCallBack, eventsCallBack) {
        let eventCommand = {
            action: 'listenToEvent',
            eventHandlerName: eventHandlerName,
            eventType: eventType,
            extraData: extraData,
            callerId: callerId
        }
        sendCommand(eventCommand, responseCallBack, eventsCallBack)
    }

    function stopListening(eventHandlerName, eventSubscriptionId, callerId, responseCallBack) {
        let eventCommand = {
            action: 'stopListening',
            eventHandlerName: eventHandlerName,
            eventSubscriptionId: eventSubscriptionId,
            callerId: callerId
        }
        sendCommand(eventCommand, responseCallBack)
    }

    function raiseEvent(eventHandlerName, eventType, event, callerId, responseCallBack) {
        let eventCommand = {
            action: 'raiseEvent',
            eventHandlerName: eventHandlerName,
            eventType: eventType,
            event: event,
            callerId: callerId
        }
        sendCommand(eventCommand, responseCallBack)
    }

    function retryCommandsPhysics() {
        commandsSentByTimestamp.forEach(checkTimestamp)

        function checkTimestamp(timestamp, nonce) {
            const MILISECONDS_TO_WAIT_FOR_RETRYING_A_COMMAND = 10000
            let now = (new Date()).valueOf()

            if ((now - timestamp) > MILISECONDS_TO_WAIT_FOR_RETRYING_A_COMMAND) {
                let command = commandsWaitingConfirmation.get(nonce)
                commandsWaitingConfirmation.delete(nonce)
                commandsSentByTimestamp.delete(nonce)

                sendToWebSocketServer(command)
            }
        }
    }

    function physics() {
        if (WEB_SOCKETS_CONNECTION !== undefined) {
            if (WEB_SOCKETS_CONNECTION.readyState === 3) {
                /*
                Connection closed. May happen after computer goes to sleep.
                We will try to reconnect, but we will do it no more that once 
                a minute.
                */
                if (lastTryToReconnectDatetime === undefined) {
                    setuptWebSockets(onOpen)
                    lastTryToReconnectDatetime = (new Date()).valueOf()
                } else {
                    let now = (new Date()).valueOf()
                    if (now - lastTryToReconnectDatetime > 60000) {
                        setuptWebSockets(onOpen)
                    }
                }

                function onOpen() {
                    if (INFO_LOG === true) { logger.write('[INFO] setuptWebSockets -> Found Web Sockets Connection Closed. Reconnected to WebSockets Server.') }
                }
            }
        } else {
            /* 
            If there is a problem with the configuration then we go through 
            this path, retrying this until the configuration is fixed.
            */
            setuptWebSockets(onOpen)
        }

        if (thisObject.isConnected() !== true) {
            if (lastTryToReconnectDatetime !== undefined) {
                if (networkNode !== undefined) {
                    if (networkNode.payload !== undefined) {
                        if (networkNode.payload.uiObject !== undefined) {
                            networkNode.payload.uiObject.setErrorMessage('Failed to Connect to Superalgos Client via WebSockets. Retrying in 1 minute. Check at this node config if the host property has the IP address of the computer running Superalgos Client.')
                        }
                    }
                }
            }
        } else {
            if (networkNode !== undefined) {
                if (networkNode.payload !== undefined) {
                    if (networkNode.payload.uiObject !== undefined) {
                        networkNode.payload.uiObject.setStatus('Connected to Superalgos Client via WebSockets.')
                        retryCommandsPhysics()
                    }
                }
            }
        }

        DEBUG.variable4 = 'Commands Waiting For Confirmation from WS Server: ' + commandsWaitingConfirmation.size
    }

    function setuptWebSockets(callBackFunction) {
        try {
            let host
            let port
            /* At this point the node does not have the payload property yet, that is why we have to do this manually */
            try {
                let config = JSON.parse(networkNode.config)
                host = config.host
                port = config.webSocketsPort

                /* Check if we really have to stablish the connection. */
                if (config.autoConnect === false) { return }
            } catch (err) {
                networkNode.payload.uiObject.setErrorMessage(
                    'Bad configuration. Invalid JSON Format.',
                    undefined,
                    {
                        project: 'Superalgos',
                        category: 'Topic',
                        type: 'UI Websockets Error - Bad Configuration',
                        anchor: 'Invalid JSON Format'
                    }
                )
                return
            }

            if (host === undefined) {
                networkNode.payload.uiObject.setErrorMessage(
                    'Bad configuration. Host Property Not Found.',
                    undefined,
                    {
                        project: 'Superalgos',
                        category: 'Topic',
                        type: 'UI Websockets Error - Bad Configuration',
                        anchor: 'Host Property Not Found'
                    }
                )
                return
            }

            if (port === undefined) {
                networkNode.payload.uiObject.setErrorMessage(
                    'Bad configuration. WebSocketsPort Property Not Found.',
                    undefined,
                    {
                        project: 'Superalgos',
                        category: 'Topic',
                        type: 'UI Websockets Error - Bad Configuration',
                        anchor: 'WebSocketsPort Property Not Found'
                    }
                )
                return
            }

            const WEB_SOCKETS_URL = 'ws://' + host + ':' + port + ''

            WEB_SOCKETS_CONNECTION = new WebSocket(WEB_SOCKETS_URL)
            WEB_SOCKETS_CONNECTION.onerror = error => {
                console.log('WebSocket error:' + JSON.stringify(error))
            }
            WEB_SOCKETS_CONNECTION.onopen = () => {
                if (callBackFunction !== undefined) {
                    callBackFunction()
                }
            }
            WEB_SOCKETS_CONNECTION.onmessage = e => {
                // console.log('Websoked Message Received: ' + e.data)

                let message = JSON.parse(e.data)

                if (message.action === 'Event Raised') {
                    let key
                    if (message.callerId !== undefined) {
                        key = message.eventHandlerName + '-' + message.eventType + '-' + message.callerId
                    } else {
                        key = message.eventHandlerName + '-' + message.eventType
                    }
                    let handler = eventListeners.get(key)
                    if (handler) {
                        handler(message)
                    }
                    return
                }

                if (message.action === 'Event Server Response') {
                    let handler = responseWaiters.get(message.callerId)
                    if (handler) {
                        handler(message)
                    }
                    return
                }

                if (message.action === 'Acknowledge') {
                    commandsWaitingConfirmation.delete(message.nonce)
                    commandsSentByTimestamp.delete(message.nonce)
                    return
                }
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] setuptWebSockets -> err = ' + err.stack) }
        }
    }
}
