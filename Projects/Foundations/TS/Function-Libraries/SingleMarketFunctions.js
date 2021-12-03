exports.newFoundationsFunctionLibrariesSingleMarketFunctions = function () {

    const MODULE_NAME = "Single Market Functions";

    let thisObject = {
        validateDataDependencies: validateDataDependencies,
        validateOutputDatasets: validateOutputDatasets,
        inflateDatafiles: inflateDatafiles,
        dataBuildingProcedure: dataBuildingProcedure,
        calculationsProcedure: calculationsProcedure,
        generateFileContent: generateFileContent,
        writeFile: writeFile,
        checkUpstreamOfTaskNode: checkUpstreamOfTaskNode,
        initializeFilePathRoot: initializeFilePathRoot
    };

    return thisObject;

    function validateDataDependencies(processIndex, dataDependencies, callBackFunction) {
        for (let i = 0; i < dataDependencies.length; i++) {

            let dataDependencyNode = dataDependencies[i]

            /* Basic validations to see if we have everything we need. */
            if (dataDependencyNode.referenceParent.parentNode.config.singularVariableName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Single Variable Name defined. Product Definition = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (dataDependencyNode.referenceParent.parentNode.config.pluralVariableName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Plural Variable Name defined. Product Definition = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (dataDependencyNode.referenceParent.parentNode.record === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Record Definition. Product Definition = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
        }
        return true
    }

    function validateOutputDatasets(processIndex, outputDatasets, callBackFunction) {
        for (let i = 0; i < outputDatasets.length; i++) {
            let outputDatasetNode = outputDatasets[i]

            if (outputDatasetNode.referenceParent === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Output Dataset without Reference Parent. Output Dataset = " + JSON.stringify(outputDatasetNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (outputDatasetNode.referenceParent.parentNode === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Dataset not a child of a Product Definition. Dataset = " + JSON.stringify(outputDatasetNode.referenceParent));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (outputDatasetNode.referenceParent.parentNode.config.singularVariableName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Single Variable Name defined. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (outputDatasetNode.referenceParent.parentNode.config.pluralVariableName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Plural Variable Name defined. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (outputDatasetNode.referenceParent.parentNode.record === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Record Definition. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
            if (outputDatasetNode.referenceParent.parentNode.dataBuilding === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] start -> Product Definition " + outputDatasetNode.referenceParent.parentNode.name + " without a Data Building Procedure. Product Definition Name = " + outputDatasetNode.referenceParent.parentNode.name);
            }
            if (outputDatasetNode.referenceParent.config.codeName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Dataset with no codeName defined. Product Dataset = " + JSON.stringify(outputDatasetNode.referenceParent));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (outputDatasetNode.referenceParent.parentNode === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Dataset not attached to a Product Definition. Dataset = " + JSON.stringify(outputDatasetNode.referenceParent));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (outputDatasetNode.referenceParent.parentNode.config.codeName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Product Definition with no codeName defined. Product Definition = " + JSON.stringify(outputDatasetNode.referenceParent.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            let botNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Indicator Bot')
            if (botNode === undefined) {
                botNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Trading Bot')
            }
            if (botNode === undefined) {
                botNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Portfolio Bot')
            }
            if (botNode === undefined) {
                botNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Learning Bot')
            }
            if (botNode === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Product Definition not attached to a Bot. ");
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (botNode.config.codeName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Bot with no codeName defined.");
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            let dataMineNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Data Mine')
            if (dataMineNode === undefined) {
                let tradingMineNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Trading Mine')
                if (tradingMineNode === undefined) {
                    let portfolioMineNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Portfolio Mine');
                    if (portfolioMineNode === undefined) {
                        let learningMineNode = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(outputDatasetNode, 'Learning Mine')
                        if (learningMineNode === undefined) {
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Bot not attached to a Data Mine, Trading Mine or Learning Mine.");
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            return
                        } else {
                            if (learningMineNode.config.codeName === undefined) {
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Learning Mine with no codeName defined.");
                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                return
                            }
                        }
                    } else {
                        if (portfolioMineNode.config.codeName === undefined) {
                            TS.project.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Portfolio Mine with no codeName defined.");
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }
                } else {
                    if (tradingMineNode.config.codeName === undefined) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Trading Mine with no codeName defined.");
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        return
                    }
                }
            } else {
                if (dataMineNode.config.codeName === undefined) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Data Mine with no codeName defined.");
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    return
                }
            }
        }
        return true
    }

    function inflateDatafiles(processIndex, dataFiles, dataDependencies, products, mainDependency, timeFrame) {
        /*
        For each dataDependencyNode in our data dependencies, we should have a dataFile containing the records needed as an input for this process.
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
            jsonData = jsonifyDataFile(processIndex, dataFile, recordDefinition)
            /* Add the calculated properties */
            if (dataDependencyNode.referenceParent.parentNode.calculations !== undefined) {
                inputData = calculationsProcedure(processIndex, jsonData, recordDefinition, dataDependencyNode.referenceParent.parentNode.calculations, singularVariableName, timeFrame)
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

    function jsonifyDataFile(processIndex, dataFile, recordDefinition) {

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

    function calculationsProcedure(processIndex, jsonArray, recordDefinition, calculationsProcedure, variableName, timeFrame) {

        /*
            This function has as an input an array of JSON objects, and it adds calculated properties to
            complete the set of properties that will be available for Formulas.
        */

        let system = { // These are the available system variables to be used in User Code and Formulas
            timeFrame: timeFrame,
            ONE_DAY_IN_MILISECONDS: SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
        }
        let variable = {} // This is the structure where the user will define its own variables that will be shared across different code blocks and formulas.
        let results = []

        /* This is Initialization Code */
        if (calculationsProcedure.initialization !== undefined) {
            if (calculationsProcedure.initialization.procedureJavascriptCode !== undefined) {
                try {
                    eval(calculationsProcedure.initialization.procedureJavascriptCode.code)
                } catch (err) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Error = " + err.stack)
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Code = " + calculationsProcedure.initialization.procedureJavascriptCode.code);
                    throw ("Error Executing User Code.")
                }
            }
        }

        /* This is Initialization Code */
        if (calculationsProcedure.loop !== undefined) {
            if (calculationsProcedure.loop.procedureJavascriptCode !== undefined) {
                for (let index = 0; index < jsonArray.length; index++) {

                    let product = {}
                    product[variableName] = jsonArray[index]

                    /* This is Loop Code */
                    try {
                        eval(calculationsProcedure.loop.procedureJavascriptCode.code)
                    } catch (err) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> Error executing User Code. Error = " + err.stack)
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> Error executing User Code. product = " + JSON.stringify(product))
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> Error executing User Code. Code = " + calculationsProcedure.loop.procedureJavascriptCode.code);
                        throw ("Error Executing User Code.")
                    }

                    /* For each calculated property we apply its formula*/
                    for (let j = 0; j < recordDefinition.properties.length; j++) {
                        let property = recordDefinition.properties[j]
                        if (property.config.isCalculated === true) {
                            if (property.recordFormula !== undefined) {
                                if (property.recordFormula.code !== undefined) {
                                    try {
                                        let newValue = eval(property.recordFormula.code)
                                        let currentRecord = product[variableName]
                                        currentRecord[property.config.codeName] = newValue
                                    } catch (err) {
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. Error = " + err.stack)
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. product = " + JSON.stringify(product))
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. Code = " + property.recordFormula.code);
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
        processIndex,
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
        currentDay,
        parametersDefinition
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
            ONE_DAY_IN_MILISECONDS: SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS,
            ONE_MIN_IN_MILISECONDS: SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS
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
                    let key
                    if (record.begin !== undefined && record.end !== undefined) {
                        key = record.begin.toString() + '-' + record.end.toString()
                        dataDependencyMap.set(key, record)
                    } else {
                        /*
                        Datasets with objects that do not have a begin and end can not be part of the map.
                        */
                    }
                }
                dataDependencies[dataDependencyName] = dataDependencyMap
            }
        }
        /*
        This function allows users to locate an object at a dataset based on the begins and end properties
        of another object provided to the function as a parameter. For example, users can locate the
        bollinger band object that has the same begin and end than a candle object.
        */
        function getElement(dependencyName, currentRecordPrimaryDataDependency) {
            let key = currentRecordPrimaryDataDependency.begin.toString() + '-' + currentRecordPrimaryDataDependency.end.toString()
            return dataDependencies[dependencyName].get(key)
        }
        /*
        This function allows users to locate an object at a dataset whose objects does not have a begin and end
        property but instead, they have a timestamp property. It receives an arbitrary begin / end object and
        the function will search within the dependency dataset for the first record whose timestamp is within
        the begin and end of the received reference objet. For example, a user can get the News record that belong
        to a certain Candle object.
        */
        function getTimestampElement(dependencyName, currentRecordPrimaryDataDependency) {
            let dependencyArray = products[dependencyName]
            for (let i = 0; i < dependencyArray.length; i++) {
                let record = dependencyArray[i]
                if (record.timestamp >= currentRecordPrimaryDataDependency.begin && record.timestamp <= currentRecordPrimaryDataDependency.end) {
                    return record
                }
            }
        }

        /*
        Indicators might have parameters that influences it's calculations. These parameters
        are defined at the Product Definition config, and their values are set at the Process Instance config.
        Parameters are extracted at the Procedure Initialization Code. In order to facilitate this extraction
        we will create an object here that will be accessed from the Procedure Initialization with all parameters
        and their defined values.
        */
        let parameters = {}
        if (parametersDefinition !== undefined) {
            for (let i = 0; i < parametersDefinition.length; i++) {
                let parameterName = parametersDefinition[i]
                let parameterValue = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config[parameterName]
                if (parameterValue !== undefined) {
                    parameters[parameterName] = parameterValue
                }
            }
        }

        /* Here we run the Procedure Initialization Code */
        if (dataBuildingProcedure.initialization !== undefined) {
            if (dataBuildingProcedure.initialization.procedureJavascriptCode !== undefined) {
                try {
                    eval(dataBuildingProcedure.initialization.procedureJavascriptCode.code)
                } catch (err) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> initialization -> Error executing User Code. Error = " + err.stack)
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> initialization -> Error executing User Code. Code = " + dataBuildingProcedure.initialization.procedureJavascriptCode.code);
                    throw ("Error Executing User Code.")
                }
            }
        }

        if (processingDailyFiles) {
            /* Initialization of Last Instance */
            lastInstantOfTheDay = currentDay.valueOf() + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS - 1;

            if (interExecutionMemory[productName] === undefined) {
                /* The first time the initialization variables goes to the Inter Execution Memory. */
                interExecutionMemory[productName] = {}
                interExecutionMemory[productName].variable = JSON.parse(JSON.stringify(variable))
            }
            else {
                /* We override the initialization, since the valid stuff is already at the Inter Execution Memory */
                variable = JSON.parse(JSON.stringify(interExecutionMemory[productName].variable))
            }
        }

        /* Here we run the Procedure Loop Code */
        if (dataBuildingProcedure.loop !== undefined) {
            if (dataBuildingProcedure.loop.procedureJavascriptCode !== undefined) {
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

                    /* This is Loop Code */
                    try {
                        eval(dataBuildingProcedure.loop.procedureJavascriptCode.code)
                    } catch (err) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> Error executing User Code. Error = " + err.stack)
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> Error executing User Code. product = " + JSON.stringify(product))
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> Error executing User Code. Code = " + dataBuildingProcedure.loop.procedureJavascriptCode.code);
                        throw ("Error Executing User Code.")
                    }

                    /* For each non-calculated property we apply its formula*/
                    for (let j = 0; j < recordDefinition.properties.length; j++) {
                        let property = recordDefinition.properties[j]
                        if (property.config.isCalculated !== true) {
                            if (property.recordFormula !== undefined) {
                                if (property.recordFormula.code !== undefined) {
                                    try {
                                        let newValue = eval(property.recordFormula.code)
                                        let currentRecord = product[variableName]
                                        currentRecord[property.config.codeName] = newValue
                                    } catch (err) {
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> formula -> Error executing User Code. Error = " + err.stack)
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> formula -> Error executing User Code. product = " + JSON.stringify(product))
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] dataBuildingProcedure -> loop -> formula -> Error executing User Code. Code = " + property.recordFormula.code);
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

                    /* At the last instant of yesterday, we update the yesterday object. */
                    if (processingDailyFiles) {
                        if (record.current.end + 1 === currentDay.valueOf()) {
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

    function generateFileContent(processIndex, records, recordDefinition, resultsWithIrregularPeriods, processingDailyFiles, currentDay, callBackFunction) {

        try {
            let fileContent = "";
            let recordSeparator = "";

            for (let i = 0; i < records.length; i++) {
                let record = records[i];

                if (processingDailyFiles === true) {

                    if (resultsWithIrregularPeriods === true) {
                        /*
                            Here we have an special problem that occurs when an object spans several time periods. If not taken care of
                            it can happen that the object gets splitted between 2 days, which we dont want since it would loose some of
                            its properties.

                            To solve this issue, we wont save objects which ends at the last candle of the day, because we will save it
                            at the next day, in whole, even if it starts in the previous day.
                        */

                        let lastInstantOdDay = currentDay.valueOf() + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS - 1;

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
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> generateFileContent -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function writeFile(processIndex, contextSummary, fileContent, anotherFileWritten, processingDailyFiles, timeFrameLabel, currentDay, callBackFunction) {

        try {
            let fileName = 'Data.json';
            let dateForPath = ''

            if (processingDailyFiles === true) {
                dateForPath = "/" + currentDay.getUTCFullYear() + '/' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(currentDay.getUTCMonth() + 1, 2) + '/' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(currentDay.getUTCDate(), 2);
            }

            let filePathRoot = 'Project/' + contextSummary.project + "/" + contextSummary.mineType + "/" + contextSummary.dataMine + "/" + contextSummary.bot + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            let filePath = filePathRoot + "/Output/" + contextSummary.product + "/" + contextSummary.dataset + "/" + timeFrameLabel + dateForPath;
            filePath += '/' + fileName

            let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex);
            fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

            function onFileCreated(err) {

                try {
                    if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {

                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> err = " + err.stack);
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> filePath = " + filePath);
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> market = " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName);

                        callBackFunction(err);
                        return;

                    }

                    anotherFileWritten();

                }
                catch (err) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> writeFile -> onFileCreated -> err = " + err.stack);
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> writeFile -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function checkUpstreamOfTaskNode(processIndex) {
        /*
        Here we check that the Task Node received, comes with all the upstream nodes that will be
        needed to run this task in the context of a Single Market Bot.
        */
        /* Validate that the minimum amount of input required are defined. */
        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Task without a Task Manager. This bot process will not run. -> Process Instance = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            return false
        }

        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Task Manager without parent Mine Tasks. This bot process will not run. -> Process Instance = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            return false
        }

        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Mine Tasks without parent Market Tasks. This bot process will not run. -> Process Instance = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            return false
        }

        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Market Tasks without parent Exchange Tasks. This bot process will not run. -> Process Instance = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            return false
        }
        /*
        Checking the Market that is referenced.
        */
        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Market Tasks without a Market. This bot process will not run. -> Process Instance = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
            return false
        }

        let marketNode = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent

        if (marketNode.parentNode === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Market without a Parent. This bot process will not run. -> Received = " + JSON.stringify(marketNode));
            return false
        }

        if (marketNode.parentNode.parentNode === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Exchange Markets without a Parent. This bot process will not run. -> Received = " + JSON.stringify(marketNode.parentNode));
            return false
        }

        if (marketNode.baseAsset === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Market without a Base Asset. This bot process will not run. -> Received = " + JSON.stringify(marketNode));
            return false
        }

        if (marketNode.quotedAsset === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Market without a Quoted Asset. This bot process will not run. -> Received = " + JSON.stringify(marketNode));
            return false
        }

        if (marketNode.baseAsset.referenceParent === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Base Asset without a Reference Parent. This bot process will not run. -> Received = " + JSON.stringify(marketNode.baseAsset));
            return false
        }

        if (marketNode.quotedAsset.referenceParent === undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] checkUpstreamOfTaskNode -> Quoted Asset without a Reference Parent. This bot process will not run. -> Received = " + JSON.stringify(marketNode.quotedAsset));
            return false
        }
        return true
    }

    function initializeFilePathRoot(processIndex) {
        /*
        For Single Market Files, the Root Path for files takes an specific structure
        which includes the exchange and market. Here that structure is defined.
        */
        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT =
            'Project/' +
            TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName +
            "/" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-') +
            "/" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName +
            "/" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName +
            '/' +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName +
            "/" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
            "-" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName

    }

}

