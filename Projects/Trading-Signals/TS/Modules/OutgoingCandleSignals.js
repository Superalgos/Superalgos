exports.newTradingSignalsModulesOutgoingCandleSignals = function (processIndex) {

    let thisObject = {
        broadcastSignal: broadcastSignal,
        initialize: initialize,
        finalize: finalize
    }

    let candleSignals
    return thisObject

    function initialize() {
        candleSignals = []
    }

    function finalize() {
        candleSignals = undefined
    }

    function broadcastSignal(signalMessage) {
        /*
        We are going to accumulate all the signals that are not the 
        "candle singal", which menas the signal that represents that 
        a whole candle has been processed.

        Once we receive the "candle Signal", then we send the whole package
        to the Open Storage.
        */
        if (signalMessage.signal.source.tradingSystem.node.type !== 'Trading System') {
            candleSignals.push(signalMessage)
        } else {
            candleSignals.push(signalMessage)
            TS.projects.foundations.globals.taskConstants.OPEN_STORAGE.persit(candleSignals)
            candleSignals = []
        }
    }
}