exports.newTradingEpisode = function newTradingEpisode(bot, logger) {
    /*
    This module packages all functions related to Episodes.
    */
    const MODULE_NAME = 'Trading Episode'
    let thisObject = {
        openEpisode: openEpisode,
        updateExitType: updateExitType,
        closeEpisode: closeEpisode,
        updateEnds: updateEnds,
        resetTradingEngineDataStructure: resetTradingEngineDataStructure,
        updateCounters: updateCounters,
        updateStatistics: updateStatistics,
        calculateResults: calculateResults,
        calculateStatistics: calculateStatistics,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let tradingSystem
    let sessionParameters

    return thisObject

    function initialize() {
        tradingSystem = bot.simulationState.tradingSystem
        tradingEngine = bot.simulationState.tradingEngine
        sessionParameters = bot.SESSION.parameters
    }

    function finalize() {
        tradingEngine = undefined
        tradingSystem = undefined
        sessionParameters = undefined
    }

    function openEpisode() {
        /* 
        This function is called each time the simulation starts. That does not mean the Episode 
        must be opened there, since it might happen that it is looping at the end of the market
        or the task / session was restarted.
        */
        if (bot.FIRST_EXECUTION === true) {
            /* Getting the begin Balance from the session configuration */
            tradingEngine.current.episode.beginBalance.baseAsset.value = sessionParameters.sessionBaseAsset.config.initialBalance
            tradingEngine.current.episode.beginBalance.quotedAsset.value = sessionParameters.sessionQuotedAsset.config.initialBalance

            /* The current balance is also the begin balance, that is how this starts. */
            tradingEngine.current.episode.balance.baseAsset.value = sessionParameters.sessionBaseAsset.config.initialBalance
            tradingEngine.current.episode.balance.quotedAsset.value = sessionParameters.sessionQuotedAsset.config.initialBalance

            /* Recording the opening at the Trading Engine Data Structure */
            tradingEngine.current.episode.status.value = 'Open'
            tradingEngine.current.episode.serialNumber.value = 1
            tradingEngine.current.episode.identifier.value = global.UNIQUE_ID()
            tradingEngine.current.episode.begin.value = tradingEngine.current.candle.begin.value
            tradingEngine.current.episode.beginRate.value = tradingEngine.current.candle.close.value
        }
    }

    function updateExitType(exitType) {
        tradingEngine.current.episode.exitType.value = exitType
    }

    function closeEpisode() {
        tradingEngine.current.episode.status.value = 'Closed'
        tradingEngine.current.episode.end.value = tradingEngine.current.candle.end.value
        tradingEngine.current.episode.endRate.value = tradingEngine.current.candle.close.value
        tradingEngine.current.episode.endBalance.baseAsset.value = tradingEngine.current.episode.balance.baseAsset.value
        tradingEngine.current.episode.endBalance.quotedAsset.value = tradingEngine.current.episode.balance.quotedAsset.value
    }

    function resetEpisode() {
        tradingEngine.current.episode.initialize(tradingEngine.current.episode)
    }

    function updateEnds() {
        if (tradingEngine.current.episode.status.value === 'Open') {
            tradingEngine.current.episode.end.value = tradingEngine.current.candle.end.value
            tradingEngine.current.episode.endRate.value = tradingEngine.current.candle.close.value
            tradingEngine.current.episode.endBalance.baseAsset.value = tradingEngine.current.episode.balance.baseAsset.value
            tradingEngine.current.episode.endBalance.quotedAsset.value = tradingEngine.current.episode.balance.quotedAsset.value
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
            global.ONE_DAY_IN_MILISECONDS
    }

    function calculateStatistics() {

        /* Updating Profit Loss */
        tradingEngine.current.episode.episodeStatistics.profitLoss.value =
            tradingEngine.current.episode.episodeBaseAsset.profitLoss.value * tradingEngine.current.candle.close.value +
            tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value

        tradingEngine.current.episode.episodeStatistics.profitLoss.value = global.PRECISE(tradingEngine.current.episode.episodeStatistics.profitLoss.value, 10)

        /* Updating ROI */
        tradingEngine.current.episode.episodeStatistics.ROI.value =
            (
                sessionParameters.sessionBaseAsset.config.initialBalance * tradingEngine.current.candle.close.value +
                tradingEngine.current.episode.episodeBaseAsset.profitLoss.value * tradingEngine.current.candle.close.value +
                sessionParameters.sessionQuotedAsset.config.initialBalance +
                tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value
            ) / (
                sessionParameters.sessionBaseAsset.config.initialBalance * tradingEngine.current.candle.close.value +
                sessionParameters.sessionQuotedAsset.config.initialBalance
            ) - 1

        tradingEngine.current.episode.episodeStatistics.ROI.value = global.PRECISE(tradingEngine.current.episode.episodeStatistics.ROI.value, 10)

        /* Updating Anualized Rate Of Return */
        tradingEngine.current.episode.episodeStatistics.anualizedRateOfReturn.value =
            tradingEngine.current.episode.episodeStatistics.ROI.value /
            tradingEngine.current.episode.episodeStatistics.days.value * 365

        tradingEngine.current.episode.episodeStatistics.anualizedRateOfReturn.value = global.PRECISE(tradingEngine.current.episode.episodeStatistics.anualizedRateOfReturn.value, 10)

        /* Updating Hit or Fail */
        if (tradingEngine.current.episode.episodeStatistics.profitLoss.value > 0) {
            tradingEngine.current.episode.episodeStatistics.hitFail.value = 'Hit'
        } else {
            tradingEngine.current.episode.episodeStatistics.hitFail.value = 'Fail'
        }
    }

    function calculateResults() {

        /* Updating Hits & Fails */
        if (tradingEngine.current.position.positionBaseAsset.profitLoss.value > 0) {
            tradingEngine.current.episode.episodeBaseAsset.hits.value++
        } else {
            tradingEngine.current.episode.episodeBaseAsset.fails.value++
        }
        if (tradingEngine.current.position.positionQuotedAsset.profitLoss.value > 0) {
            tradingEngine.current.episode.episodeQuotedAsset.hits.value++
        } else {
            tradingEngine.current.episode.episodeQuotedAsset.fails.value++
        }

        /* Updating Profit Loss */
        tradingEngine.current.episode.episodeBaseAsset.profitLoss.value =
            tradingEngine.current.episode.balance.baseAsset.value -
            sessionParameters.sessionBaseAsset.config.initialBalance

        tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value =
            tradingEngine.current.episode.balance.quotedAsset.value -
            sessionParameters.sessionQuotedAsset.config.initialBalance

        tradingEngine.current.episode.episodeBaseAsset.profitLoss.value = global.PRECISE(tradingEngine.current.episode.episodeBaseAsset.profitLoss.value, 10)
        tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value = global.PRECISE(tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value, 10)

        /* Updating ROI */
        tradingEngine.current.episode.episodeBaseAsset.ROI.value =
            (sessionParameters.sessionBaseAsset.config.initialBalance + tradingEngine.current.episode.episodeBaseAsset.profitLoss.value) /
            sessionParameters.sessionBaseAsset.config.initialBalance - 1

        tradingEngine.current.episode.episodeQuotedAsset.ROI.value =
            (sessionParameters.sessionQuotedAsset.config.initialBalance + tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value) /
            sessionParameters.sessionQuotedAsset.config.initialBalance - 1

        tradingEngine.current.episode.episodeBaseAsset.ROI.value = global.PRECISE(tradingEngine.current.episode.episodeBaseAsset.ROI.value, 10)
        tradingEngine.current.episode.episodeQuotedAsset.ROI.value = global.PRECISE(tradingEngine.current.episode.episodeQuotedAsset.ROI.value, 10)

        /* Updating Hit Ratio */
        tradingEngine.current.episode.episodeBaseAsset.hitRatio.value =
            tradingEngine.current.episode.episodeBaseAsset.hits.value /
            tradingEngine.current.episode.episodeCounters.positions.value

        tradingEngine.current.episode.episodeQuotedAsset.hitRatio.value =
            tradingEngine.current.episode.episodeQuotedAsset.hits.value /
            tradingEngine.current.episode.episodeCounters.positions.value

        tradingEngine.current.episode.episodeBaseAsset.hitRatio.value = global.PRECISE(tradingEngine.current.episode.episodeBaseAsset.hitRatio.value, 10)
        tradingEngine.current.episode.episodeQuotedAsset.hitRatio.value = global.PRECISE(tradingEngine.current.episode.episodeQuotedAsset.hitRatio.value, 10)

        /* Updating Anualized Rate Of Return */
        tradingEngine.current.episode.episodeBaseAsset.anualizedRateOfReturn.value =
            tradingEngine.current.episode.episodeBaseAsset.ROI.value /
            tradingEngine.current.episode.episodeStatistics.days.value * 365

        tradingEngine.current.episode.episodeQuotedAsset.anualizedRateOfReturn.value =
            tradingEngine.current.episode.episodeQuotedAsset.ROI.value /
            tradingEngine.current.episode.episodeStatistics.days.value * 365

        tradingEngine.current.episode.episodeBaseAsset.anualizedRateOfReturn.value = global.PRECISE(tradingEngine.current.episode.episodeBaseAsset.anualizedRateOfReturn.value, 10)
        tradingEngine.current.episode.episodeQuotedAsset.anualizedRateOfReturn.value = global.PRECISE(tradingEngine.current.episode.episodeQuotedAsset.anualizedRateOfReturn.value, 10)

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
}