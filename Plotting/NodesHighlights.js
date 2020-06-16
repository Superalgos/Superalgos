function newNodesHighlights () {
  const MODULE_NAME = 'Nodes Highlights'
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
    evalNode(rootNode, currentRecord.array, 0, applyHighlight)
  }

  function applyHighlight (node, value) {
    if (value !== 1) { return }
    if (node.payload === undefined) { return }
    if (node.payload.uiObject === undefined) { return }
    node.payload.uiObject.highlight()
  }
}
