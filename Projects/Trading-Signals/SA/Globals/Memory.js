exports.newTradingSignalsGlobalsMemory = function () {
    /*
    Here is the Data we are going to keep in memory.
    */
    let thisObject = {
        maps: {
            SIGNALS: new Map()                                   // This is the registry of all signals received that prevents processing them more than once.                        
        }
    }

    return thisObject
}