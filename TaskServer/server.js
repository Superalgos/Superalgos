let GLOBALS = require('./Globals.js');
let GLOBALS_MODULE = GLOBALS.newGlobals()
GLOBALS_MODULE.initialize()

let NODE_JS_PROCESS = require('./NodeJsProcess.js');
let NODE_JS_PROCESS_MODULE = NODE_JS_PROCESS.newNodeJsProcess()
NODE_JS_PROCESS_MODULE.initialize()

/*
We read the first string sent as an argument when the process was created by the Task Manager. There we will find the information of the identity
of this Task and know exactly what to run within this server instance. 
*/
let taskId = process.argv[2] // reading what comes as an argument of the nodejs process.

/* Setting up the global Event Handler */

let EVENT_SERVER_CLIENT = require('./EventServerClient.js');

global.EVENT_SERVER_CLIENT_MODULE = EVENT_SERVER_CLIENT.newEventsServerClient()
global.EVENT_SERVER_CLIENT_MODULE.initialize(preLoader)

function preLoader() {
    if (taskId !== undefined) {
        /* The Task Manager sent the info via a process argument. In this case we listen to an event with the Task Info that should be emitted at the UI */
        try {
            //console.log('[INFO] Task Server -> server -> preLoader -> Listening to starting event -> key = ' + 'Task Server - ' + taskId)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent('Task Server - ' + taskId, 'Run Task', undefined, 'Task Server - ' + taskId, undefined, eventReceived)
            global.EVENT_SERVER_CLIENT_MODULE.raiseEvent('Task Manager - ' + taskId, 'Nodejs Process Ready for Task')
            function eventReceived(message) {
                try {
                    global.APP_SCHEMA_ARRAY = JSON.parse(message.event.appSchema)
                    setUpAppSchema()
                    global.TASK_NODE = JSON.parse(message.event.taskDefinition)
                    global.TASK_NETWORK = JSON.parse(message.event.networkDefinition)
                    bootLoader()
                } catch (err) {
                    console.log('[ERROR] Task Server -> server -> preLoader -> eventReceived -> ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] Task Server -> server -> preLoader -> global.TASK_NODE -> ' + err.stack)
            console.log('[ERROR] Task Server -> server -> preLoader -> global.TASK_NODE = ' + JSON.stringify(global.TASK_NODE).substring(0, 1000))
        }
    }
    else {  
        /* 
        This process was started not by the Task Manager, but independently 
        (most likely for debugging purposes). In this case we listen to an event 
        with the Task Info that should be emitted at the UI 
        */
        try {
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent('Task Server', 'Debug Task Started', undefined, 'Task Server', undefined, startDebugging)
            function startDebugging(message) {
                try {
                    global.APP_SCHEMA_ARRAY = JSON.parse(message.event.appSchema)
                    setUpAppSchema()
                    global.TASK_NODE = JSON.parse(message.event.taskDefinition)
                    global.TASK_NETWORK = JSON.parse(message.event.networkDefinition)
                    bootLoader()

                } catch (err) {
                    console.log('[ERROR] Task Server -> server -> preLoader -> startDebugging -> ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] Task Server -> server -> preLoader -> global.TASK_NODE -> ' + err.stack)
            console.log('[ERROR] Task Server -> server -> preLoader -> global.TASK_NODE = ' + JSON.stringify(global.TASK_NODE).substring(0, 1000))
        }
    }

    function setUpAppSchema() {
        /* Setup the APP_SCHEMA_MAP based on the APP_SCHEMA_ARRAY */
        global.APP_SCHEMA_MAP = new Map()
        for (let i = 0; i < global.APP_SCHEMA_ARRAY.length; i++) {
            let nodeDefinition = global.APP_SCHEMA_ARRAY[i]
            let key = nodeDefinition.type
            global.APP_SCHEMA_MAP.set(key, nodeDefinition)
        }
    }
}

function bootLoader() {

    /* Heartbeat sent to the UI */

    let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id

    global.EVENT_SERVER_CLIENT_MODULE.createEventHandler(key)
    global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Running') // Meaning Task Running
    global.HEARTBEAT_INTERVAL_HANDLER = setInterval(taskHearBeat, 1000)

    function taskHearBeat() {

        /* The heartbeat event is raised at the event handler of the instance of this task, created at the UI. */
        let event = {
            seconds: (new Date()).getSeconds()
        }
        global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Heartbeat', event)
    }

    for (let processIndex = 0; processIndex < global.TASK_NODE.bot.processes.length; processIndex++) {
        let config = global.TASK_NODE.bot.processes[processIndex].config

        /* Validate that the minimun amount of input required are defined. */

        if (global.TASK_NODE.parentNode === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Task without a Task Manager. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (global.TASK_NODE.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Task Manager without Mine Tasks. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (global.TASK_NODE.parentNode.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Mine Tasks without Market Tasks. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (global.TASK_NODE.parentNode.parentNode.parentNode.referenceParent === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Market Tasks without a Market. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        global.MARKET_NODE = global.TASK_NODE.parentNode.parentNode.parentNode.referenceParent

        if (global.MARKET_NODE.parentNode === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Market without a Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE));
            continue
        }

        if (global.MARKET_NODE.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Exchange Markets without a Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE.parentNode));
            continue
        }

        if (global.MARKET_NODE.baseAsset === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Market without a Base Asset. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE));
            continue
        }

        if (global.MARKET_NODE.quotedAsset === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Market without a Quoted Asset. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE));
            continue
        }

        if (global.MARKET_NODE.baseAsset.referenceParent === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Base Asset without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE.baseAsset));
            continue
        }

        if (global.MARKET_NODE.quotedAsset.referenceParent === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Quoted Asset without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE.quotedAsset));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Process Instance without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Process Definition without parent Bot Definition. -> Process Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Bot Definition without parent Data Mine. -> Bot Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Process Definition without a codeName defined. -> Process Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Bot Definition without a codeName defined. -> Bot Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName === undefined) {
            console.log("[ERROR] Task Server -> server -> bootLoader -> Data Mine without a codeName defined. -> Data Mine Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode));
            continue
        }

        startRoot(processIndex);
    }
}

function startRoot(processIndex) {

    // console.log('[INFO] Task Server -> server -> startRoot -> Entering function. ')

    const ROOT_MODULE = require('./Root')
    let root = ROOT_MODULE.newRoot()

    root.start(processIndex)
}