
function newRestartSimulation () {
  const MODULE_NAME = 'Restart Simulation'

  let thisObject = {
    visible: true,
    container: undefined,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isWheelable = false
  thisObject.container.isClickeable = true

  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.container = undefined
  }

  function initialize () {
    thisObject.container.frame.position.x = thisObject.container.parentContainer.frame.width * 80 / 100
    thisObject.container.frame.position.y = 6
    thisObject.container.frame.width = 100
    thisObject.container.frame.height = COCKPIT_SPACE_HEIGHT - 12
  }

  function getContainer (point, purpose) {
    if (thisObject.visible !== true) { return }

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function physics () {

  }

  function draw () {
    if (thisObject.visible !== true) { return }

    drawRestartSimulation()
  }

  function drawRestartSimulation () {
    let fontSize
    let label
    let xOffset
    let yOffset

    const OPACITY = 1

      /* We put the params.VALUE in the middle */

    fontSize = 15

    browserCanvasContext.font = 'bold  ' + fontSize + 'px ' + UI_FONT.PRIMARY

    label = 'RESTART SIMULATION'

    xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO
    yOffset = -45

    labelPoint = {
      x: 0 - xOffset + (thisObject.paramsArray[1].LEFT_OFFSET - thisObject.paramsArray[0].LEFT_OFFSET) / 2 + thisObject.paramsArray[0].LEFT_OFFSET - 20,
      y: COCKPIT_SPACE_POSITION - COCKPIT_SPACE_HEIGHT / 2 - yOffset
    }

    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
    browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
  }
}
