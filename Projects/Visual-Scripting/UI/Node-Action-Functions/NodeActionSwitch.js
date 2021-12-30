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
                UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.createUiObjectFromNode(action.node, undefined, undefined, action.extraParameter)
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
                break
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
                    UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(
                        action.node,
                        action.relatedNodeType,
                        action.rootNodes,
                        action.relatedNodeProject
                    )
                }
                break
            case 'Add Missing Children':
                {
                    UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addMissingChildren(action.node, action.rootNodes)
                }
                break
            case 'Delete UI Object':
                {
                    UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(action.node, action.rootNodes)
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
                UI.projects.visualScripting.nodeActionFunctions.chainAttachDetach.chainAttachNode(action.node, action.relatedNode, action.rootNodes)
            }
                break
            case 'Reference Attach': {
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(action.node, action.relatedNode, action.rootNodes)
            }
                break
            case 'Parent Detach':
                {
                    UI.projects.visualScripting.nodeActionFunctions.chainAttachDetach.chainDetachNode(action.node, action.rootNodes)
                }
                break
            case 'Reference Detach':
                {
                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceDetachNode(action.node)
                }
                break
            case 'Create Reference':
            {
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.createReference(action.node, action.rootNodes)
            }
                break

            default: {
                console.log("[WARN] Action sent to Visual-Scripting Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
