exports.newProcessOutput = function newProcessOutput(BOT, logger) {

    /*
    Here we emit the events that signals that a Dataset was updated.
    */

    const MODULE_NAME = "Process Output";

    let bot = BOT;

    let thisObject = {
        raiseEvents: raiseEvents,
        asyncRaiseEvents: asyncRaiseEvents
    };

    return thisObject;

    function raiseEvents(lastFile, timeFrames, callBackFunction) {
        try {
            /* We will reaise the events for the datasets impacted by the process that just finished. */

            if (bot.processNode.referenceParent.processOutput !== undefined) {
                let outputDatasets = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(bot.processNode.referenceParent.processOutput, 'Output Dataset')

                for (let j = 0; j < outputDatasets.length; j++) {
                    let outputDataset = outputDatasets[j]

                    let botNode = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(outputDataset, 'Indicator Bot')
                    if (botNode === undefined) { 
                        botNode = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(outputDataset, 'Trading Bot')
                    }
                    if (botNode === undefined) { 
                        botNode = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(outputDataset, 'Sensor Bot')
                    }
                    if (botNode === undefined) { 
                        botNode = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(outputDataset, 'Learning Bot')
                    }

                    /* Some validations to verify that everything is in place. */
                    if (outputDataset.referenceParent !== undefined) {
                        if (outputDataset.referenceParent.config.codeName === undefined) {
                            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Dataset Definition not defined. Dataset Definition = " + JSON.stringify(outputDataset.referenceParent));
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            return
                        }
                        if (outputDataset.referenceParent.parentNode !== undefined) {
                            if (outputDataset.referenceParent.parentNode.config.codeName === undefined) {
                                logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Product not defined. Product = " + JSON.stringify(outputDataset.referenceParent.parentNode));
                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                return
                            }
                            if (botNode !== undefined) {
                                if (botNode.config.codeName === undefined) {
                                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Bot not defined. Bot = " + JSON.stringify(botNode));
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                    return
                                }
                                if (botNode.parentNode !== undefined) {
                                    if (botNode.parentNode.config.codeName === undefined) {
                                        logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Data Mine not defined. Data Mine = " + JSON.stringify(botNode.parentNode));
                                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                        return
                                    }
                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Bot not attached to a Data Mine or Trading Mine. Bot = " + JSON.stringify(botNode));
                                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                    return
                                }
                            } else {
                                logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Product not attached to a Bot. Product = " + JSON.stringify(outputDataset.referenceParent.parentNode));
                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                return
                            }
                        } else {
                            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Dataset Definition not attached to a Product. Dataset Definition = " + JSON.stringify(outputDataset.referenceParent));
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            return
                        }
                    } else {
                        logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Output Dataset with no reference to a Dataset Definition. Output Dataset = " + JSON.stringify(outputDataset));
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        return
                    }

                    /* All good, lets emit the event. */

                    let dataMine = botNode.parentNode.config.codeName
                    let botName = botNode.config.codeName
                    let product = outputDataset.referenceParent.parentNode.config.codeName
                    let dataset = outputDataset.referenceParent.config.codeName

                    let key = dataMine + "-" + botName + "-" + product + "-" + dataset + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                    let event = {
                        lastFile: lastFile,
                        timeFrames: timeFrames
                    }
                    global.EVENT_SERVER_CLIENT_MODULE.createEventHandler(key, 'Dataset Updated')
                    global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Dataset Updated', event)
                }
            }

            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function asyncRaiseEvents(lastFile, timeFrames) {

        if (bot.processNode.referenceParent.processOutput !== undefined) {
            let outputDatasets = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(bot.processNode.referenceParent.processOutput, 'Output Dataset')

            for (let j = 0; j < outputDatasets.length; j++) {
                let outputDataset = outputDatasets[j]

                let botNode = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(outputDataset, 'Indicator Bot')
                if (botNode === undefined) { 
                    botNode = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(outputDataset, 'Trading Bot')
                }
                if (botNode === undefined) { 
                    botNode = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(outputDataset, 'Sensor Bot')
                }
                if (botNode === undefined) { 
                    botNode = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(outputDataset, 'Learning Bot')
                }

                /* Some validations to verify that everything is in place. */
                if (outputDataset.referenceParent !== undefined) {
                    if (outputDataset.referenceParent.config.codeName === undefined) {
                        logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Dataset Definition not defined. Dataset Definition = " + JSON.stringify(outputDataset.referenceParent));
                        throw (TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    }
                    if (outputDataset.referenceParent.parentNode !== undefined) {
                        if (outputDataset.referenceParent.parentNode.config.codeName === undefined) {
                            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Product not defined. Product = " + JSON.stringify(outputDataset.referenceParent.parentNode));
                            throw (TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }
                        if (botNode !== undefined) {
                            if (botNode.config.codeName === undefined) {
                                logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Bot not defined. Bot = " + JSON.stringify(botNode));
                                throw (TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            }
                            if (botNode.parentNode !== undefined) {
                                if (botNode.parentNode.config.codeName === undefined) {
                                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Mine not defined. Mine = " + JSON.stringify(botNode.parentNode));
                                    throw (TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                }
                            } else {
                                logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Bot not attached to a Data Mine | Trading Mine | Learning Mine. Bot = " + JSON.stringify(botNode));
                                throw (TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            }
                        } else {
                            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Product not attached to a Bot. Product = " + JSON.stringify(outputDataset.referenceParent.parentNode));
                            throw (TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }
                    } else {
                        logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Dataset Definition not attached to a Product. Dataset Definition = " + JSON.stringify(outputDataset.referenceParent));
                        throw (TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    }
                } else {
                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Output Dataset with no reference to a Dataset Definition. Output Dataset = " + JSON.stringify(outputDataset));
                    throw (TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }

                /* All good, lets emit the event. */

                let dataMine = botNode.parentNode.config.codeName
                let botName = botNode.config.codeName
                let product = outputDataset.referenceParent.parentNode.config.codeName
                let dataset = outputDataset.referenceParent.config.codeName

                let key = dataMine + "-" + botName + "-" + product + "-" + dataset + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                let event = {
                    lastFile: lastFile,
                    timeFrames: timeFrames
                }
                global.EVENT_SERVER_CLIENT_MODULE.createEventHandler(key, 'Dataset Updated')
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Dataset Updated', event)
            }
        }
    }
};
