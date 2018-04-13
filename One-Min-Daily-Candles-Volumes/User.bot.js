exports.newUserBot = function newUserBot(BOT, COMMONS, UTILITIES, DEBUG_MODULE, BLOB_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    let bot = BOT;

    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "User Bot";

    const EXCHANGE_NAME = "Poloniex";

    const TRADES_FOLDER_NAME = "Trades";

    const CANDLES_FOLDER_NAME = "Candles";
    const CANDLES_ONE_MIN = "One-Min";

    const VOLUMES_FOLDER_NAME = "Volumes";
    const VOLUMES_ONE_MIN = "One-Min";

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    const commons = COMMONS.newCommons(bot, DEBUG_MODULE, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let charlyStorage = BLOB_STORAGE.newBlobStorage(bot);
    let bruceStorage = BLOB_STORAGE.newBlobStorage(bot);

    let utilities = UTILITIES.newUtilities(bot);

    let year;
    let month;

    let dependencies;

    return thisObject;

    function initialize(pDependencies, pMonth, pYear, callBackFunction) {

        try {

            year = pYear;
            month = pMonth;
            month = utilities.pad(month, 2); // Adding a left zero when needed.
            dependencies = pDependencies;

            logger.fileName = MODULE_NAME + "-" + year + "-" + month;

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] initialize -> pYear = " + year); }
            if (FULL_LOG === true) { logger.write("[INFO] initialize -> pMonth = " + month); }

            dependencies = pDependencies;

            commons.initializeStorage(charlyStorage, bruceStorage, onInizialized);

            function onInizialized(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> onInizialized -> Initialization Succeed."); }
                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } else {
                    logger.write("[ERROR] initialize -> onInizialized -> err = " + err.message);
                    callBackFunction(err);
                }
            }

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
    This process is going to do the following:
    Read the trades from Charly's Output and pack them into daily files with candles of one minute.
    */

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] start -> Entering function."); }

            let processDate = new Date(year + "-" + month + "-1 00:00:00.000 GMT+0000");
            let lastMinuteOfMonth = new Date(year + "-" + month + "-1 00:00:00.000 GMT+0000");

            lastMinuteOfMonth.setUTCMonth(lastMinuteOfMonth.getUTCMonth() + 1);             // First we go 1 month into the future.
            lastMinuteOfMonth.setUTCSeconds(lastMinuteOfMonth.getUTCSeconds() - 30);        // Then we go back 30 seconds, or to the last minute of the original month.

            let thisDatetime = new Date();

            if ((year === thisDatetime.getUTCFullYear() && month > thisDatetime.getUTCMonth() + 1) || year > thisDatetime.getUTCFullYear()) {

                logger.write("[ERROR] start -> We are too far in the future. Bot will not execute now.");

                let customOK = {
                    result: global.CUSTOM_OK_RESPONSE.result,
                    message: "Too far in the future."
                }
                logger.write("[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                callBackFunction(customOK);
                return;
            }

            let atHeadOfMarket;         // This tell us if we are at the month which includes the head of the market according to current datetime.
            if ((parseInt(year) === thisDatetime.getUTCFullYear() && parseInt(month) === thisDatetime.getUTCMonth() + 1)) {
                atHeadOfMarket = true;
            } else {
                atHeadOfMarket = false;
            }

            let market = global.MARKET;

            let lastCandleFile;         // Datetime of the last file certified by the Hole Fixing process as without permanent holes.
            let firstTradeFile;         // Datetime of the first trade file in the whole market history.
            let lastFileWithoutHoles;   // Datetime of the last verified file without holes.
            let lastCandleClose;        // Value of the last candle close.
            let lastTradeFile;          // Datetime pointing to the last Trade File sucessfuly processed and included in the last file.

            getContextVariables();

            function getContextVariables() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] start -> getContextVariables -> Entering function."); }

                    let thisReport;
                    let reportKey;

                    /* First Status Report */

                    reportKey = "AAMasters" + "-" + "AACharly" + "-" + "Poloniex-Historic-Trades" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write("[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (dependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write("[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = dependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile === undefined) {
                        logger.write("[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);
                        logger.write("[HINT] start -> getContextVariables -> It is too early too run this process since the trade history of the market is not there yet.");

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency does not exist."
                        }
                        logger.write("[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    if (thisReport.completeHistory === true) {  // We get from the file to know if this markets history is complete or not. 

                        firstTradeFile = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + thisReport.lastFile.hours + ":" + thisReport.lastFile.minutes + GMT_SECONDS);

                        /* Before processing this month we need to check if it is not too far in the past.*/

                        if (
                            processDate.getUTCFullYear() < firstTradeFile.getUTCFullYear()
                            ||
                            (processDate.getUTCFullYear() === firstTradeFile.getUTCFullYear() && processDate.getUTCMonth() < firstTradeFile.getUTCMonth())
                        ) {
                            logger.write("[WARN] start -> getContextVariables -> The current year / month is before the start of the market history for market.");
                            let customOK = {
                                result: global.CUSTOM_OK_RESPONSE.result,
                                message: "Month before it is needed."
                            }
                            logger.write("[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                            callBackFunction(customOK);
                            return;
                        }

                    } else {
                        logger.write("[WARN] start -> getContextVariables -> Trade History is not complete.");

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        logger.write("[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    /* Next Status Report */

                    reportKey = "AAMasters" + "-" + "AACharly" + "-" + "Poloniex-Hole-Fixing" + "-" + "dataSet.V1" + "-" + year + "-" + month; 
                    if (FULL_LOG === true) { logger.write("[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (dependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write("[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = dependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile === undefined) {
                        logger.write("[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);
                        logger.write("[HINT] start -> getContextVariables -> It is too early too run this process since the hole fixing process has not started yet for this month.");

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency does not exist."
                        }
                        logger.write("[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    if (thisReport.monthChecked === true) {

                        lastFileWithoutHoles = new Date();  // We need this with a valid value.

                    } else {

                        /*
                        If the hole report is incomplete, we are only interested if we are at the head of the market.
                        Otherwise, we are not going to calculate the candles of a month which was not fully checked for holes.
                        */

                        if (atHeadOfMarket === true) {

                            lastFileWithoutHoles = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + thisReport.lastFile.hours + ":" + thisReport.lastFile.minutes + GMT_SECONDS);

                        } else {

                            let customOK = {
                                result: global.CUSTOM_OK_RESPONSE.result,
                                message: "Dependency not ready."
                            }
                            logger.write("[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                            callBackFunction(customOK);
                            return;
                        }
                    }

                     /* Final Status Report */

                    reportKey = "AAMasters" + "-" + "AABruce" + "-" + "One-Min-Daily-Candles-Volumes" + "-" + "dataSet.V1" + "-" + year + "-" + month;
                    if (FULL_LOG === true) { logger.write("[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (dependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write("[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.");
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    thisReport = dependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile === undefined) {
                        logger.write("[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);
                        logger.write("[HINT] start -> getContextVariables -> If the status report does not exist we will point the lasCandleFile to the last day of the previous month.");

                        lastCandleFile = new Date(processDate.valueOf() - ONE_DAY_IN_MILISECONDS);
                        findLastCandleCloseValue();
                        return;
                    }

                    if (thisReport.monthCompleted === true) {

                        logger.write("[WARN] start -> getContextVariables -> The current year / month was already fully processed.");

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Month fully processed."
                        }
                        logger.write("[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;

                    } else {

                        lastCandleFile = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + "00:00" + GMT_SECONDS);
                        lastCandleClose = thisReport.candleClose;

                        if (thisReport.fileComplete === true) {

                            buildCandles();

                        } else {

                            lastTradeFile = new Date(thisReport.lastTradeFile.year + "-" + thisReport.lastTradeFile.month + "-" + thisReport.lastTradeFile.days + " " + thisReport.lastTradeFile.hours + ":" + thisReport.lastTradeFile.minutes + GMT_SECONDS);
                            findPreviousContent();
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] start -> getContextVariables -> err = " + err.message);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        logger.write("[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its dependencies declarations are correct. ");
                        logger.write("[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(dependencies.keys));
                    }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function findPreviousContent() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> Entering function."); }

                    let previousCandles;
                    let previousVolumes;

                    getCandles();

                    function getCandles() {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> getCandles -> Entering function."); }

                            let fileName = '' + market.assetA + '_' + market.assetB + '.json';
                            let dateForPath = lastCandleFile.getUTCFullYear() + '/' + utilities.pad(lastCandleFile.getUTCMonth() + 1, 2) + '/' + utilities.pad(lastCandleFile.getUTCDate(), 2);
                            let filePath = bot.filePathRoot +  "/Output/" + CANDLES_FOLDER_NAME + '/' + CANDLES_ONE_MIN + '/' + dateForPath;

                            bruceStorage.getTextFile(filePath, fileName, onFileReceived);

                            function onFileReceived(err, text) {

                                let candlesFile;

                                try {

                                    if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> getCandles -> onFileReceived -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write("[ERROR] start -> findPreviousContent -> getCandles -> onFileReceived -> err = " + err.message);
                                        callBackFunction(err);
                                        return;
                                    }

                                    if (LOG_FILE_CONTENT === true) {
                                        logger.write("[INFO] start -> findPreviousContent -> getCandles -> onFileReceived ->  text = " + text);
                                    }

                                    candlesFile = JSON.parse(text);
                                    previousCandles = candlesFile;
                                    getVolumes();

                                } catch (err) {

                                    logger.write("[ERROR] start -> findPreviousContent -> getCandles -> onFileReceived -> err = " + err.message);
                                    logger.write("[ERROR] start -> findPreviousContent -> getCandles -> onFileReceived -> filePath = " + filePath);
                                    logger.write("[HINT] start -> findPreviousContent -> getCandles -> onFileReceived -> Empty or corrupt volume file found.");
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] start -> findPreviousContent -> getCandles -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function getVolumes() {

                        try {
                            if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> getVolumes -> Entering function."); }

                            let fileName = '' + market.assetA + '_' + market.assetB + '.json';
                            let dateForPath = lastCandleFile.getUTCFullYear() + '/' + utilities.pad(lastCandleFile.getUTCMonth() + 1, 2) + '/' + utilities.pad(lastCandleFile.getUTCDate(), 2);
                            let filePath = bot.filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + CANDLES_ONE_MIN + '/' + dateForPath;

                            bruceStorage.getTextFile(filePath, fileName, onFileReceived);

                            function onFileReceived(err, text) {

                                let volumesFile;

                                try {

                                    if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> getVolumes -> onFileReceived -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write("[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived -> err = " + err.message);
                                        logger.write("[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived ->  text = " + text);
                                        callBackFunction(err);
                                        return;
                                    }

                                    if (LOG_FILE_CONTENT === true) {
                                        logger.write("[INFO] start -> findPreviousContent -> getVolumes -> onFileReceived ->  text = " + text);
                                    }

                                    volumesFile = JSON.parse(text);
                                    previousVolumes = volumesFile;
                                    lastCandleFile = new Date(lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS);  // We know that after the next call a new day will be added.
                                    buildCandles(previousCandles, previousVolumes);

                                } catch (err) {

                                    logger.write("[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived -> err = " + err.message);
                                    logger.write("[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived -> filePath = " + filePath);
                                    logger.write("[ERROR] start -> findPreviousContent -> getVolumes -> onFileReceived ->  text = " + text);
                                    logger.write("[HINT] start -> findPreviousContent -> getVolumes -> onFileReceived -> Empty or corrupt volume file found.");
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] start -> findPreviousContent -> getVolumes -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    } 

                } catch (err) {
                    logger.write("[ERROR] start -> findPreviousContent -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function findLastCandleCloseValue() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> Entering function."); }

                    /* 
                    We will search and find for the last trade before the begining of the current candle and that will give us the last close value.
                    Before going backwards, we need to be sure we are not at the begining of the market.
                    */

                    if ((year === firstTradeFile.getUTCFullYear() && parseInt(month) === firstTradeFile.getUTCMonth() + 1)) {

                        /*
                        We are at the begining of the market, so we will set everyting to build the first candle.
                        */

                        if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> Begining of the market detected."); }
                        if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> Entering market = " + JSON.stringify(market)); }
                        if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> lastCandleClose = " + lastCandleClose); }

                        lastCandleFile = new Date(firstTradeFile.getUTCFullYear() + "-" + (firstTradeFile.getUTCMonth() + 1) + "-" + firstTradeFile.getUTCDate() + " " + "00:00"  + GMT_SECONDS);
                        lastCandleFile = new Date(lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS);

                        lastCandleClose = 0;
                        buildCandles();

                    } else {

                        /*
                        We are not at the begining of the market, so we need scan backwards the trade files until we find a non empty one and get the last trade.
                        */

                        let date = new Date(processDate.valueOf());

                        loopStart();

                        function loopStart() {

                            try {

                                if (FULL_LOG === true) { logger.write("[INFO] start -> findPreviousContent -> loopStart -> Entering function."); }

                                date = new Date(date.valueOf() - 60 * 1000);

                                let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);
                                let fileName = market.assetA + '_' + market.assetB + ".json"
                                let filePathRoot = bot.devTeam + "/" + "AACharly" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                let filePath = filePathRoot + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPath;

                                charlyStorage.getTextFile(filePath, fileName, onFileReceived);

                                function onFileReceived(err, text) {

                                    let tradesFile;

                                    try {

                                        if (FULL_LOG === true) { logger.write("[INFO] start -> findLastCandleCloseValue -> loopStart -> onFileReceived -> Entering function."); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                            logger.write("[ERROR] start -> findLastCandleCloseValue -> loopStart -> onFileReceived -> err = " + err.message);
                                            logger.write("[ERROR] start -> findLastCandleCloseValue -> loopStart -> onFileReceived ->  text = " + text);
                                            callBackFunction(err);
                                            return;
                                        }

                                        if (LOG_FILE_CONTENT === true) {
                                            logger.write("[INFO] start -> findLastCandleCloseValue -> loopStart -> onFileReceived ->  text = " + text);
                                        }

                                        tradesFile = JSON.parse(text);

                                        if (tradesFile.length > 0) {

                                            lastCandleClose = tradesFile[tradesFile.length - 1][2]; // Position 2 is the rate at which the trade was executed.

                                            logger.write("[INFO] start -> findLastCandleCloseValue -> loopStart -> onFileReceived -> Trades found at " + filePath + " for market " + market.assetA + '_' + market.assetB + ".");
                                            logger.write("[INFO] start -> findLastCandleCloseValue -> loopStart -> onFileReceived -> lastCandleClose = " + lastCandleClose);

                                            buildCandles();

                                        } else {

                                            logger.write("[INFO] start -> findLastCandleCloseValue -> loopStart -> onFileReceived -> NO Trades found at " + filePath + " for market " + market.assetA + '_' + market.assetB + ".");

                                            loopStart();
                                        }

                                    } catch (err) {

                                        logger.write("[ERROR] start -> findLastCandleCloseValue -> loopStart -> onFileReceived -> err = " + err.message);
                                        logger.write("[ERROR] start -> findLastCandleCloseValue -> loopStart -> onFileReceived -> filePath = " + filePath);
                                        logger.write("[ERROR] start -> findLastCandleCloseValue -> loopStart -> onFileReceived ->  text = " + text);
                                        logger.write("[HINT] start -> findLastCandleCloseValue -> loopStart -> onFileReceived -> Empty or corrupt volume file found.");
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }
                                }
                            } catch (err) {
                                logger.write("[ERROR] start -> findLastCandleCloseValue -> loopStart -> err = " + err.message);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                } catch (err) {
                    logger.write("[ERROR] start -> findLastCandleCloseValue -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildCandles(previousCandles, previousVolumes) {

                if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> Entering function."); }

                /*
                Here we are going to scan the trades files packing them in candles files every one day.
                We need for this the last close value, bacause all candles that are empty of trades at the begining, they need to
                have a valid open and close value. This was previously calculated before arriving to this function.
                */

                let canAddPrevious = true;

                try {
                    nextCandleFile();

                    function nextCandleFile() {

                        try {
                            if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> nextCandleFile -> Entering function."); }

                            lastCandleFile = new Date(lastCandleFile.valueOf() + ONE_DAY_IN_MILISECONDS);

                            let date = new Date(lastCandleFile.valueOf() - 60 * 1000);

                            if (date.valueOf() < firstTradeFile.valueOf()) {  // At the special case where we are at the begining of the market, this might be true.
                                date = new Date(firstTradeFile.valueOf() - 60 * 1000);
                            }

                            if (lastTradeFile !== undefined) {
                                date = new Date(lastTradeFile.valueOf());
                            }

                            let candles = [];
                            let volumes = [];

                            if (previousCandles !== undefined && canAddPrevious === true) {

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
                                    if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> nextCandleFile -> nextDate -> Entering function."); }

                                    date = new Date(date.valueOf() + 60 * 1000);

                                    /* Check if we are outside the current Day / File */

                                    if (date.getUTCDate() !== lastCandleFile.getUTCDate()) {

                                        writeFiles(lastCandleFile, candles, volumes, true, onFilesWritten);

                                        return;

                                        function onFilesWritten() {

                                            nextCandleFile();
                                        }
                                    }

                                    /* Check if we are outside the currrent Month */

                                    if (date.getUTCMonth() + 1 !== parseInt(month)) {

                                        if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> nextCandleFile -> nextDate -> End of the month reached at date = " + date.toUTCString()); }

                                        lastCandleFile = new Date(lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS);

                                        writeStatusReport(lastCandleFile, lastTradeFile, lastCandleClose, true, true, onStatusReportWritten);
                                        return;

                                        function onStatusReportWritten(err) {

                                            try {
                                                if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> nextCandleFile -> nextDate -> onStatusReportWritten -> Entering function."); }

                                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                    logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> nextDate -> onStatusReportWritten -> err = " + err.message);
                                                    callBackFunction(err);
                                                    return;
                                                }

                                                let customOK = {
                                                    result: global.CUSTOM_OK_RESPONSE.result,
                                                    message: "End of the month reached."
                                                }
                                                logger.write("[WARN] start -> buildCandles -> nextCandleFile -> nextDate -> onStatusReportWritten -> customOK = " + customOK.message);
                                                callBackFunction(customOK);

                                                return;
                                            } catch (err) {
                                                logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> nextDate -> onStatusReportWritten -> err = " + err.message);
                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                return;
                                            }
                                        }
                                    }

                                    /* Check if we have past the most recent hole fixed file */

                                    if (date.valueOf() > lastFileWithoutHoles.valueOf()) {

                                        writeFiles(lastCandleFile, candles, volumes, false, onFilesWritten);
                                        return;

                                        function onFilesWritten() {

                                            if (FULL_LOG === true) {
                                                logger.write("[INFO] start -> buildCandles -> nextCandleFile -> nextDate -> Head of the market reached for market " + market.assetA + '_' + market.assetB + "."); }

                                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                                            return;
                                        }
                                    }

                                    readTrades();

                                } catch (err) {
                                    logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> nextDate -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function readTrades() {

                                try {
                                    if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> nextCandleFile -> nextDate -> readTrades -> Entering function."); }

                                    lastTradeFile = new Date(date.valueOf());

                                    let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);
                                    let fileName = market.assetA + '_' + market.assetB + ".json"
                                    let filePathRoot = bot.devTeam + "/" + "AACharly" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPath;

                                    charlyStorage.getTextFile(filePath, fileName, onFileReceived);

                                    function onFileReceived(err, text) {

                                        let tradesFile;

                                        try {
                                            if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> nextCandleFile -> readTrades -> onFileReceived -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> readTrades -> onFileReceived -> err = " + err.message);
                                                logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> readTrades -> onFileReceived ->  text = " + text);
                                                callBackFunction(err);
                                                return;
                                            }

                                            if (LOG_FILE_CONTENT === true) {
                                                logger.write("[INFO] start -> buildCandles -> nextCandleFile -> readTrades -> onFileReceived ->  text = " + text);
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

                                            logger.write("[INFO] start -> buildCandles -> nextCandleFile -> readTrades -> onFileReceived -> " + tradesCount + " trades found at " + filePath + " for market " + market.assetA + '_' + market.assetB + ". ");

                                            if (tradesFile.length > 0) {

                                                /* Candle open and close Calculations */

                                                candle.open = tradesFile[0][2];
                                                candle.close = tradesFile[tradesFile.length - 1][2];
                                                lastCandleClose = candle.close;
                                            }

                                            for (let i = 0; i < tradesFile.length; i++) {

                                                const trade = {
                                                    id: tradesFile[i][0],
                                                    type: tradesFile[i][1],
                                                    rate: tradesFile[i][2],
                                                    amountA: tradesFile[i][3],
                                                    amountB: tradesFile[i][4],
                                                    seconds: tradesFile[i][5]
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

                                            logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> readTrades -> onFileReceived -> err = " + err.message);
                                            logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> readTrades -> onFileReceived -> filePath = " + filePath);
                                            logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> readTrades -> onFileReceived ->  text = " + text);
                                            logger.write("[HINT] start -> buildCandles -> nextCandleFile -> readTrades -> onFileReceived -> Empty or corrupt volume file found.");
                                            
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }
                                } catch (err) {
                                    logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> readTrades -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        } catch (err) {
                            logger.write("[ERROR] start -> buildCandles -> nextCandleFile -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] start -> buildCandles -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeFiles(date, candles, volumes, isFileComplete, callBack) {

                if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> Entering function."); }

                /*
                Here we will write the contents of the Candles and Volumens files. If the File is declared as complete, we will also write the status report.
                */

                try {

                    writeCandles();

                    function writeCandles() {

                        try {
                            if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeCandles -> Entering function."); }

                            let separator = "";
                            let fileRecordCounter = 0;

                            let fileContent = "";

                            for (i = 0; i < candles.length; i++) {

                                let candle = candles[i];
                                fileContent = fileContent + separator + '[' + candles[i].min + "," + candles[i].max + "," + candles[i].open + "," + candles[i].close + "," + candles[i].begin + "," + candles[i].end + "]";
                                if (separator === "") { separator = ","; }
                                fileRecordCounter++;
                            }

                            fileContent = "[" + fileContent + "]";

                            let fileName = '' + market.assetA + '_' + market.assetB + '.json';
                            let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2);
                            let filePath = bot.filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + CANDLES_ONE_MIN + '/' + dateForPath;

                            utilities.createFolderIfNeeded(filePath, bruceStorage, onFolderCreated);

                            function onFolderCreated(err) {

                                try {

                                    if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeCandles -> onFolderCreated -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write("[ERROR] start -> writeFiles -> writeCandles -> onFolderCreated -> err = " + err.message);
                                        callBackFunction(err);
                                        return;
                                    }

                                    bruceStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                                    function onFileCreated(err) {

                                        try {

                                            if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeCandles -> onFolderCreated -> onFileCreated -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                logger.write("[ERROR] start -> writeFiles -> writeCandles -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                                callBackFunction(err);
                                                return;
                                            }

                                            if (LOG_FILE_CONTENT === true) {
                                                logger.write("[INFO] start -> writeFiles -> writeCandles -> onFolderCreated -> onFileCreated -> fileContent = " + fileContent);
                                            }

                                            logger.write("[INFO] start -> writeFiles -> writeCandles -> onFolderCreated -> onFileCreated -> Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "");

                                            writeVolumes();

                                        } catch (err) {
                                            logger.write("[ERROR] start -> writeFiles -> writeCandles -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    logger.write("[ERROR] start -> writeFiles -> writeCandles -> onFolderCreated -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        } catch (err) {
                                logger.write("[ERROR] start -> writeFiles -> writeCandles -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function writeVolumes() {

                        try {
                            if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeVolumes -> Entering function."); }

                            let separator = "";
                            let fileRecordCounter = 0;

                            let fileContent = "";

                            for (i = 0; i < volumes.length; i++) {

                                let candle = volumes[i];
                                fileContent = fileContent + separator + '[' + volumes[i].buy + "," + volumes[i].sell + "," + volumes[i].begin + "," + volumes[i].end + "]";
                                if (separator === "") { separator = ","; }
                                fileRecordCounter++;
                            }

                            fileContent = "[" + fileContent + "]";

                            let fileName = '' + market.assetA + '_' + market.assetB + '.json';
                            let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2);
                            let filePath = bot.filePathRoot + "/Output/" + VOLUMES_FOLDER_NAME + '/' + VOLUMES_ONE_MIN + '/' + dateForPath;

                            utilities.createFolderIfNeeded(filePath, bruceStorage, onFolderCreated);

                            function onFolderCreated(err) {

                                try {
                                    if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeVolumes -> onFolderCreated -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write("[ERROR] start -> writeFiles -> writeVolumes -> onFolderCreated -> err = " + err.message);
                                        callBackFunction(err);
                                        return;
                                    }

                                    bruceStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                                    function onFileCreated(err) {

                                        try {
                                            if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeVolumes -> onFolderCreated -> onFileCreated -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                logger.write("[ERROR] start -> writeFiles -> writeVolumes -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                                callBackFunction(err);
                                                return;
                                            }

                                            if (LOG_FILE_CONTENT === true) {
                                                logger.write("[INFO] start -> writeFiles -> writeVolumes -> onFolderCreated -> onFileCreated -> fileContent = " + fileContent);
                                            }

                                            logger.write("[INFO] start -> writeFiles -> writeVolumes -> onFolderCreated -> onFileCreated -> Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "");

                                            writeReport();

                                        } catch (err) {
                                            logger.write("[ERROR] start -> writeFiles -> writeVolumes -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    logger.write("[ERROR] start -> writeFiles -> writeVolumes -> onFolderCreated -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] start -> writeFiles -> writeVolumes -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function writeReport() {

                        try {
                            if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeReport -> Entering function."); }

                            writeStatusReport(date, lastTradeFile, lastCandleClose, isFileComplete, false, onStatusReportWritten);

                            function onStatusReportWritten(err) {

                                try {
                                    if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeReport -> onStatusReportWritten -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write("[ERROR] start -> writeFiles -> onStatusReportWritten -> err = " + err.message);
                                        callBackFunction(err);
                                        return;
                                    }

                                    callBack();
                                    return;
                                } catch (err) {
                                    logger.write("[ERROR] start -> writeFiles -> writeReport -> onStatusReportWritten -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] start -> writeFiles -> writeReport -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] start -> writeFiles -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(lastFileDate, lastTradeFile, candleClose, isFileComplete, isMonthComplete, callBack) {

                if (FULL_LOG === true) { logger.write("[INFO] start -> writeStatusReport -> Entering function."); }
                if (FULL_LOG === true) { logger.write("[INFO] start -> writeStatusReport -> lastFileDate = " + lastFileDate); }
                if (FULL_LOG === true) { logger.write("[INFO] start -> writeStatusReport -> lastTradeFile = " + lastTradeFile); }
                if (FULL_LOG === true) { logger.write("[INFO] start -> writeStatusReport -> candleClose = " + candleClose); }
                if (FULL_LOG === true) { logger.write("[INFO] start -> writeStatusReport -> isFileComplete = " + isFileComplete); }
                if (FULL_LOG === true) { logger.write("[INFO] start -> writeStatusReport -> isMonthComplete = " + isMonthComplete); }

                try {

                    let key = bot.devTeam + "-" + bot.codeName + "-" + bot.process + "-" + bot.dataSetVersion + "-" + year + "-" + month;
                    let statusReport = dependencies.statusReports.get(key);

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
                        candleClose: candleClose,
                        monthCompleted: isMonthComplete,
                        fileComplete: isFileComplete
                    };

                    let fileContent = JSON.stringify(statusReport); 

                    statusReport.save(onSaved);

                    function onSaved(err) {

                        if (FULL_LOG === true) { logger.write("[INFO] start -> writeStatusReport -> onSaved -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.message);
                            callBackFunction(err);
                            return;
                        }

                        callBack(global.DEFAULT_OK_RESPONSE);
                    }
                }
                catch (err) {
                    logger.write("[ERROR] start -> writeStatusReport -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write("[ERROR] start -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
