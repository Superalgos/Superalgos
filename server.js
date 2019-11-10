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
    argument = '{"type":"Task","name":"Generates Bollinger Channels & Sub-Channels","bot":{"type":"Indicator Bot Instance","name":"Paula","code":{"team":"AAMasters","bot":"AAPaula","repo":"AAChris-Indicator-Bot"},"processes":[{"type":"Process Instance","subType":"Indicator Process Instance","name":"Daily","code":{"process":"Multi-Period-Daily"},"id":"81f0108b-8af9-4b22-94dd-81ef4a5c8065","referenceParent":{"type":"Process Definition","name":"Multi-Period-Daily","code":{"name":"Multi-Period-Daily","description":"Produces for each market two files with bollinger channels respectively at each day of the market history.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000,"framework":{"name":"Multi-Period-Daily","startDate":{"takeItFromStatusDependency":0},"endDate":{"takeItFromStatusDependency":1}}},"processOutput":{"type":"Process Output","name":"New Process Output","outputDatasets":[{"type":"Output Dataset","name":"New Output Dataset","id":"64430a93-38c2-4c71-8085-71661bbf804e","referenceParent":{"type":"Dataset Definition","name":"Daily","code":{"codeName":"Multi-Period-Daily","type":"Daily Files","validPeriods":["45-min","40-min","30-min","20-min","15-min","10-min","05-min","04-min","03-min","02-min","01-min"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Channels/Multi-Period-Daily/@Period/@Year/@Month/@Day","fileName":"@AssetA_@AssetB.json","dataRange":{"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Channels/Multi-Period-Daily","fileName":"Data.Range.@AssetA_@AssetB.json"}},"id":"64910fea-c92a-4a55-850a-aa62d98b478e"}},{"type":"Output Dataset","name":"New Output Dataset","id":"b536a078-e32a-4489-93f6-75107a90b527","referenceParent":{"type":"Dataset Definition","name":"Daily","code":{"codeName":"Multi-Period-Daily","type":"Daily Files","validPeriods":["45-min","40-min","30-min","20-min","15-min","10-min","05-min","04-min","03-min","02-min","01-min"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Standard-Sub-Channels/Multi-Period-Daily/@Period/@Year/@Month/@Day","fileName":"@AssetA_@AssetB.json","dataRange":{"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Standard-Sub-Channels/Multi-Period-Daily","fileName":"Data.Range.@AssetA_@AssetB.json"}},"id":"ca71e765-0f66-4b18-b500-847b9d16169b"}},{"type":"Output Dataset","name":"New Output Dataset","id":"d5bcc7c4-2798-4c34-9504-cc4617b64a04","referenceParent":{"type":"Dataset Definition","name":"Daily","code":{"codeName":"Multi-Period-Daily","type":"Daily Files","validPeriods":["45-min","40-min","30-min","20-min","15-min","10-min","05-min","04-min","03-min","02-min","01-min"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Sub-Channels/Multi-Period-Daily/@Period/@Year/@Month/@Day","fileName":"@AssetA_@AssetB.json","dataRange":{"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Sub-Channels/Multi-Period-Daily","fileName":"Data.Range.@AssetA_@AssetB.json"}},"id":"029479ae-275d-4854-ad3e-66948656a053"}},{"type":"Output Dataset","name":"New Output Dataset","id":"57898dc1-83a2-4ee9-8a0b-6674f988f0fa","referenceParent":{"type":"Dataset Definition","name":"Daily","code":{"codeName":"Multi-Period-Daily","type":"Daily Files","validPeriods":["45-min","40-min","30-min","20-min","15-min","10-min","05-min","04-min","03-min","02-min","01-min"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Standard-Channels/Multi-Period-Daily/@Period/@Year/@Month/@Day","fileName":"@AssetA_@AssetB.json","dataRange":{"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Standard-Channels/Multi-Period-Daily","fileName":"Data.Range.@AssetA_@AssetB.json"}},"id":"96b4e65b-e6db-44a0-80a5-ceb9d68a09ec"}}],"id":"b8fc5ac0-021d-4230-aa59-9876c5f0f3e1"},"processDependencies":{"type":"Process Dependencies","name":"New Process Dependencies","statusDependencies":[{"type":"Status Dependency","name":"New Status Dependency","id":"3cb29ee1-02de-452a-a79f-2451700fe335","referenceParent":{"type":"Status Report","name":"New Status Report","id":"7323fef7-870a-48b6-b96f-586111253b40"}},{"type":"Status Dependency","name":"New Status Dependency","id":"d5f34469-0ae1-45e6-acd9-4155d5940c77","referenceParent":{"type":"Status Report","name":"New Status Report","id":"c542a73e-a350-431f-ad3e-10f3ebef8ec7"}},{"type":"Status Dependency","name":"New Status Dependency","id":"7f6266a5-bddb-4d49-962d-100b1993043d","referenceParent":{"type":"Status Report","name":"New Status Report","id":"b1dd07bf-a698-4bbb-995a-356c929a1e94"}}],"dataDependencies":[{"type":"Data Dependency","name":"New Data Dependency","id":"073e24ab-6b47-482a-b117-0d3554f63c1f","referenceParent":{"type":"Dataset Definition","name":"Multi-Period-Daily","code":{},"id":"506104fa-e99a-4a46-930e-176bce311aff"}}],"id":"c0cb34fe-9268-4ebb-a8ce-7d53a13a6d4d"},"statusReport":{"type":"Status Report","name":"New Status Report","id":"b1dd07bf-a698-4bbb-995a-356c929a1e94"},"executionStartedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"4548cff9-f388-4f4f-b148-665d22ffaf9e","referenceParent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"acebc3ed-4f3f-4a4b-b403-f16cbe987dde","parentNode":{"type":"Process Definition","name":"Multi-Period-Daily","id":"e598ee86-1e18-4aa1-95c2-64aaf66776ca","code":{}}}},"executionFinishedEvent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"34e17fad-2c62-4c45-875c-774ac6b6cc99","parentNode":{"type":"Process Definition","name":"Multi-Period-Daily","id":"bc15b49d-4547-4bac-a28b-193eb0158fe3","code":{"name":"Multi-Period-Daily","description":"Produces for each market two files with bollinger channels respectively at each day of the market history.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000,"framework":{"name":"Multi-Period-Daily","startDate":{"takeItFromStatusDependency":0},"endDate":{"takeItFromStatusDependency":1}}}}},"calculations":{"type":"Calculations Procedure","name":"New Calculations Procedure","id":"0aaecc18-50b6-4634-9d3e-aafea3fa087f"},"dataBuilding":{"type":"Data Building Procedure","name":"New Data Building Procedure","id":"a85d779e-1302-4c04-9c35-10049ffdcb28"},"id":"bc15b49d-4547-4bac-a28b-193eb0158fe3"}},{"type":"Process Instance","subType":"Indicator Process Instance","name":"Market","code":{"process":"Multi-Period-Market"},"id":"6ddd81e2-d6db-4814-9c6c-96538a74824c","referenceParent":{"type":"Process Definition","name":"Multi-Period-Market","code":{"description":"Creates Market Files of Bollinger Channels and SubChannels","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000,"framework":{"name":"Multi-Period-Market","startDate":{},"endDate":{}}},"processOutput":{"type":"Process Output","name":"New Process Output","outputDatasets":[{"type":"Output Dataset","name":"Bollinger Channels","id":"d804e799-7c12-42f5-8de2-52a3a7d5daa4","referenceParent":{"type":"Dataset Definition","name":"Market","code":{"codeName":"Multi-Period-Market","type":"Market Files","validPeriods":["24-hs","12-hs","08-hs","06-hs","04-hs","03-hs","02-hs","01-hs"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Channels/Multi-Period-Market/@Period","fileName":"@AssetA_@AssetB.json"},"id":"610cd062-ab88-4892-b711-0fb430305c61"}},{"type":"Output Dataset","name":"Bollinger Standard Channels","id":"e524685d-8da0-41f6-839d-9a4100e6e3fe","referenceParent":{"type":"Dataset Definition","name":"Market","code":{"codeName":"Multi-Period-Market","type":"Market Files","validPeriods":["24-hs","12-hs","08-hs","06-hs","04-hs","03-hs","02-hs","01-hs"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Standard-Channels/Multi-Period-Market/@Period","fileName":"@AssetA_@AssetB.json"},"id":"22c1f2c6-3838-4657-add8-2e01d7056917"}},{"type":"Output Dataset","name":"Bollinger Sub-Channels","id":"eb0e7947-95e4-4f4a-87ea-1fb430b8b503","referenceParent":{"type":"Dataset Definition","name":"Market","code":{"codeName":"Multi-Period-Market","type":"Market Files","validPeriods":["24-hs","12-hs","08-hs","06-hs","04-hs","03-hs","02-hs","01-hs"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Sub-Channels/Multi-Period-Market/@Period","fileName":"@AssetA_@AssetB.json"},"id":"869f615e-0cc0-44fd-8648-4a951c23a410"}},{"type":"Output Dataset","name":"Bollinger Standard Sub-Channels","id":"dc96b9ac-f8d5-4bf8-a135-45cd5d6369f1","referenceParent":{"type":"Dataset Definition","name":"Market","code":{"codeName":"Multi-Period-Market","type":"Market Files","validPeriods":["24-hs","12-hs","08-hs","06-hs","04-hs","03-hs","02-hs","01-hs"],"filePath":"AAMasters/AAPaula.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Bollinger-Standard-Sub-Channels/Multi-Period-Market/@Period","fileName":"@AssetA_@AssetB.json"},"id":"f8d44a4d-3771-4a71-97ca-dc604ff565d3"}}],"id":"dd39a54a-3714-446a-9a41-dfd83557664c"},"processDependencies":{"type":"Process Dependencies","name":"New Process Dependencies","statusDependencies":[{"type":"Status Dependency","name":"Self","id":"ae627a69-4089-432d-b379-1b12ce4bd75e","referenceParent":{"type":"Status Report","name":"New Status Report","id":"af8aded9-002a-475a-88f5-d29573740969"}},{"type":"Status Dependency","name":"Chris","id":"4a603114-d464-46db-90a1-62304274117a","referenceParent":{"type":"Status Report","name":"New Status Report","id":"4f8197fa-2627-46df-bd36-7d30fdb12d8c"}}],"dataDependencies":[{"type":"Data Dependency","name":"Chris Bollinger Bands","id":"ea27be54-93a3-48e3-8c52-72bc397b6c66","referenceParent":{"type":"Dataset Definition","name":"Multi-Period-Market","code":{},"id":"f5b2a7d8-fc32-44a3-a002-9b0fc30a9719"}}],"id":"8b509294-6028-40e2-88a8-655a34245ed8"},"statusReport":{"type":"Status Report","name":"New Status Report","id":"af8aded9-002a-475a-88f5-d29573740969"},"executionStartedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"f4720e04-5def-4c0b-be42-33e50ac6a6b7","referenceParent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"4a9c8cc7-0ebf-43eb-b7f9-0b280630ff67","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","id":"941a0543-0cc0-4a5d-a782-728d2835c100","code":{}}}},"executionFinishedEvent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"671530dc-5ba5-4c8d-bc23-f228e22c56b3","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","id":"28be432d-80ca-46b3-859a-55541e24b2b4","code":{"description":"Creates Market Files of Bollinger Channels and SubChannels","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000,"framework":{"name":"Multi-Period-Market","startDate":{},"endDate":{}}}}},"calculations":{"type":"Calculations Procedure","name":"New Calculations Procedure","id":"ba2de283-a059-44d0-b229-1c7988f48f51"},"dataBuilding":{"type":"Data Building Procedure","name":"New Data Building Procedure","initialization":{"type":"Procedure Initialization","name":"New Procedure Initialization","code":{"type":"Code","code":"// Write your code here","id":"26413b25-24b7-47d1-b73d-12cef3198657"},"id":"13b23649-2695-48cb-aa9a-efe8acb7ab2c"},"loop":{"type":"Procedure Loop","name":"New Procedure Loop","code":{"type":"Code","code":"// Write your code here","id":"f0a3227a-094b-4aae-babb-d78f9e9b38ed"},"id":"b7a118de-5ebe-4efb-9b10-3b69680063a3"},"id":"859a0c08-b0fd-4d42-851a-21e898d42ec8"},"id":"28be432d-80ca-46b3-859a-55541e24b2b4"}}],"id":"27564838-24b1-4814-af8c-ec65accb05d1"},"id":"aa0f2533-460c-464f-ad77-6ae4cadd1178"}'
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

