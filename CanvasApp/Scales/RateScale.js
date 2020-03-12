function newRateScale () {
  const MODULE_NAME = 'Right Scale'

  let thisObject = {
    container: undefined,
    rate: undefined,
    fitFunction: undefined,
    payload: undefined,
    minValue: undefined,
    maxValue: undefined,
    isVisible: true,
    layersOn: undefined,
    onUpstreamScaleChanged: onUpstreamScaleChanged,
    onMouseOverSomeTimeMachineContainer: onMouseOverSomeTimeMachineContainer,
    physics: physics,
    draw: draw,
    drawForeground: drawForeground,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = true
  thisObject.container.detectMouseOver = true

  thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
  thisObject.container.frame.height = 40

  let draggeableContainer = newContainer()
  draggeableContainer.initialize(MODULE_NAME + ' Draggeable')
  draggeableContainer.isDraggeable = true

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

  let scaleDisplayTimer = 0
  let autoScaleButton

  let wheelDeltaDirection
  let wheelDeltaCounter = 0

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

    autoScaleButton.finalize()
    autoScaleButton = undefined
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

    autoScaleButton = newAutoScaleButton()
    autoScaleButton.container.connectToParent(thisObject.container)
    autoScaleButton.initialize('Y', coordinateSystem)

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
    scaleDisplayTimer = 0
  }

  function onMouseWheel (event) {
    if (IS_MAC) {
      let sensitivity
      if (event.wheelDelta < 0) {
        if (event.shiftKey === true) {
          sensitivity = 20
        } else {
          sensitivity = 5
        }
        if (wheelDeltaDirection === -1) {
          wheelDeltaCounter++
          if (wheelDeltaCounter < sensitivity) {
            return
          } else {
            wheelDeltaCounter = 0
          }
        } else {
          wheelDeltaCounter = 0
          wheelDeltaDirection = -1
          return
        }
      } else {
        if (wheelDeltaDirection === 1) {
          wheelDeltaCounter++
          if (wheelDeltaCounter < sensitivity) {
            return
          } else {
            wheelDeltaCounter = 0
          }
        } else {
          wheelDeltaCounter = 0
          wheelDeltaDirection = 1
          return
        }
      }
    }

    if (event.shiftKey === true) {
      autoScaleButton.container.eventHandler.raiseEvent('onMouseWheel', event)
      return
    }

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
    scaleDisplayTimer = 100
  }

  function getContainer (point, purpose) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      if (purpose === GET_CONTAINER_PURPOSE.DRAGGING) {
        return draggeableContainer
      }

      return thisObject.container
    }
  }

  function saveObjectState () {
    try {
      let code = JSON.parse(thisObject.payload.node.code)
      code.minValue = coordinateSystem.min.y
      code.maxValue = coordinateSystem.max.y
      code.autoMinScale = coordinateSystem.autoMinYScale
      code.autoMaxScale = coordinateSystem.autoMaxYScale
      thisObject.payload.node.code = JSON.stringify(code, null, 4)
    } catch (err) {
       // we ignore errors here since most likely they will be parsing errors.
    }
  }

  function readObjectState () {
    try {
      let code = JSON.parse(thisObject.payload.node.code)

      if (
      (isNaN(code.minValue) || code.minValue === null || code.minValue === undefined) ||
      (isNaN(code.maxValue) || code.maxValue === null || code.maxValue === undefined)
        ) {
        // not using this value
      } else {
        if (
          thisObject.minValue !== code.minValue ||
          thisObject.maxValue !== code.maxValue ||
          coordinateSystem.autoMinYScale !== code.autoMinScale ||
          coordinateSystem.autoMaxYScale !== code.autoMaxScale
        ) {
          thisObject.minValue = code.minValue
          thisObject.maxValue = code.maxValue
          coordinateSystem.min.y = thisObject.minValue
          coordinateSystem.max.y = thisObject.maxValue

          if (code.autoMinScale !== undefined && (code.autoMinScale === true || code.autoMinScale === false) && code.autoMaxScale !== undefined && (code.autoMaxScale === true || code.autoMaxScale === false)) {
            coordinateSystem.autoMinYScale = code.autoMinScale
            coordinateSystem.autoMaxYScale = code.autoMaxScale
            autoScaleButton.setStatus(code.autoMinScale, code.autoMaxScale)
          }

          coordinateSystem.recalculateScale()
        }
      }
      saveObjectState() // this overrides any invalid value at the config.
    } catch (err) {
       // we ignore errors here since most likely they will be parsing errors.
    }
  }

  function physics () {
    scaleDisplayTimer--
    readObjectState()
    positioningPhysics()
    draggingPhysics()
  }

  function draggingPhysics () {
    if (draggeableContainer.frame.position.y === 0) { return }

    let dragVector = {
      x: draggeableContainer.frame.position.x,
      y: draggeableContainer.frame.position.y
    }

    draggeableContainer.frame.position.x = 0
    draggeableContainer.frame.position.y = 0

    let point = {
      x: 0,
      y: -dragVector.y
    }

    let newMaxRate = getRateFromPointAtContainer(point, limitingContainer, coordinateSystem)
    let yDifferenceMaxMin = coordinateSystem.max.y - coordinateSystem.min.y

    coordinateSystem.min.y = newMaxRate - yDifferenceMaxMin
    coordinateSystem.max.y = newMaxRate
    coordinateSystem.recalculateScale()
  }

  function onUpstreamScaleChanged (event) {
    if (event === undefined) { return }
    if (event.type === 'center dragged') {
      let point = {
        x: event.dragVector.x,
        y: -event.dragVector.y
      }
      let newMinDate = getDateFromPointAtContainer(point, rateCalculationsContainer, coordinateSystem)
      let newMaxRate = getRateFromPointAtContainer(point, rateCalculationsContainer, coordinateSystem)
      let xDifferenceMaxMin = coordinateSystem.max.x - coordinateSystem.min.x
      let yDifferenceMaxMin = coordinateSystem.max.y - coordinateSystem.min.y
      coordinateSystem.min.x = newMinDate.valueOf()
      coordinateSystem.max.x = newMinDate.valueOf() + xDifferenceMaxMin
      coordinateSystem.min.y = newMaxRate - yDifferenceMaxMin
      coordinateSystem.max.y = newMaxRate

      coordinateSystem.recalculateScale()
    }
    if (event.type === 'top dragged') {
      let point = {
        x: event.dragVector.x,
        y: event.dragVector.y
      }
      let newMaxRate = getRateFromPointAtContainer(point, rateCalculationsContainer, coordinateSystem)

      coordinateSystem.max.y = newMaxRate
      coordinateSystem.maxHeight = rateCalculationsContainer.frame.height
      coordinateSystem.recalculateScale()
    }
    if (event.type === 'bottom dragged') {
      let point = {
        x: event.dragVector.x,
        y: event.dragVector.y + rateCalculationsContainer.frame.height
      }
      let newMinRate = getRateFromPointAtContainer(point, rateCalculationsContainer, coordinateSystem)

      coordinateSystem.min.y = newMinRate
      coordinateSystem.maxHeight = rateCalculationsContainer.frame.height
      coordinateSystem.recalculateScale()
    }
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
      y: mouse.position.y
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

    if (canvas.chartingSpace.viewport.zoomTargetLevel < ZOOM_OUT_THRESHOLD_FOR_DISPLAYING_SCALES) {
      thisObject.isVisible = false
    }
  }

  function draw () {
    drawScaleBox()
    autoScaleButton.draw()
    if (visible === false) {
      drawScaleDisplayCover(thisObject.container)
    }
  }

  function drawForeground () {
    if (isMouseOver === true) {
      drawScaleBox()
      autoScaleButton.draw()
    }
  }

  function drawScaleBox () {
    if (thisObject.rate === undefined) { return }
    if (thisObject.payload === undefined) { return }
    if (thisObject.payload.node === undefined) { return }

    let rate = thisObject.rate

    if (rate < coordinateSystem.min.y) {
      rate = coordinateSystem.min.y
    }
    if (rate > coordinateSystem.max.y) {
      rate = coordinateSystem.max.y
    }

    let decimals = 2
    if (rate < 1) { decimals = 4 }
    if (Math.trunc(rate * 100) < 1) { decimals = 6 }
    if (Math.trunc(rate * 10000) < 1) { decimals = 8 }
    if (Math.trunc(rate * 1000000) < 1) { decimals = 10 }
    let label = (rate - Math.trunc(rate)).toFixed(decimals)
    let labelArray = label.split('.')
    let label1 = thisObject.payload.node.payload.parentNode.name
    let label2 = (Math.trunc(rate)).toLocaleString()
    let label3 = labelArray[1]
    if (label3 === undefined) { label3 = '00' }

    if (rate < 1) {
      label2 = label
      label3 = ''
    }

    let icon1 = canvas.designSpace.iconByUiObjectType.get(thisObject.payload.node.payload.parentNode.type)
    let icon2 = canvas.designSpace.iconByUiObjectType.get(thisObject.payload.node.type)

    let backgroundColor = UI_COLOR.BLACK

    if (scaleDisplayTimer > 0) {
      label2 = (coordinateSystem.scale.y * 10000).toFixed(2)
      label3 = 'SCALE'
    }

    drawScaleDisplay(label1, label2, label3, 0, 0, 0, icon1, icon2, thisObject.container, backgroundColor)
  }
}
