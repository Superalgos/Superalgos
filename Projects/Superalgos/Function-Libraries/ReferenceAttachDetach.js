function newSuperalgosFunctionLibraryAttachDetach() {
    thisObject = {
        referenceDetachNode: referenceDetachNode,
        referenceAttachNode: referenceAttachNode
    }

    return thisObject

    function referenceDetachNode(node) {
        completeDetachment(node)
    }

    function referenceAttachNode(node, attachToNode) {
        completeAttachment(node, attachToNode)
    }

    function completeAttachment(node, attachToNode) {
        node.payload.referenceParent = attachToNode
    }

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
