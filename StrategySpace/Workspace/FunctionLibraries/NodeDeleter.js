function newNodeDeleter () {
  thisObject = {
    deleteStrategy: deleteStrategy,
    deleteTriggerStage: deleteTriggerStage,
    deleteOpenStage: deleteOpenStage,
    deleteManageStage: deleteManageStage,
    deleteInitialDefinition: deleteInitialDefinition,
    deleteEvent: deleteEvent,
    deleteManagedItem: deleteManagedItem,
    deletePhase: deletePhase,
    deleteSituation: deleteSituation,
    deleteCondition: deleteCondition
  }

  return thisObject

  function destroyPart (node) {
    canvas.floatingSpace.strategyPartConstructor.destroyStrategyPart(node.payload)
  }

  function deleteStrategy (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.strategies.length; j++) {
        let strategy = payload.parentNode.strategies[j]
        if (strategy.id === node.id) {
          payload.parentNode.strategies.splice(j, 1)
        }
      }
    }
    deleteTriggerStage(node.triggerStage)
    deleteOpenStage(node.openStage)
    deleteManageStage(node.manageStage)
    deleteCloseStage(node.closeStage)
    destroyPart(node)
    cleanNode(node)
  }

  function deleteTriggerStage (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.triggerStage = undefined
    }
    deleteEvent(node.entryPoint)
    deleteEvent(node.exitPoint)
    deleteEvent(node.sellPoint)

    destroyPart(node)
    cleanNode(node)
  }

  function deleteOpenStage (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.openStage = undefined
    }
    deleteInitialDefinition(node.initialDefinition)

    destroyPart(node)
    cleanNode(node)
  }

  function deleteManageStage (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.manageStage = undefined
    }
    deleteManagedItem(node.stopLoss)
    deleteManagedItem(node.buyOrder)

    destroyPart(node)
    cleanNode(node)
  }

  function deleteCloseStage (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.closeStage = undefined
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteInitialDefinition (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.initialDefinition = undefined
    }

    destroyPart(node)
    cleanNode(node)
  }

  function deleteEvent (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      switch (node.type) {
        case 'Trigger On Event': {
          payload.parentNode.entryPoint = undefined
          break
        }
        case 'Trigger Off Event': {
          payload.parentNode.exitPoint = undefined
          break
        }
        case 'Take Position Event': {
          payload.parentNode.sellPoint = undefined
          break
        }
      }
    }

    while (node.situations.length > 0) {
      deleteSituation(node.situations[0])
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteManagedItem (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      switch (node.type) {
        case 'Stop Loss': {
          payload.parentNode.stopLoss = undefined
          break
        }
        case 'Take Profit': {
          payload.parentNode.buyOrder = undefined
          break
        }
      }
    }

    while (node.phases.length > 0) {
      deletePhase(node.phases[0])
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deletePhase (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let k = 0; k < payload.parentNode.phases.length; k++) {
        let phase = payload.parentNode.phases[k]
        if (phase.id === node.id) {
          while (phase.situations.length > 0) {
            let situation = phase.situations[0]
            deleteSituation(situation)
          }
          phase.situations = []
      /* Before deleting this phase we need to give its chainParent to the next phase down the chain */
          if (k < payload.parentNode.phases.length - 1) {
            payload.parentNode.phases[k + 1].payload.chainParent = payload.chainParent
          }
      /* Continue destroying this phase */
          payload.parentNode.phases.splice(k, 1)
          destroyPart(phase)
          cleanNode(phase)
          return
        }
      }
    } else {
      while (node.situations.length > 0) {
        let situation = node.situations[0]
        deleteSituation(situation)
      }
      node.situations = []
      destroyPart(node)
      cleanNode(node)
    }
  }

  function deleteSituation (node) {
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
      destroyPart(node)
      cleanNode(node)
    }
  }

  function deleteCondition (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let i = 0; i < payload.parentNode.conditions.length; i++) {
        let condition = payload.parentNode.conditions[i]
        if (condition.id === node.id) {
          payload.parentNode.conditions.splice(i, 1)
          destroyPart(node)
          cleanNode(condition)
          return
        }
      }
    } else {
      destroyPart(node)
      cleanNode(node)
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
