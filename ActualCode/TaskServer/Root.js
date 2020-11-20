exports.newRoot = function newRoot() {

    /* This is the Execution Datetime */

    global.EXECUTION_DATETIME = new Date();

    /* Time Frames Definitions. */

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

    const MODULE_NAME = "Root";
    const WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START = 10000 // This avoid a race condition that could happen if one process finished before all the other even started.

    let thisObject = {
        initialize: initialize,
        start: start
    }

    const FULL_LOG = true;

    let logDisplace = "Task Server" + "                                              ";

    return thisObject;

    function initialize(callBackFunction) {

        try {

            /* Global control of logging. */

            global.LOG_CONTROL = {
                "Status Report": {
                    logInfo: false,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Dataset": {
                    logInfo: false,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Process Execution Events": {
                    logInfo: false,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Process Output": {
                    logInfo: false,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                }
            };

            callBackFunction();

        }
        catch (err) {
            console.log(logDisplace + "Root : [ERROR] initialize -> err = " + err.stack);
            return;
        }
    }

    function start(processIndex) {

        try {

            /* Now we will run according to what we see at the config file. */

            /* Small Function to fix numbers into strings in a cool way. */

            function pad(str, max) {
                str = str.toString();
                return str.length < max ? pad("0" + str, max) : str;
            }

            /* Process Loops Declarations. */

            const INDICATOR_BOT_MODULE = require('./IndicatorBot');
            const SENSOR_BOT = require('./SensorBot');
            const TRADING_BOT_MODULE = require('./TradingBot');

            let botConfig;
            let processInstance = global.TASK_NODE.bot.processes[processIndex]

            /* Here we will check if we need to load the configuration and code of the bot from a file or we will take that from the UI. */
            if (
                processInstance.referenceParent.config.framework !== undefined &&
                (processInstance.referenceParent.config.framework.name === 'Multi-Period-Market' ||
                    processInstance.referenceParent.config.framework.name === 'Multi-Period-Daily' ||
                    processInstance.referenceParent.config.framework.name === 'Low-Frequency-Trading-Process')
            ) {
                botConfig = processInstance.referenceParent.parentNode.config
                botConfig.definedByUI = true
                bootingBot(processIndex)
                return
            } else {
                getBotConfigFromFile();
                return
            }

            function getBotConfigFromFile() {

                try {

                    const FILE_STORAGE = require('./FileStorage.js');
                    let fileStorage = FILE_STORAGE.newFileStorage();

                    let filePath = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + '/bots/' + processInstance.referenceParent.parentNode.config.repo + '/this.bot.config.json';

                    fileStorage.getTextFile(filePath, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> err = " + JSON.stringify(err));
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> filePath = " + filePath);
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> dataMine = " + global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName);
                            return;
                        }

                        try {
                            botConfig = JSON.parse(text);
                            botConfig.repo = global.TASK_NODE.bot.config.repo;
                            bootingBot(processIndex);
                        } catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> err = " + err.stack);
                            return;
                        }
                    }
                }
                catch (err) {
                    console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> err = " + err.stack);
                    return;
                }
            }

            function bootingBot(processIndex) {

                try {

                    botConfig.process = global.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
                    botConfig.debug = {};
                    botConfig.processNode = global.TASK_NODE.bot.processes[processIndex]

                    /* Logs Mantainance Stuff */
                    botConfig.LOGS_TO_DELETE_QUEUE = []
                    botConfig.DELETE_QUEUE_SIZE = 10 // This number represents how many log files can be at the queue at any point in time, which means how many logs are not still deleted.

                    /* Simplifying the access to basic info */
                    botConfig.dataMine = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName
                    botConfig.mineType = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-')
                    botConfig.project = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.project
                    botConfig.exchange = global.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name
                    botConfig.exchangeNode = global.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode
                    botConfig.market = {
                        baseAsset: global.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName,
                        quotedAsset: global.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                    }
                    botConfig.uiStartDate = global.TASK_NODE.bot.config.startDate
                    botConfig.config = global.TASK_NODE.bot.config

                    /* Loop Counter */
                    botConfig.loopCounter = 0;

                    /* File Path Root */
                    botConfig.filePathRoot = 'Project/' + botConfig.project + "/" + botConfig.mineType + "/" + botConfig.dataMine + "/" + botConfig.codeName + '/' + botConfig.exchange + "/" + botConfig.market.baseAsset + "-" + botConfig.market.quotedAsset

                    /* Process Key */
                    botConfig.processKey = global.TASK_NODE.bot.processes[processIndex].name + '-' + global.TASK_NODE.bot.processes[processIndex].type + '-' + global.TASK_NODE.bot.processes[processIndex].id

                    /* Bot Type */
                    botConfig.type = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.type

                    /* Time Frame Filter */
                    if (global.TASK_NODE.bot.timeFramesFilter !== undefined) {
                        botConfig.dailyTimeFrames = global.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames
                        botConfig.marketTimeFrames = global.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames
                    }

                    if (global.TASK_NODE.keyReference !== undefined) {
                        if (global.TASK_NODE.keyReference.referenceParent !== undefined) {
                            let key = global.TASK_NODE.keyReference.referenceParent

                            botConfig.KEY = key.config.codeName
                            botConfig.SECRET = key.config.secret
                        }
                    }

                    let processConfig = global.TASK_NODE.bot.processes[processIndex].referenceParent.config

                    if (processConfig.framework !== undefined) {
                        if (processConfig.framework.name === "Multi-Period-Daily" || processConfig.framework.name === "Multi-Period-Market" || processConfig.framework.name === "Low-Frequency-Trading-Process") {
                            if (processConfig.framework.startDate !== undefined) {
                                processConfig.framework.startDate.resumeExecution = true;
                                if (processConfig.startMode.noTime !== undefined) {
                                    if (processConfig.startMode.noTime.run === "true") {
                                        if (processConfig.startMode.noTime.beginDatetime !== undefined) {
                                            processConfig.framework.startDate.fixedDate = processConfig.startMode.noTime.beginDatetime;
                                            processConfig.framework.startDate.resumeExecution = true;
                                        }
                                    }
                                }
                            }
                            if (processConfig.startMode !== undefined) {
                                if (processConfig.startMode.userDefined !== undefined) {
                                    if (processConfig.startMode.userDefined.run === "true") {
                                        if (processConfig.startMode.userDefined.beginDatetime !== undefined) {
                                            processConfig.framework.startDate.fixedDate = processConfig.startMode.userDefined.beginDatetime;
                                            processConfig.framework.startDate.resumeExecution = processConfig.startMode.userDefined.resumeExecution;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    try {

                        if (processConfig.startMode === undefined) { // Default 

                            botConfig.hasTheBotJustStarted = true;

                            switch (botConfig.type) {
                                case 'Sensor Bot': {
                                    runSensorBot(botConfig, processConfig);
                                    break;
                                }
                                case 'Indicator Bot': {
                                    runIndicatorBot(botConfig, processConfig);
                                    break;
                                }
                                case 'Trading Bot': {
                                    runTradingBot(botConfig, processConfig);
                                    break;
                                }
                                case 'Learning Bot': {
                                    runLearningBot(botConfig, processConfig);
                                    break;
                                }
                                default: {
                                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                }
                            }
                            return
                        }

                        if (processConfig.startMode.noTime !== undefined) {

                            if (processConfig.startMode.noTime.run === "true") {

                                if (processConfig.startMode.noTime.resumeExecution === true) {
                                    botConfig.hasTheBotJustStarted = false;
                                } else {
                                    botConfig.hasTheBotJustStarted = true;
                                }

                                switch (botConfig.type) {
                                    case 'Sensor Bot': {
                                        runSensorBot(botConfig, processConfig);
                                        break;
                                    }
                                    case 'Indicator Bot': {
                                        runIndicatorBot(botConfig, processConfig);
                                        break;
                                    }
                                    case 'Trading Bot': {
                                        runTradingBot(botConfig, processConfig);
                                        break;
                                    }
                                    case 'Learning Bot': {
                                        runLearningBot(botConfig, processConfig);
                                        break;
                                    }
                                    default: {
                                        console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                    }
                                }
                            }
                        }

                        if (processConfig.startMode.fixedInterval !== undefined) {

                            if (processConfig.startMode.fixedInterval.run === "true") {

                                botConfig.runAtFixedInterval = true;
                                botConfig.fixedInterval = processConfig.startMode.fixedInterval.interval;

                                switch (botConfig.type) {
                                    case 'Sensor Bot': {
                                        runSensorBot(botConfig, processConfig);
                                        break;
                                    }
                                    default: {
                                        console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                    }
                                }
                            }
                        }

                        if (processConfig.startMode.userDefined !== undefined) {

                            if (processConfig.startMode.userDefined.run === "true") {

                                botConfig.startMode = "User Defined";

                                if (processConfig.startMode.userDefined.resumeExecution === true) {
                                    botConfig.hasTheBotJustStarted = false;
                                } else {
                                    botConfig.hasTheBotJustStarted = true;
                                }

                                switch (botConfig.type) {
                                    case 'Trading Bot': {
                                        runTradingBot(botConfig, processConfig);
                                        break;
                                    }
                                    case 'Learning Bot': {
                                        runLearningBot(botConfig, processConfig);
                                        break;
                                    }
                                    default: {
                                        console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                    }
                                }
                            }
                        }

                    } catch (err) {
                        console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> Unexpected exception. -> err = " + err.stack);
                    }


                    function runSensorBot(pBotConfig, pProcessConfig) {

                        try {
                            global.TOTAL_PROCESS_INSTANCES_CREATED++

                            const DEBUG_MODULE = require(global.ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            global.LOGGER_MAP.set('runSensorBot', logger)
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> Entering function."); }

                            let sensorBot = SENSOR_BOT.newSensorBot(pBotConfig, logger);
                            sensorBot.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    sensorBot.run(whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId = pBotConfig.dataMine + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            logger.persist();
                                        } else {
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution was aborted.");
                                            logger.persist();
                                        }
                                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                    }

                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> Bot will not be started. ");
                                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> err = " + err.message);

                                    logger.persist();
                                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                }
                            }
                        }
                        catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runSensorBot -> err = " + err.stack);
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }

                    function runIndicatorBot(pBotConfig, pProcessConfig) {

                        try {
                            global.TOTAL_PROCESS_INSTANCES_CREATED++

                            const DEBUG_MODULE = require(global.ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            global.LOGGER_MAP.set('runIndicatorBot', logger)
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> Entering function."); }

                            let indicatorBot = INDICATOR_BOT_MODULE.newIndicatorBot(pBotConfig, logger);
                            indicatorBot.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    indicatorBot.run(whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId = pBotConfig.dataMine + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            logger.persist();

                                        } else {

                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                            logger.persist();
                                        }
                                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                    }

                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> Failed to initialize the bot. ");
                                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> err = " + err.message);
                                    logger.persist();
                                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                }
                            }
                        }
                        catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runIndicatorBot -> err = " + err.stack);
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }

                    function runTradingBot(pBotConfig, pProcessConfig) {

                        global.TOTAL_PROCESS_INSTANCES_CREATED++

                        try {
                            const DEBUG_MODULE = require(global.ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            global.LOGGER_MAP.set('runTradingBot', logger)
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runTradingBot -> Entering function."); }

                            let tradingBot = TRADING_BOT_MODULE.newTradingBot(pBotConfig, logger);
                            tradingBot.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    tradingBot.run(whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId;

                                        botId = pBotConfig.dataMine + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            logger.persist();

                                        } else {

                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                            logger.persist();
                                        }
                                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                    }

                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> Failed to initialize the bot. ");
                                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> err = " + err.message);
                                    logger.persist();
                                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                }
                            }
                        }
                        catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runTradingBot -> err = " + err.stack);
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }
                    
                    function runLearningBot(pBotConfig, pProcessConfig) {

                        global.TOTAL_PROCESS_INSTANCES_CREATED++

                        try {
                            const DEBUG_MODULE = require(global.ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            global.LOGGER_MAP.set('runLearningBot', logger)
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runLearningBot -> Entering function."); }

                            let learningBot = TRADING_BOT_MODULE.newLearningBot(pBotConfig, logger);
                            learningBot.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    learningBot.run(whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId;

                                        botId = pBotConfig.dataMine + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            logger.persist();

                                        } else {

                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runLearningBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                            logger.persist();
                                        }
                                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                    }

                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runLearningBot -> onInitializeReady -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runLearningBot -> onInitializeReady -> Failed to initialize the bot. ");
                                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runLearningBot -> onInitializeReady -> err = " + err.message);
                                    logger.persist();
                                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                }
                            }
                        }
                        catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runLearningBot -> err = " + err.stack);
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }
                }
                catch (err) {
                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> err = " + err.stack);
                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                }
            }

            function exitProcessInstance() {

                global.ENDED_PROCESSES_COUNTER++
                //console.log("[INFO] Task Server -> " + global.TASK_NODE.name + " -> exitProcessInstance -> Process #" + global.ENDED_PROCESSES_COUNTER + " from " + global.TOTAL_PROCESS_INSTANCES_CREATED + " exiting.");

                if (global.ENDED_PROCESSES_COUNTER === global.TOTAL_PROCESS_INSTANCES_CREATED) {
                    global.EXIT_NODE_PROCESS()
                }
            }
        } catch (err) {
            console.log("[ERROR] Task Server -> " + global.TASK_NODE.name + " -> Root -> Start -> Err = " + err.stack);
        }
    }
}




