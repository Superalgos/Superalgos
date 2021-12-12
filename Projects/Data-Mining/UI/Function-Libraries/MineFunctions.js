function newDataMiningFunctionLibraryMineFunctions() {
    let thisObject = {
        addAllOutputDatasets: addAllOutputDatasets,
        addAllDataDependencies: addAllDataDependencies, 
        addAllDataMineDataDependencies: addAllDataMineDataDependencies
    }

    return thisObject

    function addAllOutputDatasets(node) {

        /* Validations to see if we can do this or not. */
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        if (node.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a parent node to execute this action.')
            return
        }
        if (node.payload.parentNode.payload === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a parent node to execute this action.')
            return
        }
        if (node.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a grand parent node to execute this action.')
            return
        }

        /* 
        Next, we are going to scan recursively through all nodes of type Product Definition Folder
        and Product Definition. For each Product Definition Folder we will create a counterpart
        Output Dataset Folder, and for each Product Definition found we will create a Output Definition
        for each Dataset defined inside the Product Definition.
        */
        UI.projects.foundations.utilities.folders.asymetricalFolderStructureCloning(
            node.payload.parentNode.payload.parentNode,
            node,
            'products',
            'productDefinitionFolders',
            'outputDatasetFolders',
            'Output Dataset',
            'Output Dataset Folder',
            'datasets'
        )
    }

    function addAllDataDependencies(node) {

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
        create a Bots Data Dependency node. Later we will scan all the Products Definitions of each bot, and for each 
        Dataset of each Product we will create a Data Dependency. In case we find Product Definition Folders, we will 
        recreate that structure too, using in this case Data Dependency Folders.
        */
        let dataMine = node.payload.referenceParent
        scanBotArray(dataMine.sensorBots)
        scanBotArray(dataMine.apiDataFetcherBots)
        scanBotArray(dataMine.indicatorBots)
        scanBotArray(dataMine.tradingBots)
        scanBotArray(dataMine.portfolioBots)
        scanBotArray(dataMine.learningBots)

        function scanBotArray(botArray) {
            for (let i = 0; i < botArray.length; i++) {
                let bot = botArray[i]
                let botProducts = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Bot Data Dependencies')
                botProducts.name = bot.name

                UI.projects.foundations.utilities.folders.asymetricalFolderStructureCloning(
                    bot,
                    botProducts,
                    'products',
                    'productDefinitionFolders',
                    'dataDependencyFolders',
                    'Data Dependency',
                    'Data Dependency Folder',
                    'datasets'
                )
            }
        }
    }

    function addAllDataMineDataDependencies(node, rootNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            
            if (rootNode.type === 'Data Mine') {
                let dataMineDataDependencies = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Data Mine Data Dependencies')
                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(dataMineDataDependencies, rootNode)
            }
        }
    }
}
