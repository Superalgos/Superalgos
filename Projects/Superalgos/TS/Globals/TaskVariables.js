exports.newSuperalgosGlobalsTaskVariables = function () {
    /*
    Since the moment the task is stopped by the UI untiil the time the task can be stopped gracefully,
    we turn on this switch that will signal every internal procedure that it must stop.
    */
    let thisObject = {
        IS_TASK_STOPPING: false,
        LOGGER_MAP: new Map(),   // We will put all the loggers in a map, so that we can eventually finalize them.
        SESSION_MAP: new Map(),   // We will put all the sessions in a map, so that we can eventually finalize them.
        FATAL_ERROR_MESSAGE: undefined
    }

    return thisObject
}