
function newSpeedometer() {
    const MODULE_NAME = 'Speedometer'

    let thisObject = {
        visible: true,
        container: undefined,
        params: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    thisObject.container.isDraggeable = false
    thisObject.container.isWheelable = false

    return thisObject

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.params = undefined
    }

    function initialize() {

    }

    function getContainer(point, purpose) {
        if (thisObject.visible !== true) { return }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {

    }

    function draw() {
        if (thisObject.params === undefined) { return }
        drawAssetCircle()
    }

    function drawAssetCircle() {
        const RED_LINE_HIGHT = 2
        const RADIUS = 50
        const OPACITY = 1

        let centerPoint = {
            x: 0,
            y: 0
        }

        centerPoint = thisObject.container.frame.frameThisPoint(centerPoint)

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(centerPoint.x, centerPoint.y, RADIUS + RED_LINE_HIGHT, 0 * Math.PI, 2.0 * Math.PI)
        browserCanvasContext.closePath()

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + OPACITY + ')'
        browserCanvasContext.fill()

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(centerPoint.x, centerPoint.y, RADIUS, 0.0 * Math.PI, 2.0 * Math.PI)
        browserCanvasContext.closePath()

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + OPACITY + ')'
        browserCanvasContext.fill()

        /* We draw the circle bar */

        const DEFAULT_THICKNESS = 2
        const VALUE_THICKNESS = 8
        const VALUE_BG_THICKNESS = 1
        const BAR_RADIUS = RADIUS * 0.85

        let BAR_START_ANGLE = 0.85 * Math.PI
        let BAR_END_ANGLE = 2.15 * Math.PI
        let CURRENT_VALUE_ANGLE = thisObject.params.VALUE * (BAR_END_ANGLE - BAR_START_ANGLE) / thisObject.params.MAX_VALUE + BAR_START_ANGLE
        let MIN_VALUE_ANGLE = thisObject.params.MIN_VALUE * (BAR_END_ANGLE - BAR_START_ANGLE) / thisObject.params.MAX_VALUE + BAR_START_ANGLE
        let INIT_VALUE_ANGLE = thisObject.params.INIT_VALUE * (BAR_END_ANGLE - BAR_START_ANGLE) / thisObject.params.MAX_VALUE + BAR_START_ANGLE
        let PROFIT_VALUE_ANGLE = CURRENT_VALUE_ANGLE

        if (CURRENT_VALUE_ANGLE > INIT_VALUE_ANGLE) { CURRENT_VALUE_ANGLE = INIT_VALUE_ANGLE }
        if (CURRENT_VALUE_ANGLE < MIN_VALUE_ANGLE) { CURRENT_VALUE_ANGLE = MIN_VALUE_ANGLE }
        if (PROFIT_VALUE_ANGLE > BAR_END_ANGLE) { PROFIT_VALUE_ANGLE = BAR_END_ANGLE }

        if (
            thisObject.params.VALUE > 0 &&
            thisObject.params.ASSET_NAME === thisObject.params.BASE_ASSET &&
            thisObject.params.POSITION_TAKEN === false
        ) {
            browserCanvasContext.setLineDash([]) // Resets Line Dash

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIUS, BAR_START_ANGLE, MIN_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_BG_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath()

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIUS, MIN_VALUE_ANGLE, CURRENT_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_BG_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath()

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIUS, CURRENT_VALUE_ANGLE, INIT_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_BG_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath()

            if (PROFIT_VALUE_ANGLE > INIT_VALUE_ANGLE) {
                browserCanvasContext.beginPath()
                browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIUS, INIT_VALUE_ANGLE, PROFIT_VALUE_ANGLE)

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + OPACITY + ')'
                browserCanvasContext.lineWidth = VALUE_BG_THICKNESS
                browserCanvasContext.stroke()
                browserCanvasContext.closePath()
            }

            browserCanvasContext.setLineDash([2, 3])

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIUS, BAR_START_ANGLE, MIN_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath()

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIUS, MIN_VALUE_ANGLE, CURRENT_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath()

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIUS, CURRENT_VALUE_ANGLE, INIT_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath()
            browserCanvasContext.setLineDash([]) // Resets Line Dash


            if (PROFIT_VALUE_ANGLE > INIT_VALUE_ANGLE) {
                browserCanvasContext.beginPath()
                browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIUS, INIT_VALUE_ANGLE, PROFIT_VALUE_ANGLE)

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + OPACITY + ')'
                browserCanvasContext.lineWidth = VALUE_THICKNESS
                browserCanvasContext.stroke()
                browserCanvasContext.closePath()
            }
        }

        /* Common Variables */

        let fontSize
        let label
        let xOffset
        let yOffset

        /* We put the thisObject.params.VALUE in the middle */

        label = thisObject.params.VALUE

        if (isNaN(label) === false) {
            label = Number(label)

            label = dynamicDecimals(label, 2)
            if (label === 0) { label = label.toFixed(2) }
        }

        fontSize = 22
        if (label.length > 8) {
            fontSize = 18
        }
        if (label.length > 10) {
            fontSize = 14
        }
        if (label.length > 12) {
            fontSize = 10
        }
        if (label.length > 14) {
            fontSize = 8
        }

        browserCanvasContext.font = 'bold  ' + fontSize + 'px ' + UI_FONT.PRIMARY

        // label = label.substring(0, 6)

        xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO + 7

        labelPoint = {
            x: centerPoint.x - xOffset,
            y: centerPoint.y
        }

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)

        /* We put the top label */

        fontSize = 12

        browserCanvasContext.font = 'bold  ' + fontSize + 'px ' + UI_FONT.PRIMARY

        label = thisObject.params.ASSET_LABEL

        xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO + 3
        yOffset = 22

        labelPoint = {
            x: centerPoint.x - xOffset,
            y: centerPoint.y - yOffset
        }

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)

        /* We put the bottom label */

        fontSize = 12

        browserCanvasContext.font = 'bold  ' + fontSize + 'px ' + UI_FONT.PRIMARY

        label = thisObject.params.ASSET_NAME + ' '

        xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO + 3
        yOffset = -15

        labelPoint = {
            x: centerPoint.x - xOffset,
            y: centerPoint.y - yOffset
        }

        if (thisObject.params.ASSET_NAME === thisObject.params.BASE_ASSET) {
            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
        } else {
            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
        }

        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
    }
}

