
let bot = {
    name: "Bruce",
    process: "One-Min-Daily-Candles",
    type: "Indicator",
    version: "1.0.0",
    devTeam: "AA Masters" 
};

const ROOT_DIR = '../';

const MODULE_NAME = "run";

const START_POLONIEX_HOLE_FIXING = true;
const START_POLONIEX_HOLE_FIXING_AT_ONE_MONTH = false;

const POLONIEX_HOLE_FIXING_MODULE = require('./Poloniex Hole Fixing');

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
    if (START_POLONIEX_HOLE_FIXING === true) {

        for (let year = 2018; year > 2014; year--) {

            for (let month = 12; month > 0; month--) {

                let timeDelay = Math.random() * 100 * 1000; // We need a delay so as not to get banned from the exchange for requesting to many things at the same time.

                setTimeout(startProcess, timeDelay);

                function startProcess() {

                    const newPloniexHoleFixing = POLONIEX_HOLE_FIXING_MODULE.newPloniexHoleFixing(bot);

                    newPloniexHoleFixing.initialize(year, month, onInitializeReady);

                    function onInitializeReady() {

                        newPloniexHoleFixing.start();

                    }

                }

            }

        }

    }


    if (START_POLONIEX_HOLE_FIXING_AT_ONE_MONTH === true) {

        startProcess();

        function startProcess() {

            const newPloniexHoleFixing = POLONIEX_HOLE_FIXING_MODULE.newPloniexHoleFixing(bot);

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

