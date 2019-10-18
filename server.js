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
    let argument = '{"type":"Task","name":"New Task","bot":{"type":"Trading Engine","code":{"team":"AAMasters","bot":"AAJason","repo":"AAJason-Trading-Engine-Bot"},"processes":[{"type":"Process","subType":"Trading Engine Process","name":"Multi Period","code":{"process":"Multi-Period"},"session":{"type":"Backtesting Session","name":"30min + 6hs down, dev < 15","id":"715839bb-a76c-427f-a48f-5bf1b2184070"},"id":"18dfca43-5015-40d9-824d-09b59b670e32"},{"type":"Process","subType":"Trading Engine Process","name":"Multi Period","code":{"process":"Multi-Period"},"session":{"type":"Backtesting Session","name":"30min + 6hs down, dev < 20","id":"7a681e8d-7167-4edb-bb2f-90e12c7f5418"},"id":"5ccdbb76-4e45-4377-bc44-fd0f95e40deb"}],"id":"22b61a44-4fcc-4f6d-bb7c-4c2a24acbfbc"},"id":"9238ed0b-7cc6-4732-83e6-8ac8d52f6dd3"}'
    /* charly   argument = '{"type":"Task","name":"Brings Trades Records from the Exchange","bot":{"type":"Sensor","name":"Charly","processes":[{"type":"Process","name":"Live Trades","code":{"team":"AAMasters","bot":"AACharly","process":"Live-Trades"},"id":"5846ebc7-1979-4a80-9cc7-94bb4b8659dc"},{"type":"Process","name":"Hole Fixing","code":{"team":"AAMasters","bot":"AACharly","process":"Hole-Fixing"},"id":"31fc4f05-75d4-419a-9fb0-73e25e856f15"}]},"id":"5bfef4dc-54c1-44db-ace6-1ab27a86746e"}'
    // olivia argument = '{"type":"Task","name":"Generates 1 min to 24 hs Candles & Volumes","bot":{"type":"Indicator","name":"Olivia","processes":[{"type":"Process","name":"Daily","code":{"team":"AAMasters","bot":"AAOlivia","process":"Multi-Period-Daily"},"id":"68cc8e1b-e94a-477e-82d0-15ecc9f1b9e2"},{"type":"Process","name":"Market","code":{"team":"AAMasters","bot":"AAOlivia","process":"Multi-Period-Market"},"id":"e1ac5e3d-d491-4e90-baf4-d4e5b71a8b1a"}]},"id":"efe36e05-75ea-41b5-8d92-c6b27635c834"}'
    // bruce argument = ' {"type":"Task","name":"Converts Trades into 1 min Candles & Volumes","bot":{"type":"Indicator","name":"Bruce","processes":[{"type":"Process","name":"New Process","code":{"team":"AAMasters","bot":"AABruce","process":"Single-Period-Daily"},"id":"e184744f-5de0-41c1-ad4c-36960f4ced90"}]},"id":"42758590-a7bd-4712-a5c9-80a3a820c5b3"}'
    */
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

    /* Telegram Bot Initialization */

    try {
/*
    const Telegraf = require('telegraf')

    global.TELEGRAM_BOT = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
    global.TELEGRAM_BOT.start((ctx) => ctx.reply('Welcome'))
    global.TELEGRAM_BOT.help((ctx) => ctx.reply('Send me a sticker'))
    global.TELEGRAM_BOT.on('sticker', (ctx) => ctx.reply('??'))
    global.TELEGRAM_BOT.hears('hi', (ctx) => ctx.reply('Hey there'))
    global.TELEGRAM_BOT.launch()
    
    const Telegram = require('telegraf/telegram')
    global.TELEGRAM_API = new Telegram(process.env.TELEGRAM_BOT_TOKEN)
    global.TELEGRAM_API.sendMessage(process.env.TELEGRAM_GROUP_ID, "Task Manager Started.")
*/

    } catch (err) {
        console.log("[ERROR] Task Server -> server -> bootLoader -> Telegram Initialization Failed. -> Error = " + err.stack);
    }

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
        /*
        global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Heartbeat', event)
        if (global.TELEGRAM_API !== undefined) {
            global.TELEGRAM_API.sendMessage(process.env.TELEGRAM_GROUP_ID, "Task is Alive!")
        }
        */
    }

    for (let processIndex = 0; processIndex < global.TASK_NODE.bot.processes.length; processIndex++) {
        let code = global.TASK_NODE.bot.processes[processIndex].code

        /* Validate that the minimun amount of parameters required are defined. */

        if (global.TASK_NODE.bot.code.bot === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'bot' at the Indicator | Sensor | Trading Engine is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[processIndex].name);
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

