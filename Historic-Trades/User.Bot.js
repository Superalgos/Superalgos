exports.newInterval = function newInterval(bot, logger, UTILITIES, FILE_STORAGE, MARKETS_MODULE, POLONIEX_CLIENT_MODULE) {

    const ROOT_DIR = './';
    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';

    const MODULE_NAME = "Interval";
    const LOG_INFO = true;

    const EXCHANGE_ID = 1;

    const TRADES_FOLDER_NAME = "Trades";

    const GO_RANDOM = false;
    const FORCE_MARKET = 2;     // This allows to debug the execution of an specific market. Not intended for production. 

    interval = {
        initialize: initialize,
        start: start
    };

    let markets;

    let charlyStorage = FILE_STORAGE.newFileStorage(bot, logger);

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

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

            charlyStorage.initialize(bot.dataMine);

            markets = MARKETS_MODULE.newMarkets(bot.logger);
            markets.initialize(callBackFunction);


        } catch (err) {

            const logText = "[ERROR] initialize - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);

        }
    }

/*

This process is going to do the following:

It will look for the oldest file for each market and it will request to the exchange the max amount of transactions from that moment, backwards.
Then it will iterate through those transactions to create the files for each minute with the trades it got from the exchange. Finally when it reaches the
begining of the history of the market, it will move to the next market and repead the process.

This process complements the Live Trades process and write historical trades files exactly in the same format.

*/

    function start(callBackFunction) {

        try {

            if (LOG_INFO === true) {
                logger.write(MODULE_NAME, "[INFO] Entering function 'start', with year = " + year + " and month = " + month);
            }

            let processDate = new Date(year + "-" + month + "-1 00:00:00.000 GMT+0000");

            processDate.setUTCMonth(processDate.getUTCMonth() + 1);          // First we go 1 month into the future.
            processDate.setUTCSeconds(processDate.getUTCSeconds() - 30);    // Then we go back 30 seconds, or to the last minute of the original month.

            let thisDatetime = new Date();

            if ((year === thisDatetime.getUTCFullYear() && month > thisDatetime.getUTCMonth() + 1) || year > thisDatetime.getUTCFullYear()) {

                logger.write(MODULE_NAME, "[INFO] We are too far in the future. Interval will not execute. Sorry.");
                return;

            }

            let moreIntervalCallsNeeded = false;    // Here we control if some processing has been done. If none, that means that it is not necesary to call this Interval again.

            let currentDate;    // This will hold the current datetime of each execution.
            let cursorDatetime; // This holds the datetime we are using to request records from, backwards.

            let marketQueue;    // This is the queue of all markets to be procesesd at each interval.
            let market = {      // This is the current market being processed after removing it from the queue.
                id: 0,
                assetA: "",
                assetB: ""
            };

            let dateForPath;

            let filePath;

            let exchangeCallTime;

            const FIRST_RECORD_ID = 100; // This should be around 100.

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
                        logger.write(MODULE_NAME, "[INFO] Entering function 'marketsLoop'");
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
                        logger.write(MODULE_NAME, "[INFO] Entering function 'openMarket'");
                    }


                    if (marketQueue.length === 0) {

                        if (LOG_INFO === true) {
                            logger.write(MODULE_NAME, "[INFO] 'openMarket' - marketQueue.length === 0");
                        }

                        const logText = "[WARN] We processed all the markets.";
                        logger.write(logText);

                        callBackFunction(moreIntervalCallsNeeded);

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
                        logger.write(MODULE_NAME, "[INFO] 'openMarket' - marketQueue.length = " + marketQueue.length);
                        logger.write(MODULE_NAME, "[INFO] 'openMarket' - market sucessfully opened : " + market.assetA + "_" + market.assetB);
                    }

                    if (market.status === markets.ENABLED) {

                        getMarketStatusReport();

                    } else {

                        logger.write(MODULE_NAME, "[INFO] 'openMarket' - market " + market.assetA + "_" + market.assetB + " skipped because its status is not valid. Status = " + market.status);
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
                    logger.write(MODULE_NAME, "[INFO] Entering function 'closeMarket'");
                }

            }

            function closeAndOpenMarket() {

                if (LOG_INFO === true) {
                    logger.write(MODULE_NAME, "[INFO] Entering function 'closeAndOpenMarket'");
                }

                openMarket();

            }


            /*

            The following code executes for each market, getting the trades from the exchange and saving them in files at the cloud storage.

            */


            function getMarketStatusReport() {

                /*

                The market status report is independent from the year and month this current interval is working on. We will read the report to
                check if the whole market is already completed. If it is, there is no need to do anything else.

                */

                try {

                    if (LOG_INFO === true) {
                        logger.write(MODULE_NAME, "[INFO] Entering function 'getMarketStatusReport'");
                    }

                    let reportFilePath = bot.exchange + "/Processes/" + bot.process;
                    let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                    charlyStorage.getTextFile(reportFilePath, fileName, onFileReceived);

                    function onFileReceived(text) {

                        if (text === undefined) {

                            getMonthStatusReport();

                        } else {

                            let statusReport = JSON.parse(text);

                            if (statusReport.completeHistory === true) {

                                const logText = "[INFO] 'getMarketStatusReport' - Market " + market.assetA + '_' + market.assetB + " is already complete. Skipping it. ";
                                logger.write(logText);

                                closeAndOpenMarket();

                            } else {

                                getMonthStatusReport();

                            }

                        }

                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'getMarketStatusReport' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }
            }


            function getMonthStatusReport() {

                /*

                In order to know where to start the process (which datetime) we need to read the StatusReport of the process. This file will tell
                us where we left after the last execution or if the process has finished for this market.

                */

                try {

                    if (LOG_INFO === true) {
                        logger.write(MODULE_NAME, "[INFO] Entering function 'getMarketStatusReport'");
                    }

                    let reportFilePath = bot.exchange + "/Processes/" + bot.process + "/" + year + "/" + month;
                    let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                    charlyStorage.getTextFile(reportFilePath, fileName, onFileReceived);

                    function onFileReceived(text) {

                        if (text === undefined) {

                            if (processDate.valueOf() > thisDatetime.valueOf()) {

                                currentDate = thisDatetime;
                                getTheTrades();

                            } else {

                                currentDate = processDate;
                                getTheTrades();

                            }

                        } else {

                            let statusReport = JSON.parse(text);

                            if (statusReport.completeHistory === true) {

                                const logText = "[INFO] 'getMonthStatusReport' - Market " + market.assetA + '_' + market.assetB + " is already complete. Skipping it. ";
                                logger.write(logText);

                                closeAndOpenMarket();

                            } else {

                                /* We get from the file the datetime of the last file created. */

                                currentDate = new Date(statusReport.lastFile.year + "-" + statusReport.lastFile.month + "-" + statusReport.lastFile.days + " " + statusReport.lastFile.hours + ":" + statusReport.lastFile.minutes + GMT_SECONDS); 

                                getTheTrades();

                            }

                        }

                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'getMonthStatusReport' - ERROR : " + err.message;
                    logger.write(logText);
                    closeMarket();
                }
            }

            function getTheTrades() {

                try {

                    if (LOG_INFO === true) {
                        logger.write(MODULE_NAME, "[INFO] Entering function 'getTheTrades'");
                    }

                    const firstTradeDate = parseInt(currentDate.valueOf() / 1000);

                    const firstMomentOfMonth = new Date(year + "-" + month + "-1 00:00:00.000 GMT+0000");

                    /* We request to the Exchange API some more records than needed, anyway we will discard records out of the range we need. To do this we substract some seconds and add some
                    seconds to the already calculated UNIX timestamps. */

                    let startTime = parseInt(firstMomentOfMonth.valueOf() / 1000) - 5;
                    let endTime = firstTradeDate + 60;

                    if (endTime - startTime > 60 * 60 * 24 * 30) {

                        /*

                        We can not ask this exchange for more than 30 days in a single request. So we substract in this case a few days so as not
                        to violate this policy on 31 days months.

                        */

                        startTime = startTime + 60 * 60 * 25 * 7; // we add one week to be confortable.

                    }

                    exchangeCallTime = new Date();

                    let poloniexApiClient = POLONIEX_CLIENT_MODULE.newPoloniexAPIClient(global.EXCHANGE_KEYS[bot.exchange].Key, global.EXCHANGE_KEYS[bot.exchange].Secret);

                    poloniexApiClient.API.returnPublicTradeHistory(market.assetA, market.assetB, startTime, endTime, onExchangeCallReturned);

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
                        logger.write(MODULE_NAME, "[INFO] Entering function 'onExchangeCallReturned' - Call time recorded = " + timeDifference + " seconds.");
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

                                markets.disableMarket(EXCHANGE_ID, market.id, onMarketDeactivated);

                                function onMarketDeactivated() {

                                    logger.write(MODULE_NAME, "[INFO] Market " + market.assetA + "_" + market.assetB + " deactivated. Id = " + market.id);

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

                        if (tradesRequested.length === 0) {

                            const logText = "[WARN] 'onExchangeCallReturned' - The exchange didn't return any records. We assume this means the date requested is before the begining of this market. ";
                            logger.write(logText);
                            closeAndOpenMarket();

                        } else {

                            tradesReadyToBeSaved(tradesRequested);

                        }
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
                        logger.write(MODULE_NAME, "[INFO] Entering function 'tradesReadyToBeSaved'");
                    }

                    moreIntervalCallsNeeded = true; // If we are requesting trades from the exchange, that means that something is being done.

                    let filesWrittenCounter = 0;    // We count each file written to the cloud so when we reach some number we partially update the status report
                    let fileRecordCounter = 0;

                    let needSeparator;
                    let separator;

                    let lastProcessMinute;  // Stores the previous record minute during each iteration
                    let filesToSave = [];   // Array where we will store all the content to be written to files

                    needSeparator = false;

                    let fileContent = "";

                    let beginingOfMarket = false; // This flag is turned on when we detect the conditions that makes us assume we are at the begining of the hitory of the market. 

                    let currentProcessMinute = Math.trunc(currentDate.valueOf() / 1000 / 60); 
                    let firstProcessMinute = currentProcessMinute;

                    /* We will iterate through all the records received from the exchange. We expect the exchange API to return the records ordered by ID DESC so we change it to ASC. So this is going to be going back in time as we advance. */

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

                        if (trade.tradeIdAtExchange < FIRST_RECORD_ID) {  // Experience has shown us that the first trade records of any market are out of range, because they are teststing the market with any value. So no worries if they are not recorded in our history.

                            beginingOfMarket = true;

                        }

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

                            fileContent = '[' + trade.tradeIdAtExchange + ',"' + trade.type + '",' + trade.rate + ',' + trade.amountA + ',' + trade.amountB + ',' + trade.seconds + ']' + separator + fileContent;

                            fileRecordCounter++;

                        }

                    }

                    if (fileContent !== "") {

                        /* 

                        Normally, we would not save the content of the last file, since it usually contains some of the records of that minute.
                        There are a few exceptions:

                        If it is the last file of the month (the one at the very begining of the month) we must save it.

                        */

                        let date = new Date(currentProcessMinute * 60 * 1000);

                        if ((date.getUTCFullYear() === year) &&
                            (date.getUTCMonth() + 1 === parseInt(month)) &&  // remember we added left zeros to look cool.
                            (date.getUTCDate() === 1) &&
                            (date.getUTCHours() === 0) &&
                            (date.getUTCMinutes() === 0)) {

                            storeFileContent();

                        } else {

                            /* 

                            The second exception happens when we approach the begining of the month.
                            In markets with few volume, there might be a lot of minutes or even hours, close to the begining of the month with no records. Naturally the process
                            would stop with the last record received from the exchange. So we must fix that an to do it, we check if we processed only one minute,
                            in that case, we interpret that all the minutes below until the begining of the month, are with empty records. If this condition is not met, then we must
                            ignore the records as they might be some missing for the current minute.

                            */

                            if (firstProcessMinute - currentProcessMinute === 1) {

                                /* We will artificially generate all the minutes upto the begining of the month. The first will contain some records, all the rest will be empty. */

                                const firstMomentOfMonth = new Date(year + "-" + month + "-1 00:00:00.000 GMT+0000");

                                let firstMinute = Math.trunc(firstMomentOfMonth.valueOf() / 1000 / 60);  // This are the number of minutes since the begining of time to the begining of the month.

                                let blackMinutes = currentProcessMinute - firstMinute + 1;

                                for (let j = 1; j <= blackMinutes; j++) {

                                    storeFileContent();
                                    currentProcessMinute--;

                                }

                            } else {

                                /* We dont store the last processed file since it might be incomplete. */

                            }
                        }
                    }

                    function storeFileContent() {

                        fileContent = '[' + fileContent + ']';

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

                    if (LOG_INFO === true) {
                        logger.write(MODULE_NAME, "[INFO] About to save " + (filesToSave.length + 1) + " files. ");
                    }

                    let i = 0;
                    let date;

                    nextRecord();

                    function nextRecord() {

                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        date = new Date(filesToSave[i].datetime * 60 * 1000);
                        fileRecordCounter = filesToSave[i].records;
                        fileContent = filesToSave[i].content;

                        dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);

                        filePath = bot.exchange + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPath;

                        utilities.createFolderIfNeeded(filePath, charlyStorage, onFolderCreated);

                        function onFolderCreated() {

                            charlyStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                let paddedCounter = utilities.pad(fileRecordCounter, 4);
                                let paddedFile = utilities.pad(i + 1, 5);

                                const logText = "[WARN] Finished with File # " + paddedFile + " @ " + market.assetA + "_" + market.assetB + ", " + paddedCounter + " records inserted into " + filePath + "/" + fileName + "";
                                console.log(logText);
                                logger.write(logText);

                                controlLoop();
                            }
                        }
                    }

                    
                    function controlLoop() {

                        i++;

                        if (i < filesToSave.length) {

                            filesWrittenCounter++;

                            if (filesWrittenCounter === 30) { // Every now and then we write a Status Report so that if the process is terminated, it can resume later from there.

                                writeStatusReport(date, false, false, onReportWritten);

                                function onReportWritten() {

                                    filesWrittenCounter = 0;
                                    nextRecord();

                                }

                            } else {

                                nextRecord();

                            }

                        } else {

                            if (LOG_INFO === true) {
                                logger.write(MODULE_NAME, "[INFO] Leaving function 'tradesReadyToBeSaved'");
                            }

                            let monthCompleteHistory = false;

                            if ((date.getUTCFullYear() === year) &&
                                (date.getUTCMonth() + 1 === parseInt(month)) &&  // remember we added left zeros to look cool.
                                (date.getUTCDate() === 1) &&
                                (date.getUTCHours() === 0) &&
                                (date.getUTCMinutes() === 0)) {

                                /*

                                When we get to the first minute of the month, that menas we completed the whole month and this should later be recorded
                                at the Status Report.

                                */

                                monthCompleteHistory = true;

                            }

                            if (beginingOfMarket === true) {

                                /*

                                If we already detected that we completed the whole market (by reaching a very low trade Id) then we can also say that
                                we completed the current month.

                                */

                                monthCompleteHistory = true;
                            }

                            writeStatusReport(date, monthCompleteHistory, beginingOfMarket, onReportWritten);

                            function onReportWritten() {

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


            function writeStatusReport(lastFileDate, isMonthComplete, isBeginingOfMarket, callBack) {

                /*

                The report is a file that records important information to be used by a) another instance of the same process, b) another process or by c) another bot.

                The first thing to do is to read the current report file content, if it exists.

                In this particular process, we will record the last file processed. 

                */

                try {

                    if (LOG_INFO === true) {
                        logger.write(MODULE_NAME, "[INFO] Entering function 'writeStatusReport'");
                    }

                    let reportFilePath = bot.exchange + "/Processes/" + bot.process + "/" + year + "/" + month;

                    utilities.createFolderIfNeeded(reportFilePath, charlyStorage, onFolderCreated);

                    function onFolderCreated() {

                        let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                        let report = {
                            lastFile: {
                                year: lastFileDate.getUTCFullYear(),
                                month: (lastFileDate.getUTCMonth() + 1),
                                days: lastFileDate.getUTCDate(),
                                hours: lastFileDate.getUTCHours(),
                                minutes: lastFileDate.getUTCMinutes()
                            },
                            completeHistory: isMonthComplete
                        };

                        let fileContent = JSON.stringify(report); 

                        charlyStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onFileCreated);

                        function onFileCreated() {

                            if (LOG_INFO === true) {
                                logger.write(MODULE_NAME, "[INFO] 'writeStatusReport' - Content written: " + fileContent);
                            }

                            if (isBeginingOfMarket === true) {

                                reportFilePath = bot.exchange + "/Processes/" + bot.process;

                                utilities.createFolderIfNeeded(reportFilePath, charlyStorage, onFolderCreated);

                                function onFolderCreated() {

                                    fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                                    let report = {
                                        lastFile: {
                                            year: lastFileDate.getUTCFullYear(),
                                            month: (lastFileDate.getUTCMonth() + 1),
                                            days: lastFileDate.getUTCDate(),
                                            hours: lastFileDate.getUTCHours(),
                                            minutes: lastFileDate.getUTCMinutes()
                                        },
                                        completeHistory: false // This will be true only when all months are completed.
                                    };

                                    let fileContent = JSON.stringify(report);

                                    charlyStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onMasterFileCreated);

                                    function onMasterFileCreated() {

                                        if (LOG_INFO === true) {
                                            logger.write(MODULE_NAME, "[INFO] 'writeStatusReport' - Begining of market reached !!! - Content written: " + fileContent);
                                        }

                                        verifyMarketComplete(isMonthComplete, callBack);

                                    }

                                }

                            }
                                
                            else {

                                verifyMarketComplete(isMonthComplete, callBack);

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

            function verifyMarketComplete(isMonthComplete, callBack) {

                if (isMonthComplete === true) {

                    logger.write(MODULE_NAME, "[INFO] 'writeStatusReport' - verifyMarketComplete - Month Completed !!! ");

                    /*
 
                    To know if the whole market is complete, we need to ready all the status reports, one by one, since the first
                    month / year to the current month / year.

                    To know which is the first month / year we will read the main Status Report. Only if it exists (that is after the first
                    month of the market reached a very low trade), we will know from it which is the initial month / year.

                    Obtaining the current month / year is trivial, since it is current time. We will scan all the files and we need all of
                    them to report that the month has been completed in order to declare the whole market as completed.

                    All of the above is what we call the last step.
 
                    */

                    let initialYear;
                    let initialMonth;

                    let finalYear = (new Date()).getUTCFullYear();
                    let finalMonth = (new Date()).getUTCMonth() + 1;

                    let reportFilePath = bot.exchange + "/Processes/" + bot.process;
                    let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                    /* Lets read the main status report */

                    charlyStorage.getTextFile(reportFilePath, fileName, onFileReceived);

                    function onFileReceived(text) {

                        if (text === undefined) {

                            /* The first month of the market didnt create this file yet. Aborting verification. */

                            logger.write(MODULE_NAME, "[INFO] 'writeStatusReport' - verifyMarketComplete - Verification ABORTED since the main status report did not exist. ");

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

                        let reportFilePath = bot.exchange + "/Processes/" + bot.process + "/" + initialYear + "/" + paddedInitialMonth;
                        let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                        charlyStorage.getTextFile(reportFilePath, fileName, onStatusReportFileReceived);

                        function onStatusReportFileReceived(text) {

                            if (text === undefined) {

                                /* If any of the files do not exist, it is enough to know the market is not complete. */

                                logger.write(MODULE_NAME, "[INFO] 'writeStatusReport' - verifyMarketComplete - Verification ABORTED  since the status report for year  " + initialYear + " and month " + initialMonth + " did not exist. ");

                                callBack();

                            } else {

                                let statusReport = JSON.parse(text);

                                if (statusReport.completeHistory === true) {

                                    loop();  // Lets see the next month.

                                } else {

                                    /* If any of the files says that month is not complete then it is enough to know the market is not complete. */

                                    logger.write(MODULE_NAME, "[INFO] 'writeStatusReport' - verifyMarketComplete - Verification ABORTED since the status report for year  " + initialYear + " and month " + initialMonth + " did not have a complete history. ");

                                    callBack();

                                }
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

                            readAndWriteNewReport();

                            return;
                        }

                        loopCycle();

                    }

                    function readAndWriteNewReport() {

                        /* We will read the current file to preserve its data, and save it again with market complete = true */

                        let reportFilePath = bot.exchange + "/Processes/" + bot.process;
                        let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                        charlyStorage.getTextFile(reportFilePath, fileName, onFileReceived);

                        function onFileReceived(text) {

                            let statusReport = JSON.parse(text);

                            statusReport.completeHistory = true;

                            let fileContent = JSON.stringify(statusReport);

                            charlyStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onMasterFileCreated);

                            function onMasterFileCreated() {

                                logger.write(MODULE_NAME, "[INFO] 'writeStatusReport' - verifyMarketComplete - Verification SUCESSFULL . Market Completed !!! - Content written: " + fileContent);

                                callBack();

                            }
                        }
                    }

                } else {

                    logger.write(MODULE_NAME, "[INFO] 'writeStatusReport' - verifyMarketComplete - Verification ABORTED: Month is not complete. ");
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
