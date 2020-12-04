exports.newSuperalgosGlobalsModuleObjects = function () {
    /*
    Here we store Module Objects at the process level, so that anyone can access their functionality.
    */
    let thisObject = {
        MODULE_OBJECTS_BY_PROCESS_INDEX_MAP: new Map()
    }

    /*
    MODULE_OBJECTS_BY_PROCESS_INDEX_MAP
    
    This is a list of possible Module Objects you might find here.

    TRADING_ENGINE_MODULE_OBJECT                              This is the module that manages the Trading Engine data structure.
    */
    return thisObject
}