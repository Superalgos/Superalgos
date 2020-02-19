exports.newProcessOutput = function newProcessOutput(BOT, logger) {

    /*
    Here we emit the events that signals that a Dataset was updated.
    */

    const MODULE_NAME = "Process Output";

    let bot = BOT;

    let thisObject = {
        raiseEvents, raiseEvents
    };

    return thisObject;

    function raiseEvents(statusDependencies, callBackFunction) {

        try {
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] raiseEvents -> Entering function."); }

            /* We will reaise the events for the datasets impacted by the process that just finished. */

            if (bot.processNode.referenceParent.processOutput !== undefined) {
                if (bot.processNode.referenceParent.processOutput.outputDatasets !== undefined) {
                    let outputDatasets = bot.processNode.referenceParent.processOutput.outputDatasets

                    for (let j = 0; j < outputDatasets.length; j++) {
                        let outputDataset = outputDatasets[j]

                        /* Some validations to verify that everything is in place. */
                        if (outputDataset.referenceParent !== undefined) {
                            if (outputDataset.referenceParent.code.codeName === undefined) {
                                logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Dataset Definition not defined. Dataset Definition = " + JSON.stringify(outputDataset.referenceParent));
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return
                            } 
                            if (outputDataset.referenceParent.parentNode !== undefined) {
                                if (outputDataset.referenceParent.parentNode.code.codeName === undefined) {
                                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Product not defined. Product = " + JSON.stringify(outputDataset.referenceParent.parentNode));
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return
                                } 
                                if (outputDataset.referenceParent.parentNode.parentNode !== undefined) {
                                    if (outputDataset.referenceParent.parentNode.parentNode.code.codeName === undefined) {
                                        logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Bot not defined. Bot = " + JSON.stringify(outputDataset.referenceParent.parentNode.parentNode));
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return
                                    } 
                                    if (outputDataset.referenceParent.parentNode.parentNode.parentNode !== undefined) {
                                        if (outputDataset.referenceParent.parentNode.parentNode.parentNode.code.codeName === undefined) {
                                            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Data Mine not defined. Data Mine = " + JSON.stringify(outputDataset.referenceParent.parentNode.parentNode.parentNode));
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return
                                        }                                        
                                    } else {
                                        logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Bot not attached to a Data Mine. Bot = " + JSON.stringify(outputDataset.referenceParent.parentNode.parentNode));
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return
                                    }
                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Product not attached to a Bot. Product = " + JSON.stringify(outputDataset.referenceParent.parentNode));
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return
                                }
                            } else {
                                logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Dataset Definition not attached to a Product. Dataset Definition = " + JSON.stringify(outputDataset.referenceParent));
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return
                            }
                        } else {
                            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Output Dataset with no reference to a Dataset Definition. Output Dataset = " + JSON.stringify(outputDataset));
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return
                        }

                        /* All good, lets emit the event. */

                        let dataMine = outputDataset.referenceParent.parentNode.parentNode.parentNode.code.codeName
                        let botName = outputDataset.referenceParent.parentNode.parentNode.code.codeName
                        let product = outputDataset.referenceParent.parentNode.code.codeName
                        let dataset = outputDataset.referenceParent.code.codeName

                        let statusReport = statusDependencies.reportsByMainUtility.get("Self Reference")

                        key = dataMine + "-" + botName + "-" + product + "-" + dataset
                        let event = {
                            lastFile: statusReport.file.lastFile
                        }
                        global.SYSTEM_EVENT_HANDLER.createEventHandler(key, 'Dataset Updated')
                        global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Dataset Updated', event)

                    }
                }
            }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
