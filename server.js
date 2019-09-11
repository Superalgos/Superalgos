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
global.USER_DEFINITION = process.argv[2]

if (global.USER_DEFINITION !== undefined) {
    console.log('[INFO] Task Server -> server -> global.USER_DEFINITION = ' + global.USER_DEFINITION)
    try {
        global.USER_DEFINITION = JSON.parse(global.USER_DEFINITION)
    } catch (err) {
        console.log('[ERROR] Task Server -> server -> global.USER_DEFINITION -> ' + err.stack)
    }

}
else {  // I use this section to debug in standalone mode.
    let argument = '{"type":"Task","name":"Brings Trades Records from the Exchange","bot":{"type":"Sensor","name":"Charly","processes":[{"type":"Process","name":"Live Trades","code":{"devTeam":"AAMasters","bot":"AACharly","mode":"noTime","resumeExecution":true,"type":"Sensor","exchangeName":"Poloniex","process":"Live-Trades"},"id":"3aae75f5-67ae-4ae5-9586-ec5640f79b18"}]},"id":"54444b07-eee2-4fa8-9183-8fea3b5ff9de"}'
    try {
        global.USER_DEFINITION = JSON.parse(argument)
    } catch (err) {
        console.log(err.stack)
    }
}


require('dotenv').config();

global.DEFINITION = require(process.env.INTER_PROCESS_FILES_PATH + '/Definition');
global.WRITE_LOGS_TO_FILES = process.env.WRITE_LOGS_TO_FILES

/* Default parameters can be changed by the execution configuration */
global.EXCHANGE_NAME = process.env.EXCHANGE_NAME
global.MARKET = { assetA: 'USDT', assetB: 'BTC' }
global.CLONE_EXECUTOR = { codeName: 'AACloud', version: '1.1' }
global.ENDED_PROCESSES_COUNTER = 0

/* Here we listen for the message to stop this Task / Process comming from the Task Manager, which is the paret of this node js process. */
process.on('message', message => {
    if (message === 'Stop this Task') {

        process.env.STOP_GRACEFULLY = true;

    }
});

let notFirstSequence = false;

/* Setting up the global Event Handler */

const EVENT_HANDLER_MODULE =  require('../Libraries/SystemEventsClient/SystemEventHandler.js');
global.SYSTEM_EVENT_HANDLER = EVENT_HANDLER_MODULE.newSystemEventHandler()
global.SYSTEM_EVENT_HANDLER.initialize('Task Server', bootLoader)


