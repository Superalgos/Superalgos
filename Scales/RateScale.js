function newRateScale () {
  const MODULE_NAME = 'Right Scale'

  let thisObject = {
    container: undefined,
    rate: undefined,
    fitFunction: undefined,
    payload: undefined,
    value: undefined,
    onMouseOverSomeTimeMachineContainer: onMouseOverSomeTimeMachineContainer,
    physics: physics,
    draw: draw,
    drawForeground: drawForeground,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  const DEFAULT_VALUE = 25
  const STEP_SIZE = 1
  const MIN_WIDTH = 50
  const MAX_VALUE = 100

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = true
  thisObject.container.detectMouseOver = true

  thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
  thisObject.container.frame.height = 40

  let visible = true
  let isMouseOver

  let onMouseWheelEventSubscriptionId
  let onMouseOverEventSubscriptionId
  let onMouseNotOverEventSubscriptionId

  let timeLineCoordinateSystem
  let limitingContainer

  let mouse = {
    position: {
      x: 0,
      y: 0
    }
  }
  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
    thisObject.payload = undefined

    timeLineCoordinateSystem = undefined
    limitingContainer = undefined
    mouse = undefined
  }

  function initialize (pTimeLineCoordinateSystem, pLimitingContainer) {
    timeLineCoordinateSystem = pTimeLineCoordinateSystem
    limitingContainer = pLimitingContainer

    onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)

    thisObject.value = DEFAULT_VALUE
    readObjectState()

    let event = {}
    event.value = thisObject.value
    thisObject.container.eventHandler.raiseEvent('Height Percentage Changed', event)
  }

  function onMouseOverSomeTimeMachineContainer (event) {
    if (event.containerId === undefined) {
      /* This happens when the mouse over was not at the instance of a certain scale, but anywhere else. */
      visible = true
    } else {
      if (event.containerId === thisObject.container.id) {
        visible = true
      } else {
        visible = false
        turnOnCounter = 0
      }
    }
    mouse = {
      position: {
        x: event.x,
        y: event.y
      }
    }
  }

  function onMouseOver (event) {
    isMouseOver = true
    event.containerId = thisObject.container.id
    thisObject.container.eventHandler.raiseEvent('onMouseOverScale', event)
  }

  function onMouseNotOver () {
    isMouseOver = false
  }

  function onMouseWheel (event) {
    let morePower = 1
    if (event.buttons === 4) { morePower = 5 } // Mouse wheel pressed.

    delta = event.wheelDelta
    if (delta < 0) {
      thisObject.value = thisObject.value - STEP_SIZE * morePower
      if (thisObject.value < STEP_SIZE * 3) { thisObject.value = STEP_SIZE }
    } else {
      thisObject.value = thisObject.value + STEP_SIZE * morePower
      if (thisObject.value > MAX_VALUE) { thisObject.value = MAX_VALUE }
    }
    event.value = thisObject.value
    event.isUserAction = true
    thisObject.container.eventHandler.raiseEvent('Height Percentage Changed', event)

    saveObjectState()
  }

  function getContainer (point) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    }
  }

  function saveObjectState () {
    try {
      let code = JSON.parse(thisObject.payload.node.code)
      code.value = thisObject.value / MAX_VALUE * 100
      code.value = code.value.toFixed(2)
      thisObject.payload.node.code = JSON.stringify(code)
    } catch (err) {
       // we ignore errors here since most likely they will be parsing errors.
    }
  }

  function readObjectState () {
    return
    try {
      let code = JSON.parse(thisObject.payload.node.code)

      if (isNaN(code.value) || code.value === null || code.value === undefined) {
        saveObjectState()
        return
      }
      code.value = code.value / 100 * MAX_VALUE
      if (code.value < STEP_SIZE) { code.value = STEP_SIZE }
      if (code.value > MAX_VALUE) { code.value = MAX_VALUE }

      if (code.value !== thisObject.value) {
        thisObject.value = code.value
        let event = {}
        event.value = thisObject.value
        thisObject.container.eventHandler.raiseEvent('Height Percentage Changed', event)
      } else {
        saveObjectState()
      }
    } catch (err) {
       // we ignore errors here since most likely they will be parsing errors.
    }
  }

  function physics () {
    readObjectState()
    positioningphysics()
  }

  function positioningphysics () {
    /* Container Limits */

    let upCorner = {
      x: 0,
      y: 0
    }

    let bottonCorner = {
      x: limitingContainer.frame.width,
      y: limitingContainer.frame.height
    }

    upCorner = transformThisPoint(upCorner, limitingContainer)
    bottonCorner = transformThisPoint(bottonCorner, limitingContainer)

    upCorner = limitingContainer.fitFunction(upCorner, true)
    bottonCorner = limitingContainer.fitFunction(bottonCorner, true)

    /* We will check if we need to change the bottom because of being one of many scales of the same type */
    let displaceFactor = 0
    if (thisObject.payload.parentNode === undefined) { return } // This happens when in the process of deleting the scale, timeline chart or time machine.
    if (thisObject.payload.parentNode.type === 'Timeline Chart') {
      if (thisObject.payload.parentNode.payload.parentNode !== undefined) {
        if (thisObject.payload.parentNode.payload.parentNode.rateScale !== undefined) {
          displaceFactor++
        }
        for (let i = 0; i < thisObject.payload.parentNode.payload.parentNode.timelineCharts.length; i++) {
          let timelineChart = thisObject.payload.parentNode.payload.parentNode.timelineCharts[i]
          if (timelineChart.rateScale !== undefined) {
            if (thisObject.payload.node.id !== timelineChart.rateScale.id) {
              displaceFactor++
            } else {
              break
            }
          }
        }
      }
    }
    bottonCorner.x = bottonCorner.x - thisObject.container.frame.width * displaceFactor

    /* Mouse Position Rate Calculation */
    let ratePoint = {
      x: 0,
      y: mouse.position.y
    }

    let mouseRate = getRateFromPoint(ratePoint, limitingContainer, timeLineCoordinateSystem)

    thisObject.rate = mouseRate

    /* rateScale Positioning */
    ratePoint = {
      x: limitingContainer.frame.width,
      y: 0
    }

    ratePoint = transformThisPoint(ratePoint, limitingContainer.frame.container)
    ratePoint.y = mouse.position.y - thisObject.container.frame.height / 2 + thisObject.container.frame.height

    /* Checking against the container limits. */
    if (ratePoint.x < upCorner.x) { ratePoint.x = upCorner.x }
    if (ratePoint.x + thisObject.container.frame.width > bottonCorner.x) { ratePoint.x = bottonCorner.x }
    if (ratePoint.y < upCorner.y + thisObject.container.frame.height) { ratePoint.y = upCorner.y + thisObject.container.frame.height }
    if (ratePoint.y > bottonCorner.y) { ratePoint.y = bottonCorner.y }

    thisObject.container.frame.position.y = ratePoint.y - thisObject.container.frame.height
    thisObject.container.frame.position.x = ratePoint.x - thisObject.container.frame.width
  }

  function draw () {
    drawScaleBox()
    if (visible === false) {
      drawScaleDisplayCover(thisObject.container)
    }
  }

  function drawForeground () {
    if (isMouseOver === true) {
      drawScaleBox()
      drawArrows()
    }
  }

  function drawScaleBox () {
    if (thisObject.rate === undefined) { return }

    let label = (thisObject.rate - Math.trunc(thisObject.rate)).toFixed(2)
    let labelArray = label.split('.')
    let label1 = thisObject.payload.node.payload.parentNode.name
    let label2 = (Math.trunc(thisObject.rate)).toLocaleString()
    let label3 = labelArray[1]

    let icon1 = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.payload.parentNode.type)
    let icon2 = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.type)

    let backgroundColor = UI_COLOR.BLACK

    drawScaleDisplay(label1, label2, label3, 0, 0, 0, icon1, icon2, thisObject.container, backgroundColor)
  }

  function drawArrows () {
    if (visible === false || thisObject.rate === undefined) { return }

    const X_OFFSET = thisObject.container.frame.width / 2
    const Y_OFFSET = thisObject.container.frame.height / 2
    const HEIGHT = 6
    const WIDTH = 18
    const LINE_WIDTH = 3
    const OPACITY = 0.2
    const DISTANCE_BETWEEN_ARROWS = 10
    const MIN_DISTANCE_FROM_CENTER = 30
    const CURRENT_VALUE_DISTANCE = MIN_DISTANCE_FROM_CENTER + thisObject.value
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
}
