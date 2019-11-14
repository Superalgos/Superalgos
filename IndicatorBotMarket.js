exports.newIndicatorBotMarket = function newIndicatorBotMarket(bot, logger, COMMONS, UTILITIES, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "User Bot";

    const BOLLINGER_CHANNELS_FOLDER_NAME = "Bollinger-Channels";
    const BOLLINGER_STANDARD_CHANNELS_FOLDER_NAME = "Bollinger-Standard-Channels";
    const BOLLINGER_SUB_CHANNELS_FOLDER_NAME = "Bollinger-Sub-Channels";
    const BOLLINGER_STANDARD_SUB_CHANNELS_FOLDER_NAME = "Bollinger-Standard-Sub-Channels";

    const commons = COMMONS.newIndicatorBotCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let fileStorage = FILE_STORAGE.newFileStorage(logger);
    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            processConfig = pProcessConfig;
            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(dataFiles, timePeriod, outputPeriodLabel, startDate, endDate, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;
            let products = {}
            let mainDependency

            /* The first phase is about transforming the inputs into a format that can be used to apply the user defined code. */
            let dataDependencies = bot.processNode.referenceParent.processDependencies.dataDependencies 
            for (let i = 0; i < dataDependencies.length; i++) {

                let dataDependencyNode = dataDependencies[i].referenceParent
                let dataFile = dataFiles[i]
                let jsonData        // Datafile converted into Json objects
                let inputData       // Includes calculated properties
                let singularVariableName    // name of the variable for this product
                let recordDefinition 

                /*
                For each dataDependencyNode in our data dependencies, we should have da dataFile containing the records needed as an imput for this process.
                What we need to do first is transform those records into JSON objects that can be used by user-defined formulas.
                The first step does that but with the not calculated properties, the second step adds the calculated properties.
                */

                /* Basic validations to see if we have everything we need. */
                if (dataDependencyNode.parentNode.code.singularVariableName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Single Variable Name defined. Product Definition = " + JSON.stringify(dataDependencyNode.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (dataDependencyNode.parentNode.code.pluralVariableName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Plural Variable Name defined. Product Definition = " + JSON.stringify(dataDependencyNode.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (dataDependencyNode.parentNode.record === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Record Definition. Product Definition = " + JSON.stringify(dataDependencyNode.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                recordDefinition = dataDependencyNode.parentNode.record
                singularVariableName = dataDependencyNode.parentNode.code.singularVariableName
                /* Transform the raw data into JSON objects */
                jsonData = commons.jsonifyDataFile(dataFile, recordDefinition)
                /* Add the calculated properties */
                if (dataDependencyNode.parentNode.calculations !== undefined) {
                    inputData = commons.calculationsProcedure(jsonData, recordDefinition, dataDependencyNode.parentNode.calculations, singularVariableName, timePeriod)
                } else {
                    inputData = jsonData
                }
                products[dataDependencyNode.parentNode.code.pluralVariableName] = inputData

                /* The main dependency is defined as the first dependency processed. */
                if (mainDependency === undefined) {
                    mainDependency = inputData
                }
            }

            /* During the second phase, we need to generate the data of the different products this process produces an output */
            let outputDatasets = bot.processNode.referenceParent.processOutput.outputDatasets
            for (let i = 0; i < outputDatasets.length; i++) {

                let outputDatasetNode = outputDatasets[i]
                let jsonData                // Just build data as Json objects
                let outputData              // Data built as a result of applying user defined code and formulas at the Data Building Procedure
                let singularVariableName    // Name of the variable for this product
                let recordDefinition        // Record as defined by the user at the UI
                let fileContent             // Here we store the contents of the new data built just before writing it to a file.

                /*
                For each outputDatasetNode in our process output, we will build the information based on our input products.
                */

                /* Basic validations to see if we have everything we need. */
                if (outputDatasetNode.referenceParent === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Output Dataset without Reference Parent. Output Dataset = " + JSON.stringify(outputDatasetNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (outputDatasetNode.referenceParent.parentNode.code.singularVariableName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Single Variable Name defined. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (outputDatasetNode.referenceParent.parentNode.code.pluralVariableName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Plural Variable Name defined. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (outputDatasetNode.referenceParent.parentNode.record === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Record Definition. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (outputDatasetNode.referenceParent.parentNode.dataBuilding === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Data Building Procedure. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                recordDefinition = outputDatasetNode.referenceParent.parentNode.record
                singularVariableName = outputDatasetNode.referenceParent.parentNode.code.singularVariableName

                /* Build the data */
                jsonData = commons.dataBuildingProcedure(products, mainDependency, recordDefinition, outputDatasetNode.referenceParent.parentNode.dataBuilding, singularVariableName, timePeriod)

                /* Add the calculated properties */
                if (outputDatasetNode.referenceParent.parentNode.calculations !== undefined) {
                    outputData = commons.calculationsProcedure(jsonData, recordDefinition, outputDatasetNode.referenceParent.parentNode.calculations, singularVariableName, timePeriod)
                } else {
                    outputData = jsonData
                }
                products[outputDatasetNode.referenceParent.parentNode.code.pluralVariableName] = outputData
            }

            /*At the third and last phase, we will save the new information generated into files corresponding to each output outputDatasetNode.*/
            let totalFilesWritten = 0
            for (let i = 0; i < outputDatasets.length; i++) {
                let outputDatasetNode = outputDatasets[i]
                let outputData = products[outputDatasetNode.referenceParent.parentNode.code.pluralVariableName] 
                let contextSummary = {}

                /* Some very basic validations that we have all the information needed. */
                if (outputDatasetNode.referenceParent.code.codeName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Dataset witn no codeName defined. Product Dataset = " + JSON.stringify(outputDatasetNode.referenceParent));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                if (outputDatasetNode.referenceParent.parentNode === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Dataset not attached to a Product Definition. Dataset = " + JSON.stringify(outputDatasetNode.referenceParent));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                if (outputDatasetNode.referenceParent.parentNode.code.codeName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition witn no codeName defined. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                if (outputDatasetNode.referenceParent.parentNode.parentNode === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition not attached to a Bot. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                if (outputDatasetNode.referenceParent.parentNode.parentNode.code.codeName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Bot witn no codeName defined. Bot = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                if (outputDatasetNode.referenceParent.parentNode.parentNode.parentNode === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Bot not attached to a Team. Bot = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                if (outputDatasetNode.referenceParent.parentNode.parentNode.parentNode.code.codeName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Team witn no codeName defined. Team = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode.parentNode.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                /* Simplifying the access to basic info */

                contextSummary.dataset = outputDatasetNode.referenceParent.code.codeName
                contextSummary.product = outputDatasetNode.referenceParent.parentNode.code.codeName
                contextSummary.bot = outputDatasetNode.referenceParent.parentNode.parentNode.code.codeName
                contextSummary.devTeam = outputDatasetNode.referenceParent.parentNode.parentNode.parentNode.code.codeName

                /* This stuff is still hardcoded and unresolved. */
                contextSummary.botVersion = {
                    "major": 1,
                    "minor": 0
                }
                contextSummary.dataSetVersion = "dataSet.V1"

                let fileContent = generateFileContent(outputData, outputDatasetNode.referenceParent.parentNode.record)
                writeFile(contextSummary, fileContent)
            }

            function anotherFileWritten() {
                totalFilesWritten++
                if (totalFilesWritten === processConfig.updatesDatasets.length) {
                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                }
            }

            function generateFileContent(records, recordDefinition) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> generateFileContent -> Entering function."); }

                    let fileContent = "";
                    let recordSeparator = "";

                    for (let i = 0; i < records.length; i++) {
                        let record = records[i];
                        fileContent = fileContent + recordSeparator + '['
                        let propertySeparator = ""
                        for (let j = 0; j < recordDefinition.properties.length; j++) {
                            let property = recordDefinition.properties[j]
                            if (property.code.isCalculated !== true) {
                                fileContent = fileContent + propertySeparator
                                if (property.code.isNumeric !== true) {
                                    fileContent = fileContent + '"'
                                }
                                fileContent = fileContent + record[property.code.codeName]
                                if (property.code.isNumeric !== true) {
                                    fileContent = fileContent + '"'
                                }
                                if (propertySeparator === "") { propertySeparator = ","; }
                            }
                        }
                        fileContent = fileContent + ']'
                        if (recordSeparator === "") { recordSeparator = ","; }
                    }
                    fileContent = "[" + fileContent + "]";
                    return fileContent
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> generateFileContent -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeFile(contextSummary, fileContent) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFile -> Entering function."); }

                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = contextSummary.devTeam + "/" + contextSummary.bot + "." + contextSummary.botVersion.major + "." + contextSummary.botVersion.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + contextSummary.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + contextSummary.product + "/" + contextSummary.dataset + "/" + outputPeriodLabel;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(contextSummary.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            anotherFileWritten();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
