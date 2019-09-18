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
    console.log('[INFO] Task Server -> server -> uncaughtException -> err.message = ' + err.message)
    console.log('[INFO] Task Server -> server -> uncaughtException -> err.stack = ' + err.stack)
    process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
    console.log('[INFO] Task Server -> server -> unhandledRejection -> reason = ' + JSON.stringify(reason))
    console.log('[INFO] Task Server -> server -> unhandledRejection -> p = ' + JSON.stringify(p))
    process.exit(1)
})

process.on('exit', function (code) {
    console.log('[INFO] Task Server -> server -> process.on.exit -> About to exit -> code = ' + code)
})

/* Local Variables */

let sequenceList = []
let heartBeatInterval

/*

We read the first string sent as an argument when the process was created by the Task Manager. Ther we will find the information of the identity
of this Task and know exactly what to run within this server instance. 

*/
global.TASK_NODE = process.argv[2]

if (global.TASK_NODE !== undefined) {
    console.log('[INFO] Task Server -> server -> global.TASK_NODE = ' + global.TASK_NODE)
    try {
        global.TASK_NODE = JSON.parse(global.TASK_NODE)
    } catch (err) {
        console.log('[ERROR] Task Server -> server -> global.TASK_NODE -> ' + err.stack)
    }

}
else {  // I use this section to debug in standalone mode.
    let argument = '{"type":"Task","name":"Runs Backtests, Fordwardtests & Live Trades ","bot":{"type":"Trading Engine","processes":[{"type":"Process","name":"Multi Period","code":{"team":"AAMasters","bot":"AAJason","process":"Multi-Period","repo":"AAJason-Trading-Engine-Bot"},"id":"1bfce24d-8c05-4be9-bd25-328f07c85265"}]},"id":"cbb13086-608d-4bb4-960a-17a81038877b"}'
    try {
        global.TASK_NODE = JSON.parse(argument)
    } catch (err) {
        console.log(err.stack)
    }
}


require('dotenv').config();

global.DEFINITION = require(process.env.INTER_PROCESS_FILES_PATH + '/Definition');
global.WRITE_LOGS_TO_FILES = process.env.WRITE_LOGS_TO_FILES

/* Default parameters can be changed by the execution configuration */
global.EXCHANGE_NAME = 'Poloniex'
global.MARKET = { assetA: 'USDT', assetB: 'BTC' }
global.CLONE_EXECUTOR = { codeName: 'AACloud', version: '1.1' }

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
        global.STOP_PROCESSING = true

        /*
        There are some process that might no be able to end grafully, for example the ones schedulle to process information in a future day or month.
        In order to be sure that the process will be terminated, we schedulle one forced exit in 2 minutes from now.
        */
        console.log('[INFO] Task Server -> server -> process.on -> Executing order received from Task Manager to Stop this Task. Nodejs process will be exited in less than 2 minutes.')
        setTimeout(global.EXIT_NODE_PROCESS, 120000);
    }
});

global.EXIT_NODE_PROCESS = function exitProcess() {

    /* Cleaning Before Exiting. */
    clearInterval(global.HEARTBEAT_INTERVAL_HANDLER)

    for (let i = 0; i < global.TASK_NODE.bot.processes.length; i++) {
        let code = global.TASK_NODE.bot.processes[i].code

        /* Delete the event handler for each process. */

        let key = code.team + "-" + code.bot + "-" + code.process
        let event = {
            reason: 'Signal Received to Terminate this Process.'
        }
        global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Process Terminated', event)
        global.SYSTEM_EVENT_HANDLER.deleteEventHandler(key)
    }

    global.SYSTEM_EVENT_HANDLER.finalize()
    global.SYSTEM_EVENT_HANDLER = undefined
    console.log("[INFO] Task Server -> " + global.TASK_NODE.name + " -> EXIT_NODE_PROCESS -> Task Server Stopped.");

    process.exit()
}

let notFirstSequence = false;

/* Setting up the global Event Handler */

const EVENT_HANDLER_MODULE = require('./SystemEventHandler.js');
const IPC = require('node-ipc');
global.SYSTEM_EVENT_HANDLER = EVENT_HANDLER_MODULE.newSystemEventHandler(IPC)
global.SYSTEM_EVENT_HANDLER.initialize('Task Server', bootLoader)


