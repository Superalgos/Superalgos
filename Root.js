exports.newRoot = function newRoot() {

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

    let logDisplace = "CloneExecutor" + "                                              ";
    let UI_COMMANDS;

    return thisObject;

    function initialize(pUI_COMMANDS, callBackFunction) {

        try {
            console.log(logDisplace  + "Root : [INFO] initialize -> Entering function. ");

            /* Global control of logging. */

            global.LOG_CONTROL = {
                "Assistant": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Exchange API": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Status Report": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Data Set": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Context": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                }
            };

            UI_COMMANDS = pUI_COMMANDS;

            callBackFunction();

        }
        catch (err) {
            console.log(logDisplace  + "Root : [ERROR] initialize -> err.message = " + err.message);
            return;
        }
    }

    function start(callback) {

        /* Now we will run according to what we see at the config file. */

        /* Small Function to fix numbers into strings in a cool way. */

        function pad(str, max) {
            str = str.toString();
            return str.length < max ? pad("0" + str, max) : str;
        }

        /* Process Loops Declarations. */

        const TRADING_BOT_MAIN_LOOP_MODULE = require('./TradingBotProcessMainLoop');
        const INDICATOR_BOT_MAIN_LOOP_MODULE = require('./IndicatorBotProcessMainLoop');
        const EXTRACTION_BOT_MAIN_LOOP_MODULE = require('./SensorBotProcessMainLoop');
        const TRADING_ENGINE_MAIN_LOOP_MODULE = require('./TradingEngineProcessMainLoop');

        /* Loop through all the processes configured to be run by this Node.js Instance. */

        let cloneToExecute  = global.EXECUTION_CONFIG.cloneToExecute;

        /* Now we will read the config of the bot from the path we obtained at the CloneExecutor config. */

        let botConfig;

        getBotConfig();

        function getBotConfig() {

            try {
                console.log(logDisplace + "Root : [INFO] start -> getBotConfig -> Entering function. ");

                const FILE_STORAGE = require('./Integrations/FileStorage.js');
                let fileStorage = FILE_STORAGE.newFileStorage();

                let filePath = global.DEV_TEAM + '/bots/' + global.CURRENT_BOT_REPO + '/this.bot.config.json';

                fileStorage.getTextFile(global.DEV_TEAM, filePath, onFileReceived);

                function onFileReceived(err, text) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        console.log(logDisplace + "Root : [ERROR] start -> getBotConfig -> onInizialized -> onFileReceived -> err = " + JSON.stringify(err));

                        return;
                    }

                    try {
                        botConfig = JSON.parse(text);
                        botConfig.repo = cloneToExecute.repo;
                        findProcess();
                    } catch (err) {
                        console.log(logDisplace + "Root : [ERROR] start -> getBotConfig -> onInizialized -> onFileReceived -> err = " + JSON.stringify(err));
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

                botConfig.process = cloneToExecute.process;
                botConfig.debug = {};

                /* Loop Counter */

                botConfig.loopCounter = 0;

                /* File Path Root */

                botConfig.filePathRoot = botConfig.devTeam + "/" + botConfig.codeName + "." + botConfig.version.major + "." + botConfig.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + botConfig.dataSetVersion;

                if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> findProcess -> filePathRoot = " + botConfig.filePathRoot); }

                /* Now we loop throug all the configured processes at each bots configuration until we find the one we are supposed to run at this Node.js process. */

                let processFound = false;

                for (let i = 0; i < botConfig.processes.length; i++) {

                    if (botConfig.processes[i].name === cloneToExecute.process) {

                        processFound = true;
                        if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> findProcess -> Process found at the bot configuration file. -> cloneToExecute.process = " + cloneToExecute.process); }

                        let processConfig = botConfig.processes[i];

                        processConfig.startMode = global.EXECUTION_CONFIG.startMode // Override file storage configuration
                        if(global.EXECUTION_CONFIG.timePeriod){
                            processConfig.timePeriod = global.EXECUTION_CONFIG.timePeriod
                        }

                        // TODO Pending. Move this if inside IndicatorBotProcessMainLoop line 270
                        if (processConfig.framework !== undefined) {
                            if (processConfig.framework.name === "Multi-Period-Daily" || processConfig.framework.name === "Multi-Period-Market") {
                                processConfig.framework.startDate.resumeExecution = false;
                                if (processConfig.startMode.noTime !== undefined) {
                                    if (processConfig.startMode.noTime.beginDatetime !== undefined) {
                                        processConfig.framework.startDate.fixedDate = processConfig.startMode.noTime.beginDatetime;
                                        processConfig.framework.startDate.resumeExecution = false;
                                    }
                                }
                                if (processConfig.startMode.live !== undefined) {
                                    if (processConfig.startMode.live.beginDatetime !== undefined) {
                                        processConfig.framework.startDate.fixedDate = processConfig.startMode.live.beginDatetime;
                                        processConfig.framework.startDate.resumeExecution = false;
                                    }
                                }
                            }
                        }

                        try {

                            /* We test each type of start Mode to get what to run and how. */

                            if (processConfig.startMode.allMonths !== undefined) {

                                if (processConfig.startMode.allMonths.run === "true") {

                                    if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> findProcess -> allMonths start mode detected. "); }

                                    for (let year = processConfig.startMode.allMonths.maxYear; year >= processConfig.startMode.allMonths.minYear; year--) {

                                        for (let month = 12; month > 0; month--) {

                                            let padMonth = pad(month, 2)

                                            let newInstanceBotConfig = JSON.parse(JSON.stringify(botConfig));

                                            newInstanceBotConfig.debug = {
                                                month: pad(month, 2),
                                                year: pad(year, 4)
                                            };

                                            let timeDelay = Math.random() * 10 * 1000; // We introduce a short delay so as to not overload the machine.
                                            setTimeout(startProcess, timeDelay);

                                            function startProcess() {

                                                if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> findProcess -> startProcess -> Ready to start process."); }

                                                switch (botConfig.type) {
                                                    case 'Sensor': {
                                                        runSensorBot(newInstanceBotConfig, processConfig, padMonth, year);
                                                        break;
                                                    }
                                                    case 'Indicator': {
                                                        runIndicatorBot(newInstanceBotConfig, processConfig, padMonth, year);
                                                        break;
                                                    }
                                                    default: {
                                                        console.log(logDisplace + "Root : [ERROR] start -> findProcess -> startProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            if (processConfig.startMode.oneMonth !== undefined) {

                                if (processConfig.startMode.oneMonth.run === "true") {

                                    if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> findProcess -> oneMonth start mode detected. "); }

                                    startProcess();

                                    function startProcess() {

                                        if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> findProcess -> startProcess -> Ready to start process."); }

                                        let month = pad(processConfig.startMode.oneMonth.month, 2);
                                        let year = processConfig.startMode.oneMonth.year;

                                        botConfig.debug = {
                                            month: pad(month, 2),
                                            year: pad(year, 4)
                                        };

                                        switch (botConfig.type) {
                                            case 'Sensor': {
                                                runSensorBot(botConfig, processConfig, month, year);
                                                break;
                                            }
                                            case 'Indicator': {
                                                runIndicatorBot(botConfig, processConfig, month, year);
                                                break;
                                            }
                                            default: {
                                                console.log(logDisplace + "Root : [ERROR] start -> findProcess -> startProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
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
                                        case 'Sensor': {
                                            runSensorBot(botConfig, processConfig, month, year);
                                            break;
                                        }
                                        case 'Indicator': {
                                            runIndicatorBot(botConfig, processConfig, month, year);
                                            break;
                                        }
                                        case 'Trading-Engine': {
                                            runTradingEngine(botConfig, processConfig);
                                            break;
                                        }
                                        default: {
                                            console.log(logDisplace + "Root : [ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
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
                                        case 'Sensor': {
                                            runSensorBot(botConfig, processConfig, month, year);
                                            break;
                                        }
                                        default: {
                                            console.log(logDisplace + "Root : [ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                        }
                                    }
                                }
                            }

                            if (processConfig.startMode.live !== undefined) {

                                if (processConfig.startMode.live.run === "true") {

                                    botConfig.startMode = "Live";
                                    console.log(logDisplace + "Root : [INFO] start -> findProcess -> Process found at the bot configuration file. -> Start Mode = " + botConfig.startMode);

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
                                        case 'Trading-Engine': {
                                            runTradingEngine(botConfig, processConfig);
                                            break;
                                        }
                                        default: {
                                            console.log(logDisplace + "Root : [ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                        }
                                    }
                                }
                            }

                            if (processConfig.startMode.backtest !== undefined) {

                                if (processConfig.startMode.backtest.run === "true") {

                                    botConfig.startMode = "Backtest";
                                    console.log(logDisplace + "Root : [INFO] start -> findProcess -> Process found at the bot configuration file. -> Start Mode = " + botConfig.startMode);

                                    botConfig.backtest = processConfig.startMode.backtest

                                    /* Backtest Mode does not support Resume Execution, so this is the only way. */

                                    botConfig.hasTheBotJustStarted = true;

                                    switch (botConfig.type) {
                                        case 'Trading': {
                                            runTradingBot(botConfig, processConfig);
                                            break;
                                        }
                                        default: {
                                            console.log(logDisplace + "Root : [ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                        }
                                    }
                                }
                            }

                            if (processConfig.startMode.competition !== undefined) {

                                if (processConfig.startMode.competition.run === "true") {

                                    botConfig.startMode = "Competition";
                                    console.log(logDisplace + "Root : [INFO] start -> findProcess -> Process found at the bot configuration file. -> Start Mode = " + botConfig.startMode);

                                    botConfig.competition = processConfig.startMode.competition;

                                    if (processConfig.startMode.competition.resumeExecution === "false") {
                                        botConfig.hasTheBotJustStarted = true;
                                    } else {
                                        botConfig.hasTheBotJustStarted = false;
                                    }

                                    switch (botConfig.type) {
                                        case 'Trading': {
                                            runTradingBot(botConfig, processConfig);
                                            break;
                                        }
                                        default: {
                                            console.log(logDisplace + "Root : [ERROR] start -> findProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                        }
                                    }
                                }
                            }

                        } catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> findProcess -> Unexpected exception. -> err.message = " + err.message);
                        }
                    }
                }

                if (processFound === false) {

                    console.log(logDisplace + "Root : [ERROR] start -> findProcess -> Process listed at the configuration file of CloneExecutor not found at the configuration file of the bot.");
                    console.log(logDisplace + "Root : [ERROR] start -> findProcess -> cloneToExecute.process = " + cloneToExecute.process);

                }

                function runSensorBot(pBotConfig, pProcessConfig, pMonth, pYear) {

                    try {

                        const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                        let logger;

                        logger = DEBUG_MODULE.newDebugLog();
                        logger.bot = pBotConfig;

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runSensorBot -> Entering function."); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runSensorBot -> pMonth = " + pMonth); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runSensorBot -> pYear = " + pYear); }

                        let extractionBotMainLoop = EXTRACTION_BOT_MAIN_LOOP_MODULE.newSensorBotProcessMainLoop(pBotConfig, logger);
                        extractionBotMainLoop.initialize(UI_COMMANDS, pProcessConfig, onInitializeReady);

                        function onInitializeReady(err) {

                            if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                extractionBotMainLoop.run(pMonth, pYear, whenRunFinishes);

                                function whenRunFinishes(err) {

                                    pBotConfig.loopCounter = 0;

                                    let botId;
                                    if (pYear !== undefined) {
                                        botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process + "." + pYear + "." + pMonth;
                                    } else {
                                        botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;
                                    }

                                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                        logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                        logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                        console.log(logDisplace + "Root : [INFO] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                        console.log(logDisplace + "Root : [INFO] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");

                                        logger.persist();

                                    } else {

                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> err = "+ err);
                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                        console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                        console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution was aborted.");
                                        logger.persist();
                                    }
                                    callback(err, pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process)
                                }

                            } else {
                                logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runSensorBot -> onInitializeReady -> err = "+ err);
                                logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runSensorBot -> onInitializeReady -> Bot will not be started. ");
                                console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runSensorBot -> onInitializeReady -> err = "+ err);

                                logger.persist();
                            }
                        }
                    }
                    catch (err) {
                        console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runSensorBot -> err = "+ err);
                    }
                }

                function runIndicatorBot(pBotConfig, pProcessConfig, pMonth, pYear) {

                    try {
                        const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                        let logger;

                        logger = DEBUG_MODULE.newDebugLog();
                        logger.bot = pBotConfig;

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runIndicatorBot -> Entering function."); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runIndicatorBot -> pMonth = " + pMonth); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runIndicatorBot -> pYear = " + pYear); }

                        let indicatorBotMainLoop = INDICATOR_BOT_MAIN_LOOP_MODULE.newIndicatorBotProcessMainLoop(pBotConfig, logger);
                        indicatorBotMainLoop.initialize(UI_COMMANDS, pProcessConfig, onInitializeReady);

                        function onInitializeReady(err) {

                            if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                indicatorBotMainLoop.run(pMonth, pYear, whenRunFinishes);

                                function whenRunFinishes(err) {

                                    pBotConfig.loopCounter = 0;

                                    let botId;
                                    if (pYear !== undefined) {
                                        botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process + "." + pYear + "." + pMonth;
                                    } else {
                                        botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;
                                    }

                                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                        logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                        logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                        console.log(logDisplace + "Root : [INFO] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                        console.log(logDisplace + "Root : [INFO] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");

                                        logger.persist();

                                    } else {

                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> err = "+ err);
                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                        console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                        logger.persist();
                                    }
                                    callback(err, pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process)
                                }

                            } else {
                                logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> err = "+ err);
                                logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> Failed to initialize the bot. ");
                                console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runIndicatorBot -> onInitializeReady -> err = "+ err);
                                logger.persist();
                            }
                        }
                    }
                    catch (err) {
                        console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runIndicatorBot -> err = "+ err);

                    }
                }

                function runTradingBot(pBotConfig, pProcessConfig) {

                    try {

                        if (FULL_LOG === true) { console.log(logDisplace + "[INFO] start -> findProcess -> runTradingBot -> Entering function."); }

                        if (pBotConfig.genes !== undefined) {

                            /* Here, based on the gene we will create one instance for each combination of genes */

                            let valueMatrix = [];

                            for (let i = 0; i < pBotConfig.genes.length; i++) {

                                let gene = pBotConfig.genes[i];

                                let possibleValues = [];

                                for (let j = gene.lowerLimit; j <= gene.upperLimit; j++) {

                                    possibleValues.push(j);

                                }

                                valueMatrix.push(possibleValues);

                            }

                            /*
                            Now we have all the possible genes values in a multi-dimensional matrix.
                            We will go thorugh each of the elements of each dimension and get each combination possible with the other dimmensions.
                            */

                            let combinations = [];
                            let combination = [];
                            let dimensionIndex = 0;

                            calculateCombinations(dimensionIndex, combination);

                            function calculateCombinations(pDimensionIndex, pCombination) {

                                let dimension = valueMatrix[pDimensionIndex];

                                for (let j = 0; j < dimension.length; j++) {

                                    let copy = JSON.parse(JSON.stringify(pCombination));

                                    let value = dimension[j];
                                    copy.push(value);

                                    if (pDimensionIndex < valueMatrix.length - 1) {

                                        calculateCombinations(pDimensionIndex + 1, copy);

                                    } else {

                                        combinations.push(copy);

                                    }
                                }
                            }

                            /* At this point we have an array with all the possible combinations, we just need to create an instance for each one and set the genes according to that. */

                            for (let i = 0; i < combinations.length; i++) {

                                let botConfig = JSON.parse(JSON.stringify(pBotConfig));
                                let combination = combinations[i];
                                let genes = {};
                                let clonKey = "";

                                for (let j = 0; j < botConfig.genes.length; j++) {

                                    genes[botConfig.genes[j].name] = combination[j];
                                    clonKey = clonKey + "." + combination[j];

                                }

                                let clonName = botConfig.codeName + "-" + "Clon" + clonKey;
                                clonName += ".1.0";
                                clonName += "-" + process.env.CLONE_ID;

                                botConfig.filePathRoot = botConfig.devTeam + "/" + clonName + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + botConfig.dataSetVersion;

                                botConfig.instance = clonName;
                                botConfig.instanceIndex = i;

                                setTimeout(execute, i * Math.random() * 10 * 1000);

                                function execute() {

                                    createBotInstance(genes, combinations.length, botConfig);

                                }
                            }
                        } else {

                            /* If the bot does not have any genes at all */

                            let genes = {};
                            let clonName = botConfig.codeName;
                            clonName += "-" + process.env.CLONE_ID;
                            clonName += ".1.0";

                            botConfig.filePathRoot = botConfig.devTeam + "/" + clonName + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + botConfig.dataSetVersion;

                            pBotConfig.instance = clonName;
                            pBotConfig.instanceIndex = 0;

                            createBotInstance(genes, 1, pBotConfig);

                        }


                        function createBotInstance(pGenes, pTotalInstances, pBotConfig) {

                            const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            logger.bot = pBotConfig;
                            pBotConfig.timePeriodFileStorage = global.EXECUTION_CONFIG.timePeriodFileStorage
                            pBotConfig.dataSet = global.EXECUTION_CONFIG.dataSet

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runTradingBot -> createBotInstance -> Entering function."); }

                            let tradingBotMainLoop = TRADING_BOT_MAIN_LOOP_MODULE.newTradingBotProcessMainLoop(pBotConfig, logger);
                            tradingBotMainLoop.initialize(UI_COMMANDS, pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    tradingBotMainLoop.run(pGenes, whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId;

                                        botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.instance + "." + pBotConfig.process;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            console.log(logDisplace + "Root : [INFO] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                            console.log(logDisplace + "Root : [INFO] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.persist();

                                        } else {

                                            logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> whenStartFinishes -> err = "+ err);
                                            logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> whenStartFinishes -> Bye.");
                                            logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                            logger.persist();
                                        }
                                        callback(err, pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process)
                                    }

                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> err = "+ err);
                                    logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> Bot will not be started. ");
                                    console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runTradingBot -> createBotInstance -> onInitializeReady -> err = "+ err);

                                    logger.persist();
                                }
                            }
                        }
                    }
                    catch (err) {
                        console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runTradingBot -> err = "+ err);
                    }
                }

                function runTradingEngine(pBotConfig, pProcessConfig) {

                    try {
                        const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                        let logger;

                        logger = DEBUG_MODULE.newDebugLog();
                        logger.bot = pBotConfig;

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runTradingEngine -> Entering function."); }

                        let tradingEngineMainLoop = TRADING_ENGINE_MAIN_LOOP_MODULE.newTradingEngineProcessMainLoop(pBotConfig, logger);
                        tradingEngineMainLoop.initialize(UI_COMMANDS, pProcessConfig, onInitializeReady);

                        function onInitializeReady(err) {

                            if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                tradingEngineMainLoop.run(whenRunFinishes);

                                function whenRunFinishes(err) {

                                    pBotConfig.loopCounter = 0;

                                    let botId;

                                    botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                        logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runTradingEngine -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                        logger.write(MODULE_NAME, "[INFO] start -> findProcess -> runTradingEngine -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                        console.log(logDisplace + "Root : [INFO] start -> findProcess -> runTradingEngine -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                        console.log(logDisplace + "Root : [INFO] start -> findProcess -> runTradingEngine -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");

                                        logger.persist();

                                    } else {

                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingEngine -> onInitializeReady -> whenStartFinishes -> err = ", err);
                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingEngine -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingEngine -> onInitializeReady -> whenStartFinishes -> Bye.");
                                        logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingEngine -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                        console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runTradingEngine -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                        logger.persist();
                                    }
                                }

                            } else {
                                logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingEngine -> onInitializeReady -> err = ", err);
                                logger.write(MODULE_NAME, "[ERROR] start -> findProcess -> runTradingEngine -> onInitializeReady -> Failed to initialize the bot. ");
                                console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runTradingEngine -> onInitializeReady -> err = ", err);
                                logger.persist();
                            }
                        }
                    }
                    catch (err) {
                        console.log(logDisplace + "Root : [ERROR] start -> findProcess -> runTradingEngine -> err = ", err);

                    }
                }

            }
            catch (err) {
                console.log(logDisplace + "Root : [ERROR] start -> findProcess -> err.message = " + err.message);
                return;
            }
        }

    }
}




