exports.newTradingSignalsModulesOutgoingTradingSignals = function (processIndex) {

    let thisObject = {
        broadcastSignal: broadcastSignal,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine

    return thisObject

    function initialize() {
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
    }

    function finalize() {
        tradingEngine = undefined
    }

    async function broadcastSignal(node, formulaValue) {
        if (node === undefined) { return }
        if (node.outgoingSignals === undefined) { return }
        if (node.outgoingSignals.outgoingSignalReferences === undefined) { return }
        /*
        A single event might trigger multiple signals. That's fine. 
        */
        for (let i = 0; i < node.outgoingSignals.outgoingSignalReferences.length; i++) {
            /*
            Run some validations
            */
            let signalReference = node.outgoingSignals.outgoingSignalReferences[i]
            if (signalReference.referenceParent === undefined) { return }
            let signalDefinition = signalReference.referenceParent
            let socialTradingBot = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(signalDefinition, 'Social Trading Bot')

            /*
            Here we get the signal context.
            */
            let context
            if (signalReference.signalContextFormula !== undefined) {
                context = eval(signalReference.signalContextFormula.code)
            }
            /*
            This is the signal message we are going to send.
            */
            let tradingSignalMessage = {
                tradingSignal: {
                    uniqueId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    timestamp: (new Date()).valueOf(),
                    source: {
                        tradingSystem: {
                            node: {
                                type: node.type,
                                formula: {
                                    value: formulaValue
                                },
                                context: context,
                                candle: {
                                    begin: tradingEngine.tradingCurrent.tradingEpisode.candle.begin.value, 
                                    end: tradingEngine.tradingCurrent.tradingEpisode.candle.end.value,
                                    open: tradingEngine.tradingCurrent.tradingEpisode.candle.open.value,
                                    close: tradingEngine.tradingCurrent.tradingEpisode.candle.close.value,
                                    min: tradingEngine.tradingCurrent.tradingEpisode.candle.min.value,
                                    max: tradingEngine.tradingCurrent.tradingEpisode.candle.max.value
                                }
                            }
                        }
                    },
                    signalDefinition: {
                        id: signalDefinition.id,
                        type: signalDefinition.type
                    }
                }
            }

            TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.outgoingCandleSignals.broadcastSignal(tradingSignalMessage, socialTradingBot)
        }
    }
}
