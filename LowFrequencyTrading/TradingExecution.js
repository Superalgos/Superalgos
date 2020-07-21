exports.newTradingExecution = function newTradingExecution(bot, logger, tradingEngineModule) {
    /*
    The Trading Execution modules manages the execution of orders against the exchanges.
    */
    const MODULE_NAME = 'Trading Execution'

    let thisObject = {
        checkExecution: checkExecution,
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

    async function checkExecution(executionNode, stageIsOpening, stageIsClosing, stageSizeLimit, stageOrdersSize, stageFilledSize) {

        /* Enforcing Precision Limit */
        stageSizeLimit.value = global.PRECISE(stageSizeLimit.value, 10)
        stageOrdersSize.value = global.PRECISE(stageOrdersSize.value, 10)
        stageFilledSize.value = global.PRECISE(stageFilledSize.value, 10)

        await checkExecutionAlgorithms(executionNode)

        async function checkExecutionAlgorithms(executionNode) {
            for (let i = 0; i < executionNode.executionAlgorithms.length; i++) {
                let executionAlgorithm = executionNode.executionAlgorithms[i]
                await checkOrders(executionAlgorithm.marketBuyOrders, executionAlgorithm, executionNode)
                await checkOrders(executionAlgorithm.marketSellOrders, executionAlgorithm, executionNode)
                await checkOrders(executionAlgorithm.limitBuyOrders, executionAlgorithm, executionNode)
                await checkOrders(executionAlgorithm.limitSellOrders, executionAlgorithm, executionNode)
            }
        }

        async function checkOrders(orders, executionAlgorithm, executionNode) {
            for (let i = 0; i < orders.length; i++) {

                let tradingSystemOrder = orders[i]

                /* Trading System Validations */
                if (tradingSystemOrder.config.positionSizePercentage === undefined) { continue }
                if (tradingSystemOrder.referenceParent === undefined) { continue }

                let tradingEngineOrder = tradingEngineModule.getNodeById(tradingSystemOrder.referenceParent.id)

                /* Trading Engine Validations */
                if (tradingEngineOrder.serialNumber === undefined) { continue }
                if (tradingEngineOrder.identifier === undefined) { continue }
                if (tradingEngineOrder.exchangeId === undefined) { continue }
                if (tradingEngineOrder.begin === undefined) { continue }
                if (tradingEngineOrder.end === undefined) { continue }
                if (tradingEngineOrder.rate === undefined) { continue }
                if (tradingEngineOrder.size === undefined) { continue }
                if (tradingEngineOrder.status === undefined) { continue }
                if (tradingEngineOrder.algorithmName === undefined) { continue }
                if (tradingEngineOrder.orderCounters === undefined) { continue }
                if (tradingEngineOrder.orderCounters.periods === undefined) { continue }
                if (tradingEngineOrder.orderStatistics.days === undefined) { continue }
                if (tradingEngineOrder.orderStatistics.percentageFilled === undefined) { continue }
                if (tradingEngineOrder.orderStatistics.actualRate === undefined) { continue }
                if (tradingEngineOrder.orderStatistics.feesPaid === undefined) { continue }

                switch (tradingEngineOrder.status.value) {
                    case 'Not Open': {
                        {
                            /* Check if we need to Create this Order */
                            if (stageIsClosing === true) { continue }
                            let situationName = checkOrderEvent(tradingSystemOrder.createOrderEvent, tradingSystemOrder, executionAlgorithm, executionNode)
                            if (situationName !== undefined) {

                                /* Open a new order */
                                await openOrder(executionAlgorithm, tradingSystemOrder, tradingEngineOrder, situationName)
                            }
                        }
                        break
                    }
                    case 'Open': {
                        tradingEngineOrder.end.value = tradingEngine.current.candle.end.value
                        tradingEngineOrder.orderCounters.periods.value++
                        tradingEngineOrder.orderStatistics.days.value = tradingEngineOrder.orderCounters.periods.value * sessionParameters.timeFrame.config.value / global.ONE_DAY_IN_MILISECONDS

                        /* Simulate Events that happens at the Exchange, if needed. */
                        simulateExchangeEvents(tradingSystemOrder, tradingEngineOrder)

                        /* Check Events that happens at the Exchange, if needed. */
                        await checkExchangeEvents(tradingSystemOrder, tradingEngineOrder)

                        /* If the stage is closing or the order is not still Open, we wont be cancelling orders based on defined events */
                        if (stageIsClosing !== true && tradingEngineOrder.status.value === 'Open') {

                            /* Check if we need to Cancel this Order */
                            let situationName = checkOrderEvent(tradingSystemOrder.cancelOrderEvent, tradingSystemOrder, executionAlgorithm, executionNode)
                            if (situationName !== undefined) {
                                simulateCancelOrder(tradingSystemOrder, tradingEngineOrder, 'Cancel Event')
                                await exchangeCancelOrder(tradingSystemOrder, tradingEngineOrder, 'Cancel Event')
                            }
                        }
                    }
                }
            }
        }

        async function openOrder(executionAlgorithm, tradingSystemOrder, tradingEngineOrder, situationName) {
            /* Order Size Calculation */
            tradingEngineOrder.size.value = tradingSystem.formulas.get(executionAlgorithm.positionSize.formula.id) * tradingSystemOrder.config.positionSizePercentage / 100
            if (stageOrdersSize.value + tradingEngineOrder.size.value > stageSizeLimit.value) {
                /* We reduce the size to the remaining size of the position. */
                tradingEngineOrder.size.value = stageSizeLimit.value - stageOrdersSize.value
                tradingEngineOrder.size.value = global.PRECISE(tradingEngineOrder.size.value, 10)
            }

            /* Check Order Size */
            if (tradingEngineOrder.size.value <= 0) { return }

            /* Order Rate Calculation */
            tradingEngineOrder.rate.value = tradingEngine.current.position.rate.value // By default this is the order rate.
            if (tradingSystemOrder.positionRate !== undefined) {
                if (tradingSystemOrder.positionRate.formula !== undefined) {
                    tradingEngineOrder.rate.value = tradingSystem.formulas.get(tradingSystemOrder.positionRate.formula.id)
                    tradingEngineOrder.rate.value = global.PRECISE(tradingEngineOrder.rate.value, 10)
                }
            }

            /* Place Order at the Exchange */
            let result = await createOrderAtExchange(tradingSystemOrder, tradingEngineOrder)
            if (result !== true) { return }

            /* Updating Episode Counters */
            tradingEngine.episode.episodeCounters.orders.value++

            /* Initialize this */
            tradingEngine.current.distanceToEvent.createOrder.value = 1

            /* Create Order Procedure */
            tradingEngineOrder.status.value = 'Open'
            tradingEngineOrder.identifier.value = global.UNIQUE_ID()
            tradingEngineOrder.begin.value = tradingEngine.current.candle.begin.value
            tradingEngineOrder.end.value = tradingEngine.current.candle.end.value
            tradingEngineOrder.serialNumber.value = tradingEngine.episode.episodeCounters.orders.value
            tradingEngineOrder.orderName.value = tradingSystemOrder.name
            tradingEngineOrder.algorithmName.value = executionAlgorithm.name
            tradingEngineOrder.situationName.value = situationName

            /* Update Stage Orders Size */
            stageOrdersSize.value = stageOrdersSize.value + tradingEngineOrder.size.value
            stageOrdersSize.value = global.PRECISE(stageOrdersSize.value, 10)
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

        function simulateExchangeEvents(tradingSystemOrder, tradingEngineOrder) {

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
            if (tradingSystemOrder.simulatedExchangeEvents === undefined) { return }

            /* Partial Fill Simulation */
            if (tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability !== undefined) {

                    /* Percentage Filled Calculation */
                    let percentageFilled = tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability * 100
                    if (tradingEngineOrder.orderStatistics.percentageFilled.value + percentageFilled > 100) {
                        percentageFilled = 100 - tradingEngineOrder.orderStatistics.percentageFilled.value
                    }
                    tradingEngineOrder.orderStatistics.percentageFilled.value = tradingEngineOrder.orderStatistics.percentageFilled.value + percentageFilled
                    if (tradingEngineOrder.orderStatistics.percentageFilled.value === 100) {

                        /* Close this Order */
                        tradingEngineOrder.status.value = 'Closed'
                        tradingEngineOrder.exitType.value = 'Filled'

                        /* Initialize this */
                        tradingEngine.current.distanceToEvent.closeOrder.value = 1
                    }

                    /* Filled Size Calculation */
                    stageFilledSize.value = stageFilledSize.value + tradingEngineOrder.size.value * percentageFilled / 100
                    stageFilledSize.value = global.PRECISE(stageFilledSize.value, 10)

                    if (stageIsClosing === true && tradingEngineOrder.status.value !== 'Closed') {
                        simulateCancelOrder(tradingSystemOrder, tradingEngineOrder, 'Closing Stage')
                    }
                }
            }

            /* Actual Rate Simulation */
            if (tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula !== undefined) {
                    if (tradingEngineOrder.orderStatistics.actualRate.value === tradingEngineOrder.orderStatistics.actualRate.config.initialValue) {
                        tradingEngineOrder.orderStatistics.actualRate.value = tradingSystem.formulas.get(tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula.id)
                    }
                }
            }

            /* Fees Paid Simulation */
            if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage !== undefined) {
                    if (tradingEngineOrder.orderStatistics.feesPaid.value === tradingEngineOrder.orderStatistics.feesPaid.config.initialValue) {
                        tradingEngineOrder.orderStatistics.feesPaid.value = tradingEngineOrder.size.value * tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage / 100
                    }
                }
            }
        }

        async function checkExchangeEvents(tradingSystemOrder, tradingEngineOrder) {

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
                tradingEngine.current.distanceToEvent.closeOrder.value = 1
            }
            if (order.remaining > 0 && order.status === AT_EXCHANGE_STATUS.CLOSED) {

                /* Close this Order */
                tradingEngineOrder.status.value = 'Closed'
                tradingEngineOrder.exitType.value = 'Closed at the Exchange'

                /* Initialize this */
                tradingEngine.current.distanceToEvent.closeOrder.value = 1
            }
            if (order.status === AT_EXCHANGE_STATUS.CANCELLED) {

                /* Close this Order */
                tradingEngineOrder.status.value = 'Closed'
                tradingEngineOrder.exitType.value = 'Cancelled at the Exchange'

                /* Initialize this */
                tradingEngine.current.distanceToEvent.closeOrder.value = 1
            }

            syncWithExchange(tradingSystemOrder, tradingEngineOrder, order)

            /* Forced Cancellation Check */
            if (stageIsClosing === true && tradingEngineOrder.status.value !== 'Closed') {
                await exchangeCancelOrder(tradingSystemOrder, tradingEngineOrder, 'Closing Stage')
            }
        }

        function syncWithExchange(tradingSystemOrder, tradingEngineOrder, order) {
            /* Percentage Filled */
            let currentPercentageFilled = tradingEngineOrder.orderStatistics.percentageFilled.value
            let percentageFilled = order.filled * 100 / (order.filled + order.remaining)
            percentageFilled = global.PRECISE(percentageFilled, 10)
            tradingEngineOrder.orderStatistics.percentageFilled.value = percentageFilled

            /* Filled Size Calculation */
            stageFilledSize.value = stageFilledSize.value - tradingEngineOrder.size.value * currentPercentageFilled / 100   // First remove the current filled size
            stageFilledSize.value = stageFilledSize.value + tradingEngineOrder.size.value * percentageFilled / 100          // Second add the new filled size
            stageFilledSize.value = global.PRECISE(stageFilledSize.value, 10)

            /* Actual Rate Calculation */
            tradingEngineOrder.orderStatistics.actualRate.value = order.price
            tradingEngineOrder.orderStatistics.actualRate.value = global.PRECISE(tradingEngineOrder.orderStatistics.actualRate.value, 10)

            /* Fees Paid Calculation */
            tradingEngineOrder.orderStatistics.feesPaid.value = tradingEngineOrder.size.value - order.amount
            tradingEngineOrder.orderStatistics.feesPaid.value = global.PRECISE(tradingEngineOrder.orderStatistics.feesPaid.value, 10)
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
            tradingEngine.current.distanceToEvent.closeOrder.value = 1

            /* Since the order was cancelled, we remove the unfilled amount of the order from here */
            let unfilledPercentage = 100 - tradingEngineOrder.orderStatistics.percentageFilled.value
            let unfilledSize = tradingEngineOrder.size.value * unfilledPercentage / 100
            stageOrdersSize.value = stageOrdersSize.value - unfilledSize
            stageOrdersSize.value = global.PRECISE(stageOrdersSize.value, 10)
        }

        async function exchangeCancelOrder(tradingSystemOrder, tradingEngineOrder, exitType) {

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
                tradingEngine.current.distanceToEvent.closeOrder.value = 1

                /* Since the order was cancelled, we remove the unfilled amount of the order from here */
                let unfilledPercentage = 100 - tradingEngineOrder.orderStatistics.percentageFilled.value
                let unfilledSize = tradingEngineOrder.size.value * unfilledPercentage / 100
                stageOrdersSize.value = stageOrdersSize.value - unfilledSize
                stageOrdersSize.value = global.PRECISE(stageOrdersSize.value, 10)

                /* 
                Perhaps the order was filled a bit more between the last time we checked and when it was cancelled.
                To sync our accounting, we need to check the order one last time and if it changed, fix it.
                */

                let order = await exchangeAPIModule.getOrder(tradingSystemOrder, tradingEngineOrder)

                if (order === undefined) { return }

                syncWithExchange(tradingSystemOrder, tradingEngineOrder, order)
            }
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
    }
}

