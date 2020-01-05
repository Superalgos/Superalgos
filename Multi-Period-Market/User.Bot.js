exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, fileStorage) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "User Bot";

    const TRADES_FOLDER_NAME = "Trades";

    const CANDLES_FOLDER_NAME = "Candles";
    const BOLLINGER_BANDS_FOLDER_NAME = "Bollinger-Bands";
    const PERCENTAGE_BANDWIDTH_FOLDER_NAME = "Percentage-Bandwidth";

    thisObject = {
        initialize: initialize,
        start: start
    };

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

    Read the candles from Olivia and produce the bollinger bands out of them.

    */

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = bot.market;

            buildBands();

            function buildBands() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> Entering function."); }

                try {

                    let n;

                    periodsLoop();

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> periodsLoop -> Entering function."); }

                            /*

                            We will iterate through all posible periods.

                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            loopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> periodsLoop -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> Entering function."); }

                            const outputPeriod = global.marketFilesPeriods[n][0];
                            const timeFrame = global.marketFilesPeriods[n][1];

                            nextCandleFile();

                            function nextCandleFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> Entering function."); }

                                    let fileName = market.baseAsset + '_' + market.quotedAsset + ".json";

                                    let filePathRoot = bot.dataMine + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + bot.exchange + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timeFrame;
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(bot.dataMine, filePath, onFileReceived);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.stack);
                                                callBackFunction(err);
                                                return;

                                            }

                                            let marketFile = JSON.parse(text);

                                            let candles = [];

                                            buildCandles();

                                            function buildCandles() {

                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> buildCandles -> Entering function."); }

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

                                                    buildBands();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> buildCandles -> err = " + err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function buildBands() {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> buildBands -> Entering function."); }

                                                    let bandsArray = [];
                                                    let pBArray = [];
                                                    let numberOfPeriodsBB = 20;
                                                    let numberOfStandardDeviations = 2;
                                                    let numberOfPeriodsPB = 5;

                                                    /* Building bands */

                                                    let band;

                                                    for (let i = numberOfPeriodsBB - 1; i < candles.length; i++) { // Go through all the candles to generate a band segment for each of them.

                                                        let movingAverage = 0;
                                                        for (let j = i - numberOfPeriodsBB + 1; j < i + 1; j++) { // go through the last numberOfPeriodsBB candles to calculate the moving average.
                                                            movingAverage = movingAverage + candles[j].close;
                                                        }
                                                        movingAverage = movingAverage / numberOfPeriodsBB;

                                                        let standardDeviation = 0;
                                                        for (let j = i - numberOfPeriodsBB + 1; j < i + 1; j++) { // go through the last numberOfPeriodsBB candles to calculate the standard deviation.
                                                            standardDeviation = standardDeviation + Math.pow (candles[j].close - movingAverage, 2);
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

                                                        bandsArray.push(band);

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

                                                        let bandwidth = (upperBB- lowerBB) / band.movingAverage;

                                                        let percentageBandwidth = {
                                                            begin: candles[i].begin,
                                                            end: candles[i].end,
                                                            value: value,
                                                            movingAverage: movingAverage,
                                                            bandwidth: bandwidth
                                                        };

                                                        pBArray.push(percentageBandwidth);
                                                    }

                                                    writeBandsFile(bandsArray, pBArray);
                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> buildBands -> err = " + err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function writeBandsFile(pBands, pPB) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> Entering function."); }

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

                                                    let fileName = '' + market.baseAsset + '_' + market.quotedAsset + '.json';

                                                    let filePathRoot = bot.dataMine + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + bot.exchange + "/" + bot.dataSetVersion;
                                                    let filePath = filePathRoot + "/Output/" + BOLLINGER_BANDS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timeFrame;
                                                    filePath += '/' + fileName

                                                    fileStorage.createTextFile(bot.dataMine, filePath, fileContent + '\n', onFileCreated);

                                                    function onFileCreated(err) {

                                                        try {

                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> Entering function."); }
                                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> fileContent = " + fileContent); }

                                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> err = " + err.stack);
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> filePath = " + filePath);
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> market = " + market.baseAsset + "_" + market.quotedAsset);

                                                                callBackFunction(err);
                                                                return;

                                                            }

                                                            writePBFile(pPB);

                                                        }
                                                        catch (err) {
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> onFileCreated -> err = " + err.stack);
                                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                        }
                                                    }
                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writeBandsFile -> err = " + err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }


                                            function writePBFile(pPercentageBandwidths) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> Entering function."); }

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

                                                    let fileName = '' + market.baseAsset + '_' + market.quotedAsset + '.json';

                                                    let filePathRoot = bot.dataMine + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + bot.exchange + "/" + bot.dataSetVersion;
                                                    let filePath = filePathRoot + "/Output/" + PERCENTAGE_BANDWIDTH_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timeFrame;
                                                    filePath += '/' + fileName

                                                    fileStorage.createTextFile(bot.dataMine, filePath, fileContent + '\n', onFileCreated);

                                                    function onFileCreated(err) {

                                                        try {

                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> Entering function."); }
                                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> fileContent = " + fileContent); }

                                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> err = " + err.stack);
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> filePath = " + filePath);
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> market = " + market.baseAsset + "_" + market.quotedAsset);

                                                                callBackFunction(err);
                                                                return;

                                                            }

                                                            controlLoop();

                                                        }
                                                        catch (err) {
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> onFileCreated -> err = " + err.stack);
                                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                        }
                                                    }
                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> writePBFile -> err = " + err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> nextCandleFile -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> loopBody -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function controlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBands -> controlLoop -> Entering function."); }

                            n++;

                            if (n < global.marketFilesPeriods.length) {

                                loopBody();

                            } else {

                                writeStatusReport(callBackFunction);

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> controlLoop -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildBands -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> Entering function."); }

                try {

                    let reportKey = "AAMasters" + "-" + "AAChris" + "-" + "Multi-Period-Market" + "-" + "dataSet.V1";
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.processDatetime;
                    thisReport.save(callBack);

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
