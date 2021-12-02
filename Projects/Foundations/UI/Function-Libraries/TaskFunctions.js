function newFoundationsFunctionLibraryTaskFunctions() {
    let thisObject = {
        synchronizeTaskWithBackEnd: synchronizeTaskWithBackEnd,

        runTask: runTask,
        stopTask: stopTask,
        runAllTasks: runAllTasks,
        stopAllTasks: stopAllTasks,
        runAllTaskManagers: runAllTaskManagers,
        stopAllTaskManagers: stopAllTaskManagers,

        runAllProjectDataTasks: runAllProjectDataTasks,
        stopAllProjectDataTasks: stopAllProjectDataTasks,
        runAllProjectTradingTasks: runAllProjectTradingTasks,
        stopAllProjectTradingTasks: stopAllProjectTradingTasks,
        runAllProjectLearningTasks: runAllProjectLearningTasks,
        stopAllProjectLearningTasks: stopAllProjectLearningTasks,

        runAllExchangeDataTasks: runAllExchangeDataTasks,
        stopAllExchangeDataTasks: stopAllExchangeDataTasks,
        runAllExchangeTradingTasks: runAllExchangeTradingTasks,
        stopAllExchangeTradingTasks: stopAllExchangeTradingTasks,
        runAllExchangeLearningTasks: runAllExchangeLearningTasks,
        stopAllExchangeLearningTasks: stopAllExchangeLearningTasks,

        runAllMarketDataTasks: runAllMarketDataTasks,
        stopAllMarketDataTasks: stopAllMarketDataTasks,
        runAllMarketTradingTasks: runAllMarketTradingTasks,
        stopAllMarketTradingTasks: stopAllMarketTradingTasks,
        runAllMarketLearningTasks: runAllMarketLearningTasks,
        stopAllMarketLearningTasks: stopAllMarketLearningTasks,

        runAllDataMineTasks: runAllDataMineTasks,
        stopAllDataMineTasks: stopAllDataMineTasks,
        runAllTradingMineTasks: runAllTradingMineTasks,
        stopAllTradingMineTasks: stopAllTradingMineTasks,
        runAllLearningMineTasks: runAllLearningMineTasks,
        stopAllLearningMineTasks: stopAllLearningMineTasks,

        addMissingProjectDataTasks: addMissingProjectDataTasks,
        addMissingExchangeDataTasks: addMissingExchangeDataTasks,
        addMissingMarketDataTasks: addMissingMarketDataTasks,
        addMissingDataMineTasks: addMissingDataMineTasks,
        addMissingProjectTradingTasks: addMissingProjectTradingTasks,
        addMissingExchangeTradingTasks: addMissingExchangeTradingTasks,
        addMissingMarketTradingTasks: addMissingMarketTradingTasks,
        addMissingTradingMineTasks: addMissingTradingMineTasks,
        addMissingProjectLearningTasks: addMissingProjectLearningTasks,
        addMissingExchangeLearningTasks: addMissingExchangeLearningTasks,
        addMissingMarketLearningTasks: addMissingMarketLearningTasks,
        addMissingLearningMineTasks: addMissingLearningMineTasks,

        runAllProjectPortfolioTasks: runAllProjectPortfolioTasks,
        stopAllProjectPortfolioTasks: stopAllProjectPortfolioTasks,
        runAllExchangePortfolioTasks: runAllExchangePortfolioTasks,
        stopAllExchangePortfolioTasks: stopAllExchangePortfolioTasks,
        runAllMarketPortfolioTasks: runAllMarketPortfolioTasks,
        stopAllMarketPortfolioTasks: stopAllMarketPortfolioTasks,
        runAllPortfolioMineTasks: runAllPortfolioMineTasks,
        stopAllPortfolioMineTasks: stopAllPortfolioMineTasks,
        addMissingProjectPortfolioTasks: addMissingProjectPortfolioTasks,
        addMissingExchangePortfolioTasks: addMissingExchangePortfolioTasks,
        addMissingMarketPortfolioTasks: addMissingMarketPortfolioTasks,
        addMissingPortfolioMineTasks: addMissingPortfolioMineTasks,

        runAllManagedTasks: runAllManagedTasks,
        stopAllManagedTasks: stopAllManagedTasks,

        addAllTasks: addAllTasks
    }

    return thisObject

    function synchronizeTaskWithBackEnd(node) {
        let lanNetworkNode = validations(node)
        if (lanNetworkNode === undefined) {
            /* Nodes that do not belong to a network can not get ready. */
            return
        }

        let eventsServerClient = UI.projects.foundations.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)

        /* First we setup everything so as to listen to the response from the Task Manager */
        let eventSubscriptionIdOnStatus
        let key = 'Task Client - ' + node.id
        eventsServerClient.listenToEvent(key, 'Task Status', undefined, node.id, onResponse, onStatus)

        function onResponse(message) {
            eventSubscriptionIdOnStatus = message.eventSubscriptionId
        }

        function onStatus(message) {
            eventsServerClient.stopListening(key, eventSubscriptionIdOnStatus, node.id)
            if (message.event.status === 'Task Process Running') {
                node.payload.uiObject.menu.internalClick('Run Task')
            }
        }

        /* Second we ask the Task Manager if this Task has a process Running. */
        let event = {
            taskId: node.id
        }

        eventsServerClient.raiseEvent('Task Manager', 'Task Status', event)
    }

    function runTask(node, isDebugging, callBackFunction) {

        if (UI.environment.DEMO_MODE === true) {
            if (window.location.hostname !== 'localhost') {
                node.payload.uiObject.setWarningMessage('Superalgos is running is DEMO MODE. This means that you can not RUN Tasks.', 5)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                return
            }
        }

        let lanNetworkNode = validations(node)
        if (lanNetworkNode === undefined) {
            /* This means that the validations failed. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        let eventsServerClient = UI.projects.foundations.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)

        for (let i = 0; i < node.bot.processes.length; i++) {
            let process = node.bot.processes[i]
            process.payload.uiObject.run(eventsServerClient)
            if (process.session !== undefined) {
                process.session.payload.uiObject.reset()
            }
        }

        let taskLightingPath = '->Task->' +
            'Task Server App Reference->Task Server App->Signing Account->' +
            'Portfolio Bot Instance->' +
            'Sensor Bot Instance->' +
            'API Data Fetcher Bot Instance->' +
            'Indicator Bot Instance->' +
            'Trading Bot Instance->' +
            'Learning Bot Instance->' +
            'Social Trading Bot Reference->Signing Account->' +
            'Sensor Process Instance->Time Frames Filter->API Data Fetcher Process Instance->Indicator Process Instance->Trading Process Instance->Portfolio Process Instance->Learning Process Instance->' +
            'Social Trading Bot Reference->Social Trading Bot->Signing Account->' +
            'Execution Started Event->' +
            'Key Reference->Exchange Account Key->' +
            'Task Manager->' +
            'Data Mine Tasks->Trading Mine Tasks->Portfolio Mine Tasks->Learning Mine Tasks->' +
            'Market Data Tasks->Market Trading Tasks->Market Portfolio Tasks->Market Learning Tasks->' +
            'Exchange Data Tasks->Exchange Trading Tasks->Exchange Portfolio Tasks->Exchange Learning Tasks->' +
            'Market->Exchange Markets->Crypto Exchange->' +
            'Market Base Asset->Market Quoted Asset->Asset->' +
            'Project Data Tasks->Project Trading Tasks->Project Portfolio Tasks->Project Learning Tasks->Project Definition->' +
            'Backtesting Session->Live Trading Session->Paper Trading Session->Forward Testing Session->Live Portfolio Session->' +
            'Back Learning Session->Live Learning Session->Managed Sessions->Session Reference->' +
            'Process Definition->' +
            'Process Output->' +
            'Output Dataset Folder->Output Dataset Folder->Output Dataset Folder->Output Dataset Folder->Output Dataset Folder->' +
            'Output Dataset->Dataset Definition->Product Definition->API Query Parameters->API Query Parameter->API Path Parameters->API Path Parameter->' +
            'Product Definition Folder->Product Definition Folder->Product Definition Folder->Product Definition Folder->Product Definition Folder->' +
            'Process Dependencies->' +
            'Status Dependency->Status Report->Process Definition->' +
            'Data Mine Data Dependencies->Bot Data Dependencies->' +
            'Data Dependency Folder->Data Dependency Folder->Data Dependency Folder->Data Dependency Folder->Data Dependency Folder->' +
            'Data Dependency->Dataset Definition->Product Definition->' +
            'Record Definition->Record Property->Record Formula->' +
            'API Response Field Reference->' +
            'API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->' +
            'API Response Schema->API Query Response->API Query Responses->API Endpoint->' +
            'Data Building Procedure->' +
            'Procedure Initialization->Procedure Javascript Code->' +
            'Procedure Loop->Procedure Javascript Code->' +
            'Calculations Procedure->' +
            'Procedure Initialization->Procedure Javascript Code->' +
            'Procedure Loop->Procedure Javascript Code->' +
            'Status Report->' +
            'Execution Finished Event->' +
            'Execution Started Event->Execution Finished Event->Process Definition->' +
            'Sensor Bot->' +
            'API Data Fetcher Bot->' +
            'Indicator Bot->' +
            'Trading Bot->' +
            'Portfolio Bot->' +
            'Learning Bot->' +
            'Product Definition Folder->Product Definition Folder->Product Definition Folder->Product Definition Folder->Product Definition Folder->' +
            'Data Mine->Trading Mine->Portfolio Mine->Learning Mine->' +
            'API Map Reference->' +
            'API Map->API Version->API Endpoint->API Query Parameters->API Query Parameter->API Path Parameters->API Path Parameter->API Query Responses->API Query Response->API Response Schema->' +
            'API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->'

        let taskDefinition = UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(node, false, true, true, false, false, taskLightingPath)

        let networkLightingPath = '->LAN Network->LAN Network Node->' +
            'Data Storage->' +
            'Data Mines Data->Trading Mines Data->Portfolio Mines Data->Learning Mines Data->' +
            'Project Data Products->Project Trading Products->Project Portfolio Products->Project Learning Products->' +
            'Exchange Data Products->Exchange Trading Products->Exchange Portfolio Products->Exchange Learning Products->' +
            'Market Data Products->Market Trading Products->Market Portfolio Products->Market Learning Products->' +
            'Market->Market Base Asset->Market Quoted Asset->Asset->' +
            'Exchange Markets->Crypto Exchange->' +
            'Data Mine Products->Bot Products->' +
            'Data Product Folder->Data Product Folder->Data Product Folder->Data Product Folder->Data Product Folder->' +
            'Data Product->Product Definition->' +
            'Data Tasks->Learning Tasks->Testing Trading Tasks->Production Trading Tasks->Production Portfolio Tasks->' +
            'Project Data Tasks->Project Trading Tasks->Project Portfolio Tasks->Project Learning Tasks->' +
            'Exchange Data Tasks->Exchange Trading Tasks->Exchange Portfolio Tasks->Exchange Learning Tasks->Crypto Exchange->' +
            'Market Data Tasks->Market Trading Tasks->Market Portfolio Tasks->Market Learning Tasks->Market->' +
            'Data Mine Tasks->Trading Mine Tasks->Portfolio Mine Tasks->Learning Mine Tasks->' +
            'Task Manager->Managed Tasks->Task Reference->Task->' +
            'Indicator Bot Instance->Sensor Bot Instance->API Data Fetcher Bot Instance->Trading Bot Instance->Portfolio Bot Instance->Learning Bot Instance->' +
            'Indicator Process Instance->Sensor Process Instance->API Data Fetcher Process Instance->Trading Process Instance->Portfolio Process Instance->Learning Process Instance->' +
            'Paper Trading Session->Forward Testing Session->Backtesting Session->Live Trading Session->Live Portfolio Session->Back Learning Session->Live Learning Session->Managed Sessions->' +
            'API Map Reference->' +
            'Market->' +
            'Process Definition->'

        let networkDefinition = UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(lanNetworkNode.payload.parentNode, false, true, true, false, false, networkLightingPath)

        let managedTasksLightingPath = '->Task->Managed Tasks->Portfolio Bot Instance->' +
            'Task Reference->Task->Sensor Bot Instance->API Data Fetcher Bot->Indicator Bot Instance->Trading Bot Instance->Learning Bot Instance->' +
            'Sensor Process Instance->Time Frames Filter->API Data Fetcher Process Instance->Indicator Process Instance->Trading Process Instance->Learning Process Instance->' +
            'Execution Started Event->Key Reference->Exchange Account Key->' +
            'Task Manager->' +
            'Data Mine Tasks->Trading Mine Tasks->Learning Mine Tasks->Portfolio Mine Tasks->' +
            'Market Trading Tasks->Market Data Tasks->Market Learning Tasks->Market Portfolio Tasks->' +
            'Market->Exchange Markets->Crypto Exchange->Crypto Exchanges->exchange Markets->Market->' +
            'Portfolio Process Instance->Live Portfolio Session->Portfolio Parameters->Portfolio Engine Reference->Portfolio System Reference->Managed Sessions->Session Reference->Live Trading Session->Backtesting Session->Forward Testing Session->Live Portfolio Session->Back Learning Session->Paper Trading Session->Trading Parameters->Trading Engine Reference->'

        let managedTasksDefinition =
            UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(node, false, true, true, false, false, managedTasksLightingPath);

        /*
        We will also send all the project schemas we have to the Task Server.
        */
        let projectSchemas = []
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = {
                name: projectDefinition.name,
                schema: SCHEMAS_BY_PROJECT.get(projectDefinition.name).array.appSchema
            }
            projectSchemas.push(project)
        }

        let event = {
            projectSchemas: JSON.stringify(projectSchemas),
            taskId: node.id,
            taskName: node.name,
            taskDefinition: JSON.stringify(taskDefinition),
            networkDefinition: JSON.stringify(networkDefinition),
            managedTasksDefinition: JSON.stringify(managedTasksDefinition)
        }

        if (isDebugging === true) {
            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
            eventsServerClient.raiseEvent('Task Server', 'Debug Task Started', event)
            return
        }

        node.payload.uiObject.run(eventsServerClient, callBackFunction)
        eventsServerClient.raiseEvent('Task Manager', 'Run Task', event)

        if (node.managedTasks !== undefined) {
            runAllManagedTasks(node.managedTasks);
        }
    }

    function stopTask(node, callBackFunction) {

        if (UI.environment.DEMO_MODE === true) {
            if (window.location.hostname !== 'localhost') {
                node.payload.uiObject.setWarningMessage('Superalgos is running is DEMO MODE. This means that you can not STOP Tasks.', 5)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                return
            }
        }

        let lanNetworkNode = validations(node)
        if (lanNetworkNode === undefined) {
            /* This means that the validations failed. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        /* Deal with shutting down any managed tasks: */
        if (node.managedTasks !== undefined) {
            stopAllManagedTasks(node.managedTasks);
        }

        let eventsServerClient = UI.projects.foundations.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)

        let event = {
            taskId: node.id,
            taskName: node.name
        }

        node.payload.uiObject.stop(callBackFunction, undefined, true)
        eventsServerClient.raiseEvent('Task Manager', 'Stop Task', event)

        if (node.bot === undefined) { return }
        if (node.bot.processes.length === 0) { return }

        for (let i = 0; i < node.bot.processes.length; i++) {
            let process = node.bot.processes[i]
            process.payload.uiObject.stop(undefined, undefined, true)
            if (process.session !== undefined) {
                process.session.payload.uiObject.reset()
            }
        }
    }

    function validations(node) {
        if (node.bot === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to have a Bot Instance.')
            return
        }
        if (node.bot.processes.length === 0) {
            node.payload.uiObject.setErrorMessage('Task Bot Instance needs to have al least once Process Instance.')
            return
        }

        if (node.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside a Task Manager.')
            return
        }

        let taskManager = node.payload.parentNode

        if (taskManager.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside Mine Tasks.')
            return
        }

        if (taskManager.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside Market Tasks.')
            return
        }

        if (taskManager.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside Exchange Tasks.')
            return
        }

        if (taskManager.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside a Data Tasks, Learning Tasks, Portfolio Tasks, Testing or Production Trading Tasks node.')
            return
        }

        if (taskManager.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside a Network Node.')
            return
        }

        let lanNetworkNode = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(taskManager, 'LAN Network Node', undefined, true, false, true, false)

        if (UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(lanNetworkNode.payload, 'host') === undefined) {
            node.payload.uiObject.setErrorMessage('Network Node needs to have a valid Host property at its config.')
            return
        }

        if (UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(lanNetworkNode.payload, 'webPort') === undefined) {
            node.payload.uiObject.setErrorMessage('Network Node needs to have a valid webPort property at its config.')
            return
        }

        if (UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(lanNetworkNode.payload, 'webSocketsPort') === undefined) {
            node.payload.uiObject.setErrorMessage('Network Node needs to have a valid webSocketsPort property at its config.')
            return
        }

        return lanNetworkNode
    }

    function runAllTasks(taskManager) {
        let tasks = taskManager.tasks;
        for (let i = 0; i < tasks.length; i++) {
            let node = tasks[i];
            let menu = node.payload.uiObject.menu;

            menu.internalClick('Run Task')
        }
    }

    function stopAllTasks(taskManager) {
        let tasks = taskManager.tasks;
        for (let i = 0; i < tasks.length; i++) {
            let node = tasks[i];
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop Task')
        }
    }

    function runAllTaskManagers(parent) {
        let manager = parent.taskManagers;
        for (let i = 0; i < manager.length; i++) {
            let node = manager[i];
            let menu = node.payload.uiObject.menu;

            menu.internalClick('Run All Tasks')
            menu.internalClick('Run All Tasks')
        }
    }

    function stopAllTaskManagers(parent) {
        let manager = parent.taskManagers;
        for (let i = 0; i < manager.length; i++) {
            let node = manager[i];
            let menu = node.payload.uiObject.menu;

            menu.internalClick('Stop All Tasks')
            menu.internalClick('Stop All Tasks')
        }
    }

    function runAllProjectDataTasks(parent) {
        for (let i = 0; i < parent.projectDataTasks.length; i++) {
            let node = parent.projectDataTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Exchange Data Tasks')
            menu.internalClick('Run All Exchange Data Tasks')
        }
    }

    function stopAllProjectDataTasks(parent) {
        for (let i = 0; i < parent.projectDataTasks.length; i++) {
            let node = parent.projectDataTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Exchange Data Tasks')
            menu.internalClick('Stop All Exchange Data Tasks')
        }
    }

    function runAllProjectTradingTasks(parent) {
        for (let i = 0; i < parent.projectTradingTasks.length; i++) {
            let node = parent.projectTradingTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Exchange Trading Tasks')
            menu.internalClick('Run All Exchange Trading Tasks')
        }
    }

    function stopAllProjectTradingTasks(parent) {
        for (let i = 0; i < parent.projectTradingTasks.length; i++) {
            let node = parent.projectTradingTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Exchange Trading Tasks')
            menu.internalClick('Stop All Exchange Trading Tasks')
        }
    }

    function runAllProjectPortfolioTasks(parent) {
        for (let i = 0; i < parent.projectPortfolioTasks.length; i++) {
            let node = parent.projectPortfolioTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Exchange Portfolio Tasks')
            menu.internalClick('Run All Exchange Portfolio Tasks')
        }
    }

    function stopAllProjectPortfolioTasks(parent) {
        for (let i = 0; i < parent.projectPortfolioTasks.length; i++) {
            let node = parent.projectPortfolioTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Exchange Portfolio Tasks')
            menu.internalClick('Stop All Exchange Portfolio Tasks')
        }
    }

    function runAllProjectLearningTasks(parent) {
        for (let i = 0; i < parent.projectLearningTasks.length; i++) {
            let node = parent.projectLearningTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Exchange Learning Tasks')
            menu.internalClick('Run All Exchange Learning Tasks')
        }
    }

    function stopAllProjectLearningTasks(parent) {
        for (let i = 0; i < parent.projectLearningTasks.length; i++) {
            let node = parent.projectLearningTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Exchange Learning Tasks')
            menu.internalClick('Stop All Exchange Learning Tasks')
        }
    }

    function runAllExchangeDataTasks(parent) {
        for (let i = 0; i < parent.exchangeDataTasks.length; i++) {
            let node = parent.exchangeDataTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Market Data Tasks')
            menu.internalClick('Run All Market Data Tasks')
        }
    }

    function stopAllExchangeDataTasks(parent) {
        for (let i = 0; i < parent.exchangeDataTasks.length; i++) {
            let node = parent.exchangeDataTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Market Data Tasks')
            menu.internalClick('Stop All Market Data Tasks')
        }
    }

    function runAllExchangeTradingTasks(parent) {
        for (let i = 0; i < parent.exchangeTradingTasks.length; i++) {
            let node = parent.exchangeTradingTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Market Trading Tasks')
            menu.internalClick('Run All Market Trading Tasks')
        }
    }

    function stopAllExchangeTradingTasks(parent) {
        for (let i = 0; i < parent.exchangeTradingTasks.length; i++) {
            let node = parent.exchangeTradingTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Market Trading Tasks')
            menu.internalClick('Stop All Market Trading Tasks')
        }
    }

    function runAllExchangePortfolioTasks(parent) {
        for (let i = 0; i < parent.exchangePortfolioTasks.length; i++) {
            let node = parent.exchangePortfolioTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Market Portfolio Tasks')
            menu.internalClick('Run All Market Portfolio Tasks')
        }
    }

    function stopAllExchangePortfolioTasks(parent) {
        for (let i = 0; i < parent.exchangePortfolioTasks.length; i++) {
            let node = parent.exchangePortfolioTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Market Portfolio Tasks')
            menu.internalClick('Stop All Market Portfolio Tasks')
        }
    }

    function runAllExchangeLearningTasks(parent) {
        for (let i = 0; i < parent.exchangeLearningTasks.length; i++) {
            let node = parent.exchangeLearningTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Market Learning Tasks')
            menu.internalClick('Run All Market Learning Tasks')
        }
    }

    function stopAllExchangeLearningTasks(parent) {
        for (let i = 0; i < parent.exchangeLearningTasks.length; i++) {
            let node = parent.exchangeLearningTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Market Learning Tasks')
            menu.internalClick('Stop All Market Learning Tasks')
        }
    }

    function runAllMarketDataTasks(parent) {
        for (let i = 0; i < parent.marketDataTasks.length; i++) {
            let node = parent.marketDataTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Data Mine Tasks')
            menu.internalClick('Run All Data Mine Tasks')
        }
    }

    function stopAllMarketDataTasks(parent) {
        for (let i = 0; i < parent.marketDataTasks.length; i++) {
            let node = parent.marketDataTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Data Mine Tasks')
            menu.internalClick('Stop All Data Mine Tasks')
        }
    }

    function runAllMarketTradingTasks(parent) {
        for (let i = 0; i < parent.marketTradingTasks.length; i++) {
            let node = parent.marketTradingTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Trading Mine Tasks')
            menu.internalClick('Run All Trading Mine Tasks')
        }
    }

    function runAllMarketPortfolioTasks(parent) {
        for (let i = 0; i < parent.marketPortfolioTasks.length; i++) {
            let node = parent.marketPortfolioTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Portfolio Mine Tasks')
            menu.internalClick('Run All Portfolio Mine Tasks')
        }
    }

    function runAllMarketLearningTasks(parent) {
        for (let i = 0; i < parent.marketLearningTasks.length; i++) {
            let node = parent.marketLearningTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Learning Mine Tasks')
            menu.internalClick('Run All Learning Mine Tasks')
        }
    }

    function stopAllMarketTradingTasks(parent) {
        for (let i = 0; i < parent.marketTradingTasks.length; i++) {
            let node = parent.marketTradingTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Trading Mine Tasks')
            menu.internalClick('Stop All Trading Mine Tasks')
        }
    }

    function stopAllMarketPortfolioTasks(parent) {
        for (let i = 0; i < parent.marketPortfolioTasks.length; i++) {
            let node = parent.marketPortfolioTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Portfolio Mine Tasks')
            menu.internalClick('Stop All Portfolio Mine Tasks')
        }
    }

    function stopAllMarketLearningTasks(parent) {
        for (let i = 0; i < parent.marketLearningTasks.length; i++) {
            let node = parent.marketLearningTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Learning Mine Tasks')
            menu.internalClick('Stop All Learning Mine Tasks')
        }
    }

    function runAllDataMineTasks(parent) {
        for (let i = 0; i < parent.dataMineTasks.length; i++) {
            let node = parent.dataMineTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Task Managers')
            menu.internalClick('Run All Task Managers')
        }
    }

    function stopAllDataMineTasks(parent) {
        for (let i = 0; i < parent.dataMineTasks.length; i++) {
            let node = parent.dataMineTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Task Managers')
            menu.internalClick('Stop All Task Managers')
        }
    }

    function runAllTradingMineTasks(parent) {
        for (let i = 0; i < parent.tradingMineTasks.length; i++) {
            let node = parent.tradingMineTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Task Managers')
            menu.internalClick('Run All Task Managers')
        }
    }

    function runAllPortfolioMineTasks(parent) {
        for (let i = 0; i < parent.portfolioMineTasks.length; i++) {
            let node = parent.portfolioMineTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Task Managers')
            menu.internalClick('Run All Task Managers')
        }
    }

    function runAllLearningMineTasks(parent) {
        for (let i = 0; i < parent.learningMineTasks.length; i++) {
            let node = parent.learningMineTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Run All Task Managers')
            menu.internalClick('Run All Task Managers')
        }
    }

    function stopAllTradingMineTasks(parent) {
        for (let i = 0; i < parent.tradingMineTasks.length; i++) {
            let node = parent.tradingMineTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Task Managers')
            menu.internalClick('Stop All Task Managers')
        }
    }

    function stopAllPortfolioMineTasks(parent) {
        for (let i = 0; i < parent.portfolioMineTasks.length; i++) {
            let node = parent.portfolioMineTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Task Managers')
            menu.internalClick('Stop All Task Managers')
        }
    }

    function stopAllLearningMineTasks(parent) {
        for (let i = 0; i < parent.learningMineTasks.length; i++) {
            let node = parent.learningMineTasks[i]
            let menu = node.payload.uiObject.menu

            menu.internalClick('Stop All Task Managers')
            menu.internalClick('Stop All Task Managers')
        }
    }

    /* run|stop ManagedTasks(): Portfolio Management managed tasks runners: */
    function runAllManagedTasks(managedTasks) {
        for (let i = 0; i < managedTasks.taskReference.length; i++) {
            managedTasks.taskReference[i].payload.referenceParent.payload.uiObject.menu.internalClick('Run Task');
        }
    }

    function stopAllManagedTasks(managedTasks) {
        for (let i = 0; i < managedTasks.taskReference.length; i++) {
            managedTasks.taskReference[i].payload.referenceParent.payload.uiObject.menu.internalClick('Stop Task');
        }
    }

    function addMissingProjectDataTasks(node, rootNodes) {
        addMissingProjectTasks(node, rootNodes, 'Project Data Tasks', 'Data Tasks')
    }

    function addMissingProjectTradingTasks(node, rootNodes) {
        addMissingProjectTasks(node, rootNodes, 'Project Trading Tasks', 'Trading Tasks')
    }

    function addMissingProjectPortfolioTasks(node, rootNodes) {
        addMissingProjectTasks(node, rootNodes, 'Project Portfolio Tasks', 'Portfolio Tasks')
    }

    function addMissingProjectLearningTasks(node, rootNodes) {
        addMissingProjectTasks(node, rootNodes, 'Project Learning Tasks', 'Learning Tasks')
    }

    function addMissingProjectTasks(node, rootNodes, newNodeType, taskType) {

        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = projectDefinition.name

            if (projectDefinition.tasks === undefined) { continue }
            if (projectDefinition.tasks.includes(taskType) === false) { continue }

            for (let j = 0; j < rootNodes.length; j++) {
                let rootNode = rootNodes[j]
                if (rootNode.type === project + ' Project') {
                    let projectDefinition = rootNode.projectDefinition
                    if (projectDefinition !== undefined) {
                        if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, projectDefinition, true) === true) {
                            let projectTasks = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, newNodeType, undefined, node.project)
                            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(projectTasks, projectDefinition)
                        }
                    }
                }
            }
        }
    }

    function addMissingExchangeDataTasks(node, rootNodes) {
        addMissingExchangeTasks(node, rootNodes, 'Exchange Data Tasks')
    }

    function addMissingExchangeTradingTasks(node, rootNodes) {
        addMissingExchangeTasks(node, rootNodes, 'Exchange Trading Tasks')
    }

    function addMissingExchangePortfolioTasks(node, rootNodes) {
        addMissingExchangeTasks(node, rootNodes, 'Exchange Portfolio Tasks')
    }

    function addMissingExchangeLearningTasks(node, rootNodes) {
        addMissingExchangeTasks(node, rootNodes, 'Exchange Learning Tasks')
    }

    function addMissingExchangeTasks(node, rootNodes, newNodeType) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Crypto Ecosystem') {
                let cryptoEcosystem = rootNode
                for (let j = 0; j < cryptoEcosystem.cryptoExchanges.length; j++) {
                    let cryptoExchanges = cryptoEcosystem.cryptoExchanges[j]
                    for (let k = 0; k < cryptoExchanges.exchanges.length; k++) {
                        let cryptoExchange = cryptoExchanges.exchanges[k]
                        if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, cryptoExchange, true) === true) {
                            let exchangeTasks = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, newNodeType)
                            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(exchangeTasks, cryptoExchange)
                        }
                    }
                }
            }
        }
    }

    function addMissingMarketDataTasks(node) {
        addMissingMarketTasks(node, 'Market Data Tasks')
    }

    function addMissingMarketTradingTasks(node) {
        addMissingMarketTasks(node, 'Market Trading Tasks')
    }

    function addMissingMarketPortfolioTasks(node) {
        addMissingMarketTasks(node, 'Market Portfolio Tasks')
    }

    function addMissingMarketLearningTasks(node) {
        addMissingMarketTasks(node, 'Market Learning Tasks')
    }

    function addMissingMarketTasks(node, newNodeType) {
        if (node.payload === undefined) { return }
        if (node.payload.referenceParent === undefined) { return }
        if (node.payload.referenceParent.exchangeMarkets === undefined) { return }

        let markets = node.payload.referenceParent.exchangeMarkets.markets

        for (let i = 0; i < markets.length; i++) {
            let market = markets[i]

            if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, market, true) === true) {
                let marketDataTasks = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, newNodeType)
                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(marketDataTasks, market)
            }
        }
    }

    function addMissingDataMineTasks(node, rootNodes) {
        addMissingMineTasks(node, rootNodes, 'Data Mine', 'Data Mine Tasks')
    }

    function addMissingTradingMineTasks(node, rootNodes) {
        addMissingMineTasks(node, rootNodes, 'Trading Mine', 'Trading Mine Tasks')
    }

    function addMissingPortfolioMineTasks(node, rootNodes) {
        addMissingMineTasks(node, rootNodes, 'Portfolio Mine', 'Portfolio Mine Tasks')
    }

    function addMissingLearningMineTasks(node, rootNodes) {
        addMissingMineTasks(node, rootNodes, 'Learning Mine', 'Learning Mine Tasks')
    }

    function addMissingMineTasks(node, rootNodes, rootNodeType, newNodeType) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === rootNodeType) {
                let mine = rootNode

                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, mine, true) === true) {
                    let dataMineTasks = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, newNodeType)
                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(dataMineTasks, mine)
                }
            }
        }
    }

    function addAllTasks(node, rootNodes) {
        if (node.payload === undefined) { return }
        if (node.payload.referenceParent === undefined) { return }

        let taskManager = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Task Manager');
        taskManager.name = node.payload.referenceParent.name
        taskManager.payload.floatingObject.collapseToggle()

        switch (node.type) {
            case 'Data Mine Tasks': {
                addDataTasks()
                break
            }
            case 'Learning Mine Tasks': {
                addLearningTasks()
                break
            }
            case 'Trading Mine Tasks': {
                addTradingTasks()
                break
            }
            case 'Portfolio Mine Tasks': {
                addPortfolioTasks()
                break
            }
        }

        function addDataTasks() {
            addTasks()
        }

        function addLearningTasks() {
            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Learning System') {
                    addTasks(rootNode)
                }
            }
        }

        function addTradingTasks() {
            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Trading System') {
                    addTasks(rootNode)
                }
            }
        }

        function addPortfolioTasks() {
            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Portfolio System') {
                    addTasks(rootNode)
                }
            }
        }

        function addTasks(systemNode) {
            let mine = node.payload.referenceParent

            addTasksForBotArray(mine.sensorBots)
            addTasksForBotArray(mine.apiDataFetcherBots)
            addTasksForBotArray(mine.indicatorBots)
            addTasksForBotArray(mine.tradingBots)
            addTasksForBotArray(mine.portfolioBots)
            addTasksForBotArray(mine.learningBots)

            function addTasksForBotArray(botsArray) {
                if (botsArray === undefined) { return }

                for (let i = 0; i < botsArray.length; i++) {
                    let bot = botsArray[i]

                    let botInstance
                    switch (bot.type) {
                        case 'Sensor Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(task, 'Sensor Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'API Data Fetcher Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(task, 'API Data Fetcher Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'Indicator Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(task, 'Indicator Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'Trading Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(task, 'Trading Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'Portfolio Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(task, 'Portfolio Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'Learning Bot': {
                            let task
                            /*
                            For Learning Bots we will add two Tasks, each one with a different
                            Session Type.
                            */
                            task = addTask(taskManager)
                            task.name = 'Back ' + task.name

                            botInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(task, 'Learning Bot Instance')
                            botInstance.name = 'Back ' + bot.name

                            addProcessInstance(task, bot, botInstance, 'Back Learning Session')

                            task = addTask(taskManager)
                            task.name = 'Live ' + task.name

                            botInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(task, 'Learning Bot Instance')
                            botInstance.name = 'Live ' + bot.name

                            addProcessInstance(task, bot, botInstance, 'Live Learning Session')
                            break
                        }
                    }

                    function addTask(taskManager) {
                        let task = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(taskManager, 'Task');

                        if (systemNode !== undefined) {
                            task.name = systemNode.name
                        } else {
                            task.name = bot.name
                        }
                        return task
                    }

                    function addProcessInstance(task, bot, botInstance, sessionType) {
                        for (let j = 0; j < bot.processes.length; j++) {
                            let process = bot.processes[j]
                            let processInstance
                            switch (bot.type) {
                                case 'Sensor Bot': {
                                    processInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(botInstance, 'Sensor Process Instance')
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(processInstance, process)
                                    break
                                }
                                case 'API Data Fetcher Bot': {
                                    processInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(botInstance, 'API Data Fetcher Process Instance')
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(processInstance, process)

                                    /*
                                    We will locate and reference the API MAP that has the same codeName than the data mine.
                                    */
                                    let apiMaps = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('API Map')
                                    for (let i = 0; i < apiMaps.length; i++) {
                                        let apiMap = apiMaps[i]
                                        let apiMapCodeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(apiMap.payload, 'codeName')
                                        let mineCodeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(mine.payload, 'codeName')

                                        if (apiMapCodeName === mineCodeName) {
                                            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(processInstance.apiMapReference, apiMap)
                                            break
                                        }
                                    }
                                    break
                                }
                                case 'Indicator Bot': {
                                    processInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(botInstance, 'Indicator Process Instance')
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(processInstance, process)
                                    break
                                }
                                case 'Trading Bot': {
                                    processInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(botInstance, 'Trading Process Instance')
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(processInstance, process)

                                    if (node.payload.parentNode === undefined) { return }
                                    if (node.payload.parentNode.payload === undefined) { return }
                                    if (node.payload.parentNode.payload.parentNode === undefined) { return }
                                    if (node.payload.parentNode.payload.parentNode.payload === undefined) { return }
                                    if (node.payload.parentNode.payload.parentNode.payload.parentNode === undefined) { return }
                                    if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) { return }

                                    let environment = node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode
                                    let session

                                    switch (environment.type) {
                                        case 'Testing Trading Tasks': {
                                            addSession('Backtesting Session')
                                            break
                                        }
                                        case 'Production Trading Tasks': {
                                            addSession('Live Trading Session')
                                            break
                                        }
                                    }
                                    break

                                    function addSession(sessionType) {
                                        session = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(processInstance, sessionType)
                                        session.name = task.name
                                        let config = JSON.parse(session.config)
                                        config.folderName = session.name.split(" ").join("-")
                                        session.config = JSON.stringify(config)

                                        for (let m = 0; m < rootNodes.length; m++) {
                                            let rootNode = rootNodes[m]
                                            if (rootNode.type === 'Trading Engine' && rootNode.isPlugin === true) {
                                                let tradingEngine = rootNode
                                                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(session.tradingEngineReference, tradingEngine)
                                                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(session.tradingSystemReference, systemNode)
                                            }
                                        }
                                    }
                                }
                                case 'Portfolio Bot': {
                                    processInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(botInstance, 'Portfolio Process Instance')
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(processInstance, process)

                                    if (node.payload.parentNode === undefined) { return }
                                    if (node.payload.parentNode.payload === undefined) { return }
                                    if (node.payload.parentNode.payload.parentNode === undefined) { return }
                                    if (node.payload.parentNode.payload.parentNode.payload === undefined) { return }
                                    if (node.payload.parentNode.payload.parentNode.payload.parentNode === undefined) { return }
                                    if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) { return }

                                    let environment = node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode
                                    let session

                                    switch (environment.type) {
                                        case 'Testing Portfolio Tasks': {
                                            addSession('Backtesting Session')
                                            break
                                        }
                                        case 'Production Portfolio Tasks': {
                                            addSession('Live Portfolio Session')
                                            break
                                        }
                                    }
                                    break

                                    function addSession(sessionType) {
                                        session = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(processInstance, sessionType)
                                        session.name = task.name
                                        let config = JSON.parse(session.config)
                                        config.folderName = session.name.split(" ").join("-")
                                        session.config = JSON.stringify(config)

                                        for (let m = 0; m < rootNodes.length; m++) {
                                            let rootNode = rootNodes[m]
                                            if (rootNode.type === 'Portfolio Engine' && rootNode.isPlugin === true) {
                                                let portfolioEngine = rootNode
                                                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(session.portfolioEngineReference, portfolioEngine)
                                                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(session.portfolioSystemReference, systemNode)
                                            }
                                        }
                                    }
                                }
                                case 'Learning Bot': {
                                    processInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(botInstance, 'Learning Process Instance')
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(processInstance, process)

                                    let session
                                    addSession(sessionType)
                                    break

                                    function addSession(sessionType) {
                                        session = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(processInstance, sessionType)
                                        session.name = task.name
                                        let config = JSON.parse(session.config)
                                        config.folderName = session.name.split(" ").join("-")
                                        session.config = JSON.stringify(config)

                                        for (let m = 0; m < rootNodes.length; m++) {
                                            let rootNode = rootNodes[m]
                                            if (rootNode.type === 'Learning Engine' && rootNode.isPlugin === true) {
                                                let learningEngine = rootNode
                                                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(session.learningEngineReference, learningEngine)
                                                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(session.learningSystemReference, systemNode)
                                            }
                                        }
                                    }
                                }
                            }
                            processInstance.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                        }
                    }
                }
            }
        }
    }
}
