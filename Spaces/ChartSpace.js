/*

The chart space is where all the charts live. What this space contains is a type of object we call Time Machine. A Time Machine is a cointainer of
charts objects. The idea is simple, all the chart objects are ploted according to the time of the Time Machine object. When the time of the Time Machine
changes, then all charts in it are replotted with the corresponging data.

*/

function newChartSpace () {
  const MODULE_NAME = 'Chart Space'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    visible: true,
    container: undefined,
    timeMachines: [],
    oneScreenUp: oneScreenUp,
    oneScreenDown: oneScreenDown,
    oneScreenLeft: oneScreenLeft,
    oneScreenRight: oneScreenRight,
    fitIntoVisibleArea: fitIntoVisibleArea,
    isThisPointVisible: isThisPointVisible,
    physics: physics,
    drawBackground: drawBackground,
    draw: draw,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isWheelable = false

  let canvasBrowserResizedEventSubscriptionId

  const PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT = 25
  return thisObject

  function finalize () {
    for (let i = 0; i < thisObject.timeMachines.length; i++) {
      let timeMachine = thisObject.timeMachines[i]
      timeMachine.finalize()
    }

    thisObject.container.eventHandler.stopListening(canvasBrowserResizedEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
  }

  function initialize (callBackFunction) {
    let initializedCounter = 0
    let toInitialize = 1

    canvasBrowserResizedEventSubscriptionId = window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)

       /* We create the first of many possible time machines that could live at the Chart Space. */

    let timeMachine = newTimeMachine()

       /* We make the time machine a little bit smaller than the current space. */

    timeMachine.container.frame.position.x = thisObject.container.frame.width / 2 - timeMachine.container.frame.width / 2
    timeMachine.container.frame.position.y = thisObject.container.frame.height / 2 - timeMachine.container.frame.height / 2
    timeMachine.container.fitFunction = fitIntoVisibleArea
    timeMachine.fitFunction = fitIntoVisibleArea
    timeMachine.initialize(onTimeMachineInitialized)

    function onTimeMachineInitialized (err) {
      initializedCounter++

      if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
        callBackFunction(err)
        return
      }

      thisObject.timeMachines.push(timeMachine)

      if (initializedCounter === toInitialize) {
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
      }
    }
  }

  function getContainer (point, purpose) {
    if (thisObject.visible !== true) { return }

    let container

       /* Now we see which is the inner most container that has it */

    for (let i = 0; i < thisObject.timeMachines.length; i++) {
      container = thisObject.timeMachines[i].getContainer(point, purpose)
      if (container !== undefined) {
        if (container.isForThisPurpose(purpose)) {
          if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return container
          }
        }
      }
    }

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function resize () {
    thisObject.container.frame.width = browserCanvas.width
    thisObject.container.frame.height = COCKPIT_SPACE_POSITION
  }

  function oneScreenUp () {
    let displaceVector = {
      x: 0,
      y: +browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
    }

    viewPort.displace(displaceVector)
  }

  function oneScreenDown () {
    let displaceVector = {
      x: 0,
      y: -browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
    }

    viewPort.displace(displaceVector)
  }

  function oneScreenLeft () {
    let displaceVector = {
      x: -browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
      y: 0
    }

    viewPort.displace(displaceVector)
  }

  function oneScreenRight () {
    let displaceVector = {
      x: +browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
      y: 0
    }

    viewPort.displace(displaceVector)
  }

  function fitIntoVisibleArea (point) {
       /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

    let returnPoint = {
      x: point.x,
      y: point.y
    }

    if (point.x > browserCanvas.width) {
      returnPoint.x = browserCanvas.width
    }

    if (point.x < 0) {
      returnPoint.x = 0
    }

    if (point.y > COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT / 2) {
      returnPoint.y = COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT / 2
    }

    if (point.y < 0) {
      returnPoint.y = 0
    }

    return returnPoint
  }

  function isThisPointVisible (point) {
    if (point.x > browserCanvas.width) {
      return false
    }

    if (point.x < 0) {
      return false
    }

    if (point.y > COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT / 2) {
      return false
    }

    if (point.y < 0) {
      return false
    }

    return true
  }

  function physics () {
    thisObjectPhysics()
    childrenPhysics()
  }

  function thisObjectPhysics () {
    thisObject.container.frame.height = COCKPIT_SPACE_POSITION

    if (thisObject.container.frame.height <= 0 / 100) {
      thisObject.visible = false
    } else {
      thisObject.visible = true
    }

    viewPort.resize()
  }

  function childrenPhysics () {
    for (let i = 0; i < thisObject.timeMachines.length; i++) {
      let timeMachine = thisObject.timeMachines[i]
      timeMachine.physics()
    }
  }

  function drawBackground () {
    if (thisObject.visible !== true) { return }

    drawSpaceBackground()

    for (let i = 0; i < thisObject.timeMachines.length; i++) {
      let timeMachine = thisObject.timeMachines[i]
      timeMachine.drawBackground()
    }
  }

  function drawSpaceBackground () {
    let opacity = '1'
    let fromPoint = {
      x: 0,
      y: 0
    }

    let toPoint = {
      x: browserCanvas.width,
      y: COCKPIT_SPACE_POSITION
    }

    browserCanvasContext.beginPath()
    browserCanvasContext.rect(fromPoint.x, fromPoint.y, toPoint.x - fromPoint.x, toPoint.y - fromPoint.y)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')'
    browserCanvasContext.closePath()
    browserCanvasContext.fill()
  }

  function draw () {
    if (thisObject.visible !== true) { return }

    for (let i = 0; i < thisObject.timeMachines.length; i++) {
      let timeMachine = thisObject.timeMachines[i]
      timeMachine.draw()
    }
  }
}
