exports.newFoundationsFunctionLibrariesSingleMarketFunctionsUnified = function () {

    const MODULE_NAME = "Single Market Functions Unified";

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

    // ... (copy all validation and processing functions from original)
    function validateDataDependencies(processIndex, dataDependencies, callBackFunction) {
        // Copy from original SingleMarketFunctions.js
        for (let i = 0; i < dataDependencies.length; i++) {
            let dataDependencyNode = dataDependencies[i]
            if (dataDependencyNode.referenceParent.parentNode.config.singularVariableName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> Product Definition without a Single Variable Name defined. Product Definition = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }
            // ... rest of validation logic
        }
        return true
    }

    function validateOutputDatasets(processIndex, outputDatasets, callBackFunction) {
        // Copy validation logic from original
        return true
    }

    function inflateDatafiles(processIndex, dataFiles, dataDependencies, products, mainDependency, timeFrame) {
        // Copy from original - no changes needed
    }

    function dataBuildingProcedure() {
        // Copy from original - no changes needed
    }

    function calculationsProcedure() {
        // Copy from original - no changes needed  
    }

    function generateFileContent(processIndex, records, recordDefinition, resultsWithIrregularPeriods, processingDailyFiles, currentDay, callBackFunction) {
        // Copy from original - no changes needed
        try {
            let fileContent = "";
            let recordSeparator = "";

            for (let i = 0; i < records.length; i++) {
                let record = records[i];

                if (processingDailyFiles === true) {
                    if (resultsWithIrregularPeriods === true) {
                        let lastInstantOdDay = currentDay.valueOf() + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS - 1;
                        if (record.end < currentDay.valueOf() - 1) { continue; }
                        if (record.end === lastInstantOdDay) { continue; }
                    } else {
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

    async function writeFile(processIndex, contextSummary, fileContent, anotherFileWritten, processingDailyFiles, timeFrameLabel, currentDay, callBackFunction) {
        try {
            // Use unified storage instead of direct file operations
            const StorageFactory = require('../../../../lib/StorageFactory')
            const storage = StorageFactory.create(TS.projects.foundations.globals.taskConstants.DATA_STORAGE_CONFIG)

            let fileName = 'Data.json';
            let dateForPath = ''

            if (processingDailyFiles === true) {
                dateForPath = "/" + currentDay.getUTCFullYear() + '/' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(currentDay.getUTCMonth() + 1, 2) + '/' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(currentDay.getUTCDate(), 2);
            }

            let filePathRoot = 'Project/' + contextSummary.project + "/" + contextSummary.mineType + "/" + contextSummary.dataMine + "/" + contextSummary.bot + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            let filePath = filePathRoot + "/Output/" + contextSummary.product + "/" + contextSummary.dataset + "/" + timeFrameLabel + dateForPath + '/' + fileName

            // Parse JSON content for storage
            const data = JSON.parse(fileContent)
            
            await storage.writeFile(filePath, data)
            anotherFileWritten();

        } catch (err) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> writeFile -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function checkUpstreamOfTaskNode(processIndex) {
        // Copy from original - no changes needed
        return true
    }

    function initializeFilePathRoot(processIndex) {
        // Copy from original - no changes needed
    }
}