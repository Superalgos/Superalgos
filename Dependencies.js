exports.newDependencies = function newDependencies(BOT, DEBUG_MODULE, STATUS_REPORT, FILE_STORAGE, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Dependencies";

    let thisObject = {
        statusReports: new Map(),              
        initialize: initialize
    };

    /*

    During the process we will create a new History Record. This will go to the Context History file which essentially mantains an
    index of all the bots executions. This file will later be plotted by the bot s plotter on the timeline, allowing end users to
    know where there is information related to the actions taken by the bot.

    */

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

                let statusReportModule = STATUS_REPORT.newStatusReport(BOT, DEBUG_MODULE, FILE_STORAGE, UTILITIES);

                statusReportModule.initialize(pDependenciesConfig[i], pMonth, pYear, onInitilized);

                function onInitilized(err) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write("[ERROR] initialize -> onInitilized -> err = " + err.message);

                        if (alreadyCalledBack === false) {
                            callBackFunction(err);
                        } else {
                            alreadyCalledBack = true;
                        }
                        return;
                    }

                    statusReportModule.load(onLoad);
                }

                function onLoad(err) {

                    try {

                        switch (err.result) {
                            case global.DEFAULT_OK_RESPONSE.result: {
                                logger.write("[INFO] initialize -> onLoad -> Execution finished well -> bot = " + pDependenciesConfig[i].bot);

                                addReport();
                                return;
                            }
                            case global.CUSTOM_OK_RESPONSE.result: {  // We need to see if we can handle this.
                                logger.write("[ERROR] initialize -> onLoad -> err.message = " + err.message);

                                if (err.message === "Status Report was never created.") {

                                    logger.write("[ERROR] initialize -> onLoad -> err.message = " + err.message); 
                                    logger.write("[ERROR] initialize -> onLoad -> Report Not Found. -> bot = " + pDependenciesConfig[i].bot);
                                    addReport();
                                    return;
                                } else {

                                    logger.write("[WARN] initialize -> onLoad -> Response not understood.");

                                    if (alreadyCalledBack === false) {
                                        callBackFunction(err);
                                    } else {
                                        alreadyCalledBack = true;
                                    }
                                    return;
                                }
                            }
                            default:
                                {
                                    logger.write("[ERROR] initialize -> onLoad -> Operation Failed.");

                                    if (alreadyCalledBack === false) {
                                        callBackFunction(err);
                                    } else {
                                        alreadyCalledBack = true;
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

                    loadCount++;

                    let key;

                    if (pDependenciesConfig[i].dataSetSection === "Month") {
                        key = pDependenciesConfig[i].devTeam + "-" + pDependenciesConfig[i].bot + "-" + pDependenciesConfig[i].process + "-" + pDependenciesConfig[i].dataSetVersion + "-" + pYear + "-" + pMonth;
                    } else {
                        key = pDependenciesConfig[i].devTeam + "-" + pDependenciesConfig[i].bot + "-" + pDependenciesConfig[i].process + "-" + pDependenciesConfig[i].dataSetVersion;
                    }

                    thisObject.statusReports.set(key, statusReportModule);

                    if (loadCount === pDependenciesConfig.length) {
                        if (alreadyCalledBack === false) {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
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