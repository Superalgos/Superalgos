// These function are used across the system to establish and remove references between nodes
function newFoundationsFunctionLibraryReferenceAttachDetach() {
    let thisObject = {
        referenceDetachNode: referenceDetachNode,
        referenceAttachNode: referenceAttachNode
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

    // Store the path to the reference parent to make restoring it possible if the reference parent is updated and given a new id
    function storeAttachNodePath(node, attachToNode) {
        let attachNodePath = UI.projects.foundations.utilities.hierarchy.getNodeNameTypePath(attachToNode)
        // Remove unused node id, and project tag from stored path
        for (let i = 0; i < attachNodePath.length; i++ ) {
            attachNodePath[i].splice(2,2)
        }
        
        // Save attach path to active payload
        node.payload.referenceParentCombinedNodePath = attachNodePath
    }

    // Clear the path to reference parent when the reference is cleared
    function cleanAttachNodePath(node){
        if (node.payload !== undefined) {
            node.payload.referenceParentCombinedNodePath = undefined
            if (node.savedPayload !== undefined) {
                node.savedPayload.referenceParentCombinedNodePath = undefined
            }
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
