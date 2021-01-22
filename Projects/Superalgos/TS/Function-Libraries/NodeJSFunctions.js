exports.newSuperalgosFunctionLibrariesNodeJSFunctions = function () {

    let thisObject = {
        exitProcess: exitProcess
    }

    let isNodeJsProcessShuttingDown = false
    return thisObject

    function exitProcess() {

        let uiError

        if (TS.projects.superalgos.globals.taskVariables.FATAL_ERROR_MESSAGE !== undefined) {
            uiError = "An unexpected error caused the Task to stop. " + TS.projects.superalgos.globals.taskVariables.FATAL_ERROR_MESSAGE
        } else {
            uiError = "An unexpected error caused the Task to stop."
        }

        let docs = {
            project: 'Superalgos',
            category: 'Topic',
            type: 'TS Task Error - Unexpected Error',
            placeholder: {}
        }

        if (TS.projects.superalgos.globals.taskVariables.UNEXPECTED_ERROR !== undefined) {
            if (TS.projects.superalgos.globals.taskVariables.UNEXPECTED_ERROR.message !== undefined) {
                docs.placeholder.errorMessage = {
                    style: 'Error',
                    text: TS.projects.superalgos.globals.taskVariables.UNEXPECTED_ERROR.message
                }
            }
            if (TS.projects.superalgos.globals.taskVariables.UNEXPECTED_ERROR.stack !== undefined) {
                docs.placeholder.errorStack = {
                    style: 'Javascript',
                    text: TS.projects.superalgos.globals.taskVariables.UNEXPECTED_ERROR.stack
                }
            }
            if (TS.projects.superalgos.globals.taskVariables.UNEXPECTED_ERROR.code !== undefined) {
                docs.placeholder.errorCode = {
                    style: 'Json',
                    text: TS.projects.superalgos.globals.taskVariables.UNEXPECTED_ERROR.code
                }
            }
            docs.placeholder.errorDetails = {
                style: 'Json',
                text: JSON.stringify(TS.projects.superalgos.globals.taskVariables.UNEXPECTED_ERROR, undefined, 4)
            }
        }

        if (TS.projects.superalgos.globals.taskVariables.FATAL_ERROR_MESSAGE || TS.projects.superalgos.globals.taskVariables.UNEXPECTED_ERROR) {
            TS.projects.superalgos.functionLibraries.taskFunctions.taskError(
                undefined,
                uiError,
                docs
            )
        }

        if (isNodeJsProcessShuttingDown === true) { return }
        isNodeJsProcessShuttingDown = true

        /* Signal that all sessions are stopping. */
        TS.projects.superalgos.functionLibraries.sessionFunctions.finalizeSessions()

        /* Cleaning Before Exiting. */
        clearInterval(TS.projects.superalgos.globals.taskConstants.TASK_HEARTBEAT_INTERVAL_HANDLER)

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE !== undefined) {
            for (let i = 0; i < TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes.length; i++) {
                let config = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[i].config
                let process = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[i]

                let key = process.name + '-' + process.type + '-' + process.id
                TS.projects.superalgos.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Stopped') // Meaning Process Stopped
            }
        }

        finalizeLoggers()

        setTimeout(process.exit, 10000) // We will give 10 seconds to logs be written on file

        function finalizeLoggers() {
            TS.projects.superalgos.globals.taskVariables.LOGGER_MAP.forEach(forEachLogger)

            function forEachLogger(logger) {
                if (logger !== undefined) {
                    logger.finalize()
                }
            }
        }
    }
}