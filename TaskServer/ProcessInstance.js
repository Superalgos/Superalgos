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
            const TRADING_BOT_MODULE = require('./TradingBot');

            let botInstance

            let botConfig = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config
            let processConfig = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config

            let VARIABLES_BY_PROCESS_INDEX
            /*
            We will use a logger for what happens before and after the bot main loop.
            */
            VARIABLES_BY_PROCESS_INDEX = {
                LOGS_TO_DELETE_QUEUE: [],
                PROCESS_INSTANCE_LOGGER_MODULE: TS.projects.superalgos.taskModules.debugLog.newSuperalgosTaskModulesDebugLog(processIndex)
            }
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.set(processIndex, VARIABLES_BY_PROCESS_INDEX)
            /*  We will add the process id to its key so that it is unique and it can later be finalized. */
            TS.projects.superalgos.globals.taskVariables.LOGGER_MAP.set('Pre-Bot-Main-Loop' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].id, TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE)
            /*
            There are a few variables with the scope of the process instance. We will store it here so that it can be
            accesed from where it is needed.
            */
            VARIABLES_BY_PROCESS_INDEX = {
                MAIN_LOOP_COUNTER: 0,
                PROCESS_KEY:
                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].name + '-' +
                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].type + '-' +
                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].id
            }
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.set(processIndex, VARIABLES_BY_PROCESS_INDEX)
            /*
            There are also a few constants at the process level. We initialize them here.
            */
            let CONSTANTS_BY_PROCESS_INDEX = {}
            TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.set(processIndex, CONSTANTS_BY_PROCESS_INDEX)

            /* File Path Root */
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT =
                'Project/' +
                TS.projects.superalgos.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName +
                "/" +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-') +
                "/" +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName +
                "/" +
                botConfig.codeName +
                '/' +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name +
                "/" +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
                "-" +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName

            switch (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.type) {
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
                    console.log(logDisplace + "Process Instance : [ERROR] start -> Unexpected bot type. -> TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.type = " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.type);
                }
            }

            function runSensorBot() {
                try {
                    TS.projects.superalgos.globals.processVariables.TOTAL_PROCESS_INSTANCES_CREATED++

                    botInstance = TS.projects.superalgos.botsModules.singleMarketSensorBot.newSuperalgosBotModulesSingleMarketSensorBot(processIndex);
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

                    botInstance = INDICATOR_BOT_MODULE.newIndicatorBot(processIndex);
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

                    botInstance = TRADING_BOT_MODULE.newTradingBot(processIndex);
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

                    botInstance = TRADING_BOT_MODULE.newLearningBot(processIndex);
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

                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).MAIN_LOOP_COUNTER = 0;

                        let botId = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "." + botConfig.codeName + "." + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName;

                        if (err.result === TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.persist()
                        } else {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> Bye.");
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                            console.log(logDisplace + "Process Instance : [ERROR] start -> onInitializeReady -> whenStartFinishes -> Bot execution was aborted.");
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.persist()
                        }
                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                    }

                } else {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> err = " + err.message);
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> Bot will not be started. ");
                    console.log(logDisplace + "Process Instance : [ERROR] start -> onInitializeReady -> err = " + err.message);

                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.persist()
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




