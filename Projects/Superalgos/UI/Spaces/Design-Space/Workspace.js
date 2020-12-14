
function newWorkspace() {
    const MODULE_NAME = 'Workspace'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

    let thisObject = {
        workspaceNode: undefined,
        container: undefined,
        enabled: false,
        nodeChildren: undefined,
        eventsServerClients: new Map(),
        replaceWorkspaceByLoadingOne: replaceWorkspaceByLoadingOne,
        save: saveWorkspace,
        backup: backupWorkspace,
        share: shareWorkspace,
        getProjectsHeads: getProjectsHeads,
        getHierarchyHeads: getHierarchyHeads,
        getHierarchyHeadsById: getHierarchyHeadsById,
        getHierarchyHeadsByType: getHierarchyHeadsByType,
        getNodeThatIsOnFocus: getNodeThatIsOnFocus,
        getNodeByShortcutKey: getNodeByShortcutKey,
        getNodeById: getNodeById,
        stopAllRunningTasks: stopAllRunningTasks,
        executeAction: executeAction,
        physics: physics,
        draw: draw,
        spawn: spawn,
        initialize: initialize,
        finalize: finalize
    }

    spawnPosition = {
        x: UI.projects.superalgos.spaces.floatingSpace.container.frame.width / 2,
        y: UI.projects.superalgos.spaces.floatingSpace.container.frame.height / 2
    }

    thisObject.workspaceNode = {}
    thisObject.workspaceNode.rootNodes = []

    thisObject.nodeChildren = newNodeChildren()

    let savingWorkspaceIntervalId
    let isInitialized = false
    let workingAtTask = 0
    let circularProgressBar = newBusyProgressBar()
    circularProgressBar.fitFunction = UI.projects.superalgos.spaces.floatingSpace.fitIntoVisibleArea
    let loadedWorkspaceNode
    let sessionTimestamp = (new Date()).valueOf()
    window.localStorage.setItem('Session Timestamp', sessionTimestamp)

    let actionSwitchesByProject = new Map()

    return thisObject

    function finalize() {
        thisObject.definition = undefined
        thisObject.workspaceNode = undefined
        circularProgressBar.finalize()
        circularProgressBar = undefined
        actionSwitchesByProject = undefined
    }

    function initialize() {
        try {
            /* Set up the action switches map */
            for (let i = 0; i < PROJECTS_ARRAY.length; i++) {
                let project = PROJECTS_ARRAY[i]
                let actionSwitch = eval('new' + project + 'ActionSwitch()')
                actionSwitchesByProject.set(project, actionSwitch)
            }

            /* Check which was the last workspace. */
            let lastUsedWorkspace = window.localStorage.getItem('Last Used Workspace')

            if (lastUsedWorkspace !== 'undefined' && lastUsedWorkspace !== null && lastUsedWorkspace !== undefined) {
                httpRequest(undefined, 'LoadMyWorkspace' + '/' + lastUsedWorkspace, onFileReceived)
                function onFileReceived(err, text, response) {
                    if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                        UI.projects.superalgos.spaces.cockpitSpace.setStatus('Could not load the last Workspace used, called "' + lastUsedWorkspace + '". Will switch to the default Workspace instead.', 500, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.WARNING)
                        thisObject.workspaceNode = getWorkspace() // This is the default workspace that comes with the system.
                        thisObject.workspaceNode.project = 'Superalgos'
                        recreateWorkspace()
                        return
                    }
                    thisObject.workspaceNode = JSON.parse(text)
                    thisObject.workspaceNode.project = 'Superalgos'
                    recreateWorkspace()
                }
            } else {
                thisObject.workspaceNode = getWorkspace() // This is the default workspace that comes with the system.
                thisObject.workspaceNode.project = 'Superalgos'
                recreateWorkspace()
            }

            function recreateWorkspace() {
                executeAction({ node: thisObject.workspaceNode, name: 'Recreate Workspace', project: 'Superalgos', callBackFunction: finishInitialization })
            }

            function finishInitialization() {
                setupEventsServerClients()
                runTasksAndSessions()
                thisObject.enabled = true
                UI.projects.superalgos.spaces.cockpitSpace.initializePosition()
                CAN_SPACES_DRAW = true
                savingWorkspaceIntervalId = setInterval(saveWorkspace, 60000)
                isInitialized = true
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
        }
    }

    function runTasksAndSessions() {
        executeAction({ name: 'Syncronize Tasks', project: 'Superalgos' })
        executeAction({ name: 'Syncronize Trading Sessions', project: 'Superalgos' })
        executeAction({ name: 'Syncronize Learning Sessions', project: 'Superalgos' })
        executeAction({ name: 'Play Tutorials', project: 'Superalgos' })
    }

    function setupEventsServerClients() {
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]

            if (rootNode.type === 'Network') {
                if (rootNode.networkNodes === undefined) { continue }
                for (let j = 0; j < rootNode.networkNodes.length; j++) {
                    let networkNode = rootNode.networkNodes[j]

                    let eventsServerClient = newEventsServerClient(networkNode)
                    eventsServerClient.initialize()

                    thisObject.eventsServerClients.set(networkNode.id, eventsServerClient)
                }
            }
        }
    }

    async function saveWorkspace() {
        let workspace = UI.projects.superalgos.spaces.designSpace.workspace.workspaceNode

        /* Validation if it is too early to save. */
        if (isInitialized === false) { return }

        /* Validation of 2 sessions opened at the same time. */
        let savedSessionTimestamp = window.localStorage.getItem('Session Timestamp')
        if (Number(savedSessionTimestamp) !== sessionTimestamp) {
            UI.projects.superalgos.spaces.cockpitSpace.setStatus(
                'Could not save the Workspace. You have more that one instance of the Superlagos User Interface open at the same time. Please close this instance as it is older than the others.'
                , 150, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.WARNING)
            return
        }

        /* Validation that there is something to save */
        let textToSave = await stringifyWorkspace()
        if (textToSave === undefined) {
            UI.projects.superalgos.spaces.cockpitSpace.setStatus(
                'Could not save the Workspace. Something is preventing the System to do it at this time.'
                , 150, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.WARNING)
            return
        }

        window.localStorage.setItem('Session Timestamp', sessionTimestamp)

        /* Validation Workspace has a name */
        if (workspace.name === undefined) {
            UI.projects.superalgos.spaces.cockpitSpace.setStatus(
                'Could not save the Workspace. You need to specify a name for it.'
                , 150, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.WARNING)
            return
        }

        let url = 'SaveWorkspace/' + workspace.name
        if (textToSave.indexOf('null,null,null,null,null,null,null,null,null') >= 0) {
            console.log('[WARN] The system tried to save an empty workspace. Saving cancelled.')
            return
        }
        httpRequest(textToSave, url, onResponse)
        return true

        function onResponse(err) {
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                window.localStorage.setItem('Last Used Workspace', workspace.name)
                window.localStorage.setItem('Session Timestamp', sessionTimestamp)
                if (ARE_WE_RECORDING_A_MARKET_PANORAMA === false) {
                    UI.projects.superalgos.spaces.cockpitSpace.setStatus(workspace.name + ' Saved.', 50, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
            } else {
                UI.projects.superalgos.spaces.cockpitSpace.setStatus('Could not save the Workspace at the Client. Please check the Client Console for more information.', 150, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.WARNING)
            }
        }
    }

    async function backupWorkspace(action) {
        let text = await stringifyWorkspace(false)
        let fileName = 'Backup - ' + action.node.type + ' - ' + action.node.name + '.json'
        if (text !== undefined) {
            UI.projects.superalgos.utilities.download.downloadText(fileName, text)
        }
    }

    async function shareWorkspace(action) {
        let text = await stringifyWorkspace(true)
        let fileName = 'Share - ' + action.node.type + ' - ' + action.node.name + '.json'
        if (text !== undefined) {
            UI.projects.superalgos.utilities.download.downloadText(fileName, text)
        }
    }

    async function getNodeById(nodeId) {
        return await executeAction({ name: 'Get Node By Id', project: 'Superalgos', relatedNodeId: nodeId })
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

    async function replacingWorkspacePhysics() {
        if (thisObject.enabled !== true) { return }

        if (workingAtTask > 0) {
            circularProgressBar.physics()

            switch (workingAtTask) {
                case 1:
                    isInitialized = false
                    console.log('[INFO] Replacing Workspace Procedure Started')
                    console.log('[INFO] Deleting Workspace ' + thisObject.workspaceNode.name + '. This might take a few minutes depending on the size of the workspace.')
                    UI.projects.superalgos.spaces.tutorialSpace.stop()
                    let result = await executeAction({ node: thisObject.workspaceNode, name: 'Delete Workspace', project: 'Superalgos' })
                    if (result === false) {
                        console.log('[ERROR] Could not replace the current workspace because there was a problem removing one node from memory.')
                        console.log('[ERROR] The system is at an inconsistent state and your workspace is partially deleted. Saving has been disabled to prevent data loss.')
                        console.log('[ERROR] The only thing you can do now is to fix the APP SCHEMA and refresh the page to reaload the previously saved workspace again.')
                        circularProgressBar.visible = false
                        workingAtTask = 0
                        return
                    }
                    workingAtTask++
                    break
                case 2:
                    console.log('[INFO] Closing Events Server')
                    finalizeEventsServerClients()
                    thisObject.eventsServerClients = new Map()
                    workingAtTask++
                    break
                case 3:
                    console.log('[INFO] Stopping Automatic Saving')
                    clearInterval(savingWorkspaceIntervalId)
                    workingAtTask++
                    break
                case 4:
                    console.log('[INFO] Loading new Workspace ' + loadedWorkspaceNode.name + '.')
                    thisObject.workspaceNode = loadedWorkspaceNode
                    thisObject.workspaceNode.project = 'Superalgos'
                    loadedWorkspaceNode = undefined
                    workingAtTask++
                    break
                case 5:
                    console.log('[INFO] Setting up Workspace')
                    executeAction({ node: thisObject.workspaceNode, name: 'Recreate Workspace', project: 'Superalgos', callBackFunction: finishInitialization })
                    function finishInitialization() {
                        setupEventsServerClients()
                        runTasksAndSessions()
                    }
                    workingAtTask++
                    break
                case 6:
                    console.log('[INFO] Resetting Spaces')
                    UI.projects.superalgos.spaces.chartingSpace.reset()
                    workingAtTask++
                    break
                case 7:
                    console.log('[INFO] Replacing Workspace Procedure Finished')
                    workingAtTask = 0
                    circularProgressBar.visible = false
                    isInitialized = true
                    saveWorkspace()
                    break
            }
        }
    }

    function draw() {
        if (circularProgressBar !== undefined) {
            circularProgressBar.draw()
        }
    }

    async function stringifyWorkspace(removePersonalData) {
        let stringifyReadyNodes = []
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]

            if (rootNode.isPlugin !== true) {
                let node = await executeAction({ node: rootNode, name: 'Get Node Data Structure', project: 'Superalgos', extraParameter: removePersonalData })
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
                        if (networkNode.dataTasks !== undefined && networkNode.dataTasks.payload !== undefined) {
                            networkNode.dataTasks.payload.uiObject.menu.internalClick('Stop All Exchange Data Tasks')
                            networkNode.dataTasks.payload.uiObject.menu.internalClick('Stop All Exchange Data Tasks')
                        }
                        if (networkNode.learningTasks !== undefined && networkNode.learningTasks.payload !== undefined) {
                            networkNode.learningTasks.payload.uiObject.menu.internalClick('Stop All Exchange Learning Tasks')
                            networkNode.learningTasks.payload.uiObject.menu.internalClick('Stop All Exchange Learning Tasks')
                        }
                        if (networkNode.testingTradingTasks !== undefined && networkNode.testingTradingTasks.payload !== undefined) {
                            networkNode.testingTradingTasks.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                            networkNode.testingTradingTasks.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                        }
                        if (networkNode.productionTradingTasks !== undefined && networkNode.productionTradingTasks.payload !== undefined) {
                            networkNode.productionTradingTasks.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                            networkNode.productionTradingTasks.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                        }
                    }
                }
            }
        }
    }

    async function getNodeByShortcutKey(searchingKey) {
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let node = await executeAction({ node: rootNode, name: 'Get Node By Shortcut Key', project: 'Superalgos', extraParameter: searchingKey })
            if (node !== undefined) { return node }
        }
    }

    async function getNodeThatIsOnFocus() {
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let node = await executeAction({ node: rootNode, name: 'Get Node On Focus', project: 'Superalgos' })
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

    function getProjectsHeads() {
        let nodes = []
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let nodeDefinition = getNodeDefinition(rootNode)
            if (nodeDefinition !== undefined) {
                if (nodeDefinition.isProjectHead === true) {
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

    function getHierarchyHeadsByType(nodeType) {
        let hiriatchyHeads = getHierarchyHeads()
        for (let i = 0; i < hiriatchyHeads.length; i++) {
            let hiriatchyHead = hiriatchyHeads[i]
            if (hiriatchyHead.type === nodeType) {
                return hiriatchyHead
            }
        }
    }

    function replaceWorkspaceByLoadingOne(project, name) {

        let webCommand
        if (project !== "") {
            name = name.replace('Plugin \u2192 ', '')
            webCommand = 'LoadPlugin' + '/' + project + '/' + 'Workspaces' + '/' + name + '.json'
        } else {
            webCommand = 'LoadMyWorkspace' + '/' + name
        }

        httpRequest(undefined, webCommand, onFileReceived)
        function onFileReceived(err, text, response) {
            if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                UI.projects.superalgos.spaces.cockpitSpace.setStatus('Could not load the Workspace called "' + name + '". ', 500, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.WARNING)
                return
            }

            loadedWorkspaceNode = JSON.parse(text)
            saveWorkspace()
            UI.projects.superalgos.spaces.cockpitSpace.toTop()

            let position = {
                x: browserCanvas.width / 2,
                y: browserCanvas.height / 2
            }

            UI.projects.superalgos.spaces.floatingSpace.container.frame.position.x = browserCanvas.width / 2 - UI.projects.superalgos.spaces.floatingSpace.container.frame.width / 2
            UI.projects.superalgos.spaces.floatingSpace.container.frame.position.y = browserCanvas.height / 2 - UI.projects.superalgos.spaces.floatingSpace.container.frame.height / 2

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
            point = UI.projects.superalgos.spaces.floatingSpace.container.frame.unframeThisPoint(point)
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
                x: spawnPosition.x,
                y: spawnPosition.y
            }

            if (droppedNode.savedPayload !== undefined) {
                positionOffset.x = positionOffset.x - droppedNode.savedPayload.position.x
                positionOffset.y = positionOffset.y - droppedNode.savedPayload.position.y
            }

            thisObject.workspaceNode.rootNodes.push(droppedNode)
            executeAction({ node: droppedNode, name: 'Create UI Object', project: 'Superalgos', extraParameter: positionOffset })
            executeAction({ name: 'Connect Children to Reference Parents', project: 'Superalgos' })

            droppedNode = undefined
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] spawn -> err = ' + err.stack) }
        }
    }

    async function executeAction(action) {
        /* 
        Supported parameters as part of the action object:

        action.node : It is the node at which the action was taken. If not specific node is involved then it should be the workspace node.
        action.relatedNode : It is a secondary node involved with the action. For example the node to which the main node is being attached to.
        action.relatedNodeId : It is the id of a node related to the action.
        action.relatedNodeType : It is the type of the node related to the action.
        action.callBackFunction : A callback function to call when the action is complete.
        action.extraParameter : A parameter to send unusual info to the fnction processing the action.

        We add rootNodes property here.
        */
        action.rootNodes = thisObject.workspaceNode.rootNodes

        let actionSwitch = actionSwitchesByProject.get(action.project)
        return actionSwitch.executeAction(action)

    }
}
