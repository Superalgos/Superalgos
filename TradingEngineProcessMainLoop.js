exports.newTradingEngineProcessMainLoop = function newTradingEngineProcessMainLoop(bot, parentLogger) {

    const ROOT_DIR = './';

    const MODULE_NAME = "Trading Engine Process Main Loop";
    const FULL_LOG = true;

    let USER_BOT_MODULE;
    let COMMONS_MODULE;

    const MULTI_PERIOD_MARKET = require(ROOT_DIR + 'MultiPeriodMarket');
    const MULTI_PERIOD_DAILY = require(ROOT_DIR + 'MultiPeriodDaily');
    const MULTI_PERIOD = require(ROOT_DIR + 'MultiPeriod');
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

            let filePath = bot.devTeam + "/" + "bots" + "/" + bot.repo + "/" + pProcessConfig.name
            filePath += "/User.Bot.js"

            fileStorage.getTextFile(bot.devTeam, filePath, onBotDownloaded);

            function onBotDownloaded(err, text) {

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> onBotDownloaded -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                USER_BOT_MODULE = {}
                //USER_BOT_MODULE.newUserBot = require(process.env.BOTS_PATH + '/aamasters/AAMasters/bots/AAJason-Trading-Engine-Bot/Multi-Period/User.Bot').newUserBot // Use this for a better debugging experience. You need to bring this js module to this folder in order to work.
                USER_BOT_MODULE.newUserBot = eval(text); // Use this for production

                filePath = bot.devTeam + "/" + "bots" + "/" + bot.repo;
                filePath += "/Commons.js"

                fileStorage.getTextFile(bot.devTeam, filePath, onCommonsDownloaded);

                function onCommonsDownloaded(err, text) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        parentLogger.write(MODULE_NAME, "[WARN] initialize -> onBotDownloaded -> onCommonsDownloaded -> Commons not found: " + err.code || err.message);
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }

                    COMMONS_MODULE = {}
                    //COMMONS_MODULE.newCommons = require(process.env.BOTS_PATH + '/aamasters/AAMasters/bots/AAJason-Trading-Engine-Bot/Commons').newCommons // Use this for a better debugging experience. You need to bring this js module to this folder in order to work.
                    COMMONS_MODULE.newCommons = eval(text); // Use this for production

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

            /* Check if there is a session */
            if (bot.processNode.session === undefined) {
                parentLogger.write(MODULE_NAME, "[ERROR] run -> Cannot run without a Session.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return;
            }

            /* Some initial values*/
            bot.enableCheckLoopHealth = true;
            let fixedTimeLoopIntervalHandle;
            global.STOP_PROCESSING = true;

            /* Listen to event to start or stop the session. */

            let key = 'Session' + '-' + bot.processNode.session.id + '-' + 'Events'

            global.SYSTEM_EVENT_HANDLER.listenToEvent(key, 'Run Session', undefined, undefined, undefined, runSession)
            global.SYSTEM_EVENT_HANDLER.listenToEvent(key, 'Stop Session', undefined, undefined, undefined, stopSession)

            function runSession(message) {
                switch (bot.processNode.session.type) {
                    case 'Backtesting Session': {
                        startBackTesting(message)
                        break
                    }
                    case 'Live Trading Session': {
                        startLiveTrading(message)
                        break
                    }
                }
            }

            function stopSession(message) {
                global.STOP_PROCESSING = true
            }

            function startBackTesting(message) {

                /* We are going to run the Definition comming at the event. */
                global.DEFINITION = JSON.parse(message.event.definition)

                bot.startMode = "Backtest"
                processConfig.framework.startDate.resumeExecution = false;
                global.STOP_PROCESSING = false
                bot.hasTheBotJustStarted = true
                setValuesToUse(message)

                const ONE_YEAR_IN_MILISECONDS = 365 * 24 * 60 * 60 * 1000
                /* If we can not get for any reason the initial date of the backtest, we will start at present time. */
                processConfig.framework.startDate.fixedDate = new Date() 
                /* If we can not get for any reason the final date of the backtest, we will stop one year after the start date. */
                processConfig.framework.endDate.fixedDate = new Date(processConfig.framework.startDate.fixedDate.valueOf() + ONE_YEAR_IN_MILISECONDS) 

                /* Convert this dates to string */
                processConfig.framework.startDate.fixedDate = processConfig.framework.startDate.fixedDate.toISOString()
                processConfig.framework.endDate.fixedDate = processConfig.framework.endDate.fixedDate.toISOString()

                /* If we received simulation params we use them instead. */
                if (global.DEFINITION.simulationParams) {
                    if (global.DEFINITION.simulationParams.beginDatetime) {
                        processConfig.framework.startDate.fixedDate = global.DEFINITION.simulationParams.beginDatetime
                    }
                }

                /* We finally will try to exctact the initial and final date for the backtest from the Definition */
                if (global.DEFINITION.tradingSystem !== undefined) {
                    if (global.DEFINITION.tradingSystem.parameters !== undefined) {
                        if (global.DEFINITION.tradingSystem.parameters.timeRange !== undefined) {
                            if (global.DEFINITION.tradingSystem.parameters.timeRange.code !== undefined) {
                                try {
                                    let code = JSON.parse(global.DEFINITION.tradingSystem.parameters.timeRange.code)
                                    if (code.initialDatetime !== undefined) {
                                        processConfig.framework.startDate.fixedDate = code.initialDatetime /* The second override occurs here, with the date explicitelly defined by the user */
                                    }
                                    if (code.finalDatetime !== undefined) {
                                        processConfig.framework.endDate.fixedDate = code.finalDatetime
                                    }
                                } catch (err) {
                                    global.DEFINITION.tradingSystem.parameters.timeRange.error = err.message
                                }
                            }
                        }
                    }
                }
                bot.multiPeriodDailyProcessDatetime = processConfig.framework.startDate.fixedDate
            }

            function startLiveTrading(message) {

                /* We are going to run the Definition comming at the event. */
                global.DEFINITION = JSON.parse(message.event.definition)

                if (global.DEFINITION.personalData) {
                    if (global.DEFINITION.personalData.exchangeAccounts) {
                        if (global.DEFINITION.personalData.exchangeAccounts.length > 0) {
                            let exchangeAccount = global.DEFINITION.personalData.exchangeAccounts[0]
                            if (exchangeAccount.keys) {
                                if (exchangeAccount.keys.length > 0) {
                                    let key = exchangeAccount.keys[0]

                                    process.env.KEY = key.name
                                    process.env.SECRET = key.code

                                }
                            }
                        }
                    }
                }

                if (process.env.KEY === undefined || process.env.SECRET === undefined) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] run -> startLiveTrading -> Key name or Secret not provided, not possible to run the process in Live mode."); }
                    return
                }

                bot.startMode = "Live"
                processConfig.framework.startDate.fixedDate = new Date()
                processConfig.framework.startDate.resumeExecution = false;
                bot.multiPeriodDailyProcessDatetime = processConfig.framework.startDate.fixedDate
                global.STOP_PROCESSING = false
                bot.hasTheBotJustStarted = true
                setValuesToUse(message)
            }

            function setValuesToUse(message) {
                /*
                    Base on the information received we will determined which values ultimatelly are going to be used,
                    and once we do, they will become constants across the multiple loops executions.
                */

                bot.SESSION = JSON.parse(message.event.session)
                bot.VALUES_TO_USE = {}

                if (global.DEFINITION !== undefined) {
                    let tradingSystem = global.DEFINITION.tradingSystem

                    if (tradingSystem) {
                        if (tradingSystem.parameters !== undefined) {

                            /* Decide which Initial Balance we are going to use. */
                            if (tradingSystem.parameters.baseAsset !== undefined) {
                                let code
                                try {
                                    /* Default Value */
                                    bot.VALUES_TO_USE.initialBalanceAssetB = 0.001;
                                    bot.VALUES_TO_USE.initialBalanceAssetA = 0

                                    code = JSON.parse(tradingSystem.parameters.baseAsset.code);

                                    if (code.name !== undefined) {
                                        baseAsset = code.name;
                                        if (baseAsset !== 'BTC' && baseAsset !== 'USDT') {
                                            /* using BTC as default */
                                            baseAsset = 'BTC'
                                        }
                                    }

                                    if (baseAsset === 'BTC') { // NOTE: POLONIEX, the only exchange working so far, has Asset A and B inverted. We need to fix this.
                                        if (code.initialBalance !== undefined) {
                                            bot.VALUES_TO_USE.initialBalanceAssetB = code.initialBalance;
                                            bot.VALUES_TO_USE.initialBalanceAssetA = 0
                                        }
                                    } else {
                                        if (code.initialBalance !== undefined) {
                                            bot.VALUES_TO_USE.initialBalanceAssetA = code.initialBalance;
                                            bot.VALUES_TO_USE.initialBalanceAssetB = 0
                                        }
                                    }
                                } catch (err) {
                                    global.DEFINITION.tradingSystem.parameters.baseAsset.error = err.message

                                    bot.VALUES_TO_USE.initialBalanceAssetA = 0 // default
                                    bot.VALUES_TO_USE.initialBalanceAssetB = 0.001 // default

                                }
                            }

                            /* Decide which Time Period we are going to use.*/

                            /* This is the last fallback */
                            bot.VALUES_TO_USE.timePeriod = global.DEFINITION.simulationParams.timePeriod 

                            /* Secondary option, if exists. */
                            if (tradingSystem.parameters.timePeriod !== undefined) {
                                bot.VALUES_TO_USE.timePeriod = tradingSystem.parameters.timePeriod.code  
                            }

                            /* Primary source of information, if it exists */
                            if (bot.SESSION !== undefined) {
                                if (bot.SESSION.parameters !== undefined) {
                                    if (bot.SESSION.parameters.timePeriod !== undefined) {
                                        bot.VALUES_TO_USE.timePeriod = bot.SESSION.parameters.timePeriod.code 
                                    }
                                }
                            }
                        }
                    }
                }
            }

            loop();

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

                    let nextWaitTime;

                    /* Loop Heartbeat sent to the UI */
                    bot.hearBeat = hearBeat // allow the bot itself to produce a heartbeat
                    hearBeat() 

                    /* We define here all the modules that the rest of the infraestructure, including the bots themselves can consume. */

                    const UTILITIES = require(ROOT_DIR + 'CloudUtilities');
                    const EXCHANGE_API = require('@superalgos/exchange-gateway');
                    const CONTEXT = require(ROOT_DIR + 'Context');
                    const ASSISTANT = require(ROOT_DIR + 'Assistant');
                    const STATUS_REPORT = require(ROOT_DIR + 'StatusReport');
                    const STATUS_DEPENDENCIES = require(ROOT_DIR + 'StatusDependencies');
                    const DATA_DEPENDENCIES = require(ROOT_DIR + 'DataDependencies');
                    const DATA_SET = require(ROOT_DIR + 'DataSet');

                    /* We define the datetime for the process that we are running now. This will be the official processing time for both the infraestructure and the bot. */

                    bot.processDatetime = new Date();           // This will be considered the process date and time, so as to have it consistenly all over the execution.

                    /* High level log entry  */

                    console.log(new Date().toISOString() + " " + pad(bot.codeName, 20) + " " + pad(bot.process, 30)
                        + " Entered into Main Loop # " + pad(Number(bot.loopCounter), 8));

                    /* Checking if we should process this loop or not.*/
                    if (global.STOP_PROCESSING === true) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> Waiting for " + bot.processNode.session.type + " " + bot.processNode.session.name + " to be started."); }

                        console.log(new Date().toISOString() + " " + pad(bot.codeName, 20) + " " + pad(bot.process, 30)
                            + " Waiting for " + bot.processNode.session.type + " " + bot.processNode.session.name + " to be started. ");

                        global.SYSTEM_EVENT_HANDLER.raiseEvent('Jason-Multi-Period', 'Process Stopped')

                        nextWaitTime = 'Normal';
                        loopControl(nextWaitTime);
                        return
                    }

                    /* We will prepare first the infraestructure needed for the bot to run. There are 3 modules we need to sucessfullly initialize first. */

                    let userBot;
                    let processFramework;
                    let statusDependencies;
                    let dataDependencies;

                    initializeStatusDependencies();

                    function initializeStatusDependencies() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeStatusDependencies ->  Entering function."); }

                            statusDependencies = STATUS_DEPENDENCIES.newStatusDependencies(bot, logger, STATUS_REPORT, UTILITIES);

                            statusDependencies.initialize(processConfig.statusDependencies, undefined, undefined, onInizialized);

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
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeStatusDependencies -> onInizialized -> Retry Later. Requesting Execution Retry.");
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

                    function initializeDataDependencies() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeDataDependencies ->  Entering function."); }

                            dataDependencies = DATA_DEPENDENCIES.newDataDependencies(bot, logger, DATA_SET);

                            dataDependencies.initialize(processConfig.dataDependencies, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeDataDependencies ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeDataDependencies -> onInizialized -> Execution finished well."); }
                                            initializeContext();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeDataDependencies -> onInizialized -> Retry Later. Requesting Execution Retry.");
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
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeDataDependencies -> onInizialized -> Unhandled err.result received. -> err = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeDataDependencies ->  onInizialized -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeDataDependencies -> err = "+ err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function initializeContext() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeContext ->  Entering function."); }

                            context = CONTEXT.newContext(bot, logger, UTILITIES);
                            context.initialize(statusDependencies, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeContext ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeContext -> onInizialized -> Execution finished well."); }
                                            initializeExchangeAPI();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeContext -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeContext -> onInizialized -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeContext -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeContext -> onInizialized -> Unhandled err.result received. -> err = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeContext ->  onInizialized -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeContext -> err = "+ err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function initializeExchangeAPI() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeExchangeAPI ->  Entering function."); }

                            exchangeAPI = EXCHANGE_API.newExchangeAPI(logger, global.EXCHANGE_NAME);

                            exchangeAPI.initialize(onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeContext ->  onInizialized -> onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeExchangeAPI -> onInizialized -> Execution finished well."); }
                                            initializeAssistant();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeExchangeAPI -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeExchangeAPI -> onInizialized -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeExchangeAPI -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeExchangeAPI -> onInizialized -> Unhandled err.result received. -> err = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeContext ->  onInizialized -> onInizialized -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeExchangeAPI -> err = "+ err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function initializeAssistant() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeAssistant ->  Entering function."); }

                            assistant = ASSISTANT.newAssistant(bot, logger, UTILITIES);
                            assistant.initialize(context, exchangeAPI, dataDependencies, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeAssistant -> onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> initializeAssistant -> onInizialized -> Execution finished well."); }

                                            /* If the process is configured to run inside a framework, we continue there, otherwise we run the bot directly. */
                                            if (processConfig.framework === undefined) {
                                                initializeUserBot();
                                                return;
                                            }

                                            switch (processConfig.framework.name) {
                                                case 'Multi-Period-Market': {
                                                    processFramework = MULTI_PERIOD_MARKET.newMultiPeriodMarket(bot, logger, COMMONS_MODULE, UTILITIES, USER_BOT_MODULE, COMMONS_MODULE);
                                                    intitializeProcessFramework();
                                                    break;
                                                }
                                                case 'Multi-Period-Daily': {
                                                    processFramework = MULTI_PERIOD_DAILY.newMultiPeriodDaily(bot, logger, COMMONS_MODULE, UTILITIES, USER_BOT_MODULE, COMMONS_MODULE);
                                                    intitializeProcessFramework();
                                                    break;
                                                }
                                                case 'Multi-Period': {
                                                    processFramework = MULTI_PERIOD.newMultiPeriod(bot, logger, COMMONS_MODULE, UTILITIES, USER_BOT_MODULE, COMMONS_MODULE);
                                                    intitializeProcessFramework();
                                                    break;
                                                }
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeAssistant -> onInizialized -> Process Framework not Supported.");
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeAssistant -> onInizialized -> Process Framework Name = " + processConfig.framework.name);
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(err);
                                                    return;
                                                }
                                            }
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> initializeAssistant -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeAssistant -> onInizialized -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeAssistant -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeAssistant -> onInizialized -> Unhandled err.result received. -> err = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeAssistant -> onInizialized -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> initializeAssistant -> err = "+ err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function intitializeProcessFramework() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> intitializeProcessFramework ->  Entering function."); }

                            processFramework.initialize(processConfig, statusDependencies, dataDependencies, assistant, onInizialized);

                            function onInizialized(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> intitializeProcessFramework ->  onInizialized -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> intitializeProcessFramework -> onInizialized -> Execution finished well.");
                                            startProcessFramework();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> intitializeProcessFramework -> onInizialized -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeProcessFramework -> onInizialized -> Operation Failed. Aborting the process.");
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
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> intitializeProcessFramework -> onInizialized > Too far in the future. This Loop will enter in coma.");
                                                    nextWaitTime = 'Coma';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Not needed now, but soon.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> intitializeProcessFramework -> onInizialized > Not needed now, but soon. This Loop will continue with Normal wait time.");
                                                    nextWaitTime = 'Normal';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeProcessFramework -> onInizialized > Unhandled custom response received. -> err = " + err.message);
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
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeProcessFramework -> onInizialized -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeProcessFramework -> onInizialized -> Unhandled err.result received. -> err = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeProcessFramework ->  onInizialized -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> intitializeProcessFramework -> err = "+ err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function startProcessFramework() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> startProcessFramework ->  Entering function."); }

                            processFramework.start(onFinished);

                            function onFinished(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> startProcessFramework -> onFinished -> Entering function."); }
                                    processFramework.finalize()
                                    processFramework = undefined

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            logger.write(MODULE_NAME, "[INFO] run -> loop -> startProcessFramework -> onFinished -> Execution finished well.");
                                            nextWaitTime = 'Normal';
                                            saveContext();
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[WARN] run -> loop -> startProcessFramework -> onFinished -> Retry Later. Requesting Execution Retry.");
                                            nextWaitTime = 'Retry';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessFramework -> onFinished -> Operation Failed. Aborting the process.");
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
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startProcessFramework -> onFinished -> Dependency does not exist. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Dependency not ready.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startProcessFramework -> onFinished -> Dependency not ready. This Loop will go to sleep.");
                                                    nextWaitTime = 'Sleep';
                                                    loopControl(nextWaitTime);
                                                    return;
                                                }
                                                case "Month before it is needed.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startProcessFramework -> onFinished -> Month before it is needed. This Loop will be terminated.");
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                case "Month fully processed.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startProcessFramework -> onFinished -> Month fully processed. This Loop will be terminated.");
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                case "End of the month reached.": {
                                                    logger.write(MODULE_NAME, "[WARN] run -> loop -> startProcessFramework -> onFinished -> End of the month reached. This Loop will be terminated.");
                                                    logger.persist();
                                                    clearInterval(fixedTimeLoopIntervalHandle);
                                                    clearTimeout(nextLoopTimeoutHandle);
                                                    clearTimeout(checkLoopHealthHandle);
                                                    bot.enableCheckLoopHealth = false;
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return;
                                                }
                                                default: {
                                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessFramework -> onFinished -> Unhandled custom response received. -> err = " + err.message);
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
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessFramework -> onFinished -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessFramework -> onFinished -> Unhandled err.result received. -> err = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessFramework -> onFinished -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessFramework -> err = "+ err.stack);
                            logger.persist();
                            clearInterval(fixedTimeLoopIntervalHandle);
                            clearTimeout(nextLoopTimeoutHandle);
                            clearTimeout(checkLoopHealthHandle);
                            bot.enableCheckLoopHealth = false;
                            callBackFunction(err);
                        }
                    }

                    function saveContext() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> saveContext ->  Entering function."); }

                            context.saveThemAll(onFinished);

                            function onFinished(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> saveContext -> onFinished -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> saveContext -> onFinished -> Execution finished well."); }
                                            nextWaitTime = 'Normal';
                                            loopControl(nextWaitTime);
                                            return;
                                        }
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> saveContext -> onFinished -> Can not retry at this point.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> saveContext -> onFinished -> Operation Failed. Aborting the process.");
                                            logger.persist();
                                            clearInterval(fixedTimeLoopIntervalHandle);
                                            clearTimeout(nextLoopTimeoutHandle);
                                            clearTimeout(checkLoopHealthHandle);
                                            bot.enableCheckLoopHealth = false;
                                            callBackFunction(err);
                                            return;
                                        }
                                        default: {
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> saveContext -> onFinished -> Unhandled err.result received. -> err.result = " + err.result);
                                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> saveContext -> onFinished -> Unhandled err.result received. -> err = " + err.message);

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
                                    logger.write(MODULE_NAME, "[ERROR] run -> loop -> saveContext -> onFinished -> err = "+ err.stack);
                                    logger.persist();
                                    clearInterval(fixedTimeLoopIntervalHandle);
                                    clearTimeout(nextLoopTimeoutHandle);
                                    clearTimeout(checkLoopHealthHandle);
                                    bot.enableCheckLoopHealth = false;
                                    callBackFunction(err);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] run -> loop -> saveContext -> err = "+ err.stack);
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

                        hearBeat()

                        /* Here we check if we must stop the loop gracefully. */

                        shallWeStop(onStop, onContinue);

                        function onStop() {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onStop -> Entering function."); }

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onStop -> Stopping the Loop Gracefully. See you next time!"); }

                            if (global.WRITE_LOGS_TO_FILES === 'true') {
                                logger.persist();
                            }

                            global.SYSTEM_EVENT_HANDLER.raiseEvent('Jason-Multi-Period', 'Process Stopped')

                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;

                        }

                        function onContinue() {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> onContinue -> Entering function."); }

                            /* Indicator bots are going to be executed after a configured period of time after the last execution ended. This is to avoid overlapping executions. */

                            switch (nextWaitTime) {
                                case 'Normal': {
                                    let waitTime
                                    if (bot.startMode === "Live") {
                                        waitTime = processConfig.liveWaitTime
                                    } else {
                                        waitTime = processConfig.normalWaitTime
                                    }

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (waitTime / 1000) + " seconds."); }
                                    if (processConfig.deadWaitTime > 0) {
                                        checkLoopHealthHandle = setTimeout(checkLoopHealth, processConfig.deadWaitTime, bot.loopCounter);
                                    }
                                    nextLoopTimeoutHandle = setTimeout(loop, waitTime);
                                    if (global.WRITE_LOGS_TO_FILES === 'true') {
                                        logger.persist();
                                    }
                                }
                                    break;
                                case 'Retry': {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> loopControl -> Restarting Loop in " + (processConfig.retryWaitTime / 1000) + " seconds."); }
                                    if (processConfig.deadWaitTime > 0) {
                                        checkLoopHealthHandle = setTimeout(checkLoopHealth, processConfig.deadWaitTime, bot.loopCounter);
                                    }
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

            function hearBeat() {
                let key = global.TASK_NODE.bot.processes[bot.processIndex].name + '-' + global.TASK_NODE.bot.processes[bot.processIndex].type + '-' + global.TASK_NODE.bot.processes[bot.processIndex].id

                let event = {
                    seconds: (new Date()).getSeconds()
                }
                global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Heartbeat', event)
            }

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] run -> err = "+ err.stack);
            clearInterval(fixedTimeLoopIntervalHandle);
            clearTimeout(nextLoopTimeoutHandle);
            clearTimeout(checkLoopHealthHandle);
            bot.enableCheckLoopHealth = false;
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
