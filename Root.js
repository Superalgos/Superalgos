

exports.newRoot = function newRoot() {

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

    const ROOT_DIR = './';
    const MODULE_NAME = "Root";

    let thisObject = {
        initialize: initialize,
        start: start
    }

    const FULL_LOG = true;

    let cloudStorage;

    let logDisplace = "AACloud" + "                                    ";
    let UI_COMMANDS;

    return thisObject;

    function initialize(pUI_COMMANDS, callBackFunction) {

        try {
            console.log(logDisplace  + "Root : [INFO] initialize -> Entering function. ");

            UI_COMMANDS = pUI_COMMANDS;

            const BLOB_STORAGE = require(ROOT_DIR + 'BlobStorage');
            cloudStorage = BLOB_STORAGE.newBlobStorage();

            cloudStorage.initialize("AAPlatform", onInizialized, true);

            function onInizialized(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    let filePath = "AdvancedAlgos" + "/" + "AACloud";
                    let fileName = "this.config.json";

                    cloudStorage.getTextFile(filePath, fileName, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            console.log(logDisplace + "Root : [INFO] initialize -> onInizialized -> onFileReceived -> err = " + err.message);
                            return;
                        }

                        try {
                            global.PLATFORM_CONFIG = JSON.parse(text);
                            callBackFunction();
                        } catch (err) {
                            console.log(logDisplace  + "Root : [ERROR] initialize -> onInizialized -> onFileReceived -> err = " + err.message);
                            return;
                        }
                    }

                } else {
                    console.log(logDisplace  + "Root : [ERROR] initialize -> onInizialized ->  err = " + err.message);
                    return;
                }
            }
        }
        catch (err) {
            console.log(logDisplace  + "Root : [ERROR] initialize -> err.message = " + err.message);
            return;
        }
    }

    function start() {

        /* Now we will run according to what we see at the config file. */

        const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');

        /* Small Function to fix numbers into strings in a cool way. */

        function pad(str, max) {
            str = str.toString();
            return str.length < max ? pad("0" + str, max) : str;
        }

        /* Process Loops Declarations. */

        const TRADING_BOT_MAIN_LOOP_MODULE = require('./TradingBotProcessMainLoop');
        const INDICATOR_BOT_MAIN_LOOP_MODULE = require('./IndicatorBotProcessMainLoop');
        const EXTRACTION_BOT_MAIN_LOOP_MODULE = require('./ExtractionBotProcessMainLoop');

        /* Loop through all the processes configured to be run by this Node.js Instance. */

        let logger;

        for (let p = 0; p < global.PLATFORM_CONFIG.executionList.length; p++) {

            let listItem = PLATFORM_CONFIG.executionList[p];

            if (listItem.enabled !== "true") {

                console.log(logDisplace + "Root : [INFO] start -> Skipping process for being disabled.");
                console.log(logDisplace + "Root : [INFO] start -> listItem.process = " + listItem.process);

                continue;
            }

            /* Now we will read the config of the bot from the path we obtained at the AACloud config. */

            let botConfig;

            getBotConfig();

            function getBotConfig() {

                try {
                    console.log(logDisplace + "Root : [INFO] start -> getBotConfig -> Entering function. ");

                    const BLOB_STORAGE = require(ROOT_DIR + 'BlobStorage');
                    let cloudStorage = BLOB_STORAGE.newBlobStorage(listItem);

                    cloudStorage.initialize("AAPlatform", onInizialized, true);

                    function onInizialized(err) {

                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                            let filePath = listItem.devTeam + "/" + listItem.repo;
                            let fileName = "this.bot.config.json";

                            cloudStorage.getTextFile(filePath, fileName, onFileReceived);

                            function onFileReceived(err, text) {

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    console.log(logDisplace  + "Root : [ERROR] start -> getBotConfig -> onInizialized -> onFileReceived -> err = " + err.message);
                                    return;
                                }

                                try {
                                    botConfig = JSON.parse(text);
                                    botConfig.repo = listItem.repo;
                                    findProcess();
                                } catch (err) {
                                    console.log(logDisplace  + "Root : [ERROR] start -> getBotConfig -> onInizialized -> onFileReceived -> err = " + err.message);
                                    return;
                                }
                            }

                        } else {
                            console.log(logDisplace  + "Root : [ERROR] start -> getBotConfig -> onInizialized ->  err = " + err.message);
                            return;
                        }
                    }
                }
                catch (err) {
                    console.log(logDisplace  + "Root : [ERROR] start -> getBotConfig -> err.message = " + err.message);
                    return;
                }
            }

            function findProcess() {

                try {
                    if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> findProcess -> Entering function. "); }

                    botConfig.process = listItem.process;
                    botConfig.debug = {};

                    logger = DEBUG_MODULE.newDebugLog();
                    logger.fileName = MODULE_NAME;
                    logger.bot = botConfig;

                    /* Loop Counter */

                    botConfig.loopCounter = 0;

                    if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> Processing item from executionList -> p = " + p); }
                    if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> listItem.botPath = " + listItem.botPath); }

                    /* File Path Root */

                    botConfig.filePathRoot = botConfig.devTeam + "/" + botConfig.codeName + "." + botConfig.version.major + "." + botConfig.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + botConfig.dataSetVersion;

                    if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> listItem.process = " + listItem.process); }

                    /* Now we loop throug all the configured processes at each bots configuration until we find the one we are supposed to run at this Node.js process. */

                    let processFound = false;

                    for (let i = 0; i < botConfig.processes.length; i++) {

                        if (botConfig.processes[i].name === listItem.process) {

                            processFound = true;
                            if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> Process found at the bot configuration file. -> listItem.process = " + listItem.process); }

                            let processConfig = botConfig.processes[i];

                            try {

                                /* We tesst each type of start Mode to get what to run and how. */

                                if (processConfig.startMode.allMonths !== undefined) {

                                    if (processConfig.startMode.allMonths.run === "true") {

                                        if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> allMonths start mode detected. "); }

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

                                                    if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> startProcess -> Ready to start process."); }

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
                                                            logger.write("[ERROR] start -> findProcess -> startProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                if (processConfig.startMode.oneMonth !== undefined) {

                                    if (processConfig.startMode.oneMonth.run === "true") {

                                        if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> oneMonth start mode detected. "); }

                                        startProcess();

                                        function startProcess() {

                                            if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> startProcess -> Ready to start process."); }

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
                                                    logger.write("[ERROR] start -> findProcess -> startProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
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
                                            default: {
                                                logger.write("[ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
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
                                            default: {
                                                logger.write("[ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                            }
                                        }
                                    }
                                }

                                if (processConfig.startMode.live !== undefined) {

                                    if (processConfig.startMode.live.run === "true") {

                                        botConfig.runMode = "Live";

                                        let month = pad((new Date()).getUTCMonth() + 1, 2);
                                        let year = (new Date()).getUTCFullYear();

                                        if (processConfig.startMode.live.resumeExecution === "true") {
                                            botConfig.hasTheBotJustStarted = false;
                                        } else {
                                            botConfig.hasTheBotJustStarted = true;
                                        }

                                        switch (botConfig.type) {
                                            case 'Trading': {
                                                runTradingBot(botConfig, processConfig);
                                                break;
                                            }
                                            default: {
                                                logger.write("[ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                            }
                                        }
                                    }
                                }

                                if (processConfig.startMode.backtest !== undefined) {

                                    if (processConfig.startMode.backtest.run === "true") {

                                        botConfig.runMode = "Backtest";
                                        botConfig.backtest = processConfig.startMode.backtest;

                                        /* We override these waitTimes to the one specified at the backtest configuration. */

                                        processConfig.normalWaitTime = processConfig.startMode.backtest.waitTime;
                                        processConfig.retryWaitTime = processConfig.startMode.backtest.waitTime;

                                        /* Backtest Mode does not support Resume Execution, so this is the only way. */

                                        botConfig.hasTheBotJustStarted = true;

                                        switch (botConfig.type) {
                                            case 'Trading': {
                                                runTradingBot(botConfig, processConfig);
                                                break;
                                            }
                                            default: {
                                                logger.write("[ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                            }
                                        }
                                    }
                                }

                                if (processConfig.startMode.competition !== undefined) {

                                    if (processConfig.startMode.competition.run === "true") {

                                        botConfig.runMode = "Competition";
                                        botConfig.competition = processConfig.startMode.competition;

                                        if (processConfig.startMode.competition.resumeExecution === "true") {
                                            botConfig.hasTheBotJustStarted = false;
                                        } else {
                                            botConfig.hasTheBotJustStarted = true;
                                        }

                                        switch (botConfig.type) {
                                            case 'Trading': {
                                                runTradingBot(botConfig, processConfig);
                                                break;
                                            }
                                            default: {
                                                logger.write("[ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                            }
                                        }
                                    }
                                }

                            } catch (err) {
                                logger.write("[ERROR] start -> findProcess -> Unexpected exception. -> err.message = " + err.message);
                            }
                        }
                    }

                    if (processFound === false) {

                        logger.write("[ERROR] Process listed at the configuration file of AACloud not found at the configuration file of the bot. -> listItem.process = " + listItem.process);
                    }

                    function runExtractionBot(pBotConfig, pProcessConfig, pMonth, pYear) {

                        try {
                            if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess ->runExtractionBot -> Entering function."); }
                            if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess ->runExtractionBot -> pMonth = " + pMonth); }
                            if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess ->runExtractionBot -> pYear = " + pYear); }

                            let extractionBotMainLoop = EXTRACTION_BOT_MAIN_LOOP_MODULE.newExtractionBotProcessMainLoop(pBotConfig);
                            extractionBotMainLoop.initialize(UI_COMMANDS, pProcessConfig, onInitializeReady);

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

                                            logger.write("[INFO] start -> findProcess -> runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");
                                            logger.write("[INFO] start -> findProcess -> runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(botId + " Bot execution finished sucessfully. :-)");

                                        } else {

                                            logger.write("[ERROR] start -> findProcess -> runExtractionBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write("[ERROR] start -> findProcess -> runExtractionBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write("[ERROR] start -> findProcess -> runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                                            logger.write("[ERROR] start -> findProcess -> runExtractionBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
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
                            if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> runIndicatorBot -> Entering function."); }
                            if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> runIndicatorBot -> pMonth = " + pMonth); }
                            if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> runIndicatorBot -> pYear = " + pYear); }

                            let indicatorBotMainLoop = INDICATOR_BOT_MAIN_LOOP_MODULE.newIndicatorBotProcessMainLoop(pBotConfig);
                            indicatorBotMainLoop.initialize(UI_COMMANDS, pProcessConfig, onInitializeReady);

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

                                            logger.write("[INFO] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");
                                            logger.write("[INFO] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(botId + " Bot execution finished sucessfully. :-)");

                                        } else {

                                            logger.write("[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write("[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write("[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                                            logger.write("[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(botId + " Bot execution finished with errors. Please check the logs. :-(");
                                        }
                                    }

                                } else {
                                    logger.write("[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> err = " + err.message);
                                    logger.write("[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> Bot will not be started. ");
                                }
                            }
                        }
                        catch (err) {
                            logger.write("[ERROR] runIndicatorBot -> err = " + err.message);
                        }
                    }

                    function runTradingBot(pBotConfig, pProcessConfig) {

                        try {
                            if (FULL_LOG === true) { logger.write("[INFO] start -> findProcess -> runTradingBot -> Entering function."); }

                            let tradingBotMainLoop = TRADING_BOT_MAIN_LOOP_MODULE.newTradingBotProcessMainLoop(pBotConfig);
                            tradingBotMainLoop.initialize(UI_COMMANDS, pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    tradingBotMainLoop.run(whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        let botId;

                                        botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write("[INFO] start -> findProcess -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");
                                            logger.write("[INFO] start -> findProcess -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(botId + " Bot execution finished sucessfully. :-)");

                                        } else {

                                            logger.write("[ERROR] start -> findProcess -> runTradingBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write("[ERROR] start -> findProcess -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write("[ERROR] start -> findProcess -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                                            logger.write("[ERROR] start -> findProcess -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(botId + " Bot execution finished with errors. Please check the logs. :-(");
                                        }
                                    }

                                } else {
                                    logger.write("[ERROR] start -> findProcess -> runTradingBot -> onInitializeReady -> err = " + err.message);
                                    logger.write("[ERROR] start -> findProcess -> runTradingBot -> onInitializeReady -> Bot will not be started. ");
                                }
                            }
                        }
                        catch (err) {
                            logger.write("[ERROR] start -> findProcess -> runTradingBot -> err = " + err.message);
                        }
                    }

                }
                catch (err) {
                    logger.write("[ERROR] start -> findProcess -> err.message = " + err.message);
                    return;
                }
            }
        }
    }
}




