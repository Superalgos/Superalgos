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

    /* We pass this point through the viewPort lends, meaning we apply the viewPort zoom and displacement. */

  point = viewPort.zoomThisPoint(point)

  return point
}

function unTransformThisPoint (point, container) {
  point = viewPort.unzoomThisPoint(point)
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

function getDateFromPoint (point, container, timeLineCoordinateSystem) {
  point = unTransformThisPoint(point, container)
  point = timeLineCoordinateSystem.unInverseTransform(point, container.frame.height)

  let date = new Date(point.x)

  return date
}

function getRateFromPoint (point, container, timeLineCoordinateSystem) {
  point = unTransformThisPoint(point, container)
  point = timeLineCoordinateSystem.unInverseTransform(point, container.frame.height)

  return point.y
}

function getMilisecondsFromPoint (point, container, timeLineCoordinateSystem) {
  point = unTransformThisPoint(point, container)
  point = timeLineCoordinateSystem.unInverseTransform(point, container.frame.height)

  return point.x
}

function saveUserPosition (container, timeLineCoordinateSystem, position) {
  if (position === undefined) {
    position = {
      x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.topLeft.x) / 2,
      y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y) / 2
    }
  }

  let userPosition = {
    date: getDateFromPoint(position, container, timeLineCoordinateSystem),
    rate: getRateFromPoint(position, container, timeLineCoordinateSystem),
    market: DEFAULT_MARKET,
    zoom: viewPort.zoomTargetLevel
  }

  window.localStorage.setItem('userPosition', JSON.stringify(userPosition))
}

function getUserPosition (timeLineCoordinateSystem) {
  let savedPosition = window.localStorage.getItem('userPosition')
  let userPosition

  if (savedPosition === null) {
    userPosition = {
      date: (new Date()).toString(),
      rate: timeLineCoordinateSystem.max.y / 2,
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

function moveToUserPosition (container, timeLineCoordinateSystem, ignoreX, ignoreY, center, considerZoom, moveContainer) {
  let userPosition = getUserPosition(timeLineCoordinateSystem)

  if (considerZoom === true) {
    viewPort.newZoomLevel(userPosition.zoom)
  }

  INITIAL_TIME_PERIOD = recalculatePeriod(userPosition.zoom)
  NEW_SESSION_INITIAL_DATE = new Date(userPosition.date)

  let targetPoint = {
    x: (new Date(userPosition.date)).valueOf(),
    y: userPosition.rate
  }

    /* Put this po int in the coordinate system of the viewPort */

  targetPoint = timeLineCoordinateSystem.transformThisPoint(targetPoint)
  targetPoint = transformThisPoint(targetPoint, container)

  let centerPoint
  if (center !== undefined) {
    centerPoint = {
      x: center.x,
      y: center.y
    }
  } else {
    centerPoint = {
      x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.topLeft.x) / 2,
      y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y) / 2
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
    targetNoZoom = viewPort.unzoomThisPoint(targetCopy)

    let centerCopy = {
      x: centerPoint.x,
      y: centerPoint.y
    }

    let centerNoZoom
    centerNoZoom = viewPort.unzoomThisPoint(centerCopy)

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

    viewPort.displace(displaceVector)
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
