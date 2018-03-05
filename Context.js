exports.newExchangeAPI = function newExchangeAPI(BOT) {

    /* 

    This module allows trading bots to have a context between executions.

    */

    const MODULE_NAME = "Exchange API";

    thisObject = {
        initialize: initialize,
        getOpenPositions: getOpenPositions,
        getExecutedTrades: getExecutedTrades,
        putPosition: putPosition,
        movePosition: movePosition
    };

    let bot = BOT;

    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;

    const POLONIEX_CLIENT_MODULE = require('./Poloniex API Client');
    let poloniexApiClient;

    return thisObject;

    function initialize(callBackFunction) {

        try {

            let apiKey = readApiKey();
            poloniexApiClient = new POLONIEX_CLIENT_MODULE(apiKey.Key, apiKey.Secret);

            function readApiKey() {

                try {
                    return JSON.parse(fs.readFileSync('../' + 'API-Keys' + '/' + EXCHANGE_NAME + '.json', 'utf8'));
                }
                catch (err) {
                    logger.write("[ERROR] initialize -> readApiKey -> err = " + err);
                    callBackFunction("Operation Failed.");
                }
            }

        } catch (err) {

            logger.write("[ERROR] initialize -> err = " + err);
            callBackFunction("Operation Failed.");
        }
    }
}