exports.newSuperalgosGlobalsProcessConstants = function () {

    let thisObject = {
        CONSTANTS_BY_PROCESS_INDEX_MAP: new Map()
    }

    /*
    CONSTANTS_BY_PROCESS_INDEX_MAP
    
    What it is stored here depends very much on what the process is about and what it needs to do. Following
    is a list of known properties of this object.

    TRADING_SYSTEM_NODE             This is a Trading System node structure.
    TRADING_ENGINE_NODE             This is a Trading Engine node structure. 
    SESSION_NODE                    This is a Trading Session node structure.
    DEPENDENCY_FILTER               This is the counter of main loops for a bot process.
    */
    return thisObject
}