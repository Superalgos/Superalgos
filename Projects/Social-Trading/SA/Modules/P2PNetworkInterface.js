exports.newSocialTradingModulesP2PNetworkInterface = function newSocialTradingModulesP2PNetworkInterface() {
    /*
    This module handles the incoming messages from the P2P Network
    that are not responses to requests sent.

    This is the case for any kind of events happening at entities followed
    by the user running this app, in particular trading signals.
    */
    let thisObject = {
        p2pNetworkInterface: undefined,
        eventReceived: eventReceived,
        signalReceived: signalReceived,
        userApp: userApp,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        /*
        This is where we will process all the events / signals comming from the p2p network.
        */
        thisObject.p2pNetworkInterface = SA.projects.socialTrading.modules.p2pNetworkInterface.newSocialTradingModulesP2PNetworkInterface()

    }

    async function eventReceived(event) {
        DK.desktopApp.webSocketsInterface.sendToWebApp(JSON.stringify(event))
    }

    async function signalReceived(signalMessage) {
        /*
        We will run some valiadtions to be sure the signal received is legit.
        */
        let response = SA.projects.tradingSignals.utilities.signalValidations.validateSignatures(signalMessage)

        if (response === undefined) {
            response = {
                result: 'Ok',
                message: 'Signal Accepted.'
            }

            userApp.signalReceived()
        } else {
            console.log('[WARN] Signal received could not be accepted -> cause = ' + response.message)
        }            
    }
}