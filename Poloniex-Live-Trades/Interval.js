exports.newInterval = function newInterval(BOT) {

    let bot = BOT;
    const ROOT_DIR = '../';
    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';

    const MODULE_NAME = "Interval";
    const LOG_INFO = true;

    const EXCHANGE_NAME = "Poloniex";
    const EXCHANGE_ID = 1;

    const TRADES_FOLDER_NAME = "Trades";

    const GO_RANDOM = false;
    const FORCE_MARKET = 2;     // This allows to debug the execution of an specific market. Not intended for production. 
    const FORCED_INITIAL_TIME = undefined; //"2018-01-19 12:15:00.000 GMT+0000"

    const MARKETS_MODULE = require(ROOT_DIR + 'Markets');

    const POLONIEX_CLIENT_MODULE = require(ROOT_DIR + 'Poloniex API Client');

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
    let azureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);

    const UTILITIES = require(ROOT_DIR + 'Utilities');
    let utilities = UTILITIES.newUtilities(bot);

    return interval;

    function initialize(callBackFunction) {

        try {

            const logText = "[INFO] initialize - Entering function 'initialize' ";
            console.log(logText);
            logger.write(logText);

            azureFileStorage.initialize();

            markets = MARKETS_MODULE.newMarkets(bot);
            markets.initialize(callBackFunction);


        } catch (err) {

            const logText = "[ERROR] initialize - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);

        }
    }

