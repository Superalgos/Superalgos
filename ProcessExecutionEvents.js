exports.newProcessExecutionEvents = function newProcessExecutionEvents(BOT, logger) {

    /*

    Here we manage the process execution events. This allow us to emit events when the process starts and finishes. Also to wait for a dependent event
    of another process.

    */

    const MODULE_NAME = "Process Execution Events";
    logger.fileName = MODULE_NAME 

    let bot = BOT;

    let thisObject = {
        networkNode: undefined,
        initialize, initialize,
        finalize: finalize,
        start: start,
        finish: finish
    };

    let processThisDependsOn;                       // This is the process this process needs to wait for it to finishes in order to start.
    let currentProcessKey

    let EVENT_SERVER_CLIENT = require('./EventServerClient.js');
    let eventServerClient

    return thisObject;

    function initialize(callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            let name = 'Not Depends on any Process'
            logger.fileName = MODULE_NAME + "." + name;

            if (bot.processNode.referenceParent === undefined) {
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                logger.write(MODULE_NAME, "[ERROR] initialize -> Initialization Failed because the Process Instance needs to have a Reference Parent.");
                return
            }

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

            if (processThisDependsOn !== undefined) {

                /* We need to find at which network node is running the process that we need to hear from when it finished. */
                let network = global.TASK_NETWORK

                for (let i = 0; i < network.networkNodes.length; i++) {
                    let networkNode = network.networkNodes[i]
                    if (networkNode.dataMining !== undefined) {
                        for (let j = 0; j < networkNode.dataMining.exchangeTasks.length; j++) {
                            let exchangeTasks = networkNode.dataMining.exchangeTasks[j]
                            for (let k = 0; k < exchangeTasks.taskManagers.length; k++) {
                                let taskManager = exchangeTasks.taskManagers[k]
                                for (let m = 0; m < taskManager.tasks.length; m++) {
                                    let task = taskManager.tasks[m]
                                    if (task.bot !== undefined) {
                                        for (let n = 0; n < task.bot.processes.length; n++) {
                                            let process = task.bot.processes[n]
                                            if (process.marketReference !== undefined) {
                                                if (process.marketReference.referenceParent !== undefined) {
                                                    let market = process.marketReference.referenceParent
                                                    let currentProcessMarket = bot.processNode.marketReference.referenceParent

                                                    if (currentProcessMarket.id === market.id) {
                                                        if (process.referenceParent !== undefined) {
                                                            let processDefinition = process.referenceParent
                                                            if (processThisDependsOn.id === processDefinition.id) {

                                                                /* We found where the task that runs the process definition we are waiting for is located on the network. */

                                                                thisObject.networkNode = networkNode
                                                                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Connecting to Websockets Server " + networkNode.name + "  -> host = " + networkNode.code.host + ' -> port = ' + networkNode.code.webSocketsPort + '.'); }

                                                                eventServerClient = EVENT_SERVER_CLIENT.newEventsServerClient(networkNode.code.host, networkNode.code.webSocketsPort)
                                                                eventServerClient.initialize(onConnected)

                                                                function onConnected() {
                                                                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Connected to Websockets Server " + networkNode.name + "  -> host = " + networkNode.code.host + ' -> port = ' + networkNode.code.webSocketsPort + '.'); }

                                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                                    return
                                                                }
                                                                return
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                logger.write(MODULE_NAME, "[ERROR] initialize -> Initialization Failed because we could not find where the task that runs the Process Definition we are waiting for is located within the network. Check the logs for more info.");
                return
            }
            callBackFunction(global.DEFAULT_OK_RESPONSE);
            
        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        if (eventServerClient !== undefined) {
            eventServerClient.finalize()
            eventServerClient = undefined
        }

        processThisDependsOn = undefined
        currentProcessKey = undefined
        thisObject.networkNode = undefined
        bot = undefined
        thisObject = undefined
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

                eventServerClient.listenToEvent(key, 'Process Execution Finished', undefined, callerId, responseCallBack, eventsCallBack)

                bot.processHeartBeat(undefined, undefined, "Waiting for " + thisObject.networkNode.name + "->" + processThisDependsOn.parentNode.parentNode.name + "->" + processThisDependsOn.parentNode.code.codeName + "->" + processThisDependsOn.code.codeName)  

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
                    eventServerClient.stopListening(key, 'Process Execution Finished', subscriptionId)

                    if (message.event.err.result === global.DEFAULT_OK_RESPONSE.result) {
                        /* We emit our own event that the process started. */
                        let event = {
                            err: global.DEFAULT_OK_RESPONSE
                        }
                        global.EVENT_SERVER_CLIENT.createEventHandler(currentProcessKey, 'Process Execution Started')
                        global.EVENT_SERVER_CLIENT.raiseEvent(currentProcessKey, 'Process Execution Started', event)

                        bot.processHeartBeat(undefined, undefined,"Running...") 

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
                global.EVENT_SERVER_CLIENT.createEventHandler(currentProcessKey, 'Process Execution Started')
                global.EVENT_SERVER_CLIENT.raiseEvent(currentProcessKey, 'Process Execution Started', event)

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

            global.EVENT_SERVER_CLIENT.createEventHandler(currentProcessKey, 'Process Execution Finished')
            global.EVENT_SERVER_CLIENT.raiseEvent(currentProcessKey, 'Process Execution Finished', event)

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] finish -> " + currentProcessKey + " Process Execution Finished " ); }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] finish -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};
