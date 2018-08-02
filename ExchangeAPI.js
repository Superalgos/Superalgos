exports.newExchangeAPI = function newExchangeAPI(BOT, logger, POLONIEX_CLIENT_MODULE) {

    /* 

    This module allows trading bots to connect to the exchange and do trading operations on it. So far it can only work with Poloniex.

    */

    const MODULE_NAME = "Exchange API";

    let bot = BOT;

    let thisObject = {
        initialize: initialize,
        getOpenPositions: getOpenPositions,
        getExecutedTrades: getExecutedTrades,
        putPosition: putPosition,
        movePosition: movePosition,
        getTicker: getTicker,
        getPublicTradeHistory: getPublicTradeHistory
    };

    let poloniexApiClient;

    return thisObject;

    function initialize(callBackFunction) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            //poloniexApiClient = POLONIEX_CLIENT_MODULE.newPoloniexAPIClient(global.EXCHANGE_KEYS[global.EXCHANGE_NAME].Key, global.EXCHANGE_KEYS[global.EXCHANGE_NAME].Secret, logger);
            poloniexApiClient = POLONIEX_CLIENT_MODULE.newBinanceAPIClient(global.EXCHANGE_KEYS[global.EXCHANGE_NAME].Key, global.EXCHANGE_KEYS[global.EXCHANGE_NAME].Secret, logger);

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {

            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns the open positions ath the exchange for a given market and user account.
     * The object returned is an array of positions:
     * position = {
     *           id,
     *           type,
     *           rate,
     *           amountA,
     *           amountB,
     *           fee, (not required)
     *           datetime
     *       };
     */
    function getOpenPositions(pMarket, callBack) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getOpenPositions -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getOpenPositions -> pMarket = " + JSON.stringify(pMarket)); }

            poloniexApiClient.API.returnOpenOrders(pMarket.assetA, pMarket.assetB, callBack);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getOpenPositions -> Error = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns the trades for a given order number.
     * The object returned is an array of positions:
     * position = {
     *           id,
     *           type,
     *           rate,
     *           amountA,
     *           amountB,
     *           fee,
     *           datetime
     *       };
     */
    function getExecutedTrades(pPositionId, callBack) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> pPositionId = " + pPositionId); }

            poloniexApiClient.API.returnOrderTrades(pPositionId, callBack);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getExecutedTrades -> Error = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Creates a new buy or sell order.
     * The orderNumber is returned.
     */
    function putPosition(pMarket, pType, pRate, pAmountA, pAmountB, callBack) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pMarket = " + JSON.stringify(pMarket)); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pType = " + pType); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pRate = " + pRate); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pAmountA = " + pAmountA); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pAmountB = " + pAmountB); }

            if (pType === "buy") {
                poloniexApiClient.API.buy(pMarket.assetA, pMarket.assetB, pRate, pAmountB, callBack);
                return;
            } 

            if (pType === "sell") {
                poloniexApiClient.API.sell(pMarket.assetA, pMarket.assetB, pRate, pAmountB, callBack);
                return;
            }

            logger.write(MODULE_NAME, "[ERROR] putPosition -> pType must be either 'buy' or 'sell'.");
            callBack(global.DEFAULT_FAIL_RESPONSE);
            return;

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] putPosition -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Move an existing position to the new rate.
     * The new orderNumber is returned.
     */
    function movePosition(pPosition, pNewRate, pNewAmountB, callBack) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> pPosition = " + JSON.stringify(pPosition)); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> pNewRate = " + pNewRate); }
            
            poloniexApiClient.API.moveOrder(pPosition, pNewRate, pNewAmountB, callBack);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] movePosition -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns the price for a given pair of assets.
     * The object returned is an array of trades:
     * ticker = {
     *           bid,
     *           ask,
     *           last
     *       };
     */
    function getTicker(pMarket, callBack) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTicker -> Entering function."); }

            poloniexApiClient.API.returnTicker(pMarket.assetA, pMarket.assetB, callBack);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] movePosition -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns all the trade history from the Exchange since startTime to endTime orderd by tradeId.
     * It's possible that the exchange doesn't support this method.
     * The object returned is an array of trades:
     * trade = {
     *           tradeIdAtExchange,
     *           marketIdAtExchange,
     *           type,
     *           rate,
     *           amountA,
     *           amountB,
     *           datetime
     *       };
     */
    function getPublicTradeHistory(assetA, assetB, startTime, endTime, callback) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTradeHistory -> Entering function."); }

            poloniexApiClient.API.returnPublicTradeHistory(assetA, assetB, startTime, endTime, callback);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getTradeHistory -> err = " + err.message);
            callback(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};