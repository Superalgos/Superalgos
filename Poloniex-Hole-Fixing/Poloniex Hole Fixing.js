exports.newPloniexHoleFixing = function newPloniexHoleFixing(BOT) {

    let bot = BOT;
    const ROOT_DIR = '../';

    const INTERVAL_LAPSE = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "Poloniex Exchange Hole Fixing";
    const LOG_INFO = true;

    const INTERVAL_MODULE = require('./Interval');

    const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    const INTERVAL_MAX_LOOPS = -1; // -1 for infinite loop.

    poloniexHoleFixing = {
        initialize: initialize,
        start: start
    };

    const SHUTDOWN_EVENT = require(ROOT_DIR + 'Azure Web Job Shutdown');
    let shutdownEvent = SHUTDOWN_EVENT.newShutdownEvent(bot);

    const UTILITIES = require(ROOT_DIR + 'Utilities');
    let utilities = UTILITIES.newUtilities(bot);

    let year;
    let month;

    return poloniexHoleFixing;

    function initialize(yearAssigend, monthAssigned, callBackFunction) {

        try {

            year = yearAssigend;
            month = monthAssigned;

            month = utilities.pad(month, 2); // Adding a left zero when needed.

            logger.fileName = MODULE_NAME + "-" + year + "-" + month;

            const logText = "[INFO] initialize - Entering function 'initialize' " + " @ " + year + "-" + month;
            console.log(logText);
            logger.write(logText);

            callBackFunction();

        } catch (err) {

            const logText = "[ERROR] initialize - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);

        }
    }


    function start() {

        try {

            if (LOG_INFO === true) {
                logger.write("[INFO] Entering function 'start', with year = " + year + " and month = " + month);
            }

            let intervalId;

            if (INTERVAL_MAX_LOOPS === 0) {

                intervalId = setInterval(startNewInterval, INTERVAL_LAPSE);

            }

            let intervalLoopCounter = 0;

            startNewInterval(); // First, inmadiate run.

            function startNewInterval() {

                try {

                    if (LOG_INFO === true) {

                        if (INTERVAL_MAX_LOOPS !== 0) {

                            logger.write("[INFO] Entering function 'startNewInterval', next execution inmediately after the current Interval finishes.");

                        } else {

                            logger.write("[INFO] Entering function 'startNewInterval', next execution in " + INTERVAL_LAPSE / 1000 / 60 + " minutes.");

                        }

                    }


                    if (shutdownEvent.isShuttingDown() === false) {

                        let fileProcessingInterval = INTERVAL_MODULE.newInterval(bot);

                        fileProcessingInterval.initialize(year, month, onReadyToStart);

                        function onReadyToStart() {

                            fileProcessingInterval.start(loopControl);

                        }

                    }
                    else {

                        clearInterval(intervalId);

                        const logText = "[INFO] requestNewData - Terminating Set Interval - About to exit gracefully the process. ";
                        console.log(logText);
                        logger.write(logText);

                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'startNewInterval' - ERROR : " + err.message;
                    logger.write(logText);
                }
            }

            function loopControl(moreIntervalExecutionsNeeded) {

                if (moreIntervalExecutionsNeeded === true) {

                    intervalLoopCounter++;

                    if (intervalLoopCounter === INTERVAL_MAX_LOOPS) {

                        const logText = "[WARN] 'INTERVAL_MAX_LOOPS' reached. Stopping execution. ";
                        logger.write(logText);

                    } else {

                        const logText = "[WARN] 'loopControl'. Staring new Interval. ";
                        logger.write(logText);

                        startNewInterval(); // Looped Execution.

                    }

                } else {

                    logger.write("[WARN] Received the signal from last Interval execution to not call it anymore. Stopping execution. ");

                }

            }

        }
        catch (err) {
            const logText = "[ERROR] 'Start' - ERROR : " + err.message;
            logger.write(logText);
        }
    }
};



