
function newAssetalances() {
    const MODULE_NAME = 'Asset Balances'

    let thisObject = {
        visible: true,
        container: undefined,
        paramsArray: undefined,
        setParamsArray: setParamsArray,
        physics: physics,
        draw: draw,
        speedometers: [],
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
        for (let i = 0; i < thisObject.speedometers.length; i++) {
            let speedometer = thisObject.speedometers[i]
            speedometer.finalize()
        }
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.paramsArray = undefined
    }

    function initialize() {
        for (let i = 0; i < 2; i++) {
            let speedometer = newSpeedometer()

            speedometer.initialize()
            speedometer.container.connectToParent(thisObject.container)
            speedometer.container.frame.position.x = thisObject.container.frame.width / 2
            speedometer.container.frame.position.y = thisObject.container.frame.height * (2 + i * 2) / 5
            thisObject.speedometers.push(speedometer)
        }
    }

    function getContainer(point, purpose) {
        if (thisObject.visible !== true) { return }

        let container
        for (let i = 0; i < thisObject.speedometers.length; i++) {
            container = thisObject.speedometers[i].getContainer(point, purpose)
            if (container !== undefined) {
                if (container.isForThisPurpose(purpose)) {
                    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
                        return container
                    }
                }
            }
        }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function setParamsArray(paramsArray) {
        thisObject.paramsArray = paramsArray
        for (let i = 0; i < thisObject.speedometers.length; i++) {
            let speedometer = thisObject.speedometers[i]
            speedometer.params = paramsArray[i]
        }
    }

    function physics() {

    }

    function draw() {
        if (thisObject.visible !== true) { return }

        for (let i = 0; i < thisObject.speedometers.length; i++) {
            let speedometer = thisObject.speedometers[i]
            speedometer.draw()
        }

        drawQuotedAssetalances()
    }

    function drawQuotedAssetalances() {
        if (thisObject.paramsArray === undefined) { return }

        let fontSize
        let label
        let xOffset
        let yOffset

        const OPACITY = 1

        /* We put the params.VALUE in the middle */

        fontSize = 15

        browserCanvasContext.font = 'bold  ' + fontSize + 'px ' + UI_FONT.PRIMARY

        label = 'ASSET BALANCES'

        xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO
        yOffset = -45 + 9

        labelPoint = {
            x: 0 - xOffset + (thisObject.paramsArray[1].LEFT_OFFSET - thisObject.paramsArray[0].LEFT_OFFSET) / 2 + thisObject.paramsArray[0].LEFT_OFFSET - 20,
            y: COCKPIT_SPACE_POSITION - COCKPIT_SPACE_HEIGHT / 2 - yOffset
        }

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
    }
}

