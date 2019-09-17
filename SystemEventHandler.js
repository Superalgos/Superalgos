exports.newSystemEventHandler = function newSystemEventHandler(ipc) {
    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        createEventHandler: createEventHandler,
        deleteEventHandler: deleteEventHandler,
        listenToEvent: listenToEvent,
        stopListening: stopListening,
        raiseEvent: raiseEvent
    }

    let eventListeners = new Map()
    let responseWaiters = new Map()

    ipc.config.id = 'Task Server';
    ipc.config.retry = 1500;
    ipc.config.silent = true;

    return thisObject

    function initialize(canllerName, callBackFunction) {

        ipc.connectTo(
            'world',
            function () {
                ipc.of.world.on(
                    'connect',
                    function () {
                        ipc.log('## Connected to Superalgos Event Server ##'.rainbow, ipc.config.delay);

                        let eventCommand = {
                            action: 'greetings',
                            from: canllerName
                        }

                        sendCommand(eventCommand)

                        callBackFunction()
                    }
                );
                ipc.of.world.on(
                    'disconnect',
                    function () {
                        ipc.log('Disconnected from Superalgos Event Server '.notice);
                    }
                );
                ipc.of.world.on(
                    'message',  // here is where all incomming messages are processed.
                    function (data) {
                        ipc.log('Got a message from Superalgos Event Server: '.debug, data);
                        
                        let message = JSON.parse(data)

                        if (message.action === 'Event Raised') {

                            let key
                            if (message.callerId) {
                                key = message.eventHandlerName + '-' + message.eventType + '-' + message.callerId
                            } else {
                                key = message.eventHandlerName + '-' + message.eventType
                            }
                            let handler = eventListeners.get(key)
                            if (handler) {
                                handler.callBack(message)
                            } else {
                                console.log(key + ' not found so could not deliver event raised.')
                                console.log(' Message = ' + data)
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
                    }
                );
            }
        );
    }

    function finalize() {
        /* Before disconnecting we will forze all eventListeners to stop listening. */
        const eventListenersArray = [...eventListeners.values()]
        for (let i = 0; i < eventListenersArray.length; i++) {
            let handler = eventListenersArray[i]
            let eventCommand = {
                action: 'stopListening',
                eventHandlerName: handler.eventHandlerName,
                eventType: handler.eventType,
                callerId: handler.callerId
            }
            sendCommand(eventCommand)
        }
        ipc.disconnect('world');
    }

    function sendCommand(command, responseCallBack, eventsCallBack) {

        if (command.action === 'listenToEvent') {
            let key
            if (command.callerId) {
                key = command.eventHandlerName + '-' + command.eventType + '-' + command.callerId
            } else {
                key = command.eventHandlerName + '-' + command.eventType
            }
            let handler = {
                eventHandlerName: command.eventHandlerName,
                eventType: command.eventType,
                callerId: command.callerId,
                callBack: eventsCallBack
            }
            eventListeners.set(key, handler)
        }
        if (command.callerId && responseCallBack) {
            responseWaiters.set(command.callerId, responseCallBack)
        }

        ipc.of.world.emit(
            'message',
            JSON.stringify(command)
        )
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

    function stopListening(eventHandlerName, eventType, eventSubscriptionId, callerId, responseCallBack) {
        /* User either needs to specify a valid eventSubscriptionId OR the 3 params: eventHandlerName, eventType, callerId which were used when start listening to events. */
        let eventCommand = {
            action: 'stopListening',
            eventHandlerName: eventHandlerName,
            eventType: eventType,
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
}