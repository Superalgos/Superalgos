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
      if (node === undefined) { return }
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
      if (node === undefined) { return }
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
      if (node === undefined) { return }
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
      if (node === undefined) { return }
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
      if (node === undefined) { return }
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
      if (node === undefined) { return }
      let object = {
        type: node.type,
        subType: node.subType,
        name: node.name
      }
      return object
    }
    case 'Trigger Stage': {
      if (node === undefined) { return }
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
      if (node === undefined) { return }
      let stage = {
        type: node.type,
        subType: node.subType,
        name: node.name,
        initialDefinition: getProtocolNode(node.initialDefinition)
      }
      return stage
    }
    case 'Manage Stage': {
      if (node === undefined) { return }
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
      if (node === undefined) { return }
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
