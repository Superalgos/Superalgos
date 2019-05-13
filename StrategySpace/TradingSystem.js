
function newTradingSystem () {
  const MODULE_NAME = 'Trading System'

  let thisObject = {
    protocolData: undefined,
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
    thisObject.protocolData = undefined
    thisObject.container.finalize()
    thisObject.container = undefined
  }

  function initialize (protocolData) {
    thisObject.protocolData = {
      id: protocolData.id,
      strategies: protocolData.subStrategies
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
    let tradingSystem = thisObject.protocolData

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
    let strategy = thisObject.protocolData
    destroyPart(strategy)

    destroyPart(strategy.entryPoint)
    for (let k = 0; k < strategy.entryPoint.situations.length; k++) {
      let situation = strategy.entryPoint.situations[k]
      destroyPart(situation)

      for (let m = 0; m < situation.conditions.length; m++) {
        let condition = situation.conditions[m]
        destroyPart(condition)
      }
    }

    destroyPart(strategy.exitPoint)
    for (let k = 0; k < strategy.exitPoint.situations.length; k++) {
      let situation = strategy.exitPoint.situations[k]
      destroyPart(situation)

      for (let m = 0; m < situation.conditions.length; m++) {
        let condition = situation.conditions[m]
        destroyPart(condition)
      }
    }

    destroyPart(strategy.sellPoint)
    for (let k = 0; k < strategy.sellPoint.situations.length; k++) {
      let situation = strategy.sellPoint.situations[k]
      destroyPart(situation)

      for (let m = 0; m < situation.conditions.length; m++) {
        let condition = situation.conditions[m]
        destroyPart(condition)
      }
    }

    destroyPart(strategy.stopLoss)
    for (let p = 0; p < strategy.stopLoss.phases.length; p++) {
      let phase = strategy.stopLoss.phases[p]
      destroyPart(strategy.stopLoss)

      for (let k = 0; k < phase.situations.length; k++) {
        let situation = phase.situations[k]
        destroyPart(situation)

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          destroyPart(condition)
        }
      }
    }

    destroyPart(strategy.buyOrder)
    for (let p = 0; p < strategy.buyOrder.phases.length; p++) {
      let phase = strategy.buyOrder.phases[p]
      destroyPart(strategy.buyOrder)

      for (let k = 0; k < phase.situations.length; k++) {
        let situation = phase.situations[k]
        destroyPart(situation)

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          destroyPart(condition)
        }
      }
    }
  }

  async function onMenuItemClick (payload, action) {
    switch (action) {
      case 'Save Trading System':
        {
          let result = await canvas.strategySpace.workplace.saveToStrategyzer()
          return result
          break
        }

      case 'Open Settings':
        break
      case 'Delete Strategy':

        break

      case 'Reload Strategy':

        break

      case 'Save Strategy':

        break

      case 'Edit Code':

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
}
