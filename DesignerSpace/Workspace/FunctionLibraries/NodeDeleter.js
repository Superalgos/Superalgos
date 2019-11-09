function newNodeDeleter () {
  thisObject = {
    deleteDefinition: deleteDefinition,
    deleteNetwork: deleteNetwork,
    deleteNetworkNode: deleteNetworkNode,
    deleteTeam: deleteTeam,
    deleteSensorBot: deleteSensorBot,
    deleteIndicatorBot: deleteIndicatorBot,
    deleteTradingBot: deleteTradingBot,
    deleteProcessDefinition: deleteProcessDefinition,
    deleteStatusReport: deleteStatusReport,
    deleteExecutionStartedEvent: deleteExecutionStartedEvent,
    deleteExecutionFinishedEvent: deleteExecutionFinishedEvent,
    deleteCalculationsProcedure: deleteCalculationsProcedure,
    deleteDataBuildingProcedure: deleteDataBuildingProcedure,
    deleteProcedureInitialization: deleteProcedureInitialization,
    deleteProcessDependencies: deleteProcessDependencies,
    deleteProcedureLoop: deleteProcedureLoop,
    deleteOutputDataset: deleteOutputDataset,
    deleteStatusDependency: deleteStatusDependency,
    deleteDataDependency: deleteDataDependency,
    deleteProductDefinition: deleteProductDefinition,
    deleteRecordDefinition: deleteRecordDefinition,
    deleteRecordProperty: deleteRecordProperty,
    deleteDatasetDefinition: deleteDatasetDefinition,
    deletePlotter: deletePlotter,
    deletePlotterModule: deletePlotterModule,
    deletePlotterPanel: deletePlotterPanel,
    deleteSocialBots: deleteSocialBots,
    deleteSocialBot: deleteSocialBot,
    deleteAnnouncement: deleteAnnouncement,
    deleteLayerManager: deleteLayerManager,
    deleteLayer: deleteLayer,
    deleteTaskManager: deleteTaskManager,
    deleteTask: deleteTask,
    deleteSensorBotInstance: deleteBotInstance,
    deleteIndicatorBotInstance: deleteBotInstance,
    deleteTradingBotInstance: deleteBotInstance,
    deleteProcessInstance: deleteProcessInstance,
    deletePersonalData: deletePersonalData,
    deleteExchangeAccount: deleteExchangeAccount,
    deleteExchangeAccountAsset: deleteExchangeAccountAsset,
    deleteExchangeAccountKey: deleteExchangeAccountKey,
    deleteWorkspace: deleteWorkspace,
    deleteTradingSystem: deleteTradingSystem,
    deleteBacktestingSession: deleteBacktestingSession,
    deleteLiveTradingSession: deleteLiveTradingSession,
    deleteFordwardTestingSession: deleteFordwardTestingSession,
    deletePaperTradingSession: deletePaperTradingSession,
    deleteParameters: deleteParameters,
    deleteBaseAsset: deleteBaseAsset,
    deleteTimeRange: deleteTimeRange,
    deleteTimePeriod: deleteTimePeriod,
    deleteSlippage: deleteSlippage,
    deleteFeeStructure: deleteFeeStructure,
    deleteStrategy: deleteStrategy,
    deleteTriggerStage: deleteTriggerStage,
    deleteOpenStage: deleteOpenStage,
    deleteManageStage: deleteManageStage,
    deleteCloseStage: deleteCloseStage,
    deletePositionSize: deletePositionSize,
    deletePositionRate: deletePositionRate,
    deleteInitialDefinition: deleteInitialDefinition,
    deleteOpenExecution: deleteOpenExecution,
    deleteCloseExecution: deleteCloseExecution,
    deleteEvent: deleteEvent,
    deleteManagedItem: deleteManagedItem,
    deletePhase: deletePhase,
    deleteFormula: deleteFormula,
    deleteSituation: deleteSituation,
    deleteCondition: deleteCondition,
    deleteCode: deleteCode
  }

  return thisObject

  function destroyUiObject (node) {
    canvas.floatingSpace.uiObjectConstructor.destroyUiObject(node.payload)
  }

  function deleteWorkspace (node, rootNodes) {
    if (node.rootNodes !== undefined) {
      while (node.rootNodes.length > 0) {
        let rootNode = node.rootNodes[0]
        switch (rootNode.type) {

          case 'Definition': {
            deleteDefinition(rootNode, rootNodes, true)
            break
          }
          case 'Network': {
            deleteNetwork(rootNode, rootNodes)
            break
          }
          case 'Network Node': {
            deleteNetworkNode(rootNode, rootNodes)
            break
          }
          case 'Team': {
            deleteTeam(rootNode, rootNodes)
            break
          }
          case 'Sensor Bot': {
            deleteSensorBot(rootNode, rootNodes)
            break
          }
          case 'Indicator Bot': {
            deleteIndicatorBot(rootNode, rootNodes)
            break
          }
          case 'Trading Bot': {
            deleteTradingBot(rootNode, rootNodes)
            break
          }
          case 'Process Definition': {
            deleteProcessDefinition(rootNode, rootNodes)
            break
          }
          case 'Process Output': {
            deleteProcessOutput(rootNode, rootNodes)
            break
          }
          case 'Process Dependencies': {
            deleteProcessDependencies(rootNode, rootNodes)
            break
          }
          case 'Status Report': {
            deleteStatusReport(rootNode, rootNodes)
            break
          }
          case 'Execution Started Event': {
            deleteExecutionStartedEvent(rootNode, rootNodes)
            break
          }
          case 'Execution Finished Event': {
            deleteExecutionFinishedEvent(rootNode, rootNodes)
            break
          }
          case 'Calculations Procedure': {
            deleteCalculationsProcedure(rootNode, rootNodes)
            break
          }
          case 'Data Building Procedure': {
            deleteDataBuildingProcedure(rootNode, rootNodes)
            break
          }
          case 'Procedure Initialization': {
            deleteProcedureInitialization(rootNode, rootNodes)
            break
          }
          case 'Procedure Loop': {
            deleteProcedureLoop(rootNode, rootNodes)
            break
          }
          case 'Output Dataset': {
            deleteOutputDataset(rootNode, rootNodes)
            break
          }
          case 'Status Dependency': {
            deleteStatusDependency(rootNode, rootNodes)
            break
          }
          case 'Data Dependency': {
            deleteDataDependency(rootNode, rootNodes)
            break
          }
          case 'Product Definition': {
            deleteProductDefinition(rootNode, rootNodes)
            break
          }
          case 'Record Definition': {
            deleteRecordDefinition(rootNode, rootNodes)
            break
          }
          case 'Record Property': {
            deleteRecordProperty(rootNode, rootNodes)
            break
          }
          case 'Dataset Definition': {
            deleteDatasetDefinition(rootNode, rootNodes)
            break
          }
          case 'Plotter': {
            deletePlotter(rootNode, rootNodes)
            break
          }
          case 'Plotter Module': {
            deletePlotterModule(rootNode, rootNodes)
            break
          }
          case 'Plotter Panel': {
            deletePlotterPanel(rootNode, rootNodes)
            break
          }
          case 'Social Bots': {
            deleteSocialBots(rootNode, rootNodes)
            break
          }
          case 'Telegram Bot': {
            deleteSocialBot(rootNode, rootNodes)
            break
          }
          case 'Announcement': {
            deleteAnnouncement(rootNode, rootNodes)
            break
          }
          case 'Layer Manager': {
            deleteLayerManager(rootNode, rootNodes)
            break
          }
          case 'Layer': {
            deleteLayer(rootNode, rootNodes)
            break
          }
          case 'Task Manager': {
            deleteTaskManager(rootNode, rootNodes)
            break
          }
          case 'Task': {
            deleteTask(rootNode, rootNodes)
            break
          }
          case 'Sensor Bot Instance': {
            deleteBotInstance(rootNode, rootNodes)
            break
          }
          case 'Indicator Bot Instance': {
            deleteBotInstance(rootNode, rootNodes)
            break
          }
          case 'Trading Bot Instance': {
            deleteBotInstance(rootNode, rootNodes)
            break
          }
          case 'Process Instance': {
            deleteProcessInstance(rootNode, rootNodes)
            break
          }
          case 'Personal Data': {
            deletePersonalData(rootNode, rootNodes)
            break
          }
          case 'Exchange Account': {
            deleteExchangeAccount(rootNode, rootNodes)
            break
          }
          case 'Exchange Account Asset': {
            deleteExchangeAccountAsset(rootNode, rootNodes)
            break
          }
          case 'Exchange Account Key': {
            deleteExchangeAccountKey(rootNode, rootNodes)
            break
          }
          case 'Trading System': {
            deleteTradingSystem(rootNode, rootNodes)
            break
          }
          case 'Backtesting Session': {
            deleteBacktestingSession(rootNode, rootNodes)
            break
          }
          case 'Live Trading Session': {
            deleteLiveTradingSession(rootNode, rootNodes)
            break
          }
          case 'Fordward Testing Session': {
            deleteFordwardTestingSession(rootNode, rootNodes)
            break
          }
          case 'Paper Trading Session': {
            deletePaperTradingSession(rootNode, rootNodes)
            break
          }
          case 'Parameters': {
            deleteParameters(rootNode, rootNodes)
            break
          }
          case 'Base Asset': {
            deleteBaseAsset(rootNode, rootNodes)
            break
          }
          case 'Time Range': {
            deleteTimeRange(rootNode, rootNodes)
            break
          }
          case 'Time Period': {
            deleteTimePeriod(rootNode, rootNodes)
            break
          }
          case 'Slippage': {
            deleteSlippage(rootNode, rootNodes)
            break
          }
          case 'Fee Structure': {
            deleteFeeStructure(rootNode, rootNodes)
            break
          }
          case 'Strategy': {
            deleteStrategy(rootNode, rootNodes)
            break
          }
          case 'Trigger Stage': {
            deleteTriggerStage(rootNode, rootNodes)
            break
          }
          case 'Open Stage': {
            deleteOpenStage(rootNode, rootNodes)
            break
          }
          case 'Manage Stage': {
            deleteManageStage(rootNode, rootNodes)
            break
          }
          case 'Close Stage': {
            deleteCloseStage(rootNode, rootNodes)
            break
          }
          case 'Position Size': {
            deletePositionSize(rootNode, rootNodes)
            break
          }
          case 'Position Rate': {
            deletePositionRate(rootNode, rootNodes)
            break
          }
          case 'Initial Definition': {
            deleteInitialDefinition(rootNode, rootNodes)
            break
          }
          case 'Open Execution': {
            deleteOpenExecution(rootNode, rootNodes)
            break
          }
          case 'Close Execution': {
            deleteCloseExecution(rootNode, rootNodes)
            break
          }
          case 'Trigger On Event': {
            deleteEvent(rootNode, rootNodes)
            break
          }
          case 'Trigger Off Event': {
            deleteEvent(rootNode, rootNodes)
            break
          }
          case 'Take Position Event': {
            deleteEvent(rootNode, rootNodes)
            break
          }
          case 'Next Phase Event': {
            deleteEvent(rootNode, rootNodes)
            break
          }
          case 'Managed Item': {
            deleteManagedItem(rootNode, rootNodes)
            break
          }
          case 'Phase': {
            deletePhase(rootNode, rootNodes)
            break
          }
          case 'Formula': {
            deleteFormula(rootNode, rootNodes)
            break
          }
          case 'Situation': {
            deleteSituation(rootNode, rootNodes)
            break
          }
          case 'Condition': {
            deleteCondition(rootNode, rootNodes)
            break
          }
          case 'Code': {
            deleteCode(rootNode, rootNodes)
            break
          }

          default: {
            console.log('WARNING this node type is not listed at NodeDeleter: ' + rootNode.type)
          }
        }
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteDefinition (node, rootNodes) {
    let payload = node.payload

    if (node.tradingSystem !== undefined) {
      deleteTradingSystem(node.tradingSystem, rootNodes)
    }
    if (node.personalData !== undefined) {
      deletePersonalData(node.personalData, rootNodes)
    }
    for (let i = 0; i < node.referenceChildren.length; i++) {
      let child = node.referenceChildren[i]
      child.payload.referenceParent = undefined
    }
    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteNetwork (node, rootNodes) {
    let payload = node.payload

    if (node.networkNodes !== undefined) {
      while (node.networkNodes.length > 0) {
        deleteNetworkNode(node.networkNodes[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteNetworkNode (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.networkNodes.length; j++) {
        let networkNode = payload.parentNode.networkNodes[j]
        if (networkNode.id === node.id) {
          payload.parentNode.networkNodes.splice(j, 1)
        }
      }
    }

    if (node.taskManagers !== undefined) {
      while (node.taskManagers.length > 0) {
        deleteTaskManager(node.taskManagers[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteTeam (node, rootNodes) {
    let payload = node.payload

    if (node.sensorBots !== undefined) {
      while (node.sensorBots.length > 0) {
        deleteSensorBot(node.sensorBots[0], rootNodes)
      }
    }

    if (node.indicatorBots !== undefined) {
      while (node.indicatorBots.length > 0) {
        deleteIndicatorBot(node.indicatorBots[0], rootNodes)
      }
    }

    if (node.tradingBots !== undefined) {
      while (node.tradingBots.length > 0) {
        deleteTradingBot(node.tradingBots[0], rootNodes)
      }
    }

    if (node.plotters !== undefined) {
      while (node.plotters.length > 0) {
        deletePlotter(node.plotters[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteSensorBot (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.sensorBots.length; j++) {
        let sensorBot = payload.parentNode.sensorBots[j]
        if (sensorBot.id === node.id) {
          payload.parentNode.sensorBots.splice(j, 1)
        }
      }
    }

    if (node.processes !== undefined) {
      while (node.processes.length > 0) {
        deleteProcessDefinition(node.processes[0], rootNodes)
      }
    }

    if (node.products !== undefined) {
      while (node.products.length > 0) {
        deleteProductDefinition(node.products[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteIndicatorBot (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.indicatorBots.length; j++) {
        let indicatorBot = payload.parentNode.indicatorBots[j]
        if (indicatorBot.id === node.id) {
          payload.parentNode.indicatorBots.splice(j, 1)
        }
      }
    }

    if (node.processes !== undefined) {
      while (node.processes.length > 0) {
        deleteProcessDefinition(node.processes[0], rootNodes)
      }
    }

    if (node.products !== undefined) {
      while (node.products.length > 0) {
        deleteProductDefinition(node.products[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteTradingBot (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.tradingBots.length; j++) {
        let tradingBot = payload.parentNode.tradingBots[j]
        if (tradingBot.id === node.id) {
          payload.parentNode.tradingBots.splice(j, 1)
        }
      }
    }

    if (node.processes !== undefined) {
      while (node.processes.length > 0) {
        deleteProcessDefinition(node.processes[0], rootNodes)
      }
    }

    if (node.products !== undefined) {
      while (node.products.length > 0) {
        deleteProductDefinition(node.products[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteProcessDefinition (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.processes.length; j++) {
        let process = payload.parentNode.processes[j]
        if (process.id === node.id) {
          payload.parentNode.processes.splice(j, 1)
        }
      }
    }

    if (node.processOutput !== undefined) {
      deleteProcessOutput(node.processOutput, rootNodes)
    }

    if (node.processDependencies !== undefined) {
      deleteProcessDependencies(node.processDependencies, rootNodes)
    }

    if (node.statusReport !== undefined) {
      deleteStatusReport(node.statusReport, rootNodes)
    }

    if (node.executionStartedEvent !== undefined) {
      deleteExecutionStartedEvent(node.executionStartedEvent, rootNodes)
    }

    if (node.executionFinishedEvent !== undefined) {
      deleteExecutionFinishedEvent(node.executionFinishedEvent, rootNodes)
    }

    if (node.calculations !== undefined) {
      deleteCalculationsProcedure(node.calculations, rootNodes)
    }

    if (node.dataBuilding !== undefined) {
      deleteDataBuildingProcedure(node.dataBuilding, rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteProcessOutput (node, rootNodes) {
    let payload = node.payload

    if (node.outputDatasets !== undefined) {
      while (node.outputDatasets.length > 0) {
        deleteOutputDataset(node.outputDatasets[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteProcessDependencies (node, rootNodes) {
    let payload = node.payload

    if (node.statusDependencies !== undefined) {
      while (node.statusDependencies.length > 0) {
        deleteStatusDependency(node.statusDependencies[0], rootNodes)
      }
    }

    if (node.dataDependencies !== undefined) {
      while (node.dataDependencies.length > 0) {
        deleteDataDependency(node.dataDependencies[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteStatusReport (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.statusReport = undefined
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteExecutionStartedEvent (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.executionStartedEvent = undefined
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteExecutionFinishedEvent (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.executionFinishedEvent = undefined
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteCalculationsProcedure (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.calculations = undefined
    }

    if (node.initialization !== undefined) {
      deleteProcedureInitialization(node.initialization, rootNodes)
    }

    if (node.loop !== undefined) {
      deleteProcedureLoop(node.loop, rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteDataBuildingProcedure (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.dataBuilding = undefined
    }

    if (node.initialization !== undefined) {
      deleteProcedureInitialization(node.initialization, rootNodes)
    }

    if (node.loop !== undefined) {
      deleteProcedureLoop(node.loop, rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteProcedureInitialization (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.initialization = undefined
    }

    if (node.code !== undefined) {
      deleteParameters(node.code, rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteProcedureLoop (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.loop = undefined
    }

    if (node.code !== undefined) {
      deleteCode(node.code, rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteOutputDataset (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.outputDatasets.length; j++) {
        let outputDataset = payload.parentNode.outputDatasets[j]
        if (outputDataset.id === node.id) {
          payload.parentNode.outputDatasets.splice(j, 1)
        }
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteStatusDependency (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.statusDependencies.length; j++) {
        let statusDependency = payload.parentNode.statusDependencies[j]
        if (statusDependency.id === node.id) {
          payload.parentNode.statusDependencies.splice(j, 1)
        }
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteDataDependency (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.dataDependencies.length; j++) {
        let dataDependency = payload.parentNode.dataDependencies[j]
        if (dataDependency.id === node.id) {
          payload.parentNode.dataDependencies.splice(j, 1)
        }
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteProductDefinition (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.products.length; j++) {
        let product = payload.parentNode.products[j]
        if (product.id === node.id) {
          payload.parentNode.products.splice(j, 1)
        }
      }
    }

    if (node.record !== undefined) {
      deleteRecordDefinition(node.record, rootNodes)
    }

    if (node.datasets !== undefined) {
      while (node.datasets.length > 0) {
        deleteDatasetDefinition(node.datasets[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteRecordDefinition (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.record = undefined
    }

    if (node.properties !== undefined) {
      while (node.properties.length > 0) {
        deleteRecordProperty(node.properties[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteRecordProperty (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.properties.length; j++) {
        let property = payload.parentNode.properties[j]
        if (property.id === node.id) {
          payload.parentNode.properties.splice(j, 1)
        }
      }
    }

    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteDatasetDefinition (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.datasets.length; j++) {
        let dataset = payload.parentNode.datasets[j]
        if (dataset.id === node.id) {
          payload.parentNode.datasets.splice(j, 1)
        }
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deletePlotter (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.plotters.length; j++) {
        let plotter = payload.parentNode.plotters[j]
        if (plotter.id === node.id) {
          payload.parentNode.plotters.splice(j, 1)
        }
      }
    }

    if (node.modules !== undefined) {
      while (node.modules.length > 0) {
        deletePlotterModule(node.modules[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deletePlotterModule (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.modules.length; j++) {
        let module = payload.parentNode.modules[j]
        if (module.id === node.id) {
          payload.parentNode.modules.splice(j, 1)
        }
      }
    }

    if (node.code !== undefined) {
      deleteCode(node.code, rootNodes)
    }

    if (node.panels !== undefined) {
      while (node.panels.length > 0) {
        deletePlotterPanel(node.panels[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deletePlotterPanel (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.panels.length; j++) {
        let panel = payload.parentNode.panels[j]
        if (panel.id === node.id) {
          payload.parentNode.panels.splice(j, 1)
        }
      }
    }

    if (node.code !== undefined) {
      deleteCode(node.code, rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteSocialBots (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.socialBots = undefined
    }
    if (node.bots !== undefined) {
      while (node.bots.length > 0) {
        deleteSocialBot(node.bots[0], rootNodes)
      }
    }
    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteSocialBot (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.bots.length; j++) {
        let bot = payload.parentNode.bots[j]
        if (bot.id === node.id) {
          payload.parentNode.bots.splice(j, 1)
        }
      }
    }
    if (node.announcements !== undefined) {
      while (node.announcements.length > 0) {
        deleteAnnouncement(node.announcements[0], rootNodes)
      }
    }
    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteAnnouncement (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.announcements.length; j++) {
        let announcement = payload.parentNode.announcements[j]
        if (announcement.id === node.id) {
          payload.parentNode.announcements.splice(j, 1)
        }
      }
    }
    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
    }
    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteLayerManager (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.layerManager = undefined
    }
    if (node.layers !== undefined) {
      while (node.layers.length > 0) {
        deleteLayer(node.layers[0], rootNodes)
      }
    }
    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteLayer (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.layers.length; j++) {
        let layer = payload.parentNode.layers[j]
        if (layer.id === node.id) {
          payload.parentNode.layers.splice(j, 1)
        }
      }
    }
    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteTaskManager (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.taskManagers.length; j++) {
        let taskManager = payload.parentNode.taskManagers[j]
        if (taskManager.id === node.id) {
          payload.parentNode.taskManagers.splice(j, 1)
        }
      }
    }
    if (node.tasks !== undefined) {
      while (node.tasks.length > 0) {
        deleteTask(node.tasks[0], rootNodes)
      }
    }
    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteTask (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.tasks.length; j++) {
        let task = payload.parentNode.tasks[j]
        if (task.id === node.id) {
          payload.parentNode.tasks.splice(j, 1)
        }
      }
    }
    if (node.bot !== undefined) {
      deleteBotInstance(node.bot, rootNodes)
    }
    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteBotInstance (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.bot = undefined
    }
    if (node.processes !== undefined) {
      while (node.processes.length > 0) {
        deleteProcessInstance(node.processes[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteProcessInstance (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.processes.length; j++) {
        let task = payload.parentNode.processes[j]
        if (task.id === node.id) {
          payload.parentNode.processes.splice(j, 1)
        }
      }
    }

    if (node.session !== undefined) {
      switch (node.session.type) {
        case 'Backtesting Session': {
          deleteBacktestingSession(node.session, rootNodes)
          break
        }
        case 'Live Trading Session': {
          deleteLiveTradingSession(node.session, rootNodes)
          break
        }
        case 'Fordward Testing Session': {
          deleteFordwardTestingSession(node.session, rootNodes)
          break
        }
        case 'Paper Trading Session': {
          deletePaperTradingSession(node.session, rootNodes)
          break
        }
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteBacktestingSession (node, rootNodes) {
    deleteSession(node, rootNodes)
  }

  function deleteLiveTradingSession (node, rootNodes) {
    deleteSession(node, rootNodes)
  }

  function deleteFordwardTestingSession (node, rootNodes) {
    deleteSession(node, rootNodes)
  }

  function deletePaperTradingSession (node, rootNodes) {
    deleteSession(node, rootNodes)
  }

  function deleteSession (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.session = undefined
    }

    if (node.parameters !== undefined) {
      deleteParameters(node.parameters, rootNodes)
    }

    if (node.layerManager !== undefined) {
      deleteLayerManager(node.layerManager, rootNodes)
    }

    if (node.socialBots !== undefined) {
      deleteSocialBots(node.socialBots, rootNodes)
    }
    if (node.payload.referenceParent !== undefined) {
      for (let i = 0; i < node.payload.referenceParent.referenceChildren.length; i++) {
        let child = node.payload.referenceParent.referenceChildren[i]
        if (child.id === node.id) {
          node.payload.referenceParent.referenceChildren.splice(i, 1)
          return
        }
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deletePersonalData (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.personalData = undefined
    }

    if (node.exchangeAccounts !== undefined) {
      while (node.exchangeAccounts.length > 0) {
        deleteExchangeAccount(node.exchangeAccounts[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteExchangeAccount (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.exchangeAccounts.length; j++) {
        let exchangeAccount = payload.parentNode.exchangeAccounts[j]
        if (exchangeAccount.id === node.id) {
          payload.parentNode.exchangeAccounts.splice(j, 1)
        }
      }
    }
    if (node.assets !== undefined) {
      while (node.assets.length > 0) {
        deleteExchangeAccountAsset(node.assets[0], rootNodes)
      }
    }
    if (node.keys !== undefined) {
      while (node.keys.length > 0) {
        deleteExchangeAccountKey(node.keys[0], rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteExchangeAccountAsset (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.assets.length; j++) {
        let asset = payload.parentNode.assets[j]
        if (asset.id === node.id) {
          payload.parentNode.assets.splice(j, 1)
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteExchangeAccountKey (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      if (payload.parentNode.keys !== undefined) {
        for (let j = 0; j < payload.parentNode.keys.length; j++) {
          let key = payload.parentNode.keys[j]
          if (key.id === node.id) {
            payload.parentNode.keys.splice(j, 1)
          }
        }
      }
      if (payload.parentNode.key !== undefined) {
        payload.parentNode.key = undefined
      }
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteTradingSystem (node, rootNodes) {
    let payload = node.payload

    if (payload.parentNode !== undefined) {
      payload.parentNode.tradingSystem = undefined
    }

    if (node.strategies !== undefined) {
      while (node.strategies.length > 0) {
        deleteStrategy(node.strategies[0], rootNodes)
      }
    }

    if (node.parameters !== undefined) {
      deleteParameters(node.parameters, rootNodes)
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteParameters (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.parameters = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.baseAsset !== undefined) {
      deleteBaseAsset(node.baseAsset, rootNodes)
    }
    if (node.timeRange !== undefined) {
      deleteTimeRange(node.timeRange, rootNodes)
    }
    if (node.timePeriod !== undefined) {
      deleteTimePeriod(node.timePeriod, rootNodes)
    }
    if (node.slippage !== undefined) {
      deleteSlippage(node.slippage, rootNodes)
    }
    if (node.feeStructure !== undefined) {
      deleteFeeStructure(node.feeStructure, rootNodes)
    }
    if (node.key !== undefined) {
      deleteExchangeAccountKey(node.key, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteBaseAsset (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.baseAsset = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteTimeRange (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.timeRange = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteTimePeriod (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.timePeriod = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteSlippage (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.slippage = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteFeeStructure (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.feeStructure = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteStrategy (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.strategies.length; j++) {
        let strategy = payload.parentNode.strategies[j]
        if (strategy.id === node.id) {
          payload.parentNode.strategies.splice(j, 1)
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.triggerStage !== undefined) {
      deleteTriggerStage(node.triggerStage, rootNodes)
    }
    if (node.openStage !== undefined) {
      deleteOpenStage(node.openStage, rootNodes)
    }
    if (node.manageStage !== undefined) {
      deleteManageStage(node.manageStage, rootNodes)
    }
    if (node.closeStage !== undefined) {
      deleteCloseStage(node.closeStage, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteTriggerStage (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.triggerStage = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.triggerOn !== undefined) {
      deleteEvent(node.triggerOn, rootNodes)
    }
    if (node.triggerOff !== undefined) {
      deleteEvent(node.triggerOff, rootNodes)
    }
    if (node.takePosition !== undefined) {
      deleteEvent(node.takePosition, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteOpenStage (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.openStage = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.initialDefinition !== undefined) {
      deleteInitialDefinition(node.initialDefinition, rootNodes)
    }

    if (node.openExecution !== undefined) {
      deleteOpenExecution(node.openExecution, rootNodes)
    }

    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteManageStage (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.manageStage = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.stopLoss !== undefined) {
      deleteManagedItem(node.stopLoss, rootNodes)
    }
    if (node.takeProfit !== undefined) {
      deleteManagedItem(node.takeProfit, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteCloseStage (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.closeStage = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.closeExecution !== undefined) {
      deleteCloseExecution(node.closeExecution, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deletePositionSize (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.positionSize = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deletePositionRate (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.positionRate = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteInitialDefinition (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.initialDefinition = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.stopLoss !== undefined) {
      deleteManagedItem(node.stopLoss, rootNodes)
    }
    if (node.takeProfit !== undefined) {
      deleteManagedItem(node.takeProfit, rootNodes)
    }
    if (node.positionSize !== undefined) {
      deletePositionSize(node.positionSize, rootNodes)
    }
    if (node.positionRate !== undefined) {
      deletePositionSize(node.positionRate, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteOpenExecution (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.openExecution = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteCloseExecution (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.closeExecution = undefined
    } else {
      completeDeletion(node, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteEvent (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      switch (node.type) {
        case 'Trigger On Event': {
          payload.parentNode.triggerOn = undefined
          break
        }
        case 'Trigger Off Event': {
          payload.parentNode.triggerOff = undefined
          break
        }
        case 'Take Position Event': {
          payload.parentNode.takePosition = undefined
          break
        }
        case 'Next Phase Event': {
          payload.parentNode.nextPhaseEvent = undefined
          break
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }

    if (node.situations !== undefined) {
      while (node.situations.length > 0) {
        deleteSituation(node.situations[0], rootNodes)
      }
    }

    if (node.announcements !== undefined) {
      while (node.announcements.length > 0) {
        deleteAnnouncement(node.announcements[0], rootNodes)
      }
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteManagedItem (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      switch (node.type) {
        case 'Stop': {
          payload.parentNode.stopLoss = undefined
          break
        }
        case 'Take Profit': {
          payload.parentNode.takeProfit = undefined
          break
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }

    if (node.phases !== undefined) {
      while (node.phases.length > 0) {
        deletePhase(node.phases[0], rootNodes)
      }
    }

    destroyUiObject(node)
    cleanNode(node)
  }

  function deletePhase (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let k = 0; k < payload.parentNode.phases.length; k++) {
        let phase = payload.parentNode.phases[k]
        if (phase.id === node.id) {
      /* Before deleting this phase we need to give its chainParent to the next phase down the chain */
          if (k < payload.parentNode.phases.length - 1) {
            payload.parentNode.phases[k + 1].payload.chainParent = payload.chainParent
          }
      /* Continue destroying this phase */
          payload.parentNode.phases.splice(k, 1)
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }

    if (node.formula !== undefined) {
      deleteFormula(node.formula, rootNodes)
    }

    if (node.nextPhaseEvent !== undefined) {
      deleteEvent(node.nextPhaseEvent, rootNodes)
    }

    if (node.announcements !== undefined) {
      while (node.announcements.length > 0) {
        deleteAnnouncement(node.announcements[0], rootNodes)
      }
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteFormula (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.formula = undefined
    } else {
      completeDeletion(node, rootNodes)
    }

    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteSituation (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.situations.length; j++) {
        let situation = payload.parentNode.situations[j]
        if (situation.id === node.id) {
          if (situation.conditions !== undefined) {
            while (situation.conditions.length > 0) {
              let condition = situation.conditions[0]
              deleteCondition(condition, rootNodes)
            }
          }

          situation.conditions = []
          payload.parentNode.situations.splice(j, 1)
          destroyUiObject(situation)
          cleanNode(situation)
          return
        }
      }
    } else {
      if (node.conditions !== undefined) {
        while (node.conditions.length > 0) {
          let condition = node.conditions[0]
          deleteCondition(condition, rootNodes)
        }
      }

      node.conditions = []
      completeDeletion(node, rootNodes)
      destroyUiObject(node)
      cleanNode(node)
    }
  }

  function deleteCondition (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let i = 0; i < payload.parentNode.conditions.length; i++) {
        let condition = payload.parentNode.conditions[i]
        if (condition.id === node.id) {
          payload.parentNode.conditions.splice(i, 1)
        }
      }
    } else {
      completeDeletion(node, rootNodes)
    }
    if (node.code !== undefined) {
      deleteCode(node.code, rootNodes)
    }
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteCode (node, rootNodes) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.code = undefined
    } else {
      completeDeletion(node, rootNodes)
    }

    destroyUiObject(node)
    cleanNode(node)
  }

  function completeDeletion (node, rootNodes) {
    for (let i = 0; i < rootNodes.length; i++) {
      let rootNode = rootNodes[i]
      if (rootNode.id === node.id) {
        rootNodes.splice(i, 1)
        return
      }
    }
  }

  function cleanNode (node) {
    node.payload.targetPosition.x = undefined
    node.payload.targetPosition.y = undefined
    node.payload.visible = undefined
    node.payload.subTitle = undefined
    node.payload.title = undefined
    node.payload.node = undefined
    node.payload.parentNode = undefined
    node.payload.chainParent = undefined
    node.payload.onMenuItemClick = undefined
    node.handle = undefined
    node.payload = undefined
    node.cleaned = true
  }
}
