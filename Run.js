
const FULL_LOG = true;

/* First thing to do is to read the config and guess which bot we will be running. */

var fs = require('fs');

try {

    global.PLATFORM_CONFIG = JSON.parse(fs.readFileSync('this.config.json', 'utf8'));

}
catch (err) {
    const logText = "[ERROR] 'readConfig' - ERROR : " + err.message;
    console.log(logText);

    return;
}

/* You do not have funds at the exchange and still want run your bot? No problem activate the exchange simulation mode: */

global.EXCHANGE_SIMULATION_MODE = JSON.parse(global.PLATFORM_CONFIG.exchangeSimulationMode);

/* The following global variable tells the system if it is running on test mode or production. */

global.STORAGE_CONN_STRING_FOLDER = global.PLATFORM_CONFIG.storageConnStringFolder;  // 'Testnet', 'Mixed' or 'Production', or whatever folder name the conn strings files are into.

/* Now we will run according to what we see at the config file. */

const ROOT_DIR = './';
const MODULE_NAME = "Run";

const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');

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

global.CUSTOM_OK_RESPONSE = {
    result: "Ok, but check Message",
    message: "Custom Message"
}; 

global.CUSTOM_FAIL_RESPONSE = {
    result: "Fail Because",
    message: "Custom Message"
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


/* Loop Counter */

global.loopCointer = 0;

/* Small Function to fix numbers into strings in a cool way. */

function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

/* Some LAGACY code starts here. Pending for clean up. */

const INTERVAL_EXECUTOR_MODULE = require('./Interval Executor');
const TRADING_BOT_MAIN_LOOP_MODULE = require('./Trading Bot Main Loop');
const INDICATOR_BOT_MAIN_LOOP_MODULE = require('./Indicator Bot Main Loop');
const EXTRACTION_BOT_MAIN_LOOP_MODULE = require('./Extraction Bot Main Loop');

/* Loop through all the processes configured to be run by this Node.js Instance. */

let logger;

for (let p = 0; p < global.PLATFORM_CONFIG.executionList; p++) {

    let listItem = PLATFORM_CONFIG.executionList[p];

    /* Now we will read the config of the bot from the path we obtained at the AACloud config. */

    let botConfig;

    try {

        botConfig = JSON.parse(fs.readFileSync(global.PLATFORM_CONFIG.bot.path + '/this.bot.config.json', 'utf8'));
    }
    catch (err) {
        console.log("[ERROR] 'readConfig' - ERROR : " + err.message);
        return;
    }

    logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = botConfig;

    /* File Path Root */

    bot.filePathRoot
    botConfig.filePathRoot = botConfig.devTeam + "/" + botConfig.codeName + "." + botConfig.version.major + "." + botConfig.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + botConfig.dataSetVersion;


}


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

                            newIntervalExecutor.initialize(global.PLATFORM_CONFIG.bot.path, processConfig, year, month, onInitializeReady);

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

                    newIntervalExecutor.initialize(global.PLATFORM_CONFIG.bot.path, processConfig, processConfig.startMode.oneMonth.year, processConfig.startMode.oneMonth.month, onInitializeReady);

                    function onInitializeReady() {
                        newIntervalExecutor.start();
                    }
                }
            }


            if (processConfig.startMode.noTime.run === "true") {


                let month = pad((new Date()).getUTCMonth() + 1, 2);
                let year = (new Date()).getUTCFullYear();
                
                switch (botConfig.type) {
                    case 'Extraction': {
                        runExtractionBot(processConfig, month, year);
                        return;
                    }
                    case 'Indicator': {
                        runIndicatorBot(processConfig, month, year);
                        return;
                    }
                    case 'Trading': {
                        runTradingBot(processConfig);
                        return;
                    }
                }

            }

        } catch (err) {
            console.log(err.message);
            logger.write(err.message);
        }
    }
}

function runExtractionBot(pProcessConfig, pMonth, pYear) {

    try {
        if (FULL_LOG === true) { logger.write("[INFO] runExtractionBot -> Entering function."); }

        let extractionBotMainLoop = EXTRACTION_BOT_MAIN_LOOP_MODULE.newExtractionBotMainLoop(botConfig);
        extractionBotMainLoop.initialize(global.PLATFORM_CONFIG.bot.path, pProcessConfig, onInitializeReady);

        function onInitializeReady(err) {

            if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                extractionBotMainLoop.run(pMonth, pYear, whenRunFinishes);

                function whenRunFinishes(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        logger.write("[INFO] runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");
                        console.log("Bot execution finished sucessfully. :-)");

                    } else {

                        logger.write("[ERROR] runExtractionBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                        logger.write("[ERROR] runExtractionBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                        logger.write("[ERROR] runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                    }
                }

            } else {
                logger.write("[ERROR] runExtractionBot -> onInitializeReady -> err = " + err.message);
                logger.write("[ERROR] runExtractionBot -> onInitializeReady -> Bot will not be started. ");
            }
        }
    }
    catch (err) {
        logger.write("[ERROR] runExtractionBot -> err = " + err.message);
    }
}

function runIndicatorBot(pProcessConfig, pMonth, pYear) {

    try {
        if (FULL_LOG === true) { logger.write("[INFO] runIndicatorBot -> Entering function."); }

        let indicatorBotMainLoop = INDICATOR_BOT_MAIN_LOOP_MODULE.newIndicatorBotMainLoop(botConfig);
        indicatorBotMainLoop.initialize(global.PLATFORM_CONFIG.bot.path, pProcessConfig, onInitializeReady);

        function onInitializeReady(err) {

            if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                indicatorBotMainLoop.run(pMonth, pYear, whenRunFinishes);

                function whenRunFinishes(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        logger.write("[INFO] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");
                        console.log("Bot execution finished sucessfully. :-)");

                    } else {

                        logger.write("[ERROR] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                        logger.write("[ERROR] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                        logger.write("[ERROR] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                    }
                }

            } else {
                logger.write("[ERROR] runIndicatorBot -> onInitializeReady -> err = " + err.message);
                logger.write("[ERROR] runIndicatorBot -> onInitializeReady -> Bot will not be started. ");
            }
        }
    }
    catch (err) {
        logger.write("[ERROR] runIndicatorBot -> err = " + err.message);
    }
}

function runTradingBot(pProcessConfig) {

    try {
        if (FULL_LOG === true) { logger.write("[INFO] runTradingBot -> Entering function."); }

        let tradingBotMainLoop = TRADING_BOT_MAIN_LOOP_MODULE.newTradingBotMainLoop(botConfig);
        tradingBotMainLoop.initialize(global.PLATFORM_CONFIG.bot.path, pProcessConfig, onInitializeReady);

        function onInitializeReady(err) {

            if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                tradingBotMainLoop.run(whenRunFinishes);

                function whenRunFinishes(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        logger.write("[INFO] runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");
                        console.log("Bot execution finished sucessfully. :-)");

                    } else {

                        logger.write("[ERROR] runTradingBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                        logger.write("[ERROR] runTradingBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                        logger.write("[ERROR] runTradingBot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                    }
                }

            } else {
                logger.write("[ERROR] runTradingBot -> onInitializeReady -> err = " + err.message);
                logger.write("[ERROR] runTradingBot -> onInitializeReady -> Bot will not be started. ");
            }
        }
    }
    catch (err) {
        logger.write("[ERROR] runTradingBot -> err = " + err.message);
    }
}