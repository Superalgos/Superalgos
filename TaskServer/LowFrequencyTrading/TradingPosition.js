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
        initialTargets: initialTargets,
        updateEnds: updateEnds,
        resetTradingEngineDataStructure: resetTradingEngineDataStructure,
        updateCounters: updateCounters,
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
        tradingEngine.current.position.serialNumber.value = tradingEngine.current.episode.episodeCounters.positions.value
        tradingEngine.current.position.identifier.value = global.UNIQUE_ID()
        tradingEngine.current.position.begin.value = tradingEngine.current.candle.begin.value
        tradingEngine.current.position.beginRate.value = tradingEngine.current.candle.close.value
        tradingEngine.current.position.situationName.value = situationName

        /* Initializing Stop and Take Profit Stage / Phase */
        tradingEngine.current.position.stopLoss.stopLossStage.value = 'Open Stage'
        tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Open Stage'
        tradingEngine.current.position.stopLoss.stopLossPhase.value = 0
        tradingEngine.current.position.takeProfit.takeProfitPhase.value = 0

        /* Updating Episode Counters */
        tradingEngine.current.episode.episodeCounters.positions.value++

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
        tradingEngine.current.position.endRate.value = tradingEngine.current.candle.close.value

        /* Position Statistics & Results */
        updateStatistics()
        updateResults()
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

    function initialTargets(stageNode) {

        if (stageNode.initialTargets === undefined) {
            const message = 'Stage without Initial Targets node. Add one please.'
            badDefinitionUnhandledException(undefined, message, stageNode)
        }

        setTargetRate()
        setTargetSize()

        function setTargetRate() {
            if (stageNode.initialTargets.targetRate === undefined) {
                const message = 'Target Rate Node not Found. Fix this please.'
                badDefinitionUnhandledException(undefined, message, stageNode.initialTargets)
            }
            if (stageNode.initialTargets.targetRate.formula === undefined) {
                const message = 'Formula of Target Rate Node not Found. Fix this please.'
                badDefinitionUnhandledException(undefined, message, stageNode.initialTargets.targetRate)
            }

            let value = tradingSystem.formulas.get(stageNode.initialTargets.targetRate.formula.id)
            if (value === undefined) {
                const message = 'Target Rate can not be undefined. Fix this please.'
                badDefinitionUnhandledException(undefined, message, stageNode.initialTargets.targetRate.formula)
            }
            if (isNaN(value)) {
                const message = 'Target Rate must be a number. Fix this please.'
                badDefinitionUnhandledException(undefined, message, stageNode.initialTargets.targetRate.formula)
            }

            switch (stageNode.type) {
                case 'Open Stage': {
                    tradingEngine.current.position.entryTargetRate.value = global.PRECISE(value, 10)
                    break
                }
                case 'Close Stage': {
                    tradingEngine.current.position.exitTargetRate.value = global.PRECISE(value, 10)
                    break
                }
            }
        }

        function setTargetSize() {
            /* Basic Validation */
            if (
                stageNode.initialTargets.targetSizeInBaseAsset !== undefined &&
                stageNode.initialTargets.targetSizeInQuotedAsset !== undefined
            ) {
                const message = 'Only Target Size In Base Asset or Target Size In Quoted Asset is allowed. Remove one of them please.'
                badDefinitionUnhandledException(undefined, message, stageNode)
            }

            /* Position In Base Asset */
            if (stageNode.initialTargets.targetSizeInBaseAsset !== undefined) {
                if (stageNode.initialTargets.targetSizeInBaseAsset.formula !== undefined) {
                    let value = tradingSystem.formulas.get(stageNode.initialTargets.targetSizeInBaseAsset.formula.id)
                    if (value === undefined) {
                        const message = 'Target Size In Base Asset cannot be undefined. Fix this please.'
                        badDefinitionUnhandledException(undefined, message, stageNode.initialTargets.targetSizeInBaseAsset.formula)
                    }
                    if (value === undefined) {
                        const message = 'Target Size In Base Asset cannot be zero. Fix this please.'
                        badDefinitionUnhandledException(undefined, message, stageNode.initialTargets.targetSizeInBaseAsset.formula)
                    }

                    switch (stageNode.type) {
                        case 'Open Stage': {
                            tradingEngine.current.position.positionBaseAsset.entryTargetSize.value = global.PRECISE(value, 10)
                            tradingEngine.current.position.positionQuotedAsset.entryTargetSize.value =
                                global.PRECISE(value * tradingEngine.current.position.entryTargetRate.value, 10)
                            break
                        }
                        case 'Close Stage': {
                            tradingEngine.current.position.positionBaseAsset.exitTargetSize.value = global.PRECISE(value, 10)
                            tradingEngine.current.position.positionQuotedAsset.exitTargetSize.value =
                                global.PRECISE(value * tradingEngine.current.position.exitTargetRate.value, 10)
                            break
                        }
                    }
                } else {
                    const message = 'You need to specify a Formula for this.'
                    badDefinitionUnhandledException(undefined, message, stageNode.initialTargets.targetSizeInBaseAsset)
                }
            }

            /* Position In Quoted Asset */
            if (stageNode.initialTargets.targetSizeInQuotedAsset !== undefined) {
                if (stageNode.initialTargets.targetSizeInQuotedAsset.formula !== undefined) {
                    let value = tradingSystem.formulas.get(stageNode.initialTargets.targetSizeInQuotedAsset.formula.id)
                    if (value === undefined) {
                        const message = 'Target Size In Quoted Asset cannot be undefined. Fix this please.'
                        badDefinitionUnhandledException(undefined, message, stageNode.initialTargets.targetSizeInQuotedAsset.formula)
                    }
                    if (value === undefined) {
                        const message = 'Target Size In Quoted Asset cannot be zero. Fix this please.'
                        badDefinitionUnhandledException(undefined, message, stageNode.initialTargets.targetSizeInQuotedAsset.formula)
                    }
                    switch (stageNode.type) {
                        case 'Open Stage': {
                            tradingEngine.current.position.positionQuotedAsset.entryTargetSize.value = global.PRECISE(value, 10)
                            tradingEngine.current.position.positionBaseAsset.entryTargetSize.value =
                                global.PRECISE(value / tradingEngine.current.position.entryTargetRate.value, 10)
                            break
                        }
                        case 'Close Stage': {
                            tradingEngine.current.position.positionQuotedAsset.exitTargetSize.value = global.PRECISE(value, 10)
                            tradingEngine.current.position.positionBaseAsset.exitTargetSize.value =
                                global.PRECISE(value / tradingEngine.current.position.exitTargetRate.value, 10)
                            break
                        }
                    }
                } else {
                    const errorText = 'You need to specify a Formula for this.'
                    badDefinitionUnhandledException(undefined, message, stageNode.initialTargets.targetSizeInQuotedAsset.formula)
                }
            }
        }
    }

    function updateEnds() {
        if (tradingEngine.current.position.status.value === 'Open') {
            tradingEngine.current.position.end.value = tradingEngine.current.candle.end.value
            tradingEngine.current.position.endRate.value = tradingEngine.current.candle.close.value
        }
    }

    function resetTradingEngineDataStructure() {
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

        /* Profit Loss Calculation */
        tradingEngine.current.position.positionStatistics.profitLoss.value =
            (
                tradingEngine.current.balance.baseAsset.value * tradingEngine.current.position.endRate.value +
                tradingEngine.current.balance.quotedAsset.value
            ) -
            (
                tradingEngine.previous.balance.baseAsset.value * tradingEngine.current.position.beginRate.value +
                tradingEngine.previous.balance.quotedAsset.value
            )
        tradingEngine.current.position.positionStatistics.profitLoss.value = global.PRECISE(tradingEngine.current.position.positionStatistics.profitLoss.value, 10)

        /* ROI Calculation */
        tradingEngine.current.position.positionStatistics.ROI.value =
            (
                tradingEngine.current.position.positionStatistics.profitLoss.value
            )
            * 100 /
            (
                tradingEngine.previous.balance.baseAsset.value * tradingEngine.current.position.beginRate.value +
                tradingEngine.previous.balance.quotedAsset.value
            )
        tradingEngine.current.position.positionStatistics.ROI.value = global.PRECISE(tradingEngine.current.position.positionStatistics.ROI.value, 10)

        /* Hit Fail Calculation */
        if (tradingEngine.current.position.positionStatistics.ROI.value > 0) {
            tradingEngine.current.position.positionStatistics.hitFail.value = 'Hit'
        } else {
            tradingEngine.current.position.positionStatistics.hitFail.value = 'Fail'
        }

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
        tradingEngine.current.position.positionQuotedAsset.profitLoss.value = global.PRECISE(tradingEngine.current.position.positionQuotedAsset.profitLoss.value, 10)

        /* ROI Calculation */
        tradingEngine.current.position.positionBaseAsset.ROI.value =
            tradingEngine.current.position.positionBaseAsset.profitLoss.value * 100 /
            tradingEngine.current.position.positionBaseAsset.entryTargetSize.value

        tradingEngine.current.position.positionQuotedAsset.ROI.value =
            tradingEngine.current.position.positionQuotedAsset.profitLoss.value * 100 /
            tradingEngine.current.position.positionQuotedAsset.entryTargetSize.value

        tradingEngine.current.position.positionBaseAsset.ROI.value = global.PRECISE(tradingEngine.current.position.positionBaseAsset.ROI.value, 10)
        tradingEngine.current.position.positionQuotedAsset.ROI.value = global.PRECISE(tradingEngine.current.position.positionQuotedAsset.ROI.value, 10)

        /* Hit Fail Calculation */
        if (tradingEngine.current.position.positionBaseAsset.ROI.value > 0) {
            tradingEngine.current.position.positionBaseAsset.hitFail.value = 'Hit'
        } else {
            tradingEngine.current.position.positionBaseAsset.hitFail.value = 'Fail'
        }
        if (tradingEngine.current.position.positionQuotedAsset.ROI.value > 0) {
            tradingEngine.current.position.positionQuotedAsset.hitFail.value = 'Hit'
        } else {
            tradingEngine.current.position.positionQuotedAsset.hitFail.value = 'Fail'
        }
    }

    function badDefinitionUnhandledException(err, message, node) {
        tradingSystem.errors.push([node.id, message])

        logger.write(MODULE_NAME, "[ERROR] -> " + message);
        logger.write(MODULE_NAME, "[ERROR] -> node.name = " + node.name);
        logger.write(MODULE_NAME, "[ERROR] -> node.type = " + node.type);
        logger.write(MODULE_NAME, "[ERROR] -> node.config = " + JSON.stringify(node.config));
        if (err !== undefined) {
            logger.write(MODULE_NAME, "[ERROR] -> err.stack = " + err.stack);
        }
        throw 'It is not safe to continue with a Definition Error like this. Please fix the problem and try again.'
    }
}