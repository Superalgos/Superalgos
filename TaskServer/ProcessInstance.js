exports.newProcessInstance = function newProcessInstance() {

    const MODULE_NAME = "Process Instance";
    const WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START = 10000 // This avoid a race condition that could happen if one process finished before all the other even started.

    let thisObject = {
        start: start
    }

    let logDisplace = "Task Server" + "                                              ";
    return thisObject;

    function start(processIndex) {
        try {
            /* Process Loops Declarations. */

            const INDICATOR_BOT_MODULE = require('./IndicatorBot');
            const SENSOR_BOT = require('./SensorBot');
            const TRADING_BOT_MODULE = require('./TradingBot');

            let processInstance = global.TASK_NODE.bot.processes[processIndex]
            let botConfig = processInstance.referenceParent.parentNode.config


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
                            console.log(logDisplace + "Process Instance : [ERROR] start -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
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
                                console.log(logDisplace + "Process Instance : [ERROR] start -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
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
                                console.log(logDisplace + "Process Instance : [ERROR] start -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
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
                                console.log(logDisplace + "Process Instance : [ERROR] start -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                            }
                        }
                    }
                }

            } catch (err) {
                console.log(logDisplace + "Process Instance : [ERROR] start -> Unexpected exception. -> err = " + err.stack);
            }


            function runSensorBot(pBotConfig, pProcessConfig) {

                try {
                    global.TOTAL_PROCESS_INSTANCES_CREATED++

                    const DEBUG_MODULE = require(global.ROOT_DIR + 'DebugLog');
                    let logger;

                    logger = DEBUG_MODULE.newDebugLog();
                    global.LOGGER_MAP.set('runSensorBot', logger)
                    logger.bot = pBotConfig;

                    let sensorBot = SENSOR_BOT.newSensorBot(pBotConfig, logger);
                    sensorBot.initialize(pProcessConfig, onInitializeReady);

                    function onInitializeReady(err) {

                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                            sensorBot.run(whenRunFinishes);

                            function whenRunFinishes(err) {

                                pBotConfig.loopCounter = 0;

                                let botId = pBotConfig.dataMine + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write(MODULE_NAME, "[INFO] start -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                    logger.write(MODULE_NAME, "[INFO] start -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                    logger.persist();
                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> runSensorBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                    logger.write(MODULE_NAME, "[ERROR] start -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                    logger.write(MODULE_NAME, "[ERROR] start -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                    console.log(logDisplace + "Process Instance : [ERROR] start -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution was aborted.");
                                    logger.persist();
                                }
                                setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                            }

                        } else {
                            logger.write(MODULE_NAME, "[ERROR] start -> runSensorBot -> onInitializeReady -> err = " + err.message);
                            logger.write(MODULE_NAME, "[ERROR] start -> runSensorBot -> onInitializeReady -> Bot will not be started. ");
                            console.log(logDisplace + "Process Instance : [ERROR] start -> runSensorBot -> onInitializeReady -> err = " + err.message);

                            logger.persist();
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }
                }
                catch (err) {
                    console.log(logDisplace + "Process Instance : [ERROR] start -> runSensorBot -> err = " + err.stack);
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

                    let indicatorBot = INDICATOR_BOT_MODULE.newIndicatorBot(pBotConfig, logger);
                    indicatorBot.initialize(pProcessConfig, onInitializeReady);

                    function onInitializeReady(err) {

                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                            indicatorBot.run(whenRunFinishes);

                            function whenRunFinishes(err) {

                                pBotConfig.loopCounter = 0;

                                let botId = pBotConfig.dataMine + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[INFO] start -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                    logger.write(MODULE_NAME, "[INFO] start -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                    logger.persist();

                                } else {

                                    logger.write(MODULE_NAME, "[ERROR] start -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                    logger.write(MODULE_NAME, "[ERROR] start -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                    logger.write(MODULE_NAME, "[ERROR] start -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                    console.log(logDisplace + "Process Instance : [ERROR] start -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                    logger.persist();
                                }
                                setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                            }

                        } else {
                            logger.write(MODULE_NAME, "[ERROR] start -> runIndicatorBot -> onInitializeReady -> err = " + err.message);
                            logger.write(MODULE_NAME, "[ERROR] start -> runIndicatorBot -> onInitializeReady -> Failed to initialize the bot. ");
                            console.log(logDisplace + "Process Instance : [ERROR] start -> runIndicatorBot -> onInitializeReady -> err = " + err.message);
                            logger.persist();
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }
                }
                catch (err) {
                    console.log(logDisplace + "Process Instance : [ERROR] start -> runIndicatorBot -> err = " + err.stack);
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

                                    logger.write(MODULE_NAME, "[INFO] start -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                    logger.write(MODULE_NAME, "[INFO] start -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                    logger.persist();

                                } else {

                                    logger.write(MODULE_NAME, "[ERROR] start -> runTradingBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                    logger.write(MODULE_NAME, "[ERROR] start -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                    logger.write(MODULE_NAME, "[ERROR] start -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                    console.log(logDisplace + "Process Instance : [ERROR] start -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                    logger.persist();
                                }
                                setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                            }

                        } else {
                            logger.write(MODULE_NAME, "[ERROR] start -> runTradingBot -> onInitializeReady -> err = " + err.message);
                            logger.write(MODULE_NAME, "[ERROR] start -> runTradingBot -> onInitializeReady -> Failed to initialize the bot. ");
                            console.log(logDisplace + "Process Instance : [ERROR] start -> runTradingBot -> onInitializeReady -> err = " + err.message);
                            logger.persist();
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }
                }
                catch (err) {
                    console.log(logDisplace + "Process Instance : [ERROR] start -> runTradingBot -> err = " + err.stack);
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

                                    logger.write(MODULE_NAME, "[INFO] start -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                    logger.write(MODULE_NAME, "[INFO] start -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                    logger.persist();

                                } else {

                                    logger.write(MODULE_NAME, "[ERROR] start -> runLearningBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                    logger.write(MODULE_NAME, "[ERROR] start -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                    logger.write(MODULE_NAME, "[ERROR] start -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                    console.log(logDisplace + "Process Instance : [ERROR] start -> runLearningBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                    logger.persist();
                                }
                                setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                            }

                        } else {
                            logger.write(MODULE_NAME, "[ERROR] start -> runLearningBot -> onInitializeReady -> err = " + err.message);
                            logger.write(MODULE_NAME, "[ERROR] start -> runLearningBot -> onInitializeReady -> Failed to initialize the bot. ");
                            console.log(logDisplace + "Process Instance : [ERROR] start -> runLearningBot -> onInitializeReady -> err = " + err.message);
                            logger.persist();
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }
                }
                catch (err) {
                    console.log(logDisplace + "Process Instance : [ERROR] start -> runLearningBot -> err = " + err.stack);
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
            console.log("[ERROR] Task Server -> " + global.TASK_NODE.name + " -> Process Instance -> Start -> Err = " + err.stack);
        }
    }
}




