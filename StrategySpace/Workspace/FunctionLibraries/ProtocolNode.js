function newProtocolNode () {
  thisObject = {
    getProtocolNode: getProtocolNode
  }
  return thisObject

  function getProtocolNode (node, removePersonalData, parseCode, includeIds, includePayload) {
    if (node === undefined) { return }
    switch (node.type) {
      case 'Code':
        {
          let object = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: node.code
          }
          if (includeIds) {
            object.id = node.id
          }
          if (includePayload) {
            object.savedPayload = getSavedPayload(node)
          }
          return object
        }
      case 'Condition':
        {
          let object = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: getProtocolNode(node.code, removePersonalData, parseCode, includeIds, includePayload)
          }
          if (includeIds) {
            object.id = node.id
          }
          if (includePayload) {
            object.savedPayload = getSavedPayload(node)
          }
          return object
        }
      case 'Situation': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          conditions: []
        }

        for (let m = 0; m < node.conditions.length; m++) {
          let condition = getProtocolNode(node.conditions[m], removePersonalData, parseCode, includeIds, includePayload)
          if (condition !== undefined) {
            object.conditions.push(condition)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Formula':
        {
          let object = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: node.code
          }
          if (includeIds) {
            object.id = node.id
          }
          if (includePayload) {
            object.savedPayload = getSavedPayload(node)
          }
          return object
        }
      case 'Next Phase Event':
        {
          let object = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            situations: [],
            announcements: []
          }
          for (let m = 0; m < node.situations.length; m++) {
            let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds, includePayload)
            if (situation !== undefined) {
              object.situations.push(situation)
            }
          }
          for (let m = 0; m < node.announcements.length; m++) {
            let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload)
            if (announcement !== undefined) {
              object.announcements.push(announcement)
            }
          }
          if (includeIds) {
            object.id = node.id
          }
          if (includePayload) {
            object.savedPayload = getSavedPayload(node)
          }
          return object
        }
      case 'Phase': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds, includePayload),
          nextPhaseEvent: getProtocolNode(node.nextPhaseEvent, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Stop': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: []
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getProtocolNode(node.phases[m], removePersonalData, parseCode, includeIds, includePayload)
          if (phase !== undefined) {
            object.phases.push(phase)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Take Profit': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: []
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getProtocolNode(node.phases[m], removePersonalData, parseCode, includeIds, includePayload)
          if (phase !== undefined) {
            object.phases.push(phase)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Take Position Event': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          announcements: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds, includePayload)
          if (situation !== undefined) {
            object.situations.push(situation)
          }
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload)
          if (announcement !== undefined) {
            object.announcements.push(announcement)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Trigger On Event': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          announcements: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds, includePayload)
          object.situations.push(situation)
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload)
          if (announcement !== undefined) {
            object.announcements.push(announcement)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Trigger Off Event': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          announcements: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds, includePayload)
          if (situation !== undefined) {
            object.situations.push(situation)
          }
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload)
          if (announcement !== undefined) {
            object.announcements.push(announcement)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Initial Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData, parseCode, includeIds, includePayload),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData, parseCode, includeIds, includePayload),
          positionSize: getProtocolNode(node.positionSize, removePersonalData, parseCode, includeIds, includePayload),
          positionRate: getProtocolNode(node.positionRate, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
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
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
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
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Position Size': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Position Rate': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Trigger Stage': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerOn: getProtocolNode(node.triggerOn, removePersonalData, parseCode, includeIds, includePayload),
          triggerOff: getProtocolNode(node.triggerOff, removePersonalData, parseCode, includeIds, includePayload),
          takePosition: getProtocolNode(node.takePosition, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Open Stage': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          initialDefinition: getProtocolNode(node.initialDefinition, removePersonalData, parseCode, includeIds, includePayload),
          openExecution: getProtocolNode(node.openExecution, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Manage Stage': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData, parseCode, includeIds, includePayload),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Close Stage': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          closeExecution: getProtocolNode(node.closeExecution, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Strategy': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerStage: getProtocolNode(node.triggerStage, removePersonalData, parseCode, includeIds, includePayload),
          openStage: getProtocolNode(node.openStage, removePersonalData, parseCode, includeIds, includePayload),
          manageStage: getProtocolNode(node.manageStage, removePersonalData, parseCode, includeIds, includePayload),
          closeStage: getProtocolNode(node.closeStage, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
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
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
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
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
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
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
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
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
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
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Parameters': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          baseAsset: getProtocolNode(node.baseAsset, removePersonalData, parseCode, includeIds, includePayload),
          timeRange: getProtocolNode(node.timeRange, removePersonalData, parseCode, includeIds, includePayload),
          timePeriod: getProtocolNode(node.timePeriod, removePersonalData, parseCode, includeIds, includePayload),
          slippage: getProtocolNode(node.slippage, removePersonalData, parseCode, includeIds, includePayload),
          feeStructure: getProtocolNode(node.feeStructure, removePersonalData, parseCode, includeIds, includePayload),
          key: getProtocolNode(node.key, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Trading System': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          strategies: [],
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload)
        }

        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = getProtocolNode(node.strategies[m], removePersonalData, parseCode, includeIds, includePayload)
          if (strategy !== undefined) {
            object.strategies.push(strategy)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Personal Data': {
        if (removePersonalData === true) { return }
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          exchangeAccounts: []
        }

        for (let m = 0; m < node.exchangeAccounts.length; m++) {
          let exchangeAccount = getProtocolNode(node.exchangeAccounts[m], removePersonalData, parseCode, includeIds, includePayload)
          if (exchangeAccount !== undefined) {
            object.exchangeAccounts.push(exchangeAccount)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Exchange Account': {
        if (removePersonalData === true) { return }
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          assets: [],
          keys: []
        }

        for (let m = 0; m < node.assets.length; m++) {
          let asset = getProtocolNode(node.assets[m], removePersonalData, parseCode, includeIds, includePayload)
          if (asset !== undefined) {
            object.assets.push(asset)
          }
        }
        for (let m = 0; m < node.keys.length; m++) {
          let key = getProtocolNode(node.keys[m], removePersonalData, parseCode, includeIds, includePayload)
          if (key !== undefined) {
            object.keys.push(key)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Exchange Account Asset': {
        if (removePersonalData === true) { return }
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Exchange Account Key': {
        if (removePersonalData === true) { return }
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Social Bots': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          bots: []
        }

        for (let m = 0; m < node.bots.length; m++) {
          let bot = getProtocolNode(node.bots[m], removePersonalData, parseCode, includeIds, includePayload)
          if (bot !== undefined) {
            object.bots.push(bot)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Telegram Bot': {
        if (removePersonalData === true) { return }
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          announcements: []
        }

        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload)
          if (announcement !== undefined) {
            object.announcements.push(announcement)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
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
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Layer Manager': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          layers: []
        }

        for (let m = 0; m < node.layers.length; m++) {
          let layer = getProtocolNode(node.layers[m], removePersonalData, parseCode, includeIds, includePayload)
          if (layer !== undefined) {
            object.layers.push(layer)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
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
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Task Manager': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          tasks: []
        }

        for (let m = 0; m < node.tasks.length; m++) {
          let task = getProtocolNode(node.tasks[m], removePersonalData, parseCode, includeIds, includePayload)
          if (task !== undefined) {
            object.tasks.push(task)
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Task': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          bot: getProtocolNode(node.bot, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Sensor': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds, includePayload)
          if (process !== undefined) {
            object.processes.push(process)
          }
        }
        if (parseCode) {
          object.code = JSON.parse(node.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Indicator': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds, includePayload)
          if (process !== undefined) {
            object.processes.push(process)
          }
        }
        if (parseCode) {
          object.code = JSON.parse(node.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Trading Engine': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds, includePayload)
          if (process !== undefined) {
            object.processes.push(process)
          }
        }
        if (parseCode) {
          object.code = JSON.parse(node.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Process': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          session: getProtocolNode(node.session, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (parseCode) {
          object.code = JSON.parse(node.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Backtesting Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds, includePayload),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (parseCode) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Live Trading Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds, includePayload),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (parseCode) {
          object.code = JSON.parse(node.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Fordward Testing Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds, includePayload),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (parseCode) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Paper Trading Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds, includePayload),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (parseCode) {
          object.code = JSON.parse(node.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
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
            let taskManager = getProtocolNode(node.taskManagers[m], removePersonalData, parseCode, includeIds, includePayload)
            if (taskManager !== undefined) {
              object.taskManagers.push(taskManager)
            }
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
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
            let networkNode = getProtocolNode(node.networkNodes[m], removePersonalData, parseCode, includeIds, includePayload)
            if (networkNode !== undefined) {
              object.networkNodes.push(networkNode)
            }
          }
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          tradingSystem: getProtocolNode(node.tradingSystem, removePersonalData, parseCode, includeIds, includePayload),
          personalData: getProtocolNode(node.personalData, removePersonalData, parseCode, includeIds, includePayload),
          network: getProtocolNode(node.network, removePersonalData, parseCode, includeIds, includePayload)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
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
        isRunning: node.payload.uiObject.isRunning,
        shortcutKey: node.payload.uiObject.shortcutKey
      }
    }
    return savedPayload
  }
}
