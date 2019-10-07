function newLayerFunctions () {
  thisObject = {
    turnLayerOn: turnLayerOn,
    turnLayerOff: turnLayerOff,
    turnAllLayersOn: turnAllLayersOn,
    turnAllLayersOff: turnAllLayersOff
  }

  return thisObject

  function turnLayerOn (node, functionLibraryProtocolNode, callBackFunction) {
    /* Check if it is possible to turn on or not */
    let code
    try {
      code = JSON.parse(node.code)
    } catch (err) {
      {
        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        return
      }
    }

    /* Ok, we are going to turn the layer on */
  }

  function turnLayerOff (node, functionLibraryProtocolNode, callBackFunction) {
    let event = {
      taskId: node.id,
      taskName: node.name
    }
    systemEventHandler.raiseEvent('Layer Manager', 'Turn Layer Off', event)

    node.payload.uiObject.stop(callBackFunction)

    if (node.bot === undefined) { return }
    if (node.bot.processes.length === 0) { return }

    for (let i = 0; i < node.bot.processes.length; i++) {
      let process = node.bot.processes[i]
      process.payload.uiObject.stop()
    }
  }

  function turnAllLayersOn (taskManager, functionLibraryProtocolNode) {
    for (let i = 0; i < taskManager.tasks.length; i++) {
      let node = taskManager.tasks[i]
      let menu = node.payload.uiObject.menu

      menu.internalClick('Turn Layer On')
    }
  }

  function turnAllLayersOff (taskManager, functionLibraryProtocolNode) {
    for (let i = 0; i < taskManager.tasks.length; i++) {
      let node = taskManager.tasks[i]
      let menu = node.payload.uiObject.menu

      menu.internalClick('Turn Layer Off')
    }
  }
}
