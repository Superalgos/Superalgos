exports.newTradingOrders = function newTradingOrders(bot, logger, tradingEngineModule) {
    /*
    The Trading Orders modules manages the execution of orders against the exchanges.
    */
    const MODULE_NAME = 'Trading Orders'

    let thisObject = {
        mantain: mantain,
        reset: reset,
        checkOrders: checkOrders,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let tradingSystem
    let sessionParameters

    const EXCHANGE_API_MODULE = require('./ExchangeAPI.js')
    let exchangeAPIModule = EXCHANGE_API_MODULE.newExchangeAPI(bot, logger)

    const ANNOUNCEMENTS_MODULE = require('./Announcements.js')
    let announcementsModule = ANNOUNCEMENTS_MODULE.newAnnouncements(bot, logger)

    return thisObject

    function initialize() {
        tradingSystem = bot.simulationState.tradingSystem
        tradingEngine = bot.simulationState.tradingEngine
        sessionParameters = bot.SESSION.parameters

        exchangeAPIModule.initialize()
        announcementsModule.initialize()
    }

    function finalize() {
        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined

        exchangeAPIModule.finalize()
        exchangeAPIModule = undefined

        announcementsModule.finalize()
        announcementsModule = undefined
    }

    function mantain() {
        mantainReset(true, false)
    }

    function reset() {
        mantainReset(false, true)
    }

    function mantainReset(mantain, reset) {

        if (tradingEngine.current.strategy.index.value === tradingEngine.current.strategy.index.config.initialValue) { return }

        let stageNode
        let executionNode

        stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
        executionNode = stageNode.openExecution
        processExecutionNode(executionNode, tradingEngine.current.strategyOpenStage.status.value)

        stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].closeStage
        executionNode = stageNode.closeExecution
        processExecutionNode(executionNode, tradingEngine.current.strategyCloseStage.status.value)

        function processExecutionNode(executionNode, stageStatus) {

            preocessExecutionAlgorithms(executionNode)

            function preocessExecutionAlgorithms(executionNode) {
                for (let i = 0; i < executionNode.executionAlgorithms.length; i++) {
                    let executionAlgorithm = executionNode.executionAlgorithms[i]
                    processOrders(executionAlgorithm.marketBuyOrders)
                    processOrders(executionAlgorithm.marketSellOrders)
                    processOrders(executionAlgorithm.limitBuyOrders)
                    processOrders(executionAlgorithm.limitSellOrders)
                }
            }

            function processOrders(orders) {
                for (let i = 0; i < orders.length; i++) {
                    let tradingSystemOrder = orders[i]
                    if (tradingSystemOrder.referenceParent === undefined) {
                        badDefinitionUnhandledException(undefined, 'tradingSystemOrder.referenceParent === undefined', tradingSystemOrder)
                    }
                    let tradingEngineOrder = tradingEngineModule.getNodeById(tradingSystemOrder.referenceParent.id)

                    if (tradingEngineOrder.status === undefined) {
                        badDefinitionUnhandledException(undefined, 'tradingEngineOrder.status === undefined', tradingEngineOrder)
                    }

                    if (mantain === true) {
                        updateCounters(tradingEngineOrder)
                        updateEnds(tradingEngineOrder)
                        updateStatistics(tradingEngineOrder)
                    }
                    if (reset === true) {
                        resetTradingEngineDataStructure(tradingEngineOrder, tradingSystemOrder, stageStatus)
                    }
                }
            }
        }
    }

    async function checkOrders(tradingEngineStage, orders, executionAlgorithm, executionNode) {
        for (let i = 0; i < orders.length; i++) {

            let tradingSystemOrder = orders[i]
            tradingSystemValidations(tradingSystemOrder)
            let tradingEngineOrder = tradingEngineModule.getNodeById(tradingSystemOrder.referenceParent.id)
            tradingEngineValidations(tradingEngineOrder)

            switch (tradingEngineOrder.status.value) {
                case 'Not Open': {
                    {
                        /* During the First cycle we can not create new orders. That is reserved for the Second cycle. */
                        if (tradingEngine.current.episode.cycle.value === 'First') { continue }
                        /* When the stage is closing we can not create new orders */
                        if (tradingEngineStage.status.value === 'Closing') { continue }
                        /* 
                        Check if we can create an order based on the config value for spawnMultipleOrders.
                        Trading System Orders that cannot spawn more than one Trading Engine Order needs to check if
                        at the Trading Engine Order the lock is Open or Closed. 
                        */
                        if (tradingSystemOrder.config.spawnMultipleOrders !== true) {
                            if (tradingEngineOrder.lock.value === 'Closed') {
                                tradingSystem.infos.push(['Order ' + tradingSystemOrder.name + ' skipped because lock was closed.'])
                                continue
                            }
                        }
                        /* Check if we need to Create this Order */
                        let situationName = await checkOrderEvent(tradingSystemOrder.createOrderEvent, tradingSystemOrder, executionAlgorithm, executionNode)
                        if (situationName !== undefined) {

                            /* Open a new order */
                            await tryToOpenOrder(tradingEngineStage, executionAlgorithm, tradingSystemOrder, tradingEngineOrder, situationName)
                        }
                    }
                    break
                }
                case 'Open': {
                    /* During the Second cycle we can not cancel orders. That is reserved for the First cycle. */
                    if (tradingEngine.current.episode.cycle.value === 'Second') { continue }

                    /* Simulate Events that happens at the Exchange, if needed. */
                    simulateExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder)

                    /* Check Events that happens at the Exchange, if needed. */
                    let allGood = await checkExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder)

                    if (allGood !== true) {
                        /*
                        For some reason we could not check the order at the exchange, so we will not even check if we 
                        need to cancel it, since we could end up with inconsisten information at the accounting level.
                        */
                        if (tradingSystemOrder.cancelOrderEvent !== undefined) {
                            tradingSystem.warnings.push([tradingSystemOrder.cancelOrderEvent.id, 'Skipping Cancel Event Checking because cheking the order at the exchange failed.'])
                        }
                        return
                    }

                    /* Check if we need to cancel the order */
                    await checkCancelOrderEvent(tradingEngineStage, executionAlgorithm, executionNode, tradingEngineOrder, tradingSystemOrder)
                    /*
                    If by this time the order is closed, we need to clone it and get the close 
                    to the Last node at the Trading Engine data structure.
                    */
                    if (tradingEngineOrder.status.value === 'Closed') {
                        switch (tradingEngineOrder.type) {
                            case 'Market Order': {
                                tradingEngineModule.cloneValues(tradingEngineOrder, tradingEngine.last.marketOrders)
                                break
                            }
                            case 'Limit Order': {
                                tradingEngineModule.cloneValues(tradingEngineOrder, tradingEngine.last.limitOrders)
                                break
                            }
                        }
                    }
                }
            }
        }
    }

    async function checkCancelOrderEvent(tradingEngineStage, executionAlgorithm, executionNode, tradingEngineOrder, tradingSystemOrder) {
        /* 
        In the previous steps, we might have discovered that the order was cancelled 
        at the exchange, or filled, so  the order might still not be Open. 
        If the stage is closing or the order is not Open, we wont be cancelling orders 
        based on defined events. 
        */
        if (tradingEngineStage.status.value !== 'Closing' && tradingEngineOrder.status.value === 'Open') {

            /* Check if we need to Cancel this Order */
            let situationName = await checkOrderEvent(tradingSystemOrder.cancelOrderEvent, tradingSystemOrder, executionAlgorithm, executionNode)
            if (situationName !== undefined) {

                /* Simulate Order Cancelation, if needed. */
                simulateCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, 'Cancel Event')

                /* Cancel the order at the Exchange, if needed. */
                await exchangeCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, 'Cancel Event')

                await updateEndsWithCycle(tradingEngineOrder)
            }
        }
    }

    function tradingSystemValidations(tradingSystemOrder) {
        /* Trading System Validations */
        if (tradingSystemOrder.config.percentageOfAlgorithmSize === undefined) { badDefinitionUnhandledException(undefined, 'tradingSystemOrder.config.percentageOfAlgorithmSize === undefined', tradingSystemOrder) }
        if (tradingSystemOrder.referenceParent === undefined) { badDefinitionUnhandledException(undefined, 'tradingSystemOrder.referenceParent === undefined', tradingSystemOrder) }
    }

    function tradingEngineValidations(tradingEngineOrder) {
        /* Trading Engine Order Validations */
        if (tradingEngineOrder.serialNumber === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.serialNumber === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.identifier === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.identifier === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.exchangeId === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.exchangeId === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.begin === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.begin === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.end === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.end === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.rate === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.rate === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.status === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.status === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.algorithmName === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.algorithmName === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.orderCounters === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderCounters === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.orderCounters.periods === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderCounters.periods === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.orderStatistics.days === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderStatistics.days === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.orderStatistics.percentageFilled === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderStatistics.percentageFilled === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.orderStatistics.actualRate === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderStatistics.actualRate === undefined', tradingEngineOrder) }

        if (tradingEngineOrder.orderBaseAsset.size === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderBaseAsset.size === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.orderBaseAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderBaseAsset.sizeFilled === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.orderBaseAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderBaseAsset.feesPaid === undefined', tradingEngineOrder) }

        if (tradingEngineOrder.orderQuotedAsset.size === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderQuotedAsset.size === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.orderQuotedAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderQuotedAsset.sizeFilled === undefined', tradingEngineOrder) }
        if (tradingEngineOrder.orderQuotedAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.orderQuotedAsset.feesPaid === undefined', tradingEngineOrder) }
    }

    async function tryToOpenOrder(tradingEngineStage, executionAlgorithm, tradingSystemOrder, tradingEngineOrder, situationName) {

        await calculateOrderRate()
        await calculateOrderSize()

        /* Check Size: We are not going to create Orders which size is equal or less to zero.  */
        if (tradingEngineOrder.orderBaseAsset.size.value <= 0 || tradingEngineOrder.orderQuotedAsset.size.value <= 0) {
            tradingSystem.warnings.push([tradingSystemOrder.id, 'Could not open this order because its size would be zero.'])
            return
        }

        /* Place Order at the Exchange, if needed. */
        let result = await createOrderAtExchange(tradingSystemOrder, tradingEngineOrder)
        if (result !== true) {
            tradingSystem.warnings.push([tradingSystemOrder.id, 'Could not open this order because something failed placing the order at the Exchange.'])
            return
        }

        /* Update Stage Placed Size */
        tradingEngineStage.stageBaseAsset.sizePlaced.value = tradingEngineStage.stageBaseAsset.sizePlaced.value + tradingEngineOrder.orderBaseAsset.size.value
        tradingEngineStage.stageBaseAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageBaseAsset.sizePlaced.value, 10)
        tradingEngineStage.stageQuotedAsset.sizePlaced.value = tradingEngineStage.stageQuotedAsset.sizePlaced.value + tradingEngineOrder.orderQuotedAsset.size.value
        tradingEngineStage.stageQuotedAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)

        /* Updating Episode Counters */
        tradingEngine.current.episode.episodeCounters.orders.value++

        /* Initialize this */
        tradingEngine.current.episode.distanceToEvent.createOrder.value = 1

        /* Create Order Procedure */
        tradingEngineOrder.status.value = 'Open'
        tradingEngineOrder.identifier.value = global.UNIQUE_ID()
        tradingEngineOrder.begin.value = tradingEngine.current.episode.cycle.begin.value
        tradingEngineOrder.end.value = tradingEngine.current.episode.cycle.end.value
        tradingEngineOrder.serialNumber.value = tradingEngine.current.episode.episodeCounters.orders.value
        tradingEngineOrder.orderName.value = tradingSystemOrder.name
        tradingEngineOrder.algorithmName.value = executionAlgorithm.name
        tradingEngineOrder.situationName.value = situationName

        async function calculateOrderRate() {

            /* Optional Rate Definition */
            if (tradingSystemOrder.type === 'Limit Buy Order' || tradingSystemOrder.type === 'Limit Sell Order') {
                if (tradingSystemOrder.orderRate === undefined) { badDefinitionUnhandledException(undefined, 'tradingSystemOrder.orderRate === undefined', tradingSystemOrder) }
                if (tradingSystemOrder.orderRate.formula === undefined) { badDefinitionUnhandledException(undefined, 'tradingSystemOrder.orderRate.formula === undefined', tradingSystemOrder) }

                /* Extract the rate value from the user-defined formula */
                tradingEngineOrder.rate.value = tradingSystem.formulas.get(tradingSystemOrder.orderRate.formula.id)

                /* Final rate validations */
                if (tradingEngineOrder.rate.value === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.rate.value === undefined', tradingSystemOrder) }
                if (isNaN(tradingEngineOrder.rate.value) === true) { badDefinitionUnhandledException(undefined, 'isNaN(tradingEngineOrder.rate.value) === true', tradingSystemOrder) }
                if (tradingEngineOrder.rate.value <= 0) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.rate.value <= 0', tradingSystemOrder) }

                tradingEngineOrder.rate.value = global.PRECISE(tradingEngineOrder.rate.value, 10)
            } else {
                /* 
                For Market Orders, the rate is irrelevant, since it is not sent to the Exchange.
                We store at this field the last know price as a reference.
                */
                tradingEngineOrder.rate.value = tradingEngine.current.episode.candle.close.value
            }
        }

        async function calculateOrderSize() {
            /* Validate that this config exists */
            if (executionAlgorithm.config.percentageOfStageTargetSize === undefined) { badDefinitionUnhandledException(undefined, 'executionAlgorithm.config.percentageOfStageTargetSize === undefined', executionAlgorithm) }
            if (isNaN(executionAlgorithm.config.percentageOfStageTargetSize) === true) { badDefinitionUnhandledException(undefined, 'isNaN(executionAlgorithm.config.percentageOfStageTargetSize) === true', executionAlgorithm) }

            let algorithmSizeInBaseAsset = tradingEngineStage.stageBaseAsset.targetSize.value * executionAlgorithm.config.percentageOfStageTargetSize / 100
            let algorithmSizeInQuotedAsset = tradingEngineStage.stageQuotedAsset.targetSize.value * executionAlgorithm.config.percentageOfStageTargetSize / 100

            /* Validate that this config exists */
            if (tradingSystemOrder.config.percentageOfAlgorithmSize === undefined) { badDefinitionUnhandledException(undefined, 'tradingSystemOrder.config.percentageOfAlgorithmSize === undefined', tradingSystemOrder) }
            if (isNaN(tradingSystemOrder.config.percentageOfAlgorithmSize) === true) { badDefinitionUnhandledException(undefined, 'isNaN(tradingSystemOrder.config.percentageOfAlgorithmSize) === true', tradingSystemOrder) }

            /*
            The Size calculation depends on how the user defined the size of the position.
            The user could have defined the size of the position in Base Asset or Quoted Asset.
            */
            switch (tradingEngineStage.stageDefinedIn.value) {
                case 'Base Asset': {
                    /* Size in Base Asset */
                    tradingEngineOrder.orderBaseAsset.size.value = algorithmSizeInBaseAsset * tradingSystemOrder.config.percentageOfAlgorithmSize / 100

                    /* Check that the Size calculated would not surpass Stage Target Size */
                    if (
                        tradingEngineOrder.orderBaseAsset.size.value + tradingEngineStage.stageBaseAsset.sizePlaced.value >
                        tradingEngineStage.stageBaseAsset.targetSize.value
                    ) {
                        tradingEngineOrder.orderBaseAsset.size.value = tradingEngineStage.stageBaseAsset.targetSize.value - tradingEngineStage.stageBaseAsset.sizePlaced.value
                    }

                    /* Size in Quoted Asset */
                    tradingEngineOrder.orderQuotedAsset.size.value = tradingEngineOrder.orderBaseAsset.size.value * tradingEngineOrder.rate.value
                    break
                }
                case 'Quoted Asset': {
                    /* Size in Quoted Asset */
                    tradingEngineOrder.orderQuotedAsset.size.value = algorithmSizeInQuotedAsset * tradingSystemOrder.config.percentageOfAlgorithmSize / 100

                    /* Check that the Size calculated would not surpass Stage Target Size */
                    if (
                        tradingEngineOrder.orderQuotedAsset.size.value + tradingEngineStage.stageQuotedAsset.sizePlaced.value >
                        tradingEngineStage.stageQuotedAsset.targetSize.value
                    ) {
                        tradingEngineOrder.orderQuotedAsset.size.value = tradingEngineStage.stageQuotedAsset.targetSize.value - tradingEngineStage.stageQuotedAsset.sizePlaced.value
                    }

                    /* Size in Base Asset */
                    tradingEngineOrder.orderBaseAsset.size.value = tradingEngineOrder.orderQuotedAsset.size.value / tradingEngineOrder.rate.value
                    break
                }
            }

            tradingEngineOrder.orderBaseAsset.size.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.size.value, 10)
            tradingEngineOrder.orderQuotedAsset.size.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.size.value, 10)
        }

        async function createOrderAtExchange(tradingSystemOrder, tradingEngineOrder) {

            /* Filter by Session Type */
            switch (bot.SESSION.type) {
                case 'Backtesting Session': {
                    return true
                }
                case 'Live Trading Session': {
                    break
                }
                case 'Fordward Testing Session': {
                    break
                }
                case 'Paper Trading Session': {
                    return true
                }
            }

            let orderId = await exchangeAPIModule.createOrder(tradingSystemOrder, tradingEngineOrder)

            if (orderId !== undefined) {
                tradingEngineOrder.exchangeId.value = orderId
                return true
            }
        }
    }

    function simulateExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder) {

        /* Filter by Session Type */
        switch (bot.SESSION.type) {
            case 'Backtesting Session': {
                break
            }
            case 'Live Trading Session': {
                return
            }
            case 'Fordward Testing Session': {
                return
            }
            case 'Paper Trading Session': {
                break
            }
        }

        let previousQuotedAssetSize = tradingEngineOrder.orderQuotedAsset.size.value
        let previousBaseAssetSizeFilled = tradingEngineOrder.orderBaseAsset.sizeFilled.value
        let previousQuotedAssetSizeFilled = tradingEngineOrder.orderQuotedAsset.sizeFilled.value
        let previousBaseAssetFeesPaid = tradingEngineOrder.orderBaseAsset.feesPaid.value
        let previousQuotedAssetFeesPaid = tradingEngineOrder.orderQuotedAsset.feesPaid.value

        actualRateSimulation()
        percentageFilledSimulation()
        feesPaidSimulation()
        sizeFilledSimulation()

        doTheAccounting(
            tradingEngineStage,
            tradingSystemOrder,
            tradingEngineOrder,
            previousBaseAssetSizeFilled,
            previousQuotedAssetSizeFilled,
            previousBaseAssetFeesPaid,
            previousQuotedAssetFeesPaid
        )

        /* If the Stage is Closing and this order is still open, we need to cancel it now */
        if (tradingEngineStage.status.value === 'Closing' && tradingEngineOrder.status.value !== 'Closed') {
            simulateCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, 'Closing Stage')
        }

        function actualRateSimulation() {
            /* Actual Rate Simulation */
            let calculatedBasedOnTradingSystem = false

            basedOnTradingSystem()
            basedOnSessionParameters()
            considerBestMatchWithOrderBook()
            recalculateQuotedAsset()
            recalculateSizePlaced()

            function basedOnTradingSystem() {
                /* Based on the Trading System Definition */
                if (tradingSystemOrder.simulatedExchangeEvents !== undefined) {
                    if (tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate !== undefined) {
                        if (tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula !== undefined) {
                            /* Calculate this only once for this order */
                            if (tradingEngineOrder.orderStatistics.actualRate.value === tradingEngineOrder.orderStatistics.actualRate.config.initialValue) {
                                tradingEngineOrder.orderStatistics.actualRate.value = tradingSystem.formulas.get(tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula.id)
                                if (tradingEngineOrder.orderStatistics.actualRate.value !== undefined) {
                                    calculatedBasedOnTradingSystem = true
                                }
                            }
                        }
                    }
                }
            }

            function basedOnSessionParameters() {
                /* Based on the Session Parameters Definition */
                if (calculatedBasedOnTradingSystem === false) {
                    switch (tradingEngineOrder.type) {
                        case 'Market Order': {
                            /* Actual Rate is simulated based on the Session Paremeters */
                            let slippageAmount = tradingEngineOrder.rate.value * sessionParameters.slippage.config.positionRate / 100
                            switch (tradingSystemOrder.type) {
                                case 'Market Sell Order': {
                                    tradingEngineOrder.orderStatistics.actualRate.value = tradingEngineOrder.rate.value - slippageAmount
                                    break
                                }
                                case 'Market Buy Order': {
                                    tradingEngineOrder.orderStatistics.actualRate.value = tradingEngineOrder.rate.value + slippageAmount
                                    break
                                }
                            }
                            break
                        }
                        case 'Limit Order': {
                            /* In Limit Orders the actual rate is the rate of the order, there is no slippage */
                            tradingEngineOrder.orderStatistics.actualRate.value = tradingEngineOrder.rate.value
                            break
                        }
                    }
                }
            }

            function considerBestMatchWithOrderBook() {
                /*
                Until here we have got the rate based on the formula definition or based on session parameters slippage.
                THe last check is about watching what happened in the market. Let's remember that the exchange will
                fill the order with the best possible matches at it's order book. That means that if the rate
                we set for the order was too low (for a sale order) or too hight (for a buy order), the actual rate 
                should be better than expected.
                */
                switch (true) {
                    case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {
                        if (tradingEngineOrder.orderStatistics.actualRate.value > tradingEngine.current.episode.candle.max.value) {
                            tradingEngineOrder.orderStatistics.actualRate.value = tradingEngine.current.episode.candle.max.value
                        }
                        break
                    }
                    case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {
                        if (tradingEngineOrder.orderStatistics.actualRate.value < tradingEngine.current.episode.candle.min.value) {
                            tradingEngineOrder.orderStatistics.actualRate.value = tradingEngine.current.episode.candle.min.value
                        }
                        break
                    }
                }
                tradingEngineOrder.orderStatistics.actualRate.value = global.PRECISE(tradingEngineOrder.orderStatistics.actualRate.value, 10)
            }

            function recalculateQuotedAsset() {
                /*
                Recalculate the Quouted Asset Size based on the newly calculated Actual Rate.
                */
                tradingEngineOrder.orderQuotedAsset.size.value = tradingEngineOrder.orderBaseAsset.size.value * tradingEngineOrder.orderStatistics.actualRate.value
                tradingEngineOrder.orderQuotedAsset.size.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.size.value, 10)
            }

            function recalculateSizePlaced() {
                /*
                Recaulculate the Size Placed Based on the newly calculated Quoted Asset Size.
                */
                tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                    tradingEngineStage.stageQuotedAsset.sizePlaced.value -
                    previousQuotedAssetSize

                tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                    tradingEngineStage.stageQuotedAsset.sizePlaced.value +
                    tradingEngineOrder.orderQuotedAsset.size.value

                tradingEngineStage.stageQuotedAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)
            }
        }

        function percentageFilledSimulation() {
            /* 
            Order Filling Simulation: the way we are going to handle this is the following. 
            For buy orders we are going to check if the price was below the order rate, and 
            for sell orders we are going to check if the price was above the order rate.
            
            If we have a partial filling defined we are going to use it to estimate how much
            of the order we will consider filled.
            */
            let orderWasHit
            switch (tradingSystemOrder.type) {
                case 'Limit Buy Order': {
                    if (tradingEngine.current.episode.candle.min.value <= tradingEngineOrder.rate.value) {
                        orderWasHit = true
                    }
                    break
                }
                case 'Limit Sell Order': {
                    if (tradingEngine.current.episode.candle.max.value >= tradingEngineOrder.rate.value) {
                        orderWasHit = true
                    }
                    break
                }
                case 'Market Buy Order': {
                    orderWasHit = true
                    break
                }
                case 'Market Sell Order': {
                    orderWasHit = true
                    break
                }
            }
            if (orderWasHit === true) {
                let calculatedBasedOnTradingSystem = false

                /* Based on the Trading System Definition */
                if (tradingSystemOrder.simulatedExchangeEvents !== undefined) {
                    if (tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill !== undefined) {
                        if (tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability !== undefined) {

                            /* Percentage Filled */
                            let percentageFilled = tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability * 100
                            if (tradingEngineOrder.orderStatistics.percentageFilled.value + percentageFilled > 100) {
                                percentageFilled = 100 - tradingEngineOrder.orderStatistics.percentageFilled.value
                            }
                            tradingEngineOrder.orderStatistics.percentageFilled.value = tradingEngineOrder.orderStatistics.percentageFilled.value + percentageFilled
                            tradingEngineOrder.orderStatistics.percentageFilled.value = global.PRECISE(tradingEngineOrder.orderStatistics.percentageFilled.value, 10)
                            calculatedBasedOnTradingSystem = true
                        }
                    }
                }
                /* 
                If there is no definition for this at the trading system we will assume orders
                are 100% filled every single time. 
                */
                if (calculatedBasedOnTradingSystem === false) {
                    /* We will assume that 100% of the order was filled */
                    tradingEngineOrder.orderStatistics.percentageFilled.value = 100
                }
                /* Check if we need to close the order */
                if (tradingEngineOrder.orderStatistics.percentageFilled.value === 100) {

                    /* Close this Order */
                    tradingEngineOrder.status.value = 'Closed'
                    tradingEngineOrder.exitType.value = 'Filled'

                    /* Initialize this */
                    tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1

                    updateEndsWithCycle(tradingEngineOrder)
                    tradingSystem.infos.push([tradingSystemOrder.id, 'percentageFilledSimulation -> Closing Order with Exit Type ' + tradingEngineOrder.exitType.value])
                }
            }
        }

        function feesPaidSimulation() {
            /*
            The way the Fess Paid are calculated is as follows: From the order size we apply the % of fee,
            that would give us the total fees for that order. To that we apply the % filled of the orders,
            that give use the final result of the fees paid for the current % filled.
            
            But before that, we will see if there is an specific definition on how to simulate the fees for 
            this order, or if there is not, we use the fees session parameters definitions.            
            */

            /* Based on the Trading System Definition */
            if (tradingSystemOrder.simulatedExchangeEvents !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid !== undefined) {
                    if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage !== undefined) {
                        applyFeePercentage(tradingEngineOrder, tradingSystemOrder, tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage)
                        return
                    }
                }
            }

            /*
            Another way to simulate the Fees Paid is by using the Session Paremeters configuration for Fees.
            */
            switch (tradingEngineOrder.type) {
                case 'Market Order': {
                    applyFeePercentage(tradingEngineOrder, tradingSystemOrder, sessionParameters.feeStructure.config.taker)
                    break
                }
                case 'Limit Order': {
                    applyFeePercentage(tradingEngineOrder, tradingSystemOrder, sessionParameters.feeStructure.config.maker)
                    break
                }
            }
        }

        function sizeFilledSimulation() {
            /* Size Filled */
            tradingEngineOrder.orderBaseAsset.sizeFilled.value =
                tradingEngineOrder.orderBaseAsset.size.value *
                tradingEngineOrder.orderStatistics.percentageFilled.value / 100

            tradingEngineOrder.orderQuotedAsset.sizeFilled.value =
                tradingEngineOrder.orderQuotedAsset.size.value *
                tradingEngineOrder.orderStatistics.percentageFilled.value / 100

            tradingEngineOrder.orderBaseAsset.sizeFilled.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.sizeFilled.value, 10)
            tradingEngineOrder.orderQuotedAsset.sizeFilled.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.sizeFilled.value, 10)
        }
    }

    async function checkExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder) {

        /* Filter by Session Type */
        switch (bot.SESSION.type) {
            case 'Backtesting Session': {
                return true
            }
            case 'Live Trading Session': {
                break
            }
            case 'Fordward Testing Session': {
                break
            }
            case 'Paper Trading Session': {
                return true
            }
        }

        let order = await exchangeAPIModule.getOrder(tradingSystemOrder, tradingEngineOrder)

        if (order === undefined) {
            tradingSystem.warnings.push([tradingSystemOrder.id, 'Could not verify the status of this order at the exchange.'])
            return false
        }

        const AT_EXCHANGE_STATUS = {
            OPEN: 'open',
            CLOSED: 'closed',
            CANCELLED: 'canceled'
        }

        /* Status Checks */
        if (order.remaining === 0 && order.status === AT_EXCHANGE_STATUS.CLOSED) {
            /* Close this Order */
            tradingEngineOrder.status.value = 'Closed'
            tradingEngineOrder.exitType.value = 'Filled'

            /* Initialize this */
            tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1

            await updateEndsWithCycle(tradingEngineOrder)
            tradingSystem.infos.push([tradingSystemOrder.id, 'checkExchangeEvents -> Closing Order with Exit Type ' + tradingEngineOrder.exitType.value])
            
            await syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)
            return
        }

        if (order.remaining > 0 && order.status === AT_EXCHANGE_STATUS.CLOSED) {
            /* Close this Order */
            tradingEngineOrder.status.value = 'Closed'
            tradingEngineOrder.exitType.value = 'Closed at the Exchange'
            /* Initialize this */
            tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1

            await updateEndsWithCycle(tradingEngineOrder)
            tradingSystem.infos.push([tradingSystemOrder.id, 'checkExchangeEvents -> Closing Order with Exit Type ' + tradingEngineOrder.exitType.value])

            await syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)
            await recalculateStageSize(tradingEngineStage, tradingEngineOrder)
            return
        }

        if (order.status === AT_EXCHANGE_STATUS.CANCELLED) {
            /* Close this Order */
            tradingEngineOrder.status.value = 'Closed'
            /* 
            We must be carefull here not to overide an already defined exitType. It can happen
            for instance that the order was cancellerd from the bot, but veryfing the cancellation
            was not possible because of a connection to the exchange problem. In that case
            the exit type was defined but the order was kept open until the verification could be done.
            */
            if (tradingEngineOrder.exitType.value === tradingEngineOrder.exitType.config.initialValue) {
                tradingEngineOrder.exitType.value = 'Cancelled at the Exchange'
            }
            /* Initialize this */
            tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1

            await updateEndsWithCycle(tradingEngineOrder)
            tradingSystem.infos.push([tradingSystemOrder.id, 'checkExchangeEvents -> Closing Order with Exit Type ' + tradingEngineOrder.exitType.value])

            await syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)
            await recalculateStageSize(tradingEngineStage, tradingEngineOrder)
            return
        }

        /*
        If the order happens to be at least partially filled, there is a syncronization work 
        we need to do, that includes discovering which is the Actual Rate the order is being filled,
        the Fees Paid and many other thing we need to account for.
        */
        if (order.filled > 0) {
            await syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)
        }

        /* 
        Forced Cancellation Check: Here we check if we need to cancel this order because the
        stage is closing. 
        */
        if (tradingEngineStage.status.value === 'Closing' && tradingEngineOrder.status.value !== 'Closed') {
            await exchangeCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, 'Closing Stage')
        }

        return true
    }

    async function syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order) {

        let previousBaseAssetSize = tradingEngineOrder.orderBaseAsset.size.value
        let previousQuotedAssetSize = tradingEngineOrder.orderQuotedAsset.size.value
        let previousBaseAssetSizeFilled = tradingEngineOrder.orderBaseAsset.sizeFilled.value
        let previousQuotedAssetSizeFilled = tradingEngineOrder.orderQuotedAsset.sizeFilled.value
        let previousBaseAssetFeesPaid = tradingEngineOrder.orderBaseAsset.feesPaid.value
        let previousQuotedAssetFeesPaid = tradingEngineOrder.orderQuotedAsset.feesPaid.value

        await actualSizeCalculation()
        await actualRateCalculation()
        await percentageFilledCalculation()
        await feesPaidCalculation()
        await sizeFilledCalculation()

        await doTheAccounting(
            tradingEngineStage,
            tradingSystemOrder,
            tradingEngineOrder,
            previousBaseAssetSizeFilled,
            previousQuotedAssetSizeFilled,
            previousBaseAssetFeesPaid,
            previousQuotedAssetFeesPaid
        )

        return

        async function actualSizeCalculation() {
            /* 
            When we submit the order to the exchange, we do it specifying the order size
            in Base Asset. The exchange might take that size or might change it a little 
            bit if for example, if it does not accept as many decimals as we are sending.
            If we identify the situation in which the size accepted is different than the 
            size we have accounted for, we need to make several adjustments so that the 
            accounting syncronizes with reality.
            */
            if (tradingEngineOrder.orderBaseAsset.size.value === order.amount) { return }
            /*
            We will sync the Base Asset size, and recalculate the Quoted Asset size too.
            */
            tradingEngineOrder.orderBaseAsset.size.value = order.amount
            tradingEngineOrder.orderQuotedAsset.size.value = tradingEngineOrder.orderBaseAsset.size.value * tradingEngineOrder.rate.value

            tradingEngineOrder.orderBaseAsset.size.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.size.value, 10)
            tradingEngineOrder.orderQuotedAsset.size.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.size.value, 10)
            /*
            Finaly we need to unaccount the previous size placed and correctly account
            for the the new sizes we now have.
            */
            tradingEngineStage.stageBaseAsset.sizePlaced.value =
                tradingEngineStage.stageBaseAsset.sizePlaced.value -
                previousBaseAssetSize

            tradingEngineStage.stageBaseAsset.sizePlaced.value =
                tradingEngineStage.stageBaseAsset.sizePlaced.value +
                tradingEngineOrder.orderBaseAsset.size.value

            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value -
                previousQuotedAssetSize

            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value +
                tradingEngineOrder.orderQuotedAsset.size.value

            tradingEngineStage.stageBaseAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageBaseAsset.sizePlaced.value, 10)
            tradingEngineStage.stageQuotedAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)

            previousBaseAssetSize = tradingEngineOrder.orderBaseAsset.size.value
            previousQuotedAssetSize = tradingEngineOrder.orderQuotedAsset.size.value
        }

        async function actualRateCalculation() {
            /* 
            Actual Rate Calculation: Let's remember that the exchange may not take the rate
            we send it with the order (in Limit orders) and for any reason change it a little bit.
            For example we might have sent a rate with too many decimals and the exchange truncate
            them. Another thing that might happen is that we send a rate that is matching orders already
            at the order book. In this case we would get an actual rate not only different than the one 
            we sent, but also, better since the trading engine inside the exchange would match out orders
            with the first orders best by price. 
            
            In the case of Market Orders we don't even send a rate. For all those reason 
            we get and store the Actual Rate at which the order was filled. 
            */
            if (order.average !== undefined) {
                /*
                We will use the average whenever is available.
                */
                tradingEngineOrder.orderStatistics.actualRate.value = order.average
            } else {
                /*
                Otherwise we use the order.price.
                */
                tradingEngineOrder.orderStatistics.actualRate.value = order.price
            }

            tradingEngineOrder.orderStatistics.actualRate.value = global.PRECISE(tradingEngineOrder.orderStatistics.actualRate.value, 10)

            if (tradingEngineOrder.orderStatistics.actualRate.value === tradingEngineOrder.rate.value) { return }
            /*
            Now we know the Actual Rate at which the order was filled. Since the actual rate
            is not the same as the Rate we defined for the order, we need to syncronize 
            the Order Size for Quoted Asset since it was calculated with the Order Size that we 
            now know it is not the once really used at the exchange. We will recalculate the
            Order Size in Quoted Asset and not in Base Asset, since the Order Size in Base Asset 
            is the one we sent to the exchange, so that is fixed, regardless of how we initially
            got the Order Size in Base Asset, eigher from direct imput from the user or calculated
            from the Order Size in Quoted Asset input it by the user. So here we go. 
            */
            tradingEngineOrder.orderQuotedAsset.size.value = tradingEngineOrder.orderBaseAsset.size.value * tradingEngineOrder.orderStatistics.actualRate.value
            tradingEngineOrder.orderQuotedAsset.size.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.size.value, 10)
            /*
            Great, this up-to-date order size in Base Asset and the Actual Rate can now be used for example to calculate
            the orders fees in Quoted Assets, and it is perfectly accurate. The next problem
            we need to fix is that the sizePlaced for Quoted Asset that we already have calculated
            was based on the Order Rate, not the Actual Rate, so we need to fix that by anuncounting
            the previous size and accounting the new one, all this only for Quoted Asset. 
            */
            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value -
                previousQuotedAssetSize

            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value +
                tradingEngineOrder.orderQuotedAsset.size.value

            tradingEngineStage.stageQuotedAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)
        }

        async function percentageFilledCalculation() {
            /* Percentage Filled Calculation */
            tradingEngineOrder.orderStatistics.percentageFilled.value = order.filled * 100 / (order.filled + order.remaining)
            tradingEngineOrder.orderStatistics.percentageFilled.value = global.PRECISE(tradingEngineOrder.orderStatistics.percentageFilled.value, 10)
        }

        async function feesPaidCalculation() {
            /*
            The exchange fees are taken from the Base Asset or the Quoted Asset depending if we 
            are buying or selling. Within the order information received we can not see the fees paid so we need to
            calculate them by ourselves. To do this it is needed to be used the Session Fees Parameters.        
            */
            switch (tradingEngineOrder.type) {
                case 'Market Order': {
                    await applyFeePercentage(tradingEngineOrder, tradingSystemOrder, sessionParameters.feeStructure.config.taker)
                    break
                }
                case 'Limit Order': {
                    await applyFeePercentage(tradingEngineOrder, tradingSystemOrder, sessionParameters.feeStructure.config.maker)
                    break
                }
            }
        }

        async function sizeFilledCalculation() {
            /* 
            CCXT returns order.filled with an amount denominated in Base Asset. We will
            take it from there for our Order Base Asset. The amount in order.filled does
            not account for the fees, which is exactly what we need in this case.
            */
            tradingEngineOrder.orderBaseAsset.sizeFilled.value = order.filled
            tradingEngineOrder.orderBaseAsset.sizeFilled.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.sizeFilled.value, 10)
            /*
            For Quoted Asset, CCXT does not return any field with the size filled, so we 
            need to calculate that by ourselves. Since we know the Size in Quoted Asset thet 
            is already adjusted with the Actual Rate and the Percentage Filled, we will use all 
            this in this formula to get the Size Filled in Quoted Asset. 
            */
            tradingEngineOrder.orderQuotedAsset.sizeFilled.value =
                tradingEngineOrder.orderQuotedAsset.size.value * tradingEngineOrder.orderStatistics.percentageFilled.value / 100

            tradingEngineOrder.orderQuotedAsset.sizeFilled.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.sizeFilled.value, 10)
        }
    }

    async function doTheAccounting(
        tradingEngineStage,
        tradingSystemOrder,
        tradingEngineOrder,
        previousBaseAssetSizeFilled,
        previousQuotedAssetSizeFilled,
        previousBaseAssetFeesPaid,
        previousQuotedAssetFeesPaid
    ) {

        await updateStageAssets()
        await updateBalances()

        async function updateStageAssets() {
            /* Stage Base Asset: Undo the previous accounting */
            tradingEngineStage.stageBaseAsset.sizeFilled.value =
                tradingEngineStage.stageBaseAsset.sizeFilled.value -
                previousBaseAssetSizeFilled

            tradingEngineStage.stageBaseAsset.feesPaid.value =
                tradingEngineStage.stageBaseAsset.feesPaid.value -
                previousBaseAssetFeesPaid

            /* Stage Base Asset: Account the current filling and fees */
            tradingEngineStage.stageBaseAsset.sizeFilled.value =
                tradingEngineStage.stageBaseAsset.sizeFilled.value +
                tradingEngineOrder.orderBaseAsset.sizeFilled.value

            tradingEngineStage.stageBaseAsset.feesPaid.value =
                tradingEngineStage.stageBaseAsset.feesPaid.value +
                tradingEngineOrder.orderBaseAsset.feesPaid.value

            /* Stage Quote Asset: Undo the previous accounting */
            tradingEngineStage.stageQuotedAsset.sizeFilled.value =
                tradingEngineStage.stageQuotedAsset.sizeFilled.value -
                previousQuotedAssetSizeFilled

            tradingEngineStage.stageQuotedAsset.feesPaid.value =
                tradingEngineStage.stageQuotedAsset.feesPaid.value -
                previousQuotedAssetFeesPaid

            /* Stage Quote Asset: Account the current filling and fees */
            tradingEngineStage.stageQuotedAsset.sizeFilled.value =
                tradingEngineStage.stageQuotedAsset.sizeFilled.value +
                tradingEngineOrder.orderQuotedAsset.sizeFilled.value

            tradingEngineStage.stageQuotedAsset.feesPaid.value =
                tradingEngineStage.stageQuotedAsset.feesPaid.value +
                tradingEngineOrder.orderQuotedAsset.feesPaid.value

            tradingEngineStage.stageBaseAsset.sizeFilled.value = global.PRECISE(tradingEngineStage.stageBaseAsset.sizeFilled.value, 10)
            tradingEngineStage.stageBaseAsset.feesPaid.value = global.PRECISE(tradingEngineStage.stageBaseAsset.feesPaid.value, 10)

            tradingEngineStage.stageQuotedAsset.sizeFilled.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.sizeFilled.value, 10)
            tradingEngineStage.stageQuotedAsset.feesPaid.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.feesPaid.value, 10)
        }

        async function updateBalances() {
            /* Balances Update */
            switch (true) {
                /*
                Let's remember that for Buy orders, the fees are paid in Base Asset. So we 
                actually don't receive the whole Size Filled in Base Asset, but the Size 
                Filled minus the Fees Paid. For the case of Quoted Asset, we actually
                need to susbstract the whole Size Filled from the balance. 
                */
                case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {

                    /* Balance Base Asset: Undo the previous accounting */
                    tradingEngine.current.episode.episodeBaseAsset.balance.value =
                        tradingEngine.current.episode.episodeBaseAsset.balance.value -
                        previousBaseAssetSizeFilled +
                        previousBaseAssetFeesPaid

                    /* Balance Base Asset: Account the current filling and fees */
                    tradingEngine.current.episode.episodeBaseAsset.balance.value =
                        tradingEngine.current.episode.episodeBaseAsset.balance.value +
                        tradingEngineOrder.orderBaseAsset.sizeFilled.value -
                        tradingEngineOrder.orderBaseAsset.feesPaid.value

                    /* Balance Quoted Asset: Undo the previous accounting */
                    tradingEngine.current.episode.episodeQuotedAsset.balance.value =
                        tradingEngine.current.episode.episodeQuotedAsset.balance.value +
                        previousQuotedAssetSizeFilled

                    /* Balance Quoted Asset: Account the current filling and fees */
                    tradingEngine.current.episode.episodeQuotedAsset.balance.value =
                        tradingEngine.current.episode.episodeQuotedAsset.balance.value -
                        tradingEngineOrder.orderQuotedAsset.sizeFilled.value
                    break
                }
                /*
                For Sell orders, the fees are being paid in Quote Asset, so we never 
                acutally receive the whole Filled Size in Quote Asset, but the Filled
                Size minus the Fees Paid. But we do expend the whole Filled Size in 
                Base Asset.
                */
                case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {

                    /* Balance Base Asset: Undo the previous accounting */
                    tradingEngine.current.episode.episodeBaseAsset.balance.value =
                        tradingEngine.current.episode.episodeBaseAsset.balance.value +
                        previousBaseAssetSizeFilled

                    /* Balance Base Asset: Account the current filling and fees */
                    tradingEngine.current.episode.episodeBaseAsset.balance.value =
                        tradingEngine.current.episode.episodeBaseAsset.balance.value -
                        tradingEngineOrder.orderBaseAsset.sizeFilled.value

                    /* Balance Quoted Asset: Undo the previous accounting */
                    tradingEngine.current.episode.episodeQuotedAsset.balance.value =
                        tradingEngine.current.episode.episodeQuotedAsset.balance.value -
                        previousQuotedAssetSizeFilled +
                        previousQuotedAssetFeesPaid

                    /* Balance Quoted Asset: Account the current filling and fees */
                    tradingEngine.current.episode.episodeQuotedAsset.balance.value =
                        tradingEngine.current.episode.episodeQuotedAsset.balance.value +
                        tradingEngineOrder.orderQuotedAsset.sizeFilled.value -
                        tradingEngineOrder.orderQuotedAsset.feesPaid.value
                    break
                }
            }
            tradingEngine.current.episode.episodeBaseAsset.balance.value = global.PRECISE(tradingEngine.current.episode.episodeBaseAsset.balance.value, 10)
            tradingEngine.current.episode.episodeQuotedAsset.balance.value = global.PRECISE(tradingEngine.current.episode.episodeQuotedAsset.balance.value, 10)
        }
    }

    function simulateCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, exitType) {

        /* Filter by Session Type */
        switch (bot.SESSION.type) {
            case 'Backtesting Session': {
                break
            }
            case 'Live Trading Session': {
                return
            }
            case 'Fordward Testing Session': {
                return
            }
            case 'Paper Trading Session': {
                break
            }
        }

        /* Close this Order */
        tradingEngineOrder.status.value = 'Closed'
        tradingEngineOrder.exitType.value = exitType

        /* Initialize this */
        tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1

        updateEndsWithCycle(tradingEngineOrder)
        tradingSystem.infos.push([tradingSystemOrder.id, 'simulateCancelOrder -> Closing Order with Exit Type ' + tradingEngineOrder.exitType.value])

        recalculateStageSize(tradingEngineStage, tradingEngineOrder)
    }

    async function exchangeCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, exitType) {

        /* Filter by Session Type */
        switch (bot.SESSION.type) {
            case 'Backtesting Session': {
                return
            }
            case 'Live Trading Session': {
                break
            }
            case 'Fordward Testing Session': {
                break
            }
            case 'Paper Trading Session': {
                return
            }
        }

        /* Check if we can cancel the order at the Exchange. */
        let result = await exchangeAPIModule.cancelOrder(tradingSystemOrder, tradingEngineOrder)
        if (result === true) {

            /* At this point we know which is the exit type for this order */
            tradingEngineOrder.exitType.value = exitType

            /* 
            Perhaps the order was filled a bit more between the last time we checked and when it was cancelled.
            To sync our accounting, we need to check the order one last time and if it changed, fix it.
            */

            let order = await exchangeAPIModule.getOrder(tradingSystemOrder, tradingEngineOrder)

            if (order === undefined) {
                tradingSystem.warnings.push([tradingSystemOrder.id, 'Could not verify the status of this order at the exchange, and syncronize the accounting.'])
                return false
            }

            /* 
            Close this Order. Note that we are not closing the order until we have the exchange 
            response with the order details that we can use to syncronize with our accoounting.
            Otherwise if the connection to the exchange fails, we would have a closed order not 
            accounted in any way. 
            */
            tradingEngineOrder.status.value = 'Closed'

            /* Initialize this */
            tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1

            await updateEndsWithCycle(tradingEngineOrder)
            tradingSystem.infos.push([tradingSystemOrder.id, 'exchangeCancelOrder -> Closing Order with Exit Type ' + tradingEngineOrder.exitType.value])

            await syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)

            await recalculateStageSize(tradingEngineStage, tradingEngineOrder)
        }
    }

    async function recalculateStageSize(tradingEngineStage, tradingEngineOrder) {
        /* 
        Since the order is Cancelled, we need to adjust the stage sizePlaced. Remember that the Stage 
        Size Placed accumulates for each asset, the order size placed at the exchange. A cancelation means that 
        only the part filled can be considered placed, so we need to substract from the stage size 
        the remainder. To achieve this with the information we currently have, we are going first 
        to unaccount the order size, and the account only the sizeFilled + the feesPaid.
        */
        tradingEngineStage.stageBaseAsset.sizePlaced.value =
            tradingEngineStage.stageBaseAsset.sizePlaced.value -
            tradingEngineOrder.orderBaseAsset.size.value

        tradingEngineStage.stageQuotedAsset.sizePlaced.value =
            tradingEngineStage.stageQuotedAsset.sizePlaced.value -
            tradingEngineOrder.orderQuotedAsset.size.value

        tradingEngineStage.stageBaseAsset.sizePlaced.value =
            tradingEngineStage.stageBaseAsset.sizePlaced.value +
            tradingEngineOrder.orderBaseAsset.sizeFilled.value

        tradingEngineStage.stageQuotedAsset.sizePlaced.value =
            tradingEngineStage.stageQuotedAsset.sizePlaced.value +
            tradingEngineOrder.orderQuotedAsset.sizeFilled.value

        tradingEngineStage.stageBaseAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageBaseAsset.sizePlaced.value, 10)
        tradingEngineStage.stageQuotedAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)
    }

    async function applyFeePercentage(tradingEngineOrder, tradingSystemOrder, feePercentage) {
        switch (true) {
            case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {
                /*
                In this case the fees are taken from the Base Asset you receive.
                */
                tradingEngineOrder.orderBaseAsset.feesPaid.value =
                    tradingEngineOrder.orderBaseAsset.size.value *
                    feePercentage / 100 *
                    tradingEngineOrder.orderStatistics.percentageFilled.value / 100
                break
            }
            case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {
                /*
                In this case the fees are taken from the Quoted Asset you receive.
                */
                tradingEngineOrder.orderQuotedAsset.feesPaid.value =
                    tradingEngineOrder.orderQuotedAsset.size.value *
                    feePercentage / 100 *
                    tradingEngineOrder.orderStatistics.percentageFilled.value / 100
                break
            }
        }

        tradingEngineOrder.orderBaseAsset.feesPaid.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.feesPaid.value, 10)
        tradingEngineOrder.orderQuotedAsset.feesPaid.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.feesPaid.value, 10)
    }

    async function checkOrderEvent(event, order, executionAlgorithm, executionNode) {
        if (event !== undefined) {
            for (let k = 0; k < event.situations.length; k++) {
                let situation = event.situations[k]
                let passed
                if (situation.conditions.length > 0) {
                    passed = true
                }

                passed = tradingSystem.checkConditions(situation, passed)

                tradingSystem.values.push([situation.id, passed])
                if (passed) {
                    tradingSystem.highlights.push(situation.id)
                    tradingSystem.highlights.push(event.id)
                    tradingSystem.highlights.push(order.id)
                    tradingSystem.highlights.push(executionAlgorithm.id)
                    tradingSystem.highlights.push(executionNode.id)

                    announcementsModule.makeAnnoucements(event)
                    return situation.name  // if the event is triggered, we return the name of the situation that passed
                }
            }
        }
    }

    function updateEnds(tradingEngineOrder) {
        if (tradingEngineOrder.status.value === 'Open') {
            tradingEngineOrder.end.value = tradingEngine.current.episode.candle.end.value
        }
    }

    async function updateEndsWithCycle(tradingEngineOrder) {
        tradingEngineOrder.end.value = tradingEngine.current.episode.cycle.end.value
    }

    function updateCounters(tradingEngineOrder) {
        if (tradingEngineOrder.status.value === 'Open') {
            tradingEngineOrder.orderCounters.periods.value++
        }
    }

    function updateStatistics(tradingEngineOrder) {
        tradingEngineOrder.orderStatistics.days.value = tradingEngineOrder.orderCounters.periods.value * sessionParameters.timeFrame.config.value / global.ONE_DAY_IN_MILISECONDS
        tradingEngineOrder.orderStatistics.days.value = global.PRECISE(tradingEngineOrder.orderStatistics.days.value, 10)
    }

    function resetTradingEngineDataStructure(tradingEngineOrder, tradingSystemOrder, stageStatus) {
        if (tradingEngineOrder.status.value === 'Closed') {
            /* We reset the order data structure inside the Trading Engine to its initial value */
            tradingEngineModule.initializeNode(tradingEngineOrder)
            if (tradingSystemOrder.config.spawnMultipleOrders !== true) {
                /* 
                We close the lock so as to prevent this data structure to be used again during this same stage execution.
                 */
                if (stageStatus === 'Open') {
                    tradingEngineOrder.lock.value = 'Closed'
                }
            }
        }
    }

    function badDefinitionUnhandledException(err, message, node) {
        tradingSystem.errors.push([node.id, message])

        logger.write(MODULE_NAME, "[ERROR] -> " + message);
        logger.write(MODULE_NAME, "[ERROR] -> node.name = " + node.name);
        logger.write(MODULE_NAME, "[ERROR] -> node.type = " + node.type);
        logger.write(MODULE_NAME, "[ERROR] -> node.config = " + JSON.stringify(node.config));
        if (err !== undefined) {
            logger.write(MODULE_NAME, "[ERROR] -> err.stack = " + err.stack);
        }
        throw 'Please fix the problem and try again.'
    }
}

