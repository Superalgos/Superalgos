function newTimeFrameScale () {
  const MODULE_NAME = 'Time Frame Scale'

  let thisObject = {
    timeFrame: undefined,
    container: undefined,
    fitFunction: undefined,
    payload: undefined,
    onMouseOverSomeTimeMachineContainer: onMouseOverSomeTimeMachineContainer,
    draw: draw,
    drawForeground: drawForeground,
    physics: physics,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  const FILES_PERIOD_DEFAULT_VALUE = 0
  const TIME_PERIOD_DEFAULT_VALUE = 0
  const MIN_HEIGHT = 50

  let visible = true
  let isMouseOver

  let filePeriodIndex = FILES_PERIOD_DEFAULT_VALUE
  let timeFrameIndex = TIME_PERIOD_DEFAULT_VALUE
  let timeFramesMasterArray = [marketFilesPeriods, dailyFilePeriods]
  let timeFrameLabel = '24-hs'

  let onMouseWheelEventSubscriptionId
  let onViewportZoomChangedEventSubscriptionId
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
  setupContainer()
  return thisObject

  function setupContainer () {
    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    thisObject.container.isDraggeable = false
    thisObject.container.isClickeable = false
    thisObject.container.isWheelable = true
    thisObject.container.detectMouseOver = true

    thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
    thisObject.container.frame.height = 40
  }

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
    canvas.chartSpace.viewport.eventHandler.stopListening(onViewportZoomChangedEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
    thisObject.payload = undefined
  }

  function initialize (pTimeLineCoordinateSystem, pLimitingContainer) {
    timeLineCoordinateSystem = pTimeLineCoordinateSystem
    limitingContainer = pLimitingContainer

    readObjectState()
    newTimeFrame()

    onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    onViewportZoomChangedEventSubscriptionId = canvas.chartSpace.viewport.eventHandler.listenToEvent('Zoom Changed', onViewportZoomChanged)
    onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
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
        if (thisObject.payload.parentNode.payload.parentNode.timeFrameScale !== undefined) {
          displaceFactor++
        }
        for (let i = 0; i < thisObject.payload.parentNode.payload.parentNode.timelineCharts.length; i++) {
          let timelineChart = thisObject.payload.parentNode.payload.parentNode.timelineCharts[i]
          if (timelineChart.timeFrameScale !== undefined) {
            if (thisObject.payload.node.id !== timelineChart.timeFrameScale.id) {
              displaceFactor++
            } else {
              break
            }
          }
        }
      }
    }
    bottonCorner.y = bottonCorner.y - thisObject.container.frame.height * displaceFactor

    /* Positioning */
    timePoint = {
      x: 0,
      y: limitingContainer.frame.height
    }

    timePoint = transformThisPoint(timePoint, limitingContainer.frame.container)
    timePoint.x = mouse.position.x - thisObject.container.frame.width / 2

    /* Checking against the container limits. */
    if (timePoint.x < upCorner.x) { timePoint.x = upCorner.x }
    if (timePoint.x + thisObject.container.frame.width > bottonCorner.x) { timePoint.x = bottonCorner.x - thisObject.container.frame.width }
    if (timePoint.y < upCorner.y + thisObject.container.frame.height) { timePoint.y = upCorner.y + thisObject.container.frame.height }
    if (timePoint.y > bottonCorner.y) { timePoint.y = bottonCorner.y }

    thisObject.container.frame.position.x = timePoint.x
    thisObject.container.frame.position.y = timePoint.y - thisObject.container.frame.height
  }

  function onViewportZoomChanged (event) {
    if (event !== undefined) { // it is undefined when the level is just being animated.
      let currentTimeFrame = thisObject.timeFrame
      let timeFrame = currentTimeFrame // recalculatePeriod(event.newLevel)
      if (timeFrame !== currentTimeFrame) {
        for (let i = 0; i < timeFramesMasterArray.length; i++) {
          let timeFrameArray = timeFramesMasterArray[i]
          for (let j = 0; j < timeFrameArray.length; j++) {
            let record = timeFrameArray[j]
            if (timeFrame === record[0]) {
              filePeriodIndex = i
              timeFrameIndex = j
            }
          }
        }
        newTimeFrame()
        saveObjectState()
      }
    }
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta < 0) {
      timeFrameIndex--
      if (timeFrameIndex < 0) {
        filePeriodIndex--
        if (filePeriodIndex < 0) {
          filePeriodIndex = 0
          timeFrameIndex = 0
        } else {
          timeFrameIndex = timeFramesMasterArray[filePeriodIndex].length - 1
        }
      }
    } else {
      timeFrameIndex++
      if (timeFrameIndex > timeFramesMasterArray[filePeriodIndex].length - 1) {
        filePeriodIndex++
        if (filePeriodIndex > timeFramesMasterArray.length - 1) {
          filePeriodIndex = timeFramesMasterArray.length - 1
          timeFrameIndex = timeFramesMasterArray[filePeriodIndex].length - 1
        } else {
          timeFrameIndex = 0
        }
      }
    }

    newTimeFrame()
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
      code.value = timeFrameLabel
      thisObject.payload.node.code = JSON.stringify(code)
    } catch (err) {
       // we ignore errors here since most likely they will be parsing errors.
    }
  }

  function readObjectState () {
    return
    try {
      let code = JSON.parse(thisObject.payload.node.code)
      if (code.value !== timeFrameLabel) {
        let found = false
        for (let i = 0; i < timeFramesMasterArray.length; i++) {
          let timeFrameArray = timeFramesMasterArray[i]
          for (let j = 0; j < timeFrameArray.length; j++) {
            let record = timeFrameArray[j]
            if (code.value === record[1]) {
              filePeriodIndex = i
              timeFrameIndex = j
              found = true
            }
          }
        }
        if (found === true) {
          newTimeFrame()
        } else {
          saveObjectState()
        }
      }
    } catch (err) {
       // we ignore errors here since most likely they will be parsing errors.
    }
  }

  function newTimeFrame () {
    let timeFrameArray = timeFramesMasterArray[filePeriodIndex]
    thisObject.timeFrame = timeFrameArray[timeFrameIndex][0]
    timeFrameLabel = timeFrameArray[timeFrameIndex][1]

    let event = {}
    event.timeFrame = thisObject.timeFrame
    thisObject.container.eventHandler.raiseEvent('Time Frame Changed', event)
    window.localStorage.setItem('Current Time Frame', JSON.stringify({filePeriodIndex: filePeriodIndex, timeFrameIndex: timeFrameIndex}))
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
    if (timeFrameLabel === undefined) { return }

    let label = timeFrameLabel.split('-')
    let label1 = thisObject.payload.node.payload.parentNode.name
    let label2 = label[0]
    let label3 = label[1].toUpperCase()

    let icon1 = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.payload.parentNode.type)
    let icon2 = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.type)

    let backgroundColor = UI_COLOR.BLACK

    drawScaleDisplay(label1, label2, label3, 0, 0, 0, icon1, icon2, thisObject.container, backgroundColor)
  }
}
