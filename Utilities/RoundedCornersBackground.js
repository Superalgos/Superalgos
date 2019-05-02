function roundedCornersBackground (params) {
  borderPoint1 = {
    x: params.cornerRadious,
    y: params.cornerRadious
  }

  borderPoint2 = {
    x: params.container.frame.width - params.cornerRadious,
    y: params.cornerRadious
  }

  borderPoint3 = {
    x: params.container.frame.width - params.cornerRadious,
    y: params.container.frame.height - params.cornerRadious
  }

  borderPoint4 = {
    x: params.cornerRadious,
    y: params.container.frame.height - params.cornerRadious
  }

      /* Now the transformations. */

  borderPoint1 = params.container.frame.frameThisPoint(borderPoint1)
  borderPoint2 = params.container.frame.frameThisPoint(borderPoint2)
  borderPoint3 = params.container.frame.frameThisPoint(borderPoint3)
  borderPoint4 = params.container.frame.frameThisPoint(borderPoint4)

  browserCanvasContext.setLineDash([0, 0])

        /* Shadow  */

  if (params.castShadow === true) {
    let SHADOW_OFFSET = 2

    browserCanvasContext.beginPath()

    browserCanvasContext.arc(borderPoint1.x + SHADOW_OFFSET, borderPoint1.y + SHADOW_OFFSET, params.cornerRadious, 1.0 * Math.PI, 1.5 * Math.PI)
    browserCanvasContext.lineTo(borderPoint2.x + SHADOW_OFFSET, borderPoint2.y - params.cornerRadious + SHADOW_OFFSET)
    browserCanvasContext.arc(borderPoint2.x + SHADOW_OFFSET, borderPoint2.y + SHADOW_OFFSET, params.cornerRadious, 1.5 * Math.PI, 2.0 * Math.PI)
    browserCanvasContext.lineTo(borderPoint3.x + params.cornerRadious + SHADOW_OFFSET, borderPoint3.y + SHADOW_OFFSET)
    browserCanvasContext.arc(borderPoint3.x + SHADOW_OFFSET, borderPoint3.y + SHADOW_OFFSET, params.cornerRadious, 0 * Math.PI, 0.5 * Math.PI)
    browserCanvasContext.lineTo(borderPoint4.x + SHADOW_OFFSET, borderPoint4.y + params.cornerRadious + SHADOW_OFFSET)
    browserCanvasContext.arc(borderPoint4.x + SHADOW_OFFSET, borderPoint4.y + SHADOW_OFFSET, params.cornerRadious, 0.5 * Math.PI, 1.0 * Math.PI)
    browserCanvasContext.lineTo(borderPoint1.x - params.cornerRadious + SHADOW_OFFSET, borderPoint1.y + SHADOW_OFFSET)

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

  browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, params.cornerRadious, 1.0 * Math.PI, 1.5 * Math.PI)
  browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - params.cornerRadious)
  browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, params.cornerRadious, 1.5 * Math.PI, 2.0 * Math.PI)
  browserCanvasContext.lineTo(borderPoint3.x + params.cornerRadious, borderPoint3.y)
  browserCanvasContext.arc(borderPoint3.x, borderPoint3.y, params.cornerRadious, 0 * Math.PI, 0.5 * Math.PI)
  browserCanvasContext.lineTo(borderPoint4.x, borderPoint4.y + params.cornerRadious)
  browserCanvasContext.arc(borderPoint4.x, borderPoint4.y, params.cornerRadious, 0.5 * Math.PI, 1.0 * Math.PI)
  browserCanvasContext.lineTo(borderPoint1.x - params.cornerRadious, borderPoint1.y)

  browserCanvasContext.closePath()

  browserCanvasContext.fillStyle = 'rgba(' + params.backgroundColor + ', ' + params.opacity + ')'

  browserCanvasContext.fill()

  browserCanvasContext.lineWidth = params.lineWidth
  browserCanvasContext.strokeStyle = 'rgba(' + params.borderColor + ', ' + params.opacity + ')'
  browserCanvasContext.stroke()
}

