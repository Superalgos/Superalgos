exports.newInterval = function newInterval(BOT, UTILITIES, AZURE_FILE_STORAGE, DEBUG_MODULE, MARKETS_MODULE, POLONIEX_CLIENT_MODULE) {

    let bot = BOT;

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
    const FORCE_MARKET = 2;     // This allows to debug the execution of an specific market. Not intended for production. *

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    interval = {
        initialize: initialize,
        start: start
    };

    let markets;

    let charlyAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);
    let oliviaAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);
    let tomAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);

    let utilities = UTILITIES.newUtilities(bot);

    return interval;

    function initialize(yearAssigend, monthAssigned, callBackFunction) {

        try {

            /* IMPORTANT NOTE:

            We are ignoring in this Interval the received Year and Month. This interval is not depending on Year Month since it procecess the whole market at once.

            */

            logger.fileName = MODULE_NAME;

            const logText = "[INFO] initialize - Entering function 'initialize' ";
            console.log(logText);
            logger.write(logText);

            charlyAzureFileStorage.initialize("Charly");
            oliviaAzureFileStorage.initialize("Olivia");
            tomAzureFileStorage.initialize("Tom");

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
    
    Read the candles and volumes from Olivia and produce for each market two files with candles stairs and volumes stairs respectively.
    
    */

    function start(callBackFunction) {

        try {

            if (LOG_INFO === true) {
                logger.write("[INFO] Entering function 'start'");
            }

            let nextIntervalExecution = false; // This tell weather the Interval module will be executed again or not. By default it will not unless some hole have been found in the current execution.
            let nextIntervalLapse;             // With this we can request the next execution wait time. 

            let marketQueue;            // This is the queue of all markets to be procesesd at each interval.
            let market = {              // This is the current market being processed after removing it from the queue.
                id: 0,
                assetA: "",
                assetB: ""
            };

            let periods =
                '[' +
                '[' + 45 * 60 * 1000 + ',' + '"45-min"' + ']' + ',' +
                '[' + 40 * 60 * 1000 + ',' + '"40-min"' + ']' + ',' +
                '[' + 30 * 60 * 1000 + ',' + '"30-min"' + ']' + ',' +
                '[' + 20 * 60 * 1000 + ',' + '"20-min"' + ']' + ',' +
                '[' + 15 * 60 * 1000 + ',' + '"15-min"' + ']' + ',' +
                '[' + 10 * 60 * 1000 + ',' + '"10-min"' + ']' + ',' +
                '[' + 05 * 60 * 1000 + ',' + '"05-min"' + ']' + ',' +
                '[' + 04 * 60 * 1000 + ',' + '"04-min"' + ']' + ',' +
                '[' + 03 * 60 * 1000 + ',' + '"03-min"' + ']' + ',' +
                '[' + 02 * 60 * 1000 + ',' + '"02-min"' + ']' + ',' +
                '[' + 01 * 60 * 1000 + ',' + '"01-min"' + ']' + ']';

            const outputPeriods = JSON.parse(periods);

            /* One of the challenges of this process is that each imput file contains one day of candles. So if a stair spans more than one day
            then we dont want to break the stais in two pieces. What we do is that we read to candles files at the time and record at the current
            date all stairs of the day plus the ones thas spans to the second day without bigining at the second day. Then when we process the next
            day, we must remember where the last stairs of each type endded, so as not to create overlapping stairs in the current day. These next
            3 variables are stored at the status report and they are to remember where the last staris ended. */

            let lastCandleStairEnd;
            let lastVolumeBuyEnd;
            let lastVolumeSellEnd;

            let currentCandleStairEnd;
            let currentVolumeBuyEnd;
            let currentVolumeSellEnd;

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

                        callBackFunction(nextIntervalExecution, nextIntervalLapse);

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

                        buildStairs();

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

                        We need to know where is the begining of the market, since that will help us know where the Index Files should start. 

                        */

                        reportFilePath = EXCHANGE_NAME + "/Processes/" + "Poloniex-Historic-Trades";

                        charlyAzureFileStorage.getTextFile(reportFilePath, fileName, onStatusReportReceived, true);

                        function onStatusReportReceived(text) {

                            let statusReport;

                            try {

                                statusReport = JSON.parse(text);

                                firstTradeFile = new Date(statusReport.lastFile.year + "-" + statusReport.lastFile.month + "-" + statusReport.lastFile.days + " " + statusReport.lastFile.hours + ":" + statusReport.lastFile.minutes + GMT_SECONDS);

                                getThisProcessReport();

                            } catch (err) {

                                const logText = "[INFO] 'getStatusReport' - Failed to read main Historic Trades Status Report for market " + market.assetA + '_' + market.assetB + " . Skipping it. ";
                                logger.write(logText);

                                closeAndOpenMarket();
                            }
                        }
                    }

                    function getThisProcessReport() {

                        /* If the process run and was interrupted, there should be a status report that allows us to resume execution. */

                        reportFilePath = EXCHANGE_NAME + "/Processes/" + bot.process;

                        oliviaAzureFileStorage.getTextFile(reportFilePath, fileName, onStatusReportReceived, true);

                        function onStatusReportReceived(text) {

                            let statusReport;
                            let lastCandleFile;

                            try {

                                statusReport = JSON.parse(text);

                                lastCandleFile = new Date(statusReport.lastFile.year + "-" + statusReport.lastFile.month + "-" + statusReport.lastFile.days + " " + "00:00" + GMT_SECONDS);

                                let lastCandleStairEnd;
                                let lastVolumeBuyEnd;
                                let lastVolumeSellEnd;

                                buildCandles(lastCandleFile);

                            } catch (err) {

                                /*

                                It might happen that the file content is corrupt or it does not exist. In either case we will point our lastCandleFile
                                to the begining of the market.

                                */

                                lastCandleFile = new Date(firstTradeFile.getUTCFullYear() + "-" + (firstTradeFile.getUTCMonth() + 1) + "-" + firstTradeFile.getUTCDate() + " " + "00:00" + GMT_SECONDS);

                                buildCandles(lastCandleFile);

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

            function buildStairs(lastCandleFile) {

                let n;
                let currentDay = lastCandleFile;
                let nextDay;

                advanceTime();

                function advanceTime() {

                    currentDay = new Date(currentDay.valueOf() + ONE_DAY_IN_MILISECONDS);
                    nextDay = new Date(currentDay.valueOf() + ONE_DAY_IN_MILISECONDS);

                    const logText = "[INFO] New current day @ " + currentDay.getUTCFullYear() + "/" + (currentDay.getUTCMonth() + 1) + "/" + currentDay.getUTCDate() + ".";
                    console.log(logText);
                    logger.write(logText);

                    /* Validation that we are not going past the head of the market. */

                    if (currentDay.valueOf() > maxCandleFile.valueOf()) {

                        nextIntervalExecution = true;  // we request a new interval execution.

                        const logText = "[INFO] 'buildStairs' - Head of the market found @ " + currentDay.getUTCFullYear() + "/" + (currentDay.getUTCMonth() + 1) + "/" + currentDay.getUTCDate() + ".";
                        logger.write(logText);

                        closeAndOpenMarket();

                        return;

                    }

                    periodsLoop();

                }

                function periodsLoop() {

                    /*
    
                    We will iterate through all posible periods.
    
                    */

                    n = 0   // loop Variable representing each possible period as defined at the periods array.

                    loopBody();


                }

                function loopBody() {

                    const outputPeriod = outputPeriods[n][0];
                    const folderName = outputPeriods[n][1];

                    processCandles();

                    function processCandles() {

                        let candles = [];
                        let stairsArray = [];
                        let currentDayFile;
                        let nextDayFile;

                        function getCurrentDayFile() {

                            let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"
                            let filePath = EXCHANGE_NAME + "/Output/" + CANDLES_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + folderName + "/" + dateForPath;

                            oliviaAzureFileStorage.getTextFile(filePath, fileName, onCurrentDayFileReceived, true);

                            function onCurrentDayFileReceived(text) {

                                try {

                                    currentDayFile = JSON.parse(text);
                                    getNextDayFile()

                                } catch (err) {

                                    const logText = "[ERR] 'processCandles - getCurrentDayFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                    logger.write(logText);

                                    closeAndOpenMarket();

                                    nextIntervalExecution = true;  // we request a new interval execution.
                                    nextIntervalLapse = 30000;

                                    return;
                                }
                            }
                        }

                        function getNextDayFile() {

                            let dateForPath = nextDay.getUTCFullYear() + '/' + utilities.pad(nextDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(nextDay.getUTCDate(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"
                            let filePath = EXCHANGE_NAME + "/Output/" + CANDLES_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + folderName + "/" + dateForPath;

                            oliviaAzureFileStorage.getTextFile(filePath, fileName, onCurrentDayFileReceived, true);

                            function onCurrentDayFileReceived(text) {

                                try {

                                    nextDayFile = JSON.parse(text);
                                    buildCandles();

                                } catch (err) {

                                    if (nextDay.valueOf() > maxCandleFile.valueOf()) {

                                        nextDayFile = [];  // we are past the head of the market, then no worries if this file is non existent.
                                        buildCandles();

                                    } else {

                                        const logText = "[ERR] 'processCandles - getNextDayFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                        logger.write(logText);

                                        closeAndOpenMarket();

                                        nextIntervalExecution = true;  // we request a new interval execution.
                                        nextIntervalLapse = 30000;

                                        return;
                                    }
                                }
                            }
                        }

                        function buildCandles() {

                            pushCandles(currentDayFile);
                            pushCandles(nextDayFile);
                            findCandleStairs();

                            function pushCandles(candlesFile) {

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
                            }

                        }

                        function findCandleStairs() {

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

                                        /* As we are using two consecutives days of candles, we do want to include stairs that spans from the first
                                        day to the second, but we do not want to include stairs that begins on the second day, since thos are to be
                                        included when time advances one day. */

                                        if (stairs.begin < nexDay.valueOf()) {

                                            /* Also, we dont want to include stairs that started in the previous day. To detect that we use the date
                                            that we recorded on the Status Report with the end of the last stair of the previous day. */

                                            if (stairs.begin > lastCandleStairEnd.valueOf()) {

                                                stairsArray.push(stairs);
                                                currentCandleStairEnd = stairs.end;
                                                stairs = undefined;

                                            }
                                        }
                                    }
                                }
                            }

                            writeCandleStairsFile();
                        }

                        function writeCandleStairsFile() {

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

                            let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                            let fileName = '' + market.assetA + '_' + market.assetB + '.json';
                            let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + CANDLES_FOLDER_NAME + "/" + bot.process + "/" + folderName + "/"  + dateForPath;

                            utilities.createFolderIfNeeded(filePath, tomAzureFileStorage, onFolderCreated);

                            function onFolderCreated() {

                                tomAzureFileStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                                function onFileCreated() {

                                    const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                    console.log(logText);
                                    logger.write(logText);

                                    processVolumes();
                                }
                            }
                        }

                    }

                    function processVolumes() {

                        let volumes = [];
                        let stairsArray = [];
                        let currentDayFile;
                        let nextDayFile;

                        function getCurrentDayFile() {

                            let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"
                            let filePath = EXCHANGE_NAME + "/Output/" + VOLUMES_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + folderName + "/" + dateForPath;

                            oliviaAzureFileStorage.getTextFile(filePath, fileName, onCurrentDayFileReceived, true);

                            function onCurrentDayFileReceived(text) {

                                try {

                                    currentDayFile = JSON.parse(text);
                                    getNextDayFile()

                                } catch (err) {

                                    const logText = "[ERR] 'processVolumes - getCurrentDayFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                    logger.write(logText);

                                    closeAndOpenMarket();

                                    nextIntervalExecution = true;  // we request a new interval execution.
                                    nextIntervalLapse = 30000;

                                    return;
                                }
                            }
                        }

                        function getNextDayFile() {

                            let dateForPath = nextDay.getUTCFullYear() + '/' + utilities.pad(nextDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(nextDay.getUTCDate(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"
                            let filePath = EXCHANGE_NAME + "/Output/" + VOLUMES_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + folderName + "/" + dateForPath;

                            oliviaAzureFileStorage.getTextFile(filePath, fileName, onCurrentDayFileReceived, true);

                            function onCurrentDayFileReceived(text) {

                                try {

                                    nextDayFile = JSON.parse(text);
                                    buildVolumes();

                                } catch (err) {

                                    if (nextDay.valueOf() > maxCandleFile.valueOf()) {

                                        nextDayFile = [];  // we are past the head of the market, then no worries if this file is non existent.
                                        buildVolumes();

                                    } else {

                                        const logText = "[ERR] 'processVolumes - getNextDayFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                        logger.write(logText);

                                        closeAndOpenMarket();

                                        nextIntervalExecution = true;  // we request a new interval execution.
                                        nextIntervalLapse = 30000;

                                        return;
                                    }
                                }
                            }
                        }

                        function buildVolumes() {

                            pushVolumes(currentDayFile);
                            pushVolumes(nextDayFile);
                            findVolumesStairs();

                            function pushVolumes(volumesFile) {

                                for (let i = 0; i < currentDay.length; i++) {

                                    let volume = {
                                        amountBuy: 0,
                                        amountSell: 0,
                                        begin: undefined,
                                        end: undefined
                                    };

                                    volume.amountBuy = currentDay[i][0];
                                    volume.amountSell = currentDay[i][1];

                                    volume.begin = currentDay[i][2];
                                    volume.end = currentDay[i][3];

                                    volumes.push(volume);

                                }
                            }
                        }

                        function findVolumesStairs() {

                            /* Finding stairs */

                            let buyUpStairs;
                            let buyDownStairs;

                            let sellUpStairs;
                            let sellDownStairs;

                            for (let i = 0; i < volumes.length - 1; i++) {

                                let currentVolume = volumes[i];
                                let nextVolume = volumes[i + 1];


                                /* buy volume going up */

                                if (currentVolume.amountBuy < nextVolume.amountBuy) {

                                    if (buyUpStairs === undefined) {

                                        buyUpStairs = {
                                            type: undefined,
                                            begin: undefined,
                                            end: undefined,
                                            direction: undefined,
                                            barsCount: 0,
                                            firstAmount: 0,
                                            lastAmount: 0
                                        };

                                        buyUpStairs.type = 'buy';
                                        buyUpStairs.direction = 'up';
                                        buyUpStairs.barsCount = 2;

                                        buyUpStairs.begin = currentVolume.begin;
                                        buyUpStairs.end = nextVolume.end;

                                        buyUpStairs.firstAmount = currentVolume.amountBuy;
                                        buyUpStairs.lastAmount = nextVolume.amountBuy;

                                    } else {

                                        buyUpStairs.barsCount++;
                                        buyUpStairs.end = nextVolume.end;
                                        buyUpStairs.lastAmount = nextVolume.amountBuy;

                                    }

                                } else {

                                    if (buyUpStairs !== undefined) {

                                        if (buyUpStairs.barsCount > 2) {

                                            pushToArray(buyUpStairs);
                                        }

                                        buyUpStairs = undefined;
                                    }
                                }

                                /* buy volume going down */

                                if (currentVolume.amountBuy > nextVolume.amountBuy) {

                                    if (buyDownStairs === undefined) {

                                        buyDownStairs = {
                                            type: undefined,
                                            begin: undefined,
                                            end: undefined,
                                            direction: undefined,
                                            barsCount: 0,
                                            firstAmount: 0,
                                            lastAmount: 0
                                        };

                                        buyDownStairs.type = 'buy';
                                        buyDownStairs.direction = 'down';
                                        buyDownStairs.barsCount = 2;

                                        buyDownStairs.begin = currentVolume.begin;
                                        buyDownStairs.end = nextVolume.end;

                                        buyDownStairs.firstAmount = currentVolume.amountBuy;
                                        buyDownStairs.lastAmount = nextVolume.amountBuy;

                                    } else {

                                        buyDownStairs.barsCount++;
                                        buyDownStairs.end = nextVolume.end;
                                        buyDownStairs.lastAmount = nextVolume.amountBuy;

                                    }

                                } else {

                                    if (buyDownStairs !== undefined) {

                                        if (buyDownStairs.barsCount > 2) {

                                            pushToArray(buyDownStairs);
                                        }

                                        buyDownStairs = undefined;
                                    }
                                }

                                /* sell volume going up */

                                if (currentVolume.amountSell < nextVolume.amountSell) {

                                    if (sellUpStairs === undefined) {

                                        sellUpStairs = {
                                            type: undefined,
                                            begin: undefined,
                                            end: undefined,
                                            direction: undefined,
                                            barsCount: 0,
                                            firstAmount: 0,
                                            lastAmount: 0
                                        };

                                        sellUpStairs.type = 'sell';
                                        sellUpStairs.direction = 'up';
                                        sellUpStairs.barsCount = 2;

                                        sellUpStairs.begin = currentVolume.begin;
                                        sellUpStairs.end = nextVolume.end;

                                        sellUpStairs.firstAmount = currentVolume.amountSell;
                                        sellUpStairs.lastAmount = nextVolume.amountSell;

                                    } else {

                                        sellUpStairs.barsCount++;
                                        sellUpStairs.end = nextVolume.end;
                                        sellUpStairs.lastAmount = nextVolume.amountSell;

                                    }

                                } else {

                                    if (sellUpStairs !== undefined) {

                                        if (sellUpStairs.barsCount > 2) {

                                            pushToArray(sellUpStairs);
                                        }

                                        sellUpStairs = undefined;
                                    }
                                }

                                /* sell volume going down */

                                if (currentVolume.amountSell > nextVolume.amountSell) {

                                    if (sellDownStairs === undefined) {

                                        sellDownStairs = {
                                            type: undefined,
                                            begin: undefined,
                                            end: undefined,
                                            direction: undefined,
                                            barsCount: 0,
                                            firstAmount: 0,
                                            lastAmount: 0
                                        };

                                        sellDownStairs.type = 'sell';
                                        sellDownStairs.direction = 'down';
                                        sellDownStairs.barsCount = 2;

                                        sellDownStairs.begin = currentVolume.begin;
                                        sellDownStairs.end = nextVolume.end;

                                        sellDownStairs.firstAmount = currentVolume.amountSell;
                                        sellDownStairs.lastAmount = nextVolume.amountSell;

                                    } else {

                                        sellDownStairs.barsCount++;
                                        sellDownStairs.end = nextVolume.end;
                                        sellDownStairs.lastAmount = nextVolume.amountSell;

                                    }

                                } else {

                                    if (sellDownStairs !== undefined) {

                                        if (sellDownStairs.barsCount > 2) {

                                            pushToArray(sellDownStairs);
                                        }

                                        sellDownStairs = undefined;
                                    }
                                }

                                function pushToArray(stairs) {

                                    if (stairs !== undefined) {

                                        /* As we are using two consecutives days of candles, we do want to include stairs that spans from the first
                                        day to the second, but we do not want to include stairs that begins on the second day, since those are to be
                                        included when time advances one day. */

                                        if (stairs.begin < nexDay.valueOf()) {

                                            /* Also, we dont want to include stairs that started in the previous day. To detect that we use the date
                                            that we recorded on the Status Report with the end of the last stair of the previous day. */

                                            /* Additional to that, there are two types of stais: buy and sell. */

                                            if (stairs.type === 'sell') {

                                                if (stairs.begin > lastVolumeSellEnd.valueOf()) {

                                                    stairsArray.push(stairs);
                                                    currentVolumeSellEnd = stairs.end;
                                                }

                                            } else {

                                                if (stairs.begin > lastVolumeBuyEnd.valueOf()) {

                                                    stairsArray.push(stairs);
                                                    currentVolumeBuyEnd = stairs.end;
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            writeVolumeStairsFile();
                        }

                        function writeVolumeStairsFile() {

                            let separator = "";
                            let fileRecordCounter = 0;

                            let fileContent = "";

                            for (i = 0; i < stairsArray.length; i++) {

                                let stairs = stairsArray[i];

                                fileContent = fileContent + separator + '[' +
                                    '"' + stairs.type + '"' + "," +
                                    stairs.begin + "," +
                                    stairs.end + "," +
                                    '"' + stairs.direction + '"' + "," +
                                    stairs.barsCount + "," +
                                    stairs.firstAmount + "," +
                                    stairs.lastAmount + "]";

                                if (separator === "") { separator = ","; }

                                fileRecordCounter++;

                            }

                            fileContent = "[" + fileContent + "]";

                            let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                            let fileName = '' + market.assetA + '_' + market.assetB + '.json';
                            let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + VOLUMES_FOLDER_NAME + "/" + bot.process + "/" + folderName + "/" + dateForPath;

                            utilities.createFolderIfNeeded(filePath, tomAzureFileStorage, onFolderCreated);

                            function onFolderCreated() {

                                tomAzureFileStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                                function onFileCreated() {

                                    const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                    console.log(logText);
                                    logger.write(logText);

                                    reportThisDay();
                                }
                            }
                        }
                    }

                    function reportThisDay() {

                        writeStatusReport(currentDay, controlLoop)

                    }
                }

                function controlLoop() {

                    n++;

                    if (n < outputPeriods.length) {

                        loopBody();

                    } else {

                        n = 0;
                        advanceTime();

                    }
                }

            }

            function writeStatusReport(currentDay, callBackFunction) {

                if (LOG_INFO === true) {
                    logger.write("[INFO] Entering function 'writeStatusReport'");
                }

                try {

                    let reportFilePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Processes/" + bot.process;

                    utilities.createFolderIfNeeded(reportFilePath, tomAzureFileStorage, onFolderCreated);

                    function onFolderCreated() {

                        try {

                            let lastFileDate = new Date();

                            let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                            let report = {
                                lastFile: {
                                    year: currentDay.getUTCFullYear(),
                                    month: (currentDay.getUTCMonth() + 1),
                                    days: currentDay.getUTCDate()
                                },
                                lastCandleStairEnd: currentCandleStairEnd,
                                lastVolumeBuyEnd: currentVolumeBuyEnd,
                                lastVolumeSellEnd: currentVolumeSellEnd
                            };

                            let fileContent = JSON.stringify(report);

                            tomAzureFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                if (LOG_INFO === true) {
                                    logger.write("[INFO] 'writeStatusReport' - Content written: " + fileContent);
                                }

                                callBackFunction();
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
