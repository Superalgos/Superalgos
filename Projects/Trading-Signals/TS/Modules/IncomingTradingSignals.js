exports.newTradingSignalsModulesIncomingTradingSignals = function (processIndex) {

    let thisObject = {
        getAllSignals: getAllSignals,
        initialize: initialize,
        finalize: finalize
    }

    let web3
    return thisObject

    function initialize() {
        web3 = new SA.nodeModules.web3()
    }

    function finalize() {
        web3 = undefined
    }

    async function getAllSignals(node) {
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

            let signals = TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetwork.p2pNetworkInterface.getSignals(signalDefinition.id)
            if (signals !== undefined) {
                allSignals = allSignals.concat(signals)
            }
        }

        return allSignals
    }
}