/*

We are going to generate 2 files:

A. The first one will contain all the trades of the current minute and will be store in a folder that we will create for this if it does not exist.
This file will be incomplete, since we are at the current minute and some trades will happen after we retrieve the information from the exchange,
but this is not a problem, since the second file is going to fix this. This file is only usefull for viewing a partial candle as it is being built
at the end of the chart.

B. The second file will contain all the trades of the previous minute. It will be the definitive file the system will use.

Besides that, we are going to delete the A file of the previous minute, since it is not needed anymore after the B file is there.

FILE FORMAT
-----------

Array of records with this information:

1. Trade Id provided by the exchange.
2. Trade Type: "buy" or "sell"
3. Trade Rate: the rate of the transaction.
4. Amount Asset A
5. Amount Asset B
6. Time: Seconds and Milliseconds the trade happened. (the rest of the time and date whoever reads the file already know it since it is organized in folders according to this.)

*/

    function start() {

        try {

            let currentDate;    // This will hold the current datetime of each execution.
            let previousMinute; // This hold the current time minus 60 seconds.
            let marketQueue;    // This is the queue of all markets to be procesesd at each interval.
            let market = {      // This is the current market being processed after removing it from the queue.
                id: 0,
                assetA: "",
                assetB: ""
            };

            let dateForPathA;
            let dateForPathB;

            let filePathA;
            let filePathB;

            let reportFilePath = EXCHANGE_NAME + "/Processes/" + bot.process;

            let exchangeCallTime;

            marketsLoop(); 

            /*
    
            At every run, the process needs to loop through all the markets at this exchange.
            The problem is that we can not fire all the requests at once to the exchange or we would get banned.
            For that reason we create a queue with the markets to process and we do one at the time.
            The following functions marketsLoop(), openMarket(), closeMarket() and closeAndOpenMarket() controls the serialization of this processing.

            */

            function marketsLoop() {

                try {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'marketsLoop'");
                    }

                    if (FORCED_INITIAL_TIME !== undefined) {

                        currentDate = new Date(FORCED_INITIAL_TIME);

                    } else {

                        currentDate = new Date();

                    }

                    markets.getMarketsByExchange(EXCHANGE_ID, onMarketsReady);

                    function onMarketsReady(marketsArray) {

                        marketQueue = JSON.parse(marketsArray);

                        /*

                        First thing to do is to create the folders where all the files are going to be placed. This is done only once per market.

                        */

                        previousMinute = new Date(currentDate.valueOf() - 60000);

                        dateForPathA = currentDate.getUTCFullYear() + '/' + utilities.pad(currentDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDate.getUTCDate(), 2) + '/' + utilities.pad(currentDate.getUTCHours(), 2) + '/' + utilities.pad(currentDate.getUTCMinutes(), 2);
                        dateForPathB = previousMinute.getUTCFullYear() + '/' + utilities.pad(previousMinute.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousMinute.getUTCDate(), 2) + '/' + utilities.pad(previousMinute.getUTCHours(), 2) + '/' + utilities.pad(previousMinute.getUTCMinutes(), 2);

                        filePathA = EXCHANGE_NAME + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPathA;
                        filePathB = EXCHANGE_NAME + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPathB;

                        utilities.createFolderIfNeeded(filePathA, azureFileStorage, onFolderACreated);

                        function onFolderACreated() {

                            utilities.createFolderIfNeeded(filePathB, azureFileStorage, onFolderBCreated);

                            function onFolderBCreated() {

                                utilities.createFolderIfNeeded(reportFilePath, azureFileStorage, onFolderCreated);

                                function onFolderCreated() {

                                    openMarket(); // First execution and entering into the real loop.
                                }
                            }
                        }
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

                        closeMarket();

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

                        getTheTrades();

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

            The following code executes for each market, getting the trades from the exchange and saving them in files at the cloud storage.

            */

            function getTheTrades() {

                try {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'getTheTrades'");
                    }

                    const datetime = parseInt(currentDate.valueOf() / 1000);

                    /* We request to the Exchange API some more records than needed, anyway we will discard records out of the range we need. To do this we substract 120 seconds and add 10
                    seconds to the already calculated UNIX timestamps. */

                    const startTime = datetime - 120;
                    const endTime = datetime + 10;

                    exchangeCallTime = new Date();

                    let poloniexApiClient = new POLONIEX_CLIENT_MODULE();

                    poloniexApiClient.returnPublicTradeHistory(market.assetA, market.assetB, startTime, endTime, onExchangeCallReturned);

                }
                catch (err) {
                    const logText = "[ERROR] 'getTheTrades' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }
            }

            function onExchangeCallReturned(err, tradesRequested) {

                try {

                    if (LOG_INFO === true) {

                        let exchangeResponseTime = new Date();
                        let timeDifference = (exchangeResponseTime.valueOf() - exchangeCallTime.valueOf()) / 1000;
                        logger.write("[INFO] Entering function 'onExchangeCallReturned' - Call time recorded = " + timeDifference + " seconds.");
                    }

                    if (err || tradesRequested.error !== undefined) {
                        try {

                            if (err.message.indexOf("ETIMEDOUT") > 0) {

                                const logText = "[WARN] onExchangeCallReturned - Timeout reached while trying to access the Exchange API. Trying again. : ERROR = " + err.message;
                                logger.write(logText);

                                /* We try to reconnect to the exchange and fetch the data again. */

                                getTheTrades();
                                return;

                            } else {

                                if (err.message.indexOf("ECONNRESET") > 0) {

                                    const logText = "[WARN] onExchangeCallReturned - The exchange reseted the connection. Trying again. : ERROR = " + err.message;
                                    logger.write(logText);

                                    /* We try to reconnect to the exchange and fetch the data again. */

                                    getTheTrades();
                                    return;

                                } else {


                                    const logText = "[ERROR] onExchangeCallReturned - Unexpected error trying to contact the Exchange. Giving up. : ERROR = " + err.message;
                                    logger.write(logText);
                                    closeMarket();
                                    return;
                                }
                            }

                        } catch (err) {
                            const logText = "[ERROR] onExchangeCallReturned : ERROR : tradesRequested.error = " + tradesRequested.error;
                            logger.write(logText);

                            if (tradesRequested.error === "Invalid currency pair.") {

                                markets.disableMarket(EXCHANGE_ID, market.id, onMarketDeactivated)

                                function onMarketDeactivated() {

                                    logger.write("[INFO] Market " + market.assetA + "_" + market.assetB + " deactivated. Id = " + market.id);

                                    closeAndOpenMarket();
                                    return;

                                }

                            }

                            closeMarket();
                            return;
                        }

                        closeMarket();
                        return;

                    } else {

                        tradesReadyToBeSaved(tradesRequested);
                    }
                }
                catch (err) {
                    const logText = "[ERROR] 'onExchangeCallReturned' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }

            }

            function tradesReadyToBeSaved(tradesRequested) {

                try {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'tradesReadyToBeSaved'");
                    }


                    let fileRecordCounterA = 0;
                    let fileRecordCounterB = 0;

                    let fileNameA = '' + market.assetA + '_' + market.assetB + '.json';
                    let fileNameB = '' + market.assetA + '_' + market.assetB + '.json';

                    let needSeparator;
                    let separator;

                    needSeparator = false;

                    let fileContent = "";

                    /* First we create the file A */

                    fileContent = fileContent + '[';

                    for (i = 0; i < tradesRequested.length; i++) {

                        let record = tradesRequested[tradesRequested.length - 1 - i]; // In Poloniex the order of the records is by date DESC so we change it to ASC

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

                        if (trade.datetime.getUTCMinutes() === currentDate.getUTCMinutes()) {

                            if (needSeparator === false) {

                                needSeparator = true;
                                separator = '';

                            } else {
                                separator = ',';
                            }

                            fileContent = fileContent + separator + '[' + trade.tradeIdAtExchange + ',"' + trade.type + '",' + trade.rate + ',' + trade.amountA + ',' + trade.amountB + ',' + trade.seconds + ']';

                            fileRecordCounterA++;

                        }

                    }

                    // We add this extra record signaling that this file is still incomplete.

                    fileContent = fileContent + separator + '[' + '0' + ',"' + 'inc' + '",' + '0' + ',' + '0' + ',' + '0' + ',' + '0' + ']';

                    fileContent = fileContent + ']';

                    azureFileStorage.createTextFile(filePathA, fileNameA, fileContent + '\n', onFirstFileACreated);

                    function onFirstFileACreated() {

                        const logText = "[WARN] Finished with File A @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounterA + " records inserted into " + filePathA + "/" + fileNameA + "";
                        console.log(logText);
                        logger.write(logText);

                        generateFileB();

                    }

                    function generateFileB() {

                        fileContent = "";
                        needSeparator = false;

                        fileContent = fileContent + '[';

                        for (i = 0; i < tradesRequested.length; i++) {

                            let record = tradesRequested[tradesRequested.length - 1 - i]; // In Poloniex the order of the records is by date DESC so we change it to ASC

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

                            if (trade.datetime.getUTCMinutes() === previousMinute.getUTCMinutes()) {

                                if (needSeparator === false) {

                                    needSeparator = true;
                                    separator = '';

                                } else {
                                    separator = ',';
                                }

                                fileContent = fileContent + separator + '[' + trade.tradeIdAtExchange + ',"' + trade.type + '",' + trade.rate + ',' + trade.amountA + ',' + trade.amountB + ',' + trade.seconds + ']';

                                fileRecordCounterB++;

                            }
                        }

                        fileContent = fileContent + ']';

                        azureFileStorage.createTextFile(filePathB, fileNameB, fileContent + '\n', onFileBCreated);

                        function onFileBCreated() {

                            const logText = "[WARN] Finished with File B @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounterB + " records inserted into " + filePathB + "/" + fileNameB + "";
                            console.log(logText);
                            logger.write(logText);

                            writeStatusReport();

                        }
                    }

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Leaving function 'tradesReadyToBeSaved'");
                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'tradesReadyToBeSaved' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }
            }

            function writeStatusReport() {

                if (LOG_INFO === true) {
                    logger.write("[INFO] Entering function 'writeStatusReport'");
                }

                /*

                The report is a file that records important information to be used by a) another instance of the same process, b) another process or by c) another bot.

                The first thing to do is to read the current report file content, if it exists.

                There are 2 fields recorded in this file:

                1) The firstFile: which stores the datetime of the first file ever created by this process. This information is usefull for the Historic Trades process.
                2) The lastFile: which sotres the datetime of the last complete trades file created. 

                If the file does not exist, then we created.

                */

                try {

                    let firstFileDatetime;

                    let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json"

                    azureFileStorage.getTextFile(reportFilePath, fileName, onFileReceived, true);

                    function onFileReceived(text) {

                        if (text === undefined) {

                            /* If the file does not exist that means that this is the first time this process run at this market, so we must create the file now. */

                            firstFileDatetime = previousMinute;

                            writeReportFile();

                        } else {

                            /* Here we just need to confirm that it has the information. */

                            try {

                                let statusReport = JSON.parse(text);

                                /* We get from the file the datetime of the first file created. */

                                firstFileDatetime = new Date(statusReport.firstFile.year + "-" + statusReport.firstFile.month + "-" + statusReport.firstFile.days + " " + statusReport.firstFile.hours + ":" + statusReport.firstFile.minutes + GMT_SECONDS);

                                writeReportFile();

                            } catch (err) {

                                /* For some reason the file exists but the content is not there. We will create them well now. */

                                firstFileDatetime = previousMinute;

                                writeReportFile();

                            }

                        }

                        function writeReportFile() {

                            if (LOG_INFO === true) {
                                logger.write("[INFO] Entering function 'writeStatusReport - writeReportFile'");
                            }


                            let report = {
                                firstFile: {
                                    year: firstFileDatetime.getUTCFullYear(),
                                    month: (firstFileDatetime.getUTCMonth() + 1),
                                    days: firstFileDatetime.getUTCDate(),
                                    hours: firstFileDatetime.getUTCHours(),
                                    minutes: firstFileDatetime.getUTCMinutes()
                                },
                                lastFile: {
                                    year: previousMinute.getUTCFullYear(),
                                    month: (previousMinute.getUTCMonth() + 1),
                                    days: previousMinute.getUTCDate(),
                                    hours: previousMinute.getUTCHours(),
                                    minutes: previousMinute.getUTCMinutes()
                                }
                            };

                            let fileContent = JSON.stringify(report); 

                            azureFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onReportFileCreated);

                            function onReportFileCreated() {

                                if (LOG_INFO === true) {
                                    logger.write("[INFO] 'writeStatusReport' - Content written: " + fileContent);
                                }

                                closeAndOpenMarket();

                            }

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
