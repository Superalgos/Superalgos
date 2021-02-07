exports.newSuperalgosBotModulesLearningEpisode = function (processIndex) {
    /*
    This module packages all functions related to Episodes.
    */
    const MODULE_NAME = 'Learning Episode'
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

    let learningEngine
    let learningSystem
    let sessionParameters

    return thisObject

    function initialize() {
        learningSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningSystem
        learningEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters
    }

    function finalize() {
        learningEngine = undefined
        learningSystem = undefined
        sessionParameters = undefined
    }

    function mantain() {
        updateCounters()
        updateStatistics()
        updateEnds()
        updateDistanceToEventsCounters()
    }

    function reset() {
        resetLearningEngineDataStructure()
    }

    function openEpisode() {
        /* 
        This function is called each time the simulation starts. That does not mean the Episode 
        must be opened there, since it might happen that it is looping at the end of the market
        or the task / session was restarted. We will only execute if the episode was never opened before.
        */
        if (learningEngine.learningCurrent.episode.begin.value !== learningEngine.learningCurrent.episode.begin.config.initialValue) { return }

        /* Starting begin and end */
        learningEngine.learningCurrent.episode.begin.value = learningEngine.learningCurrent.episode.candle.begin.value
        learningEngine.learningCurrent.episode.end.value = learningEngine.learningCurrent.episode.candle.end.value

        /* Getting the begin Balance from the session configuration */
        learningEngine.learningCurrent.episode.episodeBaseAsset.beginBalance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        learningEngine.learningCurrent.episode.episodeQuotedAsset.beginBalance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* The current balance is also the begin balance, that is how this starts. */
        learningEngine.learningCurrent.episode.episodeBaseAsset.balance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        learningEngine.learningCurrent.episode.episodeQuotedAsset.balance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* Recording the opening at the Learning Engine Data Structure */
        learningEngine.learningCurrent.episode.status.value = 'Open'
        learningEngine.learningCurrent.episode.serialNumber.value = 1
        learningEngine.learningCurrent.episode.identifier.value = TS.projects.superalgos.utilities.miscellaneousFunctions.genereteUniqueId()
        learningEngine.learningCurrent.episode.beginRate.value = learningEngine.learningCurrent.episode.candle.close.value
    }

    function updateExitType(exitType) {
        learningEngine.learningCurrent.episode.exitType.value = exitType
    }

    function closeEpisode() {
        learningEngine.learningCurrent.episode.status.value = 'Closed'
        learningEngine.learningCurrent.episode.end.value = learningEngine.learningCurrent.episode.candle.end.value
        learningEngine.learningCurrent.episode.endRate.value = learningEngine.learningCurrent.episode.candle.close.value
        learningEngine.learningCurrent.episode.episodeBaseAsset.endBalance.value = learningEngine.learningCurrent.episode.episodeBaseAsset.balance.value
        learningEngine.learningCurrent.episode.episodeQuotedAsset.endBalance.value = learningEngine.learningCurrent.episode.episodeQuotedAsset.balance.value
    }

    function resetEpisode() {
        TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(learningEngine.learningCurrent.episode)
    }

    function updateEnds() {
        if (learningEngine.learningCurrent.episode.status.value === 'Open') {
            learningEngine.learningCurrent.episode.end.value = learningEngine.learningCurrent.episode.end.value + sessionParameters.timeFrame.config.value
            learningEngine.learningCurrent.episode.endRate.value = learningEngine.learningCurrent.episode.candle.close.value
            learningEngine.learningCurrent.episode.episodeBaseAsset.endBalance.value = learningEngine.learningCurrent.episode.episodeBaseAsset.balance.value
            learningEngine.learningCurrent.episode.episodeQuotedAsset.endBalance.value = learningEngine.learningCurrent.episode.episodeQuotedAsset.balance.value
        }
    }

    function resetLearningEngineDataStructure() {
        if (learningEngine.learningCurrent.episode.status.value === 'Closed') {
            resetEpisode()
        }
    }

    function updateCounters() {
        if (learningEngine.learningCurrent.episode.status.value === 'Open') {
            learningEngine.learningCurrent.episode.episodeCounters.periods.value++
        }
    }

    function updateStatistics() {

        /* Daus Calculation */
        learningEngine.learningCurrent.episode.episodeStatistics.days.value =
            learningEngine.learningCurrent.episode.episodeCounters.periods.value *
            sessionParameters.timeFrame.config.value /
            TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculateEpisodeStatistics()

        function calculateAssetsStatistics() {
            /* Updating Profit Loss */
            learningEngine.learningCurrent.episode.episodeBaseAsset.profitLoss.value =
                learningEngine.learningCurrent.episode.episodeBaseAsset.balance.value -
                sessionParameters.sessionBaseAsset.config.initialBalance

            learningEngine.learningCurrent.episode.episodeQuotedAsset.profitLoss.value =
                learningEngine.learningCurrent.episode.episodeQuotedAsset.balance.value -
                sessionParameters.sessionQuotedAsset.config.initialBalance

            learningEngine.learningCurrent.episode.episodeBaseAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeBaseAsset.profitLoss.value, 10)
            learningEngine.learningCurrent.episode.episodeQuotedAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeQuotedAsset.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            learningEngine.learningCurrent.episode.episodeBaseAsset.ROI.value =
                learningEngine.learningCurrent.episode.episodeBaseAsset.profitLoss.value /
                learningEngine.learningCurrent.episode.episodeBaseAsset.beginBalance.value * 100

            learningEngine.learningCurrent.episode.episodeQuotedAsset.ROI.value =
                learningEngine.learningCurrent.episode.episodeQuotedAsset.profitLoss.value /
                learningEngine.learningCurrent.episode.episodeQuotedAsset.beginBalance.value * 100

            learningEngine.learningCurrent.episode.episodeBaseAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeBaseAsset.ROI.value, 10)
            learningEngine.learningCurrent.episode.episodeQuotedAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeQuotedAsset.ROI.value, 10)

            /* Updating Hit Ratio */
            if (learningEngine.learningCurrent.episode.episodeCounters.positions.value > 0) {
                learningEngine.learningCurrent.episode.episodeBaseAsset.hitRatio.value =
                    learningEngine.learningCurrent.episode.episodeBaseAsset.hits.value /
                    learningEngine.learningCurrent.episode.episodeCounters.positions.value

                learningEngine.learningCurrent.episode.episodeQuotedAsset.hitRatio.value =
                    learningEngine.learningCurrent.episode.episodeQuotedAsset.hits.value /
                    learningEngine.learningCurrent.episode.episodeCounters.positions.value

                learningEngine.learningCurrent.episode.episodeBaseAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeBaseAsset.hitRatio.value, 10)
                learningEngine.learningCurrent.episode.episodeQuotedAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeQuotedAsset.hitRatio.value, 10)
            }

            /* 
            Updating Annualized Rate Of Return 
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            learningEngine.learningCurrent.episode.episodeBaseAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        learningEngine.learningCurrent.episode.episodeBaseAsset.beginBalance.value +
                        learningEngine.learningCurrent.episode.episodeBaseAsset.profitLoss.value
                    ) / learningEngine.learningCurrent.episode.episodeBaseAsset.beginBalance.value
                    ,
                    (365 / learningEngine.learningCurrent.episode.episodeStatistics.days.value)
                ) - 1

            learningEngine.learningCurrent.episode.episodeQuotedAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        learningEngine.learningCurrent.episode.episodeQuotedAsset.beginBalance.value +
                        learningEngine.learningCurrent.episode.episodeQuotedAsset.profitLoss.value
                    ) / learningEngine.learningCurrent.episode.episodeQuotedAsset.beginBalance.value
                    ,
                    (365 / learningEngine.learningCurrent.episode.episodeStatistics.days.value)
                ) - 1

            learningEngine.learningCurrent.episode.episodeBaseAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeBaseAsset.annualizedRateOfReturn.value, 10)
            learningEngine.learningCurrent.episode.episodeQuotedAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeQuotedAsset.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (learningEngine.learningCurrent.episode.episodeBaseAsset.profitLoss.value > 0) {
                learningEngine.learningCurrent.episode.episodeBaseAsset.hitFail.value = 'Hit'
            } else {
                learningEngine.learningCurrent.episode.episodeBaseAsset.hitFail.value = 'Fail'
            }
            if (learningEngine.learningCurrent.episode.episodeQuotedAsset.profitLoss.value > 0) {
                learningEngine.learningCurrent.episode.episodeQuotedAsset.hitFail.value = 'Hit'
            } else {
                learningEngine.learningCurrent.episode.episodeQuotedAsset.hitFail.value = 'Fail'
            }
        }

        function calculateEpisodeStatistics() {
            /* Updating Profit Loss */
            learningEngine.learningCurrent.episode.episodeStatistics.profitLoss.value =
                learningEngine.learningCurrent.episode.episodeBaseAsset.profitLoss.value * learningEngine.learningCurrent.episode.candle.close.value +
                learningEngine.learningCurrent.episode.episodeQuotedAsset.profitLoss.value

            learningEngine.learningCurrent.episode.episodeStatistics.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeStatistics.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            learningEngine.learningCurrent.episode.episodeStatistics.ROI.value =
                (
                    learningEngine.learningCurrent.episode.episodeBaseAsset.profitLoss.value * learningEngine.learningCurrent.episode.endRate.value +
                    learningEngine.learningCurrent.episode.episodeQuotedAsset.profitLoss.value
                ) / (
                    learningEngine.learningCurrent.episode.episodeBaseAsset.beginBalance.value * learningEngine.learningCurrent.episode.beginRate.value +
                    learningEngine.learningCurrent.episode.episodeQuotedAsset.beginBalance.value
                ) * 100

            learningEngine.learningCurrent.episode.episodeStatistics.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeStatistics.ROI.value, 10)

            /* 
            Updating Annualized Rate Of Return
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            learningEngine.learningCurrent.episode.episodeStatistics.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        learningEngine.learningCurrent.episode.episodeBaseAsset.beginBalance.value * learningEngine.learningCurrent.episode.beginRate.value +
                        learningEngine.learningCurrent.episode.episodeQuotedAsset.beginBalance.value +
                        learningEngine.learningCurrent.episode.episodeBaseAsset.profitLoss.value +
                        learningEngine.learningCurrent.episode.episodeQuotedAsset.profitLoss.value
                    ) /
                    (
                        learningEngine.learningCurrent.episode.episodeBaseAsset.beginBalance.value * learningEngine.learningCurrent.episode.beginRate.value +
                        learningEngine.learningCurrent.episode.episodeQuotedAsset.beginBalance.value
                    )
                    ,
                    (365 / learningEngine.learningCurrent.episode.episodeStatistics.days.value)
                ) - 1

            learningEngine.learningCurrent.episode.episodeStatistics.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.episode.episodeStatistics.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (learningEngine.learningCurrent.episode.episodeStatistics.profitLoss.value > 0) {
                learningEngine.learningCurrent.episode.episodeStatistics.hitFail.value = 'Hit'
            } else {
                learningEngine.learningCurrent.episode.episodeStatistics.hitFail.value = 'Fail'
            }
        }
    }

    function updateDistanceToEventsCounters() {
        /* Keeping Distance Counters Up-to-date while avoinding counting before the first event happens. */
        if (
            learningEngine.learningCurrent.episode.distanceToEvent.triggerOn.value > 0
        ) {
            learningEngine.learningCurrent.episode.distanceToEvent.triggerOn.value++
        }

        if (
            learningEngine.learningCurrent.episode.distanceToEvent.triggerOff.value > 0
        ) {
            learningEngine.learningCurrent.episode.distanceToEvent.triggerOff.value++
        }

        if (
            learningEngine.learningCurrent.episode.distanceToEvent.takePosition.value > 0
        ) {
            learningEngine.learningCurrent.episode.distanceToEvent.takePosition.value++
        }

        if (
            learningEngine.learningCurrent.episode.distanceToEvent.closePosition.value > 0
        ) {
            learningEngine.learningCurrent.episode.distanceToEvent.closePosition.value++
        }

        if (
            learningEngine.learningCurrent.episode.distanceToEvent.nextPhase.value > 0
        ) {
            learningEngine.learningCurrent.episode.distanceToEvent.nextPhase.value++
        }

        if (
            learningEngine.learningCurrent.episode.distanceToEvent.moveToPhase.value > 0
        ) {
            learningEngine.learningCurrent.episode.distanceToEvent.moveToPhase.value++
        }

        if (
            learningEngine.learningCurrent.episode.distanceToEvent.createOrder.value > 0
        ) {
            learningEngine.learningCurrent.episode.distanceToEvent.createOrder.value++
        }

        if (
            learningEngine.learningCurrent.episode.distanceToEvent.cancelOrder.value > 0
        ) {
            learningEngine.learningCurrent.episode.distanceToEvent.cancelOrder.value++
        }

        if (
            learningEngine.learningCurrent.episode.distanceToEvent.closeOrder.value > 0
        ) {
            learningEngine.learningCurrent.episode.distanceToEvent.closeOrder.value++
        }
    }
}