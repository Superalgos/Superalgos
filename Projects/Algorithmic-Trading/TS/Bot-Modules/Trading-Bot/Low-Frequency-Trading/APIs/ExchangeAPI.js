exports.newAlgorithmicTradingBotModulesExchangeAPI = function (processIndex) {

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
  
    const ccxt = SA.nodeModules.ccxt
  
    return thisObject;
  
    function initialize() {
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem

        let exchangeConfig = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config
        exchangeId = exchangeConfig.codeName
        if (exchangeConfig.options !== undefined) {
            options = exchangeConfig.options
        }

        let key
        let secret
        let uid
        let password
        let sandBox = exchangeConfig.sandbox || false;
  
        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference !== undefined) {
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent !== undefined) {
                key = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.codeName
                secret = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.secret
                uid = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.uid
                password = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.password
            }
        }

        switch (exchangeId) {
            case 'okex':
            case 'okex3':
            case 'okex5':
                if (!('brokerId' in options)) {
                    options.brokerId = 'c77ccd60ec7b4cBC'
                }
                break;
        }

        const exchangeClass = ccxt[exchangeId]
        const exchangeConstructorParams = {
            'apiKey': key,
            'secret': secret,
            'uid': uid,
            'password': password,
            'timeout': 30000,
            'enableRateLimit': true,
            verbose: false,
            'adjustForTimeDifference': true,
            options: options
        }
        exchange = new exchangeClass(exchangeConstructorParams)
        // enable sandbox mode based on exchange sandbox param value
        if (sandBox) {
            exchange.setSandboxMode(sandBox);
        }
        console.log('Sandbox mode = ' + sandBox);
        // uncomment the following line if you want to log the exchange api being used
        // console.log(exchange.urls.api);
    }
  
    function finalize() {
        tradingSystem = undefined
        exchangeId = undefined
        options = undefined
        exchange = undefined
    }
  
    async function getOrder(tradingSystemOrder, tradingEngineOrder) {
  
        let orderId = tradingEngineOrder.exchangeId.value
        const symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
  
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
            const message = 'Get Order Unexpected Error'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - ' + message,
                placeholder: {}
            }
            let contextInfo = {
                symbol: symbol,
                orderId: orderId
            }
  
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, tradingSystemOrder.name, undefined, undefined, undefined, contextInfo)
  
            tradingSystem.addError([tradingSystemOrder.id, message, docs])
  
            logError("getOrder -> Error = " + err.message);
            if (/[0-9a-z]+ NotFound/.test(err.message)) {
                logInfo("getOrder -> NotFound, so order is actually closed.")
                order = {
                    status: 'NotFound'
                }
                return order
            }
        }
    }
  
    async function createOrder(tradingSystemOrder, tradingEngineOrder) {
  
        let price = tradingEngineOrder.rate.value                           // CCXT: how much quote currency you are willing to pay for a trade lot of base currency (for limit orders only)
        let type                                                            // CCXT: a string literal type of order, ccxt currently unifies market and limit orders only
        let side                                                            // CCXT: a string literal for the direction of your order, buy or sell
        let symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName    // CCXT: a string literal symbol of the market you wish to trade on, like BTC/USD, ZEC/ETH, DOGE/DASH, etc
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
  
            let exchangeApiKey = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent
            let message = 'Create Order Unexpected Error'
  
            logError("createOrder -> Error = " + err.message)
            logError("createOrder -> symbol = " + symbol);
            logError("createOrder -> side = " + side);
            logError("createOrder -> type = " + type);
            logError("createOrder -> amount = " + amount);
            logError("createOrder -> price = " + price);
            if (
                err.message.indexOf('API-key format invalid') >= 0 ||
                err.message.indexOf('Invalid API-key, IP, or permissions for action.') >= 0 ||
                err.message.indexOf('"code":-2015') >= 0
            ) {
                logError('The exchange says the API key provided is not good or it is not in the correct format. This is what you are using:')
                errorFooter()
  
                message = 'Invalid Exchange API Key'
            }
            if (
                err.message.indexOf('Signature for this request is not valid.') >= 0 ||
                err.message.indexOf('"code":-1022') >= 0
            ) {
                logError('The exchange says the secret provided is not good, incorrect or not in the correct format. This is what you are using:')
                errorFooter()
  
                message = 'Invalid Exchange API Secret'
            }
  
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - ' + message,
                placeholder: {}
            }
  
            let contextInfo = {
                symbol: symbol,
                side: side,
                type: type,
                amount: amount,
                price: price,
                key: exchangeApiKey.config.codeName,
                secret: exchangeApiKey.config.secret,
                keyLength: exchangeApiKey.config.codeName.length,
                secretLength: exchangeApiKey.config.secret.length
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, exchangeApiKey.name, undefined, exchangeApiKey.config, undefined, contextInfo)
  
            tradingSystem.addError([exchangeApiKey.id, message, docs])
  
            function errorFooter() {
                logError('key: ->' + exchangeApiKey.config.codeName + '<-')
                logError('secret: ->' + exchangeApiKey.config.secret + '<-')
                logError('key.length:' + exchangeApiKey.config.codeName.length)
                logError('secret.length:' + exchangeApiKey.config.secret.length)
                logError('Double check that you copied the key at the codeName property and the secret at secret property without bringing any invisible caracter from the exchange web site, or leaving any character from the sample text. Also check that the keys are not disabled at the exchange ot that they are not restricted by IP.')
                logError('As a remainder. Binance key and secret are 64 bytes in length each one. ')
            }
        }
    }
  
    async function cancelOrder(tradingSystemOrder, tradingEngineOrder) {
  
        let orderId = tradingEngineOrder.exchangeId.value
  
        /* Basic Logging */
        logInfo("cancelOrder -> Entering function. orderId = " + orderId);
  
        const symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
  
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
            const message = 'Cancel Order Unexpected Error'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - ' + message,
                placeholder: {}
            }
            let contextInfo = {
                symbol: symbol,
                orderId: orderId
            }
  
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, tradingSystemOrder.name, undefined, undefined, undefined, contextInfo)
  
            tradingSystem.addError([tradingSystemOrder.id, message, docs])
            logError("cancelOrder -> Error = " + err.message);
        }
    }
  
    function logInfo(message) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] ' + message)
    }
  
    function logError(message) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] ' + message)
    }
  };
  
