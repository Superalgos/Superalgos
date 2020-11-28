exports.newGlobals = function () {

    let thisObject = {
        initialize: initialize
    }

    return thisObject;

    function initialize() {
    
        global.LOGGER_MAP = new Map()   // We will put all the loggers in a map, so that we can eventually finalize them.
        global.SESSION_MAP = new Map()  // We will put all the sessions in a map, so that we can eventually finalize them.

    }
}