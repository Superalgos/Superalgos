function newWorkspacesSystemActionUndoRedo() {
    let thisObject = {
        undo: undo,
        redo: redo,
        undoRedoSubmenu: undoRedoSubmenu
    }
    
    let undoStack
    let redoStack

    return thisObject

    /* Every action needs its own inverse (undo) and reverse-inverse (redo) action function. Most of them
    rely on node clones. The cloning happens here or in the Node Action Switch, depending on the action.
    The clones get the same id as the original. This is not a problem since every id is unambiguously mapped
    to one node object in the mapOfNodes.
    References to a cloned node are updated to the clone object, so stale nodes that have been replaced by clones
    should have no more references and therefore be garbage-collected.
    Once a new action has been pushed from the Node Action Switch to the undo stack, it will get passed around
    between undo stack and redo stack and will not be handled by the Node Action Switch again. */

    async function undo(stateIndex) {
        undoStack = UI.projects.workspaces.spaces.designSpace.workspace.undoStack
        redoStack = UI.projects.workspaces.spaces.designSpace.workspace.redoStack
        if (stateIndex === undefined && undoStack.length > 0) {
            stateIndex = undoStack.length - 1
        }
        if (stateIndex === undefined) { return }

        try {
            for (let i = undoStack.length - 1; i >= stateIndex; i--) {
                let action = undoStack[i].action
                let node
                let nodeClone
                let nodesToClone
                let nodeClones
                let parentNode
                let chainParent
                let referenceParent
                let previousPosition
                let displaceVector

                /* The reference of the primary node we act upon depends on prior actions.
                One of the following will get us the node we’re looking for.
                If it has been deleted at some point, we get its replacement. */
                if (undoStack[i].newUiObject !== undefined) {
                    node = (undoStack[i].newUiObject.cleaned !== true) ?
                        undoStack[i].newUiObject :
                        await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(undoStack[i].newUiObject.id)
                } else if (undoStack[i].nodeClone !== undefined) {
                    node = (undoStack[i].nodeClone.cleaned !== true) ?
                        undoStack[i].nodeClone :
                        await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(undoStack[i].nodeClone.id)
                } else {
                    node = (action.node.cleaned !== true) ?
                        action.node :
                        await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(action.node.id)
                }

                switch (action.name) {
                    /* Community Plugins Actions */
                    case 'Add Missing Plugin Projects':
                    case 'Add Missing Plugin Types':
                    case 'Add Missing Plugin Data Mines':
                    case 'Add Missing Plugin Trading Mines':
                    case 'Add Missing Plugin Trading Systems':
                    case 'Add Missing Plugin Trading Engines':
                    case 'Add Missing Plugin Portfolio Mines':
                    case 'Add Missing Plugin Portfolio Systems':
                    case 'Add Missing Plugin Portfolio Engines':
                    case 'Add Missing Plugin Learning Mines':
                    case 'Add Missing Plugin Learning Systems':
                    case 'Add Missing Plugin Learning Engines':
                    case 'Add Missing Plugin Tutorials':
                    case 'Add Missing Plugin API Maps':
                    case 'Add Missing Plugin P2P Networks':
                    case 'Add Specified Plugin Data Mine':
                    /* Data Mining actions */
                    case 'Add All Data Dependencies':
                    case 'Add All Data Mine Dependencies':
                    case 'Add All Output Datasets':
                    /* Foundations actions */
                    case 'Add Missing Project Data Tasks':
                    case 'Add Missing Exchange Data Tasks':
                    case 'Add Missing Market Data Tasks':
                    case 'Add Missing Data Mine Tasks':
                    case 'Add Missing Project Trading Tasks':
                    case 'Add Missing Exchange Trading Tasks':
                    case 'Add Missing Market Trading Tasks':
                    case 'Add Missing Trading Mine Tasks':
                    case 'Add Missing Project Portfolio Tasks':
                    case 'Add Missing Exchange Portfolio Tasks':
                    case 'Add Missing Market Portfolio Tasks':
                    case 'Add Missing Portfolio Mine Tasks':
                    case 'Add Missing Project Learning Tasks':
                    case 'Add Missing Exchange Learning Tasks':
                    case 'Add Missing Market Learning Tasks':
                    case 'Add Missing Learning Mine Tasks':
                    case 'Add All Tasks':
                    case 'Add Missing Crypto Exchanges':
                    case 'Add Missing Assets':
                    case 'Add Missing Markets':
                    case 'Add All Data Products':
                    case 'Add All Data Mine Products':
                    case 'Add All Learning Mine Products':
                    case 'Add All Trading Mine Products':
                    case 'Add All Portfolio Mine Products':
                    case 'Add Missing Market Data Products':
                    case 'Add Missing Market Trading Products':
                    case 'Add Missing Market Portfolio Products':
                    case 'Add Missing Market Learning Products':
                    case 'Add Missing Exchange Learning Products':
                    case 'Add Missing Exchange Trading Products':
                    case 'Add Missing Exchange Portfolio Products':
                    case 'Add Missing Exchange Data Products':
                    case 'Add Missing Project Learning Products':
                    case 'Add Missing Project Trading Products':
                    case 'Add Missing Project Portfolio Products':
                    case 'Add Missing Project Data Products':
                    case 'Add Missing Learning Session References':
                    case 'Add Missing Trading Session References':
                    case 'Add Missing Portfolio Session References':
                    case 'Add All Layer Panels':
                    case 'Add All Layer Polygons':
                    case 'Add All Mine Layers':
                    case 'Add Missing Time Machines':
                    case 'Add Missing Dashboards':
                    case 'Add Missing Project Dashboards':
                    /* Governance actions */
                    case 'Install Missing Votes':
                    case 'Install Missing Claims':
                    /* Visual Scripting actions */
                    case 'Add Missing Children':
                    /* Workspaces actions */
                    case 'Add Missing Workspace Projects':
                    case 'Add Specified Project':
                        undoStack[i].nodeClones = []
                        for (let newUiObject of undoStack[i].newUiObjects) {
                            node = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(newUiObject.id)
                            nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(node, false)
                            UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(node, action.rootNodes)
                            undoStack[i].nodeClones.push(nodeClone)
                        }
                        break

                    case 'Add UI Object':
                    case 'Create UI Object':
                        nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(node, false)
                        UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(node, action.rootNodes)
                        undoStack[i].nodeClone = nodeClone
                        break

                    case 'Change Arrangement Style':
                        node.payload.floatingObject.arrangementStyleToggle()
                        node.payload.floatingObject.arrangementStyleToggle()
                        node.payload.floatingObject.arrangementStyleToggle()
                        node.payload.floatingObject.arrangementStyleToggle()
                        node.payload.floatingObject.arrangementStyleToggle()
                        break

                    case 'Change Distance to Parent':
                        node.payload.floatingObject.distanceToParentToggle()
                        node.payload.floatingObject.distanceToParentToggle()
                        node.payload.floatingObject.distanceToParentToggle()
                        node.payload.floatingObject.distanceToParentToggle()
                        node.payload.floatingObject.distanceToParentToggle()
                        break

                    case 'Change Tension Level':
                        node.payload.floatingObject.angleToParentToggle()
                        node.payload.floatingObject.angleToParentToggle()
                        node.payload.floatingObject.angleToParentToggle()
                        node.payload.floatingObject.angleToParentToggle()
                        break

                    case 'Configure':
                        let previousConfig = node.config
                        node.config = undoStack[i].previousConfig
                        undoStack[i].previousConfig = previousConfig
                        break

                    case 'Create Reference':
                        let referenceParentId = node.payload.referenceParent.id
                        UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceDetachNode(node)
                        undoStack[i].referenceParentId = referenceParentId
                        break

                    case 'Delete UI Object':
                        parentNode = (node.savedPayload.parentNode !== undefined) ?
                            await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(node.savedPayload.parentNode.id) :
                            undefined
                        chainParent = (node.savedPayload.chainParent !== undefined) ?
                            await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(node.savedPayload.chainParent.id) :
                            undefined
                        await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.unDeleteUIObject(
                            node,
                            parentNode,
                            chainParent,
                            action.rootNodes
                        )
                        break

                    case 'Edit':
                    case 'Fetch Code to Javascript Code':
                        let previousCode = node.code
                        node.code = undoStack[i].previousCode
                        undoStack[i].previousCode = previousCode
                        break

                    case 'Freeze / Unfreeze':
                        node.payload.floatingObject.freezeToggle()
                        break

                    case 'Install Market':
                    case 'Uninstall Market':
                        /* inefficient brute-force method */
                        nodesToClone = []
                        nodeClones = []
                        for (let rootNode of action.rootNodes) {
                            if (rootNode.type === 'LAN Network' || rootNode.type === 'Charting Space') {
                                let node = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(rootNode.id)
                                nodesToClone.push(node)
                            }
                        }
                        for (let node of nodesToClone) {
                            let nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(node, false)
                            await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(node, action.rootNodes)
                            nodeClones.push(nodeClone)
                        }
                        for (let nodeClone of undoStack[i].nodeClones) {
                            await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.unDeleteUIObject(nodeClone, undefined, undefined, action.rootNodes)
                        }
                        undoStack[i].nodeClones = nodeClones
                        break

                    case 'Install Product':
                        nodesToClone = []
                        nodeClones = []
                        for (let rootNode of action.rootNodes) {
                            if (
                                rootNode.type === 'LAN Network' ||
                                rootNode.type === 'Charting Space' ||
                                rootNode.type === 'Portfolio Mine' ||
                                rootNode.type === 'Trading Mine'
                                ) {
                                let node = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(rootNode.id)
                                nodesToClone.push(node)
                            }
                        }
                        for (let node of nodesToClone) {
                            let nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(node, false)
                            await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(node, action.rootNodes)
                            nodeClones.push(nodeClone)
                        }
                        for (let nodeClone of undoStack[i].nodeClones) {
                            await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.unDeleteUIObject(nodeClone, undefined, undefined, action.rootNodes)
                        }
                        undoStack[i].nodeClones = nodeClones
                        break

                    case 'Parent Attach':
                        UI.projects.visualScripting.nodeActionFunctions.chainAttachDetach.chainDetachNode(node, action.rootNodes)
                        break

                    case 'Parent Detach':
                        parentNode = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(undoStack[i].parentNodeId)
                        UI.projects.visualScripting.nodeActionFunctions.chainAttachDetach.chainAttachNode(node, parentNode, action.rootNodes)
                        break

                    case 'Pin / Unpin':
                        node.payload.floatingObject.pinToggle()
                        break

                    case 'Push Code to Javascript Code':
                        let previousJsCode = node.javascriptCode.code
                        node.javascriptCode.code = undoStack[i].previousJsCode
                        undoStack[i].previousJsCode = previousJsCode
                        break

                    case 'Reference Attach':
                        UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceDetachNode(node)
                        break

                    case 'Reference Detach':
                        referenceParent = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(undoStack[i].referenceParentId)
                        UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(node, referenceParent)
                        break

                    case 'Snap saved node to position':
                        node = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(undoStack[i].nodeId)
                    case 'Move Node':
                        previousPosition = {
                            x: node.payload.position.x,
                            y: node.payload.position.y
                        }
                        displaceVector = {
                            x: undoStack[i].previousPosition.x - node.payload.position.x,
                            y: undoStack[i].previousPosition.y - node.payload.position.y
                        }
                        node.payload.position = {
                            x: undoStack[i].previousPosition.x,
                            y: undoStack[i].previousPosition.y
                        }
                        node.payload.floatingObject.container.displace(displaceVector)
                        undoStack[i].previousPosition = previousPosition
                        break

                    case 'Switch To Backtesting':
                    case 'Switch To Backtesting Portfolio':
                    case 'Switch To Forward Testing':
                    case 'Switch To Live Portfolio':
                    case 'Switch To Live Trading':
                    case 'Switch To Paper Portfolio':
                    case 'Switch To Paper Trading':
                        let previousNodeType = node.type
                        node.type = undoStack[i].previousNodeType
                        UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, node.payload)
                        undoStack[i].previousNodeType = previousNodeType
                        break
                }
            }
        } catch (err) {
            console.error(err)
            return
        }

        redoStack.unshift(...undoStack.splice(stateIndex))
    }

    async function redo(stateIndex) {
        undoStack = UI.projects.workspaces.spaces.designSpace.workspace.undoStack
        redoStack = UI.projects.workspaces.spaces.designSpace.workspace.redoStack
        if (stateIndex === undefined && redoStack.length > 0) {
            stateIndex = 0
        }
        if (stateIndex === undefined) { return }

        try {
            for (let i = 0; i <= stateIndex; i++) {
                let action = redoStack[i].action
                let node
                let nodeClone
                let nodesToClone
                let nodeClones
                let parentNode
                let chainParent
                let referenceParent
                if (redoStack[i].newUiObject !== undefined) {
                    node = (redoStack[i].newUiObject.cleaned !== true) ?
                        redoStack[i].newUiObject :
                        await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(redoStack[i].newUiObject.id)
                } else if (redoStack[i].nodeClone !== undefined) {
                    node = (redoStack[i].nodeClone.cleaned !== true) ?
                        redoStack[i].nodeClone :
                        await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(redoStack[i].nodeClone.id)
                } else {
                    node = (action.node.cleaned !== true) ?
                        action.node :
                        await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(action.node.id)
                }

                switch (action.name) {
                    /* Community Plugins Actions */
                    case 'Add Missing Plugin Projects':
                    case 'Add Missing Plugin Types':
                    case 'Add Missing Plugin Data Mines':
                    case 'Add Missing Plugin Trading Mines':
                    case 'Add Missing Plugin Trading Systems':
                    case 'Add Missing Plugin Trading Engines':
                    case 'Add Missing Plugin Portfolio Mines':
                    case 'Add Missing Plugin Portfolio Systems':
                    case 'Add Missing Plugin Portfolio Engines':
                    case 'Add Missing Plugin Learning Mines':
                    case 'Add Missing Plugin Learning Systems':
                    case 'Add Missing Plugin Learning Engines':
                    case 'Add Missing Plugin Tutorials':
                    case 'Add Missing Plugin API Maps':
                    case 'Add Missing Plugin P2P Networks':
                    case 'Add Specified Plugin Data Mine':
                    /* Data Mining actions */
                    case 'Add All Data Dependencies':
                    case 'Add All Data Mine Dependencies':
                    case 'Add All Output Datasets':
                    /* Foundations actions */
                    case 'Add Missing Project Data Tasks':
                    case 'Add Missing Exchange Data Tasks':
                    case 'Add Missing Market Data Tasks':
                    case 'Add Missing Data Mine Tasks':
                    case 'Add Missing Project Trading Tasks':
                    case 'Add Missing Exchange Trading Tasks':
                    case 'Add Missing Market Trading Tasks':
                    case 'Add Missing Trading Mine Tasks':
                    case 'Add Missing Project Portfolio Tasks':
                    case 'Add Missing Exchange Portfolio Tasks':
                    case 'Add Missing Market Portfolio Tasks':
                    case 'Add Missing Portfolio Mine Tasks':
                    case 'Add Missing Project Learning Tasks':
                    case 'Add Missing Exchange Learning Tasks':
                    case 'Add Missing Market Learning Tasks':
                    case 'Add Missing Learning Mine Tasks':
                    case 'Add All Tasks':
                    case 'Add Missing Crypto Exchanges':
                    case 'Add Missing Assets':
                    case 'Add Missing Markets':
                    case 'Add All Data Products':
                    case 'Add All Data Mine Products':
                    case 'Add All Learning Mine Products':
                    case 'Add All Trading Mine Products':
                    case 'Add All Portfolio Mine Products':
                    case 'Add Missing Market Data Products':
                    case 'Add Missing Market Trading Products':
                    case 'Add Missing Market Portfolio Products':
                    case 'Add Missing Market Learning Products':
                    case 'Add Missing Exchange Learning Products':
                    case 'Add Missing Exchange Trading Products':
                    case 'Add Missing Exchange Portfolio Products':
                    case 'Add Missing Exchange Data Products':
                    case 'Add Missing Project Learning Products':
                    case 'Add Missing Project Trading Products':
                    case 'Add Missing Project Portfolio Products':
                    case 'Add Missing Project Data Products':
                    case 'Add Missing Learning Session References':
                    case 'Add Missing Trading Session References':
                    case 'Add Missing Portfolio Session References':
                    case 'Add All Layer Panels':
                    case 'Add All Layer Polygons':
                    case 'Add All Mine Layers':
                    case 'Add Missing Time Machines':
                    case 'Add Missing Dashboards':
                    case 'Add Missing Project Dashboards':
                    /* Governance actions */
                    case 'Install Missing Votes':
                    case 'Install Missing Claims':
                    /* Visual Scripting actions */
                    case 'Add Missing Children':
                    /* Workspaces actions */
                    case 'Add Missing Workspace Projects':
                    case 'Add Specified Project':
                        for (let nodeClone of redoStack[i].nodeClones) {
                            node = (nodeClone.cleaned !== true) ?
                                nodeClone :
                                await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(nodeClone.id)
                            parentNode = (node.savedPayload.parentNode !== undefined) ?
                                await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(node.savedPayload.parentNode.id) :
                                undefined
                            chainParent = (node.savedPayload.chainParent !== undefined) ?
                                await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(node.savedPayload.chainParent.id) :
                                undefined
                            await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.unDeleteUIObject(
                                node,
                                parentNode,
                                chainParent,
                                action.rootNodes
                            )
                        }
                        break

                    case 'Add UI Object':
                    case 'Create UI Object':
                        if (node.savedPayload === undefined) {
                            node = redoStack[i].nodeClone
                        }
                        parentNode = (node.savedPayload.parentNode !== undefined) ?
                            await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(node.savedPayload.parentNode.id) :
                            undefined
                        chainParent = (node.savedPayload.chainParent !== undefined) ?
                            await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(node.savedPayload.chainParent.id) :
                            undefined
                        await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.unDeleteUIObject(
                            node,
                            parentNode,
                            chainParent,
                            action.rootNodes
                        )
                        break

                    case 'Change Arrangement Style':
                        node.payload.floatingObject.arrangementStyleToggle()
                        break

                    case 'Change Distance to Parent':
                        node.payload.floatingObject.distanceToParentToggle()
                        break

                    case 'Change Tension Level':
                        node.payload.floatingObject.angleToParentToggle()
                        break

                    case 'Configure':
                        let previousConfig = node.config
                        node.config = redoStack[i].previousConfig
                        redoStack[i].previousConfig = previousConfig
                        break

                    case 'Create Reference':
                        referenceParent = (redoStack[i].referenceParentId !== undefined) ?
                            await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(redoStack[i].referenceParentId) :
                            await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(node.payload.referenceParent.id)
                        UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(node, referenceParent, action.rootNodes)
                        break

                    case 'Delete UI Object':
                        nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(node, false)
                        UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(node, action.rootNodes)
                        redoStack[i].nodeClone = nodeClone
                        break

                    case 'Edit':
                    case 'Fetch Code to Javascript Code':
                        let previousCode = node.code
                        node.code = redoStack[i].previousCode
                        redoStack[i].previousCode = previousCode
                        break

                    case 'Freeze / Unfreeze':
                        node.payload.floatingObject.freezeToggle()
                        break

                    case 'Install Market':
                    case 'Uninstall Market':
                        nodesToClone = []
                        nodeClones = []
                        for (let rootNode of action.rootNodes) {
                            if (rootNode.type === 'LAN Network' || rootNode.type === 'Charting Space') {
                                let node = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(rootNode.id)
                                nodesToClone.push(node)
                            }
                        }
                        for (let node of nodesToClone) {
                            let nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(node, false)
                            await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(node, action.rootNodes)
                            nodeClones.push(nodeClone)
                        }
                        for (let nodeClone of redoStack[i].nodeClones) {
                            await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.unDeleteUIObject(nodeClone, undefined, undefined, action.rootNodes)
                        }
                        redoStack[i].nodeClones = nodeClones
                        break
                        
                    case 'Install Product':
                        nodesToClone = []
                        nodeClones = []
                        for (let rootNode of action.rootNodes) {
                            if (
                                rootNode.type === 'LAN Network' ||
                                rootNode.type === 'Charting Space' ||
                                rootNode.type === 'Portfolio Mine' ||
                                rootNode.type === 'Trading Mine'
                                ) {
                                let node = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(rootNode.id)
                                nodesToClone.push(node)
                            }
                        }
                        for (let node of nodesToClone) {
                            let nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(node, false)
                            await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(node, action.rootNodes)
                            nodeClones.push(nodeClone)
                        }
                        for (let nodeClone of redoStack[i].nodeClones) {
                            await UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.unDeleteUIObject(nodeClone, undefined, undefined, action.rootNodes)
                        }
                        redoStack[i].nodeClones = nodeClones
                        break

                    case 'Parent Attach':
                        parentNode = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(redoStack[i].relatedNodeId)
                        UI.projects.visualScripting.nodeActionFunctions.chainAttachDetach.chainAttachNode(node, parentNode, action.rootNodes)
                        break

                    case 'Parent Detach':
                        UI.projects.visualScripting.nodeActionFunctions.chainAttachDetach.chainDetachNode(node, action.rootNodes)
                        break

                    case 'Pin / Unpin':
                        node.payload.floatingObject.pinToggle()
                        break

                    case 'Push Code to Javascript Code':
                        let previousJsCode = node.javascriptCode.code
                        node.javascriptCode.code = redoStack[i].previousJsCode
                        redoStack[i].previousJsCode = previousJsCode
                        break

                    case 'Reference Attach':
                        referenceParent = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(redoStack[i].relatedNodeId)
                        UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(node, referenceParent)
                        break

                    case 'Reference Detach':
                        UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceDetachNode(node)
                        break

                    case 'Snap saved node to position':
                        node = await UI.projects.workspaces.spaces.designSpace.workspace.getNodeById(redoStack[i].nodeId)
                    case 'Move Node':
                        let previousPosition = {
                            x: node.payload.position.x,
                            y: node.payload.position.y
                        }
                        let displaceVector = {
                            x: redoStack[i].previousPosition.x - node.payload.position.x,
                            y: redoStack[i].previousPosition.y - node.payload.position.y
                        }
                        node.payload.position = {
                            x: redoStack[i].previousPosition.x,
                            y: redoStack[i].previousPosition.y
                        }
                        node.payload.floatingObject.container.displace(displaceVector)
                        redoStack[i].previousPosition = previousPosition
                        break

                    case 'Switch To Backtesting':
                    case 'Switch To Backtesting Portfolio':
                    case 'Switch To Forward Testing':
                    case 'Switch To Live Portfolio':
                    case 'Switch To Live Trading':
                    case 'Switch To Paper Portfolio':
                    case 'Switch To Paper Trading':
                        let previousNodeType = node.type
                        node.type = redoStack[i].previousNodeType
                        UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, node.payload)
                        redoStack[i].previousNodeType = previousNodeType
                        break
                }
            }
        } catch (err) {
            console.error(err)
            return
        }

        undoStack.push(...redoStack.splice(0, stateIndex + 1))
    }

    function undoRedoSubmenu() {
        undoStack = UI.projects.workspaces.spaces.designSpace.workspace.undoStack
        redoStack = UI.projects.workspaces.spaces.designSpace.workspace.redoStack
        let subMenu = []
        /* 23 and 41 are the height of different menu items; -1 to be safe */
        let maxItems = Math.floor((browserCanvas.height - TOP_SPACE_HEIGHT - COCKPIT_SPACE_HEIGHT - 4 * 23) / 41) - 1
        let maxRedoItems = (redoStack.length + undoStack.length < maxItems) ?
            redoStack.length :
            (redoStack.length < maxItems / 2) ?
                redoStack.length :
                (undoStack.length < maxItems / 2) ?
                    maxItems - undoStack.length :
                    Math.floor(maxItems / 2)
        let maxUndoItems = (redoStack.length + undoStack.length < maxItems) ?
            undoStack.length :
            maxItems - maxRedoItems
        let label
        let action

        if (redoStack.length > 0) {
            subMenu.push({label: 'Redo'})
            if (maxRedoItems < redoStack.length) {
                subMenu.push({label: '...'})
            }

            for (let i = maxRedoItems - 1; i > 0; i--) {
                label = '... ' + redoStack[i].action.name
                    + ' @ ' + redoStack[i].action.node.type
                    + ' ' +redoStack[i].action.node.name
                action = {name: 'redo', params: [i]}
                subMenu.push({label: label, action: action})
            }

            label = redoStack[0].action.name
                + ' @ ' + redoStack[0].action.node.type
                + ' ' +redoStack[0].action.node.name
            action = {name: 'redo', params: [0]}
            subMenu.push({label: label, action: action})
        }
        
        if (undoStack.length > 0) {
            subMenu.push({label: 'Undo'})

            label = undoStack[undoStack.length - 1].action.name
                + ' @ ' + undoStack[undoStack.length - 1].action.node.type
                + ' ' + undoStack[undoStack.length - 1].action.node.name
            action = {name: 'undo', params: [undoStack.length - 1]}
            subMenu.push({label: label, action: action})

            for (let i = undoStack.length - 2; i >= undoStack.length - maxUndoItems; i--) {
                label = '... ' + undoStack[i].action.name 
                    + ' @ ' + undoStack[i].action.node.type
                    + ' ' +undoStack[i].action.node.name
                action = {name: 'undo', params: [i]}
                subMenu.push({label: label, action: action})
            }

            if (maxUndoItems < undoStack.length) {
                subMenu.push({label: '...'})
            }
        }

        return subMenu
    }
}