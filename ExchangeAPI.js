exports.newExchangeAPI = function newExchangeAPI(logger, BOT) {
  
    let MODULE_NAME = "Exchange API";
    let LOG_INFO = true;
    let apiClient;
    let bot = BOT

    let thisObject = {
        initialize: initialize,
        getTicker: getTicker,
        getOpenOrders: getOpenOrders,
        getExecutedTrades: getExecutedTrades,
        putPosition: putPosition,
        movePosition: movePosition,
        getMaxDecimalPositions: getMaxDecimalPositions
    };

    let exchangeId
    let options = {}
    let exchange

    const ccxt = require('ccxt')

    return thisObject;

    function initialize(callBackFunction) {
        try { 
        exchangeId = bot.exchange.toLowerCase()

        let key = process.env.KEY
        let secret = process.env.SECRET

        if (key === "undefined") { key = undefined }
        if (secret === "undefined") { secret = undefined }

        const exchangeClass = ccxt[exchangeId]
        const exchangeConstructorParams = {
            'apiKey': key,
            'secret': secret,
            'timeout': 30000,
            'enableRateLimit': true,
            verbose: false,
            options: options
        }

        exchange = new exchangeClass(exchangeConstructorParams)

        callBackFunction(global.DEFAULT_OK_RESPONSE)
    } catch (err) {
            logError("initialize -> err = " + err.message);
        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
    }
    }

    function getMaxDecimalPositions() {

    }

    /*
     * Returns the price for a given pair of assets.
     * The object returned is an array of trades:
     * ticker = {
     *           bid, Number
     *           ask, Number
     *           last Number
     *       };
     */
    async function getTicker(market, callBackFunction) {
        try {
            logInfo("getTicker -> Entering function.");
            const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset
            let ticker

            if (exchange.has['fetchTicker']) {
                ticker = await (exchange.fetchTicker(symbol)) 
                callBackFunction(global.DEFAULT_OK_RESPONSE, ticker)
            } else {
                logError("getTicker -> Exchange does not support fetchTicker command.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }
            
        } catch (err) {
            logError("getTicker -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns the open positions ath the exchange for a given market and user account.
     * The object returned is an array of positions
     *
     */
    async function getOpenOrders(market, callBackFunction) {
        try {
            logInfo("getOpenOrders -> Entering function. market = " + JSON.stringify(market));

            const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset
            let openOrders

            if (exchange.has['fetchOpenOrders']) {
                openOrders = await(exchange.fetchOpenOrders (symbol))
                callBackFunction(global.DEFAULT_OK_RESPONSE, openOrders)
            } else {
                logError("getTicker -> Exchange does not support fetchOpenOrders command.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }

        } catch (err) {
            logError("getOpenOrders -> Error = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns the trades for a given order number.
     * The object returned is an array of trades
     */
    function getExecutedTrades(pPositionId, callBackFunction) {
        try {
            logInfo("getExecutedTrades -> Entering function. pPositionId = " + pPositionId);
            apiClient.getExecutedTrades(pPositionId, callBackFunction);
        } catch (err) {
            logError("getExecutedTrades -> Error = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Creates a new buy or sell order.
     * The orderNumber is returned. String
     */
    function putPosition(pMarket, pType, pRate, pAmountA, pAmountB, callBackFunction) {
        try {
            logInfo("putPosition -> Entering function.");

            let rate = truncDecimals(pRate);
            let amountA = truncDecimals(pAmountA);
            let amountB = truncDecimals(pAmountB);

            logInfo("putPosition -> pMarket = " + pMarket.assetA + "_" + pMarket.assetB);
            logInfo("putPosition -> pType = " + pType);
            logInfo("putPosition -> pRate = " + rate);
            logInfo("putPosition -> pAmountA = " + amountA);
            logInfo("putPosition -> pAmountB = " + amountB);

            if (pType === "buy") {
                apiClient.buy(pMarket.assetA, pMarket.assetB, rate, amountB, callBackFunction);
            } else if (pType === "sell") {
                apiClient.sell(pMarket.assetA, pMarket.assetB, rate, amountB, callBackFunction);
            } else {
                logError("putPosition -> pType must be either 'buy' or 'sell'.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }
        } catch (err) {
            logError("putPosition -> err = " + JSON.stringify(err.stack) || err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Move an existing position to the new rate.
     * The new orderNumber is returned.
     */
    function movePosition(pPosition, pNewRate, pNewAmountB, callBackFunction) {
        try {
            logInfo("movePosition -> Entering function.");
            logInfo("movePosition -> pPosition = " + JSON.stringify(pPosition));
            logInfo("movePosition -> pNewRate = " + truncDecimals(pNewRate));

            apiClient.movePosition(pPosition, truncDecimals(pNewRate), truncDecimals(pNewAmountB), callBackFunction);
        } catch (err) {
            logError("movePosition -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }


    function logInfo(message) {
        if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] ' + message) }
    }

    function logError(message) {
        logger.write(MODULE_NAME, '[ERROR] ' + message)
    }
};
