
function newCodeEditor() {
    const MODULE_NAME = 'Code Editor'

    let thisObject = {
        isVisibleFunction: undefined,
        visible: false,
        imagePathOK: undefined,
        imagePathNOT_OK: undefined,
        rawRadius: undefined,
        targetRadius: undefined,
        currentRadius: undefined,
        container: undefined,
        payload: undefined,
        deactivate: deactivate,
        activate: activate,
        physics: physics,
        drawBackground: drawBackground,
        drawForeground: drawForeground,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.isClickeable = false
    thisObject.container.isDraggeable = false
    thisObject.container.detectMouseOver = false
    thisObject.container.frame.radius = 0
    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0

    let isMouseOver = false
    let SIZE_FACTOR = 1.0

    return thisObject

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined
        thisObject.isVisibleFunction = undefined
    }

    function initialize() {

    }

    function deactivate() {
        if (thisObject.visible === true) {
            thisObject.visible = false
            let textArea = document.getElementById('textArea')
            textArea.style.display = 'none'
            thisObject.payload.node.code = textArea.value
        }
        EDITOR_ON_FOCUS = false
    }

    function activate(action) {
        thisObject.visible = true
        thisObject.payload = action.node.payload
        thisObject.rawRadius = 8
        thisObject.targetRadius = thisObject.container.frame.radius
        thisObject.currentRadius = 0
        thisObject.payload.uiObject.resetErrorMessage()
        thisObject.payload.uiObject.uiObjectTitle.exitEditMode()

        let textArea = document.getElementById('textArea')
        textArea.value = thisObject.payload.node.code
        textArea.style = 'resize: none;' +
            ' border: none;' +
            ' outline: none;' +
            'box-shadow: none;' +
            'overflow:hidden;' +
            'font-family: ' + UI_FONT.PRIMARY + ';' +
            'font-size: 14px;' +
            'background-color: rgb(' + UI_COLOR.RUSTED_RED + ');' +
            'color:rgb(255, 255, 255);' +
            'width: ' + thisObject.container.frame.width + 'px;' +
            'height: ' + thisObject.container.frame.height + 'px'
        textArea.style.display = 'block'
        textArea.focus()
        EDITOR_ON_FOCUS = true
    }

    function getContainer(point) {
        let container
        if (thisObject.visible === true) {
            if (point.x === VERY_LARGE_NUMBER) {
                /* The the mouse leaves the canvas, and event of mouse over with a ridiculous coordinate is triggered so that
                anyone can react. In our case, the code editor has a text area that is not part of the canvas, so the event is
                triggered. We compensate recognizing this coordinate and returning our container. */
                return thisObject.container
            }

            if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
                return thisObject.container
            } else {
                return undefined
            }
        }
    }

    function physics() {
        if (Math.abs(thisObject.currentRadius - thisObject.targetRadius) >= 0.5) {
            if (thisObject.currentRadius < thisObject.targetRadius) {
                thisObject.currentRadius = thisObject.currentRadius + 0.5
            } else {
                thisObject.currentRadius = thisObject.currentRadius - 0.5
            }
        }

        thisObject.container.frame.position.x = 0
        thisObject.container.frame.position.y = 0

        thisObject.container.frame.width = thisObject.container.frame.radius * 1 * SIZE_FACTOR
        thisObject.container.frame.height = thisObject.container.frame.radius * 1 * SIZE_FACTOR

        let textAreaPosition = {
            x: 0 - thisObject.container.frame.width / 2,
            y: 0 - thisObject.container.frame.height * 3 / 7 + CURRENT_TOP_MARGIN
        }

        textAreaPosition = thisObject.container.frame.frameThisPoint(textAreaPosition)
        if (thisObject.visible === true) {
            let checkPosition = {
                x: textAreaPosition.x,
                y: textAreaPosition.y - CURRENT_TOP_MARGIN
            }
            if (thisObject.isVisibleFunction(checkPosition) === false) {
                deactivate()
            }
        }
        if (thisObject.visible === true) {
            let textAreaDiv = document.getElementById('textAreaDiv')
            textAreaDiv.style = 'position:fixed; top:' + textAreaPosition.y + 'px; left:' + textAreaPosition.x + 'px; z-index:1; '
        }
    }

    function drawBackground() {
        if (thisObject.visible === true) {
            let position = {
                x: 0,
                y: 0
            }

            position = thisObject.container.frame.frameThisPoint(position)

            let radius = thisObject.container.frame.radius * SIZE_FACTOR

            if (radius > 0.5) {
                browserCanvasContext.beginPath()
                browserCanvasContext.arc(position.x, position.y, radius  + 3, 0, Math.PI * 2, true)
                browserCanvasContext.closePath()
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + 1 + ')'
                browserCanvasContext.fill()

                browserCanvasContext.beginPath()
                browserCanvasContext.arc(position.x, position.y, radius , 0, Math.PI * 2, true)
                browserCanvasContext.closePath()
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + 1 + ')'
                browserCanvasContext.fill()
            }
        }
    }

    function drawForeground() {
        let iconPosition = {
            x: 0,
            y: thisObject.currentRadius * 1.5
        }

        iconPosition = thisObject.container.frame.frameThisPoint(iconPosition)

        /* Menu  Item */

        if (thisObject.canDrawIcon === true && thisObject.currentRadius > 1) {
            browserCanvasContext.drawImage(thisObject.icon, iconPosition.x - thisObject.currentRadius, iconPosition.y - thisObject.currentRadius, thisObject.currentRadius * 2, thisObject.currentRadius * 2)

            /* Menu Label */

            let label = 'Code looks good!'
            let labelPoint
            let fontSize = 10

            browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

            if (thisObject.currentRadius >= thisObject.targetRadius) {
                labelPoint = {
                    x: iconPosition.x + thisObject.currentRadius + 10,
                    y: iconPosition.y + fontSize * FONT_ASPECT_RATIO
                }

                browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
                browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
            }
        }
    }
}
