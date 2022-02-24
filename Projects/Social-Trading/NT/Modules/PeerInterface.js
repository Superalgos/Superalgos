exports.newSocialTradingModulesPeerInterface = function newSocialTradingModulesPeerInterface() {
    /*
    This module represents the Interface of this Network Service where 
    we process messages comming from other Network Nodes.
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

    async function messageReceived(
        messageHeader,
        connectedUserProfiles
    ) {

        if (messageHeader.requestType === undefined) {
            let response = {
                result: 'Error',
                message: 'Peer Interface requestType Not Provided.'
            }
            return response
        }

        if (messageHeader.requestType !== 'Event' && messageHeader.requestType !== 'Query') {
            let response = {
                result: 'Error',
                message: 'Peer Interface requestType Not Supported.'
            }
            return response
        }

        switch (messageHeader.requestType) {
            case 'Event': {
                return await eventReceived(
                    messageHeader.eventMessage,
                    messageHeader.signature,
                    connectedUserProfiles
                )
            }
            case 'Query': {
                let response = {
                    result: 'Error',
                    message: 'Peer Interface requestType Query Not Supported.'
                }
                return response
            }
        }
    }

    async function eventReceived(
        eventMessage,
        signature,
        connectedUserProfiles
    ) {
        let eventReceived
        try {
            eventReceived = JSON.parse(eventMessage)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'Peer Interface eventMessage Not Correct JSON Format.'
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
            let response = {
                result: 'Warning',
                message: 'Peer Interface Event Already Exists.'
            }
            return response
        }
        /*
        We are going to validate the Signature of this event.
        */
        let response = SA.projects.socialTrading.utilities.eventSignatureValidations.signatureValidations(eventReceived, signature)
        if (response !== undefined) { return response }
        /*
        At the Peer Interface, events are received from another Network Node. 
        We get the Social Entity in this case, to know who is following it.
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
        Here we will process the event and change the state of the Social Graph.
        */
        try {
            let event = NT.projects.socialTrading.modules.event.newSocialTradingModulesEvent()
            event.initialize(eventReceived)
            event.run()

            SA.projects.socialTrading.globals.memory.maps.EVENTS.set(eventReceived.eventId, event)
            SA.projects.socialTrading.globals.memory.arrays.EVENTS.push(event)

            let response = {
                result: 'Ok',
                message: 'Peer Interface Event Processed.'
            }

            event.finalize()
            response.boradcastTo = NT.projects.socialTrading.utilities.broadcastingFilter.filterFollowersFromUserProfiles(
                connectedUserProfiles,
                socialEntity
            )
            return response

        } catch (err) {
            /*
            Any exception that happens while trying to change the state of the Social Graph,
            will be returned to the caller without doing anything else here.
            */
            if (err.stack !== undefined) {
                console.log('[ERROR] Peer Interface -> err.stack = ' + err.stack)
            }
            let errorMessage = err.message
            if (errorMessage === undefined) { errorMessage = err }
            let response = {
                result: 'Error',
                message: 'Peer Interface ' + errorMessage
            }
            return response
        }
    }
}