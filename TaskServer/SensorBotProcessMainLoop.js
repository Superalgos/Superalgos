exports.newSensorBotProcessMainLoop = function newSensorBotProcessMainLoop(bot, parentLogger) {

    const ROOT_DIR = './';

    const MODULE_NAME = "Sensor Process Main Loop";
    const FULL_LOG = true;

    let USER_BOT_MODULE;
    let COMMONS_MODULE;

    const FILE_STORAGE = require('./FileStorage.js');
    let fileStorage = FILE_STORAGE.newFileStorage(parentLogger);

    const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
    let logger; // We need this here in order for the loopHealth function to work and be able to rescue the loop when it gets in trouble.

    let nextLoopTimeoutHandle;
    let checkLoopHealthHandle;

    let thisObject = {
        initialize: initialize,
        run: run
    };

    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {

        /*  This function is exactly the same in the 3 modules representing the 2 different bot types loops. */

        try {
            if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            processConfig = pProcessConfig;

            if (bot.definedByUI === true) {
                /* The code of the bot is defined at the UI. No need to load a file with the code. */
                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return
            }

            let filePath = bot.dataMine + "/" + "bots" + "/" + bot.repo + "/" + pProcessConfig.codeName
            filePath += "/User.Bot.js"

            fileStorage.getTextFile(filePath, onBotDownloaded);

            function onBotDownloaded(err, text) {

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> onBotDownloaded -> err = " + err.message);
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> onBotDownloaded -> filePath = " + filePath);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
                USER_BOT_MODULE = {}
                if (bot.process === "Hole-Fixing") {
                    //USER_BOT_MODULE.newUserBot = require(process.env.BOTS_PATH + '/aamasters/AAMasters/bots/AACharly-Sensor-Bot/Hole-Fixing/User.Bot').newUserBot
                }
                try {
                    USER_BOT_MODULE.newUserBot = eval(text); // TODO This needs to be changed function
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onBotDownloaded -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }

                filePath = bot.dataMine + "/" + "bots" + "/" + bot.repo;
                filePath += "/Commons.js"

                fileStorage.getTextFile(filePath, onCommonsDownloaded);

                function onCommonsDownloaded(err, text) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        parentLogger.write(MODULE_NAME, "[WARN] initialize -> onBotDownloaded -> onCommonsDownloaded -> Commons not found: " + err.code || err.message);
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }
                    COMMONS_MODULE = {}

                    COMMONS_MODULE.newCommons = eval(text); // TODO This needs to be changed function

                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                }
            }

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function run(callBackFunction) {

        try {
            if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[INFO] run -> Entering function."); }

            bot.enableCheckLoopHealth = true;

            let fixedTimeLoopIntervalHandle;

            if (bot.runAtFixedInterval === true) {

                fixedTimeLoopIntervalHandle = setInterval(loop, bot.fixedInterval);
                loop(); // First run.

            } else {

                loop();

            }

            function loop() {

                try {

                    function pad(str, max) {
                        str = str.toString();
                        return str.length < max ? pad(" " + str, max) : str;
                    }

                    /* For each loop we want to create a new log file. */

                    logger = DEBUG_MODULE.newDebugLog();
                    logger.bot = bot;
                    logger.initialize();

                    bot.loopCounter++;
                    bot.loopStartTime = new Date().valueOf();

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> Entering function."); }

                    /* Loop Heartbeat sent to the UI */
                    bot.processHeartBeat = processHeartBeat
                    processHeartBeat() 

                    /* We define here all the modules that the rest of the infraestructure, including the bots themselves can consume. */

                    const UTILITIES = require(ROOT_DIR + 'CloudUtilities');
                    const STATUS_REPORT = require(ROOT_DIR + 'StatusReport');
                    const STATUS_DEPENDENCIES = require(ROOT_DIR + 'StatusDependencies');
                    const PROCESS_EXECUTION_EVENTS = require(ROOT_DIR + 'ProcessExecutionEvents'); 
                    const PROCESS_OUTPUT = require(ROOT_DIR + 'ProcessOutput');   

                    /* We define the datetime for the process that we are running now. This will be the official processing time for both the infraestructure and the bot. */

                    bot.processDatetime = new Date();           // This will be considered the process date and time, so as to have it consistenly all over the execution.

                    /* High level log entry  */ 

                    console.log(new Date().toISOString() + " " + pad(bot.codeName, 20) + " " + pad(bot.process, 30) + " " + pad(bot.exchange, 20) + " " + pad(bot.market.baseAsset + '/' + bot.market.quotedAsset, 10)   
                        + "      Entered into Main Loop     # " + pad(Number(bot.loopCounter), 8) )

                    /* We will prepare first the infraestructure needed for the bot to run. There are 4 modules we need to sucessfullly initialize first. */

                    let processOutput
                    let processExecutionEvents
                    let userBot;
                    let statusDependencies;
                    let exchangeAPI;

                    let nextWaitTime;

                    initializeProcessExecutionEvents();

                    function initializeProcessExecutionEvents() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeProcessExecutionEvents ->  Entering function."); }

                            processExecutionEvents = PROCESS_EXECUTION_EVENTS.newProcessExecutionEvents(bot, logger)

                            processExecutionEvents.initialize(onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeProcessExecutionEvents ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Execution finished well.");
                                            startProcessExecutionEvents()
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            processStopped()
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> Unhandled err.result received. -> err = " + err.message);

                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> onInizialized -> err = " + err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeProcessExecutionEvents -> err = " + err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function startProcessExecutionEvents() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> startProcessExecutionEvents ->  Entering function."); }

                            processExecutionEvents.start(onStarted);

                            function onStarted(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> startProcessExecutionEvents ->  onStarted -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> startProcessExecutionEvents -> onStarted -> Execution finished well.");
                                            initializeStatusDependencies();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> startProcessExecutionEvents -> onStarted -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            processStopped()
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> onStarted -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> onStarted -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> onStarted -> Unhandled err.result received. -> err = " + err.message);

                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> onStarted -> err = " + err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> err = " + err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function initializeStatusDependencies() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeStatusDependencies ->  Entering function."); }

                            statusDependencies = STATUS_DEPENDENCIES.newStatusDependencies(bot, logger, STATUS_REPORT, UTILITIES);

                            statusDependencies.initialize(onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeStatusDependencies ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeStatusDependencies -> onInizialized -> Execution finished well.");
                                            initializeUserBot();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeStatusDependencies -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            processStopped()
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Unhandled err.result received. -> err = " + err.message);

                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> err = "+ err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function initializeUserBot() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeUserBot ->  Entering function."); }

                            usertBot = USER_BOT_MODULE.newUserBot(bot, logger, COMMONS_MODULE, UTILITIES, fileStorage, STATUS_REPORT, exchangeAPI);

                            usertBot.initialize(statusDependencies, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeUserBot ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeUserBot -> onInizialized > Execution finished well.");
                                            startUserBot();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeUserBot -> onInizialized > Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            processStopped()
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized > Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        case global.CUSTOM_OK_RESPONSE.result: {

                                            switch (err.message) {
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized > Unhandled custom response received. -> err = " + err.message);
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(err);
                                                    return;
                                                }
                                            }
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized > Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized > Unhandled err.result received. -> err = " + err.message);

                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> err = "+ err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function startUserBot() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> startUserBot ->  Entering function."); }

                            usertBot.start(onFinished);

                            function onFinished(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> startUserBot ->  onFinished -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> startUserBot -> onFinished > Execution finished well.");
                                            raiseEventsProcessOutput()
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> startUserBot -> onFinished > Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            processStopped()
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished > Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        case global.CUSTOM_OK_RESPONSE.result: {

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
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(err);
                                                    return;
                                                }
                                            }
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished > Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished > Unhandled err.result received. -> err = " + err.message);

                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> err = "+ err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function raiseEventsProcessOutput() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> raiseEventsProcessOutput ->  Entering function."); }

                            processOutput = PROCESS_OUTPUT.newProcessOutput(bot, logger)

                            processOutput.raiseEvents(statusDependencies, onFinished);

                            function onFinished(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> raiseEventsProcessOutput ->  onFinished -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> raiseEventsProcessOutput -> onFinished -> Execution finished well.");
                                            finishProcessExecutionEvents()
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> raiseEventsProcessOutput -> onFinished -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            processStopped()
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> raiseEventsProcessOutput -> onFinished -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> raiseEventsProcessOutput -> onFinished -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> raiseEventsProcessOutput -> onFinished -> Unhandled err.result received. -> err = " + err.message);

                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> raiseEventsProcessOutput -> onFinished -> err = " + err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> raiseEventsProcessOutput -> err = " + err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function finishProcessExecutionEvents() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> finishProcessExecutionEvents ->  Entering function."); }

                            processExecutionEvents.finish(onFinished);

                            function onFinished(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> finishProcessExecutionEvents ->  onFinished -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> finishProcessExecutionEvents -> onFinished -> Execution finished well.");
                                            nextWaitTime = 'Normal';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> finishProcessExecutionEvents -> onFinished -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            processStopped()
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> onFinished -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> onFinished -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> onFinished -> Unhandled err.result received. -> err = " + err.message);

                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> onFinished -> err = " + err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> finishProcessExecutionEvents -> err = " + err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function loopControl(nextWaitTime) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Entering function."); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> nextWaitTime = " + nextWaitTime); }

                        /* We show we reached the end of the loop. */

                        processHeartBeat()

                        /* Here we check if we must stop the loop gracefully. */

                        shallWeStop(onStop, onContinue);

                        function onStop() {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onStop -> Entering function."); }

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onStop -> Stopping the Loop Gracefully. See you next time!"); }

                            if(global.WRITE_LOGS_TO_FILES === 'true'){
                                logger.persist();
                            }

                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;

                        }

                        function onContinue() {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onContinue -> Entering function."); }

                            /* Sensor bots are going to be executed after a configured period of time after the last execution ended. This is to avoid overlapping executions. */

                            switch (nextWaitTime) {
                                case 'Normal': {
                                    if (bot.runAtFixedInterval === true) {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Fixed Interval Normal exit point reached."); }
                                        if (processConfig.deadWaitTime > 0) {
                                            checkLoopHealthHandle = setTimeout(checkLoopHealth, processConfig.deadWaitTime, bot.loopCounter);
                                        }
                                        if(global.WRITE_LOGS_TO_FILES === 'true'){
                                            logger.persist();
                                        }
                                        return;
                                    } else {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.normalWaitTime / 1000) + " seconds."); }
                                        if (processConfig.deadWaitTime > 0) {
                                            checkLoopHealthHandle = setTimeout(checkLoopHealth, processConfig.deadWaitTime, bot.loopCounter);
                                        }
                                        nextLoopTimeoutHandle = setTimeout(loop, processConfig.normalWaitTime);
                                        if(global.WRITE_LOGS_TO_FILES === 'true'){
                                            logger.persist();
                                        }
                                    }
                                }
                                    break;
                                case 'Retry': {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.retryWaitTime / 1000) + " seconds."); }
                                    if (processConfig.deadWaitTime > 0) {
                                        checkLoopHealthHandle = setTimeout(checkLoopHealth, processConfig.retryWaitTime * 5, bot.loopCounter);
                                    }
                                    nextLoopTimeoutHandle = setTimeout(loop, processConfig.retryWaitTime);
                                    logger.persist();
                                }
                                    break;
                                case 'Sleep': {
                                    if (bot.runAtFixedInterval === true) {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Fixed Interval Sleep exit point reached."); }
                                        logger.persist();
                                        return;
                                    } else {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.sleepWaitTime / 60000) + " minutes."); }
                                        nextLoopTimeoutHandle = setTimeout(loop, processConfig.sleepWaitTime);
                                        logger.persist();
                                    }
                                }
                                    break;
                                case 'Coma': {
                                    if (bot.runAtFixedInterval === true) {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Fixed Interval Coma exit point reached."); }
                                        logger.persist();
                                        return;
                                    } else {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.comaWaitTime / 3600000) + " hours."); }
                                        nextLoopTimeoutHandle = setTimeout(loop, processConfig.comaWaitTime);
                                        logger.persist();
                                    }
                                }
                                    break;
                            }
                        }
                    }

                    function checkLoopHealth(pLastLoop) {

                        if (bot.enableCheckLoopHealth === false || global.STOP_TASK_GRACEFULLY === true) {

                            logger.write(MODULE_NAME, "[WARN] run -> loop -> checkLoopHealth -> bot.enableCheckLoopHealth = " + bot.enableCheckLoopHealth);

                            return;
                        } // This gets disabled anytime the Main Loop is shut down by any condition.

                        if (bot.loopCounter <= pLastLoop + 1) {    // This means that the next loop started but also stopped executing abruptally.

                            let now = new Date().valueOf();

                            if (now - bot.loopStartTime > processConfig.deadWaitTime) {

                                logger.write(MODULE_NAME, "[ERROR] run -> loop -> checkLoopHealth -> Dead loop found -> pLastLoop = " + pLastLoop);
                                console.log((new Date().toISOString() + " [ERROR] run -> loop -> checkLoopHealth -> " + pad(bot.codeName, 20) + " " + pad(bot.process, 30) + " Loop # " + pad(Number(bot.loopCounter), 5) + " found dead. Resurrecting it now."));

                                logger.persist();                       // We persist the logs of the failed execution.
                                clearTimeout(nextLoopTimeoutHandle);            // We cancel the timeout in case the original loop was still running and schedulled to reexecute.
                                loop();                                 // We restart the loop so that the processing can continue.

                            } else {

                                console.log((new Date().toISOString() + " [WARN] run -> loop -> checkLoopHealth -> " + pad(bot.codeName, 20) + " " + pad(bot.process, 30) + " Loop # " + pad(Number(bot.loopCounter), 5) + " found delayed but still alive. No action taken."));

                            }
                        }
                    }

                    function shallWeStop(stopCallBack, continueCallBack) {

                        try {

                            /* IMPORTANT: This function is exactly the same on the 3 modules. */

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> shallWeStop -> Entering function. "); }

                            if (!global.STOP_TASK_GRACEFULLY) {
                                continueCallBack();
                            } else {
                                stopCallBack();
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> shallWeStop -> err = " + err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] run -> loop -> err = "+ err.stack);
                    clearInterval(fixedTimeLoopIntervalHandle);
                    clearTimeout(nextLoopTimeoutHandle);
                    clearTimeout(checkLoopHealthHandle);
                    bot.enableCheckLoopHealth = false;
                    callBackFunction(err);
                }
            }

            function processHeartBeat(processingDate) {
                let event = {
                    seconds: (new Date()).getSeconds(),
                    processingDate: processingDate
                }
                global.SYSTEM_EVENT_HANDLER.raiseEvent(bot.processKey, 'Heartbeat', event)
            }

            function processStopped() {
                global.SYSTEM_EVENT_HANDLER.raiseEvent(bot.processKey, 'Stopped')
            }
        }

        catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] run -> err = "+ err.stack);
            clearInterval(fixedTimeLoopIntervalHandle);
            clearTimeout(nextLoopTimeoutHandle);
            clearTimeout(checkLoopHealthHandle);
            bot.enableCheckLoopHealth = false;
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
