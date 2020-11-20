exports.newMultiPeriodMarket = function newMultiPeriodMarket(bot, logger, UTILITIES, FILE_STORAGE) {
    const MODULE_NAME = "Multi Period Market";
    thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(logger)
    let fileStorage = FILE_STORAGE.newFileStorage(logger)

    let statusDependencies;
    let dataDependenciesModule;
    let dataFiles = new Map()
    let indicatorOutputModule;
    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, pStatusDependencies, pDataDependencies, callBackFunction) {
        logger.fileName = MODULE_NAME;
        logger.initialize()

        statusDependencies = pStatusDependencies;
        dataDependenciesModule = pDataDependencies;
        processConfig = pProcessConfig;

        let INDICATOR_OUTPUT_MODULE = require("./IndicatorOutput")

        indicatorOutputModule = INDICATOR_OUTPUT_MODULE.newIndicatorOutput(bot, logger, UTILITIES, FILE_STORAGE)
        indicatorOutputModule.initialize(callBackFunction)
    }

    function finalize() {
        fileStorage = undefined
        dataFiles = undefined
        statusDependencies = undefined
        dataDependenciesModule = undefined
        indicatorOutputModule = undefined
        processConfig = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {
        try {
            processTimeFrames()

            function processTimeFrames() {
                let n;
                timeFramesLoop()

                function timeFramesLoop() {
                    /* We will iterate through all posible timeFrames.*/
                    n = 0   // loop Variable representing each possible period as defined at the timeFrames array.
                    timeFramesLoopBody()
                }

                function timeFramesLoopBody() {
                    const timeFrame = global.marketFilesPeriods[n][0]
                    const timeFrameLabel = global.marketFilesPeriods[n][1]

                    /* Check Time Frames Filter */
                    if (bot.marketTimeFrames !== undefined) {
                        if (bot.marketTimeFrames.includes(timeFrameLabel) === false) {
                            /* We are not going to process this Time Frame */
                            timeFramesControlLoop()
                            return
                        }
                    }

                    let dependencyIndex = 0;
                    dataFiles = new Map;

                    dependencyLoopBody()

                    function dependencyLoopBody() {
                        let dependency = dataDependenciesModule.nodeArray[dependencyIndex]
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]

                        getFile()

                        function getFile() {
                            let fileName = "Data.json";
                            let filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel;
                            datasetModule.getTextFile(filePath, fileName, onFileReceived)

                            function onFileReceived(err, text) {
                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = " + err.stack)
                                    callBackFunction(err)
                                    return;
                                }

                                let dataFile = JSON.parse(text)
                                dataFiles.set(dependency.id, dataFile)

                                dependencyControlLoop()
                            }
                        }
                    }

                    function dependencyControlLoop() {
                        dependencyIndex++;
                        if (dependencyIndex < dataDependenciesModule.nodeArray.length) {
                            dependencyLoopBody()
                        } else {
                            generateOutput()
                        }

                        function generateOutput() {
                            indicatorOutputModule.start(
                                dataFiles,
                                timeFrame,
                                timeFrameLabel,
                                undefined,
                                undefined,
                                onOutputGenerated)

                            function onOutputGenerated(err) {
                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    callBackFunction(err)
                                    return;
                                }
                                timeFramesControlLoop()
                            }
                        }
                    }
                }

                function timeFramesControlLoop() {
                    n++;
                    if (n < global.marketFilesPeriods.length) {
                        timeFramesLoopBody()
                    } else {
                        writeTimeFramesFiles(onTimeFrameFilesWritten)
                        function onTimeFrameFilesWritten() {
                            writeStatusReport(callBackFunction)
                        }
                    }
                }
            }

            function writeTimeFramesFiles(callBack) {
                let outputDatasets = global.NODE_BRANCH_TO_ARRAY (bot.processNode.referenceParent.processOutput, 'Output Dataset')
                let outputDatasetIndex = -1;
                controlLoop()

                function productLoopBody() {
                    let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                    writeTimeFramesFile(productCodeName, controlLoop)
                }

                function controlLoop() {
                    outputDatasetIndex++
                    if (outputDatasetIndex < outputDatasets.length) {
                        productLoopBody()
                    } else {
                        callBack()
                    }
                }
            }

            function writeTimeFramesFile(productCodeName, callBack) {

                let timeFramesArray = []
                for (let n = 0; n < global.marketFilesPeriods.length; n++) {
                    let timeFrameLabel = global.marketFilesPeriods[n][1]

                    /* Check Time Frames Filter */
                    if (bot.marketTimeFrames !== undefined) {
                        if (bot.marketTimeFrames.includes(timeFrameLabel) === true) {
                            timeFramesArray.push(timeFrameLabel)
                        }
                    } else {
                        timeFramesArray.push(timeFrameLabel)
                    }
                }

                let fileContent = JSON.stringify(timeFramesArray)
                let fileName = '/Time.Frames.json';
                let filePath = bot.filePathRoot + "/Output/" + productCodeName + "/" + bot.process + fileName;

                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                function onFileCreated(err) {
                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeTimeFramesFile -> onFileCreated -> err = " + err.stack)
                        callBack(err)
                        return
                    }
                    callBack()
                }
            }

            function writeStatusReport(callBack) {
                let reportKey = bot.dataMine + "-" + bot.codeName + "-" + "Multi-Period-Market"
                let thisReport = statusDependencies.statusReports.get(reportKey)

                thisReport.file.lastExecution = bot.processDatetime;
                if (bot.marketTimeFrames !== undefined) {
                    thisReport.file.timeFrames = bot.marketTimeFrames
                }
                thisReport.save(callBack)

                if (global.areEqualDates(bot.processDatetime, new Date()) === false) {
                    logger.newInternalLoop(bot.codeName, bot.process, bot.processDatetime)
                }

                /*  Telling the world we are alive and doing well */
                let currentDateString = bot.processDatetime.getUTCFullYear() + '-' + utilities.pad(bot.processDatetime.getUTCMonth() + 1, 2) + '-' + utilities.pad(bot.processDatetime.getUTCDate(), 2)
                let currentDate = new Date(bot.processDatetime)
                let lastDate = new Date()
                bot.processHeartBeat(currentDateString, global.getPercentage(currentDate, currentDate, lastDate))
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack)
            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }
}
