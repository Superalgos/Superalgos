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

    async function messageReceived(messageHeader, socketMessage) {

        if (messageHeader.requestType === undefined) {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Provided.'
            }
            return response
        }

        if (messageHeader.requestType !== 'Signal') {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Supported.'
            }
            return response
        }

        /*
        At this point we have a new signal that have come directly from the broadcaster.
        We will run some validations on it before forwarding it to other P2P Network Nodes or recipients.
        */
        let response = SA.projects.tradingSignals.utilities.signalSignatureValidations.validateSignatures(messageHeader)

        switch (messageHeader.requestType) {
            case 'Signal': {
                return await signalReceived()
            }
        }

        async function signalReceived() {
            /*
            Broadcast the Signal to all clients connected to this Network Node.
            */
            if (NT.networkApp.webSocketsInterface.socketInterfaces.broadcastSignalsToClients(socketMessage) !== true) {
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
}