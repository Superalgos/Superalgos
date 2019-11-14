exports.newIndicatorBotCommons = function newIndicatorBotCommons(bot, logger, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Commons";
    const GMT_SECONDS = ':00.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    let thisObject = {
        jsonifyDataFile: jsonifyDataFile,
        calculationsProcedure: calculationsProcedure,
        dataBuildingProcedure: dataBuildingProcedure
    };

    return thisObject;

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
                    throw("Error Executing User Code.")
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

    function dataBuildingProcedure(products, mainDependency, recordDefinition, dataBuildingProcedure, variableName, timePeriod) {

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
                        previous: mainDependency[index-1],
                        current: mainDependency[index],
                        next: mainDependency[index+1]
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
                    if (dataBuildingProcedure.loop.code.code.indexOf('results.push') < 0) {
                        /* Adding the new element to the resulting array */
                        results.push(product[variableName]);
                    }
                }
            }
        }
        return results
    }
};
