function newReferenceAttachDetach () {
  thisObject = {
    referenceDetachNode: referenceDetachNode,
    referenceAttachNode: referenceAttachNode
  }

  return thisObject

  function referenceDetachNode (node, rootNodes) {
    switch (node.type) {
      case 'Backtesting Session': {
        completeDetachment(node, attachToNode)
        return
      }
      case 'Live Trading Session': {
        completeDetachment(node, attachToNode)
        return
      }
      case 'Fordward Testing Session': {
        completeDetachment(node, attachToNode)
        return
      }
      case 'Paper Trading Session': {
        completeDetachment(node, attachToNode)
        return
      }
    }
  }

  function referenceAttachNode (node, attachToNode, rootNodes) {
    switch (node.type) {
      case 'Backtesting Session': {
        completeAttachment(node, attachToNode)
      }
        break
      case 'Live Trading Session': {
        completeAttachment(node, attachToNode)
      }
        break
      case 'Fordward Testing Session': {
        completeAttachment(node, attachToNode)
      }
        break
      case 'Paper Trading Session': {
        completeAttachment(node, attachToNode)
      }
        break
    }
  }

  function completeAttachment (node, attachToNode) {
    node.payload.referenceParent = attachToNode
    attachToNode.referenceChildren.push(node)
  }

  function completeDetachment (node, attachToNode) {
    for (let i = 0; i < attachToNode.referenceChildren.length; i++) {
      let child = attachToNode.referenceChildren[i]
      if (child.id === node.id) {
        attachToNode.referenceChildren.splice(i, 1)
        return
      }
    }
  }
}
