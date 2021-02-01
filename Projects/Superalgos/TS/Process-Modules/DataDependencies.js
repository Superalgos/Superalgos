exports.newSuperalgosProcessModulesDataDependencies = function (processIndex) {
    /*
    This module mantains a curated array of Data Dependency nodes, 
    which is not exactly the ones listed at the Process Dependencies,
    but a smaller subset based on the circunstances found at the user's
    workspace. For example:
    
    1. Dependencies without a Reference Parent are filtered out.
    2. Dependencies which don't have a Data Set are filtered out. 

    It also mantains an array of Data Set Modules, which are the
    one's that ultimately know how to load a file based on the 
    network configuration found at the workspace at the moment this
    Task was launched.

    Finally it mantains a Filter map, that allows the users of this module
    to filter out data dependencies based on the code written by users
    at the Javascript Code and Formula nodes.
    */
    const MODULE_NAME = "Data Dependencies";

    let thisObject = {
        curatedNodeArray: undefined,
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
            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies !== undefined) {
                /* 
                First we will get all the data dependencies of the bot, as defined at the Trading Mine.
                */
                thisObject.curatedNodeArray = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies, 'Data Dependency')
                if (thisObject.curatedNodeArray.length === 0) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have data dependencies at all.");
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                    return
                }
                /* 
                We will filter out declared dependencies that are not present in the workspace.
                This will allow the user to have less Data Mines loaded at the workspace
                that the ones that a Trading Mine depends on.
                */
                thisObject.curatedNodeArray = TS.projects.superalgos.utilities.nodeFunctions.filterOutNodeWihtoutReferenceParentFromNodeArray(thisObject.curatedNodeArray)

            } else {
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible not to have process dependencies, which means not data dependencies.");
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                return
            }

            if (thisObject.curatedNodeArray.length === 0) {

                // We allow old indicators not to declare their data dependencies.

                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                return;
            }

            /* Session based dependency filters */
            if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).DEPENDENCY_FILTER !== undefined) {
                for (let i = 0; i < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).DEPENDENCY_FILTER.length; i++) {
                    let key = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).DEPENDENCY_FILTER[i]
                    filter.set(key, true)
                }
            }

            /*
            For each dependency declared at the curatedNodeArray, we will initialize a DataSet as part of this initialization process.
            */
            let alreadyCalledBack = false
            let addCount = 0
            let skipCount = 0

            /* 
            The current curatedNodeArray that we have includes all the dependencies daclared in the Data Mine | Trading Mine | Learning Mine
            process dependencies, minus the ones without reference parent, meaning that references Data Mines that are
            not present at the workspace. From all the remaining dependencies there will be others that we need to 
            filter out, and they are the ones which the user does not have a data product anywhere on the network where
            this task is running, that is storing the data associated to this dependency. The way we use to filter this
            out is by analizyng the response of the initialization call to the DataSet module. If it did not fail but
            it was not initialized, then we will assume this happened because the data could not be located and we will
            assume the user did this on purpose and we will filter out this dependency by not putting it on this new array.
            */
            let newNodeArray = []

            for (let i = 0; i < thisObject.curatedNodeArray.length; i++) {
                let dataSetModule = TS.projects.superalgos.processModules.dataset.newSuperalgosProcessModulesDataset(processIndex);
                dataSetModule.initialize(thisObject.curatedNodeArray[i], onInitilized);

                function onInitilized(err, wasInitialized) {

                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err = " + JSON.stringify(err));

                        alreadyCalledBack = true;
                        callBackFunction(err);
                        return;
                    }

                    if (wasInitialized === true) {
                        addCount++;
                        newNodeArray.push(thisObject.curatedNodeArray[i])
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
                    if (addCount + skipCount === thisObject.curatedNodeArray.length) {
                        if (alreadyCalledBack === false) {
                            alreadyCalledBack = true
                            thisObject.curatedNodeArray = newNodeArray
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                            return;
                        }
                    }
                }
            }

        } catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
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
