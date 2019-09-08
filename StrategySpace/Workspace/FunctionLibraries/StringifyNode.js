function newStringifyNode () {
  thisObject = {
    prepareForStringify: prepareForStringify
  }
  return thisObject

  function prepareForStringify (node, removePersonalData) {
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
            code: prepareForStringify(node.code, removePersonalData),
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
          let condition = prepareForStringify(node.conditions[m], removePersonalData)
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
            let situation = prepareForStringify(node.situations[m], removePersonalData)
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
          formula: prepareForStringify(node.formula, removePersonalData),
          nextPhaseEvent: prepareForStringify(node.nextPhaseEvent, removePersonalData),
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
          maxPhases: node.maxPhases,
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = prepareForStringify(node.phases[m], removePersonalData)
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
          maxPhases: node.maxPhases,
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = prepareForStringify(node.phases[m], removePersonalData)
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
          let situation = prepareForStringify(node.situations[m], removePersonalData)
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
          let situation = prepareForStringify(node.situations[m], removePersonalData)
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
          let situation = prepareForStringify(node.situations[m], removePersonalData)
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
          stopLoss: prepareForStringify(node.stopLoss, removePersonalData),
          takeProfit: prepareForStringify(node.takeProfit, removePersonalData),
          positionSize: prepareForStringify(node.positionSize, removePersonalData),
          positionRate: prepareForStringify(node.positionRate, removePersonalData),
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Open Execution': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Close Execution': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Position Size': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: prepareForStringify(node.formula, removePersonalData),
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Position Rate': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: prepareForStringify(node.formula, removePersonalData),
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
          triggerOn: prepareForStringify(node.triggerOn, removePersonalData),
          triggerOff: prepareForStringify(node.triggerOff, removePersonalData),
          takePosition: prepareForStringify(node.takePosition, removePersonalData),
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
          initialDefinition: prepareForStringify(node.initialDefinition, removePersonalData),
          openExecution: prepareForStringify(node.openExecution, removePersonalData),
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
          stopLoss: prepareForStringify(node.stopLoss, removePersonalData),
          takeProfit: prepareForStringify(node.takeProfit, removePersonalData),
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
          closeExecution: prepareForStringify(node.closeExecution, removePersonalData),
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
          triggerStage: prepareForStringify(node.triggerStage, removePersonalData),
          openStage: prepareForStringify(node.openStage, removePersonalData),
          manageStage: prepareForStringify(node.manageStage, removePersonalData),
          closeStage: prepareForStringify(node.closeStage, removePersonalData),
          savedPayload: getSavedPayload(node)
        }
        return strategy
      }
      case 'Base Asset': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Time Range': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Slippage': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Fee Structure': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Parameters': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          baseAsset: prepareForStringify(node.baseAsset, removePersonalData),
          timeRange: prepareForStringify(node.timeRange, removePersonalData),
          slippage: prepareForStringify(node.slippage, removePersonalData),
          feeStructure: prepareForStringify(node.feeStructure, removePersonalData),
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Trading System': {
        let tradingSystem = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          strategies: [],
          parameters: prepareForStringify(node.parameters, removePersonalData),
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = prepareForStringify(node.strategies[m], removePersonalData)
          tradingSystem.strategies.push(strategy)
        }
        return tradingSystem
      }
      case 'Personal Data': {
        if (removePersonalData === true) { return }
        let personalData = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          exchangeAccounts: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.exchangeAccounts.length; m++) {
          let exchangeAccount = prepareForStringify(node.exchangeAccounts[m])
          personalData.exchangeAccounts.push(exchangeAccount)
        }
        return personalData
      }
      case 'Exchange Account': {
        if (removePersonalData === true) { return }
        let exchangeAccount = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          assets: [],
          keys: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.assets.length; m++) {
          let asset = prepareForStringify(node.assets[m], removePersonalData)
          exchangeAccount.assets.push(asset)
        }

        for (let m = 0; m < node.keys.length; m++) {
          let key = prepareForStringify(node.keys[m], removePersonalData)
          exchangeAccount.keys.push(key)
        }
        return exchangeAccount
      }
      case 'Exchange Account Asset': {
        if (removePersonalData === true) { return }
        let asset = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          savedPayload: getSavedPayload(node)
        }
        return asset
      }
      case 'Exchange Account Key': {
        if (removePersonalData === true) { return }
        let key = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          savedPayload: getSavedPayload(node)
        }
        return key
      }
      case 'Task Manager': {
        let taskManager = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          tasks: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.tasks.length; m++) {
          let task = prepareForStringify(node.tasks[m], removePersonalData)
          taskManager.tasks.push(task)
        }

        return taskManager
      }
      case 'Task': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          bot: prepareForStringify(node.bot, removePersonalData),
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Sensor': {
        let bot = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          processes: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = prepareForStringify(node.processes[m], removePersonalData)
          bot.processes.push(process)
        }

        return bot
      }
      case 'Indicator': {
        let bot = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          processes: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = prepareForStringify(node.processes[m], removePersonalData)
          bot.processes.push(process)
        }

        return bot
      }
      case 'Trading Engine': {
        let bot = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          processes: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = prepareForStringify(node.processes[m], removePersonalData)
          bot.processes.push(process)
        }

        return bot
      }
      case 'Process': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Definition': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          tradingSystem: prepareForStringify(node.tradingSystem, removePersonalData),
          personalData: prepareForStringify(node.personalData, removePersonalData),
          taskManager: prepareForStringify(node.taskManager, removePersonalData),
          savedPayload: getSavedPayload(node)
        }
        return object
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
        isFrozen: (node.payload.floatingObject.isFrozen && node.payload.floatingObject.frozenManually),
        isCollapsed: (node.payload.floatingObject.isCollapsed && node.payload.floatingObject.collapsedManually),
        isTensed: (node.payload.floatingObject.isTensed && node.payload.floatingObject.tensedManually)
      },
      uiObject: {
        isRunning: node.payload.uiObject.isRunning
      }
    }
    return savedPayload
  }
}
