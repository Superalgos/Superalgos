 ﻿/*

The chart space is where all the charts live. What this space contains is a type of object we call Time Machine. A Time Machine is a cointainer of
charts objects. The idea is simple, all the chart objects are ploted according to the time of the Time Machine object. When the time of the Time Machine
changes, then all charts in it are replotted with the corresponging data.

*/

function newChartSpace () {
  const MODULE_NAME = 'Chart Space'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  var thisObject = {
    container: undefined,
    drawBackground: drawBackground,
    draw: draw,
    timeMachines: [],
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
/*
  thisObject.container.frame.width = TIME_MACHINE_WIDTH
  thisObject.container.frame.height = TIME_MACHINE_HEIGHT * canvas.bottomSpace.chartAspectRatio.aspectRatio.y

  thisObject.container.frame.position.x = browserCanvas.width / 2 - thisObject.container.frame.width / 2
  thisObject.container.frame.position.y = browserCanvas.height / 2 - thisObject.container.frame.height / 2
*/
  thisObject.container.isDraggeable = false

  return thisObject

  function finalize () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }

      for (let i = 0; i < thisObject.timeMachines.length; i++) {
        let timeMachine = thisObject.timeMachines[i]
        timeMachine.finalize()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize (callBackFunction) {
    if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }

    let initializedCounter = 0
    let toInitialize = 1

        /* We create the first of many possible time machines that could live at the Chart Space. */

    var timeMachine = newTimeMachine()

    // timeMachine.container.connectToParent(thisObject.container, true, true)

        /* We make the time machine a little bit smaller than the current space. */

    timeMachine.container.frame.position.x = this.container.frame.width / 2 - timeMachine.container.frame.width / 2
    timeMachine.container.frame.position.y = this.container.frame.height / 2 - timeMachine.container.frame.height / 2

    timeMachine.initialize(onTimeMachineInitialized)

    function onTimeMachineInitialized (err) {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> onTimeMachineInitialized -> Entering function.') }

      initializedCounter++

      if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
        if (INFO_LOG === true) { logger.write('[INFO] initialize -> onTimeMachineInitialized -> Initialization of a Time Machine failed.') }

        callBackFunction(err)
        return
      }

      thisObject.timeMachines.push(timeMachine)

      if (initializedCounter === toInitialize) {
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
      }
    }
  }

  function drawBackground () {
    for (var i = 0; i < thisObject.timeMachines.length; i++) {
      var timeMachine = thisObject.timeMachines[i]
      timeMachine.drawBackground()
    }
  }

  function draw () {
    // thisObject.container.frame.draw(false, false)

    for (var i = 0; i < thisObject.timeMachines.length; i++) {
      var timeMachine = thisObject.timeMachines[i]
      timeMachine.draw()
    }
  }

  function getContainer (point) {
    if (INFO_LOG === true) { logger.write('[INFO] getContainer -> Entering function.') }

    let container

        /* Now we see which is the inner most container that has it */

    for (var i = 0; i < this.timeMachines.length; i++) {
      container = this.timeMachines[i].getContainer(point)

      if (container !== undefined) {
                /* We found an inner container which has the point. We return it. */

        return container
      }
    }

        /* The point does not belong to any inner container, so we return the current container. */

    return this.container
  }
}
