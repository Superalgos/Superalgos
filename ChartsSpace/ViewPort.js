
function newViewPort () {
  const MODULE_NAME = 'Viewport'
  const INFO_LOG = false
  const INTENSIVE_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  const CONSOLE_LOG = true

  let ANIMATION_INCREMENT = 0.25

  let TOP_MARGIN = 30 + TOP_SPACE_HEIGHT
  let BOTTOM_MARGIN = 30 + COCKPIT_SPACE_HEIGHT
  let LEFT_MARGIN = 50
  let RIGHT_MARGIN = 50
  let MARGINS = {
    TOP: TOP_MARGIN,
    BOTTOM: BOTTOM_MARGIN,
    LEFT: LEFT_MARGIN,
    RIGHT: RIGHT_MARGIN
  }

  let thisObject = {
    visibleArea: undefined,
    width: undefined,
    height: undefined,
    eventHandler: undefined,
    zoomTargetLevel: undefined,
    zoomLevel: undefined,
    mousePosition: undefined,
    margins: MARGINS,
    getDisplacement: getDisplacement,
    newZoomLevel: newZoomLevel,
    applyZoom: applyZoom,
    isMinZoom: isMinZoom,
    zoomFontSize: zoomFontSize,
    zoomThisPoint: zoomThisPoint,
    unzoomThisPoint: unzoomThisPoint,
    isThisPointVisible: isThisPointVisible,
    fitIntoVisibleArea: fitIntoVisibleArea,
    displace: displace,
    displaceTarget: displaceTarget,
    animate: animate,
    draw: draw,
    raiseEvents: raiseEvents,
    resize: resize,
    initialize: initialize
  }

  let increment = 0.035

  let offset = {
    x: 0,
    y: 0
  }

  var targetOffset = {
    x: 0,
    y: 0
  }

  let offsetIncrement = {
    x: 0,
    y: 0
  }

  thisObject.mousePosition = {
    x: 0,
    y: 0
  }

  thisObject.eventHandler = newEventHandler()

  let objectStorage = {}

  return thisObject

  function initialize () {
    resize()
    readObjectState()
  }

  function resize () {
    TOP_MARGIN = 30 + TOP_SPACE_HEIGHT
    BOTTOM_MARGIN = 30 + browserCanvas.height - COCKPIT_SPACE_POSITION
    LEFT_MARGIN = 0
    RIGHT_MARGIN = 0
    MARGINS = {
      TOP: TOP_MARGIN,
      BOTTOM: BOTTOM_MARGIN,
      LEFT: LEFT_MARGIN,
      RIGHT: RIGHT_MARGIN
    }

    thisObject.visibleArea = {
      topLeft: { x: LEFT_MARGIN, y: TOP_MARGIN },
      topRight: { x: browserCanvas.width - RIGHT_MARGIN, y: TOP_MARGIN },
      bottomRight: { x: browserCanvas.width - RIGHT_MARGIN, y: browserCanvas.height - BOTTOM_MARGIN},
      bottomLeft: { x: LEFT_MARGIN, y: browserCanvas.height - BOTTOM_MARGIN}
    }

    thisObject.width = thisObject.visibleArea.topRight.x - thisObject.visibleArea.topLeft.x
    thisObject.height = thisObject.visibleArea.bottomRight.y - thisObject.visibleArea.topLeft.y
  }

  function getDisplacement () {
    let displacement = {
      x: offset.x,
      y: offset.y
    }
    return displacement
  }

  function raiseEvents () {
    let event = {
      newOffset: offset
    }

    thisObject.eventHandler.raiseEvent('Offset Changed', event)
  }

  function animate () {
    if (thisObject.zoomLevel < thisObject.zoomTargetLevel) {
      if (thisObject.zoomTargetLevel - thisObject.zoomLevel < ANIMATION_INCREMENT) {
        ANIMATION_INCREMENT = Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel)
      }
      thisObject.zoomLevel = thisObject.zoomLevel + ANIMATION_INCREMENT
      changeZoom(thisObject.zoomLevel - ANIMATION_INCREMENT, thisObject.zoomLevel)
    }

    if (thisObject.zoomLevel > thisObject.zoomTargetLevel) {
      if (thisObject.zoomLevel - thisObject.zoomTargetLevel < ANIMATION_INCREMENT) {
        ANIMATION_INCREMENT = Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel)
      }
      thisObject.zoomLevel = thisObject.zoomLevel - ANIMATION_INCREMENT
      changeZoom(thisObject.zoomLevel + ANIMATION_INCREMENT, thisObject.zoomLevel)
    }

    if (offsetIncrement.y !== 0) {
      if (Math.trunc(Math.abs(targetOffset.y - offset.y) * 1000) >= Math.trunc(Math.abs(offsetIncrement.y) * 1000)) {
        offset.y = offset.y + offsetIncrement.y

              // console.log("offset.y changed to " + offset.y)
      } else {
        offsetIncrement.y = 0
      }
    }
  }

  function displace (displaceVector, recalculate) {
    offset.x = offset.x + displaceVector.x
    offset.y = offset.y + displaceVector.y

    saveObjectState()

    let event = {
      newOffset: offset,
      recalculate: recalculate
    }

    thisObject.eventHandler.raiseEvent('Offset Changed', event)

      // console.log("displace produced new Offset x = " + offset.x + " y = " + offset.y);
  }

  function displaceTarget (displaceVector) {
    targetOffset.x = targetOffset.x + displaceVector.x
    targetOffset.y = targetOffset.y + displaceVector.y

    offsetIncrement = {
      x: (targetOffset.x - offset.x) / 10,
      y: (targetOffset.y - offset.y) / 10
    }

      // console.log("displaceTarget x = " + targetOffset.x + " y = " + targetOffset.y);
  }

  function newZoomLevel (level) {
    thisObject.zoomTargetLevel = level
    thisObject.zoomLevel = level

    saveObjectState()

    ANIMATION_INCREMENT = Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel) / 3

    let event = {
      newLevel: thisObject.zoomTargetLevel,
      newOffset: offset,
      type: undefined
    }

    thisObject.eventHandler.raiseEvent('Zoom Changed', event)

    return true
  }

  function isMinZoom () {
      /* returns true is we are currently at the min zoom level. */

    if (thisObject.zoomTargetLevel === MIN_ZOOM_LEVEL) { return true } else { return false }
  }

  function applyZoom (amount) {
       // console.log("applyZoom amount: " + amount);

       /* We adjust the sensitivity for Mac Users */
    let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    if (isMac) { amount = amount / 5 }

    if (amount > 0) {
      if (thisObject.zoomTargetLevel > -5) {
        amount = amount * 2
      }

      if (thisObject.zoomTargetLevel > 10) {
        amount = amount * 3
      }

      if (thisObject.zoomTargetLevel > 15) {
        amount = amount * 4
      }
    }

    if (amount < 0) {
      if (thisObject.zoomTargetLevel > -4) {
        amount = amount * 2
      }

      if (thisObject.zoomTargetLevel > 13) {
        amount = amount * 3
      }

      if (thisObject.zoomTargetLevel > 19) {
        amount = amount * 4
      }
    }

    if (thisObject.zoomTargetLevel + amount > 1000) {
      return false
    }

    if (thisObject.zoomTargetLevel <= -27 && amount < 0) {
      amount = amount / 4
    }

    if (thisObject.zoomTargetLevel < -27 && amount > 0) {
      amount = amount / 4
    }

    if (thisObject.zoomTargetLevel + amount < MIN_ZOOM_LEVEL) {
      return false
    }

    thisObject.zoomTargetLevel = thisObject.zoomTargetLevel + amount

    ANIMATION_INCREMENT = Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel) / 3

    let event = {
      newLevel: thisObject.zoomTargetLevel,
      newOffset: offset,
      type: undefined
    }

    if (amount > 0) {
      event.type = 'Zoom In'
    } else {
      event.type = 'Zoom Out'
    }

    thisObject.eventHandler.raiseEvent('Zoom Changed', event)

    return true
  }

  function changeZoom (oldLevel, newLevel) {
    let mouseNoZoom = unzoomThisPoint(thisObject.mousePosition, oldLevel)
    let newMouse = zoomThisPoint(mouseNoZoom, newLevel)

    offset.x = offset.x - newMouse.x + thisObject.mousePosition.x
    offset.y = offset.y - newMouse.y + thisObject.mousePosition.y

    saveObjectState()

    targetOffset.x = offset.x
    targetOffset.y = offset.y

    offsetIncrement = {
      x: 0,
      y: 0
    }

    thisObject.eventHandler.raiseEvent('Zoom Changed')
  }

  function zoomFontSize (baseSize, level) {
    let zoomFactor = increment // + increment * thisObject.zoomLevel / 100;

    if (level === undefined) {
      baseSize = baseSize * (1 + zoomFactor * thisObject.zoomLevel)
    } else {
      baseSize = baseSize * (1 + zoomFactor * level)
    }

    return baseSize
  }

  function fitIntoVisibleArea (point) {
       /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

    if (point.x > thisObject.visibleArea.bottomRight.x + 1) {
      point.x = thisObject.visibleArea.bottomRight.x + 1
    }

    if (point.x < thisObject.visibleArea.topLeft.x - 1) {
      point.x = thisObject.visibleArea.topLeft.x - 1
    }

    if (point.y > thisObject.visibleArea.bottomRight.y + 1) {
      point.y = thisObject.visibleArea.bottomRight.y + 1
    }

    if (point.y < thisObject.visibleArea.topLeft.y - 1) {
      point.y = thisObject.visibleArea.topLeft.y - 1
    }

    return point
  }

  function zoomThisPoint (point, level) {
    let zoomFactor = increment // + increment * thisObject.zoomLevel / 100;

    if (level === undefined) {
      point.x = point.x * (1 + zoomFactor * thisObject.zoomLevel) + offset.x
      point.y = point.y * (1 + zoomFactor * thisObject.zoomLevel) + offset.y
    } else {
      point.x = point.x * (1 + zoomFactor * level) + offset.x
      point.y = point.y * (1 + zoomFactor * level) + offset.y
    }

    return point
  }

  function unzoomThisPoint (pointWithZoom, level) {
    let pointWithoutZoom
    let zoomFactor = increment // + increment * thisObject.zoomLevel / 100;

    if (level === undefined) {
      pointWithoutZoom = {
        x: (pointWithZoom.x - offset.x) / (1 + zoomFactor * thisObject.zoomLevel),
        y: (pointWithZoom.y - offset.y) / (1 + zoomFactor * thisObject.zoomLevel)
      }
    } else {
      pointWithoutZoom = {
        x: (pointWithZoom.x - offset.x) / (1 + zoomFactor * level),
        y: (pointWithZoom.y - offset.y) / (1 + zoomFactor * level)
      }
    }
    return pointWithoutZoom
  }

  function isThisPointVisible (point) {
    if (visibleArea === undefined) {
      getVisibleArea()
    }

    if (point.x < visibleArea.topLeft.x || point.x > visibleArea.bottomRight.x || point.y < visibleArea.topLeft.y || point.y > visibleArea.bottomRight.y) {
      return false
    } else {
      return true
    }
  }

  function draw () {
    drawGrid(0.1)
  }

  function drawGrid (step) {
    if (thisObject.zoomLevel > -17) { return }

    let squareWidth = (thisObject.visibleArea.bottomRight.x - thisObject.visibleArea.bottomLeft.x) / step
    squareWidth = squareWidth + squareWidth * increment * thisObject.zoomLevel

    let startingX = offset.x - Math.trunc(offset.x / squareWidth) * squareWidth
    let startingY = offset.y - Math.trunc(offset.y / squareWidth) * squareWidth
    let lineWidth = 0.4 + thisObject.zoomLevel / 100
    lineWidth = lineWidth.toFixed(2)

    if (lineWidth < 0.1) {
      return
    }

    if (lineWidth > 2) {
      lineWidth = 2
    }

    browserCanvasContext.beginPath()

    let CROSS_SIZE = 4

    for (var i = startingX; i < thisObject.visibleArea.bottomRight.x + RIGHT_MARGIN; i = i + squareWidth) {
      for (var j = startingY; j < thisObject.visibleArea.bottomRight.y + BOTTOM_MARGIN; j = j + squareWidth) {
        let point1 = {
          x: Math.trunc(i - CROSS_SIZE),
          y: Math.trunc(j)
        }

        let point2 = {
          x: Math.trunc(i + CROSS_SIZE),
          y: Math.trunc(j)
        }

        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)

        let point3 = {
          x: Math.trunc(i),
          y: Math.trunc(j - CROSS_SIZE)
        }

        let point4 = {
          x: Math.trunc(i),
          y: Math.trunc(j + CROSS_SIZE)
        }

        browserCanvasContext.moveTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point4.x, point4.y)
      }
    }
    browserCanvasContext.closePath()
    browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.5)'

    browserCanvasContext.lineWidth = 1

    browserCanvasContext.stroke()
  }

  function saveObjectState () {
    objectStorage.offset = offset
    objectStorage.zoomLevel = thisObject.zoomLevel
    window.localStorage.setItem(MODULE_NAME, JSON.stringify(objectStorage))
  }

  function readObjectState () {
    let objectStorageString = window.localStorage.getItem(MODULE_NAME)
    if (objectStorageString !== null && objectStorageString !== '') {
      objectStorage = JSON.parse(objectStorageString)
      offset = objectStorage.offset
      thisObject.zoomLevel = objectStorage.zoomLevel
      thisObject.zoomTargetLevel = objectStorage.zoomLevel
      INITIAL_TIME_PERIOD = recalculatePeriod(thisObject.zoomLevel)
    } else { // Setting default values for first session
      offset = {
        x: 0,
        y: 0
      }
      thisObject.zoomLevel = MIN_ZOOM_LEVEL
      thisObject.zoomTargetLevel = MIN_ZOOM_LEVEL
    }
  }
}

