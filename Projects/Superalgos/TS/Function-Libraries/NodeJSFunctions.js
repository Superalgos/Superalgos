exports.newSuperalgosFunctionLibrariesNodeJSFunctions = function () {

    let thisObject = {
        exitProcess: exitProcess
    }

    return thisObject

    function exitProcess() {

        if (global.unexpectedError !== undefined) {
            TS.projects.superalgos.functionLibraries.taskFunctions.taskError(undefined, "An unexpected error caused the Task to stop.")
        }

        if (global.SHUTTING_DOWN_PROCESS === true) { return }
        global.SHUTTING_DOWN_PROCESS = true

        /* Signal that all sessions are stopping. */
        TS.projects.superalgos.functionLibraries.sessionFunctions.finalizeSessions()

        /* Cleaning Before Exiting. */
        clearInterval(global.HEARTBEAT_INTERVAL_HANDLER)

        if (global.TASK_NODE !== undefined) {
            for (let i = 0; i < global.TASK_NODE.bot.processes.length; i++) {
                let config = global.TASK_NODE.bot.processes[i].config
                let process = global.TASK_NODE.bot.processes[i]

                let key = process.name + '-' + process.type + '-' + process.id
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Stopped') // Meaning Process Stopped
            }
        }

        global.FINALIZE_LOGGERS()
        //console.log("[INFO] Task Server -> " + global.TASK_NODE.name + " -> EXIT_NODE_PROCESS -> Task Server will stop in 10 seconds.");

        setTimeout(process.exit, 10000) // We will give 10 seconds to logs be written on file
    }
}