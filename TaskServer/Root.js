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

    const ROOT_DIR = './';
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
                "Dataset": {
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
                },
                "Process Execution Events": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Process Output": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                }
            };

            callBackFunction();

        }
        catch (err) {
            console.log(logDisplace  + "Root : [ERROR] initialize -> err = " + err.stack);
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

            const INDICATOR_BOT_MAIN_LOOP_MODULE = require('./IndicatorBotProcessMainLoop');
            const SENSOR_BOT_MAIN_LOOP_MODULE = require('./SensorBotProcessMainLoop');
            const TRADING_ENGINE_MAIN_LOOP_MODULE = require('./TradingBotProcessMainLoop');

            let botConfig;
            let processInstance = global.TASK_NODE.bot.processes[processIndex]

            /* Here we will check if we need to load the configuration and code of the bot from a file or we will take that from the UI. */
            if (
                processInstance.referenceParent.code.framework !== undefined &&
                (   processInstance.referenceParent.code.framework.name === 'Multi-Period-Market' ||
                    processInstance.referenceParent.code.framework.name === 'Multi-Period-Daily' ||
                    processInstance.referenceParent.code.framework.name === 'Multi-Period')
                ) {
                botConfig = processInstance.referenceParent.parentNode.code
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

                    let filePath = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.code.codeName + '/bots/' + global.TASK_NODE.bot.code.repo + '/this.bot.config.json';

                    fileStorage.getTextFile(filePath, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> err = " + JSON.stringify(err));
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> filePath = " + filePath);
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> dataMine = " + global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.code.codeName);
                            return;
                        }

                        try {
                            botConfig = JSON.parse(text);
                            botConfig.repo = global.TASK_NODE.bot.code.repo;
                            bootingBot(processIndex);
                        } catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> err = " + JSON.stringify(err));
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

                    botConfig.process = global.TASK_NODE.bot.processes[processIndex].referenceParent.code.codeName
                    botConfig.debug = {};
                    botConfig.processNode = global.TASK_NODE.bot.processes[processIndex]

                    /* Logs Mantainance Stuff */
                    botConfig.LOGS_TO_DELETE_QUEUE = []
                    botConfig.DELETE_QUEUE_SIZE = 10 // This number represents how many log files can be at the queue at any point in time, which means how many logs are not still deleted.

                    /* Simplifying the access to basic info */
                    botConfig.dataMine = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.code.codeName
                    botConfig.exchange = global.TASK_NODE.bot.processes[processIndex].marketReference.referenceParent.parentNode.parentNode.code.codeName
                    botConfig.exchangeNode = global.TASK_NODE.bot.processes[processIndex].marketReference.referenceParent.parentNode.parentNode
                    botConfig.market = {
                        baseAsset: global.TASK_NODE.bot.processes[processIndex].marketReference.referenceParent.baseAsset.referenceParent.code.codeName,
                        quotedAsset: global.TASK_NODE.bot.processes[processIndex].marketReference.referenceParent.quotedAsset.referenceParent.code.codeName
                    }
                    botConfig.uiStartDate = global.TASK_NODE.bot.code.startDate

                    /* This stuff is still hardcoded and unresolved. */
                    botConfig.version = {
                        "major": 1,
                        "minor": 0
                    }
                    botConfig.dataSetVersion = "dataSet.V1"

                    /* Loop Counter */
                    botConfig.loopCounter = 0;                   

                    /* File Path Root */
                    botConfig.filePathRoot = botConfig.dataMine + "/" + botConfig.codeName + "/" + botConfig.exchange;

                    /* Process Key */
                    botConfig.processKey = global.TASK_NODE.bot.processes[processIndex].name + '-' + global.TASK_NODE.bot.processes[processIndex].type + '-' + global.TASK_NODE.bot.processes[processIndex].id

                    /* Bot Type */
                    botConfig.type = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.type

                    /* Setting the Key to use */
                    process.env.KEY = undefined
                    process.env.SECRET = undefined

                    if (botConfig.processNode) {
                        if (botConfig.processNode.marketReference) {
                            if (botConfig.processNode.marketReference.keyInstance !== undefined) {
                                if (botConfig.processNode.marketReference.keyInstance.referenceParent !== undefined) {
                                    let key = botConfig.processNode.marketReference.keyInstance.referenceParent

                                    process.env.KEY = key.code.codeName
                                    process.env.SECRET = key.code.secret
                                }
                            }
                        }
                    }

                    let processConfig = global.TASK_NODE.bot.processes[processIndex].referenceParent.code

                    if (processConfig.framework !== undefined) {
                        if (processConfig.framework.name === "Multi-Period-Daily" || processConfig.framework.name === "Multi-Period-Market" || processConfig.framework.name === "Multi-Period") {
                            processConfig.framework.startDate.resumeExecution = true;
                            if (processConfig.startMode.noTime !== undefined) {
                                if (processConfig.startMode.noTime.run === "true") {
                                    if (processConfig.startMode.noTime.beginDatetime !== undefined) {
                                        processConfig.framework.startDate.fixedDate = processConfig.startMode.noTime.beginDatetime;
                                        processConfig.framework.startDate.resumeExecution = true;
                                    }
                                }
                            }
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

                    try {

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

                            const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> Entering function."); }

                            let extractionBotMainLoop = SENSOR_BOT_MAIN_LOOP_MODULE.newSensorBotProcessMainLoop(pBotConfig, logger);
                            extractionBotMainLoop.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    extractionBotMainLoop.run(whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId = pBotConfig.dataMine + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
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

                            const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> Entering function."); }

                            let indicatorBotMainLoop = INDICATOR_BOT_MAIN_LOOP_MODULE.newIndicatorBotProcessMainLoop(pBotConfig, logger);
                            indicatorBotMainLoop.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    indicatorBotMainLoop.run(whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId = pBotConfig.dataMine + "." + pBotConfig.codeName + "." + pBotConfig.process;
                                     
                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);


                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
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
                            const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runTradingBot -> Entering function."); }

                            let tradingBotMainLoop = TRADING_ENGINE_MAIN_LOOP_MODULE.newTradingBotProcessMainLoop(pBotConfig, logger);
                            tradingBotMainLoop.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    tradingBotMainLoop.run(whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId;

                                        botId = pBotConfig.dataMine + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
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
                }
                catch (err) {
                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> err = " + err.stack);
                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                }
            }

            function exitProcessInstance() {

                global.ENDED_PROCESSES_COUNTER++
                console.log("[INFO] Task Server -> " + global.TASK_NODE.name + " -> exitProcessInstance -> Process #" + global.ENDED_PROCESSES_COUNTER + " from " + global.TOTAL_PROCESS_INSTANCES_CREATED + " exiting.");

                if (global.ENDED_PROCESSES_COUNTER === global.TOTAL_PROCESS_INSTANCES_CREATED) {
                    global.EXIT_NODE_PROCESS()
                }
            }
        } catch (err) {
            console.log("[ERROR] Task Server -> " + global.TASK_NODE.name + " -> Root -> Start -> Err = " + err.stack);
        }
    }
}




