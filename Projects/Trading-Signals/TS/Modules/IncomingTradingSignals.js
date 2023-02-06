exports.newTradingSignalsModulesIncomingTradingSignals = function(processIndex) {

    let thisObject = {
        getAllSignals: getAllSignals,
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

    async function getAllSignals(node) {
        if (node === undefined) {
            return
        }
        if (node.incomingSignals === undefined) {
            return
        }
        if (node.incomingSignals.incomingSignalReferences === undefined) {
            return
        }

        let allSignals = []

        for (let i = 0; i < node.incomingSignals.incomingSignalReferences.length; i++) {
            /*
            Run some validations
            */
            let signalReference = node.incomingSignals.incomingSignalReferences[i]
            if (signalReference.referenceParent === undefined) {
                SA.logger.error('There is a node of type ' + signalReference.type + ' and name ' + signalReference.name + ' that either is not referencing any node or the referenced node is not present at the workspace. Signals can not be received at the moment because of this. Please fix this and run this Task again.')
                return []
            }
            let signalDefinition = signalReference.referenceParent

            let candle = {
                begin: tradingEngine.tradingCurrent.tradingEpisode.candle.begin.value,
                end: tradingEngine.tradingCurrent.tradingEpisode.candle.end.value,
                open: tradingEngine.tradingCurrent.tradingEpisode.candle.open.value,
                close: tradingEngine.tradingCurrent.tradingEpisode.candle.close.value,
                min: tradingEngine.tradingCurrent.tradingEpisode.candle.min.value,
                max: tradingEngine.tradingCurrent.tradingEpisode.candle.max.value
            }

            if (TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS === undefined) {
                SA.logger.error('In order to be able to receive signals, your Trading Bot Instance needs to have a Social Trading Bot Reference. Please fix this and run this Task again.')
                return []
            }
            let signals = TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.incomingCandleSignals.getSignals(candle, signalDefinition.id)
            if (signals !== undefined) {
                allSignals = allSignals.concat(signals)
            }
        }
        return allSignals
    }
}