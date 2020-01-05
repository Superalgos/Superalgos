function newTaskFunctions () {
  thisObject = {
    runTask: runTask,
    stopTask: stopTask,
    runAllTasks: runAllTasks,
    stopAllTasks: stopAllTasks
  }

  return thisObject

  function runTask (node, functionLibraryProtocolNode, callBackFunction) {
    /* Check if it is possible to Run or not */
    if (node.bot === undefined) {
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }
    if (node.bot.processes.length === 0) {
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }

    for (let i = 0; i < node.bot.processes.length; i++) {
      let process = node.bot.processes[i]
      process.payload.uiObject.run()
    }

    let lightingPath = '->Task->' +
    'Sensor Bot Instance->' +
    'Indicator Bot Instance->' +
    'Trading Bot Instance->' +
    'Process Instance->' +
    'Market Instance->Market->Exchange Markets->Crypto Exchange->' +
    'Backtesting Session->Live Trading Session->Paper Trading Session->Fordward Testing Session->' +
    'Process Definition->' +
    'Process Output->Output Dataset->Dataset Definition->Product Definition->' +
    'Process Dependencies->' +
    'Status Dependency->Status Report->Process Definition->' +
    'Data Dependency->Dataset Definition->Product Definition->' +
    'Record Definition->Record Property->Formula->' +
    'Data Building Procedure->' +
    'Procedure Initialization->Javascript Code->' +
    'Procedure Loop->Javascript Code->' +
    'Calculations Procedure->' +
    'Procedure Initialization->Javascript Code->' +
    'Procedure Loop->Javascript Code->' +
    'Status Report->' +
    'Execution Finished Event->' +
    'Execution Started Event->Execution Finished Event->Process Definition->' +
    'Sensor Bot->' +
    'Indicator Bot->' +
    'Trading Bot->' +
    'Data Mine->'

    let definition = functionLibraryProtocolNode.getProtocolNode(node, false, true, true, false, false, lightingPath)

    let event = {
      taskId: node.id,
      taskName: node.name,
      definition: JSON.stringify(definition) // <-  We need to do this workaround in order no to send unescaped charactars to the taskManager.
    }

    if (node.payload.parentNode === undefined) {
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      systemEventHandler.raiseEvent('Task Server', 'Debug Task Started', event)
      return
    }

    node.payload.uiObject.run(callBackFunction)
    systemEventHandler.raiseEvent('Task Manager', 'Run Task', event)
  }

  function stopTask (node, functionLibraryProtocolNode, callBackFunction) {
    let event = {
      taskId: node.id,
      taskName: node.name
    }
    systemEventHandler.raiseEvent('Task Manager', 'Stop Task', event)

    node.payload.uiObject.stop(callBackFunction)

    if (node.bot === undefined) { return }
    if (node.bot.processes.length === 0) { return }

    for (let i = 0; i < node.bot.processes.length; i++) {
      let process = node.bot.processes[i]
      process.payload.uiObject.stop()
    }
  }

  function runAllTasks (taskManager, functionLibraryProtocolNode) {
    for (let i = 0; i < taskManager.tasks.length; i++) {
      let node = taskManager.tasks[i]
      let menu = node.payload.uiObject.menu

      menu.internalClick('Run Task')
    }
  }

  function stopAllTasks (taskManager, functionLibraryProtocolNode) {
    for (let i = 0; i < taskManager.tasks.length; i++) {
      let node = taskManager.tasks[i]
      let menu = node.payload.uiObject.menu

      menu.internalClick('Stop Task')
    }
  }
}
