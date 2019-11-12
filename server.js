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
    argument = ' {"type":"Task","name":"Generates Bollinger Channels & Sub-Channels","bot":{"type":"Indicator Bot Instance","name":"Paula","code":{"team":"AAMasters","bot":"AAPaula","repo":"AAPaula-Indicator-Bot"},"processes":[{"type":"Process Instance","subType":"Indicator Process Instance","name":"Market","code":{"process":"Multi-Period-Market"},"id":"6ddd81e2-d6db-4814-9c6c-96538a74824c","referenceParent":{"type":"Process Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market","description":"Produces for each market two files with bollinger channels respectively.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000,"framework":{"name":"Multi-Period-Market","startDate":{},"endDate":{}}},"id":"28be432d-80ca-46b3-859a-55541e24b2b4","processOutput":{"type":"Process Output","name":"New Process Output","outputDatasets":[{"type":"Output Dataset","name":"Bollinger Channels","id":"d804e799-7c12-42f5-8de2-52a3a7d5daa4","referenceParent":{"type":"Dataset Definition","name":"Market","code":{"codeName":"Multi-Period-Market","type":"Market Files","validPeriods":["24-hs","12-hs","08-hs","06-hs","04-hs","03-hs","02-hs","01-hs"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Channels/Multi-Period-Market/@Period","fileName":"@AssetA_@AssetB.json"},"parentNode":{"type":"Product Definition","name":"Bollinger Channels","code":{"codeName":"Bollinger-Channels","displayName":"Bollinger-Channels","description":"Two sets of files per period that contains Bollinger-Bands-Channels-Patterns.","shareWith":"Public"},"datasets":[],"record":{"type":"Record Definition","name":"New Record Definition","properties":[{"type":"Record Property","name":"Begin","code":{"codeName":"begin","isNumeric":true},"formula":{"type":"Formula","code":"// Write your formula here","id":"caf8122c-3a07-4263-a56f-ffb05df281d6"},"id":"06edb099-ff64-4528-b8c6-599154bc2ddf"},{"type":"Record Property","name":"End","code":{"codeName":"end","isNumeric":true},"formula":{"type":"Formula","code":"// Write your formula here","id":"c8ec0868-8413-468c-88d5-3e43169395e0"},"id":"94656d1f-508a-4e94-a8d2-013690aac596"},{"type":"Record Property","name":"Direction","code":{"codeName":"direction","isNumeric":false},"formula":{"type":"Formula","code":"// Write your formula here","id":"e913afe9-b610-4777-bc9e-6349d436a90a"},"id":"edc0f697-f5e2-446f-bae8-8db7adf91d23"},{"type":"Record Property","name":"Period","code":{"codeName":"period","isNumeric":true},"formula":{"type":"Formula","code":"// Write your formula here","id":"83fce657-a0bb-41ee-80d1-9e2ab980c472"},"id":"eb733f85-6cf5-485e-9bd3-2bf78733c492"},{"type":"Record Property","name":"First Moving Average","code":{"codeName":"firstMovingAverage","isNumeric":true},"formula":{"type":"Formula","code":"// Write your formula here","id":"52490460-35e3-469a-824f-5b139571d4a0"},"id":"a67a15ee-6f7f-48bd-9d55-82c57efc993b"},{"type":"Record Property","name":"Last Moving Average","code":{"codeName":"lastMovingAverage","isNumeric":true},"formula":{"type":"Formula","code":"// Write your formula here","id":"41edc1ef-293a-4ceb-bf67-8042e8fdc4eb"},"id":"0f05bffe-d668-4d25-ab67-d55a4a7c8f5d"},{"type":"Record Property","name":"First Deviation","code":{"codeName":"firstDeviation","isNumeric":true},"formula":{"type":"Formula","code":"// Write your formula here","id":"5af02103-9bc9-4e6c-9684-5a612adfa495"},"id":"eae84509-b689-4a76-9277-eed72af491dd"},{"type":"Record Property","name":"Last Deviation","code":{"codeName":"lastDeviation","isNumeric":true},"formula":{"type":"Formula","code":"// Write your formula here","id":"bc82d292-e71a-4367-9b07-a0e3982ad60d"},"id":"d5c32d1f-9e3c-48e8-8025-a17d57c0812e"}],"id":"6c3e68b0-b781-4c53-9ff7-67c3f747ac8a"},"parentNode":{"type":"Indicator Bot","name":"Paula","code":{"codeName":"AAPaula"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"bd0f325d-6f98-468b-8b7b-99a42a175d80"},"id":"1f111f72-624f-4166-9f99-ab8d785d5267"},"id":"610cd062-ab88-4892-b711-0fb430305c61"}},{"type":"Output Dataset","name":"Bollinger Standard Channels","id":"e524685d-8da0-41f6-839d-9a4100e6e3fe","referenceParent":{"type":"Dataset Definition","name":"Market","code":{"codeName":"Multi-Period-Market","type":"Market Files","validPeriods":["24-hs","12-hs","08-hs","06-hs","04-hs","03-hs","02-hs","01-hs"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Standard-Channels/Multi-Period-Market/@Period","fileName":"@AssetA_@AssetB.json"},"parentNode":{"type":"Product Definition","name":"Bollinger Standard Channels","code":{"codeName":"Bollinger-Standard-Channels","displayName":"Bollinger-Standard-Channels","description":"","shareWith":"Public"},"datasets":[],"record":{"type":"Record Definition","name":"New Record Definition","properties":[],"id":"9106250d-b042-4e96-9121-c760b4c1eab2"},"parentNode":{"type":"Indicator Bot","name":"Paula","code":{"codeName":"AAPaula"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"bd0f325d-6f98-468b-8b7b-99a42a175d80"},"id":"94bc3958-cc85-43a1-a178-103e84f42910"},"id":"22c1f2c6-3838-4657-add8-2e01d7056917"}},{"type":"Output Dataset","name":"Bollinger Sub-Channels","id":"eb0e7947-95e4-4f4a-87ea-1fb430b8b503","referenceParent":{"type":"Dataset Definition","name":"Market","code":{"codeName":"Multi-Period-Market","type":"Market Files","validPeriods":["24-hs","12-hs","08-hs","06-hs","04-hs","03-hs","02-hs","01-hs"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Sub-Channels/Multi-Period-Market/@Period","fileName":"@AssetA_@AssetB.json"},"parentNode":{"type":"Product Definition","name":"Bollinger Sub-Channels","code":{"codeName":"Bollinger-Sub-Channels","displayName":"Bollinger-Sub-Channels","description":"Bollinger Sub Channels with slope.","shareWith":"Public"},"datasets":[],"record":{"type":"Record Definition","name":"New Record Definition","properties":[],"id":"5a780d7f-70df-4e86-8192-eacccafb5ca8"},"parentNode":{"type":"Indicator Bot","name":"Paula","code":{"codeName":"AAPaula"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"bd0f325d-6f98-468b-8b7b-99a42a175d80"},"id":"080c87fc-4546-4482-ab11-180a33f6d9ab"},"id":"869f615e-0cc0-44fd-8648-4a951c23a410"}},{"type":"Output Dataset","name":"Bollinger Standard Sub-Channels","id":"dc96b9ac-f8d5-4bf8-a135-45cd5d6369f1","referenceParent":{"type":"Dataset Definition","name":"Market","code":{"codeName":"Multi-Period-Market","type":"Market Files","validPeriods":["24-hs","12-hs","08-hs","06-hs","04-hs","03-hs","02-hs","01-hs"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Standard-Sub-Channels/Multi-Period-Market/@Period","fileName":"@AssetA_@AssetB.json"},"parentNode":{"type":"Product Definition","name":"Bollinger Standard Sub-Channels","code":{"codeName":"Bollinger-Standard-Sub-Channels","displayName":"Bollinger-Standard-Sub-Channels","description":"Bollinger Standard Sub Channels with slope.","shareWith":"Public"},"datasets":[],"record":{"type":"Record Definition","name":"New Record Definition","properties":[],"id":"cdbe5e0f-9292-4d3d-b98a-d441e6565b76"},"parentNode":{"type":"Indicator Bot","name":"Paula","code":{"codeName":"AAPaula"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"bd0f325d-6f98-468b-8b7b-99a42a175d80"},"id":"79ce9c05-8a4c-4b58-850f-288037acc702"},"id":"f8d44a4d-3771-4a71-97ca-dc604ff565d3"}}],"id":"dd39a54a-3714-446a-9a41-dfd83557664c"},"processDependencies":{"type":"Process Dependencies","name":"New Process Dependencies","statusDependencies":[{"type":"Status Dependency","name":"Self Reference","code":{"mainUtility":"Self Reference"},"id":"ae627a69-4089-432d-b379-1b12ce4bd75e","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market","description":"Produces for each market two files with bollinger channels respectively.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000,"framework":{"name":"Multi-Period-Market","startDate":{},"endDate":{}}},"id":"28be432d-80ca-46b3-859a-55541e24b2b4","parentNode":{"type":"Indicator Bot","name":"Paula","code":{"codeName":"AAPaula"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"bd0f325d-6f98-468b-8b7b-99a42a175d80"}},"id":"af8aded9-002a-475a-88f5-d29573740969"}},{"type":"Status Dependency","name":"Market Ending Point","code":{"mainUtility":"Market Ending Point"},"id":"4a603114-d464-46db-90a1-62304274117a","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market","description":"Produces a single file for each time period covering all the market.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"941a0543-0cc0-4a5d-a782-728d2835c100","parentNode":{"type":"Indicator Bot","name":"Chris","code":{"codeName":"AAChris"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"1b7ecdbd-82e9-4a27-8fdd-467c0ca6bf23"}},"id":"4f8197fa-2627-46df-bd36-7d30fdb12d8c"}}],"dataDependencies":[{"type":"Data Dependency","name":"Chris Bollinger Bands","id":"ea27be54-93a3-48e3-8c52-72bc397b6c66","referenceParent":{"type":"Dataset Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market"},"parentNode":{"type":"Product Definition","name":"Bollinger Bands","code":{"codeName":"Bollinger-Bands"},"datasets":[],"record":{"type":"Record Definition","name":"New Record Definition","properties":[{"type":"Record Property","name":"Begin","code":{"codeName":"begin","isNumeric":true},"id":"1e7186ee-c481-401d-827f-a30ee7434d92"},{"type":"Record Property","name":"End","code":{"codeName":"end","isNumeric":true},"id":"15f90f2e-80f0-4575-94d8-6d8957eceee1"},{"type":"Record Property","name":"Moving Average","code":{"codeName":"movingAverage","isNumeric":true},"id":"9786a9cd-1eff-4b5c-ae7c-1dde51659f82"},{"type":"Record Property","name":"Standard Deviation","code":{"codeName":"standardDeviation","isNumeric":true},"id":"e92d7855-bb18-494e-ab37-a895bbcb8287"},{"type":"Record Property","name":"Deviation","code":{"codeName":"deviation","isNumeric":true},"id":"03043530-caa1-416e-8303-840b732e516e"}],"id":"b5a5ec97-7246-42bd-97e4-28fb4a148b2c"},"parentNode":{"type":"Indicator Bot","name":"Chris","code":{"codeName":"AAChris"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"1b7ecdbd-82e9-4a27-8fdd-467c0ca6bf23"},"id":"29088877-8d63-4217-8d34-8742afc262f4"},"id":"f5b2a7d8-fc32-44a3-a002-9b0fc30a9719"}}],"id":"8b509294-6028-40e2-88a8-655a34245ed8"},"statusReport":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market","description":"Produces for each market two files with bollinger channels respectively.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000,"framework":{"name":"Multi-Period-Market","startDate":{},"endDate":{}}},"id":"28be432d-80ca-46b3-859a-55541e24b2b4","parentNode":{"type":"Indicator Bot","name":"Paula","code":{"codeName":"AAPaula"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"bd0f325d-6f98-468b-8b7b-99a42a175d80"}},"id":"af8aded9-002a-475a-88f5-d29573740969"},"executionStartedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"f4720e04-5def-4c0b-be42-33e50ac6a6b7","referenceParent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"4a9c8cc7-0ebf-43eb-b7f9-0b280630ff67","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","id":"941a0543-0cc0-4a5d-a782-728d2835c100","code":{"codeName":"Multi-Period-Market","description":"Produces a single file for each time period covering all the market.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000}}}},"executionFinishedEvent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"671530dc-5ba5-4c8d-bc23-f228e22c56b3","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","id":"28be432d-80ca-46b3-859a-55541e24b2b4","code":{"codeName":"Multi-Period-Market","description":"Produces for each market two files with bollinger channels respectively.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000,"framework":{"name":"Multi-Period-Market","startDate":{},"endDate":{}}}}},"calculations":{"type":"Calculations Procedure","name":"New Calculations Procedure","id":"ba2de283-a059-44d0-b229-1c7988f48f51"},"dataBuilding":{"type":"Data Building Procedure","name":"New Data Building Procedure","initialization":{"type":"Procedure Initialization","name":"New Procedure Initialization","code":{"type":"Code","code":"// Write your code here","id":"26413b25-24b7-47d1-b73d-12cef3198657"},"id":"13b23649-2695-48cb-aa9a-efe8acb7ab2c"},"loop":{"type":"Procedure Loop","name":"New Procedure Loop","code":{"type":"Code","code":"// Write your code here","id":"f0a3227a-094b-4aae-babb-d78f9e9b38ed"},"id":"b7a118de-5ebe-4efb-9b10-3b69680063a3"},"id":"859a0c08-b0fd-4d42-851a-21e898d42ec8"}}}],"id":"27564838-24b1-4814-af8c-ec65accb05d1"},"id":"aa0f2533-460c-464f-ad77-6ae4cadd1178"}'


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

