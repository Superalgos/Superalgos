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
            const DEBUG_MODULE = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + 'DebugLog');

            let botInstance

            let botConfig = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config
            let processConfig = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config

            /*
            We will use a logger for what happens before and after the bot main loop. We will add the process
            id to its key so that it is unique and it can later be finalized.
            */
            let logger = DEBUG_MODULE.newDebugLog()
            TS.projects.superalgos.globals.taskVariables.LOGGER_MAP.set('Pre-Bot-Main-Loop' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].id, logger)
            logger.bot = botConfig;

            botConfig.process = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
            botConfig.debug = {};
            botConfig.processNode = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex] 

            /* Logs Mantainance Stuff */
            botConfig.LOGS_TO_DELETE_QUEUE = []
            botConfig.DELETE_QUEUE_SIZE = 10 // This number represents how many log files can be at the queue at any point in time, which means how many logs are not still deleted.

            /* Simplifying the access to basic info */
            botConfig.dataMine = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName
            botConfig.mineType = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-')
            botConfig.project = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.project
            botConfig.exchange = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name
            botConfig.exchangeNode = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode
            botConfig.market = {
                baseAsset: TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName,
                quotedAsset: TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            }
            botConfig.uiStartDate = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.config.startDate
            botConfig.config = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.config

            /* Loop Counter */
            botConfig.loopCounter = 0;

            /* File Path Root */
            botConfig.filePathRoot = 'Project/' + botConfig.project + "/" + botConfig.mineType + "/" + botConfig.dataMine + "/" + botConfig.codeName + '/' + botConfig.exchange + "/" + botConfig.market.baseAsset + "-" + botConfig.market.quotedAsset

            /* Process Key */
            botConfig.processKey = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].name + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].type + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].id

            /* Bot Type */
            botConfig.type = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.type

            /* Time Frame Filter */
            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                botConfig.dailyTimeFrames = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames
                botConfig.marketTimeFrames = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames
            }

            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.keyReference !== undefined) {
                if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.keyReference.referenceParent !== undefined) {
                    let key = TS.projects.superalgos.globals.taskConstants.TASK_NODE.keyReference.referenceParent

                    botConfig.KEY = key.config.codeName
                    botConfig.SECRET = key.config.secret
                }
            }

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

            if (processConfig.startMode === undefined) { // Default 

                botConfig.hasTheBotJustStarted = true;

                switch (botConfig.type) {
                    case 'Sensor Bot': {
                        runSensorBot()
                        break;
                    }
                    case 'Indicator Bot': {
                        runIndicatorBot()
                        break;
                    }
                    case 'Trading Bot': {
                        runTradingBot()
                        break;
                    }
                    case 'Learning Bot': {
                        runLearningBot()
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
                            runSensorBot()
                            break;
                        }
                        case 'Indicator Bot': {
                            runIndicatorBot()
                            break;
                        }
                        case 'Trading Bot': {
                            runTradingBot()
                            break;
                        }
                        case 'Learning Bot': {
                            runLearningBot()
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
                            runSensorBot()
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
                            runTradingBot(processConfig);
                            break;
                        }
                        case 'Learning Bot': {
                            runLearningBot(processConfig);
                            break;
                        }
                        default: {
                            console.log(logDisplace + "Process Instance : [ERROR] start -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                        }
                    }
                }
            }

            function runSensorBot() {
                try {
                    TS.projects.superalgos.globals.processVariables.TOTAL_PROCESS_INSTANCES_CREATED++

                    botInstance = SENSOR_BOT.newSensorBot(processIndex, botConfig, logger);
                    botInstance.initialize(processConfig, onInitializeReady);
                }
                catch (err) {
                    console.log(logDisplace + "Process Instance : [ERROR] start -> err = " + err.stack);
                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                }
            }

            function runIndicatorBot() {
                try {
                    TS.projects.superalgos.globals.processVariables.TOTAL_PROCESS_INSTANCES_CREATED++

                    botInstance = INDICATOR_BOT_MODULE.newIndicatorBot(processIndex, botConfig, logger);
                    botInstance.initialize(processConfig, onInitializeReady);

                }
                catch (err) {
                    console.log(logDisplace + "Process Instance : [ERROR] start -> runIndicatorBot -> err = " + err.stack);
                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                }
            }

            function runTradingBot() {
                try {
                    TS.projects.superalgos.globals.processVariables.TOTAL_PROCESS_INSTANCES_CREATED++

                    botInstance = TRADING_BOT_MODULE.newTradingBot(processIndex, botConfig, logger);
                    botInstance.initialize(processConfig, onInitializeReady);
                }
                catch (err) {
                    console.log(logDisplace + "Process Instance : [ERROR] start -> runTradingBot -> err = " + err.stack);
                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                }
            }

            function runLearningBot() {
                try {
                    TS.projects.superalgos.globals.processVariables.TOTAL_PROCESS_INSTANCES_CREATED++

                    botInstance = TRADING_BOT_MODULE.newLearningBot(processIndex, botConfig, logger);
                    botInstance.initialize(processConfig, onInitializeReady);
                }
                catch (err) {
                    console.log(logDisplace + "Process Instance : [ERROR] start -> runLearningBot -> err = " + err.stack);
                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                }
            }

            function onInitializeReady(err) {

                if (err.result === TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {

                    botInstance.run(whenRunFinishes);

                    function whenRunFinishes(err) {

                        botConfig.loopCounter = 0;

                        let botId = botConfig.dataMine + "." + botConfig.codeName + "." + botConfig.process;

                        if (err.result === TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[INFO] start -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                            logger.write(MODULE_NAME, "[INFO] start -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                            logger.persist()
                        } else {
                            logger.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                            logger.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                            logger.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> Bye.");
                            logger.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                            console.log(logDisplace + "Process Instance : [ERROR] start -> onInitializeReady -> whenStartFinishes -> Bot execution was aborted.");
                            logger.persist()
                        }
                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                    }

                } else {
                    logger.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> err = " + err.message);
                    logger.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> Bot will not be started. ");
                    console.log(logDisplace + "Process Instance : [ERROR] start -> onInitializeReady -> err = " + err.message);

                    logger.persist()
                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                }
            }

            function exitProcessInstance() {
                TS.projects.superalgos.globals.processVariables.ENDED_PROCESSES_COUNTER++

                if (TS.projects.superalgos.globals.processVariables.ENDED_PROCESSES_COUNTER === TS.projects.superalgos.globals.processVariables.TOTAL_PROCESS_INSTANCES_CREATED) {
                   TS.projects.superalgos.functionLibraries.nodeJSFunctions.exitProcess()
                }
            }
        } catch (err) {
            console.log("[ERROR] Task Server -> " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.name + " -> Process Instance -> Start -> Err = " + err.stack);
        }
    }
}




