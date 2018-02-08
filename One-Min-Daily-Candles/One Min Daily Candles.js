


exports.newPloniexOrderBooks = function newPloniexOrderBooks(BOT) {

    let bot = BOT;
    const ROOT_DIR = '../';

    const INTERVAL_LAPSE = 60 * 1000;

    const MODULE_NAME = "Poloniex Order Books";
    const LOG_INFO = false;

    const EXCHANGE_NAME = "Poloniex";
    const EXCHANGE_ID = 1;

    const RAW_FOLDER_NAME = "order-books";
    const AGG_FOLDER_NAME = "aggregatted-order-books";

    const ORDER_BOOK_DEPTH = 100000;    // This is the max amount of BIDs or ASKs we want the Exchange API to return us from each market. 

    const MARKETS_MODULE = require(ROOT_DIR + 'Markets');

    const PloniexClient = require(ROOT_DIR + 'Poloniex API Client');

    const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    poloniexOrderBooks = {
        initialize: initialize,
        start: start
    };

    let markets;

    const AZURE_FILE_STORAGE = require(ROOT_DIR + 'Azure File Storage');
    let azureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);

    const UTILITIES = require(ROOT_DIR + 'Utilities');
    let utilities = UTILITIES.newUtilities(bot);

    const SHUTDOWN_EVENT = require(ROOT_DIR + 'Azure Web Job Shutdown');
    let shutdownEvent = SHUTDOWN_EVENT.newShutdownEvent(bot);

    return poloniexOrderBooks;

    function initialize(callBackFunction) {

        try {

            const logText = "[INFO] initialize - Entering function 'initialize' ";
            console.log(logText);
            logger.write(logText);

            poloniexApiClient = new PloniexClient();

            azureFileStorage.initialize();

            markets = MARKETS_MODULE.newMarkets(bot);
            markets.initialize(callBackFunction);


        } catch (err) {

            const logText = "[ERROR] initialize - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);

        }
    }



    function start() {

        let currentDate;

        try {

            let intervalId = setInterval(requestNewData, INTERVAL_LAPSE); 

            requestNewData(); // The first execution we do it without waiting for the interval call.

            function requestNewData() {

                try {

                    const logText = "[INFO] start - Entering function 'requestNewData' , next execution in " + INTERVAL_LAPSE / 1000 / 60 + " minutes.";
                    console.log(logText);
                    logger.write(logText);

                    if (shutdownEvent.isShuttingDown() === false) {

                        currentDate = new Date();

                        getOrderBookFromExchangeApi();

                        function getOrderBookFromExchangeApi() {

                            poloniexApiClient.returnOrderBooks(ORDER_BOOK_DEPTH, onReturnOrderBooks);

                        }

                        function onReturnOrderBooks(err, apiResponse) {

                            try {

                                if (err || apiResponse.error !== undefined) {
                                    try {

                                        if (err.message.indexOf("ETIMEDOUT") > 0) {

                                            const logText = "[WARN] requestNewData - onReturnOrderBooks - Timeout reached while trying to access the Exchange API.";
                                            console.log(logText);
                                            logger.write(logText);

                                            /* We try to reconnect to the exchange and fetch the data again. */

                                            getOrderBookFromExchangeApi();

                                        } else {
                                            const logText = "[ERROR] requestNewData - onReturnOrderBooks - err.message.indexOf(ETIMEDOUT) <= 0 ' ERROR : " + err.message;
                                            console.log(logText);
                                            logger.write(logText);
                                            return;
                                        }

                                    } catch (err) {
                                        const logText = "[ERROR] requestNewData - onReturnOrderBooks ' RECEIVED ERROR : " + apiResponse.error;
                                        console.log(logText);
                                        logger.write(logText);
                                    }
                                    return;

                                } else {
                                    processNextMessage(apiResponse);
                                }

                            } catch (err) {

                                const logText = "[ERROR] requestNewData - onReturnOrderBooks ' ERROR : " + err.message;
                                console.log(logText);
                                logger.write(logText);

                            }
                        }


                    }
                    else {

                        clearInterval(intervalId);

                        const logText = "[INFO] requestNewData - Terminating Set Interval - About to exit gracefully the process. ";
                        console.log(logText);
                        logger.write(logText);

                    }


                } catch (err) {

                    const logText = "[ERROR] requestNewData ' ERROR : " + err.message;
                    console.log(logText);
                    logger.write(logText);

                }

            }


            function processNextMessage(messageReceived) {

                try {

                    let orderBooksMessage = messageReceived;

                    let dateForPath = currentDate.getUTCFullYear() + '/' + utilities.pad(currentDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDate.getUTCDate(), 2) + '/' + utilities.pad(currentDate.getUTCHours(), 2) + '/' + utilities.pad(currentDate.getUTCMinutes(), 2);

                    let rawFilePath = RAW_FOLDER_NAME + '/' + dateForPath;
                    let aggregatedFilePath = AGG_FOLDER_NAME + '/' + dateForPath;

                    utilities.createFolderIfNeeded(rawFilePath, azureFileStorage, onFirstFolderCreated);

                    function onFirstFolderCreated() {

                        utilities.createFolderIfNeeded(aggregatedFilePath, azureFileStorage, processEachMarket);

                    }

                    function processEachMarket() {

                        for (let marketName in orderBooksMessage) {

                            let market = orderBooksMessage[marketName];

                            markets.getExistingOrNewMarketId(marketName, market, EXCHANGE_ID, onMarketIdReady);

                            function onMarketIdReady(marketName, market, pMarketId) {

                                try {

                                    let bidsCounter = 0;
                                    let asksCounter = 0;

                                    let newDate = new Date();

                                    let asks = market.asks;
                                    let bids = market.bids;

                                    let marketId = pMarketId;

                                    let fileName = '' + EXCHANGE_ID + '_' + marketId + '.json';

                                    let needSeparator;
                                    let separator;

                                    needSeparator = false;

                                    let maxRate = bids[0][0] * 1.1;
                                    let presicion = utilities.calculatePresicion(maxRate);

                                    let truncatedRate;
                                    let asksMap = new Map();
                                    let bidsMap = new Map();

                                    let fileContent = "";

                                    generateFirstFile();

                                    function generateFirstFile() {

                                        /* First we create the raw file and aggregate the date for the aggregated file */

                                        fileContent = fileContent + '[';
                                        fileContent = fileContent + '[';

                                        for (let i = 0; i < asks.length; i++) {

                                            if (needSeparator === false) {

                                                needSeparator = true;
                                                separator = '';

                                            } else {
                                                separator = ',';
                                            }

                                            let rate = asks[i][0];
                                            let amount = asks[i][1];

                                            fileContent = fileContent + separator + '[' + rate + ',' + amount + ']';

                                            roundedRate = Math.round(rate / presicion) * presicion;

                                            let currentAmount = asksMap.get(roundedRate) || 0;
                                            currentAmount = currentAmount + amount;

                                            asksMap.set(roundedRate, currentAmount);

                                            asksCounter = i;
                                        }

                                        fileContent = fileContent + '],[';

                                        needSeparator = false;

                                        for (let i = 0; i < bids.length; i++) {

                                            if (needSeparator === false) {

                                                needSeparator = true;
                                                separator = '';

                                            } else {
                                                separator = ',';
                                            }

                                            let rate = bids[i][0];
                                            let amount = bids[i][1];

                                            fileContent = fileContent + separator + '[' + rate + ',' + amount + ']';

                                            truncatedRate = Math.trunc(rate / presicion) * presicion;

                                            let currentAmount = bidsMap.get(truncatedRate) || 0;
                                            currentAmount = currentAmount + amount;

                                            bidsMap.set(truncatedRate, currentAmount);

                                            bidsCounter = i;
                                        }

                                        fileContent = fileContent + ']';
                                        fileContent = fileContent + ']';

                                        azureFileStorage.createTextFile(rawFilePath, fileName, fileContent + '\n', onFirstFileCreated);

                                        function onFirstFileCreated() {

                                            generateSecondFile();

                                        }

                                    }

                                    function generateSecondFile() {


                                        fileContent = "";

                                        fileContent = fileContent + '[';
                                        fileContent = fileContent + '[';

                                        needSeparator = false;

                                        asksMap.forEach(addAsks);

                                        function addAsks(value, key, map) {

                                            if (needSeparator === false) {

                                                needSeparator = true;
                                                separator = '';

                                            } else {
                                                separator = ',';
                                            }

                                            value = Math.trunc(value * 1000000) / 1000000;

                                            fileContent = fileContent + separator + '[' + key + ',' + value + ']';
                                        }

                                        fileContent = fileContent + '],[';

                                        needSeparator = false;

                                        bidsMap.forEach(addBids);

                                        function addBids(value, key, map) {

                                            if (needSeparator === false) {

                                                needSeparator = true;
                                                separator = '';

                                            } else {
                                                separator = ',';
                                            }

                                            value = Math.trunc(value * 1000000) / 1000000;

                                            fileContent = fileContent + separator + '[' + key + ',' + value + ']';
                                        }

                                        fileContent = fileContent + ']';
                                        fileContent = fileContent + ']';

                                        azureFileStorage.createTextFile(aggregatedFilePath, fileName, fileContent + '\n', onSecondFileCreated);

                                        function onSecondFileCreated() {

                                            const logText = "[WARN]  Finished with " + marketName + ", " + asksCounter + " aks and " + bidsCounter + " bids written to file " + fileName;
                                            console.log(logText);
                                            logger.write(logText);

                                        }
                                    }

                                } catch (err) {

                                    const logText = "[ERROR] processNextMessage - onMarketIdReady ' ERROR : " + err.message;
                                    console.log(logText);
                                    logger.write(logText);

                                }
                            }

                        }


                    }



                    messageReceived = null;

                } catch (err) {

                    const logText = "[ERROR] processNextMessage ' ERROR : " + err.message;
                    console.log(logText);
                    logger.write(logText);

                }
            }

        } catch (err) {

            const logText = "[ERROR] Start - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);

        }
    }


};



