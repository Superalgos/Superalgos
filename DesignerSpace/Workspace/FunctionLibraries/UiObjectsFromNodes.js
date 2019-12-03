function newUiObjectsFromNodes () {
  thisObject = {
    recreateWorkspace: recreateWorkspace,
    createUiObjectFromNode: createUiObjectFromNode,
    addTeam: addTeam,
    addSensorBot: addSensorBot,
    addIndicatorBot: addIndicatorBot,
    addTradingBot: addTradingBot,
    addProcessDefinition: addProcessDefinition,
    addMissingProcessDefinitionItems: addMissingProcessDefinitionItems,
    addMissingProductDefinitionItems: addMissingProductDefinitionItems,
    addProcessOutput: addProcessOutput,
    addProcessDependencies: addProcessDependencies,
    addStatusReport: addStatusReport,
    addExecutionStartedEvent: addExecutionStartedEvent,
    addExecutionFinishedEvent: addExecutionFinishedEvent,
    addCalculationsProcedure: addCalculationsProcedure,
    addDataBuildingProcedure: addDataBuildingProcedure,
    addProcedureInitialization: addProcedureInitialization,
    addProcedureLoop: addProcedureLoop,
    addOutputDataset: addOutputDataset,
    addStatusDependency: addStatusDependency,
    addDataDependency: addDataDependency,
    addProductDefinition: addProductDefinition,
    addRecordDefinition: addRecordDefinition,
    addRecordProperty: addRecordProperty,
    addDatasetDefinition: addDatasetDefinition,
    addPlotter: addPlotter,
    addPlotterModule: addPlotterModule,
    addPlotterPanel: addPlotterPanel,
    addDefinition: addDefinition,
    addNetwork: addNetwork,
    addNetworkNode: addNetworkNode,
    addSocialBots: addSocialBots,
    addTelegramBot: addTelegramBot,
    addAnnouncement: addAnnouncement,
    addLayerManager: addLayerManager,
    addLayer: addLayer,
    addTaskManager: addTaskManager,
    addTask: addTask,
    addSensorBotInstance: addSensorBotInstance,
    addIndicatorBotInstance: addIndicatorBotInstance,
    addTradingBotInstance: addTradingBotInstance,
    addProcessInstance: addProcessInstance,
    addBacktestingSession: addBacktestingSession,
    addLiveTradingSession: addLiveTradingSession,
    addFordwardTestingSession: addFordwardTestingSession,
    addPaperTradingSession: addPaperTradingSession,
    addTradingSystem: addTradingSystem,
    addPersonalData: addPersonalData,
    addExchangeAccount: addExchangeAccount,
    addExchangeAccountAsset: addExchangeAccountAsset,
    addExchangeAccountKey: addExchangeAccountKey,
    addStrategy: addStrategy,
    addParameters: addParameters,
    addMissingParameters: addMissingParameters,
    addMissingStages: addMissingStages,
    addMissingEvents: addMissingEvents,
    addMissingItems: addMissingItems,
    addInitialDefinition: addInitialDefinition,
    addOpenExecution: addOpenExecution,
    addCloseExecution: addCloseExecution,
    addPhase: addPhase,
    addFormula: addFormula,
    addNextPhaseEvent: addNextPhaseEvent,
    addSituation: addSituation,
    addCondition: addCondition,
    addCode: addCode
  }

  let mapOfReferenceParents
  let mapOfReferenceChildren

  return thisObject

  function recreateWorkspace (node) {
    mapOfReferenceParents = new Map()
    mapOfReferenceChildren = new Map()
    let workspace = node
    createUiObject(false, 'Workspace', workspace.name, workspace, undefined, undefined, 'Workspace')
    if (node.rootNodes !== undefined) {
      for (let i = 0; i < node.rootNodes.length; i++) {
        let rootNode = node.rootNodes[i]
        createUiObjectFromNode(rootNode, undefined, undefined)
      }
    }
    /* We reconstruct here the reference relationships. */
    for (const [key, childNode] of mapOfReferenceChildren) {
      childNode.payload.referenceParent = mapOfReferenceParents.get(childNode.savedPayload.referenceParent.id)
      childNode.savedPayload = undefined
    }
    for (const [key, parentNode] of mapOfReferenceParents) {
      if (parentNode.referenceChildren === undefined) {
        parentNode.referenceChildren = []
      }
      for (let i = 0; i < parentNode.savedPayload.referenceChildren.length; i++) {
        let savedChild = parentNode.savedPayload.referenceChildren[i]
        if (savedChild.id !== undefined) {
          let referenceChild = mapOfReferenceChildren.get(savedChild.id)
          parentNode.referenceChildren.push(referenceChild)
        }
      }
      parentNode.savedPayload = undefined
    }
    mapOfReferenceChildren = undefined
    mapOfReferenceParents = undefined

    return
  }

  function createUiObjectFromNode (node, parentNode, chainParent, positionOffset) {
    switch (node.type) {
      case 'Code':
        {
          createUiObject(false, 'Code', node.name, node, parentNode, chainParent, 'Code', positionOffset)
          return
        }
      case 'Condition':
        {
          createUiObject(false, 'Condition', node.name, node, parentNode, chainParent, 'Condition', positionOffset)
          if (node.code !== undefined) {
            createUiObjectFromNode(node.code, node, node, positionOffset)
          }
          return
        }
      case 'Situation': {
        let situation = node
        createUiObject(false, 'Situation', situation.name, situation, parentNode, chainParent, 'Situation', positionOffset)
        for (let m = 0; m < node.conditions.length; m++) {
          let condition = node.conditions[m]
          createUiObjectFromNode(condition, situation, situation, positionOffset)
        }
        return
      }
      case 'Formula':
        {
          createUiObject(false, 'Formula', node.name, node, parentNode, chainParent, 'Formula', positionOffset)
          return
        }
      case 'Next Phase Event':
        {
          createUiObject(false, 'Next Phase Event', node.name, node, parentNode, chainParent, 'Next Phase Event', positionOffset)
          for (let m = 0; m < node.situations.length; m++) {
            let situation = node.situations[m]
            createUiObjectFromNode(situation, node, node, positionOffset)
          }
          if (node.announcements === undefined) {
            node.announcements = []
          }
          for (let m = 0; m < node.announcements.length; m++) {
            let announcement = node.announcements[m]
            createUiObjectFromNode(announcement, node, node, positionOffset)
          }
          return
        }
      case 'Phase': {
        let phase = node
        createUiObject(false, 'Phase', phase.name, phase, parentNode, chainParent, phase.subType, positionOffset)

        if (node.formula !== undefined) {
          createUiObjectFromNode(node.formula, phase, phase, positionOffset)
        }
        if (node.nextPhaseEvent !== undefined) {
          createUiObjectFromNode(node.nextPhaseEvent, phase, phase, positionOffset)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node, positionOffset)
        }
        return
      }
      case 'Stop': {
        let lastPhase
        let stop = node
        createUiObject(false, 'Stop', stop.name, stop, parentNode, chainParent, 'Stop', positionOffset)
        for (let m = 0; m < node.phases.length; m++) {
          let phase = node.phases[m]
          let thisChainParent
          if (m === 0) {
            thisChainParent = node
          } else {
            thisChainParent = lastPhase
          }
          lastPhase = phase
          createUiObjectFromNode(phase, stop, thisChainParent, positionOffset)
        }
        return
      }
      case 'Take Profit': {
        let lastPhase
        let takeProfit = node
        createUiObject(false, 'Take Profit', takeProfit.name, takeProfit, parentNode, chainParent, 'Take Profit', positionOffset)
        for (let m = 0; m < node.phases.length; m++) {
          let phase = node.phases[m]
          let thisChainParent
          if (m === 0) {
            thisChainParent = node
          } else {
            thisChainParent = lastPhase
          }
          lastPhase = phase
          createUiObjectFromNode(phase, takeProfit, thisChainParent, positionOffset)
        }
        return
      }
      case 'Open Execution':
        {
          createUiObject(false, 'Open Execution', node.name, node, parentNode, chainParent, 'Open Execution', positionOffset)
          return
        }
      case 'Close Execution':
        {
          createUiObject(false, 'Close Execution', node.name, node, parentNode, chainParent, 'Close Execution', positionOffset)
          return
        }
      case 'Initial Definition': {
        createUiObject(false, 'Initial Definition', node.name, node, parentNode, chainParent, 'Initial Definition', positionOffset)

        if (node.stopLoss !== undefined) {
          createUiObjectFromNode(node.stopLoss, node, node, positionOffset)
        }
        if (node.takeProfit !== undefined) {
          createUiObjectFromNode(node.takeProfit, node, node, positionOffset)
        }
        if (node.positionSize !== undefined) {
          createUiObjectFromNode(node.positionSize, node, node, positionOffset)
        }
        if (node.positionRate !== undefined) {
          createUiObjectFromNode(node.positionRate, node, node, positionOffset)
        }
        return
      }
      case 'Take Position Event': {
        let event = node
        createUiObject(false, 'Take Position Event', event.name, event, parentNode, chainParent, 'Take Position Event', positionOffset)
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createUiObjectFromNode(situation, event, event, positionOffset)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node, positionOffset)
        }
        return
      }
      case 'Trigger On Event': {
        let event = node
        createUiObject(false, 'Trigger On Event', event.name, event, parentNode, chainParent, 'Trigger On Event', positionOffset)
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createUiObjectFromNode(situation, event, event, positionOffset)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node, positionOffset)
        }
        return
      }
      case 'Trigger Off Event': {
        let event = node
        createUiObject(false, 'Trigger Off Event', event.name, event, parentNode, chainParent, 'Trigger Off Event', positionOffset)
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createUiObjectFromNode(situation, event, event, positionOffset)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node, positionOffset)
        }
        return
      }
      case 'Position Size': {
        createUiObject(false, 'Position Size', node.name, node, parentNode, chainParent, 'Position Size', positionOffset)
        if (node.formula !== undefined) {
          createUiObjectFromNode(node.formula, node, node, positionOffset)
        }
        return
      }
      case 'Position Rate': {
        createUiObject(false, 'Position Rate', node.name, node, parentNode, chainParent, 'Position Rate', positionOffset)
        if (node.formula !== undefined) {
          createUiObjectFromNode(node.formula, node, node, positionOffset)
        }
        return
      }
      case 'Trigger Stage': {
        let stage = node
        createUiObject(false, 'Trigger Stage', stage.name, stage, parentNode, chainParent, 'Trigger Stage', positionOffset)

        if (node.triggerOn !== undefined) {
          createUiObjectFromNode(node.triggerOn, stage, stage, positionOffset)
        }
        if (node.triggerOff !== undefined) {
          createUiObjectFromNode(node.triggerOff, stage, stage, positionOffset)
        }
        if (node.takePosition !== undefined) {
          createUiObjectFromNode(node.takePosition, stage, stage, positionOffset)
        }
        return
      }
      case 'Open Stage': {
        let stage = node
        createUiObject(false, 'Open Stage', stage.name, stage, parentNode, chainParent, 'Open Stage', positionOffset)

        if (node.initialDefinition !== undefined) {
          createUiObjectFromNode(node.initialDefinition, stage, stage, positionOffset)
        }
        if (node.openExecution !== undefined) {
          createUiObjectFromNode(node.openExecution, stage, stage, positionOffset)
        }
        return
      }
      case 'Manage Stage': {
        let stage = node
        createUiObject(false, 'Manage Stage', stage.name, stage, parentNode, chainParent, 'Manage Stage', positionOffset)

        if (node.stopLoss !== undefined) {
          createUiObjectFromNode(node.stopLoss, stage, stage, positionOffset)
        }
        if (node.takeProfit !== undefined) {
          createUiObjectFromNode(node.takeProfit, stage, stage, positionOffset)
        }
        return
      }
      case 'Close Stage': {
        let stage = node
        createUiObject(false, 'Close Stage', stage.name, stage, parentNode, chainParent, 'Close Stage', positionOffset)

        if (node.closeExecution !== undefined) {
          createUiObjectFromNode(node.closeExecution, stage, stage, positionOffset)
        }
        return
      }
      case 'Strategy': {
        let strategy = node
        createUiObject(false, 'Strategy', strategy.name, strategy, parentNode, chainParent, 'Strategy', positionOffset)
        if (node.triggerStage !== undefined) {
          createUiObjectFromNode(node.triggerStage, strategy, strategy, positionOffset)
        }
        if (node.openStage !== undefined) {
          createUiObjectFromNode(node.openStage, strategy, strategy, positionOffset)
        }
        if (node.manageStage !== undefined) {
          createUiObjectFromNode(node.manageStage, strategy, strategy, positionOffset)
        }
        if (node.closeStage !== undefined) {
          createUiObjectFromNode(node.closeStage, strategy, strategy, positionOffset)
        }
        return
      }
      case 'Base Asset': {
        createUiObject(false, 'Base Asset', node.name, node, parentNode, chainParent, 'Base Asset', positionOffset)
        return
      }
      case 'Time Range': {
        createUiObject(false, 'Time Range', node.name, node, parentNode, chainParent, 'Time Range', positionOffset)
        return
      }
      case 'Time Period': {
        createUiObject(false, 'Time Period', node.name, node, parentNode, chainParent, 'Time Period', positionOffset)
        return
      }
      case 'Slippage': {
        createUiObject(false, 'Slippage', node.name, node, parentNode, chainParent, 'Slippage', positionOffset)
        return
      }
      case 'Fee Structure': {
        createUiObject(false, 'Fee Structure', node.name, node, parentNode, chainParent, 'Fee Structure', positionOffset)
        return
      }
      case 'Parameters': {
        createUiObject(false, 'Parameters', node.name, node, parentNode, chainParent, 'Parameters', positionOffset)
        if (node.baseAsset !== undefined) {
          createUiObjectFromNode(node.baseAsset, node, node, positionOffset)
        }
        if (node.timeRange !== undefined) {
          createUiObjectFromNode(node.timeRange, node, node, positionOffset)
        }
        if (node.timePeriod !== undefined) {
          createUiObjectFromNode(node.timePeriod, node, node, positionOffset)
        }
        if (node.slippage !== undefined) {
          createUiObjectFromNode(node.slippage, node, node, positionOffset)
        }
        if (node.feeStructure !== undefined) {
          createUiObjectFromNode(node.feeStructure, node, node, positionOffset)
        }
        if (node.key !== undefined) {
          createUiObjectFromNode(node.key, node, node, positionOffset)
        }
        return
      }
      case 'Trading System': {
        let tradingSystem = node
        createUiObject(false, 'Trading System', tradingSystem.name, tradingSystem, parentNode, chainParent, 'Trading System', positionOffset)
        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = node.strategies[m]
          createUiObjectFromNode(strategy, tradingSystem, tradingSystem, positionOffset)
        }
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node, positionOffset)
        }
        return
      }
      case 'Personal Data': {
        createUiObject(false, 'Personal Data', node.name, node, parentNode, chainParent, 'Personal Data', positionOffset)
        for (let m = 0; m < node.exchangeAccounts.length; m++) {
          let exchangeAccount = node.exchangeAccounts[m]
          createUiObjectFromNode(exchangeAccount, node, node, positionOffset)
        }
        return
      }
      case 'Exchange Account': {
        createUiObject(false, 'Exchange Account', node.name, node, parentNode, chainParent, 'Exchange Account', positionOffset)
        for (let m = 0; m < node.assets.length; m++) {
          let asset = node.assets[m]
          createUiObjectFromNode(asset, node, node, positionOffset)
        }
        for (let m = 0; m < node.keys.length; m++) {
          let key = node.keys[m]
          createUiObjectFromNode(key, node, node, positionOffset)
        }
        return
      }
      case 'Exchange Account Asset': {
        createUiObject(false, 'Exchange Account Asset', node.name, node, parentNode, chainParent, 'Exchange Account Asset', positionOffset)
        return
      }
      case 'Exchange Account Key': {
        createUiObject(false, 'Exchange Account Key', node.name, node, parentNode, chainParent, 'Exchange Account Key', positionOffset)
        return
      }
      case 'Definition': {
        let referenceChildren
        if (mapOfReferenceParents !== undefined) {
          if (node.savedPayload.referenceChildren !== undefined) {
            referenceChildren = []
            mapOfReferenceParents.set(node.id, node)
            referenceChildren = node.savedPayload.referenceChildren
          }
        }
        createUiObject(false, 'Definition', node.name, node, parentNode, chainParent, 'Definition', positionOffset)
        if (node.tradingSystem !== undefined) {
          createUiObjectFromNode(node.tradingSystem, node, node, positionOffset)
        }
        if (node.personalData !== undefined) {
          createUiObjectFromNode(node.personalData, node, node, positionOffset)
        }
        if (node.referenceChildren === undefined) {
          node.referenceChildren = []
        }
        if (referenceChildren !== undefined) {
          node.savedPayload = {
            referenceChildren: referenceChildren
          }
        } else {
          node.referenceChildren = []
        }
        return
      }
      case 'Network': {
        createUiObject(false, 'Network', node.name, node, parentNode, chainParent, 'Network', positionOffset)
        if (node.networkNodes !== undefined) {
          for (let m = 0; m < node.networkNodes.length; m++) {
            let networkNode = node.networkNodes[m]
            createUiObjectFromNode(networkNode, node, node, positionOffset)
          }
        }
        return
      }
      case 'Network Node': {
        createUiObject(false, 'Network Node', node.name, node, parentNode, chainParent, 'Network Node', positionOffset)
        if (node.taskManagers !== undefined) {
          for (let m = 0; m < node.taskManagers.length; m++) {
            let taskManager = node.taskManagers[m]
            createUiObjectFromNode(taskManager, node, node, positionOffset)
          }
        }
        return
      }
      case 'Social Bots': {
        createUiObject(false, 'Social Bots', node.name, node, parentNode, chainParent, 'Social Bots', positionOffset)
        for (let m = 0; m < node.bots.length; m++) {
          let bot = node.bots[m]
          createUiObjectFromNode(bot, node, node, positionOffset)
        }
        return
      }
      case 'Telegram Bot': {
        createUiObject(false, 'Telegram Bot', node.name, node, parentNode, chainParent, 'Telegram Bot', positionOffset)
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node, positionOffset)
        }
        return
      }
      case 'Announcement': {
        createUiObject(false, 'Announcement', node.name, node, parentNode, chainParent, 'Announcement', positionOffset)
        if (node.formula !== undefined) {
          createUiObjectFromNode(node.formula, node, node, positionOffset)
        }
        return
      }
      case 'Layer Manager': {
        createUiObject(false, 'Layer Manager', node.name, node, parentNode, chainParent, 'Layer Manager', positionOffset)
        for (let m = 0; m < node.layers.length; m++) {
          let layer = node.layers[m]
          createUiObjectFromNode(layer, node, node, positionOffset)
        }
        return
      }
      case 'Layer': {
        createUiObject(false, 'Layer', node.name, node, parentNode, chainParent, 'Layer', positionOffset)
        return
      }
      case 'Task Manager': {
        createUiObject(false, 'Task Manager', node.name, node, parentNode, chainParent, 'Task Manager', positionOffset)
        for (let m = 0; m < node.tasks.length; m++) {
          let task = node.tasks[m]
          createUiObjectFromNode(task, node, node, positionOffset)
        }
        return
      }
      case 'Task': {
        createUiObject(false, 'Task', node.name, node, parentNode, chainParent, 'Task', positionOffset)
        if (node.bot !== undefined) {
          createUiObjectFromNode(node.bot, node, node, positionOffset)
        }
        return
      }
      case 'Sensor Bot Instance': {
        createUiObject(false, 'Sensor Bot Instance', node.name, node, parentNode, chainParent, 'Sensor Bot Instance', positionOffset)
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createUiObjectFromNode(process, node, node, positionOffset)
        }
        return
      }
      case 'Indicator Bot Instance': {
        createUiObject(false, 'Indicator Bot Instance', node.name, node, parentNode, chainParent, 'Indicator Bot Instance', positionOffset)
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createUiObjectFromNode(process, node, node, positionOffset)
        }
        return
      }
      case 'Trading Bot Instance': {
        createUiObject(false, 'Trading Bot Instance', node.name, node, parentNode, chainParent, 'Trading Bot Instance', positionOffset)
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createUiObjectFromNode(process, node, node, positionOffset)
        }
        return
      }
      case 'Process Instance': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        if (parentNode !== undefined) {
          switch (parentNode.type) {
            case 'Sensor Bot Instance': {
              node.subType = 'Sensor Process Instance'
              break
            }
            case 'Indicator Bot Instance': {
              node.subType = 'Indicator Process Instance'
              break
            }
            case 'Trading Bot Instance': {
              node.subType = 'Trading Process Instance'
              break
            }
          }
        }
        createUiObject(false, 'Process Instance', node.name, node, parentNode, chainParent, 'Process Instance', positionOffset)
        if (node.session !== undefined) {
          createUiObjectFromNode(node.session, node, node, positionOffset)
        }
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }
      case 'Backtesting Session': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        createUiObject(false, 'Backtesting Session', node.name, node, parentNode, chainParent, 'Backtesting Session', positionOffset)
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node, positionOffset)
        }
        if (node.layerManager !== undefined) {
          createUiObjectFromNode(node.layerManager, node, node, positionOffset)
        }
        if (node.socialBots !== undefined) {
          createUiObjectFromNode(node.socialBots, node, node, positionOffset)
        }
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }
      case 'Live Trading Session': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        createUiObject(false, 'Live Trading Session', node.name, node, parentNode, chainParent, 'Live Trading Session', positionOffset)
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node, positionOffset)
        }
        if (node.layerManager !== undefined) {
          createUiObjectFromNode(node.layerManager, node, node, positionOffset)
        }
        if (node.socialBots !== undefined) {
          createUiObjectFromNode(node.socialBots, node, node, positionOffset)
        }
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }
      case 'Fordward Testing Session': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        createUiObject(false, 'Fordward Testing Session', node.name, node, parentNode, chainParent, 'Fordward Testing Session', positionOffset)
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node, positionOffset)
        }
        if (node.layerManager !== undefined) {
          createUiObjectFromNode(node.layerManager, node, node, positionOffset)
        }
        if (node.socialBots !== undefined) {
          createUiObjectFromNode(node.socialBots, node, node, positionOffset)
        }
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }
      case 'Paper Trading Session': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        createUiObject(false, 'Paper Trading Session', node.name, node, parentNode, chainParent, 'Paper Trading Session', positionOffset)
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node, positionOffset)
        }
        if (node.layerManager !== undefined) {
          createUiObjectFromNode(node.layerManager, node, node, positionOffset)
        }
        if (node.socialBots !== undefined) {
          createUiObjectFromNode(node.socialBots, node, node, positionOffset)
        }
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }

      case 'Team': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        for (let m = 0; m < node.sensorBots.length; m++) {
          let sensorBot = node.sensorBots[m]
          createUiObjectFromNode(sensorBot, node, node, positionOffset)
        }
        for (let m = 0; m < node.indicatorBots.length; m++) {
          let indicatorBot = node.indicatorBots[m]
          createUiObjectFromNode(indicatorBot, node, node, positionOffset)
        }
        for (let m = 0; m < node.tradingBots.length; m++) {
          let tradingBot = node.tradingBots[m]
          createUiObjectFromNode(tradingBot, node, node, positionOffset)
        }
        for (let m = 0; m < node.plotters.length; m++) {
          let plotter = node.plotters[m]
          createUiObjectFromNode(plotter, node, node, positionOffset)
        }
        return
      }
      case 'Sensor Bot': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createUiObjectFromNode(process, node, node, positionOffset)
        }
        for (let m = 0; m < node.products.length; m++) {
          let product = node.products[m]
          createUiObjectFromNode(product, node, node, positionOffset)
        }
        return
      }
      case 'Indicator Bot': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createUiObjectFromNode(process, node, node, positionOffset)
        }
        for (let m = 0; m < node.products.length; m++) {
          let product = node.products[m]
          createUiObjectFromNode(product, node, node, positionOffset)
        }
        return
      }
      case 'Trading Bot': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createUiObjectFromNode(process, node, node, positionOffset)
        }
        for (let m = 0; m < node.products.length; m++) {
          let product = node.products[m]
          createUiObjectFromNode(product, node, node, positionOffset)
        }
        return
      }
      case 'Process Definition': {
        let referenceChildren
        if (mapOfReferenceParents !== undefined) {
          if (node.savedPayload.referenceChildren !== undefined) {
            referenceChildren = []
            mapOfReferenceParents.set(node.id, node)
            referenceChildren = node.savedPayload.referenceChildren
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (node.processOutput !== undefined) {
          createUiObjectFromNode(node.processOutput, node, node, positionOffset)
        }
        if (node.processDependencies !== undefined) {
          createUiObjectFromNode(node.processDependencies, node, node, positionOffset)
        }
        if (node.statusReport !== undefined) {
          createUiObjectFromNode(node.statusReport, node, node, positionOffset)
        }
        if (node.executionStartedEvent !== undefined) {
          createUiObjectFromNode(node.executionStartedEvent, node, node, positionOffset)
        }
        if (node.executionFinishedEvent !== undefined) {
          createUiObjectFromNode(node.executionFinishedEvent, node, node, positionOffset)
        }
        if (referenceChildren !== undefined) {
          node.savedPayload = {
            referenceChildren: referenceChildren
          }
        } else {
          node.referenceChildren = []
        }
        return
      }
      case 'Process Output': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        for (let m = 0; m < node.outputDatasets.length; m++) {
          let outputDataset = node.outputDatasets[m]
          createUiObjectFromNode(outputDataset, node, node, positionOffset)
        }
        return
      }
      case 'Process Dependencies': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        for (let m = 0; m < node.statusDependencies.length; m++) {
          let statusDependency = node.statusDependencies[m]
          createUiObjectFromNode(statusDependency, node, node, positionOffset)
        }
        for (let m = 0; m < node.dataDependencies.length; m++) {
          let dataDependency = node.dataDependencies[m]
          createUiObjectFromNode(dataDependency, node, node, positionOffset)
        }
        return
      }
      case 'Status Report': {
        let referenceChildren
        if (mapOfReferenceParents !== undefined) {
          if (node.savedPayload.referenceChildren !== undefined) {
            referenceChildren = []
            mapOfReferenceParents.set(node.id, node)
            referenceChildren = node.savedPayload.referenceChildren
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (referenceChildren !== undefined) {
          node.savedPayload = {
            referenceChildren: referenceChildren
          }
        } else {
          node.referenceChildren = []
        }
        return
      }
      case 'Execution Started Event': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }
      case 'Execution Finished Event': {
        let referenceChildren
        if (mapOfReferenceParents !== undefined) {
          if (node.savedPayload.referenceChildren !== undefined) {
            referenceChildren = []
            mapOfReferenceParents.set(node.id, node)
            referenceChildren = node.savedPayload.referenceChildren
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (referenceChildren !== undefined) {
          node.savedPayload = {
            referenceChildren: referenceChildren
          }
        } else {
          node.referenceChildren = []
        }
        return
      }
      case 'Calculations Procedure': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (node.initialization !== undefined) {
          createUiObjectFromNode(node.initialization, node, node, positionOffset)
        }
        if (node.loop !== undefined) {
          createUiObjectFromNode(node.loop, node, node, positionOffset)
        }
        return
      }
      case 'Data Building Procedure': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (node.initialization !== undefined) {
          createUiObjectFromNode(node.initialization, node, node, positionOffset)
        }
        if (node.loop !== undefined) {
          createUiObjectFromNode(node.loop, node, node, positionOffset)
        }
        return
      }
      case 'Procedure Initialization': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (node.code !== undefined) {
          createUiObjectFromNode(node.code, node, node, positionOffset)
        }
        return
      }
      case 'Procedure Loop': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (node.code !== undefined) {
          createUiObjectFromNode(node.code, node, node, positionOffset)
        }
        return
      }
      case 'Output Dataset': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }
      case 'Status Dependency': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }
      case 'Data Dependency': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }
      case 'Product Definition': {
        let referenceParent
        if (mapOfReferenceChildren !== undefined) {
          if (node.savedPayload.referenceParent !== undefined) {
            if (node.savedPayload.referenceParent.id !== undefined) {
              mapOfReferenceChildren.set(node.id, node)
              referenceParent = node.savedPayload.referenceParent
            }
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (node.record !== undefined) {
          createUiObjectFromNode(node.record, node, node, positionOffset)
        }
        for (let m = 0; m < node.datasets.length; m++) {
          let dataset = node.datasets[m]
          createUiObjectFromNode(dataset, node, node, positionOffset)
        }
        if (node.calculations !== undefined) {
          createUiObjectFromNode(node.calculations, node, node, positionOffset)
        }
        if (node.dataBuilding !== undefined) {
          createUiObjectFromNode(node.dataBuilding, node, node, positionOffset)
        }
        if (referenceParent !== undefined) {
          node.savedPayload = {
            referenceParent: referenceParent
          }
        }
        return
      }
      case 'Record Definition': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        for (let m = 0; m < node.properties.length; m++) {
          let property = node.properties[m]
          createUiObjectFromNode(property, node, node, positionOffset)
        }
        return
      }
      case 'Record Property': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (node.formula !== undefined) {
          createUiObjectFromNode(node.formula, node, node, positionOffset)
        }
        return
      }
      case 'Dataset Definition': {
        let referenceChildren
        if (mapOfReferenceParents !== undefined) {
          if (node.savedPayload.referenceChildren !== undefined) {
            referenceChildren = []
            mapOfReferenceParents.set(node.id, node)
            referenceChildren = node.savedPayload.referenceChildren
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (referenceChildren !== undefined) {
          node.savedPayload = {
            referenceChildren: referenceChildren
          }
        } else {
          node.referenceChildren = []
        }
        return
      }
      case 'Plotter': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        for (let m = 0; m < node.modules.length; m++) {
          let module = node.modules[m]
          createUiObjectFromNode(module, node, node, positionOffset)
        }
        return
      }
      case 'Plotter Module': {
        let referenceChildren
        if (mapOfReferenceParents !== undefined) {
          if (node.savedPayload.referenceChildren !== undefined) {
            referenceChildren = []
            mapOfReferenceParents.set(node.id, node)
            referenceChildren = node.savedPayload.referenceChildren
          }
        }
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (node.code !== undefined) {
          createUiObjectFromNode(node.code, node, node, positionOffset)
        }
        for (let m = 0; m < node.panels.length; m++) {
          let panel = node.panels[m]
          createUiObjectFromNode(panel, node, node, positionOffset)
        }
        if (referenceChildren !== undefined) {
          node.savedPayload = {
            referenceChildren: referenceChildren
          }
        } else {
          node.referenceChildren = []
        }
        return
      }
      case 'Plotter Panel': {
        createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)
        if (node.code !== undefined) {
          createUiObjectFromNode(node.code, node, node, positionOffset)
        }
        return
      }
    }
  }

  function addTeam (node) {
    let team = {
      name: 'New Team',
      type: 'Team',
      code: '{}',
      sensorBots: [],
      indicatorBots: [],
      tradingBots: [],
      plotters: []
    }
    node.rootNodes.push(team)
    createUiObject(true, team.type, team.name, team, undefined, undefined)
    return team
  }

  function addSensorBot (node) {
    let object = {
      type: 'Sensor Bot',
      name: 'New Sensor Bot',
      code: '{}',
      processes: [],
      products: []
    }
    if (node.sensorBots === undefined) {
      node.sensorBots = []
    }
    node.sensorBots.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addIndicatorBot (node) {
    let object = {
      type: 'Indicator Bot',
      name: 'New Indicator Bot',
      code: '{}',
      processes: [],
      products: []
    }
    if (node.indicatorBots === undefined) {
      node.indicatorBots = []
    }
    node.indicatorBots.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addTradingBot (node) {
    let object = {
      type: 'Trading Bot',
      name: 'New Trading Bot',
      code: '{}',
      processes: [],
      products: []
    }
    if (node.tradingBots === undefined) {
      node.tradingBots = []
    }
    node.tradingBots.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addProcessDefinition (node) {
    let object = {
      type: 'Process Definition',
      name: 'New Process Definition',
      code: '{}',
      referenceChildren: []
    }
    if (node.processes === undefined) {
      node.processes = []
    }
    node.processes.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addMissingProcessDefinitionItems (node) {
    addProcessOutput(node)
    addProcessDependencies(node)
    addStatusReport(node)
    addExecutionStartedEvent(node)
    addExecutionFinishedEvent(node)
  }

  function addMissingProductDefinitionItems (node) {
    addCalculationsProcedure(node)
    addDataBuildingProcedure(node)
  }

  function addProcessOutput (node) {
    if (node.processOutput === undefined) {
      node.processOutput = {
        type: 'Process Output',
        name: 'New Process Output',
        outputDatasets: []
      }
      createUiObject(true, node.processOutput.type, node.processOutput.name, node.processOutput, node, node)
    }
    return node.processOutput
  }

  function addProcessDependencies (node) {
    if (node.processDependencies === undefined) {
      node.processDependencies = {
        type: 'Process Dependencies',
        name: 'New Process Dependencies',
        statusDependencies: [],
        dataDependencies: []
      }
      createUiObject(true, node.processDependencies.type, node.processDependencies.name, node.processDependencies, node, node)
    }
    return node.processDependencies
  }

  function addStatusReport (node) {
    if (node.statusReport === undefined) {
      node.statusReport = {
        type: 'Status Report',
        name: 'New Status Report',
        referenceChildren: []
      }
      createUiObject(true, node.statusReport.type, node.statusReport.name, node.statusReport, node, node)
    }
    return node.statusReport
  }

  function addExecutionStartedEvent (node) {
    if (node.executionStartedEvent === undefined) {
      node.executionStartedEvent = {
        type: 'Execution Started Event',
        name: 'New Execution Started Event'
      }
      createUiObject(true, node.executionStartedEvent.type, node.executionStartedEvent.name, node.executionStartedEvent, node, node)
    }
    return node.executionStartedEvent
  }

  function addExecutionFinishedEvent (node) {
    if (node.executionFinishedEvent === undefined) {
      node.executionFinishedEvent = {
        type: 'Execution Finished Event',
        name: 'New Execution Finished Event',
        referenceChildren: []
      }
      createUiObject(true, node.executionFinishedEvent.type, node.executionFinishedEvent.name, node.executionFinishedEvent, node, node)
    }
    return node.executionFinishedEvent
  }

  function addCalculationsProcedure (node) {
    if (node.calculations === undefined) {
      node.calculations = {
        type: 'Calculations Procedure',
        name: 'New Calculations Procedure'
      }
      createUiObject(true, node.calculations.type, node.calculations.name, node.calculations, node, node)
    }
    return node.calculations
  }

  function addDataBuildingProcedure (node) {
    if (node.dataBuilding === undefined) {
      node.dataBuilding = {
        type: 'Data Building Procedure',
        name: 'New Data Building Procedure'
      }
      createUiObject(true, node.dataBuilding.type, node.dataBuilding.name, node.dataBuilding, node, node)
    }
    return node.dataBuilding
  }

  function addProcedureInitialization (node) {
    if (node.initialization === undefined) {
      node.initialization = {
        type: 'Procedure Initialization',
        name: 'New Procedure Initialization'
      }
      createUiObject(true, node.initialization.type, node.initialization.name, node.initialization, node, node)
    }
    return node.initialization
  }

  function addProcedureLoop (node) {
    if (node.loop === undefined) {
      node.loop = {
        type: 'Procedure Loop',
        name: 'New Procedure Loop'
      }
      createUiObject(true, node.loop.type, node.loop.name, node.loop, node, node)
    }
    return node.loop
  }

  function addOutputDataset (node) {
    let object = {
      type: 'Output Dataset',
      name: 'New Output Dataset'
    }
    if (node.outputDatasets === undefined) {
      node.outputDatasets = []
    }
    node.outputDatasets.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addStatusDependency (node) {
    let object = {
      type: 'Status Dependency',
      name: 'New Status Dependency',
      code: '{ \n\"mainUtility\": \"Self Reference|Market Starting Point|Market Ending Point.\"\n}'
    }
    if (node.statusDependencies === undefined) {
      node.statusDependencies = []
    }
    node.statusDependencies.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addDataDependency (node) {
    let object = {
      type: 'Data Dependency',
      name: 'New Data Dependency'
    }
    if (node.dataDependencies === undefined) {
      node.dataDependencies = []
    }
    node.dataDependencies.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addProductDefinition (node) {
    let object = {
      type: 'Product Definition',
      name: 'New Product Definition',
      code: '{}',
      datasets: []
    }
    if (node.products === undefined) {
      node.products = []
    }
    node.products.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addRecordDefinition (node) {
    if (node.record === undefined) {
      node.record = {
        type: 'Record Definition',
        name: 'New Record Definition',
        properties: []
      }
      createUiObject(true, node.record.type, node.record.name, node.record, node, node)
    }
    return node.record
  }

  function addRecordProperty (node) {
    let object = {
      type: 'Record Property',
      name: 'New Record Property',
      code: '{}',
      formula: {
        code: DEFAULT_FORMULA_TEXT
      }
    }
    if (node.properties === undefined) {
      node.properties = []
    }
    node.properties.push(object)
    createUiObject(true, object.type, object.name, object, node, node)
    createUiObject(true, 'Formula', '', object.formula, object, object)

    return object
  }

  function addDatasetDefinition (node) {
    let object = {
      type: 'Dataset Definition',
      name: 'New Dataset Definition',
      code: '{}',
      referenceChildren: []
    }
    if (node.datasets === undefined) {
      node.datasets = []
    }
    node.datasets.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addPlotter (node) {
    let object = {
      type: 'Plotter',
      name: 'New Plotter',
      modules: []
    }
    if (node.plotters === undefined) {
      node.plotters = []
    }
    node.plotters.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addPlotterModule (node) {
    let object = {
      type: 'Plotter Module',
      name: 'New Plotter Module',
      panels: []
    }
    if (node.modules === undefined) {
      node.modules = []
    }
    node.modules.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addPlotterPanel (node) {
    let object = {
      type: 'Plotter Panel',
      name: 'New Plotter Panel'
    }
    if (node.panels === undefined) {
      node.panels = []
    }
    node.panels.push(object)
    createUiObject(true, object.type, object.name, object, node, node)

    return object
  }

  function addNetwork (node) {
    let network = {
      name: 'Superalgos'
    }
    node.rootNodes.push(network)
    createUiObject(true, 'Network', network.name, network, node, undefined, 'Network')

    return network
  }

  function addNetworkNode (node) {
    let networkNode = {
      name: 'New Network Node'
    }
    if (node.networkNodes === undefined) {
      node.networkNodes = []
    }
    node.networkNodes.push(networkNode)
    createUiObject(true, 'Network Node', networkNode.name, networkNode, node, node, 'Network Node')

    return networkNode
  }

  function addSocialBots (node) {
    if (node.socialBots === undefined) {
      node.socialBots = {
        name: 'New Social Bots',
        bots: []
      }
      createUiObject(true, 'Social Bots', node.socialBots.name, node.socialBots, node, node, 'Social Bots')
    }

    return node.socialBots
  }

  function addTelegramBot (node) {
    let bot = {
      name: 'New Telegram Bot',
      code: '{ \n\"botToken\": \"Paste here the bot token obtained from Telegram Bot Father\",\n\"chatId\": \"Write here the chat or group id where the announcements are going to be sent to, as it is a number with no quotes please.\"\n}',
      announcements: []
    }
    node.bots.push(bot)
    createUiObject(true, 'Telegram Bot', bot.name, bot, node, node, 'Telegram Bot')

    return bot
  }

  function addAnnouncement (node) {
    let announcement = {
      name: 'Announcement via ' + node.type,
      code: '{ \n\"text\": \"Write here what you want to announce.\",\n\"botType\": \"' + node.type + '\",\n\"botId\": \"' + node.id + '\"\n}'
    }
    node.announcements.push(announcement)
    createUiObject(true, 'Announcement', announcement.name, announcement, node, node, 'Announcement')

    return announcement
  }

  function addLayerManager (node) {
    if (node.layerManager === undefined) {
      node.layerManager = {
        name: 'New Layer Manager',
        layers: []
      }
      createUiObject(true, 'Layer Manager', node.layerManager.name, node.layerManager, node, node, 'Layer Manager')
    }

    return node.layerManager
  }

  function addLayer (node) {
    let layer = {
      name: 'New Layer',
      code: '{ \n\"product\": \"Type here the codeName of the Product\"\n}'
    }
    node.layers.push(layer)
    createUiObject(true, 'Layer', layer.name, layer, node, node, 'Layer')

    return layer
  }

  function addTaskManager (node) {
    let taskManager = {
      name: 'New Task Manager',
      tasks: []
    }
    if (node.taskManagers === undefined) {
      node.taskManagers = []
    }
    node.taskManagers.push(taskManager)
    createUiObject(true, 'Task Manager', taskManager.name, taskManager, node, node, 'Task Manager')

    return taskManager
  }

  function addTask (node) {
    let task = {
      name: 'New Task'
    }
    node.tasks.push(task)
    createUiObject(true, 'Task', task.name, task, node, node, 'Task')

    return task
  }

  function addSensorBotInstance (node) {
    if (node.bot === undefined) {
      node.bot = {
        processes: [],
        code: '{}'
      }
      createUiObject(true, 'Sensor Bot Instance', '', node.bot, node, node)
    }
    return node.bot
  }

  function addIndicatorBotInstance (node) {
    if (node.bot === undefined) {
      node.bot = {
        processes: [],
        code: '{}'
      }
      createUiObject(true, 'Indicator Bot Instance', '', node.bot, node, node)
    }
    return node.bot
  }

  function addTradingBotInstance (node) {
    if (node.bot === undefined) {
      node.bot = {
        processes: [],
        code: '{}'
      }
      createUiObject(true, 'Trading Bot Instance', '', node.bot, node, node)
    }
    return node.bot
  }

  function addProcessInstance (node) {
    let process = {
      name: 'New Process Instance',
      code: '{}'
    }

    switch (node.type) {
      case 'Sensor Bot Instance': {
        process.subType = 'Sensor Process Instance'
        process.name = 'Sensor Process Instance'
        break
      }
      case 'Indicator Bot Instance': {
        process.subType = 'Indicator Process Instance'
        process.name = 'Indicator Process Instance'
        break
      }
      case 'Trading Bot Instance': {
        process.subType = 'Trading Process Instance'
        process.name = 'Trading Process Instance'
        break
      }
    }
    node.processes.push(process)
    createUiObject(true, 'Process Instance', process.name, process, node, node, 'Process Instance')

    return process
  }

  function addBacktestingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Backtesting Session',
        code: '{ \n\"folderName\": \"Type here the folder name where you want the logs of this process to be stored to.\"\n}'
      }
      createUiObject(true, 'Backtesting Session', '', node.session, node, node)
    }

    return node.session
  }

  function addLiveTradingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Live Trading Session',
        code: '{}'
      }
      createUiObject(true, 'Live Trading Session', '', node.session, node, node)
    }

    return node.session
  }

  function addFordwardTestingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Fordward Testing Session',
        code: '{ \n\"folderName\": \"Type here the folder name where you want the logs of this process to be stored to.\",\n\"balancePercentage\": \"Type here the the % of the balance to be used in this test.\"\n}'
      }
      createUiObject(true, 'Fordward Testing Session', '', node.session, node, node)
    }

    return node.session
  }

  function addPaperTradingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Paper Trading Session',
        code: '{ \n\"folderName\": \"Type here the folder name where you want the logs of this process to be stored to.\"\n}'
      }
      createUiObject(true, 'Paper Trading Session', '', node.session, node, node)
    }

    return node.session
  }

  function addDefinition (node) {
    let definition = {
      name: 'New Definition',
      referenceChildren: []
    }
    node.rootNodes.push(definition)
    createUiObject(true, 'Definition', definition.name, definition, node, undefined, 'Definition')

    return definition
  }

  function addTradingSystem (node) {
    if (node.tradingSystem === undefined) {
      node.tradingSystem = {
        strategies: []
      }
      createUiObject(true, 'Trading System', '', node.tradingSystem, node, node)
    }
    return node.tradingSystem
  }

  function addPersonalData (node) {
    if (node.personalData === undefined) {
      node.personalData = {
        exchangeAccounts: []
      }
      createUiObject(true, 'Personal Data', '', node.personalData, node, node)
    }

    return node.personalData
  }

  function addExchangeAccount (parentNode) {
    let personalData = parentNode
    let exchangeAccount = {
      name: 'New Account',
      assets: [],
      keys: []
    }
    personalData.exchangeAccounts.push(exchangeAccount)
    createUiObject(true, 'Exchange Account', exchangeAccount.name, exchangeAccount, personalData, personalData, 'Exchange Account')

    return exchangeAccount
  }

  function addExchangeAccountAsset (parentNode) {
    let exchangeAccount = parentNode
    let asset = {
      name: 'New Asset'
    }
    exchangeAccount.assets.push(asset)
    createUiObject(true, 'Exchange Account Asset', asset.name, asset, exchangeAccount, exchangeAccount, 'Account Asset')

    return asset
  }

  function addExchangeAccountKey (parentNode) {
    let exchangeAccount = parentNode
    let key = {
      name: 'New Key',
      code: 'Paste your exchange API secret key here and the put the key name as this key object title. Secret keys are filtered out and NOT exported when using the SHARE menu option on any object at your workspace. Secret keys ARE downloaded when using the download button.'
    }
    exchangeAccount.keys.push(key)
    createUiObject(true, 'Exchange Account Key', key.name, key, exchangeAccount, exchangeAccount, 'Account Key')

    return key
  }

  function addStrategy (parentNode) {
    let strategyParent = parentNode
    let strategy = {
      name: 'New Strategy',
      active: true,
      triggerStage: {
        triggerOn: {
          situations: []
        },
        triggerOff: {
          situations: []
        },
        takePosition: {
          situations: []
        },
        positionSize: {
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
      },
      openStage: {
        initialDefinition: {
          stopLoss: {
            phases: [],
            maxPhases: 1
          },
          takeProfit: {
            phases: [],
            maxPhases: 1
          }
        }
      },
      manageStage: {
        stopLoss: {
          phases: []
        },
        takeProfit: {
          phases: []
        }
      },
      closeStage: {
      }
    }

    strategyParent.strategies.push(strategy)
    createUiObject(true, 'Strategy', strategy.name, strategy, strategyParent, strategyParent, 'Strategy')
    createUiObject(true, 'Trigger Stage', '', strategy.triggerStage, strategy, strategy, 'Trigger Stage')
    createUiObject(true, 'Open Stage', '', strategy.openStage, strategy, strategy, 'Open Stage')
    createUiObject(true, 'Manage Stage', '', strategy.manageStage, strategy, strategy, 'Manage Stage')
    createUiObject(true, 'Close Stage', '', strategy.closeStage, strategy, strategy, 'Close Stage')
    createUiObject(true, 'Trigger On Event', '', strategy.triggerStage.triggerOn, strategy.triggerStage, strategy.triggerStage)
    createUiObject(true, 'Trigger Off Event', '', strategy.triggerStage.triggerOff, strategy.triggerStage, strategy.triggerStage)
    createUiObject(true, 'Take Position Event', '', strategy.triggerStage.takePosition, strategy.triggerStage, strategy.triggerStage)
    createUiObject(true, 'Initial Definition', '', strategy.openStage.initialDefinition, strategy.openStage, strategy.openStage)
    createUiObject(true, 'Position Size', '', strategy.openStage.initialDefinition.positionSize, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createUiObject(true, 'Position Rate', '', strategy.openStage.initialDefinition.positionRate, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createUiObject(true, 'Stop', '', strategy.manageStage.stopLoss, strategy.manageStage, strategy.manageStage)
    createUiObject(true, 'Take Profit', '', strategy.manageStage.takeProfit, strategy.manageStage, strategy.manageStage)
    createUiObject(true, 'Stop', 'Initial Stop', strategy.openStage.initialDefinition.stopLoss, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createUiObject(true, 'Take Profit', 'Initial Take Profit', strategy.openStage.initialDefinition.takeProfit, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createUiObject(true, 'Formula', '', strategy.triggerStage.positionSize.formula, strategy.triggerStage.positionSize, strategy.triggerStage.positionSize)

    return strategy
  }

  function addParameters (node) {
    if (node.parameters === undefined) {
      node.parameters = {
        name: 'Parameters'
      }
      createUiObject(true, 'Parameters', '', node.parameters, node, node)
      addMissingParameters(node.parameters)
    }

    return node.parameters
  }

  function addMissingParameters (node) {
    if (node.baseAsset === undefined) {
      node.baseAsset = {
        name: 'Base Asset',
        code: '{ \n\"name\": \"BTC\",\n"initialBalance\": 0.001,\n\"minimumBalance\": 0.0001,\n\"maximumBalance\": 0.1\n}'
      }
      createUiObject(true, 'Base Asset', '', node.baseAsset, node, node)
    }
    if (node.timeRange === undefined) {
      node.timeRange = {
        name: 'Time Range',
        code: '{ \n\"initialDatetime\": \"2019-07-01T00:00:00.000Z\",\n\"finalDatetime\": \"2019-09-01T00:00:00.000Z\"\n}'
      }
      createUiObject(true, 'Time Range', '', node.timeRange, node, node)
    }
    if (node.timePeriod === undefined) {
      node.timePeriod = {
        name: 'Time Period',
        code: '01-hs'
      }
      createUiObject(true, 'Time Period', '', node.timePeriod, node, node)
    }
    if (node.slippage === undefined) {
      node.slippage = {
        name: 'Slippage',
        code: '{ \n\"positionRate\": 0.1,\n"stopLoss\": 0.2,\n"takeProfit\": 0.3\n}'
      }
      createUiObject(true, 'Slippage', '', node.slippage, node, node)
    }
    if (node.feeStructure === undefined) {
      node.feeStructure = {
        name: 'Fee Structure',
        code: '{ \n\"maker\": 0.15,\n"taker\": 0.25\n}'
      }
      createUiObject(true, 'Fee Structure', '', node.feeStructure, node, node)
    }
  }

  function addMissingStages (node) {
    if (node.triggerStage === undefined) {
      node.triggerStage = {
        triggerOn: {
          situations: []
        },
        triggerOff: {
          situations: []
        },
        takePosition: {
          situations: []
        },
        positionSize: {
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
      }
      createUiObject(true, 'Trigger Stage', '', node.triggerStage, node, node, 'Trigger Stage')
      createUiObject(true, 'Trigger On Event', '', node.triggerStage.triggerOn, node.triggerStage, node.triggerStage)
      createUiObject(true, 'Trigger Off Event', '', node.triggerStage.triggerOff, node.triggerStage, node.triggerStage)
      createUiObject(true, 'Take Position Event', '', node.triggerStage.takePosition, node.triggerStage, node.triggerStage)
      createUiObject(true, 'Formula', '', node.triggerStage.positionSize.formula, node.triggerStage.positionSize, node.triggerStage.positionSize)
    }
    if (node.openStage === undefined) {
      node.openStage = {
        initialDefinition: {
          stopLoss: {
            phases: [],
            maxPhases: 1
          },
          takeProfit: {
            phases: [],
            maxPhases: 1
          }
        }
      }
      createUiObject(true, 'Open Stage', '', node.openStage, node, node, 'Open Stage')
      createUiObject(true, 'Initial Definition', '', node.openStage.initialDefinition, node.openStage, node.openStage)
      createUiObject(true, 'Stop', 'Initial Stop', node.openStage.initialDefinition.stopLoss, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createUiObject(true, 'Take Profit', 'Initial Take Profit', node.openStage.initialDefinition.takeProfit, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createUiObject(true, 'Position Size', 'Position Size', node.openStage.initialDefinition.positionSize, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createUiObject(true, 'Position Rate', 'Position Rate', node.openStage.initialDefinition.positionRate, node.openStage.initialDefinition, node.openStage.initialDefinition)
    }
    if (node.manageStage === undefined) {
      node.manageStage = {
        stopLoss: {
          phases: []
        },
        takeProfit: {
          phases: []
        }
      }
      createUiObject(true, 'Manage Stage', '', node.manageStage, node, node, 'Manage Stage')
      createUiObject(true, 'Stop', '', node.manageStage.stopLoss, node.manageStage, node.manageStage)
      createUiObject(true, 'Take Profit', '', node.manageStage.takeProfit, node.manageStage, node.manageStage)
    }
    if (node.closeStage === undefined) {
      node.closeStage = {
      }
      createUiObject(true, 'Close Stage', '', node.closeStage, node, node, 'Close Stage')
    }
  }

  function addMissingEvents (node) {
    if (node.triggerOn === undefined) {
      node.triggerOn = {
        situations: [],
        announcements: []
      }
      createUiObject(true, 'Trigger On Event', '', node.triggerOn, node, node)
    }
    if (node.triggerOff === undefined) {
      node.triggerOff = {
        situations: [],
        announcements: []
      }
      createUiObject(true, 'Trigger Off Event', '', node.triggerOff, node, node)
    }
    if (node.takePosition === undefined) {
      node.takePosition = {
        situations: [],
        announcements: []
      }
      createUiObject(true, 'Take Position Event', '', node.takePosition, node, node)
    }
  }

  function addMissingItems (node) {
    if (node.type === 'Initial Definition') {
      if (node.stopLoss === undefined) {
        node.stopLoss = {
          phases: [],
          maxPhases: 1
        }
        createUiObject(true, 'Stop', 'Initial Stop', node.stopLoss, node, node)
      }
      if (node.takeProfit === undefined) {
        node.takeProfit = {
          phases: [],
          maxPhases: 1
        }
        createUiObject(true, 'Take Profit', 'Initial Take Profit', node.takeProfit, node, node)
      }
      if (node.positionSize === undefined) {
        node.positionSize = {
          name: 'Position Size',
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
        createUiObject(true, 'Position Size', '', node.positionSize, node, node)
        createUiObject(true, 'Formula', '', node.positionSize.formula, node.positionSize, node.positionSize)
      }
      if (node.positionRate === undefined) {
        node.positionRate = {
          name: 'Position Rate',
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
        createUiObject(true, 'Position Rate', '', node.positionRate, node, node)
        createUiObject(true, 'Formula', '', node.positionRate.formula, node.positionRate, node.positionRate)
      }
    } else {
      if (node.stopLoss === undefined) {
        node.stopLoss = {
          phases: []
        }
        createUiObject(true, 'Stop', '', node.stopLoss, node, node)
      }
      if (node.takeProfit === undefined) {
        node.takeProfit = {
          phases: []
        }
        createUiObject(true, 'Take Profit', '', node.takeProfit, node, node)
      }
    }
  }

  function addInitialDefinition (node) {
    if (node.initialDefinition === undefined) {
      node.initialDefinition = {
        stopLoss: {
          phases: [],
          maxPhases: 1
        },
        takeProfit: {
          phases: [],
          maxPhases: 1
        }
      }
      createUiObject(true, 'Initial Definition', '', node.initialDefinition, node, node)
      createUiObject(true, 'Stop', 'Initial Stop', node.initialDefinition.stopLoss, node.initialDefinition, node.initialDefinition)
      createUiObject(true, 'Take Profit', 'Initial Take Profit', node.initialDefinition.takeProfit, node.initialDefinition, node.initialDefinition)
      createUiObject(true, 'Position Size', '', node.initialDefinition.positionSize, node.initialDefinition, node.initialDefinition)
      createUiObject(true, 'Formula', '', node.initialDefinition.positionSize.formula, node.initialDefinition.positionSize, node.initialDefinition.positionSize)
      createUiObject(true, 'Position Rate', '', node.initialDefinition.positionRate, node.initialDefinition, node.initialDefinition)
      createUiObject(true, 'Formula', '', node.initialDefinition.positionRate.formula, node.initialDefinition.positionRate, node.initialDefinition.positionRate)
    }

    return node.initialDefinition
  }

  function addOpenExecution (node) {
    if (node.openExecution === undefined) {
      node.openExecution = {}
      createUiObject(true, 'Open Execution', '', node.openExecution, node, node)
    }

    return node.openExecution
  }

  function addCloseExecution (node) {
    if (node.closeExecution === undefined) {
      node.closeExecution = {}
      createUiObject(true, 'Close Execution', '', node.closeExecution, node, node)
    }

    return node.closeExecution
  }

  function addFormula (node) {
    if (node.formula === undefined) {
      node.formula = {
        code: DEFAULT_FORMULA_TEXT
      }
      createUiObject(true, 'Formula', '', node.formula, node, node)
    }

    return node.formula
  }

  function addNextPhaseEvent (node) {
    if (node.nextPhaseEvent === undefined) {
      node.nextPhaseEvent = {
        situations: [],
        announcements: []
      }
      createUiObject(true, 'Next Phase Event', '', node.nextPhaseEvent, node, node)
    }

    return node.nextPhaseEvent
  }

  function addCode (node) {
    if (node.code === undefined) {
      node.code = {
        code: DEFAULT_CODE_TEXT
      }
      createUiObject(true, 'Code', '', node.code, node, node)
    }

    return node.code
  }

  function addPhase (parentNode) {
    if (parentNode.maxPhases !== undefined) {
      if (parentNode.phases.length >= parentNode.maxPhases) {
        return
      }
    }
    let phaseParent = parentNode
    let m = phaseParent.phases.length

    if (phaseParent.payload.parentNode !== undefined) {
      if (phaseParent.payload.parentNode.type === 'Initial Definition' && m > 0) { return }
    }

    let phase = {
      name: 'New Phase',
      announcements: [],
      formula: {
        code: DEFAULT_FORMULA_TEXT
      },
      nextPhaseEvent: {
        situations: []
      }
    }
    phaseParent.phases.push(phase)
    let phaseChainParent
    if (m > 0) {
      phaseChainParent = phaseParent.phases[m - 1]
    } else {
      phaseChainParent = phaseParent
    }
    createUiObject(true, 'Phase', phase.name, phase, phaseParent, phaseChainParent, 'Phase')
    createUiObject(true, 'Formula', '', phase.formula, phase, phase, 'Formula')
    createUiObject(true, 'Next Phase Event', '', phase.nextPhaseEvent, phase, phase)

    return phase
  }

  function addSituation (parentNode) {
    let m = parentNode.situations.length
    let situation = {
      name: 'New Situation',
      conditions: []
    }
    parentNode.situations.push(situation)
    createUiObject(true, 'Situation', situation.name, situation, parentNode, parentNode, 'Situation')

    return situation
  }

  function addCondition (parentNode) {
    let situation = parentNode
    let m = situation.conditions.length
    let condition = {
      name: 'New Condition',
      code: {
        code: DEFAULT_CODE_TEXT
      }
    }
    situation.conditions.push(condition)
    createUiObject(true, 'Condition', condition.name, condition, situation, situation, 'Condition')
    createUiObject(true, 'Code', '', condition.code, condition, condition, 'Code')

    return condition
  }

  function createUiObject (userAddingNew, uiObjectType, name, node, parentNode, chainParent, title, positionOffset) {
    let payload = {}

    if (name === '' || name === undefined) { name = 'My ' + uiObjectType }
    if (node.savedPayload !== undefined) {
      /* If there is a position offset, we apply it here. */
      if (positionOffset !== undefined) {
        node.savedPayload.targetPosition.x = node.savedPayload.targetPosition.x + positionOffset.x
        node.savedPayload.targetPosition.y = node.savedPayload.targetPosition.y + positionOffset.y
        node.savedPayload.position.x = node.savedPayload.position.x + positionOffset.x
        node.savedPayload.position.y = node.savedPayload.position.y + positionOffset.y
      }

      payload.targetPosition = {
        x: node.savedPayload.targetPosition.x,
        y: node.savedPayload.targetPosition.y
      }

      node.savedPayload.targetPosition = undefined

      if (payload.targetPosition.x === null) { payload.targetPosition.x = spawnPosition.x }
      if (payload.targetPosition.y === null) { payload.targetPosition.y = spawnPosition.y }
    } else {
      if (chainParent === undefined) {
        payload.targetPosition = {
          x: spawnPosition.x,
          y: spawnPosition.y
        }
        if (uiObjectType === 'Workspace' || uiObjectType === 'Trading System') {
          payload.position = {
            x: spawnPosition.x,
            y: spawnPosition.y
          }
        }
      } else {
        payload.targetPosition = {
          x: chainParent.payload.position.x,
          y: chainParent.payload.position.y
        }
      }
    }

    if (title !== undefined) {
      payload.subTitle = title
    } else {
      payload.subTitle = uiObjectType
    }

    payload.visible = true
    payload.title = name
    payload.node = node
    payload.parentNode = parentNode
    payload.chainParent = chainParent
    payload.onMenuItemClick = canvas.designerSpace.workspace.onMenuItemClick

    if (node.id === undefined) {
      node.id = newUniqueId()
    }
    node.payload = payload
    node.type = uiObjectType
    canvas.floatingSpace.uiObjectConstructor.createUiObject(userAddingNew, payload)
  }
}
