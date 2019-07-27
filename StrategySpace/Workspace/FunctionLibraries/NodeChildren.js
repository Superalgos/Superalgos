function newNodeChildren () {
  thisObject = {
    childrenCount: childrenCount
  }

  return thisObject

  function childrenCount (parentNode, childNode) {
    switch (parentNode.type) {

      case 'Personal Data': {
        return countChildrenPersonalData(parentNode, childNode)
      }
      case 'Exchange Account': {
        return countChildrenExchangeAccount(parentNode, childNode)
      }
      case 'Exchange Account Asset': {
        return countChildrenExchangeAccountAsset(parentNode, childNode)
      }
      case 'Exchange Account Key': {
        return countChildrenExchangeAccountKey(parentNode, childNode)
      }
      case 'Trading System': {
        return countChildrenTradingSystem(parentNode, childNode)
      }
      case 'Parameters': {
        return countChildrenParameters(parentNode, childNode)
      }
      case 'Base Asset': {
        return countChildrenBaseAsset(parentNode, childNode)
      }
      case 'Strategy': {
        return countChildrenStrategy(parentNode, childNode)
      }
      case 'Trigger Stage': {
        return countChildrenTriggerStage(parentNode, childNode)
      }
      case 'Open Stage': {
        return countChildrenOpenStage(parentNode, childNode)
      }
      case 'Manage Stage': {
        return countChildrenManageStage(parentNode, childNode)
      }
      case 'Close Stage': {
        return countChildrenCloseStage(parentNode, childNode)
      }
      case 'Position Size': {
        return countChildrenPositionSize(parentNode, childNode)
      }
      case 'Position Rate': {
        return countChildrenPositionSize(parentNode, childNode)
      }
      case 'Initial Definition': {
        return countChildrenInitialDefinition(parentNode, childNode)
      }
      case 'Open Execution': {
        return countChildrenOpenExecution(parentNode, childNode)
      }
      case 'Close Execution': {
        return countChildrenCloseExecution(parentNode, childNode)
      }
      case 'Next Phase Event': {
        return countChildrenEvent(parentNode, childNode)
      }
      case 'Trigger On Event': {
        return countChildrenEvent(parentNode, childNode)
      }
      case 'Trigger Off Event': {
        return countChildrenEvent(parentNode, childNode)
      }
      case 'Take Position Event': {
        return countChildrenEvent(parentNode, childNode)
      }
      case 'Stop': {
        return countChildrenStop(parentNode, childNode)
      }
      case 'Take Profit': {
        return countChildrenTakeProfit(parentNode, childNode)
      }
      case 'Phase': {
        return countChildrenPhase(parentNode, childNode)
      }
      case 'Formula': {
        return countChildrenFormula(parentNode, childNode)
      }
      case 'Situation': {
        return countChildrenSituation(parentNode, childNode)
      }
      case 'Condition': {
        return countChildrenCondition(parentNode, childNode)
      }
      case 'Code': {
        return countChildrenCode(parentNode, childNode)
      }
      default: {
        console.log('WARNING this parentNode type is not listed at NodeChildren: ' + parentNode.type)
      }
    }
  }

  function countChildrenPersonalData (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.exchangeAccounts.length; i++) {
      let child = parentNode.exchangeAccounts[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenExchangeAccount (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.assets.length; i++) {
      let child = parentNode.assets[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }

    for (let i = 0; i < parentNode.keys.length; i++) {
      let child = parentNode.keys[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenExchangeAccountAsset (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenExchangeAccountKey (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenTradingSystem (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.strategies.length; i++) {
      let child = parentNode.strategies[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }

    if (parentNode.parameters !== undefined) {
      response.childrenCount++
      if (parentNode.parameters.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenParameters (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.baseAsset !== undefined) {
      response.childrenCount++
      if (parentNode.baseAsset.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenBaseAsset (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.formula !== undefined) {
      response.childrenCount++
      if (parentNode.formula.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenStrategy (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.triggerStage !== undefined) {
      response.childrenCount++
      if (parentNode.triggerStage.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.openStage !== undefined) {
      response.childrenCount++
      if (parentNode.openStage.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.manageStage !== undefined) {
      response.childrenCount++
      if (parentNode.manageStage.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.closeStage !== undefined) {
      response.childrenCount++
      if (parentNode.closeStage.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenTriggerStage (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.triggerOn !== undefined) {
      response.childrenCount++
      if (parentNode.triggerOn.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.triggerOff !== undefined) {
      response.childrenCount++
      if (parentNode.triggerOff.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.takePosition !== undefined) {
      response.childrenCount++
      if (parentNode.takePosition.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenOpenStage (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.initialDefinition !== undefined) {
      response.childrenCount++
      if (parentNode.initialDefinition.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.openExecution !== undefined) {
      response.childrenCount++
      if (parentNode.openExecution.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenManageStage (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.stopLoss !== undefined) {
      response.childrenCount++
      if (parentNode.stopLoss.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.takeProfit !== undefined) {
      response.childrenCount++
      if (parentNode.takeProfit.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenCloseStage (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.closeExecution !== undefined) {
      response.childrenCount++
      if (parentNode.closeExecution.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenPositionSize (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.formula !== undefined) {
      response.childrenCount++
      if (parentNode.formula.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenPositionRate (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.formula !== undefined) {
      response.childrenCount++
      if (parentNode.formula.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenInitialDefinition (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.positionSize !== undefined) {
      response.childrenCount++
      if (parentNode.positionSize.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.stopLoss !== undefined) {
      response.childrenCount++
      if (parentNode.stopLoss.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.takeProfit !== undefined) {
      response.childrenCount++
      if (parentNode.takeProfit.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.positionRate !== undefined) {
      response.childrenCount++
      if (parentNode.positionRate.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenOpenExecution (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenCloseExecution (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenEvent (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < parentNode.situations.length; i++) {
      let child = parentNode.situations[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenStop (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < parentNode.phases.length; i++) {
      let child = parentNode.phases[i]

      if (child.id === childNode.id) {
        if (childNode.payload.chainParent !== undefined) {
          if (childNode.payload.chainParent.id === parentNode.id) {
            response.childrenCount++
            response.childIndex = response.childrenCount
          }
        }
      }
    }
    return response
  }

  function countChildrenTakeProfit (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < parentNode.phases.length; i++) {
      let child = parentNode.phases[i]

      if (child.id === childNode.id) {
        if (childNode.payload.chainParent !== undefined) {
          if (childNode.payload.chainParent.id === parentNode.id) {
            response.childrenCount++
            response.childIndex = response.childrenCount
          }
        }
      }
    }
    return response
  }

  function countChildrenPhase (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.formula !== undefined) {
      response.childrenCount++
      if (parentNode.formula.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.nextPhaseEvent !== undefined) {
      response.childrenCount++
      if (parentNode.nextPhaseEvent.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenFormula (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenSituation (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < parentNode.conditions.length; i++) {
      let child = parentNode.conditions[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenCondition (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.code !== undefined) {
      response.childrenCount++
      if (parentNode.code.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenCode (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }
}

