function newReferenceAttachDetach () {
  thisObject = {
    referenceDetachNode: referenceDetachNode,
    referenceAttachNode: referenceAttachNode
  }

  return thisObject

  function referenceDetachNode (node) {
    switch (node.type) {
      case 'Backtesting Session': {
        completeDetachment(node)
        return
      }
      case 'Live Trading Session': {
        completeDetachment(node)
        return
      }
      case 'Fordward Testing Session': {
        completeDetachment(node)
        return
      }
      case 'Paper Trading Session': {
        completeDetachment(node)
        return
      }
      case 'Output Dataset': {
        completeDetachment(node)
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
      case 'Output Dataset': {
        completeAttachment(node, attachToNode)
      }
        break
    }
  }

  function completeAttachment (node, attachToNode) {
    node.payload.referenceParent = attachToNode
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
