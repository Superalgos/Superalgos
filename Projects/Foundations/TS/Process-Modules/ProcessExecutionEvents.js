exports.newFoundationsProcessModulesProcessExecutionEvents = function (processIndex) {
    /*
    Here we manage the process execution events. This allow us to emit events 
    when the process starts and finishes. Also to wait for a dependent event
    of another process.
    */
    const MODULE_NAME = "Process Execution Events";
    

    let thisObject = {
        lanNetworkNode: undefined,
        initialize: initialize,
        finalize: finalize,
        start: start,
        finish: finish
    };

    let processThisDependsOn;                       // This is the process this process needs to wait for it to finishes in order to start.
    let currentProcessKey

    let eventServerClient

    return thisObject;

    function initialize(callBackFunction) {
        try {
            let name = 'Not Depends on any Process'

            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent === undefined) {
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Initialization Failed because the Process Instance needs to have a Reference Parent.");
                return
            }

            let market = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            currentProcessKey = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.name + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.type + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.id + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "-" + market

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
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.executionStartedEvent !== undefined) {
                if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.executionStartedEvent.referenceParent !== undefined) {
                    if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.executionStartedEvent.referenceParent.parentNode !== undefined) {
                        processThisDependsOn = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.executionStartedEvent.referenceParent.parentNode

                        name = processThisDependsOn.name
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] initialize -> " + currentProcessKey + " based on the Data Mine depends on " + name)
                    }
                }
            }

            /*
            Here we check if at the task level if there is an overriding configuration.
            */
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].executionStartedEvent !== undefined) {
                if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].executionStartedEvent.referenceParent !== undefined) {
                    if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].executionStartedEvent.referenceParent.parentNode !== undefined) {
                        processThisDependsOn = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].executionStartedEvent.referenceParent.parentNode

                        name = processThisDependsOn.name
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] initialize -> " + currentProcessKey + " based on the User's Task depends on " + name)
                    }
                }
            }

            if (processThisDependsOn !== undefined) {

                /* We need to remember that this process waits for another process in order to start. */
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).WAIT_FOR_EXECUTION_FINISHED_EVENT = true

                /* We need to find at which network node is running the process that we need to hear from when it finished. */
                let network = TS.projects.foundations.globals.taskConstants.NETWORK_NODE

                /* 
                Notice that the first task that matches the dependency is going to be considered.
                This means that if the same task, with the same process, pointing to the same
                process definition in the same data mine, with the same exchange and market 
                configured, is at two different network nodes at the same time, the current task
                is going to depend on the first one found, not necessarily the one running at the
                same network node. If you need to control witch task specifically to depend on
                and need to exactly the same task to exist, you should split the network in two
                different networks, each one with unique tasks so as to avoid confusion.
                */
                for (let i = 0; i < network.lanNetworkNodes.length; i++) {
                    let lanNetworkNode = network.lanNetworkNodes[i]
                    if (lanNetworkNode.dataTasks !== undefined) {
                        for (let z = 0; z < lanNetworkNode.dataTasks.projectDataTasks.length; z++) {
                            let projectDataTasks = lanNetworkNode.dataTasks.projectDataTasks[z]
                            if (projectDataTasks.exchangeDataTasks === undefined) {continue} 
                            for (let j = 0; j < projectDataTasks.exchangeDataTasks.length; j++) {
                                let exchangeTasks = projectDataTasks.exchangeDataTasks[j]
                                for (let p = 0; p < exchangeTasks.marketDataTasks.length; p++) {
                                    let marketTasks = exchangeTasks.marketDataTasks[p]
                                    if (marketTasks.referenceParent === undefined) { continue }
                                    if (marketTasks.referenceParent.id !== TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.id) { continue }
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
                                                                thisObject.lanNetworkNode = lanNetworkNode

                                                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                    "[INFO] initialize -> Connecting to Websockets Server " + lanNetworkNode.name +
                                                                    "  -> host = " + lanNetworkNode.config.host +
                                                                    ' -> port = ' + lanNetworkNode.config.webSocketsPort + '.');


                                                                eventServerClient = TS.projects.foundations.taskModules.eventServerClient.newFoundationsTaskModulesEventServerClient(lanNetworkNode.config.host, lanNetworkNode.config.webSocketsPort)
                                                                eventServerClient.initialize(onConnected)

                                                                function onConnected() {

                                                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] initialize -> Connected to Websockets Server " + lanNetworkNode.name +
                                                                        "  -> host = " + lanNetworkNode.config.host +
                                                                        ' -> port = ' + lanNetworkNode.config.webSocketsPort + '.');


                                                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
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
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Initialization Failed because we could not find where the task that runs the Process Definition we are waiting for is located within the network. Check the logs for more info.");
                return
            }
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        if (eventServerClient !== undefined) {
            eventServerClient.finalize()
            eventServerClient = undefined
        }

        processThisDependsOn = undefined
        currentProcessKey = undefined
        thisObject.lanNetworkNode = undefined
        bot = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {

        try {

            if (processThisDependsOn !== undefined) {

                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> Entering Code Block.")

                /* This forces this process to wait until the process that this one depends on, emits its event signaling that the process execution has finished. */

                let extraCallerId = '-' + Math.trunc(Math.random() * 10000) + '-'

                let market = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                let key = processThisDependsOn.name + "-" + processThisDependsOn.type + "-" + processThisDependsOn.id + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "-" + market
                let callerId = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + extraCallerId

                let subscriptionId

                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> started listening to Process Execution Finished. ")
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> key = " + key)
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> callerId = " + callerId)

                eventServerClient.listenToEvent(key, 'Process Execution Finished', undefined, callerId, responseCallBack, eventsCallBack)

                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, undefined, undefined, "Waiting for " + thisObject.lanNetworkNode.name + "->" + processThisDependsOn.parentNode.parentNode.name + "->" + processThisDependsOn.parentNode.config.codeName + "->" + processThisDependsOn.config.codeName)

                function responseCallBack(message) {
                    if (message.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> responseCallBack -> message = " + JSON.stringify(message))
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    } else {
                        subscriptionId = message.eventSubscriptionId
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> waitForDependantProcess -> subscriptionId = " + subscriptionId)
                    }
                }

                function eventsCallBack(message) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> Entering function.")
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> message = " + JSON.stringify(message))

                    /* We continue the normal flow after we learn the dependent process has finished its execution. */
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> stopListening to Process Execution Finished. ")
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> subscriptionId = " + subscriptionId)
                    eventServerClient.stopListening(key, 'Process Execution Finished', subscriptionId)

                    if (message.event.err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        /* We emit our own event that the process started. */
                        let event = {
                            err: TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE
                        }
                        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.createEventHandler(currentProcessKey, 'Process Execution Started')
                        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(currentProcessKey, 'Process Execution Started', event)

                        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, undefined, undefined, "Running...")

                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> eventsCallBack -> " + currentProcessKey + " Process Execution Started because " + key + " Finished.")
                    }

                    callBackFunction(message.event.err);
                }
            } else {
                /* In this case, the Process does not depends on a process which needs to wait for. */
                /* We emit our own event that the process started. */
                let event = {
                    err: TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE
                }
                TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.createEventHandler(currentProcessKey, 'Process Execution Started')
                TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(currentProcessKey, 'Process Execution Started', event)

                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> " + currentProcessKey + " Process Execution Started ")

                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
            }

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finish(callBackFunction) {

        try {

            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] finish -> Entering function.")

            let event = {
                err: TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE
            }

            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.createEventHandler(currentProcessKey, 'Process Execution Finished')
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(currentProcessKey, 'Process Execution Finished', event)

            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] finish -> " + currentProcessKey + " Process Execution Finished ")

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] finish -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

};
