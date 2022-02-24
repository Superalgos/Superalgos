exports.newNetworkGlobalsMemory = function () {
    /*
    Here is the Data we are going to keep in memory.
    */
    let thisObject = {
        maps: {
            USER_PROFILES_BY_BLOKCHAIN_ACCOUNT: new Map(),                          // Here we will store the user profiles by Blockchain Account.
            USER_PROFILES_BY_ID: new Map(),                                         // Here we will store the user profiles by id.
            NODES_IN_PLUGINS_FILES: new Map(),                                      // Here we store all the nodes present at Plugin Files.
            P2P_NETWORKS_BY_ID: new Map(),                                          // Here we will store the p2p networks by id.
            STORAGE_CONTAINERS_BY_ID: new Map(),                                    // Here we will store the user Storage Containers by id.
            PERMISSIONS_GRANTED_BY_USER_PRFILE_ID: new Map()                        // Here we will store the user profiles that have been granted permission to access the currently runniung Permissioned P2P Network.
        },
        arrays: {
            P2P_NETWORK_NODES: []                                                   // Here we will store the p2p nodes deined under Signing Account node types.
        }
    }

    return thisObject
}