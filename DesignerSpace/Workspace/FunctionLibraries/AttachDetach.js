function newAttachDetach () {
  thisObject = {
    detachNode: detachNode,
    attachNode: attachNode
  }

  return thisObject

  function detachNode (node, rootNodes) {
    switch (node.type) {
      case 'Definition': {
        return
      }
      case 'Network': {
        node.payload.parentNode.network = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Network Node': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.networkNodes.length; i++) {
          let networkNode = payload.parentNode.networkNodes[i]
          if (networkNode.id === node.id) {
            payload.parentNode.networkNodes.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Personal Data': {
        node.payload.parentNode.personalData = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Exchange Account': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.exchangeAccounts.length; i++) {
          let strategy = payload.parentNode.exchangeAccounts[i]
          if (strategy.id === node.id) {
            payload.parentNode.exchangeAccounts.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Exchange Account Asset': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.assets.length; i++) {
          let asset = payload.parentNode.assets[i]
          if (asset.id === node.id) {
            payload.parentNode.assets.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Exchange Account Key': {
        let payload = node.payload
        if (payload.parentNode.keys !== undefined) {
          for (let i = 0; i < payload.parentNode.keys.length; i++) {
            let key = payload.parentNode.keys[i]
            if (key.id === node.id) {
              payload.parentNode.keys.splice(i, 1)
            }
          }
        }
        if (payload.parentNode.key !== undefined) {
          payload.parentNode.key = undefined
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Social Bots': {
        node.payload.parentNode.socialBots = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Telegram Bot': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.bots.length; i++) {
          let bot = payload.parentNode.bots[i]
          if (bot.id === node.id) {
            payload.parentNode.bots.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Announcement': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.announcements.length; i++) {
          let announcement = payload.parentNode.announcements[i]
          if (announcement.id === node.id) {
            payload.parentNode.announcements.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Layer Manager': {
        node.payload.parentNode.layerManager = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Layer': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.layers.length; i++) {
          let layer = payload.parentNode.layers[i]
          if (layer.id === node.id) {
            payload.parentNode.layers.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Task Manager': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.taskManagers.length; i++) {
          let taskManager = payload.parentNode.taskManagers[i]
          if (taskManager.id === node.id) {
            payload.parentNode.taskManagers.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Task': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.tasks.length; i++) {
          let task = payload.parentNode.tasks[i]
          if (task.id === node.id) {
            payload.parentNode.tasks.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Sensor Bot Instance': {
        node.payload.parentNode.bot = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Indicator Bot Instance': {
        node.payload.parentNode.bot = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Trading Bot Instance': {
        node.payload.parentNode.bot = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Backtesting Session': {
        node.payload.parentNode.session = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Live Trading Session': {
        node.payload.parentNode.session = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Fordward Testing Session': {
        node.payload.parentNode.session = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Paper Trading Session': {
        node.payload.parentNode.session = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Process Instance': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.processes.length; i++) {
          let process = payload.parentNode.processes[i]
          if (process.id === node.id) {
            payload.parentNode.processes.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Trading System': {
        node.payload.parentNode.tradingSystem = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Base Asset': {
        node.payload.parentNode.baseAsset = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Time Range': {
        node.payload.parentNode.timeRange = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Time Period': {
        node.payload.parentNode.timePeriod = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Slippage': {
        node.payload.parentNode.slippage = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Fee Structure': {
        node.payload.parentNode.feeStructure = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Parameters': {
        node.payload.parentNode.parameters = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Strategy': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.strategies.length; i++) {
          let strategy = payload.parentNode.strategies[i]
          if (strategy.id === node.id) {
            payload.parentNode.strategies.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Trigger Stage': {
        node.payload.parentNode.triggerStage = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Open Stage': {
        node.payload.parentNode.openStage = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Manage Stage': {
        node.payload.parentNode.manageStage = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Close Stage': {
        node.payload.parentNode.closeStage = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Position Size': {
        node.payload.parentNode.positionSize = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Position Rate': {
        node.payload.parentNode.positionRate = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Trigger On Event': {
        node.payload.parentNode.triggerOn = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Trigger Off Event': {
        node.payload.parentNode.triggerOff = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Take Position Event': {
        node.payload.parentNode.takePosition = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Initial Definition': {
        node.payload.parentNode.initialDefinition = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Open Execution': {
        node.payload.parentNode.openExecution = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Close Execution': {
        node.payload.parentNode.closeExecution = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Stop': {
        node.payload.parentNode.stopLoss = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Take Profit': {
        node.payload.parentNode.takeProfit = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Formula': {
        node.payload.parentNode.formula = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Next Phase Event': {
        node.payload.parentNode.nextPhaseEvent = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Code': {
        node.payload.parentNode.code = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Condition': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.conditions.length; i++) {
          let condition = payload.parentNode.conditions[i]
          if (condition.id === node.id) {
            payload.parentNode.conditions.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Situation': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.situations.length; i++) {
          let situation = payload.parentNode.situations[i]
          if (situation.id === node.id) {
            payload.parentNode.situations.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
        return
      }
      case 'Phase': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.phases.length; i++) {
          let phase = payload.parentNode.phases[i]
          if (phase.id === node.id) {
            if (i < payload.parentNode.phases.length - 1) {
              let nextPhase = payload.parentNode.phases[i + 1]
              if (i > 0) {
                let previousPhase = payload.parentNode.phases[i - 1]
                nextPhase.payload.chainParent = previousPhase
              } else {
                nextPhase.payload.chainParent = payload.parentNode
              }
            }
            payload.parentNode.phases.splice(i, 1)
            completeDetachment(node, rootNodes)
            return
          }
        }
        return
      }
    }
  }

  function attachNode (node, attachToNode, rootNodes) {
    switch (node.type) {
      case 'Network': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.network = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Network Node': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.networkNodes.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Social Bots': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.socialBots = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Telegram Bot': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.bots.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Announcement': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.announcements.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Layer Manager': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.layerManager = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Layer': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.layers.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Task Manager': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.taskManagers.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Task': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.tasks.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Sensor Bot Instance': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.bot = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Indicator Bot Instance': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.bot = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Trading Bot Instance': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.bot = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Process Instance': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.processes.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Backtesting Session': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.session = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Live Trading Session': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.session = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Fordward Testing Session': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.session = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Paper Trading Session': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.session = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Personal Data': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.personalData = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Exchange Account': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.exchangeAccounts.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Exchange Account Asset': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.assets.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Exchange Account Key': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        if (node.payload.parentNode.keys !== undefined) {
          node.payload.parentNode.keys.push(node)
        } else {
          node.payload.parentNode.key = node
        }
        completeAttachment(node, rootNodes)
      }
        break
      case 'Parameters': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.parameters = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Base Asset': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.baseAsset = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Time Range': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.timeRange = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Time Period': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.timePeriod = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Slippage': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.slippage = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Fee Structure': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.feeStructure = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Trading System': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.tradingSystem = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Strategy': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.strategies.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Trigger Stage': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.triggerStage = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Open Stage': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.openStage = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Manage Stage': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.manageStage = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Close Stage': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.closeStage = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Position Size': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.positionSize = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Position Rate': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.positionRate = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Initial Definition': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.initialDefinition = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Open Execution': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.openExecution = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Close Execution': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.closeExecution = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Trigger On Event': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.triggerOn = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Trigger Off Event': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.triggerOff = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Take Position Event': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.takePosition = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Stop': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.stopLoss = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Take Profit': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.takeProfit = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Formula': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.formula = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Next Phase Event': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.nextPhaseEvent = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Phase': {
        switch (attachToNode.type) {
          case 'Stop': {
            if (attachToNode.maxPhases !== undefined) {
              if (attachToNode.phases.length >= attachToNode.maxPhases) {
                return
              }
            }
            node.payload.parentNode = attachToNode
            if (attachToNode.phases.length > 0) {
              let phase = attachToNode.phases[attachToNode.phases.length - 1]
              node.payload.chainParent = phase
            } else {
              node.payload.chainParent = attachToNode
            }
            attachToNode.phases.push(node)
            completeAttachment(node, rootNodes)
          }
            break
          case 'Take Profit': {
            if (attachToNode.maxPhases !== undefined) {
              if (attachToNode.phases.length >= attachToNode.maxPhases) {
                return
              }
            }
            node.payload.parentNode = attachToNode
            if (attachToNode.phases.length > 0) {
              let phase = attachToNode.phases[attachToNode.phases.length - 1]
              node.payload.chainParent = phase
            } else {
              node.payload.chainParent = attachToNode
            }
            attachToNode.phases.push(node)
            completeAttachment(node, rootNodes)
          }
            break
          case 'Phase': {
            node.payload.parentNode = attachToNode.payload.parentNode
            for (let i = 0; i < node.payload.parentNode.phases.length; i++) {
              let phase = node.payload.parentNode.phases[i]
              if (attachToNode.id === phase.id) {
                if (i === node.payload.parentNode.phases.length - 1) {
                  node.payload.chainParent = attachToNode
                  node.payload.parentNode.phases.push(node)
                  completeAttachment(node, rootNodes)
                } else {
                  node.payload.chainParent = attachToNode
                  let nextPhase = node.payload.parentNode.phases[i + 1]
                  nextPhase.payload.chainParent = node
                  node.payload.parentNode.phases.splice(i + 1, 0, node)
                  completeAttachment(node, rootNodes)
                  return
                }
              }
            }
          }
        }
      }
        break
      case 'Situation': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.situations.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Condition': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.conditions.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Code': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.code = node
        completeAttachment(node, rootNodes)
      }
        break
    }
  }

  function completeDetachment (node, rootNodes) {
    node.payload.parentNode = undefined
    node.payload.chainParent = undefined
    rootNodes.push(node)
  }

  function completeAttachment (node, rootNodes) {
    for (let i = 0; i < rootNodes.length; i++) {
      let rootNode = rootNodes[i]
      if (rootNode.id === node.id) {
        rootNodes.splice(i, 1)
        return
      }
    }
  }
}
