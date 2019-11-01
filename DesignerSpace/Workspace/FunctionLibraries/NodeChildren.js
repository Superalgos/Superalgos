function newNodeChildren () {
  thisObject = {
    childrenCount: childrenCount
  }

  return thisObject

  function childrenCount (parentNode, childNode) {
    switch (parentNode.type) {

      case 'Definition': {
        return countChildrenDefinition(parentNode, childNode)
      }
      case 'Network': {
        return countChildrenNetwork(parentNode, childNode)
      }
      case 'Team': {
        return countChildrenTeam(parentNode, childNode)
      }
      case 'Sensor Bot': {
        return countChildrenSensorBot(parentNode, childNode)
      }
      case 'Indicator Bot': {
        return countChildrenIndicatorBot(parentNode, childNode)
      }
      case 'Trading Bot': {
        return countChildrenTradingBot(parentNode, childNode)
      }
      case 'Process Definition': {
        return countChildrenProcessDefinition(parentNode, childNode)
      }
      case 'Status Rerport': {
        return countChildrenStatusRerport(parentNode, childNode)
      }
      case 'Execution Finished Event': {
        return countChildrenExecutionFinishedEvent(parentNode, childNode)
      }
      case 'Calculations Procedure': {
        return countChildrenCalculationsProcedure(parentNode, childNode)
      }
      case 'Data Building Procedure': {
        return countChildrenDataBuildingProcedure(parentNode, childNode)
      }
      case 'Procedure Initialization': {
        return countChildrenProcedureInitialization(parentNode, childNode)
      }
      case 'Procedure Loop': {
        return countChildrenProcedureLoop(parentNode, childNode)
      }
      case 'Output Dataset': {
        return countChildrenOutputDataset(parentNode, childNode)
      }
      case 'Status Dependency': {
        return countChildrenStatusDependency(parentNode, childNode)
      }
      case 'Data Dependency': {
        return countChildrenDataDependency(parentNode, childNode)
      }
      case 'Product Definition': {
        return countChildrenProductDefinition(parentNode, childNode)
      }
      case 'Record Definition': {
        return countChildrenRecordDefinition(parentNode, childNode)
      }
      case 'Record Property': {
        return countChildrenRecordProperty(parentNode, childNode)
      }
      case 'Dataset Definition': {
        return countChildrenDatasetDefinition(parentNode, childNode)
      }
      case 'Plotter': {
        return countChildrenPlotter(parentNode, childNode)
      }
      case 'Plotter Module': {
        return countChildrenPlotterModule(parentNode, childNode)
      }
      case 'Plotter Panel': {
        return countChildrenPlotterPanel(parentNode, childNode)
      }
      case 'Network Node': {
        return countChildrenNetworkNode(parentNode, childNode)
      }
      case 'Social Bots': {
        return countChildrenSocialBots(parentNode, childNode)
      }
      case 'Telegram Bot': {
        return countChildrenTelegramBot(parentNode, childNode)
      }
      case 'Announcement': {
        return countChildrenAnnouncement(parentNode, childNode)
      }
      case 'Layer Manager': {
        return countChildrenLayerManager(parentNode, childNode)
      }
      case 'Layer': {
        return countChildrenLayer(parentNode, childNode)
      }
      case 'Task Manager': {
        return countChildrenTaskManager(parentNode, childNode)
      }
      case 'Task': {
        return countChildrenTask(parentNode, childNode)
      }
      case 'Sensor Bot Instance': {
        return countChildrenSensorBotInstance(parentNode, childNode)
      }
      case 'Indicator Bot Instance': {
        return countChildrenIndicatorBotInstance(parentNode, childNode)
      }
      case 'Trading Bot Instance': {
        return countChildrenTradingBotInstance(parentNode, childNode)
      }
      case 'Process Instance': {
        return countChildrenProcessInstance(parentNode, childNode)
      }
      case 'Backtesting Session': {
        return countBacktestingSession(parentNode, childNode)
      }
      case 'Live Trading Session': {
        return countLiveTradingSession(parentNode, childNode)
      }
      case 'Fordward Testing Session': {
        return countFordwardTestingSession(parentNode, childNode)
      }
      case 'Paper Trading Session': {
        return countPaperTradingSession(parentNode, childNode)
      }
      case 'Personal Data': {
        return countChildrenPersonalData(parentNode, childNode)
      }
      case 'Exchange Account': {
        return countChildrenExchangeAccount(parentNode, childNode)
      }
      case 'Exchange Account Asset': {
        return countChildrenExchangeAccountAsset(parentNode, childNode)
      }
      case 'Exchange Account Key': {
        return countChildrenExchangeAccountKey(parentNode, childNode)
      }
      case 'Trading System': {
        return countChildrenTradingSystem(parentNode, childNode)
      }
      case 'Parameters': {
        return countChildrenParameters(parentNode, childNode)
      }
      case 'Base Asset': {
        return countChildrenBaseAsset(parentNode, childNode)
      }
      case 'Time Range': {
        return countChildrenTimeRange(parentNode, childNode)
      }
      case 'Time Period': {
        return countChildrenTimePeriod(parentNode, childNode)
      }
      case 'Slippage': {
        return countChildrenSlippage(parentNode, childNode)
      }
      case 'Fee Structure': {
        return countChildrenFeeStructure(parentNode, childNode)
      }
      case 'Strategy': {
        return countChildrenStrategy(parentNode, childNode)
      }
      case 'Trigger Stage': {
        return countChildrenTriggerStage(parentNode, childNode)
      }
      case 'Open Stage': {
        return countChildrenOpenStage(parentNode, childNode)
      }
      case 'Manage Stage': {
        return countChildrenManageStage(parentNode, childNode)
      }
      case 'Close Stage': {
        return countChildrenCloseStage(parentNode, childNode)
      }
      case 'Position Size': {
        return countChildrenPositionSize(parentNode, childNode)
      }
      case 'Position Rate': {
        return countChildrenPositionSize(parentNode, childNode)
      }
      case 'Initial Definition': {
        return countChildrenInitialDefinition(parentNode, childNode)
      }
      case 'Open Execution': {
        return countChildrenOpenExecution(parentNode, childNode)
      }
      case 'Close Execution': {
        return countChildrenCloseExecution(parentNode, childNode)
      }
      case 'Next Phase Event': {
        return countChildrenEvent(parentNode, childNode)
      }
      case 'Trigger On Event': {
        return countChildrenEvent(parentNode, childNode)
      }
      case 'Trigger Off Event': {
        return countChildrenEvent(parentNode, childNode)
      }
      case 'Take Position Event': {
        return countChildrenEvent(parentNode, childNode)
      }
      case 'Stop': {
        return countChildrenStop(parentNode, childNode)
      }
      case 'Take Profit': {
        return countChildrenTakeProfit(parentNode, childNode)
      }
      case 'Phase': {
        return countChildrenPhase(parentNode, childNode)
      }
      case 'Formula': {
        return countChildrenFormula(parentNode, childNode)
      }
      case 'Situation': {
        return countChildrenSituation(parentNode, childNode)
      }
      case 'Condition': {
        return countChildrenCondition(parentNode, childNode)
      }
      case 'Code': {
        return countChildrenCode(parentNode, childNode)
      }
      default: {
        console.log('WARNING this parentNode type is not listed at NodeChildren: ' + parentNode.type)
      }
    }
  }

  function countChildrenDefinition (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.tradingSystem !== undefined) {
      response.childrenCount++
      if (parentNode.tradingSystem.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.personalData !== undefined) {
      response.childrenCount++
      if (parentNode.personalData.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenNetwork (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.networkNodes !== undefined) {
      for (let i = 0; i < parentNode.networkNodes.length; i++) {
        let child = parentNode.networkNodes[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenTeam (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.sensorBots !== undefined) {
      for (let i = 0; i < parentNode.sensorBots.length; i++) {
        let child = parentNode.sensorBots[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    if (parentNode.indicatorBots !== undefined) {
      for (let i = 0; i < parentNode.indicatorBots.length; i++) {
        let child = parentNode.indicatorBots[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    if (parentNode.tradingBots !== undefined) {
      for (let i = 0; i < parentNode.tradingBots.length; i++) {
        let child = parentNode.tradingBots[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    if (parentNode.plotters !== undefined) {
      for (let i = 0; i < parentNode.plotters.length; i++) {
        let child = parentNode.plotters[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenSensorBot (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.processes !== undefined) {
      for (let i = 0; i < parentNode.processes.length; i++) {
        let child = parentNode.processes[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    if (parentNode.products !== undefined) {
      for (let i = 0; i < parentNode.products.length; i++) {
        let child = parentNode.products[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenIndicatorBot (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.processes !== undefined) {
      for (let i = 0; i < parentNode.processes.length; i++) {
        let child = parentNode.processes[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    if (parentNode.products !== undefined) {
      for (let i = 0; i < parentNode.products.length; i++) {
        let child = parentNode.products[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenTradingBot (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.processes !== undefined) {
      for (let i = 0; i < parentNode.processes.length; i++) {
        let child = parentNode.processes[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    if (parentNode.products !== undefined) {
      for (let i = 0; i < parentNode.products.length; i++) {
        let child = parentNode.products[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenProcessDefinition (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.statusReport !== undefined) {
      response.childrenCount++
      if (parentNode.statusReport.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.executionFinishedEvent !== undefined) {
      response.childrenCount++
      if (parentNode.executionFinishedEvent.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.calculations !== undefined) {
      response.childrenCount++
      if (parentNode.calculations.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.dataBuilding !== undefined) {
      response.childrenCount++
      if (parentNode.dataBuilding.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }

    if (parentNode.outputDatasets !== undefined) {
      for (let i = 0; i < parentNode.outputDatasets.length; i++) {
        let child = parentNode.outputDatasets[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    if (parentNode.statusDependencies !== undefined) {
      for (let i = 0; i < parentNode.statusDependencies.length; i++) {
        let child = parentNode.statusDependencies[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    if (parentNode.dataDependencies !== undefined) {
      for (let i = 0; i < parentNode.dataDependencies.length; i++) {
        let child = parentNode.dataDependencies[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenStatusRerport (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenExecutionFinishedEvent (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }
  function countChildrenCalculationsProcedure (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.initialization !== undefined) {
      response.childrenCount++
      if (parentNode.initialization.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.loop !== undefined) {
      response.childrenCount++
      if (parentNode.loop.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenDataBuildingProcedure (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.initialization !== undefined) {
      response.childrenCount++
      if (parentNode.initialization.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.loop !== undefined) {
      response.childrenCount++
      if (parentNode.loop.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenProcedureInitialization (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.code !== undefined) {
      response.childrenCount++
      if (parentNode.code.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenProcedureLoop (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.code !== undefined) {
      response.childrenCount++
      if (parentNode.code.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenOutputDataset (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenStatusDependency (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenDataDependency (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenProductDefinition (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.record !== undefined) {
      response.childrenCount++
      if (parentNode.record.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }

    if (parentNode.datasets !== undefined) {
      for (let i = 0; i < parentNode.datasets.length; i++) {
        let child = parentNode.datasets[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenRecordDefinition (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    if (parentNode.properties !== undefined) {
      for (let i = 0; i < parentNode.properties.length; i++) {
        let child = parentNode.properties[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenRecordProperty (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.formula !== undefined) {
      response.childrenCount++
      if (parentNode.formula.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenDatasetDefinition (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenPlotter (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.modules !== undefined) {
      for (let i = 0; i < parentNode.modules.length; i++) {
        let child = parentNode.modules[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenPlotterModule (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.code !== undefined) {
      response.childrenCount++
      if (parentNode.code.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.panels !== undefined) {
      for (let i = 0; i < parentNode.panels.length; i++) {
        let child = parentNode.panels[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenPlotterPanel (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.code !== undefined) {
      response.childrenCount++
      if (parentNode.code.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenNetworkNode (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.taskManagers !== undefined) {
      for (let i = 0; i < parentNode.taskManagers.length; i++) {
        let child = parentNode.taskManagers[i]
        response.childrenCount++
        if (child.id === childNode.id) {
          response.childIndex = response.childrenCount
        }
      }
    }
    return response
  }

  function countChildrenSocialBots (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.bots.length; i++) {
      let child = parentNode.bots[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenTelegramBot (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.announcements.length; i++) {
      let child = parentNode.announcements[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenAnnouncement (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.formula !== undefined) {
      response.childrenCount++
      if (parentNode.formula.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenLayerManager (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.layers.length; i++) {
      let child = parentNode.layers[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenLayer (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenTaskManager (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.tasks.length; i++) {
      let child = parentNode.tasks[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenTask (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.bot !== undefined) {
      response.childrenCount++
      if (parentNode.bot.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenSensorBotInstance (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.processes.length; i++) {
      let child = parentNode.processes[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenIndicatorBotInstance (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.processes.length; i++) {
      let child = parentNode.processes[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenTradingBotInstance (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.processes.length; i++) {
      let child = parentNode.processes[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenProcessInstance (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.session !== undefined) {
      response.childrenCount++
      if (parentNode.session.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countBacktestingSession (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.parameters !== undefined) {
      response.childrenCount++
      if (parentNode.parameters.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.layerManager !== undefined) {
      response.childrenCount++
      if (parentNode.layerManager.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.socialBots !== undefined) {
      response.childrenCount++
      if (parentNode.socialBots.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countLiveTradingSession (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.parameters !== undefined) {
      response.childrenCount++
      if (parentNode.parameters.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.layerManager !== undefined) {
      response.childrenCount++
      if (parentNode.layerManager.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.socialBots !== undefined) {
      response.childrenCount++
      if (parentNode.socialBots.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countFordwardTestingSession (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.parameters !== undefined) {
      response.childrenCount++
      if (parentNode.parameters.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.layerManager !== undefined) {
      response.childrenCount++
      if (parentNode.layerManager.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.socialBots !== undefined) {
      response.childrenCount++
      if (parentNode.socialBots.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countPaperTradingSession (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.parameters !== undefined) {
      response.childrenCount++
      if (parentNode.parameters.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.layerManager !== undefined) {
      response.childrenCount++
      if (parentNode.layerManager.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.socialBots !== undefined) {
      response.childrenCount++
      if (parentNode.socialBots.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenPersonalData (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.exchangeAccounts.length; i++) {
      let child = parentNode.exchangeAccounts[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenExchangeAccount (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.assets.length; i++) {
      let child = parentNode.assets[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }

    for (let i = 0; i < parentNode.keys.length; i++) {
      let child = parentNode.keys[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenExchangeAccountAsset (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenExchangeAccountKey (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenTradingSystem (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }

    for (let i = 0; i < parentNode.strategies.length; i++) {
      let child = parentNode.strategies[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }

    if (parentNode.parameters !== undefined) {
      response.childrenCount++
      if (parentNode.parameters.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenParameters (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.baseAsset !== undefined) {
      response.childrenCount++
      if (parentNode.baseAsset.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.timeRange !== undefined) {
      response.childrenCount++
      if (parentNode.timeRange.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.timePeriod !== undefined) {
      response.childrenCount++
      if (parentNode.timePeriod.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.slippage !== undefined) {
      response.childrenCount++
      if (parentNode.slippage.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.feeStructure !== undefined) {
      response.childrenCount++
      if (parentNode.feeStructure.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.key !== undefined) {
      response.childrenCount++
      if (parentNode.key.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenBaseAsset (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenTimeRange (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenTimePeriod (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenSlippage (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenFeeStructure (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenStrategy (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.triggerStage !== undefined) {
      response.childrenCount++
      if (parentNode.triggerStage.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.openStage !== undefined) {
      response.childrenCount++
      if (parentNode.openStage.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.manageStage !== undefined) {
      response.childrenCount++
      if (parentNode.manageStage.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.closeStage !== undefined) {
      response.childrenCount++
      if (parentNode.closeStage.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenTriggerStage (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.triggerOn !== undefined) {
      response.childrenCount++
      if (parentNode.triggerOn.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.triggerOff !== undefined) {
      response.childrenCount++
      if (parentNode.triggerOff.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.takePosition !== undefined) {
      response.childrenCount++
      if (parentNode.takePosition.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenOpenStage (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.initialDefinition !== undefined) {
      response.childrenCount++
      if (parentNode.initialDefinition.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.openExecution !== undefined) {
      response.childrenCount++
      if (parentNode.openExecution.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenManageStage (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.stopLoss !== undefined) {
      response.childrenCount++
      if (parentNode.stopLoss.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.takeProfit !== undefined) {
      response.childrenCount++
      if (parentNode.takeProfit.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenCloseStage (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.closeExecution !== undefined) {
      response.childrenCount++
      if (parentNode.closeExecution.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenPositionSize (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.formula !== undefined) {
      response.childrenCount++
      if (parentNode.formula.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenPositionRate (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.formula !== undefined) {
      response.childrenCount++
      if (parentNode.formula.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenInitialDefinition (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.positionSize !== undefined) {
      response.childrenCount++
      if (parentNode.positionSize.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.stopLoss !== undefined) {
      response.childrenCount++
      if (parentNode.stopLoss.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.takeProfit !== undefined) {
      response.childrenCount++
      if (parentNode.takeProfit.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.positionRate !== undefined) {
      response.childrenCount++
      if (parentNode.positionRate.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenOpenExecution (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenCloseExecution (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenEvent (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < parentNode.situations.length; i++) {
      let child = parentNode.situations[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    for (let i = 0; i < parentNode.announcements.length; i++) {
      let child = parentNode.announcements[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenStop (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < parentNode.phases.length; i++) {
      let child = parentNode.phases[i]

      if (child.id === childNode.id) {
        if (childNode.payload.chainParent !== undefined) {
          if (childNode.payload.chainParent.id === parentNode.id) {
            response.childrenCount++
            response.childIndex = response.childrenCount
          }
        }
      }
    }
    return response
  }

  function countChildrenTakeProfit (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < parentNode.phases.length; i++) {
      let child = parentNode.phases[i]

      if (child.id === childNode.id) {
        if (childNode.payload.chainParent !== undefined) {
          if (childNode.payload.chainParent.id === parentNode.id) {
            response.childrenCount++
            response.childIndex = response.childrenCount
          }
        }
      }
    }
    return response
  }

  function countChildrenPhase (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.formula !== undefined) {
      response.childrenCount++
      if (parentNode.formula.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    if (parentNode.nextPhaseEvent !== undefined) {
      response.childrenCount++
      if (parentNode.nextPhaseEvent.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    for (let i = 0; i < parentNode.announcements.length; i++) {
      let child = parentNode.announcements[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenFormula (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }

  function countChildrenSituation (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    for (let i = 0; i < parentNode.conditions.length; i++) {
      let child = parentNode.conditions[i]
      response.childrenCount++
      if (child.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenCondition (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    if (parentNode.code !== undefined) {
      response.childrenCount++
      if (parentNode.code.id === childNode.id) {
        response.childIndex = response.childrenCount
      }
    }
    return response
  }

  function countChildrenCode (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    return response
  }
}
