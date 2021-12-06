exports.newTradingSignalsModulesOutgoingTradingSignals = function (processIndex) {

    let thisObject = {
        broadcastSignal: broadcastSignal,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {
    }

    function finalize() {
    }

    async function broadcastSignal(node) {
        if (node === undefined) { return }
        if (node.outgoingSignals === undefined) { return }
        if (node.outgoingSignals.signalReferences === undefined) { return }

        for (let i = 0; i < node.outgoingSignals.signalReferences.length; i++) {
            let signalReference = node.outgoingSignals.signalReferences[i]
            if (signalReference.referenceParent === undefined) { return }

            let signalMessage = {
                signalId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                tradingSystemNodeType: node.type,
                socialTradingBotNodeType: signalReference.referenceParent.type,
                socialTradingBotNodeId: signalReference.referenceParent.id
            }
    
            await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkStart.sendMessage(signalMessage)
        }
    }
}
