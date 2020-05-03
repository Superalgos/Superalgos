exports.newTaskManagerServer = function newTaskManagerServer(WEB_SOCKETS_SERVER, EVENTS_SERVER) {

    const MODULE = "Task Manager Server"

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    /*

    This server creates and destroys Task Servers according to what is going on at the UI. Each of these created servers will do their own
    work. The responsibility of this server is to manage those children processes in order to be in sync with what the end user want and is defining
    at the user interface.

    */

    const { fork } = require('child_process')
    require('dotenv').config()
    tasks = new Map()

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function run() {

        /*
        
        Here we will create an Event Handler for this server. After that we will listen to events happening here. Elements of the UI will raise events here,
        as a way to communicate what is going on with the user interacting with UI components. That is the way this server will know for example when a new
        task needs to be created or destroyed.
        
        */

        let eventsServerClient = newEventsServerClient()
        eventsServerClient.createEventHandler('Task Manager')
        eventsServerClient.listenToEvent('Task Manager', 'Run Task', undefined, undefined, undefined, runTask)
        eventsServerClient.listenToEvent('Task Manager', 'Stop Task', undefined, undefined, undefined, stopTask)

        console.log('Task Manager Server Started.')
      
        function runTask(message) {
            //console.log('[INFO] BackendServers -> Task Manager Server -> runTask -> Entering function.') 

            if (message.event === undefined) {
                console.log('[WARN] BackendServers -> Task Manager Server -> runTask -> Message Received Without Event -> message = ' + JSON.stringify(message).substring(0, 1000))
                return
            }

            if (message.event.taskId === undefined) {
                console.log('[WARN] BackendServers -> Task Manager Server -> runTask -> Message Received Without taskId -> message = ' + JSON.stringify(message).substring(0, 1000))
                return
            }

            if (message.event.taskDefinition === undefined) {
                console.log('[WARN] BackendServers -> Task Manager Server -> runTask -> Message Received Without taskDefinition -> message = ' + JSON.stringify(message).substring(0, 1000))
                return
            }

            if (tasks.get(message.event.taskId) !== undefined) {
                let key = message.event.taskName + '-' + 'Task' + '-' + message.event.taskId
                eventsServerClient.raiseEvent(key, 'Running') // Meaning Task Running
                return
            }
            //console.log('[INFO] BackendServers -> Task Manager Server -> runTask -> Task Name = ' + message.event.taskName)
            //console.log('[INFO] BackendServers -> Task Manager Server -> runTask -> Task Id = ' + message.event.taskId) 

            let path = process.env.TASK_SERVER_PATH + '/server.js'

            /* Workarround to avoid having the same debug port at the forked process which makes it crash. */
            for (let i = 0; i < process.execArgv.length; i++) {
                let argument = process.execArgv[i]
                if (argument.indexOf('--inspect') > -1) {
                    process.execArgv[i] = ''
                }
            }

            /* Forking this process. */
            let task = {
                childProcess: fork(path, [message.event.taskId], { stdio: 'inherit' }),
                id: message.event.taskId,
                name: message.event.taskName
            }

            tasks.set(message.event.taskId, task)

            task.childProcess.on('error', (err) => {
                console.log('[ERROR] BackendServers -> Task Manager Server -> runTask -> Problem with Task Name = ' + task.name)
                console.log('[ERROR] BackendServers -> Task Manager Server -> runTask -> Problem with Task Id = ' + task.id)
                console.log(`[ERROR] BackendServers -> Task Manager Server -> runTask -> Task Manager exited with error ${err}`)
            })
            task.childProcess.on('close', (code, signal) => {
                //console.log('[INFO] BackendServers -> Task Manager Server -> runTask -> Task Terminated. -> Task Name = ' + task.name)
                //console.log('[INFO] BackendServers -> Task Manager Server -> runTask -> Task Terminated. -> Task Id = ' + task.id)
                tasks.delete(task.id)
            })

            eventsServerClient.listenToEvent('Task Manager - ' + message.event.taskId, 'Nodejs Process Ready for Task', undefined, undefined, undefined, sendStartingEvent)

            function sendStartingEvent() {
                //console.log('[INFO] BackendServers -> Task Manager Server -> runTask -> Emitting Event -> key = ' + 'Task Server - ' + task.id)
                eventsServerClient.raiseEvent('Task Server - ' + task.id, 'Run Task', message.event)
            }
        }

        function stopTask(message) {

            //console.log('[INFO] BackendServers -> Task Manager Server -> stopTask -> Entering function.')

            if (message.event === undefined) {
                console.log('[WARN] BackendServers -> Task Manager Server -> stopTask -> Message Received Without Event -> message = ' + JSON.stringify(message).substring(0, 1000))
                return
            }

            if (message.event.taskId === undefined) {
                console.log('[WARN] BackendServers -> Task Manager Server -> stopTask -> Message Received Without taskId -> message = ' + JSON.stringify(message).substring(0, 1000))
                return
            }

            //console.log('[INFO] BackendServers -> Task Manager Server -> stopTask -> Task Name = ' + message.event.taskName)
            //console.log('[INFO] BackendServers -> Task Manager Server -> stopTask -> Task Id = ' + message.event.taskId) 

            let task = tasks.get(message.event.taskId)

            if (task) {
                task.childProcess.send('Stop this Task');
                //console.log('[INFO] BackendServers -> Task Manager Server -> stopTask -> Child Process instructed to finish.')
            } else {
                console.log('[WARN] BackendServers -> Task Manager Server -> stopTask -> Cannot delete Task that does not exist.')
            }
        }
    }

    function newEventsServerClient() {
        let thisObject = {
            initialize: initialize,
            finalize: finalize,
            createEventHandler: createEventHandler,
            deleteEventHandler: deleteEventHandler,
            listenToEvent: listenToEvent,
            stopListening: stopListening,
            raiseEvent: raiseEvent,
            onMessage: onMessage
        }

        let eventListeners = new Map()
        let responseWaiters = new Map()

        return thisObject


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
        }

        function initialize() {

        }

        function onMessage(data) {
            try {
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
            } catch (err) {
                console.log('[ERROR] BackendServers -> Task Manager Server -> onMessage -> Error Receiving Message from Events Server -> data = ' + JSON.stringify(data))
                console.log('[ERROR] BackendServers -> Task Manager Server -> onMessage -> Error Receiving Message from Events Server -> error = ' + err.stack)
            }
        }

        function sendCommand(command, responseCallBack, eventsCallBack) {
            try {
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

                EVENTS_SERVER.onMessage(JSON.stringify(command), thisObject.onMessage)
            } catch (err) {
                console.log('[ERROR] BackendServers -> Task Manager Server -> sendCommand -> Error Sending Command to Events Server -> command = ' + JSON.stringify(command))
                console.log('[ERROR] BackendServers -> Task Manager Server -> sendCommand -> Error Sending Command to Events Server -> error = ' + err.stack)
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
}



