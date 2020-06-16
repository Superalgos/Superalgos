function newNodesErrors () {
  const MODULE_NAME = 'Nodes Errors'
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
    evalNode(rootNode, currentRecord.array, 0, applyError)
  }

  function applyError (node, errorMessage) {
    if (node.payload === undefined) { return }
    if (node.payload.uiObject === undefined) { return }
    if (errorMessage === '') {
      node.payload.uiObject.resetErrorMessage(errorMessage)
    } else {
      node.payload.uiObject.setErrorMessage(errorMessage)
    }
  }
}
