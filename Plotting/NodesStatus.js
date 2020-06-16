function newNodesStatus () {
  const MODULE_NAME = 'Nodes Status'
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    onRecordChange: onRecordChange,
    initialize: initialize,
    finalize: finalize
  }

  let rootNode
  return thisObject

  function finalize () {
    rootNode = undefined
  }

  function initialize (pRootNode) {
    rootNode = pRootNode
  }

  function onRecordChange (currentRecord) {
    evalNode(rootNode, currentRecord.array, 0, applyStatus)
  }

  function applyStatus (node, status) {
    if (node.payload === undefined) { return }
    if (node.payload.uiObject === undefined) { return }
    node.payload.uiObject.setStatus(node, status)
  }
}
