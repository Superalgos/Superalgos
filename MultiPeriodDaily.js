exports.newMultiPeriodDaily = function newMultiPeriodDaily(bot, logger, UTILITIES, FILE_STORAGE) {
    const FULL_LOG = true;
    const MODULE_NAME = "Multi Period Daily";
    const GMT_SECONDS = ':00.000 GMT+0000';

    thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(logger)
    let fileStorage = FILE_STORAGE.newFileStorage(logger)

    let statusDependencies;
    let dataDependenciesModule;
    let dataFiles = new Map;
    let indicatorOutputModule;

    let bootstrappingTheProcess = false

    let processConfig;
    let beginingOfMarket

    return thisObject;

    function initialize(pProcessConfig, pStatusDependencies, pDataDependencies, callBackFunction) {
        logger.fileName = MODULE_NAME;
        logger.initialize()

        statusDependencies = pStatusDependencies;
        dataDependenciesModule = pDataDependencies;
        processConfig = pProcessConfig;

        let INDICATOR_OUTPUT_MODULE = require("./IndicatorOutput")

        indicatorOutputModule = INDICATOR_OUTPUT_MODULE.newIndicatorOutput(bot, logger, UTILITIES, FILE_STORAGE)
        indicatorOutputModule.initialize(callBackFunction)
    }

    function finalize() {
        dataFiles = undefined
        statusDependencies = undefined
        dataDependenciesModule = undefined
        indicatorOutputModule = undefined
        fileStorage = undefined
        processConfig = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {
        try {
            let market = bot.market;

            /* Context Variables */
            let contextVariables = {
                lastFile: undefined,                // Datetime of the last file files sucessfully produced by this process.
                dateBeginOfMarket: undefined,       // Datetime of the first trade file in the whole market history.
                dateEndOfMarket: undefined          // Datetime of the last file available to be used as an input of this process.
            };

            let previousDay;                        // Holds the date of the previous day relative to the processing date.
            let interExecutionMemoryArray;

            getContextVariables()

            function getContextVariables() {
                try {
                    let thisReport;
                    let reportKey;
                    let statusReport;
                    /*
                    We look first for the bot who knows the begining of the market in order to get when the market starts.
                    */
                    statusReport = statusDependencies.reportsByMainUtility.get("Market Starting Point")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Market Starting Point -> Status Report does not exist or Market Starting Point not defined. Retrying Later. ")
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ")
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    thisReport = statusReport.file;

                    if (thisReport.beginingOfMarket === undefined) {
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey)
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> It is too early too run this process since the trade history of the market is not there yet.")

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency does not exist."
                        }
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> customOK = " + customOK.message)
                        callBackFunction(customOK)
                        return
                    }

                    contextVariables.dateBeginOfMarket = new Date(thisReport.beginingOfMarket.year + "-" + thisReport.beginingOfMarket.month + "-" + thisReport.beginingOfMarket.days + " " + thisReport.beginingOfMarket.hours + ":" + thisReport.beginingOfMarket.minutes + GMT_SECONDS)
                    /*
                    Here we get the status report from the bot who knows which is the end of the market.
                    */
                    statusReport = statusDependencies.reportsByMainUtility.get("Market Ending Point")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Market Ending Point -> Status Report does not exist or Market Ending Point not defined. Retrying Later. ")
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ")
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    thisReport = statusReport.file;

                    if (thisReport.lastFile === undefined) {
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey)

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> customOK = " + customOK.message)
                        callBackFunction(customOK)
                        return
                    }

                    contextVariables.dateEndOfMarket = new Date(thisReport.lastFile.valueOf())

                    /* Finally we get our own Status Report. */
                    statusReport = statusDependencies.reportsByMainUtility.get("Self Reference")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Self Reference -> Status Report does not exist or Self Reference not defined. Retrying Later. ")
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.")
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                        return
                    }

                    thisReport = statusReport.file;

                    if (thisReport.lastFile !== undefined) {

                        beginingOfMarket = new Date(thisReport.beginingOfMarket)

                        if (beginingOfMarket.valueOf() !== contextVariables.dateBeginOfMarket.valueOf()) { // Reset Mechanism for Begining of the Market
                            logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Reset Mechanism for Begining of the Market Activated. -> reportKey = " + reportKey)

                            beginingOfMarket = new Date(contextVariables.dateBeginOfMarket.valueOf())
                            startFromBegining()
                            return
                        }

                        if (bot.hasTheBotJustStarted === true && processConfig.framework.startDate !== undefined && processConfig.framework.startDate.resumeExecution === false) {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining because bot has just started and resume execution was true.") }
                            startFromBegining()
                            return
                        }

                        contextVariables.lastFile = new Date(thisReport.lastFile)
                        interExecutionMemoryArray = thisReport.interExecutionMemoryArray;

                        processTimeFrames()
                    } else {

                        /*
                        In the case when there is no status report, we assume like the last processed file is the one on the date of Begining of Market.
                        */
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining of the market because own status report not found or lastFile was undefined.") }
                        beginingOfMarket = new Date(contextVariables.dateBeginOfMarket.valueOf())
                        startFromBegining()
                    }

                    function startFromBegining() {
                        contextVariables.lastFile = new Date(contextVariables.dateBeginOfMarket.getUTCFullYear() + "-" + (contextVariables.dateBeginOfMarket.getUTCMonth() + 1) + "-" + contextVariables.dateBeginOfMarket.getUTCDate() + " " + "00:00" + GMT_SECONDS)

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> startFromBegining -> contextVariables.lastFile = " + contextVariables.lastFile) }
                        /*
                        The first time the process is running is the right time to create the data structure that is going to be shared across different executions.
                        This data structure has one object per each timeFrame.
                        */
                        interExecutionMemoryArray = []
                        /*
                        Also, we will remember that we are bootstrapping the process, this will allow us, to advanceTime if necesary.
                        It can happen that a process depends on data from another process that does not produce a file during the first day, or even more days,
                        in that situation we want the process not to just wait for that data that will never arrive, but to advance time until it finds valid data.
                        */
                        bootstrappingTheProcess = true

                        for (let i = 0; i < global.dailyFilePeriods.length; i++) {
                            let emptyObject = {};
                            interExecutionMemoryArray.push(emptyObject)
                        }

                        processTimeFrames()
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> err = " + err.stack)
                    if (err.message === "Cannot read property 'file' of undefined") {
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its statusDependencies declarations are correct. ")
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys))
                    }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                }
            }

            function processTimeFrames() {
                let n;
                let botNeverRan = true;

                bot.multiPeriodDailyProcessDatetime = new Date(contextVariables.lastFile.valueOf() - ONE_DAY_IN_MILISECONDS) // Go back one day to start well when we advance time at the begining of the loop.
                let fromDate = new Date(bot.multiPeriodDailyProcessDatetime.valueOf())
                let lastDate = new Date()

                advanceTime()

                function advanceTime() {
                    bot.multiPeriodDailyProcessDatetime = new Date(bot.multiPeriodDailyProcessDatetime.valueOf() + ONE_DAY_IN_MILISECONDS)
                    previousDay = new Date(bot.multiPeriodDailyProcessDatetime.valueOf() - ONE_DAY_IN_MILISECONDS)

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> advanceTime -> bot.multiPeriodDailyProcessDatetime = " + bot.multiPeriodDailyProcessDatetime) }
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> advanceTime -> previousDay = " + previousDay) }

                    /* Validation that we are not going past the head of the market. */
                    if (bot.multiPeriodDailyProcessDatetime.valueOf() > contextVariables.dateEndOfMarket.valueOf()) {

                        const logText = "Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> advanceTime -> " + logText) }

                        callBackFunction(global.DEFAULT_OK_RESPONSE)
                        return

                    }

                    /*  Telling the world we are alive and doing well */
                    let currentDateString = bot.multiPeriodDailyProcessDatetime.getUTCFullYear() + '-' + utilities.pad(bot.multiPeriodDailyProcessDatetime.getUTCMonth() + 1, 2) + '-' + utilities.pad(bot.multiPeriodDailyProcessDatetime.getUTCDate(), 2)
                    let currentDate = new Date(bot.multiPeriodDailyProcessDatetime)
                    let percentage = global.getPercentage(fromDate, currentDate, lastDate)
                    bot.processHeartBeat(currentDateString, percentage)

                    if (global.areEqualDates(currentDate, new Date()) === false) {
                        logger.newInternalLoop(bot.codeName, bot.process, currentDate, percentage)
                    }
                    checkStopTaskGracefully()
                }
                function checkStopTaskGracefully() {
                    /* Validation that we dont need to stop. */
                    if (global.STOP_TASK_GRACEFULLY === true) {
                        callBackFunction(global.DEFAULT_OK_RESPONSE)
                        return
                    }
                    timeFramesLoop()
                }

                function timeFramesLoop() {
                    /*
                    We will iterate through all posible timeFrames.
                    */
                    n = 0   // loop Variable representing each possible period as defined at the timeFrames array.
                    timeFramesLoopBody()
                }

                function timeFramesLoopBody() {

                    const timeFrame = global.dailyFilePeriods[n][0]
                    const timeFrameLabel = global.dailyFilePeriods[n][1]

                    /* Check Time Frames Filter */
                    if (bot.dailyTimeFrames !== undefined) {
                        if (bot.dailyTimeFrames.includes(timeFrameLabel) === false) {
                            /* We are not going to process this Time Frame */
                            timeFramesControlLoop()
                            return
                        }
                    }

                    if (processConfig.framework.validPeriods !== undefined) {
                        let validPeriod = false;
                        for (let i = 0; i < processConfig.framework.validPeriods.length; i++) {
                            let period = processConfig.framework.validPeriods[i]
                            if (period === timeFrameLabel) { validPeriod = true }
                        }
                        if (validPeriod === false) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> timeFramesLoopBody -> Discarding period for not being listed as a valid period. -> timeFrameLabel = " + timeFrameLabel) }
                            timeFramesControlLoop()
                            return
                        }
                    }
                    let dependencyIndex = 0
                    dataFiles = new Map()

                    dependencyLoopBody()

                    function dependencyLoopBody() {
                        let dependency = dataDependenciesModule.nodeArray[dependencyIndex]
                        if (dependency === undefined) {

                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> You need to add at least one Data Dependency to the process Multi Period Daily. Aborting process.")
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                            return
                        }

                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]
                        let previousFile
                        let currentFile

                        if (bot.multiPeriodDailyProcessDatetime.valueOf() > contextVariables.dateBeginOfMarket.valueOf()) {
                            getPreviousFile()
                        } else {
                            previousFile = []
                            getCurrentFile()
                        }

                        function getPreviousFile() {
                            let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2)
                            let filePath
                            if (dependency.referenceParent.config.codeName === "Multi-Period-Daily") {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel + "/" + dateForPath;
                            } else {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + dateForPath;
                            }
                            let fileName = "Data.json"

                            datasetModule.getTextFile(filePath, fileName, onFileReceived)

                            function onFileReceived(err, text) {
                                if ((err.message === "File does not exist." && botNeverRan === true) || err.code === 'The specified key does not exist.') {
                                    /*
                                    Sometimes one of the dependencies of an indicator for some reasons are not calculated from the begining of the market.
                                    When that happens we can not find those files. What we do in this situation is to move the time fordward until we can find
                                    all the dependencies and the first run of the bot is successful.
    
                                    After that, we will not accept more missing files on any of the dependencies, and if any is missing we will abort the processing.
                                    */
                                    logger.write(MODULE_NAME, "[WARN] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> Skipping day because file " + filePath + "/" + fileName + " was not found.")

                                    advanceTime()
                                    return
                                }

                                if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {

                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> err = " + err.stack)
                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE)
                                    return
                                }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> err = " + err.stack)
                                    callBackFunction(err)
                                    return
                                }

                                previousFile = JSON.parse(text)
                                getCurrentFile()
                            }

                        }

                        function getCurrentFile() {
                            let dateForPath = bot.multiPeriodDailyProcessDatetime.getUTCFullYear() + '/' + utilities.pad(bot.multiPeriodDailyProcessDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(bot.multiPeriodDailyProcessDatetime.getUTCDate(), 2)
                            let filePath
                            if (dependency.referenceParent.config.codeName === "Multi-Period-Daily") {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel + "/" + dateForPath;
                            } else {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + dateForPath;
                            }
                            let fileName = "Data.json";

                            datasetModule.getTextFile(filePath, fileName, onFileReceived)

                            function onFileReceived(err, text) {
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

                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> err = " + err.code)
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> filePath = " + filePath)
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> fileName = " + fileName)
                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE)
                                    return
                                }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> Not OK -> onFileReceived -> err = " + err.code)
                                    callBackFunction(err)
                                    return
                                }

                                currentFile = JSON.parse(text)
                                let dataFile = previousFile.concat(currentFile)
                                dataFiles.set(dependency.id, dataFile)
                                dependencyControlLoop()
                            }
                        }
                    }

                    function dependencyControlLoop() {
                        dependencyIndex++;
                        if (dependencyIndex < dataDependenciesModule.nodeArray.length) {
                            dependencyLoopBody()
                        } else {
                            generateOutput()
                        }

                        function generateOutput() {

                            indicatorOutputModule.start(
                                dataFiles,
                                timeFrame,
                                timeFrameLabel,
                                bot.multiPeriodDailyProcessDatetime,
                                interExecutionMemoryArray[n],
                                onOutputGenerated)

                            function onOutputGenerated(err) {
                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    callBackFunction(err)
                                    return
                                }
                                botNeverRan = false;
                                timeFramesControlLoop()
                            }
                        }
                    }
                }

                function timeFramesControlLoop() {
                    n++
                    if (n < global.dailyFilePeriods.length) {
                        timeFramesLoopBody()
                    } else {
                        n = 0;
                        writeDataRanges(onWritten)

                        function onWritten(err) {
                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> controlLoop -> onWritten -> err = " + err.stack)
                                callBackFunction(err)
                                return
                            }
                            writeStatusReport(bot.multiPeriodDailyProcessDatetime, advanceTime)
                        }
                    }
                }
            }

            function writeDataRanges(callBack) {
                let outputDatasets = global.NODE_BRANCH_TO_ARRAY (bot.processNode.referenceParent.processOutput, 'Output Dataset')
                let outputDatasetIndex = -1;
                controlLoop()

                function productLoopBody() {
                    let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                    writeDataRange(contextVariables.dateBeginOfMarket, bot.multiPeriodDailyProcessDatetime, productCodeName, controlLoop)
                }

                function controlLoop() {
                    outputDatasetIndex++
                    if (outputDatasetIndex < outputDatasets.length) {
                        productLoopBody()
                    } else {
                        callBack(global.DEFAULT_OK_RESPONSE)
                    }
                }
            }

            function writeDataRange(pBegin, pEnd, productCodeName, callBack) {
                let dataRange = {
                    begin: pBegin.valueOf(),
                    end: pEnd.valueOf() + ONE_DAY_IN_MILISECONDS
                };
                let fileContent = JSON.stringify(dataRange)
                let fileName = '/Data.Range.json';
                let filePath = bot.filePathRoot + "/Output/" + productCodeName + "/" + bot.process + fileName;

                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                function onFileCreated(err) {
                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> onFileCreated -> err = " + err.stack)
                        callBack(err)
                        return
                    }
                    let key = bot.dataMine + "-" + bot.codeName + "-" + productCodeName + "-" + bot.exchange + "-" + bot.market.baseAsset + '/' + bot.market.quotedAsset
                    let event = {
                        dateRange: dataRange
                    }

                    global.EVENT_SERVER_CLIENT.raiseEvent(key, 'Data Range Updated', event)
                    writeTimeFramesFile(productCodeName, callBack)
                }
            }

            function writeTimeFramesFile(productCodeName, callBack) {

                let timeFramesArray = []
                for (let n = 0; n < global.dailyFilePeriods.length; n++) {
                    let timeFrameLabel = global.dailyFilePeriods[n][1]

                    /* Check Time Frames Filter */
                    if (bot.dailyTimeFrames !== undefined) {
                        if (bot.dailyTimeFrames.includes(timeFrameLabel) === true) {
                            timeFramesArray.push(timeFrameLabel)
                        }
                    } else {
                        timeFramesArray.push(timeFrameLabel)
                    }
                }

                let fileContent = JSON.stringify(timeFramesArray)
                let fileName = '/Time.Frames.json';
                let filePath = bot.filePathRoot + "/Output/" + productCodeName + "/" + bot.process + fileName;

                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                function onFileCreated(err) {
                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeTimeFramesFiles -> onFileCreated -> err = " + err.stack)
                        callBack(err)
                        return
                    }
                    callBack(global.DEFAULT_OK_RESPONSE)
                }
            }

            function writeStatusReport(lastFileDate, callBack) {
                let reportKey = bot.dataMine + "-" + bot.codeName + "-" + "Multi-Period-Daily"
                let thisReport = statusDependencies.statusReports.get(reportKey)

                thisReport.file.lastExecution = bot.currentDaytime;
                thisReport.file.lastFile = lastFileDate;
                thisReport.file.interExecutionMemoryArray = interExecutionMemoryArray;
                thisReport.file.beginingOfMarket = beginingOfMarket.toUTCString()
                if (bot.dailyTimeFrames !== undefined) {
                    thisReport.file.timeFrames = bot.dailyTimeFrames
                }
                thisReport.save(callBack)

                bot.hasTheBotJustStarted = false;
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack)
            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }
};
