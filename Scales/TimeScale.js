function newTimeScale () {
  const MODULE_NAME = 'Time Scale'
  const INFO_LOG = false
  const INTENSIVE_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    lenghtPercentage: 100
  }

  const RIGHT_MARGIN = 50

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.frame.width = viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.topLeft.x
  thisObject.container.frame.height = 100

  thisObject.container.frame.position.x = viewPort.visibleArea.bottomRight.x
  thisObject.container.frame.position.y = TOP_SPACE_HEIGHT

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = true

  return thisObject

  function initialize () {
    thisObject.container.eventHandler.listenToEvent('Mouse Wheel', onMouseWheel)
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta < 0) {
      thisObject.lenghtPercentage = thisObject.lenghtPercentage - 10
      if (thisObject.lenghtPercentage < 10) { thisObject.lenghtPercentage = 10 }
    } else {
      thisObject.lenghtPercentage = thisObject.lenghtPercentage + 10
      if (thisObject.lenghtPercentage > 100) { thisObject.lenghtPercentage = 100 }
    }
    event.lenghtPercentage = thisObject.lenghtPercentage
    thisObject.container.eventHandler.raiseEvent('Lenght Percentage Changed', event)
  }

  function getContainer (point) {
    let container

       /* First we check if this point is inside this object UI. */

    if (thisObject.container.frame.isThisPointHere(point, undefined, true) === true) {
      return thisObject.container
    } else {
           /* This point does not belong to this space. */

      return undefined
    }
  }

  function draw () {

  }
}
