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
  let propertyTargetNodeMap = new Map()
  return thisObject

  function finalize () {
    tradingSystem = undefined
    tradingEngine = undefined
    productDefinition = undefined
    propertyTargetNodeMap = undefined
  }

  function initialize (pTradingSystem, pTradingEngine, pProductDefinition) {
    tradingSystem = canvas.designSpace.workspace.getHierarchyHeadsById(pTradingSystem.id)
    tradingEngine = canvas.designSpace.workspace.getHierarchyHeadsById(pTradingEngine.id)
    productDefinition = pProductDefinition

    /*
    The product root can be a node or a node property of type array.
    */
    let productRoot = eval(productDefinition.config.nodePath)

    if (productDefinition.config.nodePathType === 'array') {
        /*
        This means that the configured nodePath is not pointing to a node, but to a node property that is an array.
        For that reason we will assume that each element of the array is a record to be outputed
        */
      for (let index = 0; index < productRoot.length; index++) {
            /*
            The Product Root Node is the root of the node hiriarchy from where we are going to extract the record values.
            */
        let productRootNode = productRoot[index]
        scanProperties(productRootNode, index)
      }
    } else {
        /*
        This means that the configured nodePath points to a single node, which is the one whose children constitutes
        the record to be saved at the output file.
        */
        /*
        The Product Root Node is the root of the node hiriarchy from where we are going to extract the record values.
        */
      let productRootNode = productRoot
      scanProperties(productRootNode)
    }

    function scanProperties (productRootNode, index) {
      for (let i = 0; i < productDefinition.record.properties.length; i++) {
        let property = productDefinition.record.properties[i]
        if (property.config.nodePath !== undefined) {
          let propertyRoot = eval(property.config.nodePath)
          propertyTargetNodeMap.set(property.id, propertyRoot)
        } else {
          propertyTargetNodeMap.set(property.id, productRootNode)
        }
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
    node.payload.uiObject.setValue(value, 1)
  }
}
