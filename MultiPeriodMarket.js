exports.newMultiPeriodMarket = function newMultiPeriodMarket(bot, logger, UTILITIES, FILE_STORAGE) {
    const MODULE_NAME = "Multi Period Market";
    thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(logger)

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

                    let dependencyIndex = 0;
                    dataFiles = new Map;

                    dependencyLoopBody()

                    function dependencyLoopBody() {
                        let dependency = dataDependenciesModule.nodeArray[dependencyIndex]
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]

                        getFile()

                        function getFile() {
                            let dateForPath = bot.processDatetime.getUTCFullYear() + '/' + utilities.pad(bot.processDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(bot.processDatetime.getUTCDate(), 2)
                            let fileName = "Data.json";

                            let filePath
                            if (dependency.referenceParent.config.codeName === "Multi-Period-Market") {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel;
                            } else {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + dateForPath;
                            }
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
                        writeStatusReport(callBackFunction)
                    }
                }
            }

            function writeStatusReport(callBack) {
                let reportKey = bot.dataMine + "-" + bot.codeName + "-" + "Multi-Period-Market"
                let thisReport = statusDependencies.statusReports.get(reportKey)

                thisReport.file.lastExecution = bot.processDatetime;
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