function bootLoader() {

    for (let i = 0; i < global.USER_DEFINITION.bot.processes.length; i++) {
        let code = global.USER_DEFINITION.bot.processes[i].code

        /* Add to the execution sequence list. */
        sequenceList.push(code)

        /* Create the event handler for each process. This event handlers are where the status reports updated events are raised. */

        let key = code.devTeam + "-" + code.bot + "-" + code.process
        global.SYSTEM_EVENT_HANDLER.createEventHandler(key)
    }

    /* Heartbeat sent to the UI */

    let key = global.USER_DEFINITION.name + '-' + global.USER_DEFINITION.type + '-' + global.USER_DEFINITION.id

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

    for (let processIndex = 0; processIndex < global.USER_DEFINITION.bot.processes.length; processIndex++) {
        let execution = sequenceList[processIndex];

        process.env.STOP_GRACEFULLY = false;
        execution.devTeam ? process.env.DEV_TEAM = execution.devTeam : undefined;
        execution.bot ? process.env.BOT = execution.bot : undefined;
        execution.mode ? process.env.START_MODE = execution.mode : undefined;
        execution.resumeExecution = true;
        execution.type ? process.env.TYPE = execution.type : undefined;
        execution.process ? process.env.PROCESS = execution.process : undefined;
        execution.startYear ? process.env.MIN_YEAR = execution.startYear : undefined;
        execution.endYear ? process.env.MAX_YEAR = execution.endYear : undefined;
        execution.month ? process.env.MONTH = execution.month : undefined;
        execution.beginDatetime ? process.env.BEGIN_DATE_TIME = execution.beginDatetime : undefined;
        execution.endDatetime ? process.env.END_DATE_TIME = execution.endDatetime : undefined;
        execution.dataSet ? process.env.DATA_SET = execution.dataSet : undefined;
        execution.timePeriod ? process.env.TIME_PERIOD = execution.timePeriod : undefined;
        execution.baseAsset ? process.env.BASE_ASSET = execution.baseAsset : undefined;
        execution.balanceAssetA ? process.env.INITIAL_BALANCE_ASSET_A = execution.balanceAssetA : undefined;
        execution.balanceAssetB ? process.env.INITIAL_BALANCE_ASSET_B = execution.balanceAssetB : undefined;
        execution.type === 'Trading' ? process.env.CLONE_ID = 1 : undefined;

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

        let timePeriodFilter
        let botProcess

        /* Dates are taken initially from .env, but can be overwritten if they are defined by the user */
        let initialDatetime = process.env.BEGIN_DATE_TIME
        let finalDatetime = process.env.END_DATE_TIME

        if (execution.type === 'Trading-Engine') {

            /* The Trading Engine only resumes its execution after the first sequence was completed. */
            if (notFirstSequence === false) {
                execution.resumeExecution = false
            }

            /* We set the START MODE of the Trading Engine */
            if (process.env.KEY === undefined || process.env.SECRET === undefined) {
                process.env.START_MODE = "backtest" // if we dont have keys, we swtich to backtest mode to avoid exchange errors.
            } else {
                process.env.START_MODE = "live"  // If we have keys, then we are in live mode.
            }

            if (global.DEFINITION !== undefined) {
                if (global.DEFINITION.simulationParams !== undefined) {
                    if (global.DEFINITION.simulationParams.beginDatetime !== undefined) {
                        initialDatetime = new Date(global.DEFINITION.simulationParams.beginDatetime)  /* The first override occurs here, with the simulation parameters */
                    }
                    /* Here we only look for one timePeriod, in the future we will be able to process the whole array, but not for now. */
                    if (global.DEFINITION.simulationParams.timePeriodDailyArray !== undefined) {
                        if (global.DEFINITION.simulationParams.timePeriodDailyArray.length === 1) {
                            timePeriodFilter = global.DEFINITION.simulationParams.timePeriodDailyArray[0]
                            botProcess = "Multi-Period"
                        }
                    }
                    if (global.DEFINITION.simulationParams.timePeriodMarketArray !== undefined) {
                        if (global.DEFINITION.simulationParams.timePeriodMarketArray.length === 1) {
                            timePeriodFilter = global.DEFINITION.simulationParams.timePeriodMarketArray[0]
                            botProcess = "Multi-Period"
                        }
                    }
                }
                if (global.DEFINITION.tradingSystem !== undefined) {
                    if (global.DEFINITION.tradingSystem.parameters !== undefined) {
                        if (global.DEFINITION.tradingSystem.parameters.timeRange !== undefined) {
                            if (global.DEFINITION.tradingSystem.parameters.timeRange.code !== undefined) {
                                try {
                                    let code = JSON.parse(global.DEFINITION.tradingSystem.parameters.timeRange.code)
                                    if (code.initialDatetime !== undefined) {
                                        initialDatetime = code.initialDatetime /* The second override occurs here, with the date explicitelly defined by the user */
                                    }
                                    if (code.finalDatetime !== undefined) {
                                        finalDatetime = code.finalDatetime
                                    }
                                } catch (err) {
                                    global.DEFINITION.tradingSystem.parameters.timeRange.error = err.message
                                }
                            }
                        }
                    }
                }
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

        let startMode

        // General Financial Being Configuration
        global.DEV_TEAM = process.env.DEV_TEAM
        global.CURRENT_BOT_REPO = process.env.BOT + "-" + process.env.TYPE + "-Bot"

        if (process.env.TYPE === 'Trading' || process.env.TYPE === 'Trading-Engine') {
            let live = {
                run: 'false',
                resumeExecution: execution.resumeExecution,
                beginDatetime: new Date(global.DEFINITION.simulationParams.timestamp).toISOString(),
                endDatetime: finalDatetime
            }

            let backtest = {
                run: 'false',
                resumeExecution: execution.resumeExecution,
                beginDatetime: initialDatetime,
                endDatetime: finalDatetime
            }

            let competition = {
                run: 'false',
                resumeExecution: execution.resumeExecution,
                beginDatetime: initialDatetime,
                endDatetime: finalDatetime
            }

            startMode = {
                live: live,
                backtest: backtest,
                competition: competition
            }
        } else if (process.env.TYPE === 'Indicator' || process.env.TYPE === 'Sensor') {
            let allMonths = {
                run: "false",
                minYear: process.env.MIN_YEAR,
                maxYear: process.env.MAX_YEAR
            }
            let oneMonth = {
                run: "false",
                year: process.env.MIN_YEAR,
                month: process.env.MONTH
            }
            let noTime = {
                run: "false",
                beginDatetime: process.env.BEGIN_DATE_TIME,
                resumeExecution: execution.resumeExecution
            }
            let fixedInterval = {
                run: "false",
                interval: process.env.INTERVAL
            }

            startMode = {
                allMonths: allMonths,
                oneMonth: oneMonth,
                noTime: noTime,
                fixedInterval: fixedInterval
            }
        } else {
            console.log("[ERROR] readExecutionConfiguration -> Bot Type is invalid.");
            throw new Error("readExecutionConfiguration -> Bot Type is invalid.")
        }

        startMode[process.env.START_MODE].run = "true"

        if (botProcess === undefined) { botProcess = process.env.PROCESS } // Only use the .env when nothing comes at Definition.json
        let cloneToExecute = {
            enabled: "true",
            devTeam: process.env.DEV_TEAM,
            bot: process.env.BOT,
            process: botProcess,
            repo: global.CURRENT_BOT_REPO
        }

        let timePeriod
        if (timePeriodFilter === undefined) {
            timePeriod = process.env.TIME_PERIOD
        } else {
            timePeriod = timePeriodFilter
        }

        global.EXECUTION_CONFIG = {
            cloneToExecute: cloneToExecute,
            startMode: startMode,
            timePeriod: getTimePeriod(timePeriod),
            timePeriodFileStorage: timePeriod,
            timePeriodFilter: timePeriodFilter,
            dataSet: process.env.DATA_SET
        };

        timePeriodFilter = undefined
        timePeriod = undefined

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

    let UI_COMMANDS = {
        beginDatetime: undefined,
        endDatetime: undefined,
        timePeriod: undefined,
        startMode: undefined,
        eventHandler: undefined
    }

    root.initialize(UI_COMMANDS, onInitialized)

    function onInitialized() {
        console.log('[INFO] Task Server -> server -> startRoot -> onInitialized -> Entering function. ')

        root.start(processIndex)
    }
}

