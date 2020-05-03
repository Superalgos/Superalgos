function newSessionFunctions () {
  thisObject = {
    runSession: runSession,
    stopSession: stopSession
  }

  return thisObject

  function runSession (node, functionLibraryProtocolNode, functionLibraryDependenciesFilter, callBackFunction) {
    if (validations(node) !== true) {
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }

    let networkNode = node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode
    let eventsServerClient = canvas.designSpace.workspace.eventsServerClients.get(networkNode.id)

    node.payload.uiObject.run(eventsServerClient, callBackFunction)

    let key = node.name + '-' + node.type + '-' + node.id

    let lightingPath = '' +
    'Trading System->' +
    'Parameters->' +
    'Base Asset->Quoted Asset->Time Range->Time Frame->Slippage->Fee Structure->' +
    'Exchange Account Asset->Asset->' +
    'Strategy->' +
    'Trigger Stage->Trigger On Event->Trigger Off Event->Take Position Event->' +
    'Announcement->Formula->' +
    'Open Stage->Initial Definition->Open Execution->' +
    'Position Size->Position Rate->Formula->' +
    'Initial Stop->Initial Take Profit->' +
    'Manage Stage->' +
    'Stop->Take Profit->' +
    'Phase->Formula->Next Phase Event->Move to Phase Event->Phase->' +
    'Situation->Condition->Javascript Code->' +
    'Close Stage->Close Execution->' +
    'Announcement->Formula->'

    let tradingSystem = functionLibraryProtocolNode.getProtocolNode(node.payload.referenceParent, false, true, true, false, false, lightingPath)

    lightingPath = '' +
    'Backtesting Session->Paper Trading Session->Fordward Testing Session->Live Trading Session->' +
    'Parameters->' +
    'Base Asset->Quoted Asset->Time Range->Time Frame->Slippage->Fee Structure->' +
    'Exchange Account Asset->Asset->' +
    'Social Bots->Telegram Bot->'

    let session = functionLibraryProtocolNode.getProtocolNode(node, false, true, true, false, false, lightingPath)

    let dependencyFilter = functionLibraryDependenciesFilter.createFilter(node.payload.referenceParent)

    /* Raise event to run the session */
    let event = {
      session: JSON.stringify(session),
      tradingSystem: JSON.stringify(tradingSystem),
      dependencyFilter: JSON.stringify(dependencyFilter)
    }

    eventsServerClient.raiseEvent(key, 'Run Session', event)

    if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }
  }

  function stopSession (node, functionLibraryProtocolNode, callBackFunction) {
    if (validations(node) !== true) {
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }

    let networkNode = node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode
    let eventsServerClient = canvas.designSpace.workspace.eventsServerClients.get(networkNode.id)

    let key = node.name + '-' + node.type + '-' + node.id
    eventsServerClient.raiseEvent(key, 'Stop Session')

    node.payload.uiObject.stop(callBackFunction)
  }

  function validations (node) {
    if (node.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs a Process Instance parent to be able to run.')
      return
    }

    if (node.payload.parentNode.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs to be inside a Trading Process Instance.')
      return
    }

    if (node.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs to be inside a Task.')
      return
    }

    if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs to be inside a Task Manager.')
      return
    }

    if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs to be inside Exchange Tasks.')
      return
    }

    if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs to be inside a Testing or Production Environment.')
      return
    }

    if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs to be inside a Network Node.')
      return
    }

    if (node.payload.parentNode.payload.uiObject.isRunning !== true) {
      node.payload.uiObject.setErrorMessage('Session needs a Process Instance parent to be running.')
      return
    }

    if (node.payload.referenceParent === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs to reference a Trading System.')
      return
    }
    return true
  }
}
