exports.newTradingRecords = function newTradingRecords(bot, logger) {

    const MODULE_NAME = 'Trading Records'

    let thisObject = {
        addSimulationRecord: addSimulationRecord,
        addConditionsRecord: addConditionsRecord,
        addStrategyRecord: addStrategyRecord,
        addPositionRecord: addPositionRecord,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine

    return thisObject

    function initialize() {
        tradingEngine = bot.TRADING_ENGINE
    }

    function finalize() {
        tradingEngine = undefined
    }

    function addSimulationRecord() {
        /* Simulation Record */
        let simulationRecord

        if (tradingEngine.current.balance.baseAsset.value === Infinity) {
            tradingEngine.current.balance.baseAsset.value = Number.MAX_SAFE_INTEGER
        }

        if (tradingEngine.current.balance.quotedAsset.value === Infinity) {
            tradingEngine.current.balance.quotedAsset.value = Number.MAX_SAFE_INTEGER
        }

        simulationRecord = [
            candle.begin,
            candle.end,
            tradingEngine.current.balance.baseAsset.value,
            tradingEngine.current.balance.quotedAsset.value,
            tradingEngine.episode.episodeStatistics.profitLoss.value,
            tradingEngine.last.position.profitLoss.value,
            tradingEngine.current.position.stopLoss.value,
            tradingEngine.episode.positionCounters.positions.value,
            tradingEngine.episode.episodeCounters.hits.value,
            tradingEngine.episode.episodeCounters.fails.value,
            tradingEngine.episode.episodeStatistics.hitRatio.value,
            tradingEngine.episode.episodeStatistics.ROI.value,
            tradingEngine.episode.episodeCounters.periods,
            tradingEngine.episode.episodeStatistics.days,
            tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value,
            tradingEngine.current.position.rate.value,
            tradingEngine.last.position.ROI.value,
            tradingEngine.current.position.takeProfit.value,
            tradingEngine.current.position.stopLoss.stopLossPhase.value,
            tradingEngine.current.position.takeProfit.takeProfitPhase.value,
            tradingEngine.current.position.size.value,
            sessionParameters.sessionBaseAsset.config.initialBalance,
            sessionParameters.sessionBaseAsset.config.minimumBalance,
            sessionParameters.sessionBaseAsset.config.maximumBalance,
            sessionParameters.sessionQuotedAsset.config.initialBalance,
            sessionParameters.sessionQuotedAsset.config.minimumBalance,
            sessionParameters.sessionQuotedAsset.config.maximumBalance,
            '"' + sessionParameters.sessionBaseAsset.name + '"',
            '"' + sessionParameters.sessionQuotedAsset.name + '"',
            '"' + bot.market.marketBaseAsset + '"',
            '"' + bot.market.marketQuotedAsset + '"',
            tradingEngine.current.position.positionCounters.periods.value,
            tradingEngine.current.position.positionStatistics.days.value
        ]

        recordsArray.push(simulationRecord)
    }

    function addConditionsRecord() {
        /* Prepare the information for the Conditions File */
        let conditionsRecord = [
            candle.begin,
            candle.end,
            tradingEngine.current.strategy.index.value,
            tradingEngine.current.position.stopLoss.stopLossPhase.value,
            tradingEngine.current.position.takeProfit.takeProfitPhase.value,
            conditionsValues,
            formulasErrors,
            formulasValues
        ]

        conditionsArray.push(conditionsRecord)
    }

    function addStrategyRecord() {
        /*
        Lets see if there will be an open strategy ...
        Except if we are at the head of the market (remember we skipped the last candle for not being closed.)
        */
        if (tradingEngine.current.strategy.begin.value !== 0 && tradingEngine.current.strategy.end.value === 0 && currentCandleIndex === candles.length - 2 && lastCandle.end !== lastInstantOfTheDay) {
            tradingEngine.current.strategy.status.value = 'Open'
            tradingEngine.current.strategy.end.value = candle.end
        }

        /* Prepare the information for the Strategies File */
        if (tradingEngine.current.strategy.begin.value !== 0 && tradingEngine.current.strategy.end.value !== 0) {
            let strategyRecord = [
                tradingEngine.current.strategy.begin.value,
                tradingEngine.current.strategy.end.value,
                tradingEngine.current.strategy.status.value,
                tradingEngine.current.strategy.index.value,
                tradingEngine.current.strategy.beginRate.value,
                tradingEngine.current.strategy.endRate.value,
                '"' + tradingEngine.current.strategy.situationName.value + '"',
                '"' + tradingEngine.current.strategy.strategyName.value + '"'
            ]

            strategiesArray.push(strategyRecord)

            inializeCurrentStrategy()
        }
    }

    function addPositionRecord() {
        /*
        Lets see if there will be an open trade ...
        Except if we are at the head of the market (remember we skipped the last candle for not being closed.)
        */
        if (tradingEngine.current.position.begin.value !== 0 &&
            tradingEngine.current.position.end.value === 0 &&
            currentCandleIndex === candles.length - 2 &&
            lastCandle.end !== lastInstantOfTheDay) {

            /* This means the trade is open */
            tradingEngine.current.position.status.value = 2
            tradingEngine.current.position.end.value = candle.end
            tradingEngine.current.position.endRate.value = candle.close

            /* Here we will calculate the ongoing ROI */
            if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                tradingEngine.current.position.positionStatistics.ROI.value = (tradingEngine.current.position.rate.value - candle.close) / tradingEngine.current.position.rate.value * 100
            } else {
                tradingEngine.current.position.positionStatistics.ROI.value = (candle.close - tradingEngine.current.position.rate.value) / tradingEngine.current.position.rate.value * 100
            }
        }

        /* Prepare the information for the Positions File */
        if (tradingEngine.current.position.begin.value !== 0 && tradingEngine.current.position.end.value !== 0) {
            let positionRecord = [
                tradingEngine.current.position.begin.value,
                tradingEngine.current.position.end.value,
                tradingEngine.current.position.status.value,
                tradingEngine.current.position.positionStatistics.ROI.value,
                tradingEngine.current.position.beginRate.value,
                tradingEngine.current.position.endRate.value,
                tradingEngine.current.position.exitType.value,
                '"' + tradingEngine.current.position.situationName.value + '"'
            ]

            positionsArray.push(positionRecord)

            initializeCurrentPosition()
        }
    }
}