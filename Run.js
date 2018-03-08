
const FULL_LOG = true;

/* The following global variable tells the system if it is running on test mode or production. */

global.RUNNING_MODE = 'Production';  // 'Testnet' or 'Production'

/* First thing to do is to read the config and guess which bot we will be running. */

var fs = require('fs');
let vmConfig;

try {

    vmConfig = JSON.parse(fs.readFileSync('this.vm.config.json', 'utf8'));

}
catch (err) {
    const logText = "[ERROR] 'readConfig' - ERROR : " + err.message;
    console.log(logText);

    return;
}

/* Now we will read the config of the bot from the path we obtained on the VM config. */

let botConfig;

try {

    botConfig = JSON.parse(fs.readFileSync(vmConfig.bot.path + '/this.bot.config.json', 'utf8'));
}
catch (err) {
    console.log("[ERROR] 'readConfig' - ERROR : " + err.message);
    return;
}

let bot = { // TODO > REPLACE THIS FOR THE ENTIRE BOT CONFIGURATION. NOTE THAT NAME NOW IS CODENAME
    "name": botConfig.displayName,
    "type": botConfig.type,
    "version": botConfig.version,
    "devTeam": botConfig.devTeam
};

/* Now we will run according to what we see at the config file. */

const ROOT_DIR = './';
const MODULE_NAME = "Run";

const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
const logger = DEBUG_MODULE.newDebugLog();
logger.fileName = MODULE_NAME;
logger.bot = botConfig;

process.on('uncaughtException', function (err) {
    logger.write('uncaughtException - ' + err.message);
});


process.on('unhandledRejection', (reason, p) => {
    logger.write("Unhandled Rejection at: Promise " + JSON.stringify(p) + " reason: " + reason);
});


process.on('exit', function (code) {
    logger.write('About to exit with code:' + code);
});

/* Global constants definitions. */

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

/* Current state of the art fixed parameters */

global.MARKET = {
    assetA: "USDT",
    assetB: "BTC",
};

/* Currently only one exchange is supported. */

global.EXCHANGE_NAME = "Poloniex";

/* Time Periods Definitions. */

global.marketFilesPeriods =
    '[' +
    '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
    '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
    '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
    '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
    '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
    '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
    '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
    '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']';

global.marketFilesPeriods = JSON.parse(global.marketFilesPeriods);

global.dailyFilePeriods =
    '[' +
    '[' + 45 * 60 * 1000 + ',' + '"45-min"' + ']' + ',' +
    '[' + 40 * 60 * 1000 + ',' + '"40-min"' + ']' + ',' +
    '[' + 30 * 60 * 1000 + ',' + '"30-min"' + ']' + ',' +
    '[' + 20 * 60 * 1000 + ',' + '"20-min"' + ']' + ',' +
    '[' + 15 * 60 * 1000 + ',' + '"15-min"' + ']' + ',' +
    '[' + 10 * 60 * 1000 + ',' + '"10-min"' + ']' + ',' +
    '[' + 05 * 60 * 1000 + ',' + '"05-min"' + ']' + ',' +
    '[' + 04 * 60 * 1000 + ',' + '"04-min"' + ']' + ',' +
    '[' + 03 * 60 * 1000 + ',' + '"03-min"' + ']' + ',' +
    '[' + 02 * 60 * 1000 + ',' + '"02-min"' + ']' + ',' +
    '[' + 01 * 60 * 1000 + ',' + '"01-min"' + ']' + ']';

global.dailyFilePeriods = JSON.parse(global.dailyFilePeriods);



const START_ALL_MONTHS = false;
const START_ONE_MONTH = true;

const INTERVAL_EXECUTOR_MODULE = require('./Interval Executor');
const TRADING_BOT_MAIN_LOOP_MODULE = require('./Trading Bot Main Loop');

/* Now we will see which are the script Arguments. We expect the name of the process to run, since that is what it should be defined at the Task Scheduller. */

let processToRun = process.argv[2];

for (let i = 0; i < botConfig.processes.length; i++) {

    if (botConfig.processes[i].name === processToRun) {

        let processConfig = botConfig.processes[i];

        botConfig.process = processConfig.name;

        try {

            /* We tesst each type of start Mode to get what to run and how. */

            if (processConfig.startMode.allMonths.run === "true") {

                for (let year = processConfig.startMode.allMonths.maxYear; year > processConfig.startMode.allMonths.minYear; year--) {

                    for (let month = 12; month > 0; month--) {

                        let timeDelay = Math.random() * 10 * 1000; // We introduce a short delay so as to not overload the machine.

                        setTimeout(startProcess, timeDelay);

                        function startProcess() {

                            const newIntervalExecutor = INTERVAL_EXECUTOR_MODULE.newIntervalExecutor(bot);

                            newIntervalExecutor.initialize(vmConfig.bot.path, processConfig, year, month, onInitializeReady);

                            function onInitializeReady() {

                                newIntervalExecutor.start();

                            }

                        }

                    }

                }

            }


            if (processConfig.startMode.oneMonth.run === "true") {

                startProcess();

                function startProcess() {

                    const newIntervalExecutor = INTERVAL_EXECUTOR_MODULE.newIntervalExecutor(bot);

                    newIntervalExecutor.initialize(vmConfig.bot.path, processConfig, processConfig.startMode.oneMonth.year, processConfig.startMode.oneMonth.month, onInitializeReady);

                    function onInitializeReady() {

                        newIntervalExecutor.start();

                    }
                }
            }


            if (processConfig.startMode.noTime.run === "true") {

                startProcess();

                function startProcess() {

                    if (bot.type === "Trading") {

                        runTradingBot(processConfig);

                        return;
                    }

                    const newIntervalExecutor = INTERVAL_EXECUTOR_MODULE.newIntervalExecutor(bot);

                    newIntervalExecutor.initialize(vmConfig.bot.path, processConfig, undefined, undefined, onInitializeReady);

                    function onInitializeReady() {

                        newIntervalExecutor.start();

                    }
                }
            }


        } catch (err) {
            console.log(err.message);
            logger.write(err.message);
        }
    }
}


function runTradingBot(pProcessConfig) {

    try {
        if (FULL_LOG === true) { logger.write("[INFO] runTradingBot -> Entering function."); }

        let tradingBotMainLoop = TRADING_BOT_MAIN_LOOP_MODULE.newTradingBotMainLoop(botConfig);
        tradingBotMainLoop.initialize(vmConfig.bot.path, pProcessConfig, onInitializeReady);

        function onInitializeReady(err) {

            if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                tradingBotMainLoop.run(whenRunFinishes);

                function whenRunFinishes(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        logger.write("[INFO] trading bot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");

                    } else {

                        logger.write("[ERROR] trading bot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                        logger.write("[ERROR] trading bot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                        logger.write("[ERROR] trading bot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                    }
                }

            } else {
                logger.write("[ERROR] trading bot -> onInitializeReady -> err = " + err.message);
                logger.write("[ERROR] trading bot -> onInitializeReady -> Bot will not be started. ");
            }
        }
    }
    catch (err) {
        logger.write("[ERROR] runTradingBot -> err = " + err.message);
    }
}