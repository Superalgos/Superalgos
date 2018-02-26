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
    const CANDLE_STAIRS_FOLDER_NAME = "Candle-Stairs";

    const VOLUMES_FOLDER_NAME = "Volumes";
    const VOLUME_STAIRS_FOLDER_NAME = "Volume-Stairs";

    const GO_RANDOM = false;
    const FORCE_MARKET = 2;     // This allows to debug the execution of an specific market. Not intended for production. *

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    interval = {
        initialize: initialize,
        start: start
    };

    let fs = require('fs');

    let markets;

    let charlyAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);
    let oliviaAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);
    let tomAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);
    let mariamAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);

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
            mariamAzureFileStorage.initialize("Mariam");

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

            /*

            This bot will trade with a pseudo strategy based on candle and volumes stairs patterns. Essentially it will look at the patterns
            it is in at different time periods and try to make a guess if it is a good time to buy, sell, put or remove positions.

            The bot trades only at one market: USDT_BTC.

            */


            let nextIntervalExecution = false; // This tell weather the Interval module will be executed again or not. By default it will not unless some hole have been found in the current execution.
            let nextIntervalLapse = 10 * 1000; // If something fails and we need to retry after a few seconds, we will use this amount of time to request a new execution. 

            let marketFilesPeriods =
                '[' +
                '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
                '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
                '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
                '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
                '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
                '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
                '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
                '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']';

            marketFilesPeriods = JSON.parse(marketFilesPeriods);

            let dailyFilePeriods =
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

            dailyFilePeriods = JSON.parse(dailyFilePeriods);

            const market = {
                assetA: "USDT",
                assetB: "BTC",
            };

            /*

            Here we will keep the last status report, to be available during the whole process. The Status Report is a file the bot process
            reads and saves again after each execution. Its main purpose is to know when the last execution was in order to locate the execution
            context. When the bot runs for the first time it takes some vital parameters from there and it checks them through its lifecycle to see
            if they changed. The Status Report file can eventually be manipulated by the bot operators / developers in order to change those parameters
            or to point the last execution to a different date. Humans are not supose to manipulate the Execution Histroy or the execution Context files.

            The Execution History is basically an index with dates of all the executions the bot did across its history. It allows the bot plotter
            to know which datetimes have informacion about the bots execution in order to display it.

            The Execution Context file records all the context information of the bot at the moment of execution and the final state of all of its
            positions on the market.

            */

            let statusReport;                           // This is the typical Status Report that defines which was the last sucessfull execution and a few other pieces of info.
            let executionHistory;                       // This is 
            let executionContext;                       // Here is the information of the last execution of this bot process.

            let processDatetime = new Date();           // This will be considered the process date and time, so as to have it consistenly all over the execution.
            processDatetime = new Date(processDatetime.valueOf() - 30 * 24 * 60 * 60 * 1000); // we go 30 days back in time since candles are currently not up to date.

            /*

            During the process we will create a new History Record. This will go to the Context History file which essentially mantains an
            index of all the bots executions. This file will later be plotted by the bot s plotter on the timeline, allowing end users to
            know where there is information related to the actions taken by the bot.

            */

            let newHistoryRecord = {
                date: processDatetime,
                rate: undefined,            // This will be used to know where to plot this information in the time line. 
                newPositions: 0,
                newTrades: 0
            };

            let exchangePositions = [];     // These are the open positions at the exchange at the account the bot is authorized to use.
            let openPositions = [];         // These are the open positions the bot knows it made by itself. 

            let candlesMap = new Map;       // This bot will look only at the last 10 candles for each Time Period and they will be stored here.
            let stairsMap = new Map;        // This bot will use this pattern. Here we will store the pattern we are in for each Time Period.


            let apiKey = readApiKey();

            let poloniexApiClient = new POLONIEX_CLIENT_MODULE(apiKey.Key, apiKey.Secret);

            getPositionsAtExchange();

            function readApiKey() {

                try {

                    return JSON.parse(fs.readFileSync('../' + 'API-Keys' + '/' + EXCHANGE_NAME + '.json', 'utf8'));

                }
                catch (err) {
                    const logText = "[ERROR] 'readApiKey' - ERROR : " + err.message;
                    logger.write(logText);
                }

            }

            function getPositionsAtExchange() {

                /*

                Here we grab all the positions at the exchange for the account we are using for trading. We will not asume all the positions
                were made by this bot, but we need them all to later check if all the ones made by the bot are still there, were executed or
                manually cancelled by the account owner.

                */

                poloniexApiClient.returnOpenOrders(market.assetA, market.assetB, onExchangeCallReturned);

                function onExchangeCallReturned(err, exchangeResponse) {

                    try {

                        if (err || exchangeResponse.error !== undefined) {
                            try {

                                if (err.message.indexOf("ETIMEDOUT") > 0) {

                                    const logText = "[WARN] onExchangeCallReturned - Timeout reached while trying to access the Exchange API. Requesting new execution later. : ERROR = " + err.message;
                                    logger.write(logText);

                                    /* We abort the process and request a new execution at the configured amount of time. */

                                    callBackFunction(true, nextIntervalLapse);
                                    return;

                                } else {

                                    if (err.message.indexOf("ECONNRESET") > 0) {

                                        const logText = "[WARN] onExchangeCallReturned - The exchange reseted the connection. Requesting new execution later. : ERROR = " + err.message;
                                        logger.write(logText);

                                        /* We abort the process and request a new execution at the configured amount of time. */

                                        callBackFunction(true, nextIntervalLapse);
                                        return;

                                    } else {


                                        const logText = "[ERROR] onExchangeCallReturned - Unexpected error trying to contact the Exchange. This will halt this bot process. : ERROR = " + err.message;
                                        logger.write(logText);
                                        return;
                                    }
                                }

                            } catch (err) {
                                const logText = "[ERROR] onExchangeCallReturned : ERROR : exchangeResponse.error = " + exchangeResponse.error;
                                logger.write(logText);
                                return;
                            }

                            return;

                        } else {

                            /*

                            This is what we receive from the exchange. We will convert this to our standard format for later use.

                            [ { orderNumber: '151918418632',
                                type: 'sell',
                                rate: '20000.00000000',
                                startingAmount: '0.00010000',
                                amount: '0.00010000',
                                total: '2.00000000',
                                date: '2018-02-24 11:14:17',
                                margin: 0 } ]

                            */

                            for (let i = 0; i < exchangeResponse.length; i++) {

                                let openPosition = {
                                    id: exchangeResponse[i].orderNumber,
                                    type: exchangeResponse[i].type,
                                    rate: exchangeResponse[i].rate,
                                    amountA: exchangeResponse[i].total,
                                    amountB: exchangeResponse[i].amount,
                                    date: (new Date(exchangeResponse[i].date)).valueOf()
                                };

                                exchangePositions.push(openPosition);
                            }

                            readStatusAndContext();
                        }
                    }
                    catch (err) {
                        const logText = "[ERROR] 'onExchangeCallReturned' - ERROR : " + err.message;
                        logger.write(logText);

                    }
                }
            }

            function readStatusAndContext() {

                /*

                Here we get the positions the bot did and that are recorded at the bot storage account. We will use them through out the rest
                of the process.

                */

                getStatusReport();

                function getStatusReport() {

                    /* If the process run and was interrupted, there should be a status report that allows us to resume execution. */

                    let fileName = "Status.Report.json"
                    let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Processes/" + bot.process;

                    mariamAzureFileStorage.getTextFile(filePath, fileName, onFileReceived, true);

                    function onFileReceived(text) {

                        try {

                            statusReport = JSON.parse(text);

                            if (statusReport.lastExecution === undefined) {

                                createConext();

                            } else {

                                getExecutionHistory();

                            }

                        } catch (err) {

                            /*

                            It might happen that the file content is corrupt or it does not exist. The bot can not run without a Status Report,
                            since it is risky to ignore its own history, so even for first time execution, a status report with the right format
                            is needed.

                            */

                            const logText = "[ERROR] 'getStatusReport' - Bot cannot execute without a status report. ERROR : " + err.message;
                            logger.write(logText);

                        }
                    }
                }

                function getExecutionHistory() {

                    let fileName = "Execution.History.json"
                    let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + bot.process;

                    mariamAzureFileStorage.getTextFile(filePath, fileName, onFileReceived, true);

                    function onFileReceived(text) {

                        try {

                            executionHistory = JSON.parse(text);
                            getExecutionContext();

                        } catch (err) {

                            /*

                            It might happen that the file content is corrupt or it does not exist. The bot can not run without a Status Report,
                            since it is risky to ignore its own history, so even for first time execution, a status report with the right format
                            is needed.

                            */

                            const logText = "[ERROR] 'getExecutionHistory' - Bot cannot execute without the Execution History. ERROR : " + err.message;
                            logger.write(logText);

                        }
                    }
                }

                function getExecutionContext() {

                    let fileName = "Execution.Context.json"
                    let dateForPath = statusReport.lastExecution.getUTCFullYear() + '/' + utilities.pad(statusReport.lastExecution.getUTCMonth(), 2) + '/' + utilities.pad(statusReport.lastExecution.getUTCDate(), 2) + '/' + utilities.pad(statusReport.lastExecution.getUTCHours(), 2) + '/' + utilities.pad(statusReport.lastExecution.getUTCMinutes(), 2);
                    let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + dateForPath;

                    mariamAzureFileStorage.getTextFile(filePath, fileName, onFileReceived, true);

                    function onFileReceived(text) {

                        let statusReport;

                        try {

                            executionContext = JSON.parse(text);
                            ordersExecutionCheck();

                        } catch (err) {

                            /*

                            It might happen that the file content is corrupt or it does not exist. The bot can not run without a Status Report,
                            since it is risky to ignore its own history, so even for first time execution, a status report with the right format
                            is needed.

                            */

                            const logText = "[ERROR] 'getExecutionContext' - Bot cannot execute without the Execution Context. ERROR : " + err.message;
                            logger.write(logText);

                        }
                    }
                }

            }

            function createConext() {

                /*

                When the bot is executed for the very first time, there are a few files that do not exist and need to be created, and that
                is what we are going to do now.

                */

                executionHistory = [];

                executionContext = {
                    investment: {
                        assetA: 0,
                        assetB: 0
                    },
                    availableBalance: {
                        assetA: 0,
                        assetB: 0
                    },
                    positions: [],
                    transactions: []
                };

                getCandles();

            }

            function ordersExecutionCheck() {

                /*

                Here we check that all the positions we know we have are still at the exchange. If they are not, we will try to take appropiate
                actions. Reasons why the positions might not be there are:

                1. The user / account owner closed the positions manually.
                2. The exchange for some eventuality closed the positions. In some exchanges positions have an expiratin time.
                3. The orders were executed.

                For as 1 and 2 are similar unexpected situations and we will stop the bot execution when we detect we are there. Number 3 is an
                expected behaviour and we take appropiate action.

                Also, the position might still be there but it might have been partially executed. To detect that we need to compare the
                position amounts we have on file to the one we are receiving from the exchange.

                Before we begin, we have to remove all the orders that have been already closed at the last execution of the bot.

                */

                let openPositions = [];

                for (let a = 0; j < executionContext.positions.length; a++) {

                    if (executionContext.positions[i].status === "open") {

                        openPositions.push(executionContext.positions[i]);

                    }
                }

                executionContext.positions = openPositions;

                /* Now we can start checking what happened at the exchange. */

                let i = 0;

                controlLoop();

                function loopBody() {

                    for (let j = 0; j < exchangePositions.length; j++) {

                        if (executionContext.positions[i].id === exchangePositions[j].id) {

                            /*

                            We need to know if the order was partially executed. To know that, we compare the amounts on file with the ones
                            received from the exchange. If they are the same, then the order is intact. Otherwise, to confirm a partial execution,
                            we will request the associated trades from the exchange.

                            */

                            if (
                                executionContext.positions[i].amountA === exchangePositions[j].amountA &&
                                executionContext.positions[i].amountB === exchangePositions[j].amountB) {

                                /* Position is still there, untouched. Nothing to do here. */

                                next();
                                return;

                            } else {

                                getOrderTradesAtExchange(executionContext.positions[i].id, confirmOrderWasPartiallyExecuted);
                                return;

                                function confirmOrderWasPartiallyExecuted(trades) {

                                    /*

                                    To confirm everything is ok, we will add all the amounts on trades plus the remaining amounts
                                    at the order at the exchange and they must be equal to the one on file. Otherwise something very strange could
                                    have happened, in which case we will halt the bot execution.

                                    */

                                    let sumAssetA = 0;
                                    let sumAssetB = 0;

                                    for (k = 0; k < trades.length; k++) {

                                        sumAssetA = sumAssetA + trades[k].amountA;
                                        sumAssetB = sumAssetB + trades[k].amountB;

                                    }

                                    /* To this we add the current position amounts. */

                                    sumAssetA = sumAssetA + exchangePositions[j].amountA;
                                    sumAssetB = sumAssetB + exchangePositions[j].amountB;

                                    /* And finally we add the fees */

                                    sumAssetA = sumAssetA + exchangePositions[j].fee;

                                    if (
                                        executionContext.positions[i].amountA !== sumAssetA ||
                                        executionContext.positions[i].amountB !== sumAssetB
                                        ) {

                                        const logText = "[ERROR] 'confirmOrderWasPartiallyExecuted' - Cannot be confirmed that a partially execution was done well. Bot stopping execution. ";
                                        logger.write(logText);
                                        return;

                                    }

                                    /*

                                    Confirmed that order was partially executed. Next thing to do is to remember the trades and the new position.

                                    */

                                    executionContext.positions[i].amountA = exchangePositions[j].amountA;
                                    executionContext.positions[i].amountB = exchangePositions[j].amountB;
                                    executionContext.positions[i].date = (new Date(exchangePositions[j].date)).valueOf();
                                    
                                    for (k = 0; k < trades.length; k++) {

                                        executionContext.positions[i].trades.push(trades[k]);

                                    }

                                    /* All done. */

                                    next();

                                }

                            }
                        }
                    }

                    /* Position not found: we need to know if the order was executed. */

                    getOrderTradesAtExchange(executionContext.positions[i].id, confirmOrderWasExecuted);

                    function confirmOrderWasExecuted(trades) {

                        /*

                        To confirm everything is ok, we will add all the amounts on trades asociated to the order and
                        they must be equal to the one on file. Otherwise something very strange could have happened,
                        in which case we will halt the bot execution.

                        */

                        let sumAssetA = 0;
                        let sumAssetB = 0;

                        for (k = 0; k < trades.length; k++) {

                            sumAssetA = sumAssetA + trades[k].amountA;
                            sumAssetB = sumAssetB + trades[k].amountB;

                        }

                        /* We add the fees */

                        sumAssetA = sumAssetA + exchangePositions[j].fee;

                        if (
                            executionContext.positions[i].amountA !== sumAssetA ||
                            executionContext.positions[i].amountB !== sumAssetB
                        ) {

                            const logText = "[ERROR] 'confirmOrderWasExecuted' - Cannot be confirmed that the order was executed. It must be manually cancelled by the user or cancelled by the exchange itself. Bot stopping execution. ";
                            logger.write(logText);
                            return;

                        }

                        /*

                        Confirmed that order was executed. Next thing to do is to remember the trades and change its status.

                        */

                        executionContext.positions[i].status = "closed";

                        for (k = 0; k < trades.length; k++) {

                            executionContext.positions[i].trades.push(trades[k]);

                        }

                        /* All done. */

                        next();

                    }

                }

                function next() {

                    i++;

                }

                function controlLoop() {

                    if (i < executionContext.positions.length) {

                        loopBody();

                    } else {

                        final();

                    }
                }

                function final() {

                    getPatterns();

                }
            }

            function getOrderTradesAtExchange(orderId, callBackFunction) {

                /*

                Given one order, we request all the associated trades to it.

                */

                poloniexApiClient.returnOrderTrades(orderId, onExchangeCallReturned);

                function onExchangeCallReturned(err, exchangeResponse) {

                    try {

                        if (err || exchangeResponse.error !== undefined) {
                            try {

                                if (err.message.indexOf("ETIMEDOUT") > 0) {

                                    const logText = "[WARN] onExchangeCallReturned - Timeout reached while trying to access the Exchange API. Requesting new execution later. : ERROR = " + err.message;
                                    logger.write(logText);

                                    /* We abort the process and request a new execution at the configured amount of time. */

                                    callBackFunction(true, nextIntervalLapse);
                                    return;

                                } else {

                                    if (err.message.indexOf("ECONNRESET") > 0) {

                                        const logText = "[WARN] onExchangeCallReturned - The exchange reseted the connection. Requesting new execution later. : ERROR = " + err.message;
                                        logger.write(logText);

                                        /* We abort the process and request a new execution at the configured amount of time. */

                                        callBackFunction(true, nextIntervalLapse);
                                        return;

                                    } else {


                                        const logText = "[ERROR] onExchangeCallReturned - Unexpected error trying to contact the Exchange. This will halt this bot process. : ERROR = " + err.message;
                                        logger.write(logText);
                                        return;
                                    }
                                }

                            } catch (err) {
                                const logText = "[ERROR] onExchangeCallReturned : ERROR : exchangeResponse.error = " + exchangeResponse.error;
                                logger.write(logText);
                                return;
                            }

                            return;

                        } else {

                            /*

                            This is what we receive from the exchange. We will convert this to our standard format for later use.

                            [
                            {
                            "globalTradeID": 20825863,
                            "tradeID": 147142,
                            "currencyPair":
                            "BTC_XVC",
                            "type": "buy",
                            "rate": "0.00018500",
                            "amount": "455.34206390",
                            "total": "0.08423828",
                            "fee": "0.00200000",
                            "date": "2016-03-14 01:04:36"
                            },
                            ...]

                            */

                            let trades = [];

                            for (let i = 0; i < exchangeResponse.length; i++) {

                                let trade = {
                                    id: exchangeResponse[i].tradeID,
                                    type: exchangeResponse[i].type,
                                    rate: exchangeResponse[i].rate,
                                    amountA: exchangeResponse[i].total,
                                    amountB: exchangeResponse[i].amount,
                                    fee: exchangeResponse[i].fee,
                                    date: (new Date(exchangeResponse[i].date)).valueOf()
                                }

                                trades.push(trade);
                            }

                            callBackFunction(trades);
                        }
                    }
                    catch (err) {
                        const logText = "[ERROR] 'onExchangeCallReturned' - ERROR : " + err.message;
                        logger.write(logText);

                    }
                }
            }

            function getCandles() {

                /*

                We will read several files with candles for the current day. We will use these files as an input
                to make trading decitions later.

                */

                let candlesFiles = new Map;

                getMarketFiles();

                function getMarketFiles() {

                    /* Now we will get the market files */

                    for (i = 0; i < marketFilesPeriods.length; i++) {

                        let periodTime = marketFilesPeriods[i][0];
                        let periodName = marketFilesPeriods[i][1];

                        getFile(oliviaAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Output/Candles/Multi-Period-Market/@Period", periodName, undefined, onFileReceived);

                        function onFileReceived(file) {

                            candlesFiles.set(periodName, file);

                            if (candlesFiles.size === marketFilesPeriods.length) {

                                getDailyFiles();

                            }
                        }
                    }
                }

                function getDailyFiles() {

                    for (i = 0; i < dailyFilePeriods.length; i++) {

                        let periodTime = dailyFilePeriods[i][0];
                        let periodName = dailyFilePeriods[i][1];

                        getFile(oliviaAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Output/Candles/Multi-Period-Daily/@Period/@Year/@Month/@Day", periodName, processDatetime, onFileReceived);

                        function onFileReceived(file) {

                            candlesFiles.set(periodName, file);

                            if (candlesFiles.size === dailyFilePeriods.length + marketFilesPeriods.length) {

                                getCandlesWeAreIn();

                            }
                        }
                    }
                }

                function getCandlesWeAreIn() {

                    let counter = 0;

                    candlesFiles.forEach(getCurrentCandles);

                    function getCurrentCandles(pCandlesFile, pPeriodName, map) {

                        let candlesArray = [];

                        for (i = 0; i < pCandlesFile.length; i++) {

                            let candle = {
                                open: undefined,
                                close: undefined,
                                min: 10000000000000,
                                max: 0,
                                begin: undefined,
                                end: undefined,
                                direction: undefined
                            };

                            candle.min = pCandlesFile[i][0];
                            candle.max = pCandlesFile[i][1];

                            candle.open = pCandlesFile[i][2];
                            candle.close = pCandlesFile[i][3];

                            candle.begin = pCandlesFile[i][4];
                            candle.end = pCandlesFile[i][5];

                            if (candle.open > candle.close) { candle.direction = 'down'; }
                            if (candle.open < candle.close) { candle.direction = 'up'; }
                            if (candle.open === candle.close) { candle.direction = 'side'; }

                            /* We are going to store the last 10 candles per period, which will give the bot a good sense of where it is. */

                            let timePeriod = candle.end - candle.begin + 1; // In miliseconds. (remember each candle spans a period minus one milisecond)

                            if (candle.begin >= processDatetime.valueOf() - timePeriod * 10 && candle.end <= processDatetime.valueOf()) {

                                candlesArray.push(candle);

                            }
                        }

                        candlesMap.set(pPeriodName, candlesArray);

                        counter++;

                        if (counter === candlesFiles.size) {

                            getPatterns();

                        }
                    }
                }
            }

            function getPatterns() {

                /*

                We will read several files with pattern calculations for the current day. We will use these files as an input
                to make trading decitions later.

                */

                let stairsFiles = new Map;

                getMarketFiles();

                function getMarketFiles() {

                    /* Now we will get the market files */

                    for (i = 0; i < marketFilesPeriods.length; i++) {

                        let periodTime = marketFilesPeriods[i][0];
                        let periodName = marketFilesPeriods[i][1];

                        getFile(tomAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Tom/dataSet.V1/Output/Candle-Stairs/Multi-Period-Market/@Period", periodName, undefined, onFileReceived);

                        function onFileReceived(file) {

                            stairsFiles.set(periodName, file);

                            if (stairsFiles.size === marketFilesPeriods.length) {

                                getDailyFiles();

                            }
                        }
                    }
                }

                function getDailyFiles() {

                    for (i = 0; i < dailyFilePeriods.length; i++) {

                        let periodTime = dailyFilePeriods[i][0];
                        let periodName = dailyFilePeriods[i][1];

                        getFile(tomAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Tom/dataSet.V1/Output/Candle-Stairs/Multi-Period-Daily/@Period/@Year/@Month/@Day", periodName, processDatetime, onFileReceived);

                        function onFileReceived(file) {

                            stairsFiles.set(periodName, file);

                            if (stairsFiles.size === dailyFilePeriods.length + marketFilesPeriods.length) {

                                getStairsWeAreIn();

                            }
                        }
                    }
                }

                function getStairsWeAreIn() {

                    let counter = 0;

                    stairsFiles.forEach(getCurrentStairs);

                    function getCurrentStairs(pStairsFile, pPeriodName, map) {

                        for (i = 0; i < pStairsFile.length; i++) {

                            let stairs = {
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

                            stairs.open = pStairsFile[i][0];
                            stairs.close = pStairsFile[i][1];

                            stairs.min = pStairsFile[i][2];
                            stairs.max = pStairsFile[i][3];

                            stairs.begin = pStairsFile[i][4];
                            stairs.end = pStairsFile[i][5];

                            stairs.direction = pStairsFile[i][6];
                            stairs.candleCount = pStairsFile[i][7];

                            stairs.firstMin = pStairsFile[i][8];
                            stairs.firstMax = pStairsFile[i][9];

                            stairs.lastMin = pStairsFile[i][10];
                            stairs.lastMax = pStairsFile[i][11];

                            if (processDatetime.valueOf() >= stairs.begin && processDatetime.valueOf() <= stairs.end) {

                                stairsMap.set(pPeriodName, stairs);

                            }
                        }

                        counter++;

                        if (counter === stairsFiles.size) {

                            businessLogic();

                        }
                    }
                }

            }

            function getFile(pFileService, pFileName, pFilePath, pPeriodName, pDatetime, callBackFunction) {

                pFileName = pFileName.replace("@AssetA", market.assetA);
                pFileName = pFileName.replace("@AssetB", market.assetB);

                pFilePath = pFilePath.replace("@Exchange", EXCHANGE_NAME);
                pFilePath = pFilePath.replace("@Period", pPeriodName);

                if (pDatetime !== undefined) {

                    pFilePath = pFilePath.replace("@Year", pDatetime.getUTCFullYear());
                    pFilePath = pFilePath.replace("@Month", utilities.pad(pDatetime.getUTCMonth() + 1, 2));
                    pFilePath = pFilePath.replace("@Day", utilities.pad(pDatetime.getUTCDate(), 2));

                }

                pFileService.getTextFile(pFilePath, pFileName, onFileReceived);

                function onFileReceived(text) {

                    let data;

                    try {

                        data = JSON.parse(text);

                    } catch (err) {

                        data = JSON.parse("[]");

                    }

                    callBackFunction(data);

                }
            }

            function businessLogic() {

                /*

                This bot will trade at the 10 min Time Period, receive an investment in BTC and will try to produce profits in BTC as well.
                So we will produce the best posible strategy using only stairs pattern so as to have a working example. To simplify this
                first bot, we will also use all the available balance at once. That means that we will have at most one open position at the same
                time.

                First thing we need to know is to see where we are:

                Do we have open positions?

                If not, shall we create one?
                If yes, shall we move them?

                */

                if (executionContext.positions.length > 0) {

                    if (executionContext.positions[0].type === "buy") {

                        validateBuyPosition();

                    } else {

                        validateSellPosition();

                    }

                } else {

                    /*

                    This bot is expected to always have an open position, either buy or sell. If it does not have one, that means that it is
                    running for the first time. In which case, we will create one sell position at a very high price. Later, once the bot executes
                    again, it will take it and move it to a reasonable place and monitor it during each execution round.

                    Lets see first which is the current price.

                    */

                    let candleArray = candlesMap.get("01-min");
                    let candle = candleArray[candleArray.length - 1]; // The last candle of the 10 candles array for the 1 min Time Period.

                    let currentRate = candle.close;

                    /* Now we verify that this candle is not too old. Lets say no more than 5 minutes old. */

                    if (candle.begin < processDatetime.valueOf() - 5 * 60 * 1000) {

                        const logText = "[WARN] businessLogic - Last one min candle more than 5 minutes old. Bot cannot operate with this delay. Retrying later." ;
                        logger.write(logText);

                        /* We abort the process and request a new execution at the configured amount of time. */

                        callBackFunction(true, nextIntervalLapse);
                        return;

                    }

                    /*

                    As we just want to create the first order now and we do not want this order to get executed, we will put it at
                    the +50% of current exchange rate. Next Bot execution will move it strategically.

                    */

                    let rate = candle.close * 1.50;

                    /*

                    The Status Report contains the main parameters for the bot, which are:

                    Which is the amount of each Asset the bot is authorized to start with. If the bots gets profits, it might use the profits
                    to trade as well.

                    Which asset is the one which profits should be accumulated. That is the base Asset, where the bot is standing while not
                    trading. In the case of this simple bot, its base asset will be BTC.

                    */

                    let AmountA = statusReport.initialBalance.amountA;
                    let AmountB = statusReport.initialBalance.amountB;

                    /* We are going to sell all AmountB */

                    AmountA = AmountB * rate;

                    putPositionAtExchange("sell", rate, AmountA, AmountB, writeStatusAndContext);

                }

                function validateBuyPosition() {


                }

                function validateSellPosition() {


                }

            }

            function putPositionAtExchange(pType, pRate, pAmountA, pAmountB, callBackFunction) {

                if (pType === "buy") {

                    poloniexApiClient.buy(market.assetA, market.assetB, pRate, pAmountB, onExchangeCallReturned);

                } else {

                    poloniexApiClient.sell(market.assetA, market.assetB, pRate, pAmountB, onExchangeCallReturned);

                }

                function onExchangeCallReturned(err, exchangeResponse) {

                    try {

                        if (err || exchangeResponse.error !== undefined) {
                            try {

                                if (err.message.indexOf("ETIMEDOUT") > 0) {

                                    const logText = "[WARN] onExchangeCallReturned - Timeout reached while trying to access the Exchange API. Requesting new execution later. : ERROR = " + err.message;
                                    logger.write(logText);

                                    /* We abort the process and request a new execution at the configured amount of time. */

                                    callBackFunction(true, nextIntervalLapse);
                                    return;

                                } else {

                                    if (err.message.indexOf("ECONNRESET") > 0) {

                                        const logText = "[WARN] onExchangeCallReturned - The exchange reseted the connection. Requesting new execution later. : ERROR = " + err.message;
                                        logger.write(logText);

                                        /* We abort the process and request a new execution at the configured amount of time. */

                                        callBackFunction(true, nextIntervalLapse);
                                        return;

                                    } else {


                                        const logText = "[ERROR] onExchangeCallReturned - Unexpected error trying to contact the Exchange. This will halt this bot process. : ERROR = " + err.message;
                                        logger.write(logText);
                                        return;
                                    }
                                }

                            } catch (err) {
                                const logText = "[ERROR] onExchangeCallReturned : ERROR : exchangeResponse.error = " + exchangeResponse.error;
                                logger.write(logText);
                                return;
                            }

                            return;

                        } else {

                            /*

                            This is what we can receive from the exchange. We will ignore the trades list for now, and analize
                            what happened at the next bot execution. 

                            {
                            "orderNumber":31226040,
                            "resultingTrades":
                                [{
                                    "amount":"338.8732",
                                    "date":"2014-10-18 23:03:21",
                                    "rate":"0.00000173",
                                    "total":"0.00058625",
                                    "tradeID":"16164",
                                    "type":"buy"
                                }]
                            }

                            */

                            /*

                            We will add this new position to the executionContext.

                            */

                            let position = {
                                id: exchangeResponse.orderNumber,
                                type: pType,
                                rate: pRate,
                                amountA: pAmountA,
                                amountB: pAmountB,
                                date: (processDatetime.valueOf())
                                };

                            executionContext.positions.push(position);

                            callBackFunction();
                        }
                    }
                    catch (err) {
                        const logText = "[ERROR] 'onExchangeCallReturned' - ERROR : " + err.message;
                        logger.write(logText);

                    }
                }

            }

            function writeStatusAndContext() {

                writeExecutionContext();

                function writeExecutionContext() {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'writeExecutionContext'");
                    }

                    try {

                        let fileName = "Execution.Context.json"
                        let dateForPath = processDatetime.getUTCFullYear() + '/' + utilities.pad(processDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDatetime.getUTCDate(), 2) + '/' + utilities.pad(processDatetime.getUTCHours(), 2) + '/' + utilities.pad(processDatetime.getUTCMinutes, 2);
                        let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + dateForPath;

                        utilities.createFolderIfNeeded(reportFilePath, mariamAzureFileStorage, onFolderCreated);

                        function onFolderCreated() {

                            try {

                                let fileContent = JSON.stringify(executionContext);

                                oliviaAzureFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onFileCreated);

                                function onFileCreated() {

                                    if (LOG_INFO === true) {
                                        logger.write("[INFO] 'writeExecutionContext' - Content written: " + fileContent);
                                    }

                                    writeExucutionHistory();
                                }
                            }
                            catch (err) {
                                const logText = "[ERROR] 'writeExecutionContext - onFolderCreated' - ERROR : " + err.message;
                                logger.write(logText);
                            }
                        }

                    }
                    catch (err) {
                        const logText = "[ERROR] 'writeExecutionContext' - ERROR : " + err.message;
                        logger.write(logText);
                    }
                }

                function writeExucutionHistory() {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'writeExucutionHistory'");
                    }

                    try {

                        let fileName = "Execution.History.json"
                        let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + bot.process;

                        utilities.createFolderIfNeeded(reportFilePath, mariamAzureFileStorage, onFolderCreated);

                        function onFolderCreated() {

                            try {

                                executionHistory.push(newHistoryRecord);

                                let fileContent = JSON.stringify(executionHistory);

                                oliviaAzureFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onFileCreated);

                                function onFileCreated() {

                                    if (LOG_INFO === true) {
                                        logger.write("[INFO] 'writeExucutionHistory' - Content written: " + fileContent);
                                    }

                                    writeStatusReport();
                                }
                            }
                            catch (err) {
                                const logText = "[ERROR] 'writeExucutionHistory - onFolderCreated' - ERROR : " + err.message;
                                logger.write(logText);
                            }
                        }

                    }
                    catch (err) {
                        const logText = "[ERROR] 'writeExucutionHistory' - ERROR : " + err.message;
                        logger.write(logText);
                    }
                }

                function writeStatusReport() {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'writeStatusReport'");
                    }

                    try {

                        let fileName = "Status.Report.json"
                        let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Processes/" + bot.process;

                        utilities.createFolderIfNeeded(reportFilePath, mariamAzureFileStorage, onFolderCreated);

                        function onFolderCreated() {

                            try {

                                statusReport.lastExecution = processDatetime;

                                let fileContent = JSON.stringify(statusReport);

                                oliviaAzureFileStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onFileCreated);

                                function onFileCreated() {

                                    if (LOG_INFO === true) {
                                        logger.write("[INFO] 'writeStatusReport' - Content written: " + fileContent);
                                    }

                                    callBackFunction(true); // We tell the AA Platform that we request a regular execution and finish the bot s process.
                                    return;
                                }
                            }
                            catch (err) {
                                const logText = "[ERROR] 'writeStatusReport - onFolderCreated' - ERROR : " + err.message;
                                logger.write(logText);
                            }
                        }

                    }
                    catch (err) {
                        const logText = "[ERROR] 'writeStatusReport' - ERROR : " + err.message;
                        logger.write(logText);
                    }
                }

            } 
        }
        catch (err) {
            const logText = "[ERROR] 'Start' - ERROR : " + err.message;
            logger.write(logText);
        }
    }
};
