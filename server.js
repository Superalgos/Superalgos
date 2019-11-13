/* Callbacks default responses. */

global.DEFAULT_OK_RESPONSE = {
    result: "Ok",
    message: "Operation Succeeded"
};

global.DEFAULT_FAIL_RESPONSE = {
    result: "Fail",
    message: "Operation Failed"
};

global.DEFAULT_RETRY_RESPONSE = {
    result: "Retry",
    message: "Retry Later"
};

global.CUSTOM_OK_RESPONSE = {
    result: "Ok, but check Message",
    message: "Custom Message"
};

global.CUSTOM_FAIL_RESPONSE = {
    result: "Fail Because",
    message: "Custom Message"
};

/* Process Events */

process.on('uncaughtException', function (err) {
    console.log('[ERROR] Task Server -> server -> uncaughtException -> err.message = ' + err.message)
    console.log('[ERROR] Task Server -> server -> uncaughtException -> err.stack = ' + err.stack)
    process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
    console.log('[ERROR] Task Server -> server -> unhandledRejection -> reason = ' + JSON.stringify(reason))
    console.log('[ERROR] Task Server -> server -> unhandledRejection -> p = ' + JSON.stringify(p))
    process.exit(1)
})

process.on('exit', function (code) {

    /* We send an event signaling that the Task is being terminated. */

    let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id

    global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Stopped') // Meaning Task Stopped
    global.SYSTEM_EVENT_HANDLER.deleteEventHandler(key)
    global.SYSTEM_EVENT_HANDLER.finalize()
    global.SYSTEM_EVENT_HANDLER = undefined

    console.log('[INFO] Task Server -> server -> process.on.exit -> About to exit -> code = ' + code)
})

/* Here we listen for the message to stop this Task / Process comming from the Task Manager, which is the paret of this node js process. */
process.on('message', message => {
    if (message === 'Stop this Task') {

        global.STOP_TASK_GRACEFULLY = true;

        /*
        There are some process that might no be able to end grafully, for example the ones schedulle to process information in a future day or month.
        In order to be sure that the process will be terminated, we schedulle one forced exit in 2 minutes from now.
        */
        console.log('[INFO] Task Server -> server -> process.on -> Executing order received from Task Manager to Stop this Task. Nodejs process will be exited in less than 1 minute.')
        setTimeout(global.EXIT_NODE_PROCESS, 60000);
    }
});

global.EXIT_NODE_PROCESS = function exitProcess() {

    /* Cleaning Before Exiting. */
    clearInterval(global.HEARTBEAT_INTERVAL_HANDLER)

    for (let i = 0; i < global.TASK_NODE.bot.processes.length; i++) {
        let code = global.TASK_NODE.bot.processes[i].code

        /* Delete the event handler for each process. */

        let key = global.TASK_NODE.bot.code.team + "-" + global.TASK_NODE.bot.code.bot + "-" + code.process

        global.SYSTEM_EVENT_HANDLER.deleteEventHandler(key)

        let process = global.TASK_NODE.bot.processes[i]

        key = process.name + '-' + process.type + '-' + process.id
        global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Stopped') // Meaning Process Stopped
    }

    console.log("[INFO] Task Server -> " + global.TASK_NODE.name + " -> EXIT_NODE_PROCESS -> Task Server will stop in 10 seconds.");

    setTimeout(process.exit, 10000) // We will give 10 seconds to logs be written on file
}

require('dotenv').config();

global.WRITE_LOGS_TO_FILES = process.env.WRITE_LOGS_TO_FILES

/* Default parameters can be changed by the execution configuration */
global.EXCHANGE_NAME = 'Poloniex'
global.MARKET = { assetA: 'USDT', assetB: 'BTC' }
global.CLONE_EXECUTOR = { codeName: 'AACloud', version: '1.1' } // NOTE: To refactor the name of this variable you would need to go through the bots code that are using it.

/*
We need to count how many process instances we deployd and how many of them have already finished their job, either
because they just finished or because there was a request to stop the proceses. In this way, once we reach the
amount of instances started, we can safelly destroy the rest of the objects running and let this nodejs process die.
*/

