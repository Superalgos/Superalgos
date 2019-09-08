function newProtocolNode () {
  thisObject = {
    getProtocolNode: getProtocolNode
  }
  return thisObject

  function getProtocolNode (node, removePersonalData, parseJSONStrings, includeIds) {
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
            code: getProtocolNode(node.code, removePersonalData, parseJSONStrings, includeIds)
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
          let condition = getProtocolNode(node.conditions[m], removePersonalData, parseJSONStrings, includeIds)
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
            let situation = getProtocolNode(node.situations[m], removePersonalData, parseJSONStrings, includeIds)
            event.situations.push(situation)
          }
          return event
        }
      case 'Phase': {
        let phase = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData, parseJSONStrings, includeIds),
          nextPhaseEvent: getProtocolNode(node.nextPhaseEvent, removePersonalData, parseJSONStrings, includeIds)
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
          let phase = getProtocolNode(node.phases[m], removePersonalData, parseJSONStrings, includeIds)
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
          let phase = getProtocolNode(node.phases[m], removePersonalData, parseJSONStrings, includeIds)
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
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseJSONStrings, includeIds)
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
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseJSONStrings, includeIds)
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
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseJSONStrings, includeIds)
          event.situations.push(situation)
        }
        return event
      }
      case 'Initial Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData, parseJSONStrings, includeIds),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData, parseJSONStrings, includeIds),
          positionSize: getProtocolNode(node.positionSize, removePersonalData, parseJSONStrings, includeIds),
          positionRate: getProtocolNode(node.positionRate, removePersonalData, parseJSONStrings, includeIds)
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
          formula: getProtocolNode(node.formula, removePersonalData, parseJSONStrings, includeIds)
        }
        return object
      }
      case 'Position Rate': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData, parseJSONStrings, includeIds)
        }
        return object
      }
      case 'Trigger Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerOn: getProtocolNode(node.triggerOn, removePersonalData, parseJSONStrings, includeIds),
          triggerOff: getProtocolNode(node.triggerOff, removePersonalData, parseJSONStrings, includeIds),
          takePosition: getProtocolNode(node.takePosition, removePersonalData, parseJSONStrings, includeIds)
        }
        return stage
      }
      case 'Open Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          initialDefinition: getProtocolNode(node.initialDefinition, removePersonalData, parseJSONStrings, includeIds),
          openExecution: getProtocolNode(node.openExecution, removePersonalData, parseJSONStrings, includeIds)
        }
        return stage
      }
      case 'Manage Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData, parseJSONStrings, includeIds),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData, parseJSONStrings, includeIds)
        }
        return stage
      }
      case 'Close Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          closeExecution: getProtocolNode(node.closeExecution, removePersonalData, parseJSONStrings, includeIds)
        }
        return stage
      }
      case 'Strategy': {
        let strategy = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerStage: getProtocolNode(node.triggerStage, removePersonalData, parseJSONStrings, includeIds),
          openStage: getProtocolNode(node.openStage, removePersonalData, parseJSONStrings, includeIds),
          manageStage: getProtocolNode(node.manageStage, removePersonalData, parseJSONStrings, includeIds),
          closeStage: getProtocolNode(node.closeStage, removePersonalData, parseJSONStrings, includeIds)
        }
        return strategy
      }
      case 'Base Asset': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        return object
      }
      case 'Time Range': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        return object
      }
      case 'Slippage': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        return object
      }
      case 'Fee Structure': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        return object
      }
      case 'Parameters': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          baseAsset: getProtocolNode(node.baseAsset, removePersonalData, parseJSONStrings, includeIds),
          timeRange: getProtocolNode(node.timeRange, removePersonalData, parseJSONStrings, includeIds),
          slippage: getProtocolNode(node.slippage, removePersonalData, parseJSONStrings, includeIds),
          feeStructure: getProtocolNode(node.feeStructure, removePersonalData, parseJSONStrings, includeIds)
        }
        return object
      }
      case 'Trading System': {
        let tradingSystem = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          strategies: [],
          parameters: getProtocolNode(node.parameters, removePersonalData, parseJSONStrings, includeIds)
        }

        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = getProtocolNode(node.strategies[m], removePersonalData, parseJSONStrings, includeIds)
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
          let exchangeAccount = getProtocolNode(node.exchangeAccounts[m], removePersonalData, parseJSONStrings, includeIds)
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
          let asset = getProtocolNode(node.assets[m], removePersonalData, parseJSONStrings, includeIds)
          exchangeAccount.assets.push(asset)
        }
        for (let m = 0; m < node.keys.length; m++) {
          let key = getProtocolNode(node.keys[m], removePersonalData, parseJSONStrings, includeIds)
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
      case 'Task Manager': {
        let taskManager = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          tasks: []
        }

        for (let m = 0; m < node.tasks.length; m++) {
          let task = getProtocolNode(node.tasks[m], removePersonalData, parseJSONStrings, includeIds)
          taskManager.tasks.push(task)
        }
        return taskManager
      }
      case 'Task': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          bot: getProtocolNode(node.bot, removePersonalData, parseJSONStrings, includeIds)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Sensor': {
        let bot = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseJSONStrings, includeIds)
          bot.processes.push(process)
        }
        return bot
      }
      case 'Indicator': {
        let bot = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseJSONStrings, includeIds)
          bot.processes.push(process)
        }
        return bot
      }
      case 'Trading Engine': {
        let bot = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseJSONStrings, includeIds)
          bot.processes.push(process)
        }
        return bot
      }
      case 'Process': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        if (parseJSONStrings) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          tradingSystem: getProtocolNode(node.tradingSystem, removePersonalData, parseJSONStrings, includeIds),
          personalData: getProtocolNode(node.personalData, removePersonalData, parseJSONStrings, includeIds),
          taskManager: getProtocolNode(node.taskManager, removePersonalData, parseJSONStrings, includeIds)
        }
        return object
      }
    }
  }
}
