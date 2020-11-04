function newDataStorageFunctions() {
    thisObject = {
        addAllDataProducts: addAllDataProducts,
        addAllDataMineProducts: addAllDataMineProducts,
        addAllTradingMineProducts: addAllTradingMineProducts,
        addAllLearningMineProducts: addAllLearningMineProducts,
        addMissingTradingSessionReferences: addMissingTradingSessionReferences,
        addMissingLearningSessionReferences: addMissingLearningSessionReferences, 
        addMissingMarketDataProducts: addMissingMarketDataProducts,
        addMissingMarketTradingProducts: addMissingMarketTradingProducts,
        addMissingExchangeTradingProducts: addMissingExchangeTradingProducts,
        addMissingExchangeDataProducts: addMissingExchangeDataProducts, 
        createSessionReference: createSessionReference
    }

    return thisObject

    function addAllDataProducts(node, functionLibraryUiObjectsFromNodes) {

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
        scanBotArray(mine.indicatorBots)
        scanBotArray(mine.tradingBots)

        function scanBotArray(botArray) {
            if (botArray === undefined) { return }

            for (let i = 0; i < botArray.length; i++) {
                let bot = botArray[i]
                let botProducts = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Bot Products')
                botProducts.name = bot.name
                botProducts.payload.floatingObject.collapseToggle()

                UI.projects.superalgos.utilities.folders.asymetricalFolderStructureCloning(
                    bot,
                    botProducts,
                    'products',
                    'productDefinitionFolders',
                    'dataProductFolders',
                    'Data Product',
                    'Data Product Folder',
                    undefined,
                    functionLibraryUiObjectsFromNodes
                )
            }
        }
    }

    function addAllDataMineProducts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Data Mine') {
                let dataMineProducts = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Data Mine Products')
                dataMineProducts.payload.referenceParent = rootNode
            }
        }
    }

    function addAllTradingMineProducts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Trading Mine') {
                let tradingMineProducts = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Trading Mine Products')
                tradingMineProducts.payload.referenceParent = rootNode
            }
        }
    }

    function addAllLearningMineProducts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]

            if (rootNode.type === 'Learning Mine') {
                let learningMineProducts = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Learning Mine Products')
                learningMineProducts.payload.referenceParent = rootNode
            }
        }
    }

    function addMissingTradingSessionReferences(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let networkNode = UI.projects.superalgos.utilities.meshes.findNodeInNodeMesh(node, 'Network Node', undefined, true, false, true, false)
        if (networkNode === undefined) { return }

        let backtestingSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Backtesting Session')
        let fordwardTestingSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Forward Testing Session')
        let paperTradingSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Paper Trading Session')
        let liveTradingSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Live Trading Session')

        addMissingSession(backtestingSessionsArray)
        addMissingSession(fordwardTestingSessionsArray)
        addMissingSession(paperTradingSessionsArray)
        addMissingSession(liveTradingSessionsArray)

        function addMissingSession(sessionsArray) {
            for (let i = 0; i < sessionsArray.length; i++) {
                let session = sessionsArray[i]
                /* We will filter out all the sessions that does not belong to the market we are in */
                let marketTradingTasks = UI.projects.superalgos.utilities.meshes.findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                if (node.payload.referenceParent.id !== marketTradingTasks.payload.referenceParent.id) { continue }
                if (UI.projects.superalgos.utilities.children.isMissingChildren(node, session, true) === true) {
                    createSessionReference(node, session, 'Trading Session Reference', functionLibraryUiObjectsFromNodes)
                }
            }
        }
    }

    function addMissingLearningSessionReferences(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let networkNode = UI.projects.superalgos.utilities.meshes.findNodeInNodeMesh(node, 'Network Node', undefined, true, false, true, false)
        if (networkNode === undefined) { return }

        let learningSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Learning Session')

        addMissingSession(learningSessionsArray)

        function addMissingSession(sessionsArray) {
            for (let i = 0; i < sessionsArray.length; i++) {
                let session = sessionsArray[i]
                /* We will filter out all the sessions that does not belong to the market we are in */
                let marketLearningTasks = UI.projects.superalgos.utilities.meshes.findNodeInNodeMesh(session, 'Market Learning Tasks', undefined, true, false, true, false)
                if (node.payload.referenceParent.id !== marketLearningTasks.payload.referenceParent.id) { continue }
                if (UI.projects.superalgos.utilities.children.isMissingChildren(node, session, true) === true) {
                    createSessionReference(node, session, 'Learning Session Reference', functionLibraryUiObjectsFromNodes)
                }
            }
        }
    }

    function createSessionReference(node, session, nodeType, functionLibraryUiObjectsFromNodes) {
        let sessionReference = functionLibraryUiObjectsFromNodes.addUIObject(node, nodeType)
        sessionReference.payload.referenceParent = session
    }

    function addMissingMarketDataProducts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        addMissingMarketProducts(node, rootNodes, 'Market Data Products', functionLibraryUiObjectsFromNodes)
    }

    function addMissingMarketTradingProducts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        addMissingMarketProducts(node, rootNodes, 'Market Trading Products', functionLibraryUiObjectsFromNodes)
    }

    function addMissingMarketProducts(node, rootNodes, newNodeType, functionLibraryUiObjectsFromNodes) {
        if (node.payload.referenceParent === undefined) { return }
        if (node.payload.referenceParent.exchangeMarkets === undefined) { return }
        let marketsArray = node.payload.referenceParent.exchangeMarkets.markets

        for (let i = 0; i < marketsArray.length; i++) {
            let market = marketsArray[i]
            if (UI.projects.superalgos.utilities.children.isMissingChildren(node, market, true) === true) {
                let marketDataProducts = functionLibraryUiObjectsFromNodes.addUIObject(node, newNodeType)
                marketDataProducts.payload.referenceParent = market
            }
        }
    }

    function addMissingExchangeTradingProducts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        addMissingExchange(node, rootNodes, 'Exchange Trading Products', functionLibraryUiObjectsFromNodes)
    }

    function addMissingExchangeDataProducts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        addMissingExchange(node, rootNodes, 'Exchange Data Products', functionLibraryUiObjectsFromNodes)
    }

    function addMissingExchange(node, rootNodes, newNodeType, functionLibraryUiObjectsFromNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Crypto Ecosystem') {
                let cryptoEcosystem = rootNode
                for (let j = 0; j < cryptoEcosystem.cryptoExchanges.length; j++) {
                    let cryptoExchanges = cryptoEcosystem.cryptoExchanges[j]
                    for (let k = 0; k < cryptoExchanges.exchanges.length; k++) {
                        let cryptoExchange = cryptoExchanges.exchanges[k]
                        if (UI.projects.superalgos.utilities.children.isMissingChildren(node, cryptoExchange, true) === true) {
                            let exchange = functionLibraryUiObjectsFromNodes.addUIObject(node, newNodeType)
                            exchange.payload.referenceParent = cryptoExchange
                        }
                    }
                }
            }
        }
    }
}
