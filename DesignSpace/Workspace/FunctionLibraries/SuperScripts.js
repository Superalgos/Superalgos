function newSuperScriptsFunctions () {
  thisObject = {
    runSuperScript: runSuperScript
  }

  return thisObject

  function runSuperScript (node, functionLibraryNodeCloning, functionLibraryUiObjectsFromNodes) {
    let clone = functionLibraryNodeCloning.getNodeClone

    function setup (templateClone, target) {
      spawnPosition.x = target.payload.position.x
      spawnPosition.y = target.payload.position.y

      functionLibraryUiObjectsFromNodes.createUiObjectFromNode(templateClone, target, target)
    }

    /* Validations */
    if (node.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Super Action node needs a Parent Node.')
      return
    }
    if (node.payload.referenceParent === undefined) {
      node.payload.uiObject.setErrorMessage('Super Action node needs to reference a Master Script Node.')
      return
    }
    if (node.payload.referenceParent.javascriptCode === undefined) {
      node.payload.uiObject.setErrorMessage('Master Script Node needs to have a child Javascript Code Node.')
      return
    }
    let superAction = node
    let masterScript = node.payload.referenceParent

    // eval(masterScript.javascriptCode.code)
    /* Validations */
    if (superAction.payload.parentNode.type !== 'Market') {
      superAction.payload.uiObject.setErrorMessage('Super Action Parent Node needs to be of type Market.')
      return
    }
    if (superAction.payload.parentNode.baseAsset === undefined) {
      superAction.payload.uiObject.setErrorMessage('Market Node needs to have a child Market Base Asset.')
      return
    }
    if (superAction.payload.parentNode.quotedAsset === undefined) {
      superAction.payload.uiObject.setErrorMessage('Market Node needs to have a child Market Quoted Asset.')
      return
    }
    if (superAction.payload.parentNode.baseAsset.payload.referenceParent === undefined) {
      superAction.payload.uiObject.setErrorMessage('Market Base Asset Node needs to reference an Asset.')
      return
    }
    if (superAction.payload.parentNode.quotedAsset.payload.referenceParent === undefined) {
      superAction.payload.uiObject.setErrorMessage('Market Quoted Asset Node needs to reference an Asset.')
      return
    }
    if (superAction.payload.parentNode.baseAsset.payload.referenceParent.payload.parentNode === undefined) {
      superAction.payload.uiObject.setErrorMessage('Asset Node needs to be a child of Exchange Assets.')
      return
    }
    if (superAction.payload.parentNode.quotedAsset.payload.referenceParent.payload.parentNode === undefined) {
      superAction.payload.uiObject.setErrorMessage('Asset Node needs to be a child of Exchange Assets.')
      return
    }
    if (superAction.payload.parentNode.baseAsset.payload.referenceParent.payload.parentNode.payload.parentNode === undefined) {
      superAction.payload.uiObject.setErrorMessage('Exchange Assets needs to be a child of an Exchange Node.')
      return
    }
    if (superAction.payload.parentNode.quotedAsset.payload.referenceParent.payload.parentNode.payload.parentNode === undefined) {
      superAction.payload.uiObject.setErrorMessage('Exchange Assets needs to be a child of an Exchange Node.')
      return
    }
    if (superAction.payload.parentNode.baseAsset.payload.referenceParent.payload.parentNode.payload.parentNode.id !== superAction.payload.parentNode.quotedAsset.payload.referenceParent.payload.parentNode.payload.parentNode.id) {
      superAction.payload.uiObject.setErrorMessage('Assets must be from the same Exchange.')
      return
    }
    if (superAction.payload.parentNode.payload.parentNode === undefined) {
      superAction.payload.uiObject.setErrorMessage('Market needs to be a child of Exchange Markets.')
      return
    }
    if (superAction.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
      superAction.payload.uiObject.setErrorMessage('Exchange Markets needs to be a child of an Exchange.')
      return
    }
    if (superAction.payload.parentNode.payload.parentNode.payload.parentNode.id !== superAction.payload.parentNode.baseAsset.payload.referenceParent.payload.parentNode.payload.parentNode.id) {
      superAction.payload.uiObject.setErrorMessage('Assets and Market must be defined at the same Exchange.')
      return
    }

    let market = superAction.payload.parentNode
    let singleMarketDate // we expect this variable to be set by a template script.

    for (let i = 0; i < masterScript.templateScripts.length; i++) {
      let templateScript = masterScript.templateScripts[i]

      if (templateScript.templateStructure.javascriptCode === undefined) {
        superAction.payload.uiObject.setErrorMessage('Template Script must have a child Javascript Code.')
        return
      }

      // eval(templateScript.code)

      /* Validations */
      if (templateScript.templateStructure === undefined) {
        superAction.payload.uiObject.setErrorMessage('Template Script must have a child Template Structure.')
        return
      }
      if (templateScript.templateStructure.singleMarketData === undefined) {
        superAction.payload.uiObject.setErrorMessage('Template Structure must have a child Single Market Data.')
        return
      }
      if (templateScript.templateTarget === undefined) {
        superAction.payload.uiObject.setErrorMessage('Template Script must have a child Template Target.')
        return
      }
      if (templateScript.templateTarget.payload.referenceParent === undefined) {
        superAction.payload.uiObject.setErrorMessage('Template Target must have a Reference Parent.')
        return
      }
      if (templateScript.templateTarget.payload.referenceParent.type !== 'Session Independent Data') {
        superAction.payload.uiObject.setErrorMessage('Template Target must have a Reference Parent of type Session Independent Data.')
        return
      }

      let target = templateScript.templateTarget.payload.referenceParent
      let templateClone = clone(templateScript.templateStructure.singleMarketData)
      target.singleMarketData.push(templateClone)
      setup(templateClone, target)
      templateClone.payload.referenceParent = market

      singleMarketDate = templateClone
    }

    superAction.payload.uiObject.setValue('Execution Completed Successfully')
  }
}
