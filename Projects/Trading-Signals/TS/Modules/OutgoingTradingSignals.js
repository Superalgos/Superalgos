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
    }
}
