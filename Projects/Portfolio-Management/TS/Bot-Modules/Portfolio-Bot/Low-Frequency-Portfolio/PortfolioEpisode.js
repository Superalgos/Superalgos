exports.newPortfolioManagementBotModulesPortfolioEpisode = function (processIndex) {
    /*
    This module packages all functions related to Episodes.
    */
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

    let portfolioEngine
    let portfolioSystem
    let sessionParameters

    return thisObject

    function initialize() {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters
    }

    function finalize() {
        portfolioEngine = undefined
        portfolioSystem = undefined
        sessionParameters = undefined
    }

    function mantain() {
        updateCounters()
        updateStatistics()
        updateEnds()
        updateDistanceToPortfolioEventsCounters()
    }

    function reset() {
        resetPortfolioEngineDataStructure()
    }

    function openEpisode() {
        /* 
        This function is called each time the simulation starts. That does not mean the Episode 
        must be opened there, since it might happen that it is looping at the end of the market
        or the task / session was restarted. We will only execute if the episode was never opened before.
        */
        if (portfolioEngine.portfolioCurrent.portfolioEpisode.begin.value !== portfolioEngine.portfolioCurrent.portfolioEpisode.begin.config.initialValue) { return }

        /* Starting begin and end */
        portfolioEngine.portfolioCurrent.portfolioEpisode.begin.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value
        portfolioEngine.portfolioCurrent.portfolioEpisode.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value

        /* Getting the begin Balance from the session configuration */
        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.beginBalance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.beginBalance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* The current balance is also the begin balance, that is how this starts. */
        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value = sessionParameters.sessionBaseAsset.config.initialBalance
        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value = sessionParameters.sessionQuotedAsset.config.initialBalance

        /* Recording the opening at the Portfolio Engine Data Structure */
        portfolioEngine.portfolioCurrent.portfolioEpisode.status.value = 'Open'
        portfolioEngine.portfolioCurrent.portfolioEpisode.serialNumber.value = 1
        portfolioEngine.portfolioCurrent.portfolioEpisode.identifier.value = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
        portfolioEngine.portfolioCurrent.portfolioEpisode.beginRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
    }

    function updateExitType(exitType) {
        portfolioEngine.portfolioCurrent.portfolioEpisode.exitType.value = exitType
    }

    function closeEpisode() {
        portfolioEngine.portfolioCurrent.portfolioEpisode.status.value = 'Closed'
        portfolioEngine.portfolioCurrent.portfolioEpisode.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value
        portfolioEngine.portfolioCurrent.portfolioEpisode.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.endBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value
        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.endBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value
    }

    function resetEpisode() {
        TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.initializeNode(portfolioEngine.portfolioCurrent.learningEpisode)
    }

    function updateEnds() {
        if (portfolioEngine.portfolioCurrent.portfolioEpisode.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.portfolioEpisode.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.portfolioEpisode.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.endBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.endBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value
        }
    }

    function resetPortfolioEngineDataStructure() {
        if (portfolioEngine.portfolioCurrent.portfolioEpisode.status.value === 'Closed') {
            resetEpisode()
        }
    }

    function updateCounters() {
        if (portfolioEngine.portfolioCurrent.portfolioEpisode.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.periods.value++
        }
    }

    function updateStatistics() {

        /* Daus Calculation */
        portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.days.value =
            portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.periods.value *
            sessionParameters.timeFrame.config.value /
            SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculateEpisodeStatistics()

        function calculateAssetsStatistics() {
            /* Updating Profit Loss */
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value =
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value -
                sessionParameters.sessionBaseAsset.config.initialBalance

            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value =
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value -
                sessionParameters.sessionQuotedAsset.config.initialBalance

            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value, 10)
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.ROI.value =
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value /
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.beginBalance.value * 100

            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.ROI.value =
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value /
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.beginBalance.value * 100

            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.ROI.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.ROI.value, 10)
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.ROI.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.ROI.value, 10)

            /* Updating Hit Ratio */
            if (portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.positions.value > 0) {
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.hitRatio.value =
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.hits.value /
                    portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.positions.value

                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.hitRatio.value =
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.hits.value /
                    portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.positions.value

                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.hitRatio.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.hitRatio.value, 10)
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.hitRatio.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.hitRatio.value, 10)
            }

            /* 
            Updating Annualized Rate Of Return 
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.beginBalance.value +
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value
                    ) / portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.beginBalance.value
                    ,
                    (365 / portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.days.value)
                ) - 1

            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.beginBalance.value +
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value
                    ) / portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.beginBalance.value
                    ,
                    (365 / portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.days.value)
                ) - 1

            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.annualizedRateOfReturn.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.annualizedRateOfReturn.value, 10)
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.annualizedRateOfReturn.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value > 0) {
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.hitFail.value = 'Hit'
            } else {
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.hitFail.value = 'Fail'
            }
            if (portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value > 0) {
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.hitFail.value = 'Hit'
            } else {
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.hitFail.value = 'Fail'
            }
        }

        function calculateEpisodeStatistics() {
            /* Updating Profit Loss */
            portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.profitLoss.value =
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value * portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value +
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value

            portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.profitLoss.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.profitLoss.value, 10)

            /* 
            Updating ROI 
            
            https://www.investopedia.com/articles/basics/10/guide-to-calculating-roi.asp
            */
            portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.ROI.value =
                (
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value * portfolioEngine.portfolioCurrent.portfolioEpisode.endRate.value +
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value
                ) / (
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.beginBalance.value * portfolioEngine.portfolioCurrent.portfolioEpisode.beginRate.value +
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.beginBalance.value
                ) * 100

            portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.ROI.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.ROI.value, 10)

            /* 
            Updating Annualized Rate Of Return
            
            https://www.investopedia.com/terms/a/annualized-rate.asp
            */
            portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.annualizedRateOfReturn.value =
                Math.pow(
                    (
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.beginBalance.value * portfolioEngine.portfolioCurrent.portfolioEpisode.beginRate.value +
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.beginBalance.value +
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value +
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value
                    ) /
                    (
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.beginBalance.value * portfolioEngine.portfolioCurrent.portfolioEpisode.beginRate.value +
                        portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.beginBalance.value
                    )
                    ,
                    (365 / portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.days.value)
                ) - 1

            portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.annualizedRateOfReturn.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.annualizedRateOfReturn.value, 10)

            /* Updating Hit or Fail */
            if (portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.profitLoss.value > 0) {
                portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.hitFail.value = 'Hit'
            } else {
                portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeStatistics.hitFail.value = 'Fail'
            }
        }
    }

    function updateDistanceToPortfolioEventsCounters() {
        /* Keeping Distance Counters Up-to-date while avoinding counting before the first event happens. */
        if (
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.triggerOn.value > 0
        ) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.triggerOn.value++
        }

        if (
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.triggerOff.value > 0
        ) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.triggerOff.value++
        }

        if (
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.takePosition.value > 0
        ) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.takePosition.value++
        }

        if (
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closePosition.value > 0
        ) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closePosition.value++
        }

        if (
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.nextPhase.value > 0
        ) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.nextPhase.value++
        }

        if (
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.moveToPhase.value > 0
        ) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.moveToPhase.value++
        }

        if (
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.createOrder.value > 0
        ) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.createOrder.value++
        }

        if (
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.cancelOrder.value > 0
        ) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.cancelOrder.value++
        }

        if (
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closeOrder.value > 0
        ) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closeOrder.value++
        }
    }
}