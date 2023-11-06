exports.newDashboardsInterface = function newDashboardsInterface() {
    /* This file holds the interface that aggregates metrics and any other system data
       and then sends it over websocket to the Dashboards App */
    
    // todo: refactor eventserver client to it's own file
    // todo: events server dashboard
    // todo: tasks manager dashboard 
    // todo: create generic dashboard reporter function that can be drop into any place within the platform
    // todo: make dashboard reporter function able to be interval or event based
    // todo: connect dashboard interface when dashboard app is started second
    // todo: set up dashboards project to hold function libraries
    // todo: add platform menu to launch dashboards app
    // todo: create dashboards reporter node to allow control of dashboard reporting from platform UI 


    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    const WEB_SOCKET = SA.nodeModules.ws
    let socketClient
    let port = global.env.DASHBOARDS_WEB_SOCKETS_INTERFACE_PORT
    let url = 'ws://localhost:'+ port
    let eventsServerClient = PL.servers.TASK_MANAGER_SERVER.newEventsServerClient()


    return thisObject

    function initialize () {

        eventsServerClient.createEventHandler('Dashboard Manager')
        eventsServerClient.listenToEvent('Dashboard Manager', 'Dashboard App Status', undefined, undefined, undefined, runInterface)
        
        function runInterface (response){
            if (response.event.isRunning === true) {
                SA.logger.info('')
                SA.logger.info(response.event.message)
                setUpWebSocketClient(url)

            } else if (response.event.isRunning === false) {
                //Skip websocket client initalization
                //SA.logger.info('')
                //SA.logger.info(response.event.message)

            } else {
                SA.logger.error('[ERROR] Something went wrong running the Dashboard App Interface: ', response)
            }
        }


        // Beginings of Task manager code
            //SA.logger.info('can we get this object', tasksMap)
            //eventsServerClient.listenToEvent('Task Manager', 'Run Task', undefined, undefined, undefined, newMessage)
            //eventsServerClient.listenToEvent('Task Manager', 'Stop Task', undefined, undefined, undefined, newMessage)
            //eventsServerClient.listenToEvent('Task Manager', 'Task Status', undefined, undefined, undefined, newMessage)
            // listen to all the task clients let eventHandlerKey = "Task Client - " + node.payload.parentNode.payload.parentNode.payload.parentNode.id
            // eventsServerClient.listenToEvent(eventHandlerKey, 'Task Status', undefined, node.id, onResponse, onStatus)
            // let task = tasksMap.get(message.event.taskId)
            // eventsServerClient.raiseEvent('Task Client - ' + message.event.taskId, 'Task Status', event)

            /* function newMessage (message) {
                SA.logger.info('this is the message in the dashboards client event listeners', message)
            } */

  
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

    async function run() {
     
        checkDashboardAppStatus(port, statusResponse)

        function statusResponse(status, message) {
            let event = {
                isRunning: status,
                message: message
            }   
            eventsServerClient.raiseEvent("Dashboard Manager", 'Dashboard App Status', event)
        }
    }

    async function checkDashboardAppStatus(port, callbackFunc) {
        var net = require('net')
        var tester = net.createServer()
        .once('error', function (err) {
          if (err.code != 'EADDRINUSE') {
            callbackFunc(err)
          } else {
            callbackFunc(true, 'Dashboard App Interface is Running!')
          }
        })
        .once('listening', function() {
            tester.once('close', function() { 
                callbackFunc(false, 'Dashboard App is not Running... Pausing Interface.') 
            })
            .close()
        })
        .listen(port)
    }
    
    function setUpWebSocketClient(url) {
        socketClient = new WEB_SOCKET.WebSocket(url)

        socketClient.on('open', function (open) {
            let message = (new Date()).toISOString() + '|*|Platform|*|Info|*|Platform Dashboards Client has been Opened'
            socketClient.send(message)
            
            //sendExample()
            //sendGlobals()
            // Resend every 10 minutes
            //setInterval(sendGlobals, 6000)

            sendGovernance()
            setInterval(sendGovernance, 6000)
        });

        socketClient.on('close', function (close) {
            SA.logger.info('[INFO] Dashboard App has been disconnected.')
        })

        socketClient.on('error', function (error) {
            SA.logger.error('[ERROR] Dashboards Client error: ', error.message, error.stack)
        });
        
        socketClient.on('message', function (message) {
            SA.logger.info('This is a message coming from the Dashboards App', message)
        });
    }

    function sendGlobals() {
        // This function packs and then sends the Global objects to the inspector
        packedSA = packGlobalObj('SA', SA)
        packedPL = packGlobalObj('PL', PL)

        //let parsed = JSON.parse(data)
        //SA.logger.info('this is the parsed object', parsed)
        let messageToSend = (new Date()).toISOString() + '|*|Platform|*|Data|*|Globals|*|' + packedSA + '|*|' + packedPL
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
                                    dependencies.push(module)
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
    async function sendGovernance() {
        /*let test = {
                                User1: {name: 'UserName', wallet: 'User BlockchainWallet', SAbalance: 123456789, TokenPower: 987654321},
                                User2: {name: 'UserName', wallet: 'User BlockchainWallet', SAbalance: 'User Token Balance', TokenPower: 'User Token Power'},
                                User3: {name: 'UserName', wallet: 'User BlockchainWallet', SAbalance: 'User Token Balance', TokenPower: 'User Token Power'},

                            }
        */
        let userInfo1 = Array.from(SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID)
        let userInfo2 = await SA.projects.network.modules.AppBootstrapingProcess.extractInfoFromUserProfiles(userProfile)

        userInfo2

        let messageToSend = (new Date()).toISOString() + '|*|Platform|*|Data|*|Governance-UserInfo|*|'/* + JSON.stringify(test) */+ '|*|' + JSON.stringify(userInfo1) + '|*|' + JSON.stringify(userInfo2)
        socketClient.send(messageToSend)

        //SA.logger.info('from UserInfo to Dashboard APP:' , test)
        SA.logger.info('from UserInfo 1 to Dashboard APP:' , userInfo1)
        SA.logger.info('from UserInfo 2 to Dashboard APP:' , userInfo2)

    }
    function sendExample() {
        let oneObjToSend = { 
                                example1: 'string data', 
                                example2: 79456, 
                                example3: { nestedObj1: 'more string data', nestedObj2: 9097789 }
                            }

        let twoObjToSend = {
                                exampleArray1: [ "data string", "more Data", "hold on one more" ],
                                exampleArray2: [ 34, 645, 2354, 58655 ]
                            }

        let messageToSend = (new Date()).toISOString() + '|*|Platform|*|Data|*|Example|*|' + JSON.stringify(oneObjToSend) + '|*|' + JSON.stringify(twoObjToSend)
        socketClient.send(messageToSend)
    }
}