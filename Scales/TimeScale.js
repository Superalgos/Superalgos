function newTimeScale () {
  let thisObject = {
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    lenghtPercentage: 100
  }

  const RIGHT_MARGIN = 50

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  thisObject.container.frame.width = viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.topLeft.x
  thisObject.container.frame.height = 100

  container.frame.position.x = viewPort.visibleArea.bottomRight.x
  container.frame.position.y = TOP_SPACE_HEIGHT

  container.isDraggeable = false
  container.isClickeable = false
  container.isWheeleable = true

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
      return this.container
    } else {
           /* This point does not belong to this space. */

      return undefined
    }
  }

  function draw () {

  }
}
