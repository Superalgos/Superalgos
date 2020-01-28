function newSessionFunctions () {
  thisObject = {
    runSession: runSession,
    stopSession: stopSession
  }

  return thisObject

  function runSession (node, functionLibraryProtocolNode, callBackFunction) {
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
      node.payload.uiObject.setErrorMessage('Parent Process Instance need to reference a Process Definition.')
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }

    node.payload.uiObject.run(callBackFunction)

    let key = node.name + '-' + node.type + '-' + node.id

    let lightingPath = '' +
    'Trading System->' +
    'Parameters->' +
    'Base Asset->Time Range->Time Frame->Slippage->Fee Structure->' +
    'Strategy->' +
    'Trigger Stage->Trigger On Event->Trigger Off Event->Take Position Event->' +
    'Announcement->Telegram Bot->' +
    'Open Stage->Initial Definition->Open Execution->' +
    'Position Size->Position Rate->Formula->' +
    'Initial Stop->Initial Take Profit->' +
    'Manage Stage->' +
    'Stop->Take Profit->' +
    'Phase->Formula->Next Phase Event->' +
    'Situation->Condition->Javascript Code->' +
    'Announcement->Telegram Bot->'

    let tradingSystem = functionLibraryProtocolNode.getProtocolNode(node.payload.referenceParent, false, true, true, false, false, lightingPath)

    lightingPath = '' +
    'Backtesting Session->Paper Trading Session->Fordward Testing Session->Live Trading Session->' +
    'Parameters->' +
    'Base Asset->Time Range->Time Frame->Slippage->Fee Structure->'

    let session = functionLibraryProtocolNode.getProtocolNode(node, false, true, true, false, false, lightingPath)

    /* Raise event to run the session */
    let event = {
      session: JSON.stringify(session),
      tradingSystem: JSON.stringify(tradingSystem),
      uiCurrentValues: getUICurrentValues()
    }

    systemEventHandler.raiseEvent(key, 'Run Session', event)

    function getUICurrentValues () {
      let dateAtScreenCorner = new Date(window.localStorage.getItem('Date @ Screen Corner'))
      let currentTimeFrame = JSON.parse(window.localStorage.getItem('Current Time Frame'))

      let timeFramesMasterArray = [marketFilesPeriods, dailyFilePeriods]
      let timeFrameArray = timeFramesMasterArray[currentTimeFrame.filePeriodIndex]
      let timeFrame = timeFrameArray[currentTimeFrame.timeFrameIndex][1]

      let uiCurrentValues = {
        initialDatetime: dateAtScreenCorner,
        timeFrame: timeFrame,
        timestamp: (new Date()).valueOf()
      }

      return uiCurrentValues
    }
  }

  function stopSession (node, functionLibraryProtocolNode, callBackFunction) {
    let key = node.name + '-' + node.type + '-' + node.id
    systemEventHandler.raiseEvent(key, 'Stop Session')

    node.payload.uiObject.stop(callBackFunction)
  }
}
