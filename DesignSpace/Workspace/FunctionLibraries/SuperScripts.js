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

    try {
      eval(masterScript.javascriptCode.code)
    } catch (err) {
      superAction.payload.uiObject.setErrorMessage(err.message)
    }

    superAction.payload.uiObject.setValue('Execution Completed Successfully')
  }
}
