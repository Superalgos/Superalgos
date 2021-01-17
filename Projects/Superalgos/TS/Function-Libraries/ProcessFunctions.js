exports.newSuperalgosFunctionLibrariesProcessFunctions = function () {

    let thisObject = {
        processHeartBeat: processHeartBeat, 
        processError: processError,
        processWarning: processWarning,
        processInfo: processInfo
    }

    return thisObject

    function processHeartBeat(processIndex, processingDate, percentage, status) {
        let event = {
            seconds: (new Date()).getSeconds(),
            processingDate: processingDate,
            percentage: percentage,
            status: status
        }
        TS.projects.superalgos.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_KEY, 'Heartbeat', event)
    }

    function processError (processKey, node, errorMessage, docs) {
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
        TS.projects.superalgos.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(processKey, 'Error', event)
    }

    function processWarning (processKey, node, warningMessage, docs) {
        let event
        if (node !== undefined) {
            event = {
                nodeName: node.name,
                nodeType: node.type,
                nodeId: node.id,
                warningMessage: warningMessage,
                docs: docs
            }
        } else {
            event = {
                warningMessage: warningMessage,
                docs: docs
            }
        }
        TS.projects.superalgos.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(processKey, 'Warning', event)
    }

    function processInfo (processKey, node, infoMessage, docs) {
        let event
        if (node !== undefined) {
            event = {
                nodeName: node.name,
                nodeType: node.type,
                nodeId: node.id,
                infoMessage: infoMessage,
                docs: docs
            }
        } else {
            event = {
                infoMessage: infoMessage,
                docs: docs
            }
        }
        TS.projects.superalgos.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(processKey, 'Info', event)
    }
}