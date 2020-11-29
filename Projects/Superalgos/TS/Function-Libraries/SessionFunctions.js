exports.newSuperalgosFunctionLibrariesSessionFunctions = function () {

    let thisObject = {
        emitSessionStatus: emitSessionStatus,
        finalizeSessions: finalizeSessions,
        sessionError: sessionError,
        sessionWarning: sessionWarning,
        sessionInfo: sessionInfo
    }

    return thisObject

    function emitSessionStatus(status, key) {
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

    function finalizeSessions() {
        TS.projects.superalgos.globals.taskVariables.SESSION_MAP.forEach(forEachSession)

        function forEachSession(session) {
            global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(session, 'Stopped')
        }
    }

    function sessionError(processIndex, node, errorMessage, logger) {
        let event
        if (node !== undefined) {
            event = {
                nodeName: node.name,
                nodeType: node.type,
                nodeId: node.id,
                errorMessage: errorMessage
            }
        } else {
            event = {
                errorMessage: errorMessage
            }
        }
        global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Error', event)

        if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
            bot.STOP_SESSION = true
            logger.write(MODULE_NAME, '[IMPORTANT] sessionError -> Stopping the Session now. ')
        }
    }

    function sessionWarning(processIndex, node, warningMessage, logger) {
        let event
        if (node !== undefined) {
            event = {
                nodeName: node.name,
                nodeType: node.type,
                nodeId: node.id,
                warningMessage: warningMessage
            }
        } else {
            event = {
                warningMessage: warningMessage
            }
        }
        global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Warning', event)

        if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
            bot.STOP_SESSION = true
            logger.write(MODULE_NAME, '[IMPORTANT] sessionWarning -> Stopping the Session now. ')
        }
    }

    function sessionInfo(processIndex, node, infoMessage, logger) {
        let event
        if (node !== undefined) {
            event = {
                nodeName: node.name,
                nodeType: node.type,
                nodeId: node.id,
                infoMessage: infoMessage
            }
        } else {
            event = {
                infoMessage: infoMessage
            }
        }
        global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Info', event)

        if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
            bot.STOP_SESSION = true
            logger.write(MODULE_NAME, '[IMPORTANT] sessionInfo -> Stopping the Session now. ')
        }
    }

}