function bootLoader() {

    for (let i = 0; i < global.TASK_NODE.bot.processes.length; i++) {
        let code = global.TASK_NODE.bot.processes[i].code

        /* Validate that the minimun amount of parameters required are defined. */

        if (global.TASK_NODE.bot.processes[i].code.bot === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'bot' is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[i].name);
            continue
        }

        if (global.TASK_NODE.bot.processes[i].code.team === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'team' is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[i].name);
            continue
        }

        if (global.TASK_NODE.bot.processes[i].code.process === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'process' is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[i].name);
            continue
        }

        /* Add to the execution sequence list. */
        sequenceList.push(code)

        /* Create the event handler for each process. This event handlers are where the status reports updated events are raised. */

        let key = code.team + "-" + code.bot + "-" + code.process
        global.SYSTEM_EVENT_HANDLER.createEventHandler(key)
    }

    /* Heartbeat sent to the UI */

    let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id

    global.SYSTEM_EVENT_HANDLER.createEventHandler(key)
    global.HEARTBEAT_INTERVAL_HANDLER = setInterval(hearBeat, 1000)

    function hearBeat() {

        /* The heartbeat event is raised at the event handler of the instance of this task, created at the UI. */        
        let event = {
            seconds: (new Date()).getSeconds()
        }
        global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Heartbeat', event)
    }

    startSequence()
}

/* Old Run.js code follows... */

function startSequence() {

    for (let processIndex = 0; processIndex < global.TASK_NODE.bot.processes.length; processIndex++) {
        let execution = sequenceList[processIndex];

        global.STOP_TASK_GRACEFULLY = false;

        execution.bot ? process.env.BOT = execution.bot : undefined;
        execution.resumeExecution = true;

        execution.process ? process.env.PROCESS = execution.process : undefined;

        execution.baseAsset ? process.env.BASE_ASSET = execution.baseAsset : undefined;
        execution.balanceAssetA ? process.env.INITIAL_BALANCE_ASSET_A = execution.balanceAssetA : undefined;
        execution.balanceAssetB ? process.env.INITIAL_BALANCE_ASSET_B = execution.balanceAssetB : undefined;


        execution.exchangeName ? global.EXCHANGE_NAME = execution.exchangeName : undefined;

        if (global.DEFINITION) {
            if (global.DEFINITION.personalData) {
                if (global.DEFINITION.personalData.exchangeAccounts) {
                    if (global.DEFINITION.personalData.exchangeAccounts.length > 0) {
                        let exchangeAccount = global.DEFINITION.personalData.exchangeAccounts[0]
                        if (exchangeAccount.keys) {
                            if (exchangeAccount.keys.length > 0) {
                                let key = exchangeAccount.keys[0]

                                process.env.KEY = key.name
                                process.env.SECRET = key.code

                            }
                        }
                    }
                }
            }
        }

        readExecutionConfiguration(execution, processIndex);
    }
}

