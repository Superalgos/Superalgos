exports.newAlgorithmicTradingBotModulesTradingExecution = function (processIndex) {
    /*
    The Trading Execution modules manages the execution nodes and execution algorithms.
    */
    const MODULE_NAME = 'Trading Execution'

    let thisObject = {
        mantain: mantain,
        reset: reset,
        runExecution: runExecution,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let tradingSystem
    let sessionParameters

    let tradingOrdersModuleObject = TS.projects.algorithmicTrading.botModules.tradingOrders.newAlgorithmicTradingBotModulesTradingOrders(processIndex)

    return thisObject

    function initialize() {
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

        tradingOrdersModuleObject.initialize()
    }

    function finalize() {
        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined

        tradingOrdersModuleObject.finalize()
        tradingOrdersModuleObject = undefined
    }

    function mantain() {
        tradingOrdersModuleObject.mantain()
    }

    function reset() {
        tradingOrdersModuleObject.reset()
    }

    async function runExecution(
        executionNode,
        tradingEngineStage
    ) {
        try {
            /* Trading Engine Stage Validations */
            if (tradingEngineStage.stageBaseAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Base Asset Node Missing', tradingEngineStage) }
            if (tradingEngineStage.stageBaseAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', tradingEngineStage) }
            if (tradingEngineStage.stageBaseAsset.sizePlaced === undefined) { badDefinitionUnhandledException(undefined, 'Size Placed Node Missing', tradingEngineStage) }
            if (tradingEngineStage.stageBaseAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'Size Filled Node Missing', tradingEngineStage) }
            if (tradingEngineStage.stageBaseAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees Paid Node Missing', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Quoted Asset Node Missing', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset.sizePlaced === undefined) { badDefinitionUnhandledException(undefined, 'Size Placed Node Missing', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'Size Filled Node Missing', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees Paid Node Missing', tradingEngineStage) }

            await checkExecutionAlgorithms(executionNode)

            async function checkExecutionAlgorithms(executionNode) {
                for (let i = 0; i < executionNode.executionAlgorithms.length; i++) {
                    let executionAlgorithm = executionNode.executionAlgorithms[i]
                    await tradingOrdersModuleObject.checkOrders(tradingEngineStage, executionAlgorithm.marketBuyOrders, executionAlgorithm, executionNode)
                    await tradingOrdersModuleObject.checkOrders(tradingEngineStage, executionAlgorithm.marketSellOrders, executionAlgorithm, executionNode)
                    await tradingOrdersModuleObject.checkOrders(tradingEngineStage, executionAlgorithm.limitBuyOrders, executionAlgorithm, executionNode)
                    await tradingOrdersModuleObject.checkOrders(tradingEngineStage, executionAlgorithm.limitSellOrders, executionAlgorithm, executionNode)
                }
            }

        } catch (err) {
            if (err !== 'Error Already Recorded') {

                const message = 'Execution Unexpected Error'
                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Trading Bot Error - ' + message,
                    placeholder: {}
                }

                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err)

                tradingSystem.addError([executionNode.id, message, docs])
            }

            if (typeof err === 'string' || err instanceof String) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err)
            }
            if (err.stack !== undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err.stack)
            }
        }
    }

    function badDefinitionUnhandledException(err, message, node) {

        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS LF Trading Bot Error - ' + message,
            placeholder: {}
        }

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

