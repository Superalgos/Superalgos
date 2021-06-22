exports.newSuperalgosBotModulesTradingStrategy = function (processIndex) {
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
        tradingEngine.tradingCurrent.strategy.begin.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.lastBegin.value
        tradingEngine.tradingCurrent.strategy.end.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.lastEnd.value

        /* Recording the opening at the Trading Engine Data Structure */
        tradingEngine.tradingCurrent.strategy.status.value = 'Open'
        tradingEngine.tradingCurrent.strategy.serialNumber.value = tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.strategies.value
        tradingEngine.tradingCurrent.strategy.identifier.value = TS.projects.superalgos.utilities.miscellaneousFunctions.genereteUniqueId()
        tradingEngine.tradingCurrent.strategy.beginRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.min.value

        tradingEngine.tradingCurrent.strategy.index.value = index
        tradingEngine.tradingCurrent.strategy.situationName.value = situationName
        tradingEngine.tradingCurrent.strategy.strategyName.value = strategyName

        /* Updating Episode Counters */
        tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.strategies.value++
    }

    function closeStrategy(exitType) {
        tradingEngine.tradingCurrent.strategy.status.value = 'Closed'
        tradingEngine.tradingCurrent.strategy.exitType.value = exitType
        tradingEngine.tradingCurrent.strategy.end.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.lastEnd.value
        tradingEngine.tradingCurrent.strategy.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.min.value
        /*
        Now that the strategy is closed, it is the right time to move this strategy from current to last at the Trading Engine data structure.
        */
        TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.cloneValues(tradingEngine.tradingCurrent.strategy, tradingEngine.tradingLast.strategy)
    }

    function updateEnds() {
        if (tradingEngine.tradingCurrent.strategy.status.value === 'Open') {
            tradingEngine.tradingCurrent.strategy.end.value = tradingEngine.tradingCurrent.strategy.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.tradingCurrent.strategy.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.tradingCurrent.strategy.status.value === 'Closed') {
            TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(tradingEngine.tradingCurrent.strategy)
        }
    }

    function updateCounters() {
        if (tradingEngine.tradingCurrent.strategy.status.value === 'Open') {
            tradingEngine.tradingCurrent.strategy.strategyCounters.periods.value++
        }
    }
}