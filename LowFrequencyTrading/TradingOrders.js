exports.newTradingOrders = function newTradingOrders(bot, logger, tradingEngineModule) {
    /*
    The Trading Orders modules manages the execution of orders against the exchanges.
    */
    const MODULE_NAME = 'Trading Orders'

    let thisObject = {
        mantain: mantain,
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

        if (tradingEngine.current.strategy.index.value === tradingEngine.current.strategy.index.config.initialValue) { return }

        let stageNode
        let executionNode

        stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
        executionNode = stageNode.openExecution
        mantainExecutionNode(executionNode, tradingEngine.current.strategyOpenStage.status.value)

        stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].closeStage
        executionNode = stageNode.closeExecution
        mantainExecutionNode(executionNode, tradingEngine.current.strategyCloseStage.status.value)

        function mantainExecutionNode(executionNode, stageStatus) {

            mantainExecutionAlgorithms(executionNode)

            function mantainExecutionAlgorithms(executionNode) {
                for (let i = 0; i < executionNode.executionAlgorithms.length; i++) {
                    let executionAlgorithm = executionNode.executionAlgorithms[i]
                    mantainOrders(executionAlgorithm.marketBuyOrders)
                    mantainOrders(executionAlgorithm.marketSellOrders)
                    mantainOrders(executionAlgorithm.limitBuyOrders)
                    mantainOrders(executionAlgorithm.limitSellOrders)
                }
            }

            function mantainOrders(orders) {
                for (let i = 0; i < orders.length; i++) {
                    let tradingSystemOrder = orders[i]
                    if (tradingSystemOrder.referenceParent === undefined) { continue }
                    let tradingEngineOrder = tradingEngineModule.getNodeById(tradingSystemOrder.referenceParent.id)
                    try {
                        if (tradingEngineOrder.status === undefined) { continue }
                    } catch (err) {

                    }


                    updateCounters(tradingEngineOrder)
                    updateEnds(tradingEngineOrder)
                    updateStatistics(tradingEngineOrder)
                    resetTradingEngineDataStructure(tradingEngineOrder, tradingSystemOrder, stageStatus)
                }
            }
        }
    }

    async function checkOrders(tradingEngineStage, orders, executionAlgorithm, executionNode) {
        for (let i = 0; i < orders.length; i++) {

            let tradingSystemOrder = orders[i]
            let tradingEngineOrder = tradingEngineModule.getNodeById(tradingSystemOrder.referenceParent.id)

            definitionValidations(tradingSystemOrder, tradingEngineOrder)

            switch (tradingEngineOrder.status.value) {
                case 'Not Open': {
                    {
                        /* When the stage is closing we can not create new orders */
                        if (tradingEngineStage.status.value === 'Closing') { continue }
                        /* 
                        Check if we can create an order based on the config value for spawnMultipleOrders.
                        Trading System Orders that cannot spawn more than one Trading Engine Order needs to check if
                        at the Trading Engine Order the lock is Open or Closed. 
                        */
                        if (tradingSystemOrder.config.spawnMultipleOrders !== true) {
                            if (tradingEngineOrder.identifier.value === 'Closed') {
                                continue
                            }
                        }
                        /* Check if we need to Create this Order */
                        let situationName = checkOrderEvent(tradingSystemOrder.createOrderEvent, tradingSystemOrder, executionAlgorithm, executionNode)
                        if (situationName !== undefined) {

                            /* Open a new order */
                            await tryToOpenOrder(tradingEngineStage, executionAlgorithm, tradingSystemOrder, tradingEngineOrder, situationName)
                        }
                    }
                    break
                }
                case 'Open': {
                    /* Simulate Events that happens at the Exchange, if needed. */
                    simulateExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder)

                    /* Check Events that happens at the Exchange, if needed. */
                    await checkExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder)

                    /* 
                    In the previous steps, we might have discovered that the order was cancelled 
                    at the exchange, or filled, so  the order might still not be Open. 
                    If the stage is closing or the order is not Open, we wont be cancelling orders 
                    based on defined events. 
                    */
                    if (tradingEngineStage.status.value !== 'Closing' && tradingEngineOrder.status.value === 'Open') {

                        /* Check if we need to Cancel this Order */
                        let situationName = checkOrderEvent(tradingSystemOrder.cancelOrderEvent, tradingSystemOrder, executionAlgorithm, executionNode)
                        if (situationName !== undefined) {

                            /* Simulate Order Cancelation, if needed. */
                            simulateCancelOrder(tradingSystemOrder, tradingEngineOrder, 'Cancel Event')

                            /* Cancel the order at the Exchange, if needed. */
                            await exchangeCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, 'Cancel Event')
                        }
                    }
                }
            }
        }
    }

    function definitionValidations(tradingSystemOrder, tradingEngineOrder) {
        /* Trading System Validations */
        if (tradingSystemOrder.config.percentageOfAlgorithmSize === undefined) { badDefinitionUnhandledException(undefined, 'tradingSystemOrder.config.percentageOfAlgorithmSize === undefined', tradingSystemOrder) }
        if (tradingSystemOrder.referenceParent === undefined) { badDefinitionUnhandledException(undefined, 'tradingSystemOrder.referenceParent === undefined', tradingSystemOrder) }

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

        calculateOrderRate()
        calculateOrderSize()

        /* Check Size: We are not going to create Orders which size is equal or less to zero.  */
        if (tradingEngineOrder.orderBaseAsset.size.value <= 0 || tradingEngineOrder.orderQuotedAsset.size.value <= 0) { return }

        /* Place Order at the Exchange, if needed. */
        let result = await createOrderAtExchange(tradingSystemOrder, tradingEngineOrder)
        if (result !== true) { return }

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
        tradingEngineOrder.begin.value = tradingEngine.current.episode.candle.begin.value
        tradingEngineOrder.end.value = tradingEngine.current.episode.candle.end.value
        tradingEngineOrder.serialNumber.value = tradingEngine.current.episode.episodeCounters.orders.value
        tradingEngineOrder.orderName.value = tradingSystemOrder.name
        tradingEngineOrder.algorithmName.value = executionAlgorithm.name
        tradingEngineOrder.situationName.value = situationName

        function calculateOrderRate() {
            /* By default this is the order rate and it is the rate that applies to Market Orders */
            tradingEngineOrder.rate.value = tradingEngine.current.episode.candle.close.value

            /* Optional Rate Definition */
            if (tradingSystemOrder.orderRate !== undefined) {
                if (tradingSystemOrder.orderRate.formula !== undefined) {
                    tradingEngineOrder.rate.value = tradingSystem.formulas.get(tradingSystemOrder.orderRate.formula.id)

                    if (tradingEngineOrder.rate.value === undefined) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.rate.value === undefined', tradingEngineOrder) }
                    if (isNaN(tradingEngineOrder.rate.value) === true) { badDefinitionUnhandledException(undefined, 'isNaN(tradingEngineOrder.rate.value) === true', tradingEngineOrder) }
                    if (tradingEngineOrder.rate.value <= 0) { badDefinitionUnhandledException(undefined, 'tradingEngineOrder.rate.value <= 0', tradingEngineOrder) }

                    tradingEngineOrder.rate.value = global.PRECISE(tradingEngineOrder.rate.value, 10)
                }
            }
        }

        function calculateOrderSize() {
            /* Validate that this config exists */
            if (executionAlgorithm.config.percentageOfStageTargetSize === undefined) { badDefinitionUnhandledException(undefined, 'executionAlgorithm.config.percentageOfStageTargetSize === undefined', executionAlgorithm) }
            if (isNaN(executionAlgorithm.config.percentageOfStageTargetSize) === true) { badDefinitionUnhandledException(undefined, 'isNaN(executionAlgorithm.config.percentageOfStageTargetSize) === true', executionAlgorithm) }

            let algorithmSizeInBaseAsset = tradingEngineStage.stageBaseAsset.targetSize.value * executionAlgorithm.config.percentageOfStageTargetSize / 100
            let algorithmSizeInQuotedAsset = tradingEngineStage.stageQuotedAsset.targetSize.value * executionAlgorithm.config.percentageOfStageTargetSize / 100

            /* Validate that this config exists */
            if (tradingSystemOrder.config.percentageOfAlgorithmSize === undefined) { badDefinitionUnhandledException(undefined, 'tradingSystemOrder.config.percentageOfAlgorithmSize === undefined', tradingSystemOrder) }
            if (isNaN(tradingSystemOrder.config.percentageOfAlgorithmSize) === true) { badDefinitionUnhandledException(undefined, 'isNaN(tradingSystemOrder.config.percentageOfAlgorithmSize) === true', tradingSystemOrder) }

            /* Size in Base Asset */
            tradingEngineOrder.orderBaseAsset.size.value = algorithmSizeInBaseAsset * tradingSystemOrder.config.percentageOfAlgorithmSize / 100

            /* Size in Quoted Asset */
            tradingEngineOrder.orderQuotedAsset.size.value = algorithmSizeInQuotedAsset * tradingSystemOrder.config.percentageOfAlgorithmSize / 100

            /* Check that the Size calculated would not surpass Stage Target Size */
            if (
                tradingEngineOrder.orderBaseAsset.size.value + tradingEngineStage.stageBaseAsset.sizePlaced.value >
                tradingEngineStage.stageBaseAsset.targetSize.value
            ) {
                tradingEngineOrder.orderBaseAsset.size.value = tradingEngineStage.stageBaseAsset.targetSize.value - tradingEngineStage.stageBaseAsset.sizePlaced.value
            }
            if (
                tradingEngineOrder.orderQuotedAsset.size.value + tradingEngineStage.stageQuotedAsset.sizePlaced.value >
                tradingEngineStage.stageQuotedAsset.targetSize.value
            ) {
                tradingEngineOrder.orderQuotedAsset.size.value = tradingEngineStage.stageQuotedAsset.targetSize.value - tradingEngineStage.stageQuotedAsset.sizePlaced.value
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

        /* Filter by what is defined at the Strategy */
        if (tradingSystemOrder.simulatedExchangeEvents === undefined) {
            badDefinitionUnhandledException(undefined, 'tradingSystemOrder.simulatedExchangeEvents === undefined', tradingSystemOrder)
        }

        let previousBaseAssetSizeFilled = tradingEngineOrder.orderBaseAsset.sizeFilled.value
        let previousQuotedAssetSizeFilled = tradingEngineOrder.orderQuotedAsset.sizeFilled.value
        let previousBaseAssetFeesPaid = tradingEngineOrder.orderBaseAsset.feesPaid.value
        let previousQuotedAssetFeesPaid = tradingEngineOrder.orderQuotedAsset.feesPaid.value

        actualRateSimulation()
        feesPaidSimulation()
        percentageFilledSimulation()
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
            simulateCancelOrder(tradingSystemOrder, tradingEngineOrder, 'Closing Stage')
        }

        function actualRateSimulation() {
            /* Actual Rate Simulation */
            let calculatedBasedOnTradingSystem = false

            /* Based on the Trading System Definition */
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

            /* Based on the Session Parameters Definition */
            if (calculatedBasedOnTradingSystem === false) {
                switch (tradingEngineOrder.type) {
                    case 'Market Order': {
                        /* Actual Rate is simulated based on the Session Paremeters */
                        let slippageAmount = tradingEngineOrder.rate.value * bot.SESSION.parameters.slippage.config.positionRate / 100
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
            tradingEngineOrder.orderStatistics.actualRate.value = global.PRECISE(tradingEngineOrder.orderStatistics.actualRate.value, 10)
        }

        function feesPaidSimulation() {
            /* Fees Paid Simulation */
            let calculatedBasedOnTradingSystem = false

            /* Based on the Trading System Definition */
            if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage !== undefined) {
                    if (tradingEngineOrder.orderBaseAsset.feesPaid.value === tradingEngineOrder.orderBaseAsset.feesPaid.config.initialValue) {

                        tradingEngineOrder.orderBaseAsset.feesPaid.value =
                            tradingEngineOrder.orderBaseAsset.size.value *
                            tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage / 100

                        calculatedBasedOnTradingSystem = true
                    }

                    if (tradingEngineOrder.orderQuotedAsset.feesPaid.value === tradingEngineOrder.orderQuotedAsset.feesPaid.config.initialValue) {

                        tradingEngineOrder.orderQuotedAsset.feesPaid.value =
                            tradingEngineOrder.orderQuotedAsset.size.value *
                            tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage / 100

                        calculatedBasedOnTradingSystem = true
                    }
                }
            }

            /* Based on the Session Parameters Definition */
            if (calculatedBasedOnTradingSystem === false) {
                /* Fees are simulated based on the Session Paremeters */
                switch (tradingEngineOrder.type) {
                    case 'Market Order': {

                        tradingEngineOrder.orderBaseAsset.feesPaid.value =
                            tradingEngineOrder.orderBaseAsset.size.value *
                            bot.SESSION.parameters.feeStructure.config.taker / 100

                        tradingEngineOrder.orderQuotedAsset.feesPaid.value =
                            tradingEngineOrder.orderQuotedAsset.size.value *
                            bot.SESSION.parameters.feeStructure.config.taker / 100

                        break
                    }
                    case 'Limit Order': {

                        tradingEngineOrder.orderBaseAsset.feesPaid.value =
                            tradingEngineOrder.orderBaseAsset.size.value *
                            bot.SESSION.parameters.feeStructure.config.maker / 100

                        tradingEngineOrder.orderQuotedAsset.feesPaid.value =
                            tradingEngineOrder.orderQuotedAsset.size.value *
                            bot.SESSION.parameters.feeStructure.config.maker / 100

                        break
                    }
                }
            }
            tradingEngineOrder.orderBaseAsset.feesPaid.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.feesPaid.value, 10)
            tradingEngineOrder.orderQuotedAsset.feesPaid.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.feesPaid.value, 10)
        }

        function percentageFilledSimulation() {
            /* Order Filling Simulation */
            if (tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability !== undefined) {

                    /* Percentage Filled */
                    let percentageFilled = tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability * 100
                    if (tradingEngineOrder.orderStatistics.percentageFilled.value + percentageFilled > 100) {
                        percentageFilled = 100 - tradingEngineOrder.orderStatistics.percentageFilled.value
                    }
                    tradingEngineOrder.orderStatistics.percentageFilled.value = tradingEngineOrder.orderStatistics.percentageFilled.value + percentageFilled
                    tradingEngineOrder.orderStatistics.percentageFilled.value = global.PRECISE(tradingEngineOrder.orderStatistics.percentageFilled.value, 10)

                    /* Check if we need to close */
                    if (tradingEngineOrder.orderStatistics.percentageFilled.value === 100) {

                        /* Close this Order */
                        tradingEngineOrder.status.value = 'Closed'
                        tradingEngineOrder.exitType.value = 'Filled'

                        /* Initialize this */
                        tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1
                    }
                }
            }
        }

        function sizeFilledSimulation() {
            /* Size Filled */
            tradingEngineOrder.orderBaseAsset.sizeFilled.value =
                (tradingEngineOrder.orderBaseAsset.size.value - tradingEngineOrder.orderBaseAsset.feesPaid.value) *
                tradingEngineOrder.orderStatistics.percentageFilled.value / 100

            tradingEngineOrder.orderQuotedAsset.sizeFilled.value =
                (tradingEngineOrder.orderQuotedAsset.size.value - tradingEngineOrder.orderQuotedAsset.feesPaid.value) *
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

        if (order === undefined) { return }

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
        }
        if (order.remaining > 0 && order.status === AT_EXCHANGE_STATUS.CLOSED) {

            /* Close this Order */
            tradingEngineOrder.status.value = 'Closed'
            tradingEngineOrder.exitType.value = 'Closed at the Exchange'

            /* Initialize this */
            tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1
        }
        if (order.status === AT_EXCHANGE_STATUS.CANCELLED) {

            /* Close this Order */
            tradingEngineOrder.status.value = 'Closed'
            tradingEngineOrder.exitType.value = 'Cancelled at the Exchange'

            /* Initialize this */
            tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1
        }

        syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)

        /* Forced Cancellation Check */
        if (tradingEngineStage.status.value === 'Closing' && tradingEngineOrder.status.value !== 'Closed') {
            await exchangeCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, 'Closing Stage')
        }
    }

    function syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order) {

        let previousBaseAssetSizeFilled = tradingEngineOrder.orderBaseAsset.sizeFilled.value
        let previousQuotedAssetSizeFilled = tradingEngineOrder.orderQuotedAsset.sizeFilled.value
        let previousBaseAssetFeesPaid = tradingEngineOrder.orderBaseAsset.feesPaid.value
        let previousQuotedAssetFeesPaid = tradingEngineOrder.orderQuotedAsset.feesPaid.value

        /* Actual Rate Calculation */
        tradingEngineOrder.orderStatistics.actualRate.value = order.price
        tradingEngineOrder.orderStatistics.actualRate.value = global.PRECISE(tradingEngineOrder.orderStatistics.actualRate.value, 10)

        /* Fees Paid Calculation */
        /*
        As a response from the exchange we can not always get the fees. 
        For that reason we need to estimate them base of the information that we do have.
        CCXT provides order.amount which represents the size we set for the order minus the
        fees taken by the exchange, all denominated in Base Asset. 
        In this way if we substract to the order size this order.amount
        we can get the fees. All this is denominated in base asset because that is how CCXT works.
        The fees then can be estimated in Quoted Asset using the Actual Rate.
        */
        tradingEngineOrder.orderBaseAsset.feesPaid.value = tradingEngineOrder.orderBaseAsset.size.value - order.amount
        tradingEngineOrder.orderBaseAsset.feesPaid.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.feesPaid.value, 10)
        tradingEngineOrder.orderQuotedAsset.feesPaid.value = tradingEngineOrder.orderBaseAsset.feesPaid.value * tradingEngineOrder.orderStatistics.actualRate.value
        tradingEngineOrder.orderQuotedAsset.feesPaid.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.feesPaid.value, 10)

        /* Percentage Filled Calculation */
        tradingEngineOrder.orderStatistics.percentageFilled.value = order.filled * 100 / (order.filled + order.remaining)
        tradingEngineOrder.orderStatistics.percentageFilled.value = global.PRECISE(tradingEngineOrder.orderStatistics.percentageFilled.value, 10)

        /* Size Filled Calculation */
        /* 
        CCXT returns order.filled with an amount denominated in Base Asset. We will
        take it from there for our Order Base Asset. For our Order Quoted Asset we 
        will use the field order.cost.
        */
        tradingEngineOrder.orderBaseAsset.sizeFilled.value = order.filled
        tradingEngineOrder.orderBaseAsset.sizeFilled.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.sizeFilled.value, 10)
        tradingEngineOrder.orderQuotedAsset.sizeFilled.value = order.cost
        tradingEngineOrder.orderQuotedAsset.sizeFilled.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.sizeFilled.value, 10)

        doTheAccounting(
            tradingEngineStage,
            tradingSystemOrder,
            tradingEngineOrder,
            previousBaseAssetSizeFilled,
            previousQuotedAssetSizeFilled,
            previousBaseAssetFeesPaid,
            previousQuotedAssetFeesPaid
        )
    }

    function doTheAccounting(
        tradingEngineStage,
        tradingSystemOrder,
        tradingEngineOrder,
        previousBaseAssetSizeFilled,
        previousQuotedAssetSizeFilled,
        previousBaseAssetFeesPaid,
        previousQuotedAssetFeesPaid
    ) {

        updateStageAssets()
        updateBalances()

        function updateStageAssets() {
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

        function updateBalances() {
            /* Balances Update */
            switch (true) {
                case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {

                    /* Balance Base Asset: Undo the previous accounting */
                    tradingEngine.current.episode.episodeBaseAsset.balance.value =
                        tradingEngine.current.episode.episodeBaseAsset.balance.value -
                        previousBaseAssetSizeFilled

                    /* Balance Base Asset: Account the current filling and fees */
                    tradingEngine.current.episode.episodeBaseAsset.balance.value =
                        tradingEngine.current.episode.episodeBaseAsset.balance.value +
                        tradingEngineOrder.orderBaseAsset.sizeFilled.value

                    /* Balance Quoted Asset: Undo the previous accounting */
                    tradingEngine.current.episode.episodeQuotedAsset.balance.value =
                        tradingEngine.current.episode.episodeQuotedAsset.balance.value +
                        previousQuotedAssetSizeFilled +
                        previousQuotedAssetFeesPaid

                    /* Balance Quoted Asset: Account the current filling and fees */
                    tradingEngine.current.episode.episodeQuotedAsset.balance.value =
                        tradingEngine.current.episode.episodeQuotedAsset.balance.value -
                        tradingEngineOrder.orderQuotedAsset.sizeFilled.value -
                        tradingEngineOrder.orderQuotedAsset.feesPaid.value
                    break
                }
                case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {

                    /* Balance Base Asset: Undo the previous accounting */
                    tradingEngine.current.episode.episodeBaseAsset.balance.value =
                        tradingEngine.current.episode.episodeBaseAsset.balance.value +
                        previousBaseAssetSizeFilled +
                        previousBaseAssetFeesPaid

                    /* Balance Base Asset: Account the current filling and fees */
                    tradingEngine.current.episode.episodeBaseAsset.balance.value =
                        tradingEngine.current.episode.episodeBaseAsset.balance.value -
                        tradingEngineOrder.orderBaseAsset.sizeFilled.value -
                        tradingEngineOrder.orderBaseAsset.feesPaid.value

                    /* Balance Quoted Asset: Undo the previous accounting */
                    tradingEngine.current.episode.episodeQuotedAsset.balance.value =
                        tradingEngine.current.episode.episodeQuotedAsset.balance.value -
                        previousQuotedAssetSizeFilled

                    /* Balance Quoted Asset: Account the current filling and fees */
                    tradingEngine.current.episode.episodeQuotedAsset.balance.value =
                        tradingEngine.current.episode.episodeQuotedAsset.balance.value +
                        tradingEngineOrder.orderQuotedAsset.sizeFilled.value
                    break
                }
            }
            tradingEngine.current.episode.episodeBaseAsset.balance.value = global.PRECISE(tradingEngine.current.episode.episodeBaseAsset.balance.value, 10)
            tradingEngine.current.episode.episodeQuotedAsset.balance.value = global.PRECISE(tradingEngine.current.episode.episodeQuotedAsset.balance.value, 10)
        }

    }

    function simulateCancelOrder(tradingSystemOrder, tradingEngineOrder, exitType) {

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
            /* Close this Order */
            tradingEngineOrder.status.value = 'Closed'
            tradingEngineOrder.exitType.value = exitType

            /* Initialize this */
            tradingEngine.current.episode.distanceToEvent.closeOrder.value = 1

            /* 
            Perhaps the order was filled a bit more between the last time we checked and when it was cancelled.
            To sync our accounting, we need to check the order one last time and if it changed, fix it.
            */

            let order = await exchangeAPIModule.getOrder(tradingSystemOrder, tradingEngineOrder)

            if (order === undefined) { return }

            syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)

            recalculateStageSize(tradingEngineStage)
        }
    }

    function recalculateStageSize(tradingEngineStage, tradingEngineOrder) {
        /* 
        Since the order is Cancelled, we need to adjust the stage size. Remember that the Stage Size
        accumulates for each asset, the order size placed at the exchange. A cancelation means that 
        only the part filled can be considered placed, so we need to substract from the stage size 
        the remainder. To achieve this with the information we currently have, we are going first 
        to unaccount the order size, and the account only the sizeFilled + the feesPaid.
        */
        tradingEngineStage.stageBaseAsset.size.value =
            tradingEngineStage.stageBaseAsset.size.value -
            tradingEngineOrder.orderBaseAsset.size.value
        tradingEngineStage.stageQuotedAsset.size.value =
            tradingEngineStage.stageQuotedAsset.size.value -
            tradingEngineOrder.orderQuotedAsset.size.value

        tradingEngineStage.stageBaseAsset.size.value =
            tradingEngineStage.stageBaseAsset.size.value +
            tradingEngineOrder.orderBaseAsset.sizeFilled.value +
            tradingEngineOrder.orderBaseAsset.feesPaid.value
        tradingEngineStage.stageQuotedAsset.size.value =
            tradingEngineStage.stageQuotedAsset.size.value +
            tradingEngineOrder.orderQuotedAsset.sizeFilled.value +
            tradingEngineOrder.orderQuotedAsset.feesPaid.value

        tradingEngineStage.stageBaseAsset.size.value = global.PRECISE(tradingEngineStage.stageBaseAsset.size.value, 10)
        tradingEngineStage.stageQuotedAsset.size.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.size.value, 10)
    }

    function checkOrderEvent(event, order, executionAlgorithm, executionNode) {
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
        throw 'It is not safe to continue with a Definition Error like this. Please fix the problem and try again.'
    }
}

