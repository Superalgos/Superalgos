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
    if (attachToNode.referenceChildren === undefined) {
      attachToNode.referenceChildren = []
    }
    attachToNode.referenceChildren.push(node)
  }

  function completeDetachment (node) {
    for (let i = 0; i < node.payload.referenceParent.referenceChildren.length; i++) {
      let child = node.payload.referenceParent.referenceChildren[i]
      if (child.id === node.id) {
        node.payload.referenceParent.referenceChildren.splice(i, 1)
        return
      }
    }
    node.payload.referenceParent = undefined
  }
}
