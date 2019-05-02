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

      /* We paint the panel background  */

  browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + params.opacity + ')'

  browserCanvasContext.setLineDash([0, 0])

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

  browserCanvasContext.lineWidth = params.lineWidth * 15
  browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + 0.05 + ')'
  browserCanvasContext.stroke()

  browserCanvasContext.fill()

  browserCanvasContext.lineWidth = params.lineWidth
  browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', ' + params.opacity + ')'
  browserCanvasContext.stroke()
}

