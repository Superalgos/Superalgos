
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

const POLONIEX_ORDE_BOOKS_MODULE = require('./One Min Daily Candles');

const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
const logger = DEBUG_MODULE.newDebugLog();
logger.fileName = MODULE_NAME;
logger.bot = bot;

process.on('uncaughtException', function (err) {
    logger.write('uncaughtException' + err.message);
});


process.on('unhandledRejection', (reason, p) => {
    logger.write("Unhandled Rejection at: Promise " + JSON.stringify(p) + " reason: " + reason);
});


process.on('exit', function (code) {
    logger.write('About to exit with code:' + code);
});



try {
    if (START_ONE_MIN_DAILY_CANDLES === true) {

        const poloniexOrderBooks = POLONIEX_ORDE_BOOKS_MODULE.newPloniexOrderBooks(bot);

        poloniexOrderBooks.initialize(onInitializeReady);

        function onInitializeReady() {

            poloniexOrderBooks.start();

        }

    }

} catch (err) {
    console.log(err.message);
    logger.write(err.message);
}




