
function newWorkspace () {
  const MODULE_NAME = 'Workspace'

  let thisObject = {
    tradingSystem: undefined,
    container: undefined,
    idAtStrategizer: undefined,
    onMenuItemClick: onMenuItemClick,
    physics: physics,
    spawn: spawn,
    detachNode: detachNode,
    attachNode: attachNode,
    getContainer: getContainer,
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

  let rootNodes = []

  functionLibraryAttachDetach = newAttachDetach()
  functionLibraryNodeDeleter = newNodeDeleter()
  functionLibraryPartsFromNodes = newPartsFromNodes()
  functionLibraryProtocolNode = newProtocolNode()
  functionLibraryWorkspaceNodes = newWorkspaceNode()

  return thisObject

  function finalize () {
    thisObject.tradingSystem = undefined
    thisObject.container.finalize()
    thisObject.container = undefined
  }

  async function initialize () {
    functionLibraryAttachDetach = newAttachDetach()
    functionLibraryNodeDeleter = newNodeDeleter()
    functionLibraryPartsFromNodes = newPartsFromNodes()
    functionLibraryProtocolNode = newProtocolNode()
    functionLibraryWorkspaceNodes = newWorkspaceNode()

    let savedWorkspace = window.localStorage.getItem('workspace')
    if (savedWorkspace === null) {
      initializeLoadingFromStrategizer()
    } else {
      workspace = JSON.parse(savedWorkspace)
      rootNodes = workspace.rootNodes
      thisObject.idAtStrategizer = workspace.idAtStrategizer
      if (thisObject.idAtStrategizer === undefined) {
        initializeLoadingFromStrategizer()
      } else {
        for (let i = 0; i < rootNodes.length; i++) {
          let rootNode = rootNodes[i]
          functionLibraryPartsFromNodes.createPartFromNode(rootNode, undefined, undefined)
        }
      }
    }
  }

  async function initializeLoadingFromStrategizer () {
    await canvas.strategySpace.strategizerGateway.loadFromStrategyzer()
    let tradingSystem = canvas.strategySpace.strategizerGateway.strategizerData
    if (tradingSystem !== undefined) {
      let adaptedTradingSystem = {
        strategies: tradingSystem.subStrategies
      }
      thisObject.idAtStrategizer = tradingSystem.id
      rootNodes.push(adaptedTradingSystem)
      functionLibraryPartsFromNodes.createPartFromNode(adaptedTradingSystem, undefined, undefined)
      thisObject.tradingSystem = adaptedTradingSystem
      thisObject.tradingSystem.payload.uiObject.setRunningStatus()
    }
  }

  function getContainer (point) {

  }

  function detachNode (node) {
    functionLibraryAttachDetach.detachNode(node, rootNodes)
  }

  function attachNode (node, attachToNode) {
    functionLibraryAttachDetach.attachNode(node, attachToNode, rootNodes)
  }

  function physics () {
    /* Here we will save all the workspace related objects into the local storage */
    let stringifyReadyNodes = []
    for (let i = 0; i < rootNodes.length; i++) {
      let rootNode = rootNodes[i]
      let workspaceNode = functionLibraryWorkspaceNodes.getWorkspaceNode(rootNode)
      stringifyReadyNodes.push(workspaceNode)
    }
    let workspace = {
      idAtStrategizer: thisObject.idAtStrategizer,
      rootNodes: stringifyReadyNodes
    }
    let textToSave = JSON.stringify(workspace)
    window.localStorage.setItem('workspace', textToSave)
  }

  function spawn (nodeText, point) {
    point = canvas.floatingSpace.container.frame.unframeThisPoint(point)
    spawnPosition.x = point.x
    spawnPosition.y = point.y

    let dirtyNode = JSON.parse(nodeText)
    let rootNode = functionLibraryProtocolNode.getProtocolNode(dirtyNode)
    rootNodes.push(rootNode)
    functionLibraryPartsFromNodes.createPartFromNode(rootNode, undefined, undefined)
  }

  async function onMenuItemClick (payload, action) {
    switch (action) {
      case 'Save Trading System':
        {
          let result = await canvas.strategySpace.strategizerGateway.saveToStrategyzer()
          return result
          break
        }

      case 'Edit Code':

        break
      case 'Download':

        let text = JSON.stringify(functionLibraryProtocolNode.getProtocolNode(payload.node))
        let nodeName = payload.node.name
        if (nodeName === undefined) {
          nodeName = ''
        } else {
          nodeName = '.' + nodeName
        }
        let fileName = payload.node.type + nodeName + '.json'
        download(fileName, text)

        break

      case 'New Strategy':
        {
          functionLibraryPartsFromNodes.newStrategy(payload.node)
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
      case 'Delete Strategy': {
        functionLibraryNodeDeleter.deleteStrategy(payload.node, rootNodes)
        break
      }
      case 'Delete Trigger Stage': {
        functionLibraryNodeDeleter.deleteTriggerStage(payload.node, rootNodes)
        break
      }
      case 'Delete Open Stage': {
        functionLibraryNodeDeleter.deleteOpenStage(payload.node, rootNodes)
        break
      }
      case 'Delete Manage Stage': {
        functionLibraryNodeDeleter.deleteManageStage(payload.node, rootNodes)
        break
      }
      case 'Delete Close Stage': {
        functionLibraryNodeDeleter.deleteCloseStage(payload.node, rootNodes)
        break
      }
      case 'Delete Initial Definition': {
        functionLibraryNodeDeleter.deleteInitialDefinition(payload.node, rootNodes)
        break
      }
      case 'Delete Event': {
        functionLibraryNodeDeleter.deleteEvent(payload.node, rootNodes)
        break
      }
      case 'Delete Managed Item': {
        functionLibraryNodeDeleter.deleteManagedItem(payload.node, rootNodes)
        break
      }
      case 'Delete Phase': {
        functionLibraryNodeDeleter.deletePhase(payload.node, rootNodes)
        break
      }
      case 'Delete Formula': {
        functionLibraryNodeDeleter.deleteFormula(payload.node, rootNodes)
        break
      }
      case 'Delete Situation': {
        functionLibraryNodeDeleter.deleteSituation(payload.node, rootNodes)
        break
      }
      case 'Delete Condition': {
        functionLibraryNodeDeleter.deleteCondition(payload.node, rootNodes)
        break
      }
      case 'Delete Code': {
        functionLibraryNodeDeleter.deleteCode(payload.node, rootNodes)
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
