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
        createSessionReference: createSessionReference,
        addAllPortfolioMineProducts: addAllPortfolioMineProducts,
        addMissingPortfolioSessionReferences: addMissingPortfolioSessionReferences,
        addMissingMarketPortfolioProducts: addMissingMarketPortfolioProducts,
        addMissingExchangePortfolioProducts: addMissingExchangePortfolioProducts,
        addMissingProjectPortfolioProducts: addMissingProjectPortfolioProducts,
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
        let newUiObjects = []
        let mine = node.payload.referenceParent
        scanBotArray(mine.sensorBots)
        scanBotArray(mine.apiDataFetcherBots)
        scanBotArray(mine.indicatorBots)
        scanBotArray(mine.studyBots)
        scanBotArray(mine.tradingBots)
        scanBotArray(mine.portfolioBots)
        scanBotArray(mine.learningBots)

        function scanBotArray(botArray) {
            if (botArray === undefined) { return }

            for (let i = 0; i < botArray.length; i++) {
                let bot = botArray[i]
                let botProducts = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Bot Products', undefined, 'Foundations')
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

                if (botProducts !== undefined) {
                    newUiObjects.push(botProducts)
                }
            }
        }

        return newUiObjects
    }

    function addAllDataMineProducts(node, rootNodes) {
        let newUiObjects = []
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Data Mine') {
                let dataMineProducts = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Data Mine Products')
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(dataMineProducts, rootNode)
                if (dataMineProducts !== undefined) {
                    newUiObjects.push(dataMineProducts)
                }
            }
        }

        return newUiObjects
    }

    function addAllTradingMineProducts(node, rootNodes) {
        let newUiObjects = []
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Trading Mine') {
                let tradingMineProducts = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Trading Mine Products')
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(tradingMineProducts, rootNode)
                if (tradingMineProducts !== undefined) {
                    newUiObjects.push(tradingMineProducts)
                }
            }
        }

        return newUiObjects
    }

    function addAllPortfolioMineProducts(node, rootNodes) {
        let newUiObjects = []
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Portfolio Mine') {
                let portfolioMineProducts = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Portfolio Mine Products')
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(portfolioMineProducts, rootNode)
                if (portfolioMineProducts !== undefined) {
                    newUiObjects.push(portfolioMineProducts)
                }
            }
        }

        return newUiObjects
    }

    function addAllLearningMineProducts(node, rootNodes) {
        let newUiObjects = []
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Learning Mine') {
                let learningMineProducts = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Learning Mine Products')
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(learningMineProducts, rootNode)
                if (learningMineProducts !== undefined) {
                    newUiObjects.push(learningMineProducts)
                }
            }
        }

        return newUiObjects
    }

    function addMissingTradingSessionReferences(node, rootNodes) {
        let newUiObjects = []
        let lanNetworkNode = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(node, 'LAN Network Node', undefined, true, false, true, false)
        if (lanNetworkNode === undefined) { return }

        let backtestingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Backtesting Session')
        let fordwardTestingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Forward Testing Session')
        let paperTradingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Paper Trading Session')
        let liveTradingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Live Trading Session')

        addMissingSession(backtestingSessionsArray)
        addMissingSession(fordwardTestingSessionsArray)
        addMissingSession(paperTradingSessionsArray)
        addMissingSession(liveTradingSessionsArray)

        function addMissingSession(sessionsArray) {
            for (let i = 0; i < sessionsArray.length; i++) {
                let session = sessionsArray[i]
                /* We will filter out all the sessions that does not belong to the market we are in */
                let marketTradingTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                if (node.payload.referenceParent.id !== marketTradingTasks.payload.referenceParent.id) { continue }
                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, session, true) === true) {
                    let sessionReference = createSessionReference(node, session, 'Trading Session Reference')
                    if (sessionReference !== undefined) {
                        newUiObjects.push(sessionReference)
                    }
                }
            }
        }

        return newUiObjects
    }

    function addMissingPortfolioSessionReferences(node, rootNodes) {
        let newUiObjects = []
        let lanNetworkNode = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(node, 'LAN Network Node', undefined, true, false, true, false)
        if (lanNetworkNode === undefined) { return }

        let backtestingPortfolioSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Backtesting Portfolio Session')
        let livePortfolioSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Live Portfolio Session')

        addMissingSession(backtestingPortfolioSessionsArray)
        addMissingSession(livePortfolioSessionsArray)

        function addMissingSession(sessionsArray) {
            for (let i = 0; i < sessionsArray.length; i++) {
                let session = sessionsArray[i]
                /* We will filter out all the sessions that does not belong to the market we are in */
                let marketPortfolioTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Portfolio Tasks', undefined, true, false, true, false)
                if (node.payload.referenceParent.id !== marketPortfolioTasks.payload.referenceParent.id) { continue }
                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, session, true) === true) {
                    let sessionReference = createSessionReference(node, session, 'Portfolio Session Reference')
                    if (sessionReference !== undefined) {
                        newUiObjects.push(sessionReference)
                    }
                }
            }
        }

        return newUiObjects
    }

    function addMissingLearningSessionReferences(node, rootNodes) {
        let newUiObjects = []
        let lanNetworkNode = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(node, 'LAN Network Node', undefined, true, false, true, false)
        if (lanNetworkNode === undefined) { return }

        let backLearningSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Back Learning Session')
        let liveLearningSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Live Learning Session')

        addMissingSession(backLearningSessionsArray)
        addMissingSession(liveLearningSessionsArray)

        function addMissingSession(sessionsArray) {
            for (let i = 0; i < sessionsArray.length; i++) {
                let session = sessionsArray[i]
                /* We will filter out all the sessions that does not belong to the market we are in */
                let marketLearningTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Learning Tasks', undefined, true, false, true, false)
                if (node.payload.referenceParent.id !== marketLearningTasks.payload.referenceParent.id) { continue }
                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, session, true) === true) {
                    let sessionReference = createSessionReference(node, session, 'Learning Session Reference')
                    if (sessionReference !== undefined) {
                        newUiObjects.push(sessionReference)
                    }
                }
            }
        }

        return newUiObjects
    }

    function createSessionReference(node, session, nodeType) {
        let sessionReference = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, nodeType)
        UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(sessionReference, session)
        return sessionReference
    }

    function addMissingMarketDataProducts(node, rootNodes) {
        return addMissingMarketProducts(node, rootNodes, 'Market Data Products')
    }

    function addMissingMarketTradingProducts(node, rootNodes) {
        return addMissingMarketProducts(node, rootNodes, 'Market Trading Products')
    }

    function addMissingMarketPortfolioProducts(node, rootNodes) {
        return addMissingMarketProducts(node, rootNodes, 'Market Portfolio Products')
    }

    function addMissingMarketLearningProducts(node, rootNodes) {
        return addMissingMarketProducts(node, rootNodes, 'Market Learning Products')
    }

    function addMissingMarketProducts(node, rootNodes, newNodeType) {
        if (node.payload.referenceParent === undefined) { return }
        if (node.payload.referenceParent.exchangeMarkets === undefined) { return }
        let marketsArray = node.payload.referenceParent.exchangeMarkets.markets
        let newUiObjects = []

        for (let i = 0; i < marketsArray.length; i++) {
            let market = marketsArray[i]
            if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, market, true) === true) {
                let marketDataProducts = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, newNodeType)
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(marketDataProducts, market)
                if (marketDataProducts !== undefined) {
                    newUiObjects.push(marketDataProducts)
                }
            }
        }

        return newUiObjects
    }

    function addMissingExchangeDataProducts(node, rootNodes) {
        return addMissingExchange(node, rootNodes, 'Exchange Data Products')
    }

    function addMissingExchangeTradingProducts(node, rootNodes) {
        return addMissingExchange(node, rootNodes, 'Exchange Trading Products')
    }

    function addMissingExchangePortfolioProducts(node, rootNodes) {
        return addMissingExchange(node, rootNodes, 'Exchange Portfolio Products')
    }

    function addMissingExchangeLearningProducts(node, rootNodes) {
        return addMissingExchange(node, rootNodes, 'Exchange Learning Products')
    }

    function addMissingExchange(node, rootNodes, newNodeType) {
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
                            let exchange = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, newNodeType)
                            UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(exchange, cryptoExchange)
                            if (exchange !== undefined) {
                                newUiObjects.push(exchange)
                            }
                        }
                    }
                }
            }
        }

        return newUiObjects
    }


    function addMissingProjectDataProducts(node, rootNodes) {
        return addMissingProject(node, rootNodes, 'Project Data Products')
    }

    function addMissingProjectTradingProducts(node, rootNodes) {
        return addMissingProject(node, rootNodes, 'Project Trading Products')
    }

    function addMissingProjectPortfolioProducts(node, rootNodes) {
        return addMissingProject(node, rootNodes, 'Project Portfolio Products')
    }

    function addMissingProjectLearningProducts(node, rootNodes) {
        return addMissingProject(node, rootNodes, 'Project Learning Products')
    }

    function addMissingProject(node, rootNodes, newNodeType) {
        let newUiObjects = []
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = projectDefinition.name

            if (projectDefinition.products === undefined) { continue }
            if (projectDefinition.products.includes(newNodeType.replace('Project ', '')) === false) { continue }

            for (let j = 0; j < rootNodes.length; j++) {
                let rootNode = rootNodes[j]
                if (rootNode.type === project + ' Project') {
                    let projectDefinition = rootNode.projectDefinition
                    if (projectDefinition !== undefined) {
                        if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, projectDefinition, true) === true) {
                            let projectTasks = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, newNodeType, undefined, project)
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
}
