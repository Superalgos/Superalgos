
let bot = {
    name: "Charly",
    process: "Live-Trades",
    type: "Connectivity",
    version: "1.0.0",
    devTeam: "AA Masters" 
};

const ROOT_DIR = '../';

const MODULE_NAME = "run";

const START_POLONIEX_LIVE_TRADES = true;

const POLONIEX_LIVE_TRADES_MODULE = require('./Poloniex Live Trades');  

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
    if (START_POLONIEX_LIVE_TRADES === true) {

        const newPloniexLiveTrades = POLONIEX_LIVE_TRADES_MODULE.newPloniexLiveTrades(bot);

        newPloniexLiveTrades.initialize(onInitializeReady);

        function onInitializeReady() {

            newPloniexLiveTrades.start();

        }

    }

} catch (err) {
    console.log(err.message);
    logger.write(err.message);
}

