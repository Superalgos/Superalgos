
function newUiObjectMessage() {
    const MODULE_NAME = 'UI Object Message'

    let thisObject = {
        fitFunction: undefined,
        isVisibleFunction: undefined,
        allwaysVisible: undefined,
        container: undefined,
        payload: undefined,
        type: undefined,
        text: undefined,
        docs: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false
    thisObject.container.frame.radius = 0

    let selfMouseClickEventSubscriptionId

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined
        thisObject.isVisibleFunction = undefined
        thisObject.fitFunction = undefined
        thisObject.type = undefined
        thisObject.text = undefined
        thisObject.docs = undefined
    }

    function initialize(payload) {
        thisObject.payload = payload

        selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    }

    function getContainer(point) {
        if (thisObject.text === undefined) { return }
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {
        if (thisObject.text === undefined) { return }
        let text = trimMessageText(thisObject.text)

        /* Here we set the dimensions and position of this object */
        const FRAME_HEIGHT = 120
        const FRAME_WIDTH = 300

        thisObject.container.frame.position.x = - FRAME_WIDTH / 2
        thisObject.container.frame.position.y = + 160

        thisObject.container.frame.width = FRAME_WIDTH
        thisObject.container.frame.height = FRAME_HEIGHT
    }

    function onMouseClick(event) {
        if (thisObject.text === undefined) { return }
        let checkPoint = {
            x: 0,
            y: 0
        }
        checkPoint = thisObject.container.frame.frameThisPoint(checkPoint)

        if (thisObject.isVisibleFunction(checkPoint) === true) {
            // Open the docs and navigate.
        }
    }

    function draw() {
        if (thisObject.text === undefined) { return }
        if (thisObject.payload.floatingObject.isOnFocus !== true) { return }

        switch (thisObject.type) {
            case 'Info': {
                drawMessageBackground(UI_COLOR.TURQUOISE)
                drawMessage(thisObject.text, UI_COLOR.TURQUOISE)
                break
            }
            case 'Warning': {
                drawMessageBackground(UI_COLOR.TITANIUM_YELLOW)
                drawMessage(thisObject.text, UI_COLOR.TITANIUM_YELLOW)
                break
            }
            case 'Error': {
                drawMessageBackground(UI_COLOR.RUSTED_RED)
                drawMessage(thisObject.text, UI_COLOR.RUSTED_RED)
                break
            }
        }
    }

    function drawMessageBackground(borderColor) {
        if (thisObject.text === undefined) { return }

        let params = {
            cornerRadius: 5,
            lineWidth: 0.5,
            container: thisObject.container,
            borderColor: borderColor,
            backgroundColor: UI.projects.superalgos.spaces.floatingSpace.style.backgroundColor,
            castShadow: false,
            opacity: 0.75
        }

        UI.projects.superalgos.utilities.drawPrint.roundedCornersBackground(params)

    }

    function drawMessage(message, textColor) {

        if (UI.projects.superalgos.spaces.floatingSpace.inMapMode === true) {
            return
        }

        /* Text Follows */
        let position = {
            x: 0,
            y: 0
        }

        position = thisObject.container.frame.frameThisPoint(position)

        if (UI.projects.superalgos.spaces.floatingSpace.inMapMode === true) {
            position = UI.projects.superalgos.spaces.floatingSpace.transformPointToMap(position)
        }

        let radius = thisObject.payload.floatingObject.container.frame.radius
        /* Label Text */
        let labelPoint
        let fontSize = 20
        let lineSeparator = 25
        let label

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

        if (radius > 6) {
            const IDEAL_LABEL_LENGTH = 80

            label = message  

            if (label !== undefined && label !== null) {
                if (label.length > IDEAL_LABEL_LENGTH) {
                    if (label.length > IDEAL_LABEL_LENGTH * 3) {
                        label = label.substring(0, IDEAL_LABEL_LENGTH * 3) + '...'
                    }
                    fontSize = 15
                }

                /* Split the line into Phrases */
                let phrases = splitTextIntoPhrases(label, 5)
                if (phrases.length === 1) {
                    phrases.push("")
                }
                if (phrases.length === 2) {
                    phrases.push("")
                }

                for (let i = 0; i < phrases.length; i++) {
                    let phrase = phrases[i]
                    labelPoint = {
                        x: position.x - getTextWidth(phrase) / 2 + thisObject.container.frame.width / 2,
                        y: position.y + lineSeparator * (4 - phrases.length + 1 + i) 
                    }
                    printMessage(phrase)
                }

                function printMessage(text) {
                    browserCanvasContext.fillStyle = 'rgba(' + textColor + ', 1)'
                    browserCanvasContext.fillText(text, labelPoint.x, labelPoint.y)
                }
            }
        }
    }

    function trimMessageText(text) {
        if (text === undefined) { return }
        const MAX_LABEL_LENGTH = 35
        if (text.length > MAX_LABEL_LENGTH) {
            text = text.substring(0, MAX_LABEL_LENGTH) + '...'
        }
        return text
    }
}

