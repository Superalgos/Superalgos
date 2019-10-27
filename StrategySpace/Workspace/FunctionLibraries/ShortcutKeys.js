function newShortcutKeys () {
  thisObject = {
    getNodeByShortcutKey: getNodeByShortcutKey
  }
  return thisObject

  function getNodeByShortcutKey (node, searchingKey) {
    if (node === undefined) { return }
    switch (node.type) {
      case 'Code':
        {
          if (node.payload.uiObject.shortcutKey === searchingKey) {
            return node
          } else {
            return
          }
        }
      case 'Condition':
        {
          let child
          child = getNodeByShortcutKey(node.code, searchingKey)
          if (child !== undefined) {
            return child
          }
          if (node.payload.uiObject.shortcutKey === searchingKey) {
            return node
          } else {
            return
          }
        }
      case 'Situation': {
        let child
        for (let m = 0; m < node.conditions.length; m++) {
          child = getNodeByShortcutKey(node.conditions[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Formula':
        {
          if (node.payload.uiObject.shortcutKey === searchingKey) {
            return node
          } else {
            return
          }
        }
      case 'Next Phase Event':
        {
          let child
          for (let m = 0; m < node.situations.length; m++) {
            child = getNodeByShortcutKey(node.situations[m], searchingKey)
            if (child !== undefined) {
              return child
            }
          }
          for (let m = 0; m < node.announcements.length; m++) {
            child = getNodeByShortcutKey(node.announcements[m], searchingKey)
            if (child !== undefined) {
              return child
            }
          }
          if (node.payload.uiObject.shortcutKey === searchingKey) {
            return node
          } else {
            return
          }
        }
      case 'Phase': {
        let child
        child = getNodeByShortcutKey(node.formula, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.nextPhaseEvent, searchingKey)
        if (child !== undefined) {
          return child
        }
        for (let m = 0; m < node.announcements.length; m++) {
          child = getNodeByShortcutKey(node.announcements[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Stop': {
        let child
        for (let m = 0; m < node.phases.length; m++) {
          child = getNodeByShortcutKey(node.phases[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Take Profit': {
        let child
        for (let m = 0; m < node.phases.length; m++) {
          child = getNodeByShortcutKey(node.phases[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Take Position Event': {
        let child
        for (let m = 0; m < node.situations.length; m++) {
          child = getNodeByShortcutKey(node.situations[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        for (let m = 0; m < node.announcements.length; m++) {
          child = getNodeByShortcutKey(node.announcements[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Trigger On Event': {
        let child
        for (let m = 0; m < node.situations.length; m++) {
          child = getNodeByShortcutKey(node.situations[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        for (let m = 0; m < node.announcements.length; m++) {
          child = getNodeByShortcutKey(node.announcements[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Trigger Off Event': {
        let child
        for (let m = 0; m < node.situations.length; m++) {
          child = getNodeByShortcutKey(node.situations[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        for (let m = 0; m < node.announcements.length; m++) {
          child = getNodeByShortcutKey(node.announcements[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Initial Definition': {
        let child
        child = getNodeByShortcutKey(node.stopLoss, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.takeProfit, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.positionSize, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.positionRate, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Open Execution': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Close Execution': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Position Size': {
        let child
        child = getNodeByShortcutKey(node.formula, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Position Rate': {
        let child
        child = getNodeByShortcutKey(node.formula, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Trigger Stage': {
        let child
        child = getNodeByShortcutKey(node.triggerOn, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.triggerOff, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.takePosition, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Open Stage': {
        let child
        child = getNodeByShortcutKey(node.initialDefinition, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.openExecution, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Manage Stage': {
        let child
        child = getNodeByShortcutKey(node.stopLoss, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.takeProfit, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Close Stage': {
        let child
        child = getNodeByShortcutKey(node.closeExecution, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Strategy': {
        let child
        child = getNodeByShortcutKey(node.triggerStage, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.openStage, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.manageStage, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.closeStage, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Base Asset': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Time Range': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Time Period': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Slippage': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Fee Structure': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Parameters': {
        let child
        child = getNodeByShortcutKey(node.baseAsset, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.timeRange, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.timePeriod, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.slippage, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.feeStructure, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Trading System': {
        let child
        child = getNodeByShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        for (let m = 0; m < node.strategies.length; m++) {
          child = getNodeByShortcutKey(node.strategies[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Personal Data': {
        let child
        for (let m = 0; m < node.exchangeAccounts.length; m++) {
          child = getNodeByShortcutKey(node.exchangeAccounts[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Exchange Account': {
        let child
        for (let m = 0; m < node.assets.length; m++) {
          child = getNodeByShortcutKey(node.assets[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        for (let m = 0; m < node.keys.length; m++) {
          child = getNodeByShortcutKey(node.keys[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Exchange Account Asset': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Exchange Account Key': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Social Bots': {
        let child
        for (let m = 0; m < node.bots.length; m++) {
          child = getNodeByShortcutKey(node.bots[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Telegram Bot': {
        let child
        for (let m = 0; m < node.announcements.length; m++) {
          child = getNodeByShortcutKey(node.announcements[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Announcement': {
        let child
        child = getNodeByShortcutKey(node.formula, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Layer Manager': {
        let child
        for (let m = 0; m < node.layers.length; m++) {
          child = getNodeByShortcutKey(node.layers[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Layer': {
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Task Manager': {
        let child
        for (let m = 0; m < node.tasks.length; m++) {
          child = getNodeByShortcutKey(node.tasks[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Task': {
        let child
        child = getNodeByShortcutKey(node.bot, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Sensor Bot Instance': {
        let child
        for (let m = 0; m < node.processes.length; m++) {
          child = getNodeByShortcutKey(node.processes[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Indicator Bot Instance': {
        let child
        for (let m = 0; m < node.processes.length; m++) {
          child = getNodeByShortcutKey(node.processes[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Trading Engine': {
        let child
        for (let m = 0; m < node.processes.length; m++) {
          child = getNodeByShortcutKey(node.processes[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Process': {
        let child
        child = getNodeByShortcutKey(node.session, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }

      case 'Backtesting Session': {
        let child
        child = getNodeByShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.layerManager, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }

      case 'Live Trading Session': {
        let child
        child = getNodeByShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.layerManager, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }

      case 'Fordward Testing Session': {
        let child
        child = getNodeByShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.layerManager, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }

      case 'Paper Trading Session': {
        let child
        child = getNodeByShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.layerManager, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }

      case 'Network Node': {
        let child
        for (let m = 0; m < node.taskManagers.length; m++) {
          child = getNodeByShortcutKey(node.taskManagers[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Network': {
        let child
        for (let m = 0; m < node.networkNodes.length; m++) {
          child = getNodeByShortcutKey(node.networkNodes[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Definition': {
        let child
        child = getNodeByShortcutKey(node.tradingSystem, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.personalData, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getNodeByShortcutKey(node.network, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
    }
  }
}
