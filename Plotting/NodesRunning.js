function newNodesRunning () {
  const MODULE_NAME = 'Nodes Running'
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
    evalNode(rootNode, currentRecord.array, 0, applyExecution)
  }

  function applyExecution (node, value) {
    if (node.payload === undefined) { return }
    if (node.payload.uiObject === undefined) { return }
    if (value === 1) {
      node.payload.uiObject.isRunningAtBackend = true
    } else {
      node.payload.uiObject.isRunningAtBackend = false
    }
  }
}
