function newReferenceAttachDetach () {
  thisObject = {
    referenceDetachNode: referenceDetachNode,
    referenceAttachNode: referenceAttachNode
  }

  return thisObject

  function referenceDetachNode (node, rootNodes) {
    switch (node.type) {
      case 'Backtesting Session': {
        node.payload.parentNode.session = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Live Trading Session': {
        node.payload.parentNode.session = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Fordward Testing Session': {
        node.payload.parentNode.session = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Paper Trading Session': {
        node.payload.parentNode.session = undefined
        completeDetachment(node, rootNodes)
        return
      }
    }
  }

  function referenceAttachNode (node, attachToNode, rootNodes) {
    switch (node.type) {
      case 'Backtesting Session': {
        node.payload.parentNode = attachToNode
        node.payload.referenceParent = attachToNode
        node.payload.parentNode.session = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Live Trading Session': {
        node.payload.parentNode = attachToNode
        node.payload.referenceParent = attachToNode
        node.payload.parentNode.session = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Fordward Testing Session': {
        node.payload.parentNode = attachToNode
        node.payload.referenceParent = attachToNode
        node.payload.parentNode.session = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Paper Trading Session': {
        node.payload.parentNode = attachToNode
        node.payload.referenceParent = attachToNode
        node.payload.parentNode.session = node
        completeAttachment(node, rootNodes)
      }
        break
    }
  }

  function completeDetachment (node, rootNodes) {
    node.payload.parentNode = undefined
    node.payload.referenceParent = undefined
    rootNodes.push(node)
  }

  function completeAttachment (node, rootNodes) {
    for (let i = 0; i < rootNodes.length; i++) {
      let rootNode = rootNodes[i]
      if (rootNode.id === node.id) {
        rootNodes.splice(i, 1)
        return
      }
    }
  }
}
