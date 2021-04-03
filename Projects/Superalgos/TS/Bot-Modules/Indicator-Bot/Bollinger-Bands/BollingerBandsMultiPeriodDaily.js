exports.newSuperalgosBotModulesBollingerBandsMultiPeriodDaily = function (processIndex) {

    const MODULE_NAME = "Bollinger Bands Multi Period Daily"
    const CANDLES_FOLDER_NAME = "Candles"
    const BOLLINGER_BANDS_FOLDER_NAME = "Bollinger-Bands"
    const PERCENTAGE_BANDWIDTH_FOLDER_NAME = "Percentage-Bandwidth"

    thisObject = {
        initialize: initialize,
        start: start
    };

    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex);

    let statusDependencies;
    let beginingOfMarket

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {

        try {
            statusDependencies = pStatusDependencies;
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);

        } catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
    This process is going to do the following:
    Read the candles from Candles Volumes and produce daily files with bollinger bands.
    */
    function start(callBackFunction) {
        try {
            /* Context Variables */
            let contextVariables = {
                lastBandFile: undefined,          // Datetime of the last file files successfully produced by this process.
                firstTradeFile: undefined,          // Datetime of the first trade file in the whole market history.
                maxBandFile: undefined            // Datetime of the last file available to be used as an input of this process.
            };

            let previousDay;                        // Holds the date of the previous day relative to the processing date.
            let processDate;                        // Holds the processing date.

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
                            "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    contextVariables.firstTradeFile = new Date(
                        thisReport.beginingOfMarket.year + "-" +
                        thisReport.beginingOfMarket.month + "-" +
                        thisReport.beginingOfMarket.days + " " +
                        thisReport.beginingOfMarket.hours + ":" +
                        thisReport.beginingOfMarket.minutes +
                        TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);

                    /* Second, we get the report from Candles Volumes, to know when the marted ends. */
                    reportKey = "Masters" + "-" + "Candles-Volumes" + "-" + "Multi-Period-Daily"
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

                    if (thisReport.lastFile === undefined) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);

                        let customOK = {
                            result: TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    contextVariables.maxBandFile = new Date(thisReport.lastFile.valueOf());

                    /* Finally we get our own Status Report. */
                    reportKey = "Masters" + "-" + "Bollinger-Bands" + "-" + "Multi-Period-Daily"
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
                            "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile !== undefined) {

                        beginingOfMarket = new Date(thisReport.beginingOfMarket);

                        if (beginingOfMarket.valueOf() !== contextVariables.firstTradeFile.valueOf()) { // Reset Mechanism for Begining of the Market
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> getContextVariables -> Reset Mechanism for Begining of the Market Activated. -> reportKey = " + reportKey);

                            beginingOfMarket = new Date(
                                contextVariables.firstTradeFile.getUTCFullYear() + "-" +
                                (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" +
                                contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" +
                                TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);
                            contextVariables.lastBandFile = new Date(
                                contextVariables.firstTradeFile.getUTCFullYear() + "-" +
                                (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" +
                                contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" +
                                TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);
                            contextVariables.lastBandFile = new Date(
                                contextVariables.lastBandFile.valueOf() +
                                TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS);

                            buildBands();
                            return;
                        }

                        contextVariables.lastBandFile = new Date(thisReport.lastFile);

                        /*
                        The bands objects needs to be calculated over more than one day in some situations. In order to simplify the calculations we will
                        always load the last 2 days of candles, and run the calculations on that array.

                        1. So first we will load the candles file of processDay -1.
                        2. Secondly we will load the candles file of processDay.

                        After reading these two files we will add all candles to a unique array.
                        */
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> thisReport.lastFile !== undefined")

                        buildBands();
                        return;

                    } else {

                        /*
                        In the case when there is no status report, we take the date of the file with the first trades as the begining of the market. Then we will
                        go one day further in time, so that the previous day does fine a file at the begining of the market.
                        */
                        contextVariables.lastBandFile = new Date(
                            contextVariables.firstTradeFile.getUTCFullYear() + "-" +
                            (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" +
                            contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" +
                            TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);
                        contextVariables.lastBandFile = new Date(
                            contextVariables.lastBandFile.valueOf() +
                            TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS);

                        beginingOfMarket = new Date(
                            contextVariables.firstTradeFile.getUTCFullYear() + "-" +
                            (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" +
                            contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" +
                            TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);

                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> thisReport.lastFile === undefined")
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> contextVariables.lastBandFile = " + contextVariables.lastBandFile)

                        buildBands();
                        return;
                    }

                } catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its statusDependencies declarations are correct. ");
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildBands() {

                try {
                    let n;
                    processDate = new Date(contextVariables.lastBandFile.valueOf() - TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS); // Go back one day to start well when we advance time at the begining of the loop.
                    let fromDate = new Date(processDate.valueOf())
                    let lastDate = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(new Date())

                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> buildBands -> processDate = " + processDate)

                    advanceTime();

                    function advanceTime() {

                        try {
                            processDate = new Date(processDate.valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS);
                            previousDay = new Date(processDate.valueOf() - TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS);

                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> buildBands -> advanceTime -> processDate = " + processDate)
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> buildBands -> advanceTime -> previousDay = " + previousDay)

                            /* Validation that we are not going past the head of the market. */
                            if (processDate.valueOf() > contextVariables.maxBandFile.valueOf()) {
                                const logText = "Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[INFO] start -> buildBands -> advanceTime -> " + logText)

                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                return
                            }

                            /*  Telling the world we are alive and doing well */
                            let currentDateString =
                                processDate.getUTCFullYear() + '-' +
                                TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCMonth() + 1, 2) + '-' +
                                TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCDate(), 2);
                            let currentDate = new Date(processDate)
                            let percentage = TS.projects.superalgos.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
                            TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, currentDateString, percentage)

                            if (TS.projects.superalgos.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date()) === false) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(currentDate, percentage);
                            }
                            periodsLoop();

                        } catch (err) {
                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> buildBands -> advanceTime -> err = " + err.stack);
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsLoop() {

                        try {
                            /*
                            We will iterate through all posible timeFrames
                            */
                            n = 0   // loop Variable representing each possible period as defined at the periods array.
                            loopBody();

                        } catch (err) {
                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> buildBands -> periodsLoop -> err = " + err.stack);
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {

                        try {
                            const timeFrame = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[n][1];

                            let candles = [];                   // Here we will put all the candles of the 2 files read.

                            let previousDayFile;
                            let processDayFile;

                            getPreviousDayFile();

                            function getPreviousDayFile() {
                                try {
                                    let dateForPath =
                                        previousDay.getUTCFullYear() + '/' +
                                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(previousDay.getUTCMonth() + 1, 2) + '/' +
                                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(previousDay.getUTCDate(), 2);
                                    let fileName = "Data.json"
                                    let filePathRoot =
                                        'Project/' +
                                        TS.projects.superalgos.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-') + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "/" +
                                        "Candles-Volumes" + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timeFrame + "/" + dateForPath;
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(filePath, onCurrentDayFileReceived);

                                    function onCurrentDayFileReceived(err, text) {
                                        try {
                                            previousDayFile = JSON.parse(text);
                                            getProcessDayFile()

                                        } catch (err) {
                                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getPreviousDayFile -> onCurrentDayFileReceived -> err = " + err.stack);
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getPreviousDayFile -> onCurrentDayFileReceived -> filePath = " + filePath);
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getPreviousDayFile -> onCurrentDayFileReceived -> market = " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '_' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName);

                                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getPreviousDayFile -> err = " + err.stack);
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function getProcessDayFile() {
                                try {
                                    let dateForPath =
                                        processDate.getUTCFullYear() + '/' +
                                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCMonth() + 1, 2) + '/' +
                                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCDate(), 2);
                                    let fileName = "Data.json"
                                    let filePathRoot =
                                        'Project/' +
                                        TS.projects.superalgos.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-') + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "/" +
                                        "Candles-Volumes" + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timeFrame + "/" + dateForPath;
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(filePath, onCurrentDayFileReceived);

                                    function onCurrentDayFileReceived(err, text) {
                                        try {
                                            processDayFile = JSON.parse(text);
                                            buildBands();
                                        } catch (err) {
                                            if (processDate.valueOf() > contextVariables.maxBandFile.valueOf()) {
                                                processDayFile = [];  // we are past the head of the market, then no worries if this file is non existent.
                                                buildBands();
                                            } else {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getProcessDayFile -> onCurrentDayFileReceived -> err = " + err.stack);
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getProcessDayFile -> onCurrentDayFileReceived -> filePath = " + filePath);
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getProcessDayFile -> onCurrentDayFileReceived -> market = " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '_' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName);

                                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                                return
                                            }
                                        }
                                    }

                                } catch (err) {
                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getProcessDayFile -> err = " + err.stack);
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildBands() {
                                try {
                                    addCandlesToSingleArray(previousDayFile);
                                    addCandlesToSingleArray(processDayFile);
                                    calculateBands();

                                    function addCandlesToSingleArray(candlesFile) {
                                        try {
                                            for (let i = 0; i < candlesFile.length; i++) {

                                                let candle = {
                                                    open: undefined,
                                                    close: undefined,
                                                    min: 10000000000000,
                                                    max: 0,
                                                    begin: undefined,
                                                    end: undefined,
                                                    direction: undefined
                                                }

                                                candle.min = candlesFile[i][0];
                                                candle.max = candlesFile[i][1];

                                                candle.open = candlesFile[i][2];
                                                candle.close = candlesFile[i][3];

                                                candle.begin = candlesFile[i][4];
                                                candle.end = candlesFile[i][5];

                                                if (candle.open > candle.close) { candle.direction = 'down'; }
                                                if (candle.open < candle.close) { candle.direction = 'up'; }
                                                if (candle.open === candle.close) { candle.direction = 'side'; }

                                                candles.push(candle);
                                            }

                                        } catch (err) {
                                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> buildBands -> addCandlesToSingleArray -> err = " + err.stack);
                                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> buildBands -> err = " + err.stack);
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }

                            function calculateBands() {
                                try {
                                    let bandsArray = [];
                                    let pBArray = [];
                                    let numberOfPeriodsBB = 20;
                                    let numberOfStandardDeviations = 2;
                                    let numberOfPeriodsPB = 10;

                                    /* Building bands */
                                    let band

                                    for (let i = numberOfPeriodsBB - 1; i < candles.length; i++) { // Go through all the candles to generate a band segment for each of them.
                                        /* Calculating the bollinger bands. */
                                        let movingAverage = 0;
                                        for (let j = i - numberOfPeriodsBB + 1; j < i + 1; j++) { // go through the last n candles to calculate the moving average.
                                            movingAverage = movingAverage + candles[j].close;
                                        }
                                        movingAverage = movingAverage / numberOfPeriodsBB;

                                        let standardDeviation = 0;
                                        for (let j = i - numberOfPeriodsBB + 1; j < i + 1; j++) { // go through the last n candles to calculate the standard deviation.
                                            standardDeviation = standardDeviation + Math.pow(candles[j].close - movingAverage, 2);
                                        }
                                        standardDeviation = standardDeviation / numberOfPeriodsBB;
                                        standardDeviation = Math.sqrt(standardDeviation);
                                        if (standardDeviation === 0) { standardDeviation = 0.000000001; } // This is to prevent a division by zero later.

                                        band = {
                                            begin: candles[i].begin,
                                            end: candles[i].end,
                                            movingAverage: movingAverage,
                                            standardDeviation: standardDeviation,
                                            deviation: standardDeviation * numberOfStandardDeviations
                                        }

                                        /* Will only add to the array the bands of the current day */
                                        if (band.begin >= processDate.valueOf()) { bandsArray.push(band); }

                                        /* Calculating %B */
                                        let lowerBB
                                        let upperBB

                                        lowerBB = band.movingAverage - band.deviation;
                                        upperBB = band.movingAverage + band.deviation;

                                        let value = (candles[i].close - lowerBB) / (upperBB - lowerBB) * 100

                                        /* Moving Average Calculation */

                                        let numberOfPreviousPeriods;
                                        let currentPosition = pBArray.length;

                                        if (currentPosition < numberOfPeriodsPB) { // Avoinding to get into negative array indexes
                                            numberOfPreviousPeriods = currentPosition;
                                        } else {
                                            numberOfPreviousPeriods = numberOfPeriodsPB;
                                        }

                                        movingAverage = 0
                                        for (let j = currentPosition - numberOfPreviousPeriods; j < currentPosition; j++) { // go through the last numberOfPeriodsPBs to calculate the moving average.
                                            movingAverage = movingAverage + pBArray[j].value;
                                        }
                                        movingAverage = movingAverage + value;
                                        movingAverage = movingAverage / (numberOfPreviousPeriods + 1);

                                        let bandwidth = (upperBB - lowerBB) / band.movingAverage;

                                        let percentageBandwidth = {
                                            begin: candles[i].begin,
                                            end: candles[i].end,
                                            value: value,
                                            movingAverage: movingAverage,
                                            bandwidth: bandwidth
                                        };

                                        /* Will only add to the array the pBs of the current day */
                                        if (percentageBandwidth.begin >= processDate.valueOf()) { pBArray.push(percentageBandwidth); }
                                    }

                                    writeBandsFile(bandsArray, pBArray);

                                } catch (err) {
                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> calculateBands -> err = " + err.stack);
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                                    return
                                }
                            }

                            function writeBandsFile(pBands, pPB) {
                                try {
                                    let separator = "";
                                    let fileRecordCounter = 0;

                                    let fileContent = "";

                                    for (let i = 0; i < pBands.length; i++) {

                                        let band = pBands[i];

                                        fileContent = fileContent + separator + '[' +
                                            band.begin + "," +
                                            band.end + "," +
                                            band.movingAverage + "," +
                                            band.standardDeviation + "," +
                                            band.deviation + "]";

                                        if (separator === "") { separator = ","; }
                                        fileRecordCounter++
                                    }

                                    fileContent = "[" + fileContent + "]";

                                    let dateForPath =
                                        processDate.getUTCFullYear() + '/' +
                                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCMonth() + 1, 2) + '/' +
                                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCDate(), 2);
                                    let fileName = 'Data.json';
                                    let filePath =
                                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                                        "/Output/" +
                                        BOLLINGER_BANDS_FOLDER_NAME + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + "/" +
                                        timeFrame + "/" + dateForPath;
                                    filePath += '/' + fileName

                                    fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                                    function onFileCreated(err) {
                                        try {
                                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildBands -> loopBody -> writeBandBandsFile -> writeBandsFile -> onFileCreated -> err = " + err.stack)
                                                callBackFunction(err)
                                                return
                                            }

                                            const logText = "[WARN] Finished with File @ " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writeBandsFile -> onFileCreated -> " + logText)

                                            writePBFile(pPB);

                                        } catch (err) {
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> writeBandBandsFile -> writeBandsFile -> onFileCreated -> err = " + err.stack);
                                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                                        }
                                    }
                                } catch (err) {
                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> writeBandBandsFile -> writeBandsFile -> err = " + err.stack);
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function writePBFile(pPercentageBandwidths) {

                                try {
                                    let separator = ""
                                    let fileRecordCounter = 0

                                    let fileContent = ""

                                    for (let i = 0; i < pPercentageBandwidths.length; i++) {

                                        let pB = pPercentageBandwidths[i];

                                        fileContent = fileContent + separator + '[' +
                                            pB.begin + "," +
                                            pB.end + "," +
                                            pB.value + "," +
                                            pB.movingAverage + "," +
                                            pB.bandwidth + "]";

                                        if (separator === "") { separator = ","; }

                                        fileRecordCounter++
                                    }

                                    fileContent = "[" + fileContent + "]";

                                    let dateForPath =
                                        processDate.getUTCFullYear() + '/' +
                                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCMonth() + 1, 2) + '/' +
                                        TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processDate.getUTCDate(), 2);
                                    let fileName = 'Data.json';
                                    let filePath =
                                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                                        "/Output/" +
                                        PERCENTAGE_BANDWIDTH_FOLDER_NAME + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + "/" +
                                        timeFrame + "/" + dateForPath;
                                    filePath += '/' + fileName

                                    fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                                    function onFileCreated(err) {
                                        try {
                                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildBands -> loopBody -> writeBandBandsFile -> writePBFile -> onFileCreated -> err = " + err.stack)
                                                callBackFunction(err)
                                                return
                                            }

                                            const logText = "[WARN] Finished with File @ " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writePBFile -> onFileCreated -> " + logText)

                                            controlLoop()
                                        } catch (err) {
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> writeBandBandsFile -> writePBFile -> onFileCreated -> err = " + err.stack);
                                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                                        }
                                    }
                                } catch (err) {
                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> writeBandBandsFile -> writePBFile -> err = " + err.stack);
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        } catch (err) {
                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> err = " + err.stack);
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function controlLoop() {
                        try {
                            n++
                            if (n < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length) {
                                loopBody()
                            } else {
                                n = 0
                                writeDataRanges(onWritten);

                                function onWritten(err) {
                                    try {
                                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> buildBands -> controlLoop -> onWritten -> err = " + err.stack)
                                            callBackFunction(err)
                                            return
                                        }
                                        writeStatusReport(processDate, advanceTime);

                                    } catch (err) {
                                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> buildBands -> periodsLoop -> controlLoop -> onWritten -> err = " + err.stack);
                                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }
                        } catch (err) {
                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> buildBands -> periodsLoop -> controlLoop -> err = " + err.stack);
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }

                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> buildBands -> err.message = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeDataRanges(callBack) {
                try {
                    writeDataRange(contextVariables.firstTradeFile, processDate, BOLLINGER_BANDS_FOLDER_NAME, onBandsBandsDataRangeWritten);

                    function onBandsBandsDataRangeWritten(err) {
                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] writeDataRanges -> writeDataRanges -> onBandsBandsDataRangeWritten -> err = " + err.stack)
                            callBack(err)
                            return
                        }

                        writeDataRange(contextVariables.firstTradeFile, processDate, PERCENTAGE_BANDWIDTH_FOLDER_NAME, onPercentageBandwidthDataRangeWritten);

                        function onPercentageBandwidthDataRangeWritten(err) {
                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] writeDataRanges -> writeDataRanges -> onBandsBandsDataRangeWritten -> onPercentageBandwidthDataRangeWritten -> err = " + err.stack)
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
                        "[ERROR] start -> writeDataRanges -> err = " + err.stack)
                    callBack(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
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
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                        "/Output/" +
                        pProductFolder + "/" +
                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName;

                    filePath += '/' + fileName

                    fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {
                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> writeDataRange -> onFileCreated -> err = " + err.stack)
                            callBack(err)
                            return
                        }

                        callBack(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
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
                    let reportKey = "Masters" + "-" + "Bollinger-Bands" + "-" + "Multi-Period-Daily"
                    let thisReport = statusDependencies.statusReports.get(reportKey);

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
                "[ERROR] start -> err.message = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
}
