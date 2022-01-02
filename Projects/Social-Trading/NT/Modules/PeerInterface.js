exports.newSocialTradingModulesPeerInterface = function newSocialTradingModulesPeerInterface() {
    /*
    This module represents the Interface the Network Node have 
    with other Network Nodes connected to it. 
    
    This interface is one layer above the communication protocol interface
    where actual messages are received through, like for instance the
    websockets interface.
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
    
    async function messageReceived(message) {
        let messageHeader
        try {
            messageHeader = JSON.parse(message)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'Peer Interface message Not Correct JSON Format.'
            }
            return response
        }

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
                return await eventReceived(messageHeader.eventMessage)
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

    async function eventReceived(eventMessage) {
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

        if (NT.projects.network.globals.memory.maps.EVENTS.get(eventReceived.eventId) !== undefined) {
            let response = {
                result: 'Warning',
                message: 'Peer Interface Event Already Exists.'
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
                message: 'Peer Interface Event Processed.'
            }
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