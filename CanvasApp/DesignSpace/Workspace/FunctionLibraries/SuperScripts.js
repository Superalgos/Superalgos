function newSuperScriptsFunctions () {
  thisObject = {
    runSuperScript: runSuperScript
  }

  return thisObject

  function runSuperScript (node, functionLibraryNodeCloning, functionLibraryUiObjectsFromNodes) {
    try {
      let clone = functionLibraryNodeCloning.getNodeClone
      let executionResult = true

      function setup (templateClone, target) {
        spawnPosition.x = target.payload.position.x
        spawnPosition.y = target.payload.position.y

        functionLibraryUiObjectsFromNodes.createUiObjectFromNode(templateClone, target, target)
      }

      /* Validations */
      if (executionResult === true && node.payload.parentNode === undefined) {
        node.payload.uiObject.setErrorMessage('Super Action node needs a Parent Node.')
        executionResult = false
      }
      if (executionResult === true && node.payload.referenceParent === undefined) {
        node.payload.uiObject.setErrorMessage('Super Action node needs to reference a Master Script Node.')
        executionResult = false
      }
      if (executionResult === true && node.payload.referenceParent.javascriptCode === undefined) {
        node.payload.uiObject.setErrorMessage('Master Script Node needs to have a child Javascript Code Node.')
        executionResult = false
      }

      let superAction = node
      let masterScript = node.payload.referenceParent

      eval(masterScript.javascriptCode.code)

      let masterScriptInstance = newNewMasterScriptInstance()

      if (executionResult === true) {
        executionResult = masterScriptInstance.runValidations(superAction, masterScript)
      }
      if (executionResult === true) {
        executionResult = masterScriptInstance.runScript(superAction, masterScript)
      }
      if (executionResult === true) {
        superAction.payload.uiObject.setValue('Execution Completed Successfully')
      } else {
        superAction.payload.uiObject.setValue('Execution Failed')
      }
    } catch (err) {
      superAction.payload.uiObject.setErrorMessage(err.message)
      superAction.payload.uiObject.setValue('Execution Failed')
    }
  }
}
