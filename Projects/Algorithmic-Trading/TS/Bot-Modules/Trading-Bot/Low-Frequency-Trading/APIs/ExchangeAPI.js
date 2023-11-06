exports.newAlgorithmicTradingBotModulesExchangeAPI = function (processIndex) {

    let MODULE_NAME = "Exchange API";

    let thisObject = {
        getOrder: getOrder,
        createOrder: createOrder,
        cancelOrder: cancelOrder,
        initialize: initialize,
        finalize: finalize
    };

    let tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
    let exchangeConfig = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config
    let exchangeId
    let options = {}
    let exchange
    let sandBox
    let rateLimit = 500
    let limit = 1000 // This is the default value
    let hostname
    let defaultType
    let maxRate
    
    
    /*
    CCXT and its unifiedAPI require a different way to find the pair because now not only spot is supported
    but swaps and futures too.
    Form CCXT
    BTC/USD         -> Could be spot
    BTC/USDT:USDT   -> Swap Linear
    BTC/USDT:BTC    -> Swap Inverse

    This is an issue in SA at the moment, since when saving data there is no distinction in folders

    -> Old code left below for a quick reverse in case of issues

    let baseAsset = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName
    let quotedAsset = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
    const symbol = baseAsset + '/' + quotedAsset
    */
   
    // Following line is left for history purposes 
    // const symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
       
    // Here the pair is passed to ccxt using the full codeName of the Market under Exchnage Markets
    const symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.config.codeName

    const ccxt = SA.nodeModules.ccxt

    return thisObject;

    function initialize() {
        // MOVED AT TOP tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        // MOVED AT TOP exchangeConfig = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config    
        
        // Take the codeName and check if sandBox mode is to enable
        exchangeId = exchangeConfig.codeName        
        sandBox = exchangeConfig.sandBox || false   // true for sandBox mode if available
        // Check options to pass to the exchange constructor
        if (exchangeConfig.options !== undefined) {
            options = exchangeConfig.options
        }
        if (exchangeConfig.maxRate !== undefined) {
            maxRate = exchangeConfig.maxRate            // Max number of fetched candles before saving
        }                                           
        if (exchangeConfig.limit !== undefined) {
            limit = exchangeConfig.limit                // Some exchanges need this parameter -> Bybit
        }
        if (exchangeConfig.rateLimit !== undefined) {
            rateLimit = exchangeConfig.rateLimit        // Custom rateLimit
        }
        if (exchangeConfig.hostname !== undefined) {
            hostname = exchangeConfig.hostname          // Custom hostname
        }
        
        // Exchange API parameters
        let key
        let secret
        let uid
        let password
        
        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference !== undefined) {
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent !== undefined) {
                key = TS.projects.foundations.utilities.credentialsFunctions.getCredentialValue(TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.codeName)
                secret = TS.projects.foundations.utilities.credentialsFunctions.getCredentialValue(TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.secret)
                uid = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.uid
                password = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.password
            }
        }

        // OKEX exchange compatibility
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

        // This code is left for retro-compatibility with the code above "API"
        if (rateLimit !== undefined) {
            exchangeConstructorParams.rateLimit = rateLimit
        }
        if (hostname !== undefined) {
            exchangeConstructorParams.hostname = hostname
        }

        // Exchange instantiation
        exchange = new exchangeClass(exchangeConstructorParams)
        
        if (sandBox) {
            exchange.setSandboxMode(sandBox)
            /* Uncomment to log
            SA.logger.info('ExchangeAPI connection starting.... ')
            SA.logger.info('Sandbox mode is: ' + sandBox)
            SA.logger.info(exchange.urls.api)
            SA.logger.info('')
            SA.logger.info('exchangeConstructorParams:')
            SA.logger.info(exchangeConstructorParams)
            SA.logger.info('')
            SA.logger.info('limit is: ' + limit)
            */
        }
        
    }

    function finalize() {
        tradingSystem = undefined
        exchangeId = undefined
        options = undefined
        exchange = undefined
    }

    async function getOrder(tradingSystemOrder, tradingEngineOrder) {

        let orderId = tradingEngineOrder.exchangeId.value
        
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
        // let symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName    // CCXT: a string literal symbol of the market you wish to trade on, like BTC/USD, ZEC/ETH, DOGE/DASH, etc
        let amount // = tradingEngineOrder.orderBaseAsset.size.value           // CCXT: how much of currency you want to trade, in Base Asset.
        
        // The above amount can be better configured?
        // Check if market is linear or inverse?
        // I propose to use the definition inside the exchange config -> options -> defaultType: inverse


        if (exchangeConfig.options !== undefined) {
            if (exchangeConfig.options.defaultType !== undefined) {
                defaultType = exchangeConfig.options.defaultType

                if (defaultType == 'inverse') {
                    amount = tradingEngineOrder.orderQuotedAsset.size.value
                } else {
                    amount = tradingEngineOrder.orderBaseAsset.size.value
                }
            } 
        } else {amount = tradingEngineOrder.orderBaseAsset.size.value}

        // Uncomment for debug
        // SA.logger.info('exchangeConfig.options.defaultType is: ' + exchangeConfig.options.defaultType)
        
        
        // Some exchanges need additional params once connected
        // positionParams is at the Market Config
        // orderParams is at the Order Config in a Strategy -> Control how order is sent -> i.e. send a Reduce Only order
        let positionParams = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.config.positionParams
        let orderParams = tradingSystemOrder.config.orderParams
        
        // Uncomment for debug
        // SA.logger.info(positionParams)
        // SA.logger.info(orderParams)

        // Above params are merged and passed to ccxt
        let params = {...positionParams, ...orderParams};
        
        // Uncomment for debug
        // SA.logger.info('Merged Params from Market + Order Close Stage')
        // SA.logger.info(JSON.stringify(params))
        // exchange.verbose = true

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

        // Hotfix to overcome issue with Binance Spot Market Orders as per https://github.com/ccxt/ccxt/issues/18663
        if (exchangeId === 'binance' && type === 'market') { price = undefined }

        /* Basic Logging */
        logInfo("createOrder -> symbol = " + symbol);
        logInfo("createOrder -> side = " + side);
        logInfo("createOrder -> type = " + type);
        logInfo("createOrder -> amount = " + amount);
        logInfo("createOrder -> price = " + price);
        logInfo("createOrder -> params = " + params);

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
            // ccxt unified methods of exchanges might expect and will accept various params which affect their functionality
            let order = await (exchange.createOrder(symbol, type, side, amount, price, params))

            // Uncomment for debugging
            // SA.logger.info(order.info)
            // SA.logger.info(exchange.market(symbol))
            // SA.logger.info('The order placed in ExchangeAPI is:')
            // SA.logger.info(order)

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
            logError("createOrder -> URL = " + exchange.urls.api);
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

        // const symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
        const symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.config.codeName

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

