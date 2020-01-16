
function drawScaleDisplay (label1, label2, label3, xExtraOffSet1, xExtraOffSet2, xExtraOffSet3, icon1, icon2, container, backgroundColor) {
  const RED_LINE_HIGHT = 4
  const OPACITY = 1

  let params = {
    cornerRadius: 5,
    lineWidth: 1,
    container: container,
    borderColor: UI_COLOR.RUSTED_RED,
    castShadow: false,
    backgroundColor: backgroundColor,
    opacity: OPACITY
  }

  roundedCornersBackground(params)

  /* Place the Text */

  label1 = label1.substring(0, 18)
  label2 = label2.substring(0, 20)
  label3 = label3.substring(0, 20)

  drawLabel(label1, 1 / 2, 92 / 100, 0, 0, 9, container)
  drawLabel(label2, 1 / 2, 42 / 100, 0, 0, 18, container)
  drawLabel(label3, 1 / 2, 67 / 100, 0, 0, 9, container)

  drawIcon(icon1, 1 / 8, 1 / 2, 0, 0, 32, container)
  drawIcon(icon2, 7 / 8, 1 / 2, 0, 0, 32, container)
}

function drawScaleDisplayCover (container) {
  let params = {
    cornerRadius: 5,
    lineWidth: 1,
    container: container,
    borderColor: UI_COLOR.WHITE,
    castShadow: false,
    backgroundColor: UI_COLOR.WHITE,
    opacity: '0.25'
  }

  roundedCornersBackground(params)
}

