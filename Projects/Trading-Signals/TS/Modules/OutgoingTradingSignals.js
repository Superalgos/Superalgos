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

    function broadcastSignal(node) {
        if (node === undefined) { return }
        if (node.outgoingSignals === undefined) { return }
        if (node.outgoingSignals.signalReference === undefined) { return }
        if (node.outgoingSignals.signalReference.referenceParent === undefined) { return }

        let signalMessage = {
            signalId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            tradingSystemNodeType: node.type,
            socialTradingBotNodeType: node.outgoingSignals.signalReference.referenceParent.id,
            socialTradingBotNodeId: node.outgoingSignals.signalReference.referenceParent.id
        }

        TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkStart.sendMessage(signalMessage)
    }
}
