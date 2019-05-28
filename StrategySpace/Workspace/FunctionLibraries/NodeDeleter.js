function newNodeDeleter () {
  thisObject = {
    deleteStrategy: deleteStrategy,
    deleteTriggerStage: deleteTriggerStage,
    deleteOpenStage: deleteOpenStage,
    deleteManageStage: deleteManageStage,
    deleteCloseStage: deleteCloseStage,
    deleteInitialDefinition: deleteInitialDefinition,
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
      deleteTriggerStage(node.triggerStage)
    }
    if (node.openStage !== undefined) {
      deleteOpenStage(node.openStage)
    }
    if (node.manageStage !== undefined) {
      deleteManageStage(node.manageStage)
    }
    if (node.closeStage !== undefined) {
      deleteCloseStage(node.closeStage)
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
      deleteEvent(node.triggerOn)
    }
    if (node.triggerOff !== undefined) {
      deleteEvent(node.triggerOff)
    }
    if (node.takePosition !== undefined) {
      deleteEvent(node.takePosition)
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
      deleteInitialDefinition(node.initialDefinition)
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
      deleteManagedItem(node.stopLoss)
    }
    if (node.takeProfit !== undefined) {
      deleteManagedItem(node.takeProfit)
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
      }
    } else {
      completeDeletion(node, rootNodes)
    }

    while (node.situations.length > 0) {
      deleteSituation(node.situations[0])
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

    while (node.situations.length > 0) {
      let situation = node.situations[0]
      deleteSituation(situation)
    }
    node.situations = []

    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
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
            deleteCondition(condition)
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
