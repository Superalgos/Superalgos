exports.newSocialTradingGlobalsMemory = function () {
    /*
    Here is the Data we are going to keep in memory.
    */
    let thisObject = {
        maps: {
            USER_PROFILES_BY_ID: new Map(),                     // Here we will store the user profiles by User Profile Id.
            USER_PROFILES_BY_HANDLE: new Map(),                 // Here we will store the user profiles by User Profile Handle.
            USER_PROFILES_BY_BLOCHAIN_ACCOUNT: new Map(),       // Here we will store the user profiles by Blockchain Account.
            EVENTS: new Map()                                   // This is the registry of all events received that prevents processing them more than once.
        },
        arrays: {
            NETWORK_CLIENTS: [],                                // These are the Network Clients connected to this Network Node ordered by Ranking.
            NETWORK_PEERS: [],                                  // These are the Network Peers connected to this Network Node ordered by Ranking.
            EVENTS: []                                          // This is the registry of all events in order that prevents ordering them more than once.
        }
    }

    return thisObject
}