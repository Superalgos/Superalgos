function newVisualScritingFunctionLibraryUiObjectsFromNodes() {
    let thisObject = {
        synchronizeTasksFoundAtWorkspaceWithBackEnd: synchronizeTasksFoundAtWorkspaceWithBackEnd,
        synchronizeTradingSessionsFoundAtWorkspaceWithBackEnd: synchronizeTradingSessionsFoundAtWorkspaceWithBackEnd,
        synchronizePortfolioSessionsFoundAtWorkspaceWithBackEnd: synchronizePortfolioSessionsFoundAtWorkspaceWithBackEnd,
        synchronizeLearningSessionsFoundAtWorkspaceWithBackEnd: synchronizeLearningSessionsFoundAtWorkspaceWithBackEnd,
        playTutorials: playTutorials,
        recreateWorkspace: recreateWorkspace,
        getNodeById: getNodeById,
        tryToConnectChildrenWithReferenceParents: tryToConnectChildrenWithReferenceParents,
        createUiObjectFromNode: createUiObjectFromNode,
        addUIObject: addUIObject,
        addMissingChildren: addMissingChildren
    }

    let mapOfReferenceChildren = new Map()
    let mapOfNodes
    let tasksFoundAtWorkspace
    let tradingSessionsFoundAtWorkspace
    let portfolioSessionsFoundAtWorkspace
    let learningSessionsFoundAtWorkspace
    let tutorialsToPlay

    return thisObject

    function getNodeById(nodeId) {
        return mapOfNodes.get(nodeId)
    }

    function recreateWorkspace(node, callBackFunction) {
        mapOfNodes = new Map()
        tasksFoundAtWorkspace = []
        tradingSessionsFoundAtWorkspace = []
        portfolioSessionsFoundAtWorkspace = []
        learningSessionsFoundAtWorkspace = []
        tutorialsToPlay = []

        /* Initializing the workspace config */
        if (node.config === undefined || node.config === 'undefined') { node.config = '{}' }

        removeNullRootNodes()

        function removeNullRootNodes() {
            for (let i = 0; i < node.rootNodes.length; i++) {
                let rootNode = node.rootNodes[i]
                if (rootNode === null) {
                    node.rootNodes.splice(i, 1)
                    removeNullRootNodes()
                    return
                }
            }
        }

        addPluginNodes()

        function addPluginNodes(pluginNames) {
            UI.projects.foundations.utilities.statusBar.changeStatus("Loading Plugins...")

            let blobService = newFileStorage()
            let totalPlugin = 0
            let totalRead = 0

            for (let i = 0; i < node.rootNodes.length; i++) {
                let rootNode = node.rootNodes[i]
                if (rootNode.type === 'Plugins') {
                    let plugins = rootNode

                    if (plugins.pluginProjects === undefined) { continue }
                    for (let j = 0; j < plugins.pluginProjects.length; j++) {
                        let project = plugins.pluginProjects[j]
                        /*
                        Miscellaneous Plugin Types
                        */
                        if (project.pluginDataMines !== undefined) {
                            totalPlugin = totalPlugin + project.pluginDataMines.pluginFiles.length
                            pluginAllTheseFiles(project.pluginDataMines.pluginFiles, 'Data-Mines')
                        }
                        if (project.pluginTradingMines !== undefined) {
                            totalPlugin = totalPlugin + project.pluginTradingMines.pluginFiles.length
                            pluginAllTheseFiles(project.pluginTradingMines.pluginFiles, 'Trading-Mines')
                        }
                        if (project.pluginTradingSystems !== undefined) {
                            totalPlugin = totalPlugin + project.pluginTradingSystems.pluginFiles.length
                            pluginAllTheseFiles(project.pluginTradingSystems.pluginFiles, 'Trading-Systems')
                        }
                        if (project.pluginTradingEngines !== undefined) {
                            totalPlugin = totalPlugin + project.pluginTradingEngines.pluginFiles.length
                            pluginAllTheseFiles(project.pluginTradingEngines.pluginFiles, 'Trading-Engines')
                        }
                        if (project.pluginPortfolioMines !== undefined) {
                            totalPlugin = totalPlugin + project.pluginPortfolioMines.pluginFiles.length
                            pluginAllTheseFiles(project.pluginPortfolioMines.pluginFiles, 'Portfolio-Mines')
                        }
                        if (project.pluginPortfolioSystems !== undefined) {
                            totalPlugin = totalPlugin + project.pluginPortfolioSystems.pluginFiles.length
                            pluginAllTheseFiles(project.pluginPortfolioSystems.pluginFiles, 'Portfolio-Systems')
                        }
                        if (project.pluginPortfolioEngines !== undefined) {
                            totalPlugin = totalPlugin + project.pluginPortfolioEngines.pluginFiles.length
                            pluginAllTheseFiles(project.pluginPortfolioEngines.pluginFiles, 'Portfolio-Engines')
                        }
                        if (project.pluginLearningMines !== undefined) {
                            totalPlugin = totalPlugin + project.pluginLearningMines.pluginFiles.length
                            pluginAllTheseFiles(project.pluginLearningMines.pluginFiles, 'Learning-Mines')
                        }
                        if (project.pluginLearningSystems !== undefined) {
                            totalPlugin = totalPlugin + project.pluginLearningSystems.pluginFiles.length
                            pluginAllTheseFiles(project.pluginLearningSystems.pluginFiles, 'Learning-Systems')
                        }
                        if (project.pluginLearningEngines !== undefined) {
                            totalPlugin = totalPlugin + project.pluginLearningEngines.pluginFiles.length
                            pluginAllTheseFiles(project.pluginLearningEngines.pluginFiles, 'Learning-Engines')
                        }
                        /*
                        Foundations Plugin Types
                        */
                        if (project.pluginTutorials !== undefined) {
                            totalPlugin = totalPlugin + project.pluginTutorials.pluginFiles.length
                            pluginAllTheseFiles(project.pluginTutorials.pluginFiles, 'Tutorials')
                        }
                        if (project.pluginApiMaps !== undefined) {
                            totalPlugin = totalPlugin + project.pluginApiMaps.pluginFiles.length
                            pluginAllTheseFiles(project.pluginApiMaps.pluginFiles, 'API-Maps')
                        }
                        /*
                        Governance Plugin Types
                        */
                        if (project.pluginUserProfiles !== undefined) {
                            totalPlugin = totalPlugin + project.pluginUserProfiles.pluginFiles.length
                            pluginAllTheseFiles(project.pluginUserProfiles.pluginFiles, 'User-Profiles')
                        }
                        if (project.pluginPools !== undefined) {
                            totalPlugin = totalPlugin + project.pluginPools.pluginFiles.length
                            pluginAllTheseFiles(project.pluginPools.pluginFiles, 'Pools')
                        }
                        if (project.pluginFeatures !== undefined) {
                            totalPlugin = totalPlugin + project.pluginFeatures.pluginFiles.length
                            pluginAllTheseFiles(project.pluginFeatures.pluginFiles, 'Features')
                        }
                        if (project.pluginAssets !== undefined) {
                            totalPlugin = totalPlugin + project.pluginAssets.pluginFiles.length
                            pluginAllTheseFiles(project.pluginAssets.pluginFiles, 'Assets')
                        }
                        if (project.pluginPositions !== undefined) {
                            totalPlugin = totalPlugin + project.pluginPositions.pluginFiles.length
                            pluginAllTheseFiles(project.pluginPositions.pluginFiles, 'Positions')
                        }
                    }
                }
            }

            /*
            If there is no Plugins node at the workspace, we load it anyways here.
            */
            if (totalPlugin === 0) {
                addUserDefinedNodes()
            }

            function pluginAllTheseFiles(pluginFiles, pluginFolder) {
                for (let i = 0; i < pluginFiles.length; i++) {
                    let pluginFile = pluginFiles[i]
                    let name = pluginFile.name
                    let folder = pluginFolder
                    let project = "Foundations"
                    try {
                        let config = JSON.parse(pluginFile.config)
                        if (config.project !== undefined) {
                            project = config.project
                        }
                        if (config.fileName !== undefined) {
                            name = config.fileName
                        }
                        if (config.folderName !== undefined) {
                            folder = config.folderName
                        }
                    } catch (err) { }

                    httpRequest(undefined, 'LoadPlugin' + '/' + project + '/' + folder + '/' + name + '.json', onFileReceived)

                    function onFileReceived(err, text, response) {

                        if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                            console.log('[WARN] Cannot load plugin ' + pluginFolder + ' ' + name + '. The Workspace will be loaded with this plugin file missing.')
                        } else {

                            let receivedNode

                            try {
                                receivedNode = JSON.parse(text)
                            } catch (err) {
                                console.log('[ERROR] pluginAllTheseFiles -> Cannot load plugin ' + pluginFolder + ' ' + name + '. Received an invalid JSON object from the client.')
                                console.log('[ERROR] pluginAllTheseFiles -> text = ' + text)
                                console.log('[ERROR] pluginAllTheseFiles -> err.stack = ' + err.stack)
                                return
                            }

                            /*
                            If the workspace already contains a root node with the id of the head of the hierarchy
                            we are loading, we remove it because the plugin file has precedence.
                            */
                            for (let i = 0; i < node.rootNodes.length; i++) {
                                let rootNode = node.rootNodes[i]
                                if (rootNode.id === receivedNode.id) {
                                    console.log('[WARN] The node with name "' + rootNode.name + '" and type "' + rootNode.type + '" will be replaced by the node with name "' + receivedNode.name + '" and type "' + receivedNode.type + '" because they both have the same node.id')
                                    node.rootNodes.splice(i, 1)
                                    break
                                }
                            }
                            receivedNode.isPlugin = true
                            /*
                            We will force the Plugin codeName to the same to the fileName.
                            */
                            let config
                            try {
                                config = JSON.parse(receivedNode.config)
                            } catch (err) {
                                config = {}
                            }

                            config.codeName = name
                            receivedNode.config = JSON.stringify(config)

                            if (pluginFile.pluginFilePosition !== undefined && receivedNode.savedPayload !== undefined) {
                                let positionOffset = {
                                    x: pluginFile.pluginFilePosition.savedPayload.position.x - receivedNode.savedPayload.position.x,
                                    y: pluginFile.pluginFilePosition.savedPayload.position.y - receivedNode.savedPayload.position.y
                                }
                                receivedNode.positionOffset = positionOffset
                            }

                            node.rootNodes.unshift(receivedNode)
                        }

                        totalRead++
                        if (totalPlugin === totalRead) {
                            addUserDefinedNodes()
                        }
                    }
                }
            }
        }

        function addUserDefinedNodes() {
            /* Create the workspace UI OObject and then continue with the root nodes. */
            createUiObject(false, 'Workspace', node.name, node, undefined, undefined, 'Workspace')
            if (node.rootNodes !== undefined) {
                UI.projects.foundations.utilities.statusBar.changeStatus("Setting up Rootnodes...")

                let rootNode
                let i = -1
                controlLoop()

                function loopBody() {
                    createUiObjectFromNode(rootNode, undefined, undefined)
                    controlLoop()
                }

                function controlLoop() {
                    i++
                    if (i < node.rootNodes.length) {
                        rootNode = node.rootNodes[i]
                        UI.projects.foundations.utilities.statusBar.changeStatus("Connecting children nodes from " + rootNode.name + " - " + rootNode.type + "...")
                        setTimeout(loopBody, 100)
                    } else {
                        UI.projects.foundations.utilities.statusBar.changeStatus("Finished connecting all nodes.")
                        setTimeout(endLoop, 100)
                    }
                }
            }
            function endLoop() {
                tryToConnectChildrenWithReferenceParents()

                if (callBackFunction !== undefined) {
                    callBackFunction() // The recreation of the workspace is complete
                }
            }
        }
    }

    function synchronizeTasksFoundAtWorkspaceWithBackEnd() {
        for (let i = 0; i < tasksFoundAtWorkspace.length; i++) {
            let node = tasksFoundAtWorkspace[i]
            UI.projects.foundations.functionLibraries.taskFunctions.synchronizeTaskWithBackEnd(node)
        }
        tasksFoundAtWorkspace = undefined
    }

    function synchronizeTradingSessionsFoundAtWorkspaceWithBackEnd() {
        for (let i = 0; i < tradingSessionsFoundAtWorkspace.length; i++) {
            let node = tradingSessionsFoundAtWorkspace[i]
            UI.projects.algorithmicTrading.functionLibraries.tradingSessionFunctions.synchronizeSessionWithBackEnd(node)
        }
        tradingSessionsFoundAtWorkspace = undefined
    }

    function synchronizePortfolioSessionsFoundAtWorkspaceWithBackEnd() {
        for (let i = 0; i < portfolioSessionsFoundAtWorkspace.length; i++) {
            let node = portfolioSessionsFoundAtWorkspace[i]
            UI.projects.portfolioManagement.functionLibraries.portfolioSessionFunctions.synchronizeSessionWithBackEnd(node)
        }
        portfolioSessionsFoundAtWorkspace = undefined
    }

    function synchronizeLearningSessionsFoundAtWorkspaceWithBackEnd() {
        for (let i = 0; i < learningSessionsFoundAtWorkspace.length; i++) {
            let node = learningSessionsFoundAtWorkspace[i]
            UI.projects.machineLearning.functionLibraries.learningSessionFunctions.synchronizeSessionWithBackEnd(node)
        }
        learningSessionsFoundAtWorkspace = undefined
    }

    function playTutorials() {
        for (let i = 0; i < tutorialsToPlay.length; i++) {
            let node = tutorialsToPlay[i]
            node.payload.uiObject.menu.internalClick('Play Tutorial')
        }
        tutorialsToPlay = undefined
    }

    function tryToConnectChildrenWithReferenceParents() {
        /* We reconstruct here the reference relationships. */
        for (const [key, node] of mapOfNodes) {

            if (node.payload === undefined) { continue }

            if (node.payload.referenceParent !== undefined) {
                if (node.payload.referenceParent.cleaned === true) {
                    node.payload.referenceParent = mapOfNodes.get(node.payload.referenceParent.id)
                    if (node.payload.referenceParent === undefined) {
                        //console.log('[WARN]' + node.type + ' ' + node.name + ' reference parent lost during re-binding phase.')
                    }
                    continue  // We were referencing a deleted node, so we replace it potentially with a newly created one.
                } else {
                    continue  // In this case the reference is already good.
                }
            }

            if (node.savedPayload !== undefined) {
                if (node.savedPayload.referenceParent !== undefined) { // these are children recreated
                    // Reestablish based on Id
                    node.payload.referenceParent = mapOfNodes.get(node.savedPayload.referenceParent.id)

                    // if Reestablishment failed now reestablish reference based on saved path
                    if (node.payload.referenceParent === undefined) {
                        // Gather saved path
                        let rawPath = node.savedPayload.referenceParentCombinedNodePath
                        if (rawPath !== undefined) {
                            // Step down node hierarchy to find missing referenceParent
                            let pathNode
                            let pathName
                            let pathType
                            for (let i = 0; i < rawPath.length; i++) {

                                // Get Hierarchy head node
                                if (i === 0) {
                                    pathName = rawPath[i][0]
                                    pathType = rawPath[i][1]
                                    pathNode = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByCodeNameAndNodeType(pathName, pathType)

                                    // If reference parent is workspace node grab node
                                    if (pathType === "Workspace") {
                                        pathNode = UI.projects.foundations.spaces.designSpace.workspace.workspaceNode
                                    }
                                    // If Hierarchy Head is not located within the workspace abort reconnection
                                    if (pathNode === undefined) {
                                        // LUIS : console.log("[WARN] Abort reconnection saved path head node not found in current workspace", node)
                                        // I removed this warning because at the Governance System is common to reference nodes that are not present at the workspace.
                                    }
                                    continue
                                } else { // Walk through children nodes and find the next node from saved path
                                    if (pathNode !== undefined) { // LUIS: I added this check because it was blowing up further down the line. See why sometimes this is undefined.
                                        pathName = rawPath[i][0]
                                        pathType = rawPath[i][1]
                                        pathNode = getNextNodeFromPath(pathNode, pathName, pathType)
                                    }
                                }
                            }
                            if (pathNode !== undefined) {
                                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(node, pathNode)
                            } else {
                                //console.log("[WARN] ", node.name, ' ', node.type, "failed to fix reference.  Unable to find reference parent ", pathName, ' ', pathType  )
                            }

                            function getNextNodeFromPath(node, pathName, pathType) {
                                let schemaDocument = getSchemaDocument(node)
                                if (schemaDocument === undefined) { return }
                                let nextNode = undefined
                                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {

                                    let property = schemaDocument.childrenNodesProperties[i]
                                    switch (property.type) {
                                        // If child node is directly withing parent node look for it
                                        case 'node': {
                                            if (node[property.name] !== undefined) {
                                                if (node[property.name].name === pathName && node[property.name].type === pathType) {
                                                    nextNode = node[property.name]
                                                    return nextNode
                                                }
                                            }
                                            break
                                        }
                                        // If child node is in an array look for it
                                        case 'array': {
                                            if (node[property.name] !== undefined) {
                                                let nodePropertyArray = node[property.name]
                                                for (let m = 0; m < nodePropertyArray.length; m++) {
                                                    if (nodePropertyArray[m].name === pathName && nodePropertyArray[m].type === pathType) {

                                                        nextNode = nodePropertyArray[m]
                                                        return nextNode
                                                    }
                                                }
                                            }
                                            break
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

    function migrateCodeToConfig(node, schemaDocument) {
        /* Code needed to Migrate from Beta 5 to Beta a Workspace */
        if (schemaDocument.editors !== undefined) {
            if (schemaDocument.editors.config === true) {
                if (node.code !== undefined) {
                    node.config = node.code
                    node.code = undefined
                }
            }
        }
    }

    function createUiObjectFromNode(node, parentNode, chainParent, positionOffset) {

        /* Migration code from beta 10 to beta 11 */
        if (
            node.type === 'Tutorial' ||
            node.type === 'Tutorial Topic' ||
            node.type === 'Tutorial Step'
        ) {
            node.project = "Education"
        }

        if (
            node.project === undefined ||
            node.project === 'Superalgos'
        ) {
            node.project = 'Foundations'
        }
        /* Migration code from beta 11 to 1.0.0 */
        if (
            node.type === 'Network'
        ) {
            node.type = "LAN Network"
            if (node.lanNetworkNodes === undefined && node.networkNodes !== undefined) {
                node.lanNetworkNodes = node.networkNodes
            }
        }

        if (
            node.type === 'Network Node'
        ) {
            node.type = "LAN Network Node"
        }

        if (
            node.type === 'Data Mine' ||
            node.type === 'API Data Fetcher Bot' ||
            node.type === 'Indicator Bot' ||
            node.type === 'Sensor Bot'
        ) {
            node.project = "Data-Mining"
        }

        if (
            node.type === 'Trading Engine' ||
            node.type === 'Trading Mine' ||
            node.type === 'Trading System' ||
            node.type === 'Trading Bot'
        ) {
            node.project = "Algorithmic-Trading"
        }

        if (
            node.type === 'Portfolio Engine' ||
            node.type === 'Portfolio Mine' ||
            node.type === 'Portfolio System' ||
            node.type === 'Portfolio Bot'
        ) {
            node.project = "Portfolio-Management"
        }

        if (
            node.type === 'Learning Engine' ||
            node.type === 'Learning Mine' ||
            node.type === 'Learning System' ||
            node.type === 'Learning Bot'
        ) {
            node.project = "Machine-Learning"
        }

        if (
            node.type === 'Plugins' ||
            node.type === 'Plugin Tutorials' ||
            node.type === 'Plugin Trading Systems'  ||
            node.type === 'Plugin Trading Mines'    ||
            node.type === 'Plugin Trading Engines'  ||
            node.type === 'Plugin Portfolio Systems' ||
            node.type === 'Plugin Portfolio Mines'  ||
            node.type === 'Plugin Portfolio Engines' ||
            node.type === 'Plugin Project' ||
            node.type === 'Plugin Learning Systems' ||
            node.type === 'Plugin Learning Mines' ||
            node.type === 'Plugin Learning Engines' ||
            node.type === 'Plugin File' ||
            node.type === 'Plugin File Position' ||
            node.type === 'Plugin Data Mines' ||
            node.type === 'Plugin API Maps'
        ) {
            node.project = "Community-Plugins"
        }

        /*
        This function can be called with a positionOffset to change the node
        saved position and all of its descendants positions as well with an
        offset. It can also happen that the positionOffset is defined as a property
        of the node, in which case it will produce exactly the same effect.
        */
        if (node.positionOffset !== undefined) {
            positionOffset = node.positionOffset
        }


        /* Get schema document */
        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument !== undefined) {
            migrateCodeToConfig(node, schemaDocument)

            /* Resolve Initial Values */
            if (schemaDocument.initialValues !== undefined) {
                if (schemaDocument.initialValues.code !== undefined) {
                    if (node.code === undefined) {
                        node.code = schemaDocument.initialValues.code
                    }
                }
                if (schemaDocument.initialValues.config !== undefined) {
                    if (node.config === undefined) {
                        node.config = schemaDocument.initialValues.config
                    }
                }
            }

            /* For the cases where an node is not chained to its parent but to the one at the parent before it at its collection */
            if (schemaDocument.chainedToSameType === true) {
                if (parentNode !== undefined) {
                    let parentSchemaDocument = getSchemaDocument(parentNode)
                    if (parentSchemaDocument !== undefined) {
                        if (parentSchemaDocument.childrenNodesProperties !== undefined) {
                            for (let i = 0; i < parentSchemaDocument.childrenNodesProperties.length; i++) {
                                let property = parentSchemaDocument.childrenNodesProperties[i]
                                if (property.childType === node.type) {
                                    if (property.type === 'array') {
                                        if (parentNode[property.name] !== undefined) {
                                            if (parentNode[property.name].length > 1) {
                                                let nodeChildren = parentNode[property.name]
                                                for (let j = 0; j < nodeChildren.length; j++) {
                                                    if (node.id === nodeChildren[j].id) {
                                                        if (j > 0) {
                                                            chainParent = nodeChildren[j - 1]
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
            /* Create Self */
            createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)

            /* Create Children */
            if (schemaDocument.childrenNodesProperties !== undefined) {
                let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]
                    if (node[property.name] !== undefined) {
                        switch (property.type) {
                            case 'node': {
                                if (property.name !== previousPropertyName) {
                                    createUiObjectFromNode(node[property.name], node, node, positionOffset)
                                    previousPropertyName = property.name
                                }
                            }
                                break
                            case 'array': {
                                let nodePropertyArray = node[property.name]
                                for (let m = 0; m < nodePropertyArray.length; m++) {
                                    let arrayItem = nodePropertyArray[m]
                                    createUiObjectFromNode(arrayItem, node, node, positionOffset)
                                }
                            }
                                break
                        }
                    } else {
                        if (property.type === 'array') {
                            node[property.name] = []
                        }
                    }
                }
            }
        }
    }

    function addUIObject(parentNode, type, rootNodes, project) {
        if (project === undefined) { project = parentNode.project }

        let object = {
            name: 'New ' + type,
            type: type,
            project: project
        }

        let parentSchemaDocument
        /* Resolve Initial Values */
        let schemaDocument = getSchemaDocument(object, project)

        if (schemaDocument === undefined) {
            schemaDocument = getSchemaDocument(object, 'Foundations') // TODO: This is provisional until all actions can have the relatedUiObject project explicitly set.
            if (schemaDocument === undefined) {
                console.log('Cannot addUIOBject of type "' + type + '" and project "' + project + '" because that type it is not defined at the APP_SCHEMA.')
                return
            }
        }

        if (schemaDocument.initialValues !== undefined) {
            if (schemaDocument.initialValues.code !== undefined) {
                object.code = schemaDocument.initialValues.code
            }
        }
        if (schemaDocument.initialValues !== undefined) {
            if (schemaDocument.initialValues.config !== undefined) {
                object.config = schemaDocument.initialValues.config
            }
        }

        let chainParent = parentNode
        if (schemaDocument.isHierarchyHead === true || schemaDocument.isProjectHead) {
            rootNodes.push(object)
            initializeArrayProperties()
            applyInitialValues()
            createUiObject(true, object.type, object.name, object, parentNode, undefined)
            autoAddChildren()
            return object

        } else {

            parentSchemaDocument = getSchemaDocument(parentNode, parentNode.project)
            if (parentSchemaDocument === undefined) {
                console.log('Cannot addUIOBject from parent of type "' + type + '" and project "' + parentNode.project + '" because that type it is not defined at the APP_SCHEMA.')
                return
            }
            checkChainToSelfTypeCollection()
            initializeArrayProperties()
            applyInitialValues()
            connectToParent()
            createUiObject(true, object.type, object.name, object, parentNode, chainParent)
            autoAddChildren()
            return object
        }

        function checkChainToSelfTypeCollection() {
            /* For the cases where a node is not chained to its parent but to the one at the parent before it at its own collection */

            if (schemaDocument.chainedToSameType === true) {
                if (parentSchemaDocument.childrenNodesProperties !== undefined) {
                    for (let i = 0; i < parentSchemaDocument.childrenNodesProperties.length; i++) {
                        let property = parentSchemaDocument.childrenNodesProperties[i]
                        if (property.childType === type) {
                            if (property.type === 'array') {
                                if (parentNode[property.name] !== undefined) {
                                    if (parentNode[property.name].length > 0) {
                                        let nodeChildren = parentNode[property.name]
                                        chainParent = nodeChildren[nodeChildren.length - 1]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        function initializeArrayProperties() {
            /* Create Empty Arrays for properties of type Array */
            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]
                    if (property.type === 'array') {
                        object[property.name] = []
                    }
                }
            }
        }

        function applyInitialValues() {
            if (schemaDocument.initialValues !== undefined) {
                if (schemaDocument.initialValues.code !== undefined) {
                    object.code = schemaDocument.initialValues.code
                }
                if (schemaDocument.initialValues.config !== undefined) {
                    object.config = schemaDocument.initialValues.config
                }
            }
        }

        function connectToParent() {
            /* Connect to Parent */
            if (parentSchemaDocument.childrenNodesProperties !== undefined) {
                let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
                for (let i = 0; i < parentSchemaDocument.childrenNodesProperties.length; i++) {
                    let property = parentSchemaDocument.childrenNodesProperties[i]
                    if (property.childType === type) {
                        switch (property.type) {
                            case 'node': {
                                if (property.name !== previousPropertyName) {
                                    parentNode[property.name] = object
                                    previousPropertyName = property.name
                                }
                            }
                                break
                            case 'array': {
                                if (parentNode[property.name] === undefined) {
                                    parentNode[property.name] = []
                                }
                                if (property.maxItems !== undefined) {
                                    if (parentNode[property.name].length < property.maxItems) {
                                        parentNode[property.name].push(object)
                                    } else {
                                        return // Object can not be created.
                                    }
                                } else {
                                    parentNode[property.name].push(object)
                                }
                            }
                                break
                        }
                    }
                }
            }
        }

        function autoAddChildren() {
            /* Auto Add more Children */
            if (schemaDocument.childrenNodesProperties !== undefined) {
                let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            if (property.name !== previousPropertyName) {
                                if (property.autoAdd === true) {
                                    let project = property.project
                                    addUIObject(object, property.childType, undefined, project)
                                    previousPropertyName = property.name
                                }
                            }
                        }
                            break
                        case 'array': {
                            if (property.autoAdd === true) {
                                if (object[property.name] === undefined) {
                                    object[property.name] = []
                                }
                                let project = property.project
                                addUIObject(object, property.childType, undefined, project)
                            }
                        }
                            break
                    }
                }
            }
        }
    }

    function addMissingChildren(node, rootNodes) {
        let schemaDocument = getSchemaDocument(node)

        /* Connect to Parent */
        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]
                if (property.type === 'node') {
                    if (property.name !== previousPropertyName) {
                        if (node[property.name] === undefined) {
                            let currenAngleToParent = node.payload.floatingObject.angleToParent
                            node.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let uiObject = addUIObject(node, property.childType, rootNodes, property.project)
                            node.payload.floatingObject.angleToParent = currenAngleToParent
                            //uiObject.payload.floatingObject.angleToParent = currenAngleToParent
                            previousPropertyName = property.name
                        }
                    }
                }
            }
        }
    }

    function createUiObject(userAddingNew, uiObjectType, name, node, parentNode, chainParent, title, positionOffset) {
        let payload = {}

        /* Mechanism related to keeping references when cloning */
        if (node.id === undefined) {
            node.id = newUniqueId()
        } else {
            /*
            We need to avoid nodes having the same id. If we add nodes to a workspace that already exist with the same Id,
            the nodes being added will get a new id at this moment.
            */
            let testNode = mapOfNodes.get(node.id)
            if (testNode !== undefined && testNode.cleaned !== true) {
                node.id = newUniqueId()
                console.log(testNode.name + ' already have the id of the node ' + node.name + ' being added. Creating a new id for it: ' + node.id)
            }
        }

        /* Default Naming */
        if (name === '' || name === undefined) { name = 'My ' + uiObjectType }

        /* If we are creating this object as the result of restoring a backup, share or clone, we will bring some of the saved properties to the new running instance. */
        if (userAddingNew === false && uiObjectType !== 'Workspace') {
            /* This following info can not be missing. */
            if (node.savedPayload === undefined) {
                console.log('Node ' + node.type + ' without savedPayload.', node)
                return
            }
            if (node.savedPayload.position === undefined) {
                console.log('Node ' + node.type + ' without savedPayload.position.', node)
                return
            }
            if (node.savedPayload.targetPosition === undefined) {
                console.log('Node ' + node.type + ' without savedPayload.targetPosition.', node)
                return
            }

            /* If there is not a position offset, which happens when we are dropping a node into the designer, we create a zero vector then. */
            if (positionOffset === undefined) {
                positionOffset = {
                    x: 0,
                    y: 0
                }
            }

            /* Adding the offset to the saved positions. */
            node.savedPayload.targetPosition.x = node.savedPayload.targetPosition.x + positionOffset.x
            node.savedPayload.targetPosition.y = node.savedPayload.targetPosition.y + positionOffset.y
            node.savedPayload.position.x = node.savedPayload.position.x + positionOffset.x
            node.savedPayload.position.y = node.savedPayload.position.y + positionOffset.y

            /* Transferring the saved payload properties into the running instance being created. */
            payload.targetPosition = {
                x: node.savedPayload.targetPosition.x,
                y: node.savedPayload.targetPosition.y
            }
            node.savedPayload.targetPosition = undefined

            /* Reference children connection to parents */
            if (node.savedPayload.referenceParent !== undefined) {
                payload.referenceParent = mapOfNodes.get(node.savedPayload.referenceParent.id)

                if (payload.referenceParent !== undefined) {
                    mapOfReferenceChildren.set(node.id, node)
                }
            }
        }

        /* If we are adding a new object, then we set the initial values for position and targetPosition */
        if (userAddingNew === true || uiObjectType === 'Workspace') {
            /* Workspace always to the spawn position */
            if (uiObjectType === 'Workspace') {
                payload.position = {
                    x: spawnPosition.x,
                    y: spawnPosition.y
                }
            }

            /* Chain parent pointing to the position of the chain parent if defined. */
            if (chainParent === undefined) {
                if (parentNode !== undefined) {
                    payload.targetPosition = {
                        x: parentNode.payload.position.x,
                        y: parentNode.payload.position.y
                    }
                } else {
                    payload.targetPosition = {
                        x: spawnPosition.x,
                        y: spawnPosition.y
                    }
                }
            } else {
                payload.targetPosition = {
                    x: chainParent.payload.position.x,
                    y: chainParent.payload.position.y
                }
            }
        }

        payload.visible = true
        payload.title = name
        payload.node = node
        payload.parentNode = parentNode
        payload.chainParent = chainParent
        payload.executeAction = UI.projects.foundations.spaces.designSpace.workspace.executeAction

        node.payload = payload
        node.type = uiObjectType

        /*
        Now we copy the possible frame saved to the payload where it can be used. A saved frame stores the position of a a chartingSpace object related to a node.
        This will prevent that if those charting space objects never get activated, that the frame information is lost when the workspace is saved.
        */
        if (node.savedPayload !== undefined) {
            if (node.savedPayload.frame !== undefined) {
                let frame = {
                    position: {
                        x: 0,
                        y: 0
                    }
                }
                frame.position.x = node.savedPayload.frame.position.x
                frame.position.y = node.savedPayload.frame.position.y
                frame.width = node.savedPayload.frame.width
                frame.height = node.savedPayload.frame.height
                frame.radius = node.savedPayload.frame.radius
                UI.projects.visualScripting.utilities.loadSaveFrame.saveFrame(payload, frame)
            }
            if (node.savedPayload.tutorial !== undefined) {
                let tutorial = {
                    status: node.savedPayload.tutorial.status
                }
                UI.projects.foundations.utilities.tutorial.saveTutorial(payload, tutorial)
            }
        }

        /* Now we mount the floating object where the UIOBject will be laying on top of */
        UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(userAddingNew, payload)

        /* This is the point where we build a map with all nodes present at the workspace */
        mapOfNodes.set(node.id, node)

        /* We will collect all tasks at the workspace in order to later synchronize them with the client */
        if (userAddingNew === false && uiObjectType === 'Task' && node.savedPayload !== undefined) {
            if (tasksFoundAtWorkspace !== undefined) { // it might be undefined when you are spawning a task that was backed up
                tasksFoundAtWorkspace.push(node)
            }
        }

        /* Check if there are sessions to run */
        if (userAddingNew === false && node.savedPayload !== undefined) {
            if (uiObjectType === 'Live Trading Session' || uiObjectType === 'Forward Testing Session' || uiObjectType === 'Backtesting Session' || uiObjectType === 'Paper Trading Session') {
                if (tradingSessionsFoundAtWorkspace !== undefined) { // it might be undefined when you are spawning a session that was running while backed up
                    tradingSessionsFoundAtWorkspace.push(node)
                }
            }
            if (uiObjectType === 'Live Portfolio Session') {
                if (portfolioSessionsFoundAtWorkspace !== undefined) { // it might be undefined when you are spawning a session that was running while backed up
                    portfolioSessionsFoundAtWorkspace.push(node)
                }
            }
            if (uiObjectType === 'Learning Session') {
                if (learningSessionsFoundAtWorkspace !== undefined) { // it might be undefined when you are spawning a session that was running while backed up
                    learningSessionsFoundAtWorkspace.push(node)
                }
            }
        }

        /* Check if there are tutorials to play */
        if (userAddingNew === false && node.savedPayload !== undefined) {
            if (uiObjectType === 'Tutorial') {
                if (node.savedPayload.uiObject.isPlaying === true) {
                    if (tutorialsToPlay !== undefined) { // it might be undefined when you are spawning a tutorial that was playing while backed up
                        tutorialsToPlay.push(node)
                    }
                }
            }
        }
    }
}
