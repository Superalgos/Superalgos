
function newWorkspace() {
    const MODULE_NAME = 'Workspace'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    logger.fileName = MODULE_NAME

    let thisObject = {
        workspaceNode: undefined,
        container: undefined,
        enabled: false,
        nodeChildren: undefined,
        eventsServerClients: new Map(),
        replaceWorkspaceByLoadingOne: replaceWorkspaceByLoadingOne,
        save: saveWorkspace,
        getHierarchyHeads: getHierarchyHeads,
        getHierarchyHeadsById: getHierarchyHeadsById,
        getNodeThatIsOnFocus: getNodeThatIsOnFocus,
        getNodeByShortcutKey: getNodeByShortcutKey,
        getNodeById: getNodeById,
        stopAllRunningTasks: stopAllRunningTasks,
        onMenuItemClick: onMenuItemClick,
        physics: physics,
        draw: draw,
        spawn: spawn,
        chainDetachNode: chainDetachNode,
        chainAttachNode: chainAttachNode,
        referenceDetachNode: referenceDetachNode,
        referenceAttachNode: referenceAttachNode,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.isClickeable = false
    thisObject.container.isDraggeable = false
    thisObject.container.isWheelable = false
    thisObject.container.detectMouseOver = false
    thisObject.container.frame.radius = 0
    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0
    thisObject.container.frame.width = 0
    thisObject.container.frame.height = 0

    spawnPosition = {
        x: canvas.floatingSpace.container.frame.width / 2,
        y: canvas.floatingSpace.container.frame.height / 2
    }

    thisObject.workspaceNode = {}
    thisObject.workspaceNode.rootNodes = []

    let functionLibraryReferenceAttachDetach = newReferenceAttachDetach()
    let functionLibraryChainAttachDetach = newChainAttachDetach()
    let functionLibraryNodeDeleter = newNodeDeleter()
    let functionLibraryUiObjectsFromNodes = newUiObjectsFromNodes()
    let functionLibraryProtocolNode = newProtocolNode()
    let functionLibraryNodeCloning = newNodeCloning()
    let functionLibraryTaskFunctions = newTaskFunctions()
    let functionLibrarySessionFunctions = newSessionFunctions()
    let functionLibraryShortcutKeys = newShortcutKeys()
    let functionLibraryOnFocus = newOnFocus()
    let functionLibrarySuperScripts = newSuperScriptsFunctions()
    let functionLibraryCryptoEcosystemFunctions = newCryptoEcosystemFunctions()
    let functionLibraryWebhookFunctions = newWebhookFunctions()
    let functionLibraryDependenciesFilter = newDependenciesFilter()
    let functionLibraryNodePath = newNodePath()
    let functionLibraryDataMineFunctions = newDataMineFunctions()
    let functionLibraryDataStorageFunctions = newDataStorageFunctions()
    let functionLibraryChartingSpaceFunctions = newChartingSpaceFunctions()
    let functionLibraryTutorialFunctions = newTutorialFunctions()
    let functionLibraryIncludesFunctions = newIncludesFunctions()

    thisObject.nodeChildren = newNodeChildren()

    let savingWorkspaceIntervalId
    let isInitialized = false
    let workingAtTask = 0
    let circularProgressBar = newBusyProgressBar()
    circularProgressBar.fitFunction = canvas.floatingSpace.fitIntoVisibleArea
    let loadedWorkspaceNode
    let sessionTimestamp = (new Date()).valueOf()
    window.localStorage.setItem('Session Timestamp', sessionTimestamp)

    return thisObject

    function finalize() {
        thisObject.definition = undefined
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.workspaceNode = undefined
        circularProgressBar.finalize()
        circularProgressBar = undefined
    }

    function initialize() {
        try {
            let lastUsedWorkspace = window.localStorage.getItem('Last Used Workspace')

            if (lastUsedWorkspace !== 'undefined' && lastUsedWorkspace !== null && lastUsedWorkspace !== undefined) {
                let blobService = newFileStorage()
                blobService.getFileFromHost('LoadWorkspace' + '/' + lastUsedWorkspace, onFileReceived, true)
                function onFileReceived(err, text, response) {
                    if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                        canvas.cockpitSpace.setStatus('Could not load the last Workspace used, called "' + lastUsedWorkspace + '". Will switch to the default Workspace instead.', 500, canvas.cockpitSpace.statusTypes.WARNING)
                        thisObject.workspaceNode = getWorkspace() // This is the default workspace that comes with the system.
                        recreateWorkspace()
                        return
                    }
                    thisObject.workspaceNode = JSON.parse(text)
                    recreateWorkspace()
                }
            } else {
                thisObject.workspaceNode = getWorkspace() // This is the default workspace that comes with the system.
                recreateWorkspace()
            }

            function recreateWorkspace() {
                functionLibraryUiObjectsFromNodes.recreateWorkspace(thisObject.workspaceNode, finishInitialization)
            }

            function finishInitialization() {
                setupEventsServerClients()
                runTasksAndSessions(false)
                thisObject.enabled = true
                canvas.cockpitSpace.initializePosition()
                canvas.splashScreen.initialize()
                savingWorkspaceIntervalId = setInterval(saveWorkspace, 60000)
                isInitialized = true
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
        }
    }

    function runTasksAndSessions(replacingCurrentWorkspace) {
        if (replacingCurrentWorkspace === true) {
            // We need to wait all tasks that were potentially running to stop
            setTimeout(functionLibraryUiObjectsFromNodes.runTasks, 70000)
            // We give a few seconds for the tasks to start
            setTimeout(functionLibraryUiObjectsFromNodes.runSessions, 80000)
            // We give a few seconds 
            setTimeout(functionLibraryUiObjectsFromNodes.playTutorials, 3000)
        } else {
            functionLibraryUiObjectsFromNodes.runTasks()
            // We give a few seconds for the tasks to start
            setTimeout(functionLibraryUiObjectsFromNodes.runSessions, 10000)
            // We give a few seconds 
            setTimeout(functionLibraryUiObjectsFromNodes.playTutorials, 1000)
        }
    }

    function setupEventsServerClients() {
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]

            if (rootNode.type === 'Network') {
                for (let j = 0; j < rootNode.networkNodes.length; j++) {
                    let networkNode = rootNode.networkNodes[j]

                    let eventsServerClient = newEventsServerClient(networkNode)
                    eventsServerClient.initialize()

                    thisObject.eventsServerClients.set(networkNode.id, eventsServerClient)
                }
            }
        }
    }

    function chainDetachNode(node) {
        functionLibraryChainAttachDetach.chainDetachNode(node, thisObject.workspaceNode.rootNodes)
    }

    function chainAttachNode(node, attachToNode) {
        functionLibraryChainAttachDetach.chainAttachNode(node, attachToNode, thisObject.workspaceNode.rootNodes)
    }

    function referenceDetachNode(node) {
        functionLibraryReferenceAttachDetach.referenceDetachNode(node)
    }

    function referenceAttachNode(node, attachToNode) {
        functionLibraryReferenceAttachDetach.referenceAttachNode(node, attachToNode, thisObject.workspaceNode.rootNodes)
    }

    function saveWorkspace() {
        let workspace = canvas.designSpace.workspace.workspaceNode

        /* Validation if it is too early to save. */
        if (isInitialized === false) { return }

        /* Validation of that the user changed the workspace name at least once. */
        if (workspace.name === 'Default') {
            canvas.cockpitSpace.setStatus(
                'Could not save the Workspace. Please rename the Workspace so that it can be saved.'
                , 150, canvas.cockpitSpace.statusTypes.WARNING)
            return
        }

        /* Validation of 2 sessions opened at the same time. */
        let savedSessionTimestamp = window.localStorage.getItem('Session Timestamp')
        if (Number(savedSessionTimestamp) !== sessionTimestamp) {
            canvas.cockpitSpace.setStatus(
                'Could not save the Workspace. You have more that one instance of the Superlagos User Interface open at the same time. Plese close this instance as it is older than the others.'
                , 150, canvas.cockpitSpace.statusTypes.WARNING)
            return
        }

        /* Validation that there is something to save */
        let textToSave = stringifyWorkspace()
        if (textToSave === undefined) {
            canvas.cockpitSpace.setStatus(
                'Could not save the Workspace. Something is preventing the System to do it at this time.'
                , 150, canvas.cockpitSpace.statusTypes.WARNING)
            return
        }

        window.localStorage.setItem('Session Timestamp', sessionTimestamp)

        /* Validation Workspace has a name */
        if (workspace.name === undefined) {
            canvas.cockpitSpace.setStatus(
                'Could not save the Workspace. You need to specify a name for it.'
                , 150, canvas.cockpitSpace.statusTypes.WARNING)
            return
        }

        let url = 'SaveWorkspace/' + workspace.name
        callServer(textToSave, url, onResponse)
        return true

        function onResponse(err) {
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                window.localStorage.setItem('Last Used Workspace', workspace.name)
                window.localStorage.setItem('Session Timestamp', sessionTimestamp)
                if (ARE_WE_RECORDING_A_MARKET_PANORAMA === false) {
                    canvas.cockpitSpace.setStatus(workspace.name + ' Saved.', 50, canvas.cockpitSpace.statusTypes.ALL_GOOD)
                }
            } else {
                canvas.cockpitSpace.setStatus('Could not save the Workspace at the Backend. Please check the Backend Console for more information.', 150, canvas.cockpitSpace.statusTypes.WARNING)
            }
        }
    }

    function getNodeById(nodeId) {
        return functionLibraryUiObjectsFromNodes.getNodeById(nodeId)
    }

    function physics() {
        eventsServerClientsPhysics()
        replacingWorkspacePhysics()
    }

    function eventsServerClientsPhysics() {
        thisObject.eventsServerClients.forEach(applyPhysics)

        function applyPhysics(eventServerClient) {
            eventServerClient.physics()
        }
    }

    function finalizeEventsServerClients() {
        thisObject.eventsServerClients.forEach(finalize)

        function finalize(eventServerClient) {
            eventServerClient.finalize()
        }
    }

    function replacingWorkspacePhysics() {
        if (thisObject.enabled !== true) { return }

        if (workingAtTask > 0) {
            circularProgressBar.physics()

            switch (workingAtTask) {
                case 1:
                    stopAllRunningTasks()
                    workingAtTask++
                    break
                case 2:
                    functionLibraryNodeDeleter.deleteWorkspace(thisObject.workspaceNode, thisObject.workspaceNode.rootNodes)
                    workingAtTask++
                    break
                case 3:
                    finalizeEventsServerClients()
                    thisObject.eventsServerClients = new Map()
                    workingAtTask++
                    break
                case 4:
                    clearInterval(savingWorkspaceIntervalId)
                    workingAtTask++
                    break
                case 5:
                    thisObject.workspaceNode = loadedWorkspaceNode
                    loadedWorkspaceNode = undefined
                    workingAtTask++
                    break
                case 6:
                    functionLibraryUiObjectsFromNodes.recreateWorkspace(thisObject.workspaceNode)
                    setupEventsServerClients()
                    runTasksAndSessions(true)
                    workingAtTask++
                    break
                case 7:
                    canvas.chartingSpace.reset()
                    workingAtTask++
                    break
                case 8:
                    workingAtTask = 0
                    circularProgressBar.visible = false
                    break
            }
        }
    }

    function draw() {
        if (circularProgressBar !== undefined) {
            circularProgressBar.draw()
        }
    }

    function stringifyWorkspace(removePersonalData) {
        let stringifyReadyNodes = []
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]

            if (rootNode.isIncluded !== true) {
                let node = functionLibraryProtocolNode.getProtocolNode(rootNode, removePersonalData, false, true, true, true)
                stringifyReadyNodes.push(node)
            }
        }
        let workspace = {
            type: 'Workspace',
            name: thisObject.workspaceNode.name,
            rootNodes: stringifyReadyNodes
        }

        /*
        Sometimes it happens that there are no rootNodes. 
        In those situations the workspace can not be stringified,
        to prevent later saving it corrupting the original file.
        */
        if (stringifyReadyNodes.length > 0) {
            return JSON.stringify(workspace)
        } else {
            return
        }
    }

    function stopAllRunningTasks() {
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            if (rootNode.type === 'Network') {
                if (rootNode.networkNodes !== undefined) {
                    for (let j = 0; j < rootNode.networkNodes.length; j++) {
                        let networkNode = rootNode.networkNodes[j]
                        if (networkNode.dataMining !== undefined && networkNode.dataMining.payload !== undefined) {
                            networkNode.dataMining.payload.uiObject.menu.internalClick('Stop All Exchange Data Tasks')
                            networkNode.dataMining.payload.uiObject.menu.internalClick('Stop All Exchange Data Tasks')
                        }
                        if (networkNode.testingEnvironment !== undefined && networkNode.testingEnvironment.payload !== undefined) {
                            networkNode.testingEnvironment.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                            networkNode.testingEnvironment.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                        }
                        if (networkNode.productionEnvironment !== undefined && networkNode.productionEnvironment.payload !== undefined) {
                            networkNode.productionEnvironment.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                            networkNode.productionEnvironment.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                        }
                    }
                }
            }
        }
    }

    function getNodeByShortcutKey(searchingKey) {
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let node = functionLibraryShortcutKeys.getNodeByShortcutKey(rootNode, searchingKey)
            if (node !== undefined) { return node }
        }
    }

    function getNodeThatIsOnFocus() {
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let node = functionLibraryOnFocus.getNodeThatIsOnFocus(rootNode)
            if (node !== undefined) { return node }
        }
    }

    function getHierarchyHeads() {
        let nodes = []
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let nodeDefinition = getNodeDefinition(rootNode)
            if (nodeDefinition !== undefined) {
                if (nodeDefinition.isHierarchyHead === true) {
                    nodes.push(rootNode)
                }
            }
        }
        return nodes
    }

    function getHierarchyHeadsById(nodeId) {
        let hiriatchyHeads = getHierarchyHeads()
        for (let i = 0; i < hiriatchyHeads.length; i++) {
            let hiriatchyHead = hiriatchyHeads[i]
            if (hiriatchyHead.id === nodeId) {
                return hiriatchyHead
            }
        }
    }

    function replaceWorkspaceByLoadingOne(name) {

        let webCommand
        if (name.indexOf('Included -> ') >= 0) {
            name = name.replace('Included -> ', '')
            webCommand = 'LoadIncludedWorkspace'
        } else {
            webCommand = 'LoadWorkspace'
        }

        let blobService = newFileStorage()
        blobService.getFileFromHost(webCommand + '/' + name, onFileReceived, true)
        function onFileReceived(err, text, response) {
            if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                canvas.cockpitSpace.setStatus('Could not load the Workspace called "' + name + '". ', 500, canvas.cockpitSpace.statusTypes.WARNING)
                return
            }

            loadedWorkspaceNode = JSON.parse(text)
            saveWorkspace()
            canvas.cockpitSpace.toTop()

            let position = {
                x: browserCanvas.width / 2,
                y: browserCanvas.height / 2
            }

            circularProgressBar.initialize(position)
            circularProgressBar.visible = true
            workingAtTask = 1
        }
    }

    function spawn(nodeText, mousePointer) {
        try {
            let point = {
                x: mousePointer.x,
                y: mousePointer.y
            }
            point = canvas.floatingSpace.container.frame.unframeThisPoint(point)
            spawnPosition.x = point.x
            spawnPosition.y = point.y

            let droppedNode = JSON.parse(nodeText)

            if (droppedNode.type === 'Workspace') {
                loadedWorkspaceNode = droppedNode
                circularProgressBar.initialize(mousePointer)
                circularProgressBar.visible = true
                workingAtTask = 1
                return
            }

            /* It does not exist, so we recreeate it respecting the inner state of each object. */
            let positionOffset = {
                x: spawnPosition.x - droppedNode.savedPayload.position.x,
                y: spawnPosition.y - droppedNode.savedPayload.position.y
            }

            thisObject.workspaceNode.rootNodes.push(droppedNode)
            functionLibraryUiObjectsFromNodes.createUiObjectFromNode(droppedNode, undefined, undefined, positionOffset)
            functionLibraryUiObjectsFromNodes.tryToConnectChildrenWithReferenceParents()

            droppedNode = undefined
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] spawn -> err = ' + err.stack) }
        }
    }

    async function onMenuItemClick(payload, action, relatedUiObject, callBackFunction) {
        switch (action) {
            case 'Copy Node Path':
                {
                    let nodePath = functionLibraryNodePath.getNodePath(payload.node)

                    copyTextToClipboard(nodePath)

                    canvas.cockpitSpace.setStatus(
                        nodePath + ' copied to the Clipboard.'
                        , 50, canvas.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Add UI Object':
                {
                    functionLibraryUiObjectsFromNodes.addUIObject(payload.node, relatedUiObject)
                }
                break
            case 'Add Missing Children':
                {
                    functionLibraryUiObjectsFromNodes.addMissingChildren(payload.node)
                }
                break
            case 'Delete UI Object':
                {
                    functionLibraryNodeDeleter.deleteUIObject(payload.node, thisObject.workspaceNode.rootNodes)
                }
                break
            case 'Share Workspace':
                {
                    let text = stringifyWorkspace(true)
                    let fileName = 'Share - ' + payload.node.type + ' - ' + payload.node.name + '.json'
                    if (text !== undefined) {
                        downloadText(fileName, text)
                    }
                }
                break
            case 'Backup Workspace':
                {
                    let text = stringifyWorkspace(false)
                    let fileName = 'Backup - ' + payload.node.type + ' - ' + payload.node.name + '.json'
                    if (text !== undefined) {
                        downloadText(fileName, text)
                    }
                }
                break
            case 'Edit Code':

                break
            case 'Share':
                {
                    let text = JSON.stringify(functionLibraryProtocolNode.getProtocolNode(payload.node, true, false, true, true, true))

                    let nodeName = payload.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = '.' + nodeName
                    }
                    let fileName = 'Share - ' + payload.node.type + ' - ' + nodeName + '.json'
                    downloadText(fileName, text)
                }

                break
            case 'Backup':
                {
                    let text = JSON.stringify(functionLibraryProtocolNode.getProtocolNode(payload.node, false, false, true, true, true))

                    let nodeName = payload.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = ' ' + nodeName
                    }
                    let fileName = 'Backup - ' + payload.node.type + ' - ' + nodeName + '.json'
                    downloadText(fileName, text)
                }

                break
            case 'Clone':
                {
                    let text = JSON.stringify(functionLibraryNodeCloning.getNodeClone(payload.node))

                    let nodeName = payload.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = ' ' + nodeName
                    }
                    let fileName = 'Clone - ' + payload.node.type + ' - ' + nodeName + '.json'
                    downloadText(fileName, text)
                }

                break
            case 'Debug Task':
                {
                    functionLibraryTaskFunctions.runTask(payload.node, functionLibraryProtocolNode, true, callBackFunction)
                }
                break
            case 'Run Task':
                {
                    functionLibraryTaskFunctions.runTask(payload.node, functionLibraryProtocolNode, false, callBackFunction)
                }
                break
            case 'Stop Task':
                {
                    functionLibraryTaskFunctions.stopTask(payload.node, functionLibraryProtocolNode, callBackFunction)
                }
                break
            case 'Run All Tasks':
                {
                    functionLibraryTaskFunctions.runAllTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Stop All Tasks':
                {
                    functionLibraryTaskFunctions.stopAllTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Run All Task Managers':
                {
                    functionLibraryTaskFunctions.runAllTaskManagers(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Stop All Task Managers':
                {
                    functionLibraryTaskFunctions.stopAllTaskManagers(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Run All Exchange Data Tasks':
                {
                    functionLibraryTaskFunctions.runAllExchangeDataTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Stop All Exchange Data Tasks':
                {
                    functionLibraryTaskFunctions.stopAllExchangeDataTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Run All Exchange Trading Tasks':
                {
                    functionLibraryTaskFunctions.runAllExchangeTradingTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Stop All Exchange Trading Tasks':
                {
                    functionLibraryTaskFunctions.stopAllExchangeTradingTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Run All Market Data Tasks':
                {
                    functionLibraryTaskFunctions.runAllMarketDataTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Stop All Market Data Tasks':
                {
                    functionLibraryTaskFunctions.stopAllMarketDataTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Run All Market Trading Tasks':
                {
                    functionLibraryTaskFunctions.runAllMarketTradingTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Stop All Market Trading Tasks':
                {
                    functionLibraryTaskFunctions.stopAllMarketTradingTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Run All Data Mine Tasks':
                {
                    functionLibraryTaskFunctions.runAllDataMineTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Stop All Data Mine Tasks':
                {
                    functionLibraryTaskFunctions.stopAllDataMineTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Run All Trading Mine Tasks':
                {
                    functionLibraryTaskFunctions.runAllTradingMineTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Stop All Trading Mine Tasks':
                {
                    functionLibraryTaskFunctions.stopAllTradingMineTasks(payload.node, functionLibraryProtocolNode)
                }
                break
            case 'Add Missing Exchange Data Tasks':
                {
                    functionLibraryTaskFunctions.addMissingExchangeDataTasks(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Market Data Tasks':
                {
                    functionLibraryTaskFunctions.addMissingMarketDataTasks(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Data Mine Tasks':
                {
                    functionLibraryTaskFunctions.addMissingDataMineTasks(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Exchange Trading Tasks':
                {
                    functionLibraryTaskFunctions.addMissingExchangeTradingTasks(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Market Trading Tasks':
                {
                    functionLibraryTaskFunctions.addMissingMarketTradingTasks(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Trading Mine Tasks':
                {
                    functionLibraryTaskFunctions.addMissingTradingMineTasks(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add All Tasks':
                {
                    functionLibraryTaskFunctions.addAllTasks(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Crypto Exchanges':
                {
                    functionLibraryCryptoEcosystemFunctions.addMissingExchanges(payload.node, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Assets':
                {
                    functionLibraryCryptoEcosystemFunctions.addMissingAssets(payload.node, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Markets':
                {
                    functionLibraryCryptoEcosystemFunctions.addMissingMarkets(payload.node, functionLibraryUiObjectsFromNodes, functionLibraryNodeCloning)
                }
                break
            case 'Install Market':
                {
                    functionLibraryCryptoEcosystemFunctions.installMarket(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter, functionLibraryChartingSpaceFunctions, functionLibraryDataStorageFunctions)
                }
                break
            case 'Uninstall Market':
                {
                    functionLibraryCryptoEcosystemFunctions.uninstallMarket(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter, functionLibraryChartingSpaceFunctions, functionLibraryDataStorageFunctions)
                }
                break
            case 'Add All Output Datasets':
                {
                    functionLibraryDataMineFunctions.addAllOutputDatasets(payload.node, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add All Data Products':
                {
                    functionLibraryDataStorageFunctions.addAllDataProducts(payload.node, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add All Data Mine Products':
                {
                    functionLibraryDataStorageFunctions.addAllDataMineProducts(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add All Trading Mine Products':
                {
                    functionLibraryDataStorageFunctions.addAllTradingMineProducts(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Session References':
                {
                    functionLibraryDataStorageFunctions.addMissingSessionReferences(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Market Data Products':
                {
                    functionLibraryDataStorageFunctions.addMissingMarketDataProducts(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Market Trading Products':
                {
                    functionLibraryDataStorageFunctions.addMissingMarketTradingProducts(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Exchange Trading Products':
                {
                    functionLibraryDataStorageFunctions.addMissingExchangeTradingProducts(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add Missing Exchange Data Products':
                {
                    functionLibraryDataStorageFunctions.addMissingExchangeDataProducts(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add All Data Dependencies':
                {
                    functionLibraryDataMineFunctions.addAllDataDependencies(payload.node, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add All Data Mine Dependencies':
                {
                    functionLibraryDataMineFunctions.addAllDataMineDataDependencies(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Add All Mine Layers':
                {
                    functionLibraryChartingSpaceFunctions.addAllMineLayers(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)
                }
                break
            case 'Add Missing Time Machines':
                {
                    functionLibraryChartingSpaceFunctions.addMissingTimeMachines(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)
                }
                break
            case 'Add Missing Dashboards':
                {
                    functionLibraryChartingSpaceFunctions.addMissingDashboards(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)
                }
                break
            case 'Play Tutorial':
                {
                    canvas.tutorialSpace.playTutorial(payload.node)
                }
                break
            case 'Play Tutorial Topic':
                {
                    canvas.tutorialSpace.playTutorialTopic(payload.node)
                }
                break
            case 'Play Tutorial Step':
                {
                    canvas.tutorialSpace.playTutorialStep(payload.node)
                }
                break
            case 'Resume Tutorial':
                {
                    canvas.tutorialSpace.resumeTutorial(payload.node)
                }
                break
            case 'Resume Tutorial Topic':
                {
                    canvas.tutorialSpace.resumeTutorialTopic(payload.node)
                }
                break
            case 'Resume Tutorial Step':
                {
                    canvas.tutorialSpace.resumeTutorialStep(payload.node)
                }
                break
            case 'Reset Tutorial Progress':
                {
                    canvas.tutorialSpace.resetTutorialProgress(payload.node)
                }
                break
            case 'Send Webhook Test Message':
                {
                    functionLibraryWebhookFunctions.sendTestMessage(payload.node, callBackFunction)
                }
                break
            case 'Run Session':
                {
                    functionLibrarySessionFunctions.runSession(payload.node, functionLibraryProtocolNode, functionLibraryDependenciesFilter, false, callBackFunction)
                }
                break
            case 'Resume Session':
                {
                    functionLibrarySessionFunctions.runSession(payload.node, functionLibraryProtocolNode, functionLibraryDependenciesFilter, true, callBackFunction)
                }
                break
            case 'Stop Session':
                {
                    functionLibrarySessionFunctions.stopSession(payload.node, functionLibraryProtocolNode, callBackFunction)
                }
                break
            case 'Run Super Action':
                {
                    functionLibrarySuperScripts.runSuperScript(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryNodeCloning, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)
                }
                break
            case 'Remove Parent':
                {
                    chainDetachNode(payload.node)
                }
                break
            case 'Remove Reference':
                {
                    referenceDetachNode(payload.node)
                }
                break
            case 'Push Code to Javascript Code':
                {
                    payload.node.javascriptCode.code = payload.node.code
                }
                break
            case 'Fetch Code to Javascript Code':
                {
                    payload.node.code = payload.node.javascriptCode.code
                }
                break
            case 'Open Documentation':
                {
                    let definition = getNodeDefinition(payload.node)
                    if (definition !== undefined) {
                        if (definition.docURL !== undefined) {
                            canvas.docSpace.navigateTo(definition.docURL)
                        } else {
                            let headName = getHiriarchyHead(payload.node).type
                            headName = headName.toLowerCase()
                            headName = headName.split(" ").join("-")
                            let nodeName = payload.node.type
                            nodeName = nodeName.toLowerCase()
                            nodeName = nodeName.split(" ").join("-")
                            url = DOCUMENTATION_URL_PREFIX + "suite-hierarchy-" + headName + ".html#" + nodeName
                            canvas.docSpace.navigateTo(url)
                        }
                    }
                }
                break
            case 'Include Missing Data Mines':
                {
                    functionLibraryIncludesFunctions.includeMissingDataMines(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Include Missing Trading Mines':
                {
                    functionLibraryIncludesFunctions.includeMissingTradingMines(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Include Missing Trading Systems':
                {
                    functionLibraryIncludesFunctions.includeMissingTradingSystems(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Include Missing Trading Engines':
                {
                    functionLibraryIncludesFunctions.includeMissingTradingEngines(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Include Missing Super Scripts':
                {
                    functionLibraryIncludesFunctions.includeMissingSuperScripts(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
            case 'Include Missing Tutorials':
                {
                    functionLibraryIncludesFunctions.includeMissingTutorials(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryUiObjectsFromNodes)
                }
                break
        }
    }
}
