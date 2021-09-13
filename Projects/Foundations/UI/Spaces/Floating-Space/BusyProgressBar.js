
function newBusyProgressBar() {
    const MODULE_NAME = 'Circular Progress Bar'

    let thisObject = {
        container: undefined,
        isDeployed: undefined,
        visible: undefined,
        physics: physics,
        draw: draw,
        finalize: finalize,
        initialize: initialize
    }

    let position
    let addRadius

    let eventSubscriptionHeartbeat

    return thisObject

    function finalize() {
        thisObject.payload = undefined
        thisObject.fitFunction = undefined
    }

    function initialize(pPosition) {
        position = pPosition

        addRadius = 0
    }

    function physics() {
        addRadius = addRadius + 20
    }

    function draw() {
        if (thisObject.visible !== true) { return }

        let visiblePosition = {
            x: position.x,
            y: position.y
        }

        visiblePosition = thisObject.fitFunction(visiblePosition)

        const RADIUS = 10 + addRadius
        let OPACITY = 1

        let initialAngle = 0
        let finalAngle = Math.PI * 2

        browserCanvasContext.beginPath()

        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, RADIUS, initialAngle, finalAngle, false)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)'

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + OPACITY * 2 + ')'
        browserCanvasContext.lineWidth = 15
        browserCanvasContext.setLineDash([3, 4])

        browserCanvasContext.stroke()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([3, 4])
        browserCanvasContext.stroke()

        browserCanvasContext.setLineDash([]) // Resets Line Dash
    }
}

