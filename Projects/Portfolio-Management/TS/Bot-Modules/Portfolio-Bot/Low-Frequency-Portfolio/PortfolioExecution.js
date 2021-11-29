exports.newPortfolioManagementBotModulesPortfolioExecution = function (processIndex) {
    /*
    The Portfolio Execution modules manages the execution nodes and execution algoritms.
    */
    const MODULE_NAME = 'Portfolio Execution'

    let thisObject = {
        mantain: mantain,
        reset: reset,
        runExecution: runExecution,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioEngine
    let portfolioSystem
    let sessionParameters

    let portfolioOrdersModuleObject = TS.projects.portfolioManagement.botModules.portfolioOrders.newPortfolioManagementBotModulesPortfolioOrders(processIndex)

    return thisObject

    function initialize() {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters

        portfolioOrdersModuleObject.initialize()
    }

    function finalize() {
        portfolioSystem = undefined
        portfolioEngine = undefined
        sessionParameters = undefined

        portfolioOrdersModuleObject.finalize()
        portfolioOrdersModuleObject = undefined
    }

    function mantain() {
        portfolioOrdersModuleObject.mantain()
    }

    function reset() {
        portfolioOrdersModuleObject.reset()
    }

    async function runExecution(
        executionNode,
        portfolioEngineStage
    ) {
        try {
            /* Portfolio Engine Stage Validations */
            if (portfolioEngineStage.stageBaseAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Base Asset Node Missing', portfolioEngineStage) }
            if (portfolioEngineStage.stageBaseAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', portfolioEngineStage) }
            if (portfolioEngineStage.stageBaseAsset.sizePlaced === undefined) { badDefinitionUnhandledException(undefined, 'Size Placed Node Missing', portfolioEngineStage) }
            if (portfolioEngineStage.stageBaseAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'Size Filled Node Missing', portfolioEngineStage) }
            if (portfolioEngineStage.stageBaseAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees Paid Node Missing', portfolioEngineStage) }
            if (portfolioEngineStage.stageQuotedAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Quoted Asset Node Missing', portfolioEngineStage) }
            if (portfolioEngineStage.stageQuotedAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', portfolioEngineStage) }
            if (portfolioEngineStage.stageQuotedAsset.sizePlaced === undefined) { badDefinitionUnhandledException(undefined, 'Size Placed Node Missing', portfolioEngineStage) }
            if (portfolioEngineStage.stageQuotedAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'Size Filled Node Missing', portfolioEngineStage) }
            if (portfolioEngineStage.stageQuotedAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'Fees Paid Node Missing', portfolioEngineStage) }

            await checkExecutionAlgorithms(executionNode)

            async function checkExecutionAlgorithms(executionNode) {
                for (let i = 0; i < executionNode.executionAlgorithms.length; i++) {
                    let executionAlgorithm = executionNode.executionAlgorithms[i]
                    await portfolioOrdersModuleObject.checkOrders(portfolioEngineStage, executionAlgorithm.marketBuyOrders, executionAlgorithm, executionNode)
                    await portfolioOrdersModuleObject.checkOrders(portfolioEngineStage, executionAlgorithm.marketSellOrders, executionAlgorithm, executionNode)
                    await portfolioOrdersModuleObject.checkOrders(portfolioEngineStage, executionAlgorithm.limitBuyOrders, executionAlgorithm, executionNode)
                    await portfolioOrdersModuleObject.checkOrders(portfolioEngineStage, executionAlgorithm.limitSellOrders, executionAlgorithm, executionNode)
                }
            }

        } catch (err) {
            if (err !== 'Error Already Recorded') {

                const message = 'Execution Unexpected Error'
                let docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Portfolio Bot Error - ' + message,
                    placeholder: {}
                }

                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err)

                portfolioSystem.addError([executionNode.id, message, docs])
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
            type: 'TS LF Portfolio Bot Error - ' + message,
            placeholder: {}
        }

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

