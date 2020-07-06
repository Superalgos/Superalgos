exports.newTradingExecution = function newTradingExecution(bot, logger) {
    /*
    The Trading Execution modules manages the execution of orders against the exchanges.
    */
    const MODULE_NAME = 'Trading Execution'

    let thisObject = {
        takePosition: takePosition,
        closePosition: closePosition,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine

    return thisObject

    function initialize() {

        tradingEngine = bot.simulationState.tradingEngine

    }

    function finalize() {
        tradingEngine = undefined
    }

    function takePosition() {
        /* Check that we are in LIVE MODE */
        if (bot.SESSION.type === 'Live Trading Session' || bot.SESSION.type === 'Fordward Testion Session') {
            logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> Taking a Position in ' + bot.SESSION.type)
            logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> tradingEngine.current.position.size.value  = ' + tradingEngine.current.position.size.value)
            logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> tradingEngine.current.position.rate.value = ' + tradingEngine.current.position.rate.value)
            logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> slippageAmount = ' + slippageAmount)
            logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> tradingEngine.current.position.rate.value = ' + tradingEngine.current.position.rate.value)

            /* We see if we need to put the actual order at the exchange. */
            if (variable.executionContext !== undefined) {
                switch (variable.executionContext.status) {
                    case 'Without a Position': { // We need to put the order because It was not put yet.
                        if (strategy.openStage !== undefined) {
                            if (strategy.openStage.openExecution !== undefined) {
                                putOpeningOrder()
                                return
                            }
                        }
                        break
                    }
                    case 'Position Closed': { // Waiting for a confirmation that the position was closed.
                        if (strategy.openStage !== undefined) {
                            if (strategy.openStage.openExecution !== undefined) {
                                putOpeningOrder()
                                return
                            }
                        }
                        break
                    }
                    case 'Taking Position': { // Waiting for a confirmation that the position was taken.
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionNow -> Exiting code block because status is Taking Position.')
                        break
                    }
                    case 'In a Position': { // This should mean that we already put the order at the exchange.
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionNow -> Exiting code block because status is In a Position.')
                        break
                    }
                }
            } else { // The context does not exist so it means we are not in a position.
                if (strategy.openStage !== undefined) {
                    if (strategy.openStage.openExecution !== undefined) {
                        putOpeningOrder()
                        return
                    }
                }
            }
        } else {
            logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionNow -> Not trading live.')
        }

    }

    function putOpeningOrder() {
        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Entering function.')

        /* We wont take a position unless we are withing the sessionParameters.timeRange.config.initialDatetime and the sessionParameters.timeRange.config.finalDatetime range */
        if (sessionParameters.timeRange.config.initialDatetime !== undefined) {
            if (candle.end < sessionParameters.timeRange.config.initialDatetime) {
                logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because current candle ends before the start date.  -> sessionParameters.timeRange.config.initialDatetime = ' + sessionParameters.timeRange.config.initialDatetime)
                takePositionAtSimulation()
                return
            }
        }

        /* We wont take a position if we are past the final datetime */
        if (sessionParameters.timeRange.config.finalDatetime !== undefined) {
            if (candle.begin > sessionParameters.timeRange.config.finalDatetime) {
                logger.write(MODULE_NAME, '[INFO] runSimulation -> putOpeningOrder -> Not placing the trade at the exchange because current candle begins after the end date. -> sessionParameters.timeRange.config.finalDatetime = ' + sessionParameters.timeRange.config.finalDatetime)
                takePositionAtSimulation()
                return
            }
        }

        /* Mechanism to avoid putting the same order over and over again at different executions of the simulation engine. */
        if (variable.executionContext !== undefined) {
            if (variable.executionContext.periods !== undefined) {
                if (tradingEngine.episode.episodeCounters.periods.value <= variable.executionContext.periods) {
                    logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because it was already placed at a previous execution.')
                    takePositionAtSimulation()
                    return
                }
            }
        }

        /* We are not going to place orders based on outdated information. The next filter prevents firing orders when backtesting. */
        if (currentDay) {
            let today = new Date(Math.trunc((new Date().valueOf()) / global.ONE_DAY_IN_MILISECONDS) * global.ONE_DAY_IN_MILISECONDS)
            let processDay = new Date(Math.trunc(currentDay.valueOf() / global.ONE_DAY_IN_MILISECONDS) * global.ONE_DAY_IN_MILISECONDS)
            if (today.valueOf() !== processDay.valueOf()) {
                logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because the current candle belongs to the previous day and that is considered simulation and not live trading.')
                logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> today = ' + today)
                logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> processDay = ' + processDay)
                takePositionAtSimulation()
                return
            }
        }

        let orderPrice
        let amountA
        let amountB
        let orderSide

        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            orderSide = 'sell'

            orderPrice = tradingEngine.current.position.rate.value

            amountA = tradingEngine.current.position.size.value * orderPrice
            amountB = tradingEngine.current.position.size.value
        } else {
            orderSide = 'buy'

            orderPrice = tradingEngine.current.position.rate.value

            amountA = tradingEngine.current.position.size.value
            amountB = tradingEngine.current.position.size.value / orderPrice
        }

        variable.executionContext = {
            status: 'Taking Position',
            periods: tradingEngine.episode.episodeCounters.periods.value
        }

        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Ready to create order.')
        exchangeAPI.createOrder(bot.market, orderSide, orderPrice, amountA, amountB, onOrderCreated)

        function onOrderCreated(err, order) {
            logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Entering function.')

            try {
                switch (err.result) {
                    case global.DEFAULT_OK_RESPONSE.result: {
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_OK_RESPONSE ')
                        variable.executionContext = {
                            status: 'In a Position',
                            periods: tradingEngine.episode.episodeCounters.periods.value,
                            amountA: amountA,
                            amountB: amountB,
                            orderId: order.id
                        }
                        takePositionAtSimulation()
                        return
                    }
                    case global.DEFAULT_FAIL_RESPONSE.result: {
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_FAIL_RESPONSE ')
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Message = ' + err.message)
                        strategy.openStage.openExecution.error = err.message
                        afterLoop()
                        return
                    }
                    case global.DEFAULT_RETRY_RESPONSE.result: {
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_RETRY_RESPONSE ')
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Message = ' + err.message)
                        strategy.openStage.openExecution.error = err.message
                        afterLoop()
                        return
                    }
                }
                logger.write(MODULE_NAME, '[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Unexpected Response -> Message = ' + err.message)
                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                return
            } catch (err) {
                logger.write(MODULE_NAME, '[ERROR] runSimulation  -> loop -> putOpeningOrder -> onOrderCreated ->  err = ' + err.stack)
                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                return
            }
        }
    }

    function closePosition() {
        /* Check that we are in LIVE MODE */
        if (bot.SESSION.type === 'Live Trading Session' || bot.SESSION.type === 'Fordward Testion Session') {
            /* We see if we need to put the actual order at the exchange. */
            if (variable.executionContext !== undefined) {
                switch (variable.executionContext.status) {
                    case 'Without a Position': { // No way to close anything at the exchange.
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Closing a Position -> Exiting code block because status is Without a Position.')
                        break
                    }
                    case 'In a Position': { // This should mean that we already put the order at the exchange.
                        if (strategy.closeStage !== undefined) {
                            if (strategy.closeStage.closeExecution !== undefined) {
                                putClosingOrder()
                                return
                            }
                        }
                        break
                    }
                    case 'Closing Position': { // Waiting for a confirmation that the position was taken.
                        if (strategy.closeStage !== undefined) {
                            if (strategy.closeStage.closeExecution !== undefined) {
                                putClosingOrder()
                                return
                            }
                        }
                        break
                    }

                    case 'Position Closed': { //
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Closing a Position -> Exiting code block because status is Position Closed.')
                        break
                    }
                }
            }
        }
    }

    function putClosingOrder() {
        /* Mechanism to avoid putting the same order over and over again at different executions of the simulation engine. */
        if (variable.executionContext !== undefined) {
            if (variable.executionContext.periods !== undefined) {
                if (tradingEngine.episode.episodeCounters.periods.value <= variable.executionContext.periods) {
                    logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> Exiting function because this closing was already submited at a previous execution.')
                    closePositionAtSimulation()
                    return
                }
            }
        }

        let orderPrice
        let amountA
        let amountB
        let orderSide

        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            orderSide = 'buy'

            orderPrice = ticker.last + 100 // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

            amountA = tradingEngine.current.balance.quotedAsset.value
            amountB = tradingEngine.current.balance.quotedAsset.value / orderPrice
        } else {
            orderSide = 'sell'

            orderPrice = ticker.last - 100 // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

            amountA = tradingEngine.current.balance.baseAsset.value * orderPrice
            amountB = tradingEngine.current.balance.baseAsset.value
        }

        variable.executionContext = {
            status: 'Closing Position',
            periods: tradingEngine.episode.episodeCounters.periods.value
        }

        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> About to close position at the exchange.')
        exchangeAPI.createOrder(bot.market, orderSide, orderPrice, amountA, amountB, onOrderCreated)

        function onOrderCreated(err, order) {
            logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> Entering function.')

            try {
                switch (err.result) {
                    case global.DEFAULT_OK_RESPONSE.result: {
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> DEFAULT_OK_RESPONSE ')
                        variable.executionContext = {
                            status: 'Position Closed',
                            periods: tradingEngine.episode.episodeCounters.periods.value,
                            amountA: amountA,
                            amountB: amountB,
                            orderId: order.id
                        }
                        closePositionAtSimulation()
                        return
                    }
                    case global.DEFAULT_FAIL_RESPONSE.result: {
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> DEFAULT_FAIL_RESPONSE ')
                        /* We will assume that the problem is temporary, and expect that it will work at the next execution. */
                        strategy.closeStage.closeExecution.error = err.message
                        afterLoop()
                        return
                    }
                    case global.DEFAULT_RETRY_RESPONSE.result: {
                        logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_RETRY_RESPONSE ')
                        strategy.closeStage.closeExecution.error = err.message
                        afterLoop()
                        return
                    }
                }
                logger.write(MODULE_NAME, '[ERROR] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> Unexpected Response -> Message = ' + err.message)
                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                return
            } catch (err) {
                logger.write(MODULE_NAME, '[ERROR] runSimulation  -> loop -> putClosingOrder -> onOrderCreated ->  err = ' + err.stack)
                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                return
            }
        }
    }
}

