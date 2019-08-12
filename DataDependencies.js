exports.newDataDependencies = function newDataDependencies(BOT, logger, DATA_SET) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Data Dependencies";

    let thisObject = {
        config: undefined,
        dataSets: new Map(),
        initialize: initialize,
        keys: []
    };


    return thisObject;

    function initialize(pDataDependenciesConfig, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            thisObject.config = pDataDependenciesConfig;

            if (thisObject.config === undefined) {

                // We allow old indicators not to declare their data dependencies.

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }
            /*

            For each dependency declared at the bot config, we will initialize a DataSet as part of this initialization process.

            */
            let alreadyCalledBack = false;
            let addCount = 0;

            for (let i = 0; i < thisObject.config.length; i++) {

                let dataSetModule = DATA_SET.newDataSet(BOT, logger);

                dataSetModule.initialize(thisObject.config[i], onInitilized);

                function onInitilized(err) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err = "+ err.stack);

                        alreadyCalledBack = true;
                        callBackFunction(err);
                        return;
                    }

                    addDataSet();
                }

                function addDataSet() {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> addDataSet -> Entering function."); }

                    addCount++;

                    let key;

                    key = thisObject.config[i].devTeam + "-" + thisObject.config[i].bot + "-" + thisObject.config[i].product + "-" + thisObject.config[i].dataSet + "-" + thisObject.config[i].dataSetVersion;

                    thisObject.keys.push(key);
                    thisObject.dataSets.set(key, dataSetModule);

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> addDataSet -> DataSet added to Map. -> key = " + key); }

                    if (addCount === thisObject.config.length) {
                        if (alreadyCalledBack === false) {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                    }
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
