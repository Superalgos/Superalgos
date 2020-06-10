exports.newTradingProcess = function newTradingProcess(bot, logger, UTILITIES, TRADING_OUTPUT_MODULE, USER_BOT_COMMONS) {

    /*
    This Module will load all the process data dependencies from files and send them to the Trading Bot.
    After execution, will save the time range and status report of the process.
    */
    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const MODULE_NAME = "Trading Process";
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

    let tradingOutputModule;

    const FILE_STORAGE = require('../FileStorage.js');
    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, pStatusDependencies, pDataDependencies, callBackFunction) {
        try {
            logger.fileName = MODULE_NAME;
            logger.initialize();

            statusDependencies = pStatusDependencies;
            dataDependenciesModule = pDataDependencies;
            processConfig = pProcessConfig;

            let TRADING_OUTPUT_MODULE = require("./TradingOutput")
            tradingOutputModule = TRADING_OUTPUT_MODULE.newTradingOutput(bot, logger, UTILITIES, FILE_STORAGE);
            tradingOutputModule.initialize(callBackFunction);

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
        tradingOutputModule.finalize()
        tradingOutputModule = undefined
        fileStorage = undefined
        processConfig = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {
        try {
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
            let simulationState

            getContextVariables();

            function getContextVariables() {
                try {
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
                    if (bot.tradingProcessDate.valueOf() - ONE_DAY_IN_MILISECONDS > contextVariables.dateEndOfMarket.valueOf() && bot.SESSION.type !== "Backtesting Session") {

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
                    simulationState = thisReport.simulationState;
                    if (simulationState === undefined) { simulationState = {} } // This should happen only when there is no status report

                    if (thisReport.lastFile !== undefined) {
                        if (bot.hasTheBotJustStarted === true && bot.resumeExecution === false) {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining because bot has just started and resume execution was true."); }
                            startFromBegining();
                            return;
                        }
                        contextVariables.lastFile = new Date(thisReport.lastFile);
                        processSingleFiles();
                        return;

                    } else {
                        /*
                        We are here becuse either:
                        1. There is no status report
                        2. There is no Last File (this happens on Market Files)
                        */
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining of the market because own status report not found or lastFile was undefined."); }
                        startFromBegining();
                        return;
                    }

                    function startFromBegining() {

                        contextVariables.lastFile = new Date(contextVariables.dateBeginOfMarket.getUTCFullYear() + "-" + (contextVariables.dateBeginOfMarket.getUTCMonth() + 1) + "-" + contextVariables.dateBeginOfMarket.getUTCDate() + " " + "00:00" + GMT_SECONDS);

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> startFromBegining -> contextVariables.lastFile = " + contextVariables.lastFile); }
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
                let dependencyIndex = 0;
                dataFiles = new Map();
                dependencyLoopBody();

                function dependencyLoopBody() {
                    let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                    let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];
                    getFile();

                    function getFile() {
                        if (datasetModule.node.config.codeName !== "Single-File") {
                            dependencyControlLoop();
                            return
                        }

                        if (dataDependenciesModule.isItADepenency('atAnyTimeFrame', datasetModule.node.parentNode.config.singularVariableName) !== true) {
                            dependencyControlLoop();
                            return
                        }

                        let fileName = "Data.json";
                        let filePath = datasetModule.node.parentNode.config.codeName + '/' + datasetModule.node.config.codeName;
                        datasetModule.getTextFile(filePath, fileName, onFileReceived);

                        function onFileReceived(err, text) {
                            try {
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
                }

                function dependencyControlLoop() {
                    dependencyIndex++
                    if (dependencyIndex < dataDependenciesModule.nodeArray.length) {
                        dependencyLoopBody()
                    } else {
                        let mapKey = "Single Files"
                        multiPeriodDataFiles.set(mapKey, dataFiles)
                        processMarketFiles()
                    }
                }
            }

            function processMarketFiles() {
                let n;
                timeFramesLoop();

                function timeFramesLoop() {
                    /*
                    We will iterate through all posible timeFrames.
                    */
                    n = 0   // loop Variable representing each possible period as defined at the timeFrames array.
                    timeFramesLoopBody();
                }

                function timeFramesLoopBody() {
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
                        let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];
                        getFile();

                        function getFile() {
                            if (dependency.referenceParent.config.codeName !== "Multi-Period-Market") {
                                dependencyControlLoop();
                                return
                            }

                            if (dataDependenciesModule.isItADepenency(timeFrameLabel, datasetModule.node.parentNode.config.singularVariableName) !== true) {
                                if (!(bot.VALUES_TO_USE.timeFrame === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                    dependencyControlLoop();
                                    return
                                }
                            }

                            let fileName = "Data.json";
                            let filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel;
                            datasetModule.getTextFile(filePath, fileName, onFileReceived);

                            function onFileReceived(err, text) {
                                try {
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
                    }

                    function dependencyControlLoop() {
                        dependencyIndex++;
                        if (dependencyIndex < dataDependenciesModule.nodeArray.length) {
                            dependencyLoopBody();
                        } else {
                            let mapKey = global.marketFilesPeriods[n][1];
                            multiPeriodDataFiles.set(mapKey, dataFiles)
                            timeFramesControlLoop();
                        }
                    }
                }

                function timeFramesControlLoop() {
                    n++;
                    if (n < global.marketFilesPeriods.length) {
                        timeFramesLoopBody();
                    } else {
                        processDailyFiles();
                    }
                }
            }

            function processDailyFiles() {
                let n = 0;
                if (currentTimeFrame) {
                    buildCharts()
                    return
                }
                bot.tradingProcessDate = new Date(contextVariables.lastFile.valueOf() - ONE_DAY_IN_MILISECONDS); // Go back one day to start well when we advance time at the begining of the loop.
                advanceTime();

                function advanceTime() {
                    bot.tradingProcessDate = new Date(bot.tradingProcessDate.valueOf() + ONE_DAY_IN_MILISECONDS);
                    previousDay = new Date(bot.tradingProcessDate.valueOf() - ONE_DAY_IN_MILISECONDS);

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> advanceTime -> bot.tradingProcessDate = " + bot.tradingProcessDate); }
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> advanceTime -> previousDay = " + previousDay); }

                    /* Validation that we are not going past the user defined end date. */
                    if (bot.tradingProcessDate.valueOf() >= bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf()) {

                        const logText = "User Defined End Datetime reached @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> advanceTime -> " + logText); }

                        bot.STOP_SESSION = true
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }

                    /* Validation that we are not going past the head of the market. */
                    if (bot.tradingProcessDate.valueOf() > contextVariables.dateEndOfMarket.valueOf() + ONE_DAY_IN_MILISECONDS - 1) {

                        const logText = "Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> advanceTime -> " + logText); }

                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }

                    checkStopTaskGracefully();
                }

                function checkStopTaskGracefully() {
                    /* Validation that we dont need to stop. */
                    if (global.STOP_TASK_GRACEFULLY === true) {
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }
                    checkStopProcessing();
                }

                function checkStopProcessing() {
                    /* Validation that we dont need to stop. */
                    if (bot.STOP_SESSION === true) {
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }
                    timeFramesLoop();
                }

                function timeFramesLoop() {
                    /*  Telling the world we are alive and doing well */
                    let processingDate = bot.tradingProcessDate.getUTCFullYear() + '-' + utilities.pad(bot.tradingProcessDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(bot.tradingProcessDate.getUTCDate(), 2);
                    bot.processHeartBeat(processingDate)
                    /*
                    We will iterate through all posible timeFrames.
                    */
                    n = 0   // loop Variable representing each possible period as defined at the timeFrames array.
                    timeFramesLoopBody();
                }

                function timeFramesLoopBody() {
                    const timeFrame = global.dailyFilePeriods[n][0];
                    const timeFrameLabel = global.dailyFilePeriods[n][1];

                    if (processConfig.framework.validtimeFrames !== undefined) {
                        let validPeriod = false;
                        for (let i = 0; i < processConfig.framework.validtimeFrames.length; i++) {
                            let period = processConfig.framework.validtimeFrames[i];
                            if (period === timeFrameLabel) { validPeriod = true }
                        }
                        if (validPeriod === false) {
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
                        let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];
                        let file
                        getFile()

                        function getFile() {
                            if (dependency.referenceParent.config.codeName !== "Multi-Period-Daily") {
                                dependencyControlLoop();
                                return
                            }

                            if (dataDependenciesModule.isItADepenency(timeFrameLabel, datasetModule.node.parentNode.config.singularVariableName) !== true) {
                                if (!(bot.VALUES_TO_USE.timeFrame === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                    dependencyControlLoop();
                                    return
                                }
                            }

                            let dateForPath = bot.tradingProcessDate.getUTCFullYear() + '/' + utilities.pad(bot.tradingProcessDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(bot.tradingProcessDate.getUTCDate(), 2);
                            let filePath
                            if (dependency.referenceParent.config.codeName === "Multi-Period-Daily") {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel + "/" + dateForPath;
                            } else {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + dateForPath;
                            }
                            let fileName = "Data.json";

                            datasetModule.getTextFile(filePath, fileName, onFileReceived);

                            function onFileReceived(err, text) {
                                try {
                                    if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {
                                        logger.write(MODULE_NAME, "[ERROR] The file " + filePath + '/' + fileName + ' does not exist and it is required to continue. This process will retry to read it in a while. In the meantime make yourself sure that the process that generates it has ran properly.');
                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                        return;
                                    }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> Not Ok -> err = " + err.code);
                                        callBackFunction(err);
                                        return;
                                    }

                                    file = JSON.parse(text);
                                    dataFiles.set(dependency.id, file);
                                    dependencyControlLoop();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                    }

                    function dependencyControlLoop() {
                        dependencyIndex++;

                        if (dependencyIndex < dataDependenciesModule.nodeArray.length) {
                            dependencyLoopBody();
                        } else {
                            let mapKey = global.dailyFilePeriods[n][1];
                            multiPeriodDataFiles.set(mapKey, dataFiles)
                            timeFramesControlLoop();
                        }
                    }
                }

                function timeFramesControlLoop() {
                    n++;
                    if (n < global.dailyFilePeriods.length) {
                        timeFramesLoopBody();
                    } else {
                        n = 0;
                        if (currentTimeFrame !== undefined) {
                            buildCharts();
                        } else {
                            logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> timeFramesControlLoop -> Time Frame not Recognized. Can not continue.");
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
            }

            function buildCharts() {
                const COMMONS = require('../Commons.js')
                let commons = COMMONS.newCommons(bot, logger, UTILITIES, FILE_STORAGE)

                let chart = {}
                let mainDependency = {}

                /* The first phase here is about checking that we have everything we need at the definition level. */
                let dataDependencies = bot.processNode.referenceParent.processDependencies.dataDependencies
                if (commons.validateDataDependencies(dataDependencies, callBackFunction) !== true) { return }

                let outputDatasets = bot.processNode.referenceParent.processOutput.outputDatasets
                if (commons.validateOutputDatasets(outputDatasets, callBackFunction) !== true) { return }

                /* The second phase is about transforming the inputs into a format that can be used to apply the user defined code. */
                for (let j = 0; j < global.marketFilesPeriods.length; j++) {
                    let timeFrameLabel = marketFilesPeriods[j][1]
                    let dataFiles = multiPeriodDataFiles.get(timeFrameLabel)
                    let products = {}

                    if (dataFiles !== undefined) {
                        commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, timeFrame)

                        let propertyName = 'at' + timeFrameLabel.replace('-', '')
                        chart[propertyName] = products
                    }
                }

                for (let j = 0; j < global.dailyFilePeriods.length; j++) {
                    let timeFrameLabel = global.dailyFilePeriods[j][1]
                    let dataFiles = multiPeriodDataFiles.get(timeFrameLabel)
                    let products = {}

                    if (dataFiles !== undefined) {
                        commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, timeFrame)

                        let propertyName = 'at' + timeFrameLabel.replace('-', '')
                        chart[propertyName] = products
                    }
                }

                /* Single Files */
                let dataFiles = multiPeriodDataFiles.get('Single Files')
                let products = {}

                if (dataFiles !== undefined) {
                    commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, timeFrame)

                    let propertyName = 'atAnyTimeFrame'
                    chart[propertyName] = products
                }

                tradingOutputModule.start(
                    chart,
                    currentTimeFrame,
                    currentTimeFrameLabel,
                    bot.tradingProcessDate,
                    simulationState,
                    onOutputGenerated);

                function onOutputGenerated(err) {
                    try {
                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            callBackFunction(err);
                            return;
                        }

                        botNeverRan = false
                        bot.RESUME = true // From here on, all other loops executions must resume from where we left at this current run.

                        if (currentTimeFrame > global.dailyFilePeriods[0][0]) {
                            writeMarketStatusReport(onMarketStatusReport)

                        } else {
                            writeDataRanges(currentTimeFrameLabel, onWritten);
                        }

                        function onWritten(err) {
                            try {

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> buildCharts -> onOutputGenerated -> onWritten -> err = " + err.stack);
                                    callBackFunction(err);
                                    return;
                                }

                                writeDailyStatusReport(bot.tradingProcessDate, onDailyStatusReport);
                            } catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> buildCharts -> onOutputGenerated -> onWritten -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }

                        function onDailyStatusReport() {
                            /* The next run we need the process to continue at the date it finished. */
                            processConfig.framework.startDate.resumeExecution = true;
                            advanceTime();
                        }

                        function onMarketStatusReport() {
                            /* This is where we check if we need reached the user defined end datetime.  */
                            const now = new Date()
                            if (now.valueOf() >= bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf()) {
                                const logText = "User Defined End Datetime reached @ " + now.getUTCFullYear() + "/" + (now.getUTCMonth() + 1) + "/" + now.getUTCDate() + ".";
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processDailyFiles -> buildCharts -> onOutputGenerated -> onMarketStatusReport -> " + logText); }

                                bot.STOP_SESSION = true
                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;
                            }
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> buildCharts -> onOutputGenerated -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }
            }

            function writeDataRanges(currentTimeFrameLabel, callBack) {
                let outputDatasetIndex = -1;
                controlLoop();

                function productLoopBody() {
                    let productCodeName = bot.processNode.referenceParent.processOutput.outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                    writeDataRange(contextVariables.dateBeginOfMarket, bot.tradingProcessDate, productCodeName, currentTimeFrameLabel, controlLoop);
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

            function writeDataRange(pBegin, pEnd, productCodeName, currentTimeFrameLabel, callBack) {
                let dataRange = {
                    begin: pBegin.valueOf(),
                    end: pEnd.valueOf() + ONE_DAY_IN_MILISECONDS
                };

                let fileContent = JSON.stringify(dataRange);
                let fileName = '/Data.Range.json';
                let filePath = bot.filePathRoot + "/Output/" + bot.SESSION.folderName + "/" + productCodeName + "/" + 'Multi-Period-Daily' + fileName;

                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                function onFileCreated(err) {
                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> onFileCreated -> err = " + err.stack);
                        callBack(err);
                        return;
                    }

                    if (LOG_FILE_CONTENT === true) {
                        logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> onFileCreated ->  Content written = " + fileContent);
                    }

                    let key = bot.dataMine + "-" + bot.codeName + "-" + productCodeName + "-" + bot.exchange + "-" + bot.market.baseAsset + '/' + bot.market.quotedAsset
                    let event = {
                        dateRange: dataRange
                    }

                    global.EVENT_SERVER_CLIENT.raiseEvent(key, 'Data Range Updated', event)

                    callBack(global.DEFAULT_OK_RESPONSE);
                }
            }

            function writeDailyStatusReport(lastFileDate, callBack) {
                let reportKey = bot.dataMine + "-" + bot.codeName + "-" + "Multi-Period" + "-" + "dataSet.V1";
                let thisReport = statusDependencies.statusReports.get(reportKey);

                thisReport.file.lastExecution = bot.currentDaytime;
                thisReport.file.lastFile = lastFileDate;
                thisReport.file.simulationState = simulationState;
                thisReport.save(callBack);

                bot.hasTheBotJustStarted = false;
            }

            function writeMarketStatusReport(callBack) {
                let reportKey = bot.dataMine + "-" + bot.codeName + "-" + "Multi-Period" + "-" + "dataSet.V1";
                let thisReport = statusDependencies.statusReports.get(reportKey);

                thisReport.file.lastExecution = bot.processDatetime;
                thisReport.file.simulationState = simulationState;
                thisReport.save(callBack);

                logger.newInternalLoop(bot.codeName, bot.process, bot.tradingProcessDate);
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
