function newFoundationsFunctionLibraryDataStorageFunctions() {
    let thisObject = {
        addAllDataProducts: addAllDataProducts,
        addAllDataMineProducts: addAllDataMineProducts,
        addAllTradingMineProducts: addAllTradingMineProducts,
        addAllLearningMineProducts: addAllLearningMineProducts,
        addMissingTradingSessionReferences: addMissingTradingSessionReferences,
        addMissingLearningSessionReferences: addMissingLearningSessionReferences,
        addMissingMarketDataProducts: addMissingMarketDataProducts,
        addMissingMarketTradingProducts: addMissingMarketTradingProducts,
        addMissingMarketLearningProducts: addMissingMarketLearningProducts,
        addMissingExchangeDataProducts: addMissingExchangeDataProducts,
        addMissingExchangeTradingProducts: addMissingExchangeTradingProducts,
        addMissingExchangeLearningProducts: addMissingExchangeLearningProducts,
        addMissingProjectDataProducts: addMissingProjectDataProducts,
        addMissingProjectTradingProducts: addMissingProjectTradingProducts,
        addMissingProjectLearningProducts: addMissingProjectLearningProducts,
        createSessionReference: createSessionReference
    }

    return thisObject

    function addAllDataProducts(node) {

        /* Validations to see if we can do this or not. */
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a reference parent node to execute this action.')
            return
        }
        if (node.payload.referenceParent.payload === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a reference parent node to execute this action.')
            return
        }

        /* 
        Next, we are going to scan through all the bots of the Data Mine referenced, and for each bot we will
        create a Bots Products node. Later we will scan all the Products Definitions of each bot, and for each one
        we will create a Data Product. In case we find Product Definition Folders, we will recreate that structure
        too, using in this case Data Product Folders.
        */
        let mine = node.payload.referenceParent
        scanBotArray(mine.sensorBots)
        scanBotArray(mine.apiDataFetcherBots)
        scanBotArray(mine.indicatorBots)
        scanBotArray(mine.tradingBots)
        scanBotArray(mine.learningBots)

        function scanBotArray(botArray) {
            if (botArray === undefined) { return }

            for (let i = 0; i < botArray.length; i++) {
                let bot = botArray[i]
                let botProducts = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Bot Products')
                botProducts.name = bot.name
                botProducts.payload.floatingObject.collapseToggle()

                UI.projects.foundations.utilities.folders.asymetricalFolderStructureCloning(
                    bot,
                    botProducts,
                    'products',
                    'productDefinitionFolders',
                    'dataProductFolders',
                    'Data Product',
                    'Data Product Folder',
                    undefined
                )
            }
        }
    }

    function addAllDataMineProducts(node, rootNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Data Mine') {
                let dataMineProducts = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Data Mine Products')
                UI.projects.foundations.functionLibraries.attachDetach.referenceAttachNode(dataMineProducts, rootNode)
            }
        }
    }

    function addAllTradingMineProducts(node, rootNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Trading Mine') {
                let tradingMineProducts = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Trading Mine Products')
                UI.projects.foundations.functionLibraries.attachDetach.referenceAttachNode(tradingMineProducts, rootNode)
            }
        }
    }

    function addAllLearningMineProducts(node, rootNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Learning Mine') {
                let learningMineProducts = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Learning Mine Products')
                UI.projects.foundations.functionLibraries.attachDetach.referenceAttachNode(learningMineProducts, rootNode)
            }
        }
    }

    function addMissingTradingSessionReferences(node, rootNodes) {
        let lanNetworkNode = UI.projects.foundations.utilities.meshes.findNodeInNodeMesh(node, 'LAN Network Node', undefined, true, false, true, false)
        if (lanNetworkNode === undefined) { return }

        let backtestingSessionsArray = UI.projects.foundations.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Backtesting Session')
        let fordwardTestingSessionsArray = UI.projects.foundations.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Forward Testing Session')
        let paperTradingSessionsArray = UI.projects.foundations.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Paper Trading Session')
        let liveTradingSessionsArray = UI.projects.foundations.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Live Trading Session')

        addMissingSession(backtestingSessionsArray)
        addMissingSession(fordwardTestingSessionsArray)
        addMissingSession(paperTradingSessionsArray)
        addMissingSession(liveTradingSessionsArray)

        function addMissingSession(sessionsArray) {
            for (let i = 0; i < sessionsArray.length; i++) {
                let session = sessionsArray[i]
                /* We will filter out all the sessions that does not belong to the market we are in */
                let marketTradingTasks = UI.projects.foundations.utilities.meshes.findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                if (node.payload.referenceParent.id !== marketTradingTasks.payload.referenceParent.id) { continue }
                if (UI.projects.foundations.utilities.nodeChildren.isMissingChildrenById(node, session, true) === true) {
                    createSessionReference(node, session, 'Trading Session Reference')
                }
            }
        }
    }

    function addMissingLearningSessionReferences(node, rootNodes) {
        let lanNetworkNode = UI.projects.foundations.utilities.meshes.findNodeInNodeMesh(node, 'LAN Network Node', undefined, true, false, true, false)
        if (lanNetworkNode === undefined) { return }

        let backLearningSessionsArray = UI.projects.foundations.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Back Learning Session')
        let liveLearningSessionsArray = UI.projects.foundations.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Live Learning Session')

        addMissingSession(backLearningSessionsArray)
        addMissingSession(liveLearningSessionsArray)

        function addMissingSession(sessionsArray) {
            for (let i = 0; i < sessionsArray.length; i++) {
                let session = sessionsArray[i]
                /* We will filter out all the sessions that does not belong to the market we are in */
                let marketLearningTasks = UI.projects.foundations.utilities.meshes.findNodeInNodeMesh(session, 'Market Learning Tasks', undefined, true, false, true, false)
                if (node.payload.referenceParent.id !== marketLearningTasks.payload.referenceParent.id) { continue }
                if (UI.projects.foundations.utilities.nodeChildren.isMissingChildrenById(node, session, true) === true) {
                    createSessionReference(node, session, 'Learning Session Reference')
                }
            }
        }
    }

    function createSessionReference(node, session, nodeType) {
        let sessionReference = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, nodeType)
        UI.projects.foundations.functionLibraries.attachDetach.referenceAttachNode(sessionReference, session)
    }

    function addMissingMarketDataProducts(node, rootNodes) {
        addMissingMarketProducts(node, rootNodes, 'Market Data Products')
    }

    function addMissingMarketTradingProducts(node, rootNodes) {
        addMissingMarketProducts(node, rootNodes, 'Market Trading Products')
    }

    function addMissingMarketLearningProducts(node, rootNodes) {
        addMissingMarketProducts(node, rootNodes, 'Market Learning Products')
    }

    function addMissingMarketProducts(node, rootNodes, newNodeType) {
        if (node.payload.referenceParent === undefined) { return }
        if (node.payload.referenceParent.exchangeMarkets === undefined) { return }
        let marketsArray = node.payload.referenceParent.exchangeMarkets.markets

        for (let i = 0; i < marketsArray.length; i++) {
            let market = marketsArray[i]
            if (UI.projects.foundations.utilities.nodeChildren.isMissingChildrenById(node, market, true) === true) {
                let marketDataProducts = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, newNodeType)
                UI.projects.foundations.functionLibraries.attachDetach.referenceAttachNode(marketDataProducts, market)
            }
        }
    }

    function addMissingExchangeDataProducts(node, rootNodes) {
        addMissingExchange(node, rootNodes, 'Exchange Data Products')
    }

    function addMissingExchangeTradingProducts(node, rootNodes) {
        addMissingExchange(node, rootNodes, 'Exchange Trading Products')
    }

    function addMissingExchangeLearningProducts(node, rootNodes) {
        addMissingExchange(node, rootNodes, 'Exchange Learning Products')
    }

    function addMissingExchange(node, rootNodes, newNodeType) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Crypto Ecosystem') {
                let cryptoEcosystem = rootNode
                for (let j = 0; j < cryptoEcosystem.cryptoExchanges.length; j++) {
                    let cryptoExchanges = cryptoEcosystem.cryptoExchanges[j]
                    for (let k = 0; k < cryptoExchanges.exchanges.length; k++) {
                        let cryptoExchange = cryptoExchanges.exchanges[k]
                        if (UI.projects.foundations.utilities.nodeChildren.isMissingChildrenById(node, cryptoExchange, true) === true) {
                            let exchange = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, newNodeType)
                            UI.projects.foundations.functionLibraries.attachDetach.referenceAttachNode(exchange, cryptoExchange)
                        }
                    }
                }
            }
        }
    }


    function addMissingProjectDataProducts(node, rootNodes) {
        addMissingProject(node, rootNodes, 'Project Data Products')
    }

    function addMissingProjectTradingProducts(node, rootNodes) {
        addMissingProject(node, rootNodes, 'Project Trading Products')
    }

    function addMissingProjectLearningProducts(node, rootNodes) {
        addMissingProject(node, rootNodes, 'Project Learning Products')
    }

    function addMissingProject(node, rootNodes, newNodeType) {
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = projectDefinition.name

            for (let j = 0; j < rootNodes.length; j++) {
                let rootNode = rootNodes[j]
                if (rootNode.type === project + ' Project') {
                    let projectDefinition = rootNode.projectDefinition
                    if (projectDefinition !== undefined) {
                        if (UI.projects.foundations.utilities.nodeChildren.isMissingChildrenById(node, projectDefinition, true) === true) {
                            let projectTasks = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, newNodeType, undefined, project)
                            UI.projects.foundations.functionLibraries.attachDetach.referenceAttachNode(projectTasks, projectDefinition)
                        }
                    }
                }
            }
        }
    }
}
