
function newFoundationsCockpitSpace() {
    const MODULE_NAME = 'CockpitSpace'
    const STATUS_TYPES = {
        ALL_GOOD: 1,
        WARNING: 2
    }
    let thisObject = {
        container: undefined,
        status: 'BOTTOM',
        fullscreen: undefined,
        statusTypes: STATUS_TYPES,
        setStatus: setStatus,
        toTop: toTop,
        toBottom: toBottom,
        toMiddle: toMiddle,
        moveUp: moveUp,
        moveDown: moveDown,
        draw: draw,
        physics: physics,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize,
        initializePosition: initializePosition
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.isClickeable = false
    thisObject.container.detectMouseOver = true
    thisObject.container.isDraggeable = true
    thisObject.container.notDraggingOnX = true

    controlsMap = new Map()
    resize()

    let selfMouseClickEventSubscriptionId
    let canvasBrowserResizedEventSubscriptionId

    let statusCounter = 0
    let statusText
    let statusType
    let isInitilized = false

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(canvasBrowserResizedEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fullscreen = undefined
    }

    function initialize() {
        canvasBrowserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)

        thisObject.fullscreen = newFullScreen()
        thisObject.fullscreen.container.connectToParent(thisObject.container)
        thisObject.fullscreen.initialize()
    }

    function initializePosition() {
        thisObject.container.frame.position.x = 0

        let INITIAL_POSITION
        if (UI.projects.foundations.spaces.designSpace.workspace.enabled === true) {
            let localStorage = window.localStorage.getItem(MODULE_NAME)
            if (localStorage !== null) {
                storage = JSON.parse(localStorage)
                thisObject.container.frame.position.y = storage.spacePosition
            } else {
                INITIAL_POSITION = browserCanvas.height - 55
                thisObject.container.frame.position.y = browserCanvas.height * INITIAL_POSITION / 100 - COCKPIT_SPACE_HEIGHT
            }
        } else {
            INITIAL_POSITION = 100
            thisObject.container.frame.position.y = browserCanvas.height * INITIAL_POSITION / 100 - COCKPIT_SPACE_HEIGHT
        }
        isInitilized = true
    }

    function onMouseClick(event) {

    }

    function setStatus(text, counter, type) {
        statusCounter = counter
        statusText = text
        statusType = type
    }

    function resize() {
        thisObject.container.frame.width = browserCanvas.width
        thisObject.container.frame.height = COCKPIT_SPACE_HEIGHT

        switch (thisObject.status) {
            case 'BOTTOM': {
                thisObject.container.frame.position.y = browserCanvas.height - COCKPIT_SPACE_HEIGHT
                break
            }
            case 'TOP': {
                thisObject.container.frame.position.y = TOP_SPACE_HEIGHT
                break
            }
        }
    }

    function toTop() {
        thisObject.container.frame.position.y = TOP_SPACE_HEIGHT
    }

    function toBottom() {
        thisObject.container.frame.position.y = browserCanvas.height - COCKPIT_SPACE_HEIGHT
    }

    function toMiddle() {
        thisObject.container.frame.position.y = browserCanvas.height / 2 - COCKPIT_SPACE_HEIGHT
    }

    function moveUp() {
        thisObject.container.frame.position.y = thisObject.container.frame.position.y - COCKPIT_SPACE_HEIGHT * 2
        if (thisObject.container.frame.position.y < 0) {
            thisObject.container.frame.position.y = 0
        }
    }

    function moveDown() {
        thisObject.container.frame.position.y = thisObject.container.frame.position.y + COCKPIT_SPACE_HEIGHT * 2
        if (thisObject.container.frame.position.y > browserCanvas.height - COCKPIT_SPACE_HEIGHT) {
            thisObject.container.frame.position.y = browserCanvas.height - COCKPIT_SPACE_HEIGHT
        }
    }

    function statusPhysics() {
        statusCounter--
        if (statusCounter < 0) {
            statusCounter = 0
            statusText = undefined
            statusType = undefined

            if (UI.environment.DEMO_MODE === true) {
                statusText = 'You are running Superalgos in DEMO MODE. That means that you will not be able to run or stop tasks. Remember Tutorials were designed for the full version, when you download the software.'
                statusType = STATUS_TYPES.WARNING
            }
        }
    }

    function physics() {
        thisObjectPhysics()
        childrenPhysics()
        statusPhysics()
    }

    function childrenPhysics() {
        thisObject.fullscreen.physics()
    }
    function thisObjectPhysics() {
        if (isInitilized === false) { return }
        /* Check the limits */

        thisObject.status = 'MIDDLE'

        if (UI.projects.foundations.spaces.designSpace.workspace.enabled === true) {
            thisObject.container.isDraggeable = true
        } else {
            thisObject.container.isDraggeable = false
        }

        if (thisObject.container.frame.position.y > browserCanvas.height * 99.5 / 100 - COCKPIT_SPACE_HEIGHT) {
            thisObject.container.frame.position.y = browserCanvas.height - COCKPIT_SPACE_HEIGHT
            thisObject.status = 'BOTTOM'
            UI.projects.foundations.spaces.designSpace.makeInvisible()
            UI.projects.foundations.spaces.floatingSpace.makeInvisible()
        } else {
            UI.projects.foundations.spaces.designSpace.makeVisible()
            UI.projects.foundations.spaces.floatingSpace.makeVisible()
        }

        if (thisObject.container.frame.position.y < browserCanvas.height * 0.5 / 100 + TOP_SPACE_HEIGHT) {
            thisObject.container.frame.position.y = TOP_SPACE_HEIGHT
            thisObject.status = 'TOP'
            UI.projects.foundations.spaces.panelSpace.visible = false
        } else {
            UI.projects.foundations.spaces.panelSpace.visible = true
        }

        COCKPIT_SPACE_POSITION = thisObject.container.frame.position.y
        let storage = {
            spacePosition: COCKPIT_SPACE_POSITION
        }
        window.localStorage.setItem(MODULE_NAME, JSON.stringify(storage))
        if (UI.projects.foundations.spaces.chartingSpace.viewport !== undefined) {
            UI.projects.foundations.spaces.chartingSpace.viewport.resize()
        }
    }

    function getContainer(point) {

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            thisObject.container.space = 'Cockpit Space'
            return thisObject.container
        } else {
            return undefined
        }
    }

    function draw() {
        if (CAN_SPACES_DRAW === false) { return }
        thisObject.container.frame.draw(false, false)

        drawBackground()

        // thisObject.fullscreen.draw()
    }

    function drawBackground() {
        let opacity = 1

        let zeroPoint = {
            x: 0,
            y: 0
        }

        const RED_LINE_HIGHT = 2

        zeroPoint = thisObject.container.frame.frameThisPoint(zeroPoint)

        let barColor = UI_COLOR.DARK_TURQUOISE // default
        let textColor

        if (statusType !== undefined) {
            switch (statusType) {
                case STATUS_TYPES.ALL_GOOD:
                    {
                        barColor = UI_COLOR.PATINATED_TURQUOISE
                        textColor = UI_COLOR.WHITE
                        break
                    }
                case STATUS_TYPES.WARNING:
                    {
                        barColor = UI_COLOR.RED
                        textColor = UI_COLOR.TITANIUM_YELLOW
                        break
                    }
            }
        }

        browserCanvasContext.beginPath()
        browserCanvasContext.rect(zeroPoint.x, zeroPoint.y, thisObject.container.frame.width, thisObject.container.frame.height)
        browserCanvasContext.fillStyle = 'rgba(' + barColor + ', ' + opacity + ')'
        browserCanvasContext.closePath()
        browserCanvasContext.fill()

        browserCanvasContext.beginPath()
        browserCanvasContext.rect(zeroPoint.x, zeroPoint.y, thisObject.container.frame.width, RED_LINE_HIGHT)
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')'
        browserCanvasContext.closePath()
        browserCanvasContext.fill()

        browserCanvasContext.beginPath()
        browserCanvasContext.rect(zeroPoint.x, zeroPoint.y - RED_LINE_HIGHT + thisObject.container.frame.height, thisObject.container.frame.width, RED_LINE_HIGHT)
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')'
        browserCanvasContext.closePath()
        browserCanvasContext.fill()

        if (statusText !== undefined) {
            let position = {
                x: thisObject.container.frame.width / 2,
                y: thisObject.container.frame.height / 2 + 5
            }
            UI.projects.foundations.utilities.drawPrint.printLabel(statusText, undefined, undefined, position.x, position.y, 1, 15, textColor, 'Center', thisObject.container)
        }

        if (UI.projects.foundations.spaces.designSpace !== undefined) {
            if (UI.projects.foundations.spaces.designSpace.workspace.enabled === true && statusText === undefined) {
                arrow()
            }
        }
    }

    function arrow() {
        const X_OFFSET = thisObject.container.frame.width / 2
        const Y_OFFSET = thisObject.container.frame.height / 2
        const HEIGHT = 6
        const WIDTH = 18
        const LINE_WIDTH = 3
        const OPACITY = 1
        let DISTANCE_BETWEEN_ARROWS = 0
        let ARROW_1_DIRECTION = 0
        let ARROW_2_DIRECTION = 0

        switch (thisObject.status) {

            case ('TOP'): {
                ARROW_1_DIRECTION = -1
                ARROW_2_DIRECTION = -1
                DISTANCE_BETWEEN_ARROWS = 6
                break
            }
            case ('MIDDLE'): {
                ARROW_1_DIRECTION = 1
                ARROW_2_DIRECTION = -1
                DISTANCE_BETWEEN_ARROWS = 9
                break
            }
            case ('BOTTOM'): {
                ARROW_1_DIRECTION = 1
                ARROW_2_DIRECTION = 1
                DISTANCE_BETWEEN_ARROWS = 6
                break
            }
        }

        point1 = {
            x: X_OFFSET - WIDTH / 2,
            y: Y_OFFSET + HEIGHT / 2 * ARROW_1_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2
        }

        point2 = {
            x: X_OFFSET,
            y: Y_OFFSET - HEIGHT / 2 * ARROW_1_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2
        }

        point3 = {
            x: X_OFFSET + WIDTH / 2,
            y: Y_OFFSET + HEIGHT / 2 * ARROW_1_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2
        }

        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)
        point3 = thisObject.container.frame.frameThisPoint(point3)

        point4 = {
            x: X_OFFSET - WIDTH / 2,
            y: Y_OFFSET + HEIGHT / 2 * ARROW_2_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2
        }

        point5 = {
            x: X_OFFSET,
            y: Y_OFFSET - HEIGHT / 2 * ARROW_2_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2
        }

        point6 = {
            x: X_OFFSET + WIDTH / 2,
            y: Y_OFFSET + HEIGHT / 2 * ARROW_2_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2
        }

        point4 = thisObject.container.frame.frameThisPoint(point4)
        point5 = thisObject.container.frame.frameThisPoint(point5)
        point6 = thisObject.container.frame.frameThisPoint(point6)

        browserCanvasContext.setLineDash([]) // Resets Line Dash

        browserCanvasContext.beginPath()

        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)

        browserCanvasContext.moveTo(point4.x, point4.y)
        browserCanvasContext.lineTo(point5.x, point5.y)
        browserCanvasContext.lineTo(point6.x, point6.y)

        browserCanvasContext.lineWidth = LINE_WIDTH
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
        browserCanvasContext.stroke()
    }
}
