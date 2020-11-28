exports.newSuperalgosGlobalsTaskVariables = function () {
    /*
    Since the moment the task is stopped by the UI untiil the time the task can be stopped gracefully,
    we turn on this switch that will signal every internal procedure that it must stop.
    */
    let thisObject = {
        IS_TASK_STOPPING: false
    }

    return thisObject
}