async function readExecutionConfiguration(execution, processIndex) {
    try {
        console.log("[INFO] Task Server -> server -> readExecutionConfiguration -> Entering function. ");

        let botProcess

        if (global.TASK_NODE.bot.type === 'Trading Engine') {

            /* The Trading Engine only resumes its execution after the first sequence was completed. */
            if (notFirstSequence === false) {
                execution.resumeExecution = false
            }

            if (global.DEFINITION !== undefined) {
 
                 botProcess = "Multi-Period"
 
                /* Get the initial balance from the global.DEFINITION */
                let tradingSystem = global.DEFINITION.tradingSystem

                if (tradingSystem) {
                    if (tradingSystem.parameters !== undefined) {
                        if (tradingSystem.parameters.baseAsset !== undefined) {
                            let code
                            try {
                                code = JSON.parse(tradingSystem.parameters.baseAsset.code);

                                if (code.name !== undefined) {
                                    baseAsset = code.name;
                                    if (baseAsset !== 'BTC' && baseAsset !== 'USDT') {
                                        /* using BTC as default */
                                        baseAsset = 'BTC'
                                    }
                                }

                                if (baseAsset === 'BTC') { // NOTE: POLONIEX, the only exchange working so far, has Asset A and B inverted. We need to fix this.
                                    if (code.initialBalance !== undefined) {
                                        process.env.INITIAL_BALANCE_ASSET_B = code.initialBalance;
                                        process.env.INITIAL_BALANCE_ASSET_A = 0
                                    }
                                } else {
                                    if (code.initialBalance !== undefined) {
                                        process.env.INITIAL_BALANCE_ASSET_A = code.initialBalance;
                                        process.env.INITIAL_BALANCE_ASSET_B = 0
                                    }
                                }
                            } catch (err) {
                                global.DEFINITION.tradingSystem.parameters.baseAsset.error = err.message

                                process.env.INITIAL_BALANCE_ASSET_A = 0 // default
                                process.env.INITIAL_BALANCE_ASSET_B = 0.001 // default
                                
                            }
                        }
                    }
                }
            }
        }

        if (global.TASK_NODE.bot.processes[processIndex].code.repo === undefined) {
            global.TASK_NODE.bot.processes[processIndex].code.repo = global.TASK_NODE.bot.processes[processIndex].code.bot + "-" + global.TASK_NODE.bot.type + "-Bot"
        }

        if (botProcess === undefined) { botProcess = process.env.PROCESS } // Only use the .env when nothing comes at Definition.json
        let cloneToExecute = {
            enabled: "true",
            devTeam: global.TASK_NODE.bot.processes[processIndex].code.team,
            bot: global.TASK_NODE.bot.processes[processIndex].code.bot,
            process: global.TASK_NODE.bot.processes[processIndex].code.process,
            repo: global.TASK_NODE.bot.processes[processIndex].code.repo
        }
  
        global.EXECUTION_CONFIG = {
            cloneToExecute: cloneToExecute
        };


        global.CLONE_EXECUTOR = {
            codeName: 'AACloud',
            version: '1.1'
        }

        startRoot(processIndex);
    }

    catch (err) {
        console.log("[ERROR] readExecutionConfiguration -> err = " + err.stack);
        console.log("[ERROR] readExecutionConfiguration -> Please verify that the Start Mode for the type of Bot configured applies to that type.");
    }
}


function getTimePeriod(timePeriod) {
    if (timePeriod !== undefined) {
        try {
            let timePeriodMap = new Map()
            timePeriodMap.set('24-hs', 86400000)
            timePeriodMap.set('12-hs', 43200000)
            timePeriodMap.set('08-hs', 28800000)
            timePeriodMap.set('06-hs', 21600000)
            timePeriodMap.set('04-hs', 14400000)
            timePeriodMap.set('03-hs', 10800000)
            timePeriodMap.set('02-hs', 7200000)
            timePeriodMap.set('01-hs', 3600000)
            timePeriodMap.set('45-min', 2700000)
            timePeriodMap.set('40-min', 2400000)
            timePeriodMap.set('30-min', 1800000)
            timePeriodMap.set('20-min', 1200000)
            timePeriodMap.set('15-min', 900000)
            timePeriodMap.set('10-min', 600000)
            timePeriodMap.set('05-min', 300000)
            timePeriodMap.set('04-min', 240000)
            timePeriodMap.set('03-min', 180000)
            timePeriodMap.set('02-min', 120000)
            timePeriodMap.set('01-min', 60000)
            return timePeriodMap.get(timePeriod)
        } catch (error) {
            console.log('[WARN] Task Server -> server -> readExecutionConfiguration -> getTimePeriod -> Error: ', error)
        }
    } else {
        return undefined
    }
}

function startRoot(processIndex) {
    console.log('[INFO] Task Server -> server -> startRoot -> Entering function. ')

    const ROOT_DIR = './'
    const ROOT_MODULE = require(ROOT_DIR + 'Root')
    let root = ROOT_MODULE.newRoot()

    root.initialize(onInitialized)

    function onInitialized() {
        console.log('[INFO] Task Server -> server -> startRoot -> onInitialized -> Entering function. ')

        root.start(processIndex)
    }
}

