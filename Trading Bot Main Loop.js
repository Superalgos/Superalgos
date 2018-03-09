exports.newTradingBotMainLoop = function newTradingBotMainLoop(BOT) {

    let bot = BOT;
    const ROOT_DIR = './';

    const MODULE_NAME = "Trading Bot Main Loop";
    const FULL_LOG = true;

    let USER_BOT_MODULE;

    const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

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

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function run(callBackFunction) {

        try {
            if (FULL_LOG === true) { logger.write("[INFO] run -> Entering function."); }

            loop();

            function loop() {

                try {
                    if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> Entering function."); }

                    /* We define here all the modules that the rest of the infraestructure, including the bots themselves can consume. */

                    const UTILITIES = require(ROOT_DIR + 'Utilities');
                    const AZURE_FILE_STORAGE = require(ROOT_DIR + 'Azure File Storage');
                    const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
                    const POLONIEX_CLIENT_MODULE = require(ROOT_DIR + 'Poloniex API Client');
                    const EXCHANGE_API = require(ROOT_DIR + 'ExchangeAPI');
                    const CONTEXT = require(ROOT_DIR + 'Context');
                    const DATASOURCE = require(ROOT_DIR + 'Datasource');
                    const ASSISTANT = require(ROOT_DIR + 'Assistant');

                    /* We define the datetime for the process that we are running now. This will be the official processing time for both the infraestructure and the bot. */

                    global.processDatetime = new Date();           // This will be considered the process date and time, so as to have it consistenly all over the execution.
                    global.processDatetime = new Date(global.processDatetime.valueOf() - 30 * 24 * 60 * 60 * 1000); // we go 30 days back in time since candles are currently not up to date.

                    /* We will prepare first the infraestructure needed for the bot to run. There are 3 modules we need to sucessfullly initialize first. */

                    let context;
                    let datasource;
                    let exchangeAPI;
                    let assistant;
                    let userBot;

                    let nextWaitTime;

                    initializeContext();

                    function initializeContext() {

                        if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> initializeContext ->  Entering function."); }

                        context = CONTEXT.newContext(bot, DEBUG_MODULE, AZURE_FILE_STORAGE, UTILITIES);
                        context.initialize(onInizialized);

                        function onInizialized(err) {

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    logger.write("[INFO] run -> loop -> initializeContext -> onInizialized > Execution finished well. :-)");
                                    initializeDatasource();
                                    return;
                                }
                                    break;
                                case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                    logger.write("[ERROR] run -> loop -> initializeContext -> onInizialized > Retry Later. Requesting Execution Retry.");
                                    nextWaitTime = 'Retry';
                                    loopControl(nextWaitTime);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                    logger.write("[ERROR] run -> loop -> initializeContext -> onInizialized > Operation Failed. Aborting the process.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                            }
                        }
                    }

                    function initializeDatasource() {

                        if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> initializeDatasource ->  Entering function."); }

                        datasource = DATASOURCE.newDatasource(bot, DEBUG_MODULE, AZURE_FILE_STORAGE, UTILITIES);
                        datasource.initialize(onInizialized);

                        function onInizialized(err) {

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    logger.write("[INFO] run -> loop -> initializeDatasource -> onInizialized > Execution finished well. :-)");
                                    initializeExchangeAPI();
                                    return;
                                }
                                    break;
                                case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                    logger.write("[ERROR] run -> loop -> initializeDatasource -> onInizialized > Retry Later. Requesting Execution Retry.");
                                    nextWaitTime = 'Retry';
                                    loopControl(nextWaitTime);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                    logger.write("[ERROR] run -> loop -> initializeDatasource -> onInizialized > Operation Failed. Aborting the process.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                            }
                        }
                    }

                    function initializeExchangeAPI() {

                        if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> initializeExchangeAPI ->  Entering function."); }

                        exchangeAPI = EXCHANGE_API.newExchangeAPI(bot, DEBUG_MODULE, POLONIEX_CLIENT_MODULE);
                        exchangeAPI.initialize(onInizialized);

                        function onInizialized(err) {

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    logger.write("[INFO] run -> loop -> initializeExchangeAPI -> onInizialized > Execution finished well. :-)");
                                    initializeAssistant();
                                    return;
                                }
                                    break;
                                case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                    logger.write("[ERROR] run -> loop -> initializeExchangeAPI -> onInizialized > Retry Later. Requesting Execution Retry.");
                                    nextWaitTime = 'Retry';
                                    loopControl(nextWaitTime);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                    logger.write("[ERROR] run -> loop -> initializeExchangeAPI -> onInizialized > Operation Failed. Aborting the process.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                            }
                        }
                    }

                    function initializeAssistant() {

                        if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> initializeAssistant ->  Entering function."); }

                        assistant = ASSISTANT.newAssistant(bot, DEBUG_MODULE);
                        assistant.initialize(context, exchangeAPI, onInizialized);

                        function onInizialized(err) {

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    logger.write("[INFO] run -> loop -> initializeAssistant -> onInizialized > Execution finished well. :-)");
                                    initializeUserBot();
                                    return;
                                }
                                    break;
                                case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                    logger.write("[ERROR] run -> loop -> initializeAssistant -> onInizialized > Retry Later. Requesting Execution Retry.");
                                    nextWaitTime = 'Retry';
                                    loopControl(nextWaitTime);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                    logger.write("[ERROR] run -> loop -> initializeAssistant -> onInizialized > Operation Failed. Aborting the process.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                            }
                        }
                    }

                    function initializeUserBot() {

                        if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> initializeUserBot ->  Entering function."); }

                        usertBot = USER_BOT_MODULE.newUserBot(bot, DEBUG_MODULE);

                        let platform = {
                            context: context,
                            datasource: datasource,
                            assistant: assistant
                        };

                        usertBot.initialize(platform, onInizialized);

                        function onInizialized(err) {

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    logger.write("[INFO] run -> loop -> initializeUserBot -> onInizialized > Execution finished well. :-)");
                                    startUserBot();
                                    return;
                                }
                                    break;
                                case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                    logger.write("[ERROR] run -> loop -> initializeUserBot -> onInizialized > Retry Later. Requesting Execution Retry.");
                                    nextWaitTime = 'Retry';
                                    loopControl(nextWaitTime);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                    logger.write("[ERROR] run -> loop -> initializeUserBot -> onInizialized > Operation Failed. Aborting the process.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                            }
                        }
                    }

                    function startUserBot() {

                        if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> startUserBot ->  Entering function."); }

                        usertBot.start(onFinished);

                        function onFinished(err) {

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    logger.write("[INFO] run -> loop -> startUserBot -> onFinished > Execution finished well. :-)");
                                    saveContext();
                                    return;
                                }
                                    break;
                                case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                    logger.write("[ERROR] run -> loop -> startUserBot -> onFinished > Retry Later. Requesting Execution Retry.");
                                    nextWaitTime = 'Retry';
                                    loopControl(nextWaitTime);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                    logger.write("[ERROR] run -> loop -> startUserBot -> onFinished > Operation Failed. Aborting the process.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                            }
                        }
                    }

                    function saveContext() {

                        if (FULL_LOG === true) { logger.write("[INFO] run -> loop -> saveContext ->  Entering function."); }

                        context.saveThemAll(onFinished);

                        function onFinished(err) {

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    logger.write("[INFO] run -> loop -> saveContext -> onFinished > Execution finished well. :-)");
                                    nextWaitTime = 'Normal';
                                    loopControl(nextWaitTime);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                    logger.write("[ERROR] run -> loop -> saveContext -> onFinished > Can not retry at this point.");
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                    logger.write("[ERROR] run -> loop -> saveContext -> onFinished > Operation Failed. Aborting the process.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                            }
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] run -> loop -> err = " + err.message);
                    callBackFunction(err);
                }
            }

            function loopControl(nextWaitTime) {

                if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> nextWaitTime = " + nextWaitTime); }

                /* Here we check if we must stop the loop gracefully. */

                if (shallWeStop() === true) {

                    if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Stopping the Loop Gracefully. See you next time! :-)"); }
                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                }

                /* Trading bots are going to be executed after a configured period of time after the last execution ended. This is to avoid overlapping executions. */

                switch (nextWaitTime) {
                    case 'Normal': {
                        if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Restarting Loop in " + (processConfig.executionWaitTime / 1000) + " seconds."); }
                        setTimeout(loop, processConfig.executionWaitTime);
                    }
                        break;
                    case 'Retry': {
                        if (FULL_LOG === true) { logger.write("[INFO] run -> loopControl -> Restarting Loop in " + (processConfig.retryWaitTime / 1000) + " seconds."); }
                        setTimeout(loop, processConfig.retryWaitTime);
                    }
                        break;
                } 
            }

            function shallWeStop() {

                var fs = require('fs');
                let vmConfig;

                try {

                    vmConfig = JSON.parse(fs.readFileSync('this.vm.config.json', 'utf8'));
                    return vmConfig.stopGrafully;
                }
                catch (err) {
                    const logText = "[ERROR] 'readConfig' - ERROR : " + err.message;
                    console.log(logText);

                    return;
                }
            }
        }

        catch (err) {
            logger.write("[ERROR] run -> err = " + err.message);
        }
    }
};
