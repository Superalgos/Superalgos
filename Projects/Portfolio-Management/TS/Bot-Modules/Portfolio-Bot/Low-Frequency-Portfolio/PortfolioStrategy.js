exports.newPortfolioManagementBotModulesPortfolioStrategy = function (processIndex) {
    /*
    This module packages all functions related to Strategies.
    */

    let thisObject = {
        mantain: mantain,
        reset: reset,
        openStrategy: openStrategy,
        closeStrategy: closeStrategy,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioEngine
    let sessionParameters

    return thisObject

    function initialize() {
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters
    }

    function finalize() {
        portfolioEngine = undefined
        sessionParameters = undefined
    }

    function mantain() {
        updateCounters()
        updateEnds()
    }

    function reset() {
        resetPortfolioEngineDataStructure()
    }

    function openStrategy(index, situationName, strategyName) {
        /* Starting begin and end */
        portfolioEngine.portfolioCurrent.strategy.begin.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastBegin.value
        portfolioEngine.portfolioCurrent.strategy.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastEnd.value

        /* Recording the opening at the Portfolio Engine Data Structure */
        portfolioEngine.portfolioCurrent.strategy.status.value = 'Open'
        portfolioEngine.portfolioCurrent.strategy.serialNumber.value = portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.strategies.value
        portfolioEngine.portfolioCurrent.strategy.identifier.value = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
        portfolioEngine.portfolioCurrent.strategy.beginRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.min.value

        portfolioEngine.portfolioCurrent.strategy.index.value = index
        portfolioEngine.portfolioCurrent.strategy.situationName.value = situationName
        portfolioEngine.portfolioCurrent.strategy.strategyName.value = strategyName

        /* Updating Episode Counters */
        portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.strategies.value++
    }

    function closeStrategy(exitType) {
        portfolioEngine.portfolioCurrent.strategy.status.value = 'Closed'
        portfolioEngine.portfolioCurrent.strategy.exitType.value = exitType
        portfolioEngine.portfolioCurrent.strategy.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastEnd.value
        portfolioEngine.portfolioCurrent.strategy.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.min.value
        /*
        Now that the strategy is closed, it is the right time to move this strategy from current to last at the Portfolio Engine data structure.
        */
        TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.cloneValues(portfolioEngine.portfolioCurrent.strategy, portfolioEngine.portfolioLast.strategy)
    }

    function updateEnds() {
        if (portfolioEngine.portfolioCurrent.strategy.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategy.end.value = portfolioEngine.portfolioCurrent.strategy.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.strategy.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }
    }

    function resetPortfolioEngineDataStructure() {
        if (portfolioEngine.portfolioCurrent.strategy.status.value === 'Closed') {
            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.initializeNode(portfolioEngine.portfolioCurrent.strategy)
        }
    }

    function updateCounters() {
        if (portfolioEngine.portfolioCurrent.strategy.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategy.strategyCounters.periods.value++
        }
    }
}