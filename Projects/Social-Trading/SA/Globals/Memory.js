exports.newSocialTradingGlobalsMemory = function () {
    /*
    Here is the Data we are going to keep in memory.
    */
    let thisObject = {
        maps: {
            EVENTS: new Map(),                                  // This is the registry of all events received that prevents processing them more than once.            
            POSTS: new Map(),
            USER_PROFILES_BY_SOCIAL_ENTITY_ID: new Map(),
            SOCIAL_PERSONAS_BY_ID: new Map(),                    
            SOCIAL_PERSONAS_BY_HANDLE: new Map(),
            SOCIAL_TRADING_BOTS_BY_ID: new Map(),                    
            SOCIAL_TRADING_BOTS_BY_HANDLE: new Map()              
        },
        arrays: {
            EVENTS: [],                                         // This is the registry of all events in order that prevents ordering them more than once.
        }
    }

    return thisObject
}