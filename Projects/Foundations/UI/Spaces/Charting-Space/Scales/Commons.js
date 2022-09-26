
function drawScaleDisplay(label1, label2, label3, xExtraOffSet1, xExtraOffSet2, xExtraOffSet3, icon1, icon2, container, backgroundColor, textColor) {
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

    UI.projects.foundations.utilities.drawPrint.roundedCornersBackground(params)

    /* Place the Text */

    label1 = label1.substring(0, 18)
    label2 = label2.substring(0, 20)
    label3 = label3.substring(0, 20)

    if (textColor !== undefined) {
        UI.projects.foundations.utilities.drawPrint.drawLabel(label1, 1 / 2, 92 / 100, 0, 0, 9, container, textColor)
        UI.projects.foundations.utilities.drawPrint.drawLabel(label2, 1 / 2, 42 / 100, 0, 0, 17, container, textColor)
        UI.projects.foundations.utilities.drawPrint.drawLabel(label3, 1 / 2, 67 / 100, 0, 0, 9, container, textColor)
    } else {
        UI.projects.foundations.utilities.drawPrint.drawLabel(label1, 1 / 2, 92 / 100, 0, 0, 9, container)
        UI.projects.foundations.utilities.drawPrint.drawLabel(label2, 1 / 2, 42 / 100, 0, 0, 17, container)
        UI.projects.foundations.utilities.drawPrint.drawLabel(label3, 1 / 2, 67 / 100, 0, 0, 9, container)
    }


    UI.projects.foundations.utilities.drawPrint.drawIcon(icon1, 1 / 8, 1 / 2, 0, 0, 28, container)
    UI.projects.foundations.utilities.drawPrint.drawIcon(icon2, 7 / 8, 1 / 2, 0, 0, 28, container)
}

function drawScaleDisplayCover(container) {
    let params = {
        cornerRadius: 5,
        lineWidth: 1,
        container: container,
        borderColor: UI_COLOR.WHITE,
        castShadow: false,
        backgroundColor: UI_COLOR.WHITE,
        opacity: '0.25'
    }

    UI.projects.foundations.utilities.drawPrint.roundedCornersBackground(params)
}

