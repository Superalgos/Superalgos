
function transformThisPoint (point, container) {
    /* We make the point relative to the current frame */

  point = container.frame.frameThisPoint(point)

    /* We add the possible displacement */

  point = container.displacement.displaceThisPoint(point)

    /* We viewport Transformation. */

  point = viewPort.zoomThisPoint(point)

  return point
}

function unTransformThisPoint (point, container) {
  point = viewPort.unzoomThisPoint(point)
  point = container.displacement.undisplaceThisPoint(point)
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

function saveUserPosition (container, timeLineCoordinateSystem) {
  let centerPoint = {
    x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.topLeft.x) / 2,
    y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y) / 2
  }

  let userPosition = {
    date: getDateFromPoint(centerPoint, container, timeLineCoordinateSystem),
    rate: getRateFromPoint(centerPoint, container, timeLineCoordinateSystem),
    market: DEFAULT_MARKET,
    zoom: viewPort.zoomTargetLevel
  }

  window.localStorage.setItem('userPosition', JSON.stringify(userPosition))
}

function moveToUserPosition (container, timeLineCoordinateSystem) {
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

  let centerPoint = {
    x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.topLeft.x) / 2,
    y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y) / 2
  }

  viewPort.newZoomLevel(userPosition.zoom)
  INITIAL_TIME_PERIOD = recalculatePeriod(userPosition.zoom)
  INITIAL_DATE = new Date(userPosition.date)

  let targetPoint = {
    x: (new Date(userPosition.date)).valueOf(),
    y: userPosition.rate
  }

    /* Put this point in the coordinate system of the viewPort */

  targetPoint = timeLineCoordinateSystem.transformThisPoint(targetPoint)
  targetPoint = transformThisPoint(targetPoint, container)

    /* Lets calculate the displace vector, from the point we want at the center, to the current center. */

  let displaceVector = {
    x: centerPoint.x - targetPoint.x,
    y: centerPoint.y - targetPoint.y
  }

  viewPort.displace(displaceVector)
}

function removeTime (datetime) {
  if (datetime === undefined) { return }

  let dateOnly = new Date(Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)

  return dateOnly
}
