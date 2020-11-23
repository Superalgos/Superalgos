function newSuperalgosFunctionLibraryUiObjectsFromNodes() {
    thisObject = {
        syncronizeTasksFoundAtWorkspaceWithBackEnd: syncronizeTasksFoundAtWorkspaceWithBackEnd,
        syncronizeTradingSessionsFoundAtWorkspaceWithBackEnd: syncronizeTradingSessionsFoundAtWorkspaceWithBackEnd,
        syncronizeLearningSessionsFoundAtWorkspaceWithBackEnd: syncronizeLearningSessionsFoundAtWorkspaceWithBackEnd,
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
        learningSessionsFoundAtWorkspace = []
        tutorialsToPlay = []

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
                        if (project.pluginSuperScripts !== undefined) {
                            totalPlugin = totalPlugin + project.pluginSuperScripts.pluginFiles.length
                            pluginAllTheseFiles(project.pluginSuperScripts.pluginFiles, 'Super-Scripts')
                        }
                        if (project.pluginTutorials !== undefined) {
                            totalPlugin = totalPlugin + project.pluginTutorials.pluginFiles.length
                            pluginAllTheseFiles(project.pluginTutorials.pluginFiles, 'Tutorials')
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

            function pluginAllTheseFiles(pluginFiles, pluginType) {
                for (let i = 0; i < pluginFiles.length; i++) {
                    let pluginFile = pluginFiles[i]
                    let name = pluginFile.name
                    httpRequest(undefined, 'LoadPlugin' + '/' + 'Superalgos' + '/' + pluginType + '/' + name + '.json', onFileReceived)

                    function onFileReceived(err, text, response) {

                        if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                            console.log('[WARN] Cannot load plugin ' + pluginType + ' ' + name + '. The Workspace will be loaded with this plugin file missing.')
                        } else {
                            let receivedNode = JSON.parse(text)
                            /* 
                            If the workspace already contains a root node with the id of the head of the hirierchy
                            we are loading, we remove it because the plugin file has precedende.
                            */
                            for (let i = 0; i < node.rootNodes.length; i++) {
                                let rootNode = node.rootNodes[i]
                                if (rootNode.id === receivedNode.id) {
                                    node.rootNodes.splice(i, 1)
                                    break
                                }
                            }
                            receivedNode.isPlugin = true

                            if (pluginFile.pluginFilePosition !== undefined) {
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
            /* Create the workspace UI OBject and then continue with the root nodes. */
            createUiObject(false, 'Workspace', node.name, node, undefined, undefined, 'Workspace')
            if (node.rootNodes !== undefined) {
                for (let i = 0; i < node.rootNodes.length; i++) {
                    let rootNode = node.rootNodes[i]
                    createUiObjectFromNode(rootNode, undefined, undefined)
                }
            }

            tryToConnectChildrenWithReferenceParents()

            if (callBackFunction !== undefined) {
                callBackFunction() // The recreation of the workspace is complete
            }
        }
    }

    function syncronizeTasksFoundAtWorkspaceWithBackEnd() {
        for (let i = 0; i < tasksFoundAtWorkspace.length; i++) {
            let node = tasksFoundAtWorkspace[i]
            UI.projects.superalgos.functionLibraries.taskFunctions.syncronizeTaskWithBackEnd(node)
        }
        tasksFoundAtWorkspace = undefined
    }

    function syncronizeTradingSessionsFoundAtWorkspaceWithBackEnd() {
        for (let i = 0; i < tradingSessionsFoundAtWorkspace.length; i++) {
            let node = tradingSessionsFoundAtWorkspace[i]
            UI.projects.superalgos.functionLibraries.tradingSessionFunctions.syncronizeSessionWithBackEnd(node)
        }
        tradingSessionsFoundAtWorkspace = undefined
    }

    function syncronizeLearningSessionsFoundAtWorkspaceWithBackEnd() {
        for (let i = 0; i < learningSessionsFoundAtWorkspace.length; i++) {
            let node = learningSessionsFoundAtWorkspace[i]
            UI.projects.superalgos.functionLibraries.tradingSessionFunctions.syncronizeSessionWithBackEnd(node)
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
            if (node.id === "54854f90-d121-4365-8f40-9a26e7af1097") {
                console.log('ACA')
            }
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
                    node.payload.referenceParent = mapOfNodes.get(node.savedPayload.referenceParent.id)
                    if (node.payload.referenceParent === undefined) {
                        //console.log('[WARN]' + node.type + ' ' + node.name + ' reference parent lost during re-binding phase.')
                    }
                }
            }
        }
    }

    function migrateCodeToConfig(node, nodeDefinition) {
        /* Code needed to Migrante from Beta 5 to Beta a Workspace */
        if (nodeDefinition.editors !== undefined) {
            if (nodeDefinition.editors.config === true) {
                if (node.code !== undefined) {
                    node.config = node.code
                    node.code = undefined
                }
            }
        }
    }

    function createUiObjectFromNode(node, parentNode, chainParent, positionOffset) {
        /* Migration code from beta 6 to beta 7 */
        if (node.project === undefined) {
            node.project = 'Superalgos'
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


        /* Get node definition */
        let nodeDefinition = getNodeDefinition(node)
        if (nodeDefinition !== undefined) {
            migrateCodeToConfig(node, nodeDefinition)

            /* Resolve Initial Values */
            if (nodeDefinition.initialValues !== undefined) {
                if (nodeDefinition.initialValues.code !== undefined) {
                    if (node.code === undefined) {
                        node.code = nodeDefinition.initialValues.code
                    }
                }
                if (nodeDefinition.initialValues.config !== undefined) {
                    if (node.config === undefined) {
                        node.config = nodeDefinition.initialValues.config
                    }
                }
            }

            /* For the cases where an node is not chained to its parent but to the one at the parent before it at its collection */
            if (nodeDefinition.chainedToSameType === true) {
                if (parentNode !== undefined) {
                    let parentNodeDefinition = getNodeDefinition(parentNode)
                    if (parentNodeDefinition !== undefined) {
                        if (parentNodeDefinition.properties !== undefined) {
                            for (let i = 0; i < parentNodeDefinition.properties.length; i++) {
                                let property = parentNodeDefinition.properties[i]
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
            if (nodeDefinition.properties !== undefined) {
                let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
                for (let i = 0; i < nodeDefinition.properties.length; i++) {
                    let property = nodeDefinition.properties[i]
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

        let parentNodeDefinition 
        /* Resolve Initial Values */
        let nodeDefinition = getNodeDefinition(object, project)

        if (nodeDefinition === undefined) {
            console.log('Cannot addUIOBject of ' + type + ' because that type it is not defined at the APP_SCHEMA.')
            return
        }

        if (nodeDefinition.initialValues !== undefined) {
            if (nodeDefinition.initialValues.code !== undefined) {
                object.code = nodeDefinition.initialValues.code
            }
        }
        if (nodeDefinition.initialValues !== undefined) {
            if (nodeDefinition.initialValues.config !== undefined) {
                object.config = nodeDefinition.initialValues.config
            }
        }

        let chainParent = parentNode
        if (nodeDefinition.isHierarchyHead === true || nodeDefinition.isProjectHead) {
            rootNodes.push(object)
            initializeArrayProperties()
            applyInitialValues()
            createUiObject(true, object.type, object.name, object, parentNode, undefined)
            autoAddChildren()
            return object

        } else {

            parentNodeDefinition = getNodeDefinition(parentNode, parentNode.project)
            if (parentNodeDefinition === undefined) {
                console.log('Cannot addUIOBject from parent of ' + type + ' because that type it is not defined at the APP_SCHEMA.')
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

            if (nodeDefinition.chainedToSameType === true) {
                if (parentNodeDefinition.properties !== undefined) {
                    for (let i = 0; i < parentNodeDefinition.properties.length; i++) {
                        let property = parentNodeDefinition.properties[i]
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
            if (nodeDefinition.properties !== undefined) {
                for (let i = 0; i < nodeDefinition.properties.length; i++) {
                    let property = nodeDefinition.properties[i]
                    if (property.type === 'array') {
                        object[property.name] = []
                    }
                }
            }
        }

        function applyInitialValues() {
            if (nodeDefinition.initialValues !== undefined) {
                if (nodeDefinition.initialValues.code !== undefined) {
                    object.code = nodeDefinition.initialValues.code
                }
                if (nodeDefinition.initialValues.config !== undefined) {
                    object.config = nodeDefinition.initialValues.config
                }
            }
        }

        function connectToParent() {
            /* Connect to Parent */
            if (parentNodeDefinition.properties !== undefined) {
                let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
                for (let i = 0; i < parentNodeDefinition.properties.length; i++) {
                    let property = parentNodeDefinition.properties[i]
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
            if (nodeDefinition.properties !== undefined) {
                let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
                for (let i = 0; i < nodeDefinition.properties.length; i++) {
                    let property = nodeDefinition.properties[i]

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
        let nodeDefinition = getNodeDefinition(node)

        /* Connect to Parent */
        if (nodeDefinition.properties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]
                if (property.type === 'node') {
                    if (property.name !== previousPropertyName) {
                        if (node[property.name] === undefined) {
                            addUIObject(node, property.childType, rootNodes)
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

            /* If there is not a position offset, which happens when we are dropping a node into the designer, we create a cero vector then. */
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
            /* Workspace allways to the spawn position */
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

        /* Setting the title */
        if (title !== undefined) {
            payload.subTitle = title
        } else {
            payload.subTitle = uiObjectType
        }

        payload.visible = true
        payload.title = name
        payload.node = node
        payload.parentNode = parentNode
        payload.chainParent = chainParent
        payload.executeAction = UI.projects.superalgos.spaces.designSpace.workspace.executeAction

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
                UI.projects.superalgos.utilities.loadSaveFrame.saveFrame(payload, frame)
            }
            if (node.savedPayload.tutorial !== undefined) {
                let tutorial = {
                    status: node.savedPayload.tutorial.status
                }
                UI.projects.superalgos.utilities.tutorial.saveTutorial(payload, tutorial)
            }
        }

        /* Now we mount the floating object where the UIOBject will be laying on top of */
        UI.projects.superalgos.spaces.floatingSpace.uiObjectConstructor.createUiObject(userAddingNew, payload)

        /* This is the point where we build a map with all nodes present at the workspace */
        mapOfNodes.set(node.id, node)

        /* We will collect all tasks at the workspace in order to later syncronize them with the client */
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
