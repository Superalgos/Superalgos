exports.newTradingSignalsModulesP2PNetworkInterface = function newTradingSignalsModulesP2PNetworkInterface() {
    /*
    This module handles the incoming signals from the P2P Network.

    This is the case for any kind of signals happening at entities followed
    by some Social Entity belonging to the User Profile running this app.
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

    function messageReceived(
        message,
        signalReceivedCallbackFunction
    ) {
        let messageHeader
        try {
            messageHeader = JSON.parse(message)
        } catch (err) {
            console.log('[WARN] P2P Network Interface -> message Not Correct JSON Format.')
            return
        }

        if (messageHeader.requestType === undefined) {
            console.log('[WARN] P2P Network Interface -> requestType Not Provided.')
            return
        }

        if (messageHeader.requestType !== 'Signal') {
            console.log('[WARN] P2P Network Interface -> requestType Not Supported.')
            return
        }

        let signalReceived
        try {
            signalReceived = JSON.parse(messageHeader.signalMessage)
        } catch (err) {
            console.log('[WARN] P2P Network Interface -> signalMessage Not Correct JSON Format.')
        }
        /*
        At the Client Interface, events need to be emitted by Social Entities that 
        belongs to the User Profile that is connected at the Network Node.
        */
        let socialEntityId
        let socialEntity
        if (signalReceived.originSocialPersonaId !== undefined) {
            socialEntityId = signalReceived.originSocialPersonaId
            socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(socialEntityId)
        }
        if (signalReceived.originSocialTradingBotId !== undefined) {
            socialEntityId = signalReceived.originSocialTradingBotId
            socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_TRADING_BOTS_BY_ID.get(socialEntityId)
        }
        /*
        We wiil check that the Social Entity exists.
        */
        if (socialEntityId === undefined) {
            let response = {
                result: 'Error',
                message: 'Social Entity Id Undefined.'
            }
            return response
        }
        if (socialEntity === undefined) {
            let response = {
                result: 'Error',
                message: 'Social Entity Undefined.'
            }
            return response
        }
        /*
        Get the User Profile that has those Social Entities.
        */
        let userProfileBySocialEntity = SA.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_SOCIAL_ENTITY_ID.get(socialEntityId)
        if (userProfileBySocialEntity === undefined) {
            let response = {
                result: 'Error',
                message: 'Social Entity sending the Event is unrelated to a User Profile.'
            }
            return response
        }
        /*
        We will not accept events that don't have an eventId.
        */
        if (signalReceived.signalId === undefined) {
            let response = {
                result: 'Error',
                message: 'eventId Not Provided.'
            }
            return response
        }
        /*
        We will not accept events that have already been processed.
        */
        if (SA.projects.tradingSignals.globals.memory.maps.SIGNALS.get(signalReceived.signalId) !== undefined) {
            /*
            We have already received this same signal, so we just ignore it.
            */
            return
        }
        /*
        We are going to validate the Signature of this Signal.
        */
        let response = SA.projects.tradingSignals.utilities.signalSignatureValidations.validateSignatures(messageHeader)
        if (response !== undefined) { return response }
        /*
        Add the timestamp of when this Signal was received to the local map of signals processed.
        */
        let timestamp = (new Date()).valueOf
        SA.projects.tradingSignals.globals.memory.maps.SIGNALS.set(signalReceived.signalId, timestamp)
        signalReceivedCallbackFunction(signalReceived)

    }
}