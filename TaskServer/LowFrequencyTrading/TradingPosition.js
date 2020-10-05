exports.newTradingPosition = function newTradingPosition(bot, logger, tradingEngineModule) {
    /*
    This module packages all functions related to Positions.
    */
    const MODULE_NAME = 'Trading Position'
    let thisObject = {
        mantain: mantain,
        reset: reset,
        cycleBasedStatistics: cycleBasedStatistics,
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

    function mantain() {
        updateCounters()
        updateEnds()
    }

    function reset() {
        resetTradingEngineDataStructure()
    }

    function openPosition(situationName) {

        /* Recording the opening at the Trading Engine Data Structure */
        tradingEngine.current.position.status.value = 'Open'
        tradingEngine.current.position.serialNumber.value = tradingEngine.current.episode.episodeCounters.positions.value + 1
        tradingEngine.current.position.identifier.value = global.UNIQUE_ID()
        tradingEngine.current.position.begin.value = tradingEngine.current.episode.candle.end.value
        tradingEngine.current.position.beginRate.value = tradingEngine.current.episode.candle.close.value
        tradingEngine.current.position.positionBaseAsset.beginBalance.value = tradingEngine.current.episode.episodeBaseAsset.balance.value
        tradingEngine.current.position.positionQuotedAsset.beginBalance.value = tradingEngine.current.episode.episodeQuotedAsset.balance.value
        tradingEngine.current.position.situationName.value = situationName

        /* Initializing Stop and Take Phase */
        tradingEngine.current.position.stopLoss.stopLossPhase.value = 1
        tradingEngine.current.position.takeProfit.takeProfitPhase.value = 1

        /* Updating Episode Counters */
        tradingEngine.current.episode.episodeCounters.positions.value++

        /* Inicializing this counter */
        tradingEngine.current.episode.distanceToEvent.takePosition.value = 1

        /* Remember the balance we had before taking the position to later calculate profit or loss */
        tradingEngine.current.position.positionBaseAsset.beginBalance = tradingEngine.current.episode.episodeBaseAsset.balance.value
        tradingEngine.current.position.positionQuotedAsset.beginBalance = tradingEngine.current.episode.episodeQuotedAsset.balance.value
    }

    function closingPosition(exitType) {
        tradingEngine.current.position.status.value = 'Closing'
        tradingEngine.current.position.exitType.value = exitType
    }

    function closePosition() {
        tradingEngine.current.position.status.value = 'Closed'
        tradingEngine.current.position.end.value = tradingEngine.current.episode.candle.end.value
        tradingEngine.current.position.endRate.value = tradingEngine.current.episode.candle.close.value
        tradingEngine.current.position.positionBaseAsset.endBalance.value = tradingEngine.current.episode.episodeBaseAsset.balance.value
        tradingEngine.current.position.positionQuotedAsset.endBalance.value = tradingEngine.current.episode.episodeQuotedAsset.balance.value

        /*
        Now that the position is closed, it is the right time to move this position from current to last at the Trading Engine data structure.
        */
        tradingEngineModule.cloneValues(tradingEngine.current.position, tradingEngine.last.position)

        cycleBasedStatistics()
        
        /* Updating Hits & Fails */
        if (tradingEngine.current.position.positionBaseAsset.profitLoss.value > 0) {
            tradingEngine.current.episode.episodeBaseAsset.hits.value++
        }  
        if (tradingEngine.current.position.positionBaseAsset.profitLoss.value < 0) {
            tradingEngine.current.episode.episodeBaseAsset.fails.value++
        }
        if (tradingEngine.current.position.positionQuotedAsset.profitLoss.value > 0) {
            tradingEngine.current.episode.episodeQuotedAsset.hits.value++
        } 
        if (tradingEngine.current.position.positionQuotedAsset.profitLoss.value < 0) {
            tradingEngine.current.episode.episodeQuotedAsset.fails.value++
        }
    }

    function applyStopLossFormula(formulas, formulaId) {
        tradingEngine.current.position.stopLoss.value = formulas.get(formulaId)
    }

    function applyTakeProfitFormula(formulas, formulaId) {
        tradingEngine.current.position.takeProfit.value = formulas.get(formulaId)
    }

    function updateStopLoss(phase) {
        tradingEngine.current.position.stopLoss.stopLossPhase.value = phase
    }

    function updateTakeProfit(phase) {
        tradingEngine.current.position.takeProfit.takeProfitPhase.value = phase
    }

    function initialTargets(tradingSystemStageNode, tradingEngineStageNode) {

        if (tradingSystemStageNode.initialTargets === undefined) {
            const message = 'Stage without Initial Targets node. Add one please.'
            badDefinitionUnhandledException(undefined, message, tradingSystemStageNode)
        }

        setTargetRate()
        setTargetSize()

        function setTargetRate() {
            if (tradingSystemStageNode.initialTargets.targetRate === undefined) {
                const message = 'Target Rate Node not Found. Fix this please.'
                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets)
            }
            if (tradingSystemStageNode.initialTargets.targetRate.formula === undefined) {
                const message = 'Formula of Target Rate Node not Found. Fix this please.'
                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetRate)
            }

            let value = tradingSystem.formulas.get(tradingSystemStageNode.initialTargets.targetRate.formula.id)
            if (value === undefined) {
                const message = 'Target Rate can not be undefined. Fix this please.'
                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetRate.formula)
            }
            if (isNaN(value)) {
                const message = 'Target Rate must be a number. Fix this please.'
                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetRate.formula)
            }

            switch (tradingSystemStageNode.type) {
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
                tradingSystemStageNode.initialTargets.targetSizeInBaseAsset !== undefined &&
                tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset !== undefined
            ) {
                const message = 'Only Target Size In Base Asset or Target Size In Quoted Asset is allowed. Remove one of them please.'
                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode)
            }

            /* Position In Base Asset */
            if (tradingSystemStageNode.initialTargets.targetSizeInBaseAsset !== undefined) {
                if (tradingSystemStageNode.initialTargets.targetSizeInBaseAsset.formula !== undefined) {
                    let value = tradingSystem.formulas.get(tradingSystemStageNode.initialTargets.targetSizeInBaseAsset.formula.id)
                    if (value === undefined) {
                        const message = 'Target Size In Base Asset cannot be undefined. Fix this please.'
                        badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInBaseAsset.formula)
                    }
                    if (value === undefined) {
                        const message = 'Target Size In Base Asset cannot be zero. Fix this please.'
                        badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInBaseAsset.formula)
                    }

                    switch (tradingSystemStageNode.type) {
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

                    /* Remember how the end user defined this stage. */
                    tradingEngineStageNode.stageDefinedIn.value = 'Base Asset'
                } else {
                    const message = 'You need to specify a Formula for this.'
                    badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInBaseAsset)
                }
            }

            /* Position In Quoted Asset */
            if (tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset !== undefined) {
                if (tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset.formula !== undefined) {
                    let value = tradingSystem.formulas.get(tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset.formula.id)
                    if (value === undefined) {
                        const message = 'Target Size In Quoted Asset cannot be undefined. Fix this please.'
                        badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset.formula)
                    }
                    if (value === undefined) {
                        const message = 'Target Size In Quoted Asset cannot be zero. Fix this please.'
                        badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset.formula)
                    }
                    switch (tradingSystemStageNode.type) {
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

                    /* Remember how the end user defined this stage. */
                    tradingEngineStageNode.stageDefinedIn.value = 'Quoted Asset'
                } else {
                    const errorText = 'You need to specify a Formula for this.'
                    badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset.formula)
                }
            }
        }
    }

    function updateEnds() {
        if (tradingEngine.current.position.status.value === 'Open') {
            tradingEngine.current.position.end.value = tradingEngine.current.episode.candle.end.value
            tradingEngine.current.position.endRate.value = tradingEngine.current.episode.candle.close.value
            tradingEngine.current.position.positionBaseAsset.endBalance.value = tradingEngine.current.episode.episodeBaseAsset.balance.value
            tradingEngine.current.position.positionQuotedAsset.endBalance.value = tradingEngine.current.episode.episodeQuotedAsset.balance.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.current.position.status.value === 'Closed') {
            tradingEngineModule.initializeNode(tradingEngine.current.position)
        }
    }

    function updateCounters() {
        if (tradingEngine.current.position.status.value === 'Open') {
            tradingEngine.current.position.positionCounters.periods.value++
        }
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculatePositionStatistics()

        function calculateAssetsStatistics() {
            /* Profit Loss Calculation */
            tradingEngine.current.position.positionBaseAsset.profitLoss.value =
                tradingEngine.current.episode.episodeBaseAsset.balance.value -
                tradingEngine.current.position.positionBaseAsset.beginBalance

            tradingEngine.current.position.positionQuotedAsset.profitLoss.value =
                tradingEngine.current.episode.episodeQuotedAsset.balance.value -
                tradingEngine.current.position.positionQuotedAsset.beginBalance

            tradingEngine.current.position.positionBaseAsset.profitLoss.value = global.PRECISE(tradingEngine.current.position.positionBaseAsset.profitLoss.value, 10)
            tradingEngine.current.position.positionQuotedAsset.profitLoss.value = global.PRECISE(tradingEngine.current.position.positionQuotedAsset.profitLoss.value, 10)

            /* ROI Calculation */
            tradingEngine.current.position.positionBaseAsset.ROI.value =
                tradingEngine.current.position.positionBaseAsset.profitLoss.value * 100 /
                tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value

            tradingEngine.current.position.positionQuotedAsset.ROI.value =
                tradingEngine.current.position.positionQuotedAsset.profitLoss.value * 100 /
                tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value

            tradingEngine.current.position.positionBaseAsset.ROI.value = global.PRECISE(tradingEngine.current.position.positionBaseAsset.ROI.value, 10)
            tradingEngine.current.position.positionQuotedAsset.ROI.value = global.PRECISE(tradingEngine.current.position.positionQuotedAsset.ROI.value, 10)

            /* Hit Fail Calculation */
            if (tradingEngine.current.position.positionBaseAsset.ROI.value > 0) {
                tradingEngine.current.position.positionBaseAsset.hitFail.value = 'Hit'
            } 
            if (tradingEngine.current.position.positionBaseAsset.ROI.value < 0) {
                tradingEngine.current.position.positionBaseAsset.hitFail.value = 'Fail'
            }
            if (tradingEngine.current.position.positionBaseAsset.ROI.value === 0) {
                tradingEngine.current.position.positionBaseAsset.hitFail.value = 'Even'
            }
            if (tradingEngine.current.position.positionQuotedAsset.ROI.value > 0) {
                tradingEngine.current.position.positionQuotedAsset.hitFail.value = 'Hit'
            } 
            if (tradingEngine.current.position.positionQuotedAsset.ROI.value < 0) {
                tradingEngine.current.position.positionQuotedAsset.hitFail.value = 'Fail'
            }
            if (tradingEngine.current.position.positionQuotedAsset.ROI.value === 0) {
                tradingEngine.current.position.positionQuotedAsset.hitFail.value = 'Even'
            }
        }

        function calculatePositionStatistics() {
            /* Profit Loss Calculation */
            tradingEngine.current.position.positionStatistics.profitLoss.value =
                (
                    tradingEngine.current.episode.episodeBaseAsset.profitLoss.value * tradingEngine.current.position.endRate.value +
                    tradingEngine.current.episode.episodeQuotedAsset.profitLoss.value
                )

            tradingEngine.current.position.positionStatistics.profitLoss.value = global.PRECISE(tradingEngine.current.position.positionStatistics.profitLoss.value, 10)

            /* ROI Calculation */
            tradingEngine.current.position.positionStatistics.ROI.value =
                (
                    tradingEngine.current.position.positionStatistics.profitLoss.value
                )
                * 100 /
                (
                    tradingEngine.current.position.positionBaseAsset.beginBalance * tradingEngine.current.position.beginRate.value +
                    tradingEngine.current.position.positionQuotedAsset.beginBalance
                )
            tradingEngine.current.position.positionStatistics.ROI.value = global.PRECISE(tradingEngine.current.position.positionStatistics.ROI.value, 10)

            /* Hit Fail Calculation */
            if (tradingEngine.current.position.positionStatistics.ROI.value > 0) {
                tradingEngine.current.position.positionStatistics.hitFail.value = 'Hit'
            } 
            if (tradingEngine.current.position.positionStatistics.ROI.value < 0) {
                tradingEngine.current.position.positionStatistics.hitFail.value = 'Fail'
            }
            if (tradingEngine.current.position.positionStatistics.ROI.value === 0) {
                tradingEngine.current.position.positionStatistics.hitFail.value = 'Even'
            }

            /* Days Calculation */
            tradingEngine.current.position.positionStatistics.days.value =
                tradingEngine.current.position.positionCounters.periods.value *
                sessionParameters.timeFrame.config.value / global.ONE_DAY_IN_MILISECONDS

            tradingEngine.current.position.positionStatistics.days.value = global.PRECISE(tradingEngine.current.position.positionStatistics.days.value, 10)
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
        throw 'Please fix the problem and try again.'
    }
}