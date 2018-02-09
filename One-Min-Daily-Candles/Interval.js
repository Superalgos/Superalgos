exports.newInterval = function newInterval(BOT) {

    let bot = BOT;
    const ROOT_DIR = '../';
    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "Interval";
    const LOG_INFO = true;

    const EXCHANGE_NAME = "Poloniex";
    const EXCHANGE_ID = 1;

    const TRADES_FOLDER_NAME = "Trades";

    const CANDLES_FOLDER_NAME = "Candles";
    const CANDLES_ONE_MIN = "One-Min";

    const VOLUMES_FOLDER_NAME = "Volumes";
    const VOLUMES_ONE_MIN = "One-Min";

    const GO_RANDOM = false;
    const FORCE_MARKET = 2;     // This allows to debug the execution of an specific market. Not intended for production. 

    const MARKETS_MODULE = require(ROOT_DIR + 'Markets');

    const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    interval = {
        initialize: initialize,
        start: start
    };

    let markets;

    const AZURE_FILE_STORAGE = require(ROOT_DIR + 'Azure File Storage');
    let charlyAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);
    let bruceAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);

    const UTILITIES = require(ROOT_DIR + 'Utilities');
    let utilities = UTILITIES.newUtilities(bot);

    let year;
    let month;

    return interval;

    function initialize(yearAssigend, monthAssigned, callBackFunction) {

        try {

            year = yearAssigend;
            month = monthAssigned;

            month = utilities.pad(month, 2); // Adding a left zero when needed.

            logger.fileName = MODULE_NAME + "-" + year + "-" + month;

            const logText = "[INFO] initialize - Entering function 'initialize' " + " @ " + year + "-" + month;
            console.log(logText);
            logger.write(logText);

            charlyAzureFileStorage.initialize("Charly");
            bruceAzureFileStorage.initialize("Bruce");

            markets = MARKETS_MODULE.newMarkets(bot);
            markets.initialize(callBackFunction);


        } catch (err) {

            const logText = "[ERROR] initialize - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);

        }
    }

