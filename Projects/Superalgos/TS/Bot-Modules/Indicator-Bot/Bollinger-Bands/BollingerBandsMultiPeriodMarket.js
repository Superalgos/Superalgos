exports.newSuperalgosBotModulesBollingerBandsMultiPeriodMarket = function (processIndex) {

    const MODULE_NAME = "Bollinger Bands Multi Period Market"
    const CANDLES_FOLDER_NAME = "Candles"
    const BOLLINGER_BANDS_FOLDER_NAME = "Bollinger-Bands"
    const PERCENTAGE_BANDWIDTH_FOLDER_NAME = "Percentage-Bandwidth"

    thisObject = {
        initialize: initialize,
        start: start
    }

    let statusDependencies
    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex)

    return thisObject

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
    Read the candles from Candles Volumes and produce the bollinger bands out of them.
    */
    function start(callBackFunction) {
        try {
            buildBands();

            function buildBands() {
                try {
                    let n
                    periodsLoop()
                    function periodsLoop() {
                        try {
                            /*
                            We will iterate through all posible periods.
                            */
                            n = 0   // loop Variable representing each possible period as defined at the periods array.
                            loopBody()
                        }
                        catch (err) {
                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> buildBands -> periodsLoop -> err = " + err.stack);
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {
                        try {
                            const outputPeriod = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][0];
                            const timeFrame = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1];

                            nextCandleFile()

                            function nextCandleFile() {
                                try {
                                    let fileName = "Data.json";

                                    let filePathRoot =
                                        'Project/' + TS.projects.superalgos.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-') + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "/" +
                                        "Candles-Volumes" + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" +
                                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timeFrame;
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(filePath, onFileReceived);

                                    function onFileReceived(err, text) {
                                        try {
                                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.stack)
                                                callBackFunction(err)
                                                return
                                            }

                                            let marketFile = JSON.parse(text)
                                            let candles = []
                                            buildCandles()

                                            function buildCandles() {
                                                try {
                                                    for (let i = 0; i < marketFile.length; i++) {

                                                        let candle = {
                                                            open: undefined,
                                                            close: undefined,
                                                            min: 10000000000000,
                                                            max: 0,
                                                            begin: undefined,
                                                            end: undefined,
                                                            direction: undefined
                                                        };

                                                        candle.min = marketFile[i][0];
                                                        candle.max = marketFile[i][1];

                                                        candle.open = marketFile[i][2];
                                                        candle.close = marketFile[i][3];

                                                        candle.begin = marketFile[i][4];
                                                        candle.end = marketFile[i][5];

                                                        candles.push(candle);
                                                    }

                                                    buildBands()
                                                }
                                                catch (err) {
                                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                        "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> buildCandles -> err = " + err.stack);
                                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function buildBands() {
                                                try {
                                                    let bandsArray = [];
                                                    let pBArray = [];
                                                    let numberOfPeriodsBB = 20;
                                                    let numberOfStandardDeviations = 2;
                                                    let numberOfPeriodsPB = 5;

                                                    /* Building bands */

                                                    let band

                                                    for (let i = numberOfPeriodsBB - 1; i < candles.length; i++) { // Go through all the candles to generate a band segment for each of them.
                                                        let movingAverage = 0;
                                                        for (let j = i - numberOfPeriodsBB + 1; j < i + 1; j++) { // go through the last numberOfPeriodsBB candles to calculate the moving average.
                                                            movingAverage = movingAverage + candles[j].close
                                                        }
                                                        movingAverage = movingAverage / numberOfPeriodsBB

                                                        let standardDeviation = 0
                                                        for (let j = i - numberOfPeriodsBB + 1; j < i + 1; j++) { // go through the last numberOfPeriodsBB candles to calculate the standard deviation.
                                                            standardDeviation = standardDeviation + Math.pow(candles[j].close - movingAverage, 2)
                                                        }
                                                        standardDeviation = standardDeviation / numberOfPeriodsBB
                                                        standardDeviation = Math.sqrt(standardDeviation)
                                                        if (standardDeviation === 0) { standardDeviation = 0.000000001; } // This is to prevent a division by zero later.

                                                        band = {
                                                            begin: candles[i].begin,
                                                            end: candles[i].end,
                                                            movingAverage: movingAverage,
                                                            standardDeviation: standardDeviation,
                                                            deviation: standardDeviation * numberOfStandardDeviations
                                                        };

                                                        bandsArray.push(band)

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

                                                        movingAverage = 0;
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
                                                        }

                                                        pBArray.push(percentageBandwidth)
                                                    }

                                                    writeBandsFile(bandsArray, pBArray)
                                                }
                                                catch (err) {
                                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                        "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> buildBands -> err = " + err.stack);
                                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function writeBandsFile(pBands, pPB) {
                                                try {
                                                    let separator = ""
                                                    let fileRecordCounter = 0
                                                    let fileContent = ""

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

                                                    let fileName = 'Data.json';
                                                    let filePath =
                                                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                                                        "/Output/" +
                                                        BOLLINGER_BANDS_FOLDER_NAME + "/" +
                                                        "Multi-Period-Market" + "/" +
                                                        timeFrame
                                                    filePath += '/' + fileName

                                                    fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                                                    function onFileCreated(err) {
                                                        try {
                                                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {

                                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                    "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> err = " + err.stack);
                                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                    "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> filePath = " + filePath);
                                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                    "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> market = " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName)
                                                                callBackFunction(err)
                                                                return
                                                            }
                                                            writePBFile(pPB)
                                                        }
                                                        catch (err) {
                                                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> err = " + err.stack);
                                                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                                        }
                                                    }
                                                }
                                                catch (err) {
                                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                        "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> err = " + err.stack);
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

                                                        fileRecordCounter++;

                                                    }

                                                    fileContent = "[" + fileContent + "]";

                                                    let fileName = 'Data.json';
                                                    let filePath =
                                                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                                                        "/Output/" +
                                                        PERCENTAGE_BANDWIDTH_FOLDER_NAME + "/" +
                                                        "Multi-Period-Market" + "/" +
                                                        timeFrame;
                                                    filePath += '/' + fileName

                                                    fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                                                    function onFileCreated(err) {
                                                        try {
                                                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {

                                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                    "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> err = " + err.stack);
                                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                    "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> filePath = " + filePath);
                                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                    "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> market = " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName);

                                                                callBackFunction(err)
                                                                return
                                                            }
                                                            controlLoop()
                                                        }
                                                        catch (err) {
                                                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> err = " + err.stack);
                                                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                                        }
                                                    }
                                                }
                                                catch (err) {
                                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                        "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> err = " + err.stack);
                                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.stack);
                                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> err = " + err.stack);
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                        catch (err) {
                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> buildBands -> loopBody -> err = " + err.stack);
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                    function controlLoop() {
                        try {
                            n++
                            if (n < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length) {
                                loopBody()
                            } else {
                                writeStatusReport(callBackFunction)
                            }
                        }
                        catch (err) {
                            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> buildBands -> controlLoop -> err = " + err.stack);
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> buildBands -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(callBack) {
                try {
                    let reportKey = "Masters" + "-" + "Bollinger-Bands" + "-" + "Multi-Period-Market"
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME;
                    thisReport.save(callBack);

                    if (TS.projects.superalgos.utilities.dateTimeFunctions.areTheseDatesEqual(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME, new Date()) === false) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME);
                    }

                    /*  Telling the world we are alive and doing well */
                    let currentDateString = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME.getUTCFullYear() + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME.getUTCMonth() + 1, 2) + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME.getUTCDate(), 2);
                    let currentDate = new Date(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME)
                    TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(
                        processIndex,
                        currentDateString,
                        TS.projects.superalgos.utilities.dateTimeFunctions.getPercentage(currentDate, currentDate, currentDate)
                    )
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
                "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
}
