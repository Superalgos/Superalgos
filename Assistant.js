exports.newAssistant = function newAssistant(BOT, DEBUG_MODULE, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    /* 

    This module allows trading bots to execute actions on the exchange, and also on its current recorded state.

    */

    const MODULE_NAME = "Assistant";

    let thisObject = {
        dataDependencies: undefined,
        initialize: initialize,
        putPosition: putPosition,
        movePosition: movePosition,
        getPositions: getPositions,
        getBalance: getBalance,
        getAvailableBalance: getAvailableBalance,
        getInvestment: getInvestment,
        getProfits: getProfits,
        getMarketRate: getMarketRate 
    };

    let bot = BOT;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    let utilities = UTILITIES.newUtilities(bot);

    let exchangePositions = [];     // These are the open positions at the exchange at the account the bot is authorized to use.
    let openPositions = [];         // These are the open positions the bot knows it made by itself. 

    let context;
    let exchangeAPI;

    let marketRate; 

    return thisObject;

    function initialize(pContext, pExchangeAPI, pDataDependencies, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            /* Store local values. */

            context = pContext;
            exchangeAPI = pExchangeAPI;
            thisObject.dataDependencies = pDataDependencies;

            getMarketRate();

            function getMarketRate() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getMarketRate -> Entering function."); }

                    /* Procedure to get the current market rate. */

                    let key =
                        global.PLATFORM_CONFIG.marketRateProvider.devTeam + "-" +
                        global.PLATFORM_CONFIG.marketRateProvider.bot + "-" +
                        global.PLATFORM_CONFIG.marketRateProvider.product + "-" +
                        global.PLATFORM_CONFIG.marketRateProvider.dataSet + "-" +
                        global.PLATFORM_CONFIG.marketRateProvider.dataSetVersion;

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getMarketRate -> key = " + key); }

                    let dataSet = thisObject.dataDependencies.dataSets.get(key);

                    let dateForPath = bot.processDatetime.getUTCFullYear() + '/' + utilities.pad(bot.processDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(bot.processDatetime.getUTCDate(), 2);
                    let fileName = '' + global.MARKET.assetA + '_' + global.MARKET.assetB + '.json';
                    let filePath = global.PLATFORM_CONFIG.marketRateProvider.product + "/" + global.PLATFORM_CONFIG.marketRateProvider.dataSet + "/" + dateForPath;

                    dataSet.getTextFile(filePath, fileName, onFileReceived, true);

                    function onFileReceived(err, text) {

                        if (FULL_LOG === true) { logger.write("[INFO] initialize -> getMarketRate -> onFileReceived -> Entering function."); }
                        if (LOG_FILE_CONTENT === true) { logger.write("[INFO] initialize -> getMarketRate -> onFileReceived -> text = " + text); }

                        let candleArray;

                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                            try {
                                candleArray = JSON.parse(text);

                                switch (bot.runMode) {

                                    case "Live": {

                                        logger.write("[INFO] initialize -> getMarketRate -> onFileReceived -> Live Mode detected.");

                                        let lastCandleRecord = candleArray[candleArray.length - 1];                   // The last candle contains at its close value the market rate.

                                        let candle = {
                                            open: lastCandleRecord[2],
                                            close: lastCandleRecord[3],
                                            min: lastCandleRecord[0],
                                            max: lastCandleRecord[1],
                                            begin: lastCandleRecord[4],
                                            end: lastCandleRecord[5]
                                        };

                                        marketRate = candle.close;
                                        marketRate = Number(marketRate.toFixed(8));
                                        context.newHistoryRecord.marketRate = marketRate;

                                        /*
                                        Now we verify that this candle is not too old. Lets say no more than 10 minutes old. This could happen if the datasets for
                                        any reason stops being updated.
                                        */

                                        let delay = (bot.processDatetime.valueOf() - candle.begin) / 1000 / 60;

                                        logger.write("[INFO] initialize -> getMarketRate -> onFileReceived -> Market Rate " + delay + " minutes old.");

                                        if (delay > 30) {

                                            logger.write("[ERROR] initialize -> getMarketRate -> onFileReceived -> Market Rate more than 10 minutes old. Retrying later.");

                                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                            return;
                                        }

                                        validateExchangeSyncronicity();
                                        return;
                                    }

                                    case "Backtest": {

                                        logger.write("[INFO] initialize -> getMarketRate -> onFileReceived -> Backtest Mode detected.");

                                        /* We need to find the candle at which the process is currently running. */

                                        for (let i = 0; i < candleArray.length; i++) {

                                            let candle = {
                                                open: candleArray[i][2],
                                                close: candleArray[i][3],
                                                min: candleArray[i][0],
                                                max: candleArray[i][1],
                                                begin: candleArray[i][4],
                                                end: candleArray[i][5]
                                            };

                                            if (bot.processDatetime.valueOf() >= candle.begin && bot.processDatetime.valueOf() < candle.end) {

                                                marketRate = (candle.open + candle.close) / 2;
                                                marketRate = Number(marketRate.toFixed(8));
                                                context.newHistoryRecord.marketRate = marketRate;

                                                /* The Backtest Mode simulates that every trade posted is executed. 
                                                In order to do this, we will take all open orders from the context and create a trades array similar to the one returned by the Exchange. */

                                                validateExchangeSyncronicity();
                                                return;
                                            }
                                        }

                                        logger.write("[ERROR] initialize -> getMarketRate -> onFileReceived -> No candle found for the current Process Datetime.");
                                        logger.write("[ERROR] initialize -> getMarketRate -> onFileReceived -> bot.processDatetime = " + bot.processDatetime);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }

                                    case "Competition": {

                                        logger.write("[INFO] initialize -> getMarketRate -> onFileReceived -> Competition Mode detected.");

                                        let lastCandleRecord = candleArray[candleArray.length - 1];                   // The last candle contains at its close value the market rate.

                                        let candle = {
                                            open: lastCandleRecord[2],
                                            close: lastCandleRecord[3],
                                            min: lastCandleRecord[0],
                                            max: lastCandleRecord[1],
                                            begin: lastCandleRecord[4],
                                            end: lastCandleRecord[5]
                                        };

                                        marketRate = candle.close;
                                        marketRate = Number(marketRate.toFixed(8));
                                        context.newHistoryRecord.marketRate = marketRate;

                                        /*
                                        Now we verify that this candle is not too old. Lets say no more than 10 minutes old. This could happen if the datasets for
                                        any reason stops being updated.
                                        */

                                        let delay = (bot.processDatetime.valueOf() - candle.begin) / 1000 / 60;

                                        logger.write("[INFO] initialize -> getMarketRate -> onFileReceived -> Market Rate " + delay + " minutes old.");

                                        if (delay > 30) {

                                            logger.write("[ERROR] initialize -> getMarketRate -> onFileReceived -> Market Rate more than 10 minutes old. Retrying later.");

                                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                            return;
                                        }

                                        validateExchangeSyncronicity();
                                        return;
                                    }

                                    default: {
                                        logger.write("[ERROR] initialize -> getMarketRate -> onFileReceived -> Unexpected bot.runMode.");
                                        logger.write("[ERROR] initialize -> getMarketRate -> onFileReceived -> bot.runMode = " + bot.runMode);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }
                                }

                            } catch (err) {
                                logger.write("[ERROR] initialize -> getMarketRate -> onFileReceived -> err = " + err.message);
                                logger.write("[ERROR] initialize -> getMarketRate -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            }
                        } else {
                            logger.write("[ERROR] initialize -> getMarketRate -> onFileReceived -> err = " + err.message);
                            callBackFunction(err);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> getMarketRate -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function validateExchangeSyncronicity() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> validateExchangeSyncronicity -> Entering function."); }

                    /* Procedure to validate we are in sync with the exchange. */

                    getPositionsAtExchange(onDone);

                    function onDone(err) {
                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] initialize -> validateExchangeSyncronicity -> onDone -> Entering function."); }

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    logger.write("[INFO] initialize -> validateExchangeSyncronicity -> onDone -> Execution finished well. :-)");
                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                    logger.write("[ERROR] initialize -> validateExchangeSyncronicity -> onDone -> Retry Later. Requesting Execution Retry.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                    logger.write("[ERROR] initialize -> validateExchangeSyncronicity -> onDone -> Operation Failed. Aborting the process.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                            }

                        } catch (err) {
                            logger.write("[ERROR] initialize -> validateExchangeSyncronicity -> onDone -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> onDone -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getPositionsAtExchange(callBack) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] getPositionsAtExchange -> Entering function."); }

            /*

            Here we grab all the positions at the exchange for the account we are using for trading. We will not asume all the positions
            were made by this bot, but we need them all to later check if all the ones made by the bot are still there, were executed or
            manually cancelled by the exchange account owner.

            */

            switch (bot.runMode) {

                case "Live": {

                    if (FULL_LOG === true) { logger.write("[INFO] getPositionsAtExchange -> Live Mode Detected."); }
                    exchangeAPI.getOpenPositions(global.MARKET, onResponse);
                    break;
                }

                case "Backtest": {

                    if (FULL_LOG === true) { logger.write("[INFO] getPositionsAtExchange -> Backtest Mode Detected."); }
                    let exchangePositions = [];  // We simulate all positions were executed.
                    onResponse(global.DEFAULT_OK_RESPONSE, exchangePositions);
                    break;
                }

                case "Competition": {

                    if (FULL_LOG === true) { logger.write("[INFO] getPositionsAtExchange -> Competition Mode Detected."); }
                    exchangeAPI.getOpenPositions(global.MARKET, onResponse);
                    break;
                }

                default: {
                    logger.write("[ERROR] getPositionsAtExchange -> Unexpected bot.runMode.");
                    logger.write("[ERROR] getPositionsAtExchange -> bot.runMode = " + bot.runMode);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function onResponse(err, pExchangePositions) {

                if (FULL_LOG === true) { logger.write("[INFO] getPositionsAtExchange ->  onResponse -> Entering function."); }
                if (FULL_LOG === true) { logger.write("[INFO] getPositionsAtExchange ->  onResponse -> pExchangePositions = " + JSON.stringify(pExchangePositions)); }

                switch (err.result) {
                    case global.DEFAULT_OK_RESPONSE.result: {            // Everything went well, we have the information requested.
                        logger.write("[INFO] getPositionsAtExchange -> onResponse -> Execution finished well. :-)");
                        exchangePositions = pExchangePositions;
                        ordersExecutionCheck(callBack);
                        return;
                    }
                        break;
                    case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                        logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Retry Later. Requesting Execution Retry.");
                        callBack(err);
                        return;
                    }
                        break;
                    case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                        logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                        callBack(err);
                        return;
                    }
                        break;
                }
            }
        } catch (err) {
            logger.write("[ERROR] getPositionsAtExchange -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }
    
    function ordersExecutionCheck(callBack) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> Entering function."); }

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

            for (let a = 0; a < context.executionContext.positions.length; a++) {

                if (context.executionContext.positions[a].status === "open") {

                    openPositions.push(context.executionContext.positions[a]);

                }
            }

            context.executionContext.positions = openPositions;

            /* Now we can start checking what happened at the exchange. */

            let i = 0;

            controlLoop();

            function loopBody() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> Entering function."); }

                    let position = context.executionContext.positions[i];
                    let exchangePosition;

                    for (let j = 0; j < exchangePositions.length; j++) {

                        if (position.id === exchangePositions[j].id) {

                            exchangePosition = exchangePositions[j];
                            positionFound();
                            return;
                        }
                    }

                    positionNotFound();
                    return;

                    function positionFound() {

                        if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> positionFound -> Entering function."); }

                        /*
    
                        We need to know if the order was partially executed. To know that, we compare the amounts on file with the ones
                        received from the exchange. If they are the same, then the order is intact. Otherwise, to confirm a partial execution,
                        we will request the associated trades from the exchange.
    
                        */

                        if (position.amountB === parseFloat(exchangePosition.amountB)) {

                            /* Position is still there, untouched. Nothing to do here. */

                            next();
                            return;

                        } else {

                            getPositionTradesAtExchange(position.id, confirmOrderWasPartiallyExecuted);
                            return;

                        }
                    }

                    function positionNotFound() {

                        if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> positionNotFound -> Entering function."); }

                        /* Position not found: we need to know if the order was executed. */

                        getPositionTradesAtExchange(position.id, confirmOrderWasExecuted);

                    }

                    function getPositionTradesAtExchange(pPositionId, innerCallBack) {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Entering function."); }
                            if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> pPositionId = " + pPositionId); }

                            /*
                
                            Given one position, we request all the associated trades to it.
                
                            */

                            switch (bot.runMode) {

                                case "Live": {

                                    if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Live Mode Detected."); }
                                    exchangeAPI.getExecutedTrades(pPositionId, onResponse);
                                    return;

                                }

                                case "Backtest": {

                                    if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Backtest Mode Detected."); }

                                    let trades = [];

                                    /* We look for the position at the executionContext */

                                    for (let i = 0; i < context.executionContext.positions.length; i++) {

                                        let thisPosition = context.executionContext.positions[i];

                                        if (thisPosition.id === pPositionId) {

                                            let trade = {
                                                id: Math.trunc(Math.random(1) * 1000000),
                                                type: thisPosition.type,
                                                rate: thisPosition.rate,
                                                amountA: thisPosition.amountA,
                                                amountB: thisPosition.amountB,
                                                fee: 0,
                                                date: (new Date()).valueOf()
                                            }

                                            trades.push(trade);

                                            onResponse(global.DEFAULT_OK_RESPONSE, trades);

                                            return;
                                        }
                                    }

                                    logger.write("[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Position not found at Executioin Context.");
                                    callBack(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }

                                case "Competition": {

                                    if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Competition Mode Detected."); }
                                    exchangeAPI.getExecutedTrades(pPositionId, onResponse);
                                    return;
                                }

                                default: {
                                    logger.write("[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Unexpected bot.runMode.");
                                    logger.write("[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> bot.runMode = " + bot.runMode);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }

                            function onResponse(err, pTrades) {

                                try {
                                    if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {            // Everything went well, we have the information requested.
                                            logger.write("[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> Execution finished well. :-)");
                                            innerCallBack(pTrades);
                                        }
                                            break;
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write("[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> Retry Later. Requesting Execution Retry.");
                                            callBack(global.DEFAULT_RETRY_RESPONSE);
                                            return;
                                        }
                                            break;
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write("[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                                            callBack(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                            break;
                                    }
                                } catch (err) {
                                    logger.write("[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> err = " + err.message);
                                    callBack(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function confirmOrderWasExecuted(pTrades) {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> Entering function."); }
                            if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> pTrades = " + JSON.stringify(pTrades)); }

                            /*
 
                            To confirm everything is ok, we will add all the amounts on trades asociated to the order and
                            they must be equal to the one on file. Otherwise something very strange could have happened,
                            in which case we will halt the bot execution.
 
                            */

                            let sumAssetA = 0;
                            let sumAssetB = 0;

                            for (let k = 0; k < pTrades.length; k++) {

                                sumAssetA = sumAssetA + Number(pTrades[k].amountA);
                                sumAssetB = sumAssetB + Number(pTrades[k].amountB);

                                /* We add the fees */

                                sumAssetA = sumAssetA - Number(pTrades[k].fee);

                            }

                            if (
                                position.amountB !== sumAssetB
                            ) {
                                logger.write("[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> Cannot be confirmed that the order was executed. It must be manually cancelled by the user or cancelled by the exchange itself.");
                                logger.write("[HINT] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> If the process was abruptally cancelled and then restarted, it is possible that now is not sincronized with the exchange.");
                                logger.write("[HINT] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> In any case, to continue, you must delete the Status Report file so as to start over. Also, you must manually delete the orders at the exchange.");
                                callBack(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            /*
 
                            Confirmed that order was executed. Next thing to do is to remember the trades and change its status.
 
                            */

                            position.status = "executed";

                            if (position.type === "sell") {
                                context.newHistoryRecord.sellExecRate = position.rate;
                            } else {
                                context.newHistoryRecord.buyExecRate = position.rate;
                            }

                            applyTradesToContext(pTrades);

                            let newTransaction = {
                                type: position.type + " executed",
                                position: position
                            };

                            context.executionContext.transactions.push(newTransaction);

                            /* All done. */

                            next();

                        } catch (err) {
                            logger.write("[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                    function confirmOrderWasPartiallyExecuted(pTrades) {

                        try {
                            if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> Entering function."); }

                            /*
 
                            To confirm everything is ok, we will add all the amounts on trades plus the remaining amounts
                            at the order at the exchange and they must be equal to the one on file. Otherwise something very strange could
                            have happened, in which case we will halt the bot execution.
 
                            */

                            let sumAssetA = 0;
                            let sumAssetB = 0;

                            for (let k = 0; k < pTrades.length; k++) {

                                sumAssetA = sumAssetA + pTrades[k].amountA;
                                sumAssetB = sumAssetB + pTrades[k].amountB;

                            }

                            /* To this we add the current position amounts. */

                            sumAssetA = sumAssetA + exchangePosition.amountA;
                            sumAssetB = sumAssetB + exchangePosition.amountB;

                            /* And finally we add the fees */

                            sumAssetA = sumAssetA + exchangePosition.fee;

                            if (
                                position.amountA !== sumAssetA ||
                                position.amountB !== sumAssetB
                            ) {
                                logger.write("[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> Cannot be confirmed that a partially execution was done well.");
                                callBack(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            /*
 
                            Confirmed that order was partially executed. Next thing to do is to remember the trades and the new position.
 
                            */

                            position.amountA = exchangePosition.amountA;
                            position.amountB = exchangePosition.amountB;
                            position.date = (new Date(exchangePosition.date)).valueOf();

                            applyTradesToContext(pTrades);

                            let newTransaction = {
                                type: position.type + "  partially executed",
                                position: position
                            };

                            context.executionContext.transactions.push(newTransaction);

                            /* All done. */

                            next();

                        } catch (err) {
                            logger.write("[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                    function applyTradesToContext(pTrades) {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> loopBody -> applyTradesToContext -> Entering function."); }

                            /* Here we apply the trades that already happened at the exchange to the balance and available balance of the bot. We also calculate its profits. */

                            for (k = 0; k < pTrades.length; k++) {

                                let trade = pTrades[k];

                                position.trades.push(trade);

                                context.newHistoryRecord.newTrades++;

                                /* Calculate Balances */

                                if (trade.type === 'buy') {

                                    context.executionContext.balance.assetA = context.executionContext.balance.assetA - Number(trade.amountA);
                                    context.executionContext.balance.assetB = context.executionContext.balance.assetB + Number(trade.amountB);

                                    context.executionContext.availableBalance.assetB = context.executionContext.availableBalance.assetB + Number(trade.amountB);
                                }

                                if (trade.type === 'sell') {

                                    context.executionContext.balance.assetA = context.executionContext.balance.assetA + Number(trade.amountA);
                                    context.executionContext.balance.assetB = context.executionContext.balance.assetB - Number(trade.amountB);

                                    context.executionContext.availableBalance.assetA = context.executionContext.availableBalance.assetA + Number(trade.amountA);
                                }
                            }

                            /* Calculate Profits */

                            if (context.executionContext.investment.assetA > 0) {

                                context.executionContext.profits.assetA = (context.executionContext.balance.assetA - context.executionContext.investment.assetA) / context.executionContext.investment.assetA;
                            }

                            if (context.executionContext.investment.assetB > 0) {

                                context.executionContext.profits.assetB = (context.executionContext.balance.assetB - context.executionContext.investment.assetB) / context.executionContext.investment.assetB;
                            }

                            context.newHistoryRecord.profitsAssetA = context.executionContext.profits.assetA;
                            context.newHistoryRecord.profitsAssetB = context.executionContext.profits.assetB;

                            /* Calculate Combined Profits */

                            if (context.executionContext.investment.assetA > 0) {

                                let convertedAssetsB = (context.executionContext.balance.assetB - context.executionContext.investment.assetB) / marketRate;

                                context.executionContext.combinedProfits.assetA = (context.executionContext.balance.assetA + convertedAssetsB - context.executionContext.investment.assetA) / context.executionContext.investment.assetA;
                            }

                            if (context.executionContext.investment.assetB > 0) {

                                let convertedAssetsA = (context.executionContext.balance.assetA - context.executionContext.investment.assetA) * marketRate;

                                context.executionContext.combinedProfits.assetB = (context.executionContext.balance.assetB + convertedAssetsA - context.executionContext.investment.assetB) / context.executionContext.investment.assetB;
                            }

                            context.newHistoryRecord.combinedProfitsA = context.executionContext.combinedProfits.assetA;
                            context.newHistoryRecord.combinedProfitsB = context.executionContext.combinedProfits.assetB;

                        } catch (err) {
                            logger.write("[ERROR] ordersExecutionCheck -> loopBody -> applyTradesToContext -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] ordersExecutionCheck -> loopBody -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function next() {

                if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> next -> Entering function."); }

                i++;
                controlLoop();

            }

            function controlLoop() {

                if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> controlLoop -> Entering function."); }

                if (i < context.executionContext.positions.length) {

                    loopBody();

                } else {

                    final();

                }
            }

            function final() {

                if (FULL_LOG === true) { logger.write("[INFO] ordersExecutionCheck -> final -> Entering function."); }

                callBack(global.DEFAULT_OK_RESPONSE);

            }

        } catch (err) {
            logger.write("[ERROR] ordersExecutionCheck -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function putPosition(pType, pRate, pAmountA, pAmountB, callBackFunction) {

        try {
            if (FULL_LOG === true) { logger.write("[INFO] putPosition -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] putPosition -> pType = " + pType); }
            if (FULL_LOG === true) { logger.write("[INFO] putPosition -> pRate = " + pRate); }
            if (FULL_LOG === true) { logger.write("[INFO] putPosition -> pAmountA = " + pAmountA); }
            if (FULL_LOG === true) { logger.write("[INFO] putPosition -> pAmountB = " + pAmountB); }

            /* Removing extra decimals. */

            pRate = Number(pRate.toFixed(8));
            pAmountA = Number(pAmountA.toFixed(8));
            pAmountB = Number(pAmountB.toFixed(8));

            /* Validations that the limits are not surpassed. */

            if (pType === 'buy') {

                if (pAmountA > context.executionContext.availableBalance.assetA) {

                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountA is grater than the Available Balance.");
                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountA = " + pAmountA);
                    logger.write("[ERROR] putPosition -> Input Validations -> Available Balance = " + context.executionContext.availableBalance.assetA);

                    let err = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: 'pAmountA is grater than the Available Balance.'
                    };

                    callBackFunction(err);
                    return;
                }

                let aRate = Number((pAmountA / pRate).toFixed(8));

                if (aRate !== pAmountB) {

                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountA / pRate !== pAmountB.");
                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountA = " + pAmountA);
                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountB = " + pAmountB);
                    logger.write("[ERROR] putPosition -> Input Validations -> pRate = " + pRate);

                    let err = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: 'pAmountB * pRate !== pAmountA'
                    };

                    callBackFunction(err);
                    return;
                }
            }

            if (pType === 'sell') {

                if (pAmountB > context.executionContext.availableBalance.assetB) {

                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountB is grater than the Available Balance.");
                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountB = " + pAmountB);
                    logger.write("[ERROR] putPosition -> Input Validations -> Available Balance = " + context.executionContext.availableBalance.assetB);

                    let err = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: 'pAmountB is grater than the Available Balance.'
                    };

                    callBackFunction(err);
                    return;
                }

                let bRate = Number((pAmountB * pRate).toFixed(8));

                if (bRate !== pAmountA) {

                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountB * pRate !== pAmountA.");
                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountA = " + pAmountA);
                    logger.write("[ERROR] putPosition -> Input Validations -> pAmountB = " + pAmountB);
                    logger.write("[ERROR] putPosition -> Input Validations -> pRate = " + pRate);

                    let err = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: 'pAmountB * pRate !== pAmountA'
                    };

                    callBackFunction(err);
                    return;
                }
            }

            /* All validations passed, we proceed. */

            switch (bot.runMode) {

                case "Live": {

                    exchangeAPI.putPosition(global.MARKET, pType, pRate, pAmountA, pAmountB, onResponse);
                    return;
                }

                case "Backtest": {

                    if (pRate !== marketRate) {

                        logger.write("[ERROR] putPosition -> Input Validations -> putPosition Rate can not be different to marketRate while in Backtesting Mode. ");
                        onResponse(global.DEFAULT_FAIL_RESPONSE, positionId);
                    }

                    let positionId = Math.trunc(Math.random(1) * 1000000);
                    if (FULL_LOG === true) { logger.write("[INFO] putPosition ->  Simulating Exchange Response -> orderId = " + positionId); }
                    onResponse(global.DEFAULT_OK_RESPONSE, positionId);
                    return;
                }

                case "Competition": {

                    exchangeAPI.putPosition(global.MARKET, pType, pRate, pAmountA, pAmountB, onResponse);
                    return;
                }

                default: {
                    logger.write("[ERROR] putPosition -> Unexpected bot.runMode.");
                    logger.write("[ERROR] putPosition -> bot.runMode = " + bot.runMode);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function onResponse(err, pPositionId) {

                try {
                    if (FULL_LOG === true) { logger.write("[INFO] putPosition ->  onResponse -> Entering function."); }
                    if (FULL_LOG === true) { logger.write("[INFO] putPosition ->  onResponse -> pPositionId = " + pPositionId); }

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: {            // Everything went well, we have the information requested.
                            logger.write("[INFO] putPosition -> onResponse -> Execution finished well. :-)");

                            let position = {
                                id: pPositionId,
                                type: pType,
                                rate: pRate,
                                amountA: pAmountA,
                                amountB: pAmountB,
                                date: (bot.processDatetime.valueOf()),
                                status: "open",
                                trades: []
                            };

                            context.executionContext.positions.push(position);

                            let newTransaction = {
                                type: "newPosition",
                                position: position
                            };

                            context.executionContext.transactions.push(newTransaction);

                            context.newHistoryRecord.newPositions++;

                            recalculateRateAverages(); 

                            /* Recalculate Available Balances */

                            if (position.type === 'buy') {

                                context.executionContext.availableBalance.assetA = context.executionContext.availableBalance.assetA - pAmountA;
                                context.newHistoryRecord.lastBuyRate = pRate;
                            } 

                            if (position.type === 'sell') {

                                context.executionContext.availableBalance.assetB = context.executionContext.availableBalance.assetB - pAmountB;
                                context.newHistoryRecord.lastSellRate = pRate;
                            }

                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] putPosition -> onResponse -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] putPosition -> onResponse -> Operation Failed. Aborting the process.");
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                            break;
                    }
                } catch (err) {
                    logger.write("[ERROR] putPosition -> onResponse -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        } catch (err) {
            logger.write("[ERROR] putPosition -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function movePosition(pPosition, pNewRate, callBackFunction) {

        try {
            if (FULL_LOG === true) { logger.write("[INFO] movePosition -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] movePosition -> pPosition = " + JSON.stringify(pPosition)); }
            if (FULL_LOG === true) { logger.write("[INFO] movePosition -> pNewRate = " + pNewRate); }

            switch (bot.runMode) {

                case "Live": {

                    exchangeAPI.movePosition(pPosition, pNewRate, onResponse);
                    return;
                }

                case "Backtest": {

                    let positionId = Math.trunc(Math.random(1) * 1000000);
                    if (FULL_LOG === true) { logger.write("[INFO] putPosition ->  Simulating Exchange Response -> orderId = " + positionId); }
                    onResponse(global.DEFAULT_OK_RESPONSE, positionId);
                    return;
                }

                case "Competition": {

                    exchangeAPI.movePosition(pPosition, pNewRate, onResponse);
                    return;
                }

                default: {
                    logger.write("[ERROR] movePosition -> Unexpected bot.runMode.");
                    logger.write("[ERROR] movePosition -> bot.runMode = " + bot.runMode);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function onResponse(err, pPositionId) {

                try {
                    if (FULL_LOG === true) { logger.write("[INFO] movePosition -> onResponse -> Entering function."); }
                    if (FULL_LOG === true) { logger.write("[INFO] movePosition -> onResponse -> pPositionId = " + pPositionId); }

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: {            // Everything went well, we have the information requested.
                            logger.write("[INFO] movePosition -> onResponse -> Execution finished well. :-)");

                            let newPosition = {
                                id: pPositionId,
                                type: pPosition.type,
                                rate: pNewRate,
                                amountA: pPosition.amountB * pNewRate,
                                amountB: pPosition.amountB,
                                date: (bot.processDatetime.valueOf()),
                                status: "open",
                                trades: []
                            };

                            let oldPosition = JSON.parse(JSON.stringify(pPosition));

                            /* We need to update the position we have on file. */

                            for (let i = 0; i < context.executionContext.positions.length; i++) {

                                if (context.executionContext.positions[i].id === pPosition.id) {

                                    context.executionContext.positions[i] = newPosition;

                                    break;
                                }
                            }

                            let newTransaction = {
                                type: "movePosition",
                                oldPosition: oldPosition,
                                newPosition: newPosition
                            };

                            context.executionContext.transactions.push(newTransaction);

                            context.newHistoryRecord.movedPositions++;

                            recalculateRateAverages(); 

                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                        }
                            break;
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] movePosition -> onResponse -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] movePosition -> onResponse -> Operation Failed. Aborting the process.");
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                            break;
                    }
                } catch (err) {
                    logger.write("[ERROR] movePosition -> onResponse -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        } catch (err) {
            logger.write("[ERROR] movePosition -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function recalculateRateAverages() {

        /* This function calculates the weighted rates of buy and sell positions. This is a way to summarize with only one rate, where the positions are. */

        let sumBuyWeightedRates = 0;
        let sumSellWeightedRates = 0;

        let sumBuyWeights = 0;
        let sumSellWeights = 0;

        for (let i = 0; i < context.executionContext.positions.length; i++) {

            let position = context.executionContext.positions[i];

            if (position.type === 'buy') {

                sumBuyWeightedRates = sumBuyWeightedRates + position.rate * position.amountB
                sumBuyWeights = sumBuyWeights + position.amountB;

            }

            if (position.type === 'sell') {

                sumSellWeightedRates = sumSellWeightedRates + position.rate * position.amountB
                sumSellWeights = sumSellWeights + position.amountB;

            }

        }

        context.newHistoryRecord.buyAvgRate = (sumBuyWeightedRates / sumBuyWeights || 0);
        context.newHistoryRecord.sellAvgRate = (sumSellWeightedRates / sumSellWeights || 0);
    }

    function getPositions() {
        return JSON.parse(JSON.stringify(context.executionContext.positions));
    }

    function getBalance() {
        return JSON.parse(JSON.stringify(context.executionContext.balance));
    }

    function getAvailableBalance() {
        return JSON.parse(JSON.stringify(context.executionContext.availableBalance));
    }

    function getInvestment() {
        return JSON.parse(JSON.stringify(context.executionContext.investment));
    }

    function getProfits() {
        return JSON.parse(JSON.stringify(context.executionContext.profits));
    }

    function getMarketRate() {
        return marketRate;
    }
};