exports.newExchangeAPI = function newExchangeAPI(logger, authToken) {

    /*

    This module allows trading bots to connect to the exchange and do trading operations on it. So far it can only work with Poloniex.

    */
    const _ = require('lodash')
    const isValidOrder = require('./exchangeUtils').isValidOrder
    const axios = require('axios')
    let MODULE_NAME = "Exchange API";

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

    let apiClient;

    return thisObject;

    async function initialize(callBackFunction) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            let botExchange = 'Poloniex';
            let exchange = botExchange.toLowerCase() + 'Client.js';
            let api = require('./wrappers/' + exchange);

            let accessToken
            let keyId
            let cloneId
            if (global.CURRENT_EXECUTION_AT === "Cloud") {
                keyId = process.env.KEY_ID
                cloneId = process.env.CLONE_ID

                let auth = require('../utils/auth')
                let authTokenCloud = await auth.authenticate()
                accessToken = 'Bearer ' + authTokenCloud
            } else if (global.CURRENT_EXECUTION_AT === "Browser") {
                accessToken = 'Bearer ' + authToken
            }

            let keyVaultAPI = createKeyVaultAPIClient(accessToken, keyId, cloneId)
            apiClient = api.newAPIClient(keyVaultAPI, logger);

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createKeyVaultAPIClient(accessToken, keyId, cloneId) {
        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createKeyVaultAPIClient -> Entering function."); }

        const keyVaultAPI = {}
        keyVaultAPI.signTransaction = function (transaction, next) {
            axios({
                url: global.GATEWAY_ENDPOINT,
                method: 'post',
                data: {
                    query: `
                    mutation keyVault_SignTransaction($transaction: String!, $keyId: String, $cloneId: String){
                        keyVault_SignTransaction(transaction: $transaction, keyId: $keyId, cloneId: $cloneId){
                            key,
                            signature,
                            date
                        }
                    }
                    `,
                    variables: {
                        transaction: transaction,
                        keyId: keyId,
                        cloneId: cloneId
                    }
                },
                headers: {
                    authorization: accessToken
                }

            }).then(res => {
                if (res.errors) {
                    next(undefined, 'Error from graphql: ' + res.errors);
                } else {
                    let signature = {
                        Key: res.data.data.keyVault_SignTransaction.key,
                        Sign: res.data.data.keyVault_SignTransaction.signature
                    }
                    next(signature)
                }
            }).catch(error => {
                next(undefined, 'Error signing the message on the key vault: ' + error.message);
            });
        }

        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createKeyVaultAPIClient -> Returning graphql client."); }

        return keyVaultAPI;
    }

    /*
     *  Position Object = {
     *           id,        String
     *           type,      String
     *           rate,      Number
     *           amountA,   Number
     *           amountB,   Number
     *           fee,       Number
     *           datetime   Date
     *       };
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
        return _.find(getExchangeProperties().markets, (p) => {
            return _.first(p.pair) === global.MARKET.assetA.toUpperCase() &&
                _.last(p.pair) === global.MARKET.assetB.toUpperCase();
        });
    }

    /*
     * Return number of decimals for the current market
     */
    function getExchangeProperties() {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getExchangeProperties -> Entering function."); }

            return apiClient.getExchangeProperties();

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getExchangeProperties -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
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

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTicker -> Entering function."); }

            apiClient.getTicker(pMarket, callBack);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getTicker -> err = " + err.message);
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

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getOpenPositions -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getOpenPositions -> pMarket = " + JSON.stringify(pMarket)); }

            apiClient.getOpenPositions(pMarket, callBack);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getOpenPositions -> Error = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns the trades for a given order number.
     * The object returned is an array of positions
     */
    function getExecutedTrades(pPositionId, callBack) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getExecutedTrades -> pPositionId = " + pPositionId); }

            apiClient.getExecutedTrades(pPositionId, callBack);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getExecutedTrades -> Error = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Creates a new buy or sell order.
     * The orderNumber is returned. String
     */
    function putPosition(pMarket, pType, pRate, pAmountA, pAmountB, callBack) {
        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pMarket = " + JSON.stringify(pMarket)); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pType = " + pType); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pRate = " + truncDecimals(pRate)); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pAmountA = " + truncDecimals(pAmountA)); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] putPosition -> pAmountB = " + truncDecimals(pAmountB)); }

            let check = isValidOrder({
                market: getMarketConfig(),
                api: apiClient,
                amount: truncDecimals(pAmountB),
                price: truncDecimals(pRate)
            });

            if (check.valid) {
                if (pType === "buy") {
                    apiClient.buy(pMarket.assetA, pMarket.assetB, truncDecimals(pRate), truncDecimals(pAmountB), callBack);
                    return;
                }

                if (pType === "sell") {
                    apiClient.sell(pMarket.assetA, pMarket.assetB, truncDecimals(pRate), truncDecimals(pAmountB), callBack);
                    return;
                }

                logger.write(MODULE_NAME, "[ERROR] putPosition -> pType must be either 'buy' or 'sell'.");
                callBack(global.DEFAULT_FAIL_RESPONSE);

            } else {
                logger.write(MODULE_NAME, "[ERROR] putPosition -> The order is invalid: " + check.reason);
                callBack(global.DEFAULT_FAIL_RESPONSE);
            }

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
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] movePosition -> pNewRate = " + truncDecimals(pNewRate)); }

            apiClient.movePosition(pPosition, truncDecimals(pNewRate), truncDecimals(pNewAmountB), callBack);

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

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTradeHistory -> Entering function."); }

            apiClient.getPublicTradeHistory(assetA, assetB, startTime, endTime, callBack);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] getTradeHistory -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
