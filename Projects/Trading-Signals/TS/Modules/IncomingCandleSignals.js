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

    async function signalReceived(signalMessage) {
        /*
        What we have just received are not Trading Signals, but a Signal Meesage
        that represents the File Key needed to locate and open a file with all the
        trading signals stored at the open internet. To get the trading signals
        we will ask them to the Open Storage.
        */
        let fileContent = await TS.projects.foundations.globals.taskConstants.OPEN_STORAGE_CLIENT.loadFile(signalMessage.fileKey)
        if (fileContent === undefined) { return } // Happens when the signal was already loaded / processed.
        let file = JSON.parse(fileContent)
        let candleSignalsToLoad = file.content

        for (let i = 0; i < candleSignalsToLoad.length; i++) {
            let candleSignals = candleSignalsToLoad[i]
            for (let j = 0; j < candleSignals.length; j++) {
                let tradingSignalMessage = candleSignals[j]
                tradingSignalMessageReceived(tradingSignalMessage)
            }
        }

        function tradingSignalMessageReceived(tradingSignalMessage) {
            /*
            Next, we will add the signal to an array of signals received from the same Social Trading Bot / Signal Definition.
            */
            let key =
                tradingSignalMessage.tradingSignal.source.tradingSystem.node.candle.begin + '-' +
                tradingSignalMessage.tradingSignal.source.tradingSystem.node.candle.end + '-' +
                tradingSignalMessage.tradingSignal.signalDefinition.id

            let signals = signalsByCandleAndSignalDefinitionId.get(key)
            if (signals === undefined) { signals = [] }
            signals.push(tradingSignalMessage.tradingSignal)
            signalsByCandleAndSignalDefinitionId.set(key, signals)

            let candleKey =
                tradingSignalMessage.tradingSignal.source.tradingSystem.node.candle.begin + '-' +
                tradingSignalMessage.tradingSignal.source.tradingSystem.node.candle.end

            let keys = keysByCandle.get(candleKey)
            if (keys === undefined) { keys = [] }
            keys.push(key)
            keysByCandle.set(candleKey, keys)
        }
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