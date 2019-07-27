function newNodeDeleter () {
  thisObject = {
    deletePersonalData: deletePersonalData,
    deleteExchangeAccount: deleteExchangeAccount,
    deleteExchangeAccountAsset: deleteExchangeAccountAsset,
    deleteExchangeAccountKey: deleteExchangeAccountKey,
    deleteWorkspace: deleteWorkspace,
    deleteTradingSystem: deleteTradingSystem,
    deleteParameters: deleteParameters,
    deleteBaseAsset: deleteBaseAsset,
    deleteStrategy: deleteStrategy,
    deleteTriggerStage: deleteTriggerStage,
    deleteOpenStage: deleteOpenStage,
    deleteManageStage: deleteManageStage,
    deleteCloseStage: deleteCloseStage,
    deletePositionSize: deletePositionSize,
    deletePositionRate: deletePositionRate,
    deleteInitialDefinition: deleteInitialDefinition,
    deleteOpenExecution: deleteOpenExecution,
    deleteCloseExecution: deleteCloseExecution,
    deleteEvent: deleteEvent,
    deleteManagedItem: deleteManagedItem,
    deletePhase: deletePhase,
    deleteFormula: deleteFormula,
    deleteSituation: deleteSituation,
    deleteCondition: deleteCondition,
    deleteCode: deleteCode
  }

  return thisObject

  function destroyPart (node) {
    canvas.floatingSpace.strategyPartConstructor.destroyStrategyPart(node.payload)
  }

  function deleteWorkspace (node, rootNodes) {
    while (node.rootNodes.length > 0) {
      let rootNode = node.rootNodes[0]
      switch (rootNode.type) {

        case 'Personal Data': {
          deletePersonalData(rootNode, rootNodes, true)
          break
        }
        case 'Exchange Account': {
          deleteExchangeAccount(rootNode, rootNodes, true)
          break
        }
        case 'Exchange Account Asset': {
          deleteExchangeAccountAsset(rootNode, rootNodes, true)
          break
        }
        case 'Exchange Account Key': {
          deleteExchangeAccountKey(rootNode, rootNodes, true)
          break
        }
        case 'Trading System': {
          deleteTradingSystem(rootNode, rootNodes, true)
          break
        }
        case 'Parameters': {
          deleteParameters(rootNode, rootNodes)
          break
        }
        case 'Base Asset': {
          deleteBaseAsset(rootNode, rootNodes)
          break
        }
        case 'Strategy': {
          deleteStrategy(rootNode, rootNodes)
          break
        }
        case 'Trigger Stage': {
          deleteTriggerStage(rootNode, rootNodes)
          break
        }
        case 'Open Stage': {
          deleteOpenStage(rootNode, rootNodes)
          break
        }
        case 'Manage Stage': {
          deleteManageStage(rootNode, rootNodes)
          break
        }
        case 'Close Stage': {
          deleteCloseStage(rootNode, rootNodes)
          break
        }
        case 'Position Size': {
          deletePositionSize(rootNode, rootNodes)
          break
        }
        case 'Position Rate': {
          deletePositionRate(rootNode, rootNodes)
          break
        }
        case 'Initial Definition': {
          deleteInitialDefinition(rootNode, rootNodes)
          break
        }
        case 'Open Execution': {
          deleteOpenExecution(rootNode, rootNodes)
          break
        }
        case 'Close Execution': {
          deleteCloseExecution(rootNode, rootNodes)
          break
        }
        case 'Event': {
          deleteEvent(rootNode, rootNodes)
          break
        }
        case 'Managed Item': {
          deleteManagedItem(rootNode, rootNodes)
          break
        }
        case 'Phase': {
          deletePhase(rootNode, rootNodes)
          break
        }
        case 'Formula': {
          deleteFormula(rootNode, rootNodes)
          break
        }
        case 'Situation': {
          deleteSituation(rootNode, rootNodes)
          break
        }
        case 'Condition': {
          deleteCondition(rootNode, rootNodes)
          break
        }
        case 'Code': {
          deleteCode(rootNode, rootNodes)
          break
        }

        default: {
          console.log('WARNING this node type is not listed at NodeDeleter: ' + node.type)
        }
      }
    }

    completeDeletion(node, rootNodes)
    destroyPart(node)
    cleanNode(node)
  }

  function deletePersonalData (node, rootNodes) {
    while (node.exchangeAccounts.length > 0) {
      deleteStrategy(node.exchangeAccounts[0], rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyPart(node)
    cleanNode(node)
  }

  function deleteExchangeAccount (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.exchangeAccounts.length; j++) {
        let exchangeAccount = payload.parentNode.exchangeAccounts[j]
        if (exchangeAccount.id === node.id) {
          payload.parentNode.exchangeAccounts.splice(j, 1)
        }
      }
    }
    while (node.assets.length > 0) {
      deleteExchangeAccountAsset(node.assets[0], rootNodes)
    }
    while (node.keys.length > 0) {
      deleteExchangeAccountKey(node.keys[0], rootNodes)
    }
    completeDeletion(node, rootNodes)
    destroyPart(node)
    cleanNode(node)
  }

  function deleteExchangeAccountAsset (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.assets.length; j++) {
        let asset = payload.parentNode.assets[j]
        if (asset.id === node.id) {
          payload.parentNode.assets.splice(j, 1)
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteExchangeAccountKey (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.keys.length; j++) {
        let key = payload.parentNode.keys[j]
        if (key.id === node.id) {
          payload.parentNode.keys.splice(j, 1)
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteTradingSystem (node, rootNodes, forced) {
    if (forced !== true) {
      /* Can not delete if it is the last one */
      let counter = 0
      for (let i = 0; i < rootNodes.length; i++) {
        let rootNode = rootNodes[i]
        if (rootNode.type === node.type) {
          counter++
        }
      }
      if (counter <= 1) { return }
    }

    if (node.payload.uiObject.isRunning === true) {
      node.payload.uiObject.setNotRunningStatus()
    }

    while (node.strategies.length > 0) {
      deleteStrategy(node.strategies[0], rootNodes)
    }

    if (node.parameters !== undefined) {
      deleteParameters(node.parameters, rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyPart(node)
    cleanNode(node)
  }

  function deleteParameters (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.parameters = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.baseAsset !== undefined) {
      deleteBaseAsset(node.baseAsset, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteBaseAsset (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.baseAsset = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteStrategy (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.strategies.length; j++) {
        let strategy = payload.parentNode.strategies[j]
        if (strategy.id === node.id) {
          payload.parentNode.strategies.splice(j, 1)
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.triggerStage !== undefined) {
      deleteTriggerStage(node.triggerStage, rootNodes)
    }
    if (node.openStage !== undefined) {
      deleteOpenStage(node.openStage, rootNodes)
    }
    if (node.manageStage !== undefined) {
      deleteManageStage(node.manageStage, rootNodes)
    }
    if (node.closeStage !== undefined) {
      deleteCloseStage(node.closeStage, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteTriggerStage (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.triggerStage = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.triggerOn !== undefined) {
      deleteEvent(node.triggerOn, rootNodes)
    }
    if (node.triggerOff !== undefined) {
      deleteEvent(node.triggerOff, rootNodes)
    }
    if (node.takePosition !== undefined) {
      deleteEvent(node.takePosition, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteOpenStage (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.openStage = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.initialDefinition !== undefined) {
      deleteInitialDefinition(node.initialDefinition, rootNodes)
    }

    if (node.openExecution !== undefined) {
      deleteOpenExecution(node.openExecution, rootNodes)
    }

    destroyPart(node)
    cleanNode(node)
  }

  function deleteManageStage (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.manageStage = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.stopLoss !== undefined) {
      deleteManagedItem(node.stopLoss, rootNodes)
    }
    if (node.takeProfit !== undefined) {
      deleteManagedItem(node.takeProfit, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteCloseStage (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.closeStage = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.closeExecution !== undefined) {
      deleteCloseExecution(node.closeExecution, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deletePositionSize (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.positionSize = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deletePositionRate (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.positionRate = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteInitialDefinition (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.initialDefinition = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.stopLoss !== undefined) {
      deleteManagedItem(node.stopLoss, rootNodes)
    }
    if (node.takeProfit !== undefined) {
      deleteManagedItem(node.takeProfit, rootNodes)
    }
    if (node.positionSize !== undefined) {
      deletePositionSize(node.positionSize, rootNodes)
    }
    if (node.positionRate !== undefined) {
      deletePositionSize(node.positionRate, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteOpenExecution (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.openExecution = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteCloseExecution (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.closeExecution = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteEvent (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      switch (node.type) {
        case 'Trigger On Event': {
          payload.parentNode.triggerOn = undefined
          break
        }
        case 'Trigger Off Event': {
          payload.parentNode.triggerOff = undefined
          break
        }
        case 'Take Position Event': {
          payload.parentNode.takePosition = undefined
          break
        }
        case 'Next Phase Event': {
          payload.parentNode.nextPhaseEvent = undefined
          break
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }

    while (node.situations.length > 0) {
      deleteSituation(node.situations[0], rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteManagedItem (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      switch (node.type) {
        case 'Stop': {
          payload.parentNode.stopLoss = undefined
          break
        }
        case 'Take Profit': {
          payload.parentNode.takeProfit = undefined
          break
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }

    while (node.phases.length > 0) {
      deletePhase(node.phases[0])
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deletePhase (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let k = 0; k < payload.parentNode.phases.length; k++) {
        let phase = payload.parentNode.phases[k]
        if (phase.id === node.id) {
      /* Before deleting this phase we need to give its chainParent to the next phase down the chain */
          if (k < payload.parentNode.phases.length - 1) {
            payload.parentNode.phases[k + 1].payload.chainParent = payload.chainParent
          }
      /* Continue destroying this phase */
          payload.parentNode.phases.splice(k, 1)
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }

    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
    }

    if (node.nextPhaseEvent !== undefined) {
      deleteEvent(node.nextPhaseEvent, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteFormula (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.formula = undefined
    } else {
      completeDeletion(node, rootNodes)
    }

    destroyPart(node)
    cleanNode(node)
  }

  function deleteSituation (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.situations.length; j++) {
        let situation = payload.parentNode.situations[j]
        if (situation.id === node.id) {
          while (situation.conditions.length > 0) {
            let condition = situation.conditions[0]
            deleteCondition(condition, rootNodes)
          }
          situation.conditions = []
          payload.parentNode.situations.splice(j, 1)
          destroyPart(situation)
          cleanNode(situation)
          return
        }
      }
    } else {
      while (node.conditions.length > 0) {
        let condition = node.conditions[0]
        deleteCondition(condition)
      }
      node.conditions = []
      completeDeletion(node, rootNodes)
      destroyPart(node)
      cleanNode(node)
    }
  }

  function deleteCondition (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let i = 0; i < payload.parentNode.conditions.length; i++) {
        let condition = payload.parentNode.conditions[i]
        if (condition.id === node.id) {
          payload.parentNode.conditions.splice(i, 1)
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.code !== undefined) {
      deleteCode(node.code, rootNodes)
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteCode (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.code = undefined
    } else {
      completeDeletion(node, rootNodes)
    }

    destroyPart(node)
    cleanNode(node)
  }

  function completeDeletion (node, rootNodes) {
    for (let i = 0; i < rootNodes.length; i++) {
      let rootNode = rootNodes[i]
      if (rootNode.id === node.id) {
        rootNodes.splice(i, 1)
        return
      }
    }
  }

  function cleanNode (node) {
    node.payload.targetPosition.x = undefined
    node.payload.targetPosition.y = undefined
    node.payload.visible = undefined
    node.payload.subTitle = undefined
    node.payload.title = undefined
    node.payload.node = undefined
    node.payload.parentNode = undefined
    node.payload.chainParent = undefined
    node.payload.onMenuItemClick = undefined
    node.handle = undefined
    node.payload = undefined
    node.cleaned = true
  }
}
