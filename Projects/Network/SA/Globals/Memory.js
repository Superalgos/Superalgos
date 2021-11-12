exports.newNetworkGlobalsMemory = function () {
    /*
    Here is the Data we are going to keep in memory.
    */
    let thisObject = {
        maps: {
            USER_PROFILES_BY_ID: new Map(),                     // Here we will store the user profiles by User Profile Id.
            USER_PROFILES_BY_HANDLE: new Map(),                 // Here we will store the user profiles by User Profile Handle.
            USER_PROFILES_BY_BLOKCHAIN_ACCOUNT: new Map()        // Here we will store the user profiles by Blockchain Account.
        },
        arrays: {
            P2P_NETWORK_NODES: []                               // Here we will store the p2p nodes deined under Signing Account node types.
        }
    }

    return thisObject
}