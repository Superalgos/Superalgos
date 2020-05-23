exports.newCommons = function newCommons(bot, logger, UTILITIES, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
    const ONE_MIN_IN_MILISECONDS = 60 * 1000;

    const MODULE_NAME = "Commons";

    let thisObject = {
        validateDataDependencies: validateDataDependencies,
        validateOutputDatasets: validateOutputDatasets,
        inflateDatafiles: inflateDatafiles,
        dataBuildingProcedure: dataBuildingProcedure,
        calculationsProcedure: calculationsProcedure,
        generateFileContent: generateFileContent,
        writeFile: writeFile
    };

    let utilities = UTILITIES.newCloudUtilities(logger);
    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    return thisObject;

    function validateDataDependencies(dataDependencies, callBackFunction) {
        for (let i = 0; i < dataDependencies.length; i++) {

            let dataDependencyNode = dataDependencies[i]

            /* Basic validations to see if we have everything we need. */
            if (dataDependencyNode.referenceParent.parentNode.config.singularVariableName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Single Variable Name defined. Product Definition = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (dataDependencyNode.referenceParent.parentNode.config.pluralVariableName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Plural Variable Name defined. Product Definition = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (dataDependencyNode.referenceParent.parentNode.record === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Record Definition. Product Definition = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }
        }
        return true
    }

    function validateOutputDatasets(outputDatasets, callBackFunction) {
        for (let i = 0; i < outputDatasets.length; i++) {
            let outputDatasetNode = outputDatasets[i]

            if (outputDatasetNode.referenceParent === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Output Dataset without Reference Parent. Output Dataset = " + JSON.stringify(outputDatasetNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (outputDatasetNode.referenceParent.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Dataset not a child of a Product Definition. Dataset = " + JSON.stringify(outputDatasetNode.referenceParent));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (outputDatasetNode.referenceParent.parentNode.config.singularVariableName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Single Variable Name defined. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (outputDatasetNode.referenceParent.parentNode.config.pluralVariableName === undefined) {
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
                logger.write(MODULE_NAME, "[WARN] start -> Product Definition " + outputDatasetNode.referenceParent.parentNode.name + " without a Data Building Procedure. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
            }
            if (outputDatasetNode.referenceParent.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Dataset witn no codeName defined. Product Dataset = " + JSON.stringify(outputDatasetNode.referenceParent));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (outputDatasetNode.referenceParent.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Dataset not attached to a Product Definition. Dataset = " + JSON.stringify(outputDatasetNode.referenceParent));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (outputDatasetNode.referenceParent.parentNode.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Product Definition witn no codeName defined. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (outputDatasetNode.referenceParent.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Product Definition not attached to a Bot. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (outputDatasetNode.referenceParent.parentNode.parentNode.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Bot witn no codeName defined. Bot = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (outputDatasetNode.referenceParent.parentNode.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Bot not attached to a Data Mine. Bot = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (outputDatasetNode.referenceParent.parentNode.parentNode.parentNode.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start -> Data Mine witn no codeName defined. Data Mine = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }
        }
        return true
    }

    function inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, timeFrame) {
        /*
        For each dataDependencyNode in our data dependencies, we should have a dataFile containing the records needed as an imput for this process.
        What we need to do first is transform those records into JSON objects that can be used by user-defined formulas.
        The first step does that but with the not calculated properties, the second step adds the calculated properties.
        */
        for (let i = 0; i < dataDependencies.length; i++) {

            let dataFile
            let jsonData        // Datafile converted into Json objects
            let inputData       // Includes calculated properties
            let singularVariableName    // name of the variable for this product
            let recordDefinition

            let dataDependencyNode = dataDependencies[i]
            dataFile = dataFiles.get(dataDependencyNode.id)

            if (dataFile === undefined) { continue } // When a datafile is not found it might be because we are processing market or daily and at the dependency array there are both types mixed up.

            recordDefinition = dataDependencyNode.referenceParent.parentNode.record
            singularVariableName = dataDependencyNode.referenceParent.parentNode.config.singularVariableName
            /* Transform the raw data into JSON objects */
            jsonData = jsonifyDataFile(dataFile, recordDefinition)
            /* Add the calculated properties */
            if (dataDependencyNode.referenceParent.parentNode.calculations !== undefined) {
                inputData = calculationsProcedure(jsonData, recordDefinition, dataDependencyNode.referenceParent.parentNode.calculations, singularVariableName, timeFrame)
            } else {
                inputData = jsonData
            }
            products[dataDependencyNode.referenceParent.parentNode.config.pluralVariableName] = inputData

            /* The main dependency is defined as the first dependency processed. */
            if (mainDependency.records === undefined) {
                mainDependency.records = inputData
            }
        }
    }

    function jsonifyDataFile(dataFile, recordDefinition) {

        /*
            This function has as an input the raw data on files and creates with it an array of JSON objects
            with not calculated properties for later being consumed by Formulas
        */

        let jsonifiedArray = []
        let previous;

        for (let i = 0; i < dataFile.length; i++) {

            let record = {}
            for (let j = 0; j < recordDefinition.properties.length; j++) {
                let property = recordDefinition.properties[j]
                if (property.config.isCalculated !== true) {
                    record[property.config.codeName] = dataFile[i][j]
                }
            }

            record.previous = previous;
            jsonifiedArray.push(record);
            previous = record;
        }

        return jsonifiedArray
    }

    function calculationsProcedure(jsonArray, recordDefinition, calculationsProcedure, variableName, timeFrame) {

        /* 
            This function has as an input an array of JSON objects, and it adds calculated properties to
            complete the set of properties that will be available for Formulas.
        */

        let system = { // These are the available system variables to be used in User Code and Formulas
            timeFrame: timeFrame,
            ONE_DAY_IN_MILISECONDS: ONE_DAY_IN_MILISECONDS
        }
        let variable = {} // This is the structure where the user will define its own variables that will be shared across different code blocks and formulas.
        let results = []

        /* This is Initialization Code */
        if (calculationsProcedure.initialization !== undefined) {
            if (calculationsProcedure.initialization.javascriptCode !== undefined) {
                try {
                    eval(calculationsProcedure.initialization.javascriptCode.code)
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Error = " + err.stack)
                    logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Code = " + calculationsProcedure.initialization.javascriptCode.code);
                    throw ("Error Executing User Code.")
                }
            }
        }

        /* This is Initialization Code */
        if (calculationsProcedure.loop !== undefined) {
            if (calculationsProcedure.loop.javascriptCode !== undefined) {
                for (let index = 0; index < jsonArray.length; index++) {

                    let product = {}
                    product[variableName] = jsonArray[index]

                    /* This is Loop Code */
                    try {
                        eval(calculationsProcedure.loop.javascriptCode.code)
                    } catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> Error executing User Code. Error = " + err.stack)
                        logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> Error executing User Code. product = " + JSON.stringify(product))
                        logger.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> Error executing User Code. Code = " + calculationsProcedure.loop.javascriptCode.code);
                        throw ("Error Executing User Code.")
                    }

                    /* For each calculated property we apply its formula*/
                    for (let j = 0; j < recordDefinition.properties.length; j++) {
                        let property = recordDefinition.properties[j]
                        if (property.config.isCalculated === true) {
                            if (property.formula !== undefined) {
                                if (property.formula.code !== undefined) {
                                    try {
                                        let newValue = eval(property.formula.code)
                                        let currentRecord = product[variableName]
                                        currentRecord[property.config.codeName] = newValue
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

    function dataBuildingProcedure(
        products,
        mainDependency,
        recordDefinition,
        dataBuildingProcedure,
        variableName,
        productName,
        timeFrame,
        timeFrameLabel,
        resultsWithIrregularPeriods,
        interExecutionMemory,
        processingDailyFiles,
        currentDay
    ) {

        /* 
            This function has as an input the products object, with all the information
            of all products calculated so far by the process. Based on that information
            the function will evaluate user supplied code and formulas in order to build
            a new set of information.
        */

        let lastInstantOfTheDay
        let yesterday = {}
        let system = { // These are the available system variables to be used in User Code and Formulas
            timeFrame: timeFrame,
            ONE_DAY_IN_MILISECONDS: ONE_DAY_IN_MILISECONDS,
            ONE_MIN_IN_MILISECONDS: ONE_MIN_IN_MILISECONDS
        }
        let variable = {} // This is the structure where the user will define its own variables that will be shared across different code blocks and formulas.
        let results = []

        /*
            We are going to build a map structure so that users can easily get the current object of
            each data dependency based on the current element of the main data dependency. 
            We will use as key for these maps the begin and end property, meaning only elements with exactly
            the same begin and end property will be matched.
        */

        const PROPERTIES_COUNT = Object.keys(products).length

        let dataDependencies = {}
        if (PROPERTIES_COUNT > 1) { // only if we have secondary data dependencies.
            for (let i = 1; i < PROPERTIES_COUNT; i++) {
                let dataDependecyArray = Object.values(products)[i]
                let dataDependencyName = Object.keys(products)[i]
                let dataDependencyMap = new Map()
                for (let j = 0; j < dataDependecyArray.length; j++) {
                    let record = dataDependecyArray[j]
                    let key = record.begin.toString() + '-' + record.end.toString()
                    dataDependencyMap.set(key, record)
                }
                dataDependencies[dataDependencyName] = dataDependencyMap
            }
        }

        function getElement(dependencyName, currentRecordPrimaryDataDependency) {
            let key = currentRecordPrimaryDataDependency.begin.toString() + '-' + currentRecordPrimaryDataDependency.end.toString()
            return dataDependencies[dependencyName].get(key)
        }

        /* This is Initialization Code */
        if (dataBuildingProcedure.initialization !== undefined) {
            if (dataBuildingProcedure.initialization.javascriptCode !== undefined) {
                try {
                    eval(dataBuildingProcedure.initialization.javascriptCode.code)
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> initialization -> Error executing User Code. Error = " + err.stack)
                    logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> initialization -> Error executing User Code. Code = " + dataBuildingProcedure.initialization.javascriptCode.code);
                    throw ("Error Executing User Code.")
                }
            }
        }

        if (processingDailyFiles) {
            /* Initialization of Last Instance */
            lastInstantOfTheDay = currentDay.valueOf() + ONE_DAY_IN_MILISECONDS - 1;

            if (interExecutionMemory[productName] === undefined) {
                /* The first time the intialization variables goes to the Inter Execution Memory. */
                interExecutionMemory[productName] = {}
                interExecutionMemory[productName].variable = JSON.parse(JSON.stringify(variable))
            }
            else {
                /* We override the initialization, since the valid stuff is already at the Inter Execution Memory */
                variable = JSON.parse(JSON.stringify(interExecutionMemory[productName].variable))
            }
        }

        /* This is Initialization Code */
        if (dataBuildingProcedure.loop !== undefined) {
            if (dataBuildingProcedure.loop.javascriptCode !== undefined) {
                let lastRecord
                for (let index = 0; index < mainDependency.records.length; index++) {

                    let record = {
                        previous: mainDependency.records[index - 1],
                        current: mainDependency.records[index],
                        next: mainDependency.records[index + 1]
                    }
                    lastRecord = record
                    let product = {}
                    product[variableName] = {}

                    /* Here is how we know if we are processing Yesterday. */
                    let positionedAtYesterday = false
                    if (processingDailyFiles) {
                        positionedAtYesterday = (record.current.end < currentDay.valueOf())
                    }

                    /* This is Loop Code */
                    try {
                        eval(dataBuildingProcedure.loop.javascriptCode.code)
                    } catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> Error executing User Code. Error = " + err.stack)
                        logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> Error executing User Code. product = " + JSON.stringify(product))
                        logger.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> Error executing User Code. Code = " + dataBuildingProcedure.loop.javascriptCode.code);
                        throw ("Error Executing User Code.")
                    }

                    /* For each non-calculated property we apply its formula*/
                    for (let j = 0; j < recordDefinition.properties.length; j++) {
                        let property = recordDefinition.properties[j]
                        if (property.config.isCalculated !== true) {
                            if (property.formula !== undefined) {
                                if (property.formula.code !== undefined) {
                                    try {
                                        let newValue = eval(property.formula.code)
                                        let currentRecord = product[variableName]
                                        currentRecord[property.config.codeName] = newValue
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

                    /* While we are positioned at Yesterday, we keey updating this data structure. */
                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.variable = JSON.parse(JSON.stringify(variable))
                        }
                    }
                }
                /*
                    Before returning we need to see if we have to record some of our counters at the interExecutionMemory.
                    To do that, the condition to be met is that this execution must include all candles of the current day.
                */
                if (processingDailyFiles) {
                    if (lastRecord.current.end === lastInstantOfTheDay && yesterday.variable !== undefined) {
                        interExecutionMemory[productName] = {}
                        interExecutionMemory[productName].variable = JSON.parse(JSON.stringify(yesterday.variable))
                    }
                }
            }
        }
        return results
    }

    function generateFileContent(records, recordDefinition, resultsWithIrregularPeriods, processingDailyFiles, currentDay, callBackFunction) {

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
                    if (property.config.isCalculated !== true) {
                        fileContent = fileContent + propertySeparator
                        if (property.config.isString === true) {
                            fileContent = fileContent + '"'
                        }
                        fileContent = fileContent + record[property.config.codeName]
                        if (property.config.isString === true) {
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

    function writeFile(contextSummary, fileContent, anotherFileWritten, processingDailyFiles, timeFrameLabel, currentDay, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFile -> Entering function."); }

            let market = bot.market;
            let fileName = 'Data.json';
            let dateForPath = ''

            if (processingDailyFiles === true) {
                dateForPath = "/" + currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
            }

            let filePathRoot = bot.exchange + "/" + bot.market.baseAsset + "-" + bot.market.quotedAsset + "/" + contextSummary.dataMine + "/" + contextSummary.bot;
            let filePath = filePathRoot + "/Output/" + contextSummary.product + "/" + contextSummary.dataset + "/" + timeFrameLabel + dateForPath;
            filePath += '/' + fileName

            fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

            function onFileCreated(err) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFile -> onFileCreated -> Entering function."); }
                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeFile -> onFileCreated -> fileContent = " + fileContent); }

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                        logger.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> err = " + err.stack);
                        logger.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> filePath = " + filePath);
                        logger.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> market = " + market.baseAsset + "_" + market.quotedAsset);

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

