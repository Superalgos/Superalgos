function newUiObjectsFromNodes () {
  thisObject = {
    recreateWorkspace: recreateWorkspace,
    createUiObjectFromNode: createUiObjectFromNode,
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
    createUiObject('Workspace', workspace.name, workspace, undefined, undefined, 'Workspace')
    if (node.rootNodes !== undefined) {
      for (let i = 0; i < node.rootNodes.length; i++) {
        let rootNode = node.rootNodes[i]
        createUiObjectFromNode(rootNode, undefined, undefined)
      }
    }
    mapOfReferenceParents = undefined
    mapOfReferenceChildren = undefined
    return
  }

  function createUiObjectFromNode (node, parentNode, chainParent) {
    switch (node.type) {
      case 'Code':
        {
          createUiObject('Code', node.name, node, parentNode, chainParent, 'Code')
          return
        }
      case 'Condition':
        {
          createUiObject('Condition', node.name, node, parentNode, chainParent, 'Condition')
          if (node.code !== undefined) {
            createUiObjectFromNode(node.code, node, node)
          }
          return
        }
      case 'Situation': {
        let situation = node
        createUiObject('Situation', situation.name, situation, parentNode, chainParent, 'Situation')
        for (let m = 0; m < node.conditions.length; m++) {
          let condition = node.conditions[m]
          createUiObjectFromNode(condition, situation, situation)
        }
        return
      }
      case 'Formula':
        {
          createUiObject('Formula', node.name, node, parentNode, chainParent, 'Formula')
          return
        }
      case 'Next Phase Event':
        {
          createUiObject('Next Phase Event', node.name, node, parentNode, chainParent, 'Next Phase Event')
          for (let m = 0; m < node.situations.length; m++) {
            let situation = node.situations[m]
            createUiObjectFromNode(situation, node, node)
          }
          if (node.announcements === undefined) {
            node.announcements = []
          }
          for (let m = 0; m < node.announcements.length; m++) {
            let announcement = node.announcements[m]
            createUiObjectFromNode(announcement, node, node)
          }
          return
        }
      case 'Phase': {
        let phase = node
        createUiObject('Phase', phase.name, phase, parentNode, chainParent, phase.subType)

        if (node.formula !== undefined) {
          createUiObjectFromNode(node.formula, phase, phase)
        }
        if (node.nextPhaseEvent !== undefined) {
          createUiObjectFromNode(node.nextPhaseEvent, phase, phase)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node)
        }
        return
      }
      case 'Stop': {
        let lastPhase
        let stop = node
        createUiObject('Stop', stop.name, stop, parentNode, chainParent, 'Stop')
        for (let m = 0; m < node.phases.length; m++) {
          let phase = node.phases[m]
          let thisChainParent
          if (m === 0) {
            thisChainParent = node
          } else {
            thisChainParent = lastPhase
          }
          lastPhase = phase
          createUiObjectFromNode(phase, stop, thisChainParent)
        }
        return
      }
      case 'Take Profit': {
        let lastPhase
        let takeProfit = node
        createUiObject('Take Profit', takeProfit.name, takeProfit, parentNode, chainParent, 'Take Profit')
        for (let m = 0; m < node.phases.length; m++) {
          let phase = node.phases[m]
          let thisChainParent
          if (m === 0) {
            thisChainParent = node
          } else {
            thisChainParent = lastPhase
          }
          lastPhase = phase
          createUiObjectFromNode(phase, takeProfit, thisChainParent)
        }
        return
      }
      case 'Open Execution':
        {
          createUiObject('Open Execution', node.name, node, parentNode, chainParent, 'Open Execution')
          return
        }
      case 'Close Execution':
        {
          createUiObject('Close Execution', node.name, node, parentNode, chainParent, 'Close Execution')
          return
        }
      case 'Initial Definition': {
        createUiObject('Initial Definition', node.name, node, parentNode, chainParent, 'Initial Definition')

        if (node.stopLoss !== undefined) {
          createUiObjectFromNode(node.stopLoss, node, node)
        }
        if (node.takeProfit !== undefined) {
          createUiObjectFromNode(node.takeProfit, node, node)
        }
        if (node.positionSize !== undefined) {
          createUiObjectFromNode(node.positionSize, node, node)
        }
        if (node.positionRate !== undefined) {
          createUiObjectFromNode(node.positionRate, node, node)
        }
        return
      }
      case 'Take Position Event': {
        let event = node
        createUiObject('Take Position Event', event.name, event, parentNode, chainParent, 'Take Position Event')
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createUiObjectFromNode(situation, event, event)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node)
        }
        return
      }
      case 'Trigger On Event': {
        let event = node
        createUiObject('Trigger On Event', event.name, event, parentNode, chainParent, 'Trigger On Event')
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createUiObjectFromNode(situation, event, event)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node)
        }
        return
      }
      case 'Trigger Off Event': {
        let event = node
        createUiObject('Trigger Off Event', event.name, event, parentNode, chainParent, 'Trigger Off Event')
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createUiObjectFromNode(situation, event, event)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node)
        }
        return
      }
      case 'Position Size': {
        createUiObject('Position Size', node.name, node, parentNode, chainParent, 'Position Size')
        if (node.formula !== undefined) {
          createUiObjectFromNode(node.formula, node, node)
        }
        return
      }
      case 'Position Rate': {
        createUiObject('Position Rate', node.name, node, parentNode, chainParent, 'Position Rate')
        if (node.formula !== undefined) {
          createUiObjectFromNode(node.formula, node, node)
        }
        return
      }
      case 'Trigger Stage': {
        let stage = node
        createUiObject('Trigger Stage', stage.name, stage, parentNode, chainParent, 'Trigger Stage')

        if (node.triggerOn !== undefined) {
          createUiObjectFromNode(node.triggerOn, stage, stage)
        }
        if (node.triggerOff !== undefined) {
          createUiObjectFromNode(node.triggerOff, stage, stage)
        }
        if (node.takePosition !== undefined) {
          createUiObjectFromNode(node.takePosition, stage, stage)
        }
        return
      }
      case 'Open Stage': {
        let stage = node
        createUiObject('Open Stage', stage.name, stage, parentNode, chainParent, 'Open Stage')

        if (node.initialDefinition !== undefined) {
          createUiObjectFromNode(node.initialDefinition, stage, stage)
        }
        if (node.openExecution !== undefined) {
          createUiObjectFromNode(node.openExecution, stage, stage)
        }
        return
      }
      case 'Manage Stage': {
        let stage = node
        createUiObject('Manage Stage', stage.name, stage, parentNode, chainParent, 'Manage Stage')

        if (node.stopLoss !== undefined) {
          createUiObjectFromNode(node.stopLoss, stage, stage)
        }
        if (node.takeProfit !== undefined) {
          createUiObjectFromNode(node.takeProfit, stage, stage)
        }
        return
      }
      case 'Close Stage': {
        let stage = node
        createUiObject('Close Stage', stage.name, stage, parentNode, chainParent, 'Close Stage')

        if (node.closeExecution !== undefined) {
          createUiObjectFromNode(node.closeExecution, stage, stage)
        }
        return
      }
      case 'Strategy': {
        let strategy = node
        createUiObject('Strategy', strategy.name, strategy, parentNode, chainParent, 'Strategy')
        if (node.triggerStage !== undefined) {
          createUiObjectFromNode(node.triggerStage, strategy, strategy)
        }
        if (node.openStage !== undefined) {
          createUiObjectFromNode(node.openStage, strategy, strategy)
        }
        if (node.manageStage !== undefined) {
          createUiObjectFromNode(node.manageStage, strategy, strategy)
        }
        if (node.closeStage !== undefined) {
          createUiObjectFromNode(node.closeStage, strategy, strategy)
        }
        return
      }
      case 'Base Asset': {
        createUiObject('Base Asset', node.name, node, parentNode, chainParent, 'Base Asset')
        return
      }
      case 'Time Range': {
        createUiObject('Time Range', node.name, node, parentNode, chainParent, 'Time Range')
        return
      }
      case 'Time Period': {
        createUiObject('Time Period', node.name, node, parentNode, chainParent, 'Time Period')
        return
      }
      case 'Slippage': {
        createUiObject('Slippage', node.name, node, parentNode, chainParent, 'Slippage')
        return
      }
      case 'Fee Structure': {
        createUiObject('Fee Structure', node.name, node, parentNode, chainParent, 'Fee Structure')
        return
      }
      case 'Parameters': {
        createUiObject('Parameters', node.name, node, parentNode, chainParent, 'Parameters')
        if (node.baseAsset !== undefined) {
          createUiObjectFromNode(node.baseAsset, node, node)
        }
        if (node.timeRange !== undefined) {
          createUiObjectFromNode(node.timeRange, node, node)
        }
        if (node.timePeriod !== undefined) {
          createUiObjectFromNode(node.timePeriod, node, node)
        }
        if (node.slippage !== undefined) {
          createUiObjectFromNode(node.slippage, node, node)
        }
        if (node.feeStructure !== undefined) {
          createUiObjectFromNode(node.feeStructure, node, node)
        }
        if (node.key !== undefined) {
          createUiObjectFromNode(node.key, node, node)
        }
        return
      }
      case 'Trading System': {
        let tradingSystem = node
        createUiObject('Trading System', tradingSystem.name, tradingSystem, parentNode, chainParent, 'Trading System')
        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = node.strategies[m]
          createUiObjectFromNode(strategy, tradingSystem, tradingSystem)
        }
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node)
        }
        return
      }
      case 'Personal Data': {
        createUiObject('Personal Data', node.name, node, parentNode, chainParent, 'Personal Data')
        for (let m = 0; m < node.exchangeAccounts.length; m++) {
          let exchangeAccount = node.exchangeAccounts[m]
          createUiObjectFromNode(exchangeAccount, node, node)
        }
        return
      }
      case 'Exchange Account': {
        createUiObject('Exchange Account', node.name, node, parentNode, chainParent, 'Exchange Account')
        for (let m = 0; m < node.assets.length; m++) {
          let asset = node.assets[m]
          createUiObjectFromNode(asset, node, node)
        }
        for (let m = 0; m < node.keys.length; m++) {
          let key = node.keys[m]
          createUiObjectFromNode(key, node, node)
        }
        return
      }
      case 'Exchange Account Asset': {
        createUiObject('Exchange Account Asset', node.name, node, parentNode, chainParent, 'Exchange Account Asset')
        return
      }
      case 'Exchange Account Key': {
        createUiObject('Exchange Account Key', node.name, node, parentNode, chainParent, 'Exchange Account Key')
        return
      }
      case 'Definition': {
        createUiObject('Definition', node.name, node, parentNode, chainParent, 'Definition')
        if (node.tradingSystem !== undefined) {
          createUiObjectFromNode(node.tradingSystem, node, node)
        }
        if (node.personalData !== undefined) {
          createUiObjectFromNode(node.personalData, node, node)
        }
        if (node.referenceChildren === undefined) {
          node.referenceChildren = []
        }
        return
      }
      case 'Network': {
        createUiObject('Network', node.name, node, parentNode, chainParent, 'Network')
        if (node.networkNodes !== undefined) {
          for (let m = 0; m < node.networkNodes.length; m++) {
            let networkNode = node.networkNodes[m]
            createUiObjectFromNode(networkNode, node, node)
          }
        }
        return
      }
      case 'Network Node': {
        createUiObject('Network Node', node.name, node, parentNode, chainParent, 'Network Node')
        if (node.taskManagers !== undefined) {
          for (let m = 0; m < node.taskManagers.length; m++) {
            let taskManager = node.taskManagers[m]
            createUiObjectFromNode(taskManager, node, node)
          }
        }
        return
      }
      case 'Social Bots': {
        createUiObject('Social Bots', node.name, node, parentNode, chainParent, 'Social Bots')
        for (let m = 0; m < node.bots.length; m++) {
          let bot = node.bots[m]
          createUiObjectFromNode(bot, node, node)
        }
        return
      }
      case 'Telegram Bot': {
        createUiObject('Telegram Bot', node.name, node, parentNode, chainParent, 'Telegram Bot')
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createUiObjectFromNode(announcement, node, node)
        }
        return
      }
      case 'Announcement': {
        createUiObject('Announcement', node.name, node, parentNode, chainParent, 'Announcement')
        if (node.formula !== undefined) {
          createUiObjectFromNode(node.formula, node, node)
        }
        return
      }
      case 'Layer Manager': {
        createUiObject('Layer Manager', node.name, node, parentNode, chainParent, 'Layer Manager')
        for (let m = 0; m < node.layers.length; m++) {
          let layer = node.layers[m]
          createUiObjectFromNode(layer, node, node)
        }
        return
      }
      case 'Layer': {
        createUiObject('Layer', node.name, node, parentNode, chainParent, 'Layer')
        return
      }
      case 'Task Manager': {
        createUiObject('Task Manager', node.name, node, parentNode, chainParent, 'Task Manager')
        for (let m = 0; m < node.tasks.length; m++) {
          let task = node.tasks[m]
          createUiObjectFromNode(task, node, node)
        }
        return
      }
      case 'Task': {
        createUiObject('Task', node.name, node, parentNode, chainParent, 'Task')
        if (node.bot !== undefined) {
          createUiObjectFromNode(node.bot, node, node)
        }
        return
      }
      case 'Sensor Bot Instance': {
        createUiObject('Sensor Bot Instance', node.name, node, parentNode, chainParent, 'Sensor Bot Instance')
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createUiObjectFromNode(process, node, node)
        }
        return
      }
      case 'Indicator Bot Instance': {
        createUiObject('Indicator Bot Instance', node.name, node, parentNode, chainParent, 'Indicator Bot Instance')
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createUiObjectFromNode(process, node, node)
        }
        return
      }
      case 'Trading Bot Instance': {
        createUiObject('Trading Bot Instance', node.name, node, parentNode, chainParent, 'Trading Bot Instance')
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createUiObjectFromNode(process, node, node)
        }
        return
      }
      case 'Process Instance': {
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
        createUiObject('Process Instance', node.name, node, parentNode, chainParent, 'Process Instance')
        if (node.session !== undefined) {
          createUiObjectFromNode(node.session, node, node)
        }
        return
      }
      case 'Backtesting Session': {
        createUiObject('Backtesting Session', node.name, node, parentNode, chainParent, 'Backtesting Session')
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node)
        }
        if (node.layerManager !== undefined) {
          createUiObjectFromNode(node.layerManager, node, node)
        }
        if (node.socialBots !== undefined) {
          createUiObjectFromNode(node.socialBots, node, node)
        }
        return
      }
      case 'Live Trading Session': {
        createUiObject('Live Trading Session', node.name, node, parentNode, chainParent, 'Live Trading Session')
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node)
        }
        if (node.layerManager !== undefined) {
          createUiObjectFromNode(node.layerManager, node, node)
        }
        if (node.socialBots !== undefined) {
          createUiObjectFromNode(node.socialBots, node, node)
        }
        return
      }
      case 'Fordward Testing Session': {
        createUiObject('Fordward Testing Session', node.name, node, parentNode, chainParent, 'Fordward Testing Session')
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node)
        }
        if (node.layerManager !== undefined) {
          createUiObjectFromNode(node.layerManager, node, node)
        }
        if (node.socialBots !== undefined) {
          createUiObjectFromNode(node.socialBots, node, node)
        }
        return
      }
      case 'Paper Trading Session': {
        createUiObject('Paper Trading Session', node.name, node, parentNode, chainParent, 'Paper Trading Session')
        if (node.parameters !== undefined) {
          createUiObjectFromNode(node.parameters, node, node)
        }
        if (node.layerManager !== undefined) {
          createUiObjectFromNode(node.layerManager, node, node)
        }
        if (node.socialBots !== undefined) {
          createUiObjectFromNode(node.socialBots, node, node)
        }
        return
      }
    }
  }

  function addNetwork (node) {
    let network = {
      name: 'Superalgos'
    }
    node.rootNodes.push(network)
    createUiObject('Network', network.name, network, node, undefined, 'Network')

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
    createUiObject('Network Node', networkNode.name, networkNode, node, node, 'Network Node')

    return networkNode
  }

  function addSocialBots (node) {
    if (node.socialBots === undefined) {
      node.socialBots = {
        name: 'New Social Bots',
        bots: []
      }
      createUiObject('Social Bots', node.socialBots.name, node.socialBots, node, node, 'Social Bots')
    }

    return node.socialBots
  }

  function addTelegramBot (node) {
    let bot = {
      name: 'New Telegram Bot',
      code: '{ \n\"botToken\": \"Paste here the bot token obtained from Telegram Bot Father\",\n\"chatId\": Write here the chat or group id where the announcements are going to be sent to, as it is a number with no quotes please.\n}',
      announcements: []
    }
    node.bots.push(bot)
    createUiObject('Telegram Bot', bot.name, bot, node, node, 'Telegram Bot')

    return bot
  }

  function addAnnouncement (node) {
    let announcement = {
      name: 'Announcement via ' + node.type,
      code: '{ \n\"text\": \"Write here what you want to announce.\",\n\"botType\": \"' + node.type + '\",\n\"botId\": \"' + node.id + '\"\n}'
    }
    node.announcements.push(announcement)
    createUiObject('Announcement', announcement.name, announcement, node, node, 'Announcement')

    return announcement
  }

  function addLayerManager (node) {
    if (node.layerManager === undefined) {
      node.layerManager = {
        name: 'New Layer Manager',
        layers: []
      }
      createUiObject('Layer Manager', node.layerManager.name, node.layerManager, node, node, 'Layer Manager')
    }

    return node.layerManager
  }

  function addLayer (node) {
    let layer = {
      name: 'New Layer',
      code: '{}'
    }
    node.layers.push(layer)
    createUiObject('Layer', layer.name, layer, node, node, 'Layer')

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
    createUiObject('Task Manager', taskManager.name, taskManager, node, node, 'Task Manager')

    return taskManager
  }

  function addTask (node) {
    let task = {
      name: 'New Task'
    }
    node.tasks.push(task)
    createUiObject('Task', task.name, task, node, node, 'Task')

    return task
  }

  function addSensorBotInstance (node) {
    if (node.bot === undefined) {
      node.bot = {
        processes: [],
        code: '{}'
      }
      createUiObject('Sensor Bot Instance', '', node.bot, node, node)
    }
    return node.bot
  }

  function addIndicatorBotInstance (node) {
    if (node.bot === undefined) {
      node.bot = {
        processes: [],
        code: '{}'
      }
      createUiObject('Indicator Bot Instance', '', node.bot, node, node)
    }
    return node.bot
  }

  function addTradingBotInstance (node) {
    if (node.bot === undefined) {
      node.bot = {
        processes: [],
        code: '{}'
      }
      createUiObject('Trading Bot Instance', '', node.bot, node, node)
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
    createUiObject('Process Instance', process.name, process, node, node, 'Process Instance')

    return process
  }

  function addBacktestingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Backtesting Session',
        code: '{}'
      }
      createUiObject('Backtesting Session', '', node.session, node, node)
    }

    return node.session
  }

  function addLiveTradingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Live Trading Session',
        code: '{}'
      }
      createUiObject('Live Trading Session', '', node.session, node, node)
    }

    return node.session
  }

  function addFordwardTestingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Fordward Testing Session',
        code: '{}'
      }
      createUiObject('Fordward Testing Session', '', node.session, node, node)
    }

    return node.session
  }

  function addPaperTradingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Paper Trading Session',
        code: '{}'
      }
      createUiObject('Paper Trading Session', '', node.session, node, node)
    }

    return node.session
  }

  function addDefinition (node) {
    let definition = {
      name: 'New Definition',
      referenceChildren: []
    }
    node.rootNodes.push(definition)
    createUiObject('Definition', definition.name, definition, node, undefined, 'Definition')

    return definition
  }

  function addTradingSystem (node) {
    if (node.tradingSystem === undefined) {
      node.tradingSystem = {
        strategies: []
      }
      createUiObject('Trading System', '', node.tradingSystem, node, node)
    }
    return node.tradingSystem
  }

  function addPersonalData (node) {
    if (node.personalData === undefined) {
      node.personalData = {
        exchangeAccounts: []
      }
      createUiObject('Personal Data', '', node.personalData, node, node)
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
    createUiObject('Exchange Account', exchangeAccount.name, exchangeAccount, personalData, personalData, 'Exchange Account')

    return exchangeAccount
  }

  function addExchangeAccountAsset (parentNode) {
    let exchangeAccount = parentNode
    let asset = {
      name: 'New Asset'
    }
    exchangeAccount.assets.push(asset)
    createUiObject('Exchange Account Asset', asset.name, asset, exchangeAccount, exchangeAccount, 'Account Asset')

    return asset
  }

  function addExchangeAccountKey (parentNode) {
    let exchangeAccount = parentNode
    let key = {
      name: 'New Key',
      code: 'Paste your exchange API secret key here and the put the key name as this key object title. Secret keys are filtered out and NOT exported when using the SHARE menu option on any object at your workspace. Secret keys ARE downloaded when using the download button.'
    }
    exchangeAccount.keys.push(key)
    createUiObject('Exchange Account Key', key.name, key, exchangeAccount, exchangeAccount, 'Account Key')

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
    createUiObject('Strategy', strategy.name, strategy, strategyParent, strategyParent, 'Strategy')
    createUiObject('Trigger Stage', '', strategy.triggerStage, strategy, strategy, 'Trigger Stage')
    createUiObject('Open Stage', '', strategy.openStage, strategy, strategy, 'Open Stage')
    createUiObject('Manage Stage', '', strategy.manageStage, strategy, strategy, 'Manage Stage')
    createUiObject('Close Stage', '', strategy.closeStage, strategy, strategy, 'Close Stage')
    createUiObject('Trigger On Event', '', strategy.triggerStage.triggerOn, strategy.triggerStage, strategy.triggerStage)
    createUiObject('Trigger Off Event', '', strategy.triggerStage.triggerOff, strategy.triggerStage, strategy.triggerStage)
    createUiObject('Take Position Event', '', strategy.triggerStage.takePosition, strategy.triggerStage, strategy.triggerStage)
    createUiObject('Initial Definition', '', strategy.openStage.initialDefinition, strategy.openStage, strategy.openStage)
    createUiObject('Position Size', '', strategy.openStage.initialDefinition.positionSize, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createUiObject('Position Rate', '', strategy.openStage.initialDefinition.positionRate, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createUiObject('Stop', '', strategy.manageStage.stopLoss, strategy.manageStage, strategy.manageStage)
    createUiObject('Take Profit', '', strategy.manageStage.takeProfit, strategy.manageStage, strategy.manageStage)
    createUiObject('Stop', 'Initial Stop', strategy.openStage.initialDefinition.stopLoss, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createUiObject('Take Profit', 'Initial Take Profit', strategy.openStage.initialDefinition.takeProfit, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createUiObject('Formula', '', strategy.triggerStage.positionSize.formula, strategy.triggerStage.positionSize, strategy.triggerStage.positionSize)

    return strategy
  }

  function addParameters (node) {
    if (node.parameters === undefined) {
      node.parameters = {
        name: 'Parameters'
      }
      createUiObject('Parameters', '', node.parameters, node, node)
      addMissingParameters(node.parameters)
    }

    return node.parameters
  }

  function addMissingParameters (node) {
    if (node.baseAsset === undefined) {
      node.baseAsset = {
        name: 'Base Asset',
        code: DEFAULT_CONFIG_TEXT
      }
      createUiObject('Base Asset', '', node.baseAsset, node, node)
    }
    if (node.timeRange === undefined) {
      node.timeRange = {
        name: 'Time Range',
        code: DEFAULT_CONFIG_TEXT
      }
      createUiObject('Time Range', '', node.timeRange, node, node)
    }
    if (node.timePeriod === undefined) {
      node.timePeriod = {
        name: 'Time Period',
        code: DEFAULT_CONFIG_TEXT
      }
      createUiObject('Time Period', '', node.timePeriod, node, node)
    }
    if (node.slippage === undefined) {
      node.slippage = {
        name: 'Slippage',
        code: DEFAULT_CONFIG_TEXT
      }
      createUiObject('Slippage', '', node.slippage, node, node)
    }
    if (node.feeStructure === undefined) {
      node.feeStructure = {
        name: 'Fee Structure',
        code: DEFAULT_CONFIG_TEXT
      }
      createUiObject('Fee Structure', '', node.feeStructure, node, node)
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
      createUiObject('Trigger Stage', '', node.triggerStage, node, node, 'Trigger Stage')
      createUiObject('Trigger On Event', '', node.triggerStage.triggerOn, node.triggerStage, node.triggerStage)
      createUiObject('Trigger Off Event', '', node.triggerStage.triggerOff, node.triggerStage, node.triggerStage)
      createUiObject('Take Position Event', '', node.triggerStage.takePosition, node.triggerStage, node.triggerStage)
      createUiObject('Formula', '', node.triggerStage.positionSize.formula, node.triggerStage.positionSize, node.triggerStage.positionSize)
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
      createUiObject('Open Stage', '', node.openStage, node, node, 'Open Stage')
      createUiObject('Initial Definition', '', node.openStage.initialDefinition, node.openStage, node.openStage)
      createUiObject('Stop', 'Initial Stop', node.openStage.initialDefinition.stopLoss, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createUiObject('Take Profit', 'Initial Take Profit', node.openStage.initialDefinition.takeProfit, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createUiObject('Position Size', 'Position Size', node.openStage.initialDefinition.positionSize, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createUiObject('Position Rate', 'Position Rate', node.openStage.initialDefinition.positionRate, node.openStage.initialDefinition, node.openStage.initialDefinition)
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
      createUiObject('Manage Stage', '', node.manageStage, node, node, 'Manage Stage')
      createUiObject('Stop', '', node.manageStage.stopLoss, node.manageStage, node.manageStage)
      createUiObject('Take Profit', '', node.manageStage.takeProfit, node.manageStage, node.manageStage)
    }
    if (node.closeStage === undefined) {
      node.closeStage = {
      }
      createUiObject('Close Stage', '', node.closeStage, node, node, 'Close Stage')
    }
  }

  function addMissingEvents (node) {
    if (node.triggerOn === undefined) {
      node.triggerOn = {
        situations: [],
        announcements: []
      }
      createUiObject('Trigger On Event', '', node.triggerOn, node, node)
    }
    if (node.triggerOff === undefined) {
      node.triggerOff = {
        situations: [],
        announcements: []
      }
      createUiObject('Trigger Off Event', '', node.triggerOff, node, node)
    }
    if (node.takePosition === undefined) {
      node.takePosition = {
        situations: [],
        announcements: []
      }
      createUiObject('Take Position Event', '', node.takePosition, node, node)
    }
  }

  function addMissingItems (node) {
    if (node.type === 'Initial Definition') {
      if (node.stopLoss === undefined) {
        node.stopLoss = {
          phases: [],
          maxPhases: 1
        }
        createUiObject('Stop', 'Initial Stop', node.stopLoss, node, node)
      }
      if (node.takeProfit === undefined) {
        node.takeProfit = {
          phases: [],
          maxPhases: 1
        }
        createUiObject('Take Profit', 'Initial Take Profit', node.takeProfit, node, node)
      }
      if (node.positionSize === undefined) {
        node.positionSize = {
          name: 'Position Size',
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
        createUiObject('Position Size', '', node.positionSize, node, node)
        createUiObject('Formula', '', node.positionSize.formula, node.positionSize, node.positionSize)
      }
      if (node.positionRate === undefined) {
        node.positionRate = {
          name: 'Position Rate',
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
        createUiObject('Position Rate', '', node.positionRate, node, node)
        createUiObject('Formula', '', node.positionRate.formula, node.positionRate, node.positionRate)
      }
    } else {
      if (node.stopLoss === undefined) {
        node.stopLoss = {
          phases: []
        }
        createUiObject('Stop', '', node.stopLoss, node, node)
      }
      if (node.takeProfit === undefined) {
        node.takeProfit = {
          phases: []
        }
        createUiObject('Take Profit', '', node.takeProfit, node, node)
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
      createUiObject('Initial Definition', '', node.initialDefinition, node, node)
      createUiObject('Stop', 'Initial Stop', node.initialDefinition.stopLoss, node.initialDefinition, node.initialDefinition)
      createUiObject('Take Profit', 'Initial Take Profit', node.initialDefinition.takeProfit, node.initialDefinition, node.initialDefinition)
      createUiObject('Position Size', '', node.initialDefinition.positionSize, node.initialDefinition, node.initialDefinition)
      createUiObject('Formula', '', node.initialDefinition.positionSize.formula, node.initialDefinition.positionSize, node.initialDefinition.positionSize)
      createUiObject('Position Rate', '', node.initialDefinition.positionRate, node.initialDefinition, node.initialDefinition)
      createUiObject('Formula', '', node.initialDefinition.positionRate.formula, node.initialDefinition.positionRate, node.initialDefinition.positionRate)
    }

    return node.initialDefinition
  }

  function addOpenExecution (node) {
    if (node.openExecution === undefined) {
      node.openExecution = {}
      createUiObject('Open Execution', '', node.openExecution, node, node)
    }

    return node.openExecution
  }

  function addCloseExecution (node) {
    if (node.closeExecution === undefined) {
      node.closeExecution = {}
      createUiObject('Close Execution', '', node.closeExecution, node, node)
    }

    return node.closeExecution
  }

  function addFormula (node) {
    if (node.formula === undefined) {
      node.formula = {
        code: DEFAULT_FORMULA_TEXT
      }
      createUiObject('Formula', '', node.formula, node, node)
    }

    return node.formula
  }

  function addNextPhaseEvent (node) {
    if (node.nextPhaseEvent === undefined) {
      node.nextPhaseEvent = {
        situations: [],
        announcements: []
      }
      createUiObject('Next Phase Event', '', node.nextPhaseEvent, node, node)
    }

    return node.nextPhaseEvent
  }

  function addCode (node) {
    if (node.code === undefined) {
      node.code = {
        code: DEFAULT_CODE_TEXT
      }
      createUiObject('Code', '', node.code, node, node)
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
    createUiObject('Phase', phase.name, phase, phaseParent, phaseChainParent, 'Phase')
    createUiObject('Formula', '', phase.formula, phase, phase, 'Formula')
    createUiObject('Next Phase Event', '', phase.nextPhaseEvent, phase, phase)

    return phase
  }

  function addSituation (parentNode) {
    let m = parentNode.situations.length
    let situation = {
      name: 'New Situation',
      conditions: []
    }
    parentNode.situations.push(situation)
    createUiObject('Situation', situation.name, situation, parentNode, parentNode, 'Situation')

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
    createUiObject('Condition', condition.name, condition, situation, situation, 'Condition')
    createUiObject('Code', '', condition.code, condition, condition, 'Code')

    return condition
  }

  function createUiObject (uiObjectType, name, node, parentNode, chainParent, title) {
    let payload = {}

    if (name === '' || name === undefined) { name = 'My ' + uiObjectType }
    if (node.savedPayload !== undefined) {
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
    canvas.floatingSpace.uiObjectConstructor.createUiObject(payload)
  }
}
