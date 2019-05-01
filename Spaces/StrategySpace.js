
function newStrategySpace () {
  let thisObject = {
    container: undefined,
    draw: draw,
    strategyCollection: undefined,
    getContainer: getContainer,
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  resize()

  container.isDraggeable = false

  return thisObject

  async function initialize () {
    thisObject.strategyCollection = newStrategyCollection()
    await thisObject.strategyCollection.initialize()

    window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
  }

  function resize () {
    thisObject.container.frame.width = viewPort.visibleArea.topRight.x - viewPort.visibleArea.topLeft.x
    thisObject.container.frame.height = viewPort.visibleArea.topLeft.y - viewPort.visibleArea.bottomLeft.y

    container.frame.position.x = viewPort.visibleArea.topLeft.x
    container.frame.position.y = viewPort.visibleArea.topLeft.y
  }

  function getContainer (point) {
    let container

    container = thisObject.strategyCollection.getContainer(point)
    if (container !== undefined) { return container }

        /* The point does not belong to any inner container, so we return the current container. */

    return thisObject.container
  }

  function draw () {
    drawBackground()
  }

  function drawBackground () {

  }
}
