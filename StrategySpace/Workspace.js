
function newWorkspace () {
  const MODULE_NAME = 'Workspace'

  let thisObject = {
    tradingSystem: undefined,
    container: undefined,
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

  return thisObject

  function finalize () {
    destroyStrategyParts()
    thisObject.tradingSystem = undefined
    thisObject.container.finalize()
    thisObject.container = undefined
  }

  function initialize (tradingSystem) {
    thisObject.tradingSystem = {
      id: tradingSystem.id,
      strategies: tradingSystem.subStrategies
    }
    generateStrategyParts()
  }

  function getContainer (point) {

  }

  function createPart (partType, name, node, parentNode, chainParent, title) {
    let payload = {}
    if (chainParent === undefined) {
      payload.targetPosition = {
        x: canvas.floatingSpace.container.frame.width / 2,
        y: canvas.floatingSpace.container.frame.height / 2
      }
    } else {
      payload.targetPosition = {
        x: chainParent.payload.position.x,
        y: chainParent.payload.position.y
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

  function generateStrategyParts () {
    let lastPhase
    let tradingSystem = thisObject.tradingSystem

    createPart('Trading System', '', tradingSystem, undefined, undefined)

    for (m = 0; m < tradingSystem.strategies.length; m++) {
      let strategy = tradingSystem.strategies[m]
      createPart('Strategy', strategy.name, strategy, tradingSystem, tradingSystem)

      createPart('Strategy Entry Event', '', strategy.entryPoint, strategy, strategy)
      for (let k = 0; k < strategy.entryPoint.situations.length; k++) {
        let situation = strategy.entryPoint.situations[k]
        createPart('Situation', situation.name, situation, strategy.entryPoint, strategy.entryPoint, 'Strategy Entry' + ' ' + 'Situation')

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          createPart('Condition', condition.name, condition, situation, situation, 'Condition')
        }
      }

      createPart('Strategy Exit Event', '', strategy.exitPoint, strategy, strategy)
      for (let k = 0; k < strategy.exitPoint.situations.length; k++) {
        let situation = strategy.exitPoint.situations[k]
        createPart('Situation', situation.name, situation, strategy.exitPoint, strategy.exitPoint, 'Strategy Exit' + ' ' + 'Situation')

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          createPart('Condition', condition.name, condition, situation, situation, 'Condition')
        }
      }

      createPart('Trade Entry Event', '', strategy.sellPoint, strategy, strategy)
      for (let k = 0; k < strategy.sellPoint.situations.length; k++) {
        let situation = strategy.sellPoint.situations[k]
        createPart('Situation', situation.name, situation, strategy.sellPoint, strategy.sellPoint, 'Trade Entry' + ' ' + 'Situation')

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

  function destroyStrategyParts () {

  }

  async function onMenuItemClick (payload, action) {
    switch (action) {
      case 'Save Trading System':
        {
          let result = await canvas.strategySpace.strategizerGateway.saveToStrategyzer(canvas.strategySpace.workspace.tradingSystem)
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
            entryPoint: {
              situations: []
            },
            exitPoint: {
              situations: []
            },
            sellPoint: {
              situations: []
            },
            stopLoss: {
              phases: []
            },
            buyOrder: {
              phases: []
            }
          }

          strategyParent.strategies.push(strategy)
          createPart('Strategy', strategy.name, strategy, strategyParent, strategyParent, 'Strategy')
          createPart('Strategy Entry Event', '', strategy.entryPoint, strategy, strategy)
          createPart('Strategy Exit Event', '', strategy.exitPoint, strategy, strategy)
          createPart('Trade Entry Event', '', strategy.sellPoint, strategy, strategy)
          createPart('Stop', '', strategy.stopLoss, strategy, strategy)
          createPart('Take Profit', '', strategy.buyOrder, strategy, strategy)
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
    for (let j = 0; j < payload.parentNode.strategies.length; j++) {
      let strategy = payload.parentNode.strategies[j]
      if (strategy.id === node.id) {
        deleteEvent(strategy.entryPoint)
        deleteEvent(strategy.exitPoint)
        deleteEvent(strategy.sellPoint)
        deleteManagedItem(strategy.stopLoss)
        deleteManagedItem(strategy.buyOrder)
        destroyPart(strategy)
        payload.parentNode.strategies.splice(j, 1)
        cleanNode(strategy)
        return
      }
    }
  }

  function deleteEvent (node) {
    while (node.situations.length > 0) {
      deleteSituation(node.situations[0])
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deleteManagedItem (node) {
    while (node.phases.length > 0) {
      deletePhase(node.phases[0])
    }
    destroyPart(node)
    cleanNode(node)
  }

  function deletePhase (node) {
    let payload = node.payload
    for (let k = 0; k < payload.parentNode.phases.length; k++) {
      let phase = payload.parentNode.phases[k]
      if (phase.id === node.id) {
        for (let j = 0; j < phase.situations.length; j++) {
          let situation = phase.situations[j]
          for (let i = 0; i < situation.conditions.length; i++) {
            let condition = situation.conditions[i]
            destroyPart(condition)
            cleanNode(condition)
          }
          situation.conditions = []
          destroyPart(situation)
          phase.situations.splice(j, 1)
          cleanNode(situation)
        }
        phase.situations = []
        /* Before deleting this phase we need to give its chainParent to the next phase down the chain */
        if (k < payload.parentNode.phases.length - 1) {
          payload.parentNode.phases[k + 1].payload.chainParent = payload.chainParent
        }
        /* Continue destroying this phase */
        destroyPart(phase)
        payload.parentNode.phases.splice(k, 1)
        cleanNode(phase)
        return
      }
    }
  }

  function deleteSituation (node) {
    let payload = node.payload
    for (let j = 0; j < payload.parentNode.situations.length; j++) {
      let situation = payload.parentNode.situations[j]
      if (situation.id === node.id) {
        for (let i = 0; i < situation.conditions.length; i++) {
          let condition = situation.conditions[i]
          destroyPart(condition)
          cleanNode(condition)
        }
        situation.conditions = []
        destroyPart(situation)
        payload.parentNode.situations.splice(j, 1)
        cleanNode(situation)
        return
      }
    }
  }

  function deleteCondition (node) {
    let payload = node.payload
    for (let i = 0; i < payload.parentNode.conditions.length; i++) {
      let condition = payload.parentNode.conditions[i]
      if (condition.id === node.id) {
        destroyPart(node)
        payload.parentNode.conditions.splice(i, 1)
        cleanNode(condition)
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
            name: node.name,
            code: node.code
          }
          return condition
          break
        }
      case 'Situation': {
        let situation = {
          type: node.type,
          name: node.name,
          conditions: []
        }

        for (let m = 0; m < node.conditions.length; m++) {
          let condition = getProtocolNode(node.conditions[m])
          situation.conditions.push(condition)
        }
        return situation
        break
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
        break
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
        break
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
        break
      }
      case 'Trade Entry Event': {
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
        break
      }
      case 'Strategy Entry Event': {
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
        break
      }
      case 'Strategy Exit Event': {
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
        break
      }
      case 'Strategy': {
        let strategy = {
          type: node.type,
          subType: node.subType,
          name: node.name,
          entryPoint: getProtocolNode(node.entryPoint),
          exitPoint: getProtocolNode(node.exitPoint),
          sellPoint: getProtocolNode(node.sellPoint),
          stopLoss: getProtocolNode(node.stopLoss),
          buyOrder: getProtocolNode(node.buyOrder)
        }
        return strategy
        break
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
        break
      }
    }
  }
}

