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
                let outputDatasets = global.NODE_BRANCH_TO_ARRAY(bot.processNode.referenceParent.processOutput, 'Output Dataset')

                for (let j = 0; j < outputDatasets.length; j++) {
                    let outputDataset = outputDatasets[j]

                    let botNode = global.FIND_NODE_IN_NODE_MESH(outputDataset, 'Indicator Bot')
                    if (botNode === undefined) { 
                        botNode = global.FIND_NODE_IN_NODE_MESH(outputDataset, 'Trading Bot')
                    }
                    if (botNode === undefined) { 
                        botNode = global.FIND_NODE_IN_NODE_MESH(outputDataset, 'Sensor Bot')
                    }

                    /* Some validations to verify that everything is in place. */
                    if (outputDataset.referenceParent !== undefined) {
                        if (outputDataset.referenceParent.config.codeName === undefined) {
                            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Dataset Definition not defined. Dataset Definition = " + JSON.stringify(outputDataset.referenceParent));
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return
                        }
                        if (outputDataset.referenceParent.parentNode !== undefined) {
                            if (outputDataset.referenceParent.parentNode.config.codeName === undefined) {
                                logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Product not defined. Product = " + JSON.stringify(outputDataset.referenceParent.parentNode));
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return
                            }
                            if (botNode !== undefined) {
                                if (botNode.config.codeName === undefined) {
                                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Bot not defined. Bot = " + JSON.stringify(botNode));
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    return
                                }
                                if (botNode.parentNode !== undefined) {
                                    if (botNode.parentNode.config.codeName === undefined) {
                                        logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Data Mine not defined. Data Mine = " + JSON.stringify(botNode.parentNode));
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return
                                    }
                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Bot not attached to a Data Mine or Trading Mine. Bot = " + JSON.stringify(botNode));
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

                    let dataMine = botNode.parentNode.config.codeName
                    let botName = botNode.config.codeName
                    let product = outputDataset.referenceParent.parentNode.config.codeName
                    let dataset = outputDataset.referenceParent.config.codeName

                    key = dataMine + "-" + botName + "-" + product + "-" + dataset + "-" + bot.exchange + "-" + bot.market.baseAsset + '/' + bot.market.quotedAsset
                    let event = {
                        lastFile: lastFile,
                        timeFrames: timeFrames
                    }
                    global.EVENT_SERVER_CLIENT.createEventHandler(key, 'Dataset Updated')
                    global.EVENT_SERVER_CLIENT.raiseEvent(key, 'Dataset Updated', event)
                }
            }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function asyncRaiseEvents(lastFile, timeFrames) {

        if (bot.processNode.referenceParent.processOutput !== undefined) {
            let outputDatasets = global.NODE_BRANCH_TO_ARRAY(bot.processNode.referenceParent.processOutput, 'Output Dataset')

            for (let j = 0; j < outputDatasets.length; j++) {
                let outputDataset = outputDatasets[j]

                let botNode = global.FIND_NODE_IN_NODE_MESH(outputDataset, 'Indicator Bot')
                if (botNode === undefined) { 
                    botNode = global.FIND_NODE_IN_NODE_MESH(outputDataset, 'Trading Bot')
                }
                if (botNode === undefined) { 
                    botNode = global.FIND_NODE_IN_NODE_MESH(outputDataset, 'Sensor Bot')
                }

                /* Some validations to verify that everything is in place. */
                if (outputDataset.referenceParent !== undefined) {
                    if (outputDataset.referenceParent.config.codeName === undefined) {
                        logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Dataset Definition not defined. Dataset Definition = " + JSON.stringify(outputDataset.referenceParent));
                        throw (global.DEFAULT_FAIL_RESPONSE);
                    }
                    if (outputDataset.referenceParent.parentNode !== undefined) {
                        if (outputDataset.referenceParent.parentNode.config.codeName === undefined) {
                            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Product not defined. Product = " + JSON.stringify(outputDataset.referenceParent.parentNode));
                            throw (global.DEFAULT_FAIL_RESPONSE);
                        }
                        if (botNode !== undefined) {
                            if (botNode.config.codeName === undefined) {
                                logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Bot not defined. Bot = " + JSON.stringify(botNode));
                                throw (global.DEFAULT_FAIL_RESPONSE);
                            }
                            if (botNode.parentNode !== undefined) {
                                if (botNode.parentNode.config.codeName === undefined) {
                                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> codeName at Data Mine not defined. Data Mine = " + JSON.stringify(botNode.parentNode));
                                    throw (global.DEFAULT_FAIL_RESPONSE);
                                }
                            } else {
                                logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Bot not attached to a Data Mine or Trading Mine. Bot = " + JSON.stringify(botNode));
                                throw (global.DEFAULT_FAIL_RESPONSE);
                            }
                        } else {
                            logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Product not attached to a Bot. Product = " + JSON.stringify(outputDataset.referenceParent.parentNode));
                            throw (global.DEFAULT_FAIL_RESPONSE);
                        }
                    } else {
                        logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Dataset Definition not attached to a Product. Dataset Definition = " + JSON.stringify(outputDataset.referenceParent));
                        throw (global.DEFAULT_FAIL_RESPONSE);
                    }
                } else {
                    logger.write(MODULE_NAME, "[ERROR] raiseEvents -> Output Dataset with no reference to a Dataset Definition. Output Dataset = " + JSON.stringify(outputDataset));
                    throw (global.DEFAULT_FAIL_RESPONSE);
                }

                /* All good, lets emit the event. */

                let dataMine = botNode.parentNode.config.codeName
                let botName = botNode.config.codeName
                let product = outputDataset.referenceParent.parentNode.config.codeName
                let dataset = outputDataset.referenceParent.config.codeName

                key = dataMine + "-" + botName + "-" + product + "-" + dataset + "-" + bot.exchange + "-" + bot.market.baseAsset + '/' + bot.market.quotedAsset
                let event = {
                    lastFile: lastFile,
                    timeFrames: timeFrames
                }
                global.EVENT_SERVER_CLIENT.createEventHandler(key, 'Dataset Updated')
                global.EVENT_SERVER_CLIENT.raiseEvent(key, 'Dataset Updated', event)
            }
        }
    }
};
