exports.newIndicatorBot = function newIndicatorBot(bot, logger, UTILITIES, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "Indicator Bot";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(logger);
    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    return thisObject;

    function initialize(callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(dataFiles, timePeriod, outputPeriodLabel, currentDay, startDate, endDate, interExecutionMemory, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;
            let products = {}
            let mainDependency
            let processingDailyFiles

            if (currentDay !== undefined) {
                processingDailyFiles = true
            } else {
                processingDailyFiles = false
            }

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
                jsonData = jsonifyDataFile(dataFile, recordDefinition)
                /* Add the calculated properties */
                if (dataDependencyNode.parentNode.calculations !== undefined) {
                    inputData = calculationsProcedure(jsonData, recordDefinition, dataDependencyNode.parentNode.calculations, singularVariableName, timePeriod)
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
                let jsonData                        // Just build data as Json objects
                let outputData                      // Data built as a result of applying user defined code and formulas at the Data Building Procedure
                let singularVariableName            // Name of the variable for this product
                let recordDefinition                // Record as defined by the user at the UI
                let fileContent                     // Here we store the contents of the new data built just before writing it to a file.
                let resultsWithIrregularPeriods     // A product will have irregular periods when the User Code inserts new result records at will, in contrast with normal procedure where the platform insert one record per loop execution.

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

                /* Check Irregular Periods */
                if (outputDatasetNode.referenceParent.parentNode.dataBuilding.loop.code.code.indexOf('results.push') >= 0) {
                    resultsWithIrregularPeriods = true
                }

                /* Build the data */
                jsonData = dataBuildingProcedure(products, mainDependency, recordDefinition, outputDatasetNode.referenceParent.parentNode.dataBuilding, singularVariableName, timePeriod, resultsWithIrregularPeriods)

                /* Add the calculated properties */
                if (outputDatasetNode.referenceParent.parentNode.calculations !== undefined) {
                    outputData = calculationsProcedure(jsonData, recordDefinition, outputDatasetNode.referenceParent.parentNode.calculations, singularVariableName, timePeriod)
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
                let resultsWithIrregularPeriods     // A product will have irregular periods when the User Code inserts new result records at will, in contrast with normal procedure where the platform insert one record per loop execution.
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

                /* Check Irregular Periods */
                if (outputDatasetNode.referenceParent.parentNode.dataBuilding.loop.code.code.indexOf('results.push') >= 0) {
                    resultsWithIrregularPeriods = true
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

                let fileContent = generateFileContent(outputData, outputDatasetNode.referenceParent.parentNode.record, resultsWithIrregularPeriods)
                writeFile(contextSummary, fileContent)
            }

            function jsonifyDataFile(dataFile, recordDefinition) {

                /*
                    This function has as an input the raw data on files and creates with it an array of JSON objects
                    with not calculated properties for later being consumed by Formulas
                */

                let jsonifiedArray = []

                for (let i = 0; i < dataFile.length; i++) {

                    let record = {}
                    for (let j = 0; j < recordDefinition.properties.length; j++) {
                        let property = recordDefinition.properties[j]
                        if (property.code.isCalculated !== true) {
                            record[property.code.codeName] = dataFile[i][j]
                        }
                    }

                    jsonifiedArray.push(record);
                }

                return jsonifiedArray
            }

            function calculationsProcedure(jsonArray, recordDefinition, calculationsProcedure, variableName, timePeriod) {

                /* 
                    This function has as an input an array of JSON objects, and it adds calculated properties to
                    complete the set of properties that will be available for Formulas.
                */

                let system = { // These are the available system variables to be used in User Code and Formulas
                    timePeriod: timePeriod,
                    ONE_DAY_IN_MILISECONDS: ONE_DAY_IN_MILISECONDS
                }
                let variable = {} // This is the structure where the user will define its own variables that will be shared across different code blocks and formulas.
                let results = []

                /* This is Initialization Code */
                if (calculationsProcedure.initialization !== undefined) {
                    if (calculationsProcedure.initialization.code !== undefined) {
                        try {
                            eval(calculationsProcedure.initialization.code.code)
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Error = " + err.stack)
                            logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Code = " + calculationsProcedure.initialization.code.code);
                            throw ("Error Executing User Code.")
                        }
                    }
                }

                /* This is Initialization Code */
                if (calculationsProcedure.loop !== undefined) {
                    if (calculationsProcedure.loop.code !== undefined) {
                        for (let index = 0; index < jsonArray.length; index++) {

                            let product = {}
                            product[variableName] = jsonArray[index]

                            /* This is Loop Code */
                            try {
                                eval(calculationsProcedure.loop.code.code)
                            } catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> Error executing User Code. Error = " + err.stack)
                                logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> Error executing User Code. product = " + JSON.stringify(product))
                                logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> Error executing User Code. Code = " + calculationsProcedure.loop.code.code);
                                throw ("Error Executing User Code.")
                            }

                            /* For each calculated property we apply its formula*/
                            for (let j = 0; j < recordDefinition.properties.length; j++) {
                                let property = recordDefinition.properties[j]
                                if (property.code.isCalculated === true) {
                                    if (property.formula !== undefined) {
                                        if (property.formula.code !== undefined) {
                                            try {
                                                let newValue = eval(property.formula.code)
                                                let currentRecord = product[variableName]
                                                currentRecord[property.code.codeName] = newValue
                                            } catch (err) {
                                                logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. Error = " + err.stack)
                                                logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. product = " + JSON.stringify(product))
                                                logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. Code = " + property.formula.code);
                                                throw ("Error Executing User Code.")
                                            }
                                        }
                                    }
                                }
                            }

                            /* Adding the new element to the resulting array */
                            results.push(product[variableName]);
                        }
                    }
                }
                return results
            }

            function dataBuildingProcedure(products, mainDependency, recordDefinition, dataBuildingProcedure, variableName, timePeriod, resultsWithIrregularPeriods) {

                /* 
                    This function has as an input the products object, with all the information
                    of all products calculated so far by the process. Based on that information
                    the function will evaluate user supplied code and formulas in order to build
                    a new set of information.
                */

                let system = { // These are the available system variables to be used in User Code and Formulas
                    timePeriod: timePeriod,
                    ONE_DAY_IN_MILISECONDS: ONE_DAY_IN_MILISECONDS
                }
                let variable = {} // This is the structure where the user will define its own variables that will be shared across different code blocks and formulas.
                let results = []

                /* This is Initialization Code */
                if (dataBuildingProcedure.initialization !== undefined) {
                    if (dataBuildingProcedure.initialization.code !== undefined) {
                        try {
                            eval(dataBuildingProcedure.initialization.code.code)
                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> initialization -> Error executing User Code. Error = " + err.stack)
                            logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> initialization -> Error executing User Code. Code = " + dataBuildingProcedure.initialization.code.code);
                            throw ("Error Executing User Code.")
                        }
                    }
                }

                /* This is Initialization Code */
                if (dataBuildingProcedure.loop !== undefined) {
                    if (dataBuildingProcedure.loop.code !== undefined) {
                        for (let index = 0; index < mainDependency.length; index++) {

                            let record = {
                                previous: mainDependency[index - 1],
                                current: mainDependency[index],
                                next: mainDependency[index + 1]
                            }

                            let product = {}
                            product[variableName] = {}

                            /* This is Loop Code */
                            try {
                                eval(dataBuildingProcedure.loop.code.code)
                            } catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> Error executing User Code. Error = " + err.stack)
                                logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> Error executing User Code. product = " + JSON.stringify(product))
                                logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> Error executing User Code. Code = " + dataBuildingProcedure.loop.code.code);
                                throw ("Error Executing User Code.")
                            }

                            /* For each non-calculated property we apply its formula*/
                            for (let j = 0; j < recordDefinition.properties.length; j++) {
                                let property = recordDefinition.properties[j]
                                if (property.code.isCalculated !== true) {
                                    if (property.formula !== undefined) {
                                        if (property.formula.code !== undefined) {
                                            try {
                                                let newValue = eval(property.formula.code)
                                                let currentRecord = product[variableName]
                                                currentRecord[property.code.codeName] = newValue
                                            } catch (err) {
                                                logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> formula -> Error executing User Code. Error = " + err.stack)
                                                logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> formula -> Error executing User Code. product = " + JSON.stringify(product))
                                                logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> formula -> Error executing User Code. Code = " + property.formula.code);
                                                throw ("Error Executing User Code.")
                                            }
                                        }
                                    }
                                }
                            }

                            /* If within the code the new data structure was not yet pushed to the results array, we do it */
                            if (resultsWithIrregularPeriods !== true) {
                                /* Adding the new element to the resulting array */
                                results.push(product[variableName]);
                            }
                        }
                    }
                }
                return results
            }

            function anotherFileWritten() {
                totalFilesWritten++
                if (totalFilesWritten === outputDatasets.length) {
                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                }
            }

            function generateFileContent(records, recordDefinition, resultsWithIrregularPeriods) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> generateFileContent -> Entering function."); }

                    let fileContent = "";
                    let recordSeparator = "";

                    for (let i = 0; i < records.length; i++) {
                        let record = records[i];

                        if (processingDailyFiles === true) {

                            if (resultsWithIrregularPeriods === true) {
                                /*
                                    Here we have an special problem that occurs when an object spans several time peridos. If not taken care of
                                    it can happen that the object gets splitted between 2 days, which we dont want since it would loose some of
                                    its properties.
    
                                    To solve this issue, we wont save objects which ends at the last candle of the day, because we will save it
                                    at the next day, in whole, even if it starts in the previous day.
                                */

                                let lastInstantOdDay = currentDay.valueOf() + ONE_DAY_IN_MILISECONDS - 1;

                                if (record.end < currentDay.valueOf() - 1) { continue; }
                                if (record.end === lastInstantOdDay) { continue; }
                            } else {
                                /*
                                    The normal situation is that objects are respecting the time size of its main dependency, in which case we only
                                    care of not adding objects of the previous day we are currently processing (while on daily files)
                                */
                                if (record.end < currentDay.valueOf()) { continue; }
                            }
                        }

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
                    let dateForPath = ''

                    if (processingDailyFiles === true) {
                        dateForPath = "/" + currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                    }

                    let filePathRoot = contextSummary.devTeam + "/" + contextSummary.bot + "." + contextSummary.botVersion.major + "." + contextSummary.botVersion.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + contextSummary.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + contextSummary.product + "/" + contextSummary.dataset + "/" + outputPeriodLabel +  dateForPath;
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
