exports.newAlgorithmicTradingBotModulesTradingOrders = function (processIndex) {
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

    let exchangeAPIModuleObject = TS.projects.algorithmicTrading.botModules.exchangeAPI.newAlgorithmicTradingBotModulesExchangeAPI(processIndex)
    let announcementsModuleObject = TS.projects.socialBots.botModules.announcements.newSocialBotsBotModulesAnnouncements(processIndex)

    return thisObject

    function initialize() {
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

        exchangeAPIModuleObject.initialize()
        announcementsModuleObject.initialize()
    }

    function finalize() {
        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined

        exchangeAPIModuleObject.finalize()
        exchangeAPIModuleObject = undefined

        announcementsModuleObject.finalize()
        announcementsModuleObject = undefined
    }

    function mantain() {
        mantainReset(true, false)
    }

    function reset() {
        mantainReset(false, true)
    }

    function mantainReset(mantain, reset) {

        if (tradingEngine.tradingCurrent.strategy.index.value === tradingEngine.tradingCurrent.strategy.index.config.initialValue) { return }

        let stageNode
        let executionNode

        stageNode = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].openStage

        if (stageNode !== undefined) { // The Open Stage is optional. It might be undefined.
            executionNode = stageNode.openExecution
            processExecutionNode(executionNode, tradingEngine.tradingCurrent.strategyOpenStage.status.value)
        }

        stageNode = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].closeStage
        if (stageNode !== undefined) { // The Close Stage is optional. It might be undefined.
            executionNode = stageNode.closeExecution
            processExecutionNode(executionNode, tradingEngine.tradingCurrent.strategyCloseStage.status.value)
        }

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
                        badDefinitionUnhandledException(undefined, 'Order Reference Missing', tradingSystemOrder)
                    }
                    let tradingEngineOrder = TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.getNodeById(tradingSystemOrder.referenceParent.id)

                    if (tradingEngineOrder.status === undefined) {
                        badDefinitionUnhandledException(undefined, 'Status Node Missing', tradingEngineOrder)
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
            let tradingEngineOrder = TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.getNodeById(tradingSystemOrder.referenceParent.id)
            tradingEngineValidations(tradingEngineOrder)

            switch (tradingEngineOrder.status.value) {
                case 'Not Open': {
                    {
                        /* During the First cycle we can not create new orders. That is reserved for the Second cycle. */
                        if (tradingEngine.tradingCurrent.tradingEpisode.cycle.value === 'First') { continue }
                        /* When the stage is closing we can not create new orders */
                        if (tradingEngineStage.status.value === 'Closing') { continue }
                        /* 
                        Check if we can create an order based on the config value for spawnMultipleOrders.
                        Trading System Orders that cannot spawn more than one Trading Engine Order needs to check if
                        at the Trading Engine Order the lock is Open or Closed. 
                        */
                        if (tradingSystemOrder.config.spawnMultipleOrders !== true) {
                            if (tradingEngineOrder.lock.value === 'Closed') {

                                let message = "Order Skipped"
                                let docs = {
                                    project: 'Foundations',
                                    category: 'Topic',
                                    type: 'TS LF Trading Bot Info - ' + message,
                                    placeholder: {}
                                }

                                tradingSystem.addInfo([tradingSystemOrder.id, message, docs])
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
                    if (tradingEngine.tradingCurrent.tradingEpisode.cycle.value === 'Second') { continue }

                    /* Simulate Events that happens at the Exchange, if needed. */
                    simulateCheckExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder)

                    /* Check Events that happens at the Exchange, if needed. */
                    let allGood = await checkExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder)

                    if (allGood !== true) {
                        /*
                        For some reason we could not check the order at the exchange, so we will not even check if we 
                        need to cancel it, since we could end up with inconsistent information at the accounting level.
                        */
                        if (tradingSystemOrder.cancelOrderEvent !== undefined) {

                            const message = 'Skipping Cancel Order Event'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Trading Bot Warning - ' + message,
                                placeholder: {}
                            }

                            tradingSystem.addWarning(
                                [
                                    tradingSystemOrder.cancelOrderEvent.id,
                                    message,
                                    docs
                                ]
                            )
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
                                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.cloneValues(tradingEngineOrder, tradingEngine.tradingLast.marketOrders)
                                break
                            }
                            case 'Limit Order': {
                                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.cloneValues(tradingEngineOrder, tradingEngine.tradingLast.limitOrders)
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

                /* Simulate Order Cancellation, if needed. */
                simulateCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, 'Cancel Event')

                /* Cancel the order at the Exchange, if needed. */
                await exchangeCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, 'Cancel Event')

                await updateEndsWithCycle(tradingEngineOrder)
            }
        }
    }

    function tradingSystemValidations(tradingSystemOrder) {
        /* Trading System Validations */
        if (tradingSystemOrder.config.percentageOfAlgorithmSize === undefined) { badDefinitionUnhandledException(undefined, 'Percentage Of Algorithm Size Property Missing', tradingSystemOrder) }
        if (tradingSystemOrder.referenceParent === undefined) { badDefinitionUnhandledException(undefined, 'Order Reference Missing', tradingSystemOrder) }
    }

    function tradingEngineValidations(tradingEngineOrder) {
        /* Trading Engine Order Validations */
        if (tradingEngineOrder.serialNumber === undefined) { badDefinitionUnhandledException(undefined, 'Serial Number Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.identifier === undefined) { badDefinitionUnhandledException(undefined, 'Identifier Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.exchangeId === undefined) { badDefinitionUnhandledException(undefined, 'Exchange Id Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.begin === undefined) { badDefinitionUnhandledException(undefined, 'Begin Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.end === undefined) { badDefinitionUnhandledException(undefined, 'End Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.rate === undefined) { badDefinitionUnhandledException(undefined, 'Rate Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.status === undefined) { badDefinitionUnhandledException(undefined, 'Status Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.algorithmName === undefined) { badDefinitionUnhandledException(undefined, 'Algorithm Name Node Missing', tradingEngineOrder) }

        if (tradingEngineOrder.orderCounters === undefined) { badDefinitionUnhandledException(undefined, 'Order Counters Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.orderCounters.periods === undefined) { badDefinitionUnhandledException(undefined, 'Periods Node Missing', tradingEngineOrder.orderCounters) }

        if (tradingEngineOrder.orderStatistics === undefined) { badDefinitionUnhandledException(undefined, 'Order Statistics Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.orderStatistics.days === undefined) { badDefinitionUnhandledException(undefined, 'Days Node Missing', tradingEngineOrder.orderStatistics) }
        if (tradingEngineOrder.orderStatistics.percentageFilled === undefined) { badDefinitionUnhandledException(undefined, 'Percentage Filled Node Missing', tradingEngineOrder.orderStatistics) }
        if (tradingEngineOrder.orderStatistics.actualRate === undefined) { badDefinitionUnhandledException(undefined, 'Actual Rate Node Missing', tradingEngineOrder.orderStatistics) }

        if (tradingEngineOrder.orderBaseAsset === undefined) { badDefinitionUnhandledException(undefined, 'Order Base Asset Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.orderBaseAsset.size === undefined) { badDefinitionUnhandledException(undefined, 'Size Node Missing', tradingEngineOrder.orderBaseAsset) }
        if (tradingEngineOrder.orderBaseAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'Size Filled Node Missing', tradingEngineOrder.orderBaseAsset) }
        if (tradingEngineOrder.orderBaseAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees Paid Node Missing', tradingEngineOrder.orderBaseAsset) }
        if (tradingEngineOrder.orderBaseAsset.actualSize === undefined) { badDefinitionUnhandledException(undefined, 'Actual Size Node Missing', tradingEngineOrder.orderBaseAsset) }
        if (tradingEngineOrder.orderBaseAsset.amountReceived === undefined) { badDefinitionUnhandledException(undefined, 'Amount Received Node Missing', tradingEngineOrder.orderBaseAsset) }
        if (tradingEngineOrder.orderBaseAsset.feesToBePaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees To Be Paid Node Missing', tradingEngineOrder.orderBaseAsset) }

        if (tradingEngineOrder.orderQuotedAsset === undefined) { badDefinitionUnhandledException(undefined, 'Order Quoted Asset Node Missing', tradingEngineOrder) }
        if (tradingEngineOrder.orderQuotedAsset.size === undefined) { badDefinitionUnhandledException(undefined, 'Size Node Missing', tradingEngineOrder.orderQuotedAsset) }
        if (tradingEngineOrder.orderQuotedAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'Size Filled Node Missing', tradingEngineOrder.orderQuotedAsset) }
        if (tradingEngineOrder.orderQuotedAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees Paid Node Missing', tradingEngineOrder.orderQuotedAsset) }
        if (tradingEngineOrder.orderQuotedAsset.actualSize === undefined) { badDefinitionUnhandledException(undefined, 'Actual Size Node Missing', tradingEngineOrder.orderQuotedAsset) }
        if (tradingEngineOrder.orderQuotedAsset.amountReceived === undefined) { badDefinitionUnhandledException(undefined, 'Amount Received Node Missing', tradingEngineOrder.orderQuotedAsset) }
        if (tradingEngineOrder.orderQuotedAsset.feesToBePaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees To Be Paid Node Missing', tradingEngineOrder.orderQuotedAsset) }
    }

    async function tryToOpenOrder(tradingEngineStage, executionAlgorithm, tradingSystemOrder, tradingEngineOrder, situationName) {

        await calculateOrderRate()
        await calculateOrderSize()

        /* Check Size: We are not going to create Orders which size is equal or less to zero.  */
        if (tradingEngineOrder.orderBaseAsset.size.value <= 0) {

            const message = 'Order Size Value Zero Or Negative'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Warning - ' + message,
                placeholder: {}
            }

            tradingSystem.addWarning(
                [
                    [tradingEngineOrder.orderBaseAsset.size.id, tradingSystemOrder.id],
                    message,
                    docs
                ]
            )
            return
        }

        if (tradingEngineOrder.orderQuotedAsset.size.value <= 0) {

            const message = 'Order Size Value Zero Or Negative'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Warning - ' + message,
                placeholder: {}
            }

            tradingSystem.addWarning(
                [
                    [tradingEngineOrder.orderQuotedAsset.size.id, tradingSystemOrder.id],
                    message,
                    docs
                ]
            )
            return
        }

        /* Place Order at the Exchange, if needed. */
        let result = await createOrderAtExchange(tradingSystemOrder, tradingEngineOrder)
        if (result !== true) {

            const message = 'Order Could Not Be Opened'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Warning - ' + message,
                placeholder: {}
            }

            tradingSystem.addWarning(
                [
                    [tradingSystemOrder.id, tradingEngineOrder],
                    message,
                    docs
                ]
            )
            return
        }

        /* Update Stage Placed Size */
        tradingEngineStage.stageBaseAsset.sizePlaced.value = tradingEngineStage.stageBaseAsset.sizePlaced.value + tradingEngineOrder.orderBaseAsset.size.value
        tradingEngineStage.stageBaseAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineStage.stageBaseAsset.sizePlaced.value, 10)
        tradingEngineStage.stageQuotedAsset.sizePlaced.value = tradingEngineStage.stageQuotedAsset.sizePlaced.value + tradingEngineOrder.orderQuotedAsset.size.value
        tradingEngineStage.stageQuotedAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)

        /* Updating Episode Counters */
        tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.orders.value++

        /* Initialize this */
        tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.createOrder.value = 1

        /* Create Order Procedure */
        tradingEngineOrder.status.value = 'Open'
        tradingEngineOrder.identifier.value = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
        tradingEngineOrder.begin.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.begin.value
        tradingEngineOrder.end.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.end.value
        tradingEngineOrder.serialNumber.value = tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.orders.value
        tradingEngineOrder.orderName.value = tradingSystemOrder.name
        tradingEngineOrder.algorithmName.value = executionAlgorithm.name
        tradingEngineOrder.situationName.value = situationName

        async function calculateOrderRate() {

            /* Optional Rate Definition */
            if (tradingSystemOrder.type === 'Limit Buy Order' || tradingSystemOrder.type === 'Limit Sell Order') {
                if (tradingSystemOrder.orderRate === undefined) { badDefinitionUnhandledException(undefined, 'Order Rate Node Missing', tradingSystemOrder) }
                if (tradingSystemOrder.orderRate.formula === undefined) { badDefinitionUnhandledException(undefined, 'Formula Node Missing', tradingSystemOrder) }

                /* Extract the rate value from the user-defined formula */
                tradingEngineOrder.rate.value = tradingSystem.formulas.get(tradingSystemOrder.orderRate.formula.id)

                /* Final rate validations */
                if (tradingEngineOrder.rate.value === undefined) { badDefinitionUnhandledException(undefined, 'Rate Value Undefined', tradingEngineOrder.rate) }
                if (isNaN(tradingEngineOrder.rate.value) === true) { badDefinitionUnhandledException(undefined, 'Rate Value Not A Number', tradingSystemOrder) }
                if (tradingEngineOrder.rate.value <= 0) { badDefinitionUnhandledException(undefined, 'Rate Value Zero Or Negative', tradingSystemOrder) }

                tradingEngineOrder.rate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.rate.value, 10)
            } else {
                /* 
                For Market Orders, the rate is irrelevant, since it is not sent to the Exchange.
                We store at this field the last know price as a reference.
                */
                tradingEngineOrder.rate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
            }
        }

        async function calculateOrderSize() {
            let algorithmSizeInBaseAsset
            let algorithmSizeInQuotedAsset

            requiredConfigurationValidation()
            notPassingTargetSizeValidation()
            notNegativeBalanceValidation()

            function requiredConfigurationValidation() {
                /* Validate that this config exists */
                if (executionAlgorithm.config.percentageOfStageTargetSize === undefined) {
                    badDefinitionUnhandledException(undefined, 'Percentage Of Stage Target Size Property Missing', executionAlgorithm)
                }
                if (isNaN(executionAlgorithm.config.percentageOfStageTargetSize) === true) {
                    badDefinitionUnhandledException(undefined, 'Percentage Of Stage Target Size Property Not A Number', executionAlgorithm)
                }

                algorithmSizeInBaseAsset = tradingEngineStage.stageBaseAsset.targetSize.value * executionAlgorithm.config.percentageOfStageTargetSize / 100
                algorithmSizeInQuotedAsset = tradingEngineStage.stageQuotedAsset.targetSize.value * executionAlgorithm.config.percentageOfStageTargetSize / 100

                /* Validate that this config exists */
                if (tradingSystemOrder.config.percentageOfAlgorithmSize === undefined) {
                    badDefinitionUnhandledException(undefined, 'Percentage Of Algorithm Size Property Missing', tradingSystemOrder)
                }
                if (isNaN(tradingSystemOrder.config.percentageOfAlgorithmSize) === true) {
                    badDefinitionUnhandledException(undefined, 'Percentage Of Algorithm Size Property Not A Number', tradingSystemOrder)
                }
            }

            function notPassingTargetSizeValidation() {
                /*
                The Size calculation depends on how the user defined the size of the position.
                The user could have defined the size of the position in Base Asset or Quoted Asset.
                */
                switch (tradingEngineStage.stageDefinedIn.value) {
                    case 'Base Asset': {
                        /* Size in Base Asset */
                        tradingEngineOrder.orderBaseAsset.size.value = algorithmSizeInBaseAsset * tradingSystemOrder.config.percentageOfAlgorithmSize / 100
                        tradingEngineOrder.orderBaseAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderBaseAsset.size.value, 10)

                        /* Check that the Size calculated would not surpass Stage Target Size */
                        if (
                            tradingEngineOrder.orderBaseAsset.size.value + tradingEngineStage.stageBaseAsset.sizePlaced.value >
                            tradingEngineStage.stageBaseAsset.targetSize.value
                        ) {
                            let previousValue = tradingEngineOrder.orderBaseAsset.size.value
                            tradingEngineOrder.orderBaseAsset.size.value =
                                tradingEngineStage.stageBaseAsset.targetSize.value -
                                tradingEngineStage.stageBaseAsset.sizePlaced.value

                            tradingEngineOrder.orderBaseAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderBaseAsset.size.value, 10)

                            const message = 'Order Size Shrinked'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Trading Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                previousOrderSize: previousValue,
                                recalculatedOrderSize: tradingEngineOrder.orderBaseAsset.size.value,
                                sizePlaced: tradingEngineStage.stageBaseAsset.sizePlaced.value,
                                targetSize: tradingEngineStage.stageBaseAsset.targetSize.value
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            tradingSystem.addWarning(
                                [
                                    [tradingEngineStage.stageBaseAsset.targetSize.id, tradingEngineOrder.orderBaseAsset.size.id, tradingEngineStage.stageBaseAsset.sizePlaced.id],
                                    message,
                                    docs
                                ]
                            )
                        }

                        /* Size in Quoted Asset */
                        tradingEngineOrder.orderQuotedAsset.size.value = tradingEngineOrder.orderBaseAsset.size.value * tradingEngineOrder.rate.value
                        tradingEngineOrder.orderQuotedAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderQuotedAsset.size.value, 10)
                        break
                    }
                    case 'Quoted Asset': {
                        /* Size in Quoted Asset */
                        tradingEngineOrder.orderQuotedAsset.size.value = algorithmSizeInQuotedAsset * tradingSystemOrder.config.percentageOfAlgorithmSize / 100
                        tradingEngineOrder.orderQuotedAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderQuotedAsset.size.value, 10)

                        /* Check that the Size calculated would not surpass Stage Target Size */
                        if (
                            tradingEngineOrder.orderQuotedAsset.size.value + tradingEngineStage.stageQuotedAsset.sizePlaced.value >
                            tradingEngineStage.stageQuotedAsset.targetSize.value
                        ) {
                            let previousValue = tradingEngineOrder.orderQuotedAsset.size.value
                            tradingEngineOrder.orderQuotedAsset.size.value =
                                tradingEngineStage.stageQuotedAsset.targetSize.value -
                                tradingEngineStage.stageQuotedAsset.sizePlaced.value

                            tradingEngineOrder.orderQuotedAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderQuotedAsset.size.value, 10)

                            const message = 'Order Size Shrinked'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Trading Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                previousOrderSize: previousValue,
                                recalculatedOrderSize: tradingEngineOrder.orderQuotedAsset.size.value,
                                sizePlaced: tradingEngineStage.stageQuotedAsset.sizePlaced.value,
                                targetSize: tradingEngineStage.stageQuotedAsset.targetSize.value
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            tradingSystem.addWarning(
                                [
                                    [tradingEngineStage.stageQuotedAsset.targetSize.id, tradingEngineOrder.orderQuotedAsset.size.id, tradingEngineStage.stageQuotedAsset.sizePlaced.id],
                                    message,
                                    docs
                                ]
                            )
                        }

                        /* Size in Base Asset */
                        tradingEngineOrder.orderBaseAsset.size.value = tradingEngineOrder.orderQuotedAsset.size.value / tradingEngineOrder.rate.value
                        tradingEngineOrder.orderBaseAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderBaseAsset.size.value, 10)
                        break
                    }
                }
            }

            function notNegativeBalanceValidation() {
                /* Check that the Size calculated would not leave a negative balance */
                switch (true) {
                    case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {
                        if (
                            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value - tradingEngineOrder.orderQuotedAsset.size.value < 0
                        ) {
                            const message = 'Possible Negative Balance'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Trading Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                orderQuotedAssetSize: tradingEngineOrder.orderQuotedAsset.size.value,
                                episodeQuotedAssetBalance: tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            tradingSystem.addWarning(
                                [
                                    [tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.id, tradingEngineOrder.orderQuotedAsset.size.id],
                                    message,
                                    docs
                                ]
                            )

                            tradingEngineOrder.orderQuotedAsset.size.value = tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value
                            tradingEngineOrder.orderBaseAsset.size.value = tradingEngineOrder.orderQuotedAsset.size.value / tradingEngineOrder.rate.value
                        }
                        break
                    }
                    case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {
                        if (
                            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value - tradingEngineOrder.orderBaseAsset.size.value < 0
                        ) {
                            const message = 'Possible Negative Balance'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Trading Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                orderBaseAssetSize: tradingEngineOrder.orderBaseAsset.size.value,
                                episodeBaseAssetBalance: tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            tradingSystem.addWarning(
                                [
                                    [tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.id, tradingEngineOrder.orderBaseAsset.size.id],
                                    message,
                                    docs
                                ]
                            )

                            tradingEngineOrder.orderBaseAsset.size.value = tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value
                            tradingEngineOrder.orderQuotedAsset.size.value = tradingEngineOrder.orderBaseAsset.size.value * tradingEngineOrder.rate.value
                        }
                        break
                    }
                }
            }

            tradingEngineOrder.orderBaseAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderBaseAsset.size.value, 10)
            tradingEngineOrder.orderQuotedAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderQuotedAsset.size.value, 10)
        }

        async function createOrderAtExchange(tradingSystemOrder, tradingEngineOrder) {

            /* Filter by Session Type */
            switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
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

            let orderId = await exchangeAPIModuleObject.createOrder(tradingSystemOrder, tradingEngineOrder)

            if (orderId !== undefined) {
                tradingEngineOrder.exchangeId.value = orderId
                return true
            }
        }
    }

    async function checkExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder) {

        /* Filter by Session Type */
        switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
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

        let order = await exchangeAPIModuleObject.getOrder(tradingSystemOrder, tradingEngineOrder)

        let message
        let docs

        if (order === undefined) {

            message = 'Order Status Not Sync With Exchange'
            docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Warning - ' + message,
                placeholder: {}
            }

            tradingSystem.addWarning(
                [
                    [tradingSystemOrder.id, tradingEngineOrder.id],
                    message,
                    docs
                ]
            )
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
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closeOrder.value = 1

            await updateEndsWithCycle(tradingEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: tradingEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            tradingSystem.addInfo([tradingSystemOrder.id, message, docs])

            await syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)
            return
        }

        if (order.remaining > 0 && order.status === AT_EXCHANGE_STATUS.CLOSED) {
            /* Close this Order */
            tradingEngineOrder.status.value = 'Closed'
            tradingEngineOrder.exitType.value = 'Closed at the Exchange'
            /* Initialize this */
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closeOrder.value = 1

            await updateEndsWithCycle(tradingEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: tradingEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            tradingSystem.addInfo([tradingSystemOrder.id, message, docs])

            await syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)
            await recalculateStageSize(tradingEngineStage, tradingEngineOrder)
            return
        }

        if (order.status === AT_EXCHANGE_STATUS.CANCELLED) {
            /* Close this Order */
            tradingEngineOrder.status.value = 'Closed'
            /* 
            We must be carefully here not to override an already defined exitType. It can happen
            for instance that the order was cancelled from the but verifying the cancellation
            was not possible because of a connection to the exchange problem. In that case
            the exit type was defined but the order was kept open until the verification could be done.
            */
            if (tradingEngineOrder.exitType.value === tradingEngineOrder.exitType.config.initialValue) {
                tradingEngineOrder.exitType.value = 'Cancelled at the Exchange'
            }
            /* Initialize this */
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closeOrder.value = 1

            await updateEndsWithCycle(tradingEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: tradingEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            tradingSystem.addInfo([tradingSystemOrder.id, message, docs])

            await syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)
            await recalculateStageSize(tradingEngineStage, tradingEngineOrder)
            return
        }

        /*
        If the order happens to be at least partially filled, there is a synchronization work
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

    function simulateCheckExchangeEvents(tradingEngineStage, tradingSystemOrder, tradingEngineOrder) {

        /* Filter by Session Type */
        switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
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

        simulateSyncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder)

        /* Check if we need to close the order */
        if (tradingEngineOrder.orderStatistics.percentageFilled.value === 100) {

            /* Close this Order */
            tradingEngineOrder.status.value = 'Closed'
            tradingEngineOrder.exitType.value = 'Filled'

            /* Initialize this */
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closeOrder.value = 1

            updateEndsWithCycle(tradingEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: tradingEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            tradingSystem.addInfo([tradingSystemOrder.id, message, docs])
        }

        /* If the Stage is Closing and this order is still open, we need to cancel it now */
        if (tradingEngineStage.status.value === 'Closing' && tradingEngineOrder.status.value !== 'Closed') {
            simulateCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, 'Closing Stage')
        }
    }

    function simulateSyncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder) {

        let previousBaseAssetSizeFilled = tradingEngineOrder.orderBaseAsset.sizeFilled.value
        let previousQuotedAssetSizeFilled = tradingEngineOrder.orderQuotedAsset.sizeFilled.value
        let previousBaseAssetFeesPaid = tradingEngineOrder.orderBaseAsset.feesPaid.value
        let previousQuotedAssetFeesPaid = tradingEngineOrder.orderQuotedAsset.feesPaid.value

        let ordersSimulationsModuleObject = TS.projects.algorithmicTrading.botModules.ordersSimulations.newAlgorithmicTradingBotModulesOrdersSimulations(processIndex)
        ordersSimulationsModuleObject.initialize()

        ordersSimulationsModuleObject.actualSizeSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.actualRateSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.feesToBePaidSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.percentageFilledSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.feesPaidSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.sizeFilledSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.amountReceivedSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage)

        ordersSimulationsModuleObject.finalize()

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

    async function syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order) {

        let previousBaseAssetSizeFilled = tradingEngineOrder.orderBaseAsset.sizeFilled.value
        let previousQuotedAssetSizeFilled = tradingEngineOrder.orderQuotedAsset.sizeFilled.value
        let previousBaseAssetFeesPaid = tradingEngineOrder.orderBaseAsset.feesPaid.value
        let previousQuotedAssetFeesPaid = tradingEngineOrder.orderQuotedAsset.feesPaid.value

        let ordersCalculationsModuleObject = TS.projects.algorithmicTrading.botModules.ordersCalculations.newAlgorithmicTradingBotModulesOrdersCalculations(processIndex)
        ordersCalculationsModuleObject.initialize()

        await ordersCalculationsModuleObject.actualSizeCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.actualRateCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.feesToBePaidCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.percentageFilledCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.feesPaidCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.sizeFilledCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.amountReceivedCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage)

        ordersCalculationsModuleObject.finalize()

        await doTheAccounting(
            tradingEngineStage,
            tradingSystemOrder,
            tradingEngineOrder,
            previousBaseAssetSizeFilled,
            previousQuotedAssetSizeFilled,
            previousBaseAssetFeesPaid,
            previousQuotedAssetFeesPaid
        )
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

            tradingEngineStage.stageBaseAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineStage.stageBaseAsset.sizeFilled.value, 10)
            tradingEngineStage.stageBaseAsset.feesPaid.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineStage.stageBaseAsset.feesPaid.value, 10)

            tradingEngineStage.stageQuotedAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineStage.stageQuotedAsset.sizeFilled.value, 10)
            tradingEngineStage.stageQuotedAsset.feesPaid.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineStage.stageQuotedAsset.feesPaid.value, 10)
        }

        async function updateBalances() {
            /* Balances Update */
            switch (true) {
                /*
                For Sell orders, the fees are being paid in Quote Asset. 
                */
                case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {

                    /* Balance Base Asset: Undo the previous accounting */
                    tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value =
                        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value +
                        previousBaseAssetSizeFilled

                    /* Balance Base Asset: Account the current filling and fees */
                    tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value =
                        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value -
                        tradingEngineOrder.orderBaseAsset.sizeFilled.value

                    /* Balance Quoted Asset: Undo the previous accounting */
                    tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value =
                        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value -
                        previousQuotedAssetSizeFilled +
                        previousQuotedAssetFeesPaid

                    /* Balance Quoted Asset: Account the current filling and fees */
                    tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value =
                        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value +
                        tradingEngineOrder.orderQuotedAsset.sizeFilled.value -
                        tradingEngineOrder.orderQuotedAsset.feesPaid.value
                    break
                }
                /*
                Let's remember that for Buy orders, the fees are paid in Base Asset.
                */
                case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {

                    /* Balance Base Asset: Undo the previous accounting */
                    tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value =
                        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value -
                        previousBaseAssetSizeFilled +
                        previousBaseAssetFeesPaid

                    /* Balance Base Asset: Account the current filling and fees */
                    tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value =
                        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value +
                        tradingEngineOrder.orderBaseAsset.sizeFilled.value -
                        tradingEngineOrder.orderBaseAsset.feesPaid.value

                    /* Balance Quoted Asset: Undo the previous accounting */
                    tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value =
                        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value +
                        previousQuotedAssetSizeFilled

                    /* Balance Quoted Asset: Account the current filling and fees */
                    tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value =
                        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value -
                        tradingEngineOrder.orderQuotedAsset.sizeFilled.value
                    break
                }
            }
            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value, 10)
            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value, 10)
        }
    }

    function simulateCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, exitType) {

        /* Filter by Session Type */
        switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
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
        tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closeOrder.value = 1

        updateEndsWithCycle(tradingEngineOrder)

        let message = "Order Closed"
        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS LF Trading Bot Info - ' + message,
            placeholder: {}
        }
        contextInfo = {
            exitType: tradingEngineOrder.exitType.value
        }
        TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

        tradingSystem.addInfo([tradingSystemOrder.id, message, docs])

        recalculateStageSize(tradingEngineStage, tradingEngineOrder)
    }

    async function exchangeCancelOrder(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, exitType) {

        /* Filter by Session Type */
        switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
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
        let result = await exchangeAPIModuleObject.cancelOrder(tradingSystemOrder, tradingEngineOrder)
        if (result === true) {

            /* At this point we know which is the exit type for this order */
            tradingEngineOrder.exitType.value = exitType

            /* 
            Perhaps the order was filled a bit more between the last time we checked and when it was cancelled.
            To sync our accounting, we need to check the order one last time and if it changed, fix it.
            */

            let order = await exchangeAPIModuleObject.getOrder(tradingSystemOrder, tradingEngineOrder)

            if (order === undefined) {

                const message = 'Order Status Not Sync With Exchange'
                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Trading Bot Warning - ' + message,
                    placeholder: {}
                }

                tradingSystem.addWarning(
                    [
                        [tradingSystemOrder.id, tradingEngineOrder.id],
                        message,
                        docs
                    ]
                )
                return false
            }
            if (order.status === 'NotFound') {
                /*
                Some exchanges, like Coinbase Pro, deletes orders after being cancelled, and when we request information
                about them, it returns null. We will interpret this as ORDER NOT FOUND.
                */
                const message = 'Order Not Found at the Exchange'
                let docs = {
                    project: 'Superalgos',
                    category: 'Topic',
                    type: 'TS LF Trading Bot Warning - ' + message,
                    placeholder: {}
                }

                tradingSystem.addWarning(
                    [
                        [tradingSystemOrder.id, tradingEngineOrder.id],
                        message,
                        docs
                    ]
                )
                /*
                We must be carefully here not to overide an already defined exitType. It can happen
                for instance that the order was cancelled from the but verifying the cancellation
                was not possible because of a connection to the exchange problem. In that case
                the exit type was defined but the order was kept open until the verification could be done.
                */
                if (tradingEngineOrder.exitType.value === tradingEngineOrder.exitType.config.initialValue) {
                    tradingEngineOrder.exitType.value = 'Not Found at the Exchange'
                }
            }

            /* 
            Close this Order. Note that we are not closing the order until we have the exchange 
            response with the order details that we can use to synchronize with our accounting.
            Otherwise if the connection to the exchange fails, we would have a closed order not 
            accounted in any way. 
            */
            tradingEngineOrder.status.value = 'Closed'

            /* Initialize this */
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closeOrder.value = 1

            await updateEndsWithCycle(tradingEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: tradingEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            tradingSystem.addInfo([tradingSystemOrder.id, message, docs])

            await syncWithExchange(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order)

            await recalculateStageSize(tradingEngineStage, tradingEngineOrder)
        }
    }

    async function recalculateStageSize(tradingEngineStage, tradingEngineOrder) {
        /* 
        Since the order is Cancelled, we need to adjust the stage sizePlaced. Remember that the Stage 
        Size Placed accumulates for each asset, the order size placed at the exchange. A cancellation means that
        only the part filled can be considered placed, so we need to subtract from the stage size
        the remainder. To achieve this with the information we currently have, we are going first 
        to unaccount the order actual size, and the account only the sizeFilled + the feesPaid.
        */
        tradingEngineStage.stageBaseAsset.sizePlaced.value =
            tradingEngineStage.stageBaseAsset.sizePlaced.value -
            tradingEngineOrder.orderBaseAsset.actualSize.value

        tradingEngineStage.stageQuotedAsset.sizePlaced.value =
            tradingEngineStage.stageQuotedAsset.sizePlaced.value -
            tradingEngineOrder.orderQuotedAsset.actualSize.value

        tradingEngineStage.stageBaseAsset.sizePlaced.value =
            tradingEngineStage.stageBaseAsset.sizePlaced.value +
            tradingEngineOrder.orderBaseAsset.sizeFilled.value

        tradingEngineStage.stageQuotedAsset.sizePlaced.value =
            tradingEngineStage.stageQuotedAsset.sizePlaced.value +
            tradingEngineOrder.orderQuotedAsset.sizeFilled.value

        tradingEngineStage.stageBaseAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineStage.stageBaseAsset.sizePlaced.value, 10)
        tradingEngineStage.stageQuotedAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)
    }

    async function applyFeePercentage(feesNodePropertyName, tradingEngineOrder, tradingSystemOrder, feePercentage, percentageFilled) {
        /* 
        The exchange fees are taken from the Base Asset or the Quoted Asset depending if we 
        are buying or selling.
        */
        let feesNode

        switch (true) {
            case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {
                /*
                In this case the fees are taken from the Base Asset you receive as a result of the trade at the exchange.
                */
                feesNode = tradingEngineOrder.orderBaseAsset[feesNodePropertyName]
                feesNode.value =
                    tradingEngineOrder.orderBaseAsset.actualSize.value *
                    feePercentage / 100 *
                    percentageFilled / 100
                break
            }
            case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {
                /*
                In this case the fees are taken from the Quoted Asset you receive as a result of the trade at the exchange.
                */
                feesNode = tradingEngineOrder.orderQuotedAsset[feesNodePropertyName]
                feesNode.value =
                    tradingEngineOrder.orderQuotedAsset.actualSize.value *
                    feePercentage / 100 *
                    percentageFilled / 100
                break
            }
        }

        feesNode.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(feesNode.value, 10)
        feesNode.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(feesNode.value, 10)
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

                    announcementsModuleObject.makeAnnouncements(event)
                    return situation.name  // if the event is triggered, we return the name of the situation that passed
                }
            }
        }
    }

    function updateEnds(tradingEngineOrder) {
        if (tradingEngineOrder.status.value === 'Open') {
            tradingEngineOrder.end.value = tradingEngine.tradingCurrent.tradingEpisode.candle.end.value
        }
    }

    async function updateEndsWithCycle(tradingEngineOrder) {
        tradingEngineOrder.end.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.end.value
    }

    function updateCounters(tradingEngineOrder) {
        if (tradingEngineOrder.status.value === 'Open') {
            tradingEngineOrder.orderCounters.periods.value++
        }
    }

    function updateStatistics(tradingEngineOrder) {
        tradingEngineOrder.orderStatistics.days.value = tradingEngineOrder.orderCounters.periods.value * sessionParameters.timeFrame.config.value / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
        tradingEngineOrder.orderStatistics.days.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderStatistics.days.value, 10)
    }

    function resetTradingEngineDataStructure(tradingEngineOrder, tradingSystemOrder, stageStatus) {
        if (tradingEngineOrder.status.value === 'Closed') {
            /* We reset the order data structure inside the Trading Engine to its initial value */
            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(tradingEngineOrder)
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

        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS LF Trading Bot Error - ' + message,
            placeholder: {}
        }

        tradingSystem.addError([node.id, message, docs])

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> " + message);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.name = " + node.name);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.type = " + node.type);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.config = " + JSON.stringify(node.config));
        if (err !== undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> err.stack = " + err.stack);
        }
        /*
        Now we are going to abort this execution and jump to the latest error handler
        signaling that we already recorded the error to avoid duplicates.
        */
        throw 'Error Already Recorded'
    }
}
