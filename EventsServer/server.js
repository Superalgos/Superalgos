/* Callbacks default responses. */

global.DEFAULT_OK_RESPONSE = {
    result: "Ok",
    message: "Operation Succeeded"
};

global.DEFAULT_FAIL_RESPONSE = {
    result: "Fail",
    message: "Operation Failed"
};

var ipc = require('node-ipc');

ipc.config.id = 'world';
ipc.config.retry = 1500;
ipc.config.silent = true;

let eventHandlers = new Map()
let counter = 0

ipc.serve(
    function () {
        ipc.server.on(
            'message',
            function (data, socket) {
                ipc.log('[INFO] Events Server -> Got a new message : '.debug, data);

                try {
                    let command = JSON.parse(data)

                    switch (command.action) {
                        case "greetings": {
                            sendResponse(global.DEFAULT_OK_RESPONSE)
                            return
                        }
                        case "createEventHandler": {
                            let eventHandler = eventHandlers.get(command.eventHandlerName)
                            if (eventHandler === undefined) {
                                /*
                                We will only create event handlers which were not created before. Remember that someone trying to listen events
                                at an event handler that does not exist, will create that eventhandler, so it is possible that the emitter
                                when trying to create the event handler in fact was late and the event handler is already there if the listener
                                arrived here first. An event handler created with this method is not destroyed if there are no listeners or they
                                all leave.
                                */
                                eventHandler = newEventHandler()
                                eventHandler.deleteWhenAllListenersAreGone = false
                                eventHandlers.set(command.eventHandlerName, eventHandler)
                            } 
                            sendResponse(global.DEFAULT_OK_RESPONSE)
                            return
                        }
                        case "deleteEventHandler": {
                            let eventHandler = eventHandlers.get(command.eventHandlerName)
                            if (eventHandler !== undefined) {
                                /*
                                We will only delete event handlers which have noone listening, allowing a listener to continue listening even
                                when the event emitter is gone, asuming that it could come back at some point in time and resume emitting.
                                */
                                if (eventHandler.listeners.length === 0) {
                                    eventHandlers.delete(command.eventHandlerName)
                                } else {
                                    eventHandler.deleteWhenAllListenersAreGone = true
                                }
                            } 
                            
                            sendResponse(global.DEFAULT_OK_RESPONSE)
                            return
                        }
                        case "listenToEvent": {
                            let eventHandler = eventHandlers.get(command.eventHandlerName)
                            if (eventHandler === undefined) {
                                /*
                                We will create event handlers which were not created before if a listener tries to listen to a handler that does noet
                                exist before the emitter comes and create it. This is to aviod syncronization problems and also problems with emitters life
                                cycles with higher frecuency that the ones of listeners. Created in this way, event handlers are marked for deletion if
                                all listeners stop listening at one point in time.
                                */
                                eventHandler = newEventHandler()
                                eventHandler.deleteWhenAllListenersAreGone = true
                                eventHandlers.set(command.eventHandlerName, eventHandler)
                            }
                            eventSubscriptionId = eventHandler.listenToEvent(command.eventHandlerName, command.eventType, command.callerId, handlerFunction, command.extraData)

                            function handlerFunction(event, extraData) {
                                let outputData = {
                                    action: 'Event Raised',
                                    eventHandlerName: command.eventHandlerName,
                                    eventType: command.eventType,
                                    event: event,
                                    callerId: command.callerId,
                                    extraData: extraData
                                }
                                ipc.server.emit(
                                    socket,
                                    'message', 
                                    JSON.stringify(outputData)
                                );
                            }

                            let response = {
                                result: global.DEFAULT_OK_RESPONSE.result,
                                message: global.DEFAULT_OK_RESPONSE.message,
                                eventSubscriptionId: eventSubscriptionId
                            }
 
                            sendResponse(response)
                            return
                        }
                        case "stopListening": {
                            let eventHandler = eventHandlers.get(command.eventHandlerName)

                            if (eventHandler === undefined) {
                                if (ipc.config.silent !== true) {
                                    console.log("[WARN] Events Server -> Cannot to stop listening to events at an Event Handler that does not exist. Command = "+ JSON.stringify(command))
                                }
                                sendResponse(global.DEFAULT_FAIL_RESPONSE)
                                return
                            }

                            eventHandler.stopListening(command.eventHandlerName, command.eventType, command.callerId, command.eventSubscriptionId)

                            /*
                            We check here if there are no more listeners and the event handler original emmiter is also gone, then we need to delete
                            this event handlers since chances are that is not needed anymore.
                            */
                            if (eventHandler.listeners.length === 0 && eventHandler.deleteWhenAllListenersAreGone === true) {
                                eventHandlers.delete(command.eventHandlerName)
                            }

                            sendResponse(global.DEFAULT_OK_RESPONSE)
                            return
                        }
                        case "raiseEvent": {
                            let eventHandler = eventHandlers.get(command.eventHandlerName)

                            if (eventHandler === undefined) {
                                if (ipc.config.silent !== true) {
                                console.log("[WARN] Events Server -> Cannot raise events at an Event Handler that does not exist. Command = " + JSON.stringify(command))
                                }
                                sendResponse(global.DEFAULT_FAIL_RESPONSE)
                                return
                            }
                            //console.log("[INFO] Events Server -> Raising Event " + command.eventHandlerName + " " + command.eventType)
                            eventHandler.raiseEvent(command.eventType, command.event)
                            sendResponse(global.DEFAULT_OK_RESPONSE)
                            return
                        }
                    }

                    console.log("[WARN] Events Server -> Unknown Command Received:" + data)

                    function sendResponse(message) {
                        if (command.callerId) {
                            message.callerId = command.callerId
                        }
                        message.action = 'Event Server Response'
                        ipc.server.emit(
                            socket,
                            'message',
                            JSON.stringify(message)
                        );
                    }

                } catch (err) {
                    console.log("[ERROR] Events Server -> Bad Command Received:" + data)
                    console.log("[ERROR] Events Server -> An Error Happened:" + err.stack)
                    sendResponse(global.DEFAULT_FAIL_RESPONSE)
                }   

            }
        );
        ipc.server.on(
            'connect',
            function (socket) {
                ipc.log('[INFO] Events Server -> client has connected!');
            }
        );
        ipc.server.on(
            'socket.disconnected',
            function (socket) {
                ipc.log('[INFO] Events Server -> client has disconnected!');
            }
        );
    }


);

