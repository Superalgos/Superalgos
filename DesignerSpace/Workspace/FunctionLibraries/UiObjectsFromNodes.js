function newUiObjectsFromNodes () {
  thisObject = {
    recreateWorkspace: recreateWorkspace,
    tryToConnectChildrenWithReferenceParents: tryToConnectChildrenWithReferenceParents,
    createUiObjectFromNode: createUiObjectFromNode,
    addUIObject: addUIObject,
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
    addJavascriptCode: addJavascriptCode
  }

  let mapOfReferenceChildren = new Map()
  let mapOfNodes

  return thisObject

  function recreateWorkspace (node) {
    mapOfNodes = new Map()

   /* Create the workspace UI OBject and then continue with the root nodes. */
    createUiObject(false, 'Workspace', node.name, node, undefined, undefined, 'Workspace')
    if (node.rootNodes !== undefined) {
      for (let i = 0; i < node.rootNodes.length; i++) {
        let rootNode = node.rootNodes[i]
        createUiObjectFromNode(rootNode, undefined, undefined)
      }
    }

    tryToConnectChildrenWithReferenceParents()
  }

  function tryToConnectChildrenWithReferenceParents () {
    /* We reconstruct here the reference relationships. */
    for (const [key, node] of mapOfNodes) {
      if (node.payload === undefined) { continue }
      if (node.payload.referenceParent !== undefined) {
        if (node.payload.referenceParent.cleaned === true) {
          node.payload.referenceParent = mapOfNodes.get(node.payload.referenceParent.id)
          continue  // We were referencing a deleted node, so we replace it potentially with a newly created one.
        } else {
          continue  // In this case the reference is already good.
        }
      }
      if (node.savedPayload !== undefined) {
        if (node.savedPayload.referenceParent !== undefined) { // these are children recreated
          node.payload.referenceParent = mapOfNodes.get(node.savedPayload.referenceParent.id)
        }
      }
    }
  }

  function createUiObjectFromNode (node, parentNode, chainParent, positionOffset) {
    /* Get node definition */
    let nodeDefinition = APP_SCHEMA_MAP.get(node.type)
    if (nodeDefinition !== undefined) {
      /* Resolve Initial Values */
      if (nodeDefinition.initialValues !== undefined) {
        if (nodeDefinition.initialValues.code !== undefined) {
          if (node.code === undefined) {
            node.code = nodeDefinition.initialValues.code
          }
        }
      }

      /* Create Self */
      createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)

      /* Create Children */
      if (nodeDefinition.properties !== undefined) {
        let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
          let property = nodeDefinition.properties[i]
          if (node[property.name] !== undefined) {
            switch (property.type) {
              case 'node': {
                if (property.name !== previousPropertyName) {
                  createUiObjectFromNode(node[property.name], node, node, positionOffset)
                  previousPropertyName = property.name
                }
              }
                break
              case 'array': {
                let nodePropertyArray = node[property.name]
                for (let m = 0; m < nodePropertyArray.length; m++) {
                  let arrayItem = nodePropertyArray[m]
                  createUiObjectFromNode(arrayItem, node, node, positionOffset)
                }
              }
                break
            }
          }
        }
      }
    }
  }

  function addUIObject (parent, type) {
    let object = {
      name: 'New ' + type,
      type: type
    }

    createUiObject(true, object.type, object.name, object, parent, parent)

    let parentNodeDefinition = APP_SCHEMA_MAP.get(parent.type)
    if (parentNodeDefinition !== undefined) {
      /* Resolve Initial Values */
      let nodeDefinition = APP_SCHEMA_MAP.get(object.type)
      if (nodeDefinition !== undefined) {
        if (nodeDefinition.initialValues !== undefined) {
          if (nodeDefinition.initialValues.code !== undefined) {
            object.code = nodeDefinition.initialValues.code
          }
        }
      }

      /* Connect to Parent */
      if (parentNodeDefinition.properties !== undefined) {
        for (let i = 0; i < parentNodeDefinition.properties.length; i++) {
          let property = parentNodeDefinition.properties[i]
          if (property.childType === type) {
            switch (property.type) {
              case 'node': {
                parent[property.name] = object
              }
                break
              case 'array': {
                if (parent[property.name] === undefined) {
                  parent[property.name] = []
                }
                parent[property.name].push(object)
              }
                break
            }
          }
        }
      }
    }
    return object
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
      code: '{}'
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
        name: 'New Status Report'
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
        name: 'New Execution Finished Event'
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
      code: '{ \n\"mainUtility\": \"Self Reference|Market Starting Point|Market Ending Point\"\n}'
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
      code: '{}'
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
      code: '{}',
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
      code: '{}',
      panels: []
    }
    if (node.modules === undefined) {
      node.modules = []
    }
    node.modules.push(object)
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
      name: 'New Definition'
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
      code: '{ \n\"name\": \"Paste your exchange API here\",\n"secret\": \"Paste your exchange API secret key here. Exchange keys are filtered out and NOT exported when using the SHARE menu option on any node at your workspace. Exchange keys ARE downloaded when using the DOWNLOAD button or the CLONE button.\"\n}'
    }
    if (exchangeAccount.keys !== undefined) {
      exchangeAccount.keys.push(key)
    } else {
      exchangeAccount.key = key
    }

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
        code: '{ \n\"value\": \"01-hs\"\n}'
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

  function addJavascriptCode (node) {
    if (node.javascriptCode === undefined) {
      node.javascriptCode = {
        code: DEFAULT_CODE_TEXT
      }
      createUiObject(true, 'Javascript Code', '', node.javascriptCode, node, node)
    }

    return node.javascriptCode
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
    createUiObject(true, 'Javascript Code', '', condition.code, condition, condition, 'Javascript Code')

    return condition
  }

  function createUiObject (userAddingNew, uiObjectType, name, node, parentNode, chainParent, title, positionOffset) {
    let payload = {}

    /* Mechanism related to keeping references when cloning */
    if (node.id === undefined) {
      node.id = newUniqueId()
    } else {
      let testNode = mapOfNodes.get(node.id)
      if (testNode !== undefined && testNode.cleaned !== true) {
        node.id = newUniqueId()
      }
    }

    /* Default Naming */
    if (name === '' || name === undefined) { name = 'My ' + uiObjectType }

    /* If we are creating this object as the result of restoring a backup, share or clone, we will bring some of the saved properties to the new running instance. */
    if (userAddingNew === false && uiObjectType !== 'Workspace') {
      /* This following info can not be missing. */
      if (node.savedPayload === undefined) {
        console.log('Node ' + node.type + ' without savedPayload.', node)
        return
      }
      if (node.savedPayload.position === undefined) {
        console.log('Node ' + node.type + ' without savedPayload.position.', node)
        return
      }
      if (node.savedPayload.targetPosition === undefined) {
        console.log('Node ' + node.type + ' without savedPayload.targetPosition.', node)
        return
      }

      console.log('Node ' + node.type + ' CREATED WITH NO PROBLEMS.')

      /* If there is not a position offset, which happens when we are dropping a node into the designer, we create a cero vector then. */
      if (positionOffset === undefined) {
        positionOffset = {
          x: 0,
          y: 0
        }
      }

      /* Adding the offset to the saved positions. */
      node.savedPayload.targetPosition.x = node.savedPayload.targetPosition.x + positionOffset.x
      node.savedPayload.targetPosition.y = node.savedPayload.targetPosition.y + positionOffset.y
      node.savedPayload.position.x = node.savedPayload.position.x + positionOffset.x
      node.savedPayload.position.y = node.savedPayload.position.y + positionOffset.y

      /* Transferring the saved payload properties into the running instance being created. */
      payload.targetPosition = {
        x: node.savedPayload.targetPosition.x,
        y: node.savedPayload.targetPosition.y
      }
      node.savedPayload.targetPosition = undefined

      /* Reference children connection to parents */
      if (node.savedPayload.referenceParent !== undefined) {
        payload.referenceParent = mapOfNodes.get(node.savedPayload.referenceParent.id)

        if (payload.referenceParent !== undefined) {
          mapOfReferenceChildren.set(node.id, node)
        }
      }
    }

    /* If we are adding a new object, then we set the initial values for position and targetPosition */
    if (userAddingNew === true || uiObjectType === 'Workspace') {
      /* Workspace allways to the spawn position */
      if (uiObjectType === 'Workspace') {
        payload.position = {
          x: spawnPosition.x,
          y: spawnPosition.y
        }
      }

      /* Chain parent pointing to the position of the chain parent if defined. */
      if (chainParent === undefined) {
        payload.targetPosition = {
          x: spawnPosition.x,
          y: spawnPosition.y
        }
      } else {
        payload.targetPosition = {
          x: chainParent.payload.position.x,
          y: chainParent.payload.position.y
        }
      }
    }

    /* Setting the title */
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

    node.payload = payload
    node.type = uiObjectType

    /* Now we mount the floating object where the UIOBject will be laying on top of */
    canvas.floatingSpace.uiObjectConstructor.createUiObject(userAddingNew, payload)

    mapOfNodes.set(node.id, node)
  }
}
