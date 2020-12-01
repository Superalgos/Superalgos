exports.newSensorBot = function newSensorBot(processIndex) {

    const MODULE_NAME = "Sensor Bot";

    let USER_BOT_MODULE;
    let COMMONS_MODULE;

    const FILE_STORAGE = require('./FileStorage.js');
    let fileStorage = FILE_STORAGE.newFileStorage(TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE);

    const DEBUG_MODULE = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + 'DebugLog');

    let nextLoopTimeoutHandle;

    let thisObject = {
        initialize: initialize,
        run: run
    };

    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {
        /*  This function is exactly the same in the 3 modules representing the 2 different bot types loops. */
        try {
            processConfig = pProcessConfig;

            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.repo === undefined) {
                /* The code of the bot is defined at the UI. No need to load a file with the code. */
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                return
            }

            let filePath =
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.project +    // project
                '/Bots-Plotters-Code/' +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName +
                "/" + "bots" + "/" +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.repo + "/" +
                pProcessConfig.codeName
            filePath += "/User.Bot.js"

            fileStorage.getTextFile(filePath, onBotDownloaded);

            function onBotDownloaded(err, text) {
                if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {

                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> onBotDownloaded -> err = " + err.message);
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> onBotDownloaded -> filePath = " + filePath);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    return;
                }
                USER_BOT_MODULE = {}

                try {
                    USER_BOT_MODULE.newUserBot = eval(text); // TODO This needs to be changed function
                } catch (err) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] initialize -> onBotDownloaded -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }

                filePath = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "/" + "bots" + "/" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.repo;
                filePath += "/Commons.js"

                fileStorage.getTextFile(filePath, onCommonsDownloaded);

                function onCommonsDownloaded(err, text) {
                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[WARN] initialize -> onBotDownloaded -> onCommonsDownloaded -> Commons not found: " + err.message);
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                        return;
                    }
                    COMMONS_MODULE = {}

                    COMMONS_MODULE.newCommons = eval(text); // TODO This needs to be changed function

                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                }
            }

        } catch (err) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function run(callBackFunction) {
        try {
            loop();

            function loop() {
                try {
                    TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, undefined, undefined, "Running...")
                    function pad(str, max) {
                        str = str.toString();
                        return str.length < max ? pad(" " + str, max) : str;
                    }

                    /* For each loop we want to create a new log file. */
                    if (TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE !== undefined) {
                        logger.finalize()
                    }
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE = DEBUG_MODULE.newDebugLog(processIndex)
                    TS.projects.superalgos.globals.taskVariables.LOGGER_MAP.set(MODULE_NAME + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].id, TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE)

                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).MAIN_LOOP_COUNTER++;

                    /* We tell the UI that we are running. */
                    TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex)

                    /* We define here all the modules that the rest of the infraestructure, including the bots themselves can consume. */
                    const UTILITIES = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + 'CloudUtilities');
                    const STATUS_REPORT = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + 'StatusReport');
                    const STATUS_DEPENDENCIES = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + 'StatusDependencies');
                    const PROCESS_EXECUTION_EVENTS = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + 'ProcessExecutionEvents');
                    const PROCESS_OUTPUT = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + 'ProcessOutput');

                    /* We define the datetime for the process that we are running now. This will be the official processing time for both the infraestructure and the bot. */
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME = new Date();           // This will be considered the process date and time, so as to have it consistenly all over the execution.

                    /* Main Loop Console Logging */
                    logger.newMainLoop()

                    /* We will prepare first the infraestructure needed for the bot to run. There are 4 modules we need to sucessfullly initialize first. */
                    let processExecutionEvents
                    let userBot;
                    let statusDependencies;
                    let exchangeAPI;

                    let nextWaitTime;

                    initializeProcessExecutionEvents();

                    function initializeProcessExecutionEvents() {
                        try {
                            processExecutionEvents = PROCESS_EXECUTION_EVENTS.newProcessExecutionEvents(processIndex, logger)
                            processExecutionEvents.initialize(processConfig, onInizialized);

                            function onInizialized(err) {
                                try {
                                    switch (err.result) {
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Execution finished well.");
                                            startProcessExecutionEvents()
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Operation Failed. Aborting the process.");
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Unhandled err.result received. -> err = " + err.message);
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                    }
                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> err = " + err.stack);
                                    global.unexpectedError = err.message
                                    processStopped()
                                    return
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> err = " + err.stack);
                            global.unexpectedError = err.message
                            processStopped()
                            return
                        }
                    }

                    function startProcessExecutionEvents() {
                        try {
                            processExecutionEvents.start(onStarted);

                            function onStarted(err) {
                                try {
                                    switch (err.result) {
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> startProcessExecutionEvents -> onStarted -> Execution finished well.");

                                            if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                                                loopControl()
                                                return
                                            }

                                            initializeStatusDependencies();
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> startProcessExecutionEvents -> onStarted -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> onStarted -> Operation Failed. Aborting the process.");
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> onStarted -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> onStarted -> Unhandled err.result received. -> err = " + err.message);
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                    }
                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> onStarted -> err = " + err.stack);
                                    global.unexpectedError = err.message
                                    processStopped()
                                    return
                                }
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> err = " + err.stack);
                            global.unexpectedError = err.message
                            processStopped()
                            return
                        }
                    }

                    function initializeStatusDependencies() {
                        try {
                            statusDependencies = STATUS_DEPENDENCIES.newStatusDependencies(processIndex, logger, STATUS_REPORT, UTILITIES, PROCESS_OUTPUT);
                            statusDependencies.initialize(onInizialized);

                            function onInizialized(err) {
                                try {
                                    switch (err.result) {
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeStatusDependencies -> onInizialized -> Execution finished well.");
                                            initializeUserBot();
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeStatusDependencies -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Operation Failed. Aborting the process.");
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Unhandled err.result received. -> err = " + err.message);
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                    }
                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> err = " + err.stack);
                                    global.unexpectedError = err.message
                                    processStopped()
                                    return
                                }
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> err = " + err.stack);
                            global.unexpectedError = err.message
                            processStopped()
                            return
                        }
                    }

                    function initializeUserBot() {
                        try {
                            usertBot = USER_BOT_MODULE.newUserBot(processIndex, logger, COMMONS_MODULE, UTILITIES, FILE_STORAGE, STATUS_REPORT, exchangeAPI);
                            usertBot.initialize(statusDependencies, onInizialized);

                            function onInizialized(err) {
                                try {
                                    switch (err.result) {
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeUserBot -> onInizialized > Execution finished well.");
                                            startUserBot();
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeUserBot -> onInizialized > Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized > Operation Failed. Aborting the process.");
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result: {

                                            switch (err.message) {
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized > Unhandled custom response received. -> err = " + err.message);
                                                    global.unexpectedError = err.message
                                                    processStopped()
                                                    return
                                                }
                                            }
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized > Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized > Unhandled err.result received. -> err = " + err.message);
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                    }
                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized -> err = " + err.stack);
                                    global.unexpectedError = err.message
                                    processStopped()
                                    return
                                }
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> err = " + err.stack);
                            global.unexpectedError = err.message
                            processStopped()
                            return
                        }
                    }

                    function startUserBot() {
                        try {
                            usertBot.start(onFinished);

                            function onFinished(err) {
                                try {
                                    switch (err.result) {
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> startUserBot -> onFinished > Execution finished well.");
                                            finishProcessExecutionEvents()
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> startUserBot -> onFinished > Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished > Operation Failed. Aborting the process.");
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result: {

                                            switch (err.message) {
                                                case "Dependency does not exist.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startUserBot -> onFinished > Dependency does not exist. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Dependency not ready.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startUserBot -> onFinished > Dependency not ready. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished > Unhandled custom response received. -> err = " + err.message);
                                                    global.unexpectedError = err.message
                                                    processStopped()
                                                    return
                                                }
                                            }
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished > Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished > Unhandled err.result received. -> err = " + err.message);
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                    }
                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished -> err = " + err.stack);
                                    global.unexpectedError = err.message
                                    processStopped()
                                    return
                                }
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> err = " + err.stack);
                            global.unexpectedError = err.message
                            processStopped()
                            return
                        }
                    }

                    function finishProcessExecutionEvents() {
                        try {
                            processExecutionEvents.finish(onFinished);

                            function onFinished(err) {
                                try {
                                    processExecutionEvents.finalize()
                                    processExecutionEvents = undefined

                                    switch (err.result) {
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> finishProcessExecutionEvents -> onFinished -> Execution finished well.");
                                            nextWaitTime = 'Normal';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> finishProcessExecutionEvents -> onFinished -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> onFinished -> Operation Failed. Aborting the process.");
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> onFinished -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> onFinished -> Unhandled err.result received. -> err = " + err.message);
                                            global.unexpectedError = err.message
                                            processStopped()
                                            return
                                        }
                                    }
                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> onFinished -> err = " + err.stack);
                                    global.unexpectedError = err.message
                                    processStopped()
                                    return
                                }
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> err = " + err.stack);
                            global.unexpectedError = err.message
                            processStopped()
                            return
                        }
                    }

                    function loopControl(nextWaitTime) {
                        logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> nextWaitTime = " + nextWaitTime)

                        /* We show we reached the end of the loop. */
                        /* Here we check if we must stop the loop gracefully. */
                        shallWeStop(onStop, onContinue);

                        function onStop() {
                            logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onStop -> Stopping the Loop Gracefully. See you next time!")
                            processStopped()
                            return;
                        }

                        function onContinue() {
                            /* Sensor bots are going to be executed after a configured period of time after the last execution ended. This is to avoid overlapping executions. */
                            switch (nextWaitTime) {
                                case 'Normal': {
                                    logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.normalWaitTime / 1000) + " seconds.")
                                    nextLoopTimeoutHandle = setTimeout(loop, processConfig.normalWaitTime);
                                    TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, undefined, undefined, "Waiting " + processConfig.normalWaitTime / 1000 + " seconds for next execution.")
                                    logger.persist();
                                }
                                    break;
                                case 'Retry': {
                                    logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.retryWaitTime / 1000) + " seconds.")
                                    nextLoopTimeoutHandle = setTimeout(loop, processConfig.retryWaitTime);
                                    TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, undefined, undefined, "Trying to recover from some problem. Waiting " + processConfig.retryWaitTime / 1000 + " seconds for next execution.")
                                    logger.persist();
                                }
                                    break;
                                case 'Sleep': {
                                    logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.sleepWaitTime / 60000) + " minutes.")
                                    nextLoopTimeoutHandle = setTimeout(loop, processConfig.sleepWaitTime);
                                    TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, undefined, undefined, "Waiting " + processConfig.sleepWaitTime / 60000 + " minutes for next execution.")
                                    logger.persist();
                                }
                                    break;
                                case 'Coma': {
                                    logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.comaWaitTime / 3600000) + " hours.")
                                    nextLoopTimeoutHandle = setTimeout(loop, processConfig.comaWaitTime);
                                    TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, undefined, undefined, "Waiting " + processConfig.comaWaitTime / 3600000 + " hours for next execution.")
                                    logger.persist();
                                }
                                    break;
                            }
                        }
                    }

                    function shallWeStop(stopCallBack, continueCallBack) {
                        try {
                            /* IMPORTANT: This function is exactly the same on the 3 modules. */
                            if (!TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING) {
                                continueCallBack();
                            } else {
                                stopCallBack();
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> shallWeStop -> err = " + err.stack);
                            global.unexpectedError = err.message
                            processStopped()
                            return
                        }
                    }

                } catch (err) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] run -> loop -> err = " + err.stack);
                    global.unexpectedError = err.message
                    processStopped()
                    return
                }
            }

            function processStopped() {
                if (global.unexpectedError !== undefined) {
                    TS.projects.superalgos.functionLibraries.processFunctions.processError(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_KEY, undefined, "An unexpected error caused the Process to stop.")
                } else {
                    global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_KEY, 'Stopped')
                }
                logger.persist();
                clearTimeout(nextLoopTimeoutHandle);
                if (global.unexpectedError !== undefined) {
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                } else {
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                }
            }
        }

        catch (err) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] run -> err = " + err.stack);
            clearTimeout(nextLoopTimeoutHandle);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
