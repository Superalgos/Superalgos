function newSessionFunctions () {
  thisObject = {
    runSession: runSession,
    stopSession: stopSession
  }

  return thisObject

  function runSession (node, functionLibraryProtocolNode, callBackFunction) {
    node.payload.uiObject.run(callBackFunction)

    let event = {
      session: JSON.stringify(functionLibraryProtocolNode.getProtocolNode(node, false, false, true)),
      definition: getDefinition()
    }

    let key = 'Session' + '-' + node.id + '-' + 'Events'
    systemEventHandler.raiseEvent(key, 'Run Session', event)

    function getDefinition () {
      let definitionNode = canvas.strategySpace.workspace.getProtocolDefinitionNode()
      definitionNode.simulationParams = getSimulationParams()
      return JSON.stringify(definitionNode)
    }
  }

  function stopSession (node, functionLibraryProtocolNode, callBackFunction) {
    let key = 'Session' + '-' + node.id + '-' + 'Events'
    systemEventHandler.raiseEvent(key, 'Stop Session')

    node.payload.uiObject.stop(callBackFunction)
  }
}