global.ENDED_PROCESSES_COUNTER = 0
global.TOTAL_PROCESS_INSTANCES_CREATED = 0

/*

We read the first string sent as an argument when the process was created by the Task Manager. There we will find the information of the identity
of this Task and know exactly what to run within this server instance. 

*/
global.TASK_NODE = process.argv[2]

/* Setting up the global Event Handler */

const EVENT_HANDLER_MODULE = require('./SystemEventHandler.js');
const IPC = require('node-ipc');
global.SYSTEM_EVENT_HANDLER = EVENT_HANDLER_MODULE.newSystemEventHandler(IPC)
global.SYSTEM_EVENT_HANDLER.initialize('Task Server', preLoader)
global.STOP_TASK_GRACEFULLY = false;

function preLoader() {
    if (global.TASK_NODE !== undefined) {
        /* The Task Manager sent the info via a process argument. */
        try {
            global.TASK_NODE = JSON.parse(global.TASK_NODE)
            console.log('[INFO] Task Server -> server -> preLoader -> global.TASK_NODE = ' + JSON.stringify(global.TASK_NODE))
        } catch (err) {
            console.log('[ERROR] Task Server -> server -> preLoader -> vglobal.TASK_NODE -> ' + err.stack)
        }
        bootLoader()
    }
    else {  /* This process was started not by the Task Manager, but independently (most likely for debugging purposes). In this case we listen to an event with the Task Info */
        console.log('[INFO] Task Server -> server -> preLoader -> Waiting for event to start debugging...')
        global.SYSTEM_EVENT_HANDLER.listenToEvent('Task Server', 'Debug Task Started', undefined, undefined, undefined, startDebugging)
        function startDebugging(message) {
            global.TASK_NODE = JSON.parse(message.event.definition) 
            bootLoader()
        }
    }
}

function bootLoader() {

    /* Heartbeat sent to the UI */

    let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id

    global.SYSTEM_EVENT_HANDLER.createEventHandler(key)
    global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Running') // Meaning Task Running
    global.HEARTBEAT_INTERVAL_HANDLER = setInterval(taskHearBeat, 1000)

    function taskHearBeat() {

        /* The heartbeat event is raised at the event handler of the instance of this task, created at the UI. */        
        let event = {
            seconds: (new Date()).getSeconds()
        }
         global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Heartbeat', event)
    }

    for (let processIndex = 0; processIndex < global.TASK_NODE.bot.processes.length; processIndex++) {
        let code = global.TASK_NODE.bot.processes[processIndex].code

        /* Validate that the minimun amount of parameters required are defined. */

        if (global.TASK_NODE.bot.code.bot === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'bot' at the Indicator | Sensor | Trading is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[processIndex].name);
            continue
        }

        if (global.TASK_NODE.bot.code.team === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'team' at the bot is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[processIndex].name);
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].code.process === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'process' at object Process is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[processIndex].name);
            continue
        }

        /* Create the event handler for each process. This event handlers are where the status reports updated events are raised. */

        let key = global.TASK_NODE.bot.code.team + "-" + global.TASK_NODE.bot.code.bot + "-" + code.process
        global.SYSTEM_EVENT_HANDLER.createEventHandler(key)

        if (global.TASK_NODE.bot.code.repo === undefined) {
            global.TASK_NODE.bot.code.repo = global.TASK_NODE.bot.code.bot + "-" + global.TASK_NODE.bot.type + "-Bot"
        }

        startRoot(processIndex);
    }
}

function startRoot(processIndex) {

    console.log('[INFO] Task Server -> server -> startRoot -> Entering function. ')

    const ROOT_MODULE = require('./Root')
    let root = ROOT_MODULE.newRoot()

    root.initialize(onInitialized)

    function onInitialized() {
        console.log('[INFO] Task Server -> server -> startRoot -> onInitialized -> Entering function. ')
        root.start(processIndex)
    }
}

