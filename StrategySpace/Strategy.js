
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

  function createPart (partType, name, node, parentNode, title) {
    let payload = {
      position: {
        x: (viewPort.width - SIDE_PANEL_WIDTH) / 2 + SIDE_PANEL_WIDTH,
        y: viewPort.height / 2
      },
      visible: true
    }

    if (title !== undefined) {
      payload.upLabel = title
    } else {
      payload.upLabel = partType
    }

    payload.downLabel = name
    payload.node = node
    payload.parentNode = parentNode
    payload.onMenuItemClick = onMenuItemClick

    node.handle = canvas.floatingSpace.strategyParts.createNewStrategyPart(partType, payload)
  }

  function destroyPart (node) {
    canvas.floatingSpace.strategyParts.destroyStrategyPart(node.handle)
  }

  function generateStrategyParts () {
    let lastPhase
    let strategy = thisObject.strategySource
    createPart('Strategy', strategy.name, strategy, undefined)

    createPart('Strategy Entry', '', strategy.entryPoint, strategy)
    for (let k = 0; k < strategy.entryPoint.situations.length; k++) {
      let situation = strategy.entryPoint.situations[k]
      createPart('Situation', situation.name, situation, strategy.entryPoint, 'Strategy Entry' + ' ' + 'Situation' + ' #' + (k + 1))

      for (let m = 0; m < situation.conditions.length; m++) {
        let condition = situation.conditions[m]
        createPart('Condition', condition.name, condition, situation, 'Condition' + ' #' + (m + 1))
      }
    }

    createPart('Strategy Exit', '', strategy.exitPoint, strategy)
    for (let k = 0; k < strategy.exitPoint.situations.length; k++) {
      let situation = strategy.exitPoint.situations[k]
      createPart('Situation', situation.name, situation, strategy.exitPoint, 'Strategy Exit' + ' ' + 'Situation' + ' #' + (k + 1))

      for (let m = 0; m < situation.conditions.length; m++) {
        let condition = situation.conditions[m]
        createPart('Condition', condition.name, condition, situation, 'Condition' + ' #' + (m + 1))
      }
    }

    createPart('Trade Entry', '', strategy.sellPoint, strategy)
    for (let k = 0; k < strategy.sellPoint.situations.length; k++) {
      let situation = strategy.sellPoint.situations[k]
      createPart('Situation', situation.name, situation, strategy.sellPoint, 'Trade Entry' + ' ' + 'Situation' + ' #' + (k + 1))

      for (let m = 0; m < situation.conditions.length; m++) {
        let condition = situation.conditions[m]
        createPart('Condition', condition.name, condition, situation, 'Condition' + ' #' + (m + 1))
      }
    }

    createPart('Stop', '', strategy.stopLoss, strategy)
    for (let p = 0; p < strategy.stopLoss.phases.length; p++) {
      let phase = strategy.stopLoss.phases[p]

      let parent
      if (p === 0) {
        parent = strategy.stopLoss
      } else {
        parent = lastPhase
      }
      lastPhase = phase
      createPart('Phase', phase.name, phase, parent, 'Stop Phase' + ' #' + (p + 1))

      for (let k = 0; k < phase.situations.length; k++) {
        let situation = phase.situations[k]
        createPart('Situation', situation.name, situation, phase, 'Situation' + ' #' + (k + 1))

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          createPart('Condition', condition.name, condition, situation, 'Condition' + ' #' + (m + 1))
        }
      }
    }

    createPart('Take Profit', '', strategy.buyOrder, strategy)
    for (let p = 0; p < strategy.buyOrder.phases.length; p++) {
      let phase = strategy.buyOrder.phases[p]
      let parent
      if (p === 0) {
        parent = strategy.buyOrder
      } else {
        parent = lastPhase
      }
      lastPhase = phase
      createPart('Phase', phase.name, phase, parent, 'Take Profit Phase' + ' #' + (p + 1))

      for (let k = 0; k < phase.situations.length; k++) {
        let situation = phase.situations[k]
        createPart('Situation', situation.name, situation, phase, 'Situation' + ' #' + (k + 1))

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]
          createPart('Condition', condition.name, condition, situation, 'Condition' + ' #' + (m + 1))
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
    console.log('onMenuItemClick ' + action)

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
      case 'Delete Phase':

        break
      case 'Delete Situation':
        for (let i = 0; i < payload.parentNode.situations.length; i++) {
          let situation = payload.parentNode.situations[i]
          if (situation.name === payload.node.name) {
            payload.parentNode.situations.splice(i)
            return
          }
        }
        break
      case 'Delete Condition':

        break
      default:

    }
  }
}
