exports.newSocialTradingModulesServiceInterface = function newSocialTradingModulesServiceInterface() {
    /*
    This module represents the Interface the Social Graph Service have 
    with other Network Services running at the same node. Currently it supports:

    * Send a Signal that needs to be distributed.

    */
    let thisObject = {
        messageReceived: messageReceived,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize() {

    }

    async function messageReceived(message, userProfile) {
        let messageHeader
        try {
            messageHeader = JSON.parse(message)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'Client Interface message Not Correct JSON Format.'
            }
            return response
        }

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

        switch (messageHeader.requestType) {
            case 'Signal': {
                return await signalReceived(messageHeader.eventMessage)
            }
        }
    }

    async function signalReceived(signalMessage) {
        /*
        We expect here a JSON string with some or all of the following properties:

        {
            "signalId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "signalType": 10, 
            "originSocialPersonaId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetSocialPersonaId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "originSocialTradingBotId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetSocialTradingBotId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "originPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "timestamp": 124234234234,
            "botAsset": "BTC",
            "botExchange": "Binance",
            "botEnabled": true
        }
        */

        let signalReceived
        try {
            signalReceived = JSON.parse(signalMessage)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'Client Interface signalMessage Not Correct JSON Format.'
            }
            return response
        }
        /*
        We will not accept signals that don't have an signalId.
        */
        if (signalReceived.signalId === undefined) {
            let response = {
                result: 'Error',
                message: 'signalId Not Provided.'
            }
            return response
        }
        /*
        We will not accept signals that have already been processed.
        */

        if (NT.projects.network.globals.memory.maps.SIGNALS.get(signalReceived.signalId) !== undefined) {
            let response = {
                result: 'Error',
                message: 'Client Interface Signal Already Exists.'
            }
            return response
        }
        /*
        Here we will process the signal and change the state of the Social Graph.
        */
        try {
            let signal = NT.projects.socialTrading.modules.signal.newSocialTradingModulesSignal()
            signal.initialize(signalReceived)
            NT.projects.network.globals.memory.maps.SIGNALS.set(signalReceived.eventId, signal)
            NT.projects.network.globals.memory.arrays.SIGNALS.push(signal)

            let response = {
                result: 'Ok',
                message: 'Client Interface Signal Processed.'
            }
            return response

        } catch (err) {
            /*
            Any exception that happens while trying to change the state of the Social Graph,
            will be returned to the caller without doing anything else here.
            */
            if (err.stack !== undefined) {
                SA.logger.error('Client Interface -> err.stack = ' + err.stack)
            }
            let errorMessage = err.message
            if (errorMessage === undefined) { errorMessage = err }
            let response = {
                result: 'Error',
                message: 'Client Interface ' + errorMessage
            }
            return response
        }
    }
}