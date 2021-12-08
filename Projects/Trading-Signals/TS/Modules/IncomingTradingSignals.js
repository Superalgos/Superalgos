exports.newTradingSignalsModulesIncomingTradingSignals = function (processIndex) {

    let thisObject = {
        checkForSignals: checkForSignals,
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

    async function checkForSignals(node) {
        if (node === undefined) { return }
        if (node.incomingSignals === undefined) { return }
        if (node.incomingSignals.signalReferences === undefined) { return }

        for (let i = 0; i < node.incomingSignals.signalReferences.length; i++) {
            /*
            Run some validations
            */
            let signalReference = node.incomingSignals.signalReferences[i]
            if (signalReference.referenceParent === undefined) { return }
            let signalDefinition = signalReference.referenceParent

            let signal = TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetwork.p2pNetworkInterface.getNextSignal(signalDefinition.id)
            return signal
        }
    }
}