ipc.server.start();
console.log('Events Server Started.')

function newEventHandler() {
    let thisObject = {
        name: undefined,                            // This is for debugging purposes only.
        deleteWhenAllListenersAreGone: false,
        listeners: [],                              // Here we store all the functions we will call when an event is raiseed.
        listenToEvent: listenToEvent,
        stopListening: stopListening,
        raiseEvent: raiseEvent,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.listeners = []
    }

    function listenToEvent(eventHandlerName, eventType, callerId, handler, extraData) {
        let eventSubscriptionId = Math.trunc(Math.random() * 1000000)
        thisObject.listeners.push([eventHandlerName, eventType, callerId, handler, extraData, eventSubscriptionId])
        return eventSubscriptionId
    }

    function stopListening(eventHandlerName, eventType, callerId, eventSubscriptionId) {

        if (eventSubscriptionId !== undefined) {
            for (let i = 0; i < thisObject.listeners.length; i++) {
                if (eventSubscriptionId === thisObject.listeners[i][5]) {
                    thisObject.listeners.splice(i, 1)
                    return
                }
            }
        }
        if (eventHandlerName !== undefined && eventType !== undefined && callerId !== undefined) {
            for (let i = 0; i < thisObject.listeners.length; i++) {
                if (eventHandlerName === thisObject.listeners[i][0] && eventType === thisObject.listeners[i][1] && callerId === thisObject.listeners[i][2]) {
                    thisObject.listeners.splice(i, 1)
                    return
                }
            }
        }
    }

    function raiseEvent(eventType, event) {
        for (let i = 0; i < thisObject.listeners.length; i++) {
            /* We will execute all the functions listening to this event type. */

            if (thisObject.listeners[i][1] === eventType) {
                let handler = thisObject.listeners[i][3]
                let extraData = thisObject.listeners[i][4]

                handler(event, extraData)
            }
        }
    }
}
