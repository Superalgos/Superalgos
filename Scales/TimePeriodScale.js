function newTimePeriodScale () {
  const MODULE_NAME = 'Time Period Scale'
  const INFO_LOG = false
  const INTENSIVE_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    timePeriod: undefined
  }

  const FILES_PERIOD_DEFAULT_VALUE = 0
  const TIME_PERIOD_DEFAULT_VALUE = 0
  const MIN_HEIGHT = 50

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = true

  let mouse = {
    position: {
      x: 0,
      y: 0
    }
  }

  let visible = false
  let timeLineCoordinateSystem
  let objectStorage = {}
  let filePeriodIndex = FILES_PERIOD_DEFAULT_VALUE
  let timePeriodIndex = TIME_PERIOD_DEFAULT_VALUE
  let timePeriodsMasterArray = [marketFilesPeriods, dailyFilePeriods]
  let timePeriodLabel = ''

  return thisObject

  function initialize (pTimeLineCoordinateSystem) {
    timeLineCoordinateSystem = pTimeLineCoordinateSystem

    thisObject.container.eventHandler.listenToEvent('Mouse Wheel', onMouseWheel)

    readObjectState()
    newTimePeriod()

    thisObject.container.eventHandler.listenToEvent('onMouseOver', function (event) {
      mouse.position.x = event.x
      mouse.position.y = event.y

      visible = true
    })

    thisObject.container.eventHandler.listenToEvent('onMouseNotOver', function (event) {
      visible = false
    })
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
      y: frame.height - frame.height / 10
    }

    point2 = {
      x: frame.width,
      y: frame.height - frame.height / 10
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

    let displacement = viewPort.margins.BOTTOM - BOTTOM_SPACE_HEIGHT

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

    let point = {
      x: mouse.position.x,
      y: point1.y + viewPort.margins.BOTTOM
    }

    let label = timePeriodLabel
    let fontSize = 10

    let xOffset = label.length * fontSize * FONT_ASPECT_RATIO

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 0.50)'

    if (point.x - xOffset / 2 < point1.x || point.x + xOffset / 2 > point2.x) { return }

    browserCanvasContext.fillText(label, point.x - xOffset / 2, point.y + fontSize + 1)
/*
    browserCanvasContext.beginPath()

    browserCanvasContext.moveTo(point.x, point1.y)
    browserCanvasContext.lineTo(point.x, point5.y)

    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', 0.5)'
    browserCanvasContext.lineWidth = 0.2
    browserCanvasContext.setLineDash([1, 5])
    browserCanvasContext.stroke()
*/
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
  }
}
