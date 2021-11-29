exports.newPortfolioManagementBotModulesOrdersSimulations = function (processIndex) {
    /*
    When we are backtesting or paper portfolio, we need to simulate what would have happened at the exchange.
    */

    let thisObject = {
        actualSizeSimulation: actualSizeSimulation,
        actualRateSimulation: actualRateSimulation,
        feesToBePaidSimulation: feesToBePaidSimulation,
        amountReceivedSimulation: amountReceivedSimulation,
        percentageFilledSimulation: percentageFilledSimulation,
        feesPaidSimulation: feesPaidSimulation,
        sizeFilledSimulation: sizeFilledSimulation,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioEngine
    let portfolioSystem
    let sessionParameters

    return thisObject

    function initialize() {
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
    }

    function finalize() {
        sessionParameters = undefined
        portfolioEngine = undefined
        portfolioSystem = undefined
    }

    async function actualSizeSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage) {
        /* 
        The Actual Size is the size the exchange accepts for the order, 
        regarless of the size sent in the request to the exchange.

        While backtesting and paper portfolio, we do not really need to 
        simulate an Actual Size. We will just copy to that field the
        size of the order.

        This calculation needs to happen only once, so as to set these values.
        */
        if (portfolioEngineOrder.orderBaseAsset.actualSize.value !== portfolioEngineOrder.orderBaseAsset.actualSize.config.initialValue) { return }

        portfolioEngineOrder.orderBaseAsset.actualSize.value = portfolioEngineOrder.orderBaseAsset.size.value
        portfolioEngineOrder.orderQuotedAsset.actualSize.value = portfolioEngineOrder.orderQuotedAsset.size.value
    }

    function actualRateSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage) {
        /* Actual Rate Simulation */
        let previousQuotedAssetActualSize = portfolioEngineOrder.orderQuotedAsset.actualSize.value

        if (portfolioEngineOrder.orderStatistics.actualRate.value === portfolioEngineOrder.orderStatistics.actualRate.config.initialValue) {
            /* 
            The default value for the Actual Rate is the rate of the order.
            */
            portfolioEngineOrder.orderStatistics.actualRate.value = portfolioEngineOrder.rate.value
        }

        basedOnSessionParameters()
        basedOnPortfolioSystem()
        considerBestMatchWithOrderBook()
        recalculateActualSize()
        recalculateSizePlaced()

        function basedOnSessionParameters() {
            /*
            The default way to calculate the Actual Rate is to apply the Slippage defined
            at the Session Parameters Definition. We are not going to apply the default if there
            is a definition for this order on how to calculate the actual rate.
            */
            if (portfolioSystemOrder.simulatedExchangeEvents !== undefined) {
                if (portfolioSystemOrder.simulatedExchangeEvents.simulatedActualRate !== undefined) {
                    return
                }
            }
            switch (portfolioEngineOrder.type) {
                case 'Market Order': {

                    /* Actual Rate is simulated based on the Session Paremeters */
                    let slippageAmount = portfolioEngineOrder.rate.value * sessionParameters.slippage.config.marketOrderRate / 100
                    if (slippageAmount !== 0) {
                        switch (portfolioSystemOrder.type) {
                            case 'Market Sell Order': {
                                portfolioEngineOrder.orderStatistics.actualRate.value = portfolioEngineOrder.rate.value - slippageAmount
                                portfolioEngineOrder.orderStatistics.actualRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderStatistics.actualRate.value, 10)

                                const message = 'Simulating - Slippage Subtracted'
                                let docs = {
                                    project: 'Foundations',
                                    category: 'Topic',
                                    type: 'TS LF Portfolio Bot Warning - ' + message,
                                    placeholder: {}
                                }
                                contextInfo = {
                                    slippageAmount: slippageAmount,
                                    orderRate: portfolioEngineOrder.rate.value,
                                    actualRate: portfolioEngineOrder.orderStatistics.actualRate.value
                                }
                                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                                portfolioSystem.addWarning(
                                    [
                                        [sessionParameters.slippage.id, portfolioEngineOrder.rate.id, portfolioEngineOrder.orderStatistics.actualRate.id],
                                        message,
                                        docs
                                    ]
                                )
                                break
                            }
                            case 'Market Buy Order': {
                                portfolioEngineOrder.orderStatistics.actualRate.value = portfolioEngineOrder.rate.value + slippageAmount
                                portfolioEngineOrder.orderStatistics.actualRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderStatistics.actualRate.value, 10)

                                const message = 'Simulating - Slippage Added'
                                let docs = {
                                    project: 'Foundations',
                                    category: 'Topic',
                                    type: 'TS LF Portfolio Bot Warning - ' + message,
                                    placeholder: {}
                                }
                                contextInfo = {
                                    slippageAmount: slippageAmount,
                                    orderRate: portfolioEngineOrder.rate.value,
                                    actualRate: portfolioEngineOrder.orderStatistics.actualRate.value
                                }
                                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                                portfolioSystem.addWarning(
                                    [
                                        [sessionParameters.slippage.id, portfolioEngineOrder.rate.id, portfolioEngineOrder.orderStatistics.actualRate.id],
                                        message,
                                        docs
                                    ]
                                )
                                break
                            }
                        }
                    }
                    break
                }
                case 'Limit Order': {
                    /* In Limit Orders the actual rate is the rate of the order, there is no slippage */
                    portfolioEngineOrder.orderStatistics.actualRate.value = portfolioEngineOrder.rate.value
                    break
                }
            }
        }

        function basedOnPortfolioSystem() {
            /*
            If the user specified a Formula to simulate the Actual Rate for this order,
            we use that formula here. Note that if this Formula exists, this will override
            the calculation based on Slippage.
            */
            if (portfolioSystemOrder.simulatedExchangeEvents !== undefined) {
                if (portfolioSystemOrder.simulatedExchangeEvents.simulatedActualRate !== undefined) {
                    if (portfolioSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula !== undefined) {
                        /* Calculate this only once for this order */
                        if (portfolioEngineOrder.orderStatistics.actualRate.value === portfolioEngineOrder.orderStatistics.actualRate.config.initialValue) {
                            let newValue = portfolioSystem.formulas.get(portfolioSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula.id)
                            newValue = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(newValue, 10)

                            const message = 'Simulating - Actual Rate Based On Formula'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                previousActualRate: portfolioEngineOrder.orderStatistics.actualRate.value,
                                recalculatedActualRate: newValue
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)
                            
                            portfolioSystem.addWarning(
                                [
                                    portfolioSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula.id,
                                    message,
                                    docs
                                ]
                            )
                            portfolioEngineOrder.orderStatistics.actualRate.value = newValue
                        }
                    }
                }
            }
        }

        function considerBestMatchWithOrderBook() {
            /*
            Until here we have got the Actual Rate based on the formula definition or based on session parameters slippage.
            The last check is about watching what happened in the market. Let's remember that the exchange will
            fill the order with the best possible matches at it's order book. That means that if the rate
            we set for the order was too low (for a sale order) or too hight (for a buy order), the actual rate 
            should be better than expected. 

            We don't know what it is at the order book, but whe know that the last candle includes trades that bounced between
            the min an max of the candle. That could tell us the above the max and below the min, the order would be matched
            with orders at the order book. For that reason, we do this:
            */
            switch (true) {
                case portfolioSystemOrder.type === 'Market Buy Order' || portfolioSystemOrder.type === 'Limit Buy Order': {
                    if (portfolioEngineOrder.orderStatistics.actualRate.value > portfolioEngine.portfolioCurrent.portfolioEpisode.candle.max.value) {
                        
                        const message = 'Simulating - Actual Rate Too Hight'
                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Portfolio Bot Warning - ' + message,
                            placeholder: {}
                        }
                        contextInfo = {
                            previousActualRate: portfolioEngineOrder.orderStatistics.actualRate.value,
                            recalculatedActualRate: portfolioEngine.portfolioCurrent.portfolioEpisode.candle.max.value
                        }
                        TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                        portfolioSystem.addWarning(
                            [
                                [portfolioEngineOrder.orderStatistics.actualRate.id, portfolioEngine.portfolioCurrent.portfolioEpisode.candle.max.id],
                                message,
                                docs
                            ]
                        )
                        portfolioEngineOrder.orderStatistics.actualRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.max.value
                    }
                    break
                }
                case portfolioSystemOrder.type === 'Market Sell Order' || portfolioSystemOrder.type === 'Limit Sell Order': {
                    if (portfolioEngineOrder.orderStatistics.actualRate.value < portfolioEngine.portfolioCurrent.portfolioEpisode.candle.min.value) {

                        const message = 'Simulating - Actual Rate Too Low'
                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Portfolio Bot Warning - ' + message,
                            placeholder: {}
                        }
                        contextInfo = {
                            previousActualRate: portfolioEngineOrder.orderStatistics.actualRate.value,
                            recalculatedActualRate: portfolioEngine.portfolioCurrent.portfolioEpisode.candle.max.value
                        }
                        TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                        portfolioSystem.addWarning(
                            [
                                [portfolioEngineOrder.orderStatistics.actualRate.id, portfolioEngine.portfolioCurrent.portfolioEpisode.candle.min.id],
                                message,
                                docs
                            ]
                        )
                        portfolioEngineOrder.orderStatistics.actualRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.min.value
                    }
                    break
                }
            }
            portfolioEngineOrder.orderStatistics.actualRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderStatistics.actualRate.value, 10)
        }

        function recalculateActualSize() {
            if (portfolioEngineOrder.orderStatistics.actualRate.value === portfolioEngineOrder.rate.value) { return }
            /*
            Now that we have an Actual Rate, we need to adjust the Actual Size in Quoted Asset, since 
            Base Asset is what the exchange accepts as input and give information at. Quotes Asset properties are always calculated.
            */
            portfolioEngineOrder.orderQuotedAsset.actualSize.value =
                portfolioEngineOrder.orderBaseAsset.actualSize.value *
                portfolioEngineOrder.orderStatistics.actualRate.value

            portfolioEngineOrder.orderQuotedAsset.actualSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderQuotedAsset.actualSize.value, 10)

            const message = 'Simulating - Actual Size Recalculated'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Warning - ' + message,
                placeholder: {}
            }
            contextInfo = {
                previousQuotedAssetActualSize: previousQuotedAssetActualSize,
                recalculatedQuotedAssetActualSize: portfolioEngineOrder.orderQuotedAsset.actualSize.value,
                actualRate: portfolioEngineOrder.orderStatistics.actualRate.value,
                orderRate: portfolioEngineOrder.rate.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            portfolioSystem.addWarning(
                [
                    [portfolioEngineOrder.orderQuotedAsset.actualSize.id, portfolioEngineOrder.orderStatistics.actualRate.id],
                    message,
                    docs
                ]
            )
        }

        function recalculateSizePlaced() {
            if (portfolioEngineOrder.orderStatistics.actualRate.value === portfolioEngineOrder.rate.value) { return }
            /*
            Since the Actual Rate might have changed, we need to recalculate the Size Placed, where we accumulate all the Size Placed of
            all orders of a Stage. For Base Asset there is nothing to do, since the Actual Rate does not have an inpact on it. 

            For Quoted Asset, we need to first unaccount what this same orded added before to Size Placed (with the precious Actual Size) and
            account with the new Actual Size. 
            */
            let previousStageQuotedAssetSizePlaced = portfolioEngineStage.stageQuotedAsset.sizePlaced.value

            portfolioEngineStage.stageQuotedAsset.sizePlaced.value =
                portfolioEngineStage.stageQuotedAsset.sizePlaced.value -
                previousQuotedAssetActualSize

            portfolioEngineStage.stageQuotedAsset.sizePlaced.value =
                portfolioEngineStage.stageQuotedAsset.sizePlaced.value +
                portfolioEngineOrder.orderQuotedAsset.actualSize.value

            portfolioEngineStage.stageQuotedAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageQuotedAsset.sizePlaced.value, 10)

            const message = 'Simulating - Size Placed Recalculated'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Warning - ' + message,
                placeholder: {}
            }
            contextInfo = {
                previousStageQuotedAssetSizePlaced: previousStageQuotedAssetSizePlaced,
                recalculatedStageQuotedAssetSizePlaced: portfolioEngineStage.stageQuotedAsset.sizePlaced.value,
                actualRate: portfolioEngineOrder.orderStatistics.actualRate.value,
                orderRate: portfolioEngineOrder.rate.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            portfolioSystem.addWarning(
                [
                    [portfolioEngineStage.stageQuotedAsset.sizePlaced.id, portfolioEngineOrder.orderStatistics.actualRate.id],
                    message,
                    docs
                ]
            )
        }
    }

    async function feesToBePaidSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage) {
        /* 
        The Fees To Be Paid are the fees that will be paid once the order is 100% Filled. 
        */
        switch (portfolioEngineOrder.type) {
            case 'Market Order': {
                await applyFeePercentage(
                    'feesToBePaid',
                    portfolioEngineOrder,
                    portfolioSystemOrder,
                    sessionParameters.feeStructure.config.taker,
                    100
                )
                break
            }
            case 'Limit Order': {
                await applyFeePercentage(
                    'feesToBePaid',
                    portfolioEngineOrder,
                    portfolioSystemOrder,
                    sessionParameters.feeStructure.config.maker,
                    100
                )
                break
            }
        }
    }

    function percentageFilledSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage) {
        /* 
        When we are live, it is the exchange who knows which order was filled and in 
        which amount. Since we are backtesting here, we need to simulate what happens
        at the exchange.  We can not simulate that an order is filled if the candle we
        see did not touch the order.

        For limit buy orders we are going to check if the price was below the order actual rate, and 
        for limit sell orders we are going to check if the price was above the order actual rate.
        
        If we have a partial filling defined specifically for this order, 
        we are going to use it to estimate how much of the order we will consider filled.
        */
        let orderWasHit
        switch (portfolioSystemOrder.type) {
            case 'Limit Buy Order': {
                if (portfolioEngine.portfolioCurrent.portfolioEpisode.candle.min.value <= portfolioEngineOrder.orderStatistics.actualRate.value) {
                    orderWasHit = true
                }
                break
            }
            case 'Limit Sell Order': {
                if (portfolioEngine.portfolioCurrent.portfolioEpisode.candle.max.value >= portfolioEngineOrder.orderStatistics.actualRate.value) {
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
            /* 
            Initially, we will assume that 100% of the order was filled. This might be overwritten
            if there is a configuration for this order that details how much is must be considered
            filled each time we check this.
             */
            portfolioEngineOrder.orderStatistics.percentageFilled.value = 100

            /* Based on the Portfolio System Definition */
            if (portfolioSystemOrder.simulatedExchangeEvents !== undefined) {
                if (portfolioSystemOrder.simulatedExchangeEvents.simulatedPartialFill !== undefined) {
                    if (portfolioSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability !== undefined) {

                        /* Percentage Filled */
                        let percentageFilled = portfolioSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability * 100
                        if (portfolioEngineOrder.orderStatistics.percentageFilled.value + percentageFilled > 100) {
                            percentageFilled = 100 - portfolioEngineOrder.orderStatistics.percentageFilled.value
                        }
                        portfolioEngineOrder.orderStatistics.percentageFilled.value = portfolioEngineOrder.orderStatistics.percentageFilled.value + percentageFilled
                        portfolioEngineOrder.orderStatistics.percentageFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderStatistics.percentageFilled.value, 10)
                    }
                }
            }
        }
    }

    function feesPaidSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage) {
        /*
        The way the Fess Paid are calculated is as follows: From the order Actual Size we apply the % of fee,
        that would give us the total fees for that order. To that we apply the % filled of the orders,
        that give use the final result of the fees paid for the current % filled.
        
        But before that, we will see if there is an specific definition on how to simulate the fees for 
        this order, or if there is not, we use the Fees Structure defined at the Session Parameters.            
        */

        /* Based on the Portfolio System Definition */
        if (portfolioSystemOrder.simulatedExchangeEvents !== undefined) {
            if (portfolioSystemOrder.simulatedExchangeEvents.simulatedFeesPaid !== undefined) {
                if (portfolioSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage !== undefined) {
                    applyFeePercentage(
                        'feesPaid',
                        portfolioEngineOrder,
                        portfolioSystemOrder,
                        portfolioSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage,
                        portfolioEngineOrder.orderStatistics.percentageFilled.value
                    )
                    return
                }
            }
        }

        /*
        Another way to simulate the Fees Paid is by using the Session Paremeters configuration for Fees.
        */
        switch (portfolioEngineOrder.type) {
            case 'Market Order': {
                applyFeePercentage(
                    'feesPaid',
                    portfolioEngineOrder,
                    portfolioSystemOrder,
                    sessionParameters.feeStructure.config.taker,
                    portfolioEngineOrder.orderStatistics.percentageFilled.value
                )
                break
            }
            case 'Limit Order': {
                applyFeePercentage(
                    'feesPaid',
                    portfolioEngineOrder,
                    portfolioSystemOrder,
                    sessionParameters.feeStructure.config.maker,
                    portfolioEngineOrder.orderStatistics.percentageFilled.value
                )
                break
            }
        }
    }

    function sizeFilledSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, applyFeePercentage) {
        /* 
        Size Filled is the amount of Base Asset or Quoted Asset that at the exchange matches
        another counterparty order. We calculate this using the Percentage Filled we already simulated.
        */

        portfolioEngineOrder.orderBaseAsset.sizeFilled.value =
            portfolioEngineOrder.orderBaseAsset.actualSize.value *
            portfolioEngineOrder.orderStatistics.percentageFilled.value / 100

        portfolioEngineOrder.orderQuotedAsset.sizeFilled.value =
            portfolioEngineOrder.orderQuotedAsset.actualSize.value *
            portfolioEngineOrder.orderStatistics.percentageFilled.value / 100

        portfolioEngineOrder.orderBaseAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderBaseAsset.sizeFilled.value, 10)
        portfolioEngineOrder.orderQuotedAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderQuotedAsset.sizeFilled.value, 10)
    }

    async function amountReceivedSimulation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage) {
        /* 
        This simulation is for informational purposes, so that users do not have to calculate
        it by themselves. The Amount Received out of the trade depends if we are Buying or Selling
        the Base Asset. If we are Buying, then the Amount Receiced will be in Base Asset. If we 
        are selling then it will be in Quoted Asset. 
        */

        switch (true) {
            case portfolioSystemOrder.type === 'Market Buy Order' || portfolioSystemOrder.type === 'Limit Buy Order': {
                /*
                In this case the Amount Received is in Base Asset.
                */
                portfolioEngineOrder.orderBaseAsset.amountReceived.value =
                    portfolioEngineOrder.orderBaseAsset.sizeFilled.value -
                    portfolioEngineOrder.orderBaseAsset.feesPaid.value
                break
            }
            case portfolioSystemOrder.type === 'Market Sell Order' || portfolioSystemOrder.type === 'Limit Sell Order': {
                /*
                In this case the Amount Received is in Quoted Asset.
                */
                portfolioEngineOrder.orderQuotedAsset.amountReceived.value =
                    portfolioEngineOrder.orderQuotedAsset.sizeFilled.value -
                    portfolioEngineOrder.orderQuotedAsset.feesPaid.value
                break
            }
        }
    }
}