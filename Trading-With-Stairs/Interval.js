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

    let markets;

    let charlyAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);
    let oliviaAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);
    let tomAzureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);

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

            let periods =
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

            const outputPeriods = JSON.parse(periods);

            const market = {
                assetA: "USDT",
                assetB: "BTC",
            };

            let exchangePositions = [];
            let openPositions = [];

            let apiKey = readApiKey();

            let poloniexApiClient = new POLONIEX_CLIENT_MODULE(apiKey.Key, apiKey.Secret);

            getPositionsAtExchange();

            function readApiKey() {

                try {

                    return JSON.parse(fs.readFileSync('../../' + 'API-Keys' + EXCHANGE_NAME, 'utf8'));

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
                                        closeMarket();
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

                            exchangePositions = exchangeResponse;
                            readBotPositions();
                        }
                    }
                    catch (err) {
                        const logText = "[ERROR] 'onExchangeCallReturned' - ERROR : " + err.message;
                        logger.write(logText);
                        closeMarket();
                    }
                }
            }

            function readBotPositions() {

                /*

                Here we get the positions the bot did and that are recorded at the bot storage account. We will use them through out the rest
                of the process.

                */

            }

            function consistencyCheck() {

                /*

                Here we check that all the positions we know we have are still at the exchange. If they are not, we will try to take appropiate
                actions.

                */

            }

            function getPatterns() {

                /*

                We will read several files with pattern calculations for today. We will use these files as an input to make trading decitions later.

                */

            }

            function forecast() {

                /*

                We will make a forecast using the input data. The forcast is then going to be used to make trading decitions.

                */

            }

            function decideWhatToDo() {


            }

            function putPositionsAtExchange() {


            }

            function writeBotPositions() {



            } 

        }
        catch (err) {
            const logText = "[ERROR] 'Start' - ERROR : " + err.message;
            logger.write(logText);
        }
    }
};
