exports.newExtractionBotMainLoop = function newExtractionBotMainLoop(BOT) {

    let bot = BOT;
    const ROOT_DIR = './';

    const MODULE_NAME = "Extraction Bot Process Main Loop";
    const FULL_LOG = true;

    let USER_BOT_MODULE;
    let COMMONS_MODULE;

    const EVENT_HANDLER_MODULE = require(ROOT_DIR + 'EventHandler');
    bot.eventHandler = EVENT_HANDLER_MODULE.newEventHandler();

    const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;
    logger.forceLoopSplit = true;
    logger.initialize();

    let thisObject = {
        initialize: initialize,
        run: run
    };

    let processConfig;

    return thisObject;

    function initialize(pBotPath, pProcessConfig, callBackFunction) {

        try {
            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
            processConfig = pProcessConfig;

            USER_BOT_MODULE = require(pBotPath + "/" + pProcessConfig.name + "/" + 'User.Bot');

            try {
                COMMONS_MODULE = require(pBotPath + "/" + 'Commons');
            } catch (err) {
                // Nothing happens since COMMONS modules are optional.
            }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            bot.eventHandler.raiseEvent("Loop Finished");
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function run(pMonth, pYear, callBackFunction) {

        try {
            if (FULL_LOG === true) { logger.write("[INFO] run -> Entering function."); }

            let intervalHandle;

            if (bot.runAtFixedInterval === true) {

                intervalHandle = setInterval(loop, bot.fixedInterval);
                
            } else {

                loop();

            }

            function loop() {

                try {
                    bot.loopCounter++;

                    if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> Entering function."); }

                    /* We define here all the modules that the rest of the infraestructure, including the bots themselves can consume. */

                    const UTILITIES = require(ROOT_DIR + 'Utilities');
                    const BLOB_STORAGE = require(ROOT_DIR + 'BlobStorage');
                    const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                    const STATUS_REPORT = require(ROOT_DIR + 'StatusReport');
                    const POLONIEX_CLIENT_MODULE = require(ROOT_DIR + 'PoloniexAPIClient');
                    const STATUS_DEPENDENCIES = require(ROOT_DIR + 'StatusDependencies');

                    /* We define the datetime for the process that we are running now. This will be the official processing time for both the infraestructure and the bot. */

                    bot.processDatetime = new Date();           // This will be considered the process date and time, so as to have it consistenly all over the execution.

                    /* We will prepare first the infraestructure needed for the bot to run. There are 3 modules we need to sucessfullly initialize first. */

                    let userBot;
                    let statusDependencies;

                    let nextWaitTime;

                    initializeStatusDependencies();

                    function initializeStatusDependencies() {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> initializeStatusDependencies ->  Entering function."); }

                            statusDependencies = STATUS_DEPENDENCIES.newStatusDependencies(bot, DEBUG_MODULE, STATUS_REPORT, BLOB_STORAGE, UTILITIES);

                            statusDependencies.initialize(processConfig.statusDependencies, pMonth, pYear, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> initializeStatusDependencies ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write("[INFO] run -> loop -> initializeStatusDependencies -> onInizialized -> Execution finished well. :-)");
                                            initializeUserBot();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write("[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write("[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Operation Failed. Aborting the process.");
                                            bot.eventHandler.raiseEvent("Loop Finished");
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write("[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write("[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Unhandled err.result received. -> err.message = " + err.message);

                                            bot.eventHandler.raiseEvent("Loop Finished");
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write("[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> err = " + err.message);
                                    bot.eventHandler.raiseEvent("Loop Finished");
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write("[ERROR] run -> loop -> initializeStatusDependencies -> err = " + err.message);
                            bot.eventHandler.raiseEvent("Loop Finished");
                            callBackFunction(err);
                        }
                    }

                    function initializeUserBot() {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> initializeUserBot ->  Entering function."); }

                            usertBot = USER_BOT_MODULE.newUserBot(bot, COMMONS_MODULE, UTILITIES, DEBUG_MODULE, BLOB_STORAGE, STATUS_REPORT, POLONIEX_CLIENT_MODULE);

                            usertBot.initialize(statusDependencies, pMonth, pYear, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> initializeUserBot ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write("[INFO] run -> loop -> initializeUserBot -> onInizialized > Execution finished well. :-)");
                                            startUserBot();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write("[ERROR] run -> loop -> initializeUserBot -> onInizialized > Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write("[ERROR] run -> loop -> initializeUserBot -> onInizialized > Operation Failed. Aborting the process.");
                                            bot.eventHandler.raiseEvent("Loop Finished");
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write("[ERROR] run -> loop -> initializeUserBot -> onInizialized > Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write("[ERROR] run -> loop -> initializeUserBot -> onInizialized > Unhandled err.result received. -> err.message = " + err.message);

                                            bot.eventHandler.raiseEvent("Loop Finished");
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write("[ERROR] run -> loop -> initializeUserBot -> onInizialized -> err = " + err.message);
                                    bot.eventHandler.raiseEvent("Loop Finished");
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write("[ERROR] run -> loop -> initializeUserBot -> err = " + err.message);
                            bot.eventHandler.raiseEvent("Loop Finished");
                            callBackFunction(err);
                        }
                    }

                    function startUserBot() {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> startUserBot ->  Entering function."); }

                            usertBot.start(onFinished);

                            function onFinished(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> startUserBot ->  onFinished -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write("[INFO] run -> loop -> startUserBot -> onFinished > Execution finished well. :-)");
                                            nextWaitTime = 'Normal';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write("[ERROR] run -> loop -> startUserBot -> onFinished > Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write("[ERROR] run -> loop -> startUserBot -> onFinished > Operation Failed. Aborting the process.");
                                            bot.eventHandler.raiseEvent("Loop Finished");
                                            callBackFunction(err);
                                            return;
                                        }
                                        case global.CUSTOM_OK_RESPONSE.result: {

                                            switch (err.message) {
                                                case "Dependency does not exist.": {
                                                    logger.write("[WARN] run -> loop -> startUserBot -> onFinished > Dependency does not exist. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Dependency not ready.": {
                                                    logger.write("[WARN] run -> loop -> startUserBot -> onFinished > Dependency not ready. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Month before it is needed.": {
                                                    logger.write("[WARN] run -> loop -> startUserBot -> onFinished > Month before it is needed. This Loop will be terminated.");
                                                    bot.eventHandler.raiseEvent("Loop Finished");
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                case "Month fully processed.": {
                                                    logger.write("[WARN] run -> loop -> startUserBot -> onFinished > Month fully processed. This Loop will be terminated.");
                                                    bot.eventHandler.raiseEvent("Loop Finished");
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                case "End of the month reached.": {
                                                    logger.write("[WARN] run -> loop -> startUserBot -> onFinished > End of the month reached. This Loop will be terminated.");
                                                    bot.eventHandler.raiseEvent("Loop Finished");
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                case "Too far in the future.": {
                                                    logger.write("[WARN] run -> loop -> startUserBot -> onFinished > Too far in the future. This Loop will enter in coma.");
                                                    nextWaitTime = 'Coma';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                default: {
                                                    logger.write("[ERROR] run -> loop -> startUserBot -> onFinished > Unhandled custom response received. -> err.message = " + err.message);
                                                    bot.eventHandler.raiseEvent("Loop Finished");
                                                    callBackFunction(err);
                                                    return;
                                                }
                                            }
                                        }
                                        default: {
                                            logger.write("[ERROR] run -> loop -> startUserBot -> onFinished > Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write("[ERROR] run -> loop -> startUserBot -> onFinished > Unhandled err.result received. -> err.message = " + err.message);

                                            bot.eventHandler.raiseEvent("Loop Finished");
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write("[ERROR] run -> loop -> startUserBot -> onFinished -> err = " + err.message);
                                    bot.eventHandler.raiseEvent("Loop Finished");
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write("[ERROR] run -> loop -> startUserBot -> err = " + err.message);
                            bot.eventHandler.raiseEvent("Loop Finished");
                            callBackFunction(err);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] run -> loop -> err = " + err.message);
                    bot.eventHandler.raiseEvent("Loop Finished");
                    callBackFunction(err);
                }
            }

            function loopControl(nextWaitTime) {

                if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> nextWaitTime = " + nextWaitTime); }

                /* Here we check if we must stop the loop gracefully. */

                if (shallWeStop() === true) {

                    if (bot.runAtFixedInterval === true) { intervalHandle.clearInterval();}

                    if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Stopping the Loop Gracefully. See you next time! :-)"); }
                    bot.eventHandler.raiseEvent("Loop Finished");
                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                    return;

                }

                /* Extraction bots are going to be executed after a configured period of time after the last execution ended. This is to avoid overlapping executions. */

                switch (nextWaitTime) {
                    case 'Normal': {
                        if (bot.runAtFixedInterval === true) {
                            if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Fixed Interval Normal exit point reached."); }
                            bot.eventHandler.raiseEvent("Loop Finished");
                            return;
                        } else {
                            if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Restarting Loop in " + (processConfig.normalWaitTime / 1000) + " seconds."); }
                            bot.eventHandler.raiseEvent("Loop Finished");
                            setTimeout(loop, processConfig.normalWaitTime);
                        }
                    }
                        break;
                    case 'Retry': {
                        if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Restarting Loop in " + (processConfig.retryWaitTime / 1000) + " seconds."); }
                        bot.eventHandler.raiseEvent("Loop Finished");
                        setTimeout(loop, processConfig.retryWaitTime);
                    }
                        break;
                    case 'Sleep': {
                        if (bot.runAtFixedInterval === true) {
                            if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Fixed Interval Sleep exit point reached."); }
                            bot.eventHandler.raiseEvent("Loop Finished");
                            return;
                        } else {
                            if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Restarting Loop in " + (processConfig.sleepWaitTime / 60000) + " minutes."); }
                            bot.eventHandler.raiseEvent("Loop Finished");
                            setTimeout(loop, processConfig.sleepWaitTime);
                        }
                    }
                        break;
                    case 'Coma': {
                        if (bot.runAtFixedInterval === true) {
                            if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Fixed Interval Coma exit point reached."); }
                            bot.eventHandler.raiseEvent("Loop Finished");
                            return;
                        } else {
                            if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Restarting Loop in " + (processConfig.comaWaitTime / 3600000) + " hours."); }
                            bot.eventHandler.raiseEvent("Loop Finished");
                            setTimeout(loop, processConfig.comaWaitTime);
                        }
                    }
                        break;
                }
            }

            function shallWeStop() {

                var fs = require('fs');

                try {

                    global.PLATFORM_CONFIG = JSON.parse(fs.readFileSync('this.config.json', 'utf8'));
                    return JSON.parse(global.PLATFORM_CONFIG.stopGracefully);
                }
                catch (err) {
                    logger.write("[ERROR] run -> shallWeStop -> err = " + err.message);
                    bot.eventHandler.raiseEvent("Loop Finished");
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }

        catch (err) {
            logger.write("[ERROR] run -> err = " + err.message);
            bot.eventHandler.raiseEvent("Loop Finished");
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
