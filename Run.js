
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

/* This is the Execution Datetime */

global.EXECUTION_DATETIME = new Date();

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

/* Small Function to fix numbers into strings in a cool way. */

function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

/* Process Loops Declarations. */

const TRADING_BOT_MAIN_LOOP_MODULE = require('./Trading Bot Process Main Loop');
const INDICATOR_BOT_MAIN_LOOP_MODULE = require('./Indicator Bot Process Main Loop');
const EXTRACTION_BOT_MAIN_LOOP_MODULE = require('./Extraction Bot Process Main Loop');

/* Loop through all the processes configured to be run by this Node.js Instance. */

let logger;

for (let p = 0; p < global.PLATFORM_CONFIG.executionList.length; p++) {

    let listItem = PLATFORM_CONFIG.executionList[p];

    if (listItem.enabled !== "true") {

        console.log("[INFO] Skipping process " + listItem.process + " for being disabled. ");
        continue;
    }

    /* Now we will read the config of the bot from the path we obtained at the AACloud config. */

    let botConfig;

    try {

        botConfig = JSON.parse(fs.readFileSync(listItem.botPath + '/this.bot.config.json', 'utf8'));
    }
    catch (err) {
        console.log("[ERROR] 'readConfig' - ERROR : " + err.message);
        return;
    }

    botConfig.process = listItem.process;
    botConfig.debug = {};

    logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = botConfig;

    /* Loop Counter */

    botConfig.loopCounter = 0;

    if (FULL_LOG === true) { logger.write("[INFO] run -> Processing item from executionList -> p = " + p); }
    if (FULL_LOG === true) { logger.write("[INFO] run -> listItem.botPath = " + listItem.botPath); }

    /* File Path Root */

    botConfig.filePathRoot = botConfig.devTeam + "/" + botConfig.codeName + "." + botConfig.version.major + "." + botConfig.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + botConfig.dataSetVersion;

    if (FULL_LOG === true) { logger.write("[INFO] run -> listItem.process = " + listItem.process); }

    /* Now we loop throug all the configured processes at each bots configuration until we find the one we are supposed to run at this Node.js process. */

    let processFound = false;

    for (let i = 0; i < botConfig.processes.length; i++) {

        if (botConfig.processes[i].name === listItem.process) {

            processFound = true;
            if (FULL_LOG === true) { logger.write("[INFO] run -> Process found at the bot configuration file. -> listItem.process = " + listItem.process); }

            let processConfig = botConfig.processes[i];

            try {

                /* We tesst each type of start Mode to get what to run and how. */

                if (processConfig.startMode.allMonths !== undefined) {

                    if (processConfig.startMode.allMonths.run === "true") {

                        if (FULL_LOG === true) { logger.write("[INFO] run -> allMonths start mode detected. "); }

                        for (let year = processConfig.startMode.allMonths.maxYear; year >= processConfig.startMode.allMonths.minYear; year--) {

                            for (let month = 12; month > 0; month--) {

                                botConfig.debug = {
                                    month: pad(month, 2),
                                    year: pad(year, 4)
                                };

                                let padMonth = pad(month, 2)

                                let newInstanceBotConfig = JSON.parse(JSON.stringify(botConfig));

                                let timeDelay = Math.random() * 10 * 1000; // We introduce a short delay so as to not overload the machine.
                                setTimeout(startProcess, timeDelay);

                                function startProcess() {

                                    if (FULL_LOG === true) { logger.write("[INFO] run -> startProcess -> Ready to start process."); }

                                    switch (botConfig.type) {
                                        case 'Extraction': {
                                            runExtractionBot(newInstanceBotConfig, processConfig, padMonth, year);
                                            break;
                                        }
                                        case 'Indicator': {
                                            runIndicatorBot(newInstanceBotConfig, processConfig, padMonth, year);
                                            break;
                                        }
                                        default: {
                                            logger.write("[ERROR] run -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (processConfig.startMode.oneMonth !== undefined) {

                    if (processConfig.startMode.oneMonth.run === "true") {

                        if (FULL_LOG === true) { logger.write("[INFO] run -> oneMonth start mode detected. "); }

                        startProcess();

                        function startProcess() {

                            if (FULL_LOG === true) { logger.write("[INFO] run -> startProcess -> Ready to start process."); }

                            let month = pad(processConfig.startMode.oneMonth.month, 2);
                            let year = processConfig.startMode.oneMonth.year;

                            botConfig.debug = {
                                month: pad(month, 2),
                                year: pad(year, 4)
                            };

                            switch (botConfig.type) {
                                case 'Extraction': {
                                    runExtractionBot(botConfig, processConfig, month, year);
                                    break;
                                }
                                case 'Indicator': {
                                    runIndicatorBot(botConfig, processConfig, month, year);
                                    break;
                                }
                                default: {
                                    logger.write("[ERROR] run -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                }
                            }
                        }
                    }
                }

                if (processConfig.startMode.noTime !== undefined) {

                    if (processConfig.startMode.noTime.run === "true") {

                        let month = pad((new Date()).getUTCMonth() + 1, 2);
                        let year = (new Date()).getUTCFullYear();

                        if (processConfig.startMode.noTime.resumeExecution === "true") {
                            botConfig.hasTheBotJustStarted = false;
                        } else {
                            botConfig.hasTheBotJustStarted = true;
                        }

                        switch (botConfig.type) {
                            case 'Extraction': {
                                runExtractionBot(botConfig, processConfig, month, year);
                                break;
                            }
                            case 'Indicator': {
                                runIndicatorBot(botConfig, processConfig, month, year);
                                break;
                            }
                            case 'Trading': {
                                runTradingBot(botConfig, processConfig);
                                break;
                            }
                        }
                    }
                }

                if (processConfig.startMode.fixedInterval !== undefined) {

                    if (processConfig.startMode.fixedInterval.run === "true") {

                        botConfig.runAtFixedInterval = true;
                        botConfig.fixedInterval = processConfig.startMode.fixedInterval.interval;

                        let month = pad((new Date()).getUTCMonth() + 1, 2);
                        let year = (new Date()).getUTCFullYear();

                        switch (botConfig.type) {
                            case 'Extraction': {
                                runExtractionBot(botConfig, processConfig, month, year);
                                break;
                            }
                        }
                    }
                }

                if (processConfig.startMode.timePeriod !== undefined) {

                    if (processConfig.startMode.timePeriod.run === "true") {

                        botConfig.backTestingMode = true;
                        botConfig.timePeriod = processConfig.startMode.timePeriod;

                        /* We override these waitTimes to the one specified at the timePeriod configuration. */

                        processConfig.normalWaitTime = processConfig.startMode.timePeriod.waitTime;
                        processConfig.retryWaitTime = processConfig.startMode.timePeriod.waitTime;

                        if (processConfig.startMode.timePeriod.resumeExecution === "true") {
                            botConfig.hasTheBotJustStarted = false;
                        } else {
                            botConfig.hasTheBotJustStarted = true;
                        }

                        switch (botConfig.type) {
                            case 'Trading': {
                                runTradingBot(botConfig, processConfig);
                                break;
                            }
                        }
                    }
                }

            } catch (err) {
                logger.write("[ERROR] run -> Unexpected exception. -> err.message = " + err.message);
            }
        }
    }

    if (processFound === false) {

        logger.write("[ERROR] run -> Process listed at the configuration file of AACloud not found at the configuration file of the bot. -> listItem.process = " + listItem.process);
    }

    function runExtractionBot(pBotConfig, pProcessConfig, pMonth, pYear) {

        try {
            if (FULL_LOG === true) { logger.write("[INFO] runExtractionBot -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] runExtractionBot -> pMonth = " + pMonth); }
            if (FULL_LOG === true) { logger.write("[INFO] runExtractionBot -> pYear = " + pYear); }

            let extractionBotMainLoop = EXTRACTION_BOT_MAIN_LOOP_MODULE.newExtractionBotMainLoop(pBotConfig);
            extractionBotMainLoop.initialize(listItem.botPath, pProcessConfig, onInitializeReady);

            function onInitializeReady(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    extractionBotMainLoop.run(pMonth, pYear, whenRunFinishes);

                    function whenRunFinishes(err) {

                        let botId;
                        if (pYear !== undefined) {
                            botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process + "." + pYear + "." + pMonth;
                        } else {
                            botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;
                        }

                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                            logger.write("[INFO] runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");
                            logger.write("[INFO] runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                            console.log(botId + " Bot execution finished sucessfully. :-)");

                        } else {

                            logger.write("[ERROR] runExtractionBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                            logger.write("[ERROR] runExtractionBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                            logger.write("[ERROR] runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                            logger.write("[ERROR] runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                            console.log(botId + " Bot execution finished with errors. Please check the logs. :-(");
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

    function runIndicatorBot(pBotConfig, pProcessConfig, pMonth, pYear) {

        try {
            if (FULL_LOG === true) { logger.write("[INFO] runIndicatorBot -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] runIndicatorBot -> pMonth = " + pMonth); }
            if (FULL_LOG === true) { logger.write("[INFO] runIndicatorBot -> pYear = " + pYear); }

            let indicatorBotMainLoop = INDICATOR_BOT_MAIN_LOOP_MODULE.newIndicatorBotMainLoop(pBotConfig);
            indicatorBotMainLoop.initialize(listItem.botPath, pProcessConfig, onInitializeReady);

            function onInitializeReady(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    indicatorBotMainLoop.run(pMonth, pYear, whenRunFinishes);

                    function whenRunFinishes(err) {

                        let botId;
                        if (pYear !== undefined) {
                            botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process + "." + pYear + "." + pMonth;
                        } else {
                            botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;
                        }

                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                            logger.write("[INFO] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");
                            logger.write("[INFO] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                            console.log(botId + " Bot execution finished sucessfully. :-)");

                        } else {

                            logger.write("[ERROR] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                            logger.write("[ERROR] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                            logger.write("[ERROR] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                            logger.write("[ERROR] runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                            console.log(botId + " Bot execution finished with errors. Please check the logs. :-(");
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

    function runTradingBot(pBotConfig, pProcessConfig) {

        try {
            if (FULL_LOG === true) { logger.write("[INFO] runTradingBot -> Entering function."); }

            let tradingBotMainLoop = TRADING_BOT_MAIN_LOOP_MODULE.newTradingBotMainLoop(pBotConfig);
            tradingBotMainLoop.initialize(listItem.botPath, pProcessConfig, onInitializeReady);

            function onInitializeReady(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    tradingBotMainLoop.run(whenRunFinishes);

                    function whenRunFinishes(err) {

                        let botId;

                        botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;

                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                            logger.write("[INFO] runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");
                            logger.write("[INFO] runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                            console.log(botId + " Bot execution finished sucessfully. :-)");

                        } else {

                            logger.write("[ERROR] runTradingBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                            logger.write("[ERROR] runTradingBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                            logger.write("[ERROR] runTradingBot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                            logger.write("[ERROR] runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                            console.log(botId + " Bot execution finished with errors. Please check the logs. :-(");
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
}







