exports.newSuperalgosBotModulesTradingEpisode = function (processIndex) {
    /*
    This module packages all functions related to Episodes.
    */
    const MODULE_NAME = 'Trading Episode'
    let thisObject = {
        mantain: mantain,
        reset: reset,
        openEpisode: openEpisode,
        updateExitType: updateExitType,
        closeEpisode: closeEpisode,
        cycleBasedStatistics: cycleBasedStatistics,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let tradingSystem
    let sessionParameters

    return thisObject

    function initialize() {
        tradingSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters
    }

    function finalize() {
        tradingEngine = undefined
        tradingSystem = undefined
        sessionParameters = undefined
    }

    function mantain() {
        updateCounters()
        updateStatistics()
        updateEnds()
        updateDistanceToEventsCounters()
    }

    function reset() {
        resetTradingEngineDataStructure()
    }

    function openEpisode() {
        /* 
        This function is called each time the simulation starts. That does not mean the Episode 
        must be opened there, since it might happen that it is looping at the end of the market
        or the task / session was restarted. We will only execute if the episode was never opened before.
        */
        if (tradingEngine.tradingCurrent.episode.begin.value !== tradingEngine.tradingCurrent.episode.begin.config.initialValue) { return }

        /* Starting begin and end */
        tradingEngine.tradingCurrent.episode.begin.value = tradingEngine.tradingCurrent.episode.candle.begin.value
        tradingEngine.tradingCurrent.episode.end.value = tradingEngine.tradingCurrent.episode.candle.end.value

        /* Getting the begin Balance from the session configuration */
        tradingEngine.tradingCurrent.episode.episodeBaseAsset.beginBalance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        tradingEngine.tradingCurrent.episode.episodeQuotedAsset.beginBalance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* The current balance is also the begin balance, that is how this starts. */
        tradingEngine.tradingCurrent.episode.episodeBaseAsset.balance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        tradingEngine.tradingCurrent.episode.episodeQuotedAsset.balance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* Recording the opening at the Trading Engine Data Structure */
        tradingEngine.tradingCurrent.episode.status.value = 'Open'
        tradingEngine.tradingCurrent.episode.serialNumber.value = 1
        tradingEngine.tradingCurrent.episode.identifier.value = TS.projects.superalgos.utilities.miscellaneousFunctions.genereteUniqueId()
        tradingEngine.tradingCurrent.episode.beginRate.value = tradingEngine.tradingCurrent.episode.candle.close.value
    }

    function updateExitType(exitType) {
        tradingEngine.tradingCurrent.episode.exitType.value = exitType
    }

    function closeEpisode() {
        tradingEngine.tradingCurrent.episode.status.value = 'Closed'
        tradingEngine.tradingCurrent.episode.end.value = tradingEngine.tradingCurrent.episode.candle.end.value
        tradingEngine.tradingCurrent.episode.endRate.value = tradingEngine.tradingCurrent.episode.candle.close.value
        tradingEngine.tradingCurrent.episode.episodeBaseAsset.endBalance.value = tradingEngine.tradingCurrent.episode.episodeBaseAsset.balance.value
        tradingEngine.tradingCurrent.episode.episodeQuotedAsset.endBalance.value = tradingEngine.tradingCurrent.episode.episodeQuotedAsset.balance.value
    }

    function resetEpisode() {
        TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(tradingEngine.tradingCurrent.episode)
    }

    function updateEnds() {
        if (tradingEngine.tradingCurrent.episode.status.value === 'Open') {
            tradingEngine.tradingCurrent.episode.end.value = tradingEngine.tradingCurrent.episode.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.tradingCurrent.episode.endRate.value = tradingEngine.tradingCurrent.episode.candle.close.value
            tradingEngine.tradingCurrent.episode.episodeBaseAsset.endBalance.value = tradingEngine.tradingCurrent.episode.episodeBaseAsset.balance.value
            tradingEngine.tradingCurrent.episode.episodeQuotedAsset.endBalance.value = tradingEngine.tradingCurrent.episode.episodeQuotedAsset.balance.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.tradingCurrent.episode.status.value === 'Closed') {
            resetEpisode()
        }
    }

    function updateCounters() {
        if (tradingEngine.tradingCurrent.episode.status.value === 'Open') {
            tradingEngine.tradingCurrent.episode.episodeCounters.periods.value++
        }
    }

    function updateStatistics() {

        /* Daus Calculation */
        tradingEngine.tradingCurrent.episode.episodeStatistics.days.value =
            tradingEngine.tradingCurrent.episode.episodeCounters.periods.value *
            sessionParameters.timeFrame.config.value /
            TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculateEpisodeStatistics()

        function calculateAssetsStatistics() {
            /* Updating Profit Loss */
            tradingEngine.tradingCurrent.episode.episodeBaseAsset.profitLoss.value =
                tradingEngine.tradingCurrent.episode.episodeBaseAsset.balance.value -
                sessionParameters.sessionBaseAsset.config.initialBalance

            tradingEngine.tradingCurrent.episode.episodeQuotedAsset.profitLoss.value =
                tradingEngine.tradingCurrent.episode.episodeQuotedAsset.balance.value -
                sessionParameters.sessionQuotedAsset.config.initialBalance

            tradingEngine.tradingCurrent.episode.episodeBaseAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeBaseAsset.profitLoss.value, 10)
            tradingEngine.tradingCurrent.episode.episodeQuotedAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeQuotedAsset.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            tradingEngine.tradingCurrent.episode.episodeBaseAsset.ROI.value =
                tradingEngine.tradingCurrent.episode.episodeBaseAsset.profitLoss.value /
                tradingEngine.tradingCurrent.episode.episodeBaseAsset.beginBalance.value * 100

            tradingEngine.tradingCurrent.episode.episodeQuotedAsset.ROI.value =
                tradingEngine.tradingCurrent.episode.episodeQuotedAsset.profitLoss.value /
                tradingEngine.tradingCurrent.episode.episodeQuotedAsset.beginBalance.value * 100

            tradingEngine.tradingCurrent.episode.episodeBaseAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeBaseAsset.ROI.value, 10)
            tradingEngine.tradingCurrent.episode.episodeQuotedAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeQuotedAsset.ROI.value, 10)

            /* Updating Hit Ratio */
            if (tradingEngine.tradingCurrent.episode.episodeCounters.positions.value > 0) {
                tradingEngine.tradingCurrent.episode.episodeBaseAsset.hitRatio.value =
                    tradingEngine.tradingCurrent.episode.episodeBaseAsset.hits.value /
                    tradingEngine.tradingCurrent.episode.episodeCounters.positions.value

                tradingEngine.tradingCurrent.episode.episodeQuotedAsset.hitRatio.value =
                    tradingEngine.tradingCurrent.episode.episodeQuotedAsset.hits.value /
                    tradingEngine.tradingCurrent.episode.episodeCounters.positions.value

                tradingEngine.tradingCurrent.episode.episodeBaseAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeBaseAsset.hitRatio.value, 10)
                tradingEngine.tradingCurrent.episode.episodeQuotedAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeQuotedAsset.hitRatio.value, 10)
            }

            /* 
            Updating Annualized Rate Of Return 
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            tradingEngine.tradingCurrent.episode.episodeBaseAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        tradingEngine.tradingCurrent.episode.episodeBaseAsset.beginBalance.value +
                        tradingEngine.tradingCurrent.episode.episodeBaseAsset.profitLoss.value
                    ) / tradingEngine.tradingCurrent.episode.episodeBaseAsset.beginBalance.value
                    ,
                    (365 / tradingEngine.tradingCurrent.episode.episodeStatistics.days.value)
                ) - 1

            tradingEngine.tradingCurrent.episode.episodeQuotedAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        tradingEngine.tradingCurrent.episode.episodeQuotedAsset.beginBalance.value +
                        tradingEngine.tradingCurrent.episode.episodeQuotedAsset.profitLoss.value
                    ) / tradingEngine.tradingCurrent.episode.episodeQuotedAsset.beginBalance.value
                    ,
                    (365 / tradingEngine.tradingCurrent.episode.episodeStatistics.days.value)
                ) - 1

            tradingEngine.tradingCurrent.episode.episodeBaseAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeBaseAsset.annualizedRateOfReturn.value, 10)
            tradingEngine.tradingCurrent.episode.episodeQuotedAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeQuotedAsset.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (tradingEngine.tradingCurrent.episode.episodeBaseAsset.profitLoss.value > 0) {
                tradingEngine.tradingCurrent.episode.episodeBaseAsset.hitFail.value = 'Hit'
            } else {
                tradingEngine.tradingCurrent.episode.episodeBaseAsset.hitFail.value = 'Fail'
            }
            if (tradingEngine.tradingCurrent.episode.episodeQuotedAsset.profitLoss.value > 0) {
                tradingEngine.tradingCurrent.episode.episodeQuotedAsset.hitFail.value = 'Hit'
            } else {
                tradingEngine.tradingCurrent.episode.episodeQuotedAsset.hitFail.value = 'Fail'
            }
        }

        function calculateEpisodeStatistics() {
            /* Updating Profit Loss */
            tradingEngine.tradingCurrent.episode.episodeStatistics.profitLoss.value =
                tradingEngine.tradingCurrent.episode.episodeBaseAsset.profitLoss.value * tradingEngine.tradingCurrent.episode.candle.close.value +
                tradingEngine.tradingCurrent.episode.episodeQuotedAsset.profitLoss.value

            tradingEngine.tradingCurrent.episode.episodeStatistics.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeStatistics.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            tradingEngine.tradingCurrent.episode.episodeStatistics.ROI.value =
                (
                    tradingEngine.tradingCurrent.episode.episodeBaseAsset.profitLoss.value * tradingEngine.tradingCurrent.episode.endRate.value +
                    tradingEngine.tradingCurrent.episode.episodeQuotedAsset.profitLoss.value
                ) / (
                    tradingEngine.tradingCurrent.episode.episodeBaseAsset.beginBalance.value * tradingEngine.tradingCurrent.episode.beginRate.value +
                    tradingEngine.tradingCurrent.episode.episodeQuotedAsset.beginBalance.value
                ) * 100

            tradingEngine.tradingCurrent.episode.episodeStatistics.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeStatistics.ROI.value, 10)

            /* 
            Updating Annualized Rate Of Return
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            tradingEngine.tradingCurrent.episode.episodeStatistics.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        tradingEngine.tradingCurrent.episode.episodeBaseAsset.beginBalance.value * tradingEngine.tradingCurrent.episode.beginRate.value +
                        tradingEngine.tradingCurrent.episode.episodeQuotedAsset.beginBalance.value +
                        tradingEngine.tradingCurrent.episode.episodeBaseAsset.profitLoss.value +
                        tradingEngine.tradingCurrent.episode.episodeQuotedAsset.profitLoss.value
                    ) /
                    (
                        tradingEngine.tradingCurrent.episode.episodeBaseAsset.beginBalance.value * tradingEngine.tradingCurrent.episode.beginRate.value +
                        tradingEngine.tradingCurrent.episode.episodeQuotedAsset.beginBalance.value
                    )
                    ,
                    (365 / tradingEngine.tradingCurrent.episode.episodeStatistics.days.value)
                ) - 1

            tradingEngine.tradingCurrent.episode.episodeStatistics.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.episode.episodeStatistics.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (tradingEngine.tradingCurrent.episode.episodeStatistics.profitLoss.value > 0) {
                tradingEngine.tradingCurrent.episode.episodeStatistics.hitFail.value = 'Hit'
            } else {
                tradingEngine.tradingCurrent.episode.episodeStatistics.hitFail.value = 'Fail'
            }
        }
    }

    function updateDistanceToEventsCounters() {
        /* Keeping Distance Counters Up-to-date while avoinding counting before the first event happens. */
        if (
            tradingEngine.tradingCurrent.episode.distanceToEvent.triggerOn.value > 0
        ) {
            tradingEngine.tradingCurrent.episode.distanceToEvent.triggerOn.value++
        }

        if (
            tradingEngine.tradingCurrent.episode.distanceToEvent.triggerOff.value > 0
        ) {
            tradingEngine.tradingCurrent.episode.distanceToEvent.triggerOff.value++
        }

        if (
            tradingEngine.tradingCurrent.episode.distanceToEvent.takePosition.value > 0
        ) {
            tradingEngine.tradingCurrent.episode.distanceToEvent.takePosition.value++
        }

        if (
            tradingEngine.tradingCurrent.episode.distanceToEvent.closePosition.value > 0
        ) {
            tradingEngine.tradingCurrent.episode.distanceToEvent.closePosition.value++
        }

        if (
            tradingEngine.tradingCurrent.episode.distanceToEvent.nextPhase.value > 0
        ) {
            tradingEngine.tradingCurrent.episode.distanceToEvent.nextPhase.value++
        }

        if (
            tradingEngine.tradingCurrent.episode.distanceToEvent.moveToPhase.value > 0
        ) {
            tradingEngine.tradingCurrent.episode.distanceToEvent.moveToPhase.value++
        }

        if (
            tradingEngine.tradingCurrent.episode.distanceToEvent.createOrder.value > 0
        ) {
            tradingEngine.tradingCurrent.episode.distanceToEvent.createOrder.value++
        }

        if (
            tradingEngine.tradingCurrent.episode.distanceToEvent.cancelOrder.value > 0
        ) {
            tradingEngine.tradingCurrent.episode.distanceToEvent.cancelOrder.value++
        }

        if (
            tradingEngine.tradingCurrent.episode.distanceToEvent.closeOrder.value > 0
        ) {
            tradingEngine.tradingCurrent.episode.distanceToEvent.closeOrder.value++
        }
    }
}