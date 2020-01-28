exports.newAPIClient = function newAPIClient(pKey, pSecret, logger) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = true;
    const MODULE_NAME = "binanceClient";

    const retry = require('../exchangeUtils').retry;
    const includes = require('../exchangeUtils').includes;
    const Binance = require("./binance");
    const exchangeProperties = require('./poloniexProperties.json');

    const recoverableErrors = [
        'SOCKETTIMEDOUT',
        'TIMEDOUT',
        'CONNRESET',
        'CONNREFUSED',
        'NOTFOUND',
        'Error -1021',
        'Response code 429',
        'Response code 5',
        'ETIMEDOUT'
    ];

    let API = new Binance({
        key: pKey,
        secret: pSecret,
        timeout: 15000,
        recvWindow: 60000,
        disableBeautification: false,
        handleDrift: true,
    });

    let thisObject = {
        getTicker: getTicker,
        getOpenPositions: getOpenPositions,
        getExecutedTrades: getExecutedTrades,
        buy: buy,
        sell: sell,
        movePosition: movePosition,
        getPublicTradeHistory: getPublicTradeHistory,
        getExchangeProperties: getExchangeProperties
    };

    return thisObject;

    function joinCurrencies(currencyA, currencyB) {
        // If only one arg, then return the first
        if (typeof currencyB !== 'string') {
            return currencyA;
        }

        return currencyB + '' + currencyA;
    }

    /*
     * Returns the properties for this exchange
     */
    function getExchangeProperties() {
        return exchangeProperties;
    }

    function truncDecimals(pFloatValue) {

        let decimals = 6;

        return parseFloat(parseFloat(pFloatValue).toFixed(decimals));

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

	let market = joinCurrencies(pMarket.assetA, pMarket.assetB);
        const handle = (err, response) => {
            let ticker;
            if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                ticker = {
                    bid: Number(response.bidPrice),
                    ask: Number(response.askPrice),
                    last: Number(response.lastPrice)
                };
            }
            callBack(err, ticker);
        };

        const fetch = next => API.ticker24hr(market, analizeResponse(next));

        retry(null, fetch, handle);
    }

    /*
     * Returns the open positions ath the exchange for a given market and user account.
     * The object returned is an array of positions:
     * position = {
     *           id,
     *           type,
     *           rate, Number
     *           amountA, Number
     *           amountB, Number
     *           fee, (not required)  Number
     *           datetime
     *       };
     */
    function getOpenPositions(pMarket, callBack) {

	let market = joinCurrencies(pMarket.assetA, pMarket.assetB);
        const handle = (err, response) => {
            let exchangePositions = [];
            if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                for (let i = 0; i < response.length; i++) {
                    let openPosition = {
                        id: response[i].orderId,
                        type: response[i].side.toLowerCase(),
                        rate: Number(response[i].price),
                        amountA: truncDecimals(response[i].origQty * response[i].price),
                        amountB: Number(response[i].origQty),
                        date: (new Date(response[i].time)).valueOf()
                    };
                    exchangePositions.push(openPosition);
                }
            }
            callBack(err, exchangePositions);
        };

        const fetch = next => API.openOrders(market, analizeResponse(next));

        retry(null, fetch, handle);
    }

    /*
     * Returns the trades for a given order number.
     * The object returned is an array of positions:
     * position = {
     *           id,
     *           type,
     *           rate, Number
     *           amountA, Number
     *           amountB, Number
     *           fee, Number
     *           datetime
     *       };
     */
    function getExecutedTrades(pPositionId, callBack) {

	let market = joinCurrencies(global.MARKET.assetA, global.MARKET.assetB);
        const handle = (err, response) => {
            let exchangeTrades = [];
            if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                for (let i = 0; i < response.length; i++) {
                    if (response[i].orderId === pPositionId) {
                        let type = "sell"
                        if (response[i].isBuyer === true) {
                            type = "buy";
                        }
                        let trade = {
                            id: response[i].orderId,
                            type: type,
                            rate: Number(response[i].price),
                            amountA: truncDecimals(response[i].qty * response[i].price),
                            amountB: Number(response[i].qty),
                            fee: Number(response[i].commission),
                            date: (new Date(response[i].time)).valueOf()
                        };
                        exchangeTrades.push(trade);
                        break;
                    }
                }
            }
            callBack(err, exchangeTrades);
        };

        const fetch = next => API.myTrades(market, analizeResponse(next));

        retry(null, fetch, handle);
    }

    /*
     * Creates a new buy order.
     * The orderNumber is returned.
     */
    function buy(pCurrencyA, pCurrencyB, pRate, pAmount, callBack) {

	    var parameters = {
            symbol: joinCurrencies(pCurrencyA, pCurrencyB),
            side: 'BUY',
            type: 'LIMIT',
            quantity: pAmount,
            price: pRate,
            timeInForce: 'GTC'
        };
        const handle = (err, response) => {
            let orderNumber;
            if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                orderNumber = response.orderId;
            }
            callBack(err, orderNumber);
        };

        const fetch = next => API.newOrder(parameters, analizeResponse(next));

        retry(null, fetch, handle);

    }

    /*
     * Creates a new sell order.
     * The orderNumber is returned. String
     */
    function sell(pCurrencyA, pCurrencyB, pRate, pAmount, callBack) {

        var parameters = {
            symbol: joinCurrencies(pCurrencyA, pCurrencyB),
            side: 'SELL',
            type: 'LIMIT',
            quantity: pAmount,
            price: pRate,
            timeInForce: 'GTC'
        };
        const handle = (err, response) => {
            let orderNumber;
            if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                orderNumber = response.orderId;
            }
            callBack(err, orderNumber);
        };

        const fetch = next => API.newOrder(parameters, analizeResponse(next));

        retry(null, fetch, handle);
    }

    /* //TODO Complete partial orders
    * Move an existing position to the new rate.
    * The new orderNumber is returned. String
    */
    function movePosition(pPosition, pNewRate, pNewAmountB, callBack) {

        var parameters = {
            symbol: joinCurrencies(global.MARKET.assetA, global.MARKET.assetB),
            orderId: pPosition.id
        };

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] moveOrder -> Step1 - Cancelling Position: " + JSON.stringify(pPosition)); }

        const handle = (err, response) => {
            if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] moveOrder -> Step1 Complete - Position Cancelled. Proceeding to put the new position."); }

                if (position.type === "buy")
                    thisObject.buy(global.MARKET.assetA, global.MARKET.assetB, pNewRate, pNewAmountB, callBack);
                else
                    thisObject.sell(global.MARKET.assetA, global.MARKET.assetB, pNewRate, pNewAmountB, callBack);
            } else {
                callBack(err);
            }
        };

        const fetch = next => API.cancelOrder(parameters, analizeResponse(next));

        retry(null, fetch, handle);
    }

    /* //TODO Pending Review
     * Returns all the trade history from the Exchange since startTime to endTime orderd by tradeId.
     * It's possible that the exchange doesn't support this method.
     * The object returned is an array of trades:
     * trade = {
     *           tradeIdAtExchange,
     *           marketIdAtExchange,
     *           type,
     *           rate, Number
     *           amountA, Number
     *           amountB, Number
     *           datetime
     *       };
     */
    function getPublicTradeHistory(assetA, assetB, startTime, endTime, callBack) {

	if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] getPublicTradeHistory -> Not implemented yet."); }
        callBack(global.DEFAULT_FAIL_RESPONSE);
    }

    function analizeResponse(callBack) {

        return (exchangeErr, exchangeResponse) => {
            let error;

            /* This function analizes the different situations we might encounter trying to access Binance and returns appropiate standard errors. */

            let stringExchangeErr = JSON.stringify(exchangeErr);
            let stringExchangeResponse = JSON.stringify(exchangeResponse);

            try {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] analizeResponse -> exchangeErr = " + stringExchangeErr); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] analizeResponse -> exchangeResponse = " + stringExchangeResponse); }

                if (exchangeErr) {
                    error = global.DEFAULT_FAIL_RESPONSE;
                } else if (!exchangeResponse) {
                    error = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: 'Empty response'
                    };
                } else if (includes(exchangeResponse.error, ['<!DOCTYPE html>'])) {
                    error = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: exchangeResponse
                    };
                } else if (includes(exchangeResponse.error, ['Order does not exist.'])) {
                    error = {
                        result: global.CUSTOM_OK_RESPONSE.result,
                        message: exchangeResponse.error
                    };
                } else if (exchangeResponse.error) {
                    error = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: exchangeResponse.error
                    };
                }

                if (error) {
                    if (includes(error.message, recoverableErrors)) {
                        error.notFatal = true;
                    }
                }

                return callBack(error, exchangeResponse);

            } catch (err) {
                logger.write(MODULE_NAME, "[ERROR] analizeResponse -> err.message = " + err.message);
                return callBack(global.DEFAULT_FAIL_RESPONSE, exchangeResponse);
            }
        }
    }

}
