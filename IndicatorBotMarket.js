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

            let dataDependencies = bot.processNode.referenceParent.processDependencies.dataDependencies 
            for (let i = 0; i < dataDependencies.length; i++) {

                let dataset = dataDependencies[i].referenceParent
                let dataFile = dataFiles[i]
                let jsonData        // Datafile converted into Json objects
                let inputData       // Includes calculated properties
                let singularVariableName    // name of the variable for this product
                let recordDefinition 

                /*
                For each dataset in our data dependencies, we should have da dataFile containing the records needed as an imput for this process.
                What we need to do first is transform those records into JSON objects that can be used by user-defined formulas.
                The first step does that but with the not calculated properties, the second step adds the calculated properties.
                */

                /* Basic validations to see if we have everything we need. */
                if (dataset.parentNode.code.singularVariableName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Single Variable Name defined. Product Definition = " + JSON.stringify(dataset.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (dataset.parentNode.code.pluralVariableName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Plural Variable Name defined. Product Definition = " + JSON.stringify(dataset.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (dataset.parentNode.record === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Record Definition. Product Definition = " + JSON.stringify(dataset.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                recordDefinition = dataset.parentNode.record
                singularVariableName = dataset.parentNode.code.singularVariableName
                /* Transform the raw data into JSON objects */
                jsonData = commons.jsonifyDataFile(dataFile, recordDefinition)
                /* Add the calculated properties */
                if (dataset.parentNode.calculations !== undefined) {
                    inputData = commons.calculationsProcedure(jsonData, recordDefinition, dataset.parentNode.calculations, singularVariableName, timePeriod)
                } else {
                    inputData = jsonData
                }
                products[dataset.parentNode.code.pluralVariableName] = inputData

                /* The main dependency is defined as the first dependency processed. */
                if (mainDependency === undefined) {
                    mainDependency = inputData
                }
            }

            /* During the next phase, we need to generate the data of the different products this process produces an output */
            let outputDatasets = bot.processNode.referenceParent.processOutput.outputDatasets
            for (let i = 0; i < outputDatasets.length; i++) {

                let dataset = outputDatasets[i].referenceParent
                let jsonData                // Just build data as Json objects
                let outputData              // Data built as a result of applying user defined code and formulas at the Data Building Procedure
                let singularVariableName    // name of the variable for this product
                let recordDefinition

                /*
                For each dataset in our process output, we will build the information based on our input products.
                */

                /* Basic validations to see if we have everything we need. */
                if (dataset.parentNode.code.singularVariableName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Single Variable Name defined. Product Definition = " + JSON.stringify(dataset.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (dataset.parentNode.code.pluralVariableName === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Plural Variable Name defined. Product Definition = " + JSON.stringify(dataset.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (dataset.parentNode.record === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Record Definition. Product Definition = " + JSON.stringify(dataset.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                if (dataset.parentNode.dataBuilding === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Data Building Procedure. Product Definition = " + JSON.stringify(dataset.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }

                recordDefinition = dataset.parentNode.record
                singularVariableName = dataset.parentNode.code.singularVariableName

                /* Build the data */
                jsonData = commons.dataBuildingProcedure(products, mainDependency, recordDefinition, dataset.parentNode.dataBuilding, singularVariableName, timePeriod)

                /* Add the calculated properties */
                if (dataset.parentNode.calculations !== undefined) {
                    outputData = commons.calculationsProcedure(jsonData, recordDefinition, dataset.parentNode.calculations, singularVariableName, timePeriod)
                } else {
                    outputData = jsonData
                }
                products[dataset.parentNode.code.pluralVariableName] = outputData
            }













            let dataFile;

            let bands = [];
            let channels = [];
            let standardChannels = [];
            let subChannels = [];
            let standardSubChannels = [];

            dataFile = dataFiles[0]; // We only need the bollinger bands.

            commons.buildBandsArray(dataFile, bands, timePeriod, callBackFunction);
            commons.buildChannels(bands, channels, callBackFunction);
            commons.buildStandardChannels(bands, standardChannels, callBackFunction);
            commons.buildSubChannels(bands, subChannels, callBackFunction);
            commons.buildStandardSubChannels(bands, standardSubChannels, callBackFunction);

            let dataDependency = {}
 
            for (let i = 0; i < processConfig.dataDependencies.length; i++) {
                let dependency = processConfig.dataDependencies[i]
                let recordDefinition = processConfig.recordDefinition
                let dependencyArray = commons.buildDependencyArray(dataFiles[i], recordDefinition);
                dependencyArray = commons.addCalculatedProperties(dependencyArray, dependency.singularVariableName, timePeriod);
                dataDependency[dependency.pluralVariableName] = dependencyArray
            }

            for (let i = 0; i < processConfig.updatesDatasets.length; i++) {
                let product = processConfig.updatesDatasets[i].product
                let dataset = processConfig.updatesDatasets[i].dataset
                let recordDefinition = getRecordDefinition(product)
                let records = commons.buildRecords(dataDependency, recordDefinition)                
                let fileContent = generateFileContent(indicatorData, recordDefinition)
                writeFile(product, dataset, fileContent)
            }

            let totalFilesWritten = 0
            function anotherFileWritten() {
                totalFilesWritten++
                if (totalFilesWritten === processConfig.updatesDatasets.length) {
                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                }          
            }

            function getRecordDefinition(product) {
                for (let j = 0; j < bot.products.length; j++) {
                    if (bot.products[j].codeName === product) {
                        return bot.products[j].recordDefinition
                    }
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
                        for (let j = 0; j < recordDefinition.length; j++) {
                            let property = recordDefinition[j]
                            fileContent = fileContent + propertySeparator 
                            if (property.isNumeric !== true) {
                                fileContent = fileContent + '"'
                            }
                            fileContent = fileContent + record[property.name] 
                            if (property.isNumeric !== true) {
                                fileContent = fileContent + '"'
                            }
                            if (recordSeparator === "") { propertySeparator = ","; }
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

            function writeFile(product, dataset, fileContent) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFile -> Entering function."); }

                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + product + "/" + dataset + "/" + outputPeriodLabel;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

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
