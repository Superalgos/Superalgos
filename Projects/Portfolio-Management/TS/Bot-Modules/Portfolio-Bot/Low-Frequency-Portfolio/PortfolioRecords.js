exports.newPortfolioManagementBotModulesPortfolioRecords = function (processIndex) {
    /*
    This module facilitates the appending of records to the output of the process.
    */
    const MODULE_NAME = 'Portfolio Records'

    let thisObject = {
        appendRecords: appendRecords,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioEngine
    let portfolioSystem
    let sessionParameters
    let outputDatasetsMap

    return thisObject

    function initialize(pOutputDatasetsMap) {
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters
        outputDatasetsMap = pOutputDatasetsMap  // These are the files turned into arrays, stored in a Map by Product codeName.
    }

    function finalize() {
        portfolioEngine = undefined
        portfolioSystem = undefined
        sessionParameters = undefined
        outputDatasetsMap = undefined
    }

    function appendRecords() {
        /*
            Here we add records to the output files. At the product config property nodePath
            we have a pointer to the node that have the information we need to extract.
            Later, based on the product record definition we will extract each individual value.
       */
        let outputDatasets = TS.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')

        for (let i = 0; i < outputDatasets.length; i++) {
            let outputDatasetNode = outputDatasets[i]
            let dataset = outputDatasetNode.referenceParent
            let product = dataset.parentNode
            let outputDatasetArray = outputDatasetsMap.get(product.config.codeName)

            if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_PROCESSING_DAILY_FILES === true && dataset.config.type === 'Daily Files') {
                persistRecords()
            }

            if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_PROCESSING_DAILY_FILES === false && dataset.config.type === 'Market Files') {
                persistRecords()
            }

            function persistRecords() {
                /*
                There are a few products configured to be saved only at an specific cycle.
                */
                if (product.config.saveAtCycle !== undefined) {
                    if (portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.value !== product.config.saveAtCycle) {
                        return
                    }
                }

                /* Clean the file from information of previous executions */
                //pruneOutputFile(product, outputDatasetArray, portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value)

                /* Clean Open Records */
                if (product.config.saveAsObjects === true) {
                    for (let j = 0; j < product.record.properties.length; j++) {
                        let recordProperty = product.record.properties[j]
                        if (recordProperty.config.codeName === product.config.propertyNameThatDefinesObject) {
                            /* Remove Open Records */
                            spliceOpenRecords(j, product, outputDatasetArray)
                            break
                        }
                    }
                }

                /*
                The product root can be a node or a node property of type array.
                */
                let productRoot
                try {
                    productRoot = eval(product.config.nodePath)
                } catch (err) {
                    badDefinitionUnhandledException(err, 'Cannot get productRoot -> nodePath = ' + product.config.nodePath, product, undefined)
                }

                if (product.config.nodePathType === 'array') {
                    /* 
                    This means that the configured nodePath is not pointing to a node, but to a node property that is an array.
                    For that reason we will assume that each element of the array is a record to be outputed
                    */
                    for (let index = 0; index < productRoot.length; index++) {
                        /*
                        The Product Root Node is the root of the node hiriarchy from where we are going to extract the record values.
                        */
                        let productRootNode = productRoot[index]
                        let record = scanRecordDefinition(product, productRootNode, index)
                        if (record !== undefined) {
                            /*
                            We will add the index value to the record itself, so that the plotter can know to which 
                            brach of the portfolio engine data structure it belongs. 
                            */
                            record.push(index)
                            persistIndividualRecord(record, product, outputDatasetArray)
                        }
                    }
                } else {
                    /*
                    This means that the configured nodePath points to a single node, which is the one whose children constitutes
                    the record to be saved at the output file.
                    */
                    /*
                    The Product Root Node is the root of the node hiriarchy from where we are going to extract the record values.
                    */
                    let productRootNode = productRoot
                    let record = scanRecordDefinition(product, productRootNode)
                    if (record !== undefined) {
                        persistIndividualRecord(record, product, outputDatasetArray)
                    }
                }
            }
        }

        function scanRecordDefinition(product, productRootNode, index) {

            let record = []
            for (let j = 0; j < product.record.properties.length; j++) {
                let recordProperty = product.record.properties[j]
                /* 
                The Property Root Node is the Root of the Hiriarchy branch we must find in order
                to get the node where we are going to extract the value. Initially
                we point it to the Product Root Node, because that is the default in case
                a property does not have at its configuration a different nodePath configured
                pointing to an specific Root for the property.
                */
                let propertyRootNode = productRootNode
                /*
                If we find at the configuration a nodePath, then we take this path to find
                the Root Node specifically for this property only.
                */
                if (recordProperty.config.nodePath !== undefined) {
                    try {
                        propertyRootNode = eval(recordProperty.config.nodePath)
                    } catch (err) {
                        badDefinitionUnhandledException(err, 'Error Evaluating Record Property nodePath -> nodePath = ' + recordProperty.config.nodePath, product, recordProperty)
                    }
                }
                /* 
                The Target Node is the node from where we are going to exctract the value.
                We will use the codeName of the Record Property to match it with 
                any of the properties of the Root Node to get the Target Node.  
                */
                let targetNode
                try {
                    targetNode = propertyRootNode[recordProperty.config.codeName]
                } catch (err) {
                    badDefinitionUnhandledException(err, 'Error setting Target Node.', product, recordProperty)
                }
                /*
                If the codeName of the Record Property can not match the name of the property at
                the target node, the user can explicitly specify the property name at the configuration,
                and in those cases we need to use that. This happens when there are many Record Properties
                pointing to the same property at the Target Node.
                */
                if (recordProperty.config.childProperty !== undefined) {
                    targetNode = propertyRootNode[recordProperty.config.childProperty]
                }
                /*
                It can happen that intead of having a Node in targetNode what we have is an
                array of nodes. We need to pick one of the elements of the array and for that
                we use the Index value we find at the configuration of the Record Property.
                */
                if (recordProperty.config.index !== undefined) {
                    try {
                        targetNode = targetNode[recordProperty.config.index]
                    } catch (err) {
                        badDefinitionUnhandledException(err, 'Error setting Target Node.', product, recordProperty)
                    }
                }
                /* 
                By Default the value is extracted from the value property of the Target Node.
                But it might happen the the Target Node does not exist for example when there is an Array
                of Nodes defined in the Record Properties but not all of them exist at the Root Node.
                We filter out those cases by not extracting the value from the value property.
                */
                let value = 0 // This is a default value, since we do not want null in files because it breakes JSON format.
                if (targetNode !== undefined) {
                    if (targetNode.type !== undefined) {
                        /*
                        In this case the Target Node is really a node (since it has a type), so we extract the value
                        from its value property.
                        */
                        value = targetNode.value
                        if (value !== undefined && value !== null) {
                            if (recordProperty.config.decimals !== undefined) {
                                try {
                                    value = Number(value.toFixed(recordProperty.config.decimals))
                                } catch (err) {
                                    badDefinitionUnhandledException(err, 'Error applying configured decimals.', product, recordProperty)
                                }
                            }
                        }
                    } else {
                        /*
                        In this case the Target Node is not really node, but the value itself. Se we return this as the
                        value of the Record Property.
                        */
                        value = targetNode
                    }
                }

                /* We are not going to add records where the begin or end are missing */
                if (
                    recordProperty.config.codeName === 'begin' && value === 0 ||
                    recordProperty.config.codeName === 'end' && value === 0
                ) { return }

                if (recordProperty.config.isString !== true && Array.isArray(value) !== true) {
                    value = safeNumericValue(value)
                }
                if (recordProperty.config.isString === true && Array.isArray(value) !== true) {
                    value = safeStringValue(value)
                }
                record.push(value)
            }
            return record
        }

        function persistIndividualRecord(record, product, outputDatasetArray) {

            if (product.config.saveAsObjects === true) {
                /* For saving objects we need to take care of a different set of rules. */
                for (let j = 0; j < product.record.properties.length; j++) {
                    let recordProperty = product.record.properties[j]
                    if (recordProperty.config.codeName === product.config.propertyNameThatDefinesObject) {
                        let propertyValue = record[j]

                        if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_PROCESSING_DAILY_FILES) {
                            if (product.config.doNotCutObjectInDays !== true) {
                                /* 
                                By default we will cut objects in days.
                                */
                                if (propertyValue !== product.config.propertyValueThatPreventsSavingObject) {
                                    outputDatasetArray.push(record)
                                }
                            } else {
                                /*
                                When dealing with Daily Files, we need to avoid to write an open object at the last 'candle' of the day,
                                since the object will be duplicated on the next day. How do we know we are positioned at the last candle
                                of the day? Easy: the end of the candle must be 1 millisecod before the next day. That happens at any 
                                time frame. 
                                */
                                let currentDay = new Date(portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value)
                                let nextDay = new Date(portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value + 1)
                                if (currentDay.getUTCDate() !== nextDay.getUTCDate()) {
                                    /*
                                    We will save the object only if it is closed, becasuse we are at the last candle of the day.
                                    */
                                    if (propertyValue === product.config.propertyValueThatClosesObject) {
                                        outputDatasetArray.push(record)
                                    }
                                } else {
                                    /*
                                    When we are not at the end of the day, we will save the object normally, like in market files.
                                    */
                                    if (propertyValue !== product.config.propertyValueThatPreventsSavingObject) {
                                        outputDatasetArray.push(record)
                                    }
                                }
                            }
                        }
                        else {
                            /*
                            For Market Files we will add a record everytime that proeprty value does not match this
                            */
                            if (propertyValue !== product.config.propertyValueThatPreventsSavingObject) {
                                outputDatasetArray.push(record)
                            }
                        }
                        break
                    }
                }
            } else {
                /* 
                When we are not dealing with objects, we add every record to the existing file except 
                for the ones that are filtered out at the Product Definition.
                */
                if (product.config.propertyNameThatDefinesStatus !== undefined && product.config.propertyValueThatPreventsSavingObject !== undefined) {
                    for (let j = 0; j < product.record.properties.length; j++) {
                        let recordProperty = product.record.properties[j]
                        if (recordProperty.config.codeName === product.config.propertyNameThatDefinesStatus) {
                            let propertyValue = record[j]
                            
                            if (product.config.propertyValueThatPreventsSavingObject === "->Empty Array->" && propertyValue.length === 0) {
                                break
                            }
                            if (propertyValue !== product.config.propertyValueThatPreventsSavingObject) {
                                outputDatasetArray.push(record)
                            }
                            break
                        }
                    }
                } else {
                    outputDatasetArray.push(record)
                }
            }
        }

        function safeNumericValue(value) {
            /*
            The purpose of this function is to check that value variable does not have a value that 
            will later break the JSON format of files where this is going to be stored at. 
            */
            if (value === Infinity) {
                value = Number.MAX_SAFE_INTEGER
            }
            if (value === undefined) {
                value = 0
            }
            if (value === null) {
                value = 0
            }
            if (isNaN(value)) {
                value = 0
            }
            return value
        }

        function safeStringValue(value) {
            /*
            The purpose of this function is to check that value variable does not have a value that 
            will later break the JSON format of files where this is going to be stored at. 
            */
            if (value === undefined) {
                value = ''
            }
            if (value === null) {
                value = ''
            }
            return value
        }

        function pruneOutputFile(product, outputFile, currentEnd) {
            if (outputFile.isPrunned === true) { return }
            /*
            When a session is resumed, we will be potentially reading output files belonging to a previous session execution. 
            For that reason we need to prune all the records that are beyond the current candle. We do not delete everything
            because we might be resuming a stopped session, which is fine. 
            */
            for (let i = 0; i < outputFile.length; i++) {
                let record = outputFile[i]

                for (let j = 0; j < product.record.properties.length; j++) {
                    let recordProperty = product.record.properties[j]
                    if (recordProperty.config.codeName === 'end') {
                        let end = record[j]
                        if (end >= currentEnd) {
                            outputFile.splice(i, 1)
                            /*
                            This will execute the next prune call in the next iteration of the NodeJs event loop 
                            allowing for other callbacks to be executed. It also prevents the error
                            'Maximum call stack size exceeded', since the call is not placed at the call stack.
                            */
                            setImmediate(pruneOutputFile, product, outputFile, currentEnd)
                            return
                        }
                    }
                }
            }
            outputFile.isPrunned = true
        }

        function spliceOpenRecords(j, product, outputDatasetArray) {
            /*
            Before adding records to the output file, we need to remove all open records, 
            because we will be adding the same records later with potentially
            new or updated information.
            */

            for (let i = 0; i < outputDatasetArray.length; i++) {
                let dataRecord = outputDatasetArray[i]
                if (dataRecord !== undefined) {
                    let dataRecordValue = dataRecord[j]
                    if (dataRecordValue !== product.config.propertyValueThatClosesObject) {
                        outputDatasetArray.splice(i, 1)
                        spliceOpenRecords(j, product, outputDatasetArray)
                        return
                    }
                }
            }
        }
    }

    function badDefinitionUnhandledException(err, message, product, recordProperty) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] appendRecords -> " + message);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] appendRecords -> product.name = " + product.name);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] appendRecords -> product.config = " + JSON.stringify(product.config));

        if (recordProperty) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] appendRecords -> recordProperty.name = " + recordProperty.name);
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] appendRecords -> recordProperty.config.codeName = " + recordProperty.config.codeName);
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] appendRecords -> recordProperty.config = " + JSON.stringify(recordProperty.config));
        }

        if (err) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] appendRecords -> err.stack = " + err.stack);
        }
        throw 'Can not continue with a Definition Error like this.'
    }
}