/*

This process is going to do the following:

Read the trades from Charly's Output and pack them into daily files with candles of one minute.

*/

    function start(callBackFunction) {

        try {

            if (LOG_INFO === true) {
                logger.write("[INFO] Entering function 'start', with year = " + year + " and month = " + month);
            }

            let processDate = new Date(year + "-" + month + "-1 00:00:00.000 GMT+0000");

            let lastMinuteOfMonth = new Date(year + "-" + month + "-1 00:00:00.000 GMT+0000");

            lastMinuteOfMonth.setUTCMonth(lastMinuteOfMonth.getUTCMonth() + 1);          // First we go 1 month into the future.
            lastMinuteOfMonth.setUTCSeconds(lastMinuteOfMonth.getUTCSeconds() - 30);    // Then we go back 30 seconds, or to the last minute of the original month.

            let thisDatetime = new Date();

            if ((year === thisDatetime.getUTCFullYear() && month > thisDatetime.getUTCMonth() + 1) || year > thisDatetime.getUTCFullYear()) {

                logger.write("[INFO] We are too far in the future. Interval will not execute. Sorry.");
                return;

            }

            let atHeadOfMarket;         // This tell us if we are at the month which includes the head of the market according to current datetime.

            if ((year === thisDatetime.getUTCFullYear() && month === thisDatetime.getUTCMonth() + 1)) {

                atHeadOfMarket = true;

            } else {

                atHeadOfMarket = false;

            }

            let nextIntervalExecution = false; // This tell weather the Interval module will be executed again or not. By default it will not unless some hole have been found in the current execution.

            let marketQueue;            // This is the queue of all markets to be procesesd at each interval.
            let market = {              // This is the current market being processed after removing it from the queue.
                id: 0,
                assetA: "",
                assetB: ""
            };

            let lastCandleFile;         // Datetime of the last file certified by the Hole Fixing process as without permanent holes.
            let firstTradeFile;         // Datetime of the first trade file in the whole market history.
            let lastFileWithoutHoles;   // Datetime of the last verified file without holes.
            let lastCandleClose;        // Value of the last candle close.

            marketsLoop(); 

            /*
    
            At every run, the process needs to loop through all the markets at this exchange.
            The following functions marketsLoop(), openMarket(), closeMarket() and closeAndOpenMarket() controls the serialization of this processing.

            */

            function marketsLoop() {

                try {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'marketsLoop'");
                    }

                    markets.getMarketsByExchange(EXCHANGE_ID, onMarketsReady);

                    function onMarketsReady(marketsArray) {

                        marketQueue = JSON.parse(marketsArray);

                        openMarket(); // First execution and entering into the real loop.

                    }
                }
                catch (err) {
                    const logText = "[ERROR] 'marketsLoop' - ERROR : " + err.message;
                    logger.write(logText);
                }
            }

            function openMarket() {

                // To open a Market means picking a new market from the queue.

                try {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'openMarket'");
                    }


                    if (marketQueue.length === 0) {

                        if (LOG_INFO === true) {
                            logger.write("[INFO] 'openMarket' - marketQueue.length === 0");
                        }

                        const logText = "[WARN] We processed all the markets.";
                        logger.write(logText);

                        callBackFunction(nextIntervalExecution);

                        return;
                    }

                    if (GO_RANDOM === true) {
                        const index = parseInt(Math.random() * (marketQueue.length - 1));

                        market.id = marketQueue[index][0];
                        market.assetA = marketQueue[index][1];
                        market.assetB = marketQueue[index][2];
                        market.status = marketQueue[index][3];

                        marketQueue.splice(index, 1);
                    } else {
                        let marketRecord = marketQueue.shift();

                        market.id = marketRecord[0];
                        market.assetA = marketRecord[1];
                        market.assetB = marketRecord[2];
                        market.status = marketRecord[3];

                        if (FORCE_MARKET > 0) {
                            if (FORCE_MARKET !== market.id) {
                                closeAndOpenMarket();
                                return;
                            }
                        }
                    }

                    if (LOG_INFO === true) {
                        logger.write("[INFO] 'openMarket' - marketQueue.length = " + marketQueue.length);
                        logger.write("[INFO] 'openMarket' - market sucessfully opened : " + market.assetA + "_" + market.assetB);
                    }

                    if (market.status === markets.ENABLED) {

                        getStatusReport();

                    } else {

                        logger.write("[INFO] 'openMarket' - market " + market.assetA + "_" + market.assetB + " skipped because its status is not valid. Status = " + market.status);
                        closeAndOpenMarket();
                        return;

                    }


                }
                catch (err) {
                    const logText = "[ERROR] 'openMarket' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }
            }

            function closeMarket() {

                if (LOG_INFO === true) {
                    logger.write("[INFO] Entering function 'closeMarket'");
                }

            }

            function closeAndOpenMarket() {

                if (LOG_INFO === true) {
                    logger.write("[INFO] Entering function 'closeAndOpenMarket'");
                }

                openMarket();
            }

            /*

            The following code executes for each market.

            */

            function getStatusReport() {

                try {

                    let reportFilePath;
                    let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json"

                    getHistoricTrades();

                    function getHistoricTrades() {

                        /*

                        We need to know where is the begining of the market, since that will help us know how to estimate the value of the last close.
                        If we are at the begining of the market, the last close should be zero. 

                        */

                        reportFilePath = EXCHANGE_NAME + "/Processes/" + "Historic-Trades";

                        charlyAzureFileStorage.getTextFile(reportFilePath, fileName, onStatusReportReceived, true);

                        function onStatusReportReceived(text) {

                            let statusReport;

                            try {

                                statusReport = JSON.parse(text);

                                firstTradeFile = new Date(statusReport.lastFile.year + "-" + statusReport.lastFile.month + "-" + statusReport.lastFile.days + " " + statusReport.lastFile.hours + ":" + statusReport.lastFile.minutes + GMT_SECONDS);

                                getHoleFixing();

                            } catch (err) {

                                const logText = "[INFO] 'getStatusReport' - Failed to read main Historic Trades Status Report for market " + market.assetA + '_' + market.assetB + " . Skipping it. ";
                                logger.write(logText);

                                closeAndOpenMarket();
                            }
                        }
                    }

                    function getHoleFixing() {

                        /*

                        The limit in the future as of which candles to include is determined by the Hole Fixing process. We wont include
                        trades not certified to be without hole.

                        */

                        reportFilePath = EXCHANGE_NAME + "/Processes/" + "Hole-Fixing" + "/" + year + "/" + month;

                        charlyAzureFileStorage.getTextFile(reportFilePath, fileName, onStatusReportReceived, true);

                        function onStatusReportReceived(text) {

                            let statusReport;

                            try {
                                statusReport = JSON.parse(text);
                            } 
                            catch (err) {
                                text = undefined; // If the content of the file is corrupt, this equals as if the file did not exist.
                            }

                            if (text === undefined) {

                                const logText = "[INFO] 'getStatusReport' - The current year / month was not yet hole-fixed for market " + market.assetA + '_' + market.assetB + " . Skipping it. ";
                                logger.write(logText);

                                closeAndOpenMarket();

                            } else {

                                if (statusReport.monthChecked === true) {

                                    lastFileWithoutHoles = new Date();  // We need this with a valid value.
                                    getOneMinDailyCandlesVolumes();

                                } else {

                                    /*

                                    If the hole report is incomplete, we are only interested if we are at the head of the market.
                                    Otherwise, we are not going to calculate the candles of a month which was not fully checked for holes.

                                    */

                                    if (atHeadOfMarket === true) {

                                        lastFileWithoutHoles = new Date(statusReport.lastFile.year + "-" + statusReport.lastFile.month + "-" + statusReport.lastFile.days + " " + statusReport.lastFile.hours + ":" + statusReport.lastFile.minutes + GMT_SECONDS);
                                        getOneMinDailyCandlesVolumes();

                                    } else {

                                        const logText = "[INFO] 'getStatusReport' - The current year / month was not completely hole-fixed for market " + market.assetA + '_' + market.assetB + " . Skipping it. ";
                                        logger.write(logText);

                                        closeAndOpenMarket();

                                    }
                                }
                            }
                        }
                    }

                    function getOneMinDailyCandlesVolumes() {

                        /* If the process run and was interrupted, there should be a status report that allows us to resume execution. */

                        reportFilePath = EXCHANGE_NAME + "/Processes/" + "One-Min-Daily-Candles-Volumes" + "/" + year + "/" + month;

                        bruceAzureFileStorage.getTextFile(reportFilePath, fileName, onStatusReportReceived, true);

                        function onStatusReportReceived(text) {

                            let statusReport;

                            try {

                                statusReport = JSON.parse(text);

                                lastCandleFile = new Date(statusReport.lastFile.year + "-" + statusReport.lastFile.month + "-" + statusReport.lastFile.days + " " + "00:00" + GMT_SECONDS);
                                lastCandleClose = statusReport.lastFile.candleClose;

                                buildCandles();

                            } catch (err) {

                                /*

                                It might happen that the file content is corrupt or it does not exist. In either case we will point our lastCandleFile
                                to the last day of the previous month.

                                */

                                lastCandleFile = new Date(processDate.valueOf() - ONE_DAY_IN_MILISECONDS);
                                findLastCandleCloseValue();

                            }
                        }
                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'getStatusReport' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }
            }

            function findLastCandleCloseValue() {

                try {

                    /* 

                    We will search and find for the last trade before the begining of the current candle and that will give us the last close value.
                    Before going backwards, we need to be sure we are not at the begining of the market.

                    */

                    if ((year === firstTradeFile.getUTCFullYear() && month === firstTradeFile.getUTCMonth() + 1)) {

                        /*

                        We are at the begining of the market, so we will set everyting to build the first candle.

                        */

                        lastCandleFile = new Date(firstTradeFile.getUTCFullYear() + "-" + (firstTradeFile.getUTCMonth() + 1) + "-" + firstTradeFile.getUTCDay() + " " + "00:00"  + GMT_SECONDS);
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

                            date = new Date(date.valueOf() - 60 * 1000);

                            let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"
                            let filePath = EXCHANGE_NAME + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPath;

                            charlyAzureFileStorage.getTextFile(filePath, fileName, onFileReceived, true);

                            function onFileReceived(text) {

                                let tradesFile;

                                try {

                                    tradesFile = JSON.parse(text);

                                    if (tradesFile.length > 0) {

                                        lastCandleClose = tradesFile[tradesFile.length - 1][2]; // Position 2 is the rate at which the trade was executed.

                                        const logText = "[INFO] 'findLastCandleCloseValue' - Trades found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . lastCandleClose = " + lastCandleClose;
                                        logger.write(logText);

                                        buildCandles();

                                    } else {

                                        const logText = "[INFO] 'findLastCandleCloseValue' - No trades found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " .";
                                        logger.write(logText);

                                        loopStart();

                                    }

                                } catch (err) {

                                    const logText = "[ERR] 'findLastCandleCloseValue' - Empty or corrupt trade file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                    logger.write(logText);

                                    closeAndOpenMarket();
                                }
                            }
                        }
                    }
                }
                catch (err) {
                    const logText = "[ERROR] 'findLastCandleCloseValue' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }
            }

            function buildCandles() {

                /*

                Here we are going to scan the trades files packing them in candles files every one day.
                We need for this the last close value, bacause all candles that are empty of trades at the begining, they need to
                have a valid open and close value. This was previously calculated before arriving to this function.

                */

                try {


                    nextCandleFile();

                    function nextCandleFile() {

                        lastCandleFile = new Date(lastCandleFile.valueOf() + ONE_DAY_IN_MILISECONDS);

                        let date = new Date(lastCandleFile.valueOf() - 60 * 1000);

                        let candles = [];
                        let volumes = [];

                        nextDate();

                        function nextDate() {

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

                                writeStatusReport(lastCandleFile, lastCandleClose, true, onStatusReportWritten);

                                return;

                                function onStatusReportWritten() {

                                    const logText = "[ERR] 'buildCandles' - Finishing processing the whole month for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                    logger.write(logText);

                                    closeAndOpenMarket();

                                }
                            }

                            /* Check if we have past the most recent hole fixed file */

                            if (date.valueOf() > lastFileWithoutHoles.valueOf()) {

                                writeFiles(lastCandleFile, candles, volumes, false, onFilesWritten);

                                return;

                                function onFilesWritten() {

                                    nextIntervalExecution = true;

                                    const logText = "[ERR] 'buildCandles' - Head of the market reached for market " + market.assetA + '_' + market.assetB + " . ";
                                    logger.write(logText);

                                    closeAndOpenMarket();

                                }
                            }

                            readTrades();
                        }

                        function readTrades() {

                            let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"
                            let filePath = EXCHANGE_NAME + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPath;

                            charlyAzureFileStorage.getTextFile(filePath, fileName, onFileReceived, true);

                            function onFileReceived(text) {

                                let tradesFile;

                                try {

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

                                    const logText = "[INFO] 'buildCandles' - " + tradesCount +" trades found at " + filePath + " for market " + market.assetA + '_' + market.assetB + ". ";
                                    logger.write(logText);
                                    console.log(logText);

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

                                    const logText = "[ERR] 'buildCandles' - Empty or corrupt trade file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                    logger.write(logText);

                                    closeAndOpenMarket();
                                }
                            }
                        }
                    }
                } 
                     
                catch (err) {
                    const logText = "[ERROR] 'buildCandles' - ERROR : " + err.message;
                logger.write(logText);
                closeMarket();
                }

            }

            function writeFiles(date, candles, volumes, isFileComplete, callBack) {

                /*

                Here we will write the contents of the Candles and Volumens files. If the File is declared as complete, we will also write the status report.

                */

                try {

                    writeCandles();

                    function writeCandles() {

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

                        let filePath = EXCHANGE_NAME + "/Output/" + CANDLES_FOLDER_NAME + '/' + CANDLES_ONE_MIN + '/' + dateForPath;

                        utilities.createFolderIfNeeded(filePath, bruceAzureFileStorage, onFolderCreated);

                        function onFolderCreated() {

                            bruceAzureFileStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                console.log(logText);
                                logger.write(logText);

                                writeVolumes();
                            }
                        }

                    }

                    function writeVolumes() {

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

                        let filePath = EXCHANGE_NAME + "/Output/" + VOLUMES_FOLDER_NAME + '/' + VOLUMES_ONE_MIN + '/' + dateForPath;

                        utilities.createFolderIfNeeded(filePath, bruceAzureFileStorage, onFolderCreated);

                        function onFolderCreated() {

                            bruceAzureFileStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                console.log(logText);
                                logger.write(logText);

                                writeReport();
                            }
                        }
                    }

                    function writeReport() {

                        if (isFileComplete === true) {

                            writeStatusReport(date, lastCandleClose, false, onStatusReportWritten);

                            function onStatusReportWritten() {

                                callBack();

                            }

                        } else {

                            callBack();

                        }
                    }
                }
                     
                catch (err) {
                    const logText = "[ERROR] 'writeFiles' - ERROR : " + err.message;
                logger.write(logText);
                closeMarket();
                }
            }

            function writeStatusReport(lastFileDate, candleClose, isMonthComplete, callBack) {


                if (LOG_INFO === true) {
                    logger.write("[INFO] Entering function 'writeStatusReport'");
                }

                try {

                    let reportFilePath = EXCHANGE_NAME + "/Processes/" + bot.process + "/" + year + "/" + month;

                    utilities.createFolderIfNeeded(reportFilePath, bruceAzureFileStorage, onFolderCreated);

                    function onFolderCreated() {

                        try {

                            let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                            let report = {
                                lastFile: {
                                    year: lastFileDate.getUTCFullYear(),
                                    month: (lastFileDate.getUTCMonth() + 1),
                                    days: lastFileDate.getUTCDate()
                                },
                                candleClose: candleClose,
                                monthCompleted: isMonthComplete
                            };

                            let fileContent = JSON.stringify(report); 

                            bruceAzureFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                if (LOG_INFO === true) {
                                    logger.write("[INFO] 'writeStatusReport' - Content written: " + fileContent);
                                }

                                callBack();
                            }
                        }
                        catch (err) {
                            const logText = "[ERROR] 'writeStatusReport - onFolderCreated' - ERROR : " + err.message;
                            logger.write(logText);
                            closeMarket();
                        }
                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'writeStatusReport' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }

            }

        }
        catch (err) {
            const logText = "[ERROR] 'Start' - ERROR : " + err.message;
            logger.write(logText);
        }
    }
};
