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
        updateStopLoss: updateStopLoss,
        updateTakeProfit: updateTakeProfit,
        initializeSizeAndRate: initializeSizeAndRate,
        updateEnds: updateEnds,
        updateStatus: updateStatus,
        updateCounters: updateCounters,
        updateStatistics: updateStatistics,
        updateResults: updateResults,
        resetPosition: resetPosition,
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

    function openPosition(situationName) {

        /* Recording the opening at the Trading Engine Data Structure */
        tradingEngine.current.position.status.value = 'Open'
        tradingEngine.current.position.serialNumber.value = tradingEngine.episode.episodeCounters.positions.value
        tradingEngine.current.position.identifier.value = global.UNIQUE_ID()
        tradingEngine.current.position.begin.value = tradingEngine.current.candle.begin.value
        tradingEngine.current.position.end.value = tradingEngine.current.candle.end.value
        tradingEngine.current.position.situationName.value = situationName

        /* Initializing Stop and Take Profit Stage / Phase */
        tradingEngine.current.position.stopLoss.stopLossStage.value = 'Open Stage'
        tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Open Stage'
        tradingEngine.current.position.stopLoss.stopLossPhase.value = 0
        tradingEngine.current.position.takeProfit.takeProfitPhase.value = 0

        /* Updating Episode Counters */
        tradingEngine.episode.episodeCounters.positions.value++

        /* Inicializing this counter */
        tradingEngine.current.distanceToEvent.takePosition.value = 1
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

    function initializeSizeAndRate() {

        setPositionSize()
        setPositionRate()

        tradingEngine.current.position.beginRate.value = tradingEngine.current.position.rate.value

        function setPositionSize() {
            let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]

            /* Basic Validation */
            if (
                strategy.openStage.initialDefinition.positionSizeInBaseAsset !== undefined &&
                strategy.openStage.initialDefinition.positionSizeInQuotedAsset !== undefined
            ) {
                const errorText = 'Only Position Size In Base Asset or Position Size In Quoted Asset is allowed. Remove one of them please.'
                tradingSystem.errors.push([strategy.openStage.initialDefinition.id, errorText])
                throw (errorText)
            }

            /* Position In Base Asset */
            if (strategy.openStage.initialDefinition.positionSizeInBaseAsset !== undefined) {
                if (strategy.openStage.initialDefinition.positionSizeInBaseAsset.formula !== undefined) {
                    let value = tradingSystem.formulas.get(strategy.openStage.initialDefinition.positionSizeInBaseAsset.formula.id)
                    if (value === undefined) {
                        const errorText = 'Position Size In Base Asset cannot be undefined. Fix this please.'
                        tradingSystem.errors.push([strategy.openStage.initialDefinition.positionSizeInBaseAsset.formula.id, errorText])
                        throw (errorText)
                    }
                    if (value === undefined) {
                        const errorText = 'Position Size In Base Asset cannot be zero. Fix this please.'
                        tradingSystem.errors.push([strategy.openStage.initialDefinition.positionSizeInBaseAsset.formula.id, errorText])
                        throw (errorText)
                    }
                    tradingEngine.current.position.positionBaseAsset.size.value = global.PRECISE(value, 10)
                } else {
                    const errorText = 'You need to specify a Formula for this.'
                    tradingSystem.errors.push([strategy.openStage.initialDefinition.positionSizeInBaseAsset.id, errorText])
                    throw (errorText)
                }
            }

            /* Position In Quoted Asset */
            if (strategy.openStage.initialDefinition.positionSizeInQuotedAsset !== undefined) {
                if (strategy.openStage.initialDefinition.positionSizeInQuotedAsset.formula !== undefined) {
                    let value = tradingSystem.formulas.get(strategy.openStage.initialDefinition.positionSizeInQuotedAsset.formula.id)
                    if (value === undefined) {
                        const errorText = 'Position Size In Quoted Asset cannot be undefined. Fix this please.'
                        tradingSystem.errors.push([strategy.openStage.initialDefinition.positionSizeInQuotedAsset.formula.id, errorText])
                        throw (errorText)
                    }
                    if (value === undefined) {
                        const errorText = 'Position Size In Quoted Asset cannot be zero. Fix this please.'
                        tradingSystem.errors.push([strategy.openStage.initialDefinition.positionSizeInQuotedAsset.formula.id, errorText])
                        throw (errorText)
                    }
                    tradingEngine.current.position.positionQuotedAsset.size.value = global.PRECISE(value, 10)
                } else {
                    const errorText = 'You need to specify a Formula for this.'
                    tradingSystem.errors.push([strategy.openStage.initialDefinition.positionSizeInQuotedAsset.id, errorText])
                    throw (errorText)
                }
            }
        }

        function setPositionRate() {
            const DEFAULT_VALUE = tradingEngine.current.candle.close.value
            let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]

            if (strategy.openStage === undefined) return DEFAULT_VALUE
            if (strategy.openStage.initialDefinition === undefined) return DEFAULT_VALUE
            if (strategy.openStage.initialDefinition.positionRate === undefined) return DEFAULT_VALUE
            if (strategy.openStage.initialDefinition.positionRate.formula === undefined) return DEFAULT_VALUE

            let value = tradingSystem.formulas.get(strategy.openStage.initialDefinition.positionRate.formula.id)
            if (value === undefined) return DEFAULT_VALUE
            return value
        }
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

        /* Days Calculation */
        tradingEngine.current.position.positionStatistics.days.value =
            tradingEngine.current.position.positionCounters.periods.value *
            sessionParameters.timeFrame.config.value / global.ONE_DAY_IN_MILISECONDS

        tradingEngine.current.position.positionStatistics.days.value = global.PRECISE(tradingEngine.current.position.positionStatistics.days.value, 10)
    }

    function updateResults() {
        /* Profit Loss Calculation */
        tradingEngine.current.position.positionBaseAsset.profitLoss.value =
            tradingEngine.current.balance.baseAsset.value -
            tradingEngine.previous.balance.baseAsset.value

        tradingEngine.current.position.positionQuotedAsset.profitLoss.value =
            tradingEngine.current.balance.quotedAsset.value -
            tradingEngine.previous.balance.quotedAsset.value

        tradingEngine.current.position.positionBaseAsset.profitLoss.value = global.PRECISE(tradingEngine.current.position.positionBaseAsset.profitLoss.value, 10)

        /* ROI Calculation */
        tradingEngine.current.position.positionBaseAsset.ROI.value =
            tradingEngine.current.position.positionBaseAsset.profitLoss.value * 100 /
            tradingEngine.current.position.positionBaseAsset.size.value

        tradingEngine.current.position.positionQuotedAsset.ROI.value =
            tradingEngine.current.position.positionQuotedAsset.profitLoss.value * 100 /
            tradingEngine.current.position.positionQuotedAsset.size.value

        tradingEngine.current.position.positionBaseAsset.ROI.value = global.PRECISE(tradingEngine.current.position.positionBaseAsset.ROI.value, 10)

        /* Hit Fail Calculation */
        if (tradingEngine.current.position.positionBaseAsset.ROI.value > 0) {
            tradingEngine.current.position.positionBaseAsset.hitFail.value = 'HIT'
        } else {
            tradingEngine.current.position.positionBaseAsset.hitFail.value = 'FAIL'
        }
        if (tradingEngine.current.position.positionQuotedAsset.ROI.value > 0) {
            tradingEngine.current.position.positionQuotedAsset.hitFail.value = 'HIT'
        } else {
            tradingEngine.current.position.positionQuotedAsset.hitFail.value = 'FAIL'
        }
    }
}