exports.newAssistant = function newAssistant(BOT, DEBUG_MODULE) {

    /* 

    This module allows trading bots to execute actions on the exchange, and also on its current recorded state.

    */

    const MODULE_NAME = "Assistant";

    thisObject = {
        initialize: initialize,
        putPositionAtExchange: putPositionAtExchange,
        movePositionAtExchange: movePositionAtExchange
    };

    let bot = BOT;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;

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

    let exchangePositions = [];     // These are the open positions at the exchange at the account the bot is authorized to use.
    let openPositions = [];         // These are the open positions the bot knows it made by itself. 

    let botContext;
    let processDatetime;
    let exchangeAPI;

    return thisObject;

    function initialize(pBotContext, pProcessDatetime, pExchangeAPI, callBackFunction) {

        try {

            let nextIntervalExecution = false; // This tell the AAPlatform if it must execute the bot code again or not. 
            let nextIntervalLapse = 10 * 1000; // If something fails and we need to retry after a few seconds, we will use this amount of time to request a new execution of this bot code.

            /* Store local values. */

            botContext = pBotContext;
            processDatetime = pProcessDatetime;
            exchangeAPI = pExchangeAPI;

            /* The bot trades only at one market: USDT_BTC. */

            const market = {
                assetA: "USDT",
                assetB: "BTC",
            };



            getPositionsAtExchange();

        } catch (err) {

            logger.write("[ERROR] initialize -> err = " + err);
            callBackFunction("Operation Failed");
        }
    }

    function getPositionsAtExchange(callBack) {

        try {
            /*

            Here we grab all the positions at the exchange for the account we are using for trading. We will not asume all the positions
            were made by this bot, but we need them all to later check if all the ones made by the bot are still there, were executed or
            manually cancelled by the exchange account owner.

            */

            exchangeAPI.getOpenPositions(market, onResponse);

            function onResponse(err, pExchangePositions) {

                switch (err) {
                    case null: {            // Everything went well, we have the information requested.
                        exchangePositions = pExchangePositions;
                        readStatusAndContext();
                    }
                        break;
                    case 'Retry Later': {  // Something bad happened, but if we retry in a while it might go through the next time.
                        logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Retry Later. Requesting Execution Retry.");
                        callBackFunction(true, nextIntervalLapse);
                        return;
                    }
                        break;
                    case 'Operation Failed': { // This is an unexpected exception that we do not know how to handle.
                        logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                        return;
                    }
                        break;
                }
            }
        } catch (err) {
            logger.write("[ERROR] getPositionsAtExchange -> err = " + err);
            callBack("Operation Failed");
        }
    }

    function ordersExecutionCheck(callBack) {

        try {
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

            for (let a = 0; a < botContext.executionContext.positions.length; a++) {

                if (botContext.executionContext.positions[a].status === "open") {

                    openPositions.push(botContext.executionContext.positions[a]);

                }
            }

            botContext.executionContext.positions = openPositions;

            /* Now we can start checking what happened at the exchange. */

            let i = 0;

            controlLoop();

            function loopBody() {

                try {
                    for (let j = 0; j < exchangePositions.length; j++) {

                        if (botContext.executionContext.positions[i].id === exchangePositions[j].id) {

                            /*

                            We need to know if the order was partially executed. To know that, we compare the amounts on file with the ones
                            received from the exchange. If they are the same, then the order is intact. Otherwise, to confirm a partial execution,
                            we will request the associated trades from the exchange.

                            */

                            if (botContext.executionContext.positions[i].amountB === parseFloat(exchangePositions[j].amountB)) {

                                /* Position is still there, untouched. Nothing to do here. */

                                next();
                                return;

                            } else {

                                getPositionTradesAtExchange(botContext.executionContext.positions[i].id, confirmOrderWasPartiallyExecuted);
                                return;

                                function confirmOrderWasPartiallyExecuted(trades) {

                                    try {
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
                                            botContext.executionContext.positions[i].amountA !== sumAssetA ||
                                            botContext.executionContext.positions[i].amountB !== sumAssetB
                                        ) {
                                            logger.write("[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> Cannot be confirmed that a partially execution was done well.");
                                            callBack("Operation Failed");
                                            return;
                                        }

                                        /*

                                        Confirmed that order was partially executed. Next thing to do is to remember the trades and the new position.

                                        */

                                        botContext.executionContext.positions[i].amountA = exchangePositions[j].amountA;
                                        botContext.executionContext.positions[i].amountB = exchangePositions[j].amountB;
                                        botContext.executionContext.positions[i].date = (new Date(exchangePositions[j].date)).valueOf();

                                        for (k = 0; k < trades.length; k++) {

                                            botContext.executionContext.positions[i].trades.push(trades[k]);

                                            botContext.newHistoryRecord.newTrades++;

                                        }

                                        let newTransaction = {
                                            type: botContext.executionContext.positions[i].type + "  partially executed",
                                            position: botContext.executionContext.positions[i]
                                        };

                                        botContext.executionContext.transactions.push(newTransaction);

                                        /* All done. */

                                        next();

                                    } catch (err) {
                                        logger.write("[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasPartiallyExecuted -> err = " + err);
                                        callBack("Operation Failed");
                                        return;
                                    }
                                }
                            }
                        }
                    }

                    /* Position not found: we need to know if the order was executed. */

                    getPositionTradesAtExchange(botContext.executionContext.positions[i].id, confirmOrderWasExecuted);

                    function confirmOrderWasExecuted(trades) {

                        try {
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
                                botContext.executionContext.positions[i].amountA !== sumAssetA ||
                                botContext.executionContext.positions[i].amountB !== sumAssetB
                            ) {
                                logger.write("[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> Cannot be confirmed that the order was executed. It must be manually cancelled by the user or cancelled by the exchange itself.");
                                callBack("Operation Failed");
                                return;
                            }

                            /*

                            Confirmed that order was executed. Next thing to do is to remember the trades and change its status.

                            */

                            botContext.executionContext.positions[i].status = "executed";

                            for (k = 0; k < trades.length; k++) {

                                botContext.executionContext.positions[i].trades.push(trades[k]);

                                botContext.newHistoryRecord.newTrades++;

                            }

                            let newTransaction = {
                                type: botContext.executionContext.positions[i].type + " executed",
                                position: botContext.executionContext.positions[i]
                            };

                            botContext.executionContext.transactions.push(newTransaction);

                            /* All done. */

                            next();

                        } catch (err) {
                            logger.write("[ERROR] ordersExecutionCheck -> loopBody -> confirmOrderWasExecuted -> err = " + err);
                            callBack("Operation Failed");
                            return;
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] ordersExecutionCheck -> loopBody -> err = " + err);
                    callBack("Operation Failed");
                    return;
                }
            }

            function next() {

                i++;
                controlLoop();

            }

            function controlLoop() {

                if (i < botContext.executionContext.positions.length) {

                    loopBody();

                } else {

                    final();

                }
            }

            function final() {

                getCandles();

            }
        } catch (err) {
            logger.write("[ERROR] ordersExecutionCheck -> err = " + err);
            callBack("Operation Failed");
        }
    }

    function getPositionTradesAtExchange(pPositionId, callBack) {

        try {
            /*

            Given one position, we request all the associated trades to it.

            */

            exchangeAPI.getExecutedTrades(pPositionId, onResponse);

            function onResponse(err, pTrades) {

                try {
                    switch (err) {
                        case null: {            // Everything went well, we have the information requested.
                            callBack(pTrades);
                        }
                            break;
                        case 'Retry Later': {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] getPositionTradesAtExchange -> onResponse -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(true, nextIntervalLapse);
                            return;
                        }
                            break;
                        case 'Operation Failed': { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] getPositionTradesAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                            return;
                        }
                            break;
                    }
                } catch (err) {
                    logger.write("[ERROR] getPositionTradesAtExchange -> onResponse -> err = " + err);
                    callBack("Operation Failed");
                }
            }
        } catch (err) {
            logger.write("[ERROR] getPositionTradesAtExchange -> err = " + err);
            callBack("Operation Failed");
        }
    }

    function putPositionAtExchange(pType, pRate, pAmountA, pAmountB, callBack) {

        try {
            exchangeAPI.putPosition(market, pType, pRate, pAmountA, pAmountB, onResponse);

            function onResponse(err, pPositionId) {

                try {
                    switch (err) {
                        case null: {            // Everything went well, we have the information requested.

                            let position = {
                                id: pPositionId,
                                type: pType,
                                rate: pRate,
                                amountA: pAmountA,
                                amountB: pAmountB,
                                date: (processDatetime.valueOf()),
                                status: "open",
                                trades: []
                            };

                            botContext.executionContext.positions.push(position);

                            let newTransaction = {
                                type: "newPosition",
                                position: position
                            };

                            botContext.executionContext.transactions.push(newTransaction);

                            botContext.newHistoryRecord.newPositions++;
                            botContext.newHistoryRecord.rate = pRate;

                            callBack();
                        }
                            break;
                        case 'Retry Later': {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] putPositionAtExchange -> onResponse -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(true, nextIntervalLapse);
                            return;
                        }
                            break;
                        case 'Operation Failed': { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] putPositionAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                            return;
                        }
                            break;
                    }
                } catch (err) {
                    logger.write("[ERROR] putPositionAtExchange -> onResponse -> err = " + err);
                    callBack("Operation Failed");
                }
            }
        } catch (err) {
            logger.write("[ERROR] putPositionAtExchange -> err = " + err);
            callBack("Operation Failed");
        }
    }

    function movePositionAtExchange(pPosition, pNewRate, callBack) {

        try {
            exchangeAPI.movePosition(pPosition, pNewRate, onResponse);

            function onResponse(err, pPositionId) {

                try {
                    switch (err) {
                        case null: {            // Everything went well, we have the information requested.

                            let newPosition = {
                                id: pPositionId,
                                type: pPosition.type,
                                rate: pNewRate,
                                amountA: pPosition.amountB * pNewRate,
                                amountB: pPosition.amountB,
                                date: (processDatetime.valueOf()),
                                status: "open",
                                trades: []
                            };

                            let oldPosition = JSON.parse(JSON.stringify(pPosition));

                            /* We need to update the position we have on file. */

                            for (let i = 0; i < botContext.executionContext.positions.length; i++) {

                                if (botContext.executionContext.positions[i].id === pPosition.id) {

                                    botContext.executionContext.positions[i] = newPosition;

                                    break;
                                }
                            }

                            let newTransaction = {
                                type: "movePosition",
                                oldPosition: oldPosition,
                                newPosition: newPosition
                            };

                            botContext.executionContext.transactions.push(newTransaction);

                            botContext.newHistoryRecord.movedPositions++;
                            botContext.newHistoryRecord.rate = pNewRate;

                            callBack();
                        }
                            break;
                        case 'Retry Later': {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] movePositionAtExchange -> onResponse -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(true, nextIntervalLapse);
                            return;
                        }
                            break;
                        case 'Operation Failed': { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] movePositionAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                            return;
                        }
                            break;
                    }
                } catch (err) {
                    logger.write("[ERROR] movePositionAtExchange -> onResponse -> err = " + err);
                    callBack("Operation Failed");
                }
            }
        } catch (err) {
            logger.write("[ERROR] movePositionAtExchange -> err = " + err);
            callBack("Operation Failed");
        }
    }
};