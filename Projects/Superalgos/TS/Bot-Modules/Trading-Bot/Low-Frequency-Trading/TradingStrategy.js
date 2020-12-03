exports.newSuperalgosBotModulesTradingStrategy = function (processIndex, tradingEngineModuleObject) {
    /*
    This module packages all functions related to Strategies.
    */
    const MODULE_NAME = 'Trading Strategy'
    let thisObject = {
        mantain: mantain,
        reset: reset,
        openStrategy: openStrategy,
        closeStrategy: closeStrategy,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let sessionParameters

    return thisObject

    function initialize() {
        tradingEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters
    }

    function finalize() {
        tradingEngine = undefined
        sessionParameters = undefined
    }

    function mantain() {
        updateCounters()
        updateEnds()
    }

    function reset() {
        resetTradingEngineDataStructure()
    }

    function openStrategy(index, situationName, strategyName) {
        /* Starting begin and end */
        tradingEngine.current.strategy.begin.value = tradingEngine.current.episode.cycle.lastBegin.value
        tradingEngine.current.strategy.end.value = tradingEngine.current.episode.cycle.lastEnd.value

        /* Recording the opening at the Trading Engine Data Structure */
        tradingEngine.current.strategy.status.value = 'Open'
        tradingEngine.current.strategy.serialNumber.value = tradingEngine.current.episode.episodeCounters.strategies.value
        tradingEngine.current.strategy.identifier.value = TS.projects.superalgos.utilities.miscellaneousFunctions.genereteUniqueId()
        tradingEngine.current.strategy.beginRate.value = tradingEngine.current.episode.candle.min.value

        tradingEngine.current.strategy.index.value = index
        tradingEngine.current.strategy.situationName.value = situationName
        tradingEngine.current.strategy.strategyName.value = strategyName

        /* Updating Episode Counters */
        tradingEngine.current.episode.episodeCounters.strategies.value++
    }

    function closeStrategy(exitType) {
        tradingEngine.current.strategy.status.value = 'Closed'
        tradingEngine.current.strategy.exitType.value = exitType
        tradingEngine.current.strategy.end.value = tradingEngine.current.episode.cycle.lastEnd.value
        tradingEngine.current.strategy.endRate.value = tradingEngine.current.episode.candle.min.value
        /*
        Now that the strategy is closed, it is the right time to move this strategy from current to last at the Trading Engine data structure.
        */
        tradingEngineModuleObject.cloneValues(tradingEngine.current.strategy, tradingEngine.last.strategy)
    }

    function updateEnds() {
        if (tradingEngine.current.strategy.status.value === 'Open') {
            tradingEngine.current.strategy.end.value = tradingEngine.current.strategy.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.current.strategy.endRate.value = tradingEngine.current.episode.candle.close.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.current.strategy.status.value === 'Closed') {
            tradingEngineModuleObject.initializeNode(tradingEngine.current.strategy)
        }
    }

    function updateCounters() {
        if (tradingEngine.current.strategy.status.value === 'Open') {
            tradingEngine.current.strategy.strategyCounters.periods.value++
        }
    }
}