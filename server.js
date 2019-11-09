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

/*

We read the first string sent as an argument when the process was created by the Task Manager. Ther we will find the information of the identity
of this Task and know exactly what to run within this server instance. 

*/
global.TASK_NODE = process.argv[2]

if (global.TASK_NODE !== undefined) {

    try {
        global.TASK_NODE = JSON.parse(global.TASK_NODE)
        console.log('[INFO] Task Server -> server -> global.TASK_NODE = ' + JSON.stringify(global.TASK_NODE))
    } catch (err) {
        console.log('[ERROR] Task Server -> server -> global.TASK_NODE -> ' + err.stack)
    }

}
else {  // I use this section to debug in standalone mode.
    let argument 
    argument = ' {"type":"Task","name":"Brings Trades Records from the Exchange","bot":{"type":"Sensor Bot Instance","name":"Charly","code":{"team":"AAMasters","bot":"AACharly","repo":"AACharly-Sensor-Bot"},"processes":[{"type":"Process Instance","subType":"Sensor Process Instance","name":"Live Trades","code":{"process":"Live-Trades"},"id":"338266fa-14c2-42eb-b0e5-d0a8ed9309fc","referenceParent":{"type":"Process Definition","name":"Live-Trades","code":{},"processOutput":{"type":"Process Output","name":"New Process Output","outputDatasets":[],"id":"9ffdaadd-5204-4436-b89e-cabd8f0e5829"},"processDependencies":{"type":"Process Dependencies","name":"New Process Dependencies","statusDependencies":[],"dataDependencies":[],"id":"a98b94ad-0cd4-4e54-ade4-68b0ab577414"},"statusReport":{"type":"Status Report","name":"New Status Report","id":"9f3ea81f-2aa1-41ec-907f-c003dec0c827"},"executionStartedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"942c8337-5d22-413d-9e44-e2da9a5479f1"},"executionFinishedEvent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"d5f1f2b3-ffa5-442b-b875-e91a786337ae","parentNode":{"type":"Process Definition","name":"Live-Trades","id":"371a2507-655b-46c5-b959-52f527cc4d7e","code":{}}},"calculations":{"type":"Calculations Procedure","name":"New Calculations Procedure","id":"e3774584-43e5-4dc5-b097-7b16476d586a"},"dataBuilding":{"type":"Data Building Procedure","name":"New Data Building Procedure","id":"0f8cc852-ad72-40fe-bf4a-866e68439492"},"id":"371a2507-655b-46c5-b959-52f527cc4d7e"}},{"type":"Process Instance","subType":"Sensor Process Instance","name":"Hole Fixing","code":{"process":"Hole-Fixing"},"id":"3d7e0bdd-64e3-4442-8742-cc9282a82631","referenceParent":{"type":"Process Definition","name":"Hole-Fixing","code":{},"processOutput":{"type":"Process Output","name":"New Process Output","outputDatasets":[{"type":"Output Dataset","name":"New Output Dataset","id":"646ec2e6-98cb-489f-abb6-98b9bbdfa5f0","referenceParent":{"type":"Dataset Definition","name":"Trades","code":{},"id":"80c4ee03-aed4-4d8e-8145-a49f8b85df04"}}],"id":"4c577394-cc99-4d9d-ae73-38f28e08405d"},"processDependencies":{"type":"Process Dependencies","name":"New Process Dependencies","statusDependencies":[{"type":"Status Dependency","name":"New Status Dependency","id":"b707a221-e8f4-4d6f-824c-8e26e92b8093","referenceParent":{"type":"Status Report","name":"New Status Report","id":"03aa3c2e-d33c-4054-9150-1b641bc02e96"}},{"type":"Status Dependency","name":"New Status Dependency","id":"e9aedbfd-8b76-44c4-bfda-733da4f59023"},{"type":"Status Dependency","name":"New Status Dependency","id":"7a3ebb1b-1d28-4abd-9875-6b0d9c2ecea8","referenceParent":{"type":"Status Report","name":"New Status Report","id":"c542a73e-a350-431f-ad3e-10f3ebef8ec7"}}],"dataDependencies":[{"type":"Data Dependency","name":"New Data Dependency","id":"cab5ab89-a3e2-4833-a532-3884f0ff6fa9","referenceParent":{"type":"Dataset Definition","name":"Trades","code":{},"id":"80c4ee03-aed4-4d8e-8145-a49f8b85df04"}}],"id":"55891378-cdfa-4b6a-895e-235987c7b568"},"statusReport":{"type":"Status Report","name":"New Status Report","id":"03aa3c2e-d33c-4054-9150-1b641bc02e96"},"executionStartedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"39a7e02f-1b3b-49ea-9714-49f8fccc768d"},"executionFinishedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"39a7e02f-1b3b-49ea-9714-49f8fccc768d","referenceParent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"d5f1f2b3-ffa5-442b-b875-e91a786337ae","parentNode":{"type":"Process Definition","name":"Live-Trades","id":"371a2507-655b-46c5-b959-52f527cc4d7e","code":{}}}},"calculations":{"type":"Calculations Procedure","name":"New Calculations Procedure","id":"8777f6f4-8e49-487c-8a77-2f1e4be738b1"},"dataBuilding":{"type":"Data Building Procedure","name":"New Data Building Procedure","id":"0d2e6c5a-cb53-4b72-b688-db9478024182"},"id":"b9d87bfc-1df9-4be3-b8c8-41131f5a9dc4"}}],"id":"85c4f582-56ee-4b8e-95b2-aa61baedfa39"},"id":"2fcbea08-a941-4891-80fd-236eacd83c11"}'

    try {
        global.TASK_NODE = JSON.parse(argument)
    } catch (err) {
        console.log(err.stack)
    }
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

/* Setting up the global Event Handler */

const EVENT_HANDLER_MODULE = require('./SystemEventHandler.js');
const IPC = require('node-ipc');
global.SYSTEM_EVENT_HANDLER = EVENT_HANDLER_MODULE.newSystemEventHandler(IPC)
global.SYSTEM_EVENT_HANDLER.initialize('Task Server', bootLoader)
global.STOP_TASK_GRACEFULLY = false;

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

