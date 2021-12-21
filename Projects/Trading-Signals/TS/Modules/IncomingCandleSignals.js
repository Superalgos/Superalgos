exports.newTradingSignalsModulesIncomingCandleSignals = function (processIndex) {

    let thisObject = {
        mantain: mantain,
        signalReceived: signalReceived,
        getSignals: getSignals,
        initialize: initialize,
        finalize: finalize
    }

    let signalsByCandleAndSignalDefinitionId
    let keysByCandle

    return thisObject

    function initialize() {
        signalsByCandleAndSignalDefinitionId = new Map()
        keysByCandle = new Map()
    }

    function finalize() {
        signalsByCandleAndSignalDefinitionId = undefined
        keysByCandle = undefined
    }

    function signalReceived(signalMessage) {
        /*
        What we have just received are not Trading Signals, but a Signal Meesage
        that represents the File Key needed to locate and open a file with all the
        trading signals stored at the open internet. To get the trading signals
        we will ask them to the Open Storage.
        */
        signalMessage.fileKey



        /*
        We will run some validations to be sure the signal received is legit.
        */
        if (SA.projects.tradingSignals.utilities.signalValidations.validateSignatures(signalMessage) !== undefined) {
            console.log('[WARN] Signal received could not be accepted -> cause = ' + response.message)
            return
        }
        /*
        Next, we will add the signal to an array of signals received from the same Social Trading Bot / Signal Definition.
        */
        let key =
            signalMessage.signal.source.tradingSystem.node.candle.begin + '-' +
            signalMessage.signal.source.tradingSystem.node.candle.end + '-' +
            signalMessage.signal.signalDefinition.id

        let signals = signalsByCandleAndSignalDefinitionId.get(key)
        if (signals === undefined) { signals = [] }
        signals.push(signalMessage.signal)
        signalsByCandleAndSignalDefinitionId.set(key, signals)

        let candleKey =
            signalMessage.signal.source.tradingSystem.node.candle.begin + '-' +
            signalMessage.signal.source.tradingSystem.node.candle.end

        let keys = keysByCandle.get(candleKey)
        if (keys === undefined) { keys = [] }
        keys.push(key)
        keysByCandle.set(candleKey, keys)
    }

    function mantain(candle) {
        let candleKey =
            candle.begin + '-' +
            candle.end

        let keys = keysByCandle.get(candleKey)
        if (keys === undefined) { return }
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i]
            signalsByCandleAndSignalDefinitionId.delete(key)
        }
        keysByCandle.delete(candleKey)
    }

    function getSignals(candle, signalDefinitionId) {
        /*
        Here we will allow the User App to request the signals of a certain 
        type, by providing the id of the Signal Definition Node at the User Profile.
        */
        let key =
            candle.begin + '-' +
            candle.end + '-' +
            signalDefinitionId

        let signals = signalsByCandleAndSignalDefinitionId.get(key)
        return signals
    }
}