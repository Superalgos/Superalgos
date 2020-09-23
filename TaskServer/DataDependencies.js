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
            /* Basic Valdidations */
            if (bot.processNode.referenceParent.processDependencies !== undefined) {
                thisObject.nodeArray = global.NODE_BRANCH_TO_ARRAY(bot.processNode.referenceParent.processDependencies, 'Data Dependency')
                if (thisObject.nodeArray.length === 0) {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have data dependencies at all.");
                    callBackFunction(global.DEFAULT_OK_RESPONSE)
                    return
                }
                /* 
                We will filter ourt declared dependencies that are not present in the workspace.
                This will allow the user to have less Data Mines loaded at the workspace
                that the ones that a Trading Mine depends on.
                */
                thisObject.nodeArray = global.FILTER_OUT_NODES_WITHOUT_REFERENCE_PARENT_FROM_NODE_ARRAY(thisObject.nodeArray)

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
            let alreadyCalledBack = false
            let addCount = 0
            let skipCount = 0

            /* 
            The current nodeArray that we have includes all the dependencies daclared in the Data Mine / Trading Mine
            process dependencies, minus the ones without reference parent, meaning that references Data Mines that are
            not present at the workspace. From all the remaining dependencies there will be others that we need to 
            filter out, and they are the ones which the user does not have a data product anywhere on the network where
            this task is running, that is storing the data associated to this dependency. The way we use to filter this
            out is by analizyng the response of the initialization call to the DataSet module. If it did not fail but
            it was not initialized, then we will assume this happened because the data could not be located and we will
            assume the user did this on purpose and we will filter out this dependency by not putting it on this new array.
            */ 
            let newNodeArray = []

            for (let i = 0; i < thisObject.nodeArray.length; i++) {
                let dataSetModule = DATA_SET.newDataSet(BOT, logger);
                dataSetModule.initialize(thisObject.nodeArray[i], onInitilized);

                function onInitilized(err, wasInitialized) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err = " + JSON.stringify(err));

                        alreadyCalledBack = true;
                        callBackFunction(err);
                        return;
                    }

                    if (wasInitialized === true) {
                        addCount++;
                        newNodeArray.push(thisObject.nodeArray[i])
                        addDataSet()                        
                    } else {
                        skipCount++
                    }
                    checkIfWeAreDone()                
                }

                function addDataSet() {                    
                    thisObject.dataSetsModulesArray.push(dataSetModule);
                }

                function checkIfWeAreDone() {
                    if (addCount + skipCount === thisObject.nodeArray.length) {
                        if (alreadyCalledBack === false) {
                            alreadyCalledBack = true
                            thisObject.nodeArray = newNodeArray
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                    }
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
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
