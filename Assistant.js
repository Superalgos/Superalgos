exports.newAssistant = function newAssistant(BOT, logger, UTILITIES) {

    /*
    This module allows trading bots to execute actions on the exchange.
    */

    const MODULE_NAME = "Assistant";

    let bot = BOT;

    let thisObject = {
        dataDependencies: undefined,
        initialize: initialize,
        createOrder: createOrder,
        getPositions: getPositions,
        getBalance: getBalance,
        getAvailableBalance: getAvailableBalance,
        getInitialBalance: getInitialBalance,
        getProfits: getProfits,
        getCombinedProfits: getCombinedProfits,
        getROI: getROI,
        getMarketRate: getMarketRate,
        getTicker: getTicker,
        sendMessage: sendMessage,
        rememberThis: rememberThis,
        remindMeOf: remindMeOf,
        truncDecimals: truncDecimals,
        sendEmail: sendEmail,
        addExtraData: addExtraData
    };

    let utilities = UTILITIES.newCloudUtilities(logger);

    let openOrders = [];     // These are the open positions at the exchange at the account the bot is authorized to use.
    let openPositions = [];         // These are the open positions the bot knows it made by itself.

    let context;
    let exchangeAPI;

    let marketRate;
    let ticker;

    return thisObject;

    function initialize(pContext, pExchangeAPI, pDataDependencies, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            /* Save local values. */

            context = pContext;
            exchangeAPI = pExchangeAPI;
            thisObject.dataDependencies = pDataDependencies;

            switch (bot.startMode) {

                case 'Live': {
                    getMarketRateFromExchange();
                    break;
                }

                case 'Backtest': {
                    validateExchangeSyncronicity();
                    break;
                }

                default: {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> Unexpected bot.startMode.");
                    logger.write(MODULE_NAME, "[ERROR] initialize -> bot.startMode = " + bot.startMode);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function getMarketRateFromExchange() {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> getMarketRateFromExchange -> Entering function."); }

                    exchangeAPI.getTicker(bot.market, onTicker);

                    return;

                    function onTicker(err, pTicker) {

                        try {

                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> getMarketRateFromExchange -> onTicker -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> getMarketRateFromExchange -> onTicker -> We could not get the Market Price now."); }

                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                return;
                            }

                            ticker = pTicker;
                            marketRate = pTicker.last;

                            context.newHistoryRecord.marketRate = marketRate;

                            validateExchangeSyncronicity();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] initialize -> getMarketRateFromExchange -> onTicker -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> getMarketRateFromExchange -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function validateExchangeSyncronicity() {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> validateExchangeSyncronicity -> Entering function."); }

                    /* Procedure to validate we are in sync with the exchange. */

                    getPositionsAtExchange(onDone);

                    function onDone(err) {
                        try {

                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> validateExchangeSyncronicity -> onDone -> Entering function."); }

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> validateExchangeSyncronicity -> onDone -> Execution finished well."); }
                                    calculateProfits();
                                    return;
                                }
                                    break;
                                case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                    logger.write(MODULE_NAME, "[ERROR] initialize -> validateExchangeSyncronicity -> onDone -> Retry Later. Requesting Execution Retry.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                                case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                    logger.write(MODULE_NAME, "[ERROR] initialize -> validateExchangeSyncronicity -> onDone -> Operation Failed. Aborting the process.");
                                    callBackFunction(err);
                                    return;
                                }
                                    break;
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] initialize -> validateExchangeSyncronicity -> onDone -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> onDone -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function calculateProfits() {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> calculateProfits -> Entering function."); }

                    /* Calculate Profits */

                    if (context.executionContext.initialBalance.baseAsset > 0) {

                        context.executionContext.profits.baseAsset = (thisObject.truncDecimals(context.executionContext.balance.baseAsset) - thisObject.truncDecimals(context.executionContext.initialBalance.baseAsset)) / thisObject.truncDecimals(context.executionContext.initialBalance.baseAsset);
                        context.executionContext.profits.baseAsset = thisObject.truncDecimals(context.executionContext.profits.baseAsset);
                    }

                    if (context.executionContext.initialBalance.quotedAsset > 0) {

                        context.executionContext.profits.quotedAsset = (thisObject.truncDecimals(context.executionContext.balance.quotedAsset) - thisObject.truncDecimals(context.executionContext.initialBalance.quotedAsset)) / thisObject.truncDecimals(context.executionContext.initialBalance.quotedAsset);
                        context.executionContext.profits.quotedAsset = thisObject.truncDecimals(context.executionContext.profits.quotedAsset);
                    }

                    context.newHistoryRecord.profitsBaseAsset = context.executionContext.profits.baseAsset;
                    context.newHistoryRecord.profitsQuotedAsset = context.executionContext.profits.quotedAsset;

                    /* Calculate Combined Profits */

                    if (context.executionContext.initialBalance.baseAsset > 0) {

                        let convertedAssetsB = (thisObject.truncDecimals(context.executionContext.balance.quotedAsset) - thisObject.truncDecimals(context.executionContext.initialBalance.quotedAsset)) * marketRate;
                        convertedAssetsB = thisObject.truncDecimals(convertedAssetsB);

                        context.executionContext.combinedProfits.baseAsset = (thisObject.truncDecimals(context.executionContext.balance.baseAsset) + convertedAssetsB - thisObject.truncDecimals(context.executionContext.initialBalance.baseAsset)) / thisObject.truncDecimals(context.executionContext.initialBalance.baseAsset) * 100;
                        context.executionContext.combinedProfits.baseAsset = thisObject.truncDecimals(context.executionContext.combinedProfits.baseAsset);
                    }

                    if (context.executionContext.initialBalance.quotedAsset > 0) {

                        let convertedAssetsA = (thisObject.truncDecimals(context.executionContext.balance.baseAsset) - thisObject.truncDecimals(context.executionContext.initialBalance.baseAsset)) / marketRate;
                        convertedAssetsA = thisObject.truncDecimals(convertedAssetsA);

                        context.executionContext.combinedProfits.quotedAsset = (thisObject.truncDecimals(context.executionContext.balance.quotedAsset) + convertedAssetsA - thisObject.truncDecimals(context.executionContext.initialBalance.quotedAsset)) / thisObject.truncDecimals(context.executionContext.initialBalance.quotedAsset) * 100;
                        context.executionContext.combinedProfits.quotedAsset = thisObject.truncDecimals(context.executionContext.combinedProfits.quotedAsset);
                    }

                    context.newHistoryRecord.combinedProfitsA = context.executionContext.combinedProfits.baseAsset;
                    context.newHistoryRecord.combinedProfitsB = context.executionContext.combinedProfits.quotedAsset;

                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> calculateProfits -> err = " + err.stack);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getPositionsAtExchange(callBack) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getPositionsAtExchange -> Entering function."); }

            /*

            Here we grab all the positions at the exchange for the account we are using for trading. We will not asume all the positions
            were made by this bot, but we need them all to later check if all the ones made by the bot are still there, were executed or
            manually cancelled by the exchange account owner.

            */

            switch (bot.startMode) {

                case "Live": {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getPositionsAtExchange -> Live Mode Detected."); }
                    exchangeAPI.getOpenOrders(bot.market, onResponse);
                    break;
                }

                case "Backtest": {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getPositionsAtExchange -> Backtest Mode Detected."); }
                    let openOrders = [];  // We simulate all positions were executed.
                    onResponse(global.DEFAULT_OK_RESPONSE, openOrders);
                    break;
                }

                default: {
                    logger.write(MODULE_NAME, "[ERROR] getPositionsAtExchange -> Unexpected bot.startMode.");
                    logger.write(MODULE_NAME, "[ERROR] getPositionsAtExchange -> bot.startMode = " + bot.startMode);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function onResponse(err, pOpenOrders) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getPositionsAtExchange ->  onResponse -> Entering function."); }
                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getPositionsAtExchange ->  onResponse -> pOpenOrders = " + JSON.stringify(pOpenOrders)); }

                switch (err.result) {
                    case global.DEFAULT_OK_RESPONSE.result: {            // Everything went well, we have the information requested.
                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getPositionsAtExchange -> onResponse -> Execution finished well."); }
                        openOrders = pOpenOrders;
                        ordersExecutionCheck(callBack);
                        return;
                    }
                        break;
                    case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                        logger.write(MODULE_NAME, "[ERROR] getPositionsAtExchange -> onResponse -> Retry Later. Requesting Execution Retry.");
                        callBack(err);
                        return;
                    }
                        break;
                    case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                        logger.write(MODULE_NAME, "[ERROR] getPositionsAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                        callBack(err);
                        return;
                    }
                        break;
                }
            }
        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getPositionsAtExchange -> err = " + err.stack);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function ordersExecutionCheck(callBack) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> Entering function."); }

            /*

            Here we check that all the positions we know are still valid at the exchange. If they are not, we will try to take appropiate
            actions. Reasons why the positions might not be there are:

            1. The user / account owner closed the positions manually.
            2. The exchange for some reason closed the positions. In some exchanges positions have an expiration time.
            3. The orders were executed.

            Situations 1 and 2 are similar unexpected and we will stop the bot execution when we detect them. Number 3 is an
            expected behaviour and we will take appropiate action.

            Also, the position might still be there but it might have been partially executed. To detect that we need to compare the
            position amounts we have on file to the one we are receiving from the exchange.

            Before we begin, we have to remove all the orders that have been already closed at the last execution of the bot.

            */

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> JSON.stringify(context.executionContext.positions) = " + JSON.stringify(context.executionContext.positions)); }

            let openPositions = [];

            for (let a = 0; a < context.executionContext.positions.length; a++) {

                if (context.executionContext.positions[a].status === "open") {

                    openPositions.push(context.executionContext.positions[a]);

                }
            }

            /*

            This removes all orders leaving only the not executed position. Consider that we do want executed positions to be recored on the file so as to
            have a record of their execution. But at next execution these records must be deleted before the new Execution Context file is created and
            this is what we do here.

            */

            context.executionContext.positions = openPositions;

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> Removing executed positions."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> JSON.stringify(context.executionContext.positions) = " + JSON.stringify(context.executionContext.positions)); }

            /* Now we can start checking what happened at the exchange. */

            let i = 0;

            controlLoop();

            function loopBody() {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> Entering function."); }

                    let position = context.executionContext.positions[i];
                    let exchangePosition;

                    for (let j = 0; j < openOrders.length; j++) {

                        if (position.id === openOrders[j].id) {

                            exchangePosition = openOrders[j];
                            positionFound();
                            return;
                        }
                    }

                    positionNotFound();
                    return;

                    function positionFound() {

                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> positionFound -> Entering function."); }

                        /*
                        We update the final amountA based on what we got from the exchange.
                        This is needed since the values could be different from what we calculate.
                        */
                        position.amountA = exchangePosition.amountA;

                        /*
                        We need to know if the order was partially executed. To know that, we compare the amounts on file with the ones
                        received from the exchange. If they are the same, then the order is intact. Otherwise, to confirm a partial execution,
                        we will request the associated trades from the exchange.
                        */

                        if (position.amountB === exchangePosition.amountB) {

                            /* Position is still there, untouched. Nothing to do here. */

                            next();
                            return;

                        } else {

                            getPositionTradesAtExchange(position.id, confirmOrderWasPartiallyExecuted);
                            return;

                        }
                    }

                    function positionNotFound() {

                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> positionNotFound -> Entering function."); }

                        /* Position not found: we need to know if the order was executed. */

                        getPositionTradesAtExchange(position.id, confirmOrderWasExecuted);

                    }

                    function getPositionTradesAtExchange(pOrderId, innerCallBack) {

                        try {

                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Entering function."); }
                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> pOrderId = " + pOrderId); }

                            /*

                            Given one position, we request all the associated trades to it.

                            */

                            switch (bot.startMode) {

                                case "Live": {

                                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Live Mode Detected."); }
                                    exchangeAPI.getOrder(pOrderId, bot.market, onResponse);
                                    return;

                                }

                                case "Backtest": {

                                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Backtest Mode Detected."); }

                                    let trades = [];

                                    /* We look for the position at the executionContext */

                                    for (let i = 0; i < context.executionContext.positions.length; i++) {

                                        let thisOrder = context.executionContext.positions[i];

                                        if (thisOrder.id === pOrderId) {

                                            let feeRate = 0.002; 		// Default backtesting fee simulation

                                            let trade = {
                                                id: Math.trunc(Math.random(1) * 1000000),
                                                type: thisOrder.type,
                                                rate: thisOrder.rate.toString(),
                                                amountA: thisObject.truncDecimals(thisOrder.amountA).toString(),
                                                amountB: thisObject.truncDecimals(thisOrder.amountB).toString(),
                                                fee: thisObject.truncDecimals(feeRate).toString(),
                                                date: (new Date()).valueOf()
                                            }

                                            trades.push(trade);

                                            let order = {
                                                trades: trades
                                            }
                                            onResponse(global.DEFAULT_OK_RESPONSE, order);

                                            return;
                                        }
                                    }

                                    logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Position not found at Executioin Context.");
                                    callBack(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }

                                default: {
                                    logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> Unexpected bot.startMode.");
                                    logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> bot.startMode = " + bot.startMode);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }
                            }

                            function onResponse(err, order) {

                                try {
                                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> Entering function."); }

                                    switch (err.result) {
                                        case global.DEFAULT_OK_RESPONSE.result: {            // Everything went well, we have the information requested.
                                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> Execution finished well."); }
                                            innerCallBack(order);
                                        }
                                            break;
                                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                                            logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> Retry Later. Requesting Execution Retry.");
                                            callBack(global.DEFAULT_RETRY_RESPONSE);
                                            return;
                                        }
                                            break;
                                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                                            logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                                            callBack(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                            break;
                                    }
                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> onResponse -> err = " + err.stack);
                                    callBack(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> getPositionTradesAtExchange -> err = " + err.stack);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function confirmOrderWasExecuted(order) {

                        try {

                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> Entering function."); }
                            if (global.LOG_CONTROL[MODULE_NAME].logContent === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> trades = " + JSON.stringify(trades)); }

                            let trades = order.trades
                            /*

                            To confirm everything is ok, we will add all the amounts on trades asociated to the order and
                            they must be equal to the one on file. Otherwise something very strange could have happened,
                            in which case we will halt the bot execution.

                            */

                            let sumBaseAsset = 0;
                            let sumQuotedAsset = 0;
                            let sumRate = 0;

                            for (let k = 0; k < trades.length; k++) {
                                let trade = trades[k];
                                sumBaseAsset = sumBaseAsset + thisObject.truncDecimals(trade.amountA);
                                sumQuotedAsset = sumQuotedAsset + thisObject.truncDecimals(trade.amountB);
                                sumRate = sumRate + thisObject.truncDecimals(trade.rate);
                            }

                            sumBaseAsset = thisObject.truncDecimals(sumBaseAsset);
                            sumQuotedAsset = thisObject.truncDecimals(sumQuotedAsset);

                            if (position.amountB !== sumQuotedAsset) {
                                logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> position.amountB = " + position.amountB);
                                logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> sumQuotedAsset = " + sumQuotedAsset);

                                logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> Cannot be confirmed that the order was executed. It must be manually cancelled by the user or cancelled by the exchange itself.");
                                logger.write(MODULE_NAME, "[HINT] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> If the process was abruptally cancelled and then restarted, it is possible that now is not sincronized with the exchange.");
                                logger.write(MODULE_NAME, "[HINT] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> In any case, to continue, you must manually delete the orders at the exchange.");
                                callBack(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            /*

                            Confirmed that order was executed. Next thing to do is to remember the trades and change its status.

                            */

                            position.status = "executed";

                            if (position.type === "sell") {
                                context.newHistoryRecord.sellExecRate = sumRate / trades.length;
                            } else {
                                context.newHistoryRecord.buyExecRate = sumRate / trades.length;
                            }

                            applyTradesToContext(trades);

                            let newTransaction = {
                                type: position.type + " executed",
                                position: position
                            };

                            context.executionContext.transactions.push(newTransaction);

                            /* All done. */

                            next();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> err = " + err.stack);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                    function confirmOrderWasPartiallyExecuted(trades) {

                        try {
                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> Entering function."); }

                            let trades = order.trades

                            /*

                            To confirm everything is ok, we will add all the amounts on trades plus the remaining amounts
                            at the order at the exchange and they must be equal to the one on file. Otherwise an inconsistent
                            state has been detected, in which case we will halt the bot execution.

                            */

                            let sumBaseAsset = 0;
                            let sumQuotedAsset = 0;

                            for (let k = 0; k < trades.length; k++) {
                                let trade = trades[k];
                                sumBaseAsset = sumBaseAsset + thisObject.truncDecimals(trade.amountA);
                                sumQuotedAsset = sumQuotedAsset + thisObject.truncDecimals(trade.amountB);
                            }

                            /* To this we add the current position amounts. */

                            sumBaseAsset = sumBaseAsset + thisObject.truncDecimals(exchangePosition.amountA);
                            sumQuotedAsset = sumQuotedAsset + thisObject.truncDecimals(exchangePosition.amountB);

                            sumBaseAsset = thisObject.truncDecimals(sumBaseAsset);
                            sumQuotedAsset = thisObject.truncDecimals(sumQuotedAsset);

                            /*
                             * Next let's get the max decimal positions for the pair being trade returned by the exchange and validate that at least
                             * one decimal position less than the max matches. The reason for this is because there could be some
                             * rounding on the exchange when there are partial executed orders that will interfiere with the exact validation.
                             *
                             * IE: For Poloniex USDT/BTC the max returned decimal positions is 8, it means we will validate that the diference is less than 0.0000001
                             */

                            let exchangeParam = exchangeAPI.getMaxDecimalPositions();
                            let minValue = '0.' + (1).toPrecision(exchangeParam - 1).split('.').reverse().join('');
                            let exchangePrecision = parseFloat(parseFloat(minValue).toFixed(exchangeParam));

                            if (Math.abs(position.amountA - sumBaseAsset) > exchangePrecision || Math.abs(position.amountB - sumQuotedAsset) > exchangePrecision) {

                                logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> position.amountA = " + position.amountA);
                                logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> sumBaseAsset = " + sumBaseAsset);
                                logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> position.amountB = " + position.amountB);
                                logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> sumQuotedAsset = " + sumQuotedAsset);

                                logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> Cannot confirm that a partial execution was done well.");

                                /* There are diferences on the responses between the getPosition and getTrades that causes some issues, let's retry. */
                                callBack(global.DEFAULT_RETRY_RESPONSE);
                                return;
                            }

                            /*

                            Confirmed that order was partially executed. Next thing to do is to remember the trades and the new position.

                            */

                            position.amountA = exchangePosition.amountA;
                            position.amountB = exchangePosition.amountB;
                            position.date = (new Date(exchangePosition.date)).valueOf();

                            applyTradesToContext(trades);

                            let newTransaction = {
                                type: position.type + "  partially executed",
                                position: position
                            };

                            context.executionContext.transactions.push(newTransaction);

                            /* All done. */

                            next();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> err = " + err.stack);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                    function applyTradesToContext(trades) {

                        try {

                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> loopBody -> applyTradesToContext -> Entering function."); }

                            /* Here we apply the trades that already happened at the exchange to the balance and available balance of the bot. We also calculate its profits. */

                            for (k = 0; k < trades.length; k++) {

                                let trade = trades[k];

                                position.trades.push(trade);

                                context.newHistoryRecord.newTrades++;

                                /* Calculate Balances */

                                let baseAsset = 0;
                                let quotedAsset = 0;

                                if (trade.type === 'buy') {

                                    /*

                                    The fee received at each trade is the factor by which if we multiply asset B, we get the amount of Asset B extracted as fees by the exchange.
                                    This happens with each individual trade. Remeber that one order can potentially be executed with 1 to many trades.

                                    */

                                    let feeAmount = thisObject.truncDecimals(Number(trade.fee) * Number(trade.amountB));

                                    baseAsset = Number(trade.amountA);
                                    quotedAsset = Number(trade.amountB) - feeAmount;

                                    context.executionContext.balance.baseAsset = thisObject.truncDecimals(context.executionContext.balance.baseAsset - baseAsset);
                                    context.executionContext.balance.quotedAsset = thisObject.truncDecimals(context.executionContext.balance.quotedAsset + quotedAsset);

                                    context.executionContext.availableBalance.quotedAsset = thisObject.truncDecimals(context.executionContext.availableBalance.quotedAsset + quotedAsset);

                                    /* Not the available balance for asset A is not affected since it was already reduced when the order was placed. */

                                }

                                if (trade.type === 'sell') {

                                    /*

                                    The fee received at each trade is the factor by which if we multiply asset A, we get the amount of Asset A extracted as fees by the exchange.
                                    This happens with each individual trade. Remeber that one order can potentially be executed with 1 to many trades.

                                    */

                                    let feeAmount = thisObject.truncDecimals(Number(trade.fee) * Number(trade.amountA));

                                    baseAsset = Number(trade.amountA) - feeAmount;
                                    quotedAsset = Number(trade.amountB);

                                    context.executionContext.balance.baseAsset = thisObject.truncDecimals(context.executionContext.balance.baseAsset + baseAsset);
                                    context.executionContext.balance.quotedAsset = thisObject.truncDecimals(context.executionContext.balance.quotedAsset - quotedAsset);

                                    context.executionContext.availableBalance.baseAsset = thisObject.truncDecimals(context.executionContext.availableBalance.baseAsset + baseAsset);

                                    /* Not the available balance for asset B is not affected since it was already reduced when the order was placed. */

                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> applyTradesToContext -> err = " + err.stack);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> loopBody -> err = " + err.stack);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function next() {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> next -> Entering function."); }

                i++;
                controlLoop();

            }

            function controlLoop() {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> controlLoop -> Entering function."); }

                if (i < context.executionContext.positions.length) {

                    loopBody();

                } else {

                    final();

                }
            }

            function final() {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] ordersExecutionCheck -> final -> Entering function."); }

                callBack(global.DEFAULT_OK_RESPONSE);

            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] ordersExecutionCheck -> err = " + err.stack);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createOrder(pType, pRate, pAmountA, pAmountB, callBackFunction) {

        try {
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createOrder -> Entering function."); }

            /* Removing extra decimals. */

            pRate = thisObject.truncDecimals(pRate);
            pAmountA = thisObject.truncDecimals(pAmountA);
            pAmountB = thisObject.truncDecimals(pAmountB);

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createOrder -> pType = " + pType); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createOrder -> pRate = " + pRate); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createOrder -> pAmountA = " + pAmountA); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createOrder -> pAmountB = " + pAmountB); }

            /* Validations that the limits are not surpassed. */

            if (pType === 'buy') {

                if (pAmountA > thisObject.truncDecimals(context.executionContext.availableBalance.baseAsset)) {

                    logger.write(MODULE_NAME, "[ERROR] createOrder -> Input Validations -> pAmountA is grater than the Available Balance.");
                    logger.write(MODULE_NAME, "[ERROR] createOrder -> Input Validations -> pAmountA = " + pAmountA);
                    logger.write(MODULE_NAME, "[ERROR] createOrder -> Input Validations -> Available Balance = " + thisObject.truncDecimals(context.executionContext.availableBalance.baseAsset));

                    let err = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: 'Not Enough Available Balance to Buy.'
                    };

                    callBackFunction(err);
                    return;
                }
            }

            if (pType === 'sell') {

                if (pAmountB > thisObject.truncDecimals(context.executionContext.availableBalance.quotedAsset)) {

                    logger.write(MODULE_NAME, "[ERROR] createOrder -> Input Validations -> pAmountB is grater than the Available Balance.");
                    logger.write(MODULE_NAME, "[ERROR] createOrder -> Input Validations -> pAmountB = " + pAmountB);
                    logger.write(MODULE_NAME, "[ERROR] createOrder -> Input Validations -> Available Balance = " + thisObject.truncDecimals(context.executionContext.availableBalance.quotedAsset));

                    let err = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: 'Not Enough Available Balance to Sell.'
                    };

                    callBackFunction(err);
                    return;
                }
            }

            /* All validations passed, we proceed. */

            switch (bot.startMode) {

                case "Live": {

                    exchangeAPI.createOrder(bot.market, pType, pRate, pAmountA, pAmountB, onResponse);
                    return;
                }

                case "Backtest": {

                    if (pRate !== marketRate) {

                        logger.write(MODULE_NAME, "[WARNING] createOrder -> Input Validations -> createOrder Rate can is different to marketRate while in Backtesting Mode. ");
                        //onResponse(global.DEFAULT_FAIL_RESPONSE, positionId);
                    }

                    let positionId = Math.trunc(Math.random(1) * 1000000);
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createOrder ->  Simulating Exchange Response -> orderId = " + positionId); }
                    onResponse(global.DEFAULT_OK_RESPONSE, positionId);
                    return;
                }

                default: {
                    logger.write(MODULE_NAME, "[ERROR] createOrder -> Unexpected bot.startMode.");
                    logger.write(MODULE_NAME, "[ERROR] createOrder -> bot.startMode = " + bot.startMode);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function onResponse(err, order) {

                try {
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createOrder ->  onResponse -> Entering function."); }
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createOrder ->  onResponse -> order.id = " + order.id); }

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: {            // Everything went well, we have the information requested.

                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createOrder -> onResponse -> Execution finished well."); }

                            let position = {
                                id: order.id,
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

                                context.executionContext.availableBalance.baseAsset = thisObject.truncDecimals(context.executionContext.availableBalance.baseAsset - pAmountA);
                                context.newHistoryRecord.lastBuyRate = pRate;
                            }

                            if (position.type === 'sell') {

                                context.executionContext.availableBalance.quotedAsset = thisObject.truncDecimals(context.executionContext.availableBalance.quotedAsset - pAmountB);
                                context.newHistoryRecord.lastSellRate = pRate;
                            }

                            callBackFunction(global.DEFAULT_OK_RESPONSE, position);
                            return;
                        }
                            break;
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write(MODULE_NAME, "[ERROR] createOrder -> onResponse -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write(MODULE_NAME, "[ERROR] createOrder -> onResponse -> Operation Failed. Aborting the process.");
                            callBackFunction(err);
                            return;
                        }
                            break;
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] createOrder -> onResponse -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] createOrder -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getPublicTradeHistory(baseAsset, quotedAsset, startTime, endTime, callback) {

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTradeHistory -> Entering function."); }

        exchangeAPI.getPublicTradeHistory(baseAsset, quotedAsset, startTime, endTime, callback);
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

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getPositions -> Entering function."); }
        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getPositions -> JSON.stringify(context.executionContext.positions) = " + JSON.stringify(context.executionContext.positions)); }

        return JSON.parse(JSON.stringify(context.executionContext.positions));
    }

    function getBalance() {

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getBalance -> Entering function."); }
        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getBalance -> JSON.stringify(context.executionContext.balance) = " + JSON.stringify(context.executionContext.balance)); }

        return JSON.parse(JSON.stringify(context.executionContext.balance));
    }

    function getAvailableBalance() {

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getAvailableBalance -> Entering function."); }
        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getAvailableBalance -> JSON.stringify(context.executionContext.availableBalance) = " + JSON.stringify(context.executionContext.availableBalance)); }

        return JSON.parse(JSON.stringify(context.executionContext.availableBalance));
    }

    function getInitialBalance() {

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getInitialBalance -> Entering function."); }
        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getInitialBalance -> JSON.stringify(context.executionContext.initialBalance) = " + JSON.stringify(context.executionContext.initialBalance)); }

        return JSON.parse(JSON.stringify(context.executionContext.initialBalance));
    }

    function getProfits() {

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getProfits -> Entering function."); }
        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getProfits -> JSON.stringify(context.executionContext.profits) = " + JSON.stringify(context.executionContext.profits)); }

        return JSON.parse(JSON.stringify(context.executionContext.profits));
    }

    function getCombinedProfits() {

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getCombinedProfits -> Entering function."); }

        let combinedProfits = {
            baseAsset: context.newHistoryRecord.combinedProfitsA,
            quotedAsset: context.newHistoryRecord.combinedProfitsB
        }

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getCombinedProfits -> JSON.stringify(combinedProfits) = " + JSON.stringify(combinedProfits)); }

        return JSON.parse(JSON.stringify(combinedProfits));
    }

    function getROI() {

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getROI -> Entering function."); }

        let ROI = {
            baseAsset: (context.executionContext.balance.baseAsset - context.executionContext.initialBalance.baseAsset) / context.executionContext.initialBalance.baseAsset * 100,
            quotedAsset: (context.executionContext.balance.quotedAsset - context.executionContext.initialBalance.quotedAsset) / context.executionContext.initialBalance.quotedAsset * 100
        }

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getROI -> JSON.stringify(ROI) = " + JSON.stringify(ROI)); }

        return JSON.parse(JSON.stringify(ROI));
    }

    function getMarketRate() {
        return marketRate;
    }

    function getTicker() {
        return ticker;
    }

    function sendMessage(pRelevance, pTitle, pBody) {
        let runIndex = context.statusReport.runs.length - 1;

        context.newHistoryRecord.messageRelevance = pRelevance;
        context.newHistoryRecord.messageTitle = bot.startMode + "." + runIndex + ": " + pTitle;
        context.newHistoryRecord.messageBody = pBody;
    }

    function rememberThis(pKey, pValue) {
        if (context.executionContext.remember === undefined) {
            context.executionContext.remember = {};
        }
        context.executionContext.remember[pKey] = pValue;
    }

    function remindMeOf(pKey) {
        if (context.executionContext.remember === undefined) {
            context.executionContext.remember = {};
        }
        return context.executionContext.remember[pKey];
    }

    function sendEmail(pTitle, pBody, pTo) {
        logger.write(MODULE_NAME, "[WARN] sendEmail -> Send emails is currently disabled.");
        return;
    }

    function addExtraData(pExtraDataArray) {
        context.extraData.push(pExtraDataArray);
    }

    function truncDecimals(pFloatValue, pDecimals) {
        if (!pDecimals) pDecimals = 8; // Default value
        return parseFloat(parseFloat(pFloatValue).toFixed(pDecimals));
    }
};
