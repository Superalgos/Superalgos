function newProtocolNode () {
  thisObject = {
    getProtocolNode: getProtocolNode
  }
  return thisObject

  function getProtocolNode (node, removePersonalData, parseCode, includeIds) {
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
          if (includeIds) {
            code.id = node.id
          }
          return code
        }
      case 'Condition':
        {
          let condition = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: getProtocolNode(node.code, removePersonalData, parseCode, includeIds)
          }
          if (includeIds) {
            condition.id = node.id
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
          let condition = getProtocolNode(node.conditions[m], removePersonalData, parseCode, includeIds)
          situation.conditions.push(condition)
        }
        if (includeIds) {
          situation.id = node.id
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
          if (includeIds) {
            formula.id = node.id
          }
          return formula
        }
      case 'Next Phase Event':
        {
          let event = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            situations: [],
            announcements: []
          }
          for (let m = 0; m < node.situations.length; m++) {
            let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds)
            event.situations.push(situation)
          }
          for (let m = 0; m < node.announcements.length; m++) {
            let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds)
            event.announcements.push(announcement)
          }
          if (includeIds) {
            event.id = node.id
          }
          return event
        }
      case 'Phase': {
        let phase = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds),
          nextPhaseEvent: getProtocolNode(node.nextPhaseEvent, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          phase.id = node.id
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
          let phase = getProtocolNode(node.phases[m], removePersonalData, parseCode, includeIds)
          stop.phases.push(phase)
        }
        if (includeIds) {
          stop.id = node.id
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
          let phase = getProtocolNode(node.phases[m], removePersonalData, parseCode, includeIds)
          takeProfit.phases.push(phase)
        }
        if (includeIds) {
          takeProfit.id = node.id
        }
        return takeProfit
      }
      case 'Take Position Event': {
        let event = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          announcements: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds)
          event.situations.push(situation)
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds)
          event.announcements.push(announcement)
        }
        if (includeIds) {
          event.id = node.id
        }
        return event
      }
      case 'Trigger On Event': {
        let event = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          announcements: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds)
          event.situations.push(situation)
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds)
          event.announcements.push(announcement)
        }
        if (includeIds) {
          event.id = node.id
        }
        return event
      }
      case 'Trigger Off Event': {
        let event = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          announcements: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds)
          event.situations.push(situation)
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds)
          event.announcements.push(announcement)
        }
        if (includeIds) {
          event.id = node.id
        }
        return event
      }
      case 'Initial Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData, parseCode, includeIds),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData, parseCode, includeIds),
          positionSize: getProtocolNode(node.positionSize, removePersonalData, parseCode, includeIds),
          positionRate: getProtocolNode(node.positionRate, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Open Execution': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Close Execution': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Position Size': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Position Rate': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Trigger Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerOn: getProtocolNode(node.triggerOn, removePersonalData, parseCode, includeIds),
          triggerOff: getProtocolNode(node.triggerOff, removePersonalData, parseCode, includeIds),
          takePosition: getProtocolNode(node.takePosition, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          stage.id = node.id
        }
        return stage
      }
      case 'Open Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          initialDefinition: getProtocolNode(node.initialDefinition, removePersonalData, parseCode, includeIds),
          openExecution: getProtocolNode(node.openExecution, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          stage.id = node.id
        }
        return stage
      }
      case 'Manage Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData, parseCode, includeIds),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          stage.id = node.id
        }
        return stage
      }
      case 'Close Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          closeExecution: getProtocolNode(node.closeExecution, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          stage.id = node.id
        }
        return stage
      }
      case 'Strategy': {
        let strategy = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerStage: getProtocolNode(node.triggerStage, removePersonalData, parseCode, includeIds),
          openStage: getProtocolNode(node.openStage, removePersonalData, parseCode, includeIds),
          manageStage: getProtocolNode(node.manageStage, removePersonalData, parseCode, includeIds),
          closeStage: getProtocolNode(node.closeStage, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          strategy.id = node.id
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
        if (includeIds) {
          object.id = node.id
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
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Time Period': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        if (includeIds) {
          object.id = node.id
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
        if (includeIds) {
          object.id = node.id
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
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Parameters': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          baseAsset: getProtocolNode(node.baseAsset, removePersonalData, parseCode, includeIds),
          timeRange: getProtocolNode(node.timeRange, removePersonalData, parseCode, includeIds),
          timePeriod: getProtocolNode(node.timePeriod, removePersonalData, parseCode, includeIds),
          slippage: getProtocolNode(node.slippage, removePersonalData, parseCode, includeIds),
          feeStructure: getProtocolNode(node.feeStructure, removePersonalData, parseCode, includeIds),
          key: getProtocolNode(node.key, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Trading System': {
        let tradingSystem = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          strategies: [],
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds)
        }

        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = getProtocolNode(node.strategies[m], removePersonalData, parseCode, includeIds)
          tradingSystem.strategies.push(strategy)
        }
        if (includeIds) {
          tradingSystem.id = node.id
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
          let exchangeAccount = getProtocolNode(node.exchangeAccounts[m], removePersonalData, parseCode, includeIds)
          personalData.exchangeAccounts.push(exchangeAccount)
        }
        if (includeIds) {
          personalData.id = node.id
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
          let asset = getProtocolNode(node.assets[m], removePersonalData, parseCode, includeIds)
          exchangeAccount.assets.push(asset)
        }
        for (let m = 0; m < node.keys.length; m++) {
          let key = getProtocolNode(node.keys[m], removePersonalData, parseCode, includeIds)
          exchangeAccount.keys.push(key)
        }
        if (includeIds) {
          exchangeAccount.id = node.id
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
        if (includeIds) {
          asset.id = node.id
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
        if (includeIds) {
          key.id = node.id
        }
        return key
      }
      case 'Social Bots': {
        let socialBots = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          bots: []
        }

        for (let m = 0; m < node.bots.length; m++) {
          let bot = getProtocolNode(node.bots[m], removePersonalData, parseCode, includeIds)
          socialBots.bots.push(bot)
        }
        if (includeIds) {
          socialBots.id = node.id
        }
        return socialBots
      }
      case 'Telegram Bot': {
        let bot = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          announcements: []
        }

        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds)
          bot.announcements.push(announcement)
        }
        if (includeIds) {
          bot.id = node.id
        }
        return bot
      }
      case 'Announcement': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Layer Manager': {
        let layerManager = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          layers: []
        }

        for (let m = 0; m < node.layers.length; m++) {
          let layer = getProtocolNode(node.layers[m], removePersonalData, parseCode, includeIds)
          layerManager.layers.push(layer)
        }
        if (includeIds) {
          layerManager.id = node.id
        }
        return layerManager
      }
      case 'Layer': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Task Manager': {
        let taskManager = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          tasks: []
        }

        for (let m = 0; m < node.tasks.length; m++) {
          let task = getProtocolNode(node.tasks[m], removePersonalData, parseCode, includeIds)
          taskManager.tasks.push(task)
        }
        if (includeIds) {
          taskManager.id = node.id
        }
        return taskManager
      }
      case 'Task': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          bot: getProtocolNode(node.bot, removePersonalData, parseCode, includeIds)
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
          code: node.code,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds)
          bot.processes.push(process)
        }
        if (parseCode) {
          bot.code = JSON.parse(bot.code)
        }
        if (includeIds) {
          bot.id = node.id
        }
        return bot
      }
      case 'Indicator': {
        let bot = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds)
          bot.processes.push(process)
        }
        if (parseCode) {
          bot.code = JSON.parse(bot.code)
        }
        if (includeIds) {
          bot.id = node.id
        }
        return bot
      }
      case 'Trading Engine': {
        let bot = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds)
          bot.processes.push(process)
        }
        if (parseCode) {
          bot.code = JSON.parse(bot.code)
        }
        if (includeIds) {
          bot.id = node.id
        }
        return bot
      }
      case 'Process': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          session: getProtocolNode(node.session, removePersonalData, parseCode, includeIds)
        }
        if (parseCode) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }

      case 'Backtesting Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds)
        }
        if (parseCode) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }

      case 'Live Trading Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds)
        }
        if (parseCode) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }

      case 'Fordward Testing Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds)
        }
        if (parseCode) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }

      case 'Paper Trading Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds)
        }
        if (parseCode) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }

      case 'Network Node': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          taskManagers: []
        }
        if (node.taskManagers !== undefined) {
          for (let m = 0; m < node.taskManagers.length; m++) {
            let taskManager = getProtocolNode(node.taskManagers[m], removePersonalData, parseCode, includeIds)
            object.taskManagers.push(taskManager)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
      case 'Network': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          networkNodes: []
        }
        if (node.networkNodes !== undefined) {
          for (let m = 0; m < node.networkNodes.length; m++) {
            let networkNode = getProtocolNode(node.networkNodes[m], removePersonalData, parseCode, includeIds)
            object.networkNodes.push(networkNode)
          }
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
          tradingSystem: getProtocolNode(node.tradingSystem, removePersonalData, parseCode, includeIds),
          personalData: getProtocolNode(node.personalData, removePersonalData, parseCode, includeIds),
          network: getProtocolNode(node.network, removePersonalData, parseCode, includeIds)
        }
        if (includeIds) {
          object.id = node.id
        }
        return object
      }
    }
  }
}
