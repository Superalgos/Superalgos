exports.newExchangeAPI = function newExchangeAPI(logger, BOT) {
  
    let MODULE_NAME = "Exchange API";
    let LOG_INFO = true;
    let apiClient;
    let bot = BOT

    let thisObject = {
        initialize: initialize,
        getTicker: getTicker,
        getOpenOrders: getOpenOrders,
        getOrder: getOrder,
        createOrder: createOrder,
        getMaxDecimalPositions: getMaxDecimalPositions
    };

    let exchangeId
    let options = {}
    let exchange

    const ccxt = require('ccxt')

    return thisObject;

    function initialize(callBackFunction) {
        try { 
        exchangeId = bot.exchange.toLowerCase()

        let key = process.env.KEY
        let secret = process.env.SECRET

        if (key === "undefined") { key = undefined }
        if (secret === "undefined") { secret = undefined }

        const exchangeClass = ccxt[exchangeId]
        const exchangeConstructorParams = {
            'apiKey': key,
            'secret': secret,
            'timeout': 30000,
            'enableRateLimit': true,
            verbose: true,
            options: options
        }

        exchange = new exchangeClass(exchangeConstructorParams)

        callBackFunction(global.DEFAULT_OK_RESPONSE)
    } catch (err) {
            logError("initialize -> err = " + err.message);
        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
    }
    }

    function getMaxDecimalPositions() {
        return 8 
    }

    async function getTicker(market, callBackFunction) {
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
                openOrders = await(exchange.fetchOpenOrders (symbol))
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

    async function createOrder(market, side,  price,  cost,  amount, callBackFunction) {
        try {
            logInfo("createOrder -> Entering function.");

            const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset

            logInfo("createOrder -> market = " + market.assetA + "_" + market.assetB);
            logInfo("createOrder -> side = " + side);
            logInfo("createOrder -> cost = " + cost);
            logInfo("createOrder -> amount = " + amount);
            logInfo("createOrder -> price = " + price);

            if (side !== "buy" && side !== "sell") {
                logError("createOrder -> side must be either 'buy' or 'sell'.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }

            let type = 'market'
            let order

            if (exchange.has['createOrder']) {
                order = await(exchange.createOrder(symbol, type, side, amount))
                callBackFunction(global.DEFAULT_OK_RESPONSE, order)
            } else {
                logError("createOrder -> Exchange does not support createOrder command.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }

        } catch (err) {
            logError("createOrder -> err = " + JSON.stringify(err.stack) || err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function logInfo(message) {
        if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] ' + message) }
    }

    function logError(message) {
        logger.write(MODULE_NAME, '[ERROR] ' + message)
    }
};
