exports.newNetworkGlobalsMemory = function () {
    /*
    Here is the Data we are going to keep in memory.
    */
    let thisObject = {
        maps: {
            USER_PROFILES_BY_ID: new Map(),                     // Here we will store the user profiles by User Profile Id.
            USER_PROFILES_BY_HANDLE: new Map(),                 // Here we will store the user profiles by User Profile Handle.
            USER_PROFILES_BY_BLOCHAIN_ACCOUNT: new Map()        // Here we will store the user profiles by Blockchain Account.
        },
        arrays: {
        }
    }

    return thisObject
}