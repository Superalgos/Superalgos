exports.newSocialTradingModulesClientInterface = function newSocialTradingModulesClientInterface() {
    /*
    This module represents the Interface the Social Graphs Network Service have 
    with Network Clients connected to it. There are 2 things
    Network Clients can do with this Network Service:

    * Make a Query to the Network Node for info needed at the Network Client. 
    * Send an Event that happened at the Network Client to the Network.

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
        userProfile,
        connectedUserProfiles
    ) {

        if (messageHeader.requestType === undefined) {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Provided.'
            }
            return response
        }

        if (messageHeader.requestType !== 'Event' && messageHeader.requestType !== 'Query') {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Supported.'
            }
            return response
        }

        switch (messageHeader.requestType) {
            case 'Query': {
                return await queryReceived(
                    messageHeader.queryMessage,
                    userProfile
                )
            }
            case 'Event': {
                return await eventReceived(
                    messageHeader.eventMessage,
                    messageHeader.signature,
                    userProfile,
                    connectedUserProfiles
                )
            }
        }
    }

    async function queryReceived(
        queryMessage,
        userProfile
    ) {
        /*
        We expect here a JSON string with some or all of the following properties:

        {
            "queryType": 10, 
            "originSocialPersonaId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",        // OPTIONAL - This is the Social Persona executing this query.
            "targetSocialPersonaId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",        // OPTIONAL - This is the Social Persona this query is targeting. For example, if the query is about the statistics of a Social Persona, then that is the Target. 
            "originSocialPersonaHandle": "Luis-Fernando-Molina",                    // OPTIONAL - This is the Handle of the Social Persona executing this query.
            "targetSocialPersonaHandle":  "Luis-Fernando-Molina",                   // OPTIONAL - This is the Handle of the Social Persona we are requesting information about.
            "originSocialTradingBotId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",     // OPTIONAL - This is the Social Trading Bot executing this query.
            "targetSocialTradingBotId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",     // OPTIONAL - This is the Social Trading Bot we are requesting information about.
            "originPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",               // OPTIONAL - We need this when we require information of the Origin Social Entity. For example, if we are requesting the Reactions of a Post done by the Origin Social Persona, we need to receive here the Post Hash.
            "targetPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",               // OPTIONAL - We need this when we require information of the Target Social Entity. For exmaple, when we are requesting the Post Replies of a post of a Social Persona that is not the one executing this query. 
            "timestamp": 124234234234,
            "botAsset": "BTC",
            "botExchange": "Binance",
            "botEnabled": true,
            "initialIndex": 35,
            "amountRequested": 50,
            "direction": "Past"
        }
        */

        let queryReceived
        try {
            queryReceived = JSON.parse(queryMessage)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'Client Interface queryMessage Not Correct JSON Format.'
            }
            return response
        }
        /*
        At the Client Interface, queries need to be emitted by Social Entities that 
        belongs to the User Profile that is connected at the Network Node.
        */
        let socialEntityId
        if (queryReceived.originSocialPersonaId !== undefined) {
            socialEntityId = queryReceived.originSocialPersonaId
        }
        if (queryReceived.originSocialTradingBotId !== undefined) {
            socialEntityId = queryReceived.originSocialTradingBotId
        }
        let userProfileBySocialEntity = SA.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_SOCIAL_ENTITY_ID.get(socialEntityId)
        if (userProfileBySocialEntity === undefined) {
            let response = {
                result: 'Error',
                message: 'Social Entity sending the Query is unrelated to a User Profile.'
            }
            return response
        }
        if (userProfileBySocialEntity.id !== userProfile.id) {
            let response = {
                result: 'Error',
                message: 'Social Entity sending the Query is unrelated to the User Profile Connected to Network Node.'
            }
            return response
        }
        /*
        Here we will process the query. This does not change the state of the Social Graph.
        */
        try {
            let query = NT.projects.socialTrading.modules.query.newSocialTradingModulesQuery()
            query.initialize(queryReceived)

            // console.log((new Date()).toISOString(), '- Client Interface', '- Query Message Received', queryMessage)

            let response = {
                result: 'Ok',
                message: 'Client Interface Query Processed.',
                data: query.run()
            }

            // console.log((new Date()).toISOString(), '- Client Interface', '- Query Response Sent', JSON.stringify(response))
            query.finalize()
            return response

        } catch (err) {
            /*
            Any exception that happens while trying to run the query.
            */
            if (err.stack !== undefined) {
                console.log('[ERROR] Client Interface -> err.stack = ' + err.stack)
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

    async function eventReceived(
        eventMessage,
        signature,
        userProfile,
        connectedUserProfiles
    ) {
        /*
        We expect here a JSON string with some or all of the following properties:

        {
            "eventId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "eventType": 10, 
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

        let eventReceived
        try {
            eventReceived = JSON.parse(eventMessage)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'Client Interface eventMessage Not Correct JSON Format.'
            }
            return response
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
        if (userProfileBySocialEntity.id !== userProfile.id) {
            let response = {
                result: 'Error',
                message: 'Social Entity sending the Event is unrelated to the User Profile Connected to Network Node.'
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
                result: 'Error',
                message: 'Client Interface Event Already Exists.'
            }
            return response
        }
        /*
        We are going to validate the Signature of this event.
        */
        let response = SA.projects.socialTrading.utilities.eventSignatureValidations.signatureValidations(eventReceived, signature)
        if (response !== undefined) { return response }
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
                message: 'Client Interface Event Processed.'
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
                console.log('[ERROR] Client Interface -> err.stack = ' + err.stack)
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