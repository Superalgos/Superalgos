
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
    draw: draw,
    spawn: spawn,
    chainDetachNode: chainDetachNode,
    chainAttachNode: chainAttachNode,
    referenceDetachNode: referenceDetachNode,
    referenceAttachNode: referenceAttachNode,
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

  let functionLibraryReferenceAttachDetach = newReferenceAttachDetach()
  let functionLibraryChainAttachDetach = newChainAttachDetach()
  let functionLibraryNodeDeleter = newNodeDeleter()
  let functionLibraryUiObjectsFromNodes = newUiObjectsFromNodes()
  let functionLibraryProtocolNode = newProtocolNode()
  let functionLibraryNodeCloning = newNodeCloning()
  let functionLibraryTaskFunctions = newTaskFunctions()
  let functionLibrarySessionFunctions = newSessionFunctions()
  let functionLibraryShortcutKeys = newShortcutKeys()
  let functionLibraryOnFocus = newOnFocus()

  thisObject.nodeChildren = newNodeChildren()

  let workingAtTask = 0
  let circularProgressBar = newBusyProgressBar()
  circularProgressBar.fitFunction = canvas.floatingSpace.fitIntoVisibleArea
  let droppedNode

  return thisObject

  function finalize () {
    thisObject.definition = undefined
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.workspaceNode = undefined
    circularProgressBar.finalize()
    circularProgressBar = undefined
  }

  function initialize () {
    try {
      let savedWorkspace = window.localStorage.getItem(CANVAS_APP_NAME + '.' + 'Workspace')

      if (savedWorkspace === null) {
        thisObject.workspaceNode.type = 'Workspace'
        thisObject.workspaceNode.name = 'My Workspace'
      } else {
        thisObject.workspaceNode = JSON.parse(savedWorkspace)
      }
      functionLibraryUiObjectsFromNodes.recreateWorkspace(thisObject.workspaceNode)
      thisObject.enabled = true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
    }
  }

  function chainDetachNode (node) {
    functionLibraryChainAttachDetach.chainDetachNode(node, thisObject.workspaceNode.rootNodes)
  }

  function chainAttachNode (node, attachToNode) {
    functionLibraryChainAttachDetach.chainAttachNode(node, attachToNode, thisObject.workspaceNode.rootNodes)
  }

  function referenceDetachNode (node) {
    functionLibraryReferenceAttachDetach.referenceDetachNode(node)
  }

  function referenceAttachNode (node, attachToNode) {
    functionLibraryReferenceAttachDetach.referenceAttachNode(node, attachToNode, thisObject.workspaceNode.rootNodes)
  }

  function physics () {
    if (thisObject.enabled !== true) { return }

    let textToSave = stringifyWorkspace()
    window.localStorage.setItem(CANVAS_APP_NAME + '.' + 'Workspace', textToSave)

    if (workingAtTask > 0) {
      circularProgressBar.physics()

      switch (workingAtTask) {
        case 1:
          stopAllRunningTasks()
          workingAtTask++
          break
        case 2:
          functionLibraryNodeDeleter.deleteWorkspace(thisObject.workspaceNode, thisObject.workspaceNode.rootNodes)
          workingAtTask++
          break
        case 3:
          thisObject.workspaceNode = droppedNode
          droppedNode = undefined
          workingAtTask++
          break
        case 4:
          functionLibraryUiObjectsFromNodes.recreateWorkspace(thisObject.workspaceNode)
          workingAtTask++
          break
        case 5:
          canvas.chartSpace.finalize()
          canvas.chartSpace.initialize()
          workingAtTask++
          break
        case 6:
          canvas.floatingSpace.warmUp()
          workingAtTask = 0
          circularProgressBar.visible = false
          break
      }
    }
  }

  function draw () {
    if (circularProgressBar !== undefined) {
      circularProgressBar.draw()
    }
  }

  function stringifyWorkspace (removePersonalData) {
    let stringifyReadyNodes = []
    for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
      let rootNode = thisObject.workspaceNode.rootNodes[i]
      let node = functionLibraryProtocolNode.getProtocolNode(rootNode, removePersonalData, false, true, true, true)
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
              for (let k = 0; k < taskManager.tasks.length; k++) {
                let task = taskManager.tasks[k]
                if (task.bot !== undefined) {
                  if (task.bot.type === 'Trading Bot Instance') {
                    if (task.bot.payload.floatingObject.isCollapsed !== true) {
                      tradingBotInstances.push(task.bot)
                    }
                  }
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
      let node = functionLibraryShortcutKeys.getNodeByShortcutKey(rootNode, searchingKey)
      if (node !== undefined) { return node }
    }
  }

  function getNodeThatIsOnFocus () {
    for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
      let rootNode = thisObject.workspaceNode.rootNodes[i]
      let node = functionLibraryOnFocus.getNodeThatIsOnFocus(rootNode)
      if (node !== undefined) { return node }
    }
  }

  function spawn (nodeText, mousePointer) {
    try {
      let point = {
        x: mousePointer.x,
        y: mousePointer.y
      }
      point = canvas.floatingSpace.container.frame.unframeThisPoint(point)
      spawnPosition.x = point.x
      spawnPosition.y = point.y

      droppedNode = JSON.parse(nodeText)

      if (droppedNode.type === 'Workspace') {
        circularProgressBar.initialize(mousePointer)
        circularProgressBar.visible = true
        workingAtTask = 1
        return
      }

      /* It does not exist, so we recreeate it respecting the inner state of each object. */
      let positionOffset = {
        x: spawnPosition.x - droppedNode.savedPayload.targetPosition.x,
        y: spawnPosition.y - droppedNode.savedPayload.targetPosition.y
      }

      thisObject.workspaceNode.rootNodes.push(droppedNode)
      functionLibraryUiObjectsFromNodes.createUiObjectFromNode(droppedNode, undefined, undefined, positionOffset)
      functionLibraryUiObjectsFromNodes.tryToConnectChildrenWithReferenceParents()

      droppedNode = undefined
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] spawn -> err = ' + err.stack) }
    }
  }

  async function onMenuItemClick (payload, action, relatedUiObject, callBackFunction) {
    switch (action) {
      case 'Add UI Object':
        {
          functionLibraryUiObjectsFromNodes.addUIObject(payload.node, relatedUiObject)
        }
        break
      case 'Add Missing Children':
        {
          functionLibraryUiObjectsFromNodes.addUIObject(payload.node, relatedUiObject)
        }
        break
      case 'Delete UI Object':
        {
          functionLibraryNodeDeleter.deleteUIObject(payload.node, thisObject.workspaceNode.rootNodes)
        }
        break
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
          let text = JSON.stringify(functionLibraryProtocolNode.getProtocolNode(payload.node, true, false, true, true, true))

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
          let text = JSON.stringify(functionLibraryProtocolNode.getProtocolNode(payload.node, false, false, true, true, true))

          let nodeName = payload.node.name
          if (nodeName === undefined) {
            nodeName = ''
          } else {
            nodeName = ' ' + nodeName
          }
          let fileName = 'Backup - ' + payload.node.type + ' - ' + nodeName + '.json'
          download(fileName, text)
        }

        break
      case 'Clone':
        {
          let text = JSON.stringify(functionLibraryNodeCloning.getNodeClone(payload.node))

          let nodeName = payload.node.name
          if (nodeName === undefined) {
            nodeName = ''
          } else {
            nodeName = ' ' + nodeName
          }
          let fileName = 'Clone - ' + payload.node.type + ' - ' + nodeName + '.json'
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
    }
  }
}
