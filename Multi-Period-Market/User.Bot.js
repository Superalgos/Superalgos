exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, BLOB_STORAGE, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "User Bot";

    const EXCHANGE_NAME = "Poloniex";

    const TRADES_FOLDER_NAME = "Trades";

    const CANDLES_FOLDER_NAME = "Candles";
    const BOLINGER_BANDS_FOLDER_NAME = "Boliniger-Bands";

    const commons = COMMONS.newCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let oliviaStorage = BLOB_STORAGE.newBlobStorage(bot, logger);
    let chrisStorage = BLOB_STORAGE.newBlobStorage(bot, logger);

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let statusDependencies;

    return thisObject;

    function initialize(pStatusDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;

            commons.initializeStorage(oliviaStorage, chrisStorage, onInizialized);

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

    /*
    
    This process is going to do the following:
    
    Read the candles and volumes from Olivia and produce the bollinger bands out of them.
    
    */

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;

            buildStairs();

            function buildStairs() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> Entering function."); }

                try {

                    let n;

                    periodsLoop();

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> periodsLoop -> Entering function."); }

                            /*
            
                            We will iterate through all posible periods.
            
                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            loopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> Entering function."); }

                            const outputPeriod = global.marketFilesPeriods[n][0];
                            const timePeriod = global.marketFilesPeriods[n][1];

                            nextCandleFile();

                            function nextCandleFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    oliviaStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            let marketFile = JSON.parse(text);

                                            let candles = [];
                                            let stairsArray = [];

                                            buildCandles();

                                            function buildCandles() {

                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> buildCandles -> Entering function."); }

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

                                                    findCandleStairs();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> buildCandles -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function findCandleStairs() {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> findCandleStairs -> Entering function."); }

                                                    /* Finding stairs */

                                                    let stairs;

                                                    for (let i = 0; i < candles.length - 1; i++) {

                                                        let currentCandle = candles[i];
                                                        let nextCandle = candles[i + 1];

                                                        if (currentCandle.direction === nextCandle.direction && currentCandle.direction !== 'side') {

                                                            if (stairs === undefined) {

                                                                stairs = {
                                                                    open: undefined,
                                                                    close: undefined,
                                                                    min: 10000000000000,
                                                                    max: 0,
                                                                    begin: undefined,
                                                                    end: undefined,
                                                                    direction: undefined,
                                                                    candleCount: 0,
                                                                    firstMin: 0,
                                                                    firstMax: 0,
                                                                    lastMin: 0,
                                                                    lastMax: 0
                                                                };

                                                                stairs.direction = currentCandle.direction;
                                                                stairs.candleCount = 2;

                                                                stairs.begin = currentCandle.begin;
                                                                stairs.end = nextCandle.end;

                                                                stairs.open = currentCandle.open;
                                                                stairs.close = nextCandle.close;

                                                                if (currentCandle.min < nextCandle.min) { stairs.min = currentCandle.min; } else { stairs.min = nextCandle.min; }
                                                                if (currentCandle.max > nextCandle.max) { stairs.max = currentCandle.max; } else { stairs.max = nextCandle.max; }

                                                                if (stairs.direction === 'up') {

                                                                    stairs.firstMin = currentCandle.open;
                                                                    stairs.firstMax = currentCandle.close;

                                                                    stairs.lastMin = nextCandle.open;
                                                                    stairs.lastMax = nextCandle.close;

                                                                } else {

                                                                    stairs.firstMin = currentCandle.close;
                                                                    stairs.firstMax = currentCandle.open;

                                                                    stairs.lastMin = nextCandle.close;
                                                                    stairs.lastMax = nextCandle.open;

                                                                }


                                                            } else {

                                                                stairs.candleCount++;
                                                                stairs.end = nextCandle.end;
                                                                stairs.close = nextCandle.close;

                                                                if (stairs.min < nextCandle.min) { stairs.min = currentCandle.min; }
                                                                if (stairs.max > nextCandle.max) { stairs.max = currentCandle.max; }

                                                                if (stairs.direction === 'up') {

                                                                    stairs.lastMin = nextCandle.open;
                                                                    stairs.lastMax = nextCandle.close;

                                                                } else {

                                                                    stairs.lastMin = nextCandle.close;
                                                                    stairs.lastMax = nextCandle.open;

                                                                }

                                                            }

                                                        } else {

                                                            if (stairs !== undefined) {
                                                                stairsArray.push(stairs);
                                                                stairs = undefined;
                                                            }
                                                        }
                                                    }

                                                    writeCandleStairsFile();
                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> findCandleStairs -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function writeCandleStairsFile() {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> Entering function."); }

                                                    let separator = "";
                                                    let fileRecordCounter = 0;

                                                    let fileContent = "";

                                                    for (i = 0; i < stairsArray.length; i++) {

                                                        let stairs = stairsArray[i];

                                                        fileContent = fileContent + separator + '[' +
                                                            stairs.open + "," +
                                                            stairs.close + "," +
                                                            stairs.min + "," +
                                                            stairs.max + "," +
                                                            stairs.begin + "," +
                                                            stairs.end + "," +
                                                            '"' + stairs.direction + '"' + "," +
                                                            stairs.candleCount + "," +
                                                            stairs.firstMin + "," +
                                                            stairs.firstMax + "," +
                                                            stairs.lastMin + "," +
                                                            stairs.lastMax + "]";

                                                        if (separator === "") { separator = ","; }

                                                        fileRecordCounter++;

                                                    }

                                                    fileContent = "[" + fileContent + "]";

                                                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                                    let filePath = filePathRoot + "/Output/" + BOLINGER_BANDS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                                    chrisStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                                                    function onFileCreated(err) {

                                                        try {

                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> Entering function."); }
                                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> fileContent = " + fileContent); }

                                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> err = " + err.message);
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> filePath = " + filePath);
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                                                callBackFunction(err);
                                                                return;

                                                            }

                                                            controlLoop();

                                                        }
                                                        catch (err) {
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> err = " + err.message);
                                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                        }
                                                    }
                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function controlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> controlLoop -> Entering function."); }

                            n++;

                            if (n < global.marketFilesPeriods.length) {

                                loopBody();

                            } else {

                                writeStatusReport(callBackFunction);

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> controlLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> err = " + err.message);
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
