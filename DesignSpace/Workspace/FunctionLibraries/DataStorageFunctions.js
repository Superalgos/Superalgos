function newDataStorageFunctions() {
    thisObject = {
        addAllDataProducts: addAllDataProducts,
        addAllDataMineProducts: addAllDataMineProducts,
        addMissingSessionReferences: addMissingSessionReferences
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
        let dataMine = node.payload.referenceParent
        scanBotArray(dataMine.sensorBots)
        scanBotArray(dataMine.indicatorBots)
        scanBotArray(dataMine.tradingBots)

        function scanBotArray(botArray) {
            for (let i = 0; i < botArray.length; i++) {
                let bot = botArray[i]
                let botProducts = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Bot Products')
                botProducts.name = bot.name

                asymetricalFolderStructureCloning(
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

    function addMissingSessionReferences(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let networkNode = findNodeInNodeMesh(node, 'Network Node', true, false, true, false)
        if (networkNode === undefined) {return}

        let backtestingSessionsArray = nodeBranchToArray(networkNode, 'Backtesting Session')
        let fordwardTestingSessionsArray = nodeBranchToArray(networkNode, 'Fordward Testing Session')
        let paperTradingSessionsArray = nodeBranchToArray(networkNode, 'Paper Trading Session')
        let liveTradingSessionsArray = nodeBranchToArray(networkNode, 'Live Trading Session')

        addMissingSession(backtestingSessionsArray)
        addMissingSession(fordwardTestingSessionsArray)
        addMissingSession(paperTradingSessionsArray)
        addMissingSession(liveTradingSessionsArray)

        function addMissingSession(sessionsArray) {
            for (let i = 0; i < sessionsArray.length; i++) {
                let session = sessionsArray[i]
                if (isMissingChildren(node, session, true) === true) {
                    let sessionReference = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Session Reference')
                    sessionReference.payload.referenceParent = session
                }
            }
        }
    }
}
