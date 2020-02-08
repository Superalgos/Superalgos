exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, fileStorage) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "User Bot";

    const TRADES_FOLDER_NAME = "Trades";

    const CANDLES_FOLDER_NAME = "Candles";
    const CANDLES_ONE_MIN = "One-Min";

    const VOLUMES_FOLDER_NAME = "Volumes";
    const VOLUMES_ONE_MIN = "One-Min";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let statusDependencies;

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {

        statusDependencies = pStatusDependencies;

        logger.fileName = MODULE_NAME  
        logger.initialize();

        callBackFunction(global.DEFAULT_OK_RESPONSE);

    }

    /*
    This process is going to do the following:
    Read the trades from Charly's Output and pack them into daily files with candles of one minute.
    */

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let processDate = new Date((new Date()).getUTCFullYear() + "-" + ((new Date()).getUTCMonth() + 1) + "-1 00:00:00.000 GMT+0000");

            let thisDatetime = new Date();

            let market = bot.market;

            let lastTradeFileProcessed;         // Datetime of the last file certified by the Hole Fixing process as without permanent holes.
            let firstTradeFile;         // Datetime of the first trade file in the whole market history.
            let lastTradeFileSaved;   // Datetime of the last verified file without holes.
            let lastCandleClose;        // Value of the last candle close.
            let lastTradeFile;          // Datetime pointing to the last Trade File sucessfuly processed and included in the last file.
            let beginingOfMarket

            getContextVariables();

            function getContextVariables() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Entering function."); }

                    let thisReport;
                    let reportKey;

                    /* First Status Report */
                    reportKey = "AAMasters" + "-" + "AACharly" + "-" + "Historic-Trades" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey).file;

                    if (thisReport.beginingOfMarket === undefined) {
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

                    firstTradeFile = new Date(thisReport.beginingOfMarket.year + "-" + thisReport.beginingOfMarket.month + "-" + thisReport.beginingOfMarket.days + " " + thisReport.beginingOfMarket.hours + ":" + thisReport.beginingOfMarket.minutes + GMT_SECONDS);
                    lastTradeFileSaved = new Date(thisReport.lastFileSaved.year + "-" + thisReport.lastFileSaved.month + "-" + thisReport.lastFileSaved.days + " " + thisReport.lastFileSaved.hours + ":" + thisReport.lastFileSaved.minutes + GMT_SECONDS);

                    /* Final Status Report */

                    reportKey = "AAMasters" + "-" + "AABruce" + "-" + "Single-Period-Daily" + "-" + "dataSet.V1" 
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.");
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile === undefined) { // Means this is the first time ever this process runs.
                        logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Process Running for the very first time. -> reportKey = " + reportKey);

                        lastCandleClose = 0;
                        lastTradeFileProcessed = new Date(firstTradeFile.valueOf() - ONE_DAY_IN_MILISECONDS)
                        beginingOfMarket = new Date(firstTradeFile.valueOf())

                        buildCandlesAndVolumes();

                    } else {
                        logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Process Running not for the very first time. -> reportKey = " + reportKey);

                        lastTradeFileProcessed = new Date(thisReport.lastTradeFile.year + "-" + thisReport.lastTradeFile.month + "-" + thisReport.lastTradeFile.days + " " + "00:00" + GMT_SECONDS);
                        lastCandleClose = thisReport.candleClose;
                        beginingOfMarket = new Date(thisReport.beginingOfMarket.year + "-" + thisReport.beginingOfMarket.month + "-" + thisReport.beginingOfMarket.days + " " + thisReport.beginingOfMarket.hours + ":" + thisReport.beginingOfMarket.minutes + GMT_SECONDS);

                        if (beginingOfMarket.valueOf() !== firstTradeFile.valueOf()) { // Reset Mechanism for Begining of the Market
                            logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Reset Mechanism for Begining of the Market Activated. -> reportKey = " + reportKey);

                            beginingOfMarket = new Date(firstTradeFile.valueOf())
                            lastTradeFileProcessed = new Date(firstTradeFile.valueOf() - ONE_DAY_IN_MILISECONDS)
                            lastCandleClose = 0
                            buildCandlesAndVolumes()
                            return
                        }

                        if (thisReport.fileComplete === true) {
                            buildCandlesAndVolumes();
                        } else {
                            lastTradeFile = new Date(thisReport.lastTradeFile.year + "-" + thisReport.lastTradeFile.month + "-" + thisReport.lastTradeFile.days + " " + thisReport.lastTradeFile.hours + ":" + thisReport.lastTradeFile.minutes + GMT_SECONDS);
                            findPreviousContent();
                        }
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

            function findPreviousContent() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findPreviousContent -> Entering function."); }

                    let previousCandles;
                    let previousVolumes;

                    getCandles();

                    function getCandles() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findPreviousContent -> getCandles -> Entering function."); }

                            let fileName = '' + market.baseAsset + '_' + market.quotedAsset + '.json';
                            let dateForPath = lastTradeFileProcessed.getUTCFullYear() + '/' + utilities.pad(lastTradeFileProcessed.getUTCMonth() + 1, 2) + '/' + utilities.pad(lastTradeFileProcessed.getUTCDate(), 2);
                            let filePath = bot.filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + CANDLES_ONE_MIN + '/' + dateForPath;
                            filePath += '/' + fileName

                            fileStorage.getTextFile(filePath, onFileReceived);

                            logger.write(MODULE_NAME, "[INFO] start -> findPreviousContent -> getCandles -> reading file at dateForPath = " + dateForPath);

                            function onFileReceived(err, text) {

                                let candlesFile;

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findPreviousContent -> getCandles -> onFileReceived -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getCandles -> onFileReceived -> err = " + err.stack);
                                        callBackFunction(err);
                                        return;
                                    }

                                    if (LOG_FILE_CONTENT === true) {
                                        logger.write(MODULE_NAME, "[INFO] start -> findPreviousContent -> getCandles -> onFileReceived ->  text = " + text);
                                    }

                                    candlesFile = JSON.parse(text);
                                    previousCandles = candlesFile;
                                    getVolumes();

                                } catch (err) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getCandles -> onFileReceived -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getCandles -> onFileReceived -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[HINT] start -> findPreviousContent -> getCandles -> onFileReceived -> Empty or corrupt volume file found.");
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getCandles -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function getVolumes() {

                        try {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findPreviousContent -> getVolumes -> Entering function."); }

                            let fileName = '' + market.baseAsset + '_' + market.quotedAsset + '.json';
                            let dateForPath = lastTradeFileProcessed.getUTCFullYear() + '/' + utilities.pad(lastTradeFileProcessed.getUTCMonth() + 1, 2) + '/' + utilities.pad(lastTradeFileProcessed.getUTCDate(), 2);
                            let filePath = bot.filePathRoot + "/Output/" + VOLUMES_FOLDER_NAME + '/' + VOLUMES_ONE_MIN + '/' + dateForPath;
                            filePath += '/' + fileName

                            fileStorage.getTextFile(filePath, onFileReceived);

                            logger.write(MODULE_NAME, "[INFO] start -> findPreviousContent -> getVolumes -> reading file at dateForPath = " + dateForPath);

                            function onFileReceived(err, text) {

                                let volumesFile;

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> findPreviousContent -> getVolumes -> onFileReceived -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived -> err = " + err.stack);
                                        logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived ->  text = " + text);
                                        callBackFunction(err);
                                        return;
                                    }

                                    if (LOG_FILE_CONTENT === true) {
                                        logger.write(MODULE_NAME, "[INFO] start -> findPreviousContent -> getVolumes -> onFileReceived ->  text = " + text);
                                    }

                                    volumesFile = JSON.parse(text);
                                    previousVolumes = volumesFile;
                                    lastTradeFileProcessed = new Date(lastTradeFileProcessed.valueOf() - ONE_DAY_IN_MILISECONDS);  // We know that after the next call a new day will be added.
                                    buildCandlesAndVolumes(previousCandles, previousVolumes);

                                } catch (err) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived ->  text = " + text);
                                    logger.write(MODULE_NAME, "[HINT] start -> findPreviousContent -> getVolumes -> onFileReceived -> Empty or corrupt volume file found.");
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> getVolumes -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> findPreviousContent -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildCandlesAndVolumes(previousCandles, previousVolumes) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> Entering function."); }

                /*
                Here we are going to scan the trades files packing them in candles files every one day.
                We need for this the last close value, bacause all candles that are empty of trades at the begining, they need to
                have a valid open and close value. This was previously calculated before arriving to this function.
                */

                let canAddPrevious = true;

                try {
                    nextFile();

                    function nextFile() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> Entering function."); }

                            lastTradeFileProcessed = new Date(lastTradeFileProcessed.valueOf() + ONE_DAY_IN_MILISECONDS);

                            let date = new Date(lastTradeFileProcessed.valueOf() - 60 * 1000);

                            if (date.valueOf() < firstTradeFile.valueOf()) {  // At the special case where we are at the begining of the market, this might be true.
                                date = new Date(firstTradeFile.valueOf() - 60 * 1000);
                            }

                            if (lastTradeFile !== undefined) {
                                date = new Date(lastTradeFile.valueOf());
                            }

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> date = " + date); }

                            let candles = [];
                            let volumes = [];

                            if (previousCandles !== undefined && canAddPrevious === true) {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> Adding Previous Candles. "); }

                                for (let i = 0; i < previousCandles.length; i++) {

                                    let candle = {
                                        open: previousCandles[i][2],
                                        close: previousCandles[i][3],
                                        min: previousCandles[i][0],
                                        max: previousCandles[i][1],
                                        begin: previousCandles[i][4],
                                        end: previousCandles[i][5]
                                    };

                                    candles.push(candle);
                                }
                            }

                            if (previousVolumes !== undefined && canAddPrevious === true) {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> Adding Previous Volumes. "); }

                                for (let i = 0; i < previousVolumes.length; i++) {

                                    let volume = {
                                        begin: previousVolumes[i][2],
                                        end: previousVolumes[i][3],
                                        buy: previousVolumes[i][0],
                                        sell: previousVolumes[i][1]
                                    };

                                    volumes.push(volume);
                                }
                            }

                            canAddPrevious = false; // We add them only onece.

                            nextDate();

                            function nextDate() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> nextDate -> Entering function."); }

                                    date = new Date(date.valueOf() + 60 * 1000);

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> nextDate -> date = " + date); }

                                    /* Check if we are outside the current Day / File */

                                    if (date.getUTCDate() !== lastTradeFileProcessed.getUTCDate()) {

                                        writeFiles(lastTradeFileProcessed, candles, volumes, true, onFilesWritten);

                                        return;

                                        function onFilesWritten() {

                                            nextFile();
                                        }
                                    }

                                    /* Check if we have past the most recent hole fixed file */

                                    if (date.valueOf() > lastTradeFileSaved.valueOf()) {

                                        writeFiles(lastTradeFileProcessed, candles, volumes, false, onFilesWritten);
                                        return;

                                        function onFilesWritten() {

                                            if (FULL_LOG === true) {
                                                logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> nextDate -> Head of the market reached for market " + market.baseAsset + '_' + market.quotedAsset + ".");
                                            }

                                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                                            return;
                                        }
                                    }

                                    readTrades();

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildCandlesAndVolumes -> nextFile -> nextDate -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function readTrades() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> nextDate -> readTrades -> Entering function."); }

                                    lastTradeFile = new Date(date.valueOf());

                                    let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);
                                    let fileName = market.baseAsset + '_' + market.quotedAsset + ".json"
                                    let filePathRoot = bot.dataMine + "/" + "AACharly" + "/" + bot.exchange;
                                    let filePath = filePathRoot + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPath;
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(filePath, onFileReceived);

                                    logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> nextDate -> readTrades -> reading file at dateForPath = " + dateForPath);

                                    function onFileReceived(err, text) {

                                        let tradesFile;

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> onFileReceived -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> onFileReceived -> err = " + err.stack);
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> onFileReceived ->  text = " + text);
                                                callBackFunction(err);
                                                return;
                                            }

                                            if (LOG_FILE_CONTENT === true) {
                                                logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> onFileReceived ->  text = " + text);
                                            }

                                            let candle = {
                                                open: lastCandleClose,
                                                close: lastCandleClose,
                                                min: lastCandleClose,
                                                max: lastCandleClose,
                                                begin: date.valueOf(),
                                                end: date.valueOf() + 60 * 1000 - 1
                                            };

                                            let volume = {
                                                begin: date.valueOf(),
                                                end: date.valueOf() + 60 * 1000 - 1,
                                                buy: 0,
                                                sell: 0
                                            };

                                            tradesFile = JSON.parse(text);

                                            let tradesCount = utilities.pad(tradesFile.length, 5);

                                            logger.write(MODULE_NAME, "[INFO] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> onFileReceived -> " + tradesCount + " trades found at " + filePath + " for market " + market.baseAsset + '_' + market.quotedAsset + ". ");

                                            if (tradesFile.length > 0) {

                                                /* Candle open and close Calculations */

                                                candle.open = tradesFile[0][2];
                                                candle.close = tradesFile[tradesFile.length - 1][2];
                                                lastCandleClose = candle.close;
                                            }

                                            for (let i = 0; i < tradesFile.length; i++) {

                                                let record = {
                                                    side: tradesFile[i][1],
                                                    price: tradesFile[i][2],
                                                    amount: tradesFile[i][3]
                                                };

                                                let trade = {
                                                    type: record.side,
                                                    rate: record.price,
                                                    amountA: record.amount,
                                                    amountB: record.amount * record.price
                                                };

                                                /* Candle min and max Calculations */

                                                if (trade.rate < candle.min) {
                                                    candle.min = trade.rate;
                                                }

                                                if (trade.rate > candle.max) {
                                                    candle.max = trade.rate;
                                                }

                                                /* Volume Calculations */

                                                if (trade.type === "sell") {
                                                    volume.sell = volume.sell + trade.amountA;
                                                } else {
                                                    volume.buy = volume.buy + trade.amountA;
                                                }
                                            }

                                            candles.push(candle);
                                            volumes.push(volume);
                                            nextDate();

                                        } catch (err) {

                                            logger.write(MODULE_NAME, "[ERROR] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> onFileReceived -> err = " + err.stack);
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> onFileReceived -> filePath = " + filePath);
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> onFileReceived ->  text = " + text);
                                            logger.write(MODULE_NAME, "[HINT] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> onFileReceived -> Empty or corrupt volume file found.");

                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }
                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildCandlesAndVolumes -> nextFile -> readTrades -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildCandlesAndVolumes -> nextFile -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildCandlesAndVolumes -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeFiles(date, candles, volumes, isFileComplete, callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> Entering function."); }

                /*
                Here we will write the contents of the Candles and Volumens files. If the File is declared as complete, we will also write the status report.
                */

                try {

                    writeCandles();

                    function writeCandles() {

                        try {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeCandles -> Entering function."); }

                            let separator = "";
                            let fileRecordCounter = 0;

                            let fileContent = "";

                            for (i = 0; i < candles.length; i++) {

                                fileContent = fileContent + separator + '[' + candles[i].min + "," + candles[i].max + "," + candles[i].open + "," + candles[i].close + "," + candles[i].begin + "," + candles[i].end + "]";
                                if (separator === "") { separator = ","; }
                                fileRecordCounter++;
                            }

                            fileContent = "[" + fileContent + "]";

                            let fileName = '' + market.baseAsset + '_' + market.quotedAsset + '.json';
                            let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2);
                            let filePath = bot.filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + CANDLES_ONE_MIN + '/' + dateForPath;
                            filePath += '/' + fileName

                            fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                            logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeCandles -> writing file at dateForPath = " + dateForPath);

                            function onFileCreated(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeCandles -> onFileCreated -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeCandles -> onFileCreated -> err = " + err.stack);
                                        callBackFunction(err);
                                        return;
                                    }

                                    if (LOG_FILE_CONTENT === true) {
                                        logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeCandles -> onFileCreated -> fileContent = " + fileContent);
                                    }

                                    logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeCandles -> onFileCreated -> Finished with File @ " + market.baseAsset + "_" + market.quotedAsset + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "");

                                    writeVolumes();

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeCandles -> onFileCreated -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeCandles -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function writeVolumes() {

                        try {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeVolumes -> Entering function."); }

                            let separator = "";
                            let fileRecordCounter = 0;

                            let fileContent = "";

                            for (i = 0; i < volumes.length; i++) {

                                /* Validation trying to find a BUG that changes the dates of rubish data. */

                                if (volumes[i].begin < 1262304000000 | volumes[i].end < 1262304000000) { // If it is storing a number that represents a date before the year 2010...

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeVolumes -> Invalid Date trying to be recorded on output file. ");
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeVolumes -> volumes[i].begin = " + volumes[i].begin);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeVolumes -> volumes[i].end = " + volumes[i].end);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeVolumes -> i = " + i);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeVolumes -> volumes = " + JSON.stringify(volumes));

                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }

                                fileContent = fileContent + separator + '[' + volumes[i].buy + "," + volumes[i].sell + "," + volumes[i].begin + "," + volumes[i].end + "]";
                                if (separator === "") { separator = ","; }
                                fileRecordCounter++;
                            }

                            fileContent = "[" + fileContent + "]";

                            let fileName = '' + market.baseAsset + '_' + market.quotedAsset + '.json';
                            let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2);
                            let filePath = bot.filePathRoot + "/Output/" + VOLUMES_FOLDER_NAME + '/' + VOLUMES_ONE_MIN + '/' + dateForPath;
                            filePath += '/' + fileName

                            fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                            logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeVolumes -> writing file at dateForPath = " + dateForPath);

                            function onFileCreated(err) {

                                try {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeVolumes -> onFileCreated -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeVolumes -> onFileCreated -> err = " + err.stack);
                                        callBackFunction(err);
                                        return;
                                    }

                                    if (LOG_FILE_CONTENT === true) {
                                        logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeVolumes -> onFileCreated -> fileContent = " + fileContent);
                                    }

                                    logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeVolumes -> onFileCreated -> Finished with File @ " + market.baseAsset + "_" + market.quotedAsset + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "");

                                    writeReport();

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeVolumes -> onFileCreated -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeVolumes -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function writeReport() {

                        try {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeReport -> Entering function."); }

                            writeStatusReport(date, lastTradeFile, lastCandleClose, isFileComplete, false, onStatusReportWritten);

                            function onStatusReportWritten(err) {

                                try {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFiles -> writeReport -> onStatusReportWritten -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> onStatusReportWritten -> err = " + err.stack);
                                        callBackFunction(err);
                                        return;
                                    }

                                    callBack();
                                    return;
                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeReport -> onStatusReportWritten -> err = " + err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> writeReport -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeFiles -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(lastFileDate, lastTradeFile, candleClose, isFileComplete, isMonthComplete, callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> Entering function."); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> lastFileDate = " + lastFileDate); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> lastTradeFile = " + lastTradeFile); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> candleClose = " + candleClose); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> isFileComplete = " + isFileComplete); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> isMonthComplete = " + isMonthComplete); }

                try {

                    if (lastTradeFile === undefined) {

                        /* At the begining of a new month, it can happen for reasons not 100% clear that this variable gets undifined.
                        Probably it is because the instance that was waiting to execute in coma state, wakes up before than Charly
                        writting the trades of this new month. Anyway, when this happens, a different path in code is taken and this
                        variable gets undefined. A workaround for that without further investigation of the real cause of the problem
                        is to RETRY the execution until the normal conditions arise and everything continues working well. That is what
                        we are going to do for now. */

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] start -> writeStatusReport -> Cannot write the status report."); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] start -> writeStatusReport -> lastTradeFile = undefined."); }

                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);

                        return;
                    }

                    let key = bot.dataMine + "-" + bot.codeName + "-" + bot.process + "-" + bot.dataSetVersion
                    let statusReport = statusDependencies.statusReports.get(key);

                    statusReport.file = {
                        lastFile: {
                            year: lastFileDate.getUTCFullYear(),
                            month: (lastFileDate.getUTCMonth() + 1),
                            days: lastFileDate.getUTCDate()
                        },
                        lastTradeFile: {
                            year: lastTradeFile.getUTCFullYear(),
                            month: (lastTradeFile.getUTCMonth() + 1),
                            days: lastTradeFile.getUTCDate(),
                            hours: lastTradeFile.getUTCHours(),
                            minutes: lastTradeFile.getUTCMinutes()
                        },
                        beginingOfMarket: {
                            year: beginingOfMarket.getUTCFullYear(),
                            month: (beginingOfMarket.getUTCMonth() + 1),
                            days: beginingOfMarket.getUTCDate(),
                            hours: beginingOfMarket.getUTCHours(),
                            minutes: beginingOfMarket.getUTCMinutes()
                        },
                        candleClose: candleClose,
                        fileComplete: isFileComplete
                    };

                    let fileContent = JSON.stringify(statusReport);

                    statusReport.save(onSaved);

                    function onSaved(err) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> onSaved -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            return;
                        }

                        callBack(global.DEFAULT_OK_RESPONSE);
                    }
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
