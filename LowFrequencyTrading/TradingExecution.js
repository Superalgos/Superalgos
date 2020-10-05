exports.newTradingExecution = function newTradingExecution(bot, logger, tradingEngineModule) {
    /*
    The Trading Execution modules manages the execution nodes and execution algoritms.
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

    const TRADING_ORDERS_MODULE = require('./TradingOrders.js')
    let tradingOrdersModule = TRADING_ORDERS_MODULE.newTradingOrders(bot, logger, tradingEngineModule)

    return thisObject

    function initialize() {
        tradingSystem = bot.simulationState.tradingSystem
        tradingEngine = bot.simulationState.tradingEngine
        sessionParameters = bot.SESSION.parameters

        tradingOrdersModule.initialize()
    }

    function finalize() {
        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined

        tradingOrdersModule.finalize()
        tradingOrdersModule = undefined
    }

    function mantain() {
        tradingOrdersModule.mantain()
    }

    function reset() {
        tradingOrdersModule.reset()
    }

    async function runExecution(
        executionNode,
        tradingEngineStage
    ) {
        try {
            /* Trading Engine Stage Validations */
            if (tradingEngineStage.stageBaseAsset === undefined) { badDefinitionUnhandledException(undefined, 'stageBaseAsset === undefined', tradingEngineStage) }
            if (tradingEngineStage.stageBaseAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'stageBaseAsset.targetSize === undefined', tradingEngineStage) }
            if (tradingEngineStage.stageBaseAsset.sizePlaced === undefined) { badDefinitionUnhandledException(undefined, 'stageBaseAsset.sizePlaced === undefined', tradingEngineStage) }
            if (tradingEngineStage.stageBaseAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'stageBaseAsset.sizeFilled === undefined', tradingEngineStage) }
            if (tradingEngineStage.stageBaseAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'stageBaseAsset.feesPaid === undefined', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset === undefined) { badDefinitionUnhandledException(undefined, 'stageQuotedAsset === undefined', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'stageQuotedAsset.targetSize === undefined', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset.sizePlaced === undefined) { badDefinitionUnhandledException(undefined, 'stageQuotedAsset.sizePlaced === undefined', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset.sizeFilled === undefined) { badDefinitionUnhandledException(undefined, 'stageQuotedAsset.sizeFilled === undefined', tradingEngineStage) }
            if (tradingEngineStage.stageQuotedAsset.feesPaid === undefined) { badDefinitionUnhandledException(undefined, 'stageQuotedAsset.feesPaid === undefined', tradingEngineStage) }

            await checkExecutionAlgorithms(executionNode)

            async function checkExecutionAlgorithms(executionNode) {
                for (let i = 0; i < executionNode.executionAlgorithms.length; i++) {
                    let executionAlgorithm = executionNode.executionAlgorithms[i]
                    await tradingOrdersModule.checkOrders(tradingEngineStage, executionAlgorithm.marketBuyOrders, executionAlgorithm, executionNode)
                    await tradingOrdersModule.checkOrders(tradingEngineStage, executionAlgorithm.marketSellOrders, executionAlgorithm, executionNode)
                    await tradingOrdersModule.checkOrders(tradingEngineStage, executionAlgorithm.limitBuyOrders, executionAlgorithm, executionNode)
                    await tradingOrdersModule.checkOrders(tradingEngineStage, executionAlgorithm.limitSellOrders, executionAlgorithm, executionNode)
                }
            }

        } catch (err) {
            tradingSystem.errors.push([executionNode.id, err.message])
            
            if (typeof err === 'string' || err instanceof String) {
                logger.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err)
            }
            if (err.stack !== undefined) {
                logger.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err.stack)
            }
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

