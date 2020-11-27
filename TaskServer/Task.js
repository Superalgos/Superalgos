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
            //console.log('[INFO] Task Server -> Task -> preLoader -> Listening to starting event -> key = ' + 'Task Server - ' + taskId)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent('Task Server - ' + taskId, 'Run Task', undefined, 'Task Server - ' + taskId, undefined, eventReceived)
            global.EVENT_SERVER_CLIENT_MODULE.raiseEvent('Task Manager - ' + taskId, 'Nodejs Process Ready for Task')
            function eventReceived(message) {
                try {
                    setUpAppSchema(JSON.parse(message.event.projectSchemas))
                    global.TASK_NODE = JSON.parse(message.event.taskDefinition)
                    global.TASK_NETWORK = JSON.parse(message.event.networkDefinition)
                    global.PROJECTS_SCHEMA = JSON.parse(message.event.projectsSchema)
                    bootLoader()
                } catch (err) {
                    console.log('[ERROR] Task Server -> Task -> preLoader -> eventReceived -> ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] Task Server -> Task -> preLoader -> global.TASK_NODE -> ' + err.stack)
            console.log('[ERROR] Task Server -> Task -> preLoader -> global.TASK_NODE = ' + JSON.stringify(global.TASK_NODE).substring(0, 1000))
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
                    setUpAppSchema(JSON.parse(message.event.projectSchemas))
                    global.TASK_NODE = JSON.parse(message.event.taskDefinition)
                    global.TASK_NETWORK = JSON.parse(message.event.networkDefinition)
                    global.PROJECTS_SCHEMA = JSON.parse(message.event.projectsSchema)
                    bootLoader()

                } catch (err) {
                    console.log('[ERROR] Task Server -> Task -> preLoader -> startDebugging -> ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] Task Server -> Task -> preLoader -> global.TASK_NODE -> ' + err.stack)
            console.log('[ERROR] Task Server -> Task -> preLoader -> global.TASK_NODE = ' + JSON.stringify(global.TASK_NODE).substring(0, 1000))
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

function setupUpTS() {
    /*
    Here we will setup the TS object, with all the
    projects and modules that will have inside.
    */
    global.TS = {
        projects: {}    
    }
    for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
        let projectDefinition = PROJECTS_SCHEMA[i]
        global.TS.projects[projectDefinition.propertyName] = {}
        let projectInstance = global.TS.projects[projectDefinition.propertyName]

        projectInstance.utilities = {}
        projectInstance.globals = {}
        projectInstance.functionLibraries = {}

        /* Set up Utilities of this Project */
        if (projectDefinition.TS.utilities !== undefined) {
            for (let j = 0; j < projectDefinition.TS.utilities.length; j++) {
                let utilityDefinition = projectDefinition.TS.utilities[j]
                let path = process.env.REQUIRED_PROJECTS_PATH + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Utilities' + '/' + utilityDefinition.fileName

                let requiredObject = require(path)
                let requiredFunction = requiredObject[utilityDefinition.functionName]
                projectInstance.utilities[utilityDefinition.propertyName] = requiredFunction.call()
            }
        }

        /* Set up Globals of this Project */
        if (projectDefinition.TS.globals !== undefined) {
            for (let j = 0; j < projectDefinition.TS.globals.length; j++) {
                let globalDefinition = projectDefinition.TS.globals[j]
                let path = process.env.REQUIRED_PROJECTS_PATH + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Globals' + '/' + globalDefinition.fileName

                let requiredObject = require(path)
                let requiredFunction = requiredObject[globalDefinition.functionName]
                projectInstance.globals[globalDefinition.propertyName] = requiredFunction.call()
            }
        }

        /* Set up Function Libraries of this Project */
        if (projectDefinition.TS.functionLibraries !== undefined) {
            for (let j = 0; j < projectDefinition.TS.functionLibraries.length; j++) {
                let functionLibraryDefinition = projectDefinition.TS.functionLibraries[j]
                let path = process.env.REQUIRED_PROJECTS_PATH + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Function-Libraries' + '/' + functionLibraryDefinition.fileName

                let requiredObject = require(path)
                let requiredFunction = requiredObject[functionLibraryDefinition.functionName]
                projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = requiredFunction.call()
            }
        }

        /* Set up Bot Classes of this Project */
        if (projectDefinition.TS.botClasses !== undefined) {
            for (let j = 0; j < projectDefinition.TS.botClasses.length; j++) {
                let botClassDefinition = projectDefinition.TS.botClasses[j]
                let path = process.env.REQUIRED_PROJECTS_PATH + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Bot-Classes' + '/' + botClassDefinition.fileName

                let requiredObject = require(path)
                let requiredFunction = requiredObject[botClassDefinition.functionName]
                projectInstance.botClasses[botClassDefinition.propertyName] = requiredFunction.call()
            }
        }
    }
}

function bootLoader() {

    setupUpTS()

    /* Heartbeat sent to the UI */

    let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id

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

    for (let processIndex = 0; processIndex < global.TASK_NODE.bot.processes.length; processIndex++) {
        let config = global.TASK_NODE.bot.processes[processIndex].config

        /* Validate that the minimun amount of input required are defined. */

        if (global.TASK_NODE.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Task without a Task Manager. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (global.TASK_NODE.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Task Manager without Mine Tasks. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (global.TASK_NODE.parentNode.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Mine Tasks without Market Tasks. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (global.TASK_NODE.parentNode.parentNode.parentNode.referenceParent === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Market Tasks without a Market. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        global.MARKET_NODE = global.TASK_NODE.parentNode.parentNode.parentNode.referenceParent

        if (global.MARKET_NODE.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Market without a Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE));
            continue
        }

        if (global.MARKET_NODE.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Exchange Markets without a Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE.parentNode));
            continue
        }

        if (global.MARKET_NODE.baseAsset === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Market without a Base Asset. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE));
            continue
        }

        if (global.MARKET_NODE.quotedAsset === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Market without a Quoted Asset. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE));
            continue
        }

        if (global.MARKET_NODE.baseAsset.referenceParent === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Base Asset without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE.baseAsset));
            continue
        }

        if (global.MARKET_NODE.quotedAsset.referenceParent === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Quoted Asset without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.MARKET_NODE.quotedAsset));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Process Instance without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex]));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Process Definition without parent Bot Definition. -> Process Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Bot Definition without parent Data Mine. -> Bot Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Process Definition without a codeName defined. -> Process Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Bot Definition without a codeName defined. -> Bot Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName === undefined) {
            console.log("[ERROR] Task Server -> Task -> bootLoader -> Data Mine without a codeName defined. -> Data Mine Definition = " + JSON.stringify(global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode));
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