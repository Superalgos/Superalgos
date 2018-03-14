exports.newIntervalExecutor = function newIntervalExecutor(BOT) {

    let bot = BOT;
    const ROOT_DIR = './';

    const MODULE_NAME = "Interval Executor";
    const FULL_LOG = true;

    let INTERVAL_MODULE;

    const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    intervalExecutor = {
        initialize: initialize,
        start: start
    };

    const SHUTDOWN_EVENT = require(ROOT_DIR + 'Azure Web Job Shutdown');
    let shutdownEvent = SHUTDOWN_EVENT.newShutdownEvent(bot);

    const UTILITIES = require(ROOT_DIR + 'Utilities');
    let utilities = UTILITIES.newUtilities(bot);

    let year;
    let month;

    let processConfig;

    return intervalExecutor;

    function initialize(pBotPath, pProcessConfig, pYear, pMonth, callBackFunction) {

        try {

            processConfig = pProcessConfig;

            year = pYear;
            month = pMonth;

            let logText;

            if (year !== undefined) {

                month = utilities.pad(month, 2); // Adding a left zero when needed.
                logger.fileName = MODULE_NAME + "-" + year + "-" + month;
                logText = "[INFO] initialize - Entering function 'initialize' " + " @ " + year + "-" + month;

            } else {

                logger.fileName = MODULE_NAME;
                logText = "[INFO] initialize - Entering function 'initialize' ";

            }

            console.log(logText);
            logger.write(logText);
            
            INTERVAL_MODULE = require(pBotPath + "/" + pProcessConfig.name + "/" + 'Interval');

            callBackFunction();

        } catch (err) {

            const logText = "[ERROR] initialize - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);
            logger.write(err.stack);

        }
    }


    function start() {

        try {

            if (year !== undefined) {

                if (FULL_LOG === true) {
                    logger.write("[INFO] Entering function 'start', with year = " + year + " and month = " + month);
                }

            } else {

                if (FULL_LOG === true) {
                    logger.write("[INFO] Entering function 'start'.");
                }

            }

            let intervalId;

            if (processConfig.intervalMaxLoops === 0) {

                intervalId = setInterval(startNewInterval, processConfig.intervalLapse);

            }

            let intervalLoopCounter = 0;

            startNewInterval(); // First, inmadiate run.

            function startNewInterval() {

                try {

                    if (FULL_LOG === true) {

                        if (processConfig.intervalMaxLoops !== 0) {

                            logger.write("[INFO] Entering function 'startNewInterval', next execution inmediately after the current Interval finishes.");

                        } else {

                            logger.write("[INFO] Entering function 'startNewInterval', next execution in " + processConfig.intervalLapse / 1000 / 60 + " minutes.");

                        }

                    }

                    if (shutdownEvent.isShuttingDown() === false) {

                        const UTILITIES = require(ROOT_DIR + 'Utilities');
                        const AZURE_FILE_STORAGE = require(ROOT_DIR + 'Azure File Storage');
                        const MARKETS_MODULE = require(ROOT_DIR + 'Markets');
                        const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
                        const POLONIEX_CLIENT_MODULE = require(ROOT_DIR + 'Poloniex API Client');

                        let fileProcessingInterval = INTERVAL_MODULE.newInterval(bot, UTILITIES, AZURE_FILE_STORAGE, DEBUG_MODULE, MARKETS_MODULE, POLONIEX_CLIENT_MODULE);

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

            function loopControl(moreIntervalExecutionsNeeded, nextIntervalLapse) {

                if (moreIntervalExecutionsNeeded === true) {

                    intervalLoopCounter++;

                    if (intervalLoopCounter === processConfig.intervalMaxLoops) {

                        const logText = "[WARN] 'processConfig.intervalMaxLoops' reached. Stopping execution. ";
                        logger.write(logText);

                    } else {

                        const logText = "[WARN] 'loopControl'. Staring new Interval. ";
                        logger.write(logText);

                        if (nextIntervalLapse === undefined) {

                            setTimeout(startNewInterval, processConfig.intervalLapse);// Looped Execution.

                        } else {

                            setTimeout(startNewInterval, nextIntervalLapse);

                        }
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
