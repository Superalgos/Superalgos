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

    let lightingPath = '->Definition->' +
    'Trading System->' +
    'Parameters->' +
    'Base Asset->Time Range->Time Period->Slippage->Fee Structure->Exchange Account Key->' +
    'Strategy->' +
    'Trigger Stage->Trigger On Event->Trigger Off Event->Take Position Event->' +
    'Announcement->Telegram Bot->' +
    'Open Stage->Initial Definition->Open Execution->' +
    'Position Size->Position Rate->Formula->' +
    'Manage Stage->' +
    'Stop->Take Profit->' +
    'Phase->Formula->Next Phase Event->' +
    'Situation->Condition->Javascript Code->' +
    'Announcement->Telegram Bot->'

    let definition = functionLibraryProtocolNode.getProtocolNode(node.payload.referenceParent, false, true, true, false, false, lightingPath)

    /* Raise event to run the session */
    let event = {
      session: JSON.stringify(functionLibraryProtocolNode.getProtocolNode(node, false, true, true)),
      definition: JSON.stringify(definition),
      uiCurrentValues: getUICurrentValues()
    }

    systemEventHandler.raiseEvent(key, 'Run Session', event)

    function getUICurrentValues () {
      let dateAtScreenCorner = new Date(window.localStorage.getItem('Date @ Screen Corner'))
      let currentTimePeriod = JSON.parse(window.localStorage.getItem('Current Time Period'))

      let timePeriodsMasterArray = [marketFilesPeriods, dailyFilePeriods]
      let timePeriodArray = timePeriodsMasterArray[currentTimePeriod.filePeriodIndex]
      let timePeriod = timePeriodArray[currentTimePeriod.timePeriodIndex][1]

      let uiCurrentValues = {
        initialDatetime: dateAtScreenCorner,
        timePeriod: timePeriod,
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
