exports.newPortfolioManagementBotModulesPortfolioOrders = function (processIndex) {
    /*
    The Portfolio Orders modules manages the execution of orders against the exchanges.
    */
    const MODULE_NAME = 'Portfolio Orders'

    let thisObject = {
        mantain: mantain,
        reset: reset,
        checkOrders: checkOrders,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioEngine
    let portfolioSystem
    let sessionParameters

    let exchangeAPIModuleObject = TS.projects.portfolioManagement.botModules.exchangeAPI.newPortfolioManagementBotModulesExchangeAPI(processIndex)
    let announcementsModuleObject = TS.projects.socialBots.botModules.announcements.newSocialBotsBotModulesAnnouncements(processIndex)

    return thisObject

    function initialize() {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters

        exchangeAPIModuleObject.initialize()
        announcementsModuleObject.initialize()
    }

    function finalize() {
        portfolioSystem = undefined
        portfolioEngine = undefined
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

        if (portfolioEngine.portfolioCurrent.strategy.index.value === portfolioEngine.portfolioCurrent.strategy.index.config.initialValue) { return }

        let stageNode
        let executionNode

        stageNode = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].openStage

        if (stageNode !== undefined) { // The Open Stage is optional. It might be undefined.
            executionNode = stageNode.openExecution
            processExecutionNode(executionNode, portfolioEngine.portfolioCurrent.strategyOpenStage.status.value)
        }

        stageNode = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].closeStage
        if (stageNode !== undefined) { // The Close Stage is optional. It might be undefined.
            executionNode = stageNode.closeExecution
            processExecutionNode(executionNode, portfolioEngine.portfolioCurrent.strategyCloseStage.status.value)
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
                    let portfolioSystemOrder = orders[i]
                    if (portfolioSystemOrder.referenceParent === undefined) {
                        badDefinitionUnhandledException(undefined, 'Order Reference Missing', portfolioSystemOrder)
                    }
                    let portfolioEngineOrder = TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.getNodeById(portfolioSystemOrder.referenceParent.id)

                    if (portfolioEngineOrder.status === undefined) {
                        badDefinitionUnhandledException(undefined, 'Status Node Missing', portfolioEngineOrder)
                    }

                    if (mantain === true) {
                        updateCounters(portfolioEngineOrder)
                        updateEnds(portfolioEngineOrder)
                        updateStatistics(portfolioEngineOrder)
                    }
                    if (reset === true) {
                        resetPortfolioEngineDataStructure(portfolioEngineOrder, portfolioSystemOrder, stageStatus)
                    }
                }
            }
        }
    }

    async function checkOrders(portfolioEngineStage, orders, executionAlgorithm, executionNode) {
        for (let i = 0; i < orders.length; i++) {

            let portfolioSystemOrder = orders[i]
            portfolioSystemValidations(portfolioSystemOrder)
            let portfolioEngineOrder = TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.getNodeById(portfolioSystemOrder.referenceParent.id)
            portfolioEngineValidations(portfolioEngineOrder)

            switch (portfolioEngineOrder.status.value) {
                case 'Not Open': {
                    {
                        /* During the First cycle we can not create new orders. That is reserved for the Second cycle. */
                        if (portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.value === 'First') { continue }
                        /* When the stage is closing we can not create new orders */
                        if (portfolioEngineStage.status.value === 'Closing') { continue }
                        /* 
                        Check if we can create an order based on the config value for spawnMultipleOrders.
                        Portfolio System Orders that cannot spawn more than one Portfolio Engine Order needs to check if
                        at the Portfolio Engine Order the lock is Open or Closed. 
                        */
                        if (portfolioSystemOrder.config.spawnMultipleOrders !== true) {
                            if (portfolioEngineOrder.lock.value === 'Closed') {

                                let message = "Order Skipped"
                                let docs = {
                                    project: 'Foundations',
                                    category: 'Topic',
                                    type: 'TS LF Portfolio Bot Info - ' + message,
                                    placeholder: {}
                                }

                                portfolioSystem.addInfo([portfolioSystemOrder.id, message, docs])
                                continue
                            }
                        }
                        /* Check if we need to Create this Order */
                        let situationName = await checkOrderEvent(portfolioSystemOrder.createOrderEvent, portfolioSystemOrder, executionAlgorithm, executionNode)
                        if (situationName !== undefined) {

                            /* Open a new order */
                            await tryToOpenOrder(portfolioEngineStage, executionAlgorithm, portfolioSystemOrder, portfolioEngineOrder, situationName)
                        }
                    }
                    break
                }
                case 'Open': {
                    /* During the Second cycle we can not cancel orders. That is reserved for the First cycle. */
                    if (portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.value === 'Second') { continue }

                    /* Simulate Events that happens at the Exchange, if needed. */
                    simulateCheckExchangeEvents(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder)

                    /* Check Events that happens at the Exchange, if needed. */
                    let allGood = await checkExchangeEvents(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder)

                    if (allGood !== true) {
                        /*
                        For some reason we could not check the order at the exchange, so we will not even check if we 
                        need to cancel it, since we could end up with inconsistent information at the accounting level.
                        */
                        if (portfolioSystemOrder.cancelOrderEvent !== undefined) {

                            const message = 'Skipping Cancel Order Event'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Warning - ' + message,
                                placeholder: {}
                            }

                            portfolioSystem.addWarning(
                                [
                                    portfolioSystemOrder.cancelOrderEvent.id,
                                    message,
                                    docs
                                ]
                            )
                        }
                        return
                    }

                    /* Check if we need to cancel the order */
                    await checkCancelOrderEvent(portfolioEngineStage, executionAlgorithm, executionNode, portfolioEngineOrder, portfolioSystemOrder)
                    /*
                    If by this time the order is closed, we need to clone it and get the close 
                    to the Last node at the Portfolio Engine data structure.
                    */
                    if (portfolioEngineOrder.status.value === 'Closed') {
                        switch (portfolioEngineOrder.type) {
                            case 'Market Order': {
                                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.cloneValues(portfolioEngineOrder, portfolioEngine.portfolioLast.marketOrders)
                                break
                            }
                            case 'Limit Order': {
                                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.cloneValues(portfolioEngineOrder, portfolioEngine.portfolioLast.limitOrders)
                                break
                            }
                        }
                    }
                }
            }
        }
    }

    async function checkCancelOrderEvent(portfolioEngineStage, executionAlgorithm, executionNode, portfolioEngineOrder, portfolioSystemOrder) {
        /* 
        In the previous steps, we might have discovered that the order was cancelled 
        at the exchange, or filled, so  the order might still not be Open. 
        If the stage is closing or the order is not Open, we wont be cancelling orders 
        based on defined events. 
        */
        if (portfolioEngineStage.status.value !== 'Closing' && portfolioEngineOrder.status.value === 'Open') {

            /* Check if we need to Cancel this Order */
            let situationName = await checkOrderEvent(portfolioSystemOrder.cancelOrderEvent, portfolioSystemOrder, executionAlgorithm, executionNode)
            if (situationName !== undefined) {

                /* Simulate Order Cancelation, if needed. */
                simulateCancelOrder(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, 'Cancel Event')

                /* Cancel the order at the Exchange, if needed. */
                await exchangeCancelOrder(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, 'Cancel Event')

                await updateEndsWithCycle(portfolioEngineOrder)
            }
        }
    }

    function portfolioSystemValidations(portfolioSystemOrder) {
        /* Portfolio System Validations */
        if (portfolioSystemOrder.config.percentageOfAlgorithmSize === undefined) { badDefinitionUnhandledException(undefined, 'Percentage Of Algorithm Size Property Missing', portfolioSystemOrder) }
        if (portfolioSystemOrder.referenceParent === undefined) { badDefinitionUnhandledException(undefined, 'Order Reference Missing', portfolioSystemOrder) }
    }

    function portfolioEngineValidations(portfolioEngineOrder) {
        /* Portfolio Engine Order Validations */
        if (portfolioEngineOrder.serialNumber === undefined) { badDefinitionUnhandledException(undefined, 'Serial Number Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.identifier === undefined) { badDefinitionUnhandledException(undefined, 'Identifier Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.exchangeId === undefined) { badDefinitionUnhandledException(undefined, 'Exchange Id Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.begin === undefined) { badDefinitionUnhandledException(undefined, 'Begin Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.end === undefined) { badDefinitionUnhandledException(undefined, 'End Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.rate === undefined) { badDefinitionUnhandledException(undefined, 'Rate Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.status === undefined) { badDefinitionUnhandledException(undefined, 'Status Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.algorithmName === undefined) { badDefinitionUnhandledException(undefined, 'Algorithm Name Node Missing', portfolioEngineOrder) }

        if (portfolioEngineOrder.orderCounters === undefined) { badDefinitionUnhandledException(undefined, 'Order Counters Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.orderCounters.periods === undefined) { badDefinitionUnhandledException(undefined, 'Periods Node Missing', portfolioEngineOrder.orderCounters) }

        if (portfolioEngineOrder.orderStatistics === undefined) { badDefinitionUnhandledException(undefined, 'Order Statistics Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.orderStatistics.days === undefined) { badDefinitionUnhandledException(undefined, 'Days Node Missing', portfolioEngineOrder.orderStatistics) }
        if (portfolioEngineOrder.orderStatistics.percentageFilled === undefined) { badDefinitionUnhandledException(undefined, 'Percentage Filled Node Missing', portfolioEngineOrder.orderStatistics) }
        if (portfolioEngineOrder.orderStatistics.actualRate === undefined) { badDefinitionUnhandledException(undefined, 'Actual Rate Node Missing', portfolioEngineOrder.orderStatistics) }

        if (portfolioEngineOrder.orderBaseAsset === undefined) { badDefinitionUnhandledException(undefined, 'Order Base Asset Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.orderBaseAsset.size === undefined) { badDefinitionUnhandledException(undefined, 'Size Node Missing', portfolioEngineOrder.orderBaseAsset) }
        if (portfolioEngineOrder.orderBaseAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'Size Filled Node Missing', portfolioEngineOrder.orderBaseAsset) }
        if (portfolioEngineOrder.orderBaseAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees Paid Node Missing', portfolioEngineOrder.orderBaseAsset) }
        if (portfolioEngineOrder.orderBaseAsset.actualSize === undefined) { badDefinitionUnhandledException(undefined, 'Actual Size Node Missing', portfolioEngineOrder.orderBaseAsset) }
        if (portfolioEngineOrder.orderBaseAsset.amountReceived === undefined) { badDefinitionUnhandledException(undefined, 'Amount Received Node Missing', portfolioEngineOrder.orderBaseAsset) }
        if (portfolioEngineOrder.orderBaseAsset.feesToBePaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees To Be Paid Node Missing', portfolioEngineOrder.orderBaseAsset) }

        if (portfolioEngineOrder.orderQuotedAsset === undefined) { badDefinitionUnhandledException(undefined, 'Order Quoted Asset Node Missing', portfolioEngineOrder) }
        if (portfolioEngineOrder.orderQuotedAsset.size === undefined) { badDefinitionUnhandledException(undefined, 'Size Node Missing', portfolioEngineOrder.orderQuotedAsset) }
        if (portfolioEngineOrder.orderQuotedAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'Size Filled Node Missing', portfolioEngineOrder.orderQuotedAsset) }
        if (portfolioEngineOrder.orderQuotedAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees Paid Node Missing', portfolioEngineOrder.orderQuotedAsset) }
        if (portfolioEngineOrder.orderQuotedAsset.actualSize === undefined) { badDefinitionUnhandledException(undefined, 'Actual Size Node Missing', portfolioEngineOrder.orderQuotedAsset) }
        if (portfolioEngineOrder.orderQuotedAsset.amountReceived === undefined) { badDefinitionUnhandledException(undefined, 'Amount Received Node Missing', portfolioEngineOrder.orderQuotedAsset) }
        if (portfolioEngineOrder.orderQuotedAsset.feesToBePaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees To Be Paid Node Missing', portfolioEngineOrder.orderQuotedAsset) }
    }

    async function tryToOpenOrder(portfolioEngineStage, executionAlgorithm, portfolioSystemOrder, portfolioEngineOrder, situationName) {

        await calculateOrderRate()
        await calculateOrderSize()

        /* Check Size: We are not going to create Orders which size is equal or less to zero.  */
        if (portfolioEngineOrder.orderBaseAsset.size.value <= 0) {

            const message = 'Order Size Value Zero Or Negative'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Warning - ' + message,
                placeholder: {}
            }

            portfolioSystem.addWarning(
                [
                    [portfolioEngineOrder.orderBaseAsset.size.id, portfolioSystemOrder.id],
                    message,
                    docs
                ]
            )
            return
        }

        if (portfolioEngineOrder.orderQuotedAsset.size.value <= 0) {

            const message = 'Order Size Value Zero Or Negative'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Warning - ' + message,
                placeholder: {}
            }

            portfolioSystem.addWarning(
                [
                    [portfolioEngineOrder.orderQuotedAsset.size.id, portfolioSystemOrder.id],
                    message,
                    docs
                ]
            )
            return
        }

        /* Place Order at the Exchange, if needed. */
        let result = await createOrderAtExchange(portfolioSystemOrder, portfolioEngineOrder)
        if (result !== true) {

            const message = 'Order Could Not Be Opened'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Warning - ' + message,
                placeholder: {}
            }

            portfolioSystem.addWarning(
                [
                    [portfolioSystemOrder.id, portfolioEngineOrder],
                    message,
                    docs
                ]
            )
            return
        }

        /* Update Stage Placed Size */
        portfolioEngineStage.stageBaseAsset.sizePlaced.value = portfolioEngineStage.stageBaseAsset.sizePlaced.value + portfolioEngineOrder.orderBaseAsset.size.value
        portfolioEngineStage.stageBaseAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageBaseAsset.sizePlaced.value, 10)
        portfolioEngineStage.stageQuotedAsset.sizePlaced.value = portfolioEngineStage.stageQuotedAsset.sizePlaced.value + portfolioEngineOrder.orderQuotedAsset.size.value
        portfolioEngineStage.stageQuotedAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageQuotedAsset.sizePlaced.value, 10)

        /* Updating Episode Counters */
        portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.orders.value++

        /* Initialize this */
        portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.createOrder.value = 1

        /* Create Order Procedure */
        portfolioEngineOrder.status.value = 'Open'
        portfolioEngineOrder.identifier.value = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
        portfolioEngineOrder.begin.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.begin.value
        portfolioEngineOrder.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.end.value
        portfolioEngineOrder.serialNumber.value = portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.orders.value
        portfolioEngineOrder.orderName.value = portfolioSystemOrder.name
        portfolioEngineOrder.algorithmName.value = executionAlgorithm.name
        portfolioEngineOrder.situationName.value = situationName

        async function calculateOrderRate() {

            /* Optional Rate Definition */
            if (portfolioSystemOrder.type === 'Limit Buy Order' || portfolioSystemOrder.type === 'Limit Sell Order') {
                if (portfolioSystemOrder.orderRate === undefined) { badDefinitionUnhandledException(undefined, 'Order Rate Node Missing', portfolioSystemOrder) }
                if (portfolioSystemOrder.orderRate.formula === undefined) { badDefinitionUnhandledException(undefined, 'Formula Node Missing', portfolioSystemOrder) }

                /* Extract the rate value from the user-defined formula */
                portfolioEngineOrder.rate.value = portfolioSystem.formulas.get(portfolioSystemOrder.orderRate.formula.id)

                /* Final rate validations */
                if (portfolioEngineOrder.rate.value === undefined) { badDefinitionUnhandledException(undefined, 'Rate Value Undefined', portfolioEngineOrder.rate) }
                if (isNaN(portfolioEngineOrder.rate.value) === true) { badDefinitionUnhandledException(undefined, 'Rate Value Not A Number', portfolioSystemOrder) }
                if (portfolioEngineOrder.rate.value <= 0) { badDefinitionUnhandledException(undefined, 'Rate Value Zero Or Negative', portfolioSystemOrder) }

                portfolioEngineOrder.rate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.rate.value, 10)
            } else {
                /* 
                For Market Orders, the rate is irrelevant, since it is not sent to the Exchange.
                We store at this field the last know price as a reference.
                */
                portfolioEngineOrder.rate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
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

                algorithmSizeInBaseAsset = portfolioEngineStage.stageBaseAsset.targetSize.value * executionAlgorithm.config.percentageOfStageTargetSize / 100
                algorithmSizeInQuotedAsset = portfolioEngineStage.stageQuotedAsset.targetSize.value * executionAlgorithm.config.percentageOfStageTargetSize / 100

                /* Validate that this config exists */
                if (portfolioSystemOrder.config.percentageOfAlgorithmSize === undefined) {
                    badDefinitionUnhandledException(undefined, 'Percentage Of Algorithm Size Property Missing', portfolioSystemOrder)
                }
                if (isNaN(portfolioSystemOrder.config.percentageOfAlgorithmSize) === true) {
                    badDefinitionUnhandledException(undefined, 'Percentage Of Algorithm Size Property Not A Number', portfolioSystemOrder)
                }
            }

            function notPassingTargetSizeValidation() {
                /*
                The Size calculation depends on how the user defined the size of the position.
                The user could have defined the size of the position in Base Asset or Quoted Asset.
                */
                switch (portfolioEngineStage.stageDefinedIn.value) {
                    case 'Base Asset': {
                        /* Size in Base Asset */
                        portfolioEngineOrder.orderBaseAsset.size.value = algorithmSizeInBaseAsset * portfolioSystemOrder.config.percentageOfAlgorithmSize / 100
                        portfolioEngineOrder.orderBaseAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderBaseAsset.size.value, 10)

                        /* Check that the Size calculated would not surpass Stage Target Size */
                        if (
                            portfolioEngineOrder.orderBaseAsset.size.value + portfolioEngineStage.stageBaseAsset.sizePlaced.value >
                            portfolioEngineStage.stageBaseAsset.targetSize.value
                        ) {
                            let previousValue = portfolioEngineOrder.orderBaseAsset.size.value
                            portfolioEngineOrder.orderBaseAsset.size.value =
                                portfolioEngineStage.stageBaseAsset.targetSize.value -
                                portfolioEngineStage.stageBaseAsset.sizePlaced.value

                            portfolioEngineOrder.orderBaseAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderBaseAsset.size.value, 10)

                            const message = 'Order Size Shrinked'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                previousOrderSize: previousValue,
                                recalculatedOrderSize: portfolioEngineOrder.orderBaseAsset.size.value,
                                sizePlaced: portfolioEngineStage.stageBaseAsset.sizePlaced.value,
                                targetSize: portfolioEngineStage.stageBaseAsset.targetSize.value
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            portfolioSystem.addWarning(
                                [
                                    [portfolioEngineStage.stageBaseAsset.targetSize.id, portfolioEngineOrder.orderBaseAsset.size.id, portfolioEngineStage.stageBaseAsset.sizePlaced.id],
                                    message,
                                    docs
                                ]
                            )
                        }

                        /* Size in Quoted Asset */
                        portfolioEngineOrder.orderQuotedAsset.size.value = portfolioEngineOrder.orderBaseAsset.size.value * portfolioEngineOrder.rate.value
                        portfolioEngineOrder.orderQuotedAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderQuotedAsset.size.value, 10)
                        break
                    }
                    case 'Quoted Asset': {
                        /* Size in Quoted Asset */
                        portfolioEngineOrder.orderQuotedAsset.size.value = algorithmSizeInQuotedAsset * portfolioSystemOrder.config.percentageOfAlgorithmSize / 100
                        portfolioEngineOrder.orderQuotedAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderQuotedAsset.size.value, 10)

                        /* Check that the Size calculated would not surpass Stage Target Size */
                        if (
                            portfolioEngineOrder.orderQuotedAsset.size.value + portfolioEngineStage.stageQuotedAsset.sizePlaced.value >
                            portfolioEngineStage.stageQuotedAsset.targetSize.value
                        ) {
                            let previousValue = portfolioEngineOrder.orderQuotedAsset.size.value
                            portfolioEngineOrder.orderQuotedAsset.size.value =
                                portfolioEngineStage.stageQuotedAsset.targetSize.value -
                                portfolioEngineStage.stageQuotedAsset.sizePlaced.value

                            portfolioEngineOrder.orderQuotedAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderQuotedAsset.size.value, 10)

                            const message = 'Order Size Shrinked'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                previousOrderSize: previousValue,
                                recalculatedOrderSize: portfolioEngineOrder.orderQuotedAsset.size.value,
                                sizePlaced: portfolioEngineStage.stageQuotedAsset.sizePlaced.value,
                                targetSize: portfolioEngineStage.stageQuotedAsset.targetSize.value
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            portfolioSystem.addWarning(
                                [
                                    [portfolioEngineStage.stageQuotedAsset.targetSize.id, portfolioEngineOrder.orderQuotedAsset.size.id, portfolioEngineStage.stageQuotedAsset.sizePlaced.id],
                                    message,
                                    docs
                                ]
                            )
                        }

                        /* Size in Base Asset */
                        portfolioEngineOrder.orderBaseAsset.size.value = portfolioEngineOrder.orderQuotedAsset.size.value / portfolioEngineOrder.rate.value
                        portfolioEngineOrder.orderBaseAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderBaseAsset.size.value, 10)
                        break
                    }
                }
            }

            function notNegativeBalanceValidation() {
                /* Check that the Size calculated would not leave a negative balance */
                switch (true) {
                    case portfolioSystemOrder.type === 'Market Buy Order' || portfolioSystemOrder.type === 'Limit Buy Order': {
                        if (
                            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value - portfolioEngineOrder.orderQuotedAsset.size.value < 0
                        ) {
                            const message = 'Possible Negative Balance'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                orderQuotedAssetSize: portfolioEngineOrder.orderQuotedAsset.size.value,
                                episodeQuotedAssetBalance: portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            portfolioSystem.addWarning(
                                [
                                    [portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.id, portfolioEngineOrder.orderQuotedAsset.size.id],
                                    message,
                                    docs
                                ]
                            )

                            portfolioEngineOrder.orderQuotedAsset.size.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value
                            portfolioEngineOrder.orderBaseAsset.size.value = portfolioEngineOrder.orderQuotedAsset.size.value / portfolioEngineOrder.rate.value
                        }
                        break
                    }
                    case portfolioSystemOrder.type === 'Market Sell Order' || portfolioSystemOrder.type === 'Limit Sell Order': {
                        if (
                            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value - portfolioEngineOrder.orderBaseAsset.size.value < 0
                        ) {
                            const message = 'Possible Negative Balance'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                orderBaseAssetSize: portfolioEngineOrder.orderBaseAsset.size.value,
                                episodeBaseAssetBalance: portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            portfolioSystem.addWarning(
                                [
                                    [portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.id, portfolioEngineOrder.orderBaseAsset.size.id],
                                    message,
                                    docs
                                ]
                            )

                            portfolioEngineOrder.orderBaseAsset.size.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value
                            portfolioEngineOrder.orderQuotedAsset.size.value = portfolioEngineOrder.orderBaseAsset.size.value * portfolioEngineOrder.rate.value
                        }
                        break
                    }
                }
            }

            portfolioEngineOrder.orderBaseAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderBaseAsset.size.value, 10)
            portfolioEngineOrder.orderQuotedAsset.size.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderQuotedAsset.size.value, 10)
        }

        async function createOrderAtExchange(portfolioSystemOrder, portfolioEngineOrder) {

            /* Filter by Session Type */
            switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
                case 'Backtesting Session': {
                    return true
                }
                case 'Live Portfolio Session': {
                    break
                }
                case 'Fordward Testing Session': {
                    break
                }
                case 'Paper Portfolio Session': {
                    return true
                }
            }

            let orderId = await exchangeAPIModuleObject.createOrder(portfolioSystemOrder, portfolioEngineOrder)

            if (orderId !== undefined) {
                portfolioEngineOrder.exchangeId.value = orderId
                return true
            }
        }
    }

    async function checkExchangeEvents(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder) {

        /* Filter by Session Type */
        switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
            case 'Backtesting Session': {
                return true
            }
            case 'Live Portfolio Session': {
                break
            }
            case 'Fordward Testing Session': {
                break
            }
            case 'Paper Portfolio Session': {
                return true
            }
        }

        let order = await exchangeAPIModuleObject.getOrder(portfolioSystemOrder, portfolioEngineOrder)

        let message
        let docs

        if (order === undefined) {

            message = 'Order Status Not Sync With Exchange'
            docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Warning - ' + message,
                placeholder: {}
            }

            portfolioSystem.addWarning(
                [
                    [portfolioSystemOrder.id, portfolioEngineOrder.id],
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
            portfolioEngineOrder.status.value = 'Closed'
            portfolioEngineOrder.exitType.value = 'Filled'

            /* Initialize this */
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closeOrder.value = 1

            await updateEndsWithCycle(portfolioEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: portfolioEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            portfolioSystem.addInfo([portfolioSystemOrder.id, message, docs])

            await syncWithExchange(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order)
            return
        }

        if (order.remaining > 0 && order.status === AT_EXCHANGE_STATUS.CLOSED) {
            /* Close this Order */
            portfolioEngineOrder.status.value = 'Closed'
            portfolioEngineOrder.exitType.value = 'Closed at the Exchange'
            /* Initialize this */
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closeOrder.value = 1

            await updateEndsWithCycle(portfolioEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: portfolioEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            portfolioSystem.addInfo([portfolioSystemOrder.id, message, docs])

            await syncWithExchange(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order)
            await recalculateStageSize(portfolioEngineStage, portfolioEngineOrder)
            return
        }

        if (order.status === AT_EXCHANGE_STATUS.CANCELLED) {
            /* Close this Order */
            portfolioEngineOrder.status.value = 'Closed'
            /* 
            We must be carefull here not to overide an already defined exitType. It can happen
            for instance that the order was cancellerd from the but veryfing the cancellation
            was not possible because of a connection to the exchange problem. In that case
            the exit type was defined but the order was kept open until the verification could be done.
            */
            if (portfolioEngineOrder.exitType.value === portfolioEngineOrder.exitType.config.initialValue) {
                portfolioEngineOrder.exitType.value = 'Cancelled at the Exchange'
            }
            /* Initialize this */
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closeOrder.value = 1

            await updateEndsWithCycle(portfolioEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: portfolioEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            portfolioSystem.addInfo([portfolioSystemOrder.id, message, docs])

            await syncWithExchange(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order)
            await recalculateStageSize(portfolioEngineStage, portfolioEngineOrder)
            return
        }

        /*
        If the order happens to be at least partially filled, there is a syncronization work 
        we need to do, that includes discovering which is the Actual Rate the order is being filled,
        the Fees Paid and many other thing we need to account for.
        */
        if (order.filled > 0) {
            await syncWithExchange(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order)
        }

        /* 
        Forced Cancellation Check: Here we check if we need to cancel this order because the
        stage is closing. 
        */
        if (portfolioEngineStage.status.value === 'Closing' && portfolioEngineOrder.status.value !== 'Closed') {
            await exchangeCancelOrder(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, 'Closing Stage')
        }

        return true
    }

    function simulateCheckExchangeEvents(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder) {

        /* Filter by Session Type */
        switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
            case 'Backtesting Session': {
                break
            }
            case 'Live Portfolio Session': {
                return
            }
            case 'Fordward Testing Session': {
                return
            }
            case 'Paper Portfolio Session': {
                break
            }
        }

        simulateSyncWithExchange(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder)

        /* Check if we need to close the order */
        if (portfolioEngineOrder.orderStatistics.percentageFilled.value === 100) {

            /* Close this Order */
            portfolioEngineOrder.status.value = 'Closed'
            portfolioEngineOrder.exitType.value = 'Filled'

            /* Initialize this */
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closeOrder.value = 1

            updateEndsWithCycle(portfolioEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: portfolioEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            portfolioSystem.addInfo([portfolioSystemOrder.id, message, docs])
        }

        /* If the Stage is Closing and this order is still open, we need to cancel it now */
        if (portfolioEngineStage.status.value === 'Closing' && portfolioEngineOrder.status.value !== 'Closed') {
            simulateCancelOrder(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, 'Closing Stage')
        }
    }

    function simulateSyncWithExchange(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder) {

        let previousBaseAssetSizeFilled = portfolioEngineOrder.orderBaseAsset.sizeFilled.value
        let previousQuotedAssetSizeFilled = portfolioEngineOrder.orderQuotedAsset.sizeFilled.value
        let previousBaseAssetFeesPaid = portfolioEngineOrder.orderBaseAsset.feesPaid.value
        let previousQuotedAssetFeesPaid = portfolioEngineOrder.orderQuotedAsset.feesPaid.value

        let ordersSimulationsModuleObject = TS.projects.portfolioManagement.botModules.ordersSimulations.newPortfolioManagementBotModulesOrdersSimulations(processIndex)
        ordersSimulationsModuleObject.initialize()

        ordersSimulationsModuleObject.actualSizeSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.actualRateSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.feesToBePaidSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.percentageFilledSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.feesPaidSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.sizeFilledSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage)
        ordersSimulationsModuleObject.amountReceivedSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage)

        ordersSimulationsModuleObject.finalize()

        doTheAccounting(
            portfolioEngineStage,
            portfolioSystemOrder,
            portfolioEngineOrder,
            previousBaseAssetSizeFilled,
            previousQuotedAssetSizeFilled,
            previousBaseAssetFeesPaid,
            previousQuotedAssetFeesPaid
        )
    }

    async function syncWithExchange(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order) {

        let previousBaseAssetSizeFilled = portfolioEngineOrder.orderBaseAsset.sizeFilled.value
        let previousQuotedAssetSizeFilled = portfolioEngineOrder.orderQuotedAsset.sizeFilled.value
        let previousBaseAssetFeesPaid = portfolioEngineOrder.orderBaseAsset.feesPaid.value
        let previousQuotedAssetFeesPaid = portfolioEngineOrder.orderQuotedAsset.feesPaid.value

        let ordersCalculationsModuleObject = TS.projects.portfolioManagement.botModules.ordersCalculations.newPortfolioManagementBotModulesOrdersCalculations(processIndex)
        ordersCalculationsModuleObject.initialize()

        await ordersCalculationsModuleObject.actualSizeCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.actualRateCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.feesToBePaidCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.percentageFilledCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.feesPaidCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.sizeFilledCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage)
        await ordersCalculationsModuleObject.amountReceivedCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage)

        ordersCalculationsModuleObject.finalize()

        await doTheAccounting(
            portfolioEngineStage,
            portfolioSystemOrder,
            portfolioEngineOrder,
            previousBaseAssetSizeFilled,
            previousQuotedAssetSizeFilled,
            previousBaseAssetFeesPaid,
            previousQuotedAssetFeesPaid
        )
    }

    async function doTheAccounting(
        portfolioEngineStage,
        portfolioSystemOrder,
        portfolioEngineOrder,
        previousBaseAssetSizeFilled,
        previousQuotedAssetSizeFilled,
        previousBaseAssetFeesPaid,
        previousQuotedAssetFeesPaid
    ) {

        await updateStageAssets()
        await updateBalances()

        async function updateStageAssets() {
            /* Stage Base Asset: Undo the previous accounting */
            portfolioEngineStage.stageBaseAsset.sizeFilled.value =
                portfolioEngineStage.stageBaseAsset.sizeFilled.value -
                previousBaseAssetSizeFilled

            portfolioEngineStage.stageBaseAsset.feesPaid.value =
                portfolioEngineStage.stageBaseAsset.feesPaid.value -
                previousBaseAssetFeesPaid

            /* Stage Base Asset: Account the current filling and fees */
            portfolioEngineStage.stageBaseAsset.sizeFilled.value =
                portfolioEngineStage.stageBaseAsset.sizeFilled.value +
                portfolioEngineOrder.orderBaseAsset.sizeFilled.value

            portfolioEngineStage.stageBaseAsset.feesPaid.value =
                portfolioEngineStage.stageBaseAsset.feesPaid.value +
                portfolioEngineOrder.orderBaseAsset.feesPaid.value

            /* Stage Quote Asset: Undo the previous accounting */
            portfolioEngineStage.stageQuotedAsset.sizeFilled.value =
                portfolioEngineStage.stageQuotedAsset.sizeFilled.value -
                previousQuotedAssetSizeFilled

            portfolioEngineStage.stageQuotedAsset.feesPaid.value =
                portfolioEngineStage.stageQuotedAsset.feesPaid.value -
                previousQuotedAssetFeesPaid

            /* Stage Quote Asset: Account the current filling and fees */
            portfolioEngineStage.stageQuotedAsset.sizeFilled.value =
                portfolioEngineStage.stageQuotedAsset.sizeFilled.value +
                portfolioEngineOrder.orderQuotedAsset.sizeFilled.value

            portfolioEngineStage.stageQuotedAsset.feesPaid.value =
                portfolioEngineStage.stageQuotedAsset.feesPaid.value +
                portfolioEngineOrder.orderQuotedAsset.feesPaid.value

            portfolioEngineStage.stageBaseAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageBaseAsset.sizeFilled.value, 10)
            portfolioEngineStage.stageBaseAsset.feesPaid.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageBaseAsset.feesPaid.value, 10)

            portfolioEngineStage.stageQuotedAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageQuotedAsset.sizeFilled.value, 10)
            portfolioEngineStage.stageQuotedAsset.feesPaid.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageQuotedAsset.feesPaid.value, 10)
        }

        async function updateBalances() {
            /* Balances Update */
            switch (true) {
                /*
                For Sell orders, the fees are being paid in Quote Asset. 
                */
                case portfolioSystemOrder.type === 'Market Sell Order' || portfolioSystemOrder.type === 'Limit Sell Order': {

                    /* Balance Base Asset: Undo the previous accounting */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value =
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value +
                        previousBaseAssetSizeFilled

                    /* Balance Base Asset: Account the current filling and fees */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value =
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value -
                        portfolioEngineOrder.orderBaseAsset.sizeFilled.value

                    /* Balance Quoted Asset: Undo the previous accounting */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value =
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value -
                        previousQuotedAssetSizeFilled +
                        previousQuotedAssetFeesPaid

                    /* Balance Quoted Asset: Account the current filling and fees */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value =
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value +
                        portfolioEngineOrder.orderQuotedAsset.sizeFilled.value -
                        portfolioEngineOrder.orderQuotedAsset.feesPaid.value
                    break
                }
                /*
                Let's remember that for Buy orders, the fees are paid in Base Asset.
                */
                case portfolioSystemOrder.type === 'Market Buy Order' || portfolioSystemOrder.type === 'Limit Buy Order': {

                    /* Balance Base Asset: Undo the previous accounting */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value =
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value -
                        previousBaseAssetSizeFilled +
                        previousBaseAssetFeesPaid

                    /* Balance Base Asset: Account the current filling and fees */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value =
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value +
                        portfolioEngineOrder.orderBaseAsset.sizeFilled.value -
                        portfolioEngineOrder.orderBaseAsset.feesPaid.value

                    /* Balance Quoted Asset: Undo the previous accounting */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value =
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value +
                        previousQuotedAssetSizeFilled

                    /* Balance Quoted Asset: Account the current filling and fees */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value =
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value -
                        portfolioEngineOrder.orderQuotedAsset.sizeFilled.value
                    break
                }
            }
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value, 10)
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value, 10)
        }
    }

    function simulateCancelOrder(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, exitType) {

        /* Filter by Session Type */
        switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
            case 'Backtesting Session': {
                break
            }
            case 'Live Portfolio Session': {
                return
            }
            case 'Fordward Testing Session': {
                return
            }
            case 'Paper Portfolio Session': {
                break
            }
        }

        /* Close this Order */
        portfolioEngineOrder.status.value = 'Closed'
        portfolioEngineOrder.exitType.value = exitType

        /* Initialize this */
        portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closeOrder.value = 1

        updateEndsWithCycle(portfolioEngineOrder)

        let message = "Order Closed"
        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS LF Portfolio Bot Info - ' + message,
            placeholder: {}
        }
        contextInfo = {
            exitType: portfolioEngineOrder.exitType.value
        }
        TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

        portfolioSystem.addInfo([portfolioSystemOrder.id, message, docs])

        recalculateStageSize(portfolioEngineStage, portfolioEngineOrder)
    }

    async function exchangeCancelOrder(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, exitType) {

        /* Filter by Session Type */
        switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
            case 'Backtesting Session': {
                return
            }
            case 'Live Portfolio Session': {
                break
            }
            case 'Fordward Testing Session': {
                break
            }
            case 'Paper Portfolio Session': {
                return
            }
        }

        /* Check if we can cancel the order at the Exchange. */
        let result = await exchangeAPIModuleObject.cancelOrder(portfolioSystemOrder, portfolioEngineOrder)
        if (result === true) {

            /* At this point we know which is the exit type for this order */
            portfolioEngineOrder.exitType.value = exitType

            /* 
            Perhaps the order was filled a bit more between the last time we checked and when it was cancelled.
            To sync our accounting, we need to check the order one last time and if it changed, fix it.
            */

            let order = await exchangeAPIModuleObject.getOrder(portfolioSystemOrder, portfolioEngineOrder)

            if (order === undefined) {

                const message = 'Order Status Not Sync With Exchange'
                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Portfolio Bot Warning - ' + message,
                    placeholder: {}
                }

                portfolioSystem.addWarning(
                    [
                        [portfolioSystemOrder.id, portfolioEngineOrder.id],
                        message,
                        docs
                    ]
                )
                return false
            }
            if (order.status === 'NotFound') {
                /*
                Some exchanges, like Coinbase Pro, deletes orders after being cancelled, and when we request information
                about them, it returns null. We will interprate this as ORDER NOT FOUND.
                */
                const message = 'Order Not Found at the Exchange'
                let docs = {
                    project: 'Superalgos',
                    category: 'Topic',
                    type: 'TS LF Portfolio Bot Warning - ' + message,
                    placeholder: {}
                }

                portfolioSystem.addWarning(
                    [
                        [portfolioSystemOrder.id, portfolioEngineOrder.id],
                        message,
                        docs
                    ]
                )
                /*
                We must be carefull here not to overide an already defined exitType. It can happen
                for instance that the order was cancellerd from the but veryfing the cancellation
                was not possible because of a connection to the exchange problem. In that case
                the exit type was defined but the order was kept open until the verification could be done.
                */
                if (portfolioEngineOrder.exitType.value === portfolioEngineOrder.exitType.config.initialValue) {
                    portfolioEngineOrder.exitType.value = 'Not Found at the Exchange'
                }
            }

            /* 
            Close this Order. Note that we are not closing the order until we have the exchange 
            response with the order details that we can use to synchronize with our accoounting.
            Otherwise if the connection to the exchange fails, we would have a closed order not 
            accounted in any way. 
            */
            portfolioEngineOrder.status.value = 'Closed'

            /* Initialize this */
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closeOrder.value = 1

            await updateEndsWithCycle(portfolioEngineOrder)

            let message = "Order Closed"
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Info - ' + message,
                placeholder: {}
            }
            contextInfo = {
                exitType: portfolioEngineOrder.exitType.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            portfolioSystem.addInfo([portfolioSystemOrder.id, message, docs])

            await syncWithExchange(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order)

            await recalculateStageSize(portfolioEngineStage, portfolioEngineOrder)
        }
    }

    async function recalculateStageSize(portfolioEngineStage, portfolioEngineOrder) {
        /* 
        Since the order is Cancelled, we need to adjust the stage sizePlaced. Remember that the Stage 
        Size Placed accumulates for each asset, the order size placed at the exchange. A cancelation means that 
        only the part filled can be considered placed, so we need to substract from the stage size 
        the remainder. To achieve this with the information we currently have, we are going first 
        to unaccount the order actual size, and the account only the sizeFilled + the feesPaid.
        */
        portfolioEngineStage.stageBaseAsset.sizePlaced.value =
            portfolioEngineStage.stageBaseAsset.sizePlaced.value -
            portfolioEngineOrder.orderBaseAsset.actualSize.value

        portfolioEngineStage.stageQuotedAsset.sizePlaced.value =
            portfolioEngineStage.stageQuotedAsset.sizePlaced.value -
            portfolioEngineOrder.orderQuotedAsset.actualSize.value

        portfolioEngineStage.stageBaseAsset.sizePlaced.value =
            portfolioEngineStage.stageBaseAsset.sizePlaced.value +
            portfolioEngineOrder.orderBaseAsset.sizeFilled.value

        portfolioEngineStage.stageQuotedAsset.sizePlaced.value =
            portfolioEngineStage.stageQuotedAsset.sizePlaced.value +
            portfolioEngineOrder.orderQuotedAsset.sizeFilled.value

        portfolioEngineStage.stageBaseAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageBaseAsset.sizePlaced.value, 10)
        portfolioEngineStage.stageQuotedAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageQuotedAsset.sizePlaced.value, 10)
    }

    async function applyFeePercentage(feesNodePropertyName, portfolioEngineOrder, portfolioSystemOrder, feePercentage, percentageFilled) {
        /* 
        The exchange fees are taken from the Base Asset or the Quoted Asset depending if we 
        are buying or selling.
        */
        let feesNode

        switch (true) {
            case portfolioSystemOrder.type === 'Market Buy Order' || portfolioSystemOrder.type === 'Limit Buy Order': {
                /*
                In this case the fees are taken from the Base Asset you receive as a result of the trade at the exchange.
                */
                feesNode = portfolioEngineOrder.orderBaseAsset[feesNodePropertyName]
                feesNode.value =
                    portfolioEngineOrder.orderBaseAsset.actualSize.value *
                    feePercentage / 100 *
                    percentageFilled / 100
                break
            }
            case portfolioSystemOrder.type === 'Market Sell Order' || portfolioSystemOrder.type === 'Limit Sell Order': {
                /*
                In this case the fees are taken from the Quoted Asset you receive as a result of the trade at the exchange.
                */
                feesNode = portfolioEngineOrder.orderQuotedAsset[feesNodePropertyName]
                feesNode.value =
                    portfolioEngineOrder.orderQuotedAsset.actualSize.value *
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

                passed = portfolioSystem.checkConditions(situation, passed)

                portfolioSystem.values.push([situation.id, passed])
                if (passed) {
                    portfolioSystem.highlights.push(situation.id)
                    portfolioSystem.highlights.push(event.id)
                    portfolioSystem.highlights.push(order.id)
                    portfolioSystem.highlights.push(executionAlgorithm.id)
                    portfolioSystem.highlights.push(executionNode.id)

                    announcementsModuleObject.makeAnnouncements(event)
                    return situation.name  // if the event is triggered, we return the name of the situation that passed
                }
            }
        }
    }

    function updateEnds(portfolioEngineOrder) {
        if (portfolioEngineOrder.status.value === 'Open') {
            portfolioEngineOrder.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value
        }
    }

    async function updateEndsWithCycle(portfolioEngineOrder) {
        portfolioEngineOrder.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.end.value
    }

    function updateCounters(portfolioEngineOrder) {
        if (portfolioEngineOrder.status.value === 'Open') {
            portfolioEngineOrder.orderCounters.periods.value++
        }
    }

    function updateStatistics(portfolioEngineOrder) {
        portfolioEngineOrder.orderStatistics.days.value = portfolioEngineOrder.orderCounters.periods.value * sessionParameters.timeFrame.config.value / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
        portfolioEngineOrder.orderStatistics.days.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderStatistics.days.value, 10)
    }

    function resetPortfolioEngineDataStructure(portfolioEngineOrder, portfolioSystemOrder, stageStatus) {
        if (portfolioEngineOrder.status.value === 'Closed') {
            /* We reset the order data structure inside the Portfolio Engine to its initial value */
            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.initializeNode(portfolioEngineOrder)
            if (portfolioSystemOrder.config.spawnMultipleOrders !== true) {
                /* 
                We close the lock so as to prevent this data structure to be used again during this same stage execution.
                 */
                if (stageStatus === 'Open') {
                    portfolioEngineOrder.lock.value = 'Closed'
                }
            }
        }
    }

    function badDefinitionUnhandledException(err, message, node) {

        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS LF Portfolio Bot Error - ' + message,
            placeholder: {}
        }

        portfolioSystem.addError([node.id, message, docs])

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
