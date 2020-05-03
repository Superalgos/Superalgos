exports.newDataDependencies = function newDataDependencies(BOT, logger, DATA_SET) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const MODULE_NAME = "Data Dependencies";

    let bot = BOT 

    let thisObject = {
        nodeArray: undefined,
        dataSetsModulesArray: [],
        isItADepenency: isItADepenency, 
        initialize: initialize,
        finalize: finalize
    };

    let filter = new Map()

    return thisObject;

    function initialize(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            /* Basic Valdidations */
            if (bot.processNode.referenceParent.processDependencies !== undefined) {
                if (bot.processNode.referenceParent.processDependencies.dataDependencies !== undefined) {
                    thisObject.nodeArray = bot.processNode.referenceParent.processDependencies.dataDependencies
                } else {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have data dependencies at all.");
                    callBackFunction(global.DEFAULT_OK_RESPONSE)
                    return
                }
            } else {
                logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have process dependencies, which means not data dependencies.");
                callBackFunction(global.DEFAULT_OK_RESPONSE)
                return
            }

            if (thisObject.nodeArray.length === 0) {

                // We allow old indicators not to declare their data dependencies.

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }

            /* Session based dependency filters */
            if (bot.DEPENDENCY_FILTER !== undefined) {
                for (let i = 0; i < bot.DEPENDENCY_FILTER.length; i++) {
                    let key = bot.DEPENDENCY_FILTER[i]
                        filter.set(key, true)
                }
            }

            /*
            For each dependency declared at the nodeArray, we will initialize a DataSet as part of this initialization process.
            */
            let alreadyCalledBack = false;
            let addCount = 0;

            for (let i = 0; i < thisObject.nodeArray.length; i++) {

                let dataSetModule = DATA_SET.newDataSet(BOT, logger);

                dataSetModule.initialize(thisObject.nodeArray[i], onInitilized);

                function onInitilized(err) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err = "+ JSON.stringify(err));

                        alreadyCalledBack = true;
                        callBackFunction(err);
                        return;
                    }

                    addDataSet();
                }

                function addDataSet() {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> addDataSet -> Entering function."); }

                    addCount++;

                    thisObject.dataSetsModulesArray.push(dataSetModule);

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

    function finalize() {
        for (let i = 0; i < thisObject.dataSetsModulesArray.length; i++) {
            let dataSetModule = thisObject.dataSetsModulesArray[i] 
            dataSetModule.finalize()
        }
        thisObject.dataSetsModulesArray = undefined
        filter = undefined
        bot = undefined
    }

    function isItADepenency(timeFrame, product) {
        let key = timeFrame + '-' + product 

        return filter.get(key)
    }
};
