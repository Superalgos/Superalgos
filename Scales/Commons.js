
function drawScaleDisplay (label1, label2, xExtraOffSet1, xExtraOffSet2, container, fitFunction) {
  let fontSize1 = 20
  let fontSize2 = 10

  const RED_LINE_HIGHT = 5
  const OPACITY = 1

  let params = {
    cornerRadius: 3,
    lineWidth: RED_LINE_HIGHT,
    container: container,
    borderColor: UI_COLOR.RUSTED_RED,
    castShadow: false,
    backgroundColor: UI_COLOR.DARK,
    opacity: OPACITY,
    fitFunction: fitFunction
  }

  roundedCornersBackground(params)

  /* Place the Text */

  let xOffset1 = label1.length * fontSize1 * FONT_ASPECT_RATIO

  let labelPoint1 = {
    x: container.frame.width / 2 - xOffset1 + xExtraOffSet1,
    y: container.frame.height / 2 + 6
  }

  labelPoint1 = container.frame.frameThisPoint(labelPoint1)
  let x = labelPoint1.x
  labelPoint1 = fitFunction(labelPoint1)
  labelPoint1.x = x

  browserCanvasContext.font = fontSize1 + 'px ' + UI_FONT.PRIMARY
  browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

  browserCanvasContext.fillText(label1, labelPoint1.x, labelPoint1.y)

  let xOffset2 = label2.length * fontSize2 * FONT_ASPECT_RATIO

  let labelPoint2 = {
    x: container.frame.width / 2 - xOffset2 / 2 - 3 + xExtraOffSet2,
    y: container.frame.height / 2 + 6
  }

  labelPoint2 = container.frame.frameThisPoint(labelPoint2)
  labelPoint2 = fitFunction(labelPoint2)

  browserCanvasContext.font = fontSize2 + 'px ' + UI_FONT.PRIMARY
  browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

  browserCanvasContext.fillText(label2, labelPoint2.x, labelPoint2.y)
}

