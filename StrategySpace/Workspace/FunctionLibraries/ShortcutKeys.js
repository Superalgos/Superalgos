function newShortcutKeys () {
  thisObject = {
    getShortcutKey: getShortcutKey
  }
  return thisObject

  function getShortcutKey (node, searchingKey) {
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
          child = getShortcutKey(node.code, searchingKey)
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
          child = getShortcutKey(node.conditions[m], searchingKey)
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
            child = getShortcutKey(node.situations[m], searchingKey)
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
        child = getShortcutKey(node.formula, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.nextPhaseEvent, searchingKey)
        if (child !== undefined) {
          return child
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
          child = getShortcutKey(node.phases[m], searchingKey)
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
          child = getShortcutKey(node.phases[m], searchingKey)
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
          child = getShortcutKey(node.situations[m], searchingKey)
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
          child = getShortcutKey(node.situations[m], searchingKey)
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
          child = getShortcutKey(node.situations[m], searchingKey)
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
        child = getShortcutKey(node.stopLoss, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.takeProfit, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.positionSize, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.positionRate, searchingKey)
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
        child = getShortcutKey(node.formula, searchingKey)
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
        child = getShortcutKey(node.formula, searchingKey)
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
        child = getShortcutKey(node.triggerOn, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.triggerOff, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.takePosition, searchingKey)
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
        child = getShortcutKey(node.initialDefinition, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.openExecution, searchingKey)
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
        child = getShortcutKey(node.stopLoss, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.takeProfit, searchingKey)
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
        child = getShortcutKey(node.closeExecution, searchingKey)
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
        child = getShortcutKey(node.triggerStage, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.openStage, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.manageStage, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.closeStage, searchingKey)
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
        child = getShortcutKey(node.baseAsset, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.timeRange, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.timePeriod, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.slippage, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.feeStructure, searchingKey)
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
        child = getShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        for (let m = 0; m < node.strategies.length; m++) {
          child = getShortcutKey(node.strategies[m], searchingKey)
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
          child = getShortcutKey(node.exchangeAccounts[m], searchingKey)
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
          child = getShortcutKey(node.assets[m], searchingKey)
          if (child !== undefined) {
            return child
          }
        }
        for (let m = 0; m < node.keys.length; m++) {
          child = getShortcutKey(node.keys[m], searchingKey)
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
      case 'Layer Manager': {
        let child
        for (let m = 0; m < node.layers.length; m++) {
          child = getShortcutKey(node.layers[m], searchingKey)
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
          child = getShortcutKey(node.tasks[m], searchingKey)
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
        child = getShortcutKey(node.bot, searchingKey)
        if (child !== undefined) {
          return child
        }
        if (node.payload.uiObject.shortcutKey === searchingKey) {
          return node
        } else {
          return
        }
      }
      case 'Sensor': {
        let child
        for (let m = 0; m < node.processes.length; m++) {
          child = getShortcutKey(node.processes[m], searchingKey)
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
      case 'Indicator': {
        let child
        for (let m = 0; m < node.processes.length; m++) {
          child = getShortcutKey(node.processes[m], searchingKey)
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
          child = getShortcutKey(node.processes[m], searchingKey)
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
        child = getShortcutKey(node.session, searchingKey)
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
        child = getShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.layerManager, searchingKey)
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
        child = getShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.layerManager, searchingKey)
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
        child = getShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.layerManager, searchingKey)
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
        child = getShortcutKey(node.parameters, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.layerManager, searchingKey)
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
          child = getShortcutKey(node.taskManagers[m], searchingKey)
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
          child = getShortcutKey(node.networkNodes[m], searchingKey)
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
        child = getShortcutKey(node.tradingSystem, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.personalData, searchingKey)
        if (child !== undefined) {
          return child
        }
        child = getShortcutKey(node.network, searchingKey)
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
