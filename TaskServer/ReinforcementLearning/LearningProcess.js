exports.newLearningProcess = function (processIndex, bot, logger, UTILITIES) {
    /*
    This Module will load all the process data dependencies from files and send them downstream.
    After execution, will save the time range and status report of the process.
    */
    const FULL_LOG = true;
    const MODULE_NAME = "Learning Process";
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

    const FILE_STORAGE = require('../FileStorage.js');
    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    const MARKOV_DECISION_PROCESS_MODULE = require('./MarkovDecisionProcess.js')
    let markovDecisionProcessModule = MARKOV_DECISION_PROCESS_MODULE.newMarkovDecisionProcess(bot, logger)

    let ALGORITHM_MODULE = require("./Algorithm")
    let algorithmModule = ALGORITHM_MODULE.newTradingOutput(processIndex, bot, logger, markovDecisionProcessModule, UTILITIES, FILE_STORAGE)

    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, pStatusDependencies, pDataDependencies, callBackFunction) {
        try {
            logger.fileName = MODULE_NAME
            logger.initialize()

            statusDependencies = pStatusDependencies
            dataDependenciesModule = pDataDependencies
            processConfig = pProcessConfig

            algorithmModule.initialize()

            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {

        markovDecisionProcessModule.finalize()
        markovDecisionProcessModule = undefined

        algorithmModule.finalize()
        algorithmModule = undefined

        dataFiles = undefined
        multiPeriodDataFiles = undefined
        statusDependencies = undefined
        dataDependenciesModule = undefined
        fileStorage = undefined
        processConfig = undefined
        thisObject = undefined
    }

    async function start(callBackFunction) {
        try {
            let currentTimeFrame
            let currentTimeFrameLabel

            /* Context Variables */
            let contextVariables = {
                lastFile: undefined,                // Datetime of the last file files sucessfully produced by this process.
                dateBeginOfMarket: undefined,       // Datetime of the first trade file in the whole market history.
                dateEndOfMarket: undefined          // Datetime of the last file available to be used as an input of this process.
            };

            getContextVariables()

            if (bot.FIRST_EXECUTION === true && bot.RESUME === false) {
                /* 
                Here is where the Trading Engine and Trading Systems received are moved to the simulation state.
                */
                bot.simulationState.tradingEngine = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_NODE
                bot.simulationState.tradingSystem = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SYSTEM_NODE
            }

            /* We set up the Trading Engine Module. */
            markovDecisionProcessModule.initialize()

            /* Initializing the Trading Process Date */
            if (bot.FIRST_EXECUTION === true && bot.RESUME === false) {
                /* 
                This funcion is going to be called many times by the Trading Bot Loop.
                Only during the first execution and when the User is not resuming the execution
                of a stopped session / task; we are going to initialize the Process Date Time.
                This variable tell us which day we are standing at, specially while working
                with Daily Files. From this Date is that we are going to load the Daily Files.
                */
                bot.simulationState.tradingEngine.current.episode.processDate.value = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.tradingParameters.timeRange.config.initialDatetime).valueOf()
            }

            /* 
            This is the Date that is going to be used across the execution of this Trading Process. 
            We need this because it has a different life cycle than the processData stored at the 
            Trading Engine data structure. This date has to remain the same during the whole execution
            of the Trading Process until the end, inclusind the writting of Data Ranges and Status Reports.
            The processDate of the Trading Engine data structure on the other hand can be changed during
            the simulation loop, once we discover that all candles from a certain date have benn processed.
            Here is the point where we sync one and the other.
            */
            let LearningProcessDate = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(bot.simulationState.tradingEngine.current.episode.processDate.value)
            await processSingleFiles()

            if (await processMarketFiles() === false) {
                bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Waiting for Data Mining to be run')
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                return
            }
            /*
            This is the Data Structure used at the Simulation with all indicator data.
            We start creating it right here.
            */
            let chart = {}
            /*
                Here we check if we need to get Daily Files or not. As an optimization, when 
                we are running on a Time Frame of 1hs or above, we are not going to load 
                dependencies on Daily Files. The way we recognize that is by checking if 
                we alreaady set a value to currentTimeFrame. We are also not going to loop
                through days if we are processing market files.
            */
            if (currentTimeFrame) {
                /* We are processing Market Files */
                /*
                With all the indicators data files loaded, we will build the chart object 
                data structure that will be used in user-defied conditions and formulas.
                */
                bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Waking up')
                buildCharts(chart)

                if (checkThereAreCandles(chart) === true) {
                    bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Running')
                    await generateOutput(chart)
                    bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Saving')
                    await writeProcessFiles()
                    bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Sleeping')
                } else {
                    bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Waiting for Data Mining to be up to date. No candles found at.')
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    return
                }

            } else {
                /* We are processing Daily Files */
                do {
                    TS.projects.superalgos.functionLibraries.sessionFunctions.emitSessionStatus(bot.TRADING_SESSION_STATUS, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY)
                    /* 
                    We update the Trading Process Date with the date calculated at the simulation.
                    We will use this date to load indicator and output files. After that we will 
                    use it to save Output Files and later the Data Ranges. This is the point where
                    the date calculated by the Simulation is applied at the Trading Process Level.
                    */
                    LearningProcessDate = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(bot.simulationState.tradingEngine.current.episode.processDate.value)

                    if (checkStopTaskGracefully() === false) { break }
                    if (checkStopProcessing() === false) { break }

                    bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Waking up')
                    if (await processDailyFiles() === false) {
                        bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Waiting for Data Mining to be run')
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }
                    /*
                    With all the indicators data files loaded, we will build the chart object 
                    data structure that will be used in user-defied conditions and formulas.
                    */
                    buildCharts(chart)
                    /*
                    The process of generating the output includes the trading simulation.
                    */
                    if (checkThereAreCandles(chart) === true) {
                        bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Running')
                        await generateOutput(chart)
                        bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Saving')
                        await writeProcessFiles()
                        bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Sleeping')
                    } else {
                        bot.TRADING_SESSIONHeartBeat(undefined, undefined, 'Waiting for Data Mining to be up to date')
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }
                    /*
                    If for any reason the session was stopped, we will break this loop and exit the process.
                    */
                    if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING === true) { break }
                    /* 
                    When we get to the end of the market, we need to break this process loop in order
                    to let time pass, new information be collected from the exchange, new data built 
                    into indicators, and eventually a new execution of this process.
                    */
                    if (checkStopHeadOfTheMarket() === false) { break }

                }
                while (true)
            }

            checkIfSessionMustStop()
            /*
            Everything worked as expected. We return an OK code and wait for
            the Bot Loop to call us again later. 
            */
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)

            function checkThereAreCandles(chart) {
                let sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.tradingParameters
                let propertyName = 'at' + sessionParameters.timeFrame.config.label.replace('-', '')
                let candles = chart[propertyName].candles

                if (candles.length === 0) {
                    return false
                } else {
                    return true
                }
            }

            function getContextVariables() {
                try {
                    let thisReport;
                    let statusReport;

                    /* We are going to use the start date as beging of market date. */
                    contextVariables.dateBeginOfMarket = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.tradingParameters.timeRange.config.initialDatetime)
                    /*
                    Here we get the status report from the bot who knows which is the end of the market.
                    */
                    statusReport = statusDependencies.reportsByMainUtility.get("Market Ending Point")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return
                    }

                    thisReport = statusReport.file;

                    if (thisReport.lastFile === undefined) {
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Undefined Last File. -> thisReport = " + JSON.stringify(thisReport));

                        let customOK = {
                            result: TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return
                    }

                    contextVariables.dateEndOfMarket = new Date(thisReport.lastFile.valueOf());

                    /* Finally we get our own Status Report. */
                    statusReport = statusDependencies.reportsByMainUtility.get("Self Reference")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
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
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
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

                    if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        throw (response.err)
                    }

                    let dataFile = JSON.parse(response.text);
                    dataFiles.set(dependency.id, dataFile);
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
                for (let n = 0; n < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length; n++) {
                    const timeFrame = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][0];
                    const timeFrameLabel = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1];

                    dataFiles = new Map();

                    if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.tradingParameters.timeFrame.config.label === timeFrameLabel) {
                        currentTimeFrame = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][0];
                        currentTimeFrameLabel = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1];
                    }
                    for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.nodeArray.length; dependencyIndex++) {
                        let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];

                        if (dependency.referenceParent.config.codeName !== "Multi-Period-Market") {
                            continue
                        }

                        if (dataDependenciesModule.isItADepenency(timeFrameLabel, datasetModule.node.parentNode.config.singularVariableName) !== true) {
                            if (!(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.tradingParameters.timeFrame.config.label === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                continue
                            }
                        }

                        let fileName = "Data.json";
                        let filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel;

                        /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                        let response = await asyncGetDatasetFile(datasetModule, filePath, fileName)

                        if (response.err.message === 'File does not exist.') {
                            return false
                        }

                        if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            throw (response.err)
                        }

                        let dataFile = JSON.parse(response.text);
                        let trimmedDataFile = trimDataFile(dataFile, datasetModule.node.parentNode.record)
                        dataFiles.set(dependency.id, trimmedDataFile);

                        function trimDataFile(dataFile, recordDefinition) {
                            /* 
                            Here we will discard all the records in a file that are outside of the current time range.
                            We will include the las element previous to the begining of the time range. This is needed
                            because during the simulation, the current period is not the open one, but the previous to 
                            the open, and if we do not include the previous to the initial datetime there will be no 
                            current objects at the begining of the simulation for many time frames. 
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
                                if (end + timeFrame < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.tradingParameters.timeRange.config.initialDatetime - 1) { continue } // /1 because we need the previous closed element
                                if (begin > TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.tradingParameters.timeRange.config.finalDatetime) { continue }
                                result.push(dataRecord)
                            }
                            return result
                        }
                    }

                    let mapKey = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1];
                    multiPeriodDataFiles.set(mapKey, dataFiles)
                }
                return true
            }

            async function processDailyFiles() {
                /*  Telling the world we are alive and doing well and which date we are processing right now. */
                let processingDateString = LearningProcessDate.getUTCFullYear() + '-' + utilities.pad(LearningProcessDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(LearningProcessDate.getUTCDate(), 2);
                bot.processHeartBeat(processingDateString, undefined, "Running...")

                /*
                We will iterate through all posible timeFrames.
                */
                for (let n = 0; n < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length; n++) {
                    const timeFrame = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][0];
                    const timeFrameLabel = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1];

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

                    if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.tradingParameters.timeFrame.config.label === timeFrameLabel) {
                        currentTimeFrame = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][0];
                        currentTimeFrameLabel = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1];
                    }

                    dataFiles = new Map();

                    /*
                    We will iterate through all dependencies, in order to load the
                    files that later will end up at the chart data structure.
                    */
                    for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.nodeArray.length; dependencyIndex++) {
                        let dependency = dataDependenciesModule.nodeArray[dependencyIndex];
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex];

                        if (dependency.referenceParent.config.codeName !== "Multi-Period-Daily") {
                            continue
                        }

                        if (dataDependenciesModule.isItADepenency(timeFrameLabel, datasetModule.node.parentNode.config.singularVariableName) !== true) {
                            if (!(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.tradingParameters.timeFrame.config.label === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                continue
                            }
                        }

                        let dateForPath = LearningProcessDate.getUTCFullYear() + '/' + utilities.pad(LearningProcessDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(LearningProcessDate.getUTCDate(), 2);
                        let filePath
                        if (dependency.referenceParent.config.codeName === "Multi-Period-Daily") {
                            filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel + "/" + dateForPath;
                        } else {
                            filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + dateForPath;
                        }
                        let fileName = "Data.json";

                        /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                        let response = await asyncGetDatasetFile(datasetModule, filePath, fileName)

                        if (response.err.message === 'File does not exist.') {
                            return false
                        }
                        if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            throw (response.err)
                        }

                        let dataFile = JSON.parse(response.text);
                        dataFiles.set(dependency.id, dataFile);
                    }

                    let mapKey = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1];
                    multiPeriodDataFiles.set(mapKey, dataFiles)
                }
                return true
            }

            function checkStopHeadOfTheMarket() {
                /*  
                We need to check if we have reached the head of the market in order to know 
                when to break the Daily Files Process loop and give time for a new candles /
                indicators to be built and continue the processing once this process is called
                again. 
                */
                if (bot.simulationState.tradingEngine.current.episode.headOfTheMarket.value === true) {
                    return false
                }
            }

            function checkStopTaskGracefully() {
                /* Validation that we dont need to stop. */
                if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                    return false
                }
            }

            function checkStopProcessing() {
                /* Validation that we dont need to stop. */
                if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING === true) {
                    return false
                }
            }

            function buildCharts(chart) {
                const COMMONS = require('../Commons.js')
                let commons = COMMONS.newCommons(bot, logger, UTILITIES, FILE_STORAGE)

                let mainDependency = {}

                /* The first phase here is about checking that we have everything we need at the definition level. */
                let dataDependencies = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies, 'Data Dependency')
                /* 
                We will filter ourt declared dependencies that are not present in the workspace.
                This will allow the user to have less Data Mines loaded at the workspace
                that the ones that a Trading Mine depends on.
                */
                dataDependencies = TS.projects.superalgos.utilities.nodeFunctions.filterOutNodeWihtoutReferenceParentFromNodeArray(dataDependencies)

                if (commons.validateDataDependencies(dataDependencies, callBackFunction) !== true) { return }

                let outputDatasets = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
                if (commons.validateOutputDatasets(outputDatasets, callBackFunction) !== true) { return }

                /* The second phase is about transforming the inputs into a format that can be used to apply the user defined code. */
                for (let j = 0; j < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length; j++) {
                    let timeFrameLabel = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[j][1]
                    let dataFiles = multiPeriodDataFiles.get(timeFrameLabel)
                    let products = {}

                    if (dataFiles !== undefined) {
                        commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, currentTimeFrame)

                        let propertyName = 'at' + timeFrameLabel.replace('-', '')
                        chart[propertyName] = products
                    }
                }

                for (let j = 0; j < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length; j++) {
                    let timeFrameLabel = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[j][1]
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
                await algorithmModule.start(
                    chart,
                    currentTimeFrame,
                    currentTimeFrameLabel,
                    LearningProcessDate
                )

                /*
                From here on, all other loops executions wont be the first execution and also
                we will consider that it is not resuming a previous execution as well.
                */
                bot.FIRST_EXECUTION = false
                bot.RESUME = false
            }

            async function writeProcessFiles() {
                let outputDatasets = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')

                await writeTimeFramesFiles(currentTimeFrame, currentTimeFrameLabel)
                await writeDataRanges()

                if (currentTimeFrame > TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[0][0]) {
                    await writeMarketStatusReport(currentTimeFrameLabel)
                } else {
                    await writeDailyStatusReport(currentTimeFrameLabel)
                }

                async function writeDataRanges() {
                    for (
                        let outputDatasetIndex = 0;
                        outputDatasetIndex < outputDatasets.length;
                        outputDatasetIndex++
                    ) {
                        let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                        await writeDataRange(productCodeName);
                    }

                    async function writeDataRange(productCodeName) {
                        let dataRange = {
                            begin: contextVariables.dateBeginOfMarket.valueOf(),
                            end: LearningProcessDate.valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                        }

                        let fileContent = JSON.stringify(dataRange);
                        let fileName = '/Data.Range.json';
                        let filePath = bot.filePathRoot + "/Output/" + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + "/" + productCodeName + "/" + 'Multi-Period-Daily' + fileName;

                        let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n')

                        if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            throw (response.err)
                        }

                        /* 
                        Raise the event that the Data Range was Updated.
                        */
                        let key = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + bot.codeName + "-" + productCodeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                        let event = {
                            dateRange: dataRange
                        }

                        global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Data Range Updated', event)
                    }
                }

                async function writeTimeFramesFiles(currentTimeFrame, currentTimeFrameLabel) {

                    for (
                        let outputDatasetIndex = 0;
                        outputDatasetIndex < outputDatasets.length;
                        outputDatasetIndex++
                    ) {
                        let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                        await writeTimeFramesFile(currentTimeFrameLabel, productCodeName, 'Multi-Period-Daily')
                        await writeTimeFramesFile(currentTimeFrameLabel, productCodeName, 'Multi-Period-Market')

                        async function writeTimeFramesFile(currentTimeFrameLabel, productCodeName, processType) {

                            let timeFramesArray = []
                            timeFramesArray.push(currentTimeFrameLabel)

                            let fileContent = JSON.stringify(timeFramesArray)
                            let fileName = '/Time.Frames.json';

                            let filePath = bot.filePathRoot + "/Output/" + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + "/" + productCodeName + "/" + processType + fileName;

                            let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n')
                            if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                throw (response.err)
                            }
                        }
                    }
                }

                async function writeDailyStatusReport(currentTimeFrameLabel) {
                    let reportKey = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + bot.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
                    let thisReport = statusDependencies.statusReports.get(reportKey)

                    thisReport.file.lastExecution = bot.currentDaytime
                    thisReport.file.lastFile = LearningProcessDate
                    thisReport.file.simulationState = bot.simulationState
                    thisReport.file.timeFrames = currentTimeFrameLabel
                    await thisReport.asyncSave()
                }

                async function writeMarketStatusReport(currentTimeFrameLabel) {
                    let reportKey = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + bot.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.processDatetime
                    thisReport.file.simulationState = bot.simulationState
                    thisReport.file.timeFrames = currentTimeFrameLabel

                    logger.newInternalLoop(LearningProcessDate)
                    await thisReport.asyncSave()
                }
            }

            function checkIfSessionMustStop() {

                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SESSION_NODE.type === 'Backtesting Session') {
                    /*
                    Backtests needs only one execution of this process to complete.
                    */
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[IMPORTANT] checkIfSessionMustStop -> Backtesting Session Finished. Stopping the Session now. ') }
                    TS.projects.superalgos.functionLibraries.sessionFunctions.stopSession(processIndex, 'Backtesting Session Finished.')
                }
            }
        }
        catch (err) {
            /* An unhandled exception occured. in this case we return Fail and log the stack. */
            if (err.stack) {
                logger.write(MODULE_NAME, "[ERROR] start -> Unhandled Exception. Will Abort this process. err = " + err.stack);
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            /* Some expected file was not found. We will return a RETRY code and move on. */
            if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {
                logger.write(MODULE_NAME, "[ERROR] File not Found. Will Retry the Process Loop.")
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                return
            }

            /* Some other handled exception occured. We return Fail and move on. */
            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                logger.write(MODULE_NAME, "[ERROR] start -> Handled Exception. Will Abort this process. err = " + err.message);
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
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
