function newRateScale () {
  const MODULE_NAME = 'Right Scale'

  let thisObject = {
    container: undefined,
    rate: undefined,
    fitFunction: undefined,
    payload: undefined,
    offset: undefined,
    minValue: undefined,
    maxValue: undefined,
    isVisible: true,
    layersOn: undefined,
    onMouseOverSomeTimeMachineContainer: onMouseOverSomeTimeMachineContainer,
    physics: physics,
    draw: draw,
    drawForeground: drawForeground,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  const DEFAULT_OFFSET = 0
  const STEP_OFFSET = 1
  const MIN_OFFSET = -1000
  const MAX_OFFSET = 1000
  const SNAP_THRESHOLD_OFFSET = 3

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = true
  thisObject.container.detectMouseOver = true

  thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
  thisObject.container.frame.height = 40

  thisObject.offset = DEFAULT_OFFSET

  let visible = true
  let isMouseOver

  let onMouseWheelEventSubscriptionId
  let onMouseOverEventSubscriptionId
  let onMouseNotOverEventSubscriptionId
  let onScaleChangedEventSubscriptionId

  let coordinateSystem
  let limitingContainer
  let rateCalculationsContainer

  let mouse = {
    position: {
      x: 0,
      y: 0
    }
  }

  let offsetTimer = 0
  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)
    coordinateSystem.eventHandler.stopListening(onScaleChangedEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
    thisObject.payload = undefined

    coordinateSystem = undefined
    limitingContainer = undefined
    rateCalculationsContainer = undefined
    mouse = undefined
  }

  function initialize (pCoordinateSystem, pLimitingContainer, pRateCalculationsContainer) {
    coordinateSystem = pCoordinateSystem
    limitingContainer = pLimitingContainer
    rateCalculationsContainer = pRateCalculationsContainer

    thisObject.minValue = coordinateSystem.min.y
    thisObject.maxValue = coordinateSystem.max.y

    onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
    onScaleChangedEventSubscriptionId = coordinateSystem.eventHandler.listenToEvent('Scale Changed', onScaleChanged)

    readObjectState()
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

  function onScaleChanged () {
    saveObjectState()
  }

  function onMouseOver (event) {
    isMouseOver = true
    event.containerId = thisObject.container.id
    thisObject.container.eventHandler.raiseEvent('onMouseOverScale', event)
  }

  function onMouseNotOver () {
    isMouseOver = false
    offsetTimer = 0
  }

  function onMouseWheel (event) {
    if (event.shiftKey === true) {
      let morePower = 1
      if (event.buttons === 4) { morePower = 10 } // Mouse wheel pressed.
      let delta = event.wheelDelta
      if (delta < 0) {
        thisObject.offset = thisObject.offset - STEP_OFFSET * morePower
        if (thisObject.offset < MIN_OFFSET) { thisObject.offset = STEP_OFFSET }
      } else {
        thisObject.offset = thisObject.offset + STEP_OFFSET * morePower
        if (thisObject.offset > MAX_OFFSET) { thisObject.offset = MAX_OFFSET }
      }

      if (
        thisObject.offset <= DEFAULT_OFFSET + SNAP_THRESHOLD_OFFSET &&
        thisObject.offset >= DEFAULT_OFFSET - SNAP_THRESHOLD_OFFSET
      ) {
        event.offset = 0
      } else {
        event.offset = -thisObject.offset
      }

      event.isUserAction = true
      thisObject.container.eventHandler.raiseEvent('Rate Scale Offset Changed', event)

      saveObjectState()
      offsetTimer = 100
    } else {
      let factor
      let morePower = 10
      if (event.buttons === 4) { morePower = 1 } // Mouse wheel pressed.

      let delta = event.wheelDelta
      if (delta < 0) {
        factor = -0.01 * morePower
      } else {
        factor = 0.01 * morePower
      }

      coordinateSystem.zoomY(factor, event, limitingContainer)
    }
  }

  function getContainer (point) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    }
  }

  function saveObjectState () {
    try {
      let code = JSON.parse(thisObject.payload.node.code)
      code.scale = undefined
      code.offset = thisObject.offset
      code.minValue = coordinateSystem.min.y
      code.maxValue = coordinateSystem.max.y
      thisObject.payload.node.code = JSON.stringify(code, null, 4)
    } catch (err) {
       // we ignore errors here since most likely they will be parsing errors.
    }
  }

  function readObjectState () {
    try {
      let code = JSON.parse(thisObject.payload.node.code)

      if (isNaN(code.offset) || code.offset === null || code.offset === undefined) {
        // not using this value
      } else {
        if (code.offset < MIN_OFFSET) { code.offset = MIN_OFFSET }
        if (code.offset > MAX_OFFSET) { code.offset = MAX_OFFSET }

        if (code.offset !== thisObject.offset) {
          thisObject.offset = code.offset
          let event = {}
          if (
            thisObject.offset <= DEFAULT_OFFSET + SNAP_THRESHOLD_OFFSET &&
            thisObject.offset >= DEFAULT_OFFSET - SNAP_THRESHOLD_OFFSET
          ) {
            event.offset = 0
          } else {
            event.offset = -thisObject.offset
          }
          thisObject.container.eventHandler.raiseEvent('Rate Scale Offset Changed', event)
        }
      }

      if (
      (isNaN(code.minValue) || code.minValue === null || code.minValue === undefined) ||
      (isNaN(code.maxValue) || code.maxValue === null || code.maxValue === undefined)
        ) {
        // not using this value
      } else {
        if (thisObject.minValue !== code.minValue || thisObject.maxValue !== code.maxValue) {
          thisObject.minValue = code.minValue
          thisObject.maxValue = code.maxValue
          coordinateSystem.min.y = thisObject.minValue
          coordinateSystem.max.y = thisObject.maxValue
          coordinateSystem.recalculateScale()
        }
      }
      saveObjectState() // this overrides any invalid value at the config.
    } catch (err) {
       // we ignore errors here since most likely they will be parsing errors.
    }
  }

  function physics () {
    offsetTimer--
    readObjectState()
    positioningPhysics()
  }

  function positioningPhysics () {
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
          if (thisObject.payload.parentNode.payload.parentNode.rateScale.payload.isVisible === true) {
            displaceFactor++
          }
        }
        for (let i = 0; i < thisObject.payload.parentNode.payload.parentNode.timelineCharts.length; i++) {
          let timelineChart = thisObject.payload.parentNode.payload.parentNode.timelineCharts[i]
          if (timelineChart.rateScale !== undefined) {
            if (thisObject.payload.node.id !== timelineChart.rateScale.id) {
              if (timelineChart.rateScale.payload.isVisible === true) {
                displaceFactor++
              }
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
      y: mouse.position.y + thisObject.offset
    }

    thisObject.rate = getRateFromPointAtBrowserCanvas(ratePoint, rateCalculationsContainer, coordinateSystem)

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

    thisObject.isVisible = true
    thisObject.payload.isVisible = true
    if (thisObject.container.frame.position.y + thisObject.container.frame.height * 2 > bottonCorner.y ||
        thisObject.container.frame.position.y - thisObject.container.frame.height * 1 < upCorner.y ||
        thisObject.container.frame.position.x < upCorner.x
      ) {
      thisObject.isVisible = false
      thisObject.payload.isVisible = false
    }
    if (thisObject.layersOn === 0) {
      thisObject.isVisible = false
      thisObject.payload.isVisible = false
    }
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
    }
  }

  function drawScaleBox () {
    if (thisObject.rate === undefined) { return }

    let rate = thisObject.rate

    if (rate < coordinateSystem.min.y) {
      rate = coordinateSystem.min.y
    }
    if (rate > coordinateSystem.max.y) {
      rate = coordinateSystem.max.y
    }

    let label = (rate - Math.trunc(rate)).toFixed(2)
    let labelArray = label.split('.')
    let label1 = thisObject.payload.node.payload.parentNode.name
    let label2 = (Math.trunc(rate)).toLocaleString()
    let label3 = labelArray[1]

    let icon1 = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.payload.parentNode.type)
    let icon2 = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.type)

    let backgroundColor = UI_COLOR.BLACK

    if (offsetTimer > 0) {
      label2 = thisObject.offset.toFixed(0)
      label3 = 'OFFSET'
    }

    drawScaleDisplay(label1, label2, label3, 0, 0, 0, icon1, icon2, thisObject.container, backgroundColor)
  }
}
