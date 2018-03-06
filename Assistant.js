exports.newAssistant = function newAssistant(BOT, DEBUG_MODULE) {

    /* 

    This module allows trading bots to execute actions on the exchange, and also on its current recorded state.

    */

    const MODULE_NAME = "Assistant";

    thisObject = {
        initialize: initialize
    };

    let bot = BOT;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;


    return thisObject;

    function initialize(callBackFunction) {

        try {



        } catch (err) {

            logger.write("[ERROR] initialize -> err = " + err);
            callBackFunction("Operation Failed.");
        }
    }

    function getCandles(callBack) {

        try {



        } catch (err) {
            logger.write("[ERROR] getCandles -> err = " + err);
            callBack("Operation Failed.");
        }
    }

};