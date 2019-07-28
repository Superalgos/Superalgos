
function newTopSpace () {
  let thisObject = {
    container: undefined,
    draw: draw,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    endUser: undefined,
    currentEvent: undefined,
    login: undefined,
    initialize: initialize
  }

  var container = newContainer()
  container.initialize()
  thisObject.container = container

  resize()

  container.isDraggeable = false

  return thisObject

  async function initialize () {
    let sharedStatus = {
      currentDevTeamIndex: 0,
      currentEventIndex: 0,
      currentUserBotIndex: 0,
      currentProcessIndex: 0,
      currentBotType: '',
      eventHandler: newEventHandler()
    }

    thisObject.login = newLogin()
    await thisObject.login.initialize(sharedStatus)

    window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
  }

  function resize () {
    thisObject.container.frame.width = browserCanvas.width
    thisObject.container.frame.height = TOP_SPACE_HEIGHT

    container.frame.position.x = 0
    try {
      container.frame.position.y = viewPort.visibleArea.bottomLeft.y
    } catch(e) { }
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

    thisObject.endUser.draw()
    thisObject.currentEvent.draw()
    thisObject.login.draw()
  }

  function drawBackground () {
    let opacity = 1

    browserCanvasContext.beginPath()

    browserCanvasContext.rect(0, 0, thisObject.container.frame.width, thisObject.container.frame.height)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')'

    browserCanvasContext.closePath()

    browserCanvasContext.fill()
  }
}
