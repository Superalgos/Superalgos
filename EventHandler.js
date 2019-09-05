exports.newEventHandler = function newEventHandler() {
    let thisObject = {
        initialize: initialize,
        createEventHandler: createEventHandler,
        deleteEventHandler: deleteEventHandler,
        listenToEvent: listenToEvent,
        stopListening: stopListening,
        raiseEvent: raiseEvent 
    }

    let ipc = require('node-ipc');
    let eventListeners = new Map()
    let responseWaiters = new Map()

    ipc.config.id = 'Clone Executor';
    ipc.config.retry = 1500;

    return thisObject

    function initialize(callBackFunction) {

        ipc.connectTo(
            'world',
            function () {
                ipc.of.world.on(
                    'connect',
                    function () {
                        ipc.log('## Connected to Superalgos Event Server ##'.rainbow, ipc.config.delay);

                        let eventCommand = {
                            action: 'greetings',
                            from: 'Clone Executor'
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
                            let handler = eventListeners.get(message.eventHandlerName + '-' + message.eventType)
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
                    }
                );
            }
        );
    }

    function sendCommand(command, responseCallBack, eventsCallBack) {

        if (command.action === 'listenToEvent') {
            eventListeners.set(command.eventHandlerName + '-' + command.eventType, eventsCallBack)
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
        eventCommand = {
            action: 'listenToEvent',
            eventHandlerName: eventHandlerName,
            eventType: eventType,
            extraData: extraData,
            callerId: callerId
        }

        sendCommand(eventCommand, responseCallBack, eventsCallBack)
    }

    function stopListening(eventHandlerName, eventSubscriptionId, callerId, responseCallBack) {
        eventCommand = {
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
}