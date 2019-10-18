function newPartsFromNodes () {
  thisObject = {
    createPartFromNode: createPartFromNode,
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
    addSensor: addSensor,
    addIndicator: addIndicator,
    addTradingEngine: addTradingEngine,
    addProcess: addProcess,
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

  return thisObject

  function createPartFromNode (node, parentNode, chainParent) {
    switch (node.type) {
      case 'Code':
        {
          createPart('Code', node.name, node, parentNode, chainParent, 'Code')
          return
        }
      case 'Condition':
        {
          createPart('Condition', node.name, node, parentNode, chainParent, 'Condition')
          if (node.code !== undefined) {
            createPartFromNode(node.code, node, node)
          }
          return
        }
      case 'Situation': {
        let situation = node
        createPart('Situation', situation.name, situation, parentNode, chainParent, 'Situation')
        for (let m = 0; m < node.conditions.length; m++) {
          let condition = node.conditions[m]
          createPartFromNode(condition, situation, situation)
        }
        return
      }
      case 'Formula':
        {
          createPart('Formula', node.name, node, parentNode, chainParent, 'Formula')
          return
        }
      case 'Next Phase Event':
        {
          createPart('Next Phase Event', node.name, node, parentNode, chainParent, 'Next Phase Event')
          for (let m = 0; m < node.situations.length; m++) {
            let situation = node.situations[m]
            createPartFromNode(situation, node, node)
          }
          if (node.announcements === undefined) {
            node.announcements = []
          }
          for (let m = 0; m < node.announcements.length; m++) {
            let announcement = node.announcements[m]
            createPartFromNode(announcement, node, node)
          }
          return
        }
      case 'Phase': {
        let phase = node
        createPart('Phase', phase.name, phase, parentNode, chainParent, phase.subType)

        if (node.formula !== undefined) {
          createPartFromNode(node.formula, phase, phase)
        }
        if (node.nextPhaseEvent !== undefined) {
          createPartFromNode(node.nextPhaseEvent, phase, phase)
        }
        return
      }
      case 'Stop': {
        let lastPhase
        let stop = node
        createPart('Stop', stop.name, stop, parentNode, chainParent, 'Stop')
        for (let m = 0; m < node.phases.length; m++) {
          let phase = node.phases[m]
          let thisChainParent
          if (m === 0) {
            thisChainParent = node
          } else {
            thisChainParent = lastPhase
          }
          lastPhase = phase
          createPartFromNode(phase, stop, thisChainParent)
        }
        return
      }
      case 'Take Profit': {
        let lastPhase
        let takeProfit = node
        createPart('Take Profit', takeProfit.name, takeProfit, parentNode, chainParent, 'Take Profit')
        for (let m = 0; m < node.phases.length; m++) {
          let phase = node.phases[m]
          let thisChainParent
          if (m === 0) {
            thisChainParent = node
          } else {
            thisChainParent = lastPhase
          }
          lastPhase = phase
          createPartFromNode(phase, takeProfit, thisChainParent)
        }
        return
      }
      case 'Open Execution':
        {
          createPart('Open Execution', node.name, node, parentNode, chainParent, 'Open Execution')
          return
        }
      case 'Close Execution':
        {
          createPart('Close Execution', node.name, node, parentNode, chainParent, 'Close Execution')
          return
        }
      case 'Initial Definition': {
        createPart('Initial Definition', node.name, node, parentNode, chainParent, 'Initial Definition')

        if (node.stopLoss !== undefined) {
          createPartFromNode(node.stopLoss, node, node)
        }
        if (node.takeProfit !== undefined) {
          createPartFromNode(node.takeProfit, node, node)
        }
        if (node.positionSize !== undefined) {
          createPartFromNode(node.positionSize, node, node)
        }
        if (node.positionRate !== undefined) {
          createPartFromNode(node.positionRate, node, node)
        }
        return
      }
      case 'Take Position Event': {
        let event = node
        createPart('Take Position Event', event.name, event, parentNode, chainParent, 'Take Position Event')
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createPartFromNode(situation, event, event)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createPartFromNode(announcement, node, node)
        }
        return
      }
      case 'Trigger On Event': {
        let event = node
        createPart('Trigger On Event', event.name, event, parentNode, chainParent, 'Trigger On Event')
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createPartFromNode(situation, event, event)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createPartFromNode(announcement, node, node)
        }
        return
      }
      case 'Trigger Off Event': {
        let event = node
        createPart('Trigger Off Event', event.name, event, parentNode, chainParent, 'Trigger Off Event')
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createPartFromNode(situation, event, event)
        }
        if (node.announcements === undefined) {
          node.announcements = []
        }
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createPartFromNode(announcement, node, node)
        }
        return
      }
      case 'Position Size': {
        createPart('Position Size', node.name, node, parentNode, chainParent, 'Position Size')
        if (node.formula !== undefined) {
          createPartFromNode(node.formula, node, node)
        }
        return
      }
      case 'Position Rate': {
        createPart('Position Rate', node.name, node, parentNode, chainParent, 'Position Rate')
        if (node.formula !== undefined) {
          createPartFromNode(node.formula, node, node)
        }
        return
      }
      case 'Trigger Stage': {
        let stage = node
        createPart('Trigger Stage', stage.name, stage, parentNode, chainParent, 'Trigger Stage')

        if (node.triggerOn !== undefined) {
          createPartFromNode(node.triggerOn, stage, stage)
        }
        if (node.triggerOff !== undefined) {
          createPartFromNode(node.triggerOff, stage, stage)
        }
        if (node.takePosition !== undefined) {
          createPartFromNode(node.takePosition, stage, stage)
        }
        return
      }
      case 'Open Stage': {
        let stage = node
        createPart('Open Stage', stage.name, stage, parentNode, chainParent, 'Open Stage')

        if (node.initialDefinition !== undefined) {
          createPartFromNode(node.initialDefinition, stage, stage)
        }
        if (node.openExecution !== undefined) {
          createPartFromNode(node.openExecution, stage, stage)
        }
        return
      }
      case 'Manage Stage': {
        let stage = node
        createPart('Manage Stage', stage.name, stage, parentNode, chainParent, 'Manage Stage')

        if (node.stopLoss !== undefined) {
          createPartFromNode(node.stopLoss, stage, stage)
        }
        if (node.takeProfit !== undefined) {
          createPartFromNode(node.takeProfit, stage, stage)
        }
        return
      }
      case 'Close Stage': {
        let stage = node
        createPart('Close Stage', stage.name, stage, parentNode, chainParent, 'Close Stage')

        if (node.closeExecution !== undefined) {
          createPartFromNode(node.closeExecution, stage, stage)
        }
        return
      }
      case 'Strategy': {
        let strategy = node
        createPart('Strategy', strategy.name, strategy, parentNode, chainParent, 'Strategy')
        if (node.triggerStage !== undefined) {
          createPartFromNode(node.triggerStage, strategy, strategy)
        }
        if (node.openStage !== undefined) {
          createPartFromNode(node.openStage, strategy, strategy)
        }
        if (node.manageStage !== undefined) {
          createPartFromNode(node.manageStage, strategy, strategy)
        }
        if (node.closeStage !== undefined) {
          createPartFromNode(node.closeStage, strategy, strategy)
        }
        return
      }
      case 'Base Asset': {
        createPart('Base Asset', node.name, node, parentNode, chainParent, 'Base Asset')
        return
      }
      case 'Time Range': {
        createPart('Time Range', node.name, node, parentNode, chainParent, 'Time Range')
        return
      }
      case 'Time Period': {
        createPart('Time Period', node.name, node, parentNode, chainParent, 'Time Period')
        return
      }
      case 'Slippage': {
        createPart('Slippage', node.name, node, parentNode, chainParent, 'Slippage')
        return
      }
      case 'Fee Structure': {
        createPart('Fee Structure', node.name, node, parentNode, chainParent, 'Fee Structure')
        return
      }
      case 'Parameters': {
        createPart('Parameters', node.name, node, parentNode, chainParent, 'Parameters')
        if (node.baseAsset !== undefined) {
          createPartFromNode(node.baseAsset, node, node)
        }
        if (node.timeRange !== undefined) {
          createPartFromNode(node.timeRange, node, node)
        }
        if (node.timePeriod !== undefined) {
          createPartFromNode(node.timePeriod, node, node)
        }
        if (node.slippage !== undefined) {
          createPartFromNode(node.slippage, node, node)
        }
        if (node.feeStructure !== undefined) {
          createPartFromNode(node.feeStructure, node, node)
        }
        if (node.key !== undefined) {
          createPartFromNode(node.key, node, node)
        }
        return
      }
      case 'Trading System': {
        let tradingSystem = node
        createPart('Trading System', tradingSystem.name, tradingSystem, parentNode, chainParent, 'Trading System')
        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = node.strategies[m]
          createPartFromNode(strategy, tradingSystem, tradingSystem)
        }
        if (node.parameters !== undefined) {
          createPartFromNode(node.parameters, node, node)
        }
        return
      }
      case 'Workspace': {
        let workspace = node
        createPart('Workspace', workspace.name, workspace, parentNode, chainParent, 'Workspace')
        return
      }
      case 'Personal Data': {
        createPart('Personal Data', node.name, node, parentNode, chainParent, 'Personal Data')
        for (let m = 0; m < node.exchangeAccounts.length; m++) {
          let exchangeAccount = node.exchangeAccounts[m]
          createPartFromNode(exchangeAccount, node, node)
        }
        return
      }
      case 'Exchange Account': {
        createPart('Exchange Account', node.name, node, parentNode, chainParent, 'Exchange Account')
        for (let m = 0; m < node.assets.length; m++) {
          let asset = node.assets[m]
          createPartFromNode(asset, node, node)
        }
        for (let m = 0; m < node.keys.length; m++) {
          let key = node.keys[m]
          createPartFromNode(key, node, node)
        }
        return
      }
      case 'Exchange Account Asset': {
        createPart('Exchange Account Asset', node.name, node, parentNode, chainParent, 'Exchange Account Asset')
        return
      }
      case 'Exchange Account Key': {
        createPart('Exchange Account Key', node.name, node, parentNode, chainParent, 'Exchange Account Key')
        return
      }
      case 'Definition': {
        createPart('Definition', node.name, node, parentNode, chainParent, 'Definition')
        if (node.tradingSystem !== undefined) {
          createPartFromNode(node.tradingSystem, node, node)
        }
        if (node.personalData !== undefined) {
          createPartFromNode(node.personalData, node, node)
        }
        if (node.network !== undefined) {
          createPartFromNode(node.network, node, node)
        }
        return
      }
      case 'Network': {
        createPart('Network', node.name, node, parentNode, chainParent, 'Network')
        if (node.networkNodes !== undefined) {
          for (let m = 0; m < node.networkNodes.length; m++) {
            let networkNode = node.networkNodes[m]
            createPartFromNode(networkNode, node, node)
          }
        }
        return
      }
      case 'Network Node': {
        createPart('Network Node', node.name, node, parentNode, chainParent, 'Network Node')
        if (node.taskManagers !== undefined) {
          for (let m = 0; m < node.taskManagers.length; m++) {
            let taskManager = node.taskManagers[m]
            createPartFromNode(taskManager, node, node)
          }
        }
        return
      }
      case 'Social Bots': {
        createPart('Social Bots', node.name, node, parentNode, chainParent, 'Social Bots')
        for (let m = 0; m < node.bots.length; m++) {
          let bot = node.bots[m]
          createPartFromNode(bot, node, node)
        }
        return
      }
      case 'Telegram Bot': {
        createPart('Telegram Bot', node.name, node, parentNode, chainParent, 'Telegram Bot')
        for (let m = 0; m < node.announcements.length; m++) {
          let announcement = node.announcements[m]
          createPartFromNode(announcement, node, node)
        }
        return
      }
      case 'Announcement': {
        createPart('Announcement', node.name, node, parentNode, chainParent, 'Announcement')
        return
      }
      case 'Layer Manager': {
        createPart('Layer Manager', node.name, node, parentNode, chainParent, 'Layer Manager')
        for (let m = 0; m < node.layers.length; m++) {
          let layer = node.layers[m]
          createPartFromNode(layer, node, node)
        }
        return
      }
      case 'Layer': {
        createPart('Layer', node.name, node, parentNode, chainParent, 'Layer')
        return
      }
      case 'Task Manager': {
        createPart('Task Manager', node.name, node, parentNode, chainParent, 'Task Manager')
        for (let m = 0; m < node.tasks.length; m++) {
          let task = node.tasks[m]
          createPartFromNode(task, node, node)
        }
        return
      }
      case 'Task': {
        createPart('Task', node.name, node, parentNode, chainParent, 'Task')
        if (node.bot !== undefined) {
          createPartFromNode(node.bot, node, node)
        }
        return
      }
      case 'Sensor': {
        createPart('Sensor', node.name, node, parentNode, chainParent, 'Sensor')
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createPartFromNode(process, node, node)
        }
        return
      }
      case 'Indicator': {
        createPart('Indicator', node.name, node, parentNode, chainParent, 'Indicator')
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createPartFromNode(process, node, node)
        }
        return
      }
      case 'Trading Engine': {
        createPart('Trading Engine', node.name, node, parentNode, chainParent, 'Trading Engine')
        for (let m = 0; m < node.processes.length; m++) {
          let process = node.processes[m]
          createPartFromNode(process, node, node)
        }
        return
      }
      case 'Process': {
        if (parentNode !== undefined) {
          switch (parentNode.type) {
            case 'Sensor': {
              node.subType = 'Sensor Process'
              break
            }
            case 'Indicator': {
              node.subType = 'Indicator Process'
              break
            }
            case 'Trading Engine': {
              node.subType = 'Trading Engine Process'
              break
            }
          }
        }
        createPart('Process', node.name, node, parentNode, chainParent, 'Process')
        if (node.session !== undefined) {
          createPartFromNode(node.session, node, node)
        }
        return
      }
      case 'Backtesting Session': {
        createPart('Backtesting Session', node.name, node, parentNode, chainParent, 'Backtesting Session')
        if (node.parameters !== undefined) {
          createPartFromNode(node.parameters, node, node)
        }
        if (node.layerManager !== undefined) {
          createPartFromNode(node.layerManager, node, node)
        }
        if (node.socialBots !== undefined) {
          createPartFromNode(node.socialBots, node, node)
        }
        return
      }
      case 'Live Trading Session': {
        createPart('Live Trading Session', node.name, node, parentNode, chainParent, 'Live Trading Session')
        if (node.parameters !== undefined) {
          createPartFromNode(node.parameters, node, node)
        }
        if (node.layerManager !== undefined) {
          createPartFromNode(node.layerManager, node, node)
        }
        if (node.socialBots !== undefined) {
          createPartFromNode(node.socialBots, node, node)
        }
        return
      }
      case 'Fordward Testing Session': {
        createPart('Fordward Testing Session', node.name, node, parentNode, chainParent, 'Fordward Testing Session')
        if (node.parameters !== undefined) {
          createPartFromNode(node.parameters, node, node)
        }
        if (node.layerManager !== undefined) {
          createPartFromNode(node.layerManager, node, node)
        }
        if (node.socialBots !== undefined) {
          createPartFromNode(node.socialBots, node, node)
        }
        return
      }
      case 'Paper Trading Session': {
        createPart('Paper Trading Session', node.name, node, parentNode, chainParent, 'Paper Trading Session')
        if (node.parameters !== undefined) {
          createPartFromNode(node.parameters, node, node)
        }
        if (node.layerManager !== undefined) {
          createPartFromNode(node.layerManager, node, node)
        }
        if (node.socialBots !== undefined) {
          createPartFromNode(node.socialBots, node, node)
        }
        return
      }
    }
  }

  function addNetwork (node) {
    if (node.network === undefined) {
      node.network = {
        name: 'Superalgos'
      }
      createPart('Network', node.network.name, node.network, node, node, 'Network')
    }

    return node.network
  }

  function addNetworkNode (node) {
    let networkNode = {
      name: 'New Network Node'
    }
    if (node.networkNodes === undefined) {
      node.networkNodes = []
    }
    node.networkNodes.push(networkNode)
    createPart('Network Node', networkNode.name, networkNode, node, node, 'Network Node')

    return networkNode
  }

  function addSocialBots (node) {
    if (node.socialBots === undefined) {
      node.socialBots = {
        name: 'New Social Bots',
        bots: []
      }
      createPart('Social Bots', node.socialBots.name, node.socialBots, node, node, 'Social Bots')
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
    createPart('Telegram Bot', bot.name, bot, node, node, 'Telegram Bot')

    return bot
  }

  function addAnnouncement (node) {
    let announcement = {
      name: 'Announcement via ' + node.type,
      code: '{ \n\"text\": \"Write here what you want to announce.\",\n\"botType\": \"' + node.type + '\",\n\"botId\": \"' + node.id + '\"\n}'
    }
    node.announcements.push(announcement)
    createPart('Announcement', announcement.name, announcement, node, node, 'Announcement')

    return announcement
  }

  function addLayerManager (node) {
    if (node.layerManager === undefined) {
      node.layerManager = {
        name: 'New Layer Manager',
        layers: []
      }
      createPart('Layer Manager', node.layerManager.name, node.layerManager, node, node, 'Layer Manager')
    }

    return node.layerManager
  }

  function addLayer (node) {
    let layer = {
      name: 'New Layer',
      code: '{}'
    }
    node.layers.push(layer)
    createPart('Layer', layer.name, layer, node, node, 'Layer')

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
    createPart('Task Manager', taskManager.name, taskManager, node, node, 'Task Manager')

    return taskManager
  }

  function addTask (node) {
    let task = {
      name: 'New Task'
    }
    node.tasks.push(task)
    createPart('Task', task.name, task, node, node, 'Task')

    return task
  }

  function addSensor (node) {
    if (node.bot === undefined) {
      node.bot = {
        processes: [],
        code: '{}'
      }
      createPart('Sensor', '', node.bot, node, node)
    }
    return node.bot
  }

  function addIndicator (node) {
    if (node.bot === undefined) {
      node.bot = {
        processes: [],
        code: '{}'
      }
      createPart('Indicator', '', node.bot, node, node)
    }
    return node.bot
  }

  function addTradingEngine (node) {
    if (node.bot === undefined) {
      node.bot = {
        processes: [],
        code: '{}'
      }
      createPart('Trading Engine', '', node.bot, node, node)
    }
    return node.bot
  }

  function addProcess (node) {
    let process = {
      name: 'New Process',
      code: '{}'
    }

    switch (node.type) {
      case 'Sensor': {
        process.subType = 'Sensor Process'
        process.name = 'Sensor Process'
        break
      }
      case 'Indicator': {
        process.subType = 'Indicator Process'
        process.name = 'Indicator Process'
        break
      }
      case 'Trading Engine': {
        process.subType = 'Trading Engine Process'
        process.name = 'Trading Engine Process'
        break
      }
    }
    node.processes.push(process)
    createPart('Process', process.name, process, node, node, 'Process')

    return process
  }

  function addBacktestingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Backtesting Session',
        code: '{}'
      }
      createPart('Backtesting Session', '', node.session, node, node)
    }

    return node.session
  }

  function addLiveTradingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Live Trading Session',
        code: '{}'
      }
      createPart('Live Trading Session', '', node.session, node, node)
    }

    return node.session
  }

  function addFordwardTestingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Fordward Testing Session',
        code: '{}'
      }
      createPart('Fordward Testing Session', '', node.session, node, node)
    }

    return node.session
  }

  function addPaperTradingSession (node) {
    if (node.session === undefined) {
      node.session = {
        name: 'New Paper Trading Session',
        code: '{}'
      }
      createPart('Paper Trading Session', '', node.session, node, node)
    }

    return node.session
  }

  function addDefinition (node) {
    let definition = {
      name: 'New Definition'
    }
    node.rootNodes.push(definition)
    createPart('Definition', definition.name, definition, node, undefined, 'Definition')

    return definition
  }

  function addTradingSystem (node) {
    if (node.tradingSystem === undefined) {
      node.tradingSystem = {
        strategies: []
      }
      createPart('Trading System', '', node.tradingSystem, node, node)
    }
    return node.tradingSystem
  }

  function addPersonalData (node) {
    if (node.personalData === undefined) {
      node.personalData = {
        exchangeAccounts: []
      }
      createPart('Personal Data', '', node.personalData, node, node)
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
    createPart('Exchange Account', exchangeAccount.name, exchangeAccount, personalData, personalData, 'Exchange Account')

    return exchangeAccount
  }

  function addExchangeAccountAsset (parentNode) {
    let exchangeAccount = parentNode
    let asset = {
      name: 'New Asset'
    }
    exchangeAccount.assets.push(asset)
    createPart('Exchange Account Asset', asset.name, asset, exchangeAccount, exchangeAccount, 'Account Asset')

    return asset
  }

  function addExchangeAccountKey (parentNode) {
    let exchangeAccount = parentNode
    let key = {
      name: 'New Key',
      code: 'Paste your exchange API secret key here and the put the key name as this key object title. Secret keys are filtered out and NOT exported when using the SHARE menu option on any object at your workspace. Secret keys ARE downloaded when using the download button.'
    }
    exchangeAccount.keys.push(key)
    createPart('Exchange Account Key', key.name, key, exchangeAccount, exchangeAccount, 'Account Key')

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
    createPart('Strategy', strategy.name, strategy, strategyParent, strategyParent, 'Strategy')
    createPart('Trigger Stage', '', strategy.triggerStage, strategy, strategy, 'Trigger Stage')
    createPart('Open Stage', '', strategy.openStage, strategy, strategy, 'Open Stage')
    createPart('Manage Stage', '', strategy.manageStage, strategy, strategy, 'Manage Stage')
    createPart('Close Stage', '', strategy.closeStage, strategy, strategy, 'Close Stage')
    createPart('Trigger On Event', '', strategy.triggerStage.triggerOn, strategy.triggerStage, strategy.triggerStage)
    createPart('Trigger Off Event', '', strategy.triggerStage.triggerOff, strategy.triggerStage, strategy.triggerStage)
    createPart('Take Position Event', '', strategy.triggerStage.takePosition, strategy.triggerStage, strategy.triggerStage)
    createPart('Initial Definition', '', strategy.openStage.initialDefinition, strategy.openStage, strategy.openStage)
    createPart('Position Size', '', strategy.openStage.initialDefinition.positionSize, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createPart('Position Rate', '', strategy.openStage.initialDefinition.positionRate, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createPart('Stop', '', strategy.manageStage.stopLoss, strategy.manageStage, strategy.manageStage)
    createPart('Take Profit', '', strategy.manageStage.takeProfit, strategy.manageStage, strategy.manageStage)
    createPart('Stop', 'Initial Stop', strategy.openStage.initialDefinition.stopLoss, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createPart('Take Profit', 'Initial Take Profit', strategy.openStage.initialDefinition.takeProfit, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createPart('Formula', '', strategy.triggerStage.positionSize.formula, strategy.triggerStage.positionSize, strategy.triggerStage.positionSize)

    return strategy
  }

  function addParameters (node) {
    if (node.parameters === undefined) {
      node.parameters = {
        name: 'Parameters'
      }
      createPart('Parameters', '', node.parameters, node, node)
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
      createPart('Base Asset', '', node.baseAsset, node, node)
    }
    if (node.timeRange === undefined) {
      node.timeRange = {
        name: 'Time Range',
        code: DEFAULT_CONFIG_TEXT
      }
      createPart('Time Range', '', node.timeRange, node, node)
    }
    if (node.timePeriod === undefined) {
      node.timePeriod = {
        name: 'Time Period',
        code: DEFAULT_CONFIG_TEXT
      }
      createPart('Time Period', '', node.timePeriod, node, node)
    }
    if (node.slippage === undefined) {
      node.slippage = {
        name: 'Slippage',
        code: DEFAULT_CONFIG_TEXT
      }
      createPart('Slippage', '', node.slippage, node, node)
    }
    if (node.feeStructure === undefined) {
      node.feeStructure = {
        name: 'Fee Structure',
        code: DEFAULT_CONFIG_TEXT
      }
      createPart('Fee Structure', '', node.feeStructure, node, node)
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
      createPart('Trigger Stage', '', node.triggerStage, node, node, 'Trigger Stage')
      createPart('Trigger On Event', '', node.triggerStage.triggerOn, node.triggerStage, node.triggerStage)
      createPart('Trigger Off Event', '', node.triggerStage.triggerOff, node.triggerStage, node.triggerStage)
      createPart('Take Position Event', '', node.triggerStage.takePosition, node.triggerStage, node.triggerStage)
      createPart('Formula', '', node.triggerStage.positionSize.formula, node.triggerStage.positionSize, node.triggerStage.positionSize)
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
      createPart('Open Stage', '', node.openStage, node, node, 'Open Stage')
      createPart('Initial Definition', '', node.openStage.initialDefinition, node.openStage, node.openStage)
      createPart('Stop', 'Initial Stop', node.openStage.initialDefinition.stopLoss, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createPart('Take Profit', 'Initial Take Profit', node.openStage.initialDefinition.takeProfit, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createPart('Position Size', 'Position Size', node.openStage.initialDefinition.positionSize, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createPart('Position Rate', 'Position Rate', node.openStage.initialDefinition.positionRate, node.openStage.initialDefinition, node.openStage.initialDefinition)
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
      createPart('Manage Stage', '', node.manageStage, node, node, 'Manage Stage')
      createPart('Stop', '', node.manageStage.stopLoss, node.manageStage, node.manageStage)
      createPart('Take Profit', '', node.manageStage.takeProfit, node.manageStage, node.manageStage)
    }
    if (node.closeStage === undefined) {
      node.closeStage = {
      }
      createPart('Close Stage', '', node.closeStage, node, node, 'Close Stage')
    }
  }

  function addMissingEvents (node) {
    if (node.triggerOn === undefined) {
      node.triggerOn = {
        situations: [],
        announcements: []
      }
      createPart('Trigger On Event', '', node.triggerOn, node, node)
    }
    if (node.triggerOff === undefined) {
      node.triggerOff = {
        situations: [],
        announcements: []
      }
      createPart('Trigger Off Event', '', node.triggerOff, node, node)
    }
    if (node.takePosition === undefined) {
      node.takePosition = {
        situations: [],
        announcements: []
      }
      createPart('Take Position Event', '', node.takePosition, node, node)
    }
  }

  function addMissingItems (node) {
    if (node.type === 'Initial Definition') {
      if (node.stopLoss === undefined) {
        node.stopLoss = {
          phases: [],
          maxPhases: 1
        }
        createPart('Stop', 'Initial Stop', node.stopLoss, node, node)
      }
      if (node.takeProfit === undefined) {
        node.takeProfit = {
          phases: [],
          maxPhases: 1
        }
        createPart('Take Profit', 'Initial Take Profit', node.takeProfit, node, node)
      }
      if (node.positionSize === undefined) {
        node.positionSize = {
          name: 'Position Size',
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
        createPart('Position Size', '', node.positionSize, node, node)
        createPart('Formula', '', node.positionSize.formula, node.positionSize, node.positionSize)
      }
      if (node.positionRate === undefined) {
        node.positionRate = {
          name: 'Position Rate',
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
        createPart('Position Rate', '', node.positionRate, node, node)
        createPart('Formula', '', node.positionRate.formula, node.positionRate, node.positionRate)
      }
    } else {
      if (node.stopLoss === undefined) {
        node.stopLoss = {
          phases: []
        }
        createPart('Stop', '', node.stopLoss, node, node)
      }
      if (node.takeProfit === undefined) {
        node.takeProfit = {
          phases: []
        }
        createPart('Take Profit', '', node.takeProfit, node, node)
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
      createPart('Initial Definition', '', node.initialDefinition, node, node)
      createPart('Stop', 'Initial Stop', node.initialDefinition.stopLoss, node.initialDefinition, node.initialDefinition)
      createPart('Take Profit', 'Initial Take Profit', node.initialDefinition.takeProfit, node.initialDefinition, node.initialDefinition)
      createPart('Position Size', '', node.initialDefinition.positionSize, node.initialDefinition, node.initialDefinition)
      createPart('Formula', '', node.initialDefinition.positionSize.formula, node.initialDefinition.positionSize, node.initialDefinition.positionSize)
      createPart('Position Rate', '', node.initialDefinition.positionRate, node.initialDefinition, node.initialDefinition)
      createPart('Formula', '', node.initialDefinition.positionRate.formula, node.initialDefinition.positionRate, node.initialDefinition.positionRate)
    }

    return node.initialDefinition
  }

  function addOpenExecution (node) {
    if (node.openExecution === undefined) {
      node.openExecution = {}
      createPart('Open Execution', '', node.openExecution, node, node)
    }

    return node.openExecution
  }

  function addCloseExecution (node) {
    if (node.closeExecution === undefined) {
      node.closeExecution = {}
      createPart('Close Execution', '', node.closeExecution, node, node)
    }

    return node.closeExecution
  }

  function addFormula (node) {
    if (node.formula === undefined) {
      node.formula = {
        code: DEFAULT_FORMULA_TEXT
      }
      createPart('Formula', '', node.formula, node, node)
    }

    return node.formula
  }

  function addNextPhaseEvent (node) {
    if (node.nextPhaseEvent === undefined) {
      node.nextPhaseEvent = {
        situations: [],
        announcements: []
      }
      createPart('Next Phase Event', '', node.nextPhaseEvent, node, node)
    }

    return node.nextPhaseEvent
  }

  function addCode (node) {
    if (node.code === undefined) {
      node.code = {
        code: DEFAULT_CODE_TEXT
      }
      createPart('Code', '', node.code, node, node)
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
    createPart('Phase', phase.name, phase, phaseParent, phaseChainParent, 'Phase')
    createPart('Formula', '', phase.formula, phase, phase, 'Formula')
    createPart('Next Phase Event', '', phase.nextPhaseEvent, phase, phase)

    return phase
  }

  function addSituation (parentNode) {
    let m = parentNode.situations.length
    let situation = {
      name: 'New Situation',
      conditions: []
    }
    parentNode.situations.push(situation)
    createPart('Situation', situation.name, situation, parentNode, parentNode, 'Situation')

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
    createPart('Condition', condition.name, condition, situation, situation, 'Condition')
    createPart('Code', '', condition.code, condition, condition, 'Code')

    return condition
  }

  function createPart (partType, name, node, parentNode, chainParent, title) {
    let payload = {}

    if (name === '' || name === undefined) { name = 'My ' + partType }
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
        if (partType === 'Workspace' || partType === 'Trading System') {
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
      payload.subTitle = partType
    }

    payload.visible = true
    payload.title = name
    payload.node = node
    payload.parentNode = parentNode
    payload.chainParent = chainParent
    payload.onMenuItemClick = canvas.strategySpace.workspace.onMenuItemClick

    if (node.id === undefined) {
      node.id = newUniqueId()
    }
    node.payload = payload
    node.type = partType
    canvas.floatingSpace.strategyPartConstructor.createStrategyPart(payload)
  }
}
