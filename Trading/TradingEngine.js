exports.newTradingEngine = function newTradingEngine(bot, logger) {

    const MODULE_NAME = 'Trading Engine'

    let thisObject = {
        updatePositionCounters: updatePositionCounters,
        updateDistanceToEventsCounters: updateDistanceToEventsCounters,
        getReadyToTakePosition: getReadyToTakePosition,
        takePosition: takePosition,
        getReadyToClosePosition: getReadyToClosePosition,
        closePosition: closePosition,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine

    return thisObject

    function initialize() {
        /* Here we will go through all the nodes in the Trading Engine hiriarchy and apply the initial value to the value property when needed */

        tradingEngine = bot.TRADING_ENGINE

        if (tradingEngine.isInitialized !== true || bot.RESUME === false) {
            tradingEngine.isInitialized = true
            initializeNode(tradingEngine)
        }
    }

    function finalize() {
        tradingEngine = undefined
    }

    function initializeNode(node) {
        if (node === undefined) { return }

        /* Here we initialize the node value */
        if (node.config !== undefined) {
            if (node.config.initialValue !== undefined) {
                node.value = node.config.initialValue
            }
        }

        /* Now we go down through all this node children */
        let nodeDefinition = bot.APP_SCHEMA_MAP.get(node.type)
        if (nodeDefinition === undefined) { return }

        if (nodeDefinition.properties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (node[property.name] !== undefined) {
                                initializeNode(node[property.name])
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
                            object[property.name] = []
                            for (let m = 0; m < nodePropertyArray.length; m++) {
                                initializeNode(nodePropertyArray[m])
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function updatePositionCounters() {
        /* Keeping Position Counters Up-to-date */
        if (
            (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage')
        ) {
            if (takePositionNow === true) {
                tradingEngine.current.position.positionCounters.periods.value = 0
            }

            tradingEngine.current.position.positionCounters.periods.value++
            tradingEngine.current.position.positionStatistics.days.value = tradingEngine.current.position.positionCounters.periods.value * sessionParameters.timeFrame.config.value / ONE_DAY_IN_MILISECONDS
        } else {
            tradingEngine.current.position.positionCounters.periods.value = 0
            tradingEngine.current.position.positionStatistics.days.value = 0
        }
    }

    function updateDistanceToEventsCounters() {
        /* Keeping Distance Counters Up-to-date */
        if (
            tradingEngine.current.distanceToEvent.triggerOn.value > 0 // with this we avoind counting before the first event happens.
        ) {
            tradingEngine.current.distanceToEvent.triggerOn.value++
        }

        if (
            tradingEngine.current.distanceToEvent.triggerOff.value > 0 // with this we avoind counting before the first event happens.
        ) {
            tradingEngine.current.distanceToEvent.triggerOff.value++
        }

        if (
            tradingEngine.current.distanceToEvent.takePosition.value > 0 // with this we avoind counting before the first event happens.
        ) {
            tradingEngine.current.distanceToEvent.takePosition.value++
        }

        if (
            tradingEngine.current.distanceToEvent.closePosition.value > 0 // with this we avoind counting before the first event happens.
        ) {
            tradingEngine.current.distanceToEvent.closePosition.value++
        }
    }

    function getReadyToTakePosition(candle) {
        /* Inicializing this counter */
        tradingEngine.current.distanceToEvent.takePosition.value = 1

        /* Position size and rate */
        tradingEngine.current.position.size.value = getPositionSize()
        tradingEngine.current.position.rate.value = getPositionRate()

        /* We take what was calculated at the formula and apply the slippage. */
        let slippageAmount = tradingEngine.current.position.rate.value * bot.VALUES_TO_USE.slippage.positionRate / 100

        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
            tradingEngine.current.position.rate.value = tradingEngine.current.position.rate.value - slippageAmount
        } else {
            tradingEngine.current.position.rate.value = tradingEngine.current.position.rate.value + slippageAmount
        }

        /* Update the trade record information. */
        tradingEngine.current.position.begin.value = candle.begin
        tradingEngine.current.position.beginRate.value = tradingEngine.current.position.rate.value
    }

    function takePosition() {
        calculateTakeProfit() // TODO: Check if this is really necesary
        calculateStopLoss() // TODO: Check if this is really necesary

        tradingEngine.previous.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value
        tradingEngine.previous.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value

        tradingEngine.last.position.profitLoss.value = 0
        tradingEngine.last.position.ROI.value = 0

        let feePaid = 0

        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
            feePaid = tradingEngine.current.position.size.value * tradingEngine.current.position.rate.value * bot.VALUES_TO_USE.feeStructure.taker / 100

            tradingEngine.current.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value + tradingEngine.current.position.size.value * tradingEngine.current.position.rate.value - feePaid
            tradingEngine.current.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value - tradingEngine.current.position.size.value
        } else {
            feePaid = tradingEngine.current.position.size.value / tradingEngine.current.position.rate.value * bot.VALUES_TO_USE.feeStructure.taker / 100

            tradingEngine.current.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value + tradingEngine.current.position.size.value / tradingEngine.current.position.rate.value - feePaid
            tradingEngine.current.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value - tradingEngine.current.position.size.value
        }
    }

    function getReadyToClosePosition() {
        /* Inicializing this counter */
        tradingEngine.current.distanceToEvent.closePosition.value = 1

        /* Position size and rate */
        let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
    }

    function closePosition() {
        tradingEngine.episode.positionCounters.positions.value++

        let feePaid = 0

        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {

            feePaid = tradingEngine.current.balance.quotedAsset.value / tradingEngine.current.position.endRate.value * bot.VALUES_TO_USE.feeStructure.taker / 100

            tradingEngine.current.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value + tradingEngine.current.balance.quotedAsset.value / tradingEngine.current.position.endRate.value - feePaid
            tradingEngine.current.balance.quotedAsset.value = 0
        } else {

            feePaid = tradingEngine.current.balance.baseAsset.value * tradingEngine.current.position.endRate.value * bot.VALUES_TO_USE.feeStructure.taker / 100

            tradingEngine.current.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value + tradingEngine.current.balance.baseAsset.value * tradingEngine.current.position.endRate.value - feePaid
            tradingEngine.current.balance.baseAsset.value = 0
        }

        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
            tradingEngine.last.position.profitLoss.value = tradingEngine.current.balance.baseAsset.value - tradingEngine.previous.balance.baseAsset.value
            tradingEngine.last.position.ROI.value = tradingEngine.last.position.profitLoss.value * 100 / tradingEngine.current.position.size.value
            if (isNaN(tradingEngine.last.position.ROI.value)) { tradingEngine.last.position.ROI.value = 0 }
            tradingEngine.episode.episodeStatistics.profitLoss.value = tradingEngine.current.balance.baseAsset.value - sessionParameters.sessionBaseAsset.config.initialBalance
        } else {
            tradingEngine.last.position.profitLoss.value = tradingEngine.current.balance.quotedAsset.value - tradingEngine.previous.balance.quotedAsset.value
            tradingEngine.last.position.ROI.value = tradingEngine.last.position.profitLoss.value * 100 / tradingEngine.current.position.size.value
            if (isNaN(tradingEngine.last.position.ROI.value)) { tradingEngine.last.position.ROI.value = 0 }
            tradingEngine.episode.episodeStatistics.profitLoss.value = tradingEngine.current.balance.quotedAsset.value - sessionParameters.sessionQuotedAsset.config.initialBalance
        }

        tradingEngine.current.position.positionStatistics.ROI.value = tradingEngine.last.position.ROI.value

        if (tradingEngine.last.position.profitLoss.value > 0) {
            tradingEngine.episode.episodeCounters.hits.value++
        } else {
            tradingEngine.episode.episodeCounters.fails.value++
        }

        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
            tradingEngine.episode.episodeStatistics.ROI.value = (sessionParameters.sessionBaseAsset.config.initialBalance + tradingEngine.episode.episodeStatistics.profitLoss.value) / sessionParameters.sessionBaseAsset.config.initialBalance - 1
            tradingEngine.episode.episodeStatistics.hitRatio.value = tradingEngine.episode.episodeCounters.hits.value / tradingEngine.episode.positionCounters.positions.value
            tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value = tradingEngine.episode.episodeStatistics.ROI.value / tradingEngine.episode.episodeStatistics.days * 365
        } else {
            tradingEngine.episode.episodeStatistics.ROI.value = (sessionParameters.sessionQuotedAsset.config.initialBalance + tradingEngine.episode.episodeStatistics.profitLoss.value) / sessionParameters.sessionQuotedAsset.config.initialBalance - 1
            tradingEngine.episode.episodeStatistics.hitRatio.value = tradingEngine.episode.episodeCounters.hits.value / tradingEngine.episode.positionCounters.positions.value
            tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value = tradingEngine.episode.episodeStatistics.ROI.value / tradingEngine.episode.episodeStatistics.days * 365
        }

        addRecords()

        tradingEngine.current.position.stopLoss.value = 0
        tradingEngine.current.position.takeProfit.value = 0

        tradingEngine.current.position.rate.value = 0
        tradingEngine.current.position.size.value = 0

        timerToCloseStage = candle.begin
        tradingEngine.current.position.stopLoss.stopLossStage.value = 'No Stage'
        tradingEngine.current.position.takeProfit.takeProfitStage.value = 'No Stage'
        tradingEngine.current.position.stopLoss.stopLossPhase.value = -1
        tradingEngine.current.position.takeProfit.takeProfitPhase.value = -1

    }
}

