exports.newTradingSignalsModulesIncomingTradingSignals = function (processIndex) {

    let thisObject = {
        getAllSignals: getAllSignals,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let web3
    return thisObject

    function initialize() {
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        web3 = new SA.nodeModules.web3()
    }

    function finalize() {
        tradingEngine = undefined
        web3 = undefined
    }

    async function getAllSignals(node, candle) {
        if (node === undefined) { return }
        if (node.incomingSignals === undefined) { return }
        if (node.incomingSignals.incomingSignalReferences === undefined) { return }

        let allSignals = []

        for (let i = 0; i < node.incomingSignals.incomingSignalReferences.length; i++) {
            /*
            Run some validations
            */
            let signalReference = node.incomingSignals.incomingSignalReferences[i]
            if (signalReference.referenceParent === undefined) { return }
            let signalDefinition = signalReference.referenceParent

            let candle = {
                begin: tradingEngine.tradingCurrent.tradingEpisode.candle.begin.value,
                end: tradingEngine.tradingCurrent.tradingEpisode.candle.end.value,
                open: tradingEngine.tradingCurrent.tradingEpisode.candle.open.value,
                close: tradingEngine.tradingCurrent.tradingEpisode.candle.close.value,
                min: tradingEngine.tradingCurrent.tradingEpisode.candle.min.value,
                max: tradingEngine.tradingCurrent.tradingEpisode.candle.max.value
            }
            let signals = TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetwork.p2pNetworkInterface.getSignals(candle, signalDefinition.id)
            if (signals !== undefined) {
                allSignals = allSignals.concat(signals)
            }
        }

        return allSignals
    }
}
