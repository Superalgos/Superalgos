exports.newIndicatorOutput = function newIndicatorOutput(bot, logger, UTILITIES, FILE_STORAGE) {
    const FULL_LOG = true;
    const MODULE_NAME = "Indicator Bot";

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(logger);
    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    const COMMONS = require('./Commons.js');
    let commons = COMMONS.newCommons(bot, logger, UTILITIES, FILE_STORAGE);

    return thisObject;

    function finalize() {
        thisObject = undefined
        utilities = undefined
        fileStorage = undefined
        commons = undefined
    }

    function initialize(callBackFunction) {
        try {
            logger.fileName = MODULE_NAME;
            logger.initialize();

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(dataFiles, timeFrame, timeFrameLabel, currentDay, interExecutionMemory, callBackFunction) {

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
            let dataDependencies = global.NODE_BRANCH_TO_ARRAY(bot.processNode.referenceParent.processDependencies, 'Data Dependency')

            if (commons.validateDataDependencies(dataDependencies, callBackFunction) !== true) { return }

            let outputDatasets = global.NODE_BRANCH_TO_ARRAY (bot.processNode.referenceParent.processOutput, 'Output Dataset')
            if (commons.validateOutputDatasets(outputDatasets, callBackFunction) !== true) { return }

            /* The second phase is about transforming the inputs into a format that can be used to apply the user defined code. */
            commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, timeFrame)

            /* During the third phase, we need to generate the data of the different products this process produces an output */
            for (let i = 0; i < outputDatasets.length; i++) {

                let outputDatasetNode = outputDatasets[i]
                let jsonData                        // Just build data as Json objects
                let outputData                      // Data built as a result of applying user defined code and formulas at the Data Building Procedure
                let singularVariableName            // Name of the variable for this product
                let recordDefinition                // Record as defined by the user at the UI
                let fileContent                     // Here we store the contents of the new data built just before writing it to a file.
                let resultsWithIrregularPeriods     // A product will have irregular periods when the User Code inserts new result records at will, in contrast with normal procedure where the platform insert one record per loop execution.

                /*
                For each outputDatasetNode in our process output, we will build the information based on our input products.
                */

                recordDefinition = outputDatasetNode.referenceParent.parentNode.record
                singularVariableName = outputDatasetNode.referenceParent.parentNode.config.singularVariableName

                /* Check Irregular Periods */

                if (outputDatasetNode.referenceParent.parentNode.dataBuilding.loop.javascriptCode !== undefined) {
                    if (outputDatasetNode.referenceParent.parentNode.dataBuilding.loop.javascriptCode.code.indexOf('results.push') >= 0) {
                        resultsWithIrregularPeriods = true
                    }
                }

                /* Build the data */
                jsonData = commons.dataBuildingProcedure(
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
                    currentDay
                )

                /* Add the calculated properties */
                if (outputDatasetNode.referenceParent.parentNode.calculations !== undefined) {
                    outputData = commons.calculationsProcedure(jsonData, recordDefinition, outputDatasetNode.referenceParent.parentNode.calculations, singularVariableName, timeFrame)
                } else {
                    outputData = jsonData
                }
                products[outputDatasetNode.referenceParent.parentNode.config.pluralVariableName] = outputData
            }

            /*At the fourth and last phase, we will save the new information generated into files corresponding to each output outputDatasetNode.*/
            let totalFilesWritten = 0
            for (let i = 0; i < outputDatasets.length; i++) {
                let outputDatasetNode = outputDatasets[i]
                let outputData = products[outputDatasetNode.referenceParent.parentNode.config.pluralVariableName]
                let resultsWithIrregularPeriods     // A product will have irregular periods when the User Code inserts new result records at will, in contrast with normal procedure where the platform insert one record per loop execution.
                let contextSummary = {}

                /* Check Irregular Periods */
                if (outputDatasetNode.referenceParent.parentNode.dataBuilding.loop.javascriptCode.code.indexOf('results.push') >= 0) {
                    resultsWithIrregularPeriods = true
                }

                /* Simplifying the access to basic info */

                contextSummary.dataset = outputDatasetNode.referenceParent.config.codeName
                contextSummary.product = outputDatasetNode.referenceParent.parentNode.config.codeName

                let botNode = global.FIND_NODE_IN_NODE_MESH(outputDatasetNode, 'Indicator Bot')
                contextSummary.bot = botNode.config.codeName
                let dataMineNode = global.FIND_NODE_IN_NODE_MESH(outputDatasetNode, 'Data Mine')
                contextSummary.dataMine = dataMineNode.config.codeName
                contextSummary.mineType = dataMineNode.type.replace(' ', '-')
                contextSummary.project = dataMineNode.project

                let fileContent = commons.generateFileContent(outputData, outputDatasetNode.referenceParent.parentNode.record, resultsWithIrregularPeriods, processingDailyFiles, currentDay, callBackFunction)
                commons.writeFile(contextSummary, fileContent, anotherFileWritten, processingDailyFiles, timeFrameLabel, currentDay, callBackFunction)
            }


            function anotherFileWritten() {
                totalFilesWritten++
                if (totalFilesWritten === outputDatasets.length) {
                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
