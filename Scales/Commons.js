
function drawScaleDisplay (label1, label2, label3, xExtraOffSet1, xExtraOffSet2, xExtraOffSet3, icon1, icon2, container, backgroundColor) {
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
  label2 = label2.substring(0, 20)
  label3 = label3.substring(0, 20)

  drawLabel(label1, 1 / 2, 4 / 5, 10, container)
  drawLabel(label2, 1 / 2, 2 / 5, 20, container)
  drawLabel(label3, 1 / 2, 3 / 5, 10, container)

  drawIcon(icon1, 1 / 8, 1 / 2, 40, container)
  drawIcon(icon2, 7 / 8, 1 / 2, 40, container)
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
