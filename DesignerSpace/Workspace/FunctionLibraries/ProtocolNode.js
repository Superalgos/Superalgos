function newProtocolNode () {
  thisObject = {
    getProtocolNode: getProtocolNode
  }
  return thisObject

  function getProtocolNode (node, removePersonalData, parseCode, includeIds, includePayload, includeReferences) {
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
            code: getProtocolNode(node.code, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let condition = getProtocolNode(node.conditions[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
            let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (situation !== undefined) {
              object.situations.push(situation)
            }
          }
          for (let m = 0; m < node.announcements.length; m++) {
            let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          announcements: [],
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          nextPhaseEvent: getProtocolNode(node.nextPhaseEvent, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
      case 'Stop': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: []
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getProtocolNode(node.phases[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let phase = getProtocolNode(node.phases[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
          if (situation !== undefined) {
            object.situations.push(situation)
          }
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
          object.situations.push(situation)
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let situation = getProtocolNode(node.situations[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
          if (situation !== undefined) {
            object.situations.push(situation)
          }
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          positionSize: getProtocolNode(node.positionSize, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          positionRate: getProtocolNode(node.positionRate, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          triggerOn: getProtocolNode(node.triggerOn, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          triggerOff: getProtocolNode(node.triggerOff, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          takePosition: getProtocolNode(node.takePosition, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          initialDefinition: getProtocolNode(node.initialDefinition, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          openExecution: getProtocolNode(node.openExecution, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          stopLoss: getProtocolNode(node.stopLoss, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          takeProfit: getProtocolNode(node.takeProfit, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          closeExecution: getProtocolNode(node.closeExecution, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          triggerStage: getProtocolNode(node.triggerStage, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          openStage: getProtocolNode(node.openStage, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          manageStage: getProtocolNode(node.manageStage, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          closeStage: getProtocolNode(node.closeStage, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
      case 'Time Range': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
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
      case 'Fee Structure': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code
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
      case 'Parameters': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          baseAsset: getProtocolNode(node.baseAsset, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          timeRange: getProtocolNode(node.timeRange, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          timePeriod: getProtocolNode(node.timePeriod, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          slippage: getProtocolNode(node.slippage, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          feeStructure: getProtocolNode(node.feeStructure, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          key: getProtocolNode(node.key, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }

        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = getProtocolNode(node.strategies[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let exchangeAccount = getProtocolNode(node.exchangeAccounts[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let asset = getProtocolNode(node.assets[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
          if (asset !== undefined) {
            object.assets.push(asset)
          }
        }
        for (let m = 0; m < node.keys.length; m++) {
          let key = getProtocolNode(node.keys[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let bot = getProtocolNode(node.bots[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let announcement = getProtocolNode(node.announcements[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
          if (announcement !== undefined) {
            object.announcements.push(announcement)
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
      case 'Announcement': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          let layer = getProtocolNode(node.layers[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
      case 'Task Manager': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          tasks: []
        }

        for (let m = 0; m < node.tasks.length; m++) {
          let task = getProtocolNode(node.tasks[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          bot: getProtocolNode(node.bot, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Sensor Bot Instance': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
      case 'Indicator Bot Instance': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
      case 'Trading Bot Instance': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          processes: []
        }

        for (let m = 0; m < node.processes.length; m++) {
          let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
      case 'Process Instance': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          session: getProtocolNode(node.session, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (parseCode) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node, includeReferences)
        }
        return object
      }
      case 'Live Trading Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (parseCode) {
          object.code = JSON.parse(node.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node, includeReferences)
        }
        return object
      }
      case 'Fordward Testing Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (parseCode) {
          object.code = JSON.parse(object.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node, includeReferences)
        }
        return object
      }
      case 'Paper Trading Session': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          parameters: getProtocolNode(node.parameters, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          layerManager: getProtocolNode(node.layerManager, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          socialBots: getProtocolNode(node.socialBots, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (parseCode) {
          object.code = JSON.parse(node.code)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node, includeReferences)
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
            let taskManager = getProtocolNode(node.taskManagers[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
            let networkNode = getProtocolNode(node.networkNodes[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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
          tradingSystem: getProtocolNode(node.tradingSystem, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          personalData: getProtocolNode(node.personalData, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        if (includeReferences) {
          let referenceChildren = []
          for (let i = 0; i < node.referenceChildren.length; i++) {
            let child = node.referenceChildren[i]
            if (child !== undefined) {
              let referencedChild = {
                type: child.type,
                subType: child.subType,
                name: child.name,
                id: child.id
              }
              referenceChildren.push(referencedChild)
            }
          }
          object.savedPayload.referenceChildren = referenceChildren
        }
        return object
      }
      case 'Team': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          sensorBots: [],
          indicatorBots: [],
          tradingBots: [],
          plotters: []
        }
        if (node.array1 !== undefined) {
          for (let m = 0; m < node.sensorBots.length; m++) {
            let sensorBot = getProtocolNode(node.sensorBots[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (sensorBot !== undefined) {
              object.sensorBots.push(sensorBot)
            }
          }
        }
        if (node.indicatorBots !== undefined) {
          for (let m = 0; m < node.indicatorBots.length; m++) {
            let indicatorBot = getProtocolNode(node.indicatorBots[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (indicatorBot !== undefined) {
              object.indicatorBots.push(indicatorBot)
            }
          }
        }
        if (node.tradingBots !== undefined) {
          for (let m = 0; m < node.tradingBots.length; m++) {
            let tradingBot = getProtocolNode(node.tradingBots[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (tradingBot !== undefined) {
              object.tradingBots.push(tradingBot)
            }
          }
        }
        if (node.plotters !== undefined) {
          for (let m = 0; m < node.plotters.length; m++) {
            let plotter = getProtocolNode(node.plotters[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (plotter !== undefined) {
              object.plotters.push(plotter)
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
      case 'Sensor Bot': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          processes: [],
          products: []
        }
        if (node.processes !== undefined) {
          for (let m = 0; m < node.processes.length; m++) {
            let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (process !== undefined) {
              object.processes.push(process)
            }
          }
        }
        if (node.products !== undefined) {
          for (let m = 0; m < node.products.length; m++) {
            let product = getProtocolNode(node.products[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (product !== undefined) {
              object.products.push(product)
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
      case 'Indicator Bot': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          processes: [],
          products: []
        }
        if (node.processes !== undefined) {
          for (let m = 0; m < node.processes.length; m++) {
            let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (process !== undefined) {
              object.processes.push(process)
            }
          }
        }
        if (node.products !== undefined) {
          for (let m = 0; m < node.products.length; m++) {
            let product = getProtocolNode(node.products[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (product !== undefined) {
              object.products.push(product)
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
      case 'Trading Bot': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          processes: [],
          products: []
        }
        if (node.processes !== undefined) {
          for (let m = 0; m < node.processes.length; m++) {
            let process = getProtocolNode(node.processes[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (process !== undefined) {
              object.processes.push(process)
            }
          }
        }
        if (node.products !== undefined) {
          for (let m = 0; m < node.products.length; m++) {
            let product = getProtocolNode(node.products[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (product !== undefined) {
              object.products.push(product)
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
      case 'Process Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          calculations: getProtocolNode(node.calculations, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          dataBuilding: getProtocolNode(node.dataBuilding, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          outputDatasets: [],
          statusDependencies: [],
          dataDependencies: []
        }
        if (node.outputDatasets !== undefined) {
          for (let m = 0; m < node.outputDatasets.length; m++) {
            let outputDataset = getProtocolNode(node.outputDatasets[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (outputDataset !== undefined) {
              object.outputDatasets.push(outputDataset)
            }
          }
        }
        if (node.statusDependencies !== undefined) {
          for (let m = 0; m < node.statusDependencies.length; m++) {
            let statusDependency = getProtocolNode(node.statusDependencies[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (statusDependency !== undefined) {
              object.statusDependencies.push(statusDependency)
            }
          }
        }
        if (node.dataDependencies !== undefined) {
          for (let m = 0; m < node.dataDependencies.length; m++) {
            let dataDependency = getProtocolNode(node.dataDependencies[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (dataDependency !== undefined) {
              object.dataDependencies.push(dataDependency)
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
      case 'Calculations Procedure': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          initialization: getProtocolNode(node.initialization, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          loop: getProtocolNode(node.loop, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Data Building Procedure': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          initialization: getProtocolNode(node.initialization, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          loop: getProtocolNode(node.loop, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Procedure Initialization': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: getProtocolNode(node.code, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Procedure Loop': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: getProtocolNode(node.code, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Output Dataset': {
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
      case 'Status Dependency': {
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
      case 'Data Dependency': {
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
      case 'Product Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          record: getProtocolNode(node.record, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          datasets: []
        }
        if (node.datasets !== undefined) {
          for (let m = 0; m < node.datasets.length; m++) {
            let dataset = getProtocolNode(node.datasets[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (dataset !== undefined) {
              object.datasets.push(dataset)
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
      case 'Record Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          properties: []
        }
        if (node.properties !== undefined) {
          for (let m = 0; m < node.properties.length; m++) {
            let property = getProtocolNode(node.properties[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (property !== undefined) {
              object.properties.push(property)
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
      case 'Record Property': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          formula: getProtocolNode(node.formula, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
        }
        if (includeIds) {
          object.id = node.id
        }
        if (includePayload) {
          object.savedPayload = getSavedPayload(node)
        }
        return object
      }
      case 'Dataset Definition': {
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
      case 'Plotter': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          modules: []
        }
        if (node.modules !== undefined) {
          for (let m = 0; m < node.modules.length; m++) {
            let module = getProtocolNode(node.modules[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (module !== undefined) {
              object.modules.push(module)
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
      case 'Plotter Module': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: getProtocolNode(node.code, removePersonalData, parseCode, includeIds, includePayload, includeReferences),
          panels: []
        }
        if (node.panels !== undefined) {
          for (let m = 0; m < node.panels.length; m++) {
            let panel = getProtocolNode(node.panels[m], removePersonalData, parseCode, includeIds, includePayload, includeReferences)
            if (panel !== undefined) {
              object.panels.push(panel)
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
      case 'Plotter Panel': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: getProtocolNode(node.code, removePersonalData, parseCode, includeIds, includePayload, includeReferences)
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

  function getSavedPayload (node, includeReferences) {
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
    if (includeReferences) {
      if (node.payload.referenceParent !== undefined) {
        savedPayload.referenceParent = {
          type: node.payload.referenceParent.type,
          subType: node.payload.referenceParent.subType,
          name: node.payload.referenceParent.name,
          id: node.payload.referenceParent.id
        }
      }
    }
    return savedPayload
  }
}
