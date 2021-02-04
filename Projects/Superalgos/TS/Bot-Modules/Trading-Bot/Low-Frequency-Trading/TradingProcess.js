exports.newSuperalgosBotModulesTradingProcess = function (processIndex) {
    /*
    This Module will load all the process data dependencies from files and send them downstream.
    After execution, will save the time range and status report of the process.
    */
    const MODULE_NAME = "Trading Process"

    thisObject = {
        finalize: finalize,
        start: start
    }

    let dataFiles = new Map()
    let multiTimeFrameDataFiles = new Map()
    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex)
    TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT = TS.projects.superalgos.botModules.tradingEngine.newSuperalgosBotModulesTradingEngine(processIndex)
    let tradingOutputModuleObject = TS.projects.superalgos.botModules.tradingOutput.newSuperalgosBotModulesTradingOutput(processIndex)

    return thisObject

    function finalize() {

        TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.finalize()
        TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT = undefined

        tradingOutputModuleObject = undefined

        dataFiles = undefined
        multiTimeFrameDataFiles = undefined
        statusDependencies = undefined
        dataDependenciesModule = undefined
        fileStorage = undefined
        thisObject = undefined
    }

    async function start(statusDependencies, dataDependenciesModule, callBackFunction) {
        try {

            let currentTimeFrame
            let currentTimeFrameLabel

            /* Context Variables */
            let contextVariables = {
                lastFile: undefined,                // Datetime of the last file files successfully produced by this process.
                dateBeginOfMarket: undefined,       // Datetime of the first trade file in the whole market history.
                dateEndOfMarket: undefined          // Datetime of the last file available to be used as an input of this process.
            }

            if (getContextVariables() !== true) { return }

            if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP === true && TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING === false) {
                /* 
                Here is where the Trading Engine and Trading Systems received are moved to the simulation state.
                */
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_NODE
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SYSTEM_NODE
            }

            /* We set up the Trading Engine Module. */
            TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initialize()

            /* Initializing the Trading Process Date */
            if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP === true && TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING === false) {
                /* 
                This funcion is going to be called many times by the Trading Bot Loop.
                Only during the first execution and when the User is not resuming the execution
                of a stopped session / task; we are going to initialize the Process Date Time.
                This variable tell us which day we are standing at, specially while working
                with Daily Files. From this Date is that we are going to load the Daily Files.
                */
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine.current.episode.processDate.value =
                    TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime).valueOf()
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
            let tradingProcessDate = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine.current.episode.processDate.value)

            if (await processSingleFiles() === false) {
                TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Waiting for Data Mining to be run')
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                return
            }

            if (await processMarketFiles() === false) {
                TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Waiting for Data Mining to be run')
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                return
            }
            /*
            These are the Data Structures used by end users at Conditions Code or Formulas.
            */
            let chart = {}
            let market = {}
            let exchange = {}
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
                TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Waking up')
                buildDataStructures()

                if (checkThereAreCandles() === true) {
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Running')
                    await generateOutput()
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Saving')
                    await writeProcessFiles()
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Sleeping')
                } else {
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Waiting for Data Mining to be up to date. No candles found at.')
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    return
                }

            } else {
                /* We are processing Daily Files */
                do {
                    TS.projects.superalgos.functionLibraries.sessionFunctions.emitSessionStatus(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY)
                    /* 
                    We update the Trading Process Date with the date calculated at the simulation.
                    We will use this date to load indicator and output files. After that we will 
                    use it to save Output Files and later the Data Ranges. This is the point where
                    the date calculated by the Simulation is applied at the Trading Process Level.
                    */
                    tradingProcessDate = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine.current.episode.processDate.value)

                    if (checkStopTaskGracefully() === false) { break }
                    if (checkStopProcessing() === false) { break }

                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Waking up')
                    if (await processDailyFiles() === false) {
                        TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Waiting for Data Mining to be run')
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }
                    /*
                    With all the indicators data files loaded, we will build the chart object 
                    data structure that will be used in user-defied conditions and formulas.
                    */
                    buildDataStructures()
                    /*
                    The process of generating the output includes the trading simulation.
                    */
                    if (checkThereAreCandles() === true) {
                        TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Running')
                        await generateOutput()
                        TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Saving')
                        await writeProcessFiles()
                        TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Sleeping')
                    } else {
                        TS.projects.superalgos.functionLibraries.sessionFunctions.sessionHeartBeat(processIndex, undefined, undefined, 'Waiting for Data Mining to be up to date')
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

            function checkThereAreCandles() {
                let sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters
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
                    let thisReport
                    let statusReport

                    /* We are going to use the start date as beging of market date. */
                    contextVariables.dateBeginOfMarket = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime)
                    /*
                    Here we get the status report from the bot who knows which is the end of the market.
                    */
                    statusReport = statusDependencies.reportsByMainUtility.get("Market Ending Point")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return false
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return false
                    }

                    thisReport = statusReport.file

                    if (thisReport.lastFile === undefined) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Undefined Last File. -> thisReport = " + JSON.stringify(thisReport))

                        let customOK = {
                            result: TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> customOK = " + customOK.message)
                        callBackFunction(customOK)
                        return false
                    }

                    contextVariables.dateEndOfMarket = new Date(thisReport.lastFile.valueOf())

                    /* Finally we get our own Status Report. */
                    statusReport = statusDependencies.reportsByMainUtility.get("Self Reference")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return false
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                        return false
                    }

                    thisReport = statusReport.file
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE = thisReport.simulationState
                    if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE === undefined) { TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE = {} } // This should happen only when there is no status report

                    if (thisReport.lastFile !== undefined) {
                        if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING !== true) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> getContextVariables -> Starting from the begining because bot has just started and resume execution was true.")
                            startFromBegining()
                            return true
                        }
                        contextVariables.lastFile = new Date(thisReport.lastFile)
                        return true

                    } else {
                        /*
                        We are here becuse either:
                        1. There is no status report
                        2. There is no Last File (this happens on Market Files)
                        */
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> Starting from the begining of the market because own status report not found or lastFile was undefined.")
                        startFromBegining()
                        return true
                    }

                    function startFromBegining() {
                        contextVariables.lastFile = new Date(contextVariables.dateBeginOfMarket.getUTCFullYear() + "-" + (contextVariables.dateBeginOfMarket.getUTCMonth() + 1) + "-" + contextVariables.dateBeginOfMarket.getUTCDate() + " " + "00:00" + TS.projects.superalgos.globals.timeConstants.GMT_SECONDS)

                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> startFromBegining -> contextVariables.lastFile = " + contextVariables.lastFile)
                    }

                } catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> getContextVariables -> err = " + err.stack)
                    if (err.message === "Cannot read property 'file' of undefined") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its statusDependencies declarations are correct. ")
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys))
                    }
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                }
            }

            async function processSingleFiles() {

                /* 
                We will iterate through all the exchanges and markets involved.
                */
                let exchangeList = Array.from(dataDependenciesModule.filters.exchange.list.keys())
                let marketList = Array.from(dataDependenciesModule.filters.market.list.keys())

                for (let e = 0; e < exchangeList.length; e++) {
                    let currentExchange = exchangeList[e]
                    for (let m = 0; m < marketList.length; m++) {
                        let currentMarket = marketList[m]

                        dataFiles = new Map()

                        for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.curatedDependencyNodeArray.length; dependencyIndex++) {
                            let dependency = dataDependenciesModule.curatedDependencyNodeArray[dependencyIndex]
                            let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]

                            if (datasetModule.node.config.codeName !== "Single-File") {
                                continue
                            }

                            if (datasetModule.exchange !== currentExchange) {
                                continue
                            }

                            if (datasetModule.market !== currentMarket) {
                                continue
                            }

                            if (dataDependenciesModule.filters.exchange.timeFrames.get(datasetModule.exchange + '-' + datasetModule.market + '-' + datasetModule.product + '-' + 'atAnyTimeFrame') !== true) {
                                /*
                                If we can not find the current data set is used at the current time 
                                frame we will skip this file.
                                */
                                continue
                            }

                            let fileName = "Data.json"
                            let filePath = datasetModule.node.parentNode.config.codeName + '/' + datasetModule.node.config.codeName

                            /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                            let response = await asyncGetDatasetFile(datasetModule, filePath, fileName)

                            if (response.err.message === 'File does not exist.') {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] File not Found. This process will wait until you run your Data Mining and this file is created. File = " + filePath + '/' + fileName)
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] Your strategy depends on the dataset  " + dependency.name + '.')
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] The reason that it depends on this dataset is becuase in one of your condition's Javascript Code node, you have written an expression that references this dataset. If you don't want to depend on this dataset, just locate that code and remove the mention.")
                                return false
                            }

                            if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                throw (response.err)
                            }

                            let dataFile = JSON.parse(response.text)
                            dataFiles.set(dependency.id, dataFile)
                        }

                        let mapKey = currentExchange + '-' + currentMarket + '-' + "Single Files"
                        multiTimeFrameDataFiles.set(mapKey, dataFiles)
                    }
                }
            }

            async function processMarketFiles() {
                /* 
                We do market files first since if the simulation is run on daily files, there will 
                be a loop to get each of those files and we do not need that loop to reload market files. 
                */

                /* 
                We will iterate through all the exchanges and markets involved.
                */
                let exchangeList = Array.from(dataDependenciesModule.filters.exchange.list.keys())
                let marketList = Array.from(dataDependenciesModule.filters.market.list.keys())

                for (let e = 0; e < exchangeList.length; e++) {
                    let currentExchange = exchangeList[e]
                    for (let m = 0; m < marketList.length; m++) {
                        let currentMarket = marketList[m]
                        /*
                        We will iterate through all posible timeFrames.
                        */
                        for (let n = 0; n < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length; n++) {
                            const timeFrame = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][0]
                            const timeFrameLabel = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1]

                            dataFiles = new Map()

                            /* Current Time Frame detection */
                            if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame.config.label === timeFrameLabel) {
                                currentTimeFrame = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][0]
                                currentTimeFrameLabel = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1]
                            }

                            /* Loop across the list of curated dependencies */
                            for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.curatedDependencyNodeArray.length; dependencyIndex++) {
                                let dependency = dataDependenciesModule.curatedDependencyNodeArray[dependencyIndex]
                                let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]

                                if (dependency.referenceParent.config.codeName !== "Multi-Period-Market") {
                                    continue
                                }

                                if (datasetModule.exchange !== currentExchange) {
                                    continue
                                }

                                if (datasetModule.market !== currentMarket) {
                                    continue
                                }

                                if (dataDependenciesModule.filters.exchange.timeFrames.get(datasetModule.exchange + '-' + datasetModule.market + '-' + datasetModule.product + '-' + timeFrameLabel) !== true) {
                                    /*
                                    If we can not find the current data set is used at the current time 
                                    frame we will skip this file, unless we are in the only special 
                                    case that we are retrieving candles.
                                    */
                                    if (!(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame.config.label === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                        continue
                                    }
                                    if (currentExchange !== dataDependenciesModule.defaultExchange || currentMarket !== dataDependenciesModule.defaultMarket) {
                                        continue
                                    }
                                }

                                let fileName = "Data.json"
                                let filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel

                                /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                                let response = await asyncGetDatasetFile(datasetModule, filePath, fileName)

                                if (response.err.message === 'File does not exist.') {
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] File not Found. This process will wait until you run your Data Mining and this file is created. File = " + filePath + '/' + fileName)
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] Your strategy depends on the dataset  " + dependency.name + '.')
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] The reason that it depends on this dataset is becuase in one of your condition's Javascript Code node, you have written an expression that references this dataset. If you don't want to depend on this dataset, just locate that code and remove the mention.")
                                    return false
                                }

                                if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                    throw (response.err)
                                }

                                let dataFile = JSON.parse(response.text)
                                let trimmedDataFile = trimDataFile(dataFile, datasetModule.node.parentNode.record)
                                dataFiles.set(dependency.id, trimmedDataFile)

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
                                        if (end + timeFrame < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime - 1) { continue } // /1 because we need the previous closed element
                                        if (begin > TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.finalDatetime) { continue }
                                        result.push(dataRecord)
                                    }
                                    return result
                                }
                            }

                            let mapKey = currentExchange + '-' + currentMarket + '-' + TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1]
                            multiTimeFrameDataFiles.set(mapKey, dataFiles)
                        }
                    }
                }
                return true
            }

            async function processDailyFiles() {
                /*  Telling the world we are alive and doing well and which date we are processing right now. */
                let processingDateString = tradingProcessDate.getUTCFullYear() + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(tradingProcessDate.getUTCMonth() + 1, 2) + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(tradingProcessDate.getUTCDate(), 2)
                TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, processingDateString, undefined, "Running...")

                /* 
                We will iterate through all the exchanges and markets involved.
                */
                let exchangeList = Array.from(dataDependenciesModule.filters.exchange.list.keys())
                let marketList = Array.from(dataDependenciesModule.filters.market.list.keys())

                for (let e = 0; e < exchangeList.length; e++) {
                    let currentExchange = exchangeList[e]
                    for (let m = 0; m < marketList.length; m++) {
                        let currentMarket = marketList[m]
                        /*
                        We will iterate through all posible timeFrames.
                        */
                        for (let n = 0; n < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length; n++) {
                            const timeFrameLabel = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1]

                            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.framework.validtimeFrames !== undefined) {
                                let validPeriod = false
                                for (let i = 0; i < TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.framework.validtimeFrames.length; i++) {
                                    let period = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.framework.validtimeFrames[i]
                                    if (period === timeFrameLabel) { validPeriod = true }
                                }
                                if (validPeriod === false) {
                                    continue
                                }
                            }

                            if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame.config.label === timeFrameLabel) {
                                currentTimeFrame = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][0]
                                currentTimeFrameLabel = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1]
                            }

                            dataFiles = new Map()

                            /*
                            We will iterate through all dependencies, in order to load the
                            files that later will end up at the chart data structure.
                            */
                            for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.curatedDependencyNodeArray.length; dependencyIndex++) {
                                let dependency = dataDependenciesModule.curatedDependencyNodeArray[dependencyIndex]
                                let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]

                                if (dependency.referenceParent.config.codeName !== "Multi-Period-Daily") {
                                    continue
                                }

                                if (datasetModule.exchange !== currentExchange) {
                                    continue
                                }

                                if (datasetModule.market !== currentMarket) {
                                    continue
                                }

                                if (dataDependenciesModule.filters.exchange.timeFrames.get(datasetModule.exchange + '-' + datasetModule.market + '-' + datasetModule.product + '-' + timeFrameLabel) !== true) {
                                    /*
                                    If we can not find the current data set is used at the current time 
                                    frame we will skip this file, unless we are in the only special 
                                    case that we are retrieving candles.
                                    */
                                    if (!(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame.config.label === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                        continue
                                    }
                                    if (currentExchange !== dataDependenciesModule.defaultExchange || currentMarket !== dataDependenciesModule.defaultMarket) {
                                        continue
                                    }
                                }

                                /*
                                We will need to fetch the data of the current day and the previous day, in order for .previous properties in conditions and formulas to work well.
                                */
                                let previousDate = new Date(tradingProcessDate.valueOf() - TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
                                let currentDate = new Date(tradingProcessDate.valueOf())

                                let previousFile = await getDataFileFromDate(previousDate)
                                if (previousFile === false) { return false }
                                let currentFile = await getDataFileFromDate(currentDate)
                                if (currentFile === false) { return false }
                                let bothFiles = previousFile.concat(currentFile)
                                dataFiles.set(dependency.id, bothFiles)

                                async function getDataFileFromDate(processDate) {

                                    let dateForPath = processDate.getUTCFullYear() + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCMonth() + 1, 2) + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCDate(), 2)
                                    let filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel + "/" + dateForPath
                                    let fileName = "Data.json"

                                    /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                                    let response = await asyncGetDatasetFile(datasetModule, filePath, fileName)

                                    if (response.err.message === 'File does not exist.') {
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] File not Found. This process will wait until you run your Data Mining and this file is created. File = " + filePath + '/' + fileName)
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] Your strategy depends on the dataset  " + dependency.name + '.')
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] The reason that it depends on this dataset is becuase in one of your condition's Javascript Code node, you have written an expression that references this dataset. If you don't want to depend on this dataset, just locate that code and remove the mention.")
                                        return false
                                    }
                                    if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                        throw (response.err)
                                    }

                                    return JSON.parse(response.text)
                                }
                            }
                            let mapKey = currentExchange + '-' + currentMarket + '-' + TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1]
                            multiTimeFrameDataFiles.set(mapKey, dataFiles)
                        }

                    }
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
                if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine.current.episode.headOfTheMarket.value === true) {
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

            function buildDataStructures() {
                /* Fisrt Phase: Validations */
                let mainDependency = {}
                /* 
                THe first thing we do is to build an array of all the 
                declared dependencies of the Trading Bot.
                */
                let dataDependencies = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies, 'Data Dependency')
                /* 
                Then we will filter out declared dependencies that are 
                not referencing nodes currently present at the workspace.
                This will allow the user to have less Data Mines loaded at 
                the workspace that the ones that a Trading Bot depends on.
                */
                dataDependencies = TS.projects.superalgos.utilities.nodeFunctions.filterOutNodeWihtoutReferenceParentFromNodeArray(dataDependencies)
                /*
                We will run some validations to prevent starting the process
                if all needed config and nodes are not present.
                */
                if (TS.projects.superalgos.functionLibraries.singleMarketFunctions.validateDataDependencies(processIndex, dataDependencies, callBackFunction) !== true) { return }
                /*
                Next we will build an array of output datasets of this process.
                We are not going to use it right now, but later down the line,
                we do it just to be able to validate that all nodes and config
                are ok before letting this provess run too far.
                */
                let outputDatasets = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
                /*
                Here we check that all output datasets configs are ok. 
                */
                if (TS.projects.superalgos.functionLibraries.singleMarketFunctions.validateOutputDatasets(processIndex, outputDatasets, callBackFunction) !== true) { return }

                /* Second Phase: Bilding the chart data structure */

                /* 
                This phase is about transforming the inputs into a format,
                or data structure that can be used in Javascript Code and 
                Formula nodes to access Indicator's data. 
                */

                let exchangeList = Array.from(dataDependenciesModule.filters.exchange.list.keys())
                let marketList = Array.from(dataDependenciesModule.filters.market.list.keys())

                for (let e = 0; e < exchangeList.length; e++) {
                    let currentExchange = exchangeList[e]
                    for (let m = 0; m < marketList.length; m++) {
                        let currentMarket = marketList[m]
                        let splittedMarket = currentMarket.split('-')
                        let baseAsset = splittedMarket[0]
                        let quotedAsset = splittedMarket[1]

                        /* Market Files */
                        for (let j = 0; j < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length; j++) {
                            let timeFrameLabel = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[j][1]
                            let dataFiles = multiTimeFrameDataFiles.get(currentExchange + '-' + currentMarket + '-' + timeFrameLabel)
                            let products = {}

                            if (dataFiles !== undefined && dataFiles.size > 0) {
                                TS.projects.superalgos.functionLibraries.singleMarketFunctions.inflateDatafiles(processIndex, dataFiles, dataDependencies, products, mainDependency, currentTimeFrame)

                                let propertyName = 'at' + timeFrameLabel.replace('-', '')
                                addProducs(propertyName, products)
                            }
                        }

                        /* Daily Files */
                        for (let j = 0; j < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length; j++) {
                            let timeFrameLabel = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[j][1]
                            let dataFiles = multiTimeFrameDataFiles.get(currentExchange + '-' + currentMarket + '-' + timeFrameLabel)
                            let products = {}

                            if (dataFiles !== undefined && dataFiles.size > 0) {
                                TS.projects.superalgos.functionLibraries.singleMarketFunctions.inflateDatafiles(processIndex, dataFiles, dataDependencies, products, mainDependency, currentTimeFrame)

                                let propertyName = 'at' + timeFrameLabel.replace('-', '')
                                addProducs(propertyName, products)
                            }
                        }

                        /* Single Files */
                        {
                            let dataFiles = multiTimeFrameDataFiles.get(currentExchange + '-' + currentMarket + '-' + 'Single Files')
                            let products = {}

                            if (dataFiles !== undefined && dataFiles.size > 0) {
                                TS.projects.superalgos.functionLibraries.singleMarketFunctions.inflateDatafiles(processIndex, dataFiles, dataDependencies, products, mainDependency, currentTimeFrame)

                                let propertyName = 'atAnyTimeFrame'
                                addProducs(propertyName, products)
                            }
                        }

                        function addProducs(propertyName, products) {
                            /*
                            The chart data structure allow users to simplify the syntax when they are using 
                            the default exchange and the default market. 
                            */
                            if (currentExchange === dataDependenciesModule.defaultExchange && currentMarket === dataDependenciesModule.defaultMarket) {
                                chart[propertyName] = products
                            }
                            /*
                            The market data structure allow users to simplify the syntax when they are using 
                            the default exchange. 
                            */
                            if (currentExchange === dataDependenciesModule.defaultExchange) {
                                if (market[baseAsset] === undefined) {
                                    market[baseAsset] = {}
                                }
                                if (market[baseAsset][quotedAsset] === undefined) {
                                    market[baseAsset][quotedAsset] = {}
                                }
                                if (market[baseAsset][quotedAsset].chart === undefined) {
                                    market[baseAsset][quotedAsset].chart = {}
                                }
                                market[baseAsset][quotedAsset].chart[propertyName] = products
                            }

                            if (exchange[currentExchange] === undefined) {
                                exchange[currentExchange] = {}
                            }
                            if (exchange[currentExchange].market === undefined) {
                                exchange[currentExchange].market = {}
                            }
                            if (exchange[currentExchange].market[baseAsset] === undefined) {
                                exchange[currentExchange].market[baseAsset] = {}
                            }
                            if (exchange[currentExchange].market[baseAsset][quotedAsset] === undefined) {
                                exchange[currentExchange].market[baseAsset][quotedAsset] = {}
                            }
                            if (exchange[currentExchange].market[baseAsset][quotedAsset].chart === undefined) {
                                exchange[currentExchange].market[baseAsset][quotedAsset].chart = {}
                            }
                            exchange[currentExchange].market[baseAsset][quotedAsset].chart[propertyName] = products
                        }
                    }
                }
            }

            async function generateOutput() {
                await tradingOutputModuleObject.start(
                    chart,
                    market,
                    exchange,
                    currentTimeFrame,
                    currentTimeFrameLabel,
                    tradingProcessDate
                )

                /*
                From here on, all other loops executions wont be the first execution and also
                we will consider that it is not resuming a previous execution as well.
                */
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP = false
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING = false
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
                        let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName
                        await writeDataRange(productCodeName)
                    }

                    async function writeDataRange(productCodeName) {
                        let dataRange = {
                            begin: contextVariables.dateBeginOfMarket.valueOf(),
                            end: tradingProcessDate.valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                        }

                        let fileContent = JSON.stringify(dataRange)
                        let fileName = '/Data.Range.json'
                        let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + "/" + productCodeName + "/" + 'Multi-Period-Daily' + fileName

                        let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n')

                        if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            throw (response.err)
                        }

                        /* 
                        Raise the event that the Data Range was Updated.
                        */
                        let key = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + productCodeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                        let event = {
                            dateRange: dataRange
                        }

                        TS.projects.superalgos.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Data Range Updated', event)
                    }
                }

                async function writeTimeFramesFiles(currentTimeFrame, currentTimeFrameLabel) {

                    for (
                        let outputDatasetIndex = 0;
                        outputDatasetIndex < outputDatasets.length;
                        outputDatasetIndex++
                    ) {
                        let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName
                        await writeTimeFramesFile(currentTimeFrameLabel, productCodeName, 'Multi-Period-Daily')
                        await writeTimeFramesFile(currentTimeFrameLabel, productCodeName, 'Multi-Period-Market')

                        async function writeTimeFramesFile(currentTimeFrameLabel, productCodeName, processType) {

                            let timeFramesArray = []
                            timeFramesArray.push(currentTimeFrameLabel)

                            let fileContent = JSON.stringify(timeFramesArray)
                            let fileName = '/Time.Frames.json'

                            let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + "/" + productCodeName + "/" + processType + fileName

                            let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n')
                            if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                throw (response.err)
                            }
                        }
                    }
                }

                async function writeDailyStatusReport(currentTimeFrameLabel) {
                    let reportKey = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
                    let thisReport = statusDependencies.statusReports.get(reportKey)

                    thisReport.file.lastFile = tradingProcessDate
                    thisReport.file.simulationState = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE
                    thisReport.file.timeFrames = currentTimeFrameLabel
                    await thisReport.asyncSave()
                }

                async function writeMarketStatusReport(currentTimeFrameLabel) {
                    let reportKey = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
                    let thisReport = statusDependencies.statusReports.get(reportKey)

                    thisReport.file.lastExecution = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME
                    thisReport.file.simulationState = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE
                    thisReport.file.timeFrames = currentTimeFrameLabel

                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(tradingProcessDate)
                    await thisReport.asyncSave()
                }
            }

            function checkIfSessionMustStop() {

                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                    /*
                    Backtests needs only one execution of this process to complete.
                    */
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[IMPORTANT] checkIfSessionMustStop -> Backtesting Session Finished. Stopping the Session now. ')
                    TS.projects.superalgos.functionLibraries.sessionFunctions.stopSession(processIndex, 'Backtesting Session Finished.')
                }
            }
        }
        catch (err) {
            /* An unhandled exception occured. in this case we return Fail and log the stack. */
            if (err.stack) {
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] start -> Unhandled Exception. Will Abort this process. err = " + err.stack)
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                return
            }

            /* Some expected file was not found. We will return a RETRY code and move on. */
            if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] File not Found. Will Retry the Process Loop.")
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                return
            }

            /* Some other handled exception occured. We return Fail and move on. */
            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] start -> Handled Exception. Will Abort this process. err = " + err.message)
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                return
            }
        }
    }

    async function asyncGetDatasetFile(datasetModule, filePath, fileName) {

        let promise = new Promise((resolve, reject) => {

            datasetModule.getTextFile(filePath, fileName, onFileReceived)
            function onFileReceived(err, text) {

                let response = {
                    err: err,
                    text: text
                }
                resolve(response)
            }
        })

        return promise
    }
}
