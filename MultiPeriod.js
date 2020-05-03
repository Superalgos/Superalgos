exports.newMultiPeriod = function newMultiPeriod(bot, logger, UTILITIES, USER_BOT_MODULE, USER_BOT_COMMONS) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const MODULE_NAME = "Multi Period";
    const GMT_SECONDS = ':00.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(logger);

    let statusDependencies;
    let dataDependenciesModule;
    let dataFiles = new Map();
    let multiPeriodDataFiles = new Map();

    let botInstance;

    const FILE_STORAGE = require('./FileStorage.js');
    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, pStatusDependencies, pDataDependencies, exchangeAPI, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;
            dataDependenciesModule = pDataDependencies;
            processConfig = pProcessConfig;

            let USER_BOT_MODULE = require("./TradingBot")

            botInstance = USER_BOT_MODULE.newTradingBot(bot, logger, UTILITIES, FILE_STORAGE);
            botInstance.initialize(exchangeAPI, callBackFunction);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        dataFiles = undefined
        multiPeriodDataFiles = undefined
        statusDependencies = undefined
        dataDependenciesModule = undefined
        botInstance.finalize() 
        botInstance = undefined
        fileStorage = undefined
        processConfig = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let currentTimeFrame
            let currentTimeFrameLabel  

            let market = bot.market;
            let botNeverRan = true;

            /* Context Variables */

            let contextVariables = {
                lastFile: undefined,                // Datetime of the last file files sucessfully produced by this process.
                dateBeginOfMarket: undefined,       // Datetime of the first trade file in the whole market history.
                dateEndOfMarket: undefined          // Datetime of the last file available to be used as an input of this process.
            };

            let previousDay;                        // Holds the date of the previous day relative to the processing date.

            let interExecutionMemoryArray = [];

            getContextVariables();

            function getContextVariables() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Entering function."); }

                    let thisReport;
                    let reportKey;
                    let statusReport;

                    /* We are going to use the start date as beging of market date. */
                    contextVariables.dateBeginOfMarket = bot.VALUES_TO_USE.timeRange.initialDatetime                

                    /*
                        Here we get the status report from the bot who knows which is the end of the market.
                    */

                    statusReport = statusDependencies.reportsByMainUtility.get("Market Ending Point")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusReport.file;

                    if (thisReport.lastFile === undefined) {
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Undefined Last File. -> thisReport = " + JSON.stringify(thisReport));

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    contextVariables.dateEndOfMarket = new Date(thisReport.lastFile.valueOf());

                    /* Validation that the data is not up-to-date. */

                    if (bot.multiPeriodProcessDatetime.valueOf() - ONE_DAY_IN_MILISECONDS > contextVariables.dateEndOfMarket.valueOf() && bot.SESSION.type !== "Backtesting Session") {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> " + "Head of the market is @ " + contextVariables.dateEndOfMarket); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> You need to UPDATE your datasets in order to run a " + bot.SESSION.type) }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;

                    }

                    /* Finally we get our own Status Report. */

                    statusReport = statusDependencies.reportsByMainUtility.get("Self Reference")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.");
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    thisReport = statusReport.file;

                    if (thisReport.lastFile !== undefined) {

                        if (bot.hasTheBotJustStarted === true && bot.resumeExecution === false) {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining because bot has just started and resume execution was true."); }
                            startFromBegining();
                            return;
                        }

                        contextVariables.lastFile = new Date(thisReport.lastFile);
                        interExecutionMemoryArray = thisReport.interExecutionMemoryArray;

                        processSingleFiles();
                        return;

                    } else {

                        /*
                        In the case when there is no status report, we assume like the last processed file is the one on the date of Begining of Market.
                        */
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining of the market because own status report not found or lastFile was undefined."); }
                        startFromBegining();
                        return;
                    }

                    function startFromBegining() {

                        contextVariables.lastFile = new Date(contextVariables.dateBeginOfMarket.getUTCFullYear() + "-" + (contextVariables.dateBeginOfMarket.getUTCMonth() + 1) + "-" + contextVariables.dateBeginOfMarket.getUTCDate() + " " + "00:00" + GMT_SECONDS);

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> startFromBegining -> contextVariables.lastFile = " + contextVariables.lastFile); }

                        /*
                        The first time the process is running is the right time to create the data structure that is going to be shared across different executions.
                        This data structure has one object per each timeFrame.
                        */

                        interExecutionMemoryArray = [];

                        for (let i = 0; i < global.dailyFilePeriods.length; i++) {
                            let emptyObject = {};
                            interExecutionMemoryArray.push(emptyObject);
                        }

                        processSingleFiles();

                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its statusDependencies declarations are correct. ");
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function processSingleFiles() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processSingleFiles -> Entering function."); }

                try {
                    let dependencyIndex = 0;
                    dataFiles = new Map();

                    dependencyLoopBody();

                    function dependencyLoopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processSingleFiles ->  dependencyLoopBody -> Entering function."); }

                            let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                            let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];

                            getFile();

                            function getFile() {
                                try {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processSingleFiles ->  dependencyLoopBody -> getFile -> Entering function."); }

                                    if (datasetModule.node.code.codeName !== "Single-File") {
                                        dependencyControlLoop();
                                        return
                                    }

                                    if (dataDependenciesModule.isItADepenency('atAnyTimeFrame', datasetModule.node.parentNode.code.singularVariableName) !== true) {
                                        dependencyControlLoop();
                                        return
                                    }

                                    let fileName = "Data.json";
                                    let filePath = datasetModule.node.parentNode.code.codeName + '/' + datasetModule.node.code.codeName;
                                    datasetModule.getTextFile(filePath, fileName, onFileReceived);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processSingleFiles ->  dependencyLoopBody -> getFile -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> processSingleFiles ->  dependencyLoopBody -> getFile -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                if (err.message === 'File does not exist.') {
                                                    logger.write(MODULE_NAME, "[ERROR] The file " + filePath + '/' + fileName + ' does not exist and it is required to continue. This process will retry to read it in a while. In the meantime make yourself sure that the process that generates it has ran properly.');
                                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                } else {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> processSingleFiles ->  dependencyLoopBody -> getFile -> onFileReceived -> err = " + err.message);
                                                    callBackFunction(err);
                                                }
                                                return;
                                            }

                                            let dataFile = JSON.parse(text);
                                            dataFiles.set(dependency.id, dataFile);

                                            dependencyControlLoop();

                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processSingleFiles ->  dependencyLoopBody -> getFile -> onFileReceived -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processSingleFiles ->  dependencyLoopBody -> getFile -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processSingleFiles -> timeFramesLoop -> dependencyLoopBody -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function dependencyControlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processSingleFiles -> dependencyControlLoop -> Entering function."); }

                            dependencyIndex++;

                            if (dependencyIndex < dataDependenciesModule.nodeArray.length) {

                                dependencyLoopBody();

                            } else {

                                let mapKey = "Single Files"
                                multiPeriodDataFiles.set(mapKey, dataFiles)

                                processMarketFiles();

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processSingleFiles -> dependencyControlLoop -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> processSingleFiles -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function processMarketFiles() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processMarketFiles -> Entering function."); }

                try {

                    let n;

                    timeFramesLoop();

                    function timeFramesLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processMarketFiles -> timeFramesLoop -> Entering function."); }

                            /*
                            We will iterate through all posible timeFrames.
                            */

                            n = 0   // loop Variable representing each possible period as defined at the timeFrames array.

                            timeFramesLoopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> timeFramesLoop -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function timeFramesLoopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processMarketFiles -> timeFramesLoopBody -> Entering function."); }

                            const timeFrame = global.marketFilesPeriods[n][0];
                            const timeFrameLabel = global.marketFilesPeriods[n][1];

                            let dependencyIndex = 0;
                            dataFiles = new Map();

                            if (bot.VALUES_TO_USE.timeFrame === timeFrameLabel) {
                                currentTimeFrame = global.marketFilesPeriods[n][0];
                                currentTimeFrameLabel = global.marketFilesPeriods[n][1];
                            }
                            dependencyLoopBody();

                            function dependencyLoopBody() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processMarketFiles -> timeFramesLoopBody -> dependencyLoopBody -> Entering function."); }

                                    let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                                    let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];

                                    getFile();

                                    function getFile() {
                                        try {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processMarketFiles -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> Entering function."); }

                                            if (dependency.referenceParent.code.codeName !== "Multi-Period-Market") {
                                                dependencyControlLoop();
                                                return
                                            }

                                            if (dataDependenciesModule.isItADepenency(timeFrameLabel, datasetModule.node.parentNode.code.singularVariableName) !== true) {
                                                if (!(bot.VALUES_TO_USE.timeFrame === timeFrameLabel && datasetModule.node.parentNode.code.pluralVariableName === 'candles')) {
                                                    dependencyControlLoop();
                                                    return
                                                }
                                            }

                                            let fileName = "Data.json";
                                            let filePath = dependency.referenceParent.parentNode.code.codeName + '/' + dependency.referenceParent.code.codeName + "/" + timeFrameLabel;
                                            datasetModule.getTextFile(filePath, fileName, onFileReceived);

                                            function onFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processMarketFiles -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> processMarketFiles -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> text = " + text); }

                                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                        if (err.message === 'File does not exist.') {
                                                            logger.write(MODULE_NAME, "[ERROR] The file " + filePath + '/' + fileName + ' does not exist and it is required to continue. This process will retry to read it in a while. In the meantime make yourself sure that the process that generates it has ran properly.');
                                                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                        } else {
                                                            logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = " + err.message);
                                                            callBackFunction(err);
                                                        }                                                        
                                                        return;
                                                    }

                                                    let dataFile = JSON.parse(text);
                                                    dataFiles.set(dependency.id, dataFile);

                                                    dependencyControlLoop();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = " + err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> timeFramesLoop -> dependencyLoopBody -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function dependencyControlLoop() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processMarketFiles -> dependencyControlLoop -> Entering function."); }

                                    dependencyIndex++;

                                    if (dependencyIndex < dataDependenciesModule.nodeArray.length) {

                                        dependencyLoopBody();

                                    } else {
                                                            
                                        let mapKey = global.marketFilesPeriods[n][1];
                                        multiPeriodDataFiles.set(mapKey, dataFiles)

                                        timeFramesControlLoop();

                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> dependencyControlLoop -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> timeFramesLoopBody -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function timeFramesControlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processMarketFiles -> timeFramesControlLoop -> Entering function."); }

                            n++;

                            if (n < global.marketFilesPeriods.length) {

                                timeFramesLoopBody();

                            } else {

                                processDailyFiles();

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> timeFramesControlLoop -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function processDailyFiles() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> Entering function."); }

                try {

                    let n = 0;

                    if (currentTimeFrame) {
                        callTheBot()
                        return
                    } 

                    bot.multiPeriodProcessDatetime = new Date(contextVariables.lastFile.valueOf() - ONE_DAY_IN_MILISECONDS); // Go back one day to start well when we advance time at the begining of the loop.

                    advanceTime();

                    function advanceTime() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> advanceTime -> Entering function."); }

                            bot.multiPeriodProcessDatetime = new Date(bot.multiPeriodProcessDatetime.valueOf() + ONE_DAY_IN_MILISECONDS);
                            previousDay = new Date(bot.multiPeriodProcessDatetime.valueOf() - ONE_DAY_IN_MILISECONDS);
                           
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> advanceTime -> bot.multiPeriodProcessDatetime = " + bot.multiPeriodProcessDatetime); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> advanceTime -> previousDay = " + previousDay); }

                            /* Validation that we are not going past the user defined end date. */

                            if (bot.multiPeriodProcessDatetime.valueOf() >= bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf()) {

                                const logText = "User Defined End Datetime reached @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> advanceTime -> " + logText); }

                                bot.STOP_SESSION = true
                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;

                            }

                            /* Validation that we are not going past the head of the market. */

                            if (bot.multiPeriodProcessDatetime.valueOf() > contextVariables.dateEndOfMarket.valueOf() + ONE_DAY_IN_MILISECONDS - 1) {

                                const logText = "Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> advanceTime -> " + logText); }

                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;

                            }

                            checkStopTaskGracefully();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> advanceTime -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function checkStopTaskGracefully() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> checkStopTaskGracefully -> Entering function."); }

                            /* Validation that we dont need to stop. */

                            if (global.STOP_TASK_GRACEFULLY === true) {

                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;

                            }

                            checkStopProcessing();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> checkStopTaskGracefully -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function checkStopProcessing() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> checkStopProcessing -> Entering function."); }

                            /* Validation that we dont need to stop. */

                            if (bot.STOP_SESSION === true) {

                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;

                            }

                            timeFramesLoop();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> checkStopProcessing -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function timeFramesLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoop -> Entering function."); }

                            /*  Telling the world we are alive and doing well */
                            let processingDate = bot.multiPeriodProcessDatetime.getUTCFullYear() + '-' + utilities.pad(bot.multiPeriodProcessDatetime.getUTCMonth() + 1, 2) + '-' + utilities.pad(bot.multiPeriodProcessDatetime.getUTCDate(), 2);
                            bot.processHeartBeat(processingDate)  

                            /*

                            We will iterate through all posible timeFrames.

                            */

                            n = 0   // loop Variable representing each possible period as defined at the timeFrames array.

                            timeFramesLoopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoop -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function timeFramesLoopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoopBody -> Entering function."); }

                            const timeFrame = global.dailyFilePeriods[n][0];
                            const timeFrameLabel = global.dailyFilePeriods[n][1];

                            if (processConfig.framework.validtimeFrames !== undefined) {
                                let validPeriod = false;
                                for (let i = 0; i < processConfig.framework.validtimeFrames.length; i++) {
                                    let period = processConfig.framework.validtimeFrames[i];
                                    if (period === timeFrameLabel) { validPeriod = true }
                                }
                                if (validPeriod === false) {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoopBody -> Discarding period for not being listed as a valid period. -> timeFrameLabel = " + timeFrameLabel); }
                                    timeFramesControlLoop();
                                    return;
                                }
                            }

                            if (bot.VALUES_TO_USE.timeFrame === timeFrameLabel) {
                                currentTimeFrame = global.dailyFilePeriods[n][0];
                                currentTimeFrameLabel = global.dailyFilePeriods[n][1];
                            }

                            let dependencyIndex = 0;
                            dataFiles = new Map();
                            dependencyLoopBody();

                            function dependencyLoopBody() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> Entering function."); }

                                    let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                                    let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];

                                    let previousFile;
                                    let currentFile;

                                    if (bot.multiPeriodProcessDatetime.valueOf() > contextVariables.dateBeginOfMarket.valueOf()) {
                                        getPreviousFile();
                                    } else {
                                        previousFile = [];
                                        getCurrentFile()
                                    }

                                    function getPreviousFile() {
                                        try {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> Entering function."); }

                                            if (dependency.referenceParent.code.codeName !== "Multi-Period-Daily") {
                                                dependencyControlLoop();
                                                return
                                            }

                                            if (dataDependenciesModule.isItADepenency(timeFrameLabel, datasetModule.node.parentNode.code.singularVariableName) !== true) {
                                                if (!(bot.VALUES_TO_USE.timeFrame === timeFrameLabel && datasetModule.node.parentNode.code.pluralVariableName === 'candles')) {
                                                    dependencyControlLoop();
                                                    return
                                                }
                                            }

                                            let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2);
                                            let filePath

                                            if (dependency.referenceParent.code.codeName === "Multi-Period-Daily") {
                                                filePath = dependency.referenceParent.parentNode.code.codeName + '/' + dependency.referenceParent.code.codeName + "/" + timeFrameLabel + "/" + dateForPath;
                                            } else {
                                                filePath = dependency.referenceParent.parentNode.code.codeName + '/' + dependency.referenceParent.code.codeName + "/" + dateForPath;
                                            }
                                            let fileName =  "Data.json";

                                            datasetModule.getTextFile(filePath, fileName, onFileReceived);

                                            function onFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> text = " + text); }

                                                    if ((err.message === "File does not exist." && botNeverRan === true) || err.code === 'The specified key does not exist.') {

                                                        /*
                                                        Sometimes one of the dependencies of an indicator for some reasons are not calculated from the begining of the market.
                                                        When that happens we can not find those files. What we do in this situation is to move the time fordward until we can find
                                                        all the dependencies and the first run of the bot is successful.

                                                        After that, we will not accept more missing files on any of the dependencies, and if any is missing we will abort the processing.
                                                        */
                                                        logger.write(MODULE_NAME, "[WARN] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> Skipping day because file " + filePath + "/" + fileName + " was not found.");

                                                        advanceTime();
                                                        return;
                                                    }

                                                    if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {

                                                        logger.write(MODULE_NAME, "[ERROR] The file " + filePath + '/' + fileName + ' does not exist and it is required to continue. This process will retry to read it in a while. In the meantime make yourself sure that the process that generates it has ran properly.');
                                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                        return;
                                                    }

                                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                        logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> err = " + err.stack);
                                                        callBackFunction(err);
                                                        return;
                                                    }

                                                    previousFile = JSON.parse(text);

                                                    getCurrentFile();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> err = " + err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                    function getCurrentFile() {
                                        try {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> Entering function."); }

                                            if (dependency.referenceParent.code.codeName !== "Multi-Period-Daily") {
                                                dependencyControlLoop();
                                                return
                                            }

                                            if (dataDependenciesModule.isItADepenency(timeFrameLabel, datasetModule.node.parentNode.code.singularVariableName) !== true) {
                                                if (!(bot.VALUES_TO_USE.timeFrame === timeFrameLabel && datasetModule.node.parentNode.code.pluralVariableName === 'candles')) {
                                                    dependencyControlLoop();
                                                    return
                                                }
                                            }

                                            let dateForPath = bot.multiPeriodProcessDatetime.getUTCFullYear() + '/' + utilities.pad(bot.multiPeriodProcessDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(bot.multiPeriodProcessDatetime.getUTCDate(), 2);
                                            let filePath
                                            if (dependency.referenceParent.code.codeName === "Multi-Period-Daily") {
                                                filePath = dependency.referenceParent.parentNode.code.codeName + '/' + dependency.referenceParent.code.codeName + "/" + timeFrameLabel + "/" + dateForPath;
                                            } else {
                                                filePath = dependency.referenceParent.parentNode.code.codeName + '/' + dependency.referenceParent.code.codeName + "/" + dateForPath;
                                            }
                                            let fileName =  "Data.json";

                                            datasetModule.getTextFile(filePath, fileName, onFileReceived);

                                            function onFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> text = " + text); }

                                                    if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {

                                                        logger.write(MODULE_NAME, "[ERROR] The file " + filePath + '/' + fileName + ' does not exist and it is required to continue. This process will retry to read it in a while. In the meantime make yourself sure that the process that generates it has ran properly.');
                                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                        return;
                                                    }

                                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                        logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> Not Ok -> err = " + err.code);
                                                        callBackFunction(err);
                                                        return;
                                                    }

                                                    currentFile = JSON.parse(text);

                                                    let dataFile = previousFile.concat(currentFile);

                                                    dataFiles.set(dependency.id, dataFile);

                                                    dependencyControlLoop();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> err = " + err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoop -> dependencyLoopBody -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function dependencyControlLoop() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> dependencyControlLoop -> Entering function."); }

                                    dependencyIndex++;

                                    if (dependencyIndex < dataDependenciesModule.nodeArray.length) {

                                        dependencyLoopBody();

                                    } else {

                                        let mapKey = global.dailyFilePeriods[n][1];
                                        multiPeriodDataFiles.set(mapKey, dataFiles)

                                        timeFramesControlLoop();

                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> dependencyControlLoop -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoopBody -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function timeFramesControlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> timeFramesControlLoop -> Entering function."); }

                            n++;

                            if (n < global.dailyFilePeriods.length) {

                                timeFramesLoopBody();

                            } else {

                                n = 0;

                                if (currentTimeFrame !== undefined) {
                                    callTheBot();
                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesControlLoop -> Time Frame not Recognized. Can not continue."  );
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesControlLoop -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function callTheBot() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> callTheBot -> Entering function."); }
                             
                            botInstance.start(
                                multiPeriodDataFiles,
                                currentTimeFrame,
                                currentTimeFrameLabel,
                                bot.multiPeriodProcessDatetime,
                                interExecutionMemoryArray[n],
                                onBotFinished);

                            function onBotFinished(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> callTheBot -> onBotFinished -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        callBackFunction(err);
                                        return;
                                    }

                                    botNeverRan = false;

                                    if (currentTimeFrame > global.dailyFilePeriods[0][0]) {
                                        writeMarketStatusReport(onMarketStatusReport)

                                    } else {
                                        writeDataRanges(currentTimeFrameLabel, onWritten);
                                    }

                                    function onWritten(err) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> callTheBot -> onBotFinished -> onWritten -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> callTheBot -> onBotFinished -> onWritten -> err = " + err.stack);
                                                callBackFunction(err);
                                                return;
                                            }

                                            writeDailyStatusReport(bot.multiPeriodProcessDatetime, onDailyStatusReport);

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> callTheBot -> onBotFinished -> onWritten -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }


                                    function onDailyStatusReport() {
                                        try {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> callTheBot -> onBotFinished -> onDailyStatusReport -> Entering function."); }

                                            /* The next run we need the process to continue at the date it finished. */
                                            processConfig.framework.startDate.resumeExecution = true; 

                                            advanceTime();
                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> callTheBot -> onBotFinished -> onDailyStatusReport -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                    function onMarketStatusReport() {
                                        try {
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> callTheBot -> onBotFinished -> onMarketStatusReport -> Entering function."); }

                                            /* This is where we check if we need reached the user defined end datetime.  */

                                            const now = new Date()
                                            if (now.valueOf() >= bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf()) {

                                                const logText = "User Defined End Datetime reached @ " + now.getUTCFullYear() + "/" + (now.getUTCMonth() + 1) + "/" + now.getUTCDate() + ".";
                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> callTheBot -> onBotFinished -> onMarketStatusReport -> " + logText); }

                                                bot.STOP_SESSION = true
                                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                return;

                                            }

                                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> callTheBot -> onBotFinished -> onMarketStatusReport -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> callTheBot -> onBotFinished -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> callTheBot -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeDataRanges(currentTimeFrameLabel, callBack) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRanges -> Entering function."); }

                    let outputDatasetIndex = -1;
                    controlLoop();

                    function productLoopBody() {
                        let productCodeName = bot.processNode.referenceParent.processOutput.outputDatasets[outputDatasetIndex].referenceParent.parentNode.code.codeName;
                        writeDataRange(contextVariables.dateBeginOfMarket, bot.multiPeriodProcessDatetime, productCodeName, currentTimeFrameLabel, controlLoop);
                    }

                    function controlLoop() {

                        outputDatasetIndex++;

                        if (outputDatasetIndex < bot.processNode.referenceParent.processOutput.outputDatasets.length) {
                            productLoopBody();
                        } else {
                            callBack(global.DEFAULT_OK_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeDataRanges -> err = " + err.stack);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }

            }

            function writeDataRange(pBegin, pEnd, productCodeName, currentTimeFrameLabel, callBack) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> Entering function."); }

                    let dataRange = {
                        begin: pBegin.valueOf(),
                        end: pEnd.valueOf() + ONE_DAY_IN_MILISECONDS
                    };

                    let fileContent = JSON.stringify(dataRange);

                    let fileName = '/Data.Range.json';
                    let filePath = bot.filePathRoot + "/Output/" + bot.SESSION.folderName + "/" + productCodeName + "/" + 'Multi-Period-Daily' + fileName;

                    fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> onFileCreated -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> onFileCreated -> err = " + err.stack);
                            callBack(err);
                            return;
                        }

                        if (LOG_FILE_CONTENT === true) {
                            logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> onFileCreated ->  Content written = " + fileContent);
                        }

                        let key = bot.dataMine + "-" + bot.codeName + "-" + productCodeName  + "-" + bot.exchange + "-" + bot.market.baseAsset + '/' + bot.market.quotedAsset
                        let event = {
                            dateRange: dataRange
                        }
 
                        global.EVENT_SERVER_CLIENT.raiseEvent(key, 'Data Range Updated', event)

                        callBack(global.DEFAULT_OK_RESPONSE);
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> err = " + err.stack);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeDailyStatusReport(lastFileDate, callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyStatusReport -> Entering function."); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyStatusReport -> lastFileDate = " + lastFileDate); }

                try {

                    let reportKey = bot.dataMine + "-" + bot.codeName + "-" + "Multi-Period" + "-" + "dataSet.V1";
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.currentDaytime;
                    thisReport.file.lastFile = lastFileDate;
                    thisReport.file.interExecutionMemoryArray = interExecutionMemoryArray;
                    thisReport.save(callBack);

                    bot.hasTheBotJustStarted = false;

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyStatusReport -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeMarketStatusReport(callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketStatusReport -> Entering function."); }

                try {

                    let reportKey = bot.dataMine + "-" + bot.codeName + "-" + "Multi-Period" + "-" + "dataSet.V1";
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.processDatetime;
                    thisReport.save(callBack);

                    logger.newInternalLoop(bot.codeName, bot.process, bot.multiPeriodProcessDatetime);
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketStatusReport -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        }

        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad(" " + str, max) : str;
    }
};
