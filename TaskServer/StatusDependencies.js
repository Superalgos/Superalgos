exports.newStatusDependencies = function (processIndex, BOT, logger, STATUS_REPORT, UTILITIES, PROCESS_OUTPUT) {

    const MODULE_NAME = "Status Dependencies";

    let bot = BOT

    let thisObject = {
        nodeArray: undefined,
        statusReports: new Map(),
        reportsByMainUtility: new Map(),
        initialize: initialize,
        finalize: finalize,
        keys: []
    };

    return thisObject;

    function initialize(callBackFunction) {
        try {
            /* Basic Valdidations */
            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies !== undefined) {
                if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies.statusDependencies !== undefined) {
                    thisObject.nodeArray = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies.statusDependencies
                } else {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have status dependencies at all.");
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                    return
                }
            } else {
                logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have process dependencies, which means not status dependencies.");
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                return
            }

            /*For each dependency we will initialize the status report, and load it as part of this initialization process.*/

            let alreadyCalledBack = false;
            let loadCount = 0;
            let dependenciesToProcess = []
            for (let i = 0; i < thisObject.nodeArray.length; i++) {
                let statusDependency = {
                    dependency: thisObject.nodeArray[i]
                }

                dependenciesToProcess.push(statusDependency)

            }

            for (let i = 0; i < dependenciesToProcess.length; i++) {

                let statusReportModule = STATUS_REPORT.newStatusReport(processIndex, BOT, logger, UTILITIES, PROCESS_OUTPUT);

                logger.write(MODULE_NAME, "[INFO] initialize -> onInitilized -> Initializing Status Report # " + (i + 1));
                let statusDependency = dependenciesToProcess[i]
                statusReportModule.initialize(statusDependency.dependency, onInitilized);

                function onInitilized(err) {

                    logger.write(MODULE_NAME, "[INFO] initialize -> onInitilized -> Initialized Status Report # " + (i + 1));

                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        if (alreadyCalledBack === false) {
                            logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err = " + err.stack);
                            logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err.message = " + err.message);
                            alreadyCalledBack = true;
                            callBackFunction(err);
                        } else {
                            logger.write(MODULE_NAME, "[WARN] initialize -> Can not call back because I already did.")
                        }
                        return;
                    }

                    logger.write(MODULE_NAME, "[INFO] initialize -> onInitilized -> Loading Status Report # " + (i + 1));
                    statusReportModule.load(onLoad);
                }

                function onLoad(err) {

                    try {
                        logger.write(MODULE_NAME, "[INFO] initialize -> onLoad -> Loaded Status Report # " + (i + 1));
                        statusReportModule.status = err.message;

                        switch (err.message) {
                            case TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.message: {
                                addReport();
                                return;
                            }
                            case "Status Report was never created.": {

                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> Report Not Found. -> Status Dependency = " + JSON.stringify(statusDependency.dependency))

                                addReport();
                                return;
                            }

                            case "Status Report is corrupt.": {

                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> Report Not Found. -> Status Dependency = " + JSON.stringify(statusDependency.dependency))

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
                        logger.write(MODULE_NAME, "[ERROR] initialize -> onLoad -> err = " + err.stack);
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function addReport() {

                    logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Entering function.")
                    logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Adding Status Report # " + (i + 1));

                    loadCount++;
                    logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Total Added = " + loadCount);

                    let key = statusDependency.dependency.dataMine + "-" + statusDependency.dependency.bot + "-" + statusDependency.dependency.process

                    thisObject.keys.push(key);
                    thisObject.statusReports.set(key, statusReportModule);

                    if (statusReportModule.mainUtility !== undefined) {
                        thisObject.reportsByMainUtility.set(statusReportModule.mainUtility, statusReportModule)
                    }

                    logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Report added to Map. -> key = " + key)

                    if (loadCount === dependenciesToProcess.length) {
                        if (alreadyCalledBack === false) {
                            alreadyCalledBack = true
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                            return;
                        } else {
                            logger.write(MODULE_NAME, "[WARN] initialize -> addReport -> Can not call back because I already did.")
                        }
                    }
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        thisObject.statusReports.forEach(forEachStatusDependency)
        function forEachStatusDependency(statusDependency) {
            statusDependency.finalize()
        }
        thisObject.statusReports = undefined
        bot = undefined
        thisObject = undefined
    }
};
