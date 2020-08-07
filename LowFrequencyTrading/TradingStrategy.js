exports.newTradingStrategy = function newTradingStrategy(bot, logger, tradingEngineModule) {
    /*
    This module packages all functions related to Strategies.
    */
    const MODULE_NAME = 'Trading Strategy'
    let thisObject = {
        openStrategy: openStrategy,
        closeStrategy: closeStrategy,
        updateEnds: updateEnds,
        resetTradingEngineDataStructure: resetTradingEngineDataStructure,
        updateCounters: updateCounters,
        resetStrategy: resetStrategy,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine

    return thisObject

    function initialize() {
        tradingEngine = bot.simulationState.tradingEngine
    }

    function finalize() {
        tradingEngine = undefined
    }

    function openStrategy(index, situationName, strategyName) {
        tradingEngine.current.strategy.status.value = 'Open'
        tradingEngine.current.strategy.serialNumber.value = tradingEngine.current.episode.episodeCounters.strategies.value
        tradingEngine.current.strategy.identifier.value = global.UNIQUE_ID()
        tradingEngine.current.strategy.begin.value = tradingEngine.current.candle.begin.value
        tradingEngine.current.strategy.end.value = tradingEngine.current.candle.end.value
        tradingEngine.current.strategy.beginRate.value = tradingEngine.current.candle.min.value

        tradingEngine.current.strategy.index.value = index
        tradingEngine.current.strategy.situationName.value = situationName
        tradingEngine.current.strategy.strategyName.value = strategyName

        /* Updating Episode Counters */
        tradingEngine.current.episode.episodeCounters.strategies.value++
    }

    function closeStrategy(exitType) {
        tradingEngine.current.strategy.status.value = 'Closed'
        tradingEngine.current.strategy.exitType.value = exitType
        tradingEngine.current.strategy.end.value = tradingEngine.current.candle.end.value
        tradingEngine.current.strategy.endRate.value = tradingEngine.current.candle.min.value
        /*
        Now that the strategy is closed, it is the right time to move this strategy from current to last at the Trading Engine data structure.
        */
        tradingEngineModule.cloneValues(tradingEngine.current.strategy, tradingEngine.last.strategy)
    }

    function resetStrategy() {
        tradingEngine.current.strategy.initialize(tradingEngine.current.strategy)
    }

    function updateEnds() {
        if (tradingEngine.current.strategy.status.value === 'Open') {
            tradingEngine.current.strategy.end.value = tradingEngine.current.candle.end.value
            tradingEngine.current.strategy.endRate.value = tradingEngine.current.candle.close.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.current.strategy.status.value === 'Closed') {
            resetStrategy()
        }
    }

    function updateCounters() {
        if (tradingEngine.current.strategy.status.value === 'Open') {
            tradingEngine.current.strategy.strategyCounters.periods.value++
        }
    }
}