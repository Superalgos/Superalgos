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
        let validationsResult = validations(node)
        if (validationsResult === undefined) {
            /* Some validation failed, so we are aborting here this function. */
            return
        }
        let lanNetworkNode = validationsResult.lanNetworkNode
        if (lanNetworkNode === undefined) {
            /* Nodes that do not belong to a network can not get ready. */
            return
        }

        let eventsServerClient = UI.projects.workspaces.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)

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
        node.payload.uiObject.isDebugging = isDebugging

        if (UI.environment.DEMO_MODE === true) {
            if (window.location.hostname !== 'localhost') {
                node.payload.uiObject.setWarningMessage('Superalgos is running is DEMO MODE. This means that you can not RUN Tasks.', 5)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                return
            }
        }

        let validationsResult = validations(node)
        if (validationsResult === undefined) {
            /* Some validation failed, so we are aborting here this function. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }
        let lanNetworkNode = validationsResult.lanNetworkNode
        if (lanNetworkNode === undefined) {
            /* This means that the validations failed. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        let eventsServerClient = UI.projects.workspaces.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)

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
            'Study Bot Instance->' +
            'Trading Bot Instance->' +
            'Learning Bot Instance->' +
            'Sensor Process Instance->Time Frames Filter->API Data Fetcher Process Instance->Indicator Process Instance->Study Process Instance->Trading Process Instance->Portfolio Process Instance->Learning Process Instance->' +
            'Execution Started Event->' +
            'Key Reference->Exchange Account Key->' +
            'Task Manager->' +
            'Data Mine Tasks->Trading Mine Tasks->Portfolio Mine Tasks->Learning Mine Tasks->' +
            'Market Data Tasks->Market Trading Tasks->Market Portfolio Tasks->Market Learning Tasks->' +
            'Exchange Data Tasks->Exchange Trading Tasks->Exchange Portfolio Tasks->Exchange Learning Tasks->' +
            'Market->Exchange Markets->Crypto Exchange->' +
            'Market Base Asset->Market Quoted Asset->Asset->' +
            'Project Data Tasks->Project Trading Tasks->Project Portfolio Tasks->Project Learning Tasks->Project Definition->' +
            'Backtesting Session->Live Trading Session->Paper Trading Session->Forward Testing Session->Backtesting Portfolio Session->Live Portfolio Session->' +
            'Back Learning Session->Live Learning Session->Managed Sessions->Session Reference->Live Trading Session->Backtesting Session->Forward Testing Session->Paper Trading Session->' +
            /* 
             Managed Sessions 
            */
            'Managed Sessions->Session Reference->Live Trading Session->Backtesting Session->Forward Testing Session->Paper Trading Session->' +
            'Trading Parameters->' +
            'Session Base Asset->Session Quoted Asset->Time Range->Time Frame->Slippage->Fee Structure->Snapshots->Heartbeats->User Defined Parameters->' +
            /* 
            Process Definition 
            */
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
            'Study Bot->' +
            'Trading Bot->' +
            'Portfolio Bot->' +
            'Learning Bot->' +
            'Product Definition Folder->Product Definition Folder->Product Definition Folder->Product Definition Folder->Product Definition Folder->' +
            'Data Mine->Trading Mine->Portfolio Mine->Learning Mine->' +
            'API Map Reference->' +
            'API Map->API Version->API Endpoint->API Query Parameters->API Query Parameter->API Path Parameters->API Path Parameter->API Query Responses->API Query Response->API Response Schema->' +
            'API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->API Response Field->' +
            /*
            Social Trading Nodes
            */
            'Social Trading Bot Reference->Social Trading Bot->Signing Account->' +
            /*
            Open Storage Nodes
            */
            'Available Storage->Storage Container Reference->Github Storage Container->Superalgos Storage Container->Github Storage->Superalgos Storage->'

        let taskDefinition = UI.projects.visualScripting.nodeActionFunctions.protocolNode.getProtocolNode(node, false, true, true, false, false, taskLightingPath)

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
            'Data Tasks->Learning Tasks->Testing Trading Tasks->Production Trading Tasks->Testing Portfolio Tasks->Production Portfolio Tasks->' +
            'Project Data Tasks->Project Trading Tasks->Project Portfolio Tasks->Project Learning Tasks->' +
            'Exchange Data Tasks->Exchange Trading Tasks->Exchange Portfolio Tasks->Exchange Learning Tasks->Crypto Exchange->' +
            'Market Data Tasks->Market Trading Tasks->Market Portfolio Tasks->Market Learning Tasks->Market->' +
            'Data Mine Tasks->Trading Mine Tasks->Portfolio Mine Tasks->Learning Mine Tasks->' +
            'Task Manager->Managed Tasks->Task Reference->Task->' +
            'Indicator Bot Instance->Study Bot Instance->Sensor Bot Instance->API Data Fetcher Bot Instance->Trading Bot Instance->Portfolio Bot Instance->Learning Bot Instance->' +
            'Indicator Process Instance->Study Process Instance->Sensor Process Instance->API Data Fetcher Process Instance->Trading Process Instance->Portfolio Process Instance->Learning Process Instance->' +
            'Paper Trading Session->Forward Testing Session->Backtesting Session->Live Trading Session->Backtesting Portfolio Session->Live Portfolio Session->Back Learning Session->Live Learning Session->' +
            'API Map Reference->' +
            'Market->' +
            'Process Definition->'

        let networkDefinition = UI.projects.visualScripting.nodeActionFunctions.protocolNode.getProtocolNode(lanNetworkNode.payload.parentNode, false, true, true, false, false, networkLightingPath)

        let managedTasksLightingPath = '->Task->Managed Tasks->Portfolio Bot Instance->' +
            'Task Reference->Task->Sensor Bot Instance->API Data Fetcher Bot->Indicator Bot Instance->Study Bot Instance->Trading Bot Instance->Learning Bot Instance->' +
            'Sensor Process Instance->Time Frames Filter->API Data Fetcher Process Instance->Indicator Process Instance->Study Process Instance->Trading Process Instance->Learning Process Instance->' +
            'Execution Started Event->Key Reference->Exchange Account Key->' +
            'Task Manager->' +
            'Data Mine Tasks->Trading Mine Tasks->Learning Mine Tasks->Portfolio Mine Tasks->' +
            'Market Trading Tasks->Market Data Tasks->Market Learning Tasks->Market Portfolio Tasks->' +
            'Market->Market Base Asset->Market Quoted Asset->Asset->'

        let managedTasksDefinition =
            UI.projects.visualScripting.nodeActionFunctions.protocolNode.getProtocolNode(node, false, true, true, false, false, managedTasksLightingPath);

        let dependencyFilters = addDependencyFilterForStudyBots(node, validationsResult)

        let event = {
            taskId: node.id,
            taskName: node.name,
            taskDefinition: JSON.stringify(taskDefinition),
            networkDefinition: JSON.stringify(networkDefinition),
            managedTasksDefinition: JSON.stringify(managedTasksDefinition),
            dependencyFilters: JSON.stringify(dependencyFilters)
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

    function addDependencyFilterForStudyBots(node, validationsResult) {
        if (node.bot.type !== 'Study Bot Instance') { return }

        let defaultExchange = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(validationsResult.exchange.payload, 'codeName')
        let defaultMarket =
            UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(validationsResult.market.baseAsset.payload.referenceParent.payload, 'codeName') +
            '-' +
            UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(validationsResult.market.quotedAsset.payload.referenceParent.payload, 'codeName')
 
        let dependencyFilters = []

        for (let i = 0; i < node.bot.processes.length; i++) {
            let process = node.bot.processes[i]

            if (
                process.payload.referenceParent !== undefined &&
                process.payload.referenceParent.payload.parentNode !== undefined
            ) {
                let studyBot = process.payload.referenceParent.payload.parentNode

                for (let j = 0; j < studyBot.products.length; j++) {
                    let product = studyBot.products[j]

                    if (product.dataBuilding !== undefined) {
                        let startingNode = product.dataBuilding

                        let processDependencyFilter = UI.projects.foundations.nodeActionFunctions.dependenciesFilter.createDependencyFilter(
                            defaultExchange,
                            defaultMarket,
                            startingNode
                        )
                        dependencyFilters.push(processDependencyFilter)
                    }
                }
            }
        }

        return dependencyFilters
    }

    function stopTask(node, callBackFunction) {
        node.payload.uiObject.isDebugging = false

        if (UI.environment.DEMO_MODE === true) {
            if (window.location.hostname !== 'localhost') {
                node.payload.uiObject.setWarningMessage('Superalgos is running is DEMO MODE. This means that you can not STOP Tasks.', 5)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                return
            }
        }

        let validationsResult = validations(node)
        if (validationsResult === undefined) {
            /* Some validation failed, so we are aborting here this function. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }
        let lanNetworkNode = validationsResult.lanNetworkNode
        if (lanNetworkNode === undefined) {
            /* This means that the validations failed. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        /* Deal with shutting down any managed tasks: */
        if (node.managedTasks !== undefined) {
            stopAllManagedTasks(node.managedTasks);
        }

        let eventsServerClient = UI.projects.workspaces.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)

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
        let result = {}

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

        result.taskManager = node.payload.parentNode

        if (result.taskManager.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside Mine Tasks.')
            return
        }

        if (result.taskManager.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside Market Tasks.')
            return
        }

        if (result.taskManager.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside Exchange Tasks.')
            return
        }

        if (result.taskManager.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside a Data Tasks, Learning Tasks, Testing or Production Trading\Portfolio Tasks node.')
            return
        }

        if (result.taskManager.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to be inside a Network Node.')
            return
        }

        result.lanNetworkNode = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(result.taskManager, 'LAN Network Node', undefined, true, false, true, false)

        if (UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(result.lanNetworkNode.payload, 'host') === undefined) {
            node.payload.uiObject.setErrorMessage('Network Node needs to have a valid Host property at its config.')
            return
        }

        if (UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(result.lanNetworkNode.payload, 'webPort') === undefined) {
            node.payload.uiObject.setErrorMessage('Network Node needs to have a valid webPort property at its config.')
            return
        }

        if (UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(result.lanNetworkNode.payload, 'webSocketsPort') === undefined) {
            node.payload.uiObject.setErrorMessage('Network Node needs to have a valid webSocketsPort property at its config.')
            return
        }


        if (result.taskManager.payload.parentNode.payload.parentNode.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Task needs to have a Default Market.')
            return
        }

        result.market = result.taskManager.payload.parentNode.payload.parentNode.payload.referenceParent

        if (result.market.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Default Market needs to be a child of Exchange Markets.')
            return
        }

        if (result.market.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Exchange Markets neeed to be a child of Crypto Exchange.')
            return
        }

        if (result.market.baseAsset === undefined) {
            node.payload.uiObject.setErrorMessage('Default Market needs to have a Base Asset.')
            return
        }

        if (result.market.quotedAsset === undefined) {
            node.payload.uiObject.setErrorMessage('Default Market needs to have a Quoted Asset.')
            return
        }

        if (result.market.baseAsset.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Market Base Asset needs to reference an Asset.')
            return
        }

        if (result.market.quotedAsset.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Market Quoted Asset needs to reference an Asset.')
            return
        }

        result.exchange = result.market.payload.parentNode.payload.parentNode

        return result
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
        for (let i = 0; i < managedTasks.taskReferences.length; i++) {
            managedTasks.taskReferences[i].payload.referenceParent.payload.uiObject.menu.internalClick('Run Task');
        }
    }

    function stopAllManagedTasks(managedTasks) {
        for (let i = 0; i < managedTasks.taskReferences.length; i++) {
            managedTasks.taskReferences[i].payload.referenceParent.payload.uiObject.menu.internalClick('Stop Task');
        }
    }

    function addMissingProjectDataTasks(node, rootNodes) {
        return addMissingProjectTasks(node, rootNodes, 'Project Data Tasks', 'Data Tasks')
    }

    function addMissingProjectTradingTasks(node, rootNodes) {
        return addMissingProjectTasks(node, rootNodes, 'Project Trading Tasks', 'Trading Tasks')
    }

    function addMissingProjectPortfolioTasks(node, rootNodes) {
        return addMissingProjectTasks(node, rootNodes, 'Project Portfolio Tasks', 'Portfolio Tasks')
    }

    function addMissingProjectLearningTasks(node, rootNodes) {
        return addMissingProjectTasks(node, rootNodes, 'Project Learning Tasks', 'Learning Tasks')
    }

    function addMissingProjectTasks(node, rootNodes, newNodeType, taskType) {
        let newUiObjects = []
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
                            let projectTasks = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, newNodeType, undefined, node.project)
                            UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(projectTasks, projectDefinition)
                            if (projectTasks !== undefined) {
                                newUiObjects.push(projectTasks)
                            }
                        }
                    }
                }
            }
        }

        return newUiObjects
    }

    function addMissingExchangeDataTasks(node, rootNodes) {
        return addMissingExchangeTasks(node, rootNodes, 'Exchange Data Tasks')
    }

    function addMissingExchangeTradingTasks(node, rootNodes) {
        return addMissingExchangeTasks(node, rootNodes, 'Exchange Trading Tasks')
    }

    function addMissingExchangePortfolioTasks(node, rootNodes) {
        return addMissingExchangeTasks(node, rootNodes, 'Exchange Portfolio Tasks')
    }

    function addMissingExchangeLearningTasks(node, rootNodes) {
        return addMissingExchangeTasks(node, rootNodes, 'Exchange Learning Tasks')
    }

    function addMissingExchangeTasks(node, rootNodes, newNodeType) {
        let newUiObjects = []
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Crypto Ecosystem') {
                let cryptoEcosystem = rootNode
                for (let j = 0; j < cryptoEcosystem.cryptoExchanges.length; j++) {
                    let cryptoExchanges = cryptoEcosystem.cryptoExchanges[j]
                    for (let k = 0; k < cryptoExchanges.exchanges.length; k++) {
                        let cryptoExchange = cryptoExchanges.exchanges[k]
                        if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, cryptoExchange, true) === true) {
                            let exchangeTasks = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, newNodeType)
                            UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(exchangeTasks, cryptoExchange)
                            if (exchangeTasks !== undefined) {
                                newUiObjects.push(exchangeTasks)
                            }
                        }
                    }
                }
            }
        }

        return newUiObjects
    }

    function addMissingMarketDataTasks(node) {
        return addMissingMarketTasks(node, 'Market Data Tasks')
    }

    function addMissingMarketTradingTasks(node) {
        return addMissingMarketTasks(node, 'Market Trading Tasks')
    }

    function addMissingMarketPortfolioTasks(node) {
        return addMissingMarketTasks(node, 'Market Portfolio Tasks')
    }

    function addMissingMarketLearningTasks(node) {
        return addMissingMarketTasks(node, 'Market Learning Tasks')
    }

    function addMissingMarketTasks(node, newNodeType) {
        let newUiObjects = []
        if (node.payload === undefined) { return }
        if (node.payload.referenceParent === undefined) { return }
        if (node.payload.referenceParent.exchangeMarkets === undefined) { return }

        let markets = node.payload.referenceParent.exchangeMarkets.markets

        for (let i = 0; i < markets.length; i++) {
            let market = markets[i]

            if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, market, true) === true) {
                let marketDataTasks = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, newNodeType)
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(marketDataTasks, market)
                if (marketDataTasks !== undefined) {
                    newUiObjects.push(marketDataTasks)
                }
            }
        }

        return newUiObjects
    }

    function addMissingDataMineTasks(node, rootNodes) {
        return addMissingMineTasks(node, rootNodes, 'Data Mine', 'Data Mine Tasks')
    }

    function addMissingTradingMineTasks(node, rootNodes) {
        return addMissingMineTasks(node, rootNodes, 'Trading Mine', 'Trading Mine Tasks')
    }

    function addMissingPortfolioMineTasks(node, rootNodes) {
        return addMissingMineTasks(node, rootNodes, 'Portfolio Mine', 'Portfolio Mine Tasks')
    }

    function addMissingLearningMineTasks(node, rootNodes) {
        return addMissingMineTasks(node, rootNodes, 'Learning Mine', 'Learning Mine Tasks')
    }

    function addMissingMineTasks(node, rootNodes, rootNodeType, newNodeType) {
        let newUiObjects = []
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === rootNodeType) {
                let mine = rootNode

                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, mine, true) === true) {
                    let dataMineTasks = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, newNodeType)
                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(dataMineTasks, mine)
                    if (dataMineTasks !== undefined) {
                        newUiObjects.push(dataMineTasks)
                    }
                }
            }
        }

        return newUiObjects
    }

    function addAllTasks(node, rootNodes) {
        if (node.payload === undefined) { return }
        if (node.payload.referenceParent === undefined) { return }

        let newUiObjects = []

        let taskManager = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Task Manager');
        taskManager.name = node.payload.referenceParent.name
        taskManager.payload.floatingObject.collapseToggle()
        if (taskManager !== undefined) {
            newUiObjects.push(taskManager)
        }

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
            addTasksForBotArray(mine.studyBots)
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

                            botInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(task, 'Sensor Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'API Data Fetcher Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(task, 'API Data Fetcher Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'Indicator Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(task, 'Indicator Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'Study Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(task, 'Study Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'Trading Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(task, 'Trading Bot Instance')
                            botInstance.name = bot.name

                            addProcessInstance(task, bot, botInstance)
                            break
                        }
                        case 'Portfolio Bot': {
                            let task = addTask(taskManager)

                            botInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(task, 'Portfolio Bot Instance')
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

                            botInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(task, 'Learning Bot Instance')
                            botInstance.name = 'Back ' + bot.name

                            addProcessInstance(task, bot, botInstance, 'Back Learning Session')

                            task = addTask(taskManager)
                            task.name = 'Live ' + task.name

                            botInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(task, 'Learning Bot Instance')
                            botInstance.name = 'Live ' + bot.name

                            addProcessInstance(task, bot, botInstance, 'Live Learning Session')
                            break
                        }
                    }

                    function addTask(taskManager) {
                        let task = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(taskManager, 'Task');

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
                                    processInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(botInstance, 'Sensor Process Instance')
                                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(processInstance, process)
                                    break
                                }
                                case 'API Data Fetcher Bot': {
                                    processInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(botInstance, 'API Data Fetcher Process Instance')
                                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(processInstance, process)

                                    /*
                                    We will locate and reference the API MAP that has the same codeName than the data mine.
                                    */
                                    let apiMaps = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('API Map')
                                    for (let i = 0; i < apiMaps.length; i++) {
                                        let apiMap = apiMaps[i]
                                        let apiMapCodeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(apiMap.payload, 'codeName')
                                        let mineCodeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(mine.payload, 'codeName')

                                        if (apiMapCodeName === mineCodeName) {
                                            UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(processInstance.apiMapReference, apiMap)
                                            break
                                        }
                                    }
                                    break
                                }
                                case 'Indicator Bot': {
                                    processInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(botInstance, 'Indicator Process Instance')
                                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(processInstance, process)
                                    break
                                }
                                case 'Study Bot': {
                                    processInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(botInstance, 'Study Process Instance')
                                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(processInstance, process)
                                    break
                                }
                                case 'Trading Bot': {
                                    processInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(botInstance, 'Trading Process Instance')
                                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(processInstance, process)

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
                                        session = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(processInstance, sessionType)
                                        session.name = task.name
                                        let config = JSON.parse(session.config)
                                        config.folderName = session.name.split(" ").join("-")
                                        session.config = JSON.stringify(config)

                                        for (let m = 0; m < rootNodes.length; m++) {
                                            let rootNode = rootNodes[m]
                                            if (rootNode.type === 'Trading Engine' && rootNode.isPlugin === true) {
                                                let tradingEngine = rootNode
                                                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(session.tradingEngineReference, tradingEngine)
                                                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(session.tradingSystemReference, systemNode)
                                            }
                                        }
                                    }
                                }
                                case 'Portfolio Bot': {
                                    processInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(botInstance, 'Portfolio Process Instance')
                                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(processInstance, process)

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
                                            addSession('Backtesting Portfolio Session')
                                            break
                                        }
                                        case 'Production Portfolio Tasks': {
                                            addSession('Live Portfolio Session')
                                            break
                                        }
                                    }
                                    break

                                    function addSession(sessionType) {
                                        session = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(processInstance, sessionType)
                                        session.name = task.name
                                        let config = JSON.parse(session.config)
                                        config.folderName = session.name.split(" ").join("-")
                                        session.config = JSON.stringify(config)

                                        for (let m = 0; m < rootNodes.length; m++) {
                                            let rootNode = rootNodes[m]
                                            if (rootNode.type === 'Portfolio Engine' && rootNode.isPlugin === true) {
                                                let portfolioEngine = rootNode
                                                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(session.portfolioEngineReference, portfolioEngine)
                                                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(session.portfolioSystemReference, systemNode)
                                            }
                                        }
                                    }
                                }
                                case 'Learning Bot': {
                                    processInstance = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(botInstance, 'Learning Process Instance')
                                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(processInstance, process)

                                    let session
                                    addSession(sessionType)
                                    break

                                    function addSession(sessionType) {
                                        session = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(processInstance, sessionType)
                                        session.name = task.name
                                        let config = JSON.parse(session.config)
                                        config.folderName = session.name.split(" ").join("-")
                                        session.config = JSON.stringify(config)

                                        for (let m = 0; m < rootNodes.length; m++) {
                                            let rootNode = rootNodes[m]
                                            if (rootNode.type === 'Learning Engine' && rootNode.isPlugin === true) {
                                                let learningEngine = rootNode
                                                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(session.learningEngineReference, learningEngine)
                                                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(session.learningSystemReference, systemNode)
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

        return newUiObjects
    }
}
