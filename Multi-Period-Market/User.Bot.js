exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, BLOB_STORAGE, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "User Bot";

    const EXCHANGE_NAME = "Poloniex";

    const PERCENTAGE_BANDWIDTH_FOLDER_NAME = "Percentage-Bandwidth";
    const BOLLINGER_BANDS_FOLDER_NAME = "Bollinger-Bands";
    const CANDLES_FOLDER_NAME = "Candles";
    const SIMULATED_RECORDS_FOLDER_NAME = "Trading-Simulation";

    const commons = COMMONS.newCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let chrisStorage = BLOB_STORAGE.newBlobStorage(bot, logger);
    let oliviaStorage = BLOB_STORAGE.newBlobStorage(bot, logger);
    let jasonStorage = BLOB_STORAGE.newBlobStorage(bot, logger);

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let statusDependencies;

    return thisObject;

    function initialize(pStatusDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;

            commons.initializeStorage(chrisStorage, jasonStorage, oliviaStorage, onInizialized);

            function onInizialized(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> onInizialized -> Initialization Succeed."); }
                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } else {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> err = " + err.message);
                    callBackFunction(err);
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

 

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;

            buildRecords();

            function buildRecords() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> Entering function."); }

                try {

                    let n;

                    periodsLoop();

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> periodsLoop -> Entering function."); }

                            /*
            
                            We will iterate through all posible periods.
            
                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            loopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> periodsLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> Entering function."); }

                            const outputPeriod = global.marketFilesPeriods[n][0];
                            const timePeriod = global.marketFilesPeriods[n][1];

                            let marketFile;

                            let percentgeBandwidthMap = new Map();
                            let bollingerBandsMap = new Map();
                            
                            let candles = [];
                            let recordsArray = [];

                            nextPercentageBandwidth();

                            function nextPercentageBandwidth() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAChris" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + PERCENTAGE_BANDWIDTH_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    chrisStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            marketFile = JSON.parse(text);

                                            buildPercentageBandwidthMap();

                                            
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildPercentageBandwidthMap() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildPercentageBandwidthMap -> Entering function."); }

                                try {

                                    for (let i = 0; i < marketFile.length; i++) {

                                        let percentgeBandwidth = {
                                            begin: marketFile[i][0],
                                            end: marketFile[i][1],
                                            value: marketFile[i][2],
                                            movingAverage: marketFile[i][3]
                                        };

                                        percentgeBandwidthMap.set(percentgeBandwidth.begin, percentgeBandwidth);

                                    }

                                    nextBollingerBands();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildPercentageBandwidthMap -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function nextBollingerBands() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerBands -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAChris" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + BOLLINGER_BANDS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    chrisStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerBands -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerBands -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerBands -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            marketFile = JSON.parse(text);

                                            buildBollingerBandsMap();


                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerBands -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerBands -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildBollingerBandsMap() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildBollingerBandsMap -> Entering function."); }

                                try {

                                    for (let i = 0; i < marketFile.length; i++) {

                                        let bollingerBands = {
                                            begin: marketFile[i][0],
                                            end: marketFile[i][1],
                                            movingAverage: marketFile[i][2],
                                            standardDeviation: marketFile[i][3],
                                            deviation: marketFile[i][4]
                                        };

                                        bollingerBandsMap.set(bollingerBands.begin, bollingerBands);

                                    }

                                    nextCandlesFile();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildBollingerBandsMap -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function nextCandlesFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextCandlesFile -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    oliviaStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextCandlesFile -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextCandlesFile -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextCandlesFile -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            marketFile = JSON.parse(text);

                                            buildCandles();


                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextCandlesFile -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextCandlesFile -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildCandles() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildCandles -> Entering function."); }

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

                                        if (candle.open > candle.close) { candle.direction = 'down'; }
                                        if (candle.open < candle.close) { candle.direction = 'up'; }
                                        if (candle.open === candle.close) { candle.direction = 'side'; }

                                        candles.push(candle);

                                    }

                                    buildRecords();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildCandles -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildRecords() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildRecords -> Entering function."); }

                                    /* Building records */

                                    let stopLossPercentage = 1;
                                    let initialBalanceA = 1;
                                    let record;
                                    let lastOperation = 'Buy';
                                    let initialDate = new Date("2018-08-01");
                                    let balanceAssetA = initialBalanceA;
                                    let balanceAssetB = 0;
                                    let profit = 0;
                                    let lastProfit = 0;
                                    let stopLoss = 0;
                                    let previousBalanceAssetA = 0;
                                    let roundtrips = 0;
                                    let hits = 0;
                                    let fails = 0;
                                    let hitRatio = 0;
                                    let ROI = 0;
                                    let periods = 0;
                                    let days = 0;
                                    let anualizedRateOfReturn = 0;
                                    let type = '';
                                    let rate = 0;
                                    let previousPBMovingAverage = 0;
                                    let trailingStop = false;

                                    for (let i = 0; i < candles.length; i++) {

                                        let candle = candles[i];
                                        let percentgeBandwidth = percentgeBandwidthMap.get(candle.begin);
                                        let band = bollingerBandsMap.get(candle.begin);
                                        

                                        if (percentgeBandwidth === undefined) { continue;}

                                        if (candle.begin < initialDate.valueOf()) { continue; }

                                        periods++;

                                        /* Sell condition */

                                        if (
                                            percentgeBandwidth.value >= 80 &&
                                            lastOperation === 'Buy' &&
                                            (previousPBMovingAverage > percentgeBandwidth.movingAverage)
                                        ) {

                                            previousBalanceAssetA = balanceAssetA;
                                            lastProfit = 0;

                                            balanceAssetB = balanceAssetA * candle.close;
                                            balanceAssetA = 0;
                                            stopLoss = candle.close + candle.close * stopLossPercentage / 100;
                                            rate = candle.close;

                                            type = '"Sell"';
                                            lastOperation = 'Sell';

                                            addRecord();

                                            continue;
                                        };

                                        /* Start Trailing Stop Condition */

                                        if (candle.max < band.movingAverage && lastOperation === 'Sell') {

                                            stopLoss = band.movingAverage;

                                        }

                                        /* Stop Loss condition */

                                        let mustBuy = false;

                                        if (candle.max >= stopLoss && lastOperation === 'Sell') {

                                            balanceAssetA = balanceAssetB / stopLoss;
                                            balanceAssetB = 0;
                                            rate = stopLoss;
                                            mustBuy = true;
                                        }

                                        /* Buy condition */
                                        /*
                                        if (percentgeBandwidth.value <= 50 && lastOperation === 'Sell' && mustBuy === false) {

                                            balanceAssetA = balanceAssetB / candle.close;
                                            balanceAssetB = 0;
                                            rate = candle.close;
                                            mustBuy = true;
                                        };
                                        */

                                        if (mustBuy === true) {

                                            stopLoss = 0;
                                            trailingStop = false;
                                            roundtrips++;
                                            lastProfit = balanceAssetA - previousBalanceAssetA;
                                            profit = profit + lastProfit;
                                            ROI = (initialBalanceA + profit) / initialBalanceA - 1;

                                            if (lastProfit > 0) {
                                                hits++;
                                            } else {
                                                fails++;
                                            }
                                            hitRatio = hits / roundtrips;

                                            let miliSecondsPerDay = 24 * 60 * 60 * 1000;
                                            days = periods * outputPeriod / miliSecondsPerDay;
                                            anualizedRateOfReturn = ROI / days * 365;

                                            type = '"Buy"';
                                            lastOperation = 'Buy';

                                            addRecord();

                                            continue;

                                        }

                                        /* Not a buy or sell condition */

                                        type = '""';
                                        addRecord();
                                        previousPBMovingAverage = percentgeBandwidth.movingAverage;

                                        function addRecord() {

                                            record = {
                                                begin: candle.begin,
                                                end: candle.end,
                                                type: type,
                                                rate: rate,
                                                amount: 1,
                                                balanceA: balanceAssetA,
                                                balanceB: balanceAssetB,
                                                profit: profit,
                                                lastProfit: lastProfit,
                                                stopLoss: stopLoss,
                                                roundtrips: roundtrips,
                                                hits: hits,
                                                fails: fails,
                                                hitRatio: hitRatio,
                                                ROI: ROI,
                                                periods: periods,
                                                days: days,
                                                anualizedRateOfReturn: anualizedRateOfReturn
                                            }

                                            recordsArray.push(record);
                                        }
                                    }

                                    writeRecordsFile();
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildRecords -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function writeRecordsFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> writeRecordsFile -> Entering function."); }

                                    let separator = "";
                                    let fileRecordCounter = 0;

                                    let fileContent = "";

                                    for (i = 0; i < recordsArray.length; i++) {

                                        let record = recordsArray[i];

                                        fileContent = fileContent + separator + '[' +
                                            record.begin + "," +
                                            record.end + "," +
                                            record.type + "," +
                                            record.rate + "," +
                                            record.amount + "," +
                                            record.balanceA + "," +
                                            record.balanceB + "," +
                                            record.profit + "," +
                                            record.lastProfit + "," +
                                            record.stopLoss + "," +
                                            record.roundtrips + "," +
                                            record.hits + "," +
                                            record.fails + "," +
                                            record.hitRatio + "," +
                                            record.ROI + "," +
                                            record.periods + "," +
                                            record.days + "," +
                                            record.anualizedRateOfReturn + "]";

                                        if (separator === "") { separator = ","; }

                                        fileRecordCounter++;

                                    }

                                    fileContent = "[" + fileContent + "]";

                                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + SIMULATED_RECORDS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    jasonStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                                    function onFileCreated(err) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> fileContent = " + fileContent); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> err = " + err.message);
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> filePath = " + filePath);
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                                callBackFunction(err);
                                                return;

                                            }

                                            controlLoop();

                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function controlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> controlLoop -> Entering function."); }

                            n++;

                            if (n < global.marketFilesPeriods.length) {

                                loopBody();

                            } else {

                                writeStatusReport(callBackFunction);

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> controlLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> Entering function."); }

                try {

                    let reportKey = "AAMasters" + "-" + "AAJason" + "-" + "Multi-Period-Market" + "-" + "dataSet.V1";
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.processDatetime;
                    thisReport.save(callBack);

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
