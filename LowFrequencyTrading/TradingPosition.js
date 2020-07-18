exports.newTradingPosition = function newTradingPosition(bot, logger, tradingEngineModule) {
    /*
    This module packages all functions related to Positions.
    */
    const MODULE_NAME = 'Trading Position'
    let thisObject = {
        openPosition: openPosition,
        closingPosition: closingPosition,
        closePosition: closePosition,
        applyStopLossFormula: applyStopLossFormula,
        applyTakeProfitFormula: applyTakeProfitFormula,
        preventStopLossDistortion: preventStopLossDistortion,
        applySlippageToStopLoss: applySlippageToStopLoss,
        preventTakeProfitDistortion: preventTakeProfitDistortion,
        applySlippageToTakeProfit: applySlippageToTakeProfit,
        updateStopLoss: updateStopLoss,
        updateTakeProfit: updateTakeProfit,
        updateSizeAndRate: updateSizeAndRate,
        applySlippageToRate: applySlippageToRate,
        updateEnds: updateEnds,
        updateStatus: updateStatus,
        updateCounters: updateCounters,
        updateStatistics: updateStatistics,
        resetPosition: resetPosition,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let sessionParameters

    return thisObject

    function initialize() {
        tradingEngine = bot.simulationState.tradingEngine
        sessionParameters = bot.SESSION.parameters
    }

    function finalize() {
        tradingEngine = undefined
        sessionParameters = undefined
    }

    function openPosition(situationName) {
        tradingEngine.current.position.status.value = 'Open'
        tradingEngine.current.position.begin.value = tradingEngine.current.candle.begin.value
        tradingEngine.current.position.end.value = tradingEngine.current.candle.end.value

        tradingEngine.current.position.situationName.value = situationName

        tradingEngine.current.position.stopLoss.stopLossStage.value = 'Open Stage'
        tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Open Stage'
        tradingEngine.current.position.stopLoss.stopLossPhase.value = 0
        tradingEngine.current.position.takeProfit.takeProfitPhase.value = 0
    }

    function closingPosition(exitType) {
        tradingEngine.current.position.status.value = 'Closing'
        tradingEngine.current.position.exitType.value = exitType
    }

    function closePosition() {
        tradingEngine.current.position.status.value = 'Closed'
        tradingEngine.current.position.end.value = tradingEngine.current.candle.end.value
        /*
        Now that the position is closed, it is the right time to move this position from current to last at the Trading Engine data structure.
        */
        tradingEngineModule.cloneValues(tradingEngine.current.position, tradingEngine.last.position)
    }

    function resetPosition() {
        tradingEngine.current.position.initialize(tradingEngine.current.position)
    }

    function applyStopLossFormula(formulas, formulaId) {
        tradingEngine.current.position.stopLoss.value = formulas.get(formulaId)
    }

    function applyTakeProfitFormula(formulas, formulaId) {
        tradingEngine.current.position.takeProfit.value = formulas.get(formulaId)
    }

    function updateStopLoss(phase, stage) {
        tradingEngine.current.position.stopLoss.stopLossPhase.value = phase
        tradingEngine.current.position.stopLoss.stopLossStage.value = stage
    }

    function updateTakeProfit(phase, stage) {
        tradingEngine.current.position.takeProfit.takeProfitPhase.value = phase
        tradingEngine.current.position.takeProfit.takeProfitStage.value = stage
    }

    function updateSizeAndRate(size, rate) {
        tradingEngine.current.position.size.value = size
        tradingEngine.current.position.rate.value = rate
    }

    function applySlippageToRate() {
        let slippageAmount = tradingEngine.current.position.rate.value * bot.SESSION.parameters.slippage.config.positionRate / 100

        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            tradingEngine.current.position.beginRate.value = tradingEngine.current.position.rate.value - slippageAmount
        } else {
            tradingEngine.current.position.beginRate.value = tradingEngine.current.position.rate.value + slippageAmount
        }
    }

    function preventStopLossDistortion() {
        /*
        Hit Point Validation
 
        This prevents misscalculations when a formula places the stop loss in this case way beyond the market price.
        If we take the stop loss value at those situation would be a huge distortion of facts.
        */
        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            if (tradingEngine.current.position.stopLoss.value < tradingEngine.current.candle.min.value) {
                tradingEngine.current.position.stopLoss.value = tradingEngine.current.candle.min.value
            }
        } else {
            if (tradingEngine.current.position.stopLoss.value > tradingEngine.current.candle.max.value) {
                tradingEngine.current.position.stopLoss.value = tradingEngine.current.candle.max.value
            }
        }
    }

    function applySlippageToStopLoss() {
        let slippedStopLoss = tradingEngine.current.position.stopLoss.value

        /* Apply the Slippage */
        let slippageAmount = slippedStopLoss * bot.SESSION.parameters.slippage.config.stopLoss / 100

        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            slippedStopLoss = slippedStopLoss + slippageAmount
        } else {
            slippedStopLoss = slippedStopLoss - slippageAmount
        }

        tradingEngine.current.position.endRate.value = slippedStopLoss
    }

    function preventTakeProfitDistortion() {
        /*
        Hit Point Validation:
 
        This prevents misscalculations when a formula places the take profit in this case way beyond the market price.
        If we take the stop loss value at those situation would be a huge distortion of facts.
        */
        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            if (tradingEngine.current.position.takeProfit.value > tradingEngine.current.candle.max.value) {
                tradingEngine.current.position.takeProfit.value = tradingEngine.current.candle.max.value
            }
        } else {
            if (tradingEngine.current.position.takeProfit.value < tradingEngine.current.candle.min.value) {
                tradingEngine.current.position.takeProfit.value = tradingEngine.current.candle.min.value
            }
        }
    }

    function applySlippageToTakeProfit() {
        let slippedTakeProfit = tradingEngine.current.position.takeProfit.value
        /* Apply the Slippage */
        let slippageAmount = slippedTakeProfit * bot.SESSION.parameters.slippage.config.takeProfit / 100

        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            slippedTakeProfit = slippedTakeProfit + slippageAmount
        } else {
            slippedTakeProfit = slippedTakeProfit - slippageAmount
        }

        tradingEngine.current.position.endRate.value = slippedTakeProfit
    }

    function updateEnds() {
        if (tradingEngine.current.position.status.value === 'Open') {
            tradingEngine.current.position.end.value = tradingEngine.current.candle.end.value
        }
    }

    function updateStatus() {
        if (tradingEngine.current.position.status.value === 'Closed') {
            resetPosition()
        }
    }

    function updateCounters() {
        if (tradingEngine.current.position.status.value === 'Open') {
            tradingEngine.current.position.positionCounters.periods.value++
        }
    }

    function updateStatistics() {
        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            tradingEngine.current.position.positionStatistics.profitLoss.value = tradingEngine.current.balance.baseAsset.value - tradingEngine.previous.balance.baseAsset.value
            tradingEngine.current.position.positionStatistics.ROI.value = tradingEngine.current.position.positionStatistics.profitLoss.value * 100 / tradingEngine.current.position.size.value
        } else {
            tradingEngine.current.position.positionStatistics.profitLoss.value = tradingEngine.current.balance.quotedAsset.value - tradingEngine.previous.balance.quotedAsset.value
            tradingEngine.current.position.positionStatistics.ROI.value = tradingEngine.current.position.positionStatistics.profitLoss.value * 100 / tradingEngine.current.position.size.value
        }
        tradingEngine.current.position.positionStatistics.days.value = tradingEngine.current.position.positionCounters.periods.value * sessionParameters.timeFrame.config.value / global.ONE_DAY_IN_MILISECONDS
        if (tradingEngine.current.position.positionStatistics.ROI.value > 0) {
            tradingEngine.current.position.positionStatistics.hitFail.value = 'HIT'
        } else {
            tradingEngine.current.position.positionStatistics.hitFail.value = 'FAIL'
        }
    }
}