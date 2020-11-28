/* Setting up the handling of Node JS process events */
let NODE_JS_PROCESS = require('./NodeJsProcess.js');
let NODE_JS_PROCESS_MODULE = NODE_JS_PROCESS.newNodeJsProcess()
NODE_JS_PROCESS_MODULE.initialize()

/* Setting up the global Event Handler */
let EVENT_SERVER_CLIENT = require('./EventServerClient.js');
global.EVENT_SERVER_CLIENT_MODULE = EVENT_SERVER_CLIENT.newEventsServerClient()
global.EVENT_SERVER_CLIENT_MODULE.initialize(preLoader)

function preLoader() {
    /*
    We read the first string sent as an argument when the process was created by the Task Manager. 
    There we will find the information of the identity
    of this Task and know exactly what to run within this server instance. 
    */
    let taskId = process.argv[2] // reading what comes as an argument of the nodejs process.
    if (taskId !== undefined) {
        /* 
        The Task Manager sent the info via a process argument. In this case we listen to 
        an event with the Task Info that should be emitted at the UI 
        */
        try {
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent('Task Server - ' + taskId, 'Run Task', undefined, 'Task Server - ' + taskId, undefined, eventReceived)
            global.EVENT_SERVER_CLIENT_MODULE.raiseEvent('Task Manager - ' + taskId, 'Nodejs Process Ready for Task')
            function eventReceived(message) {
                try {
                    setUpAppSchema(JSON.parse(message.event.projectSchemas))
                    global.TASK_NODE = JSON.parse(message.event.taskDefinition)
                    global.NETWORK_NODE = JSON.parse(message.event.networkDefinition)
                    global.PROJECTS_SCHEMA = JSON.parse(message.event.projectsSchema)
                    bootingProcess()
                } catch (err) {
                    console.log('[ERROR] Task Server -> Task -> preLoader -> eventReceived -> ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] Task Server -> Task -> preLoader -> TS.projects.superalgos.globals.taskConstants.TASK_NODE -> ' + err.stack)
            console.log('[ERROR] Task Server -> Task -> preLoader -> TS.projects.superalgos.globals.taskConstants.TASK_NODE = ' + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE).substring(0, 1000))
        }
    }
    else {
        /* 
        This process was started not by the Task Manager, but independently 
        (most likely for debugging purposes). In this case we listen to an event 
        with the Task Info that should be emitted at the UI, bypassing the Task Manager. 
        */
        try {
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent('Task Server', 'Debug Task Started', undefined, 'Task Server', undefined, startDebugging)
            function startDebugging(message) {
                try {
                    setUpAppSchema(JSON.parse(message.event.projectSchemas))
                    global.TASK_NODE = JSON.parse(message.event.taskDefinition)
                    global.NETWORK_NODE = JSON.parse(message.event.networkDefinition)
                    global.PROJECTS_SCHEMA = JSON.parse(message.event.projectsSchema)
                    bootingProcess()

                } catch (err) {
                    console.log('[ERROR] Task Server -> Task -> preLoader -> startDebugging -> ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] Task Server -> Task -> preLoader -> TS.projects.superalgos.globals.taskConstants.TASK_NODE -> ' + err.stack)
            console.log('[ERROR] Task Server -> Task -> preLoader -> TS.projects.superalgos.globals.taskConstants.TASK_NODE = ' + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE).substring(0, 1000))
        }
    }

    function setUpAppSchema(projectSchemas) {
        /* Setup the APP_SCHEMA_MAP based on the APP_SCHEMA_ARRAY */
        global.APP_SCHEMA_MAP = new Map()
        for (let i = 0; i < projectSchemas.length; i++) {
            let project = projectSchemas[i]

            for (let j = 0; j < project.schema.length; j++) {
                let nodeDefinition = project.schema[j]
                let key = project.name + '-' + nodeDefinition.type
                global.APP_SCHEMA_MAP.set(key, nodeDefinition)
            }
        }
    }
}

function bootingProcess() {

    setupMultiProjectFramework()
    initializeTaskConstants()
    setupTaskHeartbeats()

    function setupMultiProjectFramework() {
        let MULTI_PROJECT = require('./MultiProject.js');
        let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
        MULTI_PROJECT_MODULE.initialize()
    }

    function initializeTaskConstants() {
        /*
        These constants could not be initialized before since they are received via websockets.
        */
        TS.projects.superalgos.globals.taskConstants.TASK_NODE = global.TASK_NODE
        global.TASK_NODE = undefined
        TS.projects.superalgos.globals.taskConstants.NETWORK_NODE = global.NETWORK_NODE
        NETWORK_NODE = undefined
        TS.projects.superalgos.globals.taskConstants.PROJECTS_SCHEMA = global.PROJECTS_SCHEMA
        global.PROJECTS_SCHEMA = undefined
        TS.projects.superalgos.globals.taskConstants.APP_SCHEMA_MAP = global.APP_SCHEMA_MAP
        global.APP_SCHEMA_MAP = undefined
    }

    function setupTaskHeartbeats() {
        /* Heartbeat sent to the UI */
        let key = TS.projects.superalgos.globals.taskConstants.TASK_NODE.name + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.type + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.id

        global.EVENT_SERVER_CLIENT_MODULE.createEventHandler(key)
        global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Running') // Meaning Task Running
        global.HEARTBEAT_INTERVAL_HANDLER = setInterval(taskHearBeat, 1000)

        function taskHearBeat() {

            /* The heartbeat event is raised at the event handler of the instance of this task, created at the TS. */
            let event = {
                seconds: (new Date()).getSeconds()
            }
            global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Heartbeat', event)
        }
    }

    for (let processIndex = 0; processIndex < TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes.length; processIndex++) {

        /* Validate that the minimun amount of input required are defined. */
        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Task without a Task Manager. This process will not be executed. -> Process Instance = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Task Manager without Mine Tasks. This process will not be executed. -> Process Instance = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Mine Tasks without Market Tasks. This process will not be executed. -> Process Instance = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Market Tasks without a Market. This process will not be executed. -> Process Instance = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        global.MARKET_NODE = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent

        if (global.MARKET_NODE.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Market without a Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE));
            continue
        }

        if (global.MARKET_NODE.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Exchange Markets without a Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE.parentNode));
            continue
        }

        if (global.MARKET_NODE.baseAsset === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Market without a Base Asset. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE));
            continue
        }

        if (global.MARKET_NODE.quotedAsset === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Market without a Quoted Asset. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE));
            continue
        }

        if (global.MARKET_NODE.baseAsset.referenceParent === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Base Asset without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE.baseAsset));
            continue
        }

        if (global.MARKET_NODE.quotedAsset.referenceParent === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Quoted Asset without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE.quotedAsset));
            continue
        }

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Process Instance without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Process Definition without parent Bot Definition. -> Process Definition = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent));
            continue
        }

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Bot Definition without parent Data Mine. -> Bot Definition = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
            continue
        }

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Process Definition without a codeName defined. -> Process Definition = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent));
            continue
        }

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Bot Definition without a codeName defined. -> Bot Definition = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
            continue
        }

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Data Mine without a codeName defined. -> Data Mine Definition = " + JSON.stringify(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode));
            continue
        }

        startProcessInstance(processIndex);
    }
}

function startProcessInstance(processIndex) {

    const ROOT_MODULE = require('./ProcessInstance')
    let root = ROOT_MODULE.newProcessInstance()

    root.start(processIndex)
}