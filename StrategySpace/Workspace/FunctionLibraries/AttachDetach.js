function newAttachDetach () {
  thisObject = {
    detachNode: detachNode,
    attachNode: attachNode
  }

  return thisObject

  function detachNode (node, rootNodes) {
    switch (node.type) {
      case 'Trading System': {
        return
      }
      case 'Parameters': {
        node.payload.parentNode.parameters = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Base Asset': {
        node.payload.parentNode.baseAsset = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Strategy': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.strategies.length; i++) {
          let strategy = payload.parentNode.strategies[i]
          if (strategy.id === node.id) {
            payload.parentNode.strategies.splice(i, 1)
          }
          completeDetachment(node, rootNodes)
        }
      }
        break
      case 'Trigger Stage': {
        node.payload.parentNode.triggerStage = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Open Stage': {
        node.payload.parentNode.openStage = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Manage Stage': {
        node.payload.parentNode.manageStage = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Close Stage': {
        node.payload.parentNode.closeStage = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Position Size': {
        node.payload.parentNode.positionSize = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Position Rate': {
        node.payload.parentNode.positionRate = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Trigger On Event': {
        node.payload.parentNode.triggerOn = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Trigger Off Event': {
        node.payload.parentNode.triggerOff = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Take Position Event': {
        node.payload.parentNode.takePosition = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Initial Definition': {
        node.payload.parentNode.initialDefinition = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Open Execution': {
        node.payload.parentNode.openExecution = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Close Execution': {
        node.payload.parentNode.closeExecution = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Stop': {
        node.payload.parentNode.stopLoss = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Take Profit': {
        node.payload.parentNode.takeProfit = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Formula': {
        node.payload.parentNode.formula = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Next Phase Event': {
        node.payload.parentNode.nextPhaseEvent = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Code': {
        node.payload.parentNode.code = undefined
        completeDetachment(node, rootNodes)
        return
      }
      case 'Condition': {
        let payload = node.payload
        for (let i = 0; i < payload.parentNode.conditions.length; i++) {
          let condition = payload.parentNode.conditions[i]
          if (condition.id === node.id) {
            payload.parentNode.conditions.splice(i, 1)
          }
        }
        completeDetachment(node, rootNodes)
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
        completeDetachment(node, rootNodes)
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
            completeDetachment(node, rootNodes)
            return
          }
        }
      }
    }
  }

  function attachNode (node, attachToNode, rootNodes) {
    switch (node.type) {
      case 'Parameters': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.parameters = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Base Asset': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.baseAsset = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Strategy': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.strategies.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Trigger Stage': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.triggerStage = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Open Stage': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.openStage = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Manage Stage': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.manageStage = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Close Stage': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.closeStage = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Position Size': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.positionSize = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Position Rate': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.positionRate = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Initial Definition': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.initialDefinition = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Open Execution': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.openExecution = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Close Execution': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.closeExecution = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Trigger On Event': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.triggerOn = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Trigger Off Event': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.triggerOff = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Take Position Event': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.takePosition = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Stop': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.stopLoss = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Take Profit': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.takeProfit = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Formula': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.formula = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Next Phase Event': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.nextPhaseEvent = node
        completeAttachment(node, rootNodes)
      }
        break
      case 'Phase': {
        switch (attachToNode.type) {
          case 'Stop': {
            if (attachToNode.maxPhases !== undefined) {
              if (attachToNode.phases.length >= attachToNode.maxPhases) {
                return
              }
            }
            node.payload.parentNode = attachToNode
            if (attachToNode.phases.length > 0) {
              let phase = attachToNode.phases[attachToNode.phases.length - 1]
              node.payload.chainParent = phase
            } else {
              node.payload.chainParent = attachToNode
            }
            attachToNode.phases.push(node)
            completeAttachment(node, rootNodes)
          }
            break
          case 'Take Profit': {
            if (attachToNode.maxPhases !== undefined) {
              if (attachToNode.phases.length >= attachToNode.maxPhases) {
                return
              }
            }
            node.payload.parentNode = attachToNode
            if (attachToNode.phases.length > 0) {
              let phase = attachToNode.phases[attachToNode.phases.length - 1]
              node.payload.chainParent = phase
            } else {
              node.payload.chainParent = attachToNode
            }
            attachToNode.phases.push(node)
            completeAttachment(node, rootNodes)
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
                  completeAttachment(node, rootNodes)
                } else {
                  node.payload.chainParent = attachToNode
                  let nextPhase = node.payload.parentNode.phases[i + 1]
                  nextPhase.payload.chainParent = node
                  node.payload.parentNode.phases.splice(i + 1, 0, node)
                  completeAttachment(node, rootNodes)
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
        completeAttachment(node, rootNodes)
      }
        break
      case 'Condition': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.conditions.push(node)
        completeAttachment(node, rootNodes)
      }
        break
      case 'Code': {
        node.payload.parentNode = attachToNode
        node.payload.chainParent = attachToNode
        node.payload.parentNode.code = node
        completeAttachment(node, rootNodes)
      }
        break
    }
  }

  function completeDetachment (node, rootNodes) {
    node.payload.parentNode = undefined
    node.payload.chainParent = undefined
    rootNodes.push(node)
  }

  function completeAttachment (node, rootNodes) {
    for (let i = 0; i < rootNodes.length; i++) {
      let rootNode = rootNodes[i]
      if (rootNode.id === node.id) {
        rootNodes.splice(i, 1)
        return
      }
    }
  }
}
