
function newWorkspace () {
  const MODULE_NAME = 'Workspace'

  let thisObject = {
    tradingSystem: undefined,
    container: undefined,
    enabled: false,
    nodeChildren: undefined,
    onMenuItemClick: onMenuItemClick,
    getProtocolTradingSystem: getProtocolTradingSystem,
    physics: physics,
    spawn: spawn,
    detachNode: detachNode,
    attachNode: attachNode,
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

  let workspaceNode = {}
  workspaceNode.rootNodes = []

  let functionLibraryAttachDetach = newAttachDetach()
  let functionLibraryNodeDeleter = newNodeDeleter()
  let functionLibraryPartsFromNodes = newPartsFromNodes()
  let functionLibraryProtocolNode = newProtocolNode()
  let functionLibraryWorkspaceNodes = newStringifyNode()
  thisObject.nodeChildren = newNodeChildren()

  return thisObject

  function finalize () {
    thisObject.definition = undefined
    thisObject.container.finalize()
    thisObject.container = undefined
  }

  async function initialize () {
    let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE_KEY)
    if (user === null) {
      return
    }
    user = JSON.parse(user)

    let idAtStrategizer = window.localStorage.getItem(CANVAS_APP_NAME + '.' + 'Strategizer Gateway' + '.' + user.alias)
    let savedWorkspace = window.localStorage.getItem(CANVAS_APP_NAME + '.' + 'Workspace' + '.' + user.alias)

    if (savedWorkspace === null || idAtStrategizer === null) {
      workspaceNode.type = 'Workspace'
      workspaceNode.name = 'My Workspace'
      functionLibraryPartsFromNodes.createPartFromNode(workspaceNode, undefined, undefined)
      spawnPosition.y = spawnPosition.y + 250
      initializeLoadingFromStrategizer()
    } else {
      workspaceNode = JSON.parse(savedWorkspace)
      functionLibraryPartsFromNodes.createPartFromNode(workspaceNode, undefined, undefined)
      for (let i = 0; i < workspaceNode.rootNodes.length; i++) {
        let rootNode = workspaceNode.rootNodes[i]
        functionLibraryPartsFromNodes.createPartFromNode(rootNode, undefined, undefined)
      }
      thisObject.enabled = true
    }
  }

  async function initializeLoadingFromStrategizer () {
    let result = await canvas.strategySpace.strategizerGateway.loadFromStrategyzer()
    if (result === true) {
      thisObject.definition = canvas.strategySpace.strategizerGateway.strategizerData
      workspaceNode.rootNodes.push(thisObject.definition)
      functionLibraryPartsFromNodes.createPartFromNode(thisObject.definition, undefined, undefined)
      thisObject.definition.payload.uiObject.setRunningStatus()
      thisObject.enabled = true
    }
  }

  function getProtocolTradingSystem () {
    return functionLibraryProtocolNode.getProtocolNode(thisObject.definition)
  }

  function detachNode (node) {
    functionLibraryAttachDetach.detachNode(node, workspaceNode.rootNodes)
  }

  function attachNode (node, attachToNode) {
    functionLibraryAttachDetach.attachNode(node, attachToNode, workspaceNode.rootNodes)
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
    for (let i = 0; i < workspaceNode.rootNodes.length; i++) {
      let rootNode = workspaceNode.rootNodes[i]
      let node = functionLibraryWorkspaceNodes.prepareForStringify(rootNode, removePersonalData)
      if (node) {
        stringifyReadyNodes.push(node)
      }
    }
    let workspace = {
      type: 'Workspace',
      name: workspaceNode.name,
      rootNodes: stringifyReadyNodes
    }

    return JSON.stringify(workspace)
  }

  function spawn (nodeText, point) {
    point = canvas.floatingSpace.container.frame.unframeThisPoint(point)
    spawnPosition.x = point.x
    spawnPosition.y = point.y

    let droppedNode = JSON.parse(nodeText)

    if (droppedNode.type === 'Workspace') {
      functionLibraryNodeDeleter.deleteWorkspace(workspaceNode, workspaceNode.rootNodes)
      workspaceNode = droppedNode
      functionLibraryPartsFromNodes.createPartFromNode(workspaceNode, undefined, undefined)
      for (let i = 0; i < workspaceNode.rootNodes.length; i++) {
        let rootNode = workspaceNode.rootNodes[i]
        functionLibraryPartsFromNodes.createPartFromNode(rootNode, undefined, undefined)
      }
    } else {
      let rootNode = functionLibraryProtocolNode.getProtocolNode(droppedNode)
      workspaceNode.rootNodes.push(rootNode)
      functionLibraryPartsFromNodes.createPartFromNode(rootNode, undefined, undefined)
    }
  }

  async function onMenuItemClick (payload, action) {
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
      case 'Save Trading System':
        {
          let result = await canvas.strategySpace.strategizerGateway.saveToStrategyzer(getSimulationParams())
          return result
          break
        }

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
          /* Check if it is possible to Run or not */
          if (payload.node.bot === undefined) { return }
          if (payload.node.bot.processes.length === 0) { return }

          for (let i = 0; i < payload.node.bot.processes.length; i++) {
            let process = payload.node.bot.processes[i]
            process.payload.uiObject.play()
          }

          payload.uiObject.play()

          let event = {
            taskId: payload.node.id,
            definition: JSON.stringify(functionLibraryProtocolNode.getProtocolNode(payload.node, false, true)) // <-  We need to do this workaround in order no to send unescaped charactars to the taskManager.
          }
          systemEventHandler.raiseEvent('Task Manager', 'Run Task', event)
        }
        break
      case 'Stop Task':
        {
          let event = {
            taskId: payload.node.id
          }
          systemEventHandler.raiseEvent('Task Manager', 'Stop Task', event)

          payload.uiObject.stop()

          if (payload.node.bot === undefined) { return }
          if (payload.node.bot.processes.length === 0) { return }

          for (let i = 0; i < payload.node.bot.processes.length; i++) {
            let process = payload.node.bot.processes[i]
            process.payload.uiObject.stop()
          }
        }
        break
      case 'Add Task Manager':
        {
          functionLibraryPartsFromNodes.addTaskManager(payload.node)
        }
        break
      case 'Add Task':
        {
          functionLibraryPartsFromNodes.addTask(payload.node)
        }
        break
      case 'Add Sensor':
        {
          functionLibraryPartsFromNodes.addSensor(payload.node)
        }
        break
      case 'Add Indicator':
        {
          functionLibraryPartsFromNodes.addIndicator(payload.node)
        }
        break
      case 'Add Trading Engine':
        {
          functionLibraryPartsFromNodes.addTradingEngine(payload.node)
        }
        break
      case 'Add Process':
        {
          functionLibraryPartsFromNodes.addProcess(payload.node)
        }
        break
      case 'Add Strategy':
        {
          functionLibraryPartsFromNodes.addStrategy(payload.node)
        }
        break
      case 'Add Parameters':
        {
          functionLibraryPartsFromNodes.addParameters(payload.node)
        }
        break
      case 'Add Missing Parameters':
        {
          functionLibraryPartsFromNodes.addMissingParameters(payload.node)
        }
        break
      case 'Add Missing Stages':
        {
          functionLibraryPartsFromNodes.addMissingStages(payload.node)
        }
        break
      case 'Add Missing Events':
        {
          functionLibraryPartsFromNodes.addMissingEvents(payload.node)
        }
        break
      case 'Add Missing Items':
        {
          functionLibraryPartsFromNodes.addMissingItems(payload.node)
        }
        break
      case 'Add Initial Definition':
        {
          functionLibraryPartsFromNodes.addInitialDefinition(payload.node)
        }
        break
      case 'Add Open Execution':
        {
          functionLibraryPartsFromNodes.addOpenExecution(payload.node)
        }
        break
      case 'Add Close Execution':
        {
          functionLibraryPartsFromNodes.addCloseExecution(payload.node)
        }
        break
      case 'Add Phase':
        {
          functionLibraryPartsFromNodes.addPhase(payload.node)
        }
        break
      case 'Add Formula':
        {
          functionLibraryPartsFromNodes.addFormula(payload.node)
        }
        break
      case 'Add Next Phase Event':
        {
          functionLibraryPartsFromNodes.addNextPhaseEvent(payload.node)
        }
        break
      case 'Add Situation':
        {
          functionLibraryPartsFromNodes.addSituation(payload.node)
        }
        break
      case 'Add Condition':
        {
          functionLibraryPartsFromNodes.addCondition(payload.node)
        }
        break
      case 'Add Code':
        {
          functionLibraryPartsFromNodes.addCode(payload.node)
        }
        break
      case 'Add Exchange Account':
        {
          functionLibraryPartsFromNodes.addExchangeAccount(payload.node)
        }
        break
      case 'Add Exchange Account Asset':
        {
          functionLibraryPartsFromNodes.addExchangeAccountAsset(payload.node)
        }
        break
      case 'Add Exchange Account Key':
        {
          functionLibraryPartsFromNodes.addExchangeAccountKey(payload.node)
        }
        break
      case 'Add Trading System':
        {
          functionLibraryPartsFromNodes.addTradingSystem(payload.node)
        }
        break
      case 'Add Personal Data':
        {
          functionLibraryPartsFromNodes.addPersonalData(payload.node)
        }
        break
      case 'Delete Task Manager': {
        functionLibraryNodeDeleter.deleteTaskManager(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Task': {
        functionLibraryNodeDeleter.deleteTask(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Sensor': {
        functionLibraryNodeDeleter.deleteSensor(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Indicator': {
        functionLibraryNodeDeleter.deleteIndicator(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Trading Engine': {
        functionLibraryNodeDeleter.deleteTradingEngine(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Process': {
        functionLibraryNodeDeleter.deleteProcess(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Trading System': {
        functionLibraryNodeDeleter.deleteTradingSystem(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Parameters': {
        functionLibraryNodeDeleter.deleteParameters(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Base Asset': {
        functionLibraryNodeDeleter.deleteBaseAsset(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Time Range': {
        functionLibraryNodeDeleter.deleteTimeRange(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Slippage': {
        functionLibraryNodeDeleter.deleteSlippage(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Fee Structure': {
        functionLibraryNodeDeleter.deleteFeeStructure(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Strategy': {
        functionLibraryNodeDeleter.deleteStrategy(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Trigger Stage': {
        functionLibraryNodeDeleter.deleteTriggerStage(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Open Stage': {
        functionLibraryNodeDeleter.deleteOpenStage(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Manage Stage': {
        functionLibraryNodeDeleter.deleteManageStage(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Close Stage': {
        functionLibraryNodeDeleter.deleteCloseStage(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Position Size': {
        functionLibraryNodeDeleter.deletePositionSize(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Position Rate': {
        functionLibraryNodeDeleter.deletePositionSize(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Initial Definition': {
        functionLibraryNodeDeleter.deleteInitialDefinition(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Open Execution': {
        functionLibraryNodeDeleter.deleteOpenExecution(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Close Execution': {
        functionLibraryNodeDeleter.deleteCloseExecution(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Event': {
        functionLibraryNodeDeleter.deleteEvent(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Managed Item': {
        functionLibraryNodeDeleter.deleteManagedItem(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Phase': {
        functionLibraryNodeDeleter.deletePhase(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Formula': {
        functionLibraryNodeDeleter.deleteFormula(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Situation': {
        functionLibraryNodeDeleter.deleteSituation(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Condition': {
        functionLibraryNodeDeleter.deleteCondition(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Code': {
        functionLibraryNodeDeleter.deleteCode(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Exchange Account': {
        functionLibraryNodeDeleter.deleteExchangeAccount(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Exchange Account Asset': {
        functionLibraryNodeDeleter.deleteExchangeAccountAsset(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Exchange Account Key': {
        functionLibraryNodeDeleter.deleteExchangeAccountKey(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Personal Data': {
        functionLibraryNodeDeleter.deletePersonalData(payload.node, workspaceNode.rootNodes)
        break
      }
      case 'Delete Definition': {
        functionLibraryNodeDeleter.deleteDefinition(payload.node, workspaceNode.rootNodes)
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
