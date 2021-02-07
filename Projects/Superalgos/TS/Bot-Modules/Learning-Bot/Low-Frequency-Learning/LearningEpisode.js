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
        if (learningEngine.learningCurrent.learningEpisode.begin.value !== learningEngine.learningCurrent.learningEpisode.begin.config.initialValue) { return }

        /* Starting begin and end */
        learningEngine.learningCurrent.learningEpisode.begin.value = learningEngine.learningCurrent.learningEpisode.candle.begin.value
        learningEngine.learningCurrent.learningEpisode.end.value = learningEngine.learningCurrent.learningEpisode.candle.end.value

        /* Getting the begin Balance from the session configuration */
        learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.beginBalance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.beginBalance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* The current balance is also the begin balance, that is how this starts. */
        learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.balance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.balance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* Recording the opening at the Learning Engine Data Structure */
        learningEngine.learningCurrent.learningEpisode.status.value = 'Open'
        learningEngine.learningCurrent.learningEpisode.serialNumber.value = 1
        learningEngine.learningCurrent.learningEpisode.identifier.value = TS.projects.superalgos.utilities.miscellaneousFunctions.genereteUniqueId()
        learningEngine.learningCurrent.learningEpisode.beginRate.value = learningEngine.learningCurrent.learningEpisode.candle.close.value
    }

    function updateExitType(exitType) {
        learningEngine.learningCurrent.learningEpisode.exitType.value = exitType
    }

    function closeEpisode() {
        learningEngine.learningCurrent.learningEpisode.status.value = 'Closed'
        learningEngine.learningCurrent.learningEpisode.end.value = learningEngine.learningCurrent.learningEpisode.candle.end.value
        learningEngine.learningCurrent.learningEpisode.endRate.value = learningEngine.learningCurrent.learningEpisode.candle.close.value
        learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.endBalance.value = learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.balance.value
        learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.endBalance.value = learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.balance.value
    }

    function resetEpisode() {
        TS.projects.superalgos.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(learningEngine.learningCurrent.learningEpisode)
    }

    function updateEnds() {
        if (learningEngine.learningCurrent.learningEpisode.status.value === 'Open') {
            learningEngine.learningCurrent.learningEpisode.end.value = learningEngine.learningCurrent.learningEpisode.end.value + sessionParameters.timeFrame.config.value
            learningEngine.learningCurrent.learningEpisode.endRate.value = learningEngine.learningCurrent.learningEpisode.candle.close.value
            learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.endBalance.value = learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.balance.value
            learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.endBalance.value = learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.balance.value
        }
    }

    function resetLearningEngineDataStructure() {
        if (learningEngine.learningCurrent.learningEpisode.status.value === 'Closed') {
            resetEpisode()
        }
    }

    function updateCounters() {
        if (learningEngine.learningCurrent.learningEpisode.status.value === 'Open') {
            learningEngine.learningCurrent.learningEpisode.episodeCounters.periods.value++
        }
    }

    function updateStatistics() {

        /* Daus Calculation */
        learningEngine.learningCurrent.learningEpisode.episodeStatistics.days.value =
            learningEngine.learningCurrent.learningEpisode.episodeCounters.periods.value *
            sessionParameters.timeFrame.config.value /
            TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculateEpisodeStatistics()

        function calculateAssetsStatistics() {
            /* Updating Profit Loss */
            learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.profitLoss.value =
                learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.balance.value -
                sessionParameters.sessionBaseAsset.config.initialBalance

            learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.profitLoss.value =
                learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.balance.value -
                sessionParameters.sessionQuotedAsset.config.initialBalance

            learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.profitLoss.value, 10)
            learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.ROI.value =
                learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.profitLoss.value /
                learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.beginBalance.value * 100

            learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.ROI.value =
                learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.profitLoss.value /
                learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.beginBalance.value * 100

            learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.ROI.value, 10)
            learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.ROI.value, 10)

            /* Updating Hit Ratio */
            if (learningEngine.learningCurrent.learningEpisode.episodeCounters.positions.value > 0) {
                learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.hitRatio.value =
                    learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.hits.value /
                    learningEngine.learningCurrent.learningEpisode.episodeCounters.positions.value

                learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.hitRatio.value =
                    learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.hits.value /
                    learningEngine.learningCurrent.learningEpisode.episodeCounters.positions.value

                learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.hitRatio.value, 10)
                learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.hitRatio.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.hitRatio.value, 10)
            }

            /* 
            Updating Annualized Rate Of Return 
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.beginBalance.value +
                        learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.profitLoss.value
                    ) / learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.beginBalance.value
                    ,
                    (365 / learningEngine.learningCurrent.learningEpisode.episodeStatistics.days.value)
                ) - 1

            learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.beginBalance.value +
                        learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.profitLoss.value
                    ) / learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.beginBalance.value
                    ,
                    (365 / learningEngine.learningCurrent.learningEpisode.episodeStatistics.days.value)
                ) - 1

            learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.annualizedRateOfReturn.value, 10)
            learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.profitLoss.value > 0) {
                learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.hitFail.value = 'Hit'
            } else {
                learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.hitFail.value = 'Fail'
            }
            if (learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.profitLoss.value > 0) {
                learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.hitFail.value = 'Hit'
            } else {
                learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.hitFail.value = 'Fail'
            }
        }

        function calculateEpisodeStatistics() {
            /* Updating Profit Loss */
            learningEngine.learningCurrent.learningEpisode.episodeStatistics.profitLoss.value =
                learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.profitLoss.value * learningEngine.learningCurrent.learningEpisode.candle.close.value +
                learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.profitLoss.value

            learningEngine.learningCurrent.learningEpisode.episodeStatistics.profitLoss.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeStatistics.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            learningEngine.learningCurrent.learningEpisode.episodeStatistics.ROI.value =
                (
                    learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.profitLoss.value * learningEngine.learningCurrent.learningEpisode.endRate.value +
                    learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.profitLoss.value
                ) / (
                    learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.beginBalance.value * learningEngine.learningCurrent.learningEpisode.beginRate.value +
                    learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.beginBalance.value
                ) * 100

            learningEngine.learningCurrent.learningEpisode.episodeStatistics.ROI.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeStatistics.ROI.value, 10)

            /* 
            Updating Annualized Rate Of Return
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            learningEngine.learningCurrent.learningEpisode.episodeStatistics.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.beginBalance.value * learningEngine.learningCurrent.learningEpisode.beginRate.value +
                        learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.beginBalance.value +
                        learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.profitLoss.value +
                        learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.profitLoss.value
                    ) /
                    (
                        learningEngine.learningCurrent.learningEpisode.episodeBaseAsset.beginBalance.value * learningEngine.learningCurrent.learningEpisode.beginRate.value +
                        learningEngine.learningCurrent.learningEpisode.episodeQuotedAsset.beginBalance.value
                    )
                    ,
                    (365 / learningEngine.learningCurrent.learningEpisode.episodeStatistics.days.value)
                ) - 1

            learningEngine.learningCurrent.learningEpisode.episodeStatistics.annualizedRateOfReturn.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(learningEngine.learningCurrent.learningEpisode.episodeStatistics.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (learningEngine.learningCurrent.learningEpisode.episodeStatistics.profitLoss.value > 0) {
                learningEngine.learningCurrent.learningEpisode.episodeStatistics.hitFail.value = 'Hit'
            } else {
                learningEngine.learningCurrent.learningEpisode.episodeStatistics.hitFail.value = 'Fail'
            }
        }
    }

    function updateDistanceToEventsCounters() {
        /* Keeping Distance Counters Up-to-date while avoinding counting before the first event happens. */
        if (
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.triggerOn.value > 0
        ) {
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.triggerOn.value++
        }

        if (
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.triggerOff.value > 0
        ) {
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.triggerOff.value++
        }

        if (
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.takePosition.value > 0
        ) {
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.takePosition.value++
        }

        if (
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.closePosition.value > 0
        ) {
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.closePosition.value++
        }

        if (
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.nextPhase.value > 0
        ) {
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.nextPhase.value++
        }

        if (
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.moveToPhase.value > 0
        ) {
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.moveToPhase.value++
        }

        if (
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.createOrder.value > 0
        ) {
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.createOrder.value++
        }

        if (
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.cancelOrder.value > 0
        ) {
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.cancelOrder.value++
        }

        if (
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.closeOrder.value > 0
        ) {
            learningEngine.learningCurrent.learningEpisode.distanceToEvent.closeOrder.value++
        }
    }
}