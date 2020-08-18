exports.newTradingProcess = function newTradingProcess(bot, logger, UTILITIES, TRADING_OUTPUT_MODULE, USER_BOT_COMMONS) {
    /*
    This Module will load all the process data dependencies from files and send them downstream.
    After execution, will save the time range and status report of the process.
    */
    const FULL_LOG = true;
    const MODULE_NAME = "Trading Process";
    const GMT_SECONDS = ':00.000 GMT+0000';

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
            logger.fileName = MODULE_NAME
            logger.initialize()

            statusDependencies = pStatusDependencies
            dataDependenciesModule = pDataDependencies
            processConfig = pProcessConfig

            let TRADING_OUTPUT_MODULE = require("./TradingOutput")
            tradingOutputModule = TRADING_OUTPUT_MODULE.newTradingOutput(bot, logger, UTILITIES, FILE_STORAGE)
            tradingOutputModule.initialize()

            callBackFunction(global.DEFAULT_OK_RESPONSE)

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

    async function start(callBackFunction) {
        try {
            let currentTimeFrame
            let currentTimeFrameLabel
            let market = bot.market;

            /* Context Variables */

            let contextVariables = {
                lastFile: undefined,                // Datetime of the last file files sucessfully produced by this process.
                dateBeginOfMarket: undefined,       // Datetime of the first trade file in the whole market history.
                dateEndOfMarket: undefined          // Datetime of the last file available to be used as an input of this process.
            };

            let previousDay;                        // Holds the date of the previous day relative to the processing date.

            getContextVariables()
            await processSingleFiles()
            await processMarketFiles()

            /*
                Here we check if we need to get Daily Files or not. As an optimization, when 
                we are running on a Time Frame of 1hs or above, we are not going to load 
                dependencies on Daily Files. The way we recognize that is by checking if 
                we alreaady set a value to currentTimeFrame. We are also not going to loop
                through days if we are processing market files.
            */

            if (currentTimeFrame) {
                /* We are processing Market Files */

                let chart = {} 
                buildCharts(chart)

                await generateOutput(chart)
                await writeProcessFiles()

                checkIfSessionMustStop()

            } else {
                /* We are processing Daily Files */

                /*
                Go back one day to start well when we advance time at the begining of the loop.
                */
                bot.tradingProcessDate = new Date(contextVariables.lastFile.valueOf() - global.ONE_DAY_IN_MILISECONDS); 
                do {
                    if (advanceTime() === false) {break}
                    if (checkStopTaskGracefully() === false) {break}
                    if (checkStopProcessing() === false) {break}
    
                    await processDailyFiles()
    
                    let chart = {} 
                    buildCharts(chart)
    
                    await generateOutput(chart)
                    await writeProcessFiles()
                  }
                  while (true)
            }

            callBackFunction(global.DEFAULT_OK_RESPONSE)

            function getContextVariables() {
                try {
                    let thisReport;
                    let reportKey;
                    let statusReport;

                    /* We are going to use the start date as beging of market date. */
                    contextVariables.dateBeginOfMarket = new Date(bot.SESSION.parameters.timeRange.config.initialDatetime)

                    /*
                        Here we get the status report from the bot who knows which is the end of the market.
                    */
                    statusReport = statusDependencies.reportsByMainUtility.get("Market Ending Point")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return
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
                        return
                    }

                    contextVariables.dateEndOfMarket = new Date(thisReport.lastFile.valueOf());

                    /* Validation that the data is not up-to-date. */
                    if (bot.tradingProcessDate.valueOf() - global.ONE_DAY_IN_MILISECONDS > contextVariables.dateEndOfMarket.valueOf() && bot.SESSION.type !== "Backtesting Session") {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> " + "Head of the market is @ " + contextVariables.dateEndOfMarket); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> You need to UPDATE your datasets in order to run a " + bot.SESSION.type) }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return

                    }

                    /* Finally we get our own Status Report. */
                    statusReport = statusDependencies.reportsByMainUtility.get("Self Reference")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.");
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return
                    }

                    thisReport = statusReport.file;
                    bot.simulationState = thisReport.simulationState;
                    if (bot.simulationState === undefined) { bot.simulationState = {} } // This should happen only when there is no status report

                    if (thisReport.lastFile !== undefined) {
                        if (bot.RESUME !== true) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining because bot has just started and resume execution was true."); }
                            startFromBegining();
                            return
                        }
                        contextVariables.lastFile = new Date(thisReport.lastFile);
                        return

                    } else {
                        /*
                        We are here becuse either:
                        1. There is no status report
                        2. There is no Last File (this happens on Market Files)
                        */
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Starting from the begining of the market because own status report not found or lastFile was undefined."); }
                        startFromBegining();
                        return
                    }

                    function startFromBegining() {
                        contextVariables.lastFile = new Date(contextVariables.dateBeginOfMarket.getUTCFullYear() + "-" + (contextVariables.dateBeginOfMarket.getUTCMonth() + 1) + "-" + contextVariables.dateBeginOfMarket.getUTCDate() + " " + "00:00" + GMT_SECONDS);

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> startFromBegining -> contextVariables.lastFile = " + contextVariables.lastFile); }
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

            async function processSingleFiles() {
                dataFiles = new Map();

                for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.nodeArray.length; dependencyIndex++) {
                    let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                    let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];
 
                    if (datasetModule.node.config.codeName !== "Single-File") {
                        continue
                    }

                    if (dataDependenciesModule.isItADepenency('atAnyTimeFrame', datasetModule.node.parentNode.config.singularVariableName) !== true) {
                        continue
                    }

                    let fileName = "Data.json";
                    let filePath = datasetModule.node.parentNode.config.codeName + '/' + datasetModule.node.config.codeName;

                    /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                    let response = await asyncGetDatasetFile(datasetModule, filePath, fileName) 
                    onFileReceived(response.err, response.text)

                    function onFileReceived(err, text) {
                        try {
                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                if (err.message === 'File does not exist.') {
                                    logger.write(MODULE_NAME, "[ERROR] The file " + filePath + '/' + fileName + ' does not exist and it is required to continue. This process will retry to read it in a while. In the meantime make yourself sure that the process that generates it has ran properly.');
                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processSingleFiles ->  onFileReceived -> err = " + err.message);
                                    callBackFunction(err);
                                }
                                return
                            }

                            let dataFile = JSON.parse(text);
                            dataFiles.set(dependency.id, dataFile);
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processSingleFiles ->  onFileReceived -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }

                let mapKey = "Single Files"
                multiPeriodDataFiles.set(mapKey, dataFiles)
            }

            async function processMarketFiles() {
                /* 
                We do market files first since if the simulation is run on daily files, there will 
                be a loop to get each of those files and we do not need that loop to reload market files. 

                We will iterate through all posible timeFrames.
                */
                for (let n = 0; n < global.marketFilesPeriods.length; n++) {
                    const timeFrame = global.marketFilesPeriods[n][0];
                    const timeFrameLabel = global.marketFilesPeriods[n][1];

                    dataFiles = new Map();

                    if (bot.SESSION.parameters.timeFrame.config.label === timeFrameLabel) {
                        currentTimeFrame = global.marketFilesPeriods[n][0];
                        currentTimeFrameLabel = global.marketFilesPeriods[n][1];
                    }
                    for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.nodeArray.length; dependencyIndex++) {
                        let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];

                        if (dependency.referenceParent.config.codeName !== "Multi-Period-Market") {
                            continue
                        }

                        if (dataDependenciesModule.isItADepenency(timeFrameLabel, datasetModule.node.parentNode.config.singularVariableName) !== true) {
                            if (!(bot.SESSION.parameters.timeFrame.config.label === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                continue
                            }
                        }

                        let fileName = "Data.json";
                        let filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel;

                        /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                        let response = await asyncGetDatasetFile(datasetModule, filePath, fileName) 
                        onFileReceived(response.err, response.text)

                        function onFileReceived(err, text) {
                            try {
                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    if (err.message === 'File does not exist.') {
                                        logger.write(MODULE_NAME, "[ERROR] The file " + filePath + '/' + fileName + ' does not exist and it is required to continue. This process will retry to read it in a while. In the meantime make yourself sure that the process that generates it has ran properly.');
                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                    } else {
                                        logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> onFileReceived -> err = " + err.message);
                                        callBackFunction(err);
                                    }
                                    return
                                }

                                let dataFile = JSON.parse(text);
                                let trimmedDataFile = trimDataFile(dataFile, datasetModule.node.parentNode.record)
                                dataFiles.set(dependency.id, trimmedDataFile);
                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> processMarketFiles -> onFileReceived -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }

                        function trimDataFile(dataFile, recordDefinition) {
                            /* 
                            Here we will discard all the records in a file that are outside of the current time range.
                            */
                            let beginIndex
                            let endIndex
                            let result = []
                            for (let i = 0; i < recordDefinition.properties.length; i++) {
                                let property = recordDefinition.properties[i]
                                if (property.config.codeName === 'begin') {
                                    beginIndex = i
                                }
                                if (property.config.codeName === 'end') {
                                    endIndex = i
                                }
                            }
                            for (let i = 0; i < dataFile.length; i++) {
                                let dataRecord = dataFile[i]
                                let begin = dataRecord[beginIndex]
                                let end = dataRecord[endIndex]
                                if (end < bot.SESSION.parameters.timeRange.config.initialDatetime - 1) { continue } // /1 because we need the previous closed element
                                if (begin > bot.SESSION.parameters.timeRange.config.finalDatetime) { continue }
                                result.push(dataRecord)
                            }
                            return result
                        }
                    }

                    let mapKey = global.marketFilesPeriods[n][1];
                    multiPeriodDataFiles.set(mapKey, dataFiles)
                }
            }

            async function processDailyFiles() {
                /*  Telling the world we are alive and doing well and which date we are processing right now. */
                let processingDate = bot.tradingProcessDate.getUTCFullYear() + '-' + utilities.pad(bot.tradingProcessDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(bot.tradingProcessDate.getUTCDate(), 2);
                bot.processHeartBeat(processingDate)
 
                /*
                We will iterate through all posible timeFrames.
                */
                for (let n = 0; n < global.dailyFilePeriods.length; n++) {
                    const timeFrame = global.dailyFilePeriods[n][0];
                    const timeFrameLabel = global.dailyFilePeriods[n][1];

                    if (processConfig.framework.validtimeFrames !== undefined) {
                        let validPeriod = false;
                        for (let i = 0; i < processConfig.framework.validtimeFrames.length; i++) {
                            let period = processConfig.framework.validtimeFrames[i];
                            if (period === timeFrameLabel) { validPeriod = true }
                        }
                        if (validPeriod === false) {
                            continue
                        }
                    }

                    if (bot.SESSION.parameters.timeFrame.config.label === timeFrameLabel) {
                        currentTimeFrame = global.dailyFilePeriods[n][0];
                        currentTimeFrameLabel = global.dailyFilePeriods[n][1];
                    }

                    dataFiles = new Map();

                    for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.nodeArray.length; dependencyIndex++) {
                        let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];
                        let file

                        if (dependency.referenceParent.config.codeName !== "Multi-Period-Daily") {
                            continue
                        }

                        if (dataDependenciesModule.isItADepenency(timeFrameLabel, datasetModule.node.parentNode.config.singularVariableName) !== true) {
                            if (!(bot.SESSION.parameters.timeFrame.config.label === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                continue
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

                        /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                        let response = await asyncGetDatasetFile(datasetModule, filePath, fileName) 
                        onFileReceived(response.err, response.text)

                        function onFileReceived(err, text) {
                            try {
                                if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {
                                    logger.write(MODULE_NAME, "[ERROR] The file " + filePath + '/' + fileName + ' does not exist and it is required to continue. This process will retry to read it in a while. In the meantime make yourself sure that the process that generates it has ran properly.');
                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                    return
                                }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> onFileReceived -> Not Ok -> err = " + err.code);
                                    callBackFunction(err);
                                    return
                                }

                                file = JSON.parse(text);
                                dataFiles.set(dependency.id, file);
                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> onFileReceived -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }

                    let mapKey = global.dailyFilePeriods[n][1];
                    multiPeriodDataFiles.set(mapKey, dataFiles)
                }

                if (currentTimeFrame !== undefined) {
                    buildCharts(advanceTime);
                } else {
                    logger.write(MODULE_NAME, "[ERROR] start -> processDailyFiles -> Time Frame not Recognized. Can not continue.");
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function advanceTime() {
                bot.tradingProcessDate = new Date(bot.tradingProcessDate.valueOf() + global.ONE_DAY_IN_MILISECONDS);
                previousDay = new Date(bot.tradingProcessDate.valueOf() - global.ONE_DAY_IN_MILISECONDS);

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> advanceTime -> bot.tradingProcessDate = " + bot.tradingProcessDate); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> advanceTime -> previousDay = " + previousDay); }

                /* Validation that we are not going past the user defined end date. */
                if (bot.tradingProcessDate.valueOf() >= bot.SESSION.parameters.timeRange.config.finalDatetime) {
                    const logText = "User Defined End Datetime reached @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> advanceTime -> " + logText); }

                    bot.SESSION.stop(logText)
                    return false
                }

                /* Validation that we are not going past the head of the market. */
                if (bot.tradingProcessDate.valueOf() > contextVariables.dateEndOfMarket.valueOf() + global.ONE_DAY_IN_MILISECONDS - 1) {
                    const logText = "Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> advanceTime -> " + logText); }
                    return false
                }
            }

            function checkStopTaskGracefully() {
                /* Validation that we dont need to stop. */
                if (global.STOP_TASK_GRACEFULLY === true) {
                    return false
                }
            }

            function checkStopProcessing() {
                /* Validation that we dont need to stop. */
                if (bot.STOP_SESSION === true) {
                    return false
                }
            }

            function buildCharts(chart) {
                const COMMONS = require('../Commons.js')
                let commons = COMMONS.newCommons(bot, logger, UTILITIES, FILE_STORAGE)

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
                        commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, currentTimeFrame)

                        let propertyName = 'at' + timeFrameLabel.replace('-', '')
                        chart[propertyName] = products
                    }
                }

                for (let j = 0; j < global.dailyFilePeriods.length; j++) {
                    let timeFrameLabel = global.dailyFilePeriods[j][1]
                    let dataFiles = multiPeriodDataFiles.get(timeFrameLabel)
                    let products = {}

                    if (dataFiles !== undefined) {
                        commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, currentTimeFrame)

                        let propertyName = 'at' + timeFrameLabel.replace('-', '')
                        chart[propertyName] = products
                    }
                }

                /* Single Files */
                let dataFiles = multiPeriodDataFiles.get('Single Files')
                let products = {}

                if (dataFiles !== undefined) {
                    commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, currentTimeFrame)

                    let propertyName = 'atAnyTimeFrame'
                    chart[propertyName] = products
                }
            }

            async function generateOutput(chart) {
                await tradingOutputModule.start(
                    chart,
                    currentTimeFrame,
                    currentTimeFrameLabel,
                    bot.tradingProcessDate
                    )

                bot.FIRST_EXECUTION = false // From here on, all other loops executions wont be the first execution.
            }

            async function writeProcessFiles() {

                await writeTimeFramesFiles(currentTimeFrame, currentTimeFrameLabel)
                await writeDataRanges(currentTimeFrameLabel)
 
                if (currentTimeFrame > global.dailyFilePeriods[0][0]) {
                    await writeMarketStatusReport(currentTimeFrameLabel)
                } else {
                    await writeDailyStatusReport(bot.tradingProcessDate, currentTimeFrameLabel)
                }

                async function writeDataRanges(currentTimeFrameLabel) {
                    for (let outputDatasetIndex = 0; outputDatasetIndex < bot.processNode.referenceParent.processOutput.outputDatasets.length; outputDatasetIndex++) {
                        let productCodeName = bot.processNode.referenceParent.processOutput.outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                        await writeDataRange(contextVariables.dateBeginOfMarket, bot.tradingProcessDate, productCodeName, currentTimeFrameLabel);
                    }
    
                    async function writeDataRange(pBegin, pEnd, productCodeName, currentTimeFrameLabel) {
                        let dataRange = {
                            begin: pBegin.valueOf(),
                            end: pEnd.valueOf() + global.ONE_DAY_IN_MILISECONDS
                        }
        
                        let fileContent = JSON.stringify(dataRange);
                        let fileName = '/Data.Range.json';
                        let filePath = bot.filePathRoot + "/Output/" + bot.SESSION.folderName + "/" + productCodeName + "/" + 'Multi-Period-Daily' + fileName;
                
                        let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n')
        
                        if (response.err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            throw(response.err)
                        }
        
                        /* 
                        Raise the event that the Data Range was Updated.
                        */
                        let key = bot.dataMine + "-" + bot.codeName + "-" + productCodeName + "-" + bot.exchange + "-" + bot.market.baseAsset + '/' + bot.market.quotedAsset
                        let event = {
                            dateRange: dataRange
                        }
        
                        global.EVENT_SERVER_CLIENT.raiseEvent(key, 'Data Range Updated', event)
                    }
                }
    
                async function writeTimeFramesFiles(currentTimeFrame, currentTimeFrameLabel) {
    
                    for (let outputDatasetIndex = 0; outputDatasetIndex < bot.processNode.referenceParent.processOutput.outputDatasets.length; outputDatasetIndex++) {
                        let productCodeName = bot.processNode.referenceParent.processOutput.outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                        await writeTimeFramesFile(currentTimeFrame, currentTimeFrameLabel, productCodeName, 'Multi-Period-Daily')
                        await writeTimeFramesFile(currentTimeFrame, currentTimeFrameLabel, productCodeName, 'Multi-Period-Market')
    
                        async function writeTimeFramesFile(currentTimeFrame, currentTimeFrameLabel, productCodeName, processType) {
    
                            let timeFramesArray = []
                            timeFramesArray.push(currentTimeFrameLabel)
            
                            let fileContent = JSON.stringify(timeFramesArray)
                            let fileName = '/Time.Frames.json';
            
                            let filePath = bot.filePathRoot + "/Output/" + bot.SESSION.folderName + "/" + productCodeName + "/" + processType + fileName;
            
                            let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n')
                            if (response.err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                throw(response.err)
                            }
                        }
                    }
                }

                async function writeDailyStatusReport(lastFileDate, currentTimeFrameLabel) {
                    let reportKey = bot.dataMine + "-" + bot.codeName + "-" + bot.processNode.referenceParent.config.codeName
                    let thisReport = statusDependencies.statusReports.get(reportKey)
    
                    thisReport.file.lastExecution = bot.currentDaytime
                    thisReport.file.lastFile = lastFileDate
                    thisReport.file.simulationState = bot.simulationState
                    thisReport.file.timeFrames = currentTimeFrameLabel
                    await thisReport.asyncSave()
                }
    
                async function writeMarketStatusReport(currentTimeFrameLabel) {
                    let reportKey = bot.dataMine + "-" + bot.codeName + "-" + bot.processNode.referenceParent.config.codeName
                    let thisReport = statusDependencies.statusReports.get(reportKey);
    
                    thisReport.file.lastExecution = bot.processDatetime
                    thisReport.file.simulationState = bot.simulationState
                    thisReport.file.timeFrames = currentTimeFrameLabel
    
                    logger.newInternalLoop(bot.codeName, bot.process, bot.tradingProcessDate)
                    await thisReport.asyncSave()
                }
            }

            function checkIfSessionMustStop() {
                /* 
                The natural way for the session to stop is when we reached the 
                user defined end datetime.  
                */
                const now = new Date()
                if (now.valueOf() >= bot.SESSION.parameters.timeRange.config.finalDatetime) {
                    const logText = "User Defined End Datetime reached @ " + now.getUTCFullYear() + "/" + (now.getUTCMonth() + 1) + "/" + now.getUTCDate() + ".";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeProcessFiles -> onMarketStatusReport -> " + logText); }

                    bot.SESSION.stop('because it just finished.')
                    return
                }
                if (bot.SESSION.type === 'Backtesting Session') {
                    bot.SESSION.stop('Backtesting Session over Market Files Finished.')
                    return
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

    async function asyncGetDatasetFile(datasetModule, filePath, fileName) {

        let promise = new Promise((resolve, reject) => {

            datasetModule.getTextFile(filePath, fileName, onFileReceived);
            function onFileReceived(err, text) {
 
                let response = {
                    err: err,
                    text: text
                }
                resolve(response)
            }
          });

        return promise
    }
}
