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
        getNextSignal: getNextSignal,
        eventReceived: eventReceived,
        signalReceived: signalReceived,
        initialize: initialize,
        finalize: finalize
    }

    let signalsBySignalDefinitionId = new Map()

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
        let signals = signalsBySignalDefinitionId.get(signalMessage.signal.broadcaster.socialTradingBot.signalDefinition.id)
        if (signals === undefined) { signals = [] }
        signals.push(signalMessage.signal)
        signalsBySignalDefinitionId.set(signalMessage.signal.broadcaster.socialTradingBot.signalDefinition.id, signalMessage.signal)
    }

    function getNextSignal(signalDefinitionId) {
        /*
        Here we will allow the User App to request the next signal of a certain 
        type, by providing the id of the Signal Definition Node, at the User Profile
        providing the signal. 
        */
        let signals = signalsBySignalDefinitionId.get(signalDefinitionId)
        if (signals === undefined) { return }
        let signal = signals[0]
        if (signal === undefined) { return }
        /* 
        If we do have a signal to return, we will remove it from the array where it was stored
        so that we can not give it again in a next call.
        */ 
        signal.splice(0, 1)
        return signal
    }
}