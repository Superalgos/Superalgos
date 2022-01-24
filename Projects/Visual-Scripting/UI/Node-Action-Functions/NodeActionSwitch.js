function newVisualScriptingNodeActionSwitch() {

    let thisObject = {
        executeAction: executeAction,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        /* Nothing to initialize since a Function Library does not hold any state. */
    }

    async function executeAction(action) {
        switch (action.name) {
            case 'Get Node On Focus': {
                return UI.projects.visualScripting.nodeActionFunctions.onFocus.getNodeThatIsOnFocus(action.node)
            }

            case 'Get Node By Shortcut Key': {
                return UI.projects.visualScripting.nodeActionFunctions.shortcutKeys.getNodeByShortcutKey(action.node, action.extraParameter)
            }

            case 'Get Node Data Structure': {
                return UI.projects.visualScripting.nodeActionFunctions.protocolNode.getProtocolNode(action.node, action.extraParameter, false, true, true, true)
            }

            case 'Create UI Object': {
                let historyObject = {
                    action: action
                }

                UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.createUiObjectFromNode(action.node, undefined, undefined, action.extraParameter)

                if (action.isInternal === false) {
                    UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                    UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                    UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                }
            }
                break
            case 'Connect Children to Reference Parents': {
                UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.tryToConnectChildrenWithReferenceParents()
            }
                break
            case 'Get Node By Id': {
                return UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.getNodeById(action.relatedNodeId)
            }

            case 'Syncronize Tasks': {
                UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.synchronizeTasksFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Syncronize Trading Sessions': {
                UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.synchronizeTradingSessionsFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Syncronize Portfolio Sessions': {
                UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.synchronizePortfolioSessionsFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Syncronize Learning Sessions': {
                UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.synchronizeLearningSessionsFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Play Tutorials': {
                UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.playTutorials()
            }
                break
            case 'Recreate Workspace': {
                UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.recreateWorkspace(action.node, action.callBackFunction)
            }
                break
            case 'Delete Workspace': {
                return UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteWorkspace(action.node, action.rootNodes, action.callBackFunction)
            }
            case 'Copy Node Path':
                {
                    let nodePath = UI.projects.visualScripting.nodeActionFunctions.nodePath.getNodePath(action.node)

                    UI.projects.foundations.utilities.clipboard.copyTextToClipboard(nodePath)

                    UI.projects.foundations.spaces.cockpitSpace.setStatus(
                        nodePath + ' copied to the Clipboard.'
                        , 50, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Copy Node Value':
                {
                    let value = action.node.payload.uiObject.getValue()

                    UI.projects.foundations.utilities.clipboard.copyTextToClipboard(value)

                    UI.projects.foundations.spaces.cockpitSpace.setStatus(
                        value + ' copied to the Clipboard.'
                        , 50, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Copy Node Type':
                {
                    let value = action.node.type

                    UI.projects.foundations.utilities.clipboard.copyTextToClipboard(value)

                    UI.projects.foundations.spaces.cockpitSpace.setStatus(
                        value + ' copied to the Clipboard.'
                        , 50, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Add UI Object':
                {
                    let newUiObject = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(
                        action.node,
                        action.relatedNodeType,
                        action.rootNodes,
                        action.relatedNodeProject
                    )

                    if (action.isInternal === false) {
                        let historyObject = {
                            action: action,
                            newUiObject: newUiObject
                        }
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                }
                break
            case 'Add Missing Children':
                {
                    let newUiObjects = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addMissingChildren(action.node, action.rootNodes)

                    if (action.isInternal === false && newUiObjects !== undefined && newUiObjects.length > 0) {
                        let historyObject = {
                            action: action,
                            newUiObjects: newUiObjects,
                            nodeClones: []
                        }
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                }
                break
            case 'Delete UI Object':
                {
                    let nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(action.node, false)
                    let historyObject = {
                        action: action,
                        nodeClone: nodeClone
                    }

                    UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(action.node, action.rootNodes)

                    if (action.isInternal === false) {
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                }
                break
            case 'Share':
                {
                    let text = JSON.stringify(
                        UI.projects.visualScripting.nodeActionFunctions.protocolNode.getProtocolNode(action.node, true, false, true, true, true),
                        undefined,
                        4
                    )

                    let nodeName = action.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = '.' + nodeName
                    }
                    let fileName = 'Share - ' + action.node.type + ' - ' + nodeName + '.json'
                    UI.projects.foundations.utilities.download.downloadText(fileName, text)
                }

                break
            case 'Backup':
                {
                    let text = JSON.stringify(
                        UI.projects.visualScripting.nodeActionFunctions.protocolNode.getProtocolNode(action.node, false, false, true, true, true),
                        undefined,
                        4)

                    let nodeName = action.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = ' ' + nodeName
                    }
                    let fileName = 'Backup - ' + action.node.type + ' - ' + nodeName + '.json'
                    UI.projects.foundations.utilities.download.downloadText(fileName, text)
                }

                break
            case 'Clone':
                {
                    let text = JSON.stringify(
                        UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(action.node),
                        undefined,
                        4
                    )

                    let nodeName = action.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = ' ' + nodeName
                    }
                    let fileName = 'Clone - ' + action.node.type + ' - ' + nodeName + '.json'
                    UI.projects.foundations.utilities.download.downloadText(fileName, text)
                }

                break
            case 'Parent Attach': {
                let historyObject = {
                    action: action,
                    relatedNodeId: action.relatedNode.id
                }

                UI.projects.visualScripting.nodeActionFunctions.chainAttachDetach.chainAttachNode(action.node, action.relatedNode, action.rootNodes)

                if (action.isInternal === false) {
                    UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                    UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                    UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                }
            }
                break
            case 'Reference Attach': {
                let historyObject = {
                    action: action,
                    relatedNodeId: action.relatedNode.id
                }

                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(action.node, action.relatedNode, action.rootNodes)

                if (action.isInternal === false) {
                    UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                    UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                    UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                }
            }
                break
            case 'Parent Detach':
                {
                    let historyObject = {
                        action: action,
                        parentNodeId: action.node.payload.parentNode.id
                    }

                    UI.projects.visualScripting.nodeActionFunctions.chainAttachDetach.chainDetachNode(action.node, action.rootNodes)

                    if (action.isInternal === false) {
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                }
                break
            case 'Reference Detach':
                {
                    let historyObject = {
                        action: action,
                        referenceParentId: action.node.payload.referenceParent.id
                    }

                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceDetachNode(action.node)

                    if (action.isInternal === false) {
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                }
                break
            case 'Create Reference':
            {
                let historyObject = {
                    action: action
                }

                UI.projects.visualScripting.nodeActionFunctions.attachDetach.createReference(action.node, action.rootNodes)

                if (action.isInternal === false) {
                    UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                    UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                    UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                }
            }
                break
            case 'Pin / Unpin':
                {
                    let historyObject = {
                        action: action
                    }

                    action.node.payload.floatingObject.pinToggle()

                    if (action.isInternal === false) {
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                }
                break
            case 'Change Tension Level':
                {
                    let historyObject = {
                        action: action
                    }

                    action.node.payload.floatingObject.angleToParentToggle()

                    if (action.isInternal === false) {
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                }
                break
            case 'Change Distance to Parent':
                {
                    let historyObject = {
                        action: action
                    }

                    action.node.payload.floatingObject.distanceToParentToggle()

                    if (action.isInternal === false) {
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                }
                break
            case 'Change Arrangement Style':
                {
                    let historyObject = {
                        action: action
                    }

                    action.node.payload.floatingObject.arrangementStyleToggle()

                    if (action.isInternal === false) {
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                }
                break
            case 'Freeze / Unfreeze':
                {
                    let historyObject = {
                        action: action
                    }

                    action.node.payload.floatingObject.freezeToggle()

                    if (action.isInternal === false) {
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu() 
                    }
                }
                break
            case 'Highlight Referencing Nodes':
                {
                    UI.projects.visualScripting.nodeActionFunctions.referenceChildren.toggleHighlightReferenceChildren(action.node)
                }
                break
            default: {
                console.log("[WARN] Action sent to Visual-Scripting Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
