 ﻿
function newTimeControlPanel () {
  let thisObject = {
    container: undefined,
    setDatetime: setDatetime,
    datetimeDisplay: undefined,
    stepDisplay: undefined,
    draw: draw,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  container.isDraggeable = true
  thisObject.container = container
  thisObject.container.frame.containerName = 'Current Datetime'

  let timePeriod
  let panelTabButton

  return thisObject

  function initialize () {
    thisObject.container.frame.width = UI_PANEL.WIDTH.SMALL
    thisObject.container.frame.height = UI_PANEL.HEIGHT.SMALL

    let position = {
      x: (viewPort.visibleArea.topRight.x - viewPort.visibleArea.topLeft.x) / 2 - thisObject.container.frame.width / 2,
      y: viewPort.visibleArea.bottomLeft.y - thisObject.container.frame.height
    }

    thisObject.container.frame.position = position

    panelTabButton = newPanelTabButton()
    panelTabButton.parentContainer = thisObject.container
    panelTabButton.container.frame.parentFrame = thisObject.container.frame
    panelTabButton.initialize()

    let datetime = NEW_SESSION_INITIAL_DATE

    let datetimeDisplay = {
      currentDatetime: datetime,
      addTime: addTime,
      draw: drawTimeDisplay
    }

    thisObject.datetimeDisplay = datetimeDisplay

    viewPort.eventHandler.listenToEvent('Zoom Changed', onZoomChanged)
    timePeriod = INITIAL_TIME_PERIOD
  }

  function onBotChangedTime (pNewDatetime) {
    let newDatetime = new Date(pNewDatetime)

    thisObject.container.eventHandler.raiseEvent('Datetime Changed', newDatetime)
  }

  function onZoomChanged (event) {
    if (event !== undefined) { // it is undefined when the level is just being animated.
      timePeriod = recalculatePeriod(event.newLevel)
    }
  }

  function getContainer (point) {
    let container

    container = panelTabButton.getContainer(point)
    if (container !== undefined) { return container }

        /* First we check if thisObject point is inside thisObject space. */

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            /* The point does not belong to any inner container, so we return the current container. */

      return thisObject.container
    } else {
            /* This point does not belong to thisObject space. */

      return undefined
    }
  }

  function setDatetime (pDatetime) {
    thisObject.datetimeDisplay.currentDatetime = new Date(pDatetime)
  }

  function addTime (seconds) {
    let newDate = thisObject.datetimeDisplay.currentDatetime

    newDate.setSeconds(newDate.getSeconds() + seconds)
    thisObject.datetimeDisplay.currentDatetime = newDate
  }

  function draw () {
    return
    thisObject.container.frame.draw(false, false, true)
    thisObject.datetimeDisplay.draw()
    panelTabButton.draw()
  }

  function drawTimeDisplay () {
    let fontSize = 10

    let label = thisObject.datetimeDisplay.currentDatetime.toUTCString()
    let labelArray = label.split(' ')

    label = labelArray[0] + ' ' + labelArray[1] + ' ' + labelArray[2] + ' ' + labelArray[3]

        /* Now we transform x on the actual coordinate on the canvas. */

    let labelPoint = {
      x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
      y: thisObject.container.frame.height * 4.4 / 10
    }

    labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
    browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)

        /* The time */

    label = labelArray[4] + ' ' + labelArray[5]

        /* Now we transform x on the actual coordinate on the canvas. */

    labelPoint = {
      x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
      y: thisObject.container.frame.height * 6.5 / 10
    }

    labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
    browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)

    if (timePeriod > _45_MINUTES_IN_MILISECONDS) {
      label = timePeriod / _1_HOUR_IN_MILISECONDS + ' hs'
    } else {
      label = timePeriod / _1_MINUTE_IN_MILISECONDS + ' min'
    }

        /* Now we transform x on the actual coordinate on the canvas. */

    labelPoint = {
      x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
      y: thisObject.container.frame.height * 8.5 / 10
    }

    labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
    browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
  }
}
