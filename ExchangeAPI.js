exports.newExchangeAPI = function newExchangeAPI(logger, exchangeName) {
  
    let MODULE_NAME = "Exchange API";
    let LOG_INFO = true;
    let apiClient;

    let thisObject = {
        initialize: initialize,
        getTicker: getTicker,
        getOpenPositions: getOpenPositions,
        getExecutedTrades: getExecutedTrades,
        putPosition: putPosition,
        movePosition: movePosition,
        getPublicTradeHistory: getPublicTradeHistory,
        getExchangeProperties: getExchangeProperties,
        getMaxDecimalPositions: getMaxDecimalPositions
    };

    return thisObject;

    function initialize(callBackFunction) {
        try {
            logInfo("Initialize -> Entering function.");

 

            callBackFunction(global.DEFAULT_OK_RESPONSE);
        } catch (err) {
            logError("Initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     *  Fixing decimal positions to exchange configuration.
     */
    function truncDecimals(pFloatValue) {
        let decimals = getMaxDecimalPositions();
        return parseFloat(parseFloat(pFloatValue).toFixed(decimals));
    }

    /*
     * Return number of decimals for the current market
     */
    function getMaxDecimalPositions() {
        return getMarketConfig().maxDecimals;
    }

    /*
     * Return number of decimals for the current market
     */
    function getMarketConfig() {
        let markets = getExchangeProperties().markets
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            if (market.pair[0] === global.MARKET.assetA.toUpperCase() && market.pair[1] === global.MARKET.assetB.toUpperCase()) {
                return market;
            }
        }
    }

    /*
     * Return number of decimals for the current market
     */
    function getExchangeProperties() {
        return apiClient.getExchangeProperties();
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
    function getTicker(pMarket, callBack) {
        try {
            logInfo("getTicker -> Entering function.");
            apiClient.getTicker(pMarket, callBack);
        } catch (err) {
            logError("getTicker -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns the open positions ath the exchange for a given market and user account.
     * The object returned is an array of positions
     *
     */
    function getOpenPositions(pMarket, callBack) {
        try {
            logInfo("getOpenPositions -> Entering function. pMarket = " + JSON.stringify(pMarket));
            apiClient.getOpenPositions(pMarket, callBack);
        } catch (err) {
            logError("getOpenPositions -> Error = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns the trades for a given order number.
     * The object returned is an array of positions
     */
    function getExecutedTrades(pPositionId, callBack) {
        try {
            logInfo("getExecutedTrades -> Entering function. pPositionId = " + pPositionId);
            apiClient.getExecutedTrades(pPositionId, callBack);
        } catch (err) {
            logError("getExecutedTrades -> Error = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Creates a new buy or sell order.
     * The orderNumber is returned. String
     */
    function putPosition(pMarket, pType, pRate, pAmountA, pAmountB, callBack) {
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
                apiClient.buy(pMarket.assetA, pMarket.assetB, rate, amountB, callBack);
            } else if (pType === "sell") {
                apiClient.sell(pMarket.assetA, pMarket.assetB, rate, amountB, callBack);
            } else {
                logError("putPosition -> pType must be either 'buy' or 'sell'.");
                callBack(global.DEFAULT_FAIL_RESPONSE);
            }
        } catch (err) {
            logError("putPosition -> err = " + JSON.stringify(err.stack) || err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Move an existing position to the new rate.
     * The new orderNumber is returned.
     */
    function movePosition(pPosition, pNewRate, pNewAmountB, callBack) {
        try {
            logInfo("movePosition -> Entering function.");
            logInfo("movePosition -> pPosition = " + JSON.stringify(pPosition));
            logInfo("movePosition -> pNewRate = " + truncDecimals(pNewRate));

            apiClient.movePosition(pPosition, truncDecimals(pNewRate), truncDecimals(pNewAmountB), callBack);
        } catch (err) {
            logError("movePosition -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns all the trade history from the Exchange since startTime to endTime orderd by tradeId.
     * It's possible that the exchange doesn't support this method.
     * The object returned is an array of trades:
     * trade = {
     *           tradeID,       String
     *           globalTradeID, String
     *           type,          String
     *           rate,          Number
     *           amountA,       Number
     *           amountB,       Number
     *           date       Date
     *       };
     */
    function getPublicTradeHistory(assetA, assetB, startTime, endTime, callBack) {
        try {
            logInfo("getTradeHistory -> Entering function.");
            apiClient.getPublicTradeHistory(assetA, assetB, startTime, endTime, callBack);
        } catch (err) {
            logError("getTradeHistory -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function logInfo(message) {
        if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] ' + message) }
    }

    function logError(message) {
        logger.write(MODULE_NAME, '[ERROR] ' + message)
    }
};
