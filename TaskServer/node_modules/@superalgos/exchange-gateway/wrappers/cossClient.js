exports.newAPIClient = function newAPIClient(keyVaultAPI, logger) {
    const Coss = require("./coss");
    const exchangeProperties = require('./cossProperties.json');
    let API = Coss(keyVaultAPI, logger);

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
                last: (Number(response.bids[0][0]) + Number(response.asks[0][0])) / 2 // TODO Pending review
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
    async function getOpenPositions(pMarket, callBack) {
        try {
            let params = {}
            params.Symbol = joinCurrencies(pMarket.assetB, pMarket.assetA)
            params.Limit = 10
            var response = await API.getOpenOrders(params)
            let exchangePositions = []
            for (let i = 0; i < response.list.length; i++) {
                let openPosition = {}
                openPosition.id = response.list[i].order_id
                openPosition.type = response.list[i].order_side === "SELL" ? "sell" : "buy"
                openPosition.rate = Number(response.list[i].order_price)
                openPosition.amountB = Number(response.list[i].order_size)
                openPosition.amountA = Number(response.list[i].total.substring(0,10))
                openPosition.date = response.list[i].createTime

                exchangePositions.push(openPosition);
            }

            callBack(global.DEFAULT_OK_RESPONSE.result, exchangePositions)
        } catch (error) {
            callBack(global.DEFAULT_FAIL_RESPONSE.result)
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
    async function getExecutedTrades(pPositionId, callBack) {
        try {
            let params = {}
            params.ID = pPositionId
            var response = await API.getTradeDetails(params)
            let trades = []
            for (let i = 0; i < response.length; i++) { // Pending Test
                let trade = {}
                trade.id = response[i].order_id
                trade.type = response[i].order_side === "SELL" ? "sell" : "buy"
                trade.rate = Number(response[i].order_price)
                trade.amountB = Number(response[i].order_size)
                trade.amountA = Number(response[i].total.substring(0,10))
                trade.date = response[i].createTime

                trades.push(trade);
            }

            callBack(global.DEFAULT_OK_RESPONSE.result, trades)
        } catch (error) {
            callBack(global.DEFAULT_FAIL_RESPONSE.result)
        }
    }

    /*
     * Creates a new buy order.
     * The orderNumber is returned. String
     */
    function buy(pCurrencyA, pCurrencyB, pRate, pAmount, callBack) {
        try {
            let params = {}
            params.Symbol = joinCurrencies(pCurrencyB, pCurrencyA)
            params.Side = 'BUY'
            params.Price = pRate
            params.Amount = pAmount
            var response = await API.placeLimitOrder(params)

            callBack(global.DEFAULT_OK_RESPONSE.result, response.order_id)
        } catch (error) {
            callBack(global.DEFAULT_FAIL_RESPONSE.result)
        }
    }

    /*
     * Creates a new sell order.
     * The orderNumber is returned. String
     */
    async function sell(pCurrencyA, pCurrencyB, pRate, pAmount, callBack) {
        try {
            let params = {}
            params.Symbol = joinCurrencies(pCurrencyB, pCurrencyA)
            params.Side = 'SELL'
            params.Price = pRate
            params.Amount = pAmount
            var response = await API.placeLimitOrder(params)

            callBack(global.DEFAULT_OK_RESPONSE.result, response.order_id)
        } catch (error) {
            callBack(global.DEFAULT_FAIL_RESPONSE.result)
        }
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
}
