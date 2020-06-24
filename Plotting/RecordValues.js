function newRecordValues () {
  const MODULE_NAME = 'Record Values'
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    onRecordChange: onRecordChange,
    initialize: initialize,
    finalize: finalize
  }

  let tradingSystem
  let tradingEngine
  let productDefinition
  let productTargetNode
  let propertyTargetNodeMap = new Map()
  return thisObject

  function finalize () {
    tradingSystem = undefined
    tradingEngine = undefined
    productDefinition = undefined
    productTargetNode = undefined
    propertyTargetNodeMap = undefined
  }

  function initialize (pTradingSystem, pTradingEngine, pProductDefinition) {
    tradingSystem = canvas.designSpace.workspace.getHierarchyHeadsById(pTradingSystem.id)
    tradingEngine = canvas.designSpace.workspace.getHierarchyHeadsById(pTradingEngine.id)
    productDefinition = pProductDefinition
    productTargetNode = eval(productDefinition.config.nodePath)

    for (let i = 0; i < productDefinition.record.properties.length; i++) {
      let property = productDefinition.record.properties[i]
      if (property.config.nodePath !== undefined) {
        let propertyRoot = eval(property.config.nodePath)
        propertyTargetNodeMap.set(property.id, propertyRoot)
      } else {
        propertyTargetNodeMap.set(property.id, productTargetNode)
      }
    }
  }

  function onRecordChange (currentRecord) {
    if (currentRecord === undefined) { return }
    for (let i = 0; i < productDefinition.record.properties.length; i++) {
      let property = productDefinition.record.properties[i]
      let value = currentRecord[property.config.codeName]
      let targetNode = propertyTargetNodeMap.get(property.id)
      applyValue(targetNode[property.config.codeName], value)
    }
  }

  function applyValue (node, value) {
    if (canvas.chartingSpace.visible !== true) { return }
    if (node === undefined) { return }
    if (node === undefined) { return }
    if (node.payload === undefined) { return }
    if (node.payload.uiObject === undefined) { return }
    if (value === true) { value = 'true' }
    if (value === false) { value = 'false' }
    node.payload.uiObject.setValue(value, 30)
  }
}
