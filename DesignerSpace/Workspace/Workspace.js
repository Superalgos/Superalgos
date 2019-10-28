
function newWorkspace () {
  const MODULE_NAME = 'Workspace'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    workspaceNode: undefined,
    tradingSystem: undefined,
    container: undefined,
    enabled: false,
    nodeChildren: undefined,
    getNodeThatIsOnFocus: getNodeThatIsOnFocus,
    getNodeByShortcutKey: getNodeByShortcutKey,
    getAllTradingBotInstances: getAllTradingBotInstances,
    stopAllRunningTasks: stopAllRunningTasks,
    onMenuItemClick: onMenuItemClick,
    physics: physics,
    spawn: spawn,
    chainDetachNode: chainDetachNode,
    chainAttachNode: chainAttachNode,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.isWheelable = false
  thisObject.container.detectMouseOver = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0
  thisObject.container.frame.width = 0
  thisObject.container.frame.height = 0

  spawnPosition = {
    x: canvas.floatingSpace.container.frame.width / 2,
    y: canvas.floatingSpace.container.frame.height / 2
  }

  thisObject.workspaceNode = {}
  thisObject.workspaceNode.rootNodes = []

  let functionLibraryChainAttachDetach = newChainAttachDetach()
  let functionLibraryNodeDeleter = newNodeDeleter()
  let functionLibraryUiObjectsFromNodes = newUiObjectsFromNodes()
  let functionLibraryProtocolNode = newProtocolNode()
  let functionLibraryTaskFunctions = newTaskFunctions()
  let functionLibrarySessionFunctions = newSessionFunctions()
  let functionLibraryShortcutKeys = newShortcutKeys()
  let functionLibraryOnFocus = newOnFocus()

  thisObject.nodeChildren = newNodeChildren()

  return thisObject

  function finalize () {
    thisObject.definition = undefined
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.workspaceNode = undefined
  }

  async function initialize () {
    try {
      let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE_KEY)
      if (user === null) {
        return
      }
      user = JSON.parse(user)

      let idAtStrategizer = window.localStorage.getItem(CANVAS_APP_NAME + '.' + 'Strategizer Gateway' + '.' + user.alias)
      let savedWorkspace = window.localStorage.getItem(CANVAS_APP_NAME + '.' + 'Workspace' + '.' + user.alias)

      if (savedWorkspace === null || idAtStrategizer === null) {
        thisObject.workspaceNode.type = 'Workspace'
        thisObject.workspaceNode.name = 'My Workspace'
        functionLibraryUiObjectsFromNodes.createUiObjectFromNode(thisObject.workspaceNode, undefined, undefined)
        spawnPosition.y = spawnPosition.y + 250
        initializeLoadingFromStrategizer()
      } else {
        thisObject.workspaceNode = JSON.parse(savedWorkspace)
        functionLibraryUiObjectsFromNodes.createUiObjectFromNode(thisObject.workspaceNode, undefined, undefined)
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
          let rootNode = thisObject.workspaceNode.rootNodes[i]
          functionLibraryUiObjectsFromNodes.createUiObjectFromNode(rootNode, undefined, undefined)
        }
        thisObject.enabled = true
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
    }
  }

  async function initializeLoadingFromStrategizer () {
    let result = await canvas.designerSpace.strategizerGateway.loadFromStrategyzer()
    if (result === true) {
      thisObject.definition = canvas.designerSpace.strategizerGateway.strategizerData
      thisObject.workspaceNode.rootNodes.push(thisObject.definition)
      functionLibraryUiObjectsFromNodes.createUiObjectFromNode(thisObject.definition, undefined, undefined)

      thisObject.enabled = true
    }
  }

  function chainDetachNode (node) {
    functionLibraryChainAttachDetach.chainDetachNode(node, thisObject.workspaceNode.rootNodes)
  }

  function chainAttachNode (node, attachToNode) {
    functionLibraryChainAttachDetach.chainAttachNode(node, attachToNode, thisObject.workspaceNode.rootNodes)
  }

  function physics () {
    if (thisObject.enabled !== true) { return }
    /* Here we will save all the workspace related objects into the local storage */
    let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE_KEY)
    if (user === null) {
      return
    }
    user = JSON.parse(user)

    let textToSave = stringifyWorkspace()
    window.localStorage.setItem(CANVAS_APP_NAME + '.' + 'Workspace' + '.' + user.alias, textToSave)
  }

  function stringifyWorkspace (removePersonalData) {
    let stringifyReadyNodes = []
    for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
      let rootNode = thisObject.workspaceNode.rootNodes[i]
      let node = functionLibraryProtocolNode.getProtocolNode(rootNode, removePersonalData, false, true, true)
      if (node) {
        stringifyReadyNodes.push(node)
      }
    }
    let workspace = {
      type: 'Workspace',
      name: thisObject.workspaceNode.name,
      rootNodes: stringifyReadyNodes
    }

    return JSON.stringify(workspace)
  }

  function stopAllRunningTasks () {
    for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
      let rootNode = thisObject.workspaceNode.rootNodes[i]
      if (rootNode.type === 'Network') {
        if (rootNode.networkNodes !== undefined) {
          for (let j = 0; j < rootNode.networkNodes.length; j++) {
            let networkNode = rootNode.networkNodes[j]
            for (let i = 0; i < networkNode.taskManagers.length; i++) {
              let taskManager = networkNode.taskManagers[i]
              taskManager.payload.uiObject.menu.internalClick('Stop All Tasks')
            }
          }
        }
      }
    }
  }

  function getAllTradingBotInstances () {
    let tradingBotInstances = []
    for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
      let rootNode = thisObject.workspaceNode.rootNodes[i]
      if (rootNode.type === 'Network') {
        if (rootNode.networkNodes !== undefined) {
          for (let j = 0; j < rootNode.networkNodes.length; j++) {
            let networkNode = rootNode.networkNodes[j]
            for (let i = 0; i < networkNode.taskManagers.length; i++) {
              let taskManager = networkNode.taskManagers[i]
              for (k = 0; k < taskManager.tasks.length; k++) {
                let task = taskManager.tasks[k]
                if (task.bot.type === 'Trading Bot Instance') {
                  tradingBotInstances.push(task.bot)
                }
              }
            }
          }
        }
      }
    }
    return tradingBotInstances
  }

  function getNodeByShortcutKey (searchingKey) {
    for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
      let rootNode = thisObject.workspaceNode.rootNodes[i]
      let definition = rootNode
      let node = functionLibraryShortcutKeys.getNodeByShortcutKey(rootNode, searchingKey)
      if (node !== undefined) { return node }
    }
  }

  function getNodeThatIsOnFocus () {
    for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
      let rootNode = thisObject.workspaceNode.rootNodes[i]
      let definition = rootNode
      let node = functionLibraryOnFocus.getNodeThatIsOnFocus(rootNode)
      if (node !== undefined) { return node }
    }
  }

  function spawn (nodeText, point) {
    try {
      point = canvas.floatingSpace.container.frame.unframeThisPoint(point)
      spawnPosition.x = point.x
      spawnPosition.y = point.y

      let droppedNode = JSON.parse(nodeText)

      if (droppedNode.type === 'Workspace') {
        stopAllRunningTasks()
        functionLibraryNodeDeleter.deleteWorkspace(thisObject.workspaceNode, thisObject.workspaceNode.rootNodes)
        thisObject.workspaceNode = droppedNode
        functionLibraryUiObjectsFromNodes.createUiObjectFromNode(thisObject.workspaceNode, undefined, undefined)
        for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
          let rootNode = thisObject.workspaceNode.rootNodes[i]
          functionLibraryUiObjectsFromNodes.createUiObjectFromNode(rootNode, undefined, undefined)
        }
      } else {
        let rootNode = functionLibraryProtocolNode.getProtocolNode(droppedNode)
        thisObject.workspaceNode.rootNodes.push(rootNode)
        functionLibraryUiObjectsFromNodes.createUiObjectFromNode(rootNode, undefined, undefined)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] spawn -> err = ' + err.stack) }
    }
  }

  async function onMenuItemClick (payload, action, callBackFunction) {
    switch (action) {
      case 'Share Workspace':
        {
          let text = stringifyWorkspace(true)
          let fileName = 'Share - ' + payload.node.type + ' - ' + payload.node.name + '.json'
          download(fileName, text)
        }
        break
      case 'Backup Workspace':
        {
          let text = stringifyWorkspace(false)
          let fileName = 'Backup - ' + payload.node.type + ' - ' + payload.node.name + '.json'
          download(fileName, text)
        }
        break
      case 'Edit Code':

        break
      case 'Share':
        {
          let text = JSON.stringify(functionLibraryProtocolNode.getProtocolNode(payload.node, true))
          let nodeName = payload.node.name
          if (nodeName === undefined) {
            nodeName = ''
          } else {
            nodeName = '.' + nodeName
          }
          let fileName = 'Share - ' + payload.node.type + ' - ' + nodeName + '.json'
          download(fileName, text)
        }

        break
      case 'Backup':
        {
          let text = JSON.stringify(functionLibraryProtocolNode.getProtocolNode(payload.node, false))
          let nodeName = payload.node.name
          if (nodeName === undefined) {
            nodeName = ''
          } else {
            nodeName = '.' + nodeName
          }
          let fileName = 'Backup - ' + payload.node.type + ' - ' + nodeName + '.json'
          download(fileName, text)
        }

        break
      case 'Run Task':
        {
          functionLibraryTaskFunctions.runTask(payload.node, functionLibraryProtocolNode, callBackFunction)
        }
        break
      case 'Stop Task':
        {
          functionLibraryTaskFunctions.stopTask(payload.node, functionLibraryProtocolNode, callBackFunction)
        }
        break
      case 'Run All Tasks':
        {
          functionLibraryTaskFunctions.runAllTasks(payload.node, functionLibraryProtocolNode)
        }
        break
      case 'Stop All Tasks':
        {
          functionLibraryTaskFunctions.stopAllTasks(payload.node, functionLibraryProtocolNode)
        }
        break
      case 'Run Session':
        {
          functionLibrarySessionFunctions.runSession(payload.node, functionLibraryProtocolNode, callBackFunction)
        }
        break
      case 'Stop Session':
        {
          functionLibrarySessionFunctions.stopSession(payload.node, functionLibraryProtocolNode, callBackFunction)
        }
        break
      case 'Add Definition':
        {
          functionLibraryUiObjectsFromNodes.addDefinition(payload.node)
        }
        break
      case 'Add Network':
        {
          functionLibraryUiObjectsFromNodes.addNetwork(payload.node)
        }
        break
      case 'Add Network Node':
        {
          functionLibraryUiObjectsFromNodes.addNetworkNode(payload.node)
        }
        break
      case 'Add Social Bots':
        {
          functionLibraryUiObjectsFromNodes.addSocialBots(payload.node)
        }
        break
      case 'Add Telegram Bot':
        {
          functionLibraryUiObjectsFromNodes.addTelegramBot(payload.node)
        }
        break
      case 'Add Announcement':
        {
          functionLibraryUiObjectsFromNodes.addAnnouncement(payload.node)
        }
        break
      case 'Add Layer Manager':
        {
          functionLibraryUiObjectsFromNodes.addLayerManager(payload.node)
        }
        break
      case 'Add Layer':
        {
          functionLibraryUiObjectsFromNodes.addLayer(payload.node)
        }
        break
      case 'Add Task Manager':
        {
          functionLibraryUiObjectsFromNodes.addTaskManager(payload.node)
        }
        break
      case 'Add Task':
        {
          functionLibraryUiObjectsFromNodes.addTask(payload.node)
        }
        break
      case 'Add Sensor Bot Instance':
        {
          functionLibraryUiObjectsFromNodes.addSensorBotInstance(payload.node)
        }
        break
      case 'Add Indicator Bot Instance':
        {
          functionLibraryUiObjectsFromNodes.addIndicatorBotInstance(payload.node)
        }
        break
      case 'Add Trading Bot Instance':
        {
          functionLibraryUiObjectsFromNodes.addTradingBotInstance(payload.node)
        }
        break
      case 'Add Process Instance':
        {
          functionLibraryUiObjectsFromNodes.addProcessInstance(payload.node)
        }
        break
      case 'Add Backtesting Session':
        {
          functionLibraryUiObjectsFromNodes.addBacktestingSession(payload.node)
        }
        break
      case 'Add Live Trading Session':
        {
          functionLibraryUiObjectsFromNodes.addLiveTradingSession(payload.node)
        }
        break
      case 'Add Fordward Testing Session':
        {
          functionLibraryUiObjectsFromNodes.addFordwardTestingSession(payload.node)
        }
        break
      case 'Add Paper Trading Session':
        {
          functionLibraryUiObjectsFromNodes.addPaperTradingSession(payload.node)
        }
        break
      case 'Add Strategy':
        {
          functionLibraryUiObjectsFromNodes.addStrategy(payload.node)
        }
        break
      case 'Add Parameters':
        {
          functionLibraryUiObjectsFromNodes.addParameters(payload.node)
        }
        break
      case 'Add Missing Parameters':
        {
          functionLibraryUiObjectsFromNodes.addMissingParameters(payload.node)
        }
        break
      case 'Add Missing Stages':
        {
          functionLibraryUiObjectsFromNodes.addMissingStages(payload.node)
        }
        break
      case 'Add Missing Events':
        {
          functionLibraryUiObjectsFromNodes.addMissingEvents(payload.node)
        }
        break
      case 'Add Missing Items':
        {
          functionLibraryUiObjectsFromNodes.addMissingItems(payload.node)
        }
        break
      case 'Add Initial Definition':
        {
          functionLibraryUiObjectsFromNodes.addInitialDefinition(payload.node)
        }
        break
      case 'Add Open Execution':
        {
          functionLibraryUiObjectsFromNodes.addOpenExecution(payload.node)
        }
        break
      case 'Add Close Execution':
        {
          functionLibraryUiObjectsFromNodes.addCloseExecution(payload.node)
        }
        break
      case 'Add Phase':
        {
          functionLibraryUiObjectsFromNodes.addPhase(payload.node)
        }
        break
      case 'Add Formula':
        {
          functionLibraryUiObjectsFromNodes.addFormula(payload.node)
        }
        break
      case 'Add Next Phase Event':
        {
          functionLibraryUiObjectsFromNodes.addNextPhaseEvent(payload.node)
        }
        break
      case 'Add Situation':
        {
          functionLibraryUiObjectsFromNodes.addSituation(payload.node)
        }
        break
      case 'Add Condition':
        {
          functionLibraryUiObjectsFromNodes.addCondition(payload.node)
        }
        break
      case 'Add Code':
        {
          functionLibraryUiObjectsFromNodes.addCode(payload.node)
        }
        break
      case 'Add Exchange Account':
        {
          functionLibraryUiObjectsFromNodes.addExchangeAccount(payload.node)
        }
        break
      case 'Add Exchange Account Asset':
        {
          functionLibraryUiObjectsFromNodes.addExchangeAccountAsset(payload.node)
        }
        break
      case 'Add Exchange Account Key':
        {
          functionLibraryUiObjectsFromNodes.addExchangeAccountKey(payload.node)
        }
        break
      case 'Add Trading System':
        {
          functionLibraryUiObjectsFromNodes.addTradingSystem(payload.node)
        }
        break
      case 'Add Personal Data':
        {
          functionLibraryUiObjectsFromNodes.addPersonalData(payload.node)
        }
        break
      case 'Delete Network': {
        functionLibraryNodeDeleter.deleteNetwork(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Network Node': {
        functionLibraryNodeDeleter.deleteNetworkNode(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Social Bots': {
        functionLibraryNodeDeleter.deleteSocialBots(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Social Bot': {
        functionLibraryNodeDeleter.deleteSocialBot(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Announcement': {
        functionLibraryNodeDeleter.deleteAnnouncement(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Layer Manager': {
        functionLibraryNodeDeleter.deleteLayerManager(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Layer': {
        functionLibraryNodeDeleter.deleteLayer(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Task Manager': {
        functionLibraryNodeDeleter.deleteTaskManager(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Task': {
        functionLibraryNodeDeleter.deleteTask(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Sensor Bot Instance': {
        functionLibraryNodeDeleter.deleteSensorBotInstance(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Indicator Bot Instance': {
        functionLibraryNodeDeleter.deleteIndicatorBotInstance(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Trading Bot Instance': {
        functionLibraryNodeDeleter.deleteTradingBotInstance(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Process Instance': {
        functionLibraryNodeDeleter.deleteProcessInstance(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Backtesting Session': {
        functionLibraryNodeDeleter.deleteBacktestingSession(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Live Trading Session': {
        functionLibraryNodeDeleter.deleteLiveTradingSession(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Fordward Testing Session': {
        functionLibraryNodeDeleter.deleteFordwardTestingSession(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Paper Trading Session': {
        functionLibraryNodeDeleter.deletePaperTradingSession(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Trading System': {
        functionLibraryNodeDeleter.deleteTradingSystem(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Parameters': {
        functionLibraryNodeDeleter.deleteParameters(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Base Asset': {
        functionLibraryNodeDeleter.deleteBaseAsset(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Time Range': {
        functionLibraryNodeDeleter.deleteTimeRange(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Time Period': {
        functionLibraryNodeDeleter.deleteTimePeriod(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Slippage': {
        functionLibraryNodeDeleter.deleteSlippage(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Fee Structure': {
        functionLibraryNodeDeleter.deleteFeeStructure(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Strategy': {
        functionLibraryNodeDeleter.deleteStrategy(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Trigger Stage': {
        functionLibraryNodeDeleter.deleteTriggerStage(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Open Stage': {
        functionLibraryNodeDeleter.deleteOpenStage(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Manage Stage': {
        functionLibraryNodeDeleter.deleteManageStage(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Close Stage': {
        functionLibraryNodeDeleter.deleteCloseStage(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Position Size': {
        functionLibraryNodeDeleter.deletePositionSize(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Position Rate': {
        functionLibraryNodeDeleter.deletePositionSize(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Initial Definition': {
        functionLibraryNodeDeleter.deleteInitialDefinition(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Open Execution': {
        functionLibraryNodeDeleter.deleteOpenExecution(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Close Execution': {
        functionLibraryNodeDeleter.deleteCloseExecution(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Event': {
        functionLibraryNodeDeleter.deleteEvent(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Managed Item': {
        functionLibraryNodeDeleter.deleteManagedItem(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Phase': {
        functionLibraryNodeDeleter.deletePhase(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Formula': {
        functionLibraryNodeDeleter.deleteFormula(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Situation': {
        functionLibraryNodeDeleter.deleteSituation(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Condition': {
        functionLibraryNodeDeleter.deleteCondition(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Code': {
        functionLibraryNodeDeleter.deleteCode(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Exchange Account': {
        functionLibraryNodeDeleter.deleteExchangeAccount(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Exchange Account Asset': {
        functionLibraryNodeDeleter.deleteExchangeAccountAsset(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Exchange Account Key': {
        functionLibraryNodeDeleter.deleteExchangeAccountKey(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Personal Data': {
        functionLibraryNodeDeleter.deletePersonalData(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      case 'Delete Definition': {
        functionLibraryNodeDeleter.deleteDefinition(payload.node, thisObject.workspaceNode.rootNodes)
        break
      }
      default:

    }
  }

  function download (filename, text) {
    let element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }
}
