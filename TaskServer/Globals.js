exports.newGlobals = function () {

    let thisObject = {
        initialize: initialize
    }

    return thisObject;

    function initialize() {

        /* This is the Execution Datetime */

        global.EXECUTION_DATETIME = new Date();
        global.ROOT_DIR = './';

        global.LOGGER_MAP = new Map()   // We will put all the loggers in a map, so that we can eventually finalize them.
        global.SESSION_MAP = new Map()  // We will put all the sessions in a map, so that we can eventually finalize them.

        global.FINALIZE_LOGGERS = function () {
            global.LOGGER_MAP.forEach(forEachLogger)

            function forEachLogger(logger) {
                if (logger !== undefined) {
                    logger.finalize()
                }
            }
        }

        /*
        We need to count how many process instances we deployd and how many of them have already finished their job, either
        because they just finished or because there was a request to stop the proceses. In this way, once we reach the
        amount of instances started, we can safelly destroy the rest of the objects running and let this nodejs process die.
        */
        global.ENDED_PROCESSES_COUNTER = 0
        global.TOTAL_PROCESS_INSTANCES_CREATED = 0

        global.STOP_TASK_GRACEFULLY = false;


    }
}