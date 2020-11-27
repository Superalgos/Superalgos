exports.newSuperalgosFunctionLibrariesSessionFunctions = function () {

    let thisObject = {
        emitSessionStatus: emitSessionStatus,
        finalizeSessions: finalizeSessions
    }

    return thisObject

    function emitSessionStatus (status, key) {
        switch (status) {
            case 'Running': {
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Running')
                break
            }
            case 'Stopped': {
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Stopped')
                break
            }
        }
    }

    function finalizeSessions () {
        global.SESSION_MAP.forEach(forEachSession)

        function forEachSession(session) {
            global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(session, 'Stopped')
        }
    }
}