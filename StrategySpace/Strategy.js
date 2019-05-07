
function newStrategy () {
  const MODULE_NAME = 'Strategy'

  let thisObject = {
    strategySource: undefined,
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
  }

  function initialize (pStrategySource) {
    thisObject.strategySource = pStrategySource
    generateStrategyParts()
  }

  function getContainer (point) {

  }

  function createPart (partType, name, node, parentNode, chainParent, title) {
    let payload = {}
    if (chainParent === undefined) {
      payload.targetPosition = {
        x: (viewPort.width - SIDE_PANEL_WIDTH) / 2 + SIDE_PANEL_WIDTH,
        y: viewPort.height / 2
      }
    } else {
      payload.targetPosition = {
        x: chainParent.payload.position.x,
        y: chainParent.payload.position.y
      }
    }

    if (title !== undefined) {
      payload.upLabel = title
    } else {
      payload.upLabel = partType
    }

    payload.visible = true
    payload.downLabel = name
    payload.node = node
    payload.parentNode = parentNode
    payload.chainParent = chainParent
    payload.onMenuItemClick = onMenuItemClick

    node.handle = canvas.floatingSpace.strategyParts.createNewStrategyPart(partType, payload)
    node.payload = payload
  }

  function destroyPart (node) {
    canvas.floatingSpace.strategyParts.destroyStrategyPart(node.handle)
  }

  function generateStrategyParts () {
    let lastPhase
    let strategy = thisObject.strategySource
    createPart('Strategy', strategy.name, strategy, undefined, undefined)

    createPart('Strategy Entry Event', '', strategy.entryPoint, strategy, strategy)
    for (let k = 0; k < strategy.entryPoint.situations.length; k++) {
      let situation = strategy.entryPoint.situations[k]
      createPart('Situation', situation.name, situation, strategy.entryPoint, strategy.entryPoint, 'Strategy Entry' + ' ' + 'Situation' + ' #' + (k + 1))

      for (let m = 0; m < situation.conditions.length; m++) {
        let condition = situation.conditions[m]
        createPart('Condition', condition.name, condition, situation, situation, 'Condition' + ' #' + (m + 1))
      }
    }

    createPart('Strategy Exit Event', '', strategy.exitPoint, strategy, strategy)
    for (let k = 0; k < strategy.exitPoint.situations.length; k++) {
      let situation = strategy.exitPoint.situations[k]
      createPart('Situation', situation.name, situation, strategy.exitPoint, strategy.exitPoint, 'Strategy Exit' + ' ' + 'Situation' + ' #' + (k + 1))

      for (let m = 0; m < situation.conditions.length; m++) {
        let condition = situation.conditions[m]
        createPart('Condition', condition.name, condition, situation, situation, 'Condition' + ' #' + (m + 1))
      }
    }

    createPart('Trade Entry Event', '', strategy.sellPoint, strategy, strategy)
    for (let k = 0; k < strategy.sellPoint.situations.length; k++) {
      let situation = strategy.sellPoint.situations[k]
      createPart('Situation', situation.name, situation, strategy.sellPoint, strategy.sellPoint, 'Trade Entry' + ' ' + 'Situation' + ' #' + (k + 1))

      for (let m = 0; m < situation.conditions.length; m++) {
        let condition = situation.conditions[m]
        createPart('Condition', condition.name, condition, situation, situation, 'Condition' + ' #' + (m + 1))
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
      createPart('Phase', phase.name, phase, strategy.stopLoss, chainParent, 'Stop Phase' + ' #' + (p + 1))

      for (let k = 0; k < phase.situations.length; k++) {
        let situation = phase.situations[k]
        createPart('Situation', situation.name, situation, phase, phase, 'Situation' + ' #' + (k + 1))

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          createPart('Condition', condition.name, condition, situation, situation, 'Condition' + ' #' + (m + 1))
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
      createPart('Phase', phase.name, phase, strategy.buyOrder, chainParent, 'Take Profit Phase' + ' #' + (p + 1))

      for (let k = 0; k < phase.situations.length; k++) {
        let situation = phase.situations[k]
        createPart('Situation', situation.name, situation, phase, phase, 'Situation' + ' #' + (k + 1))

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          createPart('Condition', condition.name, condition, situation, situation, 'Condition' + ' #' + (m + 1))
        }
      }
    }
  }

  function destroyStrategyParts () {
    let strategy = thisObject.strategySource
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

  function onMenuItemClick (payload, action) {
    switch (action) {
      case 'Open Settings':

        break
      case 'Delete Strategy':

        break
      case 'Add Situation':

        break
      case 'Add Phase':

        break
      case 'Edit Code':

        break

      case 'Add Condition':
        {
          let situation = payload.node
          let m = situation.conditions.length
          let condition = {
            name: 'New Condition' + ' #' + (m + 1),
            code: ''
          }
          situation.conditions.push(condition)
          createPart('Condition', condition.name, condition, situation, situation, 'Condition' + ' #' + (m + 1))
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
      if (phase.name === node.name) {
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
      if (situation.name === node.name) {
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
      if (condition.name === node.name) {
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
    node.payload.upLabel = undefined
    node.payload.downLabel = undefined
    node.payload.node = undefined
    node.payload.parentNode = undefined
    node.payload.chainParent = undefined
    node.payload.onMenuItemClick = undefined
    node.handle = undefined
    node.payload = undefined
    node.cleaned = true
  }
}
