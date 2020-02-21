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
          let paperSessionReference
          let liveSessionReference
          let testingEnvironmentTaskManager
          let fordwardSessionReference
          let productionEnvironmentTaskManager
          let timeMachine

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
                  switch (templateClone.templateType) {
                    case 'Backtesting Session': {
                      backSessionReference = templateClone
                      break
                    }
                    case 'Paper Trading Session': {
                      paperSessionReference = templateClone
                      break
                    }
                    case 'Live Trading Session': {
                      liveSessionReference = templateClone
                      break
                    }
                    case 'Fordward Testing Session': {
                      fordwardSessionReference = templateClone
                      break
                    }
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
                case 'Dashboard': {
                  timeMachine = templateClone
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

          /* Here we will find the sessions within the tasks in order to put them as a reference of the Session Reference nodes we already have */
          let session
          session = findSession('Backtesting Session', testingEnvironmentTaskManager)
          backSessionReference.payload.referenceParent = session
          session = findSession('Paper Trading Session', testingEnvironmentTaskManager)
          paperSessionReference.payload.referenceParent = session
          session = findSession('Live Trading Session', productionEnvironmentTaskManager)
          liveSessionReference.payload.referenceParent = session
          session = findSession('Fordward Testing Session', productionEnvironmentTaskManager)
          fordwardSessionReference.payload.referenceParent = session

          function findSession (sessionType, taskManager) {
            for (let i = 0; i < taskManager.tasks.length; i++) {
              let task = taskManager.tasks[i]
              if (task.bot !== undefined) {
                if (task.bot.processes !== undefined) {
                  for (let j = 0; j < task.bot.processes.length; j++) {
                    let process = task.bot.processes[j]
                    if (process.session !== undefined) {
                      if (process.session.type === sessionType) {
                        return process.session
                      }
                    }
                  }
                }
              }
            }
          }

          /* Here, we are going to connect the layers of the charts at the Time Machine */
          for (let i = 0; i < timeMachine.timelineCharts.length; i++) {
            let timelineChart = timeMachine.timelineCharts[i]
            switch (timelineChart.name) {
              case 'Indicators': {
                for (let j = 0; j < timelineChart.layersManager.layers.length; j++) {
                  let layer = timelineChart.layersManager.layers[j]
                  switch (j) {
                    case 0: {
                      let dataProduct = findDataProduct(singleMarketData, 'Candles')
                      layer.payload.referenceParent = dataProduct
                      break
                    }
                    case 1: {
                      let dataProduct = findDataProduct(singleMarketData, 'Bollinger Bands')
                      layer.payload.referenceParent = dataProduct
                      break
                    }
                    case 2: {
                      let dataProduct = findDataProduct(singleMarketData, 'Bollinger Channels Objects')
                      layer.payload.referenceParent = dataProduct
                      break
                    }
                    case 3: {
                      let dataProduct = findDataProduct(singleMarketData, 'Bollinger Sub-Channels Objects')
                      layer.payload.referenceParent = dataProduct
                      break
                    }
                    case 4: {
                      let dataProduct = findDataProduct(singleMarketData, 'Candles-Stairs')
                      layer.payload.referenceParent = dataProduct
                      break
                    }
                  }
                }
                break
              }
              case 'Volumes': {
                for (let j = 0; j < timelineChart.layersManager.layers.length; j++) {
                  let layer = timelineChart.layersManager.layers[j]
                  switch (j) {
                    case 0: {
                      let dataProduct = findDataProduct(singleMarketData, 'Volumes')
                      layer.payload.referenceParent = dataProduct
                      break
                    }
                    case 1: {
                      let dataProduct = findDataProduct(singleMarketData, 'Volume-Stairs')
                      layer.payload.referenceParent = dataProduct
                      break
                    }
                  }
                }
                break
              }
              case 'Oscilators': {
                for (let j = 0; j < timelineChart.layersManager.layers.length; j++) {
                  let layer = timelineChart.layersManager.layers[j]
                  switch (j) {
                    case 0: {
                      let dataProduct = findDataProduct(singleMarketData, 'Percentage Bandwidth')
                      layer.payload.referenceParent = dataProduct
                      break
                    }
                  }
                }
                break
              }
              case 'Backtesting': {
                setupSessionReference(timelineChart, backSessionReference)
                break
              }
              case 'Paper Trading': {
                setupSessionReference(timelineChart, paperSessionReference)
                break
              }
              case 'Live Trading': {
                setupSessionReference(timelineChart, liveSessionReference)
                break
              }
              case 'Fordward Trading': {
                setupSessionReference(timelineChart, fordwardSessionReference)
                break
              }
            }
          }

          function findDataProduct (singleMarketData, name) {
            for (let i = 0; i < singleMarketData.dataProducts.length; i++) {
              let dataProduct = singleMarketData.dataProducts[i]
              if (dataProduct.name === name) {
                return dataProduct
              }
            }
          }
          function setupSessionReference (timelineChart, sessionReference) {
            for (let j = 0; j < timelineChart.layersManager.layers.length; j++) {
              let layer = timelineChart.layersManager.layers[j]
              switch (j) {
                case 0: {
                  let dataProduct = findDataProduct(sessionReference.singleMarketData, 'Simulation')
                  layer.payload.referenceParent = dataProduct
                  break
                }
                case 1: {
                  let dataProduct = findDataProduct(sessionReference.singleMarketData, 'Conditions')
                  layer.payload.referenceParent = dataProduct
                  break
                }
                case 2: {
                  let dataProduct = findDataProduct(sessionReference.singleMarketData, 'Trades')
                  layer.payload.referenceParent = dataProduct
                  break
                }
                case 3: {
                  let dataProduct = findDataProduct(sessionReference.singleMarketData, 'Strategies')
                  layer.payload.referenceParent = dataProduct
                  break
                }
              }
            }
          }

          timeMachine.name = superAction.payload.parentNode.payload.parentNode.payload.parentNode.name + ' ' + market.name
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
