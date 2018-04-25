exports.newUserBot = function newUserBot(BOT, DEBUG_MODULE) {

    const FULL_LOG = true;

    let bot = BOT;

    const MODULE_NAME = "User Bot";
    const LOG_INFO = true;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    let thisObject = {
        initialize: initialize,
        start: start
    };

    let assistant;                           // You will receive a reference to the platform at your initialize function. 


    return thisObject;

    function initialize(pAssistant, callBackFunction) {

        try {

            if (LOG_INFO === true) { logger.write("[INFO] initialize -> Entering function."); }

            logger.fileName = MODULE_NAME;

            /* Store local values. */
            assistant = pAssistant;

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
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] start -> onDone -> Operation Failed. Aborting the process.");
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
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

                    let positions = assistant.getPositions();

                    if (positions.length > 0) {

                        if (positions[0].type === "buy") {
                            decideAboutBuyPosition(positions[0], callBack);
                        } else {
                            decideAboutSellPosition(positions[0], callBack);
                        }
                        
                    } else {

                        /*

                        Because this is an example, this bot is expected to always have an open position, either buy or sell.
                        If it does not have one, that means that it is running for the first time. In which case, we will create one
                        sell position at a very high price. Later, once the bot executes again, it will take it and move it to a reasonable
                        place and monitor it during each execution round.

                        Lets see first which is the current market rate.

                        */

                        let currentRate = assistant.getMarketRate();

                        /*
                        As we just want to create the first order now and we do not want this order to get executed, we will put it at
                        the +50% of current exchange rate. Next Bot execution will move it strategically.
                        */

                        let rate = currentRate;

                        /*
                        The rules of the this first competition states that the bot will have the following initial balance in USDT and BTC to trade with.
                        */

                        const INITIAL_BALANCE_A = 0.0000;
                        const INITIAL_BALANCE_B = 0.0001;

                        let AmountA = INITIAL_BALANCE_A;
                        let AmountB = INITIAL_BALANCE_B;

                        /* 
                        Here is this bot example, we are going to sell all AmountB at once. You can do this or whatever you think is better.
                        */

                        let balance = assistant.getBalance();

                        AmountA = AmountB * rate;

                        assistant.putPosition("sell", rate, AmountA, AmountB, callBack);

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

                    let balance = assistant.getBalance();

                    let rate = assistant.getMarketRate();

                    let amountA; 
                    let amountB;

                    if (balance.assetA > 0) {

                        amountA = balance.assetA;
                        amountB = amountA / rate;

                        assistant.putPosition("buy", rate, amountA, amountB, callBack);

                    } else {

                        amountB = balance.assetB; 
                        amountA = amountB * rate;

                        assistant.putPosition("sell", rate, amountA, amountB, callBack);

                    } 

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
