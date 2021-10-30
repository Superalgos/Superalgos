exports.newPortfolioManagementBotModulesPortfolioPosition = function (processIndex) {
    /*
    This module packages all functions related to Positions.
    */
    const MODULE_NAME = 'Portfolio Position'
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
        resetPortfolioEngineDataStructure: resetPortfolioEngineDataStructure,
        updateCounters: updateCounters,
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
        updateEnds()
    }

    function reset() {
        resetPortfolioEngineDataStructure()
    }

    function openPosition(situationName) {

        /* Starting begin and end */
        portfolioEngine.portfolioCurrent.position.begin.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastBegin.value
        portfolioEngine.portfolioCurrent.position.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastEnd.value

        /* Recording the opening at the Portfolio Engine Data Structure */
        portfolioEngine.portfolioCurrent.position.status.value = 'Open'
        portfolioEngine.portfolioCurrent.position.serialNumber.value = portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.positions.value + 1
        portfolioEngine.portfolioCurrent.position.identifier.value = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
        portfolioEngine.portfolioCurrent.position.beginRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        portfolioEngine.portfolioCurrent.position.positionBaseAsset.beginBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value
        portfolioEngine.portfolioCurrent.position.positionQuotedAsset.beginBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value
        portfolioEngine.portfolioCurrent.position.situationName.value = situationName

        /* Initializing Stop and Take Phase */
        portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPhase.value = 1
        portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPhase.value = 1

        /* Updating Episode Counters */
        portfolioEngine.portfolioCurrent.portfolioEpisode.portfolioEpisodeCounters.positions.value++

        /* Inicializing this counter */
        portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.takePosition.value = 1

        /* Remember the balance we had before taking the position to later calculate profit or loss */
        portfolioEngine.portfolioCurrent.position.positionBaseAsset.beginBalance = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value
        portfolioEngine.portfolioCurrent.position.positionQuotedAsset.beginBalance = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value
    }

    function closingPosition(exitType) {
        portfolioEngine.portfolioCurrent.position.status.value = 'Closing'
        portfolioEngine.portfolioCurrent.position.exitType.value = exitType

        /*
        By the time we figured out that the stop loss or take profit were hit, or 
        for whatever reason the position needs to be closed, the take profit and
        stop loss values for the next candle have already been calculated. In order
        to avoid being plotted, we will put them in zero. 
        */
        portfolioEngine.portfolioCurrent.position.stopLoss.value = 0
        portfolioEngine.portfolioCurrent.position.takeProfit.value = 0
    }

    function closePosition() {
        portfolioEngine.portfolioCurrent.position.status.value = 'Closed'
        portfolioEngine.portfolioCurrent.position.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastEnd.value
        portfolioEngine.portfolioCurrent.position.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        portfolioEngine.portfolioCurrent.position.positionBaseAsset.endBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value
        portfolioEngine.portfolioCurrent.position.positionQuotedAsset.endBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value

        /*
        Now that the position is closed, it is the right time to move this position from current to last at the Portfolio Engine data structure.
        */
        TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.cloneValues(portfolioEngine.portfolioCurrent.position, portfolioEngine.portfolioLast.position)

        cycleBasedStatistics()

        /* Updating Hits & Fails */
        if (portfolioEngine.portfolioCurrent.position.positionBaseAsset.profitLoss.value > 0) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.hits.value++
        }
        if (portfolioEngine.portfolioCurrent.position.positionBaseAsset.profitLoss.value < 0) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.fails.value++
        }
        if (portfolioEngine.portfolioCurrent.position.positionQuotedAsset.profitLoss.value > 0) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.hits.value++
        }
        if (portfolioEngine.portfolioCurrent.position.positionQuotedAsset.profitLoss.value < 0) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.fails.value++
        }
    }

    function applyStopLossFormula(formulas, formulaId) {
        updateStopLossTakeProfitFinalValue(portfolioEngine.portfolioCurrent.position.stopLoss)
        portfolioEngine.portfolioCurrent.position.stopLoss.value = formulas.get(formulaId)
        updateStopLossTakeProfitInitialValue(portfolioEngine.portfolioCurrent.position.stopLoss)
        updateStopLossTakeProfitBeginEnd(portfolioEngine.portfolioCurrent.position.stopLoss)
    }

    function applyTakeProfitFormula(formulas, formulaId) {
        updateStopLossTakeProfitFinalValue(portfolioEngine.portfolioCurrent.position.takeProfit)
        portfolioEngine.portfolioCurrent.position.takeProfit.value = formulas.get(formulaId)
        updateStopLossTakeProfitInitialValue(portfolioEngine.portfolioCurrent.position.takeProfit)
        updateStopLossTakeProfitBeginEnd(portfolioEngine.portfolioCurrent.position.takeProfit)
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
            portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value +
            sessionParameters.timeFrame.config.value
        node.end.value =
            portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value +
            sessionParameters.timeFrame.config.value
    }

    function updateStopLoss(phase) {
        portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPhase.value = phase
    }

    function updateTakeProfit(phase) {
        portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPhase.value = phase
    }

    function initialTargets(portfolioSystemStageNode, portfolioEngineStageNode, stageName) {

        if (portfolioSystemStageNode.initialTargets === undefined) {
            const message = 'Initial Targets Node Missing'

            let docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Error - ' + message,
                placeholder: {}
            }

            badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode, docs)
        }

        setTargetRate()
        return setTargetSize(stageName)

        function setTargetRate() {
            if (portfolioSystemStageNode.initialTargets.targetRate === undefined) {
                const message = 'Target Rate Node Missing'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Portfolio Bot Error - ' + message,
                    placeholder: {}
                }

                badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets, docs)
            }
            if (portfolioSystemStageNode.initialTargets.targetRate.formula === undefined) {
                const message = 'Formula Node Missing'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Portfolio Bot Error - ' + message,
                    placeholder: {}
                }

                badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets.targetRate, docs)
            }

            let value = portfolioSystem.formulas.get(portfolioSystemStageNode.initialTargets.targetRate.formula.id)
            if (value === undefined) {
                const message = 'Target Rate Node Value Undefined'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Portfolio Bot Error - ' + message,
                    placeholder: {}
                }

                badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets.targetRate, docs)
            }
            if (isNaN(value)) {
                const message = 'Target Rate Node Value Not A Number'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Portfolio Bot Error - ' + message,
                    placeholder: {}
                }

                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, value, undefined)

                badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets.targetRate, docs)
            }

            switch (portfolioSystemStageNode.type) {
                case 'Open Stage': {
                    portfolioEngine.portfolioCurrent.position.entryTargetRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                    break
                }
                case 'Close Stage': {
                    portfolioEngine.portfolioCurrent.position.exitTargetRate.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                    break
                }
            }
        }

        function setTargetSize(stageName) {
            /* Basic Validation */
            if (
                portfolioSystemStageNode.initialTargets.targetSizeInBaseAsset !== undefined &&
                portfolioSystemStageNode.initialTargets.targetSizeInQuotedAsset !== undefined
            ) {
                // 'Only Target Size In Base Asset or Target Size In Quoted Asset is allowed.'
                const message = 'Only One Target Size Allowed'

                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Portfolio Bot Error - ' + message,
                    placeholder: {}
                }

                badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets, docs)
            }

            /* Position In Base Asset */
            if (portfolioSystemStageNode.initialTargets.targetSizeInBaseAsset !== undefined) {
                if (portfolioSystemStageNode.initialTargets.targetSizeInBaseAsset.formula !== undefined) {
                    let value = portfolioSystem.formulas.get(portfolioSystemStageNode.initialTargets.targetSizeInBaseAsset.formula.id)
                    if (value === undefined) {
                        const message = 'Target Size Value Undefined'

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Portfolio Bot Error - ' + message,
                            placeholder: {}
                        }

                        badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets.targetSizeInBaseAsset, docs)
                    }
                    if (value === 0) {
                        if (stageName === 'Close Stage') {
                            return false;
                        }
                        const message = 'Target Size Value Zero'

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Portfolio Bot Error - ' + message,
                            placeholder: {}
                        }

                        badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets.targetSizeInBaseAsset, docs)
                    }

                    switch (portfolioSystemStageNode.type) {
                        case 'Open Stage': {
                            portfolioEngine.portfolioCurrent.position.positionBaseAsset.entryTargetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                            portfolioEngine.portfolioCurrent.position.positionQuotedAsset.entryTargetSize.value =
                                TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value * portfolioEngine.portfolioCurrent.position.entryTargetRate.value, 10)
                            break
                        }
                        case 'Close Stage': {
                            portfolioEngine.portfolioCurrent.position.positionBaseAsset.exitTargetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                            portfolioEngine.portfolioCurrent.position.positionQuotedAsset.exitTargetSize.value =
                                TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value * portfolioEngine.portfolioCurrent.position.exitTargetRate.value, 10)
                            break
                        }
                    }

                    /* Remember how the end user defined this stage. */
                    portfolioEngineStageNode.stageDefinedIn.value = 'Base Asset'
                } else {
                    const message = 'Formula Node Missing'

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Portfolio Bot Error - ' + message,
                        placeholder: {}
                    }

                    badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets.targetSizeInBaseAsset, docs)
                }
            }

            /* Position In Quoted Asset */
            if (portfolioSystemStageNode.initialTargets.targetSizeInQuotedAsset !== undefined) {
                if (portfolioSystemStageNode.initialTargets.targetSizeInQuotedAsset.formula !== undefined) {
                    let value = portfolioSystem.formulas.get(portfolioSystemStageNode.initialTargets.targetSizeInQuotedAsset.formula.id)
                    if (value === undefined) {
                        const message = 'Target Size Value Undefined'

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Portfolio Bot Error - ' + message,
                            placeholder: {}
                        }

                        badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets.targetSizeInQuotedAsset, docs)
                    }
                    if (value === 0) {
                        const message = 'Target Size Value Zero'

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Portfolio Bot Error - ' + message,
                            placeholder: {}
                        }

                        badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets.targetSizeInQuotedAsset, docs)
                    }
                    switch (portfolioSystemStageNode.type) {
                        case 'Open Stage': {
                            portfolioEngine.portfolioCurrent.position.positionQuotedAsset.entryTargetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                            portfolioEngine.portfolioCurrent.position.positionBaseAsset.entryTargetSize.value =
                                TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value / portfolioEngine.portfolioCurrent.position.entryTargetRate.value, 10)
                            break
                        }
                        case 'Close Stage': {
                            portfolioEngine.portfolioCurrent.position.positionQuotedAsset.exitTargetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value, 10)
                            portfolioEngine.portfolioCurrent.position.positionBaseAsset.exitTargetSize.value =
                                TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(value / portfolioEngine.portfolioCurrent.position.exitTargetRate.value, 10)
                            break
                        }
                    }

                    /* Remember how the end user defined this stage. */
                    portfolioEngineStageNode.stageDefinedIn.value = 'Quoted Asset'
                } else {
                    const message = 'Formula Node Missing'

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Portfolio Bot Error - ' + message,
                        placeholder: {}
                    }

                    badDefinitionUnhandledException(undefined, message, portfolioSystemStageNode.initialTargets.targetSizeInQuotedAsset, docs)
                }
            }
        }
    }

    function updateEnds() {
        if (portfolioEngine.portfolioCurrent.position.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.position.end.value = portfolioEngine.portfolioCurrent.position.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.position.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
            portfolioEngine.portfolioCurrent.position.positionBaseAsset.endBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value
            portfolioEngine.portfolioCurrent.position.positionQuotedAsset.endBalance.value = portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value
        }
    }

    function resetPortfolioEngineDataStructure() {
        if (portfolioEngine.portfolioCurrent.position.status.value === 'Closed') {
            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.initializeNode(portfolioEngine.portfolioCurrent.position)
        }
    }

    function updateCounters() {
        if (portfolioEngine.portfolioCurrent.position.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.position.positionCounters.periods.value++
        }
    }

    function cycleBasedStatistics() {

        calculateAssetsStatistics()
        calculatePositionStatistics()

        function calculateAssetsStatistics() {
            /* Profit Loss Calculation */
            portfolioEngine.portfolioCurrent.position.positionBaseAsset.profitLoss.value =
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value -
                portfolioEngine.portfolioCurrent.position.positionBaseAsset.beginBalance

            portfolioEngine.portfolioCurrent.position.positionQuotedAsset.profitLoss.value =
                portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value -
                portfolioEngine.portfolioCurrent.position.positionQuotedAsset.beginBalance

            portfolioEngine.portfolioCurrent.position.positionBaseAsset.profitLoss.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.position.positionBaseAsset.profitLoss.value, 10)
            portfolioEngine.portfolioCurrent.position.positionQuotedAsset.profitLoss.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.position.positionQuotedAsset.profitLoss.value, 10)

            /* ROI Calculation */
            portfolioEngine.portfolioCurrent.position.positionBaseAsset.ROI.value =
                portfolioEngine.portfolioCurrent.position.positionBaseAsset.profitLoss.value * 100 /
                portfolioEngine.portfolioCurrent.strategyOpenStage.stageBaseAsset.targetSize.value

            portfolioEngine.portfolioCurrent.position.positionQuotedAsset.ROI.value =
                portfolioEngine.portfolioCurrent.position.positionQuotedAsset.profitLoss.value * 100 /
                portfolioEngine.portfolioCurrent.strategyOpenStage.stageQuotedAsset.targetSize.value

            portfolioEngine.portfolioCurrent.position.positionBaseAsset.ROI.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.position.positionBaseAsset.ROI.value, 10)
            portfolioEngine.portfolioCurrent.position.positionQuotedAsset.ROI.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.position.positionQuotedAsset.ROI.value, 10)

            /* Hit Fail Calculation */
            if (portfolioEngine.portfolioCurrent.position.positionBaseAsset.ROI.value > 0) {
                portfolioEngine.portfolioCurrent.position.positionBaseAsset.hitFail.value = 'Hit'
            }
            if (portfolioEngine.portfolioCurrent.position.positionBaseAsset.ROI.value < 0) {
                portfolioEngine.portfolioCurrent.position.positionBaseAsset.hitFail.value = 'Fail'
            }
            if (portfolioEngine.portfolioCurrent.position.positionBaseAsset.ROI.value === 0) {
                portfolioEngine.portfolioCurrent.position.positionBaseAsset.hitFail.value = 'Even'
            }
            if (portfolioEngine.portfolioCurrent.position.positionQuotedAsset.ROI.value > 0) {
                portfolioEngine.portfolioCurrent.position.positionQuotedAsset.hitFail.value = 'Hit'
            }
            if (portfolioEngine.portfolioCurrent.position.positionQuotedAsset.ROI.value < 0) {
                portfolioEngine.portfolioCurrent.position.positionQuotedAsset.hitFail.value = 'Fail'
            }
            if (portfolioEngine.portfolioCurrent.position.positionQuotedAsset.ROI.value === 0) {
                portfolioEngine.portfolioCurrent.position.positionQuotedAsset.hitFail.value = 'Even'
            }
        }

        function calculatePositionStatistics() {
            /* Profit Loss Calculation */
            portfolioEngine.portfolioCurrent.position.positionStatistics.profitLoss.value =
                (
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.profitLoss.value * portfolioEngine.portfolioCurrent.position.endRate.value +
                    portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.profitLoss.value
                )

            portfolioEngine.portfolioCurrent.position.positionStatistics.profitLoss.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.position.positionStatistics.profitLoss.value, 10)

            /* ROI Calculation */
            portfolioEngine.portfolioCurrent.position.positionStatistics.ROI.value =
                (
                    portfolioEngine.portfolioCurrent.position.positionStatistics.profitLoss.value
                )
                * 100 /
                (
                    portfolioEngine.portfolioCurrent.position.positionBaseAsset.beginBalance * portfolioEngine.portfolioCurrent.position.beginRate.value +
                    portfolioEngine.portfolioCurrent.position.positionQuotedAsset.beginBalance
                )
            portfolioEngine.portfolioCurrent.position.positionStatistics.ROI.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.position.positionStatistics.ROI.value, 10)

            /* Hit Fail Calculation */
            if (portfolioEngine.portfolioCurrent.position.positionStatistics.ROI.value > 0) {
                portfolioEngine.portfolioCurrent.position.positionStatistics.hitFail.value = 'Hit'
            }
            if (portfolioEngine.portfolioCurrent.position.positionStatistics.ROI.value < 0) {
                portfolioEngine.portfolioCurrent.position.positionStatistics.hitFail.value = 'Fail'
            }
            if (portfolioEngine.portfolioCurrent.position.positionStatistics.ROI.value === 0) {
                portfolioEngine.portfolioCurrent.position.positionStatistics.hitFail.value = 'Even'
            }

            /* Days Calculation */
            portfolioEngine.portfolioCurrent.position.positionStatistics.days.value =
                portfolioEngine.portfolioCurrent.position.positionCounters.periods.value *
                sessionParameters.timeFrame.config.value / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS

            portfolioEngine.portfolioCurrent.position.positionStatistics.days.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.position.positionStatistics.days.value, 10)
        }
    }

    function badDefinitionUnhandledException(err, message, node, docs) {
        portfolioSystem.addError([node.id, message, docs])

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