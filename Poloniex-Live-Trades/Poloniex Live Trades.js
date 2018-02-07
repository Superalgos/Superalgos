exports.newPloniexLiveTrades = function newPloniexLiveTrades(BOT) {

    let bot = BOT;
    const ROOT_DIR = '../';

    const INTERVAL_LAPSE = 60 * 1000;

    const MODULE_NAME = "Poloniex Exchange Live Trades";
    const LOG_INFO = true;

    const INTERVAL_MODULE = require('./Interval');

    const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    poloniexLiveTrades = {
        initialize: initialize,
        start: start
    };

    const SHUTDOWN_EVENT = require(ROOT_DIR + 'Azure Web Job Shutdown');
    let shutdownEvent = SHUTDOWN_EVENT.newShutdownEvent(bot);
 
    return poloniexLiveTrades;

    function initialize(callBackFunction) {

        try {

            const logText = "[INFO] initialize - Entering function 'initialize' ";
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

            let intervalId = setInterval(startNewInterval, INTERVAL_LAPSE);   

            startNewInterval(); // First, inmadiate run.



            function startNewInterval() {

                try {

                    if (LOG_INFO === true) {
                        logger.write("[INFO] Entering function 'startNewInterval', next execution in " + INTERVAL_LAPSE / 1000 / 60 + " minutes.");
                    }


                    if (shutdownEvent.isShuttingDown() === false) {

                        let fileProcessingInterval = INTERVAL_MODULE.newInterval(bot);
                            
                        fileProcessingInterval.initialize(onReadyToStart);

                        function onReadyToStart() {

                            fileProcessingInterval.start();

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

        }
            catch (err) {
            const logText = "[ERROR] 'Start' - ERROR : " + err.message;
            logger.write(logText);
        }
    }
};



