function drawContainerBackground (container, color, opacity, fitFunction) {
  let fromPoint = {
    x: 0,
    y: 0
  }

  let toPoint = {
    x: container.frame.width,
    y: container.frame.height
  }

  fromPoint = transformThisPoint(fromPoint, container)
  toPoint = transformThisPoint(toPoint, container)

  fromPoint = fitFunction(fromPoint)
  toPoint = fitFunction(toPoint)

  browserCanvasContext.beginPath()
  browserCanvasContext.rect(fromPoint.x, fromPoint.y, toPoint.x - fromPoint.x, toPoint.y - fromPoint.y)
  browserCanvasContext.fillStyle = 'rgba(' + color + ', ' + opacity + ')'
  browserCanvasContext.closePath()
  browserCanvasContext.fill()
}

function dynamicDecimals (value) {
  let decimals = 2
  if (value < 1) { decimals = 4 }
  if (Math.abs(Math.trunc(value * 100)) < 1) { decimals = 6 }
  if (Math.abs(Math.trunc(value * 10000)) < 1) { decimals = 8 }
  if (Math.abs(Math.trunc(value * 1000000)) < 1) { decimals = 10 }
  if (Math.abs(Math.trunc(value * 100000000)) < 1) { decimals = 12 }
  if (Math.abs(Math.trunc(value * 10000000000)) < 1) { value = 0; decimals = 0 }
  if (Math.trunc(value) === value) { decimals = 0 }
  let returnValue = Number(value).toFixed(decimals)
  return returnValue
}

function savePropertyAtNodeConfig (payload, propertyName, value) {
  try {
    let code = JSON.parse(payload.node.code)
    code[propertyName] = value
    payload.node.code = JSON.stringify(code, null, 4)
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

function downloadText (filename, text) {
  let element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

function downloadCanvas (filename) {
  let data = browserCanvas.toDataURL('image/png', 1)
  /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
  data = data.replace(/^data:image\/[^;]*/, 'data:application/octet-stream')

  /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
  data = data.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=' + filename + '.png')

  let element = document.createElement('a')
  element.setAttribute('href', data)
  element.setAttribute('download', filename + '.PNG')
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
};

function transformThisPoint (point, container) {
    /* We make the point relative to the current frame */

  point = container.frame.frameThisPoint(point)

    /* We pass this point through the canvas.chartingSpace.viewport lends, meaning we apply the canvas.chartingSpace.viewport zoom and displacement. */

  point = canvas.chartingSpace.viewport.transformThisPoint(point)

  return point
}

function unTransformThisPoint (point, container) {
  point = canvas.chartingSpace.viewport.unTransformThisPoint(point)
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

function getDateFromPointAtBrowserCanvas (point, container, coordinateSystem) {
  point = unTransformThisPoint(point, container)
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  let date = new Date(point.x)

  return date
}

function getDateFromPointAtChartsSpace (point, container, coordinateSystem) {
  point = container.frame.unframeThisPoint(point)
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  let date = new Date(point.x)

  return date
}

function getDateFromPointAtContainer (point, container, coordinateSystem) {
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  let date = new Date(point.x)

  return date
}

function getRateFromPointAtBrowserCanvas (point, container, coordinateSystem) {
  point = unTransformThisPoint(point, container)
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  return point.y
}

function getRateFromPointAtChartingSpace (point, container, coordinateSystem) {
  point = container.frame.unframeThisPoint(point)
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  return point.y
}

function getRateFromPointAtContainer (point, container, coordinateSystem) {
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  return point.y
}

function getMilisecondsFromPoint (point, container, coordinateSystem) {
  point = unTransformThisPoint(point, container)
  point = coordinateSystem.unInverseTransform(point, container.frame.height)

  return point.x
}

function moveToUserPosition (container, currentDate, currentRate, coordinateSystem, ignoreX, ignoreY, mousePosition, fitFunction) {
  let targetPoint = {
    x: currentDate.valueOf(),
    y: currentRate
  }

  /* Put this point in the coordinate system of the canvas.chartingSpace.viewport */
  targetPoint = coordinateSystem.transformThisPoint(targetPoint)
  targetPoint = transformThisPoint(targetPoint, container)

  let displaceVector

  let targetNoZoom = canvas.chartingSpace.viewport.unTransformThisPoint(targetPoint)
  let mouseNoZoom = canvas.chartingSpace.viewport.unTransformThisPoint(mousePosition)

  displaceVector = {
    x: mouseNoZoom.x - targetNoZoom.x,
    y: mouseNoZoom.y - targetNoZoom.y
  }

  if (ignoreX) { displaceVector.x = 0 }
  if (ignoreY) { displaceVector.y = 0 }

  container.displace(displaceVector)
}

function removeTime (datetime) {
  if (datetime === undefined) { return }

  let dateOnly = new Date(Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)

  return dateOnly
}

function printLabel (labelToPrint, x, y, opacity, fontSize, color, center, container, fitFunction) {
  let labelPoint
  if (color === undefined) { color = UI_COLOR.DARK }
  if (fontSize === undefined) { fontSize = 10 };

  browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
  let label = labelToPrint
  if (isNaN(label) === false && label !== '') {
    label = dynamicDecimals(labelToPrint)
    label = label.toLocaleString()
  }

  let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO

  if (center === true) {
    labelPoint = {
      x: x - xOffset,
      y: y
    }
  } else {
    labelPoint = {
      x: x,
      y: y
    }
  }

  if (container !== undefined) {
    labelPoint = container.frame.frameThisPoint(labelPoint)
  }

  if (fitFunction !== undefined) {
    labelPoint = fitFunction(labelPoint)
  }

  browserCanvasContext.fillStyle = 'rgba(' + color + ', ' + opacity + ')'
  browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
}

function newUniqueId () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
