exports.newSuperalgosGlobalsProcessVariables = function () {
    /*
    We need to count how many process instances we deployd and how many of them have already finished their job, either
    because they just finished or because there was a request to stop the proceses. In this way, once we reach the
    amount of instances started, we can safelly destroy the rest of the objects running and let this nodejs process die.
    */
    let thisObject = {
        ENDED_PROCESSES_COUNTER: 0,
        TOTAL_PROCESS_INSTANCES_CREATED: 0,
        VARIABLES_BY_PROCESS_INDEX_MAP: new Map()
    }

    /*
    VARIABLES_BY_PROCESS_INDEX_MAP
    
    What it is stored here depends very much on what the process is about and what it needs to do. Following
    is a list of known properties of this object.

    PROCESS_KEY                 This is the key used in events related to the Process
    SESSION_KEY                 This is the key used in events related to the Session
    SESSION_FOLDER_NAME         This is the folder name for Session related data and logs.
    MAIN_LOOP_COUNTER           This is the counter of main loops for a bot process.
    LOGS_TO_DELETE_QUEUE        This stores the logs that need to be deleted, for auto mantainance.
    SOCIAL_BOTS_MODULE          This is the module that controls social bots.
    SESSION_STATUS              This tell us the status of the session at any given time.
    IS_SESSION_STOPPING         This tell us if a session is in the process of being stopped.
    IS_SESSION_RESUMING         This tell us if a session is resuming from the state at the previous execution.
    IS_SESSION_FIRST_LOOP       This tell us if we are at the execution of the first loop of the bot related to this session.
    SIMULATION_STATE            This is the state of a simulaation, as it is loaded from disk. 
    */
    return thisObject
}