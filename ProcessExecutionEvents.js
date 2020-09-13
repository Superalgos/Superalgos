exports.newProcessExecutionEvents = function newProcessExecutionEvents(BOT, logger) {
    /*
    Here we manage the process execution events. This allow us to emit events 
    when the process starts and finishes. Also to wait for a dependent event
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

    function initialize(processConfig, callBackFunction) {
        try {
            let name = 'Not Depends on any Process'
            logger.fileName = MODULE_NAME + "." + name;

            if (bot.processNode.referenceParent === undefined) {
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                logger.write(MODULE_NAME, "[ERROR] initialize -> Initialization Failed because the Process Instance needs to have a Reference Parent.");
                return
            }

            let market = bot.market.baseAsset + '/' + bot.market.quotedAsset
            currentProcessKey = bot.processNode.referenceParent.name + "-" + bot.processNode.referenceParent.type + "-" + bot.processNode.referenceParent.id + "-" + bot.exchange + "-" + market

            /*
            A process can depend for its own execution on another process to finish, and
            this can be achieved in two different ways. The first one is by referencing
            the Execution Started Event node from a Process Definition node to a Execution
            Ended Event node of another Process Definition. The second way is when there is
            a Execution Started Event node at a Process Instance. This allows the user to
            override the definition created by the Data Mine for an specific task.
            */

            /*
            Here we check if we can find this relationship at the Data Mine level.
            */
            if (bot.processNode.referenceParent.executionStartedEvent !== undefined) {
                if (bot.processNode.referenceParent.executionStartedEvent.referenceParent !== undefined) {
                    if (bot.processNode.referenceParent.executionStartedEvent.referenceParent.parentNode !== undefined) {
                        processThisDependsOn = bot.processNode.referenceParent.executionStartedEvent.referenceParent.parentNode

                        name = processThisDependsOn.name
                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> " + currentProcessKey + " based on the Data Mine depends on " + name); }
                    }
                }
            }

            /*
            Here we check if at the task level if there is an overriding configuration.
            */
            if (bot.processNode.executionStartedEvent !== undefined) {
                if (bot.processNode.executionStartedEvent.referenceParent !== undefined) {
                    if (bot.processNode.executionStartedEvent.referenceParent.parentNode !== undefined) {
                        processThisDependsOn = bot.processNode.executionStartedEvent.referenceParent.parentNode

                        name = processThisDependsOn.name
                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> " + currentProcessKey + " based on the User's Task depends on " + name); }
                    }
                }
            }

            if (processThisDependsOn !== undefined) {

                /* We need to remember that this process waits for another process in order to start. */
                processConfig.waitsForExecutionFinishedEvent = true

                /* We need to find at which network node is running the process that we need to hear from when it finished. */
                let network = global.TASK_NETWORK

                /* 
                Notice that the first task that matches the dependency is going to be considered.
                This means that if the same task, with the same process, pointing to the same
                process definition in the same data mine, with the same exchange and market 
                configured, is at two different network nodes at the same time, the current task
                is going to depend on the first one found, not necesarily the one running at the 
                same network node. If you need to control witch task specifically to depend on
                and need to exactly the same task to exist, you should split the network in two
                different networks, each one with unique tasks so as to avoid confussion. 
                */
                for (let i = 0; i < network.networkNodes.length; i++) {
                    let networkNode = network.networkNodes[i]
                    if (networkNode.dataMining !== undefined) {
                        for (let j = 0; j < networkNode.dataMining.exchangeDataTasks.length; j++) {
                            let exchangeTasks = networkNode.dataMining.exchangeDataTasks[j]
                            for (let p = 0; p < exchangeTasks.marketDataTasks.length; p++) {
                                let marketTasks = exchangeTasks.marketDataTasks[p]
                                if (marketTasks.referenceParent === undefined) { continue }
                                if (marketTasks.referenceParent.id !== global.MARKET_NODE.id) { continue }
                                for (let q = 0; q < marketTasks.dataMineTasks.length; q++) {
                                    let mineTasks = marketTasks.dataMineTasks[q]
                                    for (let k = 0; k < mineTasks.taskManagers.length; k++) {
                                        let taskManager = mineTasks.taskManagers[k]
                                        for (let m = 0; m < taskManager.tasks.length; m++) {
                                            let task = taskManager.tasks[m]
                                            if (task.bot !== undefined) {
                                                for (let n = 0; n < task.bot.processes.length; n++) {
                                                    let process = task.bot.processes[n]
                                                    if (process.referenceParent !== undefined) {
                                                        let processDefinition = process.referenceParent
                                                        if (processThisDependsOn.id === processDefinition.id) {
                                                            /* 
                                                            We found where the task that runs the process definition 
                                                            we are waiting for is located on the network. 
                                                            */
                                                            thisObject.networkNode = networkNode
                                                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) {
                                                                logger.write(MODULE_NAME,
                                                                    "[INFO] initialize -> Connecting to Websockets Server " + networkNode.name +
                                                                    "  -> host = " + networkNode.config.host +
                                                                    ' -> port = ' + networkNode.config.webSocketsPort + '.');
                                                            }

                                                            eventServerClient = EVENT_SERVER_CLIENT.newEventsServerClient(networkNode.config.host, networkNode.config.webSocketsPort)
                                                            eventServerClient.initialize(onConnected)

                                                            function onConnected() {
                                                                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) {
                                                                    logger.write(MODULE_NAME, "[INFO] initialize -> Connected to Websockets Server " + networkNode.name +
                                                                        "  -> host = " + networkNode.config.host +
                                                                        ' -> port = ' + networkNode.config.webSocketsPort + '.');
                                                                }

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

                bot.processHeartBeat(undefined, undefined, "Waiting for " + thisObject.networkNode.name + "->" + processThisDependsOn.parentNode.parentNode.name + "->" + processThisDependsOn.parentNode.config.codeName + "->" + processThisDependsOn.config.codeName)

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

                        bot.processHeartBeat(undefined, undefined, "Running...")

                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> " + currentProcessKey + " Process Execution Started because " + key + " Finished."); }
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

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] start -> " + currentProcessKey + " Process Execution Started "); }

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

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] finish -> " + currentProcessKey + " Process Execution Finished "); }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] finish -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};
