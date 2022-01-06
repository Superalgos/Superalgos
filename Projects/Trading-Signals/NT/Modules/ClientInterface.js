exports.newTradingSignalsModulesClientInterface = function newTradingSignalsModulesClientInterface() {
    /*
    This module process all incoming signals.
    */
    let thisObject = {
        messageReceived: messageReceived,
        initialize: initialize,
        finalize: finalize
    }
    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function messageReceived(message) {
        /*
        At this point we have a new signal that have come directly from the broadcaster.
        We will run some validations on it before forwarding it to other P2P Network Nodes or recipients.
        */
        let signal = JSON.parse(message)

        let response = SA.projects.tradingSignals.utilities.signalValidations.validateSignatures(signal)
        /*
        Broadcast the Signal to all clients connected to this Network Node.
        */
        let messageHeader = {
            payload: JSON.stringify({ signal: JSON.stringify(signal) })
        }
        if (NT.networkApp.webSocketsInterface.broadcastToClients(messageHeader) !== true) {
            response = {
                result: 'Error',
                message: 'Signal Could Not be Broadcasted to Network Clients.'
            }
        }

        if (response === undefined) {
            response = {
                result: 'Ok',
                message: 'Signal Accepted & Broadcasted.'
            }
        }
        return response
    }
}