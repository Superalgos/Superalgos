
function newWorkspace() {
    const MODULE_NAME = 'Workspace'
    const ERROR_LOG = true
    const logger = newWebDebugLog()


    let thisObject = {
        isInitialized: false,
        workspaceNode: undefined,
        container: undefined,
        enabled: false,
        eventsServerClients: new Map(),
        replaceWorkspaceByLoadingOne: replaceWorkspaceByLoadingOne,
        save: saveWorkspace,
        backup: backupWorkspace,
        share: shareWorkspace,
        getNodesByTypeAndHierarchyHeadsType: getNodesByTypeAndHierarchyHeadsType,
        getProjectsHeads: getProjectsHeads,
        getProjectHeadByNodeType: getProjectHeadByNodeType,
        getHierarchyHeads: getHierarchyHeads,
        getHierarchyHeadsById: getHierarchyHeadsById,
        getHierarchyHeadsByCodeNameAndNodeType: getHierarchyHeadsByCodeNameAndNodeType,
        getHierarchyHeadByNodeType: getHierarchyHeadByNodeType,
        getHierarchyHeadsByNodeType: getHierarchyHeadsByNodeType,
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
        x: UI.projects.foundations.spaces.floatingSpace.container.frame.width / 2,
        y: UI.projects.foundations.spaces.floatingSpace.container.frame.height / 2
    }

    thisObject.workspaceNode = {}
    thisObject.workspaceNode.rootNodes = []

    let savingWorkspaceIntervalId
    let workingAtTask = 0
    let loadedWorkspaceNode
    let sessionTimestamp = (new Date()).valueOf()
    window.localStorage.setItem('Session Timestamp', sessionTimestamp)

    let actionSwitchesByProject = new Map()

    return thisObject

    function finalize() {
        thisObject.definition = undefined
        thisObject.workspaceNode = undefined
        actionSwitchesByProject = undefined
    }

    async function initialize() {
        let promise = new Promise((resolve, reject) => {

            try {
                UI.projects.foundations.utilities.statusBar.changeStatus("Initializing...")

                /* Set up the action switches map */
                for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
                    let project = PROJECTS_SCHEMA[i].name
                    try {
                        let actionSwitch = eval('new' + project.replaceAll('-', '') + 'ActionSwitch()')
                        actionSwitchesByProject.set(project, actionSwitch)
                    } catch (err) {
                        console.log('[WARN] Action Switch for project ' + project + ' not found.')
                    }
                }

                const browserURL = new URLSearchParams(window.location.search);
                const queryString = Object.fromEntries(browserURL.entries());
                /* 
                By default, we will load the last used workspace.
                */
                let lastUsedWorkspace = window.localStorage.getItem('Last Used Workspace')

                if (
                    (lastUsedWorkspace !== 'undefined' && lastUsedWorkspace !== null && lastUsedWorkspace !== undefined) ||
                    (queryString.initialWorkspaceName !== undefined)
                ) {
                    let webCommand
                    if (queryString.initialWorkspaceType !== undefined) {
                        /*
                        We get here when the workspace to lead comes at the URL 
                        */
                        UI.projects.foundations.utilities.statusBar.changeStatus("Loading Workspace " + queryString.initialWorkspaceName + "...")
                        if (queryString.initialWorkspaceType !== 'My-Workspaces') {
                            webCommand = 'LoadPlugin' + '/' + queryString.initialWorkspaceProject + '/' + 'Workspaces' + '/' + queryString.initialWorkspaceName + '.json'
                        } else {
                            webCommand = 'LoadMyWorkspace' + '/' + queryString.initialWorkspaceName
                        }
                    } else {
                        /*
                        We get here when the workspace to lead is the last saved workspace.
                        */
                        UI.projects.foundations.utilities.statusBar.changeStatus("Loading Workspace " + lastUsedWorkspace + "...")
                        webCommand = 'LoadMyWorkspace' + '/' + lastUsedWorkspace
                    }

                    httpRequest(undefined, webCommand, onFileReceived)
                    function onFileReceived(err, text, response) {
                        if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                            UI.projects.foundations.spaces.cockpitSpace.setStatus('Could not load the Workspace called "' + lastUsedWorkspace + '". Will switch to the default Workspace instead.', 500, UI.projects.foundations.spaces.cockpitSpace.statusTypes.WARNING)
                            thisObject.workspaceNode = getWorkspace() // This is the default workspace that comes with the system.
                            thisObject.workspaceNode.project = 'Foundations'
                            recreateWorkspace()
                            return
                        }
                        thisObject.workspaceNode = JSON.parse(text)
                        thisObject.workspaceNode.project = 'Foundations'
                        recreateWorkspace()
                    }
                } else {
                    thisObject.workspaceNode = getWorkspace() // This is the default workspace that comes with the system.
                    thisObject.workspaceNode.project = 'Foundations'
                    recreateWorkspace()
                }

                function recreateWorkspace() {
                    UI.projects.foundations.utilities.statusBar.changeStatus("Connecting all the workspace nodes...")
                    executeAction({ node: thisObject.workspaceNode, name: 'Recreate Workspace', project: 'Visual-Scripting', callBackFunction: finishInitialization })
                }

                function finishInitialization() {

                    setupEventsServerClients()
                    runTasksAndSessions()

                    thisObject.enabled = true
                    UI.projects.foundations.spaces.cockpitSpace.initializePosition()
                    CAN_SPACES_DRAW = true

                    thisObject.isInitialized = true

                    //savingWorkspaceIntervalId = setInterval(saveWorkspace, 60000)
                    UI.projects.foundations.utilities.statusBar.changeStatus("Displaying the UI...")

                    resolve()
                }
            } catch (err) {
                if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
            }
        })

        return promise
    }

    function runTasksAndSessions() {
        executeAction({ name: 'Syncronize Tasks', project: 'Visual-Scripting' })
        executeAction({ name: 'Syncronize Trading Sessions', project: 'Visual-Scripting' })
        executeAction({ name: 'Syncronize Portfolio Sessions', project: 'Visual-Scripting' })
        executeAction({ name: 'Syncronize Learning Sessions', project: 'Visual-Scripting' })
    }

    function setupEventsServerClients() {
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]

            if (rootNode.type === 'LAN Network') {
                if (rootNode.lanNetworkNodes === undefined) { continue }
                for (let j = 0; j < rootNode.lanNetworkNodes.length; j++) {
                    let lanNetworkNode = rootNode.lanNetworkNodes[j]

                    let eventsServerClient = newEventsServerClient(lanNetworkNode)
                    eventsServerClient.initialize()

                    thisObject.eventsServerClients.set(lanNetworkNode.id, eventsServerClient)
                }
            }
        }
    }

    async function saveWorkspace(callBackFunction) {
        if (UI.environment.DEMO_MODE === true) {
            return
        }

        let workspace = UI.projects.foundations.spaces.designSpace.workspace.workspaceNode

        /* Validation if it is too early to save. */
        if (thisObject.isInitialized === false) {
            console.log('Workspace not saved because it has not been initialized. =')
            return
        }

        /* Validation of 2 sessions opened at the same time. */
        let savedSessionTimestamp = window.localStorage.getItem('Session Timestamp')
        if (Number(savedSessionTimestamp) !== sessionTimestamp) {
            UI.projects.foundations.spaces.cockpitSpace.setStatus(
                'Could not save the Workspace. You have more that one instance of the Superlagos User Interface open at the same time. Please close this instance as it is older than the others.'
                , 150, UI.projects.foundations.spaces.cockpitSpace.statusTypes.WARNING)
            return
        }

        /* Validation that there is something to save */
        let textToSave = await stringifyWorkspace()
        if (textToSave === undefined) {
            UI.projects.foundations.spaces.cockpitSpace.setStatus(
                'Could not save the Workspace. Something is preventing the System to do it at this time.'
                , 150, UI.projects.foundations.spaces.cockpitSpace.statusTypes.WARNING)
            return
        }

        window.localStorage.setItem('Session Timestamp', sessionTimestamp)

        /* Validation Workspace has a name */
        if (workspace.name === undefined) {
            UI.projects.foundations.spaces.cockpitSpace.setStatus(
                'Could not save the Workspace. You need to specify a name for it.'
                , 150, UI.projects.foundations.spaces.cockpitSpace.statusTypes.WARNING)
            return
        }

        let url = 'SaveWorkspace/' + workspace.name
        if (textToSave.indexOf('null,null,null,null,null,null,null,null,null') >= 0) {
            console.log('[WARN] The system tried to save an empty workspace. Saving cancelled.')
            return
        }
        httpRequest(textToSave, url, onResponse)
        savePlugins()
        return true

        function onResponse(err) {
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                setLastUsedWorkspace()

                if (ARE_WE_RECORDING_A_MARKET_PANORAMA === false) {
                    UI.projects.foundations.spaces.cockpitSpace.setStatus(workspace.name + ' Saved.', 50, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                if (callBackFunction !== undefined) {
                    callBackFunction()
                }
            } else {
                UI.projects.foundations.spaces.cockpitSpace.setStatus('Could not save the Workspace at the Client. Please check the Client Console for more information.', 150, UI.projects.foundations.spaces.cockpitSpace.statusTypes.WARNING)
            }
        }
    }

    function setLastUsedWorkspace() {
        window.localStorage.setItem('Last Used Workspace', UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.name)
        window.localStorage.setItem('Session Timestamp', sessionTimestamp)
    }

    function savePlugins() {
        /*
        Here we will scan the workspace for all Plugins and we will try to save them.
        The first thing to do is to find the Plugins hierarchy.
        */
        let plugins = getHierarchyHeadByNodeType('Plugins')
        if (plugins === undefined) { return }

        for (let i = 0; i < plugins.pluginProjects.length; i++) {
            let pluginProject = plugins.pluginProjects[i]
            /*
            Here we are inside the Voting Program, so we will crawl all it's children.
            */
            let schemaDocument = getSchemaDocument(pluginProject)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let j = 0; j < schemaDocument.childrenNodesProperties.length; j++) {
                    let property = schemaDocument.childrenNodesProperties[j]

                    switch (property.type) {
                        case 'node': {
                            let childNode = pluginProject[property.name]
                            if (childNode === undefined) { continue }
                            if (childNode.pluginFiles === undefined) { continue }
                            for (let k = 0; k < childNode.pluginFiles.length; k++) {
                                let pluginFile = childNode.pluginFiles[k]

                                let saveWithWorkspace = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(pluginFile.payload, 'saveWithWorkspace')
                                if (saveWithWorkspace === true) {
                                    UI.projects.communityPlugins.utilities.plugins.savePluginFileAtClient(pluginFile)
                                }
                            }
                        }
                            break
                        case 'array': {
                            /*Nothing to do here*/
                            break
                        }
                    }
                }
            }
        }
    }

    async function backupWorkspace(action) {
        let text = await stringifyWorkspace(false)
        let fileName = 'Backup - ' + action.node.type + ' - ' + action.node.name + '.json'
        if (text !== undefined) {
            UI.projects.foundations.utilities.download.downloadText(fileName, text)
        }
    }

    async function shareWorkspace(action) {
        let text = await stringifyWorkspace(true)
        let fileName = 'Share - ' + action.node.type + ' - ' + action.node.name + '.json'
        if (text !== undefined) {
            UI.projects.foundations.utilities.download.downloadText(fileName, text)
        }
    }

    async function getNodeById(nodeId) {
        return await executeAction({ name: 'Get Node By Id', project: 'Visual-Scripting', relatedNodeId: nodeId })
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

            switch (workingAtTask) {
                case 1: {
                    UI.projects.foundations.utilities.statusBar.changeStatus('Saving Workspace ' + thisObject.workspaceNode.name + '.')
                    workingAtTask = 0

                    UI.projects.education.spaces.docsSpace.sidePanelTab.close()
                    UI.projects.foundations.spaces.workspaceSpace.sidePanelTab.close()
                    UI.projects.foundations.spaces.codeEditorSpace.sidePanelTab.close()
                    UI.projects.foundations.spaces.floatingSpace.inMapMode = true
                    workingAtTask = 2
                    break
                }
                case 2:
                    {
                        UI.projects.foundations.utilities.statusBar.changeStatus('Unloading Workspace ' + thisObject.workspaceNode.name + '. This might take a few minutes depending on the size of the workspace.')
                        setTimeout(takeAction, 100)
                        workingAtTask = 0

                        async function takeAction() {
                            thisObject.isInitialized = false
                            UI.projects.education.spaces.tutorialSpace.stop()

                            let result = await executeAction({ node: thisObject.workspaceNode, name: 'Delete Workspace', project: 'Visual-Scripting', callBackFunction: onDeleted })
                            if (result === false) {
                                console.log('[ERROR] Could not replace the current workspace because there was a problem removing one node from memory.')
                                console.log('[ERROR] The system is at an inconsistent state and your workspace is partially deleted. Saving has been disabled to prevent data loss.')
                                console.log('[ERROR] The only thing you can do now is to fix the APP SCHEMA and refresh the page to reload the previously saved workspace again.')
                                workingAtTask = 0
                                return
                            }
                            function onDeleted() {
                                workingAtTask = 3
                            }
                        }

                        break
                    }
                case 3:
                    {
                        UI.projects.foundations.utilities.statusBar.changeStatus('Stopping Events Server Client...')
                        setTimeout(takeAction, 100)
                        workingAtTask = 0

                        function takeAction() {
                            finalizeEventsServerClients()
                            thisObject.eventsServerClients = new Map()
                            workingAtTask = 4
                        }
                        break
                    }
                case 4:
                    {
                        UI.projects.foundations.utilities.statusBar.changeStatus('Stopping Automatic Saving...')
                        setTimeout(takeAction, 100)
                        workingAtTask = 0

                        function takeAction() {
                            clearInterval(savingWorkspaceIntervalId)
                            workingAtTask = 5
                        }
                        break
                    }
                case 5:
                    {
                        UI.projects.foundations.utilities.statusBar.changeStatus('Loading Workspace ' + loadedWorkspaceNode.name + '...')
                        setTimeout(takeAction, 100)
                        workingAtTask = 0

                        function takeAction() {
                            thisObject.workspaceNode = loadedWorkspaceNode
                            thisObject.workspaceNode.project = 'Foundations'
                            loadedWorkspaceNode = undefined
                            workingAtTask = 6
                        }
                        break
                    }
                case 6:
                    {
                        UI.projects.foundations.utilities.statusBar.changeStatus('Setting up Workspace...')
                        setTimeout(takeAction, 100)
                        workingAtTask = 0

                        function takeAction() {
                            executeAction({ node: thisObject.workspaceNode, name: 'Recreate Workspace', project: 'Visual-Scripting', callBackFunction: finishInitialization })
                            function finishInitialization() {
                                setupEventsServerClients()
                                workingAtTask = 7
                            }
                        }
                        break
                    }
                case 7:
                    {
                        UI.projects.foundations.utilities.statusBar.changeStatus('Rebuilding the Charting Space...')
                        setTimeout(takeAction, 100)
                        workingAtTask = 0

                        function takeAction() {
                            UI.projects.foundations.spaces.chartingSpace.reset()
                            workingAtTask = 8
                        }
                        break
                    }
                case 8:
                    {
                        workingAtTask = 0
                        UI.projects.foundations.spaces.floatingSpace.inMapMode = false
                        thisObject.isInitialized = true

                        UI.projects.governance.spaces.reportsSpace.reset()
                        UI.projects.governance.spaces.userProfileSpace.reset()
                        UI.projects.foundations.spaces.codeEditorSpace.reset()
                        await UI.projects.education.spaces.docsSpace.reset()
                        await UI.projects.education.spaces.tutorialSpace.reset()

                        runTasksAndSessions()
                        setLastUsedWorkspace()
                        break
                    }
            }
        }
    }

    function draw() {

    }

    async function stringifyWorkspace(removePersonalData) {
        let stringifyReadyNodes = []
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]

            if (rootNode.isPlugin !== true) {
                let node = await executeAction({ node: rootNode, name: 'Get Node Data Structure', project: 'Visual-Scripting', extraParameter: removePersonalData })
                stringifyReadyNodes.push(node)
            }
        }
        let workspace = {
            type: 'Workspace',
            name: thisObject.workspaceNode.name,
            config: thisObject.workspaceNode.config,
            rootNodes: stringifyReadyNodes
        }

        /*
        Sometimes it happens that there are no rootNodes. 
        In those situations the workspace can not be stringified,
        to prevent later saving it corrupting the original file.
        */
        if (stringifyReadyNodes.length > 0) {
            return JSON.stringify(workspace, undefined, 4)
        } else {
            return
        }
    }

    function stopAllRunningTasks() {
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            if (rootNode.type === 'LAN Network') {
                if (rootNode.lanNetworkNodes !== undefined) {
                    for (let j = 0; j < rootNode.lanNetworkNodes.length; j++) {
                        let lanNetworkNode = rootNode.lanNetworkNodes[j]
                        if (lanNetworkNode.dataTasks !== undefined && lanNetworkNode.dataTasks.payload !== undefined) {
                            lanNetworkNode.dataTasks.payload.uiObject.menu.internalClick('Stop All Exchange Data Tasks')
                            lanNetworkNode.dataTasks.payload.uiObject.menu.internalClick('Stop All Exchange Data Tasks')
                        }
                        if (lanNetworkNode.learningTasks !== undefined && lanNetworkNode.learningTasks.payload !== undefined) {
                            lanNetworkNode.learningTasks.payload.uiObject.menu.internalClick('Stop All Exchange Learning Tasks')
                            lanNetworkNode.learningTasks.payload.uiObject.menu.internalClick('Stop All Exchange Learning Tasks')
                        }
                        if (lanNetworkNode.testingTradingTasks !== undefined && lanNetworkNode.testingTradingTasks.payload !== undefined) {
                            lanNetworkNode.testingTradingTasks.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                            lanNetworkNode.testingTradingTasks.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                        }
                        if (lanNetworkNode.productionTradingTasks !== undefined && lanNetworkNode.productionTradingTasks.payload !== undefined) {
                            lanNetworkNode.productionTradingTasks.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                            lanNetworkNode.productionTradingTasks.payload.uiObject.menu.internalClick('Stop All Exchange Trading Tasks')
                        }
                        if (lanNetworkNode.testingPortfolioTasks !== undefined && lanNetworkNode.testingPortfolioTasks.payload !== undefined) {
                            lanNetworkNode.testingPortfolioTasks.payload.uiObject.menu.internalClick('Stop All Exchange Portfolio Tasks')
                            lanNetworkNode.testingPortfolioTasks.payload.uiObject.menu.internalClick('Stop All Exchange Portfolio Tasks')
                        }
                        if (lanNetworkNode.productionPortfolioTasks !== undefined && lanNetworkNode.productionPortfolioTasks.payload !== undefined) {
                            lanNetworkNode.productionPortfolioTasks.payload.uiObject.menu.internalClick('Stop All Exchange Portfolio Tasks')
                            lanNetworkNode.productionPortfolioTasks.payload.uiObject.menu.internalClick('Stop All Exchange Portfolio Tasks')
                        }
                    }
                }
            }
        }
    }

    async function getNodeByShortcutKey(searchingKey) {
        if (thisObject.workspaceNode === undefined) { return }
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let node = await executeAction({ node: rootNode, name: 'Get Node By Shortcut Key', project: 'Visual-Scripting', extraParameter: searchingKey })
            if (node !== undefined) { return node }
        }
    }

    async function getNodeThatIsOnFocus() {
        if (thisObject.workspaceNode === undefined) { return }
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let node = await executeAction({ node: rootNode, name: 'Get Node On Focus', project: 'Visual-Scripting' })
            if (node !== undefined) { return node }
        }
    }

    function getHierarchyHeads() {
        if (thisObject.workspaceNode === undefined) { return }
        let nodes = []
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let schemaDocument = getSchemaDocument(rootNode)
            if (schemaDocument !== undefined) {
                if (schemaDocument.isHierarchyHead === true) {
                    nodes.push(rootNode)
                }
            }
        }
        return nodes
    }

    function getProjectsHeads() {
        if (thisObject.workspaceNode === undefined) { return }
        let nodes = []
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
            let rootNode = thisObject.workspaceNode.rootNodes[i]
            let schemaDocument = getSchemaDocument(rootNode)
            if (schemaDocument !== undefined) {
                if (schemaDocument.isProjectHead === true) {
                    nodes.push(rootNode)
                }
            }
        }
        return nodes
    }

    function getProjectHeadByNodeType(nodeType) {
        let projectHeads = getProjectsHeads()
        if (projectHeads === undefined) { return }
        for (let i = 0; i < projectHeads.length; i++) {
            let hierarchyHead = projectHeads[i]
            if (hierarchyHead.type === nodeType) {
                return hierarchyHead
            }
        }
    }

    function getHierarchyHeadsById(nodeId) {
        let hierarchyHeads = getHierarchyHeads()
        if (hierarchyHeads === undefined) { return }
        for (let i = 0; i < hierarchyHeads.length; i++) {
            let hierarchyHead = hierarchyHeads[i]
            if (hierarchyHead.id === nodeId) {
                return hierarchyHead
            }
        }
    }

    function getHierarchyHeadsByCodeNameAndNodeType(codeName, nodeType) {
        let hierarchyHeads = getHierarchyHeads()
        if (hierarchyHeads === undefined) { return }
        for (let i = 0; i < hierarchyHeads.length; i++) {
            let hierarchyHead = hierarchyHeads[i]
            let hierarchyHeadCodeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(hierarchyHead.payload, 'codeName')
            if (hierarchyHeadCodeName === codeName && hierarchyHead.type === nodeType) {
                return hierarchyHead
            } else if (hierarchyHead.name === codeName && hierarchyHead.type === nodeType) {
                // This condition is used for auto fixing references in UiObjectsFromNodes.js
                return hierarchyHead
            }
        }
    }

    function getHierarchyHeadByNodeType(nodeType) {
        let hierarchyHeads = getHierarchyHeads()
        if (hierarchyHeads === undefined) { return }
        for (let i = 0; i < hierarchyHeads.length; i++) {
            let hierarchyHead = hierarchyHeads[i]
            if (hierarchyHead.type === nodeType) {
                return hierarchyHead
            }
        }
    }

    function getHierarchyHeadsByNodeType(nodeType) {
        let hierarchyHeads = getHierarchyHeads()
        let resultArray = []
        if (hierarchyHeads === undefined) { return }
        for (let i = 0; i < hierarchyHeads.length; i++) {
            let hierarchyHead = hierarchyHeads[i]
            if (hierarchyHead.type === nodeType) {
                resultArray.push(hierarchyHead)
            }
        }
        return resultArray
    }

    function getNodesByTypeAndHierarchyHeadsType(nodeType, hierarchyHeadsType) {
        let hierarchyHeads = getHierarchyHeads()
        let resultArray = []
        if (hierarchyHeads === undefined) { return }
        for (let i = 0; i < hierarchyHeads.length; i++) {
            let hierarchyHead = hierarchyHeads[i]
            if (hierarchyHead.type === hierarchyHeadsType) {

                let nodeArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(hierarchyHead, nodeType)
                resultArray = resultArray.concat(nodeArray)
            }
        }
        return resultArray
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
                UI.projects.foundations.spaces.cockpitSpace.setStatus('Could not load the Workspace called "' + name + '". ', 500, UI.projects.foundations.spaces.cockpitSpace.statusTypes.WARNING)
                return
            }

            loadedWorkspaceNode = JSON.parse(text)
            UI.projects.foundations.spaces.cockpitSpace.toTop()

            UI.projects.foundations.spaces.floatingSpace.container.frame.position.x = browserCanvas.width / 2 - UI.projects.foundations.spaces.floatingSpace.container.frame.width / 2
            UI.projects.foundations.spaces.floatingSpace.container.frame.position.y = browserCanvas.height / 2 - UI.projects.foundations.spaces.floatingSpace.container.frame.height / 2

            workingAtTask = 1
        }
    }

    function spawn(nodeText, mousePointer) {
        try {
            let point = {
                x: mousePointer.x,
                y: mousePointer.y
            }
            point = UI.projects.foundations.spaces.floatingSpace.container.frame.unframeThisPoint(point)
            spawnPosition.x = point.x
            spawnPosition.y = point.y

            let droppedNode = JSON.parse(nodeText)

            if (droppedNode.type === 'Workspace') {
                loadedWorkspaceNode = droppedNode
                workingAtTask = 1
                return
            }

            /* It does not exist, so we recreate it respecting the inner state of each object. */
            let positionOffset = {
                x: spawnPosition.x,
                y: spawnPosition.y
            }

            if (droppedNode.savedPayload !== undefined) {
                positionOffset.x = positionOffset.x - droppedNode.savedPayload.position.x
                positionOffset.y = positionOffset.y - droppedNode.savedPayload.position.y
            }

            thisObject.workspaceNode.rootNodes.push(droppedNode)
            executeAction({ node: droppedNode, name: 'Create UI Object', project: 'Visual-Scripting', extraParameter: positionOffset })
            executeAction({ name: 'Connect Children to Reference Parents', project: 'Visual-Scripting' })

            // Recreate autocomplete models
            UI.projects.foundations.spaces.codeEditorSpace.editorPage.reset()

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
        action.extraParameter : A parameter to send unusual info to the function processing the action.

        We add rootNodes property here.
        */
        action.rootNodes = thisObject.workspaceNode.rootNodes

        let actionSwitch = actionSwitchesByProject.get(action.project)
        if (actionSwitch === undefined) {
            console.log('[ERROR] Action Switch for project ' + action.project + ' could not be found.')
            return
        }
        return actionSwitch.executeAction(action)

    }
}
