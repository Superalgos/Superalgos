exports.newDataBridge = function newDataBridge(processIndex) {
    /*
    This modules bring the data from Superalgos Indicators into a time-series file for each Test Case, 
    that can later be fed to a Machine Learning Model.
    */
    let thisObject = {
        updateDatasetFiles: updateDatasetFiles,
        getFiles: getFiles,
        initialize: initialize,
        finalize: finalize
    }

    let savedDatasets
    let loadedDataMinesFilesMap
    let indicatorFileContentMap

    let timeSeriesFileFeatures = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.timeSeriesFile.features
    let timeSeriesFileLabels = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.timeSeriesFile.labels

    return thisObject

    function initialize() {
        savedDatasets = new Map()
        loadedDataMinesFilesMap = new Map()
        indicatorFileContentMap = new Map()

        /*
        Create Missing Folders, if needed.
        */
        let dir
        dir = global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/StateData/TestCases"
        if (!SA.nodeModules.fs.existsSync(dir)) {
            SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
        }

        dir = global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/StateData/ForecastCases"
        if (!SA.nodeModules.fs.existsSync(dir)) {
            SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
        }

        dir = global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/OutputData/TestData"
        if (!SA.nodeModules.fs.existsSync(dir)) {
            SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
        }

        dir = global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/OutputData/TestReports"
        if (!SA.nodeModules.fs.existsSync(dir)) {
            SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
        }
        dir = global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/OutputData/ForecastReports"
        if (!SA.nodeModules.fs.existsSync(dir)) {
            SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
        }        
        /*
        Load Data Mines Files
        */
        for (let q = 0; q < timeSeriesFileLabels.length; q++) {
            let label = timeSeriesFileLabels[q]
            addDataMineFile(label)
        }

        for (let q = 0; q < timeSeriesFileFeatures.length; q++) {
            let feature = timeSeriesFileFeatures[q]
            addDataMineFile(feature)
        }
        /*
        Remove from features and labels all the ones that can not be ON, to improve performance.
        */
        timeSeriesFileFeatures = removeOnlyOff(timeSeriesFileFeatures)
        timeSeriesFileLabels = removeOnlyOff(timeSeriesFileLabels)

        function addDataMineFile(featuresOrLabelsObject) {
            if (featuresOrLabelsObject.dataMine === undefined) { return }
            let dataMine = loadedDataMinesFilesMap.get(featuresOrLabelsObject.dataMine)
            if (dataMine !== undefined) { return }

            let fileContent = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.loadFile(global.env.PATH_TO_PLUGINS + "/Data-Mining/Data-Mines/" + featuresOrLabelsObject.dataMine + ".json")
            dataMine = JSON.parse(fileContent)
            loadedDataMinesFilesMap.set(featuresOrLabelsObject.dataMine, dataMine)
        }

        function removeOnlyOff(featuresOrLabels) {
            let newArray = []
            for (let q = 0; q < featuresOrLabels.length; q++) {
                let object = featuresOrLabels[q]
                if (object.range.length === 1 && object.range[0] === 'OFF') {
                    /* We don't need this object */
                } else {
                    newArray.push(object)
                }
            }
            return newArray
        }
    }

    function finalize() {
        savedDatasets = undefined
        loadedDataMinesFilesMap = undefined
        indicatorFileContentMap = undefined
    }

    async function updateDatasetFiles(testCase) {
        let forecastedCandle
        let mainTimeFrame = testCase.parameters.LIST_OF_TIMEFRAMES[0]
        let mainAsset = testCase.parameters.LIST_OF_ASSETS[0]
        let assetsToInclude = testCase.parameters.LIST_OF_ASSETS
        let timeFramesToInclude = testCase.parameters.LIST_OF_TIMEFRAMES

        createParametersFile()
        await createTimeSeriesFile()

        if (forecastedCandle === undefined) {
            SA.logger.info('Could not produce the object forecasted candle. Please check the config that you have a minimun of 3 labels: Candle Close, Max, Min and 1 Feature: Candle Open only with the option ON. Also check that your data mining operation is running and the files needed from it already exist before running the Test Server. ')
        }

        return forecastedCandle

        /*
        Function that creates the parameters file as CSV using the parameters object keys as column headers for easier accessing later in python.
        */
        function createParametersFile() {
            let parametersFile = ''
            let keys = Object.keys(testCase.parameters)
            for (let q = 0; q < keys.length; q++) {
                let key = keys[q]
                parametersFile += key + ' '
            }
            parametersFile = parametersFile.slice(0, -1)
            parametersFile += '\n'
            for (let q = 0; q < keys.length; q++) {
                let key = keys[q]
                parametersFile += testCase.parameters[key] + ' '
            }
            parametersFile = parametersFile.slice(0, -1)
            SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/OutputData/TestData/" + testCase.parametersFileName + ".CSV", parametersFile)
            if (testCase.filesTimestaps === undefined) {
                testCase.filesTimestaps = {}
            }
            testCase.filesTimestaps.parameters = (new Date()).toISOString()
        }

        async function createTimeSeriesFile() {
            /*
            Only create files with the same data once...
            */
            let currentFileHash
            let savedDataset = savedDatasets.get(testCase.timeSeriesFileName)
            if (savedDataset !== undefined) {
                forecastedCandle = savedDataset.forecastedCandle
                let timestamp = (new Date()).valueOf()
                /*
                If the file is not expired, then there is no need to run the process that
                generates it, since it will produce the same file.
                */
                if (timestamp < savedDataset.expiration) {
                    return forecastedCandle
                } else {
                    currentFileHash = savedDataset.fileHash
                }
            }
            /*
            Preparing the Time-Series File
            */
            let timeSeriesFile = ""
            let objectsMap = new Map()
            let indicatorsMap = new Map()
            let firstTimestamp
            let lastTimestamp
            let maxTimeFrameValue = 0

            await addTimeFramesAndAssets()
            createFileContent()
            saveTimeSeriesFile()

            async function addTimeFramesAndAssets() {
                for (let i = 0; i < TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.marketTimeFramesArray.length; i++) {
                    let timeFrameValue = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.marketTimeFramesArray[i][0]
                    let timeFrameLabel = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.marketTimeFramesArray[i][1]

                    if (timeFramesToInclude.includes(timeFrameLabel)) {
                        for (let j = 0; j < assetsToInclude.length; j++) {
                            let asset = assetsToInclude[j]
                            await addMarketFile(asset, timeFrameValue, timeFrameLabel)
                        }
                    }
                }

                async function addMarketFile(asset, timeFrameValue, timeFrameLabel) {
                    /*
                    We will put all the object we find in files at objectsMap to be later retrieved from there.
                    */
                    if (timeFrameValue > maxTimeFrameValue) (maxTimeFrameValue = timeFrameValue)

                    /*
                    Add Labels  
                    */
                    for (let q = 0; q < timeSeriesFileLabels.length; q++) {
                        let label = timeSeriesFileLabels[q]
                        await addToObjectMap(label)
                    }
                    /*
                    Add Features 
                    */
                    for (let q = 0; q < timeSeriesFileFeatures.length; q++) {
                        let feature = timeSeriesFileFeatures[q]
                        await addToObjectMap(feature)
                    }

                    async function addToObjectMap(featuresOrLabelsObject) {

                        if (featuresOrLabelsObject.dataMine === undefined) { return }
                        let parameterName = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getParameterName(featuresOrLabelsObject)
                        if (testCase.parameters[parameterName] !== 'ON') { return }

                        /*
                        We will avoid rebuilding the same indicator product more than once.
                        */
                        let indicatorKey = featuresOrLabelsObject.dataMine + '-' + featuresOrLabelsObject.indicator + '-' + featuresOrLabelsObject.product
                        let indicatorAlreadyProcessed = indicatorsMap.get(indicatorKey)
                        if (indicatorAlreadyProcessed !== undefined) { return }
                        /*
                        We will avoid requesting the same indicator file more than once because it is resource intensive.
                        */
                        let indicatorFileKey =
                            featuresOrLabelsObject.dataMine + '-' +
                            featuresOrLabelsObject.indicator + '-' +
                            featuresOrLabelsObject.product + '-' +
                            'binance' + '-' +
                            asset + '-' +
                            'USDT' + '-' +
                            'Multi-Time-Frame-Market' + '-' +
                            timeFrameLabel

                        let cachedIndicator = indicatorFileContentMap.get(indicatorFileKey)
                        if (cachedIndicator === undefined) {
                            cachedIndicator = {
                                fileContent: '',
                                expiration: 0
                            }
                        }
                        let now = (new Date()).valueOf()
                        let indicatorFileContent
                        if (cachedIndicator.expiration < now) {
                            /*
                            Request the File content to Superalgos Platform.
                            */
                            indicatorFileContent = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getIndicatorFile(
                                featuresOrLabelsObject.dataMine,
                                featuresOrLabelsObject.indicator,
                                featuresOrLabelsObject.product,
                                'binance',
                                asset,
                                'USDT',
                                'Multi-Time-Frame-Market',
                                timeFrameLabel
                            )
                            /*
                            Store the info received at the cache
                            */
                            cachedIndicator = {
                                fileContent: indicatorFileContent,
                                expiration: Math.trunc(((new Date()).valueOf()) / timeFrameValue) * timeFrameValue + timeFrameValue
                            }
                            indicatorFileContentMap.set(indicatorFileKey, cachedIndicator)
                        } else {
                            indicatorFileContent = cachedIndicator.fileContent
                        }

                        let indicatorFile

                        try {
                            indicatorFile = JSON.parse(indicatorFileContent)
                        } catch (err) {
                            SA.logger.error('Error parsing an indicator file. It seems that it does not have a valid JSON format. Check the file mentioned below for incorrect data values like undefined, infinite, NaN, and the like. If necesary fix the indicator or remove it from the configuration of the Test Server.')
                            SA.logger.error('indicatorFileKey = ' + indicatorFileKey)
                            SA.logger.error(err.stack)
                            throw(err)
                        }

                        if (featuresOrLabelsObject.product === "Candles") {
                            /*
                            First Candle and last Candle defines the First Timestamp and Last Timestamp
                            */
                            firstTimestamp = indicatorFile[0][4]
                            lastTimestamp = indicatorFile[indicatorFile.length - 1][4]
                        }

                        let dataMine = loadedDataMinesFilesMap.get(featuresOrLabelsObject.dataMine)
                        let recordDefinition = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getRecordDefinition(dataMine, featuresOrLabelsObject.indicator, featuresOrLabelsObject.product)

                        for (let j = 0; j < recordDefinition.length; j++) {
                            let recordProperty = recordDefinition[j]
                            try {
                                recordProperty.parsedConfig = JSON.parse(recordProperty.config)
                            } catch (err) {
                                SA.logger.error(err.stack)
                                continue
                            }
                        }

                        for (let i = 0; i < indicatorFile.length - 1; i++) {
                            let objectArray = indicatorFile[i]
                            let object = {}

                            for (let j = 0; j < recordDefinition.length; j++) {
                                let recordProperty = recordDefinition[j]
                                let config = recordProperty.parsedConfig
                                if (config.isCalculated === true) { continue }
                                object[config.codeName] = objectArray[j]
                            }

                            let key = asset + "-" + featuresOrLabelsObject.objectName + "-" + timeFrameLabel + "-" + object.begin
                            objectsMap.set(key, object)

                            if (featuresOrLabelsObject.product === "Candles") {
                                if (i === indicatorFile.length - 2 && mainTimeFrame === timeFrameLabel && mainAsset === asset) {
                                    forecastedCandle = {
                                        begin: object.begin,
                                        end: object.end,
                                        open: object.close
                                    }
                                }
                            }
                        }

                        indicatorsMap.set(indicatorKey, true)
                    }
                }
            }

            function createFileContent() {
                let timestamp = firstTimestamp
                let headerAdded = false
                /*
                Loop thorugh all the possible time slots, based on the main dependency that are candles.
                */
                while (timestamp <= lastTimestamp) {
                    let maxSubRecords = 0
                    let subRecords = []
                    let header = "TIMESTAMP"

                    for (let i = 0; i < TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.marketTimeFramesArray.length; i++) {
                        let timeFrameValue = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.marketTimeFramesArray[i][0]
                        let timeFrameLabel = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.marketTimeFramesArray[i][1]

                        if (timeFramesToInclude.includes(timeFrameLabel)) {

                            for (let j = 0; j < assetsToInclude.length; j++) {
                                let asset = assetsToInclude[j]
                                addToFile(asset, timeFrameValue, timeFrameLabel, timeSeriesFileLabels)
                            }
                            for (let j = 0; j < assetsToInclude.length; j++) {
                                let asset = assetsToInclude[j]
                                addToFile(asset, timeFrameValue, timeFrameLabel, timeSeriesFileFeatures)
                            }
                        }
                    }

                    if (subRecords.length === maxSubRecords) {
                        /*
                        Only once we add the File Header
                        */
                        if (headerAdded === false) {
                            timeSeriesFile = timeSeriesFile +
                                header +
                                "\r\n"
                            headerAdded = true
                        }
                        /*
                        Everytime we add a File Record
                        */
                        timeSeriesFile = timeSeriesFile +
                            timestamp
                        for (let i = 0; i < subRecords.length; i++) {
                            let subRecord = subRecords[i]
                            timeSeriesFile = timeSeriesFile +
                                subRecord
                        }
                        timeSeriesFile = timeSeriesFile +
                            "\r\n"
                    }

                    timestamp = timestamp + maxTimeFrameValue

                    function addToFile(asset, timeFrameValue, timeFrameLabel, featuresOrLabelsObjects) {
                        /*
                        This is the procedure that adds only all objects.
                        */
                        let keyTimestamp
                        let maxObjectsToAdd = maxTimeFrameValue / timeFrameValue
                        maxSubRecords = maxSubRecords + maxObjectsToAdd

                        for (let i = 0; i < maxObjectsToAdd; i++) {
                            keyTimestamp = timestamp + i * timeFrameValue

                            iterateOverFeaturesOrLabels()

                            function iterateOverFeaturesOrLabels() {

                                let subRecord = ""

                                for (let j = 0; j < featuresOrLabelsObjects.length; j++) {

                                    let featuresOrLabelsObject = featuresOrLabelsObjects[j]

                                    if (featuresOrLabelsObject.dataMine === undefined) { continue }
                                    let parameterName = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getParameterName(featuresOrLabelsObject)
                                    if (testCase.parameters[parameterName] !== 'ON') { continue }

                                    let propertyName = featuresOrLabelsObject.propertyName
                                    let objectName = featuresOrLabelsObject.objectName

                                    let objectKey = asset + "-" + objectName + "-" + timeFrameLabel + "-" + keyTimestamp
                                    let object = objectsMap.get(objectKey)

                                    if (object === undefined) {

                                        let dataMine = loadedDataMinesFilesMap.get(featuresOrLabelsObject.dataMine)
                                        let recordDefinition = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getRecordDefinition(dataMine, featuresOrLabelsObject.indicator, featuresOrLabelsObject.product)
                                        /*
                                        Set all the object properties to ZERO
                                        */
                                        object = {}
                                        for (let j = 0; j < recordDefinition.length; j++) {
                                            let recordProperty = recordDefinition[j]
                                            let config
                                            try {
                                                config = JSON.parse(recordProperty.config)
                                            } catch (err) {
                                                SA.logger.error(err.stack)
                                                continue
                                            }
                                            if (config.isCalculated === true) { continue }
                                            object[config.codeName] = 0
                                        }
                                    }
                                    if (objectName === 'candle' && (object.max === 0 || object.min === 0 || object.open === 0)) {
                                        /* We will discard records where these candle properties are zero */
                                        return
                                    }

                                    subRecord = subRecord +
                                        "   " + object[propertyName]

                                    header = header +
                                        "   " + asset + "-" + objectName.toUpperCase() + "-" + propertyName.toUpperCase() + "-" + timeFrameLabel.toUpperCase() + "-" + (i + 1)
                                }

                                if (subRecord !== "") {
                                    subRecords.push(subRecord)
                                }
                            }
                        }
                    }
                }
            }

            function saveTimeSeriesFile() {
                /*
                    We will save the file only if it is different from the previous one, and if we do,
                    we will remember the file saved, it's hash and we'll get for it a new expiration time.
                */
                let newFileHash = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.hash(timeSeriesFile)
                if (currentFileHash === undefined || currentFileHash !== newFileHash) {

                    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/OutputData/TestData/" + testCase.timeSeriesFileName + ".CSV", timeSeriesFile)
                    SA.logger.info('Dataset File Saved: ' + testCase.timeSeriesFileName)

                    savedDataset = {
                        fileHash: newFileHash,
                        forecastedCandle: forecastedCandle,
                        expiration: TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getExpiration(testCase)
                    }
                    savedDatasets.set(testCase.timeSeriesFileName, savedDataset)
                }
            }
        }
    }

    function getFiles(testCase) {
        let files = {}
        files.parameters = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/OutputData/TestData/" + testCase.parametersFileName + ".CSV")
        files.timeSeries = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/OutputData/TestData/" + testCase.timeSeriesFileName + ".CSV")
        return files
    }
}
