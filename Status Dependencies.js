exports.newStatusDependencies = function newStatusDependencies(BOT, DEBUG_MODULE, STATUS_REPORT, BLOB_STORAGE, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Dependencies";

    let thisObject = {
        statusReports: new Map(),              
        initialize: initialize,
        keys: []
    };

    let bot = BOT;
    let ownerBot;                       // This is the bot owner of the Status Report. Only owners can save the report and override the existing content.

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    return thisObject;

    function initialize(pDependenciesConfig, pMonth, pYear, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            /*

            For each dependency declared at the bot config, we will initialize the status report, and load it as part of this initialization process.

            */
            let alreadyCalledBack = false;
            let loadCount = 0;

            for (let i = 0; i < pDependenciesConfig.length; i++) {

                let statusReportModule = STATUS_REPORT.newStatusReport(BOT, DEBUG_MODULE, BLOB_STORAGE, UTILITIES);

                statusReportModule.initialize(pDependenciesConfig[i], pMonth, pYear, onInitilized);

                function onInitilized(err) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write("[ERROR] initialize -> onInitilized -> err = " + err.message);

                        alreadyCalledBack = true;
                        callBackFunction(err);
                        return;
                    }

                    statusReportModule.load(onLoad);
                }

                function onLoad(err) {

                    try {

                        statusReportModule.status = err.message;

                        switch (err.message) {
                            case global.DEFAULT_OK_RESPONSE.message: {
                                logger.write("[INFO] initialize -> onLoad -> Execution finished well. -> bot = " + pDependenciesConfig[i].bot);
                                logger.write("[INFO] initialize -> onLoad -> Execution finished well. -> process = " + pDependenciesConfig[i].process);

                                addReport();
                                return;
                            }
                            case "Status Report was never created.": {

                                logger.write("[WARN] initialize -> onLoad -> err.message = " + err.message);
                                logger.write("[WARN] initialize -> onLoad -> Report Not Found. -> bot = " + pDependenciesConfig[i].bot);
                                logger.write("[WARN] initialize -> onLoad -> Report Not Found. -> process = " + pDependenciesConfig[i].process);
                                addReport();
                                return;
                            }

                            case "Status Report is corrupt.": {

                                logger.write("[WARN] initialize -> onLoad -> err.message = " + err.message);
                                logger.write("[WARN] initialize -> onLoad -> Report Not Found. -> bot = " + pDependenciesConfig[i].bot);
                                logger.write("[WARN] initialize -> onLoad -> Report Not Found. -> process = " + pDependenciesConfig[i].process);
                                addReport();
                                return;
                            }
                            default:
                                {
                                    logger.write("[ERROR] initialize -> onLoad -> Operation Failed.");

                                    if (alreadyCalledBack === false) {
                                        alreadyCalledBack = true;
                                        callBackFunction(err);
                                    }
                                    return;
                                }
                        }
                    }
                    catch (err) {
                        logger.write("[ERROR] initialize -> onLoad -> err = " + err.message);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function addReport() {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> addReport -> Entering function."); }

                    loadCount++;

                    let key;

                    if (pDependenciesConfig[i].dataSetSection === "Month") {
                        key = pDependenciesConfig[i].devTeam + "-" + pDependenciesConfig[i].bot + "-" + pDependenciesConfig[i].process + "-" + pDependenciesConfig[i].dataSetVersion + "-" + pYear + "-" + pMonth;
                    } else {
                        key = pDependenciesConfig[i].devTeam + "-" + pDependenciesConfig[i].bot + "-" + pDependenciesConfig[i].process + "-" + pDependenciesConfig[i].dataSetVersion;
                    }

                    thisObject.keys.push(key);
                    thisObject.statusReports.set(key, statusReportModule);

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> addReport -> Report added to Map. -> key = " + key); }

                    if (loadCount === pDependenciesConfig.length) {
                        if (alreadyCalledBack === false) {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                    }
                }
            }

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};