exports.newBinanceAPIClient = function newBinanceAPIClient(pKey, pSecret, logger) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = true;
    const MODULE_NAME = "Binance API Client";

    // MAX Decimal numers: 6
    /*
    /* ATENTION: This Library is used both a the cloud (AACloud) and also at the AAWeb on the server side without any modifications.
    /*           There is a second version, stripped of all the inner functionality that runs at AAWeb browser side, which channels the requests to the server side one.
    /*           
    /* Documentation @ https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md
    /*               @ https://support.binance.com/hc/en-us/articles/115000594711-Trading-Rule
    */

    let EMPTY_RESPONSE = "";
    let NOT_IMPLEMENTED = "Method not implemented yet.";

    let newFunction = new API(pKey, pSecret);

    let thisObject = {
        API: newFunction
    };

    return thisObject;

    function API(key, secret) {
        'use strict';

        // Module dependencies
        var crypto = require('crypto'),
            request = require('request');

        // Constants
        var recvWindow = '10000',
            API_URL = 'https://api.binance.com';

        // Helper methods
        function joinCurrencies(currencyA, currencyB) {
            // If only one arg, then return the first
            if (typeof currencyB !== 'string') {
                return currencyA;
            }

            return currencyB + '' + currencyA;
        }

        function getDate() {
            let localDate = new Date();
            let date = new Date(Date.UTC(
                localDate.getUTCFullYear(),
                localDate.getUTCMonth(),
                localDate.getUTCDate(),
                localDate.getUTCHours(),
                localDate.getUTCMinutes(),
                localDate.getUTCSeconds(),
                localDate.getUTCMilliseconds()));
            return date.valueOf();
        }

        function truncDecimals(pFloatValue) {

            return parseFloat(parseFloat(pFloatValue).toFixed(6));

        }

        // Generate headers signed by thisObject user's key and secret.
        // The secret is encapsulated and never exposed
        function _getSignature(parameters) {
            var paramString, signature;

            if (!key || !secret) {
                throw 'Binance: Error. API key and secret required';
            }

            // Convert to `arg1=foo&arg2=bar`
            paramString = Object.keys(parameters).map(function (param) {
                return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
            }).join('&');

            signature = crypto.createHmac('sha256', secret).update(paramString).digest('hex');

            return {
                signature: signature
            };
        };

        // Currently, thisObject fails with `Error: CERT_UNTRUSTED`
        // Binance.STRICT_SSL can be set to `false` to avoid thisObject. Use with caution.
        // Will be removed in future, once thisObject is resolved.
        const STRICT_SSL = true;

        // Prototype
        let thisObject = {

            // Make an API request
            _request: function (options, callback) {
                if (!('headers' in options)) {
                    options.headers = {};
                }

                options.json = true;
                options.headers['X-MBX-APIKEY'] = key;
                options.strictSSL = STRICT_SSL;
                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] request -> options = " + JSON.stringify(options)); }

                request(options, function (err, response, body) {

                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] response -> err = " + JSON.stringify(err) + ". response: " + JSON.stringify(response) + ". body:" + JSON.stringify(body)); }

                    // Empty response
                    if (!err && (typeof body === 'undefined' || body === null)) {
                        err = 'Empty response';
                    }

                    thisObject.analizeResponse(err, body, callback);
                });

                return thisObject;
            },

            // Make an API request MARKET_DATA or USER_STREAM: Endpoint requires sending a valid API-Key.
            _public: function (command, parameters, callback) { 
                var options;

                if (typeof parameters === 'function') {
                    callback = parameters;
                    parameters = {};
                }

                parameters || (parameters = {});
                options = {
                    method: 'GET',
                    url: API_URL + command,
                    qs: parameters
                };

                return thisObject._request(options, callback);
            },

            // Make an API request MARKET_DATA or USER_STREAM: Endpoint requires sending a valid API-Key.
            _signed: function (command, parameters, callback) {
                var options;

                if (typeof parameters === 'function') {
                    callback = parameters;
                    parameters = {};
                }

                parameters || (parameters = {});
                options = {
                    method: 'GET',
                    url: API_URL + command,
                    qs: parameters
                };
                options.qs.signature = _getSignature(parameters).signature;
                return thisObject._request(options, callback);
            },

            // Make an API request TRADE or USER_DATA: Endpoint requires sending a valid API-Key and signature.
            _private: function (command, parameters, callback, pMethod) {
                var options;
                let method;

                if (typeof parameters === 'function') {
                    callback = parameters;
                    parameters = {};
                }

                if (pMethod === 'DELETE') {
                    method = pMethod;
                } else {
                    method = 'POST'; // Default value
                }

                parameters || (parameters = {});
                options = {
                    method: method,
                    url: API_URL + command,
                    form: parameters,
                    qs: _getSignature(parameters)
                };
                
                return thisObject._request(options, callback);
            },

            /////// NON SIGNED METHODS

            returnTicker: function (currencyA, currencyB, callback) {
                var parameters = {
                    symbol: joinCurrencies(currencyA, currencyB)
                };

                thisObject._public('/api/v1/ticker/24hr', parameters, processResponse);

                function processResponse(err, response) {
                    let ticker;
                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        ticker = {
                            bid: Number(response.bidPrice),
                            ask: Number(response.askPrice),
                            last: Number(response.lastPrice)
                        };
                    }
                    callback(err, ticker);
                }
            },

            return24hVolume: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED , callback);
            },

            returnOrderBook: function (currencyA, currencyB, depth, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnOrderBooks: function (depth, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnPublicTradeHistory: function (currencyA, currencyB, start, end, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnChartData: function (currencyA, currencyB, period, start, end, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnCurrencies: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnLoanOrders: function (currency, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            /////// SIGNED METHODS

            returnBalances: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnCompleteBalances: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnDepositAddresses: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            generateNewAddress: function (currency, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnDepositsWithdrawals: function (start, end, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnOpenOrders: function (currencyA, currencyB, callback) {
                var parameters = {
                    symbol: joinCurrencies(currencyA, currencyB),
                    recvWindow: recvWindow,
                    timestamp: getDate().valueOf()
                };

                thisObject._signed('/api/v3/openOrders', parameters, processResponse);

                function processResponse(err, response) {
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
                    callback(err, exchangePositions);
                }
            },

            returnTradeHistory: function (currencyA, currencyB, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnOrderTrades: function (orderNumber, callback) {

                var parameters = {
                    symbol: joinCurrencies('USDT', 'BTC'), // TODO add parameters
                    timestamp: getDate().valueOf()
                };

                thisObject._signed('/api/v3/myTrades', parameters, processResponse);

                function processResponse(err, response) {
                    let exchangeTrades = [];
                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        for (let i = 0; i < response.length; i++) {
                            if (response[i].orderId === orderNumber) {
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
                    callback(err, exchangeTrades);
                }
            },

            buy: function (currencyA, currencyB, rate, amount, callback) {
                thisObject._putOrder(currencyA, currencyB, rate, amount, 'BUY', callback);
            },

            sell: function (currencyA, currencyB, rate, amount, callback) {
                thisObject._putOrder(currencyA, currencyB, rate, amount, 'SELL', callback);
            },

            _putOrder: function (currencyA, currencyB, rate, amount, side, callback) {

                // TODO ERROR management, if total < 10 return error on sells

                var parameters = {
                    symbol: joinCurrencies(currencyA, currencyB),
                    side: side,
                    type: 'LIMIT',
                    quantity: truncDecimals(amount),
                    price: rate,
                    timestamp: getDate().valueOf(),
                    timeInForce: 'GTC'
                };

                thisObject._private('/api/v3/order', parameters, processResponse);

                function processResponse(err, response) {
                    let orderNumber;
                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        orderNumber = response.orderId;
                    }
                    callback(err, orderNumber);
                }
            },

            cancelOrder: function (currencyA, currencyB, orderNumber, callback) {
                var parameters = {
                    symbol: joinCurrencies(currencyA, currencyB),
                    orderId: orderNumber,
                    timestamp: getDate().valueOf(),
                };

                thisObject._private('/api/v3/order', parameters, processResponse, 'DELETE');

                function processResponse(err, response) {
                    let orderNumber;
                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        orderNumber = response.orderId;
                    }
                    callback(err, orderNumber);
                }
            },

            moveOrder: function (position, rate, amount, callback) {
                thisObject.cancelOrder('USDT', 'BTC', orderNumber, processResponse); //TODO Maybe we will need to query the order to check executedQty

                function processResponse(err, response) {
                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        if (position.type === "buy")
                            thisObject.buy('USDT', 'BTC', rate, truncDecimals(amount), callback);
                        else
                            thisObject.sell('USDT', 'BTC', rate, truncDecimals(amount), callback);
                    } else {
                        callback(err);
                    }
                }
            },

            withdraw: function (currency, amount, address, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnFeeInfo: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnAvailableAccountBalances: function (account, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnTradableBalances: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            transferBalance: function (currency, amount, fromAccount, toAccount, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnMarginAccountSummary: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            marginBuy: function (currencyA, currencyB, rate, amount, lendingRate, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            marginSell: function (currencyA, currencyB, rate, amount, lendingRate, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            getMarginPosition: function (currencyA, currencyB, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            closeMarginPosition: function (currencyA, currencyB, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            createLoanOffer: function (currency, amount, duration, autoRenew, lendingRate, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            cancelLoanOffer: function (orderNumber, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnOpenLoanOffers: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnActiveLoans: function (callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            returnLendingHistory: function (start, end, limit, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            toggleAutoRenew: function (orderNumber, callback) {
                analizeResponse(EMPTY_RESPONSE, NOT_IMPLEMENTED, callback);
            },

            analizeResponse: function (exchangeErr, exchangeResponse, callBack) {
                /* This function analizes the different situations we might encounter trying to access Binance and returns appropiate standard errors. */

                let stringExchangeResponse = JSON.stringify(exchangeResponse);
                let stringExchangeErr = JSON.stringify(exchangeErr);

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] analizeResponse -> exchangeErr = " + stringExchangeErr); }
                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] analizeResponse -> exchangeResponse = " + stringExchangeResponse); }

                    if (stringExchangeErr.indexOf("ETIMEDOUT") > 0 ||
                        stringExchangeErr.indexOf("ENOTFOUND") > 0 ||
                        stringExchangeErr.indexOf("ECONNREFUSED") > 0 ||
                        stringExchangeErr.indexOf("ESOCKETTIMEDOUT") > 0 ||
                        stringExchangeErr.indexOf("ECONNRESET") > 0 ||
                        (stringExchangeResponse !== undefined && (
                            stringExchangeResponse.indexOf("Connection timed out") > 0 ||
                            stringExchangeResponse.indexOf("Connection Error") > 0 ||
                            stringExchangeResponse.indexOf("Bad gateway") > 0 ||
                            stringExchangeResponse.indexOf("Internal error. Please try again") > 0))) {

                        logger.write(MODULE_NAME, "[WARN] analizeResponse -> Timeout reached or connection problem while trying to access the Exchange API. Requesting new execution later.");
                        logger.write(MODULE_NAME, "[WARN] analizeResponse -> stringExchangeErr = " + stringExchangeErr);

                        callBack(global.DEFAULT_RETRY_RESPONSE);
                        return;

                    } else {

                        if (stringExchangeResponse.indexOf("code") > 0) {

                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> Unexpected response from the Exchange.");
                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> JSON.stringify(exchangeErr) = " + stringExchangeErr);
                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> JSON.stringify(exchangeResponse) = " + stringExchangeResponse);

                            /* {"error":"Not enough USDT.","success":0}*/

                            if (stringExchangeResponse.indexOf("Not enough") > 0) {

                                let err = {
                                    resutl: global.CUSTOM_FAIL_RESPONSE.result,
                                    message: exchangeResponse.error
                                };

                                callBack(err);

                            } else {

                                callBack(global.DEFAULT_FAIL_RESPONSE);

                            }
                            return;
                        }

                        if (exchangeErr) {

                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> Unexpected error trying to contact the Exchange.");
                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> exchangeErr = " + stringExchangeErr);

                            callBack(global.DEFAULT_FAIL_RESPONSE);
                            return;

                        } else {

                            logger.write(MODULE_NAME, "[INFO] analizeResponse -> No problem found.");
                            callBack(global.DEFAULT_OK_RESPONSE, exchangeResponse);
                            return;
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] analizeResponse -> err.message = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }
        };

        return thisObject;
    }


}
