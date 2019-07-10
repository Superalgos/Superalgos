exports.newStatusDependencies = function newStatusDependencies(BOT, logger, STATUS_REPORT, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Status Dependencies";

    let thisObject = {
        config: undefined,
        statusReports: new Map(),
        initialize: initialize,
        keys: []
    };

    return thisObject;

    function initialize(pStatusDependenciesConfig, pMonth, pYear, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            thisObject.config = pStatusDependenciesConfig;

            /*

            For each dependency declared at the bot config, we will initialize the status report, and load it as part of this initialization process.

            */
            let alreadyCalledBack = false;
            let loadCount = 0;

            for (let i = 0; i < pStatusDependenciesConfig.length; i++) {

                let statusReportModule = STATUS_REPORT.newStatusReport(BOT, logger, UTILITIES);

                statusReportModule.initialize(pStatusDependenciesConfig[i], pMonth, pYear, onInitilized);

                function onInitilized(err) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err = ", err);

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

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> onLoad -> Execution finished well. -> bot = " + pStatusDependenciesConfig[i].bot); }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> onLoad -> Execution finished well. -> process = " + pStatusDependenciesConfig[i].process); }

                                addReport();
                                return;
                            }
                            case "Status Report was never created.": {

                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> err.message = " + err.message);
                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> Report Not Found. -> bot = " + pStatusDependenciesConfig[i].bot);
                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> Report Not Found. -> process = " + pStatusDependenciesConfig[i].process);
                                addReport();
                                return;
                            }

                            case "Status Report is corrupt.": {

                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> err.message = " + err.message);
                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> Report Not Found. -> bot = " + pStatusDependenciesConfig[i].bot);
                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> Report Not Found. -> process = " + pStatusDependenciesConfig[i].process);
                                addReport();
                                return;
                            }
                            default:
                                {
                                    logger.write(MODULE_NAME, "[ERROR] initialize -> onLoad -> Operation Failed.");

                                    if (alreadyCalledBack === false) {
                                        alreadyCalledBack = true;
                                        callBackFunction(err);
                                    }
                                    return;
                                }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] initialize -> onLoad -> err = ", err);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function addReport() {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Entering function."); }

                    loadCount++;

                    let key;

                    if (pStatusDependenciesConfig[i].dataSetSection === "Month") {
                        key = pStatusDependenciesConfig[i].devTeam + "-" + pStatusDependenciesConfig[i].bot + "-" + pStatusDependenciesConfig[i].process + "-" + pStatusDependenciesConfig[i].dataSetVersion + "-" + pYear + "-" + pMonth;
                    } else {
                        key = pStatusDependenciesConfig[i].devTeam + "-" + pStatusDependenciesConfig[i].bot + "-" + pStatusDependenciesConfig[i].process + "-" + pStatusDependenciesConfig[i].dataSetVersion;
                    }

                    thisObject.keys.push(key);
                    thisObject.statusReports.set(key, statusReportModule);

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Report added to Map. -> key = " + key); }

                    if (loadCount === pStatusDependenciesConfig.length) {
                        if (alreadyCalledBack === false) {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                    }
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = ", err);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};
