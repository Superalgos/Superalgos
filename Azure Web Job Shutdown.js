
exports.newShutdownEvent = function newShutdownEvent(BOT) {

    let bot = BOT;
    const ROOT_DIR = '../';

    const MODULE_NAME = "Azure Web Job Shutdown";


    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    let shutdownEvent = {
        isShuttingDown: isShuttingDown
    };

    return shutdownEvent;


    function isShuttingDown() {

        let filePath = process.env.WEBJOBS_SHUTDOWN_FILE;

        let fs = require('fs');

        if (fs.existsSync(filePath)) {
            return true;
        }
        else
        {
            return false;
        }

    }




}