function newTaskFunctions () {
  thisObject = {
    runTask: runTask,
    stopTask: stopTask,
    runAllTasks: runAllTasks,
    stopAllTasks: stopAllTasks,
    runAllTaskManagers: runAllTaskManagers,
    stopAllTaskManagers: stopAllTaskManagers,
    runAllExchangeTasks: runAllExchangeTasks,
    stopAllExchangeTasks: stopAllExchangeTasks
  }

  return thisObject

  function runTask (node, functionLibraryProtocolNode, callBackFunction) {
    if (validations(node) !== true) {
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }

    let networkNode = node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode
    let eventsServerClient = canvas.designSpace.workspace.eventsServerClients.get(networkNode.id)

    for (let i = 0; i < node.bot.processes.length; i++) {
      let process = node.bot.processes[i]
      process.payload.uiObject.run(eventsServerClient)
    }

    let lightingPath = '->Task->' +
    'Sensor Bot Instance->' +
    'Indicator Bot Instance->' +
    'Trading Bot Instance->' +
    'Sensor Process Instance->Indicator Process Instance->Trading Process Instance->' +
    'Market Reference->' +
    'Key Instance->Exchange Account Key->' +
    'Market->Exchange Markets->Crypto Exchange->' +
    'Market Base Asset->Market Quoted Asset->Asset->' +
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
      eventsServerClient.raiseEvent('Task Server', 'Debug Task Started', event)
      return
    }

    node.payload.uiObject.run(eventsServerClient, callBackFunction)
    eventsServerClient.raiseEvent('Task Manager', 'Run Task', event)
  }

  function stopTask (node, functionLibraryProtocolNode, callBackFunction) {
    if (validations(node) !== true) {
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      return
    }

    let networkNode = node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode
    let eventsServerClient = canvas.designSpace.workspace.eventsServerClients.get(networkNode.id)

    let event = {
      taskId: node.id,
      taskName: node.name
    }

    node.payload.uiObject.stop(callBackFunction)
    eventsServerClient.raiseEvent('Task Manager', 'Stop Task', event)

    if (node.bot === undefined) { return }
    if (node.bot.processes.length === 0) { return }

    for (let i = 0; i < node.bot.processes.length; i++) {
      let process = node.bot.processes[i]
      process.payload.uiObject.stop()
    }
  }

  function validations (node) {
    if (node.bot === undefined) {
      node.payload.uiObject.setErrorMessage('Task needs to have a Bot Instance.')
      return
    }
    if (node.bot.processes.length === 0) {
      node.payload.uiObject.setErrorMessage('Task Bot Instance needs to have al least once Process Instance.')
      return
    }

    if (node.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Task needs to be inside a Task Manager.')
      return
    }

    if (node.payload.parentNode.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Task needs to be inside Exchange Tasks.')
      return
    }

    if (node.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Task needs to be inside a Testing or Production Environment or a Data Mining node.')
      return
    }

    if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
      node.payload.uiObject.setErrorMessage('Task needs to be inside a Network Node.')
      return
    }
    return true
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

  function runAllTaskManagers (parent, functionLibraryProtocolNode) {
    for (let i = 0; i < parent.taskManagers.length; i++) {
      let node = parent.taskManagers[i]
      let menu = node.payload.uiObject.menu

      menu.internalClick('Run All Tasks')
      menu.internalClick('Run All Tasks')
    }
  }

  function stopAllTaskManagers (parent, functionLibraryProtocolNode) {
    for (let i = 0; i < parent.taskManagers.length; i++) {
      let node = parent.taskManagers[i]
      let menu = node.payload.uiObject.menu

      menu.internalClick('Stop All Tasks')
      menu.internalClick('Stop All Tasks')
    }
  }
  function runAllExchangeTasks (parent, functionLibraryProtocolNode) {
    for (let i = 0; i < parent.exchangeTasks.length; i++) {
      let node = parent.exchangeTasks[i]
      let menu = node.payload.uiObject.menu

      menu.internalClick('Run All Task Managers')
      menu.internalClick('Run All Task Managers')
    }
  }

  function stopAllExchangeTasks (parent, functionLibraryProtocolNode) {
    for (let i = 0; i < parent.exchangeTasks.length; i++) {
      let node = parent.exchangeTasks[i]
      let menu = node.payload.uiObject.menu

      menu.internalClick('Stop All Task Managers')
      menu.internalClick('Stop All Task Managers')
    }
  }
}
