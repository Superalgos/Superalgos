exports.newProcessExecutionEvents = function newProcessExecutionEvents(BOT, logger) {

    /*

    Here we manage the process execution events. This allow us to emit events when the process starts and finishes. Also to wait for a dependent event
    of another process.

    */

    const MODULE_NAME = "Process Execution Events";

    let bot = BOT;

    let thisObject = {
        initialize, initialize,
        start: start,
        finish: finish
    };

    let processThisDependsOn;                       // This is the process this process needs to wait for it to finishes in order to start.

    let currentProcessKey

    return thisObject;

    function initialize(callBackFunction) {

        try {
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            let name = 'Not Depends on any Process'

            if (bot.processNode.referenceParent !== undefined) {

                let market = bot.market.baseAsset + '/' + bot.market.quotedAsset 
                currentProcessKey = bot.processNode.referenceParent.name + "-" + bot.processNode.referenceParent.type + "-" + bot.processNode.referenceParent.id + "-" + bot.exchange + "-" + market

                if (bot.processNode.referenceParent.executionStartedEvent !== undefined) {
                    if (bot.processNode.referenceParent.executionStartedEvent.referenceParent !== undefined) {
                        if (bot.processNode.referenceParent.executionStartedEvent.referenceParent.parentNode !== undefined) {
                            processThisDependsOn = bot.processNode.referenceParent.executionStartedEvent.referenceParent.parentNode

                            name = processThisDependsOn.name
                            if (processThisDependsOn.code.monthlyInstances === true) {
                                logger.fileName = MODULE_NAME + "." + name;
                            }
                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> " + currentProcessKey + " depends on " + name); }
                        }
                    }
                }
            }
        
            logger.fileName = MODULE_NAME + "." + name;
            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {

        try {

            if (processThisDependsOn !== undefined) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> Entering Code Block."); }

                /* This forces this process to wait until the process that this one depends on, emits its event signaling that the process execution has finished. */

                let extraCallerId = '-' + Math.trunc(Math.random() * 10000) + '-'

                let market = bot.market.baseAsset + '/' + bot.market.quotedAsset 
                let key = processThisDependsOn.name + "-" + processThisDependsOn.type + "-" + processThisDependsOn.id + "-" + bot.exchange + "-" + market
                let callerId = bot.dataMine + "-" + bot.codeName + "-" + bot.process + extraCallerId

                let subscriptionId

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> started listening to Process Execution Finished. "); }
                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> key = " + key); }
                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> callerId = " + callerId); }

                global.SYSTEM_EVENT_HANDLER.listenToEvent(key, 'Process Execution Finished', undefined, callerId, responseCallBack, eventsCallBack)

                function responseCallBack(message) {
                    if (message.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] start -> responseCallBack -> message = " + JSON.stringify(message))
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    } else {
                        subscriptionId = message.eventSubscriptionId
                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> subscriptionId = " + subscriptionId); }
                    }
                }

                function eventsCallBack(message) {
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> Entering function."); }
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> message = " + JSON.stringify(message)); }

                    /* We continue the normal flow after we learn the dependent process has finished its execution. */
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> stopListening to Process Execution Finished. "); }
                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> subscriptionId = " + subscriptionId); }
                    global.SYSTEM_EVENT_HANDLER.stopListening(key, 'Process Execution Finished', subscriptionId)

                    if (message.event.err.result === global.DEFAULT_OK_RESPONSE.result) {
                        /* We emit our own event that the process started. */
                        let event = {
                            err: global.DEFAULT_OK_RESPONSE
                        }
                        global.SYSTEM_EVENT_HANDLER.createEventHandler(currentProcessKey, 'Process Execution Started')
                        global.SYSTEM_EVENT_HANDLER.raiseEvent(currentProcessKey, 'Process Execution Started', event)

                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> " + currentProcessKey + " Process Execution Started because " + key  + " Finished."); }
                    }

                    callBackFunction(message.event.err);
                }
            } else {
                /* In this case, the Process does not depends on a process which needs to wait for. */
                /* We emit our own event that the process started. */
                let event = {
                    err: global.DEFAULT_OK_RESPONSE
                }
                global.SYSTEM_EVENT_HANDLER.createEventHandler(currentProcessKey, 'Process Execution Started')
                global.SYSTEM_EVENT_HANDLER.raiseEvent(currentProcessKey, 'Process Execution Started', event)

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> " + currentProcessKey + " Process Execution Started " ); }

                callBackFunction(global.DEFAULT_OK_RESPONSE);
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finish(callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] finish -> Entering function."); }

            let event = {
                err: global.DEFAULT_OK_RESPONSE
            }

            global.SYSTEM_EVENT_HANDLER.createEventHandler(currentProcessKey, 'Process Execution Finished')
            global.SYSTEM_EVENT_HANDLER.raiseEvent(currentProcessKey, 'Process Execution Finished', event)

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] finish -> " + currentProcessKey + " Process Execution Finished " ); }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] finish -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};
