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
        if (learningEngine.current.episode.begin.value !== learningEngine.current.episode.begin.config.initialValue) { return }

        /* Starting begin and end */
        learningEngine.current.episode.begin.value = learningEngine.current.episode.candle.begin.value
        learningEngine.current.episode.end.value = learningEngine.current.episode.candle.end.value

        /* Getting the begin Balance from the session configuration */
        learningEngine.current.episode.episodeBaseAsset.beginBalance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        learningEngine.current.episode.episodeQuotedAsset.beginBalance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* The current balance is also the begin balance, that is how this starts. */
        learningEngine.current.episode.episodeBaseAsset.balance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        learningEngine.current.episode.episodeQuotedAsset.balance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* Recording the opening at the Learning Engine Data Structure */
        learningEngine.current.episode.status.value = 'Open'
        learningEngine.current.episode.serialNumber.value = 1
        learningEngine.current.episode.identifier.value = TS.projects.superalgos.utilities.miscellaneousFunctions.genereteUniqueId()
        learningEngine.current.episode.beginRate.value = learningEngine.current.episode.candle.close.value
    }

    function updateExitType(exitType) {
        learningEngine.current.episode.exitType.value = exitType
    }

    function closeEpisode() {
        learningEngine.current.episode.status.value = 'Closed'
        learningEngine.current.episode.end.value = learningEngine.current.episode.candle.end.value
        learningEngine.current.episode.endRate.value = learningEngine.current.episode.candle.close.value
        learningEngine.current.episode.episodeBaseAsset.endBalance.value = learningEngine.current.episode.episodeBaseAsset.balance.value
        learningEngine.current.episode.episodeQuotedAsset.endBalance.value = learningEngine.current.episode.episodeQuotedAsset.balance.value
    }

    function resetEpisode() {
        TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(learningEngine.current.episode)
    }

    function updateEnds() {
        if (learningEngine.current.episode.status.value === 'Open') {
            learningEngine.current.episode.end.value = learningEngine.current.episode.end.value + sessionParameters.timeFrame.config.value
            learningEngine.current.episode.endRate.value = learningEngine.current.episode.candle.close.value
            learningEngine.current.episode.episodeBaseAsset.endBalance.value = learningEngine.current.episode.episodeBaseAsset.balance.value
            learningEngine.current.episode.episodeQuotedAsset.endBalance.value = learningEngine.current.episode.episodeQuotedAsset.balance.value
        }
    }

    function resetLearningEngineDataStructure() {
        if (learningEngine.current.episode.status.value === 'Closed') {
            resetEpisode()
        }
    }

    function updateCounters() {
        if (learningEngine.current.episode.status.value === 'Open') {
            learningEngine.current.episode.episodeCounters.periods.value++
        }
    }

    function updateStatistics() {

        /* Daus Calculation */
        learningEngine.current.episode.episodeStatistics.days.value =
            learningEngine.current.episode.episodeCounters.periods.value *
            sessionParameters.timeFrame.config.value /
            TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculateEpisodeStatistics()

        function calculateAssetsStatistics() {
            /* Updating Profit Loss */
            learningEngine.current.episode.episodeBaseAsset.profitLoss.value =
                learningEngine.current.episode.episodeBaseAsset.balance.value -
                sessionParameters.sessionBaseAsset.config.initialBalance

            learningEngine.current.episode.episodeQuotedAsset.profitLoss.value =
                learningEngine.current.episode.episodeQuotedAsset.balance.value -
                sessionParameters.sessionQuotedAsset.config.initialBalance

            learningEngine.current.episode.episodeBaseAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeBaseAsset.profitLoss.value, 10)
            learningEngine.current.episode.episodeQuotedAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeQuotedAsset.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            learningEngine.current.episode.episodeBaseAsset.ROI.value =
                learningEngine.current.episode.episodeBaseAsset.profitLoss.value /
                learningEngine.current.episode.episodeBaseAsset.beginBalance.value * 100

            learningEngine.current.episode.episodeQuotedAsset.ROI.value =
                learningEngine.current.episode.episodeQuotedAsset.profitLoss.value /
                learningEngine.current.episode.episodeQuotedAsset.beginBalance.value * 100

            learningEngine.current.episode.episodeBaseAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeBaseAsset.ROI.value, 10)
            learningEngine.current.episode.episodeQuotedAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeQuotedAsset.ROI.value, 10)

            /* Updating Hit Ratio */
            if (learningEngine.current.episode.episodeCounters.positions.value > 0) {
                learningEngine.current.episode.episodeBaseAsset.hitRatio.value =
                    learningEngine.current.episode.episodeBaseAsset.hits.value /
                    learningEngine.current.episode.episodeCounters.positions.value

                learningEngine.current.episode.episodeQuotedAsset.hitRatio.value =
                    learningEngine.current.episode.episodeQuotedAsset.hits.value /
                    learningEngine.current.episode.episodeCounters.positions.value

                learningEngine.current.episode.episodeBaseAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeBaseAsset.hitRatio.value, 10)
                learningEngine.current.episode.episodeQuotedAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeQuotedAsset.hitRatio.value, 10)
            }

            /* 
            Updating Annualized Rate Of Return 
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            learningEngine.current.episode.episodeBaseAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        learningEngine.current.episode.episodeBaseAsset.beginBalance.value +
                        learningEngine.current.episode.episodeBaseAsset.profitLoss.value
                    ) / learningEngine.current.episode.episodeBaseAsset.beginBalance.value
                    ,
                    (365 / learningEngine.current.episode.episodeStatistics.days.value)
                ) - 1

            learningEngine.current.episode.episodeQuotedAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        learningEngine.current.episode.episodeQuotedAsset.beginBalance.value +
                        learningEngine.current.episode.episodeQuotedAsset.profitLoss.value
                    ) / learningEngine.current.episode.episodeQuotedAsset.beginBalance.value
                    ,
                    (365 / learningEngine.current.episode.episodeStatistics.days.value)
                ) - 1

            learningEngine.current.episode.episodeBaseAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeBaseAsset.annualizedRateOfReturn.value, 10)
            learningEngine.current.episode.episodeQuotedAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeQuotedAsset.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (learningEngine.current.episode.episodeBaseAsset.profitLoss.value > 0) {
                learningEngine.current.episode.episodeBaseAsset.hitFail.value = 'Hit'
            } else {
                learningEngine.current.episode.episodeBaseAsset.hitFail.value = 'Fail'
            }
            if (learningEngine.current.episode.episodeQuotedAsset.profitLoss.value > 0) {
                learningEngine.current.episode.episodeQuotedAsset.hitFail.value = 'Hit'
            } else {
                learningEngine.current.episode.episodeQuotedAsset.hitFail.value = 'Fail'
            }
        }

        function calculateEpisodeStatistics() {
            /* Updating Profit Loss */
            learningEngine.current.episode.episodeStatistics.profitLoss.value =
                learningEngine.current.episode.episodeBaseAsset.profitLoss.value * learningEngine.current.episode.candle.close.value +
                learningEngine.current.episode.episodeQuotedAsset.profitLoss.value

            learningEngine.current.episode.episodeStatistics.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeStatistics.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            learningEngine.current.episode.episodeStatistics.ROI.value =
                (
                    learningEngine.current.episode.episodeBaseAsset.profitLoss.value * learningEngine.current.episode.endRate.value +
                    learningEngine.current.episode.episodeQuotedAsset.profitLoss.value
                ) / (
                    learningEngine.current.episode.episodeBaseAsset.beginBalance.value * learningEngine.current.episode.beginRate.value +
                    learningEngine.current.episode.episodeQuotedAsset.beginBalance.value
                ) * 100

            learningEngine.current.episode.episodeStatistics.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeStatistics.ROI.value, 10)

            /* 
            Updating Annualized Rate Of Return
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            learningEngine.current.episode.episodeStatistics.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        learningEngine.current.episode.episodeBaseAsset.beginBalance.value * learningEngine.current.episode.beginRate.value +
                        learningEngine.current.episode.episodeQuotedAsset.beginBalance.value +
                        learningEngine.current.episode.episodeBaseAsset.profitLoss.value +
                        learningEngine.current.episode.episodeQuotedAsset.profitLoss.value
                    ) /
                    (
                        learningEngine.current.episode.episodeBaseAsset.beginBalance.value * learningEngine.current.episode.beginRate.value +
                        learningEngine.current.episode.episodeQuotedAsset.beginBalance.value
                    )
                    ,
                    (365 / learningEngine.current.episode.episodeStatistics.days.value)
                ) - 1

            learningEngine.current.episode.episodeStatistics.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.current.episode.episodeStatistics.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (learningEngine.current.episode.episodeStatistics.profitLoss.value > 0) {
                learningEngine.current.episode.episodeStatistics.hitFail.value = 'Hit'
            } else {
                learningEngine.current.episode.episodeStatistics.hitFail.value = 'Fail'
            }
        }
    }

    function updateDistanceToEventsCounters() {
        /* Keeping Distance Counters Up-to-date while avoinding counting before the first event happens. */
        if (
            learningEngine.current.episode.distanceToEvent.triggerOn.value > 0
        ) {
            learningEngine.current.episode.distanceToEvent.triggerOn.value++
        }

        if (
            learningEngine.current.episode.distanceToEvent.triggerOff.value > 0
        ) {
            learningEngine.current.episode.distanceToEvent.triggerOff.value++
        }

        if (
            learningEngine.current.episode.distanceToEvent.takePosition.value > 0
        ) {
            learningEngine.current.episode.distanceToEvent.takePosition.value++
        }

        if (
            learningEngine.current.episode.distanceToEvent.closePosition.value > 0
        ) {
            learningEngine.current.episode.distanceToEvent.closePosition.value++
        }

        if (
            learningEngine.current.episode.distanceToEvent.nextPhase.value > 0
        ) {
            learningEngine.current.episode.distanceToEvent.nextPhase.value++
        }

        if (
            learningEngine.current.episode.distanceToEvent.moveToPhase.value > 0
        ) {
            learningEngine.current.episode.distanceToEvent.moveToPhase.value++
        }

        if (
            learningEngine.current.episode.distanceToEvent.createOrder.value > 0
        ) {
            learningEngine.current.episode.distanceToEvent.createOrder.value++
        }

        if (
            learningEngine.current.episode.distanceToEvent.cancelOrder.value > 0
        ) {
            learningEngine.current.episode.distanceToEvent.cancelOrder.value++
        }

        if (
            learningEngine.current.episode.distanceToEvent.closeOrder.value > 0
        ) {
            learningEngine.current.episode.distanceToEvent.closeOrder.value++
        }
    }
}