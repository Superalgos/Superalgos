function newAttachDetach () {
  thisObject = {
    detachNode: detachNode,
    attachNode: attachNode
  }

  return thisObject

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
}
