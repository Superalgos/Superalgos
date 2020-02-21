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

      /*
      Master Script
      */
      function newNewMasterScriptInstance () {
        let thisObject = {
          runValidations: runValidations,
          runScript: runScript
        }
        return thisObject

        function runValidations (superAction, masterScript) {
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
          if (superAction.payload.parentNode.payload.parentNode.payload.parentNode.exchangeAccounts === undefined) {
            superAction.payload.uiObject.setErrorMessage('Exchange Markets needs have a child Exchange Accounts.')
            return
          }

          for (let i = 0; i < masterScript.templateScripts.length; i++) {
            let templateScript = masterScript.templateScripts[i]

            if (templateScript.javascriptCode === undefined) {
              superAction.payload.uiObject.setErrorMessage('Template Script must have a child Javascript Code.')
              return
            }
            if (templateScript.templateStructure === undefined) {
              superAction.payload.uiObject.setErrorMessage('Template Script must have a child Template Structure.')
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
            try {
              let templateScriptConstructor

              eval(templateScript.javascriptCode.code)

              let executionResult = true
              let templateScriptInstance = templateScriptConstructor()

              if (executionResult === true) {
                executionResult = templateScriptInstance.runValidations(superAction)
              }

              if (executionResult !== true) { return false }
            } catch (err) {
              console.log(err.stack)
              superAction.payload.uiObject.setErrorMessage(err.message)
              return false
            }
          }

          return true
        }

        function runScript (superAction, masterScript) {
          let market = superAction.payload.parentNode
          let singleMarketData // we expect this variable to be set by a template script.
          let backSessionReference
          let liveSessionReference
          let testingEnvironmentTaskManager
          let productionEnvironmentTaskManager

          for (let i = 0; i < masterScript.templateScripts.length; i++) {
            let templateScript = masterScript.templateScripts[i]

            try {
              let templateScriptConstructor

              eval(templateScript.javascriptCode.code)

              let executionResult = true
              let templateClone
              let templateScriptInstance = templateScriptConstructor()

              if (executionResult === true) {
                templateClone = templateScriptInstance.runScript(superAction, templateScript)
              }

              if (executionResult !== true) { return false }

              switch (templateClone.payload.parentNode.type) {
                case 'Session Independent Data': {
                  singleMarketData = templateClone
                  break
                }
                case 'Session Based Data': {
                  if (backSessionReference === undefined) {
                    backSessionReference = templateClone
                  } else {
                    liveSessionReference = templateClone
                  }
                  break
                }
                case 'Testing Environment': {
                  testingEnvironmentTaskManager = templateClone
                  break
                }
                case 'Production Environment': {
                  productionEnvironmentTaskManager = templateClone
                  break
                }
              }

              if (executionResult !== true) { return false }
            } catch (err) {
              console.log(err.stack)
              superAction.payload.uiObject.setErrorMessage(err.message)
              return false
            }
          }
          return true
        }
      }
      /*
      End Manster Script
      */

      // eval(masterScript.javascriptCode.code)

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
