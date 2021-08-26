exports.newClientInterface = function newClientInterface() {

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
        We expect here a JSON string with the following properties:

        {
            "eventId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "eventType": 10, 
            "emitterUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "emitterPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "timestamp": 124234234234,
            "botId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "botAsset": "BTC",
            "botExchange": "Binance"
        }
        */

        let eventReceived = JSON.parse(eventMessage)
        if (NT.memory.EVENTS.get(eventReceived.eventId) !== undefined) {
            throw ('Event Already Exists.')
        }

        let event = NT.modules.EVENT.newEvent()
        event.initialize(eventReceived)
        NT.memory.EVENTS.set(eventReceived.eventId, event)
    }

    function queryReceived(queryMessage) {
        /*
        We expect here a JSON string with the following properties:

        {
            "equeryId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "queryType": 10, 
            "emitterUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "emitterPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "timestamp": 124234234234,
            "botId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "botAsset": "BTC",
            "botExchange": "Binance"
        }
        */

        let queryReceived = JSON.parse(queryMessage)
        let query = NT.modules.QUERY.newQuery()
        query.initialize(queryReceived)
        return query.execute()
    }
}