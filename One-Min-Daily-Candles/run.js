
let bot = {
    name: "Bruce",
    process: "One-Min-Daily-Candles",
    type: "Indicator",
    version: "1.0.0",
    devTeam: "AA Masters" 
};

const ROOT_DIR = '../';

const MODULE_NAME = "run";

const START_ONE_MIN_DAILY_CANDLES = true;
const START_ONE_MIN_DAILY_CANDLES_AT_ONE_MONTH = false;

const ONE_MIN_DAILY_CANDLES_MODULE = require('./One Min Daily Candles');

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
    if (START_ONE_MIN_DAILY_CANDLES === true) {

        for (let year = 2018; year > 2014; year--) {

            for (let month = 12; month > 0; month--) {

                let timeDelay = Math.random() * 10 * 1000; // We introduce a short delay so as to not overload the machine.

                setTimeout(startProcess, timeDelay);

                function startProcess() {

                    const newPloniexHoleFixing = ONE_MIN_DAILY_CANDLES_MODULE.newPloniexHoleFixing(bot);

                    newPloniexHoleFixing.initialize(year, month, onInitializeReady);

                    function onInitializeReady() {

                        newPloniexHoleFixing.start();

                    }

                }

            }

        }

    }


    if (START_ONE_MIN_DAILY_CANDLES_AT_ONE_MONTH === true) {

        startProcess();

        function startProcess() {

            const newPloniexHoleFixing = ONE_MIN_DAILY_CANDLES_MODULE.newPloniexHoleFixing(bot);

            let month = 2;
            let year = 2015;

            newPloniexHoleFixing.initialize(year, month, onInitializeReady);

            function onInitializeReady() {

                newPloniexHoleFixing.start();

            }
        }
    }


} catch (err) {
    console.log(err.message);
    logger.write(err.message);
}

