function newTimeScale () {
  const MODULE_NAME = 'Time Scale'

  let thisObject = {
    lenghtPercentage: undefined,
    container: undefined,
    date: undefined,
    fitFunction: undefined,
    visible: true,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  const LENGHT_PERCENTAGE_DEFAULT_VALUE = 5
  const STEP_SIZE = 2.5

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = true
  thisObject.container.detectMouseOver = true

  thisObject.container.frame.width = 190
  thisObject.container.frame.height = 30

  let isMouseOver

  let onMouseWheelEventSubscriptionId
  let onMouseOverEventSubscriptionId
  let onMouseNotOverEventSubscriptionId

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
  }

  function initialize () {
    onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)

    thisObject.lenghtPercentage = window.localStorage.getItem(MODULE_NAME)
    if (!thisObject.lenghtPercentage) {
      thisObject.lenghtPercentage = LENGHT_PERCENTAGE_DEFAULT_VALUE
    } else {
      thisObject.lenghtPercentage = JSON.parse(thisObject.lenghtPercentage)
    }

    let event = {}
    event.lenghtPercentage = thisObject.lenghtPercentage
    thisObject.container.eventHandler.raiseEvent('Lenght Percentage Changed', event)
  }

  function onMouseOver () {
    thisObject.visible = true
    isMouseOver = true
  }

  function onMouseNotOver () {
    isMouseOver = false
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta < 0) {
      thisObject.lenghtPercentage = thisObject.lenghtPercentage - STEP_SIZE
      if (thisObject.lenghtPercentage < STEP_SIZE) { thisObject.lenghtPercentage = STEP_SIZE }
    } else {
      thisObject.lenghtPercentage = thisObject.lenghtPercentage + STEP_SIZE
      if (thisObject.lenghtPercentage > 400) { thisObject.lenghtPercentage = 400 }
    }

    event.lenghtPercentage = thisObject.lenghtPercentage
    thisObject.container.eventHandler.raiseEvent('Lenght Percentage Changed', event)

    window.localStorage.setItem(MODULE_NAME, thisObject.lenghtPercentage)
  }

  function getContainer (point) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    }
  }

  function physics () {

  }

  function draw () {
    drawTime()
    drawArrows()
  }

  function drawArrows () {
    if (isMouseOver !== true) { return }
    if (thisObject.visible === false || thisObject.date === undefined) { return }

    const X_OFFSET = thisObject.container.frame.width / 2
    const Y_OFFSET = thisObject.container.frame.height / 2 - 10
    const HEIGHT = 18
    const WIDTH = 6
    const LINE_WIDTH = 3
    const OPACITY = 0.2
    const DISTANCE_BETWEEN_ARROWS = 10
    const MIN_DISTANCE_FROM_CENTER = 110
    const CURRENT_VALUE_DISTANCE = MIN_DISTANCE_FROM_CENTER + thisObject.lenghtPercentage
    const MAX_DISTANCE_FROM_CENTER = MIN_DISTANCE_FROM_CENTER + 400 + DISTANCE_BETWEEN_ARROWS

    let ARROW_DIRECTION = 0

    ARROW_DIRECTION = -1
    drawTwoArrows()
    ARROW_DIRECTION = 1
    drawTwoArrows()

    function drawTwoArrows () {
      point1 = {
        x: X_OFFSET - WIDTH / 2 * ARROW_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION,
        y: Y_OFFSET - 0
      }

      point2 = {
        x: X_OFFSET + WIDTH / 2 * ARROW_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION,
        y: Y_OFFSET + HEIGHT / 2
      }

      point3 = {
        x: X_OFFSET - WIDTH / 2 * ARROW_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION,
        y: Y_OFFSET + HEIGHT
      }

      point1 = thisObject.container.frame.frameThisPoint(point1)
      point2 = thisObject.container.frame.frameThisPoint(point2)
      point3 = thisObject.container.frame.frameThisPoint(point3)

      point4 = {
        x: X_OFFSET - WIDTH / 2 * ARROW_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION,
        y: Y_OFFSET - 0
      }

      point5 = {
        x: X_OFFSET + WIDTH / 2 * ARROW_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION,
        y: Y_OFFSET + HEIGHT / 2
      }

      point6 = {
        x: X_OFFSET - WIDTH / 2 * ARROW_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + CURRENT_VALUE_DISTANCE * ARROW_DIRECTION,
        y: Y_OFFSET + HEIGHT
      }

      point4 = thisObject.container.frame.frameThisPoint(point4)
      point5 = thisObject.container.frame.frameThisPoint(point5)
      point6 = thisObject.container.frame.frameThisPoint(point6)

      point7 = {
        x: X_OFFSET + WIDTH / 2 * ARROW_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + MAX_DISTANCE_FROM_CENTER * ARROW_DIRECTION,
        y: Y_OFFSET - 0
      }

      point8 = {
        x: X_OFFSET - WIDTH / 2 * ARROW_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + MAX_DISTANCE_FROM_CENTER * ARROW_DIRECTION,
        y: Y_OFFSET + HEIGHT / 2
      }

      point9 = {
        x: X_OFFSET + WIDTH / 2 * ARROW_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2 * ARROW_DIRECTION + MAX_DISTANCE_FROM_CENTER * ARROW_DIRECTION,
        y: Y_OFFSET + HEIGHT
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

  function drawTime () {
    if (thisObject.visible === false || thisObject.date === undefined) { return }

    let label = thisObject.date.toUTCString()
    let labelArray = label.split(' ')
    let label1 = labelArray[1] + ' ' + labelArray[2] + ' ' + labelArray[3]
    let label2 = labelArray[4]

    drawScaleDisplay(label1, label2, 10, 60, thisObject.container, thisObject.fitFunction)
  }
}
