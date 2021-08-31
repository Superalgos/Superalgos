exports.newNetworkModulesClientInterface = function newNetworkModulesClientInterface() {
    /*
    This module represents the Interface the Network Node have 
    with Network Clients connected to it. There are two things
    Network Clients can do with this Network Node:

    * Send an Event that happened at the Network Client to the Network.
    * Make a Query to the Network Node for info needed at the Network Client. 
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

    async function messageReceived(message, userProfile) {
        let messageHeader
        try {
            messageHeader = JSON.parse(message)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'Client Interface message Not Coorrect JSON Format.'
            }
            return response
        }

        if (messageHeader.messageType === undefined) {
            let response = {
                result: 'Error',
                message: 'Client Interface messageType Not Provided.'
            }
            return response
        }

        if (messageHeader.messageType !== 'Event' && messageHeader.messageType !== 'Query') {
            let response = {
                result: 'Error',
                message: 'Client Interface messageType Not Supported.'
            }
            return response
        }

        switch (messageHeader.messageType) {
            case 'Event': {
                return await eventReceived(messageHeader.eventMessage, userProfile)
            }
            case 'Query': {
                return await queryReceived(messageHeader.queryMessage, userProfile)
            }
        }
    }

    async function eventReceived(eventMessage, userProfile) {
        /*
        We expect here a JSON string with some or all of the following properties:

        {
            "eventId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "eventType": 10, 
            "emitterUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "emitterBotProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetBBotProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "emitterPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
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
                message: 'Client Interface eventMessage Not Coorrect JSON Format.'
            }
            return response
        }
        /*
        At the Client Interface, events need to be emmitted by the same userProfile that is
        connected at the Network Node.
        */
        if (eventReceived.emitterUserProfileId !== userProfile.userProfileId) {
            let response = {
                result: 'Error',
                message: 'Client Interface emitterUserProfileId !== userProfileId Connected to Network Node.'
            }
            return response
        }
        /*
        We will not accept events that have already been processed.
        */

        if (NT.projects.network.globals.memory.maps.EVENTS.get(eventReceived.eventId) !== undefined) {
            let response = {
                result: 'Error',
                message: 'Client Interface Event Already Exists.'
            }
            return response
        }
        /*
        Here we will process the event and change the state of the Social Graph.
        */
        try {
            let event = NT.projects.network.modules.event.newNetworkModulesEvent()
            event.initialize(eventReceived)
            NT.projects.network.globals.memory.maps.EVENTS.set(eventReceived.eventId, event)

            let response = {
                result: 'Ok',
                message: 'Client Interface Event Processed.' 
            }
            return response

        } catch (err) {
            /*
            Any exception that happens while trying to change the state of the Social Graph,
            will be returned to the caller without doing anything else here.
            */
            let response = {
                result: 'Error',
                message: 'Client Interface ' + err.message
            }
            return response
        }
    }

    async function queryReceived(queryMessage) {
        /*
        We expect here a JSON string with some or all of the following properties:

        {
            "equeryId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "queryType": 10, 
            "emitterUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "emitterUserProfileHandle": "Luis-Fernando-Molina",
            "targetUserProfileHandle":  "Luis-Fernando-Molina",
            "emitterBotProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetBBotProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "emitterPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
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
                message: 'Client Interface queryMessage Not Coorrect JSON Format.'
            }
            return response
        }
        /*
        At the Client Interface, queries need to be emmitted by the same userProfile that is
        connected at the Network Node.
        */
        if (queryReceived.emitterUserProfileId !== userProfile.userProfileId) {
            let response = {
                result: 'Error',
                message: 'Client Interface emitterUserProfileId !== userProfileId Connected to Network Node.'
            }
            return response
        }
        /*
        Here we will process the query. This does not change the state of the Social Graph.
        */
        try {
            let query = NT.projects.network.modules.queriesQuery.newNetworkModulesQuery()
            query.initialize(queryReceived)
            return query.execute()
 
        } catch (err) {
            /*
            Any exception that happens while trying to execute the query.
            */
            let response = {
                result: 'Error',
                message: 'Client Interface ' + err.message
            }
            return response
        }
    }
}