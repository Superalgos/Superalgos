exports.newAPIClient = function newAPIClient(keyVaultAPI) {

    /*
    /* ATENTION: This Library is used both a the cloud (AACloud) and also at the AAWeb on the server side without any modifications.
    /*           There is a second version, stripped of all the inner functionality that runs at AAWeb browser side, which channels the requests to the server side one.
    */

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = true;
    const MODULE_NAME = "poloniexClient";

    const retry = require('../exchangeUtils').retry;
    const includes = require('../exchangeUtils').includes;
    const _ = require('lodash');
    const Poloniex = require("./poloniex");
    const exchangeProperties = require('./poloniexProperties.json');

    const recoverableErrors = [
        'SOCKETTIMEDOUT',
        'TIMEDOUT',
        'CONNRESET',
        'CONNREFUSED',
        'NOTFOUND',
        '429',
        '522',
        '504',
        '503',
        '500',
        '502',
        'Empty response',
        'Please try again in a few minutes.',
        'Nonce must be greater than',
        'Internal error. Please try again.',
        'Connection timed out. Please try again.',
        'ENOTFOUND',
        'ECONNREFUSED',
        'CONNREFUSED',
        'NOTFOUND',
        'ESOCKETTIMEDOUT',
        'ECONNRESET',
        'Connection timed out',
        'Connection Error',
        'Order not found, or you are not the person who placed it.',
        'ETIMEDOUT'
    ];

    let API = new Poloniex(keyVaultAPI);

    let thisObject = {
        getTicker: getTicker,
        getOpenPositions: getOpenPositions,
        getExecutedTrades: getExecutedTrades,
        buy: buy,
        sell: sell,
        movePosition: movePosition,
        getPublicTradeHistory: getPublicTradeHistory,
        getExchangeProperties: getExchangeProperties,
        isValidLot: isValidLot
    };

    return thisObject;

    function joinCurrencies(currencyA, currencyB) {
        // If only one arg, then return the first
        if (typeof currencyB !== 'string') {
            return currencyA;
        }

        return currencyA + '_' + currencyB;
    }


    /*
     * Returns the properties for this exchange
     */
    function getExchangeProperties() {
        return exchangeProperties;
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

        const handle = (err, response) => {
            let ticker;
            let market = joinCurrencies(pMarket.assetA, pMarket.assetB);
            if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                ticker = {
                    bid: Number(response[market].highestBid),
                    ask: Number(response[market].lowestAsk),
                    last: Number(response[market].last)
                };
            }
            callBack(err, ticker);
        };

        const fetch = next => API.getTicker(analizeResponse(next));
        
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

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] poloniexClient -> getOpenPositions -> Entering function."); }

            const handle = (err, response) => {
                let exchangePositions = [];
                if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                    for (let i = 0; i < response.length; i++) {
                        let openPosition = {
                            id: response[i].orderNumber,
                            type: response[i].type,
                            rate: Number(response[i].rate),
                            amountA: Number(response[i].total),
                            amountB: Number(response[i].amount),
                            date: (new Date(response[i].time)).valueOf()
                        };
                        exchangePositions.push(openPosition);
                    }
                }
                callBack(err, exchangePositions);
            };

            const fetch = next => API.returnOpenOrders(pMarket.assetA, pMarket.assetB, analizeResponse(next));

            retry(null, fetch, handle);

        } catch (err) {
            console.log("[ERROR] poloniexClient -> getOpenPositions -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
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

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] poloniexClient -> getExecutedTrades -> Entering function."); }

            const handle = (err, response) => {
                let trades = [];
                if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                    for (let i = 0; i < response.length; i++) {
                        let trade = {
                            id: response[i].tradeID,
                            type: response[i].type,
                            rate: Number(response[i].rate),
                            amountA: Number(response[i].total),
                            amountB: Number(response[i].amount),
                            fee: Number(response[i].fee),
                            date: (new Date(response[i].date)).valueOf()
                        }
                        trades.push(trade);
                    }
                } else if (err.result === global.CUSTOM_OK_RESPONSE.result) {
                    // No trades found at the exchange for the position, but returning empy trades object.
                    err = global.DEFAULT_OK_RESPONSE;
                }
                callBack(err, trades);
            };

            const fetch = next => API.returnOrderTrades(pPositionId, analizeResponse(next));

            retry(null, fetch, handle);

        } catch (err) {
            console.log("[ERROR] poloniexClient -> getExecutedTrades -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Creates a new buy order.
     * The orderNumber is returned. String
     */
    function buy(pCurrencyA, pCurrencyB, pRate, pAmount, callBack) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] poloniexClient -> buy -> Entering function."); }

            const handle = (err, response) => {
                let orderNumber;
                if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                    orderNumber = response.orderNumber;
                }
                callBack(err, orderNumber);
            };

            const fetch = next => API.buy(pCurrencyA, pCurrencyB, pRate, pAmount, analizeResponse(next));

            retry(null, fetch, handle);

        } catch (err) {
            console.log("[ERROR] poloniexClient -> buy -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Creates a new sell order.
     * The orderNumber is returned. String
     */
    function sell(pCurrencyA, pCurrencyB, pRate, pAmount, callBack) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] poloniexClient -> sell -> Entering function."); }

            const handle = (err, response) => {
                let orderNumber;
                if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                    orderNumber = response.orderNumber;
                }
                callBack(err, orderNumber);
            };

            const fetch = next => API.sell(pCurrencyA, pCurrencyB, pRate, pAmount, analizeResponse(next));

            retry(null, fetch, handle);

        } catch (err) {
                console.log("[ERROR] poloniexClient -> sell -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Move an existing position to the new rate.
     * The orderNumber is returned. String
     */
    function movePosition(pPosition, pNewRate, pNewAmountB, callBack) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] poloniexClient -> movePosition -> Entering function."); }

            const handle = (err, response) => {
                let orderNumber;
                if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                    orderNumber = response.orderNumber;
                }
                callBack(err, orderNumber);
            };

            const fetch = next => API.moveOrder(pPosition.id, pNewRate, pNewAmountB, analizeResponse(next));

            retry(null, fetch, handle);

        } catch (err) {
            console.log("[ERROR] poloniexClient -> movePosition -> err = " + err.message);
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

            if (CONSOLE_LOG === true) { console.log("[INFO] poloniexClient -> getPublicTradeHistory -> Entering function."); }

            const handle = (err, response) => {
                let trades = [];
                if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                    for (let i = 0; i < response.length; i++) {
                        let trade = {
                            tradeID: response[i].tradeID,
                            globalTradeID: response[i].globalTradeID,
                            type: response[i].type,
                            rate: Number(response[i].rate),
                            total: Number(response[i].total),
                            amount: Number(response[i].amount),
                            date: new Date(response[i].date)
                        }
                        trades.push(trade);
                    }
                }
                callBack(err, trades);
            };

            const fetch = next => API.returnTradeHistory(assetA, assetB, startTime, endTime, analizeResponse(next));

            retry(null, fetch, handle);

        } catch (err) {
            console.log("[ERROR] poloniexClient -> getPublicTradeHistory -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }
    
    function isValidLot(price, amount) {
        return amount * price >= 0.0001;
    }

    function analizeResponse(callBack) {

        return (exchangeErr, exchangeResponse) => {
            let error;

            /* This function analizes the different situations we might encounter trying to access Poloniex and returns appropiate standard errors. */

            let stringExchangeErr = JSON.stringify(exchangeErr);
            let stringExchangeResponse = JSON.stringify(exchangeResponse);

            try {
                if (FULL_LOG === true) { console.log("[INFO] poloniexClient -> analizeResponse -> exchangeErr = " + stringExchangeErr); }
                if (FULL_LOG === true) { console.log("[INFO] poloniexClient -> analizeResponse -> exchangeResponse = " + stringExchangeResponse); }
                
                if (exchangeErr) {
                    error = global.DEFAULT_FAIL_RESPONSE;

                    if (includes(exchangeErr.code, recoverableErrors)) {
                        error.notFatal = true;
                    }
                } else if (!exchangeResponse || exchangeResponse === undefined) {
                    error = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: 'Empty response',
                        notFatal: true
                    };
                } else if (includes(exchangeResponse.error, ['Please complete the security check to proceed.'])) {
                    error = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: 'The IP has been flagged by CloudFlare.'
                    };
                } else if (includes(exchangeResponse.error, ['<!DOCTYPE html>'])) {
                    error = {
                        result: global.DEFAULT_FAIL_RESPONSE.result,
                        message: exchangeResponse
                    };
                } else if (includes(exchangeResponse.error, ['Not enough'])) {
                    error = {
                        result: global.DEFAULT_RETRY_RESPONSE.result,
                        message: exchangeResponse.error
                    };
                } else if (includes(exchangeResponse.error, ['Order not found, or you are not the person who placed it.'])) {
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
                
                return callBack(error, exchangeResponse);
            
            } catch (err) {
                console.log("[ERROR] poloniexClient -> analizeResponse -> err.message = " + err.message);
                return callBack(global.DEFAULT_FAIL_RESPONSE, exchangeResponse);
            }
        }
    }
        
}
