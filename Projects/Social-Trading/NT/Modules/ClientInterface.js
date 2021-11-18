exports.newSocialTradingModulesClientInterface = function newSocialTradingModulesClientInterface() {
    /*
    This module represents the Interface the Network Node have 
    with Network Clients connected to it. There are 3 things
    Network Clients can do with this Network Node:

    * Make a Query to the Network Node for info needed at the Network Client. 
    * Send an Event that happened at the Network Client to the Network.
    * Send a Signal that needs to be distributed.
    
    This interface is one layer above the communication protocol interface
    where actual messages are received through, like for instance the
    websockets interface or http interface.
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

        if (messageHeader.requestType !== 'Event' && messageHeader.requestType !== 'Query' && messageHeader.requestType !== 'Signal') {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Supported.'
            }
            return response
        }

        switch (messageHeader.requestType) {
            case 'Query': {
                return await queryReceived(messageHeader.queryMessage, userProfile)
            }            
            case 'Event': {
                return await eventReceived(messageHeader.eventMessage, userProfile)
            }
            case 'Signal': {
                return await signalReceived(messageHeader.eventMessage)
            }
        }
    }

    async function queryReceived(queryMessage, userProfile) {
        /*
        We expect here a JSON string with some or all of the following properties:

        {
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
                message: 'Client Interface queryMessage Not Correct JSON Format.'
            }
            return response
        }
        /*
        At the Client Interface, queries need to be emitted by the same userProfile that is
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
            let query = NT.projects.socialTrading.modules.query.newSocialTradingModulesQuery()
            query.initialize(queryReceived)

            // console.log((new Date()).toISOString(), '- Client Interface', '- Query Message Received', queryMessage)

            let response = {
                result: 'Ok',
                message: 'Client Interface Query Processed.',
                data: query.execute()
            }

            // console.log((new Date()).toISOString(), '- Client Interface', '- Query Response Sent', JSON.stringify(response))

            return response

        } catch (err) {
            /*
            Any exception that happens while trying to execute the query.
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
                message: 'Client Interface eventMessage Not Correct JSON Format.'
            }
            return response
        }
        /*
        At the Client Interface, events need to be emitted by the same userProfile that is
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
            let event = NT.projects.socialTrading.modules.event.newSocialTradingModulesEvent()
            event.initialize(eventReceived)
            NT.projects.network.globals.memory.maps.EVENTS.set(eventReceived.eventId, event)
            NT.projects.network.globals.memory.arrays.EVENTS.push(event)

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

    async function signalReceived(signalMessage) {
        /*
        We expect here a JSON string with some or all of the following properties:

        {
            "signalId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "signalType": 10, 
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