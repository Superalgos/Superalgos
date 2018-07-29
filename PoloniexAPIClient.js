exports.newPoloniexAPIClient = function newPoloniexAPIClient(pKey, pSecret) {

    /*
    /* ATENTION: This Library is used both a the cloud (AACloud) and also at the AAWeb on the server side without any modifications.
    /*           There is a second version, stripped of all the inner functionality that runs at AAWeb browser side, which channels the requests to the server side one.
    */

    let newFunction = new API(pKey, pSecret);

    let thisObject = {
        API: newFunction
    };

    return thisObject;

    function API(key, secret) {
        'use strict';

        // Module dependencies
        var crypto = require('crypto'),
            request = require('request'),
            nonce = require('nonce')(); 

        // Constants
        var version = '0.0.8',
            PUBLIC_API_URL = 'https://poloniex.com/public',
            PRIVATE_API_URL = 'https://poloniex.com/tradingApi',
            USER_AGENT = 'poloniex.js ' + version;
        //USER_AGENT    = 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:26.0) Gecko/20100101 Firefox/26.0'

        // Helper methods
        function joinCurrencies(currencyA, currencyB) {
            // If only one arg, then return the first
            if (typeof currencyB !== 'string') {
                return currencyA;
            }

            return currencyA + '_' + currencyB;
        }

        // Generate headers signed by thisObject user's key and secret.
        // The secret is encapsulated and never exposed
        function _getPrivateHeaders(parameters) {
            var paramString, signature;

            if (!key || !secret) {
                throw 'Poloniex: Error. API key and secret required';
            }

            // Convert to `arg1=foo&arg2=bar`
            paramString = Object.keys(parameters).map(function (param) {
                return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
            }).join('&');

            signature = crypto.createHmac('sha512', secret).update(paramString).digest('hex');

            return {
                Key: key,
                Sign: signature
            };
        };

        // Currently, thisObject fails with `Error: CERT_UNTRUSTED`
        // Poloniex.STRICT_SSL can be set to `false` to avoid thisObject. Use with caution.
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
                options.headers['User-Agent'] = USER_AGENT;
                options.strictSSL = STRICT_SSL;

                request(options, function (err, response, body) {
                    // Empty response
                    if (!err && (typeof body === 'undefined' || body === null)) {
                        err = 'Empty response';
                    }

                    callback(err, body);
                });

                return thisObject;
            },

            // Make a public API request
            _public: function (command, parameters, callback) {
                var options;

                if (typeof parameters === 'function') {
                    callback = parameters;
                    parameters = {};
                }

                parameters || (parameters = {});
                parameters.command = command;
                options = {
                    method: 'GET',
                    url: PUBLIC_API_URL,
                    qs: parameters
                };

                options.qs.command = command;
                return thisObject._request(options, callback);
            },

            // Make a private API request
            _private: function (command, parameters, callback) {
                var options;

                if (typeof parameters === 'function') {
                    callback = parameters;
                    parameters = {};
                }

                parameters || (parameters = {});
                parameters.command = command;
                parameters.nonce = nonce();

                options = {
                    method: 'POST',
                    url: PRIVATE_API_URL,
                    form: parameters,
                    headers: _getPrivateHeaders(parameters)
                };

                return thisObject._request(options, callback);
            },

            /////
            // PUBLIC METHODS

            returnTicker: function (callback) {
                return thisObject._public('returnTicker', callback);
            },

            return24hVolume: function (callback) {
                return thisObject._public('return24hVolume', callback);
            },

            returnOrderBook: function (currencyA, currencyB, depth, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    depth: depth
                };

                return thisObject._public('returnOrderBook', parameters, callback);
            },

            returnOrderBooks: function (depth, callback) {
                var parameters = {
                    currencyPair: 'all',
                    depth: depth
                };

                return thisObject._public('returnOrderBook', parameters, callback);
            },

            returnPublicTradeHistory: function (currencyA, currencyB, start, end, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    start: start,
                    end: end
                };

                return thisObject._public('returnTradeHistory', parameters, callback);
            },

            returnChartData: function (currencyA, currencyB, period, start, end, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    period: period,
                    start: start,
                    end: end
                };

                return thisObject._public('returnChartData', parameters, callback);
            },

            returnCurrencies: function (callback) {
                return thisObject._public('returnCurrencies', callback);
            },

            returnLoanOrders: function (currency, callback) {
                return thisObject._public('returnLoanOrders', { currency: currency }, callback);
            },

            /////
            // PRIVATE METHODS

            returnBalances: function (callback) {
                return thisObject._private('returnBalances', {}, callback);
            },

            returnCompleteBalances: function (callback) {
                return thisObject._private('returnCompleteBalances', {}, callback);
            },

            returnDepositAddresses: function (callback) {
                return thisObject._private('returnDepositAddresses', {}, callback);
            },

            generateNewAddress: function (currency, callback) {
                return thisObject._private('returnDepositsWithdrawals', { currency: currency }, callback);
            },

            returnDepositsWithdrawals: function (start, end, callback) {
                return thisObject._private('returnDepositsWithdrawals', { start: start, end: end }, callback);
            },

            returnOpenOrders: function (currencyA, currencyB, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

                return thisObject._private('returnOpenOrders', parameters, callback);
            },

            returnTradeHistory: function (currencyA, currencyB, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

                return thisObject._private('returnTradeHistory', parameters, callback);
            },

            returnOrderTrades: function (orderNumber, callback) {
                var parameters = {
                    orderNumber: orderNumber
                };

                return thisObject._private('returnOrderTrades', parameters, callback);
            },

            buy: function (currencyA, currencyB, rate, amount, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    rate: rate,
                    amount: amount
                };

                return thisObject._private('buy', parameters, callback);
            },

            sell: function (currencyA, currencyB, rate, amount, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    rate: rate,
                    amount: amount
                };

                return thisObject._private('sell', parameters, callback);
            },

            cancelOrder: function (currencyA, currencyB, orderNumber, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    orderNumber: orderNumber
                };

                return thisObject._private('cancelOrder', parameters, callback);
            },

            moveOrder: function (orderNumber, rate, amount, callback) {
                var parameters = {
                    orderNumber: orderNumber,
                    rate: rate,
                    amount: amount ? amount : null
                };

                return thisObject._private('moveOrder', parameters, callback);
            },

            withdraw: function (currency, amount, address, callback) {
                var parameters = {
                    currency: currency,
                    amount: amount,
                    address: address
                };

                return thisObject._private('withdraw', parameters, callback);
            },

            returnFeeInfo: function (callback) {
                return thisObject._private('returnFeeInfo', {}, callback);
            },

            returnAvailableAccountBalances: function (account, callback) {
                var options = {};
                if (account) {
                    options.account = account;
                }
                return thisObject._private('returnAvailableAccountBalances', options, callback);
            },

            returnTradableBalances: function (callback) {
                return thisObject._private('returnTradableBalances', {}, callback);
            },

            transferBalance: function (currency, amount, fromAccount, toAccount, callback) {
                var parameters = {
                    currency: currency,
                    amount: amount,
                    fromAccount: fromAccount,
                    toAccount: toAccount
                };

                return thisObject._private('transferBalance', parameters, callback);
            },

            returnMarginAccountSummary: function (callback) {
                return thisObject._private('returnMarginAccountSummary', {}, callback);
            },

            marginBuy: function (currencyA, currencyB, rate, amount, lendingRate, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    rate: rate,
                    amount: amount,
                    lendingRate: lendingRate ? lendingRate : null
                };

                return thisObject._private('marginBuy', parameters, callback);
            },

            marginSell: function (currencyA, currencyB, rate, amount, lendingRate, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    rate: rate,
                    amount: amount,
                    lendingRate: lendingRate ? lendingRate : null
                };

                return thisObject._private('marginSell', parameters, callback);
            },

            getMarginPosition: function (currencyA, currencyB, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

                return thisObject._private('getMarginPosition', parameters, callback);
            },

            closeMarginPosition: function (currencyA, currencyB, callback) {
                var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

                return thisObject._private('closeMarginPosition', parameters, callback);
            },

            createLoanOffer: function (currency, amount, duration, autoRenew, lendingRate, callback) {
                var parameters = {
                    currency: currency,
                    amount: amount,
                    duration: duration,
                    autoRenew: autoRenew,
                    lendingRate: lendingRate
                };

                return thisObject._private('createLoanOffer', parameters, callback);
            },

            cancelLoanOffer: function (orderNumber, callback) {
                var parameters = {
                    orderNumber: orderNumber
                };

                return thisObject._private('cancelLoanOffer', parameters, callback);
            },

            returnOpenLoanOffers: function (callback) {
                return thisObject._private('returnOpenLoanOffers', {}, callback);
            },

            returnActiveLoans: function (callback) {
                return thisObject._private('returnActiveLoans', {}, callback);
            },

            returnLendingHistory: function (start, end, limit, callback) {
                var parameters = {
                    start: start,
                    end: end,
                    limit: limit
                };

                return thisObject._private('returnLendingHistory', parameters, callback);
            },

            toggleAutoRenew: function (orderNumber, callback) {
                return thisObject._private('toggleAutoRenew', { orderNumber: orderNumber }, callback);
            },

            analizeResponse: function (logger, exchangeErr, exchangeResponse, notOkCallBack, okCallBack) {

                const FULL_LOG = true;
                const LOG_FILE_CONTENT = true;
                const MODULE_NAME = "Poloniex API Client";

                /* This function analizes the different situations we might encounter trying to access Poloniex and returns appropiate standard errors. */

                try {

                    let stringExchangeResponse = JSON.stringify(exchangeResponse);
                    let stringExchangeErr = JSON.stringify(exchangeErr);

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] analizeResponse -> exchangeErr = " + stringExchangeErr); }
                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] analizeResponse -> exchangeResponse = " + stringExchangeResponse); }

                    if (stringExchangeResponse === undefined) {

                        logger.write(MODULE_NAME, "[WARN] analizeResponse -> No response received from the exchange. Retrying Later.");

                        notOkCallBack(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    if (stringExchangeErr.indexOf("ETIMEDOUT") > 0 ||
                        stringExchangeErr.indexOf("ENOTFOUND") > 0 ||
                        stringExchangeErr.indexOf("ECONNREFUSED") > 0 ||
                        stringExchangeErr.indexOf("ESOCKETTIMEDOUT") > 0 ||
                        stringExchangeErr.indexOf("ECONNRESET") > 0 ||
                        (stringExchangeResponse !== undefined && (
                            stringExchangeResponse.indexOf("Connection timed out") > 0 ||
                            stringExchangeResponse.indexOf("Connection Error") > 0 ||
                            stringExchangeResponse.indexOf("Bad gateway") > 0 ||
                            stringExchangeResponse.indexOf("Nonce must be greater than") > 0 ||
                            stringExchangeResponse.indexOf("Internal error. Please try again") > 0))) {

                        logger.write(MODULE_NAME, "[ERROR] analizeResponse -> Somethng bad happened while trying to access the Exchange API. Requesting new execution later.");
                        logger.write(MODULE_NAME, "[ERROR] analizeResponse -> stringExchangeErr = " + stringExchangeErr);

                        notOkCallBack(global.DEFAULT_RETRY_RESPONSE);
                        return;

                    } else {

                        if (JSON.stringify(exchangeResponse).indexOf("error") > 0) {

                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> Unexpected response from the Exchange.");
                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> JSON.stringify(exchangeErr) = " + JSON.stringify(exchangeErr));
                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> exchangeErr = " + exchangeErr);
                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> exchangeResponse = " + exchangeResponse);
                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> JSON.stringify(exchangeResponse) = " + JSON.stringify(exchangeResponse));

                            /* {"error":"Not enough USDT.","success":0}*/

                            if (JSON.stringify(exchangeResponse).indexOf("Not enough") > 0) {

                                let err = {
                                    resutl: global.CUSTOM_FAIL_RESPONSE.result,
                                    message: exchangeResponse.error
                                };

                                notOkCallBack(err);

                            } else {

                                notOkCallBack(global.DEFAULT_FAIL_RESPONSE);

                            }
                            return;
                        }

                        if (exchangeErr) {

                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> Unexpected error trying to contact the Exchange.");
                            logger.write(MODULE_NAME, "[ERROR] analizeResponse -> exchangeErr = " + exchangeErr);

                            notOkCallBack(global.DEFAULT_FAIL_RESPONSE);
                            return;

                        } else {

                            logger.write(MODULE_NAME, "[INFO] analizeResponse -> No problem found.");
                            okCallBack();
                            return;
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] analizeResponse -> err.message = " + err.message);
                    notOkCallBack(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }
        };

        return thisObject;
    }


}
