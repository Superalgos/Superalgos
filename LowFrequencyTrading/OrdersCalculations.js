exports.newOrdersCalculations = function newOrdersCalculations(bot, logger) {
    /*
    When we are live trading, we need to syncronize with the exchange.
    */
    const MODULE_NAME = 'Orders Calculations'

    let thisObject = {
        actualSizeCalculation: actualSizeCalculation,
        actualRateCalculation: actualRateCalculation,
        feesToBePaidCalculation: feesToBePaidCalculation,
        sizeToBeFilledCalculation: sizeToBeFilledCalculation,
        finapercentageFilledCalculationlize: percentageFilledCalculation,
        feesPaidCalculation: feesPaidCalculation,
        sizeFilledCalculation: sizeFilledCalculation,
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
    
    async function actualSizeCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage) {
        /* 
        When we submit the order to the exchange, we do it specifying the order size
        in Base Asset. It is mandatory to be in Base Asset as per CCXT Library API. 
        
        The exchange might take that size or might change it a little 
        bit. For example, if it does not accept as many decimals as we are sending.
        If we identify the situation in which the size accepted is different than the 
        size we have accounted for, we need to make several adjustments so that the 
        accounting syncronizes with reality.
        */

        /* This calculation only happens once, the first time the order is checked. */
        if (tradingEngineOrder.orderBaseAsset.actualSize.value !== tradingEngineOrder.orderBaseAsset.actualSize.config.initialValue) { return }

        /* We receive the actual size from the exchange at the order.amount field. */
        tradingEngineOrder.orderBaseAsset.actualSize.value = order.amount

        /*
        If not, we will calculate the Quoted Asset Actual Size too. Note that the amount received
        is in Base Asset only. In the next formula, we are unsing the rate of the order.
        This rate might be replaced afteerwards for an actual rate. When that happens we will 
        need to adjust these results.
         */
        tradingEngineOrder.orderQuotedAsset.actualSize.value = tradingEngineOrder.orderBaseAsset.actualSize.value * tradingEngineOrder.rate.value

        tradingEngineOrder.orderBaseAsset.actualSize.value = global.PRECISE(tradingEngineOrder.orderBaseAsset.actualSize.value, 10)
        tradingEngineOrder.orderQuotedAsset.actualSize.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.actualSize.value, 10)

        /* 
        If the exchange accepted the size sent on the request to create the order,
        we don't need to do anything else here. 
        */
        if (tradingEngineOrder.orderBaseAsset.size.value === tradingEngineOrder.orderBaseAsset.actualSize.value) { return }

        recalculateSizePlaced()

        function recalculateSizePlaced() {
            /*
            Wee also need to unaccount the previous size placed and correctly account
            for the the new actual sizes we now have.
            */
            tradingEngineStage.stageBaseAsset.sizePlaced.value =
                tradingEngineStage.stageBaseAsset.sizePlaced.value -
                tradingEngineOrder.orderBaseAsset.size.value

            tradingEngineStage.stageBaseAsset.sizePlaced.value =
                tradingEngineStage.stageBaseAsset.sizePlaced.value +
                tradingEngineOrder.orderBaseAsset.actualSize.value

            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value -
                tradingEngineOrder.orderQuotedAsset.size.value

            tradingEngineStage.stageQuotedAsset.sizePlaced.value =
                tradingEngineStage.stageQuotedAsset.sizePlaced.value +
                tradingEngineOrder.orderQuotedAsset.actualSize.value

            tradingEngineStage.stageBaseAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageBaseAsset.sizePlaced.value, 10)
            tradingEngineStage.stageQuotedAsset.sizePlaced.value = global.PRECISE(tradingEngineStage.stageQuotedAsset.sizePlaced.value, 10)
        }
    }

    async function actualRateCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage) {
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

        /*
        If the Actual Rate happens to be exctly the same than the order rate, then there is
        nothing else to do here. Otherwise there are adjustments to be made.
        */
        if (tradingEngineOrder.orderStatistics.actualRate.value === tradingEngineOrder.rate.value) { return }

        let previousQuotedAssetActualSize = tradingEngineOrder.orderQuotedAsset.actualSize.value
        recalculateActualSize()
        recalculateSizePlaced()

        function recalculateActualSize() {
            /*
            Now we know the Actual Rate at which the order was filled. Since the actual rate
            is not the same as the Rate we defined for the order, we need to syncronize 
            the Actual Order Size for Quoted Asset since it was calculated with the Order Size that we 
            now know it is not the one really used at the exchange. We will recalculate the
            Actual Size in Quoted Asset and not in Base Asset, since the Actual Size in Base Asset 
            is the one we accepted by the exchange, so that is fixed, regardless of how we initially
            got the Order Size in Base Asset, either from direct imput from the user or calculated
            from the Order Size in Quoted Asset input it by the user. So here we go. 
            */
            tradingEngineOrder.orderQuotedAsset.actualSize.value = tradingEngineOrder.orderBaseAsset.actualSize.value * tradingEngineOrder.orderStatistics.actualRate.value
            tradingEngineOrder.orderQuotedAsset.actualSize.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.actualSize.value, 10)
        }

        function recalculateSizePlaced() {
            /*
            Since we changed the Actual Size in Quoted Asset, we need to fix the Size Placed in Quoted Asset
            that was previously calculated with the previous value of actualSize.
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

    async function feesToBePaidCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage) {
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

    async function sizeToBeFilledCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage) {
        /* 
        The Size to Be Filled is the Actual Size minus the Fees to be Paid. 
        */
        tradingEngineOrder.orderBaseAsset.sizeToBeFilled.value =
            tradingEngineOrder.orderBaseAsset.actualSize.value -
            tradingEngineOrder.orderBaseAsset.feesToBePaid.value

        tradingEngineOrder.orderQuotedAsset.sizeToBeFilled.value =
            tradingEngineOrder.orderQuotedAsset.actualSize.value -
            tradingEngineOrder.orderQuotedAsset.feesToBePaid.value
    }

    async function percentageFilledCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage) {
        /* 
        Percentage Filled Calculation: The only information we get from the exchange is the order.filled.
        We know this field will go up until reaching the Size To Be Filled. Once it reaches that number
        the order will be 100% filled. 
        */
        tradingEngineOrder.orderStatistics.percentageFilled.value = order.filled * 100 / (tradingEngineOrder.orderBaseAsset.sizeToBeFilled.value)
        tradingEngineOrder.orderStatistics.percentageFilled.value = global.PRECISE(tradingEngineOrder.orderStatistics.percentageFilled.value, 10)
    }

    async function feesPaidCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage) {
        /*
        The exchange fees are taken from the Base Asset or the Quoted Asset depending if we 
        are buying or selling. Within the order information received from the exchange we can not see the fees paid so we need to
        calculate them ourselves. To do this it is needed to be used the Session Fees Parameters.        
        */
        switch (tradingEngineOrder.type) {
            case 'Market Order': {
                await applyFeePercentage(
                    tradingEngineOrder.orderBaseAsset.feesPaid,
                    tradingEngineOrder,
                    tradingSystemOrder,
                    sessionParameters.feeStructure.config.taker,
                    tradingEngineOrder.orderStatistics.percentageFilled.value
                )
                break
            }
            case 'Limit Order': {
                await applyFeePercentage(
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

    async function sizeFilledCalculation(tradingEngineStage, tradingSystemOrder, tradingEngineOrder, order, applyFeePercentage) {
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
            tradingEngineOrder.orderQuotedAsset.sizeToBeFilled.value * tradingEngineOrder.orderStatistics.percentageFilled.value / 100

        tradingEngineOrder.orderQuotedAsset.sizeFilled.value = global.PRECISE(tradingEngineOrder.orderQuotedAsset.sizeFilled.value, 10)
    }
}