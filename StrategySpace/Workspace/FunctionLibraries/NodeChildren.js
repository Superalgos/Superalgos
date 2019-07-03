function newNodeChildren () {
  thisObject = {
    childrenCount: childrenCount
  }

  return thisObject

  function childrenCount (node) {
    switch (node.type) {

      case 'Trading System': {
        return countChildrenTradingSystem(node)
      }
      case 'Parameters': {
        return countChildrenParameters(node)
      }
      case 'Base Asset': {
        return countChildrenBaseAsset(node)
      }
      case 'Strategy': {
        return countChildrenStrategy(node)
      }
      case 'Trigger Stage': {
        return countChildrenTriggerStage(node)
      }
      case 'Open Stage': {
        return countChildrenOpenStage(node)
      }
      case 'Manage Stage': {
        return countChildrenManageStage(node)
      }
      case 'Close Stage': {
        return countChildrenCloseStage(node)
      }
      case 'Position Size': {
        return countChildrenPositionSize(node)
      }
      case 'Initial Definition': {
        return countChildrenInitialDefinition(node)
      }
      case 'Event': {
        return countChildrenEvent(node)
      }
      case 'Managed Item': {
        return countChildrenManagedItem(node)
      }
      case 'Phase': {
        return countChildrenPhase(node)
      }
      case 'Formula': {
        return countChildrenFormula(node)
      }
      case 'Situation': {
        return countChildrenSituation(node)
      }
      case 'Condition': {
        return countChildrenCondition(node)
      }
      case 'Code': {
        return countChildrenCode(node)
      }
    }
  }

  function countChildrenTradingSystem (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < node.strategies.length; i++) {
      let child = node.strategies[i]
      response.childrenCount++
      if (child.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }

    if (node.parameters !== undefined) {
      response.childrenCount++
      if (node.parameters.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenParameters (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.baseAsset !== undefined) {
      response.childrenCount++
      if (node.baseAsset.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenBaseAsset (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.formula !== undefined) {
      response.childrenCount++
      if (node.formula.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenStrategy (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.triggerStage !== undefined) {
      response.childrenCount++
      if (node.triggerStage.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (node.openStage !== undefined) {
      response.childrenCount++
      if (node.openStage.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (node.manageStage !== undefined) {
      response.childrenCount++
      if (node.manageStage.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (node.closeStage !== undefined) {
      response.childrenCount++
      if (node.closeStage.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenTriggerStage (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.triggerOn !== undefined) {
      response.childrenCount++
      if (node.triggerOn.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (node.triggerOff !== undefined) {
      response.childrenCount++
      if (node.triggerOff.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (node.takePosition !== undefined) {
      response.childrenCount++
      if (node.takePosition.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (node.positionSize !== undefined) {
      response.childrenCount++
      if (node.positionSize.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenOpenStage (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.initialDefinition !== undefined) {
      response.childrenCount++
      if (node.initialDefinition.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenManageStage (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.stopLoss !== undefined) {
      response.childrenCount++
      if (node.stopLoss.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (node.takeProfit !== undefined) {
      response.childrenCount++
      if (node.takeProfit.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenCloseStage (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenPositionSize (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.formula !== undefined) {
      response.childrenCount++
      if (node.formula.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenInitialDefinition (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.stopLoss !== undefined) {
      response.childrenCount++
      if (node.stopLoss.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (node.takeProfit !== undefined) {
      response.childrenCount++
      if (node.takeProfit.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenEvent (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < node.situations.length; i++) {
      let child = node.situations[i]
      response.childrenCount++
      if (child.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenManagedItem (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < node.phases.length; i++) {
      let child = node.phases[i]
      response.childrenCount++
      if (child.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenPhase (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.formula !== undefined) {
      response.childrenCount++
      if (node.formula.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (node.nextPhaseEvent !== undefined) {
      response.childrenCount++
      if (node.nextPhaseEvent.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenFormula (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenSituation (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < node.conditions.length; i++) {
      let child = node.conditions[i]
      response.childrenCount++
      if (child.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenCondition (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (node.code !== undefined) {
      response.childrenCount++
      if (node.code.id === node.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenCode (node) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }
}
