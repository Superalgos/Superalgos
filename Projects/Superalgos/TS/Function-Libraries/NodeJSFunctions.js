exports.newSuperalgosFunctionLibrariesNodeJSFunctions = function () {

    let thisObject = {
        exitProcess: exitProcess
    }

    let isNodeJsProcessShuttingDown = false
    return thisObject

    function exitProcess() {

        if (global.unexpectedError !== undefined) {
            TS.projects.superalgos.functionLibraries.taskFunctions.taskError(undefined, "An unexpected error caused the Task to stop. " + global.unexpectedError)
        }

        if (isNodeJsProcessShuttingDown === true) { return }
        isNodeJsProcessShuttingDown = true

        /* Signal that all sessions are stopping. */
        TS.projects.superalgos.functionLibraries.sessionFunctions.finalizeSessions()

        /* Cleaning Before Exiting. */
        clearInterval(global.HEARTBEAT_INTERVAL_HANDLER)

        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE !== undefined) {
            for (let i = 0; i < TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes.length; i++) {
                let config = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[i].config
                let process = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[i]

                let key = process.name + '-' + process.type + '-' + process.id
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Stopped') // Meaning Process Stopped
            }
        }

        finalizeLoggers()

        setTimeout(process.exit, 10000) // We will give 10 seconds to logs be written on file

        function finalizeLoggers() {
            TS.projects.superalgos.globals.taskVariables.LOGGER_MAP.forEach(forEachLogger)

            function forEachLogger() {
                if (TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE !== undefined) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.finalize()
                }
            }
        }
    }
}