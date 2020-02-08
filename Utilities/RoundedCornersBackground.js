function roundedCornersBackground (params) {
  if (params.xOffset === undefined) { params.xOffset = 0 }
  borderPoint1 = {
    x: params.cornerRadius + params.xOffset,
    y: params.cornerRadius
  }

  borderPoint2 = {
    x: params.container.frame.width - params.cornerRadius,
    y: params.cornerRadius
  }

  borderPoint3 = {
    x: params.container.frame.width - params.cornerRadius,
    y: params.container.frame.height - params.cornerRadius
  }

  borderPoint4 = {
    x: params.cornerRadius + params.xOffset,
    y: params.container.frame.height - params.cornerRadius
  }

      /* Now the transformations. */

  if (params.coordinateSystem !== undefined) { // For instance Candles would use this
    borderPoint1 = params.coordinateSystem.transformThisPoint(borderPoint1)
    borderPoint2 = params.coordinateSystem.transformThisPoint(borderPoint2)
    borderPoint3 = params.coordinateSystem.transformThisPoint(borderPoint3)
    borderPoint4 = params.coordinateSystem.transformThisPoint(borderPoint4)
  } else {
    if (params.outsideViewPort === true) { // If the element is not affected by zoom
      borderPoint1 = transformThisPoint(borderPoint1, params.container)
      borderPoint2 = transformThisPoint(borderPoint2, params.container)
      borderPoint3 = transformThisPoint(borderPoint3, params.container)
      borderPoint4 = transformThisPoint(borderPoint4, params.container)
    } else { // For instance Panels use this
      borderPoint1 = params.container.frame.frameThisPoint(borderPoint1)
      borderPoint2 = params.container.frame.frameThisPoint(borderPoint2)
      borderPoint3 = params.container.frame.frameThisPoint(borderPoint3)
      borderPoint4 = params.container.frame.frameThisPoint(borderPoint4)
    }
  }

  if (params.fitFunction !== undefined) {
    borderPoint1 = params.fitFunction(borderPoint1)
    borderPoint2 = params.fitFunction(borderPoint2)
    borderPoint3 = params.fitFunction(borderPoint3)
    borderPoint4 = params.fitFunction(borderPoint4)
  }

  browserCanvasContext.setLineDash([0, 0])

        /* Shadow  */

  if (params.castShadow === true) {
    let SHADOW_OFFSET = 2

    browserCanvasContext.beginPath()

    browserCanvasContext.arc(borderPoint1.x + SHADOW_OFFSET, borderPoint1.y + SHADOW_OFFSET, params.cornerRadius, 1.0 * Math.PI, 1.5 * Math.PI)
    browserCanvasContext.lineTo(borderPoint2.x + SHADOW_OFFSET, borderPoint2.y - params.cornerRadius + SHADOW_OFFSET)
    browserCanvasContext.arc(borderPoint2.x + SHADOW_OFFSET, borderPoint2.y + SHADOW_OFFSET, params.cornerRadius, 1.5 * Math.PI, 2.0 * Math.PI)
    browserCanvasContext.lineTo(borderPoint3.x + params.cornerRadius + SHADOW_OFFSET, borderPoint3.y + SHADOW_OFFSET)
    browserCanvasContext.arc(borderPoint3.x + SHADOW_OFFSET, borderPoint3.y + SHADOW_OFFSET, params.cornerRadius, 0 * Math.PI, 0.5 * Math.PI)
    browserCanvasContext.lineTo(borderPoint4.x + SHADOW_OFFSET, borderPoint4.y + params.cornerRadius + SHADOW_OFFSET)
    browserCanvasContext.arc(borderPoint4.x + SHADOW_OFFSET, borderPoint4.y + SHADOW_OFFSET, params.cornerRadius, 0.5 * Math.PI, 1.0 * Math.PI)
    browserCanvasContext.lineTo(borderPoint1.x - params.cornerRadius + SHADOW_OFFSET, borderPoint1.y + SHADOW_OFFSET)

    browserCanvasContext.closePath()

    browserCanvasContext.lineWidth = 10
    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + 0.01 + ')'
    browserCanvasContext.stroke()

    browserCanvasContext.lineWidth = 5
    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + 0.01 + ')'
    browserCanvasContext.stroke()

    browserCanvasContext.lineWidth = 1
    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + 0.15 + ')'
    browserCanvasContext.stroke()
  }

        /* Background  */

  browserCanvasContext.beginPath()

  browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, params.cornerRadius, 1.0 * Math.PI, 1.5 * Math.PI)
  browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - params.cornerRadius)
  browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, params.cornerRadius, 1.5 * Math.PI, 2.0 * Math.PI)
  browserCanvasContext.lineTo(borderPoint3.x + params.cornerRadius, borderPoint3.y)
  browserCanvasContext.arc(borderPoint3.x, borderPoint3.y, params.cornerRadius, 0 * Math.PI, 0.5 * Math.PI)
  browserCanvasContext.lineTo(borderPoint4.x, borderPoint4.y + params.cornerRadius)
  browserCanvasContext.arc(borderPoint4.x, borderPoint4.y, params.cornerRadius, 0.5 * Math.PI, 1.0 * Math.PI)
  browserCanvasContext.lineTo(borderPoint1.x - params.cornerRadius, borderPoint1.y)

  browserCanvasContext.closePath()

  browserCanvasContext.fillStyle = 'rgba(' + params.backgroundColor + ', ' + params.opacity + ')'

  browserCanvasContext.fill()

  browserCanvasContext.lineWidth = params.lineWidth
  browserCanvasContext.strokeStyle = 'rgba(' + params.borderColor + ', ' + params.opacity + ')'
  browserCanvasContext.stroke()
}

function drawLabel (label, xFactor, yFactor, xOffset, yOffset, fontSize, container) {
  if (label === undefined) { return }
  let fontOffset = label.length * fontSize * FONT_ASPECT_RATIO + 10

  let labelPoint = {
    x: container.frame.width * xFactor + xOffset - fontOffset / 2,
    y: container.frame.height * yFactor + yOffset
  }

  labelPoint = container.frame.frameThisPoint(labelPoint)

  browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
  browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

  browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
}

function drawIcon (icon, xFactor, yFactor, xOffset, yOffset, imageSize, container) {
  if (icon !== undefined) {
    if (icon.canDrawIcon === true) {
      let imagePosition = {
        x: container.frame.width * xFactor + xOffset - imageSize / 2,
        y: container.frame.height * yFactor + yOffset - imageSize / 2
      }

      imagePosition = container.frame.frameThisPoint(imagePosition)
      browserCanvasContext.drawImage(
        icon, imagePosition.x,
        imagePosition.y,
        imageSize,
        imageSize)
    }
  }
}
