exports.newInterval = function newInterval(BOT, DEBUG_MODULE) {

    let bot = BOT;

    const MODULE_NAME = "Interval";
    const LOG_INFO = true;

    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    interval = {
        initialize: initialize,
        start: start
    };

    let botContext;
    let processDatetime;
    let datasource;
    let exchangeAPI;

    return interval;

    function initialize(pBotContext, pProcessDatetime, pDatasource, pExchangeAPI, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;

            /* Store local values. */

            botContext = pBotContext;
            processDatetime = pProcessDatetime;
            datasource = pDatasource;
            exchangeAPI = pExchangeAPI;

            logger.write("[INFO] initialize - Entering function 'initialize' ");

            callBackFunction();

        } catch (err) {

            const logText = "[ERROR] initialize - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);

        }
    }

    function start(callBackFunction) {

        try {

            if (LOG_INFO === true) {
                logger.write("[INFO] Entering function 'start'");
            }

            /*

            This bot will trade with a pseudo strategy based on candle and volumes stairs patterns. Essentially it will look at the patterns
            it is in at different time periods and try to make a guess if it is a good time to buy, sell, put or remove positions.

            */

            let nextIntervalExecution = false; // This tell the AAPlatform if it must execute the bot code again or not. 
            let nextIntervalLapse = 10 * 1000; // If something fails and we need to retry after a few seconds, we will use this amount of time to request a new execution of this bot code.

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

            /* The bot trades only at one market: USDT_BTC. */

            const market = {
                assetA: "USDT",
                assetB: "BTC",
            };


            let exchangePositions = [];     // These are the open positions at the exchange at the account the bot is authorized to use.
            let openPositions = [];         // These are the open positions the bot knows it made by itself. 

            getPositionsAtExchange();

            function getPositionsAtExchange() {

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
                        case 'Retry Later.': {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Retry Later. Requesting Interval Retry.");
                            callBackFunction(true, nextIntervalLapse);
                            return;
                        }
                            break;
                        case 'Operation Failed.': { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                            return;
                        }
                            break;
                    }
                }
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

                                        const logText = "[ERROR] 'confirmOrderWasPartiallyExecuted' - Cannot be confirmed that a partially execution was done well. Bot stopping execution. ";
                                        logger.write(logText);
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

                                }

                            }
                        }
                    }

                    /* Position not found: we need to know if the order was executed. */

                    getPositionTradesAtExchange(botContext.executionContext.positions[i].id, confirmOrderWasExecuted);

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
                            botContext.executionContext.positions[i].amountA !== sumAssetA ||
                            botContext.executionContext.positions[i].amountB !== sumAssetB
                        ) {

                            const logText = "[ERROR] 'confirmOrderWasExecuted' - Cannot be confirmed that the order was executed. It must be manually cancelled by the user or cancelled by the exchange itself. Bot stopping execution. ";
                            logger.write(logText);
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
                            type: botContext.executionContext.positions[i].type + "  executed",
                            position: botContext.executionContext.positions[i]
                        };

                        botContext.executionContext.transactions.push(newTransaction);

                        /* All done. */

                        next();

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
            }

            function getPositionTradesAtExchange(pPositionId, callBack) {

                /*

                Given one position, we request all the associated trades to it.

                */

                exchangeAPI.getExecutedTrades(pPositionId, onResponse);

                function onResponse(err, pTrades) {

                    switch (err) {
                        case null: {            // Everything went well, we have the information requested.
                            callBack(pTrades);
                        }
                            break;
                        case 'Retry Later.': {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] getPositionTradesAtExchange -> onResponse -> Retry Later. Requesting Interval Retry.");
                            callBackFunction(true, nextIntervalLapse);
                            return;
                        }
                            break;
                        case 'Operation Failed.': { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] getPositionTradesAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                            return;
                        }
                            break;
                    }
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

                if (botContext.executionContext.positions.length > 0) {

                    if (botContext.executionContext.positions[0].type === "buy") {

                        validateBuyPosition(botContext.executionContext.positions[0]);

                    } else {

                        validateSellPosition(botContext.executionContext.positions[0]);

                    }

                } else {

                    /*

                    This bot is expected to always have an open position, either buy or sell. If it does not have one, that means that it is
                    running for the first time. In which case, we will create one sell position at a very high price. Later, once the bot executes
                    again, it will take it and move it to a reasonable place and monitor it during each execution round.

                    Lets see first which is the current price.

                    */

                    let candleArray = datasource.candlesMap.get("01-min");
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

                    let AmountA = botContext.statusReport.initialBalance.amountA;
                    let AmountB = botContext.statusReport.initialBalance.amountB;

                    /* We are going to sell all AmountB */

                    AmountA = AmountB * rate;

                    putPositionAtExchange("sell", rate, AmountA, AmountB, writeStatusAndContext);

                }

                function validateBuyPosition(pPosition) {

                    /* For simplicity of this example bot, we will do the same than when we are selling. */

                    validateSellPosition(pPosition);

                }

                function validateSellPosition(pPosition) {

                    let candleArray;
                    let candle;
                    let weight;

                    /*

                    Keeping in mind this is an example of traing bot, we are going to put some logic here that in the end will move the current position
                    up or down. It will move it down if the bot feels it is time to sell, and up if it feels that selling is not a good idea.

                    To achieve a final rate to move the current position at the exchange, we are going to go through the available candles and patterns
                    and each one is going to make a micro-move, and at the end we will have a final rate to send a move command to the exchange.

                    We will use a weight to give more or less importance to different Time Periods.

                    */

                    let diff;
                    let variationPercentage;
                    let timePeriodName;

                    let targetRate = pPosition.rate;

                    let weightArray = [1 / (24 * 60), 1 / (12 * 60), 1 / (8 * 60), 1 / (6 * 60), 1 / (4 * 60), 1 / (3 * 60), 1 / (2 * 60), 1 / (1 * 60)];

                    for (i = 0; i < marketFilesPeriods.length; i++) {

                        weight = weightArray[i];

                        timePeriodName = marketFilesPeriods[i][1];

                        candleArray = datasource.candlesMap.get(timePeriodName);
                        candle = candleArray[candleArray.length - 1];           // The last candle of the 10 candles array.

                        diff = candle.close - candle.open;
                        variationPercentage = diff * 100 / candle.open;         // This is the % of how much the rate increased or decreced from open to close.

                        targetRate = targetRate + targetRate * variationPercentage / 100 * weight;

                    }

                    /* Finally we move the order position to where we have just estimated is a better place. */

                    movePositionAtExchange(pPosition, targetRate, writeStatusAndContext);

                }
            }

            function putPositionAtExchange(pType, pRate, pAmountA, pAmountB, callBack) {

                exchangeAPI.putPosition(market, pType, pRate, pAmountA, pAmountB,onResponse);

                function onResponse(err, pPositionId) {

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
                        case 'Retry Later.': {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Retry Later. Requesting Interval Retry.");
                            callBackFunction(true, nextIntervalLapse);
                            return;
                        }
                            break;
                        case 'Operation Failed.': { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                            return;
                        }
                            break;
                    }
                }
            }

            function movePositionAtExchange(pPosition, pNewRate, callBackFunction) {

                exchangeAPI.movePosition(pPosition, pNewRate, onResponse);

                function onResponse(err, pPositionId) {

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
                        case 'Retry Later.': {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Retry Later. Requesting Interval Retry.");
                            callBackFunction(true, nextIntervalLapse);
                            return;
                        }
                            break;
                        case 'Operation Failed.': { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] getPositionsAtExchange -> onResponse -> Operation Failed. Aborting the process.");
                            return;
                        }
                            break;
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
