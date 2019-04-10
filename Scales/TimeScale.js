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
  thisObject.container.frame.height = 50

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
      if (thisObject.lenghtPercentage < 50) { thisObject.lenghtPercentage = 50 }
    } else {
      thisObject.lenghtPercentage = thisObject.lenghtPercentage + 10
      if (thisObject.lenghtPercentage > 100) { thisObject.lenghtPercentage = 100 }
    }
    thisObject.container.eventHandler.raiseEvent('Lenght Percentage Changed', thisObject.lenghtPercentage)
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
    thisObject.container.frame.draw(false, true)
  }
}
