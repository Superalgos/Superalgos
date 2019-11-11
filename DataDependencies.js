exports.newDataDependencies = function newDataDependencies(BOT, logger, DATA_SET) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Data Dependencies";

    let thisObject = {
        nodeArray: undefined,
        dataSets: new Map(),
        initialize: initialize,
        keys: []
    };


    return thisObject;

    function initialize(pDataDependenciesConfig, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            thisObject.nodeArray = pDataDependenciesConfig;

            if (thisObject.nodeArray === undefined) {

                // We allow old indicators not to declare their data dependencies.

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }
            /*

            For each dependency declared at the bot nodeArray, we will initialize a DataSet as part of this initialization process.

            */
            let alreadyCalledBack = false;
            let addCount = 0;

            for (let i = 0; i < thisObject.nodeArray.length; i++) {

                let dataSetModule = DATA_SET.newDataSet(BOT, logger);

                dataSetModule.initialize(thisObject.nodeArray[i], onInitilized);

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

                    key = thisObject.nodeArray[i].devTeam + "-" + thisObject.nodeArray[i].bot + "-" + thisObject.nodeArray[i].product + "-" + thisObject.nodeArray[i].dataSet + "-" + thisObject.nodeArray[i].dataSetVersion;

                    thisObject.keys.push(key);
                    thisObject.dataSets.set(key, dataSetModule);

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> addDataSet -> DataSet added to Map. -> key = " + key); }

                    if (addCount === thisObject.nodeArray.length) {
                        if (alreadyCalledBack === false) {
                            alreadyCalledBack = true
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
