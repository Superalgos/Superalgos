function newReferenceAttachDetach () {
  thisObject = {
    referenceDetachNode: referenceDetachNode,
    referenceAttachNode: referenceAttachNode
  }

  return thisObject

  function referenceDetachNode (node) {
    completeDetachment(node)
  }

  function referenceAttachNode (node, attachToNode, rootNodes) {
    completeAttachment(node, attachToNode)
  }

  function completeAttachment (node, attachToNode) {
    node.payload.referenceParent = attachToNode
  }

  function completeDetachment (node) {
    node.payload.referenceParent = undefined
    if (node.savedPayload !== undefined) {
      node.savedPayload.referenceParent = undefined
    }
  }
}
