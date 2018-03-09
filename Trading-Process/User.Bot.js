exports.newUserBot = function newUserBot(BOT, DEBUG_MODULE) {

    const FULL_LOG = true;

    let bot = BOT;

    const MODULE_NAME = "This.Bot";
    const LOG_INFO = true;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    let thisObject = {
        initialize: initialize,
        start: start
    };

    let platform;                           // You will receive a reference to the platform at your initialize function. 

    /*

    The Platform object represents what the AA Platform provides you to help you with your bot. Inside it you can access to these inner objects:

    platform = {
        context: context,                   // This one will allow you to get historical information of what your bot did on previous executions and learn about which is your current status every time your bot runs.
        datasource: datasource,             // This one will provide you with pre-loaded data ready for you to consume. In this version candlesticks and stari patterns.
        assistant: assistant,               // This one will help you to to create, and move positions at the exchange.

                };

    More details about these objects:

    context = {
        statusReport: undefined,            // Here is the information that defines which was the last sucessfull execution and some other details.
        executionHistory: [],               // This is the record of bot execution.
        executionContext: undefined,        // Here is the business information of the last execution of this bot process.
    };

    datasource = {
        candlesFiles: new Map,              // Complete sets of candles for different Time Periods. For Time Periods < 1hs sets are of current day only, otherwise whole market.
        candlesMap: new Map,                // The last 10 candles for each Time Period will be stored here.
        stairsFiles: new Map,               // Complete sets of patterns for different Time Periods. For Time Periods < 1hs sets are of current day only, otherwise whole market.
        stairsMap: new Map                  // The patterns we are currently in will be stored here.
    };

    assistant = {
        putPositionAtExchange: putPositionAtExchange,
        movePositionAtExchange: movePositionAtExchange
    };

    */

    return thisObject;

    function initialize(pPlatform, callBackFunction) {

        try {

            if (LOG_INFO === true) { logger.write("[INFO] initialize -> Entering function."); }

            logger.fileName = MODULE_NAME;

            /* Store local values. */
            platform = pPlatform;

            logger.write("[INFO] initialize -> Entering function 'initialize' ");

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write("[ERROR] initialize -> onDone -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {

        try {

            if (LOG_INFO === true) { logger.write("[INFO] start -> Entering function."); }

            /*

            This is an example. This bot will trade with a pseudo strategy based on candle and volumes stairs patterns.
            Essentially it will look at the patterns it is in at different time periods and try to make a guess if it is a good time to buy,
            sell, or do nothing.

            */

            businessLogic(onDone);

            function onDone(err) {
                try {

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: { 
                            logger.write("[INFO] start -> onDone -> Execution finished well. :-)");
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] start -> onDone -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(err.message);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] start -> onDone -> Operation Failed. Aborting the process.");
                            callBackFunction(err.message);
                            return;
                        }
                            break;
                    }

                } catch (err) {
                    logger.write("[ERROR] start -> onDone -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function businessLogic(callBack) {

                try {

                    if (LOG_INFO === true) { logger.write("[INFO] start -> businessLogic -> Entering function."); }

                    /*

                    First thing we need to know is to see where we are:

                    Do we have open positions?

                    If not, shall we create one?
                    If yes, shall we move them?

                    As this is an example we can assume that we will have only one position, since we will be trading the whole allowed capital all at once.
                    You dont need to do this, you can have as many positions as you wish, and you will find them all at the positions array used below.

                    */

                    if (platform.context.executionContext.positions.length > 0) {

                        if (platform.context.executionContext.positions[0].type === "buy") {
                            decideAboutBuyPosition(platform.context.executionContext.positions[0], callBack);
                        } else {
                            decideAboutSellPosition(platform.context.executionContext.positions[0], callBack);
                        }
                        
                    } else {

                        /*

                        Because this is an example, this bot is expected to always have an open position, either buy or sell.
                        If it does not have one, that means that it is running for the first time. In which case, we will create one
                        sell position at a very high price. Later, once the bot executes again, it will take it and move it to a reasonable
                        place and monitor it during each execution round.

                        Lets see first which is the current price.

                        */

                        let candleArray = platform.datasource.candlesMap.get("01-min");  // In this version of the platform, this array will contain the las 10 candles.
                        let candle = candleArray[candleArray.length - 1];       // The last candle of the 10 candles array for the 1 min Time Period.

                        let currentRate = candle.close;

                        /*
                        Now we verify that this candle is not too old. Lets say no more than 5 minutes old. This could happen if the datasets for
                        any reason stops being updated.
                        */

                        if (candle.begin < global.processDatetime.valueOf() - 5 * 60 * 1000) {

                            logger.write("[WARN] start -> businessLogic -> Last one min candle more than 5 minutes old. Bot cannot operate with this delay. Retrying later.");
                            callBack('Retry Later');
                            return;
                        }

                        /*
                        As we just want to create the first order now and we do not want this order to get executed, we will put it at
                        the +50% of current exchange rate. Next Bot execution will move it strategically.
                        */

                        let rate = candle.close * 1.50;

                        /*
                        The rules of the this first competition states that the bot will have the following initial balance in USDT and BTC to trade with.
                        */

                        const INITIAL_BALANCE_A = 0.000;
                        const INITIAL_BALANCE_B = 0.001;

                        let AmountA = INITIAL_BALANCE_A;
                        let AmountB = INITIAL_BALANCE_B;

                        /* 
                        Here is this bot example, we are going to sell all AmountB at once. You can do this or whatever you think is better.
                        */

                        AmountA = AmountB * rate;

                        platform.assistant.putPositionAtExchange("sell", rate, AmountA, AmountB, callBack);

                    }
                } catch (err) {
                    logger.write("[ERROR] start -> businessLogic -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function decideAboutBuyPosition(pPosition, callBack) {

                try {

                    if (LOG_INFO === true) { logger.write("[INFO] start -> decideAboutBuyPosition -> Entering function."); }

                /* For simplicity of this example bot, we will use here the same logic than when we are selling. */

                    decideAboutSellPosition(pPosition, callBack);

                } catch (err) {
                    logger.write("[ERROR] start -> decideAboutBuyPosition -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function decideAboutSellPosition(pPosition, callBack) {

                try {

                    if (LOG_INFO === true) { logger.write("[INFO] start -> decideAboutSellPosition -> Entering function."); }

                    /*
    
                    Here is where you decide what to do with your current sell position. Option are:
    
                    1. Do not touch it.
                    2. Move it to another position by changing the rate.
                        a. Up
                        b. Down
                    3. Cancell it. (not yet implemented at the platform.)
    
                    You can use here the information provided, analize it however you want and finally make a decition.
    
                    */

                    let candleArray;
                    let candle;
                    let weight;

                    /*
    
                    Keeping in mind this is an example of traing bot, we are going to put some logic here that in the end will move the current position
                    up or down. It will move it down if the bot feels it is time to sell, and up if it feels that selling is not a good idea.
    
                    To achieve a final rate to move the current position at the exchange, we are going to go through the available candles and patterns
                    and each one is going to make a micro-move, and at the end we will have a final rate to send a move command to the exchange.
    
                    We will use a weight to give more or less importance to different Time Periods.
    
                    ------
                    NOTE: The code below is an example and you should replace it by your own logic. This is the key of your intervention here. 
                    ------
                    */

                    let diff;
                    let variationPercentage;
                    let timePeriodName;

                    let targetRate = pPosition.rate;

                    let weightArray = [1 / (24 * 60), 1 / (12 * 60), 1 / (8 * 60), 1 / (6 * 60), 1 / (4 * 60), 1 / (3 * 60), 1 / (2 * 60), 1 / (1 * 60)];

                    for (i = 0; i < global.marketFilesPeriods.length; i++) {

                        weight = weightArray[i];

                        timePeriodName = global.marketFilesPeriods[i][1];

                        candleArray = platform.datasource.candlesMap.get(timePeriodName);
                        candle = candleArray[candleArray.length - 1];           // The last candle of the 10 candles array.

                        diff = candle.close - candle.open;
                        variationPercentage = diff * 100 / candle.open;         // This is the % of how much the rate increased or decreced from open to close.

                        targetRate = targetRate + targetRate * variationPercentage / 100 * weight;

                    }

                    /* Finally we move the order position to where we have just estimated is a better place. */

                    platform.assistant.movePositionAtExchange(pPosition, targetRate, callBack);

                } catch (err) {
                    logger.write("[ERROR] start -> decideAboutSellPosition -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            logger.write("[ERROR] start -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
