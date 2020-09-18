function newUiObjectsFromNodes() {
    thisObject = {
        runTasks: runTasks,
        runSessions: runSessions,
        recreateWorkspace: recreateWorkspace,
        getNodeById: getNodeById,
        tryToConnectChildrenWithReferenceParents: tryToConnectChildrenWithReferenceParents,
        createUiObjectFromNode: createUiObjectFromNode,
        addUIObject: addUIObject,
        addMissingChildren: addMissingChildren
    }

    let mapOfReferenceChildren = new Map()
    let mapOfNodes
    let tasksToRun
    let sessionsToRun

    return thisObject

    function getNodeById(nodeId) {
        return mapOfNodes.get(nodeId)
    }

    function recreateWorkspace(node, callBackFunction) {
        mapOfNodes = new Map()
        tasksToRun = []
        sessionsToRun = []

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

        getIncludedNames()

        function getIncludedNames() {

            callServer(undefined, 'IncludedNames', onResponse)

            function onResponse(err, data) {
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log('Failed to Fetch Included Names from the Backend')
                    return
                }

                let includedNames = JSON.parse(data)
                addIncludedNodes(includedNames)
            }
        }

        function addIncludedNodes(includedNames) {
            let blobService = newFileStorage()
            let includedDataMines = includedNames.includedDataMines
            let includedTradingMines = includedNames.includedTradingMines
            let includedTradingSystems = includedNames.includedTradingSystems
            let includedSuperScripts = includedNames.includedSuperScripts
            let includedTradingEngines = includedNames.includedTradingEngines

            let totalIncluded = 0

            for (let i = 0; i < includedDataMines.length; i++) {
                let name = includedDataMines[i]
                blobService.getFileFromHost('DataMines' + '/' + name, onFileReceived, true)
                function onFileReceived(err, text, response) {
                    if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                        console.log('Cannot load included Data Mine ' + name + '. The workspace can not be loaded.')
                        return
                    }
                    let receivedNode = JSON.parse(text)
                    for (let i = 0; i < node.rootNodes.length; i++) {
                        let rootNode = node.rootNodes[i]
                        if (rootNode.type === 'Data Mine') {
                            if (rootNode.config !== undefined) {
                                let config = JSON.parse(rootNode.config)
                                if (config.name === name) {
                                    rootNodes.splice(i, 1)
                                }
                            }
                        }
                    }
                    receivedNode.isIncluded = true
                    node.rootNodes.unshift(receivedNode)
                    totalIncluded++
                    if (totalIncluded === includedDataMines.length + includedTradingSystems.length + includedSuperScripts.length + includedTradingEngines.length + includedTradingMines.length) {
                        addUserDefinedNodes()
                    }
                }
            }

            for (let i = 0; i < includedTradingMines.length; i++) {
                let name = includedTradingMines[i]
                blobService.getFileFromHost('TradingMines' + '/' + name, onFileReceived, true)
                function onFileReceived(err, text, response) {
                    if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                        console.log('Cannot load included Trading Mine ' + name + '. The workspace can not be loaded.')
                        return
                    }
                    let receivedNode = JSON.parse(text)
                    for (let i = 0; i < node.rootNodes.length; i++) {
                        let rootNode = node.rootNodes[i]
                        if (rootNode.type === 'Trading Mine') {
                            if (rootNode.config !== undefined) {
                                let config = JSON.parse(rootNode.config)
                                if (config.name === name) {
                                    rootNodes.splice(i, 1)
                                }
                            }
                        }
                    }
                    receivedNode.isIncluded = true
                    node.rootNodes.unshift(receivedNode)
                    totalIncluded++
                    if (totalIncluded === includedDataMines.length + includedTradingSystems.length + includedSuperScripts.length + includedTradingEngines.length + includedTradingMines.length) {
                        addUserDefinedNodes()
                    }
                }
            }

            for (let i = 0; i < includedTradingSystems.length; i++) {
                let name = includedTradingSystems[i]
                blobService.getFileFromHost('TradingSystems' + '/' + name, onFileReceived, true)
                function onFileReceived(err, text, response) {
                    if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                        console.log('Cannot load included Trading System ' + name + '. The workspace can not be loaded.')
                        return
                    }
                    let receivedNode = JSON.parse(text)
                    for (let i = 0; i < node.rootNodes.length; i++) {
                        let rootNode = node.rootNodes[i]
                        if (rootNode.type === 'Trading System') {
                            if (rootNode.config !== undefined) {
                                let config = JSON.parse(rootNode.config)
                                if (config.name === name) {
                                    rootNodes.splice(i, 1)
                                }
                            }
                        }
                    }
                    receivedNode.isIncluded = true
                    node.rootNodes.unshift(receivedNode)
                    totalIncluded++
                    if (totalIncluded === includedDataMines.length + includedTradingSystems.length + includedSuperScripts.length + includedTradingEngines.length + includedTradingMines.length) {
                        addUserDefinedNodes()
                    }
                }
            }

            for (let i = 0; i < includedSuperScripts.length; i++) {
                let name = includedSuperScripts[i]
                blobService.getFileFromHost('SuperScripts' + '/' + name, onFileReceived, true)
                function onFileReceived(err, text, response) {
                    if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                        console.log('Cannot load included Super Script ' + name + '. The workspace can not be loaded.')
                        return
                    }
                    let receivedNode = JSON.parse(text)
                    for (let i = 0; i < node.rootNodes.length; i++) {
                        let rootNode = node.rootNodes[i]
                        if (rootNode.type === 'Super Scripts') {
                            if (rootNode.config !== undefined) {
                                let config = JSON.parse(rootNode.config)
                                if (config.name === name) {
                                    rootNodes.splice(i, 1)
                                }
                            }
                        }
                    }
                    receivedNode.isIncluded = true
                    node.rootNodes.unshift(receivedNode)
                    totalIncluded++
                    if (totalIncluded === includedDataMines.length + includedTradingSystems.length + includedSuperScripts.length + includedTradingEngines.length + includedTradingMines.length) {
                        addUserDefinedNodes()
                    }
                }
            }

            for (let i = 0; i < includedTradingEngines.length; i++) {
                let name = includedTradingEngines[i]
                blobService.getFileFromHost('TradingEngines' + '/' + name, onFileReceived, true)
                function onFileReceived(err, text, response) {
                    if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                        console.log('Cannot load included Trading Engine ' + name + '. The workspace can not be loaded.')
                        return
                    }
                    let receivedNode = JSON.parse(text)
                    for (let i = 0; i < node.rootNodes.length; i++) {
                        let rootNode = node.rootNodes[i]
                        if (rootNode.type === 'Trading Engine') {
                            if (rootNode.name === name) {
                                rootNodes.splice(i, 1)
                            }
                        }
                    }
                    receivedNode.isIncluded = true
                    node.rootNodes.unshift(receivedNode)
                    totalIncluded++
                    if (totalIncluded === includedDataMines.length + includedTradingSystems.length + includedSuperScripts.length + includedTradingEngines.length + includedTradingMines.length) {
                        addUserDefinedNodes()
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

    function runTasks() {
        for (let i = 0; i < tasksToRun.length; i++) {
            let node = tasksToRun[i]
            node.payload.uiObject.menu.internalClick('Run Task')
        }
        tasksToRun = undefined
    }

    function runSessions() {
        for (let i = 0; i < sessionsToRun.length; i++) {
            let node = sessionsToRun[i]
            node.payload.uiObject.menu.internalClick('Run Session')
        }
        sessionsToRun = undefined
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
                        console.log(node.type + ' ' + node.name + ' reference parent lost during re-binding phase.')
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
                        console.log(node.type + ' ' + node.name + ' reference parent lost during re-binding phase.')
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
        /* Code needed to Migrante from Beta 5 to Beta 6 a Trading System
        if (node.type === 'Take Profit') {
          node.type = 'Managed Take Profit'
        }
        if (node.type === 'Stop') {
          node.type = 'Managed Stop Loss'
        }
        */

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

    function addUIObject(parentNode, type) {
        let object = {
            name: 'New ' + type,
            type: type
        }

        let parentNodeDefinition = getNodeDefinition(parentNode)
        if (parentNodeDefinition === undefined) {
            console.log('Cannot addUIOBject from parent of ' + type + ' because that type it is not defined at the APP_SCHEMA.')
        }
        /* Resolve Initial Values */
        let nodeDefinition = getNodeDefinition(object)

        if (nodeDefinition === undefined) {
            console.log('Cannot addUIOBject of ' + type + ' because that type it is not defined at the APP_SCHEMA.')
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

        if (nodeDefinition.isHierarchyHead === true) {
            parentNode.rootNodes.push(object)
            createUiObject(true, object.type, object.name, object, parentNode, undefined)
            return object
        }

        /* For the cases where an node is not chained to its parent but to the one at the parent before it at its collection */
        let chainParent = parentNode
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

        /* Create Empty Arrays for properties of type Array */
        if (nodeDefinition.properties !== undefined) {
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]
                if (property.type === 'array') {
                    object[property.name] = []
                }
            }
        }

        if (nodeDefinition !== undefined) {
            if (nodeDefinition.initialValues !== undefined) {
                if (nodeDefinition.initialValues.code !== undefined) {
                    object.code = nodeDefinition.initialValues.code
                }
                if (nodeDefinition.initialValues.config !== undefined) {
                    object.config = nodeDefinition.initialValues.config
                }
            }
        }

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

        createUiObject(true, object.type, object.name, object, parentNode, chainParent)

        /* Auto Add more Children */
        if (nodeDefinition.properties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (property.autoAdd === true) {
                                addUIObject(object, property.childType)
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
                            addUIObject(object, property.childType)
                        }
                    }
                        break
                }
            }
        }

        return object
    }

    function addMissingChildren(node) {
        let nodeDefinition = getNodeDefinition(node)

        /* Connect to Parent */
        if (nodeDefinition.properties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]
                if (property.type === 'node') {
                    if (property.name !== previousPropertyName) {
                        if (node[property.name] === undefined) {
                            addUIObject(node, property.childType)
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
                console.log(testNode.name + ' already have the id of the node ' + node.name + ' being added.')
                node.id = newUniqueId()
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
                payload.targetPosition = {
                    x: spawnPosition.x,
                    y: spawnPosition.y
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
        payload.onMenuItemClick = canvas.designSpace.workspace.onMenuItemClick

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
                saveFrame(payload, frame)
            }
            if (node.savedPayload.tutorial !== undefined) {
                let tutorial = {
                    status: node.savedPayload.tutorial.status
                }
                saveTutorial(payload, tutorial)
            }
        }

        /* Now we mount the floating object where the UIOBject will be laying on top of */
        canvas.floatingSpace.uiObjectConstructor.createUiObject(userAddingNew, payload)

        /* This is the point where we build a map with all nodes present at the workspace */
        mapOfNodes.set(node.id, node)

        /* Check if there are tasks to run */
        if (userAddingNew === false && uiObjectType === 'Task' && node.savedPayload !== undefined) {
            if (node.savedPayload.uiObject.isRunning === true) {
                if (node.payload.parentNode !== undefined) {
                    if (tasksToRun !== undefined) { // it might be undefined when you are spawning a task that was running while backed up
                        tasksToRun.push(node)
                    }
                }
            }
        }

        /* Check if there are sessions to run */
        if (userAddingNew === false && node.savedPayload !== undefined) {
            if (uiObjectType === 'Live Trading Session' || uiObjectType === 'Forward Testing Session' || uiObjectType === 'Backtesting Session' || uiObjectType === 'Paper Trading Session') {
                if (node.savedPayload.uiObject.isRunning === true) {
                    if (node.payload.parentNode !== undefined) {
                        if (sessionsToRun !== undefined) { // it might be undefined when you are spawning a session that was running while backed up
                            sessionsToRun.push(node)
                        }
                    }
                }
            }
        }
    }
}
