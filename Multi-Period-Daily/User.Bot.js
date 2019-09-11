exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, fileStorage) {

    const FULL_LOG = true;
    const INTENSIVE_LOG = false;
    const LOG_FILE_CONTENT = false;

    const GMT_SECONDS = ':00.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "User Bot";

    const TRADES_FOLDER_NAME = "Trades";

    const CANDLES_FOLDER_NAME = "Candles";
    const BOLLINGER_BANDS_FOLDER_NAME = "Bollinger-Bands";
    const PERCENTAGE_BANDWIDTH_FOLDER_NAME = "Percentage-Bandwidth";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let statusDependencies;

    return thisObject;

    function initialize(pStatusDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*

    This process is going to do the following:

    Read the candles from Olivia and produce daily files with bollinger bands.

    */

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;

            /* Context Variables */

            let contextVariables = {
                lastBandFile: undefined,          // Datetime of the last file files sucessfully produced by this process.
                firstTradeFile: undefined,          // Datetime of the first trade file in the whole market history.
                maxBandFile: undefined            // Datetime of the last file available to be used as an input of this process.
            };

            let previousDay;                        // Holds the date of the previous day relative to the processing date.
            let processDate;                        // Holds the processing date.

            getContextVariables();

            function getContextVariables() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Entering function."); }

                    let thisReport;
                    let reportKey;
                    let statusReport;

                    /* We look first for Charly in order to get when the market starts. */

                    reportKey = "AAMasters" + "-" + "AACharly" + "-" + "Historic-Trades" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    statusReport = statusDependencies.statusReports.get(reportKey);

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

                    thisReport = statusDependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile === undefined) {
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

                    contextVariables.firstTradeFile = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + thisReport.lastFile.hours + ":" + thisReport.lastFile.minutes + GMT_SECONDS);

                    /* Second, we get the report from Olivia, to know when the marted ends. */

                    reportKey = "AAMasters" + "-" + "AAOlivia" + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    statusReport = statusDependencies.statusReports.get(reportKey);

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

                    thisReport = statusDependencies.statusReports.get(reportKey).file;

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

                    contextVariables.maxBandFile = new Date(thisReport.lastFile.valueOf());

                    /* Finally we get our own Status Report. */

                    reportKey = "AAMasters" + "-" + "AAChris" + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    statusReport = statusDependencies.statusReports.get(reportKey);

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

                    thisReport = statusDependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile !== undefined) {

                        contextVariables.lastBandFile = new Date(thisReport.lastFile);

                        /*
                        The bands objects needs to be calculated over more than one day in some situations. In order to simplify the calculations we will
                        always load the last 2 days of candles, and run the calculations on that array.

                        1. So first we will load the candles file of processDay -1.
                        2. Secondly we will load the candles file of processDay.

                        After reading these two files we will add all candles to a unique array.
                        */

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> thisReport.lastFile !== undefined"); }

                        buildBands();
                        return;

                    } else {

                        /*
                        In the case when there is no status report, we take the date of the file with the first trades as the begining of the market. Then we will
                        go one day further in time, so that the previous day does fine a file at the begining of the market.
                        */

                        contextVariables.lastBandFile = new Date(contextVariables.firstTradeFile.getUTCFullYear() + "-" + (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" + contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" + GMT_SECONDS);
                        contextVariables.lastBandFile = new Date(contextVariables.lastBandFile.valueOf() + ONE_DAY_IN_MILISECONDS);

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> thisReport.lastFile === undefined"); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> contextVariables.lastBandFile = " + contextVariables.lastBandFile); }

                        buildBands();
                        return;
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

            function buildBands() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> Entering function."); }

                    let n;
                    processDate = new Date(contextVariables.lastBandFile.valueOf() - ONE_DAY_IN_MILISECONDS); // Go back one day to start well when we advance time at the begining of the loop.
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> processDate = " + processDate); }

                    advanceTime();

                    function advanceTime() {

                        try {

                            logger.newInternalLoop(bot.codeName, bot.process);

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> advanceTime -> Entering function."); }

                            processDate = new Date(processDate.valueOf() + ONE_DAY_IN_MILISECONDS);
                            previousDay = new Date(processDate.valueOf() - ONE_DAY_IN_MILISECONDS);

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> advanceTime -> processDate = " + processDate); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> advanceTime -> previousDay = " + previousDay); }

                            /* Validation that we are not going past the head of the market. */

                            if (processDate.valueOf() > contextVariables.maxBandFile.valueOf()) {

                                const logText = "Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> advanceTime -> " + logText); }

                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;

                            }

                            periodsLoop();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> advanceTime -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> periodsLoop -> Entering function."); }

                            /*

                            We will iterate through all posible timePeriods.

                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            loopBody();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> Entering function."); }

                            const timePeriod = global.dailyFilePeriods[n][1];

                            let candles = [];                   // Here we will put all the candles of the 2 files read.

                            let previousDayFile;
                            let processDayFile;

                            getPreviousDayFile();

                            function getPreviousDayFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> getPreviousDayFile -> Entering function."); }

                                    let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2);
                                    let fileName = market.assetA + '_' + market.assetB + ".json"

                                    let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(bot.devTeam, filePath, onCurrentDayFileReceived, true);

                                    function onCurrentDayFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> getPreviousDayFile -> onCurrentDayFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> getPreviousDayFile -> onCurrentDayFileReceived -> text = " + text); }

                                            previousDayFile = JSON.parse(text);
                                            getProcessDayFile()

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getPreviousDayFile -> onCurrentDayFileReceived -> err = " + err.stack);
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getPreviousDayFile -> onCurrentDayFileReceived -> filePath = " + filePath);
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getPreviousDayFile -> onCurrentDayFileReceived -> market = " + market.assetA + '_' + market.assetB);

                                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getPreviousDayFile -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function getProcessDayFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> getProcessDayFile -> Entering function."); }

                                    let dateForPath = processDate.getUTCFullYear() + '/' + utilities.pad(processDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDate.getUTCDate(), 2);
                                    let fileName = market.assetA + '_' + market.assetB + ".json"

                                    let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(bot.devTeam, filePath, onCurrentDayFileReceived, true);

                                    function onCurrentDayFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> getProcessDayFile -> onCurrentDayFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> getProcessDayFile -> onCurrentDayFileReceived -> text = " + text); }

                                            processDayFile = JSON.parse(text);
                                            buildBands();

                                        } catch (err) {

                                            if (processDate.valueOf() > contextVariables.maxBandFile.valueOf()) {

                                                processDayFile = [];  // we are past the head of the market, then no worries if this file is non existent.
                                                buildBands();

                                            } else {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getProcessDayFile -> onCurrentDayFileReceived -> err = " + err.stack);
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getProcessDayFile -> onCurrentDayFileReceived -> filePath = " + filePath);
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getProcessDayFile -> onCurrentDayFileReceived -> market = " + market.assetA + '_' + market.assetB);

                                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                return;
                                            }
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> getProcessDayFile -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildBands() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> buildBands -> Entering function."); }

                                    addCandlesToSingleArray(previousDayFile);
                                    addCandlesToSingleArray(processDayFile);
                                    calculateBands();

                                    function addCandlesToSingleArray(candlesFile) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> buildBands -> addCandlesToSingleArray -> Entering function."); }

                                            for (let i = 0; i < candlesFile.length; i++) {

                                                let candle = {
                                                    open: undefined,
                                                    close: undefined,
                                                    min: 10000000000000,
                                                    max: 0,
                                                    begin: undefined,
                                                    end: undefined,
                                                    direction: undefined
                                                };

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
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> buildBands -> addCandlesToSingleArray -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> buildBands -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }

                            function calculateBands() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> calculateBands -> Entering function."); }

                                    let bandsArray = [];
                                    let pBArray = [];
                                    let numberOfPeriodsBB = 20;
                                    let numberOfStandardDeviations = 2;
                                    let numberOfPeriodsPB = 10;

                                    /* Building bands */

                                    let band;

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
                                        };

                                        /* Will only add to the array the bands of the current day */

                                        if (band.begin >= processDate.valueOf()) { bandsArray.push(band); }

                                        /* Calculating %B */

                                        let lowerBB;
                                        let upperBB;

                                        lowerBB = band.movingAverage - band.deviation;
                                        upperBB = band.movingAverage + band.deviation;

                                        let value = (candles[i].close - lowerBB) / (upperBB - lowerBB) * 100;

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
                                        };

                                        /* Will only add to the array the pBs of the current day */

                                        if (percentageBandwidth.begin >= processDate.valueOf()) { pBArray.push(percentageBandwidth); }
                                    }

                                    writeBandsFile(bandsArray, pBArray);

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> calculateBands -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }

                            function writeBandsFile(pBands, pPB) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writeBandsFile -> Entering function."); }

                                    let separator = "";
                                    let fileRecordCounter = 0;

                                    let fileContent = "";

                                    for (i = 0; i < pBands.length; i++) {

                                        let band = pBands[i];

                                        fileContent = fileContent + separator + '[' +
                                            band.begin + "," +
                                            band.end + "," +
                                            band.movingAverage + "," +
                                            band.standardDeviation + "," +
                                            band.deviation + "]";

                                        if (separator === "") { separator = ","; }

                                        fileRecordCounter++;

                                    }

                                    fileContent = "[" + fileContent + "]";

                                    let dateForPath = processDate.getUTCFullYear() + '/' + utilities.pad(processDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDate.getUTCDate(), 2);
                                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + BOLLINGER_BANDS_FOLDER_NAME + "/" + bot.process + "/" + timePeriod + "/" + dateForPath;
                                    filePath += '/' + fileName

                                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                                    function onFileCreated(err) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writeBandsFile -> onFileCreated -> Entering function."); }

                                            if (LOG_FILE_CONTENT === true) {
                                                logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writeBandsFile -> onFileCreated ->  Content written = " + fileContent);
                                            }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> writeBandBandsFile -> writeBandsFile -> onFileCreated -> err = " + err.stack);
                                                callBackFunction(err);
                                                return;
                                            }

                                            const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writeBandsFile -> onFileCreated -> " + logText); }

                                            writePBFile(pPB);

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> writeBandBandsFile -> writeBandsFile -> onFileCreated -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> writeBandBandsFile -> writeBandsFile -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function writePBFile(pPercentageBandwidths) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writePBFile -> Entering function."); }

                                    let separator = "";
                                    let fileRecordCounter = 0;

                                    let fileContent = "";

                                    for (i = 0; i < pPercentageBandwidths.length; i++) {

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

                                    let dateForPath = processDate.getUTCFullYear() + '/' + utilities.pad(processDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDate.getUTCDate(), 2);
                                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + PERCENTAGE_BANDWIDTH_FOLDER_NAME + "/" + bot.process + "/" + timePeriod + "/" + dateForPath;
                                    filePath += '/' + fileName

                                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                                    function onFileCreated(err) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writePBFile -> onFileCreated -> Entering function."); }

                                            if (LOG_FILE_CONTENT === true) {
                                                logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writePBFile -> onFileCreated ->  Content written = " + fileContent);
                                            }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> writeBandBandsFile -> writePBFile -> onFileCreated -> err = " + err.stack);
                                                callBackFunction(err);
                                                return;
                                            }

                                            const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> writeBandBandsFile -> writePBFile -> onFileCreated -> " + logText); }

                                            controlLoop();

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> writeBandBandsFile -> writePBFile -> onFileCreated -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> writeBandBandsFile -> writePBFile -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }


                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> loopBody -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function controlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> controlLoop -> Entering function."); }

                            n++;

                            if (n < global.dailyFilePeriods.length) {

                                loopBody();

                            } else {

                                n = 0;

                                writeDataRanges(onWritten);

                                function onWritten(err) {

                                    try {

                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> controlLoop -> onWritten -> Entering function."); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> controlLoop -> onWritten -> err = " + err.stack);
                                            callBackFunction(err);
                                            return;
                                        }

                                        writeStatusReport(processDate, advanceTime);

                                    } catch (err) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> controlLoop -> onWritten -> err = " + err.stack);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> controlLoop -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }

                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> err.message = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeDataRanges(callBack) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRanges -> Entering function."); }

                    writeDataRange(contextVariables.firstTradeFile, processDate, BOLLINGER_BANDS_FOLDER_NAME, onBandsBandsDataRangeWritten);

                    function onBandsBandsDataRangeWritten(err) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRanges -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] writeDataRanges -> writeDataRanges -> onBandsBandsDataRangeWritten -> err = " + err.stack);
                            callBack(err);
                            return;
                        }

                        writeDataRange(contextVariables.firstTradeFile, processDate, PERCENTAGE_BANDWIDTH_FOLDER_NAME, onPercentageBandwidthDataRangeWritten);

                        function onPercentageBandwidthDataRangeWritten(err) {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRanges -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] writeDataRanges -> writeDataRanges -> onBandsBandsDataRangeWritten -> onPercentageBandwidthDataRangeWritten -> err = " + err.stack);
                                callBack(err);
                                return;
                            }

                            callBack(global.DEFAULT_OK_RESPONSE);

                        }

                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeDataRanges -> err = " + err.stack);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }

            }

            function writeDataRange(pBegin, pEnd, pProductFolder, callBack) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> Entering function."); }

                    let dataRange = {
                        begin: pBegin.valueOf(),
                        end: pEnd.valueOf()
                    };

                    let fileContent = JSON.stringify(dataRange);

                    let fileName = 'Data.Range.' + market.assetA + '_' + market.assetB + '.json';
                    let filePath = bot.filePathRoot + "/Output/" + pProductFolder + "/" + bot.process;

                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> onFileCreated -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> onFileCreated -> err = " + err.stack);
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
                    logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> err = " + err.stack);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(lastFileDate, callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> Entering function."); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> lastFileDate = " + lastFileDate); }

                try {

                    let reportKey = "AAMasters" + "-" + "AAChris" + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.processDatetime;
                    thisReport.file.lastFile = lastFileDate;
                    thisReport.save(callBack);

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err.message = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
