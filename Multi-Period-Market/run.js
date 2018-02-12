
let bot = {
    name: "Olivia",
    process: "Multi-Period-Market",
    type: "Indicator",
    version: "1.0.0",
    devTeam: "AA Masters"
};

const ROOT_DIR = '../';

const MODULE_NAME = "run";

const START_ALL_MONTHS = false;
const START_ONE_MONTH = true;

const INTERVAL_EXECUTOR_MODULE = require('./Interval Executor');

const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
const logger = DEBUG_MODULE.newDebugLog();
logger.fileName = MODULE_NAME;
logger.bot = bot;

process.on('uncaughtException', function (err) {
    logger.write('uncaughtException - ' + err.message);
});


process.on('unhandledRejection', (reason, p) => {
    logger.write("Unhandled Rejection at: Promise " + JSON.stringify(p) + " reason: " + reason);
});


process.on('exit', function (code) {
    logger.write('About to exit with code:' + code);
});


try {
    if (START_ALL_MONTHS === true) {

        for (let year = 2018; year > 2014; year--) {

            for (let month = 12; month > 0; month--) {

                let timeDelay = Math.random() * 10 * 1000; // We introduce a short delay so as to not overload the machine.

                setTimeout(startProcess, timeDelay);

                function startProcess() {

                    const newIntervalExecutor = INTERVAL_EXECUTOR_MODULE.newIntervalExecutor(bot);

                    newIntervalExecutor.initialize(year, month, onInitializeReady);

                    function onInitializeReady() {

                        newIntervalExecutor.start();

                    }

                }

            }

        }

    }


    if (START_ONE_MONTH === true) {

        startProcess();

        function startProcess() {

            const newIntervalExecutor = INTERVAL_EXECUTOR_MODULE.newIntervalExecutor(bot);

            let month = 2;
            let year = 2018;

            newIntervalExecutor.initialize(year, month, onInitializeReady);

            function onInitializeReady() {

                newIntervalExecutor.start();

            }
        }
    }


} catch (err) {
    console.log(err.message);
    logger.write(err.message);
}

