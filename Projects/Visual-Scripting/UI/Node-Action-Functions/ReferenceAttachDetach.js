// These function are used across the system to establish and remove references between nodes
function newVisualScriptingFunctionLibraryReferenceAttachDetach() {
    let thisObject = {
        referenceDetachNode: referenceDetachNode,
        referenceAttachNode: referenceAttachNode,
        createReference: createReference
    }

    return thisObject

    function referenceDetachNode(node) {
        cleanAttachNodePath(node)
        completeDetachment(node)

    }

    function referenceAttachNode(node, attachToNode) {
        storeAttachNodePath(node, attachToNode)
        completeAttachment(node, attachToNode)
    }

    function createReference(node, rootNodes) {

        let action = { node: node }
        let allNodesFound = []

        let schemaDocument = getSchemaDocument(node)
        let workspaceRootNodes = UI.projects.workspaces.spaces.designSpace.workspace.workspaceNode.rootNodes

        let compatibleTypes = schemaDocument.referencingRules.compatibleTypes.split('->').filter(i => i)

        for (let i = 0; i < compatibleTypes.length; i++) {
            for (let j = 0; j < workspaceRootNodes.length; j++) {
                let rootNode = workspaceRootNodes[j]
                if (rootNode !== null) {
                    let nodeArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(rootNode, compatibleTypes[i])
                    allNodesFound = allNodesFound.concat(nodeArray)
                }
            }
        }

        let eventSubscriptionId = node.payload.uiObject.container.eventHandler.listenToEvent('listSelectorClicked', onListSelect)
        node.payload.uiObject.listSelector.activate(action, allNodesFound, eventSubscriptionId)

        function onListSelect(event) {
            referenceAttachNode(node, event.selectedNode)
            node.payload.uiObject.container.eventHandler.stopListening('listSelectorClicked')
        }
    }

    // Store the path to the reference parent to make restoring it possible if the reference parent is updated and given a new id
    function storeAttachNodePath(node, attachToNode) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        let attachNodePath = UI.projects.visualScripting.utilities.hierarchy.getNodeNameTypePath(attachToNode)
        // Remove unused node id, and project tag from stored path
        for (let i = 0; i < attachNodePath.length; i++) {
            attachNodePath[i].splice(2, 2)
        }

        // Save attach path to active payload
        node.payload.referenceParentCombinedNodePath = attachNodePath
    }

    // Clear the path to reference parent when the reference is cleared
    function cleanAttachNodePath(node) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }

        node.payload.referenceParentCombinedNodePath = undefined
        if (node.savedPayload !== undefined) {
            node.savedPayload.referenceParentCombinedNodePath = undefined
        }
    }

    // Establish the reference between node and it's reference parent
    function completeAttachment(node, attachToNode) {
        node.payload.referenceParent = attachToNode
    }

    // Detach the reference between node and it's reference parent
    function completeDetachment(node) {
        if (node.payload !== undefined) {
            if (node.payload.referenceParent !== undefined) {
                if (node.payload.referenceParent.payload !== undefined) {
                    if (node.payload.referenceParent.payload.uiObject !== undefined) {
                        node.payload.referenceParent.payload.uiObject.isShowing = false
                    }
                }
            }
            node.payload.referenceParent = undefined
            if (node.savedPayload !== undefined) {
                node.savedPayload.referenceParent = undefined
            }
        }
    }
}
