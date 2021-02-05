exports.newSuperalgosBotModulesMultiPeriodDaily = function (processIndex) {
    const MODULE_NAME = "Multi Period Daily"

    thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex)

    let statusDependencies
    let dataDependenciesModule
    let dataFiles = new Map
    let indicatorOutputModule
    let bootstrappingTheProcess = false
    let beginingOfMarket

    return thisObject;

    function initialize(pStatusDependencies, pDataDependencies, callBackFunction) {
        statusDependencies = pStatusDependencies;
        dataDependenciesModule = pDataDependencies;

        indicatorOutputModule = TS.projects.superalgos.botModules.indicatorOutput.newSuperalgosBotModulesIndicatorOutput(processIndex)
        indicatorOutputModule.initialize(callBackFunction)
    }

    function finalize() {
        dataFiles = undefined
        statusDependencies = undefined
        dataDependenciesModule = undefined
        indicatorOutputModule = undefined
        fileStorage = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {
        try {

            /* Context Variables */
            let contextVariables = {
                lastFile: undefined,                // Datetime of the last file files successfully produced by this process.
                dateBeginOfMarket: undefined,       // Datetime of the first trade file in the whole market history.
                dateEndOfMarket: undefined          // Datetime of the last file available to be used as an input of this process.
            };

            let previousDay;                        // Holds the date of the previous day relative to the processing date.
            let interExecutionMemoryArray;

            getContextVariables()

            function getContextVariables() {
                try {
                    let thisReport;
                    let statusReport;
                    /*
                    We look first for the bot who knows the begining of the market in order to get when the market starts.
                    */
                    statusReport = statusDependencies.reportsByMainUtility.get("Market Starting Point")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Market Starting Point -> Status Report does not exist or Market Starting Point not defined. Retrying Later. ")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    thisReport = statusReport.file;

                    if (thisReport.beginingOfMarket === undefined) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Undefined Last File. -> thisReport.beginingOfMarket === undefined ")
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> It is too early too run this process since the trade history of the market is not there yet.")

                        let customOK = {
                            result: TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency does not exist."
                        }
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> customOK = " + customOK.message)
                        callBackFunction(customOK)
                        return
                    }

                    contextVariables.dateBeginOfMarket = new Date(
                        thisReport.beginingOfMarket.year + "-" +
                        thisReport.beginingOfMarket.month + "-" +
                        thisReport.beginingOfMarket.days + " " +
                        thisReport.beginingOfMarket.hours + ":" +
                        thisReport.beginingOfMarket.minutes +
                        TS.projects.superalgos.globals.timeConstants.GMT_SECONDS
                    )
                    /*
                    Here we get the status report from the bot who knows which is the end of the market.
                    */
                    statusReport = statusDependencies.reportsByMainUtility.get("Market Ending Point")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Market Ending Point -> Status Report does not exist or Market Ending Point not defined. Retrying Later. ")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    thisReport = statusReport.file;

                    if (thisReport.lastFile === undefined) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Undefined Last File. -> thisReport.lastFile === undefined")

                        let customOK = {
                            result: TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> customOK = " + customOK.message)
                        callBackFunction(customOK)
                        return
                    }

                    contextVariables.dateEndOfMarket = new Date(thisReport.lastFile.valueOf())

                    /* Finally we get our own Status Report. */
                    statusReport = statusDependencies.reportsByMainUtility.get("Self Reference")

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Self Reference -> Status Report does not exist or Self Reference not defined or badly configured. Check that at the Status Dependency you have chosen Self Reference at the config. Retrying Later. ")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                        return
                    }

                    thisReport = statusReport.file;

                    if (thisReport.lastFile !== undefined) {

                        beginingOfMarket = new Date(thisReport.beginingOfMarket)

                        if (beginingOfMarket.valueOf() !== contextVariables.dateBeginOfMarket.valueOf()) { // Reset Mechanism for Begining of the Market
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> getContextVariables -> Reset Mechanism for Begining of the Market Activated.")

                            beginingOfMarket = new Date(contextVariables.dateBeginOfMarket.valueOf())
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
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> Starting from the begining of the market because own status report not found or lastFile was undefined.")
                        beginingOfMarket = new Date(contextVariables.dateBeginOfMarket.valueOf())
                        startFromBegining()
                    }

                    function startFromBegining() {
                        contextVariables.lastFile = new Date(
                            contextVariables.dateBeginOfMarket.getUTCFullYear() + "-" +
                            (contextVariables.dateBeginOfMarket.getUTCMonth() + 1) + "-" +
                            contextVariables.dateBeginOfMarket.getUTCDate() + " " + "00:00" +
                            TS.projects.superalgos.globals.timeConstants.GMT_SECONDS
                        )

                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> startFromBegining -> contextVariables.lastFile = " + contextVariables.lastFile)
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

                        for (let i = 0; i < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length; i++) {
                            let emptyObject = {};
                            interExecutionMemoryArray.push(emptyObject)
                        }

                        processTimeFrames()
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

            function processTimeFrames() {
                let n;
                let botNeverRan = true;

                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME =
                    new Date(contextVariables.lastFile.valueOf() - TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS) // Go back one day to start well when we advance time at the begining of the loop.
                let fromDate = new Date(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.valueOf())
                let lastDate = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(new Date())

                advanceTime()

                function advanceTime() {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME =
                        new Date(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.valueOf() +
                            TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
                    previousDay = new Date(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.valueOf() -
                        TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS)

                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> processTimeFrames -> advanceTime -> TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME = " +
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME)
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> processTimeFrames -> advanceTime -> previousDay = " + previousDay)

                    /* Validation that we are not going past the head of the market. */
                    if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.valueOf() > contextVariables.dateEndOfMarket.valueOf()) {

                        const logText = "Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> processTimeFrames -> advanceTime -> " + logText)

                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                        return

                    }

                    /*  Telling the world we are alive and doing well */
                    let currentDateString = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.getUTCFullYear() + '-' +
                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.getUTCMonth() + 1, 2) + '-' +
                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.getUTCDate(), 2)
                    let currentDate = new Date(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME)
                    let percentage = TS.projects.superalgos.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
                    TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, currentDateString, percentage)

                    if (TS.projects.superalgos.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date()) === false) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(currentDate, percentage)
                    }
                    checkStopTaskGracefully()
                }
                function checkStopTaskGracefully() {
                    /* Validation that we dont need to stop. */
                    if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
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

                    const timeFrame = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][0]
                    const timeFrameLabel = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1]

                    /* Check Time Frames Filter */
                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames !== undefined) {
                            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames.includes(timeFrameLabel) === false) {
                                /* We are not going to process this Time Frame */
                                timeFramesControlLoop()
                                return
                            }
                        }
                    }

                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.framework.validPeriods !== undefined) {
                        let validPeriod = false;
                        for (let i = 0; i < TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.framework.validPeriods.length; i++) {
                            let period = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.framework.validPeriods[i]
                            if (period === timeFrameLabel) { validPeriod = true }
                        }
                        if (validPeriod === false) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> processTimeFrames -> timeFramesLoopBody -> Discarding period for not being listed as a valid period. -> timeFrameLabel = " + timeFrameLabel)
                            timeFramesControlLoop()
                            return
                        }
                    }
                    let dependencyIndex = 0
                    dataFiles = new Map()

                    dependencyLoopBody()

                    function dependencyLoopBody() {
                        let dependency = dataDependenciesModule.curatedDependencyNodeArray[dependencyIndex]
                        if (dependency === undefined) {

                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> You need to add at least one Data Dependency to the process Multi Period Daily. Aborting process.")
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                            return
                        }

                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]
                        let previousFile
                        let currentFile

                        if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.valueOf() > contextVariables.dateBeginOfMarket.valueOf()) {
                            getPreviousFile()
                        } else {
                            previousFile = []
                            getCurrentFile()
                        }

                        function getPreviousFile() {
                            let dateForPath = previousDay.getUTCFullYear() + '/' +
                                TS.projects.superalgos.utilities.miscellaneousFunctions.pad(previousDay.getUTCMonth() + 1, 2) + '/' +
                                TS.projects.superalgos.utilities.miscellaneousFunctions.pad(previousDay.getUTCDate(), 2)
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
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[WARN] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> Skipping day because file " + filePath + "/" + fileName + " was not found.")

                                    advanceTime()
                                    return
                                }

                                if ((err.result === "Fail Because" && err.message === "File does not exist.") || err.code === 'The specified key does not exist.') {

                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> err = " + err.stack)
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                    return
                                }

                                if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {

                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getPreviousFile -> onFileReceived -> err = " + err.stack)
                                    callBackFunction(err)
                                    return
                                }

                                previousFile = JSON.parse(text)
                                getCurrentFile()
                            }

                        }

                        function getCurrentFile() {
                            let dateForPath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.getUTCFullYear() + '/' +
                                TS.projects.superalgos.utilities.miscellaneousFunctions.pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.getUTCMonth() + 1, 2) + '/' +
                                TS.projects.superalgos.utilities.miscellaneousFunctions.pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME.getUTCDate(), 2)
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

                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> err = " + err.code)
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> filePath = " + filePath)
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> onFileReceived -> fileName = " + fileName)
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                    return
                                }

                                if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getCurrentFile -> Not OK -> onFileReceived -> err = " + err.code)
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
                        if (dependencyIndex < dataDependenciesModule.curatedDependencyNodeArray.length) {
                            dependencyLoopBody()
                        } else {
                            generateOutput()
                        }

                        function generateOutput() {

                            indicatorOutputModule.start(
                                dataFiles,
                                timeFrame,
                                timeFrameLabel,
                                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME,
                                interExecutionMemoryArray[n],
                                onOutputGenerated)

                            function onOutputGenerated(err) {
                                if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
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
                    if (n < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length) {
                        timeFramesLoopBody()
                    } else {
                        n = 0;
                        writeDataRanges(onWritten)

                        function onWritten(err) {
                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] start -> processTimeFrames -> controlLoop -> onWritten -> err = " + err.stack)
                                callBackFunction(err)
                                return
                            }
                            writeStatusReport(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME, advanceTime)
                        }
                    }
                }
            }

            function writeDataRanges(callBack) {
                let outputDatasets = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(
                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
                let outputDatasetIndex = -1;
                controlLoop()

                function productLoopBody() {
                    let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                    writeDataRange(
                        contextVariables.dateBeginOfMarket,
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).DAILY_FILES_PROCESS_DATETIME,
                        productCodeName,
                        controlLoop
                    )
                }

                function controlLoop() {
                    outputDatasetIndex++
                    if (outputDatasetIndex < outputDatasets.length) {
                        productLoopBody()
                    } else {
                        callBack(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                    }
                }
            }

            function writeDataRange(pBegin, pEnd, productCodeName, callBack) {
                let dataRange = {
                    begin: pBegin.valueOf(),
                    end: pEnd.valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                };
                let fileContent = JSON.stringify(dataRange)
                let fileName = '/Data.Range.json';
                let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + productCodeName + "/" +
                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + fileName;

                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                function onFileCreated(err) {
                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> writeDataRange -> onFileCreated -> err = " + err.stack)
                        callBack(err)
                        return
                    }
                    let key = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" +
                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + productCodeName + "-" +
                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "-" +
                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' +
                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                    let event = {
                        dateRange: dataRange
                    }

                    TS.projects.superalgos.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Data Range Updated', event)
                    writeTimeFramesFile(productCodeName, callBack)
                }
            }

            function writeTimeFramesFile(productCodeName, callBack) {

                let timeFramesArray = []
                for (let n = 0; n < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length; n++) {
                    let timeFrameLabel = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1]

                    /* Check Time Frames Filter */
                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames !== undefined) {
                            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames.includes(timeFrameLabel) === true) {
                                timeFramesArray.push(timeFrameLabel)
                            }
                        } else {
                            timeFramesArray.push(timeFrameLabel)
                        }
                    } else {
                        timeFramesArray.push(timeFrameLabel)
                    }
                }

                let fileContent = JSON.stringify(timeFramesArray)
                let fileName = '/Time.Frames.json';
                let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + productCodeName + "/" +
                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + fileName;

                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                function onFileCreated(err) {
                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> writeTimeFramesFiles -> onFileCreated -> err = " + err.stack)
                        callBack(err)
                        return
                    }
                    callBack(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                }
            }

            function writeStatusReport(lastFileDate, callBack) {
                let reportKey = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" +
                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + "Multi-Period-Daily"
                let thisReport = statusDependencies.statusReports.get(reportKey)

                thisReport.file.lastFile = lastFileDate;
                thisReport.file.interExecutionMemoryArray = interExecutionMemoryArray;
                thisReport.file.beginingOfMarket = beginingOfMarket.toUTCString()
                if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames !== undefined) {
                        thisReport.file.timeFrames = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames
                    }
                }
                thisReport.save(callBack)

            }
        }
        catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> err = " + err.stack)
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
};
