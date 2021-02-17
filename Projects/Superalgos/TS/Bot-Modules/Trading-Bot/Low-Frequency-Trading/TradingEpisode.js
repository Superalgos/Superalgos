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
        updateDistanceToTradingEventsCounters()
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
        if (tradingEngine.tradingCurrent.tradingEpisode.begin.value !== tradingEngine.tradingCurrent.tradingEpisode.begin.config.initialValue) { return }

        /* Starting begin and end */
        tradingEngine.tradingCurrent.tradingEpisode.begin.value = tradingEngine.tradingCurrent.tradingEpisode.candle.begin.value
        tradingEngine.tradingCurrent.tradingEpisode.end.value = tradingEngine.tradingCurrent.tradingEpisode.candle.end.value

        /* Getting the begin Balance from the session configuration */
        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.beginBalance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.beginBalance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* The current balance is also the begin balance, that is how this starts. */
        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* Recording the opening at the Trading Engine Data Structure */
        tradingEngine.tradingCurrent.tradingEpisode.status.value = 'Open'
        tradingEngine.tradingCurrent.tradingEpisode.serialNumber.value = 1
        tradingEngine.tradingCurrent.tradingEpisode.identifier.value = TS.projects.superalgos.utilities.miscellaneousFunctions.genereteUniqueId()
        tradingEngine.tradingCurrent.tradingEpisode.beginRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
    }

    function updateExitType(exitType) {
        tradingEngine.tradingCurrent.tradingEpisode.exitType.value = exitType
    }

    function closeEpisode() {
        tradingEngine.tradingCurrent.tradingEpisode.status.value = 'Closed'
        tradingEngine.tradingCurrent.tradingEpisode.end.value = tradingEngine.tradingCurrent.tradingEpisode.candle.end.value
        tradingEngine.tradingCurrent.tradingEpisode.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.endBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value
        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.endBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value
    }

    function resetEpisode() {
        TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(tradingEngine.tradingCurrent.learningEpisode)
    }

    function updateEnds() {
        if (tradingEngine.tradingCurrent.tradingEpisode.status.value === 'Open') {
            tradingEngine.tradingCurrent.tradingEpisode.end.value = tradingEngine.tradingCurrent.tradingEpisode.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.tradingCurrent.tradingEpisode.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.endBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value
            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.endBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.tradingCurrent.tradingEpisode.status.value === 'Closed') {
            resetEpisode()
        }
    }

    function updateCounters() {
        if (tradingEngine.tradingCurrent.tradingEpisode.status.value === 'Open') {
            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.periods.value++
        }
    }

    function updateStatistics() {

        /* Daus Calculation */
        tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.days.value =
            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.periods.value *
            sessionParameters.timeFrame.config.value /
            TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculateEpisodeStatistics()

        function calculateAssetsStatistics() {
            /* Updating Profit Loss */
            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value =
                tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value -
                sessionParameters.sessionBaseAsset.config.initialBalance

            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value =
                tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value -
                sessionParameters.sessionQuotedAsset.config.initialBalance

            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value, 10)
            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.ROI.value =
                tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value /
                tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.beginBalance.value * 100

            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.ROI.value =
                tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value /
                tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.beginBalance.value * 100

            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.ROI.value, 10)
            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.ROI.value, 10)

            /* Updating Hit Ratio */
            if (tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.positions.value > 0) {
                tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.hitRatio.value =
                    tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.hits.value /
                    tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.positions.value

                tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.hitRatio.value =
                    tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.hits.value /
                    tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.positions.value

                tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.hitRatio.value, 10)
                tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.hitRatio.value, 10)
            }

            /* 
            Updating Annualized Rate Of Return 
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.beginBalance.value +
                        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value
                    ) / tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.beginBalance.value
                    ,
                    (365 / tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.days.value)
                ) - 1

            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.beginBalance.value +
                        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value
                    ) / tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.beginBalance.value
                    ,
                    (365 / tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.days.value)
                ) - 1

            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.annualizedRateOfReturn.value, 10)
            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value > 0) {
                tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.hitFail.value = 'Hit'
            } else {
                tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.hitFail.value = 'Fail'
            }
            if (tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value > 0) {
                tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.hitFail.value = 'Hit'
            } else {
                tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.hitFail.value = 'Fail'
            }
        }

        function calculateEpisodeStatistics() {
            /* Updating Profit Loss */
            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.profitLoss.value =
                tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value * tradingEngine.tradingCurrent.tradingEpisode.candle.close.value +
                tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value

            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.ROI.value =
                (
                    tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value * tradingEngine.tradingCurrent.tradingEpisode.endRate.value +
                    tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value
                ) / (
                    tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.beginBalance.value * tradingEngine.tradingCurrent.tradingEpisode.beginRate.value +
                    tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.beginBalance.value
                ) * 100

            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.ROI.value, 10)

            /* 
            Updating Annualized Rate Of Return
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.beginBalance.value * tradingEngine.tradingCurrent.tradingEpisode.beginRate.value +
                        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.beginBalance.value +
                        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value +
                        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value
                    ) /
                    (
                        tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.beginBalance.value * tradingEngine.tradingCurrent.tradingEpisode.beginRate.value +
                        tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.beginBalance.value
                    )
                    ,
                    (365 / tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.days.value)
                ) - 1

            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.profitLoss.value > 0) {
                tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.hitFail.value = 'Hit'
            } else {
                tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeStatistics.hitFail.value = 'Fail'
            }
        }
    }

    function updateDistanceToTradingEventsCounters() {
        /* Keeping Distance Counters Up-to-date while avoinding counting before the first event happens. */
        if (
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.triggerOn.value > 0
        ) {
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.triggerOn.value++
        }

        if (
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.triggerOff.value > 0
        ) {
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.triggerOff.value++
        }

        if (
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.takePosition.value > 0
        ) {
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.takePosition.value++
        }

        if (
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closePosition.value > 0
        ) {
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closePosition.value++
        }

        if (
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.nextPhase.value > 0
        ) {
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.nextPhase.value++
        }

        if (
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.moveToPhase.value > 0
        ) {
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.moveToPhase.value++
        }

        if (
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.createOrder.value > 0
        ) {
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.createOrder.value++
        }

        if (
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.cancelOrder.value > 0
        ) {
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.cancelOrder.value++
        }

        if (
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closeOrder.value > 0
        ) {
            tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closeOrder.value++
        }
    }
}