function newRateScale () {
  const MODULE_NAME = 'Right Scale'

  let thisObject = {
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    heightPercentage: 100
  }

  const HEIGHT_PERCENTAGE_DEFAULT_VALUE = 50
  const STEP_SIZE = 5
  const MIN_WIDTH = 50

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.frame.width = viewPort.margins.RIGHT
  thisObject.container.frame.height = viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y

  thisObject.container.frame.position.x = viewPort.visibleArea.bottomRight.x
  thisObject.container.frame.position.y = TOP_SPACE_HEIGHT

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = true

  let mouse = {
    position: {
      x: 0,
      y: 0
    }
  }

  let visible = true
  let timeLineCoordinateSystem

  return thisObject

  function initialize (pTimeLineCoordinateSystem) {
    timeLineCoordinateSystem = pTimeLineCoordinateSystem

    thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)

    thisObject.heightPercentage = window.localStorage.getItem(MODULE_NAME)
    if (!thisObject.heightPercentage) {
      thisObject.heightPercentage = HEIGHT_PERCENTAGE_DEFAULT_VALUE
    } else {
      thisObject.heightPercentage = JSON.parse(thisObject.heightPercentage)
    }

    let event = {}
    event.heightPercentage = thisObject.heightPercentage
    thisObject.container.eventHandler.raiseEvent('Height Percentage Changed', event)

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
      thisObject.heightPercentage = thisObject.heightPercentage - STEP_SIZE
      if (thisObject.heightPercentage < STEP_SIZE) { thisObject.heightPercentage = STEP_SIZE }
    } else {
      thisObject.heightPercentage = thisObject.heightPercentage + STEP_SIZE
      if (thisObject.heightPercentage > 100) { thisObject.heightPercentage = 100 }
    }
    event.heightPercentage = thisObject.heightPercentage
    thisObject.container.eventHandler.raiseEvent('Height Percentage Changed', event)

    window.localStorage.setItem(MODULE_NAME, thisObject.heightPercentage)
  }

  function getContainer (pPoint) {
    let container

/* In this case we manually frame this point since we do a very special treatment of the position of this scale. */
    let point = {
      x: 0,
      y: 0
    }
    point.x = pPoint.x - thisObject.container.frame.position.x - viewPort.margins.RIGHT
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
      x: frame.width - frame.width / 10,
      y: 0
    }

    point2 = {
      x: frame.width,
      y: 0
    }

    point3 = {
      x: frame.width,
      y: frame.height
    }

    point4 = {
      x: frame.width - frame.width / 10,
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

    if (point2.x - point1.x < MIN_WIDTH) {
      point1.x = point2.x - MIN_WIDTH
      point4.x = point2.x - MIN_WIDTH
    }

    /* Lets start the drawing. */
/*
    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x + viewPort.margins.RIGHT, point2.y)
    browserCanvasContext.lineTo(point3.x + viewPort.margins.RIGHT, point3.y)
    browserCanvasContext.lineTo(point4.x, point4.y)
    browserCanvasContext.lineTo(point1.x, point1.y)
    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 1)'
    browserCanvasContext.lineWidth = 1
    browserCanvasContext.stroke()
*/
    thisObject.container.frame.position.x = point1.x
    thisObject.container.frame.position.y = point1.y

    thisObject.container.frame.width = point2.x - point1.x
    thisObject.container.frame.height = point3.y - point2.y

    let point = {
      x: point5.x + viewPort.margins.RIGHT,
      y: mouse.position.y
    }

    let rate = getRateFromPoint(point, thisObject.container.parentContainer, timeLineCoordinateSystem)

    let label = rate.toFixed(2)
    let fontSize = 10

    let xOffset = label.length * fontSize * FONT_ASPECT_RATIO

    if (point.y + fontSize / 2 > point3.y || point.y - fontSize / 2 < point1.y) { return }

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 0.50)'

    browserCanvasContext.fillText(label, point1.x + viewPort.margins.RIGHT, point.y + fontSize / 2)

    browserCanvasContext.beginPath()

    browserCanvasContext.moveTo(point.x, point.y)
    browserCanvasContext.lineTo(point1.x + viewPort.margins.RIGHT, point.y)

    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', 0.5)'
    browserCanvasContext.lineWidth = 0.2
    browserCanvasContext.setLineDash([1, 5])
    browserCanvasContext.stroke()
  }
}
