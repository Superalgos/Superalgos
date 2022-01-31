exports.newFoundationsFunctionLibrariesSessionFunctions = function () {

    const MODULE_NAME = "Session Functions"

    let thisObject = {
        sessionHeartBeat: sessionHeartBeat,
        stopSession: stopSession,
        emitSessionStatus: emitSessionStatus,
        finalizeSessions: finalizeSessions,
        sessionError: sessionError,
        sessionWarning: sessionWarning,
        sessionInfo: sessionInfo
    }

    return thisObject

    function sessionHeartBeat(processIndex, processingDate, percentage, status) {
        let event = {
            seconds: (new Date()).getSeconds(),
            processingDate: processingDate,
            percentage: percentage,
            status: status
        }
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Heartbeat', event)

        if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = true
            if (TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT !== undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[IMPORTANT] sessionHeartBeat -> Stopping the Session now. ')
            }
        }
    }

    function stopSession(processIndex, commandOrigin) {
        if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE === undefined) { return }

        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE.sendMessage(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type + " '" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name + "' is stopping " + commandOrigin)
        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE.finalize()
        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = true
        TS.projects.foundations.functionLibraries.sessionFunctions.sessionInfo(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE, commandOrigin, undefined)
    }

    function emitSessionStatus(status, key) {
        switch (status) {
            case 'Running': {
                TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Running')
                break
            }
            case 'Stopped': {
                TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Stopped')
                break
            }
        }
    }

    function finalizeSessions() {
        TS.projects.foundations.globals.taskVariables.SESSION_MAP.forEach(forEachSession)

        function forEachSession(session) {
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(session, 'Stopped')
        }
    }

    function sessionError(processIndex, node, errorMessage, docs) {
        let event
        if (node !== undefined) {
            event = {
                nodeName: node.name,
                nodeType: node.type,
                nodeId: node.id,
                errorMessage: errorMessage,
                docs: docs
            }
        } else {
            event = {
                errorMessage: errorMessage,
                docs: docs
            }
        }
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Error', event)

        if (node !== undefined && node.id !== TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.id) {
            event = {
                warningMessage: "Session could not be ran. Check the Workspace Map for Nodes with errors."
            }

            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Warning', event)
        }

        if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = true
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[IMPORTANT] sessionError -> Stopping the Session now. ')
        }
    }

    function sessionWarning(processIndex, node, warningMessage) {
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
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Warning', event)

        if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = true
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[IMPORTANT] sessionWarning -> Stopping the Session now. ')
        }
    }

    function sessionInfo(processIndex, node, infoMessage) {
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
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Info', event)

        if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = true
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[IMPORTANT] sessionInfo -> Stopping the Session now. ')
        }
    }

}