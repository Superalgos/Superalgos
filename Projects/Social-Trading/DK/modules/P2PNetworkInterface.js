exports.newSocialTradingModulesP2PNetworkInterface = function newSocialTradingModulesP2PNetworkInterface() {
    /*
    This module handles the incoming messages from the P2P Network
    that are not responses to requests sent.

    This is the case for any kind of events happening at entities followed
    by the user running this app, in particular trading events.
    */
    let thisObject = {
        eventReceived: eventReceived,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    async function eventReceived(event) {
        DK.desktopApp.webSocketsInterface.sendToWebApp(JSON.stringify(event))
    }
}