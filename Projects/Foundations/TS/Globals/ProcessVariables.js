exports.newFoundationsGlobalsProcessVariables = function () {
    /*
    We need to count how many process instances we deployd and how many of them have already finished their job, either
    because they just finished or because there was a request to stop the processes. In this way, once we reach the
    amount of instances started, we can safely destroy the rest of the objects running and let this nodejs process die.
    */
    let thisObject = {
        ENDED_PROCESSES_COUNTER: 0,
        TOTAL_PROCESS_INSTANCES_CREATED: 0,
        VARIABLES_BY_PROCESS_INDEX_MAP: new Map(),
        PM_COMMUNICATION_MODULE: undefined
    }

    /*
    VARIABLES_BY_PROCESS_INDEX_MAP

    At the Task Server, a Task run Processes, potentially many of them, depending on definitions external to the
    Task Server. Each process is independent from each other and have a set of process level variables that help
    the process do its job. You can consider these variables as the process state. All the modules running inside
    a process know the processIndex, and with that index they can get this Map that contains all the needed variables
    of that represent the process state. It was implemented as a Map and not just an object with properties for no
    particular reason.
    
    What it is stored here depends very much on what the process is about and what it needs to do. Following
    is a list of known keys of this map.

    PROCESS_KEY                             This is the key used in events related to the Process
    SESSION_KEY                             This is the key used in events related to the Session
    SESSION_FOLDER_NAME                     This is the folder name for Session related data and logs.
    MAIN_LOOP_COUNTER                       This is the counter of main loops for a bot process.
    SOCIAL_BOTS_MODULE                      This is the module that controls social bots.
    SESSION_STATUS                          This tell us the status of the session at any given time.
    SESSION_BEGIN                           This tell us the date time the session was begun.
    IS_SESSION_STOPPING                     This tell us if a session is in the process of being stopped.
    IS_SESSION_RESUMING                     This tell us if a session is resuming from the state at the previous execution.
    IS_SESSION_FIRST_LOOP                   This tell us if we are at the execution of the first loop of the bot related to this session.
    SIMULATION_STATE                        This is the state of a simulation, as it is loaded from disk.
    PROCESS_DATETIME                        This holds the date currently being processed.
    DAILY_FILES_PROCESS_DATETIME            When processing daily files, this holds the date of the file being processed.
    TRADING_PROCESSING_DAILY_FILES          When in a trading process, this tell us if we are processing Daily Files or not.
    FILE_PATH_ROOT                          Stores the prefix of the path of any data or log file.
    WAIT_FOR_EXECUTION_FINISHED_EVENT       This boolean flag tell us if the process waits for an event to continue.
    UNEXPECTED_ERROR                        When we encounter an error that will produce the Process to be stopped, we store the err object here so that is properties can be extracted for logging purposes.

    */
    return thisObject
}