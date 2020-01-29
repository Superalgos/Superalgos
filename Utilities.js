function savePropertyAtNodeConfig (payload, propertyName, value) {
  try {
    let code = JSON.parse(payload.node.code)
    code[propertyName] = value
    payload.node.code = JSON.stringify(code)
  } catch (err) {
     // we ignore errors here since most likely they will be parsing errors.
  }
}

function loadPropertyFromNodeConfig (payload, propertyName) {
  try {
    let code = JSON.parse(payload.node.code)
    return code[propertyName]
  } catch (err) {
     // we ignore errors here since most likely they will be parsing errors.
  }
}

function saveFrame (payload, frame) {
  payload.frame = {
    position: {
      x: frame.position.x,
      y: frame.position.y
    },
    width: frame.width,
    height: frame.height,
    radius: frame.radius
  }
}

function loadFrame (payload, frame) {
  if (payload.node.savedPayload !== undefined) {
    if (payload.node.savedPayload.frame !== undefined) {
      frame.position.x = payload.node.savedPayload.frame.position.x
      frame.position.y = payload.node.savedPayload.frame.position.y
      frame.width = payload.node.savedPayload.frame.width
      frame.height = payload.node.savedPayload.frame.height
      frame.radius = payload.node.savedPayload.frame.radius
      payload.node.savedPayload.frame = undefined
    }
  }
}

function convertTimeFrameToName (pTimeFrame) {
  for (let i = 0; i < dailyFilePeriods.length; i++) {
    let period = dailyFilePeriods[i]
    if (period[0] === pTimeFrame) {
      return period[1]
    }
  }

  for (let i = 0; i < marketFilesPeriods.length; i++) {
    let period = marketFilesPeriods[i]
    if (period[0] === pTimeFrame) {
      return period[1]
    }
  }
}

function download (filename, text) {
  let element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

function transformThisPoint (point, container) {
    /* We make the point relative to the current frame */

  point = container.frame.frameThisPoint(point)

    /* We pass this point through the canvas.chartSpace.viewport lends, meaning we apply the canvas.chartSpace.viewport zoom and displacement. */

  point = canvas.chartSpace.viewport.transformThisPoint(point)

  return point
}

function unTransformThisPoint (point, container) {
  point = canvas.chartSpace.viewport.unTransformThisPoint(point)
  point = container.frame.unframeThisPoint(point)

  return point
}

function nextPorwerOf10 (number) {
  for (let i = -10; i <= 10; i++) {
    if (number < Math.pow(10, i)) {
      return Math.pow(10, i)
    }
  }
}

function pad (str, max) {
  str = str.toString()
  return str.length < max ? pad('0' + str, max) : str
}

function getDateFromPoint (point, container, coordinateSystem) {
  point = unTransformThisPoint(point, container)
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  let date = new Date(point.x)

  return date
}

function getRateFromPoint (point, container, coordinateSystem) {
  point = unTransformThisPoint(point, container)
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  return point.y
}

function getMilisecondsFromPoint (point, container, coordinateSystem) {
  point = unTransformThisPoint(point, container)
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  return point.x
}

function saveUserPosition (container, coordinateSystem, position) {
  if (position === undefined) {
    position = {
      x: (canvas.chartSpace.viewport.visibleArea.bottomRight.x - canvas.chartSpace.viewport.visibleArea.topLeft.x) / 2,
      y: (canvas.chartSpace.viewport.visibleArea.bottomRight.y - canvas.chartSpace.viewport.visibleArea.topLeft.y) / 2
    }
  }

  let userPosition = {
    date: getDateFromPoint(position, container, coordinateSystem),
    rate: getRateFromPoint(position, container, coordinateSystem),
    market: DEFAULT_MARKET,
    zoom: canvas.chartSpace.viewport.zoomTargetLevel
  }

  window.localStorage.setItem('userPosition', JSON.stringify(userPosition))
}

function getUserPosition (coordinateSystem) {
  let savedPosition = window.localStorage.getItem('userPosition')
  let userPosition

  if (savedPosition === null) {
    userPosition = {
      date: (new Date()).toString(),
      rate: coordinateSystem.max.y / 2,
      market: DEFAULT_MARKET,
      zoom: INITIAL_ZOOM_LEVEL
    }
  } else {
    userPosition = JSON.parse(savedPosition)
  }

  userPosition.point = {
    x: (new Date(userPosition.date)).valueOf(),
    y: userPosition.rate
  }

  return userPosition
}

function moveToUserPosition (container, coordinateSystem, ignoreX, ignoreY, center, moveContainer) {
  let userPosition = getUserPosition(coordinateSystem)

  INITIAL_TIME_PERIOD = recalculatePeriod(userPosition.zoom)
  NEW_SESSION_INITIAL_DATE = new Date(userPosition.date)

  let targetPoint = {
    x: (new Date(userPosition.date)).valueOf(),
    y: userPosition.rate
  }

    /* Put this po int in the coordinate system of the canvas.chartSpace.viewport */

  targetPoint = coordinateSystem.transformThisPoint(targetPoint)
  targetPoint = transformThisPoint(targetPoint, container)

  let centerPoint
  if (center !== undefined) {
    centerPoint = {
      x: center.x,
      y: center.y
    }
  } else {
    centerPoint = {
      x: (canvas.chartSpace.viewport.visibleArea.bottomRight.x - canvas.chartSpace.viewport.visibleArea.topLeft.x) / 2,
      y: (canvas.chartSpace.viewport.visibleArea.bottomRight.y - canvas.chartSpace.viewport.visibleArea.topLeft.y) / 2
    }
  }

  /* When we are moving the container, it needs to consider the zooming of the viewport */
  /* Lets calculate the displace vector, from the point we want at the center, to the current center. */

  let displaceVector
  if (moveContainer === true) {
    let targetCopy = {
      x: targetPoint.x,
      y: targetPoint.y
    }

    let targetNoZoom
    targetNoZoom = canvas.chartSpace.viewport.unTransformThisPoint(targetCopy)

    let centerCopy = {
      x: centerPoint.x,
      y: centerPoint.y
    }

    let centerNoZoom
    centerNoZoom = canvas.chartSpace.viewport.unTransformThisPoint(centerCopy)

    displaceVector = {
      x: centerNoZoom.x - targetNoZoom.x,
      y: centerNoZoom.y - targetNoZoom.y
    }

    if (ignoreX) { displaceVector.x = 0 }
    if (ignoreY) { displaceVector.y = 0 }

    container.displace(displaceVector)
  } else {
    displaceVector = {
      x: centerPoint.x - targetPoint.x,
      y: centerPoint.y - targetPoint.y
    }

    if (ignoreX) { displaceVector.x = 0 }
    if (ignoreY) { displaceVector.y = 0 }

    canvas.chartSpace.viewport.displace(displaceVector)
  }
}

function removeTime (datetime) {
  if (datetime === undefined) { return }

  let dateOnly = new Date(Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)

  return dateOnly
}

function printLabel (labelToPrint, x, y, opacity, fontSize) {
  let labelPoint

  browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

  let label = '' + labelToPrint

  let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO

  browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')'
  browserCanvasContext.fillText(label, x, y)
}

function newUniqueId () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
