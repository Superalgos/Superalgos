
function newWorkspace () {
  const MODULE_NAME = 'Workspace'

  let thisObject = {
    tradingSystem: undefined,
    container: undefined,
    idAtStrategizer: undefined,
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

  return thisObject

  function finalize () {
    thisObject.tradingSystem = undefined
    thisObject.container.finalize()
    thisObject.container = undefined
  }

  async function initialize () {
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
          createPartFromNode(rootNode, undefined, undefined)
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
      generateStrategyParts(adaptedTradingSystem)
      thisObject.tradingSystem = adaptedTradingSystem
      thisObject.tradingSystem.payload.uiObject.setRunningStatus()
    }
  }

  function getContainer (point) {

  }

  function physics () {
    /* Here we will save all the workspace related objects into the local storage */
    let stringifyReadyNodes = []
    for (let i = 0; i < rootNodes.length; i++) {
      let rootNode = rootNodes[i]
      let workspaceNode = getWorkspaceNode(rootNode)
      stringifyReadyNodes.push(workspaceNode)
    }
    let workspace = {
      idAtStrategizer: thisObject.idAtStrategizer,
      rootNodes: stringifyReadyNodes
    }
    let textToSave = JSON.stringify(workspace)
    // window.localStorage.setItem('workspace', textToSave)
  }

  function spawn (nodeText, point) {
    point = canvas.floatingSpace.container.frame.unframeThisPoint(point)
    spawnPosition.x = point.x
    spawnPosition.y = point.y

    let dirtyNode = JSON.parse(nodeText)
    let rootNode = getProtocolNode(dirtyNode)
    rootNodes.push(rootNode)
    createPartFromNode(rootNode, undefined, undefined)
  }

  function createPartFromNode (node, parentNode, chainParent) {
    switch (node.type) {
      case 'Condition':
        {
          let condition = node
          createPart('Condition', condition.name, condition, parentNode, chainParent, 'Condition')
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
      case 'Phase': {
        let phase = node
        createPart('Phase', phase.name, phase, parentNode, chainParent, phase.subType)
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createPartFromNode(situation, phase, phase)
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
      case 'Initial Definition': {
        createPart('Initial Definition', node.name, node, parentNode, chainParent, 'Initial Definition')
        return
      }
      case 'Take Position Event': {
        let event = node
        createPart('Take Position Event', event.name, event, parentNode, chainParent, 'Take Position Event')
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createPartFromNode(situation, event, event)
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
        return
      }
      case 'Trigger Off Event': {
        let event = node
        createPart('Trigger Off Event', event.name, event, parentNode, chainParent, 'Trigger Off Event')
        for (let m = 0; m < node.situations.length; m++) {
          let situation = node.situations[m]
          createPartFromNode(situation, event, event)
        }
        return
      }
      case 'Trigger Stage': {
        let stage = node
        createPart('Trigger Stage', stage.name, stage, parentNode, chainParent, 'Trigger Stage')

        if (node.entryPoint !== undefined) {
          createPartFromNode(node.entryPoint, stage, stage)
        }
        if (node.exitPoint !== undefined) {
          createPartFromNode(node.exitPoint, stage, stage)
        }
        if (node.sellPoint !== undefined) {
          createPartFromNode(node.sellPoint, stage, stage)
        }
        return
      }
      case 'Open Stage': {
        let stage = node
        createPart('Open Stage', stage.name, stage, parentNode, chainParent, 'Open Stage')

        if (node.initialDefinition !== undefined) {
          createPartFromNode(node.initialDefinition, stage, stage)
        }
        return
      }
      case 'Manage Stage': {
        let stage = node
        createPart('Manage Stage', stage.name, stage, parentNode, chainParent, 'Manage Stage')

        if (node.stopLoss !== undefined) {
          createPartFromNode(node.stopLoss, stage, stage)
        }
        if (node.buyOrder !== undefined) {
          createPartFromNode(node.buyOrder, stage, stage)
        }
        return
      }
      case 'Close Stage': {
        let stage = node
        createPart('Close Stage', stage.name, stage, parentNode, chainParent, 'Close Stage')
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
      case 'Trading System': {
        let tradingSystem = node
        createPart('Trading System', tradingSystem.name, tradingSystem, parentNode, chainParent, 'Trading System')
        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = node.strategies[m]
          createPartFromNode(strategy, tradingSystem, tradingSystem)
        }
        return
      }
    }
  }

  function detachNode (node) {
    switch (node.type) {
      case 'Trading System': {
        return
      }
      case 'Strategy': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.strategies.length; i++) {
          let strategy = payload.parentNode.strategies[i]
          if (strategy.id === node.id) {
            payload.parentNode.strategies.splice(i, 1)
          }
          completeDetachment(node)
        }
      }
        break
      case 'Trigger Stage': {
        return
      }
      case 'Open Stage': {
        return
      }
      case 'Manage Stage': {
        return
      }
      case 'Close Stage': {
        return
      }
      case 'Trigger On Event': {
        return
      }
        break
      case 'Trigger Off Event': {
        return
      }
        break
      case 'Take Position Event': {
        return
      }
      case 'Initial Definition': {
        return
      }
        break
      case 'Stop': {
        return
      }
        break
      case 'Take Profit': {
        return
      }
        break
      case 'Condition': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.conditions.length; i++) {
          let condition = payload.parentNode.conditions[i]
          if (condition.id === node.id) {
            payload.parentNode.conditions.splice(i, 1)
          }
        }
        completeDetachment(node)
      }
        break
      case 'Situation': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.situations.length; i++) {
          let situation = payload.parentNode.situations[i]
          if (situation.id === node.id) {
            payload.parentNode.situations.splice(i, 1)
          }
        }
        completeDetachment(node)
      }
        break
      case 'Phase': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.phases.length; i++) {
          let phase = payload.parentNode.phases[i]
          if (phase.id === node.id) {
            if (i < payload.parentNode.phases.length - 1) {
              let nextPhase = payload.parentNode.phases[i + 1]
              if (i > 0) {
                let previousPhase = payload.parentNode.phases[i - 1]
                nextPhase.payload.chainParent = previousPhase
              } else {
                nextPhase.payload.chainParent = payload.parentNode
              }
            }
            payload.parentNode.phases.splice(i, 1)
            completeDetachment(node)
            return
          }
        }
      }
    }
  }

  function attachNode (node, attachToNode) {
    switch (node.type) {
      case 'Strategy': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.strategies.push(node)
        completeAttachment(node)
      }
        break
      case 'Phase': {
        switch (attachToNode.type) {
          case 'Stop': {
            node.payload.parentNode = attachToNode
            if (attachToNode.phases.length > 0) {
              let phase = attachToNode.phases[attachToNode.phases.length - 1]
              node.payload.chainParent = phase
            } else {
              node.payload.chainParent = attachToNode
            }
            attachToNode.phases.push(node)
            completeAttachment(node)
          }
            break
          case 'Take Profit': {
            node.payload.parentNode = attachToNode
            if (attachToNode.phases.length > 0) {
              let phase = attachToNode.phases[attachToNode.phases.length - 1]
              node.payload.chainParent = phase
            } else {
              node.payload.chainParent = attachToNode
            }
            attachToNode.phases.push(node)
            completeAttachment(node)
          }
            break
          case 'Phase': {
            node.payload.parentNode = attachToNode.payload.parentNode
            for (let i = 0; i < node.payload.parentNode.phases.length; i++) {
              let phase = node.payload.parentNode.phases[i]
              if (attachToNode.id === phase.id) {
                if (i === node.payload.parentNode.phases.length - 1) {
                  node.payload.chainParent = attachToNode
                  node.payload.parentNode.phases.push(node)
                  completeAttachment(node)
                } else {
                  node.payload.chainParent = attachToNode
                  let nextPhase = node.payload.parentNode.phases[i + 1]
                  nextPhase.payload.chainParent = node
                  node.payload.parentNode.phases.splice(i + 1, 0, node)
                  completeAttachment(node)
                  return
                }
              }
            }
          }
        }
      }
        break
      case 'Situation': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.situations.push(node)
        completeAttachment(node)
      }
        break
      case 'Condition': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.conditions.push(node)
        completeAttachment(node)
      }
        break
    }
  }

  function completeDetachment (node) {
    node.payload.parentNode = undefined
    node.payload.chainParent = undefined
    rootNodes.push(node)
  }

  function completeAttachment (node) {
    for (let i = 0; i < rootNodes.length; i++) {
      let rootNode = rootNodes[i]
      if (rootNode.id === node.id) {
        rootNodes.splice(i, 1)
        return
      }
    }
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
    } else {
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
    payload.onMenuItemClick = onMenuItemClick

    if (node.id === undefined) {
      node.id = newUniqueId()
    }
    node.payload = payload
    node.type = partType
    canvas.floatingSpace.strategyPartConstructor.createStrategyPart(payload)
  }

  function destroyPart (node) {
    canvas.floatingSpace.strategyPartConstructor.destroyStrategyPart(node.payload)
  }

  function generateStrategyParts (node) {
    let lastPhase
    let tradingSystem = node

    createPart('Trading System', tradingSystem.name, tradingSystem, undefined, undefined)

    for (m = 0; m < tradingSystem.strategies.length; m++) {
      let strategy = tradingSystem.strategies[m]
      createPart('Strategy', strategy.name, strategy, tradingSystem, tradingSystem)

      createPart('Trigger On Event', '', strategy.entryPoint, strategy, strategy)
      for (let k = 0; k < strategy.entryPoint.situations.length; k++) {
        let situation = strategy.entryPoint.situations[k]
        createPart('Situation', situation.name, situation, strategy.entryPoint, strategy.entryPoint, 'Trigger On' + ' ' + 'Situation')

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          createPart('Condition', condition.name, condition, situation, situation, 'Condition')
        }
      }

      createPart('Trigger Off Event', '', strategy.exitPoint, strategy, strategy)
      for (let k = 0; k < strategy.exitPoint.situations.length; k++) {
        let situation = strategy.exitPoint.situations[k]
        createPart('Situation', situation.name, situation, strategy.exitPoint, strategy.exitPoint, 'Trigger Off' + ' ' + 'Situation')

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          createPart('Condition', condition.name, condition, situation, situation, 'Condition')
        }
      }

      createPart('Take Position Event', '', strategy.sellPoint, strategy, strategy)
      for (let k = 0; k < strategy.sellPoint.situations.length; k++) {
        let situation = strategy.sellPoint.situations[k]
        createPart('Situation', situation.name, situation, strategy.sellPoint, strategy.sellPoint, 'Take Position' + ' ' + 'Situation')

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          createPart('Condition', condition.name, condition, situation, situation, 'Condition')
        }
      }

      createPart('Stop', '', strategy.stopLoss, strategy, strategy)
      for (let p = 0; p < strategy.stopLoss.phases.length; p++) {
        let phase = strategy.stopLoss.phases[p]

        let chainParent
        if (p === 0) {
          chainParent = strategy.stopLoss
        } else {
          chainParent = lastPhase
        }
        lastPhase = phase
        createPart('Phase', phase.name, phase, strategy.stopLoss, chainParent, 'Stop Phase')

        for (let k = 0; k < phase.situations.length; k++) {
          let situation = phase.situations[k]
          createPart('Situation', situation.name, situation, phase, phase, 'Situation')

          for (let m = 0; m < situation.conditions.length; m++) {
            let condition = situation.conditions[m]
            createPart('Condition', condition.name, condition, situation, situation, 'Condition')
          }
        }
      }

      createPart('Take Profit', '', strategy.buyOrder, strategy, strategy)
      for (let p = 0; p < strategy.buyOrder.phases.length; p++) {
        let phase = strategy.buyOrder.phases[p]
        let chainParent
        if (p === 0) {
          chainParent = strategy.buyOrder
        } else {
          chainParent = lastPhase
        }
        lastPhase = phase
        createPart('Phase', phase.name, phase, strategy.buyOrder, chainParent, 'Take Profit Phase')

        for (let k = 0; k < phase.situations.length; k++) {
          let situation = phase.situations[k]
          createPart('Situation', situation.name, situation, phase, phase, 'Situation')

          for (let m = 0; m < situation.conditions.length; m++) {
            let condition = situation.conditions[m]
            createPart('Condition', condition.name, condition, situation, situation, 'Condition')
          }
        }
      }
    }
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

        let text = JSON.stringify(getProtocolNode(payload.node))
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
          let strategyParent = payload.node

          let strategy = {
            name: 'New Strategy',
            active: true,
            triggerStage: {
              entryPoint: {
                situations: []
              },
              exitPoint: {
                situations: []
              },
              sellPoint: {
                situations: []
              }
            },
            openStage: {
              initialDefinition: {}
            },
            manageStage: {
              stopLoss: {
                phases: []
              },
              buyOrder: {
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

          createPart('Trigger On Event', '', strategy.triggerStage.entryPoint, strategy.triggerStage, strategy.triggerStage)
          createPart('Trigger Off Event', '', strategy.triggerStage.exitPoint, strategy.triggerStage, strategy.triggerStage)
          createPart('Take Position Event', '', strategy.triggerStage.sellPoint, strategy.triggerStage, strategy.triggerStage)

          createPart('Initial Definition', '', strategy.openStage.initialDefinition, strategy.openStage, strategy.openStage)

          createPart('Stop', '', strategy.manageStage.stopLoss, strategy.manageStage, strategy.manageStage)
          createPart('Take Profit', '', strategy.manageStage.buyOrder, strategy.manageStage, strategy.manageStage)
        }
        break
      case 'Add Phase':
        {
          let phaseParent = payload.node
          let m = phaseParent.phases.length
          let phase = {
            name: 'New Phase',
            code: '',
            situations: []
          }
          phaseParent.phases.push(phase)
          let phaseChainParent
          if (m > 0) {
            phaseChainParent = phaseParent.phases[m - 1]
          } else {
            phaseChainParent = phaseParent
          }
          createPart('Phase', phase.name, phase, phaseParent, phaseChainParent, 'Phase')
        }
        break
      case 'Add Situation':
        {
          let phase = payload.node
          let m = phase.situations.length
          let situation = {
            name: 'New Situation',
            conditions: []
          }
          phase.situations.push(situation)
          createPart('Situation', situation.name, situation, phase, phase, 'Situation')
        }
        break
      case 'Add Condition':
        {
          let situation = payload.node
          let m = situation.conditions.length
          let condition = {
            name: 'New Condition',
            code: ''
          }
          situation.conditions.push(condition)
          createPart('Condition', condition.name, condition, situation, situation, 'Condition')
        }
        break
      case 'Delete Strategy': {
        deleteStrategy(payload.node)
        break
      }
      case 'Delete Trigger Stage': {
        deleteTriggerStage(payload.node)
        break
      }
      case 'Delete Open Stage': {
        deleteOpenStage(payload.node)
        break
      }
      case 'Delete Manage Stage': {
        deleteManageStage(payload.node)
        break
      }
      case 'Delete Close Stage': {
        deleteClose(payload.node)
        break
      }
      case 'Delete Phase': {
        deletePhase(payload.node)
        break
      }
      case 'Delete Situation': {
        deleteSituation(payload.node)
        break
      }
      case 'Delete Condition': {
        deleteCondition(payload.node)
        break
      }
      default:

    }
  }

  function deleteStrategy (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.strategies.length; j++) {
        let strategy = payload.parentNode.strategies[j]
        if (strategy.id === node.id) {
          payload.parentNode.strategies.splice(j, 1)
        }
      }
    }
    deleteTriggerStage(node.triggerStage)
    deleteOpenStage(node.openStage)
    deleteManageStage(node.manageStage)
    deleteCloseStage(node.closeStage)
    destroyPart(node)
    cleanNode(node)
  }

  function deleteTriggerStage (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.triggerStage = undefined
    }
    deleteEvent(node.entryPoint)
    deleteEvent(node.exitPoint)
    deleteEvent(node.sellPoint)

    destroyPart(node)
    cleanNode(node)
  }

  function deleteOpenStage (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.openStage = undefined
    }
    deleteInitialDefinition(node.initialDefinition)

    destroyPart(node)
    cleanNode(node)
  }

  function deleteManageStage (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.manageStage = undefined
    }
    deleteManagedItem(node.stopLoss)
    deleteManagedItem(node.buyOrder)

    destroyPart(node)
    cleanNode(node)
  }

  function deleteCloseStage (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.closeStage = undefined
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteInitialDefinition (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      payload.parentNode.initialDefinition = undefined
    }

    destroyPart(node)
    cleanNode(node)
  }

  function deleteEvent (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      switch (node.type) {
        case 'Trigger On Event': {
          payload.parentNode.entryPoint = undefined
          break
        }
        case 'Trigger Off Event': {
          payload.parentNode.exitPoint = undefined
          break
        }
        case 'Take Position Event': {
          payload.parentNode.sellPoint = undefined
          break
        }
      }
    }

    while (node.situations.length > 0) {
      deleteSituation(node.situations[0])
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteManagedItem (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      switch (node.type) {
        case 'Stop Loss': {
          payload.parentNode.stopLoss = undefined
          break
        }
        case 'Take Profit': {
          payload.parentNode.buyOrder = undefined
          break
        }
      }
    }

    while (node.phases.length > 0) {
      deletePhase(node.phases[0])
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deletePhase (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let k = 0; k < payload.parentNode.phases.length; k++) {
        let phase = payload.parentNode.phases[k]
        if (phase.id === node.id) {
          while (phase.situations.length > 0) {
            let situation = phase.situations[0]
            deleteSituation(situation)
          }
          phase.situations = []
        /* Before deleting this phase we need to give its chainParent to the next phase down the chain */
          if (k < payload.parentNode.phases.length - 1) {
            payload.parentNode.phases[k + 1].payload.chainParent = payload.chainParent
          }
        /* Continue destroying this phase */
          payload.parentNode.phases.splice(k, 1)
          destroyPart(phase)
          cleanNode(phase)
          return
        }
      }
    } else {
      while (node.situations.length > 0) {
        let situation = node.situations[0]
        deleteSituation(situation)
      }
      node.situations = []
      destroyPart(node)
      cleanNode(node)
    }
  }

  function deleteSituation (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let j = 0; j < payload.parentNode.situations.length; j++) {
        let situation = payload.parentNode.situations[j]
        if (situation.id === node.id) {
          while (situation.conditions.length > 0) {
            let condition = situation.conditions[0]
            deleteCondition(condition)
          }
          situation.conditions = []
          payload.parentNode.situations.splice(j, 1)
          destroyPart(situation)
          cleanNode(situation)
          return
        }
      }
    } else {
      while (node.conditions.length > 0) {
        let condition = node.conditions[0]
        deleteCondition(condition)
      }
      node.conditions = []
      destroyPart(node)
      cleanNode(node)
    }
  }

  function deleteCondition (node) {
    let payload = node.payload
    if (payload.parentNode !== undefined) {
      for (let i = 0; i < payload.parentNode.conditions.length; i++) {
        let condition = payload.parentNode.conditions[i]
        if (condition.id === node.id) {
          payload.parentNode.conditions.splice(i, 1)
          destroyPart(node)
          cleanNode(condition)
          return
        }
      }
    } else {
      destroyPart(node)
      cleanNode(node)
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

  function download (filename, text) {
    let element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  function getProtocolNode (node) {
    switch (node.type) {
      case 'Condition':
        {
          let condition = {
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: node.code
          }
          return condition
        }
      case 'Situation': {
        let situation = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          conditions: []
        }

        for (let m = 0; m < node.conditions.length; m++) {
          let condition = getProtocolNode(node.conditions[m])
          situation.conditions.push(condition)
        }
        return situation
      }
      case 'Phase': {
        let phase = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          situations: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m])
          phase.situations.push(situation)
        }
        return phase
      }
      case 'Stop': {
        let stop = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: []
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getProtocolNode(node.phases[m])
          stop.phases.push(phase)
        }
        return stop
      }
      case 'Take Profit': {
        let takeProfit = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: []
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getProtocolNode(node.phases[m])
          takeProfit.phases.push(phase)
        }
        return takeProfit
      }
      case 'Take Position Event': {
        let event = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m])
          event.situations.push(situation)
        }
        return event
      }
      case 'Trigger On Event': {
        let event = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m])
          event.situations.push(situation)
        }
        return event
      }
      case 'Trigger Off Event': {
        let event = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: []
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getProtocolNode(node.situations[m])
          event.situations.push(situation)
        }
        return event
      }
      case 'Initial Definition': {
        let object = {
          type: node.type,
          subType: node.subType,
          name: node.name
        }
        return object
      }
      case 'Trigger Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          entryPoint: getProtocolNode(node.entryPoint),
          exitPoint: getProtocolNode(node.exitPoint),
          sellPoint: getProtocolNode(node.sellPoint)
        }
        return stage
      }
      case 'Open Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          initialDefinition: getProtocolNode(node.initialDefinition)
        }
        return stage
      }
      case 'Manage Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getProtocolNode(node.stopLoss),
          buyOrder: getProtocolNode(node.buyOrder)
        }
        return stage
      }
      case 'Close Stage': {
        let stage = {
          type: node.type,
          subType: node.subType,
          name: node.name
        }
        return stage
      }
      case 'Strategy': {
        let strategy = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          triggerStage: getProtocolNode(node.triggerStage),
          openStage: getProtocolNode(node.openStage),
          manageStage: getProtocolNode(node.manageStage),
          closeStage: getProtocolNode(node.closeStage)
        }
        return strategy
      }
      case 'Trading System': {
        let tradingSystem = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          strategies: []
        }

        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = getProtocolNode(node.strategies[m])
          tradingSystem.strategies.push(strategy)
        }
        return tradingSystem
      }
    }
  }

  function getWorkspaceNode (node) {
    switch (node.type) {
      case 'Condition':
        {
          let condition = {
            id: node.id,
            type: node.type,
            subType: node.subType,
            name: node.name,
            code: node.code,
            savedPayload: getSavedPayload(node)
          }
          return condition
        }
      case 'Situation': {
        let situation = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          conditions: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.conditions.length; m++) {
          let condition = getWorkspaceNode(node.conditions[m])
          situation.conditions.push(condition)
        }
        return situation
      }
      case 'Phase': {
        let phase = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          code: node.code,
          situations: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getWorkspaceNode(node.situations[m])
          phase.situations.push(situation)
        }
        return phase
      }
      case 'Stop': {
        let stop = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getWorkspaceNode(node.phases[m])
          stop.phases.push(phase)
        }
        return stop
      }
      case 'Take Profit': {
        let takeProfit = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          phases: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.phases.length; m++) {
          let phase = getWorkspaceNode(node.phases[m])
          takeProfit.phases.push(phase)
        }
        return takeProfit
      }
      case 'Take Position Event': {
        let event = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getWorkspaceNode(node.situations[m])
          event.situations.push(situation)
        }
        return event
      }
      case 'Trigger On Event': {
        let event = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getWorkspaceNode(node.situations[m])
          event.situations.push(situation)
        }
        return event
      }
      case 'Trigger Off Event': {
        let event = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          situations: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.situations.length; m++) {
          let situation = getWorkspaceNode(node.situations[m])
          event.situations.push(situation)
        }
        return event
      }
      case 'Initial Definition': {
        let object = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          savedPayload: getSavedPayload(node)
        }
        return object
      }
      case 'Trigger Stage': {
        let stage = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          entryPoint: getWorkspaceNode(node.entryPoint),
          exitPoint: getWorkspaceNode(node.exitPoint),
          sellPoint: getWorkspaceNode(node.sellPoint),
          savedPayload: getSavedPayload(node)
        }
        return stage
      }
      case 'Open Stage': {
        let stage = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          initialDefinition: getWorkspaceNode(node.initialDefinition),
          savedPayload: getSavedPayload(node)
        }
        return stage
      }
      case 'Manage Stage': {
        let stage = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          stopLoss: getWorkspaceNode(node.stopLoss),
          buyOrder: getWorkspaceNode(node.buyOrder),
          savedPayload: getSavedPayload(node)
        }
        return stage
      }
      case 'Close Stage': {
        let stage = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          savedPayload: getSavedPayload(node)
        }
        return stage
      }
      case 'Strategy': {
        let strategy = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          entryPoint: getWorkspaceNode(node.entryPoint),
          exitPoint: getWorkspaceNode(node.exitPoint),
          sellPoint: getWorkspaceNode(node.sellPoint),
          stopLoss: getWorkspaceNode(node.stopLoss),
          buyOrder: getWorkspaceNode(node.buyOrder),
          savedPayload: getSavedPayload(node)
        }
        return strategy
      }
      case 'Trading System': {
        let tradingSystem = {
          id: node.id,
          type: node.type,
          subType: node.subType,
          name: node.name,
          strategies: [],
          savedPayload: getSavedPayload(node)
        }

        for (let m = 0; m < node.strategies.length; m++) {
          let strategy = getWorkspaceNode(node.strategies[m])
          tradingSystem.strategies.push(strategy)
        }
        return tradingSystem
      }
    }
  }

  function getSavedPayload (node) {
    let savedPayload = {
      position: {
        x: node.payload.position.x,
        y: node.payload.position.y
      },
      targetPosition: {
        x: node.payload.targetPosition.x,
        y: node.payload.targetPosition.y
      },
      floatingObject: {
        isPinned: node.payload.floatingObject.isPinned
      },
      uiObject: {
        isRunning: node.payload.uiObject.isRunning
      }
    }
    return savedPayload
  }
}
