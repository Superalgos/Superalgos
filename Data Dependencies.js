exports.newDataDependencies = function newDataDependencies(BOT, DEBUG_MODULE, DATA_SET, BLOB_STORAGE, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Data Dependencies";

    let bot = BOT;
    let ownerBot;                       // This is the bot owner of the Data Set. 

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;
    logger.initialize();

    let thisObject = {
        dataSets: new Map(),
        initialize: initialize,
        keys: []
    };


    return thisObject;

    function initialize(pDataDependenciesConfig, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            /*

            For each dependency declared at the bot config, we will initialize a DataSet as part of this initialization process.

            */
            let alreadyCalledBack = false;
            let addCount = 0;

            for (let i = 0; i < pDataDependenciesConfig.length; i++) {

                let dataSetModule = DATA_SET.newDataSet(BOT, DEBUG_MODULE, BLOB_STORAGE, UTILITIES);

                dataSetModule.initialize(pDataDependenciesConfig[i], onInitilized);

                function onInitilized(err) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write("[ERROR] initialize -> onInitilized -> err = " + err.message);

                        alreadyCalledBack = true;
                        callBackFunction(err);
                        return;
                    }

                    addDataSet();
                }

                function addDataSet() {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> addDataSet -> Entering function."); }

                    addCount++;

                    let key;

                    key = pDataDependenciesConfig[i].devTeam + "-" + pDataDependenciesConfig[i].bot + "-" + pDataDependenciesConfig[i].product + "-" + pDataDependenciesConfig[i].dataSet + "-" + pDataDependenciesConfig[i].dataSetVersion;

                    thisObject.keys.push(key);
                    thisObject.dataSets.set(key, dataSetModule);

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> addDataSet -> DataSet added to Map. -> key = " + key); }

                    if (addCount === pDataDependenciesConfig.length) {
                        if (alreadyCalledBack === false) {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                    }
                }
            }

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};