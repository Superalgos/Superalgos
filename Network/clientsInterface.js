exports.newClientInterface = function newClientInterface() {
    /*
    This module represents the Interface the Network Node have 
    with Network Clients connected to it. There are two things
    Network Clients can do with this Network Node:

    * Send an Event that happened at the Network Client to the Network.
    * Make a Query to the Network Node for info needed at the Network Client. 
    */
    let thisObject = {
        eventReceived: eventReceived,
        queryReceived: queryReceived,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function eventReceived(eventMessage) {
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

        let eventReceived = JSON.parse(eventMessage)
        if (NT.globals.memory.EVENTS.get(eventReceived.eventId) !== undefined) {
            throw ('Event Already Exists.')
        }

        let event = NT.modules.event.newNetworkModulesEvent()
        event.initialize(eventReceived)
        NT.globals.memory.EVENTS.set(eventReceived.eventId, event)
    }

    function queryReceived(queryMessage) {
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

        let queryReceived = JSON.parse(queryMessage)
        let query = NT.modules.queriesQuery.newNetworkModulesQuery()
        query.initialize(queryReceived)
        return query.execute()
    }
}