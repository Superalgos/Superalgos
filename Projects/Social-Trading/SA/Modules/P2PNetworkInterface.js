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
        eventReceived: eventReceived,
        signalReceived: signalReceived,
        initialize: initialize,
        finalize: finalize
    }

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
        thisObject.userApp.eventReceived()

        // DK.desktopApp.webSocketsInterface.sendToWebApp(JSON.stringify(event))
    }

    async function signalReceived(signal) {
        TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.incomingCandleSignals.signalReceived(signal)
    }
}