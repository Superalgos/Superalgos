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

            let currentDate;            // This will hold the current datetime of each execution.
            let cursorDatetime;         // This holds the datetime we are using to request records from, backwards.

            let marketQueue;            // This is the queue of all markets to be procesesd at each interval.
            let market = {              // This is the current market being processed after removing it from the queue.
                id: 0,
                assetA: "",
                assetB: ""
            };

            let dateForPath;

            let filePath;


            const FIRST_TRADE_RECORD_ID = -1;
            const UNKNOWN_TRADE_RECORD_ID = -2;

            let tradesWithHole = [];         // File content of the file where a hole was discovered.

            let currentTradeId;         // This points to the last Trade Id that is ok.
            let currentDatetime;        // This points to the last Trade datetime that is ok.

            /* The next 3 variables hold the information read from varios Status Reports. */

            let lastLiveTradeFile;      // Datetime of the last complete trades file written by the Live Trades process.
            let lastHistoricTradeFile;  // Datatime of the last trades file written by the Historic Trades process.
            let lastCandleFile;     // Datetime of the last file certified by the Hole Fixing process as without permanent holes.

            /* The next 4 variables hold the results of the search of the next hole. */

            let holeInitialId;          // This is the Id just before the hole.
            let holeInitialDatetime;    // This is the Datetime just before the hole.

            let holeFinalId;            // This is the Id just after the hole.
            let holeFinalDatetime;      // This is the Datetime just after the hole.

            let holeFixingStatusReport; // Current hole Fixing Status Report.

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

                    currentDate = new Date();
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

            The following code executes for each market, trying to fix the hole in trades history.

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

                        reportFilePath = EXCHANGE_NAME + "/Processes/" + "Hiistoric-Trades";

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

                        cahrlyAzureFileStorage.getTextFile(reportFilePath, fileName, onStatusReportReceived, true);

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

                                if (holeFixingStatusReport.monthChecked === true) {

                                    lastFileWithoutHoles = new Date();  // We need this with a valid value.
                                    getOneMinDailyCandles();

                                } else {

                                    /*

                                    If the hole report is incomplete, we are only interested if we are at the head of the market.
                                    Otherwise, we are not going to calculate the candles of a month which was not fully checked for holes.

                                    */

                                    if (atHeadOfMarket === true) {

                                        lastFileWithoutHoles = new Date(statusReport.lastFile.year + "-" + statusReport.lastFile.month + "-" + statusReport.lastFile.days + " " + statusReport.lastFile.hours + ":" + statusReport.lastFile.minutes + GMT_SECONDS);
                                        getOneMinDailyCandles();

                                    } else {

                                        const logText = "[INFO] 'getStatusReport' - The current year / month was not completely hole-fixed for market " + market.assetA + '_' + market.assetB + " . Skipping it. ";
                                        logger.write(logText);

                                        closeAndOpenMarket();

                                    }
                                }
                            }
                        }
                    }

                    function getOneMinDailyCandles() {

                        /* If the process run and was interrupted, there should be a status report that allows us to resume execution. */

                        reportFilePath = EXCHANGE_NAME + "/Processes/" + "One-Min-Daily-Candles" + "/" + year + "/" + month;

                        bruceAzureFileStorage.getTextFile(reportFilePath, fileName, onStatusReportReceived, true);

                        function onStatusReportReceived(text) {

                            let statusReport;

                            try {

                                statusReport = JSON.parse(text);

                                lastCandleFile = new Date(statusReport.lastFile.year + "-" + statusReport.lastFile.month + "-" + statusReport.lastFile.days + " " + statusReport.lastFile.hours + ":" + statusReport.lastFile.minutes + GMT_SECONDS);
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

            function buildCandles() {

                /*

                Here we are going to scan the trades files packing them in candles files every one day.
                We need for this the last close value, bacause all candles that are empty of trades at the begining, they need to
                have a valid open and close value. This was previously calculated before arriving to this function.

                */

                nextCandleFile();

                function nextCandleFile() {

                    lastCandleFile = new Date(lastCandleFile.valueOf() + ONE_DAY_IN_MILISECONDS);

                    let date = new Date(lastCandleFile.valueOf() - 60 * 1000);

                    let candles = [];
                    let volumes = [];

                    let lastCandle = {
                        open: lastCandleClose,
                        close: lastCandleClose,
                        min: lastCandleClose,
                        max: lastCandleClose,
                        begin: 0,
                        end: 0,
                        buy: 0,
                        sell: 0
                    };

                    nextDate();

                    function nextDate() {

                        date = new Date(date.valueOf() + 60 * 1000);

                        /* Check if we are outside the current Day / File */

                        if (date.getUTCDate() !== lastCandleFile.getUTCDate()) {

                            writeFiles(candles, volumes, true, onFilesWritten);

                            return;

                            function onFilesWritten() {

                                nextCandleFile();

                            }

                        }

                        /* Check if we are outside the currrent Month */

                        if (date.getUTCMont() + 1 !== month) {

                            writeStatusReport(lastCandleFile, true, onStatusReportWritten);

                            return;

                            function onStatusReportWritten() {

                                const logText = "[ERR] 'buildCandles' - Finishing processing the whole month for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                logger.write(logText);

                                closeAndOpenMarket();

                            }
                        }

                        /* Check if we have past the most recent hole fixed file */

                        if (date.valueOf() > lastFileWithoutHoles.valueOf()) {

                            writeFiles(candles, volumes, false, onFilesWritten);

                            return;

                            function onFilesWritten() {

                                const logText = "[ERR] 'buildCandles' - Head of the market reached for market " + market.assetA + '_' + market.assetB + " . ";
                                logger.write(logText);

                                closeAndOpenMarket();

                            }
                        }
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
                                    open: lastCandle.close,
                                    close: lastCandle.close,
                                    min: lastCandle.close,
                                    max: lastCandle.close,
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

                                if (tradesFile.length > 0) {

                                    /* Candle open and close Calculations */

                                    candle.open = tradesFile[0][2];
                                    candle.close = tradesFile[tradesFile.length - 1][2];

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

                                lastCandle = candle;

                                volumes.push(volume);

                            } catch (err) {

                                const logText = "[ERR] 'buildCandles' - Empty or corrupt trade file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                logger.write(logText);

                                closeAndOpenMarket();
                            }
                        }
                    }
                }
            }




            function tradesReadyToBeSaved(tradesRequested) {

                try {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'tradesReadyToBeSaved'");
                    }

                    nextIntervalExecution = true; // When there is at least one hole, we activate this flag to get an extra Interval execution when this one ends.

                    /*

                    We have learnt that the records from the exchange dont always come in the right order, sorted by TradeId. That means the we need to sort them
                    by ourselves if we want that our verification of holes work. 

                    */

                    let iterations = tradesRequested.length;

                    for (let i = 0; i < iterations; i++) {

                        for (let j = 0; j < iterations - 1; j++) {

                            if (tradesRequested[j].tradeID < tradesRequested[j + 1].tradeID) {

                                let trade = tradesRequested[j + 1];

                                tradesRequested.splice(j + 1, 1); // Remove that trade from the array.

                                tradesRequested.splice(j, 0, trade); // Insert the trade removed.


                            }

                        }

                    }

                    /*

                    The trades received from the exchange might or might not be enough to fix the hole. We wont worry about that at this point. We will simple record the trades received
                    in the range where records where missing.

                    We only have to take into account that the lowest id we have is already on a file that exist and it is partially verified, so we have to be carefull to overwrite this file
                    without introducing new holes. 

                    */

                    let fileRecordCounter = 0;

                    let needSeparator;
                    let separator;

                    let lastProcessMinute;  // Stores the previous record minute during each iteration
                    let filesToSave = [];   // Array where we will store all the content to be written to files

                    needSeparator = false;

                    let fileContent = "";

                    let currentProcessMinute = Math.trunc(holeFinalDatetime.valueOf() / 1000 / 60); // Number of minutes since the begining of time, where the process is pointing to.
                    let holeStartsMinute = Math.trunc(holeInitialDatetime.valueOf() / 1000 / 60); // Number of minutes since the begining of time, where the hole started.

                    /* We will iterate through all the records received from the exchange. We know Poloniex sends the older records first, so this is going to be going back in time as we advance. */

                    for (let i = 0; i < tradesRequested.length; i++) {

                        let record = tradesRequested[i];

                        const trade = {
                            tradeIdAtExchange: record.tradeID,
                            marketIdAtExchange: record.globalTradeID,
                            type: record.type,
                            rate: record.rate,
                            amountA: record.total,
                            amountB: record.amount,
                            datetime: new Date(record.date + GMT_MILI_SECONDS)
                        };

                        trade.seconds = trade.datetime.getUTCSeconds();

                        let currentRecordMinute = Math.trunc(trade.datetime.valueOf() / 1000 / 60);  // This are the number of minutes since the begining of time of this trade.

                        if (currentRecordMinute > currentProcessMinute) {

                            /* We discard this trade, since it happened after the minute we want to record in the current file. */

                            continue;
                        }

                        if (currentRecordMinute < currentProcessMinute) {

                            /* 

                            The information is older that the current time.
                            We must store the current info and reset the pointer to the current time to match the one on the information currently being processd.
                            We know this can lead to a 'hole' or some empty files being skipped, but we solve that problem with the next loop.

                            */

                            let blackMinutes = currentProcessMinute - currentRecordMinute;

                            for (let j = 1; j <= blackMinutes; j++) {

                                storeFileContent();
                                currentProcessMinute--;

                            }
                        }

                        if (currentRecordMinute === currentProcessMinute) {

                            if (needSeparator === false) {

                                needSeparator = true;
                                separator = '';

                            } else {
                                separator = ',';
                            }

                            if (trade.tradeIdAtExchange > holeInitialId) {

                                /* We only add trades with ids bigger that the last id verified without holes. */

                                fileContent = '[' + trade.tradeIdAtExchange + ',"' + trade.type + '",' + trade.rate + ',' + trade.amountA + ',' + trade.amountB + ',' + trade.seconds + ']' + separator + fileContent;

                                fileRecordCounter++;

                            }
                        }
                    }

                    if (fileContent !== "") {

                        /* 

                        Usually the last file Content must be discarded since it could belong to an incomplete file. But there is one exception: it a hole is found at a file and the previous minute is empty
                        then this will produce the exception in which the fileContent needs to saved. To figure out if we are in this situation we do the following:

                        */

                        if (currentProcessMinute === holeStartsMinute) {

                            storeFileContent();

                        }


                    }

                    function storeFileContent() {

                        let existingFileContent = "";
                        let separator = "";

                        if (currentProcessMinute === holeStartsMinute) {

                            /*

                            Here we are at the situation that the content already generated has to be added to the content already existing on the file where the hole was found.

                            */

                            for (let i = 0; i < tradesWithHole.length; i++) {

                                if (tradesWithHole[i][0] <= holeInitialId && tradesWithHole[i][0] !== 0) { // 0 because of the empty trade record signaling an incomplete file.

                                    /* We only add trades with ids smallers that the last id verified without holes. */

                                    existingFileContent = existingFileContent + separator + '[' + tradesWithHole[i][0] + ',"' + tradesWithHole[i][1] + '",' + tradesWithHole[i][2] + ',' + tradesWithHole[i][3] + ',' + tradesWithHole[i][4] + ',' + tradesWithHole[i][5] + ']';

                                    fileRecordCounter++;

                                    if (separator === "") {

                                        separator = ",";

                                    }
                                }
                            }
                        }

                        if (existingFileContent === "") {

                            fileContent = '[' + fileContent + ']';

                        } else {

                            if (fileContent === "") {

                                fileContent = '[' + existingFileContent + ']';

                            } else {

                                fileContent = '[' + existingFileContent + "," + fileContent + ']';
                            }
                        }

                        let fileRecord = {
                            datetime: currentProcessMinute,
                            content: fileContent,
                            records: fileRecordCounter
                        };

                        filesToSave.push(fileRecord);

                        fileRecordCounter = 0;
                        needSeparator = false;
                        fileContent = "";
                    }

                    /*

                    Now it is time to process all the information we stored at filesToSave.

                    */

                    let i = 0;
                    let date;

                    nextRecord();

                    function nextRecord() {

                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        date = new Date(filesToSave[i].datetime * 60 * 1000);
                        fileRecordCounter = filesToSave[i].records;
                        fileContent = filesToSave[i].content;

                        dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);

                        filePath = EXCHANGE_NAME + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPath;

                        utilities.createFolderIfNeeded(filePath, azureFileStorage, onFolderCreated);

                        function onFolderCreated() {

                            azureFileStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                console.log(logText);
                                logger.write(logText);

                                controlLoop();
                            }
                        }
                    }

                    
                    function controlLoop() {

                        i++;

                        if (i < filesToSave.length) {

                            nextRecord();

                        } else {

                            if (LOG_INFO === true) {
                                logger.write("[INFO] Leaving function 'tradesReadyToBeSaved'");
                            }

                            writeStatusReport(undefined, undefined, false, false, onStatusReportWritten);

                            function onStatusReportWritten() {

                                closeAndOpenMarket();

                            }

                        }
                    }
                }
                catch (err) {
                    const logText = "[ERROR] 'tradesReadyToBeSaved' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }
            }

            function writeStatusReport(lastTradeDatetime, lastTradeId, monthChecked, atHeadOfMarket, callBack) {

                /*

                If no parameters are provided, that means that last good information is the begining of the hole. If they are provided is because no hole was detected until the
                forward end of the market.

                */

                if (LOG_INFO === true) {
                    logger.write("[INFO] Entering function 'writeStatusReport'");
                }

                if (lastTradeId === undefined) {

                    lastTradeId = holeInitialId;
                    lastTradeDatetime = holeInitialDatetime;

                }

                let lastFileWithoutHoles = new Date(lastTradeDatetime.valueOf() - 60 * 1000); // It is the previous file where the last verified trade is.

                try {

                    let reportFilePath = EXCHANGE_NAME + "/Processes/" + bot.process + "/" + year + "/" + month;

                    utilities.createFolderIfNeeded(reportFilePath, azureFileStorage, onFolderCreated);

                    function onFolderCreated() {

                        try {

                            /*

                            Here we will calculate the "counter". The counter keeps track of how many times the process tried to fix the same hole. This allows
                            the process to know when a hole is not fixable. To do that we need to compre the current status report with the information we ve got
                            about the hole. If it is the same, we add to the counter.

                            */

                            let counter = 0;

                            try {

                                if (holeFixingStatusReport.lastTrade.id === lastTradeId) {

                                    counter = holeFixingStatusReport.lastTrade.counter;

                                    if (counter === undefined) { counter = 0; }
                                    counter++;

                                }

                            } catch (err) { // we are here when the status report did not exist.

                                counter = 0;

                            }

                            let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                            let report = {
                                lastFile: {
                                    year: lastFileWithoutHoles.getUTCFullYear(),
                                    month: (lastFileWithoutHoles.getUTCMonth() + 1),
                                    days: lastFileWithoutHoles.getUTCDate(),
                                    hours: lastFileWithoutHoles.getUTCHours(),
                                    minutes: lastFileWithoutHoles.getUTCMinutes()
                                },
                                lastTrade: {
                                    year: lastTradeDatetime.getUTCFullYear(),
                                    month: (lastTradeDatetime.getUTCMonth() + 1),
                                    days: lastTradeDatetime.getUTCDate(),
                                    hours: lastTradeDatetime.getUTCHours(),
                                    minutes: lastTradeDatetime.getUTCMinutes(),
                                    seconds: lastTradeDatetime.getUTCSeconds(),
                                    id: lastTradeId,
                                    counter: counter
                                },
                                monthChecked: monthChecked,
                                atHeadOfMarket: atHeadOfMarket
                            };

                            let fileContent = JSON.stringify(report); 

                            azureFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onFileBCreated);

                            function onFileBCreated() {

                                if (LOG_INFO === true) {
                                    logger.write("[INFO] 'writeStatusReport' - Content written: " + fileContent);
                                }

                                /* 

                                If we are at the same month of the begining of the market, we need to create the main status report file.
                                We will re-create it even every time the month status report is created. When this month check finished, other months later
                                will update it.

                                */

                                if (processDate.getUTCMonth() === lastHistoricTradeFile.getUTCMonth() && processDate.getUTCFullYear() === lastHistoricTradeFile.getUTCFullYear()) {

                                    createMainStatusReport(lastTradeDatetime, lastTradeId, onMainReportCreated);

                                    function onMainReportCreated () {

                                        verifyMarketComplete(monthChecked, callBack);

                                    }

                                } else {

                                    verifyMarketComplete(monthChecked, callBack);

                                }

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

            function createMainStatusReport(lastTradeDatetime, lastTradeId,callBack) {
                try {

                    let reportFilePath = EXCHANGE_NAME + "/Processes/" + bot.process;

                    utilities.createFolderIfNeeded(reportFilePath, azureFileStorage, onFolderCreated);

                    function onFolderCreated() {

                        try {

                            let lastFileWithoutHoles = new Date(lastTradeDatetime.valueOf() - 60 * 1000); // It is the previous file where the last verified trade is.

                            let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                            let report = {
                                lastFile: {
                                    year: lastFileWithoutHoles.getUTCFullYear(),
                                    month: (lastFileWithoutHoles.getUTCMonth() + 1),
                                    days: lastFileWithoutHoles.getUTCDate(),
                                    hours: lastFileWithoutHoles.getUTCHours(),
                                    minutes: lastFileWithoutHoles.getUTCMinutes()
                                },
                                lastTrade: {
                                    year: lastTradeDatetime.getUTCFullYear(),
                                    month: (lastTradeDatetime.getUTCMonth() + 1),
                                    days: lastTradeDatetime.getUTCDate(),
                                    hours: lastTradeDatetime.getUTCHours(),
                                    minutes: lastTradeDatetime.getUTCMinutes(),
                                    seconds: lastTradeDatetime.getUTCSeconds(),
                                    id: lastTradeId
                                }
                            };

                            let fileContent = JSON.stringify(report);

                            azureFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onFileBCreated);

                            function onFileBCreated() {

                                if (LOG_INFO === true) {
                                    logger.write("[INFO] 'createMainStatusReport' - Content written: " + fileContent);
                                }

                                callBack();

                            }

                        }
                        catch (err) {
                            const logText = "[ERROR] 'createMainStatusReport - onFolderCreated' - ERROR : " + err.message;
                            logger.write(logText);
                            closeMarket();
                        }
                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'createMainStatusReport' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }
            }

            function verifyMarketComplete(isMonthComplete, callBack) {

                if (isMonthComplete === true) {

                    logger.write("[INFO] 'writeStatusReport' - verifyMarketComplete - Month Completed !!! ");

                    /*
 
                    The mission of this function is to update the main status report. This report contains the date of the last file sucessfully checked
                    but in a consecutive way.

                    For example: if the market starts in March, and March, April and June are checked, then the file will be the last of June even if September is also checked.
 
                    */

                    let initialYear;
                    let initialMonth;

                    let finalYear = (new Date()).getUTCFullYear();
                    let finalMonth = (new Date()).getUTCMonth() + 1;

                    let reportFilePath = EXCHANGE_NAME + "/Processes/" + bot.process;
                    let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                    /* Lets read the main status report */

                    azureFileStorage.getTextFile(reportFilePath, fileName, onFileReceived, true);

                    function onFileReceived(text) {

                        if (text === undefined) {

                            /* The first month of the market didnt create this file yet. Aborting verification. */

                            logger.write("[INFO] 'writeStatusReport' - verifyMarketComplete - Verification ABORTED since the main status report does not exist. ");

                            callBack();

                        } else {

                            let statusReport = JSON.parse(text);

                            initialYear = statusReport.lastFile.year;
                            initialMonth = statusReport.lastFile.month;

                            loopCycle();
                        }

                    }

                    function loopCycle() {

                        /*

                        Here we read the status report file of each month / year to verify if it is complete or not.

                        */
                        let paddedInitialMonth = utilities.pad(initialMonth, 2);

                        let reportFilePath = EXCHANGE_NAME + "/Processes/" + bot.process + "/" + initialYear + "/" + paddedInitialMonth;
                        let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                        azureFileStorage.getTextFile(reportFilePath, fileName, onStatusReportFileReceived, true);

                        function onStatusReportFileReceived(text) {

                            if (text === undefined) {

                                /* If any of the files do not exist, it means that the continuity has ben broken and this checking procedure must be aborted */

                                logger.write("[INFO] 'writeStatusReport' - verifyMarketComplete - Verification ABORTED  since the status report for year  " + initialYear + " and month " + initialMonth + " did not exist. ");

                                callBack();

                            } else {

                                let statusReport = JSON.parse(text);

                                if (statusReport.monthChecked === true) {

                                    readAndWriteNewReport(statusReport);

                                } else {

                                    /* If any of the files says that month is not checked then it is enough to know the market continuity is broken. */

                                    logger.write("[INFO] 'writeStatusReport' - verifyMarketComplete - Verification ABORTED since the status report for year  " + initialYear + " and month " + initialMonth + " is not hole checked. ");

                                    callBack();

                                }
                            }
                        }
                    }



                    function readAndWriteNewReport(monthlyStatusReport) {

                        /* We will read the current file to preserve its data, and save it again with the new lastFile */

                        let reportFilePath = EXCHANGE_NAME + "/Processes/" + bot.process;
                        let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                        azureFileStorage.getTextFile(reportFilePath, fileName, onFileReceived, true);

                        function onFileReceived(text) {

                            let statusReport = JSON.parse(text);

                            /*

                            Only if the last trade ID of the month being evaluated is bigger the trade Id at the status report we do replace it, otherwise not.

                            */

                            if (monthlyStatusReport.lastTrade.id > statusReport.lastTrade.id) {

                                statusReport.lastFile = monthlyStatusReport.lastFile;
                                statusReport.lastTrade = monthlyStatusReport.lastTrade;
                                statusReport.lastTrade.counter = undefined;

                                let fileContent = JSON.stringify(statusReport);

                                azureFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onMasterFileCreated);

                                function onMasterFileCreated() {

                                    logger.write("[INFO] 'writeStatusReport' - verifyMarketComplete - Main Status Report Updated - Content written: " + fileContent);

                                    loop();  // Lets see the next month.

                                }

                            } else {

                                logger.write("[INFO] 'writeStatusReport' - verifyMarketComplete - Main Status Report Not Updated since current Trade Id (" + monthlyStatusReport.lastTrade.id + ") is <= than Id at main status report file. (" + statusReport.lastTrade.id + ")" );

                                loop();  // Lets see the next month.

                            } 
                        }
                    }


                    function loop() {

                        initialMonth++;

                        if (initialMonth > 12) {

                            initialMonth = 1;
                            initialYear++;

                        }

                        if ((initialYear === finalYear && initialMonth > finalMonth) || (initialYear > finalYear)) {

                            /* We arrived to the point where we have checked all the status reports of every month and they are all complete. */

                            logger.write("[INFO] 'writeStatusReport' - verifyMarketComplete - Verification Finished. ");

                            callBack();

                            return;
                        }

                        loopCycle();

                    }

                } else {

                    logger.write("[INFO] 'writeStatusReport' - verifyMarketComplete - Verification ABORTED: Month is not checked. ");
                    callBack();

                }

            }




        }
        catch (err) {
            const logText = "[ERROR] 'Start' - ERROR : " + err.message;
            logger.write(logText);
        }
    }
};
