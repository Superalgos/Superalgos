exports.newUserBot = function newUserBot(BOT, COMMONS, UTILITIES, DEBUG_MODULE, FILE_STORAGE, STATUS_REPORT, POLONIEX_CLIENT_MODULE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    let bot = BOT;

    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';

    const MODULE_NAME = "User Bot";

    const EXCHANGE_NAME = "Poloniex";

    const TRADES_FOLDER_NAME = "Trades";

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    thisObject = {
        initialize: initialize,
        start: start
    };

    let charlyFileStorage = FILE_STORAGE.newFileStorage(bot);

    let utilities = UTILITIES.newUtilities(bot);
    let poloniexApiClient = new POLONIEX_CLIENT_MODULE();

    return interval;

    function initialize(yearAssigend, monthAssigned, callBackFunction) {

        try {

            /* IMPORTANT NOTE:

            We are ignoring in this UserBot the received Year and Month. thisObject is not depending on Year / Month.

            */

            logger.fileName = MODULE_NAME;

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] initialize -> yearAssigend = " + yearAssigend); }
            if (FULL_LOG === true) { logger.write("[INFO] initialize -> monthAssigned = " + monthAssigned); }

            charlyFileStorage.initialize("AACharly", onCharlyInizialized);

            function onCharlyInizialized(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> onCharlyInizialized -> Initialization Succeed."); }
                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } else {
                    logger.write("[ERROR] initialize -> onCharlyInizialized -> err = " + err.message);
                    callBackFunction(err);
                }
            }

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

/*

We are going to generate 2 files:

A. The first one will contain all the trades of the current minute and will be store in a folder that we will create for this if it does not exist.
This file will be incomplete, since we are at the current minute and some trades will happen after we retrieve the information from the exchange,
but this is not a problem, since the second file is going to fix this. This file is only usefull for viewing a partial candle as it is being built
at the head of the market.

B. The second file will contain all the trades of the previous minute. This will override the incomplete file written a minute before.

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

            if (FULL_LOG === true) { logger.write("[INFO] start -> Entering function."); }

            let market = global.MARKET;

            let currentDate;                // This will hold the current datetime of each execution.
            let previousMinute;             // This hold the current time minus 60 seconds.
            let marketQueue;                // This is the queue of all markets to be procesesd at each interval.

            let dateForPathA;
            let dateForPathB;

            let filePathA;
            let filePathB;

            let reportFilePath = EXCHANGE_NAME + "/Processes/" + bot.process;

            let exchangeCallTime;

            createFolders(); 

            function createFolders() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] start -> createFolders -> Entering function."); }

                    currentDate = new Date();
                    
                    previousMinute = new Date(currentDate.valueOf() - 60000);

                    dateForPathA = currentDate.getUTCFullYear() + '/' + utilities.pad(currentDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDate.getUTCDate(), 2) + '/' + utilities.pad(currentDate.getUTCHours(), 2) + '/' + utilities.pad(currentDate.getUTCMinutes(), 2);
                    dateForPathB = previousMinute.getUTCFullYear() + '/' + utilities.pad(previousMinute.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousMinute.getUTCDate(), 2) + '/' + utilities.pad(previousMinute.getUTCHours(), 2) + '/' + utilities.pad(previousMinute.getUTCMinutes(), 2);

                    filePathA = EXCHANGE_NAME + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPathA;
                    filePathB = EXCHANGE_NAME + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPathB;

                    utilities.createFolderIfNeeded(filePathA, charlyFileStorage, onFolderACreated);

                    function onFolderACreated(err) {

                        if (FULL_LOG === true) { logger.write("[INFO] start -> createFolders -> onFolderACreated -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] start -> createFolders -> onFolderACreated -> err = " + err.message);
                            callBackFunction(err);
                            return;
                        }

                        utilities.createFolderIfNeeded(filePathB, charlyFileStorage, onFolderBCreated);
                    }

                    function onFolderBCreated(err) {

                        if (FULL_LOG === true) { logger.write("[INFO] start -> createFolders -> onFolderBCreated -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] start -> createFolders -> onFolderBCreated -> err = " + err.message);
                            callBackFunction(err);
                            return;
                        }

                        utilities.createFolderIfNeeded(reportFilePath, charlyFileStorage, onFolderCreated);
                    }

                    function onFolderCreated(err) {

                        if (FULL_LOG === true) { logger.write("[INFO] start -> createFolders -> onFolderCreated -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] start -> createFolders -> onFolderCreated -> err = " + err.message);
                            callBackFunction(err);
                            return;
                        }
                        getTheTrades(); 
                    }

                } catch (err) {
                    logger.write("[ERROR] start -> createFolders -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getTheTrades() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] start -> getTheTrades -> Entering function."); }

                    const datetime = parseInt(currentDate.valueOf() / 1000);

                    /*
                    We request to the Exchange API some more records than needed, anyway we will discard records out of the range we need.
                    To do this we substract 120 seconds and add 10 seconds to the already calculated current date.
                    */

                    const startTime = datetime - 120;
                    const endTime = datetime + 10;

                    exchangeCallTime = new Date();

                    poloniexApiClient.returnPublicTradeHistory(market.assetA, market.assetB, startTime, endTime, onExchangeCallReturned);

                } catch (err) {
                    logger.write("[ERROR] start -> getTheTrades -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function onExchangeCallReturned(err, tradesRequested) {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] start -> onExchangeCallReturned -> Entering function."); }

                    if (FULL_LOG === true) {

                        let exchangeResponseTime = new Date();
                        let timeDifference = (exchangeResponseTime.valueOf() - exchangeCallTime.valueOf()) / 1000;
                        logger.write("[INFO] start -> onExchangeCallReturned -> Call time recorded = " + timeDifference + " seconds.");
                    }

                    poloniexApiClient.analizeResponse(logger, err, exchangeResponse, callBackFunction, onResponseOk);

                    function onResponseOk() {

                        tradesReadyToBeSaved(tradesRequested);
                    }

                } catch (err) {
                    logger.write("[ERROR] start -> onExchangeCallReturned -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
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

                    //fileContent = fileContent + separator + '[' + '0' + ',"' + 'inc' + '",' + '0' + ',' + '0' + ',' + '0' + ',' + '0' + ']';

                    fileContent = fileContent + ']';

                    charlyFileStorage.createTextFile(filePathA, fileNameA, fileContent + '\n', onFirstFileACreated);

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

                        charlyFileStorage.createTextFile(filePathB, fileNameB, fileContent + '\n', onFileBCreated);

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

                    charlyFileStorage.getTextFile(reportFilePath, fileName, onFileReceived, true);

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

                            charlyFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onReportFileCreated);

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

        } catch (err) {
            logger.write("[ERROR] start -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
