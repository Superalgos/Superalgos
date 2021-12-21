exports.newAlgorithmicTradingBotModulesOrdersSimulations = function (processIndex) {
    /*
    When we are backtesting or paper trading, we need to simulate what would have happened at the exchange.
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

    let tradingEngine
    let tradingSystem
    let sessionParameters

    return thisObject

    function initialize() {
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
    }

    function finalize() {
        sessionParameters = undefined
        tradingEngine = undefined
        tradingSystem = undefined
    }

    async function actualSizeSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
        /* 
        The Actual Size is the size the exchange accepts for the order, 
        regardless of the size sent in the request to the exchange.

        While backtesting and paper trading, we do not really need to 
        simulate an Actual Size. We will just copy to that field the
        size of the order.

        This calculation needs to happen only once, so as to set these values.
        */
        if (tradingEngineOrder.orderBaseAsset.actualSize.value !== tradingEngineOrder.orderBaseAsset.actualSize.config.initialValue) { return }

        tradingEngineOrder.orderBaseAsset.actualSize.value = tradingEngineOrder.orderBaseAsset.size.value
        tradingEngineOrder.orderQuotedAsset.actualSize.value = tradingEngineOrder.orderQuotedAsset.size.value
    }

    function actualRateSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
        /* Actual Rate Simulation */
        let previousQuotedAssetActualSize = tradingEngineOrder.orderQuotedAsset.actualSize.value

        if (tradingEngineOrder.orderStatistics.actualRate.value === tradingEngineOrder.orderStatistics.actualRate.config.initialValue) {
            /* 
            The default value for the Actual Rate is the rate of the order.
            */
            tradingEngineOrder.orderStatistics.actualRate.value = tradingEngineOrder.rate.value
        }

        basedOnSessionParameters()
        basedOnTradingSystem()
        considerBestMatchWithOrderBook()
        recalculateActualSize()
        recalculateSizePlaced()

        function basedOnSessionParameters() {
            /*
            The default way to calculate the Actual Rate is to apply the Slippage defined
            at the Session Parameters Definition. We are not going to apply the default if there
            is a definition for this order on how to calculate the actual rate.
            */
            if (tradingSystemOrder.simulatedExchangeEvents !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate !== undefined) {
                    return
                }
            }
            switch (tradingEngineOrder.type) {
                case 'Market Order': {

                    /* Actual Rate is simulated based on the Session Parameters */
                    let slippageAmount = tradingEngineOrder.rate.value * sessionParameters.slippage.config.marketOrderRate / 100
                    if (slippageAmount !== 0) {
                        switch (tradingSystemOrder.type) {
                            case 'Market Sell Order': {
                                tradingEngineOrder.orderStatistics.actualRate.value = tradingEngineOrder.rate.value - slippageAmount
                                tradingEngineOrder.orderStatistics.actualRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderStatistics.actualRate.value, 10)

                                const message = 'Simulating - Slippage Subtracted'
                                let docs = {
                                    project: 'Foundations',
                                    category: 'Topic',
                                    type: 'TS LF Trading Bot Warning - ' + message,
                                    placeholder: {}
                                }
                                contextInfo = {
                                    slippageAmount: slippageAmount,
                                    orderRate: tradingEngineOrder.rate.value,
                                    actualRate: tradingEngineOrder.orderStatistics.actualRate.value
                                }
                                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                                tradingSystem.addWarning(
                                    [
                                        [sessionParameters.slippage.id, tradingEngineOrder.rate.id, tradingEngineOrder.orderStatistics.actualRate.id],
                                        message,
                                        docs
                                    ]
                                )
                                break
                            }
                            case 'Market Buy Order': {
                                tradingEngineOrder.orderStatistics.actualRate.value = tradingEngineOrder.rate.value + slippageAmount
                                tradingEngineOrder.orderStatistics.actualRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderStatistics.actualRate.value, 10)

                                const message = 'Simulating - Slippage Added'
                                let docs = {
                                    project: 'Foundations',
                                    category: 'Topic',
                                    type: 'TS LF Trading Bot Warning - ' + message,
                                    placeholder: {}
                                }
                                contextInfo = {
                                    slippageAmount: slippageAmount,
                                    orderRate: tradingEngineOrder.rate.value,
                                    actualRate: tradingEngineOrder.orderStatistics.actualRate.value
                                }
                                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                                tradingSystem.addWarning(
                                    [
                                        [sessionParameters.slippage.id, tradingEngineOrder.rate.id, tradingEngineOrder.orderStatistics.actualRate.id],
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
                    tradingEngineOrder.orderStatistics.actualRate.value = tradingEngineOrder.rate.value
                    break
                }
            }
        }

        function basedOnTradingSystem() {
            /*
            If the user specified a Formula to simulate the Actual Rate for this order,
            we use that formula here. Note that if this Formula exists, this will override
            the calculation based on Slippage.
            */
            if (tradingSystemOrder.simulatedExchangeEvents !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate !== undefined) {
                    if (tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula !== undefined) {
                        /* Calculate this only once for this order */
                        if (tradingEngineOrder.orderStatistics.actualRate.value === tradingEngineOrder.orderStatistics.actualRate.config.initialValue) {
                            let newValue = tradingSystem.formulas.get(tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula.id)
                            newValue = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(newValue, 10)

                            const message = 'Simulating - Actual Rate Based On Formula'
                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Trading Bot Warning - ' + message,
                                placeholder: {}
                            }
                            contextInfo = {
                                previousActualRate: tradingEngineOrder.orderStatistics.actualRate.value,
                                recalculatedActualRate: newValue
                            }
                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)
                            
                            tradingSystem.addWarning(
                                [
                                    tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula.id,
                                    message,
                                    docs
                                ]
                            )
                            tradingEngineOrder.orderStatistics.actualRate.value = newValue
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
            we set for the order was too low (for a sale order) or too height (for a buy order), the actual rate
            should be better than expected. 

            We don't know what it is at the order book, but whe know that the last candle includes trades that bounced between
            the min an max of the candle. That could tell us the above the max and below the min, the order would be matched
            with orders at the order book. For that reason, we do this:
            */
            switch (true) {
                case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {
                    if (tradingEngineOrder.orderStatistics.actualRate.value > tradingEngine.tradingCurrent.tradingEpisode.candle.max.value) {
                        
                        const message = 'Simulating - Actual Rate Too High'
                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Trading Bot Warning - ' + message,
                            placeholder: {}
                        }
                        contextInfo = {
                            previousActualRate: tradingEngineOrder.orderStatistics.actualRate.value,
                            recalculatedActualRate: tradingEngine.tradingCurrent.tradingEpisode.candle.max.value
                        }
                        TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                        tradingSystem.addWarning(
                            [
                                [tradingEngineOrder.orderStatistics.actualRate.id, tradingEngine.tradingCurrent.tradingEpisode.candle.max.id],
                                message,
                                docs
                            ]
                        )
                        tradingEngineOrder.orderStatistics.actualRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.max.value
                    }
                    break
                }
                case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {
                    if (tradingEngineOrder.orderStatistics.actualRate.value < tradingEngine.tradingCurrent.tradingEpisode.candle.min.value) {

                        const message = 'Simulating - Actual Rate Too Low'
                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Trading Bot Warning - ' + message,
                            placeholder: {}
                        }
                        contextInfo = {
                            previousActualRate: tradingEngineOrder.orderStatistics.actualRate.value,
                            recalculatedActualRate: tradingEngine.tradingCurrent.tradingEpisode.candle.max.value
                        }
                        TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                        tradingSystem.addWarning(
                            [
                                [tradingEngineOrder.orderStatistics.actualRate.id, tradingEngine.tradingCurrent.tradingEpisode.candle.min.id],
                                message,
                                docs
                            ]
                        )
                        tradingEngineOrder.orderStatistics.actualRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.min.value
                    }
                    break
                }
            }
            tradingEngineOrder.orderStatistics.actualRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderStatistics.actualRate.value, 10)
        }

        function recalculateActualSize() {
            if (tradingEngineOrder.orderStatistics.actualRate.value === tradingEngineOrder.rate.value) { return }
            /*
            Now that we have an Actual Rate, we need to adjust the Actual Size in Quoted Asset, since 
            Base Asset is what the exchange accepts as input and give information at. Quotes Asset properties are always calculated.
            */
            tradingEngineOrder.orderQuotedAsset.actualSize.value =
                tradingEngineOrder.orderBaseAsset.actualSize.value *
                tradingEngineOrder.orderStatistics.actualRate.value

            tradingEngineOrder.orderQuotedAsset.actualSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderQuotedAsset.actualSize.value, 10)

            const message = 'Simulating - Actual Size Recalculated'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Warning - ' + message,
                placeholder: {}
            }
            contextInfo = {
                previousQuotedAssetActualSize: previousQuotedAssetActualSize,
                recalculatedQuotedAssetActualSize: tradingEngineOrder.orderQuotedAsset.actualSize.value,
                actualRate: tradingEngineOrder.orderStatistics.actualRate.value,
                orderRate: tradingEngineOrder.rate.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            tradingSystem.addWarning(
                [
                    [tradingEngineOrder.orderQuotedAsset.actualSize.id, tradingEngineOrder.orderStatistics.actualRate.id],
                    message,
                    docs
                ]
            )
        }

        function recalculateSizePlaced() {
            if (tradingEngineOrder.orderStatistics.actualRate.value === tradingEngineOrder.rate.value) { return }
            /*
            Since the Actual Rate might have changed, we need to recalculate the Size Placed, where we accumulate all the Size Placed of
            all orders of a Stage. For Base Asset there is nothing to do, since the Actual Rate does not have an impact on it.

            For Quoted Asset, we need to first unaccount what this same orded added before to Size Placed (with the precious Actual Size) and
            account with the new Actual Size. 
            */
            let previousStageQuotedAssetSizePlaced = tradingEngineStage.stageQuotedAsset.sizePlaced.value

            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value -
                previousQuotedAssetActualSize

            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value +
                tradingEngineOrder.orderQuotedAsset.actualSize.value

            tradingEngineStage.stageQuotedAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)

            const message = 'Simulating - Size Placed Recalculated'
            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Warning - ' + message,
                placeholder: {}
            }
            contextInfo = {
                previousStageQuotedAssetSizePlaced: previousStageQuotedAssetSizePlaced,
                recalculatedStageQuotedAssetSizePlaced: tradingEngineStage.stageQuotedAsset.sizePlaced.value,
                actualRate: tradingEngineOrder.orderStatistics.actualRate.value,
                orderRate: tradingEngineOrder.rate.value
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

            tradingSystem.addWarning(
                [
                    [tradingEngineStage.stageQuotedAsset.sizePlaced.id, tradingEngineOrder.orderStatistics.actualRate.id],
                    message,
                    docs
                ]
            )
        }
    }

    async function feesToBePaidSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
        /* 
        The Fees To Be Paid are the fees that will be paid once the order is 100% Filled. 
        */
        switch (tradingEngineOrder.type) {
            case 'Market Order': {
                await applyFeePercentage(
                    'feesToBePaid',
                    tradingEngineOrder,
                    tradingSystemOrder,
                    sessionParameters.feeStructure.config.taker,
                    100
                )
                break
            }
            case 'Limit Order': {
                await applyFeePercentage(
                    'feesToBePaid',
                    tradingEngineOrder,
                    tradingSystemOrder,
                    sessionParameters.feeStructure.config.maker,
                    100
                )
                break
            }
        }
    }

    function percentageFilledSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
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
        switch (tradingSystemOrder.type) {
            case 'Limit Buy Order': {
                if (tradingEngine.tradingCurrent.tradingEpisode.candle.min.value <= tradingEngineOrder.orderStatistics.actualRate.value) {
                    orderWasHit = true
                }
                break
            }
            case 'Limit Sell Order': {
                if (tradingEngine.tradingCurrent.tradingEpisode.candle.max.value >= tradingEngineOrder.orderStatistics.actualRate.value) {
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
            tradingEngineOrder.orderStatistics.percentageFilled.value = 100

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
                        tradingEngineOrder.orderStatistics.percentageFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderStatistics.percentageFilled.value, 10)
                    }
                }
            }
        }
    }

    function feesPaidSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
        /*
        The way the Fess Paid are calculated is as follows: From the order Actual Size we apply the % of fee,
        that would give us the total fees for that order. To that we apply the % filled of the orders,
        that give use the final result of the fees paid for the current % filled.
        
        But before that, we will see if there is an specific definition on how to simulate the fees for 
        this order, or if there is not, we use the Fees Structure defined at the Session Parameters.            
        */

        /* Based on the Trading System Definition */
        if (tradingSystemOrder.simulatedExchangeEvents !== undefined) {
            if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage !== undefined) {
                    applyFeePercentage(
                        'feesPaid',
                        tradingEngineOrder,
                        tradingSystemOrder,
                        tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage,
                        tradingEngineOrder.orderStatistics.percentageFilled.value
                    )
                    return
                }
            }
        }

        /*
        Another way to simulate the Fees Paid is by using the Session Parameters configuration for Fees.
        */
        switch (tradingEngineOrder.type) {
            case 'Market Order': {
                applyFeePercentage(
                    'feesPaid',
                    tradingEngineOrder,
                    tradingSystemOrder,
                    sessionParameters.feeStructure.config.taker,
                    tradingEngineOrder.orderStatistics.percentageFilled.value
                )
                break
            }
            case 'Limit Order': {
                applyFeePercentage(
                    'feesPaid',
                    tradingEngineOrder,
                    tradingSystemOrder,
                    sessionParameters.feeStructure.config.maker,
                    tradingEngineOrder.orderStatistics.percentageFilled.value
                )
                break
            }
        }
    }

    function sizeFilledSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
        /* 
        Size Filled is the amount of Base Asset or Quoted Asset that at the exchange matches
        another counterparty order. We calculate this using the Percentage Filled we already simulated.
        */

        tradingEngineOrder.orderBaseAsset.sizeFilled.value =
            tradingEngineOrder.orderBaseAsset.actualSize.value *
            tradingEngineOrder.orderStatistics.percentageFilled.value / 100

        tradingEngineOrder.orderQuotedAsset.sizeFilled.value =
            tradingEngineOrder.orderQuotedAsset.actualSize.value *
            tradingEngineOrder.orderStatistics.percentageFilled.value / 100

        tradingEngineOrder.orderBaseAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderBaseAsset.sizeFilled.value, 10)
        tradingEngineOrder.orderQuotedAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngineOrder.orderQuotedAsset.sizeFilled.value, 10)
    }

    async function amountReceivedSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage) {
        /* 
        This simulation is for informational purposes, so that users do not have to calculate
        it by themselves. The Amount Received out of the trade depends if we are Buying or Selling
        the Base Asset. If we are Buying, then the Amount Received will be in Base Asset. If we
        are selling then it will be in Quoted Asset. 
        */

        switch (true) {
            case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {
                /*
                In this case the Amount Received is in Base Asset.
                */
                tradingEngineOrder.orderBaseAsset.amountReceived.value =
                    tradingEngineOrder.orderBaseAsset.sizeFilled.value -
                    tradingEngineOrder.orderBaseAsset.feesPaid.value
                break
            }
            case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {
                /*
                In this case the Amount Received is in Quoted Asset.
                */
                tradingEngineOrder.orderQuotedAsset.amountReceived.value =
                    tradingEngineOrder.orderQuotedAsset.sizeFilled.value -
                    tradingEngineOrder.orderQuotedAsset.feesPaid.value
                break
            }
        }
    }
}