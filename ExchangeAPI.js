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
        getTicker: getTicker
    };

    let poloniexApiClient;

    return thisObject;

    function initialize(callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            poloniexApiClient = POLONIEX_CLIENT_MODULE.newPoloniexAPIClient(global.EXCHANGE_KEYS[global.EXCHANGE_NAME].Key, global.EXCHANGE_KEYS[global.EXCHANGE_NAME].Secret);

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {

            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getOpenPositions(pMarket, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getOpenPositions -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getOpenPositions -> pMarket = " + JSON.stringify(pMarket)); }

            poloniexApiClient.API.returnOpenOrders(pMarket.assetA, pMarket.assetB, onExchangeCallReturned);

            function onExchangeCallReturned(err, exchangeResponse) {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getOpenPositions -> onExchangeCallReturned -> Entering function."); }
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getOpenPositions -> onExchangeCallReturned -> err = " + err); }
                    if (global.LOG_CONTROL[MODULE_NAME].logContent === true) { logger.write(MODULE_NAME, "[INFO] getOpenPositions -> onExchangeCallReturned -> exchangeResponse = " + JSON.stringify(exchangeResponse)); }

                    poloniexApiClient.API.analizeResponse(logger, err, exchangeResponse, callBackFunction, onResponseOk);

                    function onResponseOk() {

                        /*

                        This is what we receive from the exchange. We will convert this to our standard format for later use.

                        [ { orderNumber: '151918418632',
                            type: 'sell',
                            rate: '20000.00000000',
                            startingAmount: '0.00010000',
                            amount: '0.00010000',
                            total: '2.00000000',
                            date: '2018-02-24 11:14:17',
                            margin: 0 } ]

                        */

                        let exchangePositions = [];

                        for (let i = 0; i < exchangeResponse.length; i++) {

                            let openPosition = {
                                id: exchangeResponse[i].orderNumber,
                                type: exchangeResponse[i].type,
                                rate: exchangeResponse[i].rate,
                                amountA: exchangeResponse[i].total,
                                amountB: exchangeResponse[i].amount,
                                date: (new Date(exchangeResponse[i].date)).valueOf()
                            };

                            exchangePositions.push(openPosition);
                        }

                        callBackFunction(global.DEFAULT_OK_RESPONSE, exchangePositions);
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] getOpenPositions -> onExchangeCallReturned -> Error = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getOpenPositions -> Error = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getExecutedTrades(pPositionId, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> pPositionId = " + pPositionId); }

            poloniexApiClient.API.returnOrderTrades(pPositionId, onExchangeCallReturned);

            function onExchangeCallReturned(err, exchangeResponse) {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> onExchangeCallReturned -> Entering function."); }
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> onExchangeCallReturned -> err = " + err); }
                    if (global.LOG_CONTROL[MODULE_NAME].logContent === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> onExchangeCallReturned -> exchangeResponse = " + JSON.stringify(exchangeResponse)); }

                    poloniexApiClient.API.analizeResponse(logger, err, exchangeResponse, callBackFunction, onResponseOk);

                    function onResponseOk() {

                        /*

                          This is what we receive from the exchange. We will convert this to our standard format for later use.

                          [
                          {
                          "globalTradeID": 20825863,
                          "tradeID": 147142,
                          "currencyPair":
                          "BTC_XVC",
                          "type": "buy",
                          "rate": "0.00018500",
                          "amount": "455.34206390",
                          "total": "0.08423828",
                          "fee": "0.00200000",
                          "date": "2016-03-14 01:04:36"
                          },
                          ...]

                          */

                        let trades = [];

                        for (let i = 0; i < exchangeResponse.length; i++) {

                            let trade = {
                                id: exchangeResponse[i].tradeID,
                                type: exchangeResponse[i].type,
                                rate: exchangeResponse[i].rate,
                                amountA: exchangeResponse[i].total,
                                amountB: exchangeResponse[i].amount,
                                fee: exchangeResponse[i].fee,
                                date: (new Date(exchangeResponse[i].date)).valueOf()
                            }

                            trades.push(trade);
                        }

                        if (global.LOG_CONTROL[MODULE_NAME].logContent === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> onExchangeCallReturned -> trades = " + JSON.stringify(trades)); }

                        callBackFunction(global.DEFAULT_OK_RESPONSE, trades);
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] getExecutedTrades -> onExchangeCallReturned -> Error = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getExecutedTrades -> Error = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function putPosition(pMarket, pType, pRate, pAmountA, pAmountB, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pMarket = " + JSON.stringify(pMarket)); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pType = " + pType); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pRate = " + pRate); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pAmountA = " + pAmountA); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pAmountB = " + pAmountB); }

            if (pType === "buy") {
                poloniexApiClient.API.buy(pMarket.assetA, pMarket.assetB, pRate, pAmountB, onExchangeCallReturned);
                return;
            } 

            if (pType === "sell") {
                poloniexApiClient.API.sell(pMarket.assetA, pMarket.assetB, pRate, pAmountB, onExchangeCallReturned);
                return;
            }

            logger.write(MODULE_NAME, "[ERROR] putPosition -> pType must be either 'buy' or 'sell'.");
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            return;

            function onExchangeCallReturned(err, exchangeResponse) {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> onExchangeCallReturned -> Entering function."); }
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> onExchangeCallReturned -> err = " + err); }
                    if (global.LOG_CONTROL[MODULE_NAME].logContent === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> onExchangeCallReturned -> exchangeResponse = " + JSON.stringify(exchangeResponse)); }

                    poloniexApiClient.API.analizeResponse(logger, err, exchangeResponse, callBackFunction, onResponseOk);

                    function onResponseOk() {

                        /*

                       This is what we can receive from the exchange.

                       {
                       "orderNumber":31226040,
                       "resultingTrades":
                           [{
                               "amount":"338.8732",
                               "date":"2014-10-18 23:03:21",
                               "rate":"0.00000173",
                               "total":"0.00058625",
                               "tradeID":"16164",
                               "type":"buy"
                           }]
                       }

                       */

                        callBackFunction(global.DEFAULT_OK_RESPONSE, exchangeResponse.orderNumber);
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] putPosition -> onExchangeCallReturned -> Error = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] putPosition -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function movePosition(pPosition, pNewRate, pNewAmountB, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> pPosition = " + JSON.stringify(pPosition)); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> pNewRate = " + pNewRate); }
            
            poloniexApiClient.API.moveOrder(pPosition.id, pNewRate, pNewAmountB, onExchangeCallReturned);

            function onExchangeCallReturned(err, exchangeResponse) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> onExchangeCallReturned -> Entering function."); }
                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> onExchangeCallReturned -> err = " + err); }
                if (global.LOG_CONTROL[MODULE_NAME].logContent === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> onExchangeCallReturned -> exchangeResponse = " + JSON.stringify(exchangeResponse)); }

                try {

                    poloniexApiClient.API.analizeResponse(logger, err, exchangeResponse, callBackFunction, onResponseOk);

                    function onResponseOk() {

                        if (exchangeResponse.success !== 1) {
                            logger.write(MODULE_NAME, "[ERROR] movePosition -> onExchangeCallReturned -> exchangeResponse.success = " + exchangeResponse.success);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                        /*

                       This is what we can receive from the exchange.

                       {
                       "orderNumber":31226040,
                       "resultingTrades":
                           [{
                               "amount":"338.8732",
                               "date":"2014-10-18 23:03:21",
                               "rate":"0.00000173",
                               "total":"0.00058625",
                               "tradeID":"16164",
                               "type":"buy"
                           }]
                       }

                       */

                        callBackFunction(global.DEFAULT_OK_RESPONSE, exchangeResponse.orderNumber);
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] movePosition -> onExchangeCallReturned -> Error = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] movePosition -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getTicker(pMarket, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTicker -> Entering function."); }

            poloniexApiClient.API.returnTicker(onExchangeCallReturned);

            function onExchangeCallReturned(err, exchangeResponse) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> onExchangeCallReturned -> Entering function."); }
                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> onExchangeCallReturned -> err = " + err); }
                if (global.LOG_CONTROL[MODULE_NAME].logContent === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> onExchangeCallReturned -> exchangeResponse = " + JSON.stringify(exchangeResponse)); }

                try {

                    poloniexApiClient.API.analizeResponse(logger, err, exchangeResponse, callBackFunction, onResponseOk);

                    function onResponseOk() {

                        /*

                       This is what we can receive from the exchange.

                       {"BTC_LTC":{ "last":"0.0251",
                                    "lowestAsk":"0.02589999",
                                    "highestBid":"0.0251",
                                    "percentChange":"0.02390438",
                                    "baseVolume":"6.16485315",
                                    "quoteVolume":"245.82513926"
                                  },
                        "BTC_NXT":{ "last":"0.00005730",
                                    "lowestAsk":"0.00005710",
                                    "highestBid":"0.00004903",
                                    "percentChange":"0.16701570",
                                    "baseVolume":"0.45347489",
                                    "quoteVolume":"9094"
                                  },
                        ... }

                       */

                        let ticker = {
                            bid: Number(exchangeResponse[pMarket].highestBid),
                            ask: Number(exchangeResponse[pMarket].lowestAsk),
                            last: Number(exchangeResponse[pMarket].last)
                        };

                        callBackFunction(global.DEFAULT_OK_RESPONSE, ticker);
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] movePosition -> onExchangeCallReturned -> Error = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] movePosition -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};