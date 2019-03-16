exports.newIndicatorBotProcessMainLoop = function newIndicatorBotProcessMainLoop(bot, parentLogger) {

    const ROOT_DIR = './';

    const MODULE_NAME = "Indicator Bot Process Main Loop";
    const FULL_LOG = true;

    let USER_BOT_MODULE;
    let COMMONS_MODULE;

    const BLOB_STORAGE = require(ROOT_DIR + 'BlobStorage');
    const MULTI_PERIOD_MARKET = require(ROOT_DIR + 'MultiPeriodMarket');

    const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
    let logger; // We need this here in order for the loopHealth function to work and be able to rescue the loop when it gets in trouble.

    let nextLoopTimeoutHandle; 
    let checkLoopHealthHandle;

    let thisObject = {
        initialize: initialize,
        run: run
    };

    let processConfig;
    let UI_COMMANDS; 

    return thisObject;

    function initialize(pUI_COMMANDS, pProcessConfig, callBackFunction) {

        /*  This function is exactly the same in the 3 modules representing the 2 different bot types loops. */

        try {
            if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            UI_COMMANDS = pUI_COMMANDS;
            processConfig = pProcessConfig;

            cloudStorage = BLOB_STORAGE.newBlobStorage(bot, parentLogger);

            cloudStorage.initialize("AAPlatform", onInizialized);

            function onInizialized(err) {

                if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[INFO] initialize -> onInizialized -> Entering function."); }

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    let filePath;

                    switch (global.CURRENT_EXECUTION_AT) { // This is what determines if the bot is loaded from the devTeam or an endUser copy.
                        case "Cloud": {
                            if (global.RUN_AS_TEAM) {
                                filePath = global.DEV_TEAM + "/" + "bots" + "/" + bot.repo + "/" + pProcessConfig.name; // DevTeams bots only are run at the cloud.
                            } else {
                                filePath = global.DEV_TEAM + "/" + "members" + "/" + global.USER_LOGGED_IN + "/" + global.CURRENT_BOT_REPO + "/" + pProcessConfig.name; // DevTeam Members bots only are run at the browser.
                            }
                            break;
                        }
                        case "Browser": {
                            filePath = global.DEV_TEAM + "/" + "members" + "/" + global.USER_LOGGED_IN + "/" + global.CURRENT_BOT_REPO + "/" + pProcessConfig.name; // DevTeam Members bots only are run at the browser.
                            break;
                        }
                        default: {
                            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> CURRENT_EXECUTION_AT must be either 'Cloud' or 'Browser'.");
                            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> global.CURRENT_EXECUTION_AT = " + global.CURRENT_EXECUTION_AT);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                    const CLOUD_REQUIRE = require(ROOT_DIR + 'CloudRequire');
                    let cloudRequire = CLOUD_REQUIRE.newCloudRequire(bot, parentLogger);

                    cloudRequire.downloadBot(cloudStorage, filePath, onBotDownloaded);

                    function onBotDownloaded(err, pMODULE) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> onBotDownloaded -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }

                        USER_BOT_MODULE = pMODULE;

                        switch (global.CURRENT_EXECUTION_AT) {
                            case "Cloud": {
                                filePath = global.DEV_TEAM + "/" + "bots" + "/" + bot.repo;
                                break;
                            }
                            case "Browser": {
                                filePath = global.DEV_TEAM + "/" + "members" + "/" + global.USER_LOGGED_IN + "/" + global.CURRENT_BOT_REPO;
                                break;
                            }
                            default: {
                                parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> onBotDownloaded -> CURRENT_EXECUTION_AT must be either 'Cloud' or 'Browser'.");
                                parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> onBotDownloaded -> global.CURRENT_EXECUTION_AT = " + global.CURRENT_EXECUTION_AT);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }
                        }

                        cloudRequire.downloadCommons(cloudStorage, filePath, onCommonsDownloaded);

                        function onCommonsDownloaded(err, pMODULE) {

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> onBotDownloaded -> onCommonsDownloaded -> err.message = " + err.message);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            COMMONS_MODULE = pMODULE;

                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                        }
                    }

                } else {
                    parentLogger.write(MODULE_NAME, "[ERROR] Root -> start -> getBotConfig -> onInizialized ->  err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function run(pMonth, pYear, callBackFunction) {

        try {

            if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[INFO] run -> Entering function."); }

            bot.enableCheckLoopHealth = true; 

            let fixedTimeLoopIntervalHandle;

            if (bot.runAtFixedInterval === true) {

                fixedTimeLoopIntervalHandle = setInterval(loop, bot.fixedInterval);

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

                    /* We define here all the modules that the rest of the infraestructure, including the bots themselves can consume. */

                    const UTILITIES = require(ROOT_DIR + 'CloudUtilities');
                    const STATUS_REPORT = require(ROOT_DIR + 'StatusReport');
                    const STATUS_DEPENDENCIES = require(ROOT_DIR + 'StatusDependencies');
                    const DATA_DEPENDENCIES = require(ROOT_DIR + 'DataDependencies');
                    const DATA_SET = require(ROOT_DIR + 'DataSet');

                    /* We define the datetime for the process that we are running now. This will be the official processing time for both the infraestructure and the bot. */

                    bot.processDatetime = new Date();           // This will be considered the process date and time, so as to have it consistenly all over the execution.

                    /* High level log entry  */

                    console.log(bot.processDatetime.toISOString() + " " + pad(bot.codeName, 20) + " " + pad(bot.process, 30) + " " + pad(pMonth, 2) + "/" + pad(pYear, 4)
                        + " Entered into Main Loop # " + pad(Number(bot.loopCounter), 8));

                    /* We will prepare first the infraestructure needed for the bot to run. There are 3 modules we need to sucessfullly initialize first. */

                    let userBot;
                    let multiPeriodMarket;
                    let statusDependencies;
                    let dataDependencies;

                    let nextWaitTime;

                    initializeStatusDependencies();

                    function initializeStatusDependencies() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeStatusDependencies ->  Entering function."); }

                            statusDependencies = STATUS_DEPENDENCIES.newStatusDependencies(bot, logger, STATUS_REPORT, BLOB_STORAGE, UTILITIES);

                            statusDependencies.initialize(processConfig.statusDependencies, pMonth, pYear, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeStatusDependencies ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeStatusDependencies -> onInizialized -> Execution finished well.");
                                            initializeDataDependencies();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
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
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> Unhandled err.result received. -> err.message = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> onInizialized -> err = " + err.message);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeStatusDependencies -> err = " + err.message);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function initializeDataDependencies() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeDataDependencies ->  Entering function."); }

                            dataDependencies = DATA_DEPENDENCIES.newDataDependencies(bot, logger, DATA_SET, BLOB_STORAGE, UTILITIES);

                            dataDependencies.initialize(processConfig.dataDependencies, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeDataDependencies ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeDataDependencies -> onInizialized -> Execution finished well."); }

                                            /* If the process is configured to run inside a framework, we continue there, otherwise we run the bot directly. */

                                            switch (processConfig.framework) {
                                                case 'Multi-Period-Market': {
                                                    intitializeMultiPeriodMarket();
                                                    break;
                                                }
                                                default: { initializeUserBot();}
                                            }
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeDataDependencies -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeDataDependencies -> onInizialized -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeDataDependencies -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeDataDependencies -> onInizialized -> Unhandled err.result received. -> err.message = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeDataDependencies ->  onInizialized -> err = " + err.message);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeDataDependencies -> err = " + err.message);
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
                            
                            usertBot = USER_BOT_MODULE.newUserBot(bot, logger, COMMONS_MODULE, UTILITIES, BLOB_STORAGE);

                            usertBot.initialize(statusDependencies, pMonth, pYear, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeUserBot ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeUserBot -> onInizialized -> Execution finished well.");
                                            startUserBot();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized -> Operation Failed. Aborting the process.");
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
                                                case "Too far in the future.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeUserBot -> onInizialized > Too far in the future. This Loop will enter in coma.");
                                                    nextWaitTime = 'Coma';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Not needed now, but soon.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeUserBot -> onInizialized > Not needed now, but soon. This Loop will continue with Normal wait time.");
                                                    nextWaitTime = 'Normal';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized > Unhandled custom response received. -> err.message = " + err.message);
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
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> onInizialized -> Unhandled err.result received. -> err.message = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot ->  onInizialized -> err = " + err.message);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeUserBot -> err = " + err.message);
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

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> startUserBot -> onFinished -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> startUserBot -> onFinished -> Execution finished well.");
                                            nextWaitTime = 'Normal';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished -> Operation Failed. Aborting the process.");
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
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startUserBot -> onFinished -> Dependency does not exist. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Dependency not ready.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startUserBot -> onFinished -> Dependency not ready. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Month before it is needed.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startUserBot -> onFinished -> Month before it is needed. This Loop will be terminated.");
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                case "Month fully processed.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startUserBot -> onFinished -> Month fully processed. This Loop will be terminated.");
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                case "End of the month reached.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startUserBot -> onFinished -> End of the month reached. This Loop will be terminated.");
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished -> Unhandled custom response received. -> err.message = " + err.message);
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
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished -> Unhandled err.result received. -> err.message = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> onFinished -> err = " + err.message);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startUserBot -> err = " + err.message);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function intitializeMultiPeriodMarket() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> intitializeMultiPeriodMarket ->  Entering function."); }

                            multiPeriodMarket = MULTI_PERIOD_MARKET.newMultiPeriodMarket(bot, logger, COMMONS_MODULE, UTILITIES, BLOB_STORAGE);

                            multiPeriodMarket.initialize(statusDependencies, dataDependencies, pMonth, pYear, onInizialized, dataDependencies);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> intitializeMultiPeriodMarket ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> intitializeMultiPeriodMarket -> onInizialized -> Execution finished well.");
                                            startMultiPeriodMarket();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeMultiPeriodMarket -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeMultiPeriodMarket -> onInizialized -> Operation Failed. Aborting the process.");
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
                                                case "Too far in the future.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> intitializeMultiPeriodMarket -> onInizialized > Too far in the future. This Loop will enter in coma.");
                                                    nextWaitTime = 'Coma';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Not needed now, but soon.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> intitializeMultiPeriodMarket -> onInizialized > Not needed now, but soon. This Loop will continue with Normal wait time.");
                                                    nextWaitTime = 'Normal';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeMultiPeriodMarket -> onInizialized > Unhandled custom response received. -> err.message = " + err.message);
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
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeMultiPeriodMarket -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeMultiPeriodMarket -> onInizialized -> Unhandled err.result received. -> err.message = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeMultiPeriodMarket ->  onInizialized -> err = " + err.message);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeMultiPeriodMarket -> err = " + err.message);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function startMultiPeriodMarket() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> startMultiPeriodMarket ->  Entering function."); }

                            multiPeriodMarket.start(onFinished);

                            function onFinished(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> startMultiPeriodMarket -> onFinished -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> startMultiPeriodMarket -> onFinished -> Execution finished well.");
                                            nextWaitTime = 'Normal';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startMultiPeriodMarket -> onFinished -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startMultiPeriodMarket -> onFinished -> Operation Failed. Aborting the process.");
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
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startMultiPeriodMarket -> onFinished -> Dependency does not exist. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Dependency not ready.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startMultiPeriodMarket -> onFinished -> Dependency not ready. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Month before it is needed.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startMultiPeriodMarket -> onFinished -> Month before it is needed. This Loop will be terminated.");
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                case "Month fully processed.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startMultiPeriodMarket -> onFinished -> Month fully processed. This Loop will be terminated.");
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                case "End of the month reached.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startMultiPeriodMarket -> onFinished -> End of the month reached. This Loop will be terminated.");
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startMultiPeriodMarket -> onFinished -> Unhandled custom response received. -> err.message = " + err.message);
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
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startMultiPeriodMarket -> onFinished -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startMultiPeriodMarket -> onFinished -> Unhandled err.result received. -> err.message = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startMultiPeriodMarket -> onFinished -> err = " + err.message);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startMultiPeriodMarket -> err = " + err.message);
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

                        /* Here we check if we must stop the loop gracefully. */

                        shallWeStop(onStop, onContinue);

                        function onStop() {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onStop -> Entering function."); }

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onStop -> Stopping the Loop Gracefully. See you next time!"); }

                            logger.persist();
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;

                        }

                        function onContinue() {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onContinue -> Entering function."); }

                            /* Indicator bots are going to be executed after a configured period of time after the last execution ended. This is to avoid overlapping executions. */

                            switch (nextWaitTime) {
                                case 'Normal': {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.normalWaitTime / 1000) + " seconds."); }
                                    checkLoopHealthHandle = setTimeout(checkLoopHealth, processConfig.normalWaitTime * 5, bot.loopCounter);
                                    nextLoopTimeoutHandle = setTimeout(loop, processConfig.normalWaitTime);
                                    logger.persist();
                                }
                                    break;
                                case 'Retry': {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.retryWaitTime / 1000) + " seconds."); }
                                    checkLoopHealthHandle = setTimeout(checkLoopHealth, processConfig.retryWaitTime * 5, bot.loopCounter);
                                    nextLoopTimeoutHandle = setTimeout(loop, processConfig.retryWaitTime);
                                    logger.persist();
                                }
                                    break;
                                case 'Sleep': {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.sleepWaitTime / 60000) + " minutes."); }
                                    nextLoopTimeoutHandle = setTimeout(loop, processConfig.sleepWaitTime);
                                    logger.persist();
                                }
                                    break;
                                case 'Coma': {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.comaWaitTime / 3600000) + " hours."); }
                                    nextLoopTimeoutHandle = setTimeout(loop, processConfig.comaWaitTime);
                                    logger.persist();                                    
                                }
                                    break;
                            }
                        }
                    }

                    function checkLoopHealth(pLastLoop) {

                        if (global.CURRENT_EXECUTION_AT !== "Cloud") {
                            return;
                        }

                        if (bot.enableCheckLoopHealth === false) {

                            logger.write(MODULE_NAME, "[WARN] run -> loop -> checkLoopHealth -> bot.enableCheckLoopHealth = " + bot.enableCheckLoopHealth);

                            return;
                        } // This gets disabled anytime the Main Loop is shut down by any condition.

                        if (bot.loopCounter <= pLastLoop + 1) {    // This means that the next loop started but also stopped executing abruptally.

                            let now = new Date().valueOf();

                            if (now - bot.loopStartTime > processConfig.normalWaitTime) {

                                logger.write(MODULE_NAME, "[ERROR] run -> loop -> checkLoopHealth -> Dead loop found -> pLastLoop = " + pLastLoop);
                                console.log((new Date().toISOString() + " [ERROR] run -> loop -> checkLoopHealth -> " + pad(bot.codeName,20) + " " + pad(bot.process,30) + " Loop # " + pad(Number(bot.loopCounter),5) + " found dead. Resurrecting it now."));

                                logger.persist();                       // We persist the logs of the failed execution.
                                clearTimeout(nextLoopTimeoutHandle);            // We cancel the timeout in case the original loop was still running and schedulled to reexecute.
                                loop();                                 // We restart the loop so that the processing can continue.

                            } else {

                                console.log((new Date().toISOString() + " [WARN] run -> loop -> checkLoopHealth -> " + pad(bot.codeName,20) + " " + pad(bot.process,30) + " Loop # " + pad(Number(bot.loopCounter),5) + " found delayed but still alive. No action taken."));

                            }
                        }
                    }

                    function shallWeStop(stopCallBack, continueCallBack) {

                        try {

                            /* IMPORTANT: This function is exactly the same on the 3 modules. */

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> shallWeStop -> Entering function. "); }

                            cloudStorage = BLOB_STORAGE.newBlobStorage(bot, logger);

                            cloudStorage.initialize("AAPlatform", onInizialized);

                            function onInizialized(err) {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> shallWeStop -> onInizialized -> Entering function."); }

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    let filePath;

                                    switch (global.CURRENT_EXECUTION_AT) { // This is what determines if the bot is loaded from the devTeam or an endUser copy.
                                        case "Cloud": {
                                            filePath = global.DEV_TEAM + "/" + "AACloud"; // DevTeams bots only are run at the cloud.
                                            break;
                                        }
                                        case "Browser": {
                                            if (global.SHALL_BOT_STOP === false) {
                                                continueCallBack();
                                            } else {
                                                stopCallBack();
                                            }
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> shallWeStop -> onInizialized -> CURRENT_EXECUTION_AT must be either 'Cloud' or 'Browser'.");
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> shallWeStop -> onInizialized -> global.CURRENT_EXECUTION_AT = " + global.CURRENT_EXECUTION_AT);
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                    let fileName = "this.config.json";

                                    cloudStorage.getTextFile(filePath, fileName, onFileReceived);

                                    function onFileReceived(err, text) {

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                            /* 
                                            If for any reason this config file cannot be read, we are not going to abort the loop for that. Instead we are going to assume
                                            that there are no instructions to stop and we will keep the show running.
                                            */

                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> shallWeStop -> onFileReceived -> err.message = " + err.message);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> shallWeStop -> onFileReceived -> The config file cound not be read. ");
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> shallWeStop -> onFileReceived -> We will ignore its content and continue running the loop. ");

                                            continueCallBack();
                                            return;
                                        }

                                        try {

                                            let configRead = JSON.parse(text);

                                            if (configRead.stopGracefully === false && global.SHALL_BOT_STOP === false) {
                                                continueCallBack();
                                            } else {
                                                stopCallBack();
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> shallWeStop -> onFileReceived -> err.message = " + err.message);
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> shallWeStop -> err.message = " + err.message);
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
                    parentLogger.write(MODULE_NAME, "[ERROR] run -> loop -> err = " + err.message);
                    clearInterval(fixedTimeLoopIntervalHandle);
                    clearTimeout(nextLoopTimeoutHandle);
                    clearTimeout(checkLoopHealthHandle);
                    bot.enableCheckLoopHealth = false;
                    callBackFunction(err);
                }
            }
        }

        catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] run -> err = " + err.message);
            clearInterval(fixedTimeLoopIntervalHandle);
            clearTimeout(nextLoopTimeoutHandle);
            clearTimeout(checkLoopHealthHandle);
            bot.enableCheckLoopHealth = false;
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
