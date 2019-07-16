function newPartsFromNodes () {
  thisObject = {
    createPartFromNode: createPartFromNode,
    newStrategy: newStrategy,
    addParameters: addParameters,
    addMissingParameters: addMissingParameters,
    addMissingStages: addMissingStages,
    addMissingEvents: addMissingEvents,
    addMissingItems: addMissingItems,
    addInitialDefinition: addInitialDefinition,
    addPhase: addPhase,
    addFormula: addFormula,
    addNextPhaseEvent: addNextPhaseEvent,
    addSituation: addSituation,
    addCondition: addCondition,
    addCode: addCode
  }

  return thisObject

  function createPartFromNode (node, parentNode, chainParent) {
    switch (node.type) {
      case 'Code':
        {
          createPart('Code', node.name, node, parentNode, chainParent, 'Code')
          return
        }
      case 'Condition':
        {
          createPart('Condition', node.name, node, parentNode, chainParent, 'Condition')
          if (node.code !== undefined) {
            createPartFromNode(node.code, node, node)
          }
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
      case 'Formula':
        {
          createPart('Formula', node.name, node, parentNode, chainParent, 'Formula')
          return
        }
      case 'Next Phase Event':
        {
          createPart('Next Phase Event', node.name, node, parentNode, chainParent, 'Next Phase Event')
          for (let m = 0; m < node.situations.length; m++) {
            let situation = node.situations[m]
            createPartFromNode(situation, node, node)
          }
          return
        }
      case 'Phase': {
        let phase = node
        createPart('Phase', phase.name, phase, parentNode, chainParent, phase.subType)

        if (node.formula !== undefined) {
          createPartFromNode(node.formula, phase, phase)
        }
        if (node.nextPhaseEvent !== undefined) {
          createPartFromNode(node.nextPhaseEvent, phase, phase)
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

        if (node.stopLoss !== undefined) {
          createPartFromNode(node.stopLoss, node, node)
        }
        if (node.takeProfit !== undefined) {
          createPartFromNode(node.takeProfit, node, node)
        }
        if (node.positionSize !== undefined) {
          createPartFromNode(node.positionSize, node, node)
        }
        if (node.positionRate !== undefined) {
          createPartFromNode(node.positionRate, node, node)
        }
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
      case 'Position Size': {
        createPart('Position Size', node.name, node, parentNode, chainParent, 'Position Size')
        if (node.formula !== undefined) {
          createPartFromNode(node.formula, node, node)
        }
        return
      }
      case 'Position Rate': {
        createPart('Position Rate', node.name, node, parentNode, chainParent, 'Position Rate')
        if (node.formula !== undefined) {
          createPartFromNode(node.formula, node, node)
        }
        return
      }
      case 'Trigger Stage': {
        let stage = node
        createPart('Trigger Stage', stage.name, stage, parentNode, chainParent, 'Trigger Stage')

        if (node.triggerOn !== undefined) {
          createPartFromNode(node.triggerOn, stage, stage)
        }
        if (node.triggerOff !== undefined) {
          createPartFromNode(node.triggerOff, stage, stage)
        }
        if (node.takePosition !== undefined) {
          createPartFromNode(node.takePosition, stage, stage)
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
        if (node.takeProfit !== undefined) {
          createPartFromNode(node.takeProfit, stage, stage)
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
      case 'Base Asset': {
        createPart('Base Asset', node.name, node, parentNode, chainParent, 'Base Asset')
        if (node.formula !== undefined) {
          createPartFromNode(node.formula, node, node)
        }
        return
      }
      case 'Parameters': {
        createPart('Parameters', node.name, node, parentNode, chainParent, 'Parameters')
        if (node.baseAsset !== undefined) {
          createPartFromNode(node.baseAsset, node, node)
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
        if (node.parameters !== undefined) {
          createPartFromNode(node.parameters, node, node)
        }
        return
      }
      case 'Workspace': {
        let workspace = node
        createPart('Workspace', workspace.name, workspace, parentNode, chainParent, 'Workspace')
        return
      }
    }
  }

  function newStrategy (parentNode) {
    let strategyParent = parentNode
    let strategy = {
      name: 'New Strategy',
      active: true,
      triggerStage: {
        triggerOn: {
          situations: []
        },
        triggerOff: {
          situations: []
        },
        takePosition: {
          situations: []
        },
        positionSize: {
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
      },
      openStage: {
        initialDefinition: {
          stopLoss: {
            phases: [],
            maxPhases: 1
          },
          takeProfit: {
            phases: [],
            maxPhases: 1
          }
        }
      },
      manageStage: {
        stopLoss: {
          phases: []
        },
        takeProfit: {
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
    createPart('Trigger On Event', '', strategy.triggerStage.triggerOn, strategy.triggerStage, strategy.triggerStage)
    createPart('Trigger Off Event', '', strategy.triggerStage.triggerOff, strategy.triggerStage, strategy.triggerStage)
    createPart('Take Position Event', '', strategy.triggerStage.takePosition, strategy.triggerStage, strategy.triggerStage)
    createPart('Initial Definition', '', strategy.openStage.initialDefinition, strategy.openStage, strategy.openStage)
    createPart('Position Size', '', strategy.openStage.initialDefinition.positionSize, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createPart('Position Rate', '', strategy.openStage.initialDefinition.positionRate, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createPart('Stop', '', strategy.manageStage.stopLoss, strategy.manageStage, strategy.manageStage)
    createPart('Take Profit', '', strategy.manageStage.takeProfit, strategy.manageStage, strategy.manageStage)
    createPart('Stop', 'Initial Stop', strategy.openStage.initialDefinition.stopLoss, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createPart('Take Profit', 'Initial Take Profit', strategy.openStage.initialDefinition.takeProfit, strategy.openStage.initialDefinition, strategy.openStage.initialDefinition)
    createPart('Formula', '', strategy.triggerStage.positionSize.formula, strategy.triggerStage.positionSize, strategy.triggerStage.positionSize)
  }

  function addParameters (node) {
    if (node.parameters === undefined) {
      node.parameters = {
        name: 'Parameters'
      }
      createPart('Parameters', '', node.parameters, node, node)
      addMissingParameters(node.parameters)
    }
  }

  function addMissingParameters (node) {
    if (node.baseAsset === undefined) {
      node.baseAsset = {
        name: 'Base Asset',
        formula: {
          code: DEFAULT_FORMULA_TEXT
        }
      }
      createPart('Base Asset', '', node.baseAsset, node, node)
      createPart('Formula', '', node.baseAsset.formula, node.baseAsset, node.baseAsset)
    }
  }

  function addMissingStages (node) {
    if (node.triggerStage === undefined) {
      node.triggerStage = {
        triggerOn: {
          situations: []
        },
        triggerOff: {
          situations: []
        },
        takePosition: {
          situations: []
        },
        positionSize: {
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
      }
      createPart('Trigger Stage', '', node.triggerStage, node, node, 'Trigger Stage')
      createPart('Trigger On Event', '', node.triggerStage.triggerOn, node.triggerStage, node.triggerStage)
      createPart('Trigger Off Event', '', node.triggerStage.triggerOff, node.triggerStage, node.triggerStage)
      createPart('Take Position Event', '', node.triggerStage.takePosition, node.triggerStage, node.triggerStage)
      createPart('Formula', '', node.triggerStage.positionSize.formula, node.triggerStage.positionSize, node.triggerStage.positionSize)
    }
    if (node.openStage === undefined) {
      node.openStage = {
        initialDefinition: {
          stopLoss: {
            phases: [],
            maxPhases: 1
          },
          takeProfit: {
            phases: [],
            maxPhases: 1
          }
        }
      }
      createPart('Open Stage', '', node.openStage, node, node, 'Open Stage')
      createPart('Initial Definition', '', node.openStage.initialDefinition, node.openStage, node.openStage)
      createPart('Stop', 'Initial Stop', node.openStage.initialDefinition.stopLoss, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createPart('Take Profit', 'Initial Take Profit', node.openStage.initialDefinition.takeProfit, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createPart('Position Size', 'Position Size', node.openStage.initialDefinition.positionSize, node.openStage.initialDefinition, node.openStage.initialDefinition)
      createPart('Position Rate', 'Position Rate', node.openStage.initialDefinition.positionRate, node.openStage.initialDefinition, node.openStage.initialDefinition)
    }
    if (node.manageStage === undefined) {
      node.manageStage = {
        stopLoss: {
          phases: []
        },
        takeProfit: {
          phases: []
        }
      }
      createPart('Manage Stage', '', node.manageStage, node, node, 'Manage Stage')
      createPart('Stop', '', node.manageStage.stopLoss, node.manageStage, node.manageStage)
      createPart('Take Profit', '', node.manageStage.takeProfit, node.manageStage, node.manageStage)
    }
    if (node.closeStage === undefined) {
      node.closeStage = {
      }
      createPart('Close Stage', '', node.closeStage, node, node, 'Close Stage')
    }
  }

  function addMissingEvents (node) {
    if (node.triggerOn === undefined) {
      node.triggerOn = {
        situations: []
      }
      createPart('Trigger On Event', '', node.triggerOn, node, node)
    }
    if (node.triggerOff === undefined) {
      node.triggerOff = {
        situations: []
      }
      createPart('Trigger Off Event', '', node.triggerOff, node, node)
    }
    if (node.takePosition === undefined) {
      node.takePosition = {
        situations: []
      }
      createPart('Take Position Event', '', node.takePosition, node, node)
    }
  }

  function addMissingItems (node) {
    if (node.type === 'Initial Definition') {
      if (node.stopLoss === undefined) {
        node.stopLoss = {
          phases: [],
          maxPhases: 1
        }
        createPart('Stop', 'Initial Stop', node.stopLoss, node, node)
      }
      if (node.takeProfit === undefined) {
        node.takeProfit = {
          phases: [],
          maxPhases: 1
        }
        createPart('Take Profit', 'Initial Take Profit', node.takeProfit, node, node)
      }
      if (node.positionSize === undefined) {
        node.positionSize = {
          name: 'Position Size',
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
        createPart('Position Size', '', node.positionSize, node, node)
        createPart('Formula', '', node.positionSize.formula, node.positionSize, node.positionSize)
      }
      if (node.positionRate === undefined) {
        node.positionRate = {
          name: 'Position Rate',
          formula: {
            code: DEFAULT_FORMULA_TEXT
          }
        }
        createPart('Position Rate', '', node.positionRate, node, node)
        createPart('Formula', '', node.positionRate.formula, node.positionRate, node.positionRate)
      }
    } else {
      if (node.stopLoss === undefined) {
        node.stopLoss = {
          phases: []
        }
        createPart('Stop', '', node.stopLoss, node, node)
      }
      if (node.takeProfit === undefined) {
        node.takeProfit = {
          phases: []
        }
        createPart('Take Profit', '', node.takeProfit, node, node)
      }
    }
  }

  function addInitialDefinition (node) {
    if (node.initialDefinition === undefined) {
      node.initialDefinition = {
        stopLoss: {
          phases: [],
          maxPhases: 1
        },
        takeProfit: {
          phases: [],
          maxPhases: 1
        }
      }
      createPart('Initial Definition', '', node.initialDefinition, node, node)
      createPart('Stop', 'Initial Stop', node.initialDefinition.stopLoss, node.initialDefinition, node.initialDefinition)
      createPart('Take Profit', 'Initial Take Profit', node.initialDefinition.takeProfit, node.initialDefinition, node.initialDefinition)
      createPart('Position Size', '', node.initialDefinition.positionSize, node.initialDefinition, node.initialDefinition)
      createPart('Formula', '', node.initialDefinition.positionSize.formula, node.initialDefinition.positionSize, node.initialDefinition.positionSize)
      createPart('Position Rate', '', node.initialDefinition.positionRate, node.initialDefinition, node.initialDefinition)
      createPart('Formula', '', node.initialDefinition.positionRate.formula, node.initialDefinition.positionRate, node.initialDefinition.positionRate)
    }
  }

  function addFormula (node) {
    if (node.formula === undefined) {
      node.formula = {
        code: DEFAULT_FORMULA_TEXT
      }
      createPart('Formula', '', node.formula, node, node)
    }
  }

  function addNextPhaseEvent (node) {
    if (node.nextPhaseEvent === undefined) {
      node.nextPhaseEvent = {
        situations: []
      }
      createPart('Next Phase Event', '', node.nextPhaseEvent, node, node)
    }
  }

  function addCode (node) {
    if (node.code === undefined) {
      node.code = {
        code: DEFAULT_CODE_TEXT
      }
      createPart('Code', '', node.code, node, node)
    }
  }

  function addPhase (parentNode) {
    if (parentNode.maxPhases !== undefined) {
      if (parentNode.phases.length >= parentNode.maxPhases) {
        return
      }
    }
    let phaseParent = parentNode
    let m = phaseParent.phases.length

    if (phaseParent.payload.parentNode !== undefined) {
      if (phaseParent.payload.parentNode.type === 'Initial Definition' && m > 0) { return }
    }

    let phase = {
      name: 'New Phase',
      formula: {
        code: DEFAULT_FORMULA_TEXT
      },
      nextPhaseEvent: {
        situations: []
      }
    }
    phaseParent.phases.push(phase)
    let phaseChainParent
    if (m > 0) {
      phaseChainParent = phaseParent.phases[m - 1]
    } else {
      phaseChainParent = phaseParent
    }
    createPart('Phase', phase.name, phase, phaseParent, phaseChainParent, 'Phase')
    createPart('Formula', '', phase.formula, phase, phase, 'Formula')
    createPart('Next Phase Event', '', phase.nextPhaseEvent, phase, phase)
  }

  function addSituation (parentNode) {
    let m = parentNode.situations.length
    let situation = {
      name: 'New Situation',
      conditions: []
    }
    parentNode.situations.push(situation)
    createPart('Situation', situation.name, situation, parentNode, parentNode, 'Situation')
  }

  function addCondition (parentNode) {
    let situation = parentNode
    let m = situation.conditions.length
    let condition = {
      name: 'New Condition',
      code: {
        code: DEFAULT_CODE_TEXT
      }
    }
    situation.conditions.push(condition)
    createPart('Condition', condition.name, condition, situation, situation, 'Condition')
    createPart('Code', '', condition.code, condition, condition, 'Code')
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

      if (payload.targetPosition.x === null) { payload.targetPosition.x = spawnPosition.x }
      if (payload.targetPosition.y === null) { payload.targetPosition.y = spawnPosition.y }
    } else {
      if (chainParent === undefined) {
        payload.targetPosition = {
          x: spawnPosition.x,
          y: spawnPosition.y
        }
        if (partType === 'Workspace' || partType === 'Trading System') {
          payload.position = {
            x: spawnPosition.x,
            y: spawnPosition.y
          }
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
    payload.onMenuItemClick = canvas.strategySpace.workspace.onMenuItemClick

    if (node.id === undefined) {
      node.id = newUniqueId()
    }
    node.payload = payload
    node.type = partType
    canvas.floatingSpace.strategyPartConstructor.createStrategyPart(payload)
  }
}

