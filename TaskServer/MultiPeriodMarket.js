exports.newMultiPeriodMarket = function newMultiPeriodMarket(bot, logger, UTILITIES, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const MODULE_NAME = "Multi Period Market";

    thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(logger);

    let statusDependencies;
    let dataDependencies;
    let datasets = [];
    let dataFiles = new Map();

    let botInstance;

    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, pStatusDependencies, pDataDependencies, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;
            dataDependencies = pDataDependencies;
            processConfig = pProcessConfig;

            for (let i = 0; i < dataDependencies.nodeArray.length; i++) {

                let key;
                let dataset;
                let dependency = dataDependencies.nodeArray[i];

                key = dependency.dataMine + "-" +
                    dependency.bot + "-" +
                    dependency.product + "-" +
                    dependency.dataSet + "-" +
                    dependency.dataSetVersion

                dataset = dataDependencies.dataSets.get(key);

                datasets.push(dataset);

            }

            let USER_BOT_MODULE = require("./IndicatorBot")

            botInstance = USER_BOT_MODULE.newIndicatorBot(bot, logger, UTILITIES, FILE_STORAGE);
            botInstance.initialize(callBackFunction);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        datasets = undefined
        dataFiles = undefined
        statusDependencies = undefined
        dataDependencies = undefined
        botInstance = undefined
        processConfig = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = bot.market;

            /* Context Variables */

            let contextVariables = {
                dateBeginOfMarket: undefined,       // Datetime of the first trade file in the whole market history.
                dateEndOfMarket: undefined          // Datetime of the last file available to be used as an input of this process.
            };

            if (processConfig.framework.startDate.fixedDate !== undefined) {

                /* The starting date is fixed, we will start from there. */

                contextVariables.dateBeginOfMarket = new Date(processConfig.framework.startDate.fixedDate);

            }

            if (processConfig.framework.endDate.fixedDate !== undefined) {

                /* The ending date is fixed, we will end there. */

                contextVariables.dateEndOfMarket = new Date(processConfig.framework.endDate.fixedDate);

            }

            processTimeFrames();

            function processTimeFrames() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> Entering function."); }

                try {

                    let n;

                    periodsLoop();

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoop -> Entering function."); }

                            /*

                            We will iterate through all posible periods.

                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            periodsLoopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoop -> err = "+ err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsLoopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> Entering function."); }

                            const timeFrame = global.marketFilesPeriods[n][0];
                            const timeFrameLabel = global.marketFilesPeriods[n][1];

                            let dependencyIndex = 0;
                            dataFiles = new Map;

                            dependencyLoopBody();

                            function dependencyLoopBody() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> Entering function."); }

                                    let dependency = dataDependencies.nodeArray[dependencyIndex];
                                    let dataset = datasets[dependencyIndex];

                                    getFile();

                                    function getFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getFile -> Entering function."); }

                                            let dateForPath = bot.processDatetime.getUTCFullYear() + '/' + utilities.pad(bot.processDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(bot.processDatetime.getUTCDate(), 2);
                                            let fileName = market.baseAsset + '_' + market.quotedAsset + ".json";

                                            let filePath
                                            if (dependency.dataSet === "Multi-Period-Market") {
                                                filePath = dependency.product + '/' + dependency.dataSet + "/" + timeFrameLabel;
                                            } else {
                                                filePath = dependency.product + '/' + dependency.dataSet + "/" + dateForPath;
                                            }
                                            dataset.getTextFile(filePath, fileName, onFileReceived);

                                            function onFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> text = " + text); }

                                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = "+ err.stack);
                                                        callBackFunction(err);
                                                        return;
                                                    }

                                                    let dataFile = JSON.parse(text);
                                                    dataFiles.set(dependency.id, dataFile);

                                                    dependencyControlLoop();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = "+ err.stack);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> dependencyLoopBody -> getFile -> err = "+ err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoop -> dependencyLoopBody -> err = "+ err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function dependencyControlLoop() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> dependencyControlLoop -> Entering function."); }

                                    dependencyIndex++;

                                    if (dependencyIndex < dataDependencies.nodeArray.length) {

                                        dependencyLoopBody();

                                    } else {

                                        callTheBot();

                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> dependencyControlLoop -> err = "+ err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function callTheBot() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> callTheBot -> Entering function."); }

                                    const timeFrame = global.marketFilesPeriods[n][0];
                                    const timeFrameLabel = global.marketFilesPeriods[n][1];

                                    botInstance.start(
                                        dataFiles,
                                        timeFrame,
                                        timeFrameLabel,
                                        undefined,
                                        undefined,
                                        onBotFinished);

                                    function onBotFinished(err) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsLoopBody -> callTheBot -> onBotFinished -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                callBackFunction(err);
                                                return;
                                            }

                                            periodsControlLoop();
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> callTheBot -> onBotFinished -> err = "+ err.stack);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch(err){
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> callTheBot -> err = "+ err.stack);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsLoopBody -> err = "+ err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsControlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimeFrames -> periodsControlLoop -> Entering function."); }

                            n++;

                            if (n < global.marketFilesPeriods.length) {

                                periodsLoopBody();

                            } else {

                                writeStatusReport(callBackFunction);

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> periodsControlLoop -> err = "+ err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> processTimeFrames -> err = "+ err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> Entering function."); }

                try {

                    let reportKey = bot.dataMine + "-" + bot.codeName + "-" + "Multi-Period-Market" + "-" + "dataSet.V1";
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.processDatetime;
                    thisReport.save(callBack);

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = "+ err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }

        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
