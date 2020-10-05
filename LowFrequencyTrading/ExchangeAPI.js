exports.newExchangeAPI = function newExchangeAPI(bot, logger) {

    let MODULE_NAME = "Exchange API";

    let thisObject = {
        getOrder: getOrder,
        createOrder: createOrder,
        cancelOrder: cancelOrder,
        initialize: initialize,
        finalize: finalize
    };

    let tradingSystem

    let exchangeId
    let options = {}
    let exchange

    const ccxt = require('ccxt')

    return thisObject;

    function initialize() {
        tradingSystem = bot.simulationState.tradingSystem

        exchangeId = bot.exchange.toLowerCase()

        let key = bot.KEY
        let secret = bot.SECRET

        const exchangeClass = ccxt[exchangeId]
        const exchangeConstructorParams = {
            'apiKey': key,
            'secret': secret,
            'timeout': 30000,
            'enableRateLimit': true,
            verbose: false,
            'adjustForTimeDifference': true, 
            options: options
        }
        exchange = new exchangeClass(exchangeConstructorParams)
    }

    function finalize() {
        tradingSystem = undefined
        exchangeId = undefined
        options = undefined
        exchange = undefined
    }

    async function getOrder(tradingSystemOrder, tradingEngineOrder) {

        let orderId = tradingEngineOrder.exchangeId.value
        const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset

        /* Basic Logging */
        logInfo("getOrder -> orderId = " + orderId)
        logInfo("getOrder -> symbol = " + symbol)

        /* Basic Validations */
        if (exchange.has['fetchOrder'] === false) {
            logError("getOrder -> Exchange does not support fetchOrder command.");
            return
        }

        try {
            let order = await exchange.fetchOrder(orderId, symbol)

            logInfo("getOrder -> Response from the Exchange: " + JSON.stringify(order));
            return order
        } catch (err) {
            tradingSystem.errors.push([tradingSystemOrder.id, "getOrder -> Error = " + err.message])
            logError("getOrder -> Error = " + err.message);
        }
    }

    async function createOrder(tradingSystemOrder, tradingEngineOrder) {

        let price = tradingEngineOrder.rate.value                           // CCXT: how much quote currency you are willing to pay for a trade lot of base currency (for limit orders only)
        let type                                                            // CCXT: a string literal type of order, ccxt currently unifies market and limit orders only
        let side                                                            // CCXT: a string literal for the direction of your order, buy or sell
        let symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset    // CCXT: a string literal symbol of the market you wish to trade on, like BTC/USD, ZEC/ETH, DOGE/DASH, etc
        let amount = tradingEngineOrder.orderBaseAsset.size.value           // CCXT: how much of currency you want to trade, in Base Asset.

        switch (tradingSystemOrder.type) {
            case 'Market Buy Order': {
                type = 'market'
                side = 'buy'
                break
            }
            case 'Market Sell Order': {
                type = 'market'
                side = 'sell'
                break
            }
            case 'Limit Buy Order': {
                type = 'limit'
                side = 'buy'
                break
            }
            case 'Limit Sell Order': {
                type = 'limit'
                side = 'sell'
                break
            }
        }

        /* Basic Logging */
        logInfo("createOrder -> symbol = " + symbol);
        logInfo("createOrder -> side = " + side);
        logInfo("createOrder -> type = " + type);
        logInfo("createOrder -> amount = " + amount);
        logInfo("createOrder -> price = " + price);

        /* Basic Validations */
        if (side !== "buy" && side !== "sell") {
            logError("createOrder -> side must be either 'buy' or 'sell'.");
            return
        }
        if (exchange.has['createOrder'] === false) {
            logError("createOrder -> Exchange does not support createOrder command.");
            return
        }

        try {
            let order = await (exchange.createOrder(symbol, type, side, amount, price))

            logInfo("createOrder -> Response from the Exchange: " + JSON.stringify(order));
            return order.id
        } catch (err) {
            tradingSystem.errors.push([tradingSystemOrder.id, "createOrder -> Error = " + err.message])
            logError("createOrder -> Error = " + err.message);
        }
    }

    async function cancelOrder(tradingSystemOrder, tradingEngineOrder) {

        let orderId = tradingEngineOrder.exchangeId.value

        /* Basic Logging */
        logInfo("cancelOrder -> Entering function. orderId = " + orderId);

        const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset

        /* Basic Validations */
        if (exchange.has['fetchOrder'] === false) {
            logError("cancelOrder -> Exchange does not support fetchOrder command.");
            return
        }

        try {
            let order = await exchange.cancelOrder(orderId, symbol)

            logInfo("cancelOrder -> Response from the Exchange: " + JSON.stringify(order));
            return true
        } catch (err) {
            tradingSystem.errors.push([tradingSystemOrder.id, "cancelOrder -> Error = " + err.message])
            logError("cancelOrder -> Error = " + err.message);
        }
    }

    function logInfo(message) {
        logger.write(MODULE_NAME, '[INFO] ' + message)
    }

    function logError(message) {
        logger.write(MODULE_NAME, '[ERROR] ' + message)
    }
};
