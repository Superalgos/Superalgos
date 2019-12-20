function newRateScale () {
  const MODULE_NAME = 'Right Scale'

  let thisObject = {
    container: undefined,
    rate: undefined,
    fitFunction: undefined,
    visible: true,
    heightPercentage: 150,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  const HEIGHT_PERCENTAGE_DEFAULT_VALUE = 50
  const STEP_SIZE = 2
  const MIN_WIDTH = 50

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = true
  thisObject.container.detectMouseOver = true

  thisObject.container.frame.width = 110
  thisObject.container.frame.height = 25

  let isMouseOver
  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
  }

  function initialize () {
    thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)

    thisObject.heightPercentage = window.localStorage.getItem(MODULE_NAME)
    if (!thisObject.heightPercentage) {
      thisObject.heightPercentage = HEIGHT_PERCENTAGE_DEFAULT_VALUE
    } else {
      thisObject.heightPercentage = JSON.parse(thisObject.heightPercentage)
    }

    let event = {}
    event.heightPercentage = thisObject.heightPercentage
    thisObject.container.eventHandler.raiseEvent('Height Percentage Changed', event)
  }

  function onMouseOver () {
    isMouseOver = true
  }

  function onMouseNotOver () {
    isMouseOver = false
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta < 0) {
      thisObject.heightPercentage = thisObject.heightPercentage - STEP_SIZE
      if (thisObject.heightPercentage < STEP_SIZE) { thisObject.heightPercentage = STEP_SIZE }
    } else {
      thisObject.heightPercentage = thisObject.heightPercentage + STEP_SIZE
      if (thisObject.heightPercentage > 150) { thisObject.heightPercentage = 200 }
    }
    event.heightPercentage = thisObject.heightPercentage
    thisObject.container.eventHandler.raiseEvent('Height Percentage Changed', event)

    window.localStorage.setItem(MODULE_NAME, thisObject.heightPercentage)
  }

  function getContainer (point) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    }
  }

  function physics () {

  }

  function draw () {
    drawRate()
    drawArrows()
  }

  function drawArrows () {
    if (isMouseOver !== true) { return }
    if (thisObject.visible === false || thisObject.rate === undefined) { return }

    const X_OFFSET = thisObject.container.frame.width / 2
    const Y_OFFSET = thisObject.container.frame.height / 2
    const HEIGHT = 6
    const WIDTH = 18
    const LINE_WIDTH = 3
    const OPACITY = 0.2
    const DISTANCE_BETWEEN_ARROWS = 10
    const MIN_DISTANCE_FROM_CENTER = 30
    const CURRENT_VALUE_DISTANCE = MIN_DISTANCE_FROM_CENTER + thisObject.heightPercentage
    const MAX_DISTANCE_FROM_CENTER = MIN_DISTANCE_FROM_CENTER + 215 + DISTANCE_BETWEEN_ARROWS

    let ARROW_DIRECTION = 0

    ARROW_DIRECTION = -1
    drawTwoArrows()
    ARROW_DIRECTION = 1
    drawTwoArrows()

    function drawTwoArrows () {
      point1 = {
        x: X_OFFSET - WIDTH / 2,
        y: Y_OFFSET + DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION
      }

      point2 = {
        x: X_OFFSET,
        y: Y_OFFSET + HEIGHT * ARROW_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION
      }

      point3 = {
        x: X_OFFSET + WIDTH / 2,
        y: Y_OFFSET + DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION
      }

      point1 = thisObject.container.frame.frameThisPoint(point1)
      point2 = thisObject.container.frame.frameThisPoint(point2)
      point3 = thisObject.container.frame.frameThisPoint(point3)

      point4 = {
        x: X_OFFSET - WIDTH / 2,
        y: Y_OFFSET - DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION
      }

      point5 = {
        x: X_OFFSET,
        y: Y_OFFSET + HEIGHT * ARROW_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION
      }

      point6 = {
        x: X_OFFSET + WIDTH / 2,
        y: Y_OFFSET - DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION
      }

      point4 = thisObject.container.frame.frameThisPoint(point4)
      point5 = thisObject.container.frame.frameThisPoint(point5)
      point6 = thisObject.container.frame.frameThisPoint(point6)

      point7 = {
        x: X_OFFSET - WIDTH / 2,
        y: Y_OFFSET - DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + MAX_DISTANCE_FROM_CENTER * ARROW_DIRECTION
      }

      point8 = {
        x: X_OFFSET,
        y: Y_OFFSET - HEIGHT * ARROW_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + MAX_DISTANCE_FROM_CENTER * ARROW_DIRECTION
      }

      point9 = {
        x: X_OFFSET + WIDTH / 2,
        y: Y_OFFSET - DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + MAX_DISTANCE_FROM_CENTER * ARROW_DIRECTION
      }

      point7 = thisObject.container.frame.frameThisPoint(point7)
      point8 = thisObject.container.frame.frameThisPoint(point8)
      point9 = thisObject.container.frame.frameThisPoint(point9)

      browserCanvasContext.setLineDash([0, 0])

      browserCanvasContext.beginPath()

      browserCanvasContext.moveTo(point1.x, point1.y)
      browserCanvasContext.lineTo(point2.x, point2.y)
      browserCanvasContext.lineTo(point3.x, point3.y)

      browserCanvasContext.moveTo(point4.x, point4.y)
      browserCanvasContext.lineTo(point5.x, point5.y)
      browserCanvasContext.lineTo(point6.x, point6.y)

      browserCanvasContext.moveTo(point7.x, point7.y)
      browserCanvasContext.lineTo(point8.x, point8.y)
      browserCanvasContext.lineTo(point9.x, point9.y)

      browserCanvasContext.lineWidth = LINE_WIDTH
      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', ' + OPACITY + ')'
      browserCanvasContext.stroke()
    }
  }

  function drawRate () {
    if (thisObject.visible === false || thisObject.rate === undefined) { return }

    let label = (thisObject.rate - Math.trunc(thisObject.rate)).toFixed(2)
    let labelArray = label.split('.')
    let label1 = (Math.trunc(thisObject.rate)).toLocaleString()
    let label2 = labelArray[1]

    drawScaleDisplay(label1, label2, 10, 40, thisObject.container, thisObject.fitFunction)
  }
}

