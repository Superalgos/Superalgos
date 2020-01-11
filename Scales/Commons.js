
function drawScaleDisplay (label1, label2, label3, xExtraOffSet1, xExtraOffSet2, xExtraOffSet3, icon1, icon2, container, backgroundColor) {
  let fontSize1 = 10
  let fontSize2 = 20
  let fontSize3 = 10

  const RED_LINE_HIGHT = 4
  const OPACITY = 1

  let params = {
    cornerRadius: 15,
    lineWidth: 2,
    container: container,
    borderColor: UI_COLOR.RUSTED_RED,
    castShadow: false,
    backgroundColor: backgroundColor,
    opacity: OPACITY
  }

  roundedCornersBackground(params)

  /* Place the Text */

  label1 = label1.substring(0, 18)
  let xOffset1 = label1.length * fontSize1 * FONT_ASPECT_RATIO

  let labelPoint1 = {
    x: container.frame.width * 1 / 2 - xOffset1 / 2 + xExtraOffSet1 - 5,
    y: container.frame.height * 4 / 5
  }

  labelPoint1 = container.frame.frameThisPoint(labelPoint1)
  let x = labelPoint1.x
  labelPoint1.x = x

  browserCanvasContext.font = fontSize1 + 'px ' + UI_FONT.PRIMARY
  browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

  browserCanvasContext.fillText(label1, labelPoint1.x, labelPoint1.y)

  label2 = label2.substring(0, 20)
  let xOffset2 = label2.length * fontSize2 * FONT_ASPECT_RATIO

  let labelPoint2 = {
    x: container.frame.width * 1 / 2 - xOffset2 / 2 + xExtraOffSet2,
    y: container.frame.height * 2 / 5
  }

  labelPoint2 = container.frame.frameThisPoint(labelPoint2)

  browserCanvasContext.font = fontSize2 + 'px ' + UI_FONT.PRIMARY
  browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

  browserCanvasContext.fillText(label2, labelPoint2.x, labelPoint2.y)

  label3 = label3.substring(0, 20)
  let xOffset3 = label3.length * fontSize3 * FONT_ASPECT_RATIO

  let labelPoint3 = {
    x: container.frame.width * 1 / 2 - xOffset3 / 2 + xExtraOffSet3,
    y: container.frame.height * 3 / 5
  }

  labelPoint3 = container.frame.frameThisPoint(labelPoint3)

  browserCanvasContext.font = fontSize3 + 'px ' + UI_FONT.PRIMARY
  browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

  browserCanvasContext.fillText(label3, labelPoint3.x, labelPoint3.y)

  /* Images */

  if (icon1 !== undefined) {
    if (icon1.canDrawIcon === true) {
      let imageSize = 40
      let imagePosition = {
        x: container.frame.width * 1 / 8 - imageSize / 2,
        y: container.frame.height / 2 - imageSize / 2
      }

      imagePosition = container.frame.frameThisPoint(imagePosition)
      browserCanvasContext.drawImage(
        icon1, imagePosition.x,
        imagePosition.y,
        imageSize,
        imageSize)
    }
  }

  if (icon2 !== undefined) {
    if (icon2.canDrawIcon === true) {
      let imageSize = 40
      let imagePosition = {
        x: container.frame.width * 7 / 8 - imageSize / 2,
        y: container.frame.height / 2 - imageSize / 2
      }

      imagePosition = container.frame.frameThisPoint(imagePosition)
      browserCanvasContext.drawImage(
        icon2, imagePosition.x,
        imagePosition.y,
        imageSize,
        imageSize)
    }
  }
}

function drawScaleDisplayCover (container) {
  let params = {
    cornerRadius: 15,
    lineWidth: 2,
    container: container,
    borderColor: UI_COLOR.WHITE,
    castShadow: false,
    backgroundColor: UI_COLOR.WHITE,
    opacity: '0.75'
  }

  roundedCornersBackground(params)
}
