
function newWorkspace () {
  const MODULE_NAME = 'Workspace'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    workspaceNode: undefined,
    container: undefined,
    enabled: false,
    nodeChildren: undefined,
    eventsServerClients: new Map(),
    save: saveWorkspace,
    getHierarchyHeads: getHierarchyHeads,
    getNodeThatIsOnFocus: getNodeThatIsOnFocus,
    getNodeByShortcutKey: getNodeByShortcutKey,
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
  let functionLibrarySuperScripts = newSuperScriptsFunctions()
  let functionLibraryCCXTFunctions = newCCXTFunctions()
  let functionLibraryWebhookFunctions = newWebhookFunctions()
  let functionLibraryDependenciesFilter = newDependenciesFilter()

  thisObject.nodeChildren = newNodeChildren()

  let workingAtTask = 0
  let circularProgressBar = newBusyProgressBar()
  circularProgressBar.fitFunction = canvas.floatingSpace.fitIntoVisibleArea
  let droppedNode
  let sessionTimestamp = (new Date()).valueOf()
  window.localStorage.setItem('Session Timestamp', sessionTimestamp)

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
      let reset = window.localStorage.getItem('Reset')
      let savedWorkspace = window.localStorage.getItem(CANVAS_APP_NAME + '.' + 'Workspace')

      if (savedWorkspace === null || reset !== null) {
        thisObject.workspaceNode = getWorkspace()
      } else {
        thisObject.workspaceNode = JSON.parse(savedWorkspace)
      }
      functionLibraryUiObjectsFromNodes.recreateWorkspace(thisObject.workspaceNode)
      setupEventsServerClients()
      thisObject.enabled = true

      setInterval(saveWorkspace, 60000)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
    }
  }

  function setupEventsServerClients () {
    for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
      let rootNode = thisObject.workspaceNode.rootNodes[i]

      if (rootNode.type === 'Network') {
        for (let j = 0; j < rootNode.networkNodes.length; j++) {
          let networkNode = rootNode.networkNodes[j]

          let host
          let webSocketsPort
          /* At this point the node does not have the payload property yet, that is why we have to do this manually */
          try {
            let code = JSON.parse(networkNode.code)
            host = code.host
            webSocketsPort = code.webSocketsPort
          } catch (err) {
            console.log('[ERROR] networkNode ' + networkNode.name + ' has an invalid configuration. Cannot know the host name and webSocketsPort.')
            return
          }

          if (host === undefined) { host = 'localhost' }
          if (webSocketsPort === undefined) { webSocketsPort = '8080' }

          let eventsServerClient = newEventsServerClient(host, webSocketsPort)
          eventsServerClient.initialize()

          thisObject.eventsServerClients.set(networkNode.id, eventsServerClient)
        }
      }
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

  function saveWorkspace () {
    let savedSessionTimestamp = window.localStorage.getItem('Session Timestamp')
    if (Number(savedSessionTimestamp) !== sessionTimestamp) {
      canvas.cockpitSpace.setStatus('Could not save the Workspace. You have more that one instance of the Superlagos User Interface open at the same time. Plese close this instance as it is older than the others.', 150, canvas.cockpitSpace.statusTypes.WARNING)
    } else {
      let textToSave = stringifyWorkspace()
      window.localStorage.setItem(CANVAS_APP_NAME + '.' + 'Workspace', textToSave)
      window.localStorage.setItem('Session Timestamp', sessionTimestamp)
      return true
    }
  }

  function physics () {
    eventsServerClientsPhysics()
    replacingWorkspacePhysics()
  }

  function eventsServerClientsPhysics () {
    thisObject.eventsServerClients.forEach(applyPhysics)

    function applyPhysics (eventServerClient) {
      eventServerClient.physics()
    }
  }

  function replacingWorkspacePhysics () {
    if (thisObject.enabled !== true) { return }

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
          functionLibraryUiObjectsFromNodes.recreateWorkspace(thisObject.workspaceNode, true)
          setupEventsServerClients()
          workingAtTask++
          break
        case 5:
          canvas.chartingSpace.reset()
          workingAtTask++
          break
        case 6:
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

      if (rootNode.isIncluded !== true) {
        let node = functionLibraryProtocolNode.getProtocolNode(rootNode, removePersonalData, false, true, true, true)
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
            if (networkNode.dataMining !== undefined && networkNode.dataMining.payload !== undefined) {
              networkNode.dataMining.payload.uiObject.menu.internalClick('Stop All Exchange Tasks')
              networkNode.dataMining.payload.uiObject.menu.internalClick('Stop All Exchange Tasks')
            }
            if (networkNode.testingEnvironment !== undefined && networkNode.testingEnvironment.payload !== undefined) {
              networkNode.testingEnvironment.payload.uiObject.menu.internalClick('Stop All Exchange Tasks')
              networkNode.testingEnvironment.payload.uiObject.menu.internalClick('Stop All Exchange Tasks')
            }
            if (networkNode.productionEnvironment !== undefined && networkNode.productionEnvironment.payload !== undefined) {
              networkNode.productionEnvironment.payload.uiObject.menu.internalClick('Stop All Exchange Tasks')
              networkNode.productionEnvironment.payload.uiObject.menu.internalClick('Stop All Exchange Tasks')
            }
          }
        }
      }
    }
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

  function getHierarchyHeads () {
    let nodes = []
    for (let i = 0; i < thisObject.workspaceNode.rootNodes.length; i++) {
      let rootNode = thisObject.workspaceNode.rootNodes[i]
      let nodeDefinition = APP_SCHEMA_MAP.get(rootNode.type)
      if (nodeDefinition !== undefined) {
        if (nodeDefinition.isHierarchyHead === true) {
          nodes.push(rootNode)
        }
      }
    }
    return nodes
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
        x: spawnPosition.x - droppedNode.savedPayload.position.x,
        y: spawnPosition.y - droppedNode.savedPayload.position.y
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
          functionLibraryUiObjectsFromNodes.addMissingChildren(payload.node)
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
          downloadText(fileName, text)
        }
        break
      case 'Backup Workspace':
        {
          let text = stringifyWorkspace(false)
          let fileName = 'Backup - ' + payload.node.type + ' - ' + payload.node.name + '.json'
          downloadText(fileName, text)
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
          downloadText(fileName, text)
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
          downloadText(fileName, text)
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
          downloadText(fileName, text)
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
      case 'Run All Task Managers':
        {
          functionLibraryTaskFunctions.runAllTaskManagers(payload.node, functionLibraryProtocolNode)
        }
        break
      case 'Stop All Task Managers':
        {
          functionLibraryTaskFunctions.stopAllTaskManagers(payload.node, functionLibraryProtocolNode)
        }
        break
      case 'Run All Exchange Tasks':
        {
          functionLibraryTaskFunctions.runAllExchangeTasks(payload.node, functionLibraryProtocolNode)
        }
        break
      case 'Stop All Exchange Tasks':
        {
          functionLibraryTaskFunctions.stopAllExchangeTasks(payload.node, functionLibraryProtocolNode)
        }
        break
      case 'Add Missing Crypto Exchanges':
        {
          functionLibraryCCXTFunctions.addMissingExchanges(payload.node, functionLibraryUiObjectsFromNodes)
        }
        break
      case 'Add Missing Assets':
        {
          functionLibraryCCXTFunctions.addMissingAssets(payload.node, functionLibraryUiObjectsFromNodes)
        }
        break
      case 'Add Missing Markets':
        {
          functionLibraryCCXTFunctions.addMissingMarkets(payload.node, functionLibraryUiObjectsFromNodes, functionLibraryNodeCloning)
        }
        break
      case 'Send Webhook Test Message':
        {
          functionLibraryWebhookFunctions.sendTestMessage(payload.node, callBackFunction)
        }
        break
      case 'Run Session':
        {
          functionLibrarySessionFunctions.runSession(payload.node, functionLibraryProtocolNode, functionLibraryDependenciesFilter, callBackFunction)
        }
        break
      case 'Stop Session':
        {
          functionLibrarySessionFunctions.stopSession(payload.node, functionLibraryProtocolNode, callBackFunction)
        }
        break
      case 'Run Super Action':
        {
          functionLibrarySuperScripts.runSuperScript(payload.node, thisObject.workspaceNode.rootNodes, functionLibraryNodeCloning, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)
        }
        break
      case 'Remove Parent':
        {
          chainDetachNode(payload.node)
        }
        break
      case 'Remove Reference':
        {
          referenceDetachNode(payload.node)
        }
        break
      case 'Open Documentation':
        {
          let definition = APP_SCHEMA_MAP.get(payload.node.type)
          if (definition !== undefined) {
            if (definition.docURL !== undefined) {
              let newTab = window.open(definition.docURL, '_blank')
              newTab.focus()
            }
          }
        }
        break
    }
  }
}
