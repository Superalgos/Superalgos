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
    argument = ' {"type":"Task","name":"Brings Trades Records from the Exchange","bot":{"type":"Sensor Bot Instance","name":"Charly","code":{"team":"AAMasters","bot":"AACharly","repo":"AACharly-Sensor-Bot"},"processes":[{"type":"Process Instance","subType":"Sensor Process Instance","name":"Live Trades","code":{"process":"Live-Trades"},"id":"338266fa-14c2-42eb-b0e5-d0a8ed9309fc","referenceParent":{"type":"Process Definition","name":"Live-Trades","code":{"codeName":"Live-Trades","description":"Retrieves the trades done at the current and the previous minute and saves them at the storage account.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"false"},"fixedInterval":{"run":"true","interval":60000}},"deadWaitTime":0,"normalWaitTime":60000,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"371a2507-655b-46c5-b959-52f527cc4d7e","processOutput":{"type":"Process Output","name":"New Process Output","outputDatasets":[],"id":"9ffdaadd-5204-4436-b89e-cabd8f0e5829"},"processDependencies":{"type":"Process Dependencies","name":"New Process Dependencies","statusDependencies":[{"type":"Status Dependency","name":"New Status Dependency","id":"cfd2acec-5b56-40fb-b97b-10cdb91faa92","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Live-Trades","code":{"codeName":"Live-Trades","description":"Retrieves the trades done at the current and the previous minute and saves them at the storage account.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"false"},"fixedInterval":{"run":"true","interval":60000}},"deadWaitTime":0,"normalWaitTime":60000,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"371a2507-655b-46c5-b959-52f527cc4d7e","parentNode":{"type":"Sensor Bot","name":"Charly","code":{"codeName":"AACharly"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"957bef47-cd90-4dfa-bbb1-3696c527b010"}},"id":"9f3ea81f-2aa1-41ec-907f-c003dec0c827"}}],"dataDependencies":[],"id":"a98b94ad-0cd4-4e54-ade4-68b0ab577414"},"statusReport":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Live-Trades","code":{"codeName":"Live-Trades","description":"Retrieves the trades done at the current and the previous minute and saves them at the storage account.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"false"},"fixedInterval":{"run":"true","interval":60000}},"deadWaitTime":0,"normalWaitTime":60000,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"371a2507-655b-46c5-b959-52f527cc4d7e","parentNode":{"type":"Sensor Bot","name":"Charly","code":{"codeName":"AACharly"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"957bef47-cd90-4dfa-bbb1-3696c527b010"}},"id":"9f3ea81f-2aa1-41ec-907f-c003dec0c827"},"executionStartedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"942c8337-5d22-413d-9e44-e2da9a5479f1"},"executionFinishedEvent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"d5f1f2b3-ffa5-442b-b875-e91a786337ae","parentNode":{"type":"Process Definition","name":"Live-Trades","id":"371a2507-655b-46c5-b959-52f527cc4d7e","code":{"codeName":"Live-Trades","description":"Retrieves the trades done at the current and the previous minute and saves them at the storage account.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"false"},"fixedInterval":{"run":"true","interval":60000}},"deadWaitTime":0,"normalWaitTime":60000,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000}}},"calculations":{"type":"Calculations Procedure","name":"New Calculations Procedure","id":"e3774584-43e5-4dc5-b097-7b16476d586a"},"dataBuilding":{"type":"Data Building Procedure","name":"New Data Building Procedure","id":"0f8cc852-ad72-40fe-bf4a-866e68439492"}}},{"type":"Process Instance","subType":"Sensor Process Instance","name":"Hole Fixing","code":{"process":"Hole-Fixing"},"id":"3d7e0bdd-64e3-4442-8742-cc9282a82631","referenceParent":{"type":"Process Definition","name":"Hole-Fixing","code":{"codeName":"Hole-Fixing","description":"Scans the trades saved by the Live Trades and Historic Trades processes searching for missing records. Once a hole is found on the data set, it patches it by retrieving the missing records from the exchange.","startMode":{"allMonths":{"run":"true","minYear":"2019","maxYear":"2019"},"oneMonth":{"run":"false","year":"2019","month":"10"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"60c8e8b0-0c0d-49bd-980e-6c7814a4cb18","processOutput":{"type":"Process Output","name":"New Process Output","outputDatasets":[],"id":"d8e3878e-6f12-4ef9-873b-e3f8a8f5a63e"},"processDependencies":{"type":"Process Dependencies","name":"New Process Dependencies","statusDependencies":[{"type":"Status Dependency","name":"New Status Dependency","id":"2746eb59-ea5f-4f2d-b838-b13adeb4c2e6","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Historic-Trades","code":{"codeName":"Historic-Trades","description":"Retrieves and saves the historical trades in batches going backwards from the current time until reaching the begining of the market.","startMode":{"allMonths":{"run":"false","minYear":"2014","maxYear":"2020"},"oneMonth":{"run":"false","year":"2018","month":"01"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":60000,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"e2c3f7c3-b74c-4145-8a60-f73cc3364629","parentNode":{"type":"Sensor Bot","name":"Charly","code":{"codeName":"AACharly"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"957bef47-cd90-4dfa-bbb1-3696c527b010"}},"id":"c542a73e-a350-431f-ad3e-10f3ebef8ec7"}},{"type":"Status Dependency","name":"New Status Dependency","id":"3d84de0f-5939-4992-9395-dc1a1ee93232","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Live-Trades","code":{"codeName":"Live-Trades","description":"Retrieves the trades done at the current and the previous minute and saves them at the storage account.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"false"},"fixedInterval":{"run":"true","interval":60000}},"deadWaitTime":0,"normalWaitTime":60000,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"371a2507-655b-46c5-b959-52f527cc4d7e","parentNode":{"type":"Sensor Bot","name":"Charly","code":{"codeName":"AACharly"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"957bef47-cd90-4dfa-bbb1-3696c527b010"}},"id":"9f3ea81f-2aa1-41ec-907f-c003dec0c827"}},{"type":"Status Dependency","name":"New Status Dependency","id":"612519b7-cc59-4363-9452-903ab2f4a958","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Hole-Fixing","code":{"codeName":"Hole-Fixing","description":"Scans the trades saved by the Live Trades and Historic Trades processes searching for missing records. Once a hole is found on the data set, it patches it by retrieving the missing records from the exchange.","startMode":{"allMonths":{"run":"true","minYear":"2019","maxYear":"2019"},"oneMonth":{"run":"false","year":"2019","month":"10"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"60c8e8b0-0c0d-49bd-980e-6c7814a4cb18","parentNode":{"type":"Sensor Bot","name":"Charly","code":{"codeName":"AACharly"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"957bef47-cd90-4dfa-bbb1-3696c527b010"}},"id":"93f391ac-4651-47c6-b2ff-e9387fe0a444"}}],"dataDependencies":[],"id":"aa390ea7-0f89-47cc-a75f-fa4fb738219a"},"statusReport":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Hole-Fixing","code":{"codeName":"Hole-Fixing","description":"Scans the trades saved by the Live Trades and Historic Trades processes searching for missing records. Once a hole is found on the data set, it patches it by retrieving the missing records from the exchange.","startMode":{"allMonths":{"run":"true","minYear":"2019","maxYear":"2019"},"oneMonth":{"run":"false","year":"2019","month":"10"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"60c8e8b0-0c0d-49bd-980e-6c7814a4cb18","parentNode":{"type":"Sensor Bot","name":"Charly","code":{"codeName":"AACharly"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"957bef47-cd90-4dfa-bbb1-3696c527b010"}},"id":"93f391ac-4651-47c6-b2ff-e9387fe0a444"},"executionStartedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"542f80b6-e848-4ab5-aa46-06674837ca3a","referenceParent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"d5f1f2b3-ffa5-442b-b875-e91a786337ae","parentNode":{"type":"Process Definition","name":"Live-Trades","id":"371a2507-655b-46c5-b959-52f527cc4d7e","code":{"codeName":"Live-Trades","description":"Retrieves the trades done at the current and the previous minute and saves them at the storage account.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"false"},"fixedInterval":{"run":"true","interval":60000}},"deadWaitTime":0,"normalWaitTime":60000,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000}}}},"executionFinishedEvent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"ab5e01b1-8036-4761-8a93-d61a663b0088","parentNode":{"type":"Process Definition","name":"Hole-Fixing","id":"60c8e8b0-0c0d-49bd-980e-6c7814a4cb18","code":{"codeName":"Hole-Fixing","description":"Scans the trades saved by the Live Trades and Historic Trades processes searching for missing records. Once a hole is found on the data set, it patches it by retrieving the missing records from the exchange.","startMode":{"allMonths":{"run":"true","minYear":"2019","maxYear":"2019"},"oneMonth":{"run":"false","year":"2019","month":"10"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000}}},"calculations":{"type":"Calculations Procedure","name":"New Calculations Procedure","id":"ca19a529-5b73-4ef0-83e2-91aaa73ca4dd"},"dataBuilding":{"type":"Data Building Procedure","name":"New Data Building Procedure","id":"5c586e2e-3f91-49d9-b0d3-fa1a84eedec2"}}}],"id":"85c4f582-56ee-4b8e-95b2-aa61baedfa39"},"id":"2fcbea08-a941-4891-80fd-236eacd83c11"}'

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

