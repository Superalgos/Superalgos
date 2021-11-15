exports.newNetworkGlobalsMemory = function () {
    /*
    Here is the Data we are going to keep in memory.
    */
    let thisObject = {
        maps: {
            EVENTS: new Map(),                                  // This is the registry of all events received that prevents processing them more than once.
            SIGNALS: new Map()                                  // This is the registry of all signals received that prevents processing them more than once.
        },
        arrays: {
            NETWORK_CLIENTS: [],                                // These are the Network Clients connected to this Network Node ordered by Ranking.
            NETWORK_PEERS: [],                                  // These are the Network Peers connected to this Network Node ordered by Ranking.
            EVENTS: [],                                         // This is the registry of all events in order that prevents ordering them more than once.
            SIGNALS: []                                         // This is the registry of all signals in order that prevents ordering them more than once.
        }
    }

    return thisObject
}