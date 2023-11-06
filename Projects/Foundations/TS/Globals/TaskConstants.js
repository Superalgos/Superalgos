exports.newFoundationsGlobalsTaskConstants = function () {
    /*
    This values are set only once with the information received from whoever
    is starting the task.
    */
    let thisObject = {
        TASK_NODE: undefined,
        NETWORK_NODE: undefined,
        PROJECT_DEFINITION_NODE: undefined,
        PROJECTS_SCHEMA: undefined,
        EVENT_SERVER_CLIENT_MODULE_OBJECT: undefined,   // This is an instance of the Event Server Client pointing to the localhost server
        P2P_NETWORK: undefined,
        TASK_HEARTBEAT_INTERVAL_HANDLER: undefined,
        MANAGED_TASKS: undefined,
        MANAGED_SESSIONS_REFERENCES: undefined,         // If there are managed sessions we will store them here.
        DEPENDENCY_FILTERS: undefined                   // This is an array of dependency filters object used to load certain data dependencies at runtime.
    }

    return thisObject
}