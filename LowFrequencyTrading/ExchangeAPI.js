exports.newExchangeAPI = function newExchangeAPI(logger, BOT) {

    let MODULE_NAME = "Exchange API";
    let LOG_INFO = true;
    let bot = BOT

    let thisObject = {
        getTicker: getTicker,
        getOpenOrders: getOpenOrders,
        getOrder: getOrder,
        createOrder: createOrder,
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

        if (key === "undefined") { key = undefined }
        if (secret === "undefined") { secret = undefined }

        const exchangeClass = ccxt[exchangeId]
        const exchangeConstructorParams = {
            'apiKey': key,
            'secret': secret,
            'timeout': 30000,
            'enableRateLimit': true,
            verbose: false,
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

    async function getTicker(callBackFunction) {
        try {
            logInfo("getTicker -> Entering function.");
            const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset
            let ticker

            if (exchange.has['fetchTicker']) {
                ticker = await (exchange.fetchTicker(symbol))
                callBackFunction(global.DEFAULT_OK_RESPONSE, ticker)
            } else {
                logError("getTicker -> Exchange does not support fetchTicker command.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }

        } catch (err) {
            logError("getTicker -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    async function getOpenOrders(market, callBackFunction) {
        try {
            logInfo("getOpenOrders -> Entering function. market = " + JSON.stringify(market));

            const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset
            let openOrders

            if (exchange.has['fetchOpenOrders']) {
                openOrders = await (exchange.fetchOpenOrders(symbol))
                callBackFunction(global.DEFAULT_OK_RESPONSE, openOrders)
            } else {
                logError("getOpenOrders -> Exchange does not support fetchOpenOrders command.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }

        } catch (err) {
            logError("getOpenOrders -> Error = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    async function getOrder(orderId, market, callBackFunction) {
        try {
            logInfo("getOrder -> Entering function. orderId = " + orderId);

            const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset
            let order

            if (exchange.has['fetchOrder']) {
                order = await (exchange.fetchOrder(orderId, symbol))
                callBackFunction(global.DEFAULT_OK_RESPONSE, order)
            } else {
                logError("getOrder -> Exchange does not support fetchOrder command.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }
        } catch (err) {
            logError("getOrder -> Error = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    async function createOrder(tradingSystemOrder, tradingEngineOrder) {

        let price = tradingEngineOrder.rate                                 // CCXT: how much quote currency you are willing to pay for a trade lot of base currency (for limit orders only)
        let amount = tradingEngineOrder.size                                // CCXT: how much of currency you want to trade
        let type                                                            // CCXT: a string literal type of order, ccxt currently unifies market and limit orders only
        let side                                                            // CCXT: a string literal for the direction of your order, buy or sell
        let symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset    // CCXT: a string literal symbol of the market you wish to trade on, like BTC/USD, ZEC/ETH, DOGE/DASH, etc

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
        logInfo("createOrder -> cost = " + cost);
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
            let order = await (exchange.createOrder(symbol, type, side, amount))
            return order.id
        } catch (err) {
            tradingSystem.errors.push([tradingSystemOrder.id, err.message])
            logError("getOrder -> Error = " + err.message);
        }
    }

    function logInfo(message) {
        if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] ' + message) }
    }

    function logError(message) {
        logger.write(MODULE_NAME, '[ERROR] ' + message)
    }
};
