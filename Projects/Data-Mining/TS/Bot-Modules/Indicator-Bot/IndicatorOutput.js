exports.newDataMiningBotModulesIndicatorOutput = function (processIndex) {
    /*
    This module coordinates the actions to be taken to generate an indicator output.
    It is used from both Multi-Time-Frame-Market and Multi-Time-Frame-Daily frameworks.
    */
    const MODULE_NAME = "Indicator Output";

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    }

    return thisObject;

    function finalize() {
        thisObject = undefined
        utilities = undefined
    }

    function initialize(callBackFunction) {
        try {
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(
        dataFiles,
        timeFrame,
        timeFrameLabel,
        currentDay,
        interExecutionMemory,
        callBackFunction
    ) {

        try {

            let products = {}
            let mainDependency = {}
            let processingDailyFiles

            if (currentDay !== undefined) {
                processingDailyFiles = true
            } else {
                processingDailyFiles = false
            }

            /* The first phase here is about checking that we have everything we need at the definition level. */
            let dataDependencies = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies, 'Data Dependency'
            )

            if (TS.projects.foundations.functionLibraries.singleMarketFunctions.validateDataDependencies(processIndex, dataDependencies, callBackFunction) !== true) { return }

            let outputDatasets = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset'
            )
            if (TS.projects.foundations.functionLibraries.singleMarketFunctions.validateOutputDatasets(processIndex, outputDatasets, callBackFunction) !== true) { return }

            /* The second phase is about transforming the inputs into a format that can be used to apply the user defined code. */
            TS.projects.foundations.functionLibraries.singleMarketFunctions.inflateDatafiles(processIndex, dataFiles, dataDependencies, products, mainDependency, timeFrame)

            /* During the third phase, we need to generate the data of the different products this process produces an output */
            for (let i = 0; i < outputDatasets.length; i++) {

                let outputDatasetNode = outputDatasets[i]
                let jsonData                        // Just build data as Json objects
                let outputData                      // Data built as a result of applying user defined code and formulas at the Data Building Procedure
                let singularVariableName            // Name of the variable for this product
                let recordDefinition                // Record as defined by the user at the UI
                let resultsWithIrregularPeriods     // A product will have irregular periods when the User Code inserts new result records at will, in contrast with normal procedure where the platform insert one record per loop execution.

                /*
                For each outputDatasetNode in our process output, we will build the information based on our input products.
                */

                recordDefinition = outputDatasetNode.referenceParent.parentNode.record
                singularVariableName = outputDatasetNode.referenceParent.parentNode.config.singularVariableName

                /* Check Irregular Periods */

                if (outputDatasetNode.referenceParent.parentNode.dataBuilding.loop.procedureJavascriptCode !== undefined) {
                    if (outputDatasetNode.referenceParent.parentNode.dataBuilding.loop.procedureJavascriptCode.code.indexOf('results.push') >= 0) {
                        resultsWithIrregularPeriods = true
                    }
                }

                /* Build the data */
                jsonData = TS.projects.foundations.functionLibraries.singleMarketFunctions.dataBuildingProcedure(processIndex,
                    products,
                    mainDependency,
                    recordDefinition,
                    outputDatasetNode.referenceParent.parentNode.dataBuilding,
                    singularVariableName,
                    outputDatasetNode.referenceParent.parentNode.config.codeName,
                    timeFrame,
                    timeFrameLabel,
                    resultsWithIrregularPeriods,
                    interExecutionMemory,
                    processingDailyFiles,
                    currentDay,
                    outputDatasetNode.referenceParent.parentNode.config.parameters
                )

                /* Add the calculated properties */
                if (outputDatasetNode.referenceParent.parentNode.calculations !== undefined) {
                    outputData = TS.projects.foundations.functionLibraries.singleMarketFunctions.calculationsProcedure(processIndex, jsonData, recordDefinition, outputDatasetNode.referenceParent.parentNode.calculations, singularVariableName, timeFrame)
                } else {
                    outputData = jsonData
                }
                products[outputDatasetNode.referenceParent.parentNode.config.pluralVariableName] = outputData
            }

            /*
            At the fourth and last phase, we will save the new information generated into files 
            corresponding to each output outputDatasetNode.
            */
            let totalFilesWritten = 0
            for (let i = 0; i < outputDatasets.length; i++) {
                let outputDatasetNode = outputDatasets[i]
                let outputData = products[outputDatasetNode.referenceParent.parentNode.config.pluralVariableName]
                let resultsWithIrregularPeriods     // A product will have irregular periods when the User Code inserts new result records at will, in contrast with normal procedure where the platform insert one record per loop execution.
                let contextSummary = {}

                /* Check Irregular Periods */
                if (outputDatasetNode.referenceParent.parentNode.dataBuilding.loop.procedureJavascriptCode.code.indexOf('results.push') >= 0) {
                    resultsWithIrregularPeriods = true
                }

                /* Simplifying the access to basic info */

                contextSummary.dataset = outputDatasetNode.referenceParent.config.codeName
                contextSummary.product = outputDatasetNode.referenceParent.parentNode.config.codeName

                let botNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Indicator Bot')
                contextSummary.bot = botNode.config.codeName
                let dataMineNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Data Mine')
                contextSummary.dataMine = dataMineNode.config.codeName
                contextSummary.mineType = dataMineNode.type.replace(' ', '-')
                contextSummary.project = dataMineNode.project

                let fileContent = TS.projects.foundations.functionLibraries.singleMarketFunctions.generateFileContent(processIndex, outputData, outputDatasetNode.referenceParent.parentNode.record, resultsWithIrregularPeriods, processingDailyFiles, currentDay, callBackFunction)
                TS.projects.foundations.functionLibraries.singleMarketFunctions.writeFile(processIndex, contextSummary, fileContent, anotherFileWritten, processingDailyFiles, timeFrameLabel, currentDay, callBackFunction)
            }


            function anotherFileWritten() {
                totalFilesWritten++
                if (totalFilesWritten === outputDatasets.length) {
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                }
            }
        }
        catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
