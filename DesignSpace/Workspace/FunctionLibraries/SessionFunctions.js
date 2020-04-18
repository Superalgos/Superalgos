function newSessionFunctions () {
  thisObject = {
    runSession: runSession,
    stopSession: stopSession
  }

  return thisObject

  function runSession (node, functionLibraryProtocolNode, functionLibraryDependenciesFilter, callBackFunction) {
    /* We can not run a sessionif its parent process is not running. Less if it does not have a parent. */
    if (node.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs a Process Instance parent to be able to run.')
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }

    if (node.payload.parentNode.payload.uiObject.isRunning !== true) {
      node.payload.uiObject.setErrorMessage('Session needs a Process Instance parent to be running to be able to run.')
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }

    if (node.payload.referenceParent === undefined) {
      node.payload.uiObject.setErrorMessage('Session needs to reference a Trading System.')
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }

    node.payload.uiObject.run(callBackFunction)

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
    'Phase->Formula->Next Phase Event->' +
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
    let key = node.name + '-' + node.type + '-' + node.id
    eventsServerClient.raiseEvent(key, 'Stop Session')

    node.payload.uiObject.stop(callBackFunction)
  }
}
