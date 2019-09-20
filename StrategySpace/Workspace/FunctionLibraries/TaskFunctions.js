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
    if (node.bot === undefined) { return }
    if (node.bot.processes.length === 0) { return }

    for (let i = 0; i < node.bot.processes.length; i++) {
      let process = node.bot.processes[i]
      process.payload.uiObject.run()
    }

    node.payload.uiObject.run(callBackFunction)

    let event = {
      taskId: node.id,
      taskName: node.name,
      definition: JSON.stringify(functionLibraryProtocolNode.getProtocolNode(node, false, true, true)) // <-  We need to do this workaround in order no to send unescaped charactars to the taskManager.
    }
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
