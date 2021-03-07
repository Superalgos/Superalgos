exports.newSuperalgosBotModulesCandlesVolumesMultiPeriodDaily = function (processIndex) {

    const MODULE_NAME = "Candles Volumes Multi Period Daily";
    const CANDLES_FOLDER_NAME = "Candles";
    const CANDLES_ONE_MIN = "One-Min";
    const VOLUMES_FOLDER_NAME = "Volumes";
    const VOLUMES_ONE_MIN = "One-Min";

    thisObject = {
        initialize: initialize,
        start: start
    }

    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex)
    let statusDependencies;
    let beginingOfMarket

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        try {
            statusDependencies = pStatusDependencies
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)

        } catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> err = " + err.stack)
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
    /*
    This process is going to do the following:
    Read the candles and volumes from Exchange Raw Data and produce a file for each day and for each period with candles and volumes.
    */
    function start(callBackFunction) {
        try {
            /* Context Variables */
            let contextVariables = {
                lastCandleFile: undefined,          // Datetime of the last file files successfully produced by this process.
                firstTradeFile: undefined,          // Datetime of the first trade file in the whole market history.
                maxCandleFile: undefined            // Datetime of the last file available to be used as an input of this process.
            };

            getContextVariables();

            function getContextVariables() {
                try {
                    let thisReport;
                    let reportKey;
                    let statusReport;

                    /* We look first for Exchange Raw Data in order to get when the market starts. */
                    reportKey = "Masters" + "-" + "Exchange-Raw-Data" + "-" + "Historic-OHLCVs"
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> getContextVariables -> reportKey = " + reportKey)

                    statusReport = statusDependencies.statusReports.get(reportKey);
                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey).file;
                    if (thisReport.beginingOfMarket === undefined) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> It is too early too run this process since the trade history of the market is not there yet.");

                        let customOK = {
                            result: TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency does not exist."
                        }
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> customOK = " + customOK.message)
                        callBackFunction(customOK)
                        return
                    }

                    contextVariables.firstTradeFile = new Date(
                        thisReport.beginingOfMarket.year + "-" +
                        thisReport.beginingOfMarket.month + "-" +
                        thisReport.beginingOfMarket.days + " " +
                        thisReport.beginingOfMarket.hours + ":" +
                        thisReport.beginingOfMarket.minutes +
                        TS.projects.superalgos.globals.timeConstants.GMT_SECONDS)

                    /* Second, we get the report from Exchange Raw Data, to know when the marted ends. */
                    reportKey = "Masters" + "-" + "Exchange-Raw-Data" + "-" + "Historic-OHLCVs"
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> getContextVariables -> reportKey = " + reportKey)

                    statusReport = statusDependencies.statusReports.get(reportKey);
                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey).file
                    if (thisReport.lastFile === undefined) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);

                        let customOK = {
                            result: TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> customOK = " + customOK.message)
                        callBackFunction(customOK)
                        return
                    }

                    contextVariables.maxCandleFile = new Date(
                        thisReport.lastFile.year + "-" +
                        thisReport.lastFile.month + "-" +
                        thisReport.lastFile.days + " " + "00:00" +
                        TS.projects.superalgos.globals.timeConstants.GMT_SECONDS)

                    /* Finally we get our own Status Report. */

                    reportKey = "Masters" + "-" + "Candles-Volumes" + "-" + "Multi-Period-Daily"
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> getContextVariables -> reportKey = " + reportKey)

                    statusReport = statusDependencies.statusReports.get(reportKey)

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.")
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                        return
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey).file;
                    if (thisReport.lastFile !== undefined) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> Process Running not for the very first time. -> reportKey = " + reportKey)

                        beginingOfMarket = new Date(thisReport.beginingOfMarket)
                        if (beginingOfMarket.valueOf() !== contextVariables.firstTradeFile.valueOf()) { // Reset Mechanism for Begining of the Market
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> getContextVariables -> Reset Mechanism for Begining of the Market Activated. -> reportKey = " + reportKey);

                            beginingOfMarket = new Date(contextVariables.firstTradeFile.getUTCFullYear() + "-" + (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" + contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" + TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);
                            contextVariables.lastCandleFile = new Date(
                                contextVariables.firstTradeFile.getUTCFullYear() + "-" +
                                (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" +
                                contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" +
                                TS.projects.superalgos.globals.timeConstants.GMT_SECONDS)
                            contextVariables.lastCandleFile = new Date(
                                contextVariables.lastCandleFile.valueOf() -
                                TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS) // Go back one day to start well.

                            buildCandles()
                            return
                        }

                        contextVariables.lastCandleFile = new Date(thisReport.lastFile);
                        /*
                        Here we assume that the last day written might contain incomplete information. This actually happens every time the head of the market is reached.
                        For that reason we go back one day, the partial information is discarded and added again with whatever new info is available.
                        */
                        contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() - TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
                        buildCandles()
                        return

                    } else {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> Process Running for the very first time. -> reportKey = " + reportKey);

                        beginingOfMarket = new Date(
                            contextVariables.firstTradeFile.getUTCFullYear() + "-" +
                            (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" +
                            contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" +
                            TS.projects.superalgos.globals.timeConstants.GMT_SECONDS)
                        contextVariables.lastCandleFile = new Date(
                            contextVariables.firstTradeFile.getUTCFullYear() + "-" +
                            (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" +
                            contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" +
                            TS.projects.superalgos.globals.timeConstants.GMT_SECONDS)
                        contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() - TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS); // Go back one day to start well.

                        buildCandles()
                        return
                    }

                } catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> getContextVariables -> err = " + err.stack)
                    if (err.message === "Cannot read property 'file' of undefined") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its statusDependencies declarations are correct. ");
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys))
                    }
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                }
            }

            function buildCandles() {
                try {
                    let fromDate = new Date(contextVariables.lastCandleFile.valueOf())
                    let lastDate = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(new Date())
                    let outputCandles
                    let outputVolumes

                    advanceTime()

                    function advanceTime() {
                        contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS);

                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> buildCandles -> advanceTime -> New processing time @ " + contextVariables.lastCandleFile.getUTCFullYear() + "/" + (contextVariables.lastCandleFile.getUTCMonth() + 1) + "/" + contextVariables.lastCandleFile.getUTCDate() + ".")

                        /* Validation that we are not going past the head of the market. */
                        if (contextVariables.lastCandleFile.valueOf() > contextVariables.maxCandleFile.valueOf()) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> buildCandles -> advanceTime -> Head of the market found @ " + contextVariables.lastCandleFile.getUTCFullYear() + "/" + (contextVariables.lastCandleFile.getUTCMonth() + 1) + "/" + contextVariables.lastCandleFile.getUTCDate() + ".")

                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE) // Here is where we finish processing and wait for the platform to run this module again.
                            return
                        }
                        /*  Telling the world we are alive and doing well */
                        let currentDateString =
                            contextVariables.lastCandleFile.getUTCFullYear() + '-' +
                            TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCMonth() + 1, 2) + '-' +
                            TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCDate(), 2)
                        let currentDate = new Date(contextVariables.lastCandleFile)
                        let percentage = TS.projects.superalgos.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
                        TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, currentDateString, percentage)

                        if (TS.projects.superalgos.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date()) === false) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(currentDate, percentage);
                        }
                        /*
                        We prepere the arrays that will accumulate all the information for each output file.
                        */
                        outputCandles = []
                        outputVolumes = []

                        for (let n = 0; n < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length; n++) {
                            const emptyArray1 = []
                            const emptyArray2 = []
                            outputCandles.push(emptyArray1)
                            outputVolumes.push(emptyArray2)
                        }
                        periodsLoop();
                    }

                    function periodsLoop() {
                        /*
                        We will iterate through all posible periods.
                        */
                        let n = 0   // loop Variable representing each possible period as defined at the periods array.
                        loopBody();

                        function loopBody() {
                            const outputPeriod = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][0]
                            const timeFrame = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1]

                            nextCandleFile();

                            function nextCandleFile() {
                                let dateForPath =
                                    contextVariables.lastCandleFile.getUTCFullYear() + '/' +
                                    TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCMonth() + 1, 2) + '/' +
                                    TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCDate(), 2)
                                let fileName = "Data.json"

                                let filePathRoot =
                                    'Project/' +
                                    TS.projects.superalgos.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName + "/" +
                                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-') + "/" +
                                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "/" +
                                    "Exchange-Raw-Data" + '/' +
                                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" +
                                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" +
                                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                                let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + CANDLES_ONE_MIN + '/' + dateForPath
                                filePath += '/' + fileName

                                fileStorage.getTextFile(filePath, onFileReceived)

                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[INFO] start -> buildCandles -> periodsLoop -> loopBody -> getting file at dateForPath = " + dateForPath)

                                function onFileReceived(err, text) {
                                    try {
                                        let candlesFile;

                                        if (err.result === TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                            try {
                                                candlesFile = JSON.parse(text);

                                            } catch (err) {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> Error Parsing JSON -> err = " + err.stack)
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                                return;
                                            }
                                        } else {

                                            if (err.message === 'File does not exist.' || err.code === 'The specified key does not exist.') {

                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[WARN] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> Dependency Not Ready -> err = " + err.stack)
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[WARN] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                                return

                                            } else {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> Error Received -> err = " + err.stack)
                                                callBackFunction(err);
                                                return
                                            }
                                        }

                                        const inputCandlesPerdiod = 60 * 1000;              // 1 min
                                        const inputFilePeriod = 24 * 60 * 60 * 1000;        // 24 hs

                                        let totalOutputCandles = inputFilePeriod / outputPeriod;
                                        let beginingOutputTime = contextVariables.lastCandleFile.valueOf();

                                        for (let i = 0; i < totalOutputCandles; i++) {

                                            let outputCandle = {
                                                open: 0,
                                                close: 0,
                                                min: 0,
                                                max: 0,
                                                begin: 0,
                                                end: 0
                                            }

                                            let saveCandle = false;

                                            outputCandle.begin = beginingOutputTime + i * outputPeriod;
                                            outputCandle.end = beginingOutputTime + (i + 1) * outputPeriod - 1;

                                            for (let j = 0; j < candlesFile.length; j++) {

                                                let candle = {
                                                    open: candlesFile[j][2],
                                                    close: candlesFile[j][3],
                                                    min: candlesFile[j][0],
                                                    max: candlesFile[j][1],
                                                    begin: candlesFile[j][4],
                                                    end: candlesFile[j][5]
                                                };

                                                /* Here we discard all the candles out of range.  */
                                                if (candle.begin >= outputCandle.begin && candle.end <= outputCandle.end) {

                                                    if (saveCandle === false) { // this will set the value only once.
                                                        outputCandle.open = candle.open;
                                                        outputCandle.min = candle.min
                                                        outputCandle.max = candle.max
                                                    }

                                                    saveCandle = true;
                                                    outputCandle.close = candle.close;      // only the last one will be saved
                                                    if (candle.min < outputCandle.min) {
                                                        outputCandle.min = candle.min
                                                    }
                                                    if (candle.max > outputCandle.max) {
                                                        outputCandle.max = candle.max
                                                    }
                                                }
                                            }
                                            if (saveCandle === true) {      // then we have a valid candle, otherwise it means there were no candles to fill this one in its time range.
                                                outputCandles[n].push(outputCandle)
                                            }
                                        }
                                        nextVolumeFile();
                                    } catch (err) {
                                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.stack);
                                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }

                            function nextVolumeFile() {
                                try {
                                    let dateForPath = contextVariables.lastCandleFile.getUTCFullYear() + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCMonth() + 1, 2) + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCDate(), 2);
                                    let fileName = "Data.json"
                                    let filePathRoot =
                                        'Project/' +
                                        TS.projects.superalgos.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-') + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "/" +
                                        "Exchange-Raw-Data" + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                                    let filePath =
                                        filePathRoot +
                                        "/Output/" +
                                        VOLUMES_FOLDER_NAME + '/' +
                                        VOLUMES_ONE_MIN + '/' +
                                        dateForPath
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(filePath, onFileReceived);

                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> getting file at dateForPath = " + dateForPath);

                                    function onFileReceived(err, text) {
                                        let volumesFile

                                        if (err.result === TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                            try {
                                                volumesFile = JSON.parse(text);
                                            } catch (err) {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> Error Parsing JSON -> err = " + err.stack);
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.")
                                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                                return
                                            }
                                        } else {
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> Error Received -> err = " + err.stack)
                                            callBackFunction(err)
                                            return
                                        }

                                        const inputVolumesPerdiod = 60 * 1000;              // 1 min
                                        const inputFilePeriod = 24 * 60 * 60 * 1000;        // 24 hs
                                        let totalOutputVolumes = inputFilePeriod / outputPeriod; // this should be 2 in this case.
                                        let beginingOutputTime = contextVariables.lastCandleFile.valueOf();

                                        for (let i = 0; i < totalOutputVolumes; i++) {
                                            let outputVolume = {
                                                buy: 0,
                                                sell: 0,
                                                begin: 0,
                                                end: 0
                                            }
                                            let saveVolume = false;

                                            outputVolume.begin = beginingOutputTime + i * outputPeriod;
                                            outputVolume.end = beginingOutputTime + (i + 1) * outputPeriod - 1;

                                            for (let j = 0; j < volumesFile.length; j++) {
                                                let volume = {
                                                    buy: volumesFile[j][0],
                                                    sell: volumesFile[j][1],
                                                    begin: volumesFile[j][2],
                                                    end: volumesFile[j][3]
                                                }

                                                /* Here we discard all the Volumes out of range.  */
                                                if (volume.begin >= outputVolume.begin && volume.end <= outputVolume.end) {
                                                    saveVolume = true
                                                    outputVolume.buy = outputVolume.buy + volume.buy
                                                    outputVolume.sell = outputVolume.sell + volume.sell
                                                }
                                            }

                                            if (saveVolume === true) {
                                                outputVolumes[n].push(outputVolume);
                                            }
                                        }
                                        writeFiles(outputCandles[n], outputVolumes[n], timeFrame, controlLoop)
                                    }
                                } catch (err) {
                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> err = " + err.stack);
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }

                        function controlLoop() {
                            n++;
                            if (n < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length) {
                                loopBody()
                            } else {
                                writeDataRanges(onWritten);

                                function onWritten(err) {
                                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] writeDataRanges -> writeDataRanges -> onCandlesDataRangeWritten -> err = " + err.stack)
                                        callBack(err)
                                        return
                                    }
                                    writeStatusReport(contextVariables.lastCandleFile, advanceTime);
                                }
                            }
                        }
                    }
                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> buildCandles -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeFiles(candles, volumes, timeFrame, callBack) {
                /*
                Here we will write the contents of the Candles and Volumens files.
                */
                try {
                    writeCandles()

                    function writeCandles() {
                        let separator = ""
                        let fileRecordCounter = 0
                        let fileContent = ""

                        for (let i = 0; i < candles.length; i++) {
                            let candle = candles[i]
                            fileContent = fileContent + separator + '[' + candles[i].min + "," + candles[i].max + "," + candles[i].open + "," + candles[i].close + "," + candles[i].begin + "," + candles[i].end + "]";
                            if (separator === "") { separator = ","; }
                            fileRecordCounter++
                        }

                        fileContent = "[" + fileContent + "]";

                        let fileName = 'Data.json';
                        let dateForPath =
                            contextVariables.lastCandleFile.getUTCFullYear() + '/' +
                            TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCMonth() + 1, 2) + '/' +
                            TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCDate(), 2)
                        let filePath =
                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                            "/Output/" +
                            CANDLES_FOLDER_NAME + "/" +
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + "/" +
                            timeFrame + "/" +
                            dateForPath
                        filePath += '/' + fileName

                        fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> writeFiles -> writeCandles -> creating file at filePath = " + filePath);

                        function onFileCreated(err) {
                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] start -> writeFiles -> writeCandles -> onFileCreated -> err = " + err.stack);
                                callBackFunction(err);
                                return;
                            }

                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[WARN] start -> writeFiles -> writeCandles -> onFileCreated ->  Finished with File @ " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName);

                            writeVolumes();
                        }
                    }

                    function writeVolumes() {
                        let separator = "";
                        let fileRecordCounter = 0;
                        let fileContent = "";

                        for (let i = 0; i < volumes.length; i++) {
                            let candle = volumes[i];
                            fileContent = fileContent + separator + '[' + volumes[i].buy + "," + volumes[i].sell + "," + volumes[i].begin + "," + volumes[i].end + "]";
                            if (separator === "") { separator = ","; }
                            fileRecordCounter++
                        }

                        fileContent = "[" + fileContent + "]";

                        let fileName = 'Data.json';
                        let dateForPath =
                            contextVariables.lastCandleFile.getUTCFullYear() + '/' +
                            TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCMonth() + 1, 2) + '/' +
                            TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.lastCandleFile.getUTCDate(), 2)
                        let filePath =
                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                            "/Output/" +
                            VOLUMES_FOLDER_NAME + "/" +
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + "/" +
                            timeFrame + "/" + dateForPath
                        filePath += '/' + fileName

                        fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> writeFiles -> writeVolumes -> creating file at filePath = " + filePath);

                        function onFileCreated(err) {

                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] start -> writeFiles -> writeVolumes -> onFileCreated -> err = " + err.stack)
                                callBackFunction(err)
                                return
                            }

                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[WARN] start -> writeFiles -> writeVolumes -> onFileCreated ->  Finished with File @ " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName);

                            callBack()
                        }
                    }
                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> writeFiles -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeDataRanges(callBack) {
                try {
                    writeDataRange(contextVariables.firstTradeFile, contextVariables.lastCandleFile, CANDLES_FOLDER_NAME, onCandlesDataRangeWritten);

                    function onCandlesDataRangeWritten(err) {
                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] writeDataRanges -> writeDataRanges -> onCandlesDataRangeWritten -> err = " + err.stack)
                            callBack(err)
                            return
                        }

                        writeDataRange(contextVariables.firstTradeFile, contextVariables.lastCandleFile, VOLUMES_FOLDER_NAME, onVolumeDataRangeWritten);

                        function onVolumeDataRangeWritten(err) {
                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] writeDataRanges -> writeDataRanges -> onVolumeDataRangeWritten -> err = " + err.stack)
                                callBack(err)
                                return
                            }
                            callBack(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> writeDataRanges -> err = " + err.stack);
                    callBack(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }

            }

            function writeDataRange(pBegin, pEnd, pProductFolder, callBack) {
                try {
                    let dataRange = {
                        begin: pBegin.valueOf(),
                        end: pEnd.valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                    }

                    let fileContent = JSON.stringify(dataRange);

                    let fileName = 'Data.Range.json';
                    let filePath =
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + pProductFolder + "/" +
                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
                    filePath += '/' + fileName

                    fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {
                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> writeDataRange -> onFileCreated -> err = " + err.stack)
                            callBack(err)
                            return
                        }

                        let key =
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" +
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" +
                            pProductFolder + "-" +
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "-" +
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' +
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                        let event = {
                            dateRange: dataRange
                        }

                        TS.projects.superalgos.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Data Range Updated', event)

                        callBack(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                    }
                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> writeDataRange -> err = " + err.stack)
                    callBack(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                }
            }

            function writeStatusReport(lastFileDate, callBack) {
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[INFO] start -> writeStatusReport -> lastFileDate = " + lastFileDate)
                try {
                    let reportKey = "Masters" + "-" + "Candles-Volumes" + "-" + "Multi-Period-Daily"
                    let thisReport = statusDependencies.statusReports.get(reportKey)

                    thisReport.file.lastExecution = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME;
                    thisReport.file.lastFile = lastFileDate;
                    thisReport.file.beginingOfMarket = beginingOfMarket.toUTCString()
                    thisReport.save(callBack);
                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

        }
        catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] 'Start' - ERROR : " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}
