exports.newAPIClient = function newAPIClient(keyVaultAPI, logger) {
    const Coss = require("./coss");
    const exchangeProperties = require('./cossProperties.json');
    let API = Coss(keyVaultAPI);

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
    async function getTicker(pMarket, callBack) {

        let params = {}
        params.Symbol = joinCurrencies(pMarket.assetB, pMarket.assetA)
        try {
            var response = await API.getPairDepth(params)
            let ticker = {
                bid: Number(response.bids[0][0]),
                ask: Number(response.asks[0][0]),
                last: Number((response.bids[0][0] + response.asks[0][0]) / 2) // TODO Pending review
            };

            callBack(global.DEFAULT_OK_RESPONSE.result, ticker)
        } catch (error) {
            callBack(global.DEFAULT_FAIL_RESPONSE.result)
        }
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
        // Not implemented yet
        callBack(global.DEFAULT_OK_RESPONSE)
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
        // Not implemented yet
        callBack(global.DEFAULT_OK_RESPONSE)
    }

    /*
     * Creates a new buy order.
     * The orderNumber is returned. String
     */
    function buy(pCurrencyA, pCurrencyB, pRate, pAmount, callBack) {
        // Not implemented yet
        callBack(global.DEFAULT_OK_RESPONSE)
    }

    /*
     * Creates a new sell order.
     * The orderNumber is returned. String
     */
    function sell(pCurrencyA, pCurrencyB, pRate, pAmount, callBack) {
        // Not implemented yet
        callBack(global.DEFAULT_OK_RESPONSE)
    }

    /*
     * Move an existing position to the new rate.
     * The orderNumber is returned. String
     */
    function movePosition(pPosition, pNewRate, pNewAmountB, callBack) {
        // Not implemented yet
        callBack(global.DEFAULT_OK_RESPONSE)
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
    async function getPublicTradeHistory(assetA, assetB, startTime, endTime, callBack) {

        let params = {}
        params.Symbol = joinCurrencies(assetB, assetA)
        try {
            let trades = []
            var response = await API.getTradeHistory(params);
            for (let i = 0; i < response.history.length; i++) {
                let record = response.history[i]
                let type
                if (record.isBuyerMaker) {
                    type = "sell"
                } else {
                    type = "buy"
                }

                let trade = {
                    tradeID: record.id,
                    globalTradeID: record.id,
                    type: type,
                    rate: Number(record.price),
                    amount: Number(record.qty),
                    total: Number(record.price) * Number(record.qty),
                    date: new Date(record.time)
                }
                trades.push(trade);
            }
            trades.sort((a, b) => b.tradeID - a.tradeID);
            callBack(global.DEFAULT_OK_RESPONSE, trades);
        } catch (error) {
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function isValidLot(price, amount) {
        return amount * price >= 0.0001;
    }
}
