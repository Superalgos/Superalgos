exports.newTradingEpisode = function (processIndex, logger, tradingEngineModule) {
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
        if (tradingEngine.current.episode.begin.value !== tradingEngine.current.episode.begin.config.initialValue) { return }

        /* Starting begin and end */
        tradingEngine.current.episode.begin.value = tradingEngine.current.episode.candle.begin.value
        tradingEngine.current.episode.end.value = tradingEngine.current.episode.candle.end.value

        /* Getting the begin Balance from the session configuration */
        tradingEngine.current.episode.episodeBaseAsset.beginBalance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        tradingEngine.current.episode.episodeQuotedAsset.beginBalance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* The current balance is also the begin balance, that is how this starts. */
        tradingEngine.current.episode.episodeBaseAsset.balance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        tradingEngine.current.episode.episodeQuotedAsset.balance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* Recording the opening at the Trading Engine Data Structure */
        tradingEngine.current.episode.status.value = 'Open'
        tradingEngine.current.episode.serialNumber.value = 1
        tradingEngine.current.episode.identifier.value = TS.projects.superalgos.utilities.miscellaneousFunctions.genereteUniqueId()
        tradingEngine.current.episode.beginRate.value = tradingEngine.current.episode.candle.close.value
    }

    function updateExitType(exitType) {
        tradingEngine.current.episode.exitType.value = exitType
    }

    function closeEpisode() {
        tradingEngine.current.episode.status.value = 'Closed'
        tradingEngine.current.episode.end.value = tradingEngine.current.episode.candle.end.value
        tradingEngine.current.episode.endRate.value = tradingEngine.current.episode.candle.close.value
        tradingEngine.current.episode.episodeBaseAsset.endBalance.value = tradingEngine.current.episode.episodeBaseAsset.balance.value
        tradingEngine.current.episode.episodeQuotedAsset.endBalance.value = tradingEngine.current.episode.episodeQuotedAsset.balance.value
    }

    function resetEpisode() {
        tradingEngineModule.initializeNode(tradingEngine.current.episode)
    }

    function updateEnds() {
        if (tradingEngine.current.episode.status.value === 'Open') {
            tradingEngine.current.episode.end.value = tradingEngine.current.episode.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.current.episode.endRate.value = tradingEngine.current.episode.candle.close.value
            tradingEngine.current.episode.episodeBaseAsset.endBalance.value = tradingEngine.current.episode.episodeBaseAsset.balance.value
            tradingEngine.current.episode.episodeQuotedAsset.endBalance.value = tradingEngine.current.episode.episodeQuotedAsset.balance.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.current.episode.status.value === 'Closed') {
            resetEpisode()
        }
    }

    function updateCounters() {
        if (tradingEngine.current.episode.status.value === 'Open') {
            tradingEngine.current.episode.episodeCounters.periods.value++
        }
    }

    function updateStatistics() {

        /* Daus Calculation */
        tradingEngine.current.episode.episodeStatistics.days.value =
            tradingEngine.current.episode.episodeCounters.periods.value *
            sessionParameters.timeFrame.config.value /
            TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculateEpisodeStatistics()

        function calculateAssetsStatistics() {
            /* Updating Profit Loss */
            tradingEngine.current.episode.episodeBaseAsset.profitLoss.value =
                tradingEngine.current.episode.episodeBaseAsset.balance.value -
                sessionParameters.sessionBaseAsset.config.initialBalance

            tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value =
                tradingEngine.current.episode.episodeQuotedAsset.balance.value -
                sessionParameters.sessionQuotedAsset.config.initialBalance

            tradingEngine.current.episode.episodeBaseAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeBaseAsset.profitLoss.value, 10)
            tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            tradingEngine.current.episode.episodeBaseAsset.ROI.value =
                tradingEngine.current.episode.episodeBaseAsset.profitLoss.value /
                tradingEngine.current.episode.episodeBaseAsset.beginBalance.value * 100

            tradingEngine.current.episode.episodeQuotedAsset.ROI.value =
                tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value /
                tradingEngine.current.episode.episodeQuotedAsset.beginBalance.value * 100

            tradingEngine.current.episode.episodeBaseAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeBaseAsset.ROI.value, 10)
            tradingEngine.current.episode.episodeQuotedAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeQuotedAsset.ROI.value, 10)

            /* Updating Hit Ratio */
            if (tradingEngine.current.episode.episodeCounters.positions.value > 0) {
                tradingEngine.current.episode.episodeBaseAsset.hitRatio.value =
                    tradingEngine.current.episode.episodeBaseAsset.hits.value /
                    tradingEngine.current.episode.episodeCounters.positions.value

                tradingEngine.current.episode.episodeQuotedAsset.hitRatio.value =
                    tradingEngine.current.episode.episodeQuotedAsset.hits.value /
                    tradingEngine.current.episode.episodeCounters.positions.value

                tradingEngine.current.episode.episodeBaseAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeBaseAsset.hitRatio.value, 10)
                tradingEngine.current.episode.episodeQuotedAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeQuotedAsset.hitRatio.value, 10)
            }

            /* 
            Updating Annualized Rate Of Return 
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            tradingEngine.current.episode.episodeBaseAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        tradingEngine.current.episode.episodeBaseAsset.beginBalance.value +
                        tradingEngine.current.episode.episodeBaseAsset.profitLoss.value
                    ) / tradingEngine.current.episode.episodeBaseAsset.beginBalance.value
                    ,
                    (365 / tradingEngine.current.episode.episodeStatistics.days.value)
                ) - 1

            tradingEngine.current.episode.episodeQuotedAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        tradingEngine.current.episode.episodeQuotedAsset.beginBalance.value +
                        tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value
                    ) / tradingEngine.current.episode.episodeQuotedAsset.beginBalance.value
                    ,
                    (365 / tradingEngine.current.episode.episodeStatistics.days.value)
                ) - 1

            tradingEngine.current.episode.episodeBaseAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeBaseAsset.annualizedRateOfReturn.value, 10)
            tradingEngine.current.episode.episodeQuotedAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeQuotedAsset.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (tradingEngine.current.episode.episodeBaseAsset.profitLoss.value > 0) {
                tradingEngine.current.episode.episodeBaseAsset.hitFail.value = 'Hit'
            } else {
                tradingEngine.current.episode.episodeBaseAsset.hitFail.value = 'Fail'
            }
            if (tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value > 0) {
                tradingEngine.current.episode.episodeQuotedAsset.hitFail.value = 'Hit'
            } else {
                tradingEngine.current.episode.episodeQuotedAsset.hitFail.value = 'Fail'
            }
        }

        function calculateEpisodeStatistics() {
            /* Updating Profit Loss */
            tradingEngine.current.episode.episodeStatistics.profitLoss.value =
                tradingEngine.current.episode.episodeBaseAsset.profitLoss.value * tradingEngine.current.episode.candle.close.value +
                tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value

            tradingEngine.current.episode.episodeStatistics.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeStatistics.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            tradingEngine.current.episode.episodeStatistics.ROI.value =
                (
                    tradingEngine.current.episode.episodeBaseAsset.profitLoss.value * tradingEngine.current.episode.endRate.value +
                    tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value
                ) / (
                    tradingEngine.current.episode.episodeBaseAsset.beginBalance.value * tradingEngine.current.episode.beginRate.value +
                    tradingEngine.current.episode.episodeQuotedAsset.beginBalance.value
                ) * 100

            tradingEngine.current.episode.episodeStatistics.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeStatistics.ROI.value, 10)

            /* 
            Updating Annualized Rate Of Return
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            tradingEngine.current.episode.episodeStatistics.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        tradingEngine.current.episode.episodeBaseAsset.beginBalance.value * tradingEngine.current.episode.beginRate.value +
                        tradingEngine.current.episode.episodeQuotedAsset.beginBalance.value +
                        tradingEngine.current.episode.episodeBaseAsset.profitLoss.value +
                        tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value
                    ) /
                    (
                        tradingEngine.current.episode.episodeBaseAsset.beginBalance.value * tradingEngine.current.episode.beginRate.value +
                        tradingEngine.current.episode.episodeQuotedAsset.beginBalance.value
                    )
                    ,
                    (365 / tradingEngine.current.episode.episodeStatistics.days.value)
                ) - 1

            tradingEngine.current.episode.episodeStatistics.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.episode.episodeStatistics.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (tradingEngine.current.episode.episodeStatistics.profitLoss.value > 0) {
                tradingEngine.current.episode.episodeStatistics.hitFail.value = 'Hit'
            } else {
                tradingEngine.current.episode.episodeStatistics.hitFail.value = 'Fail'
            }
        }
    }

    function updateDistanceToEventsCounters() {
        /* Keeping Distance Counters Up-to-date while avoinding counting before the first event happens. */
        if (
            tradingEngine.current.episode.distanceToEvent.triggerOn.value > 0
        ) {
            tradingEngine.current.episode.distanceToEvent.triggerOn.value++
        }

        if (
            tradingEngine.current.episode.distanceToEvent.triggerOff.value > 0
        ) {
            tradingEngine.current.episode.distanceToEvent.triggerOff.value++
        }

        if (
            tradingEngine.current.episode.distanceToEvent.takePosition.value > 0
        ) {
            tradingEngine.current.episode.distanceToEvent.takePosition.value++
        }

        if (
            tradingEngine.current.episode.distanceToEvent.closePosition.value > 0
        ) {
            tradingEngine.current.episode.distanceToEvent.closePosition.value++
        }

        if (
            tradingEngine.current.episode.distanceToEvent.nextPhase.value > 0
        ) {
            tradingEngine.current.episode.distanceToEvent.nextPhase.value++
        }

        if (
            tradingEngine.current.episode.distanceToEvent.moveToPhase.value > 0
        ) {
            tradingEngine.current.episode.distanceToEvent.moveToPhase.value++
        }

        if (
            tradingEngine.current.episode.distanceToEvent.createOrder.value > 0
        ) {
            tradingEngine.current.episode.distanceToEvent.createOrder.value++
        }

        if (
            tradingEngine.current.episode.distanceToEvent.cancelOrder.value > 0
        ) {
            tradingEngine.current.episode.distanceToEvent.cancelOrder.value++
        }

        if (
            tradingEngine.current.episode.distanceToEvent.closeOrder.value > 0
        ) {
            tradingEngine.current.episode.distanceToEvent.closeOrder.value++
        }
    }
}