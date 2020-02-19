exports.newMultiPeriodDaily = function newMultiPeriodDaily(bot, logger, UTILITIES, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const MODULE_NAME = "Multi Period Daily";
    const GMT_SECONDS = ':00.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(logger);

    let statusDependencies;
    let dataDependencies;
    let datasets = [];
    let dataFiles = new Map;

    let botInstance;

    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    let bootstrappingTheProcess = false 

    let processConfig;
    let beginingOfMarket

    return thisObject;

    function initialize(pProcessConfig, pStatusDependencies, pDataDependencies, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;
            dataDependencies = pDataDependencies;
            processConfig = pProcessConfig;

            for (let i = 0; i < dataDependencies.nodeArray.length; i++) {

                let key;
                let dataset;
                let dependency = dataDependencies.nodeArray[i];

                key = dependency.dataMine + "-" +
                    dependency.bot + "-" +
                    dependency.product + "-" +
                    dependency.dataSet + "-" +
                    dependency.dataSetVersion

                dataset = dataDependencies.dataSets.get(key);

                datasets.push(dataset);

            }

            let USER_BOT_MODULE = require("./IndicatorBot")

            botInstance = USER_BOT_MODULE.newIndicatorBot(bot, logger, UTILITIES, FILE_STORAGE);
            botInstance.initialize(callBackFunction);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        datasets = undefined
        dataFiles = undefined
        statusDependencies = undefined
        dataDependencies = undefined
        botInstance = undefined
        fileStorage = undefined
        processConfig = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = bot.market;

            /* Context Variables */

            let contextVariables = {
                lastFile: undefined,                // Datetime of the last file files sucessfully produced by this process.
                dateBeginOfMarket: undefined,       // Datetime of the first trade file in the whole market history.
                dateEndOfMarket: undefined          // Datetime of the last file available to be used as an input of this process.
            };

            let previousDay;                        // Holds the date of the previous day relative to the processing date.

            let interExecutionMemoryArray;

            getContextVariables();

            function getContextVariables() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Entering function."); }

                    let thisReport;
                    let reportKey;
                    let statusReport;

                    if (processConfig.framework.startDate.fixedDate !== undefined) {

                        /* The starting date is fixed, we will start from there. */

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> We have got a user defined startDate. -> startDate = " + processConfig.framework.startDate.fixedDate); }
                        contextVariables.dateBeginOfMarket = new Date(processConfig.framework.startDate.fixedDate);

                    } else {

                        /*
                            We look first for the bot who knows the begining of the market in order to get when the market starts.
                        */

                        statusReport = statusDependencies.reportsByMainUtility.get("Market Starting Point")

                        if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                            logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Market Starting Point -> Status Report does not exist or Market Starting Point not defined. Retrying Later. ");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }

                        if (statusReport.status === "Status Report is corrupt.") {
                            logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }

                        thisReport = statusReport.file;

                        if (thisReport.beginingOfMarket === undefined) {
                            logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);
                            logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> It is too early too run this process since the trade history of the market is not there yet.");

                            let customOK = {
                                result: global.CUSTOM_OK_RESPONSE.result,
                                message: "Dependency does not exist."
                            }
                            logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                            callBackFunction(customOK);
                            return;
                        }

                        contextVariables.dateBeginOfMarket = new Date(thisReport.beginingOfMarket.year + "-" + thisReport.beginingOfMarket.month + "-" + thisReport.beginingOfMarket.days + " " + thisReport.beginingOfMarket.hours + ":" + thisReport.beginingOfMarket.minutes + GMT_SECONDS);

                    }

                    if (processConfig.framework.endDate.fixedDate !== undefined) {

                        /* The ending date is fixed, we will end there. */
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> We have got a user defined endDate. -> endDate = " + processConfig.framework.endDate.fixedDate); }
                        contextVariables.dateEndOfMarket = new Date(processConfig.framework.endDate.fixedDate); 

                    } else {

                        /*
                          Here we get the status report from the bot who knows which is the end of the market.
                        */

                        statusReport = statusDependencies.reportsByMainUtility.get("Market Ending Point")

                        if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                            logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Market Ending Point -> Status Report does not exist or Market Ending Point not defined. Retrying Later. ");
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
                            logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);

                            let customOK = {
                                result: global.CUSTOM_OK_RESPONSE.result,
                                message: "Dependency not ready."
                            }
                            logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                            callBackFunction(customOK);
                            return;
                        }

                        contextVariables.dateEndOfMarket = new Date(thisReport.lastFile.valueOf());
                    }

                    /* Finally we get our own Status Report. */

                    statusReport = statusDependencies.reportsByMainUtility.get("Self Reference")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Self Reference -> Status Report does not exist or Self Reference not defined. Retrying Later. ");
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

                        beginingOfMarket = new Date(thisReport.beginingOfMarket);

                        if (beginingOfMarket.valueOf() !== contextVariables.dateBeginOfMarket.valueOf()) { // Reset Mechanism for Begining of the Market
                            logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Reset Mechanism for Begining of the Market Activated. -> reportKey = " + reportKey);

                            beginingOfMarket = new Date(contextVariables.dateBeginOfMarket.valueOf());
                            startFromBegining();
                            return;
                        }

                        if (bot.hasTheBotJustStarted === true && processConfig.framework.startDate.resumeExecution === false) {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining because bot has just started and resume execution was true."); }
                            startFromBegining();
                            return;
                        }

                        contextVariables.lastFile = new Date(thisReport.lastFile);
                        interExecutionMemoryArray = thisReport.interExecutionMemoryArray;

                        processTimeFrames();
                        return;

                    } else {

                        /*
                        In the case when there is no status report, we assume like the last processed file is the one on the date of Begining of Market.
                        */
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining of the market because own status report not found or lastFile was undefined."); }
                        beginingOfMarket = new Date(contextVariables.dateBeginOfMarket.valueOf());
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
                        /*
                        Also, we will remember that we are bootstrapping the process, this will allow us, to advanceTime if necesary.
                        It can happen that a process depends on data from another process that does not produce a file during the first day, or even more days,
                        in that situation we want the process not to just wait for that data that will never arrive, but to advance time until it finds valid data.
                        */

                        bootstrappingTheProcess = true

                        for (let i = 0; i < global.dailyFilePeriods.length; i++) {
                            let emptyObject = {};
                            interExecutionMemoryArray.push(emptyObject);
                        }

                        processTimeFrames();

                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> err = "+ err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its statusDependencies declarations are correct. ");
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function processTimeFrames() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> Entering function."); }

                try {

                    let n;
                    let botNeverRan = true;

                    bot.multiPeriodDailyProcessDatetime = new Date(contextVariables.lastFile.valueOf() - ONE_DAY_IN_MILISECONDS); // Go back one day to start well when we advance time at the begining of the loop.

                    advanceTime();

                    function advanceTime() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> advanceTime -> Entering function."); }

                            bot.multiPeriodDailyProcessDatetime = new Date(bot.multiPeriodDailyProcessDatetime.valueOf() + ONE_DAY_IN_MILISECONDS);
                            previousDay = new Date(bot.multiPeriodDailyProcessDatetime.valueOf() - ONE_DAY_IN_MILISECONDS);
     
                            if (global.WRITE_LOGS_TO_FILES === 'true') {
                                logger.newInternalLoop(bot.codeName, bot.process);
                            }

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> advanceTime -> bot.multiPeriodDailyProcessDatetime = " + bot.multiPeriodDailyProcessDatetime); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> advanceTime -> previousDay = " + previousDay); }

                            /* Validation that we are not going past the head of the market. */

                            if (bot.multiPeriodDailyProcessDatetime.valueOf() > contextVariables.dateEndOfMarket.valueOf()) {

                                const logText = "Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> advanceTime -> " + logText); }

                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;

                            }

                            periodsLoop();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> advanceTime -> err = "+ err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoop -> Entering function."); }

                            /*  Telling the world we are alive and doing well */
                            let processingDate = bot.multiPeriodDailyProcessDatetime.getUTCFullYear() + '-' + utilities.pad(bot.multiPeriodDailyProcessDatetime.getUTCMonth() + 1, 2) + '-' + utilities.pad(bot.multiPeriodDailyProcessDatetime.getUTCDate(), 2);
                            bot.processHeartBeat(processingDate) 

                            /*

                            We will iterate through all posible periods.

                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            periodsLoopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoop -> err = "+ err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsLoopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> Entering function."); }

                            const timeFrame = global.dailyFilePeriods[n][0];
                            const timeFrameLabel = global.dailyFilePeriods[n][1];

                            if (processConfig.framework.validPeriods !== undefined) {
                                let validPeriod = false;
                                for (let i = 0; i < processConfig.framework.validPeriods.length; i++) {
                                    let period = processConfig.framework.validPeriods[i];
                                    if (period === timeFrameLabel) { validPeriod = true }
                                }
                                if (validPeriod === false) {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> Discarding period for not being listed as a valid period. -> timeFrameLabel = " + timeFrameLabel); }
                                    periodsControlLoop();
                                    return;
                                }
                            }

                            let dependencyIndex = 0;
                            dataFiles = new Map();

                            dependencyLoopBody();

                            function dependencyLoopBody() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> Entering function."); }

                                    let dependency = dataDependencies.nodeArray[dependencyIndex];
                                    let dataset = datasets[dependencyIndex];

                                    let previousFile;
                                    let currentFile;

                                    if (bot.multiPeriodDailyProcessDatetime.valueOf() > contextVariables.dateBeginOfMarket.valueOf()) {
                                        getPreviousFile();
                                    } else {
                                        previousFile = [];
                                        getCurrentFile()
                                    }

                                    function getPreviousFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getPreviousFile -> Entering function."); }

                                            let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2);
                                            let filePath
                                            if (dependency.dataSet === "Multi-Period-Daily") {
                                                filePath = dependency.product + '/' + dependency.dataSet + "/" + timeFrameLabel + "/" + dateForPath;
                                            } else {
                                                filePath = dependency.product + '/' + dependency.dataSet  + "/" + dateForPath;
                                            }
                                            let fileName = market.baseAsset + '_' + market.quotedAsset + ".json";

                                            dataset.getTextFile(filePath, fileName, onFileReceived);

                                            function onFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> text = " + text); }

                                                    if ((err.message === "File does not exist." && botNeverRan === true) || err.code === 'The specified key does not exist.') {

                                                        /*
                                                        Sometimes one of the dependencies of an indicator for some reasons are not calculated from the begining of the market.
                                                        When that happens we can not find those files. What we do in this situation is to move the time fordward until we can find
                                                        all the dependencies and the first run of the bot is successful.

                                                        After that, we will not accept more missing files on any of the dependencies, and if any is missing we will abort the processing.
                                                        */
                                                        logger.write(MODULE_NAME, "[WARN] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> Skipping day because file " + filePath + "/" + fileName + " was not found.");

                                                        advanceTime();
                                                        return;
                                                    }

                                                    if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {

                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> err = "+ err.stack);
                                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                        return;
                                                    }

                                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> err = "+ err.stack);
                                                        callBackFunction(err);
                                                        return;
                                                    }

                                                    previousFile = JSON.parse(text);

                                                    getCurrentFile();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> err = "+ err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getPreviousFile -> err = "+ err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                    function getCurrentFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getCurrentFile -> Entering function."); }

                                            let dateForPath = bot.multiPeriodDailyProcessDatetime.getUTCFullYear() + '/' + utilities.pad(bot.multiPeriodDailyProcessDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(bot.multiPeriodDailyProcessDatetime.getUTCDate(), 2);
                                            let filePath
                                            if (dependency.dataSet === "Multi-Period-Daily") {
                                                filePath = dependency.product + '/' + dependency.dataSet + "/" + timeFrameLabel + "/" + dateForPath;
                                            } else {
                                                filePath = dependency.product + '/' + dependency.dataSet + "/" + dateForPath;
                                            }
                                            let fileName = market.baseAsset + '_' + market.quotedAsset + ".json";

                                            dataset.getTextFile(filePath, fileName, onFileReceived);

                                            function onFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> text = " + text); }

                                                    if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {

                                                        if (bootstrappingTheProcess === true) {
                                                            /*
                                                            In the special situation where we are running this process for the first time (no status report found),
                                                            we will consider the possibility that a depanant process does not produce a file during the first day of the market,
                                                            or even more than one day. That is why we are going to advance time here.
                                                            */
                                                            advanceTime()
                                                            return
                                                        }

                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> err = " + err.code);
                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> filePath = " + filePath);
                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> fileName = " + fileName);
                                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                        return;
                                                    }

                                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getCurrentFile -> Not OK -> onFileReceived -> err = " + err.code);
                                                        callBackFunction(err);
                                                        return;
                                                    }

                                                    currentFile = JSON.parse(text);

                                                    let dataFile = previousFile.concat(currentFile);

                                                    dataFiles.set(dependency.id, dataFile);
                                                    dependencyControlLoop();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getCurrentFile -> Catch Error -> onFileReceived -> err = "+ err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getCurrentFile -> err = "+ err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoop -> dependencyLoopBody -> err = "+ err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function dependencyControlLoop() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> dependencyControlLoop -> Entering function."); }

                                    dependencyIndex++;

                                    if (dependencyIndex < dataDependencies.nodeArray.length) {

                                        dependencyLoopBody();

                                    } else {

                                        callTheBot();

                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> dependencyControlLoop -> err = "+ err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function callTheBot() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> callTheBot -> Entering function."); }

                                    const timeFrame = global.dailyFilePeriods[n][0];
                                    const timeFrameLabel = global.dailyFilePeriods[n][1];

                                    botInstance.start(
                                        dataFiles,
                                        timeFrame,
                                        timeFrameLabel,
                                        bot.multiPeriodDailyProcessDatetime,
                                        interExecutionMemoryArray[n],
                                        onBotFinished);

                                    function onBotFinished(err) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> callTheBot -> onBotFinished -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                callBackFunction(err);
                                                return;
                                            }

                                            botNeverRan = false;
                                            periodsControlLoop();
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> callTheBot -> onBotFinished -> err = "+ err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> callTheBot -> err = "+ err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> err = "+ err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsControlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsControlLoop -> Entering function."); }

                            n++;

                            if (n < global.dailyFilePeriods.length) {

                                periodsLoopBody();

                            } else {

                                n = 0;

                                writeDataRanges(onWritten);

                                function onWritten(err) {

                                    try {

                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> controlLoop -> onWritten -> Entering function."); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> controlLoop -> onWritten -> err = "+ err.stack);
                                            callBackFunction(err);
                                            return;
                                        }

                                        writeStatusReport(bot.multiPeriodDailyProcessDatetime, advanceTime);

                                    } catch (err) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames ->  controlLoop -> onWritten -> err = "+ err.stack);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsControlLoop -> err = "+ err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> err = "+ err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeDataRanges(callBack) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRanges -> Entering function."); }

                    let outputDatasetIndex = -1;
                    controlLoop();

                    function productLoopBody() {
                        let productCodeName = bot.processNode.referenceParent.processOutput.outputDatasets[outputDatasetIndex].referenceParent.parentNode.code.codeName;
                        writeDataRange(contextVariables.dateBeginOfMarket, bot.multiPeriodDailyProcessDatetime, productCodeName, controlLoop);
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
                    logger.write(MODULE_NAME, "[ERROR] start -> writeDataRanges -> err = "+ err.stack);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }

            }

            function writeDataRange(pBegin, pEnd, productCodeName, callBack) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> Entering function."); }

                    let dataRange = {
                        begin: pBegin.valueOf(),
                        end: pEnd.valueOf()
                    };

                    let fileContent = JSON.stringify(dataRange);

                    let fileName = '/Data.Range.' + market.baseAsset + '_' + market.quotedAsset + '.json';
                    let filePath = bot.filePathRoot + "/Output/" + productCodeName + "/" + bot.process + fileName;

                    fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> onFileCreated -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> onFileCreated -> err = "+ err.stack);
                            callBack(err);
                            return;
                        }

                        if (LOG_FILE_CONTENT === true) {
                            logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> onFileCreated ->  Content written = " + fileContent);
                        }

                        callBack(global.DEFAULT_OK_RESPONSE);
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> err = "+ err.stack);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(lastFileDate, callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> Entering function."); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> lastFileDate = " + lastFileDate); }

                try {

                    let reportKey = bot.dataMine + "-" + bot.codeName + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.currentDaytime;
                    thisReport.file.lastFile = lastFileDate;
                    thisReport.file.interExecutionMemoryArray = interExecutionMemoryArray;
                    thisReport.file.beginingOfMarket = beginingOfMarket.toUTCString()
                    thisReport.save(callBack);

                    bot.hasTheBotJustStarted = false;
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = "+ err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }

        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad(" " + str, max) : str;
    }
};
