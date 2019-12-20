function newTimePeriodScale () {
  const MODULE_NAME = 'Time Period Scale'

  let thisObject = {
    timePeriod: undefined,
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  const FILES_PERIOD_DEFAULT_VALUE = 0
  const TIME_PERIOD_DEFAULT_VALUE = 0
  const MIN_HEIGHT = 50

  let mouse = {
    position: {
      x: 0,
      y: 0
    }
  }

  let visible = true
  let timeLineCoordinateSystem
  let objectStorage = {}
  let filePeriodIndex = FILES_PERIOD_DEFAULT_VALUE
  let timePeriodIndex = TIME_PERIOD_DEFAULT_VALUE
  let timePeriodsMasterArray = [marketFilesPeriods, dailyFilePeriods]
  let timePeriodLabel = ''

  let onMouseWheelEventSubscriptionId
  let onMouseOverEventSubscriptionId
  let onMouseNotOverEventSubscriptionId
  let onZoomChangedEventSubscriptionId

  setupContainer()
  return thisObject

  function setupContainer () {
    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    thisObject.container.isDraggeable = false
    thisObject.container.isClickeable = false
    thisObject.container.isWheelable = true
  }

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onZoomChangedEventSubscriptionId)

    timeLineCoordinateSystem = undefined
    objectStorage = undefined

    thisObject.container.finalize()
    thisObject.container = undefined
    setupContainer()
  }

  function initialize (pTimeLineCoordinateSystem) {
    timeLineCoordinateSystem = pTimeLineCoordinateSystem

    onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)

    readObjectState()
    newTimePeriod()

    onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', function (event) {
      mouse.position.x = event.x
      mouse.position.y = event.y

      visible = true
    })

    onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', function (event) {
      visible = false
    })

    onZoomChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent('Zoom Changed', onZoomChanged)
  }

  function onZoomChanged (event) {
    if (event !== undefined) { // it is undefined when the level is just being animated.
      let currentTimePeriod = thisObject.timePeriod
      let timePeriod = recalculatePeriod(event.newLevel)
      if (timePeriod !== currentTimePeriod) {
        for (let i = 0; i < timePeriodsMasterArray.length; i++) {
          let timePeriodArray = timePeriodsMasterArray[i]
          for (let j = 0; j < timePeriodArray.length; j++) {
            let record = timePeriodArray[j]
            if (timePeriod === record[0]) {
              filePeriodIndex = i
              timePeriodIndex = j
            }
          }
        }
        saveObjectState()
        newTimePeriod()
      }
    }
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta < 0) {
      timePeriodIndex--
      if (timePeriodIndex < 0) {
        filePeriodIndex--
        if (filePeriodIndex < 0) {
          filePeriodIndex = 0
          timePeriodIndex = 0
        } else {
          timePeriodIndex = timePeriodsMasterArray[filePeriodIndex].length - 1
        }
      }
    } else {
      timePeriodIndex++
      if (timePeriodIndex > timePeriodsMasterArray[filePeriodIndex].length - 1) {
        filePeriodIndex++
        if (filePeriodIndex > timePeriodsMasterArray.length - 1) {
          filePeriodIndex = timePeriodsMasterArray.length - 1
          timePeriodIndex = timePeriodsMasterArray[filePeriodIndex].length - 1
        } else {
          timePeriodIndex = 0
        }
      }
    }

    saveObjectState()
    newTimePeriod()
  }

  function getContainer (pPoint) {
    let container

/* In this case we manually frame this point since we do a very special treatment of the position of this scale. */
    let point = {
      x: 0,
      y: 0
    }

    point.x = pPoint.x - thisObject.container.frame.position.x
    point.y = pPoint.y - thisObject.container.frame.position.y

    if (thisObject.container.frame.isThisPointHere(point, undefined, true) === true) {
      return thisObject.container
    } else {
           /* This point does not belong to this space. */

      return undefined
    }
  }

  function saveObjectState () {
    objectStorage.filePeriodIndex = filePeriodIndex
    objectStorage.timePeriodIndex = timePeriodIndex
    window.localStorage.setItem(MODULE_NAME, JSON.stringify(objectStorage))
  }

  function readObjectState () {
    let objectStorageString = window.localStorage.getItem(MODULE_NAME)
    if (objectStorageString !== null && objectStorageString !== '') {
      objectStorage = JSON.parse(objectStorageString)
      filePeriodIndex = objectStorage.filePeriodIndex
      timePeriodIndex = objectStorage.timePeriodIndex
    }
  }

  function newTimePeriod () {
    let timePeriodArray = timePeriodsMasterArray[filePeriodIndex]
    thisObject.timePeriod = timePeriodArray[timePeriodIndex][0]
    timePeriodLabel = timePeriodArray[timePeriodIndex][1]

    let event = {}
    event.timePeriod = thisObject.timePeriod
    thisObject.container.eventHandler.raiseEvent('Time Period Changed', event)
    window.localStorage.setItem('Current Time Period', JSON.stringify({filePeriodIndex: filePeriodIndex, timePeriodIndex: timePeriodIndex}))
  }

  function draw () {
    if (visible === false) { return }

/* We need this scale to match the shape of its parent when the parent is inside the viewPort, when it is not, we need the scale still
to be visible at the top of the viewPort. */

    let frame = thisObject.container.parentContainer.frame
    let point1
    let point2
    let point3
    let point4

    point1 = {
      x: 0,
      y: frame.height - frame.height * 2 / 100
    }

    point2 = {
      x: frame.width,
      y: frame.height - frame.height * 2 / 100
    }

    point3 = {
      x: frame.width,
      y: frame.height
    }

    point4 = {
      x: 0,
      y: frame.height
    }

    point5 = {
      x: 0,
      y: 0
    }

        /* Now the transformations. */

    point1 = transformThisPoint(point1, frame.container)
    point2 = transformThisPoint(point2, frame.container)
    point3 = transformThisPoint(point3, frame.container)
    point4 = transformThisPoint(point4, frame.container)
    point5 = transformThisPoint(point5, frame.container)

    point1 = viewPort.fitIntoVisibleArea(point1)
    point2 = viewPort.fitIntoVisibleArea(point2)
    point3 = viewPort.fitIntoVisibleArea(point3)
    point4 = viewPort.fitIntoVisibleArea(point4)
    point5 = viewPort.fitIntoVisibleArea(point5)

    if (point3.y - point2.y < MIN_HEIGHT) {
      point1.y = point3.y - MIN_HEIGHT
      point2.y = point3.y - MIN_HEIGHT
    }

    /* Lets start the drawing. */

    let displacement = viewPort.margins.BOTTOM - COCKPIT_SPACE_HEIGHT

    /*
    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y + displacement)
    browserCanvasContext.lineTo(point2.x, point2.y + displacement)
    browserCanvasContext.lineTo(point3.x, point3.y + displacement)
    browserCanvasContext.lineTo(point4.x, point4.y + displacement)
    browserCanvasContext.lineTo(point1.x, point1.y + displacement)
    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 1)'
    browserCanvasContext.lineWidth = 1
    browserCanvasContext.stroke()
*/

    thisObject.container.frame.position.x = point1.x
    thisObject.container.frame.position.y = point1.y + displacement

    thisObject.container.frame.width = point2.x - point1.x
    thisObject.container.frame.height = point3.y - point2.y

  /* Common Variables */

    let label = timePeriodLabel.split('-')
    let label1 = label[0]
    let label2 = label[1].toUpperCase()
    let fontSize1 = 20
    let fontSize2 = 10

    const RED_LINE_HIGHT = 5
    const OPACITY = 1

    let centerPoint = {
      x: mouse.position.x,
      y: point1.y + viewPort.margins.BOTTOM
    }

    let container = newContainer()
    container.initialize('Visible Time Scale')
    container.frame.width = 60
    container.frame.height = 25
    container.frame.position.x = centerPoint.x - container.frame.width / 2
    container.frame.position.y = centerPoint.y - container.frame.height / 2

    let params = {
      cornerRadius: 3,
      lineWidth: RED_LINE_HIGHT,
      container: container,
      borderColor: UI_COLOR.RUSTED_RED,
      castShadow: false,
      backgroundColor: UI_COLOR.DARK,
      opacity: OPACITY
    }

    roundedCornersBackground(params)

    /* Place the Text */

    let xOffset1 = label1.length * fontSize1 * FONT_ASPECT_RATIO

    let labelPoint1 = {
      x: mouse.position.x - xOffset1 / 2 - 14,
      y: point1.y + viewPort.margins.BOTTOM + 6
    }

    browserCanvasContext.font = fontSize1 + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

    browserCanvasContext.fillText(label1, labelPoint1.x, labelPoint1.y)

    let xOffset2 = label2.length * fontSize2 * FONT_ASPECT_RATIO

    let labelPoint2 = {
      x: mouse.position.x - xOffset2 / 2 - 3 + 14,
      y: point1.y + viewPort.margins.BOTTOM + 6
    }

    browserCanvasContext.font = fontSize2 + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

    browserCanvasContext.fillText(label2, labelPoint2.x, labelPoint2.y)
  }
}
