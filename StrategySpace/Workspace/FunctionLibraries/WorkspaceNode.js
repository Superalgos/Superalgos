function newWorkspaceNode () {
  thisObject = {
    getWorkspaceNode: getWorkspaceNode
  }
  return thisObject

  function getWorkspaceNode (node) {
    if (node === undefined) { return }
    switch (node.type) {
      case 'Code':
        {
          let code = {
            id: node.id,
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: node.code,
            savedPayload: getSavedPayload(node)
          }
          return code
        }
      case 'Condition':
        {
          let condition = {
            id: node.id,
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: getWorkspaceNode(node.code),
            savedPayload: getSavedPayload(node)
          }
          return condition
        }
      case 'Situation': {
        let situation = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          conditions: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.conditions.length; m++) {
          let condition = getWorkspaceNode(node.conditions[m])
          situation.conditions.push(condition)
        }
        return situation
      }
      case 'Formula':
        {
          let formula = {
            id: node.id,
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: node.code,
            savedPayload: getSavedPayload(node)
          }
          return formula
        }
      case 'Next Phase Event':
        {
          let event = {
            id: node.id,
            type: node.type,
            subType: node.subType,
            name: node.name,
            situations: [],
            savedPayload: getSavedPayload(node)
          }
          for (let m = 0; m < node.situations.length; m++) {
            let situation = getWorkspaceNode(node.situations[m])
            event.situations.push(situation)
          }
          return event
        }
      case 'Phase': {
        let phase = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getWorkspaceNode(node.formula),
          nextPhaseEvent: getWorkspaceNode(node.nextPhaseEvent),
          savedPayload: getSavedPayload(node)
        }
        return phase
      }
      case 'Stop': {
        let stop = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getWorkspaceNode(node.phases[m])
          stop.phases.push(phase)
        }
        return stop
      }
      case 'Take Profit': {
        let takeProfit = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getWorkspaceNode(node.phases[m])
          takeProfit.phases.push(phase)
        }
        return takeProfit
      }
      case 'Take Position Event': {
        let event = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getWorkspaceNode(node.situations[m])
          event.situations.push(situation)
        }
        return event
      }
      case 'Trigger On Event': {
        let event = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getWorkspaceNode(node.situations[m])
          event.situations.push(situation)
        }
        return event
      }
      case 'Trigger Off Event': {
        let event = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getWorkspaceNode(node.situations[m])
          event.situations.push(situation)
        }
        return event
      }
      case 'Initial Definition': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Trigger Stage': {
        let stage = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerOn: getWorkspaceNode(node.triggerOn),
          triggerOff: getWorkspaceNode(node.triggerOff),
          takePosition: getWorkspaceNode(node.takePosition),
          savedPayload: getSavedPayload(node)
        }
        return stage
      }
      case 'Open Stage': {
        let stage = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          initialDefinition: getWorkspaceNode(node.initialDefinition),
          savedPayload: getSavedPayload(node)
        }
        return stage
      }
      case 'Manage Stage': {
        let stage = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getWorkspaceNode(node.stopLoss),
          takeProfit: getWorkspaceNode(node.takeProfit),
          savedPayload: getSavedPayload(node)
        }
        return stage
      }
      case 'Close Stage': {
        let stage = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          savedPayload: getSavedPayload(node)
        }
        return stage
      }
      case 'Strategy': {
        let strategy = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerStage: getWorkspaceNode(node.triggerStage),
          openStage: getWorkspaceNode(node.openStage),
          manageStage: getWorkspaceNode(node.manageStage),
          closeStage: getWorkspaceNode(node.closeStage),
          savedPayload: getSavedPayload(node)
        }
        return strategy
      }
      case 'Trading System': {
        let tradingSystem = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          strategies: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = getWorkspaceNode(node.strategies[m])
          tradingSystem.strategies.push(strategy)
        }
        return tradingSystem
      }
    }
  }

  function getSavedPayload (node) {
    if (node.payload === undefined) {
      console.log(node)
    }
    let savedPayload = {
      position: {
        x: node.payload.position.x,
        y: node.payload.position.y
      },
      targetPosition: {
        x: node.payload.targetPosition.x,
        y: node.payload.targetPosition.y
      },
      floatingObject: {
        isPinned: node.payload.floatingObject.isPinned,
        isFrozen: (node.payload.floatingObject.isFrozen && node.payload.floatingObject.frozenManually)
      },
      uiObject: {
        isRunning: node.payload.uiObject.isRunning
      }
    }
    return savedPayload
  }
}
