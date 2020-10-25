exports.newOrdersSimulations = function newOrdersSimulations(bot, logger) {
    /*
    When we are backtesting or paper trading, we need to simulate what would have happened at the exchange.
    */
    const MODULE_NAME = 'Orders Simulations'

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
        sessionParameters = bot.SESSION.parameters
        tradingEngine = bot.simulationState.tradingEngine
        tradingSystem = bot.simulationState.tradingSystem
    }

    function finalize() {
        sessionParameters = undefined
        tradingEngine = undefined
        tradingSystem = undefined
    }

    async function actualSizeSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
        /* 
        While backtesting and paper trading, we do not really need to change
        simulate an Actual Size. We will just copy to that field the
        size of the order.
        */
        tradingEngineOrder.orderBaseAsset.actualSize.value = tradingEngineOrder.orderBaseAsset.size.value
        tradingEngineOrder.orderQuotedAsset.actualSize.value = tradingEngineOrder.orderQuotedAsset.size.value

    }

    function actualRateSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
        /* Actual Rate Simulation */
        let calculatedBasedOnTradingSystem = false
        let previousQuotedAssetActualSize

        basedOnTradingSystem()
        basedOnSessionParameters()
        considerBestMatchWithOrderBook()
        recalculateActualSize()
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

        function recalculateActualSize() {
            /*
            The Quoted Asset Actual Size in a backtest is equal to the Quoted Asset Size, which is related to
            the Base Asset Size by the Order Rate. Since now we have the Actual Rate, we will need to recalculate
            the Quoted Asset Actual Size using the Actual Rate.
            */
            previousQuotedAssetActualSize = tradingEngineOrder.orderQuotedAsset.actualSize.value

            tradingEngineOrder.orderQuotedAsset.actualSize.value = tradingEngineOrder.orderBaseAsset.actualSize.value * tradingEngineOrder.orderStatistics.actualRate.value
            tradingEngineOrder.orderQuotedAsset.actualSize.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.actualSize.value, 10)
        }

        function recalculateSizePlaced() {
            /*
            For the Quoted Asset, the Size Placed was previously calculated with the previous Actual Size (or Size when these were equal). 
            Since we have just recaclcualted the Actual Size in Quoted Asset, we need to fix the Size Placed for the stage which was
            calculated with the previous value.
            */
            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value -
                previousQuotedAssetActualSize

            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value +
                tradingEngineOrder.orderQuotedAsset.actualSize.value

            tradingEngineStage.stageQuotedAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)
        }
    }

    async function feesToBePaidSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
        /* 
        The Fees To Be Paid are the fees that will be paid once the order is 100% Filled. 
        */
        switch (tradingEngineOrder.type) {
            case 'Market Order': {
                await applyFeePercentage(
                    tradingEngineOrder.orderBaseAsset.feesToBePaid,
                    tradingEngineOrder,
                    tradingSystemOrder,
                    sessionParameters.feeStructure.config.taker,
                    100
                )
                break
            }
            case 'Limit Order': {
                await applyFeePercentage(
                    tradingEngineOrder.orderBaseAsset.feesToBePaid,
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
        can see did not touch the order.

        For buy orders we are going to check if the price was below the order actual rate, and 
        for sell orders we are going to check if the price was above the order actual rate.
        
        If we have a partial filling defined specifically for this order, 
        we are going to use it to estimate how much of the order we will consider filled.
        */
        let orderWasHit
        switch (tradingSystemOrder.type) {
            case 'Limit Buy Order': {
                if (tradingEngine.current.episode.candle.min.value <= tradingEngineOrder.actualRate.value) {
                    orderWasHit = true
                }
                break
            }
            case 'Limit Sell Order': {
                if (tradingEngine.current.episode.candle.max.value >= tradingEngineOrder.actualRate.value) {
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
            are 100% filled every single time they are hit, which is the most likely thing to happen. 
            */
            if (calculatedBasedOnTradingSystem === false) {
                /* We will assume that 100% of the order was filled */
                tradingEngineOrder.orderStatistics.percentageFilled.value = 100
            }
        }
    }

    function feesPaidSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, applyFeePercentage) {
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
                    applyFeePercentage(
                        tradingEngineOrder.orderBaseAsset.feesPaid,
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
        Another way to simulate the Fees Paid is by using the Session Paremeters configuration for Fees.
        */
        switch (tradingEngineOrder.type) {
            case 'Market Order': {
                applyFeePercentage(
                    tradingEngineOrder.orderBaseAsset.feesPaid,
                    tradingEngineOrder,
                    tradingSystemOrder,
                    sessionParameters.feeStructure.config.taker,
                    tradingEngineOrder.orderStatistics.percentageFilled.value
                )
                break
            }
            case 'Limit Order': {
                applyFeePercentage(
                    tradingEngineOrder.orderBaseAsset.feesPaid,
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
        another counterparty order. We alredy have simulated the Percentage Filled and the
        Size To Be Filled, which is the order Actual Size minus the Fees To Be Paid.
        */

        tradingEngineOrder.orderBaseAsset.sizeFilled.value =
            tradingEngineOrder.orderBaseAsset.amountReceived.value *
            tradingEngineOrder.orderStatistics.percentageFilled.value / 100

        tradingEngineOrder.orderQuotedAsset.sizeFilled.value =
            tradingEngineOrder.orderQuotedAsset.amountReceived.value *
            tradingEngineOrder.orderStatistics.percentageFilled.value / 100

        tradingEngineOrder.orderBaseAsset.sizeFilled.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.sizeFilled.value, 10)
        tradingEngineOrder.orderQuotedAsset.sizeFilled.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.sizeFilled.value, 10)
    }

    async function amountReceivedSimulation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage) {
        /* 
        This simulation is for informational purposes, so that users do not have to calculate
        it by themselves. The Amount Received out of the trade depends if we are Buying or Selling
        the Base Asset. If we are Buying, then the Amount Receiced will be in Base Asset. If we 
        are selling the it will be in Quoted Asset. 
        */

        switch (true) {
            case tradingSystemOrder.type === 'Market Buy Order' || tradingSystemOrder.type === 'Limit Buy Order': {
                /*
                In this case the Amount Received is in Base Asset.
                */
                tradingEngineOrder.orderBaseAsset.amountReceived.value.value =
                    tradingEngineOrder.orderBaseAsset.sizeFilled.value -
                    tradingEngineOrder.orderBaseAsset.feesPaid.value
                break
            }
            case tradingSystemOrder.type === 'Market Sell Order' || tradingSystemOrder.type === 'Limit Sell Order': {
                /*
                In this case the Amount Received is in Quoted Asset.
                */
                tradingEngineOrder.orderQuotedAsset.amountReceived.value.value =
                    tradingEngineOrder.orderQuotedAsset.sizeFilled.value -
                    tradingEngineOrder.orderQuotedAsset.feesPaid.value
                break
            }
        }
    }
}