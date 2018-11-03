exports.newExchangeAPI = function newExchangeAPI(botDisplayName, authToken) {

    /* 

    This module allows trading bots to connect to the exchange and do trading operations on it. So far it can only work with Poloniex.

    */
    const _ = require('lodash');
    const isValidOrder = require('./exchangeUtils').isValidOrder;
    const graphqlClient = require('graphql-client')

    //const MASTER_APP_API = 'https://app-api.advancedalgos.net/graphql';
    const MASTER_APP_API = 'http://localhost:4100/graphql';
    
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

    function initialize(callBackFunction) {
        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> initialize -> Entering function."); }

            //TODO From financial beings we get the exchange the bot is trading
            let botExchange = 'Poloniex';
            let exchange = botExchange.toLowerCase() + 'Client.js';
            let api = require('./Wrappers/' + exchange);

            if (!authToken) {
                console.log("[ERROR] Exchange API -> initialize -> User Not Logged In.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            } else {
                let keyVaultAPI = createKeyVaultAPIClient(authToken)
                apiClient = api.newAPIClient(keyVaultAPI);

                callBackFunction(global.DEFAULT_OK_RESPONSE);
            }
        } catch (err) {
            console.log("[ERROR] ExchangeAPI -> initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createKeyVaultAPIClient(authToken) {
        if (CONSOLE_LOG === true) { console.log("[INFO] createKeyVaultAPIClient -> Entering function."); }

        const keyVaultAPI = graphqlClient({
            url: MASTER_APP_API,
            headers: {
                Authorization: 'Bearer ' + authToken
            }
        });

        keyVaultAPI.signTransaction = function (transaction, next) {
            let variables = {
                botId: botDisplayName,
                transaction: transaction
            }
            
            keyVaultAPI.query(`
                mutation($botId: String, $transaction: String!){
                keyVault_SignTransaction(botId: $botId, transaction: $transaction){
                    key,
                    signature,
                    date
                }
                }`, variables, function (req, res) {
                    if (res.status === 401) {
                        next(undefined, 'Error from graphql: Not authorized');
                    }
                }).then(res => {
                    if (res.errors) {
                        next(undefined, 'Error from graphql: ' + res.errors);
                    } else {
                        let signature = {
                            Key: res.data.keyVault_SignTransaction.key,
                            Sign: res.data.keyVault_SignTransaction.signature
                        }
                        next(signature)
                    }
                }).catch(error => {
                    next(undefined, 'Error signing the message on the key vault: ' + error.message);
                });
        }

        if (CONSOLE_LOG === true) { console.log("[INFO] createKeyVaultAPIClient -> Returning graphql client."); }

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

            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> getExchangeProperties -> Entering function."); }

            return apiClient.getExchangeProperties();

        } catch (err) {
            console.log("[ERROR] ExchangeAPI -> getExchangeProperties -> err = " + err.message);
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

            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> getTicker -> Entering function."); }

            apiClient.getTicker(pMarket, callBack);

        } catch (err) {
            console.log("[ERROR] ExchangeAPI -> getTicker -> err = " + err.message);
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

            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> getOpenPositions -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> getOpenPositions -> pMarket = " + JSON.stringify(pMarket)); }

            apiClient.getOpenPositions(pMarket, callBack);

        } catch (err) {
            console.log("[ERROR] ExchangeAPI -> getOpenPositions -> Error = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Returns the trades for a given order number.
     * The object returned is an array of positions
     */
    function getExecutedTrades(pPositionId, callBack) {
        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> getExecutedTrades -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> getExecutedTrades -> pPositionId = " + pPositionId); }

            apiClient.getExecutedTrades(pPositionId, callBack);

        } catch (err) {
            console.log("[ERROR] ExchangeAPI -> getExecutedTrades -> Error = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Creates a new buy or sell order.
     * The orderNumber is returned. String
     */
    function putPosition(pMarket, pType, pRate, pAmountA, pAmountB, callBack) {
        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> putPosition -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> putPosition -> pMarket = " + JSON.stringify(pMarket)); }
            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> putPosition -> pType = " + pType); }
            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> putPosition -> pRate = " + truncDecimals(pRate)); }
            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> putPosition -> pAmountA = " + truncDecimals(pAmountA)); }
            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> putPosition -> pAmountB = " + truncDecimals(pAmountB)); }

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
                
                console.log("[ERROR] ExchangeAPI -> putPosition -> pType must be either 'buy' or 'sell'.");
                callBack(global.DEFAULT_FAIL_RESPONSE);

            } else {
                console.log("[ERROR] ExchangeAPI -> putPosition -> The order is invalid: " + check.reason);
                callBack(global.DEFAULT_FAIL_RESPONSE);
            }

        } catch (err) {
            console.log("[ERROR] ExchangeAPI -> putPosition -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    /*
     * Move an existing position to the new rate.
     * The new orderNumber is returned.
     */
    function movePosition(pPosition, pNewRate, pNewAmountB, callBack) {
        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> movePosition -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> movePosition -> pPosition = " + JSON.stringify(pPosition)); }
            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> movePosition -> pNewRate = " + truncDecimals(pNewRate)); }

            apiClient.movePosition(pPosition, truncDecimals(pNewRate), truncDecimals(pNewAmountB), callBack);

        } catch (err) {
            console.log("[ERROR] ExchangeAPI -> movePosition -> err = " + err.message);
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

            if (CONSOLE_LOG === true) { console.log("[INFO] ExchangeAPI -> getTradeHistory -> Entering function."); }

            apiClient.getPublicTradeHistory(assetA, assetB, startTime, endTime, callBack);

        } catch (err) {
            console.log("[ERROR] ExchangeAPI -> getTradeHistory -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};