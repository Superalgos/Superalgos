exports.newNetworkModulesIncomingSignals = function newNetworkModulesIncomingSignals() {
    /*
    This module process all incoming signals.
    */
    let thisObject = {
        newSignal: newSignal,
        initialize: initialize,
        finalize: finalize
    }
    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function newSignal(signalMessage) {
        /*
        At this point we have a new signal that might have come directly from the broadcaster
        of from other P2P Network Node. In any case, we will run some validations on it before
        forwarding it to other P2P Network Nodes or recipients.
        */

        let response = SA.projects.tradingSignals.utilities.signalValidations.validateSignatures(signalMessage)
        /*
        Broadcast the Signal to all clients connected to this Network Node.
        */
        let messageHeader = {
            payload: JSON.stringify({ signalMessage: JSON.stringify(signalMessage) })
        }
        if (NT.networkNode.webSocketsInterface.broadcastToClients(messageHeader) !== true) {
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