function newProtocolNode () {
  thisObject = {
    getProtocolNode: getProtocolNode
  }
  return thisObject

  function getProtocolNode (node, removePersonalData) {
    if (node === undefined) { return }
    switch (node.type) {
      case 'Code':
        {
          let code = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: node.code
          }
          return code
        }
      case 'Condition':
        {
          let condition = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: getProtocolNode(node.code, removePersonalData)
          }
          return condition
        }
      case 'Situation': {
        let situation = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          conditions: []
        }

        for (let m = 0; m < node.conditions.length; m++) {
          let condition = getProtocolNode(node.conditions[m], removePersonalData)
          situation.conditions.push(condition)
        }
        return situation
      }
      case 'Formula':
        {
          let formula = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: node.code
          }
          return formula
        }
      case 'Next Phase Event':
        {
          let event = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            situations: []
          }
          for (let m = 0; m < node.situations.length; m++) {
            let situation = getProtocolNode(node.situations[m], removePersonalData)
            event.situations.push(situation)
          }
          return event
        }
      case 'Phase': {
        let phase = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData),
          nextPhaseEvent: getProtocolNode(node.nextPhaseEvent, removePersonalData)
        }
        return phase
      }
      case 'Stop': {
        let stop = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: []
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getProtocolNode(node.phases[m], removePersonalData)
          stop.phases.push(phase)
        }
        return stop
      }
      case 'Take Profit': {
        let takeProfit = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: []
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getProtocolNode(node.phases[m], removePersonalData)
          takeProfit.phases.push(phase)
        }
        return takeProfit
      }
      case 'Take Position Event': {
        let event = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m], removePersonalData)
          event.situations.push(situation)
        }
        return event
      }
      case 'Trigger On Event': {
        let event = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m], removePersonalData)
          event.situations.push(situation)
        }
        return event
      }
      case 'Trigger Off Event': {
        let event = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m], removePersonalData)
          event.situations.push(situation)
        }
        return event
      }
      case 'Initial Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData),
          positionSize: getProtocolNode(node.positionSize, removePersonalData),
          positionRate: getProtocolNode(node.positionRate, removePersonalData)
        }
        return object
      }
      case 'Open Execution': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name
        }
        return object
      }
      case 'Close Execution': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name
        }
        return object
      }
      case 'Position Size': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData)
        }
        return object
      }
      case 'Position Rate': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData)
        }
        return object
      }
      case 'Trigger Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerOn: getProtocolNode(node.triggerOn, removePersonalData),
          triggerOff: getProtocolNode(node.triggerOff, removePersonalData),
          takePosition: getProtocolNode(node.takePosition, removePersonalData)
        }
        return stage
      }
      case 'Open Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          initialDefinition: getProtocolNode(node.initialDefinition, removePersonalData),
          openExecution: getProtocolNode(node.openExecution, removePersonalData)
        }
        return stage
      }
      case 'Manage Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData)
        }
        return stage
      }
      case 'Close Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          closeExecution: getProtocolNode(node.closeExecution, removePersonalData)
        }
        return stage
      }
      case 'Strategy': {
        let strategy = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerStage: getProtocolNode(node.triggerStage, removePersonalData),
          openStage: getProtocolNode(node.openStage, removePersonalData),
          manageStage: getProtocolNode(node.manageStage, removePersonalData),
          closeStage: getProtocolNode(node.closeStage, removePersonalData)
        }
        return strategy
      }
      case 'Base Asset': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData)
        }
        return object
      }
      case 'Parameters': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          baseAsset: getProtocolNode(node.baseAsset, removePersonalData)
        }
        return object
      }
      case 'Trading System': {
        let tradingSystem = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          strategies: [],
          parameters: getProtocolNode(node.parameters, removePersonalData)
        }

        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = getProtocolNode(node.strategies[m], removePersonalData)
          tradingSystem.strategies.push(strategy)
        }
        return tradingSystem
      }
      case 'Personal Data': {
        if (removePersonalData === true) { return }
        let personalData = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          exchangeAccounts: []
        }

        for (let m = 0; m < node.exchangeAccounts.length; m++) {
          let exchangeAccount = getProtocolNode(node.exchangeAccounts[m], removePersonalData)
          personalData.exchangeAccounts.push(exchangeAccount)
        }
        return personalData
      }
      case 'Exchange Account': {
        if (removePersonalData === true) { return }
        let exchangeAccount = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          assets: [],
          keys: []
        }

        for (let m = 0; m < node.assets.length; m++) {
          let asset = getProtocolNode(node.assets[m], removePersonalData)
          exchangeAccount.assets.push(asset)
        }
        for (let m = 0; m < node.keys.length; m++) {
          let key = getProtocolNode(node.keys[m], removePersonalData)
          exchangeAccount.keys.push(key)
        }
        return exchangeAccount
      }
      case 'Exchange Account Asset': {
        if (removePersonalData === true) { return }
        let asset = {
          type: node.type,
          subType: node.subType,
          name: node.name
        }
        return asset
      }
      case 'Exchange Account Key': {
        if (removePersonalData === true) { return }
        let key = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        return key
      }
      case 'Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          tradingSystem: getProtocolNode(node.tradingSystem, removePersonalData),
          personalData: getProtocolNode(node.personalData, removePersonalData)
        }
        return object
      }
    }
  }
}
