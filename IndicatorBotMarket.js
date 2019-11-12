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

            let dataDependencies = bot.processNode.referenceParent.processDependencies.dataDependencies 
            for (let i = 0; i < dataDependencies.length; i++) {
                let dataset = dataDependencies[i].referenceParent
                /*
                For each dataset in our data dependencies, we should have da dataFile containing the records needed as an imput for this process.
                What we need to do first is transform those records into JSON objects that can be used by user-defined formulas.
                */
                if (dataset.parentNode.record === undefined) {
                    logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Record Definition. Product Definition = " + JSON.stringify(dataset.parentNode));
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return
                }
                dataset.inputData = commons.jsonifyDataFile(dataFiles[i], dataset.parentNode.record)
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
