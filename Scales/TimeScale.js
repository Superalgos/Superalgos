function newTimeScale () {
  const MODULE_NAME = 'Time Scale'

  let thisObject = {
    lenghtPercentage: undefined,
    container: undefined,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  const LENGHT_PERCENTAGE_DEFAULT_VALUE = 5
  const STEP_SIZE = 5
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

  let visible = true
  let timeLineCoordinateSystem

  return thisObject

  function initialize (pTimeLineCoordinateSystem) {
    timeLineCoordinateSystem = pTimeLineCoordinateSystem

    thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)

    thisObject.lenghtPercentage = window.localStorage.getItem(MODULE_NAME)
    if (!thisObject.lenghtPercentage) {
      thisObject.lenghtPercentage = LENGHT_PERCENTAGE_DEFAULT_VALUE
    } else {
      thisObject.lenghtPercentage = JSON.parse(thisObject.lenghtPercentage)
    }

    let event = {}
    event.lenghtPercentage = thisObject.lenghtPercentage
    thisObject.container.eventHandler.raiseEvent('Lenght Percentage Changed', event)

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
      thisObject.lenghtPercentage = thisObject.lenghtPercentage - STEP_SIZE
      if (thisObject.lenghtPercentage < STEP_SIZE) { thisObject.lenghtPercentage = STEP_SIZE }
    } else {
      thisObject.lenghtPercentage = thisObject.lenghtPercentage + STEP_SIZE
      if (thisObject.lenghtPercentage > 100) { thisObject.lenghtPercentage = 100 }
    }

    event.lenghtPercentage = thisObject.lenghtPercentage
    thisObject.container.eventHandler.raiseEvent('Lenght Percentage Changed', event)

    window.localStorage.setItem(MODULE_NAME, thisObject.lenghtPercentage)
  }

  function getContainer (pPoint) {
    let container

/* In this case we manually frame this point since we do a very special treatment of the position of this scale. */
    let point = {
      x: 0,
      y: 0
    }
    point.x = pPoint.x - thisObject.container.frame.position.x
    point.y = pPoint.y - thisObject.container.frame.position.y + viewPort.margins.TOP

    if (thisObject.container.frame.isThisPointHere(point, undefined, true) === true) {
      return thisObject.container
    } else {
           /* This point does not belong to this space. */

      return undefined
    }
  }

  function physics () {
    let point = {
      x: 0,
      y: 0
    }

    let date = getDateFromPoint(point, thisObject.container.parentContainer, timeLineCoordinateSystem)
    date = new Date(date)
    window.localStorage.setItem('Date @ Screen Corner', date.toUTCString())
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
      y: 0
    }

    point2 = {
      x: frame.width,
      y: 0
    }

    point3 = {
      x: frame.width,
      y: frame.height / 10
    }

    point4 = {
      x: 0,
      y: frame.height / 10
    }

    point5 = {
      x: 0,
      y: frame.height
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
      point3.y = point2.y + MIN_HEIGHT
      point4.y = point2.y + MIN_HEIGHT
    }

    thisObject.container.frame.position.x = point1.x
    thisObject.container.frame.position.y = point1.y

    thisObject.container.frame.width = point2.x - point1.x
    thisObject.container.frame.height = point3.y - point2.y

    let point = {
      x: mouse.position.x,
      y: point1.y - viewPort.margins.TOP
    }

    let date = getDateFromPoint(point, thisObject.container.parentContainer, timeLineCoordinateSystem)
    date = new Date(date)

    let label = date.toUTCString()
    let labelArray = label.split(' ')
    let label1 = labelArray[1] + ' ' + labelArray[2] + ' ' + labelArray[3]
    let label2 = labelArray[4]

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
    container.frame.width = 190
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
      x: mouse.position.x - xOffset1 + 15,
      y: point1.y + viewPort.margins.BOTTOM + 6
    }

    browserCanvasContext.font = fontSize1 + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

    browserCanvasContext.fillText(label1, labelPoint1.x, labelPoint1.y)

    let xOffset2 = label2.length * fontSize2 * FONT_ASPECT_RATIO

    let labelPoint2 = {
      x: mouse.position.x - xOffset2 / 2 - 3 + 70,
      y: point1.y + viewPort.margins.BOTTOM + 6
    }

    browserCanvasContext.font = fontSize2 + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

    browserCanvasContext.fillText(label2, labelPoint2.x, labelPoint2.y)
  }
}

