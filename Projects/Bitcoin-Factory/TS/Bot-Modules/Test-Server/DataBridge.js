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

    return thisObject

    function initialize() {
        savedDatasets = new Map()

        /*
        Create Missing Folders, if needed.
        */
        let dir
        dir = './StateData/TestCases'
        if (!SA.nodeModules.fs.existsSync(dir)) {
            SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
        }

        dir = './StateData/ForecastCases'
        if (!SA.nodeModules.fs.existsSync(dir)) {
            SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
        }

        dir = './OutputData/TestData'
        if (!SA.nodeModules.fs.existsSync(dir)) {
            SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
        }

        dir = './OutputData/TestReports'
        if (!SA.nodeModules.fs.existsSync(dir)) {
            SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
        }
    }

    function finalize() {

    }

    async function updateDatasetFiles(testCase) {
        let forcastedCandle
        let mainTimeFrame = testCase.parameters.LIST_OF_TIMEFRAMES[0]
        let mainAsset = testCase.parameters.LIST_OF_ASSETS[0]
        let assetsToInclude = testCase.parameters.LIST_OF_ASSETS
        let timeFramesToInclude = testCase.parameters.LIST_OF_TIMEFRAMES
        let testCaseId = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.pad(testCase.id, 5)

        createParametersFile()
        await createTimeSeriesFile()

        return forcastedCandle

        function createParametersFile() {
            /*
            We will prevent creating a parameters file more than once.
            */
            if (testCase.filesTimestaps !== undefined && testCase.filesTimestaps.parameters !== undefined) {
                return
            }
            /*
            Prepering the Parameters File
            */
            let parametersFile = ""

            parametersFile = parametersFile +
                /* Headers */
                "PARAMETER" + "   " + "VALUE" + "\r\n" +
                /* Values */
                "LIST_OF_ASSETS" + "   " + testCase.parameters.LIST_OF_ASSETS + "\r\n" +
                "LIST_OF_TIMEFRAMES" + "   " + testCase.parameters.LIST_OF_TIMEFRAMES + "\r\n" +
                "NUMBER_OF_INDICATORS_PROPERTIES" + "   " + testCase.parameters.NUMBER_OF_INDICATORS_PROPERTIES + "\r\n" +
                "NUMBER_OF_LAG_TIMESTEPS" + "   " + testCase.parameters.NUMBER_OF_LAG_TIMESTEPS + "\r\n" +
                "NUMBER_OF_ASSETS" + "   " + testCase.parameters.NUMBER_OF_ASSETS + "\r\n" +
                "NUMBER_OF_LABELS" + "   " + testCase.parameters.NUMBER_OF_LABELS + "\r\n" +
                "PERCENTAGE_OF_DATASET_FOR_TRAINING" + "   " + testCase.parameters.PERCENTAGE_OF_DATASET_FOR_TRAINING + "\r\n" +
                "NUMBER_OF_FEATURES" + "   " + testCase.parameters.NUMBER_OF_FEATURES + "\r\n" +
                "NUMBER_OF_EPOCHS" + "   " + testCase.parameters.NUMBER_OF_EPOCHS + "\r\n" +
                "NUMBER_OF_LSTM_NEURONS" + "   " + testCase.parameters.NUMBER_OF_LSTM_NEURONS + "\r\n"
            SA.nodeModules.fs.writeFileSync("./OutputData/TestData/parameters-" + testCaseId + ".CSV", parametersFile)

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
                forcastedCandle = savedDataset.forcastedCandle
                let timestamp = (new Date()).valueOf()
                /*
                If the file is not expired, then there is no need to run the process that
                generates it, since it will produce the same file.
                */
                if (timestamp < savedDataset.expiration) {
                    return forcastedCandle
                } else {
                    currentFileHash = savedDataset.fileHash
                }
            }
            /*
            Preparing the Time-Series File
            */
            let timeSeriesFile = ""
            let objectsMap = new Map()
            let firstTimestamp
            let lastTimestamp
            let maxTimeFrameValue = 0

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

            createFileContent()

            /*
                We will save the file only if it is different from the previous one, and if we do,
                we will remember the file saved, it's hash and we'll get for it a new expiration time.
            */
            let newFileHash = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.hash(timeSeriesFile)
            if (currentFileHash === undefined || currentFileHash !== newFileHash) {

                SA.nodeModules.fs.writeFileSync("./OutputData/TestData/" + testCase.timeSeriesFileName + ".CSV", timeSeriesFile)
                console.log((new Date()).toISOString(), 'Dataset File Saved: ' + testCase.timeSeriesFileName)

                savedDataset = {
                    fileHash: newFileHash,
                    forcastedCandle: forcastedCandle,
                    expiration: TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getExpiration(testCase)
                }
                savedDatasets.set(testCase.timeSeriesFileName, savedDataset)
            }

            async function addMarketFile(asset, timeFrameValue, timeFrameLabel) {

                if (timeFrameValue > maxTimeFrameValue) (maxTimeFrameValue = timeFrameValue)

                let candlesFileContent = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getIndicatorFile(
                    'Candles',
                    'Candles-Volumes',
                    'Candles',
                    'binance',
                    asset,
                    'USDT',
                    'Multi-Time-Frame-Market',
                    timeFrameLabel
                )

                let candlesFile = JSON.parse(candlesFileContent)
                /*
                First Candle and last Candle defines the First Timestamp and Last Timestamp
                */
                firstTimestamp = candlesFile[0][4]
                lastTimestamp = candlesFile[candlesFile.length - 1][4]

                for (let i = 0; i < candlesFile.length - 1; i++) {
                    let candleArray = candlesFile[i]
                    let candle = {
                        min: candleArray[0],
                        max: candleArray[1],
                        open: candleArray[2],
                        close: candleArray[3],
                        begin: candleArray[4],
                        end: candleArray[5]
                    }

                    let key = asset + "-" + "candle" + "-" + timeFrameLabel + "-" + candle.begin
                    objectsMap.set(key, candle)

                    if (i === candlesFile.length - 2 && mainTimeFrame === timeFrameLabel && mainAsset === asset) {
                        forcastedCandle = {
                            begin: candle.begin,
                            end: candle.end,
                            open: candle.close
                        }
                    }
                }

                let volumesFileContent = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getIndicatorFile(
                    'Candles',
                    'Candles-Volumes',
                    'Volumes',
                    'binance',
                    asset,
                    'USDT',
                    'Multi-Time-Frame-Market',
                    timeFrameLabel
                )

                let volumesFile = JSON.parse(volumesFileContent)

                for (let i = 0; i < volumesFile.length - 1; i++) {
                    let volumeArray = volumesFile[i]
                    let volume = {
                        total: volumeArray[0] + volumeArray[1],
                        begin: volumeArray[2],
                        end: volumeArray[3]
                    }

                    let key = asset + "-" + "volume" + "-" + timeFrameLabel + "-" + volume.begin
                    objectsMap.set(key, volume)
                }
            }

            function createFileContent() {
                let timestamp = firstTimestamp
                let headerAdded = false

                while (timestamp <= lastTimestamp) {
                    let maxSubRecords = 0
                    let subRecords = []
                    let header = "Timestamp"

                    for (let i = 0; i < TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.marketTimeFramesArray.length; i++) {
                        let timeFrameValue = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.marketTimeFramesArray[i][0]
                        let timeFrameLabel = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.marketTimeFramesArray[i][1]

                        if (timeFramesToInclude.includes(timeFrameLabel)) {

                            for (let j = 0; j < assetsToInclude.length; j++) {
                                let asset = assetsToInclude[j]
                                addToFile(asset, timeFrameValue, timeFrameLabel, 'Labels')
                            }
                            for (let j = 0; j < assetsToInclude.length; j++) {
                                let asset = assetsToInclude[j]
                                addToFile(asset, timeFrameValue, timeFrameLabel, 'Features')
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

                    function addToFile(asset, timeFrameValue, timeFrameLabel, featuresOrLabels) {
                        /*
                        This is the procedure that adds only all objects.
                        */
                        let keyTimestamp
                        let maxObjectsToAdd = maxTimeFrameValue / timeFrameValue
                        maxSubRecords = maxSubRecords + maxObjectsToAdd

                        for (let i = 0; i < maxObjectsToAdd; i++) {
                            keyTimestamp = timestamp + i * timeFrameValue
                            /*
                            Candles
                            */
                            let candleKey = asset + "-" + "candle" + "-" + timeFrameLabel + "-" + keyTimestamp
                            let candle = objectsMap.get(candleKey)

                            if (candle === undefined) {
                                candle = {
                                    min: 0,
                                    max: 0,
                                    open: 0,
                                    close: 0,
                                    begin: 0,
                                    end: 0
                                }
                            }
                            /*
                            Volumes
                            */
                            let volumeKey = asset + "-" + "volume" + "-" + timeFrameLabel + "-" + keyTimestamp
                            let volume = objectsMap.get(volumeKey)

                            if (volume === undefined) {
                                volume = {
                                    total: 0,
                                    begin: 0,
                                    end: 0
                                }
                            }
                            /*
                            Create a new Output Record to be saved at the output file
                            */
                            if (candle.max !== 0 && candle.min !== 0 && candle.open !== 0) {

                                switch (featuresOrLabels) {
                                    case 'Features': {
                                        let subRecord =
                                            "   " + candle.open +
                                            "   " + candle.close +
                                            "   " + volume.total

                                        subRecords.push(subRecord)

                                        header = header +
                                            "   " + asset + "-" + "candle.open" + "-" + timeFrameLabel + "-" + (i + 1) +
                                            "   " + asset + "-" + "candle.close" + "-" + timeFrameLabel + "-" + (i + 1) +
                                            "   " + asset + "-" + "volume.total" + "-" + timeFrameLabel + "-" + (i + 1)
                                        break
                                    }
                                    case 'Labels': {
                                        let subRecord =
                                            "   " + candle.max +
                                            "   " + candle.min

                                        subRecords.push(subRecord)

                                        header = header +
                                            "   " + asset + "-" + "candle.max" + "-" + timeFrameLabel + "-" + (i + 1) +
                                            "   " + asset + "-" + "candle.min" + "-" + timeFrameLabel + "-" + (i + 1)
                                        break
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function getFiles(testCase) {
        let testCaseId = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.pad(testCase.id, 5)
        let files = {}
        files.parameters = SA.nodeModules.fs.readFileSync("./OutputData/TestData/parameters-" + testCaseId + ".CSV")
        files.timeSeries = SA.nodeModules.fs.readFileSync("./OutputData/TestData/" + testCase.timeSeriesFileName + ".CSV")
        return files
    }
}
