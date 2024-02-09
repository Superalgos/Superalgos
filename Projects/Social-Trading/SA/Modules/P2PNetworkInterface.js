exports.newSocialTradingModulesP2PNetworkInterface = function newSocialTradingModulesP2PNetworkInterface() {
    /*
    This module handles the incoming messages from the P2P Network
    that are not responses to requests sent (Notifications).

    This is the case for any kind of events happening at entities followed
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
        eventReceivedCallbackFunction
    ) {
        let messageHeader
        try {
            messageHeader = JSON.parse(message)
        } catch (err) {
            SA.logger.warn('P2P Network Interface -> message Not Correct JSON Format.')
            return
        }

        if (messageHeader.requestType === undefined) {
            SA.logger.warn('P2P Network Interface -> requestType Not Provided.')
            return
        }

        if (messageHeader.requestType !== 'Event') {
            SA.logger.warn('P2P Network Interface -> requestType Not Supported.')
            return
        }

        eventReceived(
            messageHeader.eventMessage,
            messageHeader.signature
        )

        function eventReceived(
            eventMessage,
            signature,

        ) {

            let eventReceived
            try {
                eventReceived = JSON.parse(eventMessage)
            } catch (err) {
                SA.logger.warn('P2P Network Interface -> eventMessage Not Correct JSON Format.')
            }
            /*
            At the Client Interface, events need to be emitted by Social Entities that 
            belongs to the User Profile that is connected at the Network Node.
            */
            let socialEntityId
            let socialEntity
            if (eventReceived.originSocialPersonaId !== undefined) {
                socialEntityId = eventReceived.originSocialPersonaId
                socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(socialEntityId)
            }
            if (eventReceived.originSocialTradingBotId !== undefined) {
                socialEntityId = eventReceived.originSocialTradingBotId
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
            if (eventReceived.eventId === undefined) {
                let response = {
                    result: 'Error',
                    message: 'eventId Not Provided.'
                }
                return response
            }
            /*
            We will not accept events that have already been processed.
            */
            if (SA.projects.socialTrading.globals.memory.maps.EVENTS.get(eventReceived.eventId) !== undefined) {
                /*
                We have already received this same event, so we just ignore it.
                */
                return
            }
            /*
            We are going to validate the Signature of this event.
            */
            let response = SA.projects.socialTrading.utilities.eventSignatureValidations.signatureValidations(eventReceived, signature)
            if (response !== undefined) { return response }
            /*
            Add the timestamp of when this Event was received to the local map of events processed.
            */
            let timestamp = (new Date()).valueOf
            SA.projects.socialTrading.globals.memory.maps.EVENTS.set(eventReceived.eventId, timestamp)
            eventReceivedCallbackFunction(eventReceived)
        }
    }
}