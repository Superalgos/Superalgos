exports.newPortfolioManagementBotModulesOrdersCalculations = function (processIndex) {
    /*
    When we are live portfolio, we need to synchronize with the exchange.
    */

    let thisObject = {
        actualSizeCalculation: actualSizeCalculation,
        actualRateCalculation: actualRateCalculation,
        feesToBePaidCalculation: feesToBePaidCalculation,
        amountReceivedCalculation: amountReceivedCalculation,
        percentageFilledCalculation: percentageFilledCalculation,
        feesPaidCalculation: feesPaidCalculation,
        sizeFilledCalculation: sizeFilledCalculation,
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

    async function actualSizeCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage) {
        /* 
        When we submit the order to the exchange, we do it specifying the order size
        in Base Asset. It is mandatory to be in Base Asset as per CCXT Library API and
        probably as per the Exchange API too. 
        
        The exchange might take that size or might change it a little 
        bit. For example, if it does not accept as many decimals as we are sending.

        We have also seen that for Market Orders, the exchange usually does not take
        the size requested exactly. Sometimes is a little bit less or even a little bit
        more. For Limit orders it is usually the same.

        If it happens that the size accepted  (Actual Size) is different than the 
        size requested (Size), we need to make several adjustments so that the 
        accounting synchronizes with reality.
        */

        /* This calculation needs to happen only once, the first time the order is checked. */
        if (portfolioEngineOrder.orderBaseAsset.actualSize.value !== portfolioEngineOrder.orderBaseAsset.actualSize.config.initialValue) { return }

        if ( order.amount !== undefined) {
            /* We receive the actual size from the exchange at the order.amount field. */
            portfolioEngineOrder.orderBaseAsset.actualSize.value = order.amount
        }

        recalculateActualSize()
        recalculateSizePlaced()

        function recalculateActualSize() {
            /*
            We will recalculate the Quoted Asset Actual Size. This will also give to it an initial value. 
            In the next formula, we are unsing the rate of the order because we dont know yet the Actual Rate.
            This rate might be replaced afteerwards for the Actual Rate when this is calculated again once 
            the Actual Rate is known. 
             */
            portfolioEngineOrder.orderQuotedAsset.actualSize.value = portfolioEngineOrder.orderBaseAsset.actualSize.value * portfolioEngineOrder.rate.value

            portfolioEngineOrder.orderBaseAsset.actualSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderBaseAsset.actualSize.value, 10)
            portfolioEngineOrder.orderQuotedAsset.actualSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderQuotedAsset.actualSize.value, 10)
        }

        function recalculateSizePlaced() {
            /* 
            We will also recalculate the Size Placed that was previously calculated with the order Size, 
            and now we will do it with the order Actual Size.
 
            We need to unaccount the previous size placed and correctly account
            for the the new actual sizes we now know.
            */
            portfolioEngineStage.stageBaseAsset.sizePlaced.value =
                portfolioEngineStage.stageBaseAsset.sizePlaced.value -
                portfolioEngineOrder.orderBaseAsset.size.value

            portfolioEngineStage.stageBaseAsset.sizePlaced.value =
                portfolioEngineStage.stageBaseAsset.sizePlaced.value +
                portfolioEngineOrder.orderBaseAsset.actualSize.value

            portfolioEngineStage.stageQuotedAsset.sizePlaced.value =
                portfolioEngineStage.stageQuotedAsset.sizePlaced.value -
                portfolioEngineOrder.orderQuotedAsset.size.value

            portfolioEngineStage.stageQuotedAsset.sizePlaced.value =
                portfolioEngineStage.stageQuotedAsset.sizePlaced.value +
                portfolioEngineOrder.orderQuotedAsset.actualSize.value

            portfolioEngineStage.stageBaseAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageBaseAsset.sizePlaced.value, 10)
            portfolioEngineStage.stageQuotedAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageQuotedAsset.sizePlaced.value, 10)
        }
    }

    async function actualRateCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage) {
        /* 
        Actual Rate Calculation: Let's remember that the exchange may not take the rate
        we send it with the order (in Limit orders) and for any reason change it a little bit.
        For example we might have sent a rate with too many decimals and the exchange truncate
        them. Another thing that might happen is that we send a rate that is matching orders already
        at the order book. In this case we would get an actual rate not only different than the one 
        we sent, but also, better since the portfolio engine inside the exchange would match orders
        with the first orders best by price. 
        
        In the case of Market Orders we don't even send a rate. For all those reason 
        we get and store the Actual Rate at which the order was filled. 
        */
        if (order.average !== undefined) {
            /*
            We will use the average whenever is available. As of today it is not 100% clear when this is
            available, but it seems sometimes it is not. In those cases we use the price.
            */
            portfolioEngineOrder.orderStatistics.actualRate.value = order.average
        } else if (order.price !== undefined) {
            /*
            We use the order.price when the average is not available.
            */
            portfolioEngineOrder.orderStatistics.actualRate.value = order.price
        }

        portfolioEngineOrder.orderStatistics.actualRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderStatistics.actualRate.value, 10)

        /*
        If the Actual Rate happens to be exctly the same than the order rate, then there is
        nothing else to do here. Otherwise there are adjustments to be made.
        */
        if (portfolioEngineOrder.orderStatistics.actualRate.value === portfolioEngineOrder.rate.value) { return }

        let previousQuotedAssetActualSize = portfolioEngineOrder.orderQuotedAsset.actualSize.value

        recalculateActualSize()
        recalculateSizePlaced()

        function recalculateActualSize() {
            /*
            Now we know the Actual Rate at which the order was filled. Since the actual rate
            is not the same as the Rate we defined for the order, we need to synchronize 
            the Actual Order Size for Quoted Asset since it was calculated with the Order Size that we 
            now know it is not the one really used at the exchange. We will recalculate the
            Actual Size in Quoted Asset and not in Base Asset, since the Actual Size in Base Asset 
            is the one we accepted by the exchange, so that is fixed, regardless of how we initially
            got the Order Size in Base Asset, either from direct imput from the user or calculated
            from the Order Size in Quoted Asset input it by the user. So here we go. 
            */
            previousQuotedAssetActualSize = portfolioEngineOrder.orderQuotedAsset.actualSize.value

            portfolioEngineOrder.orderQuotedAsset.actualSize.value =
                portfolioEngineOrder.orderBaseAsset.actualSize.value *
                portfolioEngineOrder.orderStatistics.actualRate.value

            portfolioEngineOrder.orderQuotedAsset.actualSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderQuotedAsset.actualSize.value, 10)

            const message = 'Calculating - Actual Size Recalculated'
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
            let previousStageQuotedAssetSizePlaced = portfolioEngineStage.stageQuotedAsset.sizePlaced.value
            /*
            Since we changed the Actual Size in Quoted Asset, we need to fix the Size Placed in Quoted Asset
            that was previously calculated with the previous value of actualSize.
            */
            portfolioEngineStage.stageQuotedAsset.sizePlaced.value =
                portfolioEngineStage.stageQuotedAsset.sizePlaced.value -
                previousQuotedAssetActualSize

            portfolioEngineStage.stageQuotedAsset.sizePlaced.value =
                portfolioEngineStage.stageQuotedAsset.sizePlaced.value +
                portfolioEngineOrder.orderQuotedAsset.actualSize.value

            portfolioEngineStage.stageQuotedAsset.sizePlaced.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineStage.stageQuotedAsset.sizePlaced.value, 10)

            const message = 'Calculating - Size Placed Recalculated'
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

    async function feesToBePaidCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage) {
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

    async function percentageFilledCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage) {
        /* 
        Percentage Filled Calculation: The only relevant information we get from the exchange is the order.filled.
        We know this field will go up until reaching the Actual Size. Once it reaches that number
        the order will be 100% filled. 
        */
        if (order.filled !== undefined) {
            portfolioEngineOrder.orderStatistics.percentageFilled.value = order.filled * 100 / portfolioEngineOrder.orderBaseAsset.actualSize.value
            portfolioEngineOrder.orderStatistics.percentageFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderStatistics.percentageFilled.value, 10)
        }
    }

    async function feesPaidCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage) {
        /*
        Within the order information received from the exchange we can not see the fees paid so we need to
        calculate them ourselves. Knwowing the Fees Paid is critical to later update the balances correctly,
        since at every trade we will receive less than just the Actual Size. In fact we will receive the Actual
        Size minus the Fees Paid.

        The percentage at which the exchange will charge fees needs to be configured at the the Session Fees Parameters.        
        */
        switch (portfolioEngineOrder.type) {
            case 'Market Order': {
                await applyFeePercentage(
                    'feesPaid',
                    portfolioEngineOrder,
                    portfolioSystemOrder,
                    sessionParameters.feeStructure.config.taker,
                    portfolioEngineOrder.orderStatistics.percentageFilled.value
                )
                break
            }
            case 'Limit Order': {
                await applyFeePercentage(
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

    async function sizeFilledCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage) {
        /* 
        CCXT returns order.filled with an amount denominated in Base Asset. We will
        take it from there for our Order Base Asset. The amount in order.filled does
        not reflect the Fees Paid, even if we are paying the fees in Base Asset. 
        */
        if (order.filled !== undefined) {
            portfolioEngineOrder.orderBaseAsset.sizeFilled.value = order.filled
            portfolioEngineOrder.orderBaseAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderBaseAsset.sizeFilled.value, 10)
        }
        /*
        For Quoted Asset, CCXT does not return any field with the size filled, so we 
        need to calculate that by ourselves. 
        */
        portfolioEngineOrder.orderQuotedAsset.sizeFilled.value =
            portfolioEngineOrder.orderQuotedAsset.actualSize.value * portfolioEngineOrder.orderStatistics.percentageFilled.value / 100

        portfolioEngineOrder.orderQuotedAsset.sizeFilled.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngineOrder.orderQuotedAsset.sizeFilled.value, 10)
    }

    async function amountReceivedCalculation(portfolioEngineStage, portfolioSystemOrder, portfolioEngineOrder, order, applyFeePercentage) {
        /* 
        This calculation is for informational purposes, so that users do not have to calculate
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
