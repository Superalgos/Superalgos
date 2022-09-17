exports.newDashboardsInterface = function newDashboardsInterface() {
    //This file holds the interface that collects metrics and then sends them over websocket to the inspector    const LOG_INFO = false

    // todo: refactor eventserver client to it's own file
    // todo: globals inspector interface
    // todo: event handler inspector interface 
    // todo: tasks inspector interface 


    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    const WEB_SOCKET = SA.nodeModules.ws
    let socketClient
    let port = global.env.DASHBOARDS_WEB_SOCKETS_INTERFACE_PORT
    let url = 'ws://localhost:'+ port

    return thisObject

    function initialize () {
    
        setUpWebSocketClient(url)
        
        //console.log('can we get this object', tasksMap)
        let eventsServerClient = PL.servers.TASK_MANAGER_SERVER.newEventsServerClient()
            //eventsServerClient.createEventHandler('Task Manager')
            eventsServerClient.listenToEvent('Task Manager', 'Run Task', undefined, undefined, undefined, newMessage)
            eventsServerClient.listenToEvent('Task Manager', 'Stop Task', undefined, undefined, undefined, newMessage)
            eventsServerClient.listenToEvent('Task Manager', 'Task Status', undefined, undefined, undefined, newMessage)
            // listen to all the task clients let eventHandlerKey = "Task Client - " + node.payload.parentNode.payload.parentNode.payload.parentNode.id
            // eventsServerClient.listenToEvent(eventHandlerKey, 'Task Status', undefined, node.id, onResponse, onStatus)
            // let task = tasksMap.get(message.event.taskId)
            // eventsServerClient.raiseEvent('Task Client - ' + message.event.taskId, 'Task Status', event)

        function newMessage (message) {
            console.log('this is the message in the dashboards client event listeners', message)

        }

  
       // eventsServerClient.listenToEvent('Task Manager - ' + message.event.taskId, 'Nodejs Process Ready for Task', undefined, undefined, undefined, sendStartingEvent)

                    /* Listen to event to start or stop the session. 
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                        'Trading Session Status',
                        undefined,
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                        undefined,
                        onSessionStatus)
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                        'Run Trading Session',
                        undefined,
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                        undefined,
                        onSessionRun)
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                        'Stop Trading Session',
                        undefined,
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                        undefined,
                        onSessionStop)
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                        'Resume Trading Session',
                        undefined,
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                        undefined,
                        onSessionResume)
                        */
    }      

    function finalize() {
        socketClient = undefined
    }
    
    function setUpWebSocketClient (url) {
        socketClient = new WEB_SOCKET.WebSocket(url)

        socketClient.onopen = (open) => {
            socketClient.send('Platform|*|Info|*|Platform Dashboards Client has been Opened')
            sendGlobals()
        }

        socketClient.onerror = (error) => {
            console.log('[ERROR] Dashboards Client error: ', error)
            socketClient.send('Platform|*|Error|*|Dashboards Client error: ', error)
        }
        
        socketClient.on('message', function (message) {
            console.log('This is a message coming from the Dashboards App', message )
            sendGlobals()
        });
    }

    function sendGlobals() {
        // This function packs and then sends the Global objects to the inspector
        packedSA = packGlobalObj('SA', SA)
        packedPL = packGlobalObj('PL', PL)

        //let parsed = JSON.parse(data)
        //console.log('this is the parsed object', parsed)
        let messageToSend = 'Platform|*|Data|*|Globals|*|' + packedSA + '|*|' + packedPL
        socketClient.send(messageToSend)

        // todo: handle global TS object 
        // note: Access event handlers PL.servers.EVENT_SERVER.eventHandlers

        function packGlobalObj (name, object) {
            // This function copies a global object over to a simple JS Object and then is stringified to JSON in order to be sent over websocket
            let packedGlobal = {}
            packedGlobal[name] = recursivelyCopy(object)

            return JSON.stringify(packedGlobal)

            function recursivelyCopy (object) {
                let objectCopy = {}
        
                if (typeof object === 'object') {
                    // Break down various object types and copy them all to a simple javascript object
                    if (object instanceof Array) {
                        object.forEach( function (value, index) {
                            objectCopy[index] = recursivelyCopy(value)

                        })
                    } else if (object instanceof Map) {
                        object.forEach( function (value, key) {
                            objectCopy[key] = recursivelyCopy(value)

                        })
                    } else if (object instanceof Object) {
                        for (let element in object ) {
                            if (element === 'nodeModules') {
                                //Only copies name of each dependency
                                let dependencies = []
                                for (let module in object[element] ) {
                                    if (module !== undefined) {
                                        dependencies.push(module)
                                    }
                                }
                                objectCopy[element] = dependencies
                            } else {
                                objectCopy[element] = recursivelyCopy(object[element])
                            }
                        }
                    } 
                } else if (typeof object === 'function') {
                    objectCopy = object.constructor.name

                } else {
                    // All other variables are directly assigned to objectCopy
                    objectCopy = object

                } 
                return objectCopy
            }
        }
    }
}