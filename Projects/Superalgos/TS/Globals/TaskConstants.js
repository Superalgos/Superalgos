exports.newSuperalgosGlobalsTaskConstants = function () {
    /*
    This values are set only once with the information received from whoever
    is starting the task.
    */
    let thisObject = {
        TASK_NODE: undefined,
        NETWORK_NODE: undefined,
        PROJECT_DEFINITION_NODE: undefined,
        PROJECTS_SCHEMA: undefined,
        APP_SCHEMA_MAP: undefined
    }

    return thisObject
}