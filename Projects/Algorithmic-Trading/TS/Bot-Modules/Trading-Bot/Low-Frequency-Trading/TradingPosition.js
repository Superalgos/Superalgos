exports.newAlgorithmicTradingBotModulesTradingPosition = function (processIndex) {
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
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters
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

        /* Starting begin and end */
        tradingEngine.tradingCurrent.position.begin.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.lastBegin.value
        tradingEngine.tradingCurrent.position.end.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.lastEnd.value

        /* Recording the opening at the Trading Engine Data Structure */
        tradingEngine.tradingCurrent.position.status.value = 'Open'
        tradingEngine.tradingCurrent.position.serialNumber.value = tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.positions.value + 1
        tradingEngine.tradingCurrent.position.identifier.value = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
        tradingEngine.tradingCurrent.position.beginRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
        tradingEngine.tradingCurrent.position.positionBaseAsset.beginBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value
        tradingEngine.tradingCurrent.position.positionQuotedAsset.beginBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value
        tradingEngine.tradingCurrent.position.situationName.value = situationName

        /* Initializing Stop and Take Phase */
        tradingEngine.tradingCurrent.position.stopLoss.stopLossPhase.value = 1
        tradingEngine.tradingCurrent.position.takeProfit.takeProfitPhase.value = 1

        /* Updating Episode Counters */
        tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.positions.value++

        /* Initializing this counter */
        tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.takePosition.value = 1

        /* Remember the balance we had before taking the position to later calculate profit or loss */
        tradingEngine.tradingCurrent.position.positionBaseAsset.beginBalance = tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value
        tradingEngine.tradingCurrent.position.positionQuotedAsset.beginBalance = tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value
    }

    function closingPosition(exitType) {
        tradingEngine.tradingCurrent.position.status.value = 'Closing'
        tradingEngine.tradingCurrent.position.exitType.value = exitType

        /*
        By the time we figured out that the stop loss or take profit were hit, or 
        for whatever reason the position needs to be closed, the take profit and
        stop loss values for the next candle have already been calculated. In order
        to avoid being plotted, we will put them in zero. 
        */
        tradingEngine.tradingCurrent.position.stopLoss.value = 0
        tradingEngine.tradingCurrent.position.takeProfit.value = 0
    }

    function closePosition() {
        tradingEngine.tradingCurrent.position.status.value = 'Closed'
        tradingEngine.tradingCurrent.position.end.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.lastEnd.value
        tradingEngine.tradingCurrent.position.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
        tradingEngine.tradingCurrent.position.positionBaseAsset.endBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value
        tradingEngine.tradingCurrent.position.positionQuotedAsset.endBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value

        /*
        Now that the position is closed, it is the right time to move this position from current to last at the Trading Engine data structure.
        */
        TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.cloneValues(tradingEngine.tradingCurrent.position, tradingEngine.tradingLast.position)

        cycleBasedStatistics()

        /* Updating Hits & Fails */
        if (tradingEngine.tradingCurrent.position.positionBaseAsset.profitLoss.value > 0) {
            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.hits.value++
        }
        if (tradingEngine.tradingCurrent.position.positionBaseAsset.profitLoss.value < 0) {
            tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.fails.value++
        }
        if (tradingEngine.tradingCurrent.position.positionQuotedAsset.profitLoss.value > 0) {
            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.hits.value++
        }
        if (tradingEngine.tradingCurrent.position.positionQuotedAsset.profitLoss.value < 0) {
            tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.fails.value++
        }
    }

    function applyStopLossFormula(formulas, formulaId) {
        updateStopLossTakeProfitFinalValue(tradingEngine.tradingCurrent.position.stopLoss)
        tradingEngine.tradingCurrent.position.stopLoss.value = formulas.get(formulaId)
        updateStopLossTakeProfitInitialValue(tradingEngine.tradingCurrent.position.stopLoss)
        updateStopLossTakeProfitBeginEnd(tradingEngine.tradingCurrent.position.stopLoss)
    }

    function applyTakeProfitFormula(formulas, formulaId) {
        updateStopLossTakeProfitFinalValue(tradingEngine.tradingCurrent.position.takeProfit)
        tradingEngine.tradingCurrent.position.takeProfit.value = formulas.get(formulaId)
        updateStopLossTakeProfitInitialValue(tradingEngine.tradingCurrent.position.takeProfit)
        updateStopLossTakeProfitBeginEnd(tradingEngine.tradingCurrent.position.takeProfit)
    }

    function updateStopLossTakeProfitInitialValue(node) {
        /*
        We store the first Stop Loss or Take Profit value in a separate node.
        To know if it is the first one we compare its current value to the initial value.
        */
        if (node.initialValue.value === node.initialValue.config.initialValue) {
            node.initialValue.value = node.value
        }
    }

    function updateStopLossTakeProfitFinalValue(node) {
        /*
        We set the final value just before calculating the new value, since the new calculated
        value is going to be discarded if the position is closed after it is calculated, but
        during the same candle.
        */
        node.finalValue.value = node.value
    }

    function updateStopLossTakeProfitBeginEnd(node) {
        /*
        Both the Stop Loss and the Take Profit have their own Begin and End.
        The reason for this is because they represent targets to be checked
        at the next candle, so it does not apply that they share the begin and
        end of the position itself. 
        */
        node.begin.value =
            tradingEngine.tradingCurrent.tradingEpisode.candle.begin.value +
            sessionParameters.timeFrame.config.value
        node.end.value =
            tradingEngine.tradingCurrent.tradingEpisode.candle.end.value +
            sessionParameters.timeFrame.config.value
    }

    function updateStopLoss(phase) {
        tradingEngine.tradingCurrent.position.stopLoss.stopLossPhase.value = phase
    }

    function updateTakeProfit(phase) {
        tradingEngine.tradingCurrent.position.takeProfit.takeProfitPhase.value = phase
    }

    function initialTargets(tradingSystemStageNode, tradingEngineStageNode, stageName) {

        if (tradingSystemStageNode.initialTargets === undefined) {
            const message = 'Initial Targets Node Missing'

            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - ' + message,
                placeholder: {}
            }

            badDefinitionUnhandledException(undefined, message, tradingSystemStageNode, docs)
        }

        setTargetRate()
        return setTargetSize(stageName)

        function setTargetRate() {
            if (tradingSystemStageNode.initialTargets.targetRate === undefined) {
                const message = 'Target Rate Node Missing'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Trading Bot Error - ' + message,
                    placeholder: {}
                }

                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets, docs)
            }
            if (tradingSystemStageNode.initialTargets.targetRate.formula === undefined) {
                const message = 'Formula Node Missing'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Trading Bot Error - ' + message,
                    placeholder: {}
                }

                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetRate, docs)
            }

            let value = tradingSystem.formulas.get(tradingSystemStageNode.initialTargets.targetRate.formula.id)
            if (value === undefined) {
                const message = 'Target Rate Node Value Undefined'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Trading Bot Error - ' + message,
                    placeholder: {}
                }

                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetRate, docs)
            }
            if (isNaN(value)) {
                const message = 'Target Rate Node Value Not A Number'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Trading Bot Error - ' + message,
                    placeholder: {}
                }

                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, value, undefined)

                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetRate, docs)
            }

            switch (tradingSystemStageNode.type) {
                case 'Open Stage': {
                    tradingEngine.tradingCurrent.position.entryTargetRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                    break
                }
                case 'Close Stage': {
                    tradingEngine.tradingCurrent.position.exitTargetRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                    break
                }
            }
        }

        function setTargetSize(stageName) {
            /* Basic Validation */
            if (
                tradingSystemStageNode.initialTargets.targetSizeInBaseAsset !== undefined &&
                tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset !== undefined
            ) {
                // 'Only Target Size In Base Asset or Target Size In Quoted Asset is allowed.'
                const message = 'Only One Target Size Allowed'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Trading Bot Error - ' + message,
                    placeholder: {}
                }

                badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets, docs)
            }

            /* Position In Base Asset */
            if (tradingSystemStageNode.initialTargets.targetSizeInBaseAsset !== undefined) {
                if (tradingSystemStageNode.initialTargets.targetSizeInBaseAsset.formula !== undefined) {
                    let value = tradingSystem.formulas.get(tradingSystemStageNode.initialTargets.targetSizeInBaseAsset.formula.id)
                    if (value === undefined) {
                        const message = 'Target Size Value Undefined'

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Trading Bot Error - ' + message,
                            placeholder: {}
                        }

                        badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInBaseAsset, docs)
                    }
                    if (value === 0) {
                        if (stageName === 'Close Stage') {
                            return false;
                        }
                        const message = 'Target Size Value Zero'

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Trading Bot Error - ' + message,
                            placeholder: {}
                        }

                        badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInBaseAsset, docs)
                    }

                    switch (tradingSystemStageNode.type) {
                        case 'Open Stage': {
                            tradingEngine.tradingCurrent.position.positionBaseAsset.entryTargetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                            tradingEngine.tradingCurrent.position.positionQuotedAsset.entryTargetSize.value =
                                TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value * tradingEngine.tradingCurrent.position.entryTargetRate.value, 10)
                            break
                        }
                        case 'Close Stage': {
                            tradingEngine.tradingCurrent.position.positionBaseAsset.exitTargetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                            tradingEngine.tradingCurrent.position.positionQuotedAsset.exitTargetSize.value =
                                TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value * tradingEngine.tradingCurrent.position.exitTargetRate.value, 10)
                            break
                        }
                    }

                    /* Remember how the end user defined this stage. */
                    tradingEngineStageNode.stageDefinedIn.value = 'Base Asset'
                } else {
                    const message = 'Formula Node Missing'

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - ' + message,
                        placeholder: {}
                    }

                    badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInBaseAsset, docs)
                }
            }

            /* Position In Quoted Asset */
            if (tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset !== undefined) {
                if (tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset.formula !== undefined) {
                    let value = tradingSystem.formulas.get(tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset.formula.id)
                    if (value === undefined) {
                        const message = 'Target Size Value Undefined'

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Trading Bot Error - ' + message,
                            placeholder: {}
                        }

                        badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset, docs)
                    }
                    if (value === 0) {
                        const message = 'Target Size Value Zero'

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Trading Bot Error - ' + message,
                            placeholder: {}
                        }

                        badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset, docs)
                    }
                    switch (tradingSystemStageNode.type) {
                        case 'Open Stage': {
                            tradingEngine.tradingCurrent.position.positionQuotedAsset.entryTargetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                            tradingEngine.tradingCurrent.position.positionBaseAsset.entryTargetSize.value =
                                TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value / tradingEngine.tradingCurrent.position.entryTargetRate.value, 10)
                            break
                        }
                        case 'Close Stage': {
                            tradingEngine.tradingCurrent.position.positionQuotedAsset.exitTargetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                            tradingEngine.tradingCurrent.position.positionBaseAsset.exitTargetSize.value =
                                TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value / tradingEngine.tradingCurrent.position.exitTargetRate.value, 10)
                            break
                        }
                    }

                    /* Remember how the end user defined this stage. */
                    tradingEngineStageNode.stageDefinedIn.value = 'Quoted Asset'
                } else {
                    const message = 'Formula Node Missing'

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - ' + message,
                        placeholder: {}
                    }

                    badDefinitionUnhandledException(undefined, message, tradingSystemStageNode.initialTargets.targetSizeInQuotedAsset, docs)
                }
            }
        }
    }

    function updateEnds() {
        if (tradingEngine.tradingCurrent.position.status.value === 'Open') {
            tradingEngine.tradingCurrent.position.end.value = tradingEngine.tradingCurrent.position.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.tradingCurrent.position.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
            tradingEngine.tradingCurrent.position.positionBaseAsset.endBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value
            tradingEngine.tradingCurrent.position.positionQuotedAsset.endBalance.value = tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.tradingCurrent.position.status.value === 'Closed') {
            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(tradingEngine.tradingCurrent.position)
        }
    }

    function updateCounters() {
        if (tradingEngine.tradingCurrent.position.status.value === 'Open') {
            tradingEngine.tradingCurrent.position.positionCounters.periods.value++
        }
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculatePositionStatistics()

        function calculateAssetsStatistics() {
            /* Profit Loss Calculation */
            tradingEngine.tradingCurrent.position.positionBaseAsset.profitLoss.value =
                tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value -
                tradingEngine.tradingCurrent.position.positionBaseAsset.beginBalance

            tradingEngine.tradingCurrent.position.positionQuotedAsset.profitLoss.value =
                tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value -
                tradingEngine.tradingCurrent.position.positionQuotedAsset.beginBalance

            tradingEngine.tradingCurrent.position.positionBaseAsset.profitLoss.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.position.positionBaseAsset.profitLoss.value, 10)
            tradingEngine.tradingCurrent.position.positionQuotedAsset.profitLoss.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.position.positionQuotedAsset.profitLoss.value, 10)

            /* ROI Calculation */
            tradingEngine.tradingCurrent.position.positionBaseAsset.ROI.value =
                tradingEngine.tradingCurrent.position.positionBaseAsset.profitLoss.value * 100 /
                tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset.targetSize.value

            tradingEngine.tradingCurrent.position.positionQuotedAsset.ROI.value =
                tradingEngine.tradingCurrent.position.positionQuotedAsset.profitLoss.value * 100 /
                tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset.targetSize.value

            tradingEngine.tradingCurrent.position.positionBaseAsset.ROI.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.position.positionBaseAsset.ROI.value, 10)
            tradingEngine.tradingCurrent.position.positionQuotedAsset.ROI.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.position.positionQuotedAsset.ROI.value, 10)

            /* Hit Fail Calculation */
            if (tradingEngine.tradingCurrent.position.positionBaseAsset.ROI.value > 0) {
                tradingEngine.tradingCurrent.position.positionBaseAsset.hitFail.value = 'Hit'
            }
            if (tradingEngine.tradingCurrent.position.positionBaseAsset.ROI.value < 0) {
                tradingEngine.tradingCurrent.position.positionBaseAsset.hitFail.value = 'Fail'
            }
            if (tradingEngine.tradingCurrent.position.positionBaseAsset.ROI.value === 0) {
                tradingEngine.tradingCurrent.position.positionBaseAsset.hitFail.value = 'Even'
            }
            if (tradingEngine.tradingCurrent.position.positionQuotedAsset.ROI.value > 0) {
                tradingEngine.tradingCurrent.position.positionQuotedAsset.hitFail.value = 'Hit'
            }
            if (tradingEngine.tradingCurrent.position.positionQuotedAsset.ROI.value < 0) {
                tradingEngine.tradingCurrent.position.positionQuotedAsset.hitFail.value = 'Fail'
            }
            if (tradingEngine.tradingCurrent.position.positionQuotedAsset.ROI.value === 0) {
                tradingEngine.tradingCurrent.position.positionQuotedAsset.hitFail.value = 'Even'
            }
        }

        function calculatePositionStatistics() {
            /* Profit Loss Calculation */
            tradingEngine.tradingCurrent.position.positionStatistics.profitLoss.value =
                (
                    tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.profitLoss.value * tradingEngine.tradingCurrent.position.endRate.value +
                    tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.profitLoss.value
                )

            tradingEngine.tradingCurrent.position.positionStatistics.profitLoss.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.position.positionStatistics.profitLoss.value, 10)

            /* ROI Calculation */
            tradingEngine.tradingCurrent.position.positionStatistics.ROI.value =
                (
                    tradingEngine.tradingCurrent.position.positionStatistics.profitLoss.value
                )
                * 100 /
                (
                    tradingEngine.tradingCurrent.position.positionBaseAsset.beginBalance * tradingEngine.tradingCurrent.position.beginRate.value +
                    tradingEngine.tradingCurrent.position.positionQuotedAsset.beginBalance
                )
            tradingEngine.tradingCurrent.position.positionStatistics.ROI.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.position.positionStatistics.ROI.value, 10)

            /* Hit Fail Calculation */
            if (tradingEngine.tradingCurrent.position.positionStatistics.ROI.value > 0) {
                tradingEngine.tradingCurrent.position.positionStatistics.hitFail.value = 'Hit'
            }
            if (tradingEngine.tradingCurrent.position.positionStatistics.ROI.value < 0) {
                tradingEngine.tradingCurrent.position.positionStatistics.hitFail.value = 'Fail'
            }
            if (tradingEngine.tradingCurrent.position.positionStatistics.ROI.value === 0) {
                tradingEngine.tradingCurrent.position.positionStatistics.hitFail.value = 'Even'
            }

            /* Days Calculation */
            tradingEngine.tradingCurrent.position.positionStatistics.days.value =
                tradingEngine.tradingCurrent.position.positionCounters.periods.value *
                sessionParameters.timeFrame.config.value / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS

            tradingEngine.tradingCurrent.position.positionStatistics.days.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.position.positionStatistics.days.value, 10)
        }
    }

    function badDefinitionUnhandledException(err, message, node, docs) {
        tradingSystem.addError([node.id, message, docs])

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> " + message);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.name = " + node.name);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.type = " + node.type);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.config = " + JSON.stringify(node.config));
        if (err !== undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> err.stack = " + err.stack);
        }
        throw 'Error Already Recorded'
    }
}