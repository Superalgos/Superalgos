
function newEventsServerClient(host, port, hostName) {
    /* Web Sockets Connection */

    const MODULE_NAME = 'System Event Handler'
    const ERROR_LOG = true
    const INFO_LOG = true
    const logger = newWebDebugLog()
    logger.fileName = MODULE_NAME

    if (host === '' || host === undefined) { host = 'localhost' }
    if (port === '' || port === undefined) { port = '8081' }

    const WEB_SOCKETS_URL = 'ws://' + host + ':' + port + ''
    let WEB_SOCKETS_CONNECTION

    let thisObject = {
        isConnected: isConnected,
        initialize: initialize,
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

    return thisObject

    function initialize(callBackFunction) {
        setuptWebSockets(callBackFunction)
    }

    function isConnected() {
        if (WEB_SOCKETS_CONNECTION.readyState === 1) {
            return true
        } else {
            return false
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
        nonce++
        let stringNonce = nonce.toString()
        let timestamp = (new Date()).valueOf()
        commandsWaitingConfirmation.set(stringNonce, command)
        commandsSentByTimestamp.set(stringNonce, timestamp)

        let messageToWebSocketServer = 'Web Browser' + '|*|' + stringNonce + '|*|' + JSON.stringify(command)

        if (WEB_SOCKETS_CONNECTION.readyState === 1) {
            WEB_SOCKETS_CONNECTION.send(messageToWebSocketServer)
        } else {
            console.log('WebSocket message could not be sent because the connection was not ready. Will retry soon. Message = ' + JSON.stringify(command))
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
            if (WEB_SOCKETS_CONNECTION.readyState === 3) { // Connection closed. May happen after computer goes to sleep.
                setuptWebSockets(onOpen)
                function onOpen() {
                    if (INFO_LOG === true) { logger.write('[INFO] setuptWebSockets -> Found Web Sockets Connection Closed. Reconnected to WebSockets Server.') }
                }
            }
        }

        if (thisObject.isConnected() !== true) {
            canvas.cockpitSpace.setStatus('Connecting to Superalgos Backend at ' + hostName + ' Network Node. Please wait until the connection is established.', 100, canvas.cockpitSpace.statusTypes.WARNING)
        } else {
            retryCommandsPhysics()
        }

        DEBUG.variable4 = 'Commands Waiting For Confirmation from WS Server: ' + commandsWaitingConfirmation.size
    }

    function setuptWebSockets(callBackFunction) {
        try {
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
