exports.newSuperalgosGlobalsLoggerVariables = function () {
    let thisObject = {
        DELETE_QUEUE_SIZE: 10,
        VARIABLES_BY_PROCESS_INDEX_MAP: new Map()
    }

    /*
    VARIABLES_BY_PROCESS_INDEX_MAP
    
    For each processIndex we will keep here the following variables.

    PROCESS_INSTANCE_LOGGER_MODULE_OBJECT          This is the logger module used by the process instance.
    BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT             This is the logger module instantiated at every main loop and used at downstream modules.
    LOGS_TO_DELETE_QUEUE                           This stores the logs that need to be deleted, for auto mantainance.
    
    */
    return thisObject
}