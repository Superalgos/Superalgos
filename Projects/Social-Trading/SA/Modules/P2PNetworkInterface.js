exports.newSocialTradingModulesP2PNetworkInterface = function newSocialTradingModulesP2PNetworkInterface() {
    /*
    This module handles the incoming messages from the P2P Network
    that are not responses to requests sent.

    This is the case for any kind of events happening at entities followed
    by the user running this app, in particular trading signals.
    */
    let thisObject = {
        p2pNetworkInterface: undefined,
        userApp: undefined,
        mantain: mantain,
        getSignals: getSignals,
        eventReceived: eventReceived,
        signalReceived: signalReceived,
        initialize: initialize,
        finalize: finalize
    }

    let signalsByCandleAndSignalDefinitionId = new Map()
    let keysByCandle = new Map()

    return thisObject

    function finalize() {

    }

    function initialize(userApp) {
        /*
        This is where we will process all the events / signals comming from the p2p network.
        */
        thisObject.userApp = userApp
    }

    async function eventReceived(event) {
        userApp.signalReceived()

        // DK.desktopApp.webSocketsInterface.sendToWebApp(JSON.stringify(event))
    }

    async function signalReceived(signalMessage) {
        /*
        We will run some valiadtions to be sure the signal received is legit.
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
            signalMessage.signal.broadcaster.socialTradingBot.signalDefinition.id

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