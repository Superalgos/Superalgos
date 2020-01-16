
function newTopSpace () {
  let thisObject = {
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  resize()

  container.isDraggeable = false

  return thisObject

  function initialize () {
    window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
  }

  function resize () {
    thisObject.container.frame.width = browserCanvas.width
    thisObject.container.frame.height = TOP_SPACE_HEIGHT

    container.frame.position.x = 0
    try {
      container.frame.position.y = viewPort.visibleArea.bottomLeft.y
    } catch (e) { }
  }

  function getContainer (point) {
    let container
    return

    container = thisObject.currentEvent.getContainer(point)
    if (container !== undefined) { return container }

    container = thisObject.login.getContainer(point)
    if (container !== undefined) { return container }

        /* The point does not belong to any inner container, so we return the current container. */

    return thisObject.container
  }

  function draw () {
    thisObject.container.frame.draw(false, false)

    drawBackground()
    return
  }

  function drawBackground () {
    let opacity = 1

    browserCanvasContext.beginPath()

    browserCanvasContext.rect(0, 0, thisObject.container.frame.width, thisObject.container.frame.height)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')'

    browserCanvasContext.closePath()

    browserCanvasContext.fill()
  }
}
