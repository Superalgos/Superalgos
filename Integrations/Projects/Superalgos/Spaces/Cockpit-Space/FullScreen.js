
function newFullScreen() {
    const MODULE_NAME = 'Fullscreen'

    let thisObject = {
        visible: true,
        container: undefined,
        status: undefined,
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
    thisObject.container.isClickeable = true
    thisObject.container.detectMouseOver = true

    let selfMouseOverEventSubscriptionId
    let selfMouseClickEventSubscriptionId
    let selfMouseNotOverEventSubscriptionId

    let isMouseOver = false
    let counterTillNextState = 0

    let layersToTurnOn = []
    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(selfMouseOverEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfMouseNotOverEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function initialize() {
        thisObject.container.frame.width = 50
        thisObject.container.frame.height = COCKPIT_SPACE_HEIGHT - 12

        selfMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
        selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
        selfMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)

        thisObject.status = 'Ready'
    }

    function getContainer(point, purpose) {
        if (thisObject.visible !== true) { return }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function onMouseOver(point) {
        if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
            isMouseOver = true
        } else {
            isMouseOver = false
        }
    }

    function onMouseNotOver(point) {
        isMouseOver = false
    }

    function onMouseClick(event) {
        if (thisObject.status !== 'On') {
            thisObject.status = 'On'
            goFullscreen()
            CURRENT_TOP_MARGIN = 0
            AT_FULL_SCREEN_MODE = true
        } else {
            thisObject.status = 'Off'
            goOutFullscreen()
            CURRENT_TOP_MARGIN = TOP_MARGIN
            AT_FULL_SCREEN_MODE = false
        }
    }

    function goFullscreen() {
        if (browserCanvas.requestFullscreen) {
            browserCanvas.requestFullscreen()
        } else if (browserCanvas.mozRequestFullScreen) {
            browserCanvas.mozRequestFullScreen()
        } else if (browserCanvas.webkitRequestFullscreen) {
            browserCanvas.webkitRequestFullscreen()
        } else if (browserCanvas.msRequestFullscreen) { browserCanvas.msRequestFullscreen() }
    }

    function goOutFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) { document.msExitFullscreen() }
    }

    function physics() {
        positionPhysics()
    }

    function positionPhysics() {
        thisObject.container.frame.position.x = thisObject.container.parentContainer.frame.width - thisObject.container.frame.width
        thisObject.container.frame.position.y = 6
    }

    function draw() {
        if (thisObject.visible !== true) { return }
        drawBackground()
        drawText()
    }

    function drawBackground() {
        let params = {
            cornerRadius: 3,
            lineWidth: 0.01,
            container: thisObject.container,
            borderColor: UI_COLOR.DARK,
            castShadow: false,
            opacity: 1
        }

        if (isMouseOver === true) {
            params.backgroundColor = UI_COLOR.TURQUOISE
        } else {
            params.backgroundColor = UI_COLOR.DARK_TURQUOISE
        }

        UI.projects.superalgos.utilities.drawPrint.roundedCornersBackground(params)
    }

    function drawText() {
        let fontSize
        let label
        let xOffset
        let yOffset

        const OPACITY = 1

        /* We put the params.VALUE in the middle */

        fontSize = 15

        browserCanvasContext.font = 'bold  ' + fontSize + 'px ' + UI_FONT.PRIMARY
        label = 'FS'

        let labelPoint = {
            x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
            y: thisObject.container.frame.height - 9
        }
        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
    }
}

