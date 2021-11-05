
function newListSelector() {
    const MODULE_NAME = 'List Selector'

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
        onMouseClick: onMouseClick,
        raiseEventParentChanged: raiseEventParentChanged,
        onMouseWheel: onMouseWheel,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false
    thisObject.container.isWheelable = true
    thisObject.container.detectMouseOver = true
    thisObject.container.frame.radius = 0
    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0

    let optionsList = {}
    let current
    let icon
    let propertyName
    let lastSelected = 0
    let SIZE_FACTOR = 1.0
    let onMouseWheelEventSubscriptionId
    let selfMouseClickEventSubscriptionId
    let onMouseClickEventSubscriptionId

    const SIZE = 36
    const FONT_SIZE = 24
    const VISIBLE_LABELS = 7
    let selected = Math.ceil(VISIBLE_LABELS / 2) - 1

    let wheelDeltaDirection
    let wheelDeltaCounter = 0

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseClickEventSubscriptionId)
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined
        thisObject.isVisibleFunction = undefined
    }

    function initialize() {
        icon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName( 'Governance', 'user-profile')
        onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
        selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    }

    function deactivate() {
        if (thisObject.payload === undefined) { return }
        if (thisObject.visible === true) {
            thisObject.visible = false
        }
        thisObject.payload.uiObject.container.eventHandler.stopListening(onMouseClickEventSubscriptionId)
        EDITOR_ON_FOCUS = false
    }

    function raiseEventParentChanged() {
        let event = {
            selected: selected,
            parent: current,
            propertyName: propertyName
        }
        thisObject.container.eventHandler.raiseEvent('onParentChanged', event)
    }

    function activate(action, listValues, eventSubscriptionId) {
        thisObject.visible = true
        thisObject.payload = action.node.payload
        thisObject.rawRadius = 8
        thisObject.targetRadius = thisObject.container.frame.radius
        thisObject.currentRadius = 0
        thisObject.payload.uiObject.resetErrorMessage()
        thisObject.payload.uiObject.uiObjectTitle.exitEditMode()

        onMouseClickEventSubscriptionId = eventSubscriptionId

        optionsList = listValues

        EDITOR_ON_FOCUS = true
    }

    function onMouseWheel() {

        if (IS_MAC && Math.abs(event.wheelDelta) < MAC_MOUSE_WHEEL_INFINITE_SCROLL_THRESHOLD) {
            let sensitivity
            if (event.delta < 0) {
                if (event.shiftKey === true) {
                    sensitivity = MAC_SCROLL_SENSITIVITY
                } else {
                    sensitivity = MAC_ZOOM_SENSITIVITY
                }
                if (wheelDeltaDirection === -1) {
                    wheelDeltaCounter++
                    if (wheelDeltaCounter < sensitivity) {
                        return
                    } else {
                        wheelDeltaCounter = 0
                    }
                } else {
                    wheelDeltaCounter = 0
                    wheelDeltaDirection = -1
                    return
                }
            } else {
                if (event.shiftKey === true) {
                    sensitivity = MAC_SCROLL_SENSITIVITY
                } else {
                    sensitivity = MAC_ZOOM_SENSITIVITY
                }
                if (wheelDeltaDirection === 1) {
                    wheelDeltaCounter++
                    if (wheelDeltaCounter < sensitivity) {
                        return
                    } else {
                        wheelDeltaCounter = 0
                    }
                } else {
                    wheelDeltaCounter = 0
                    wheelDeltaDirection = 1
                    return
                }
            }
            event.delta = - event.delta
        }

        selected = selected - event.delta
        if (selected < Math.ceil(VISIBLE_LABELS / 2)) { selected = Math.ceil(VISIBLE_LABELS / 2) - 1 }
        if (selected > optionsList.length - Math.ceil(VISIBLE_LABELS / 2)) { selected = optionsList.length - Math.ceil(VISIBLE_LABELS / 2) }

        if (selected !== lastSelected) {
            lastSelected = selected
            raiseEventParentChanged()
        }
    }

    function onMouseClick(pPoint) {

        let tableStartPosition = {
            x: thisObject.container.frame.radius,
            y: thisObject.container.frame.radius
        }

        tableStartPosition = thisObject.container.frame.frameThisPoint(tableStartPosition)

        let offset = thisObject.container.frame.radius / ( 8 / 5 )
        let listSquare = offset * 2
        let rowHeight = listSquare / VISIBLE_LABELS

        if (pPoint.x >= tableStartPosition.x - offset && pPoint.x <= tableStartPosition.x + offset) {
            for (let i = 0; i < VISIBLE_LABELS; i++) {

                let upperBoundary = (tableStartPosition.y - offset) + (i * rowHeight)
                let lowerBoundary = (tableStartPosition.y - offset) + ((i + 1) * rowHeight)

                if (pPoint.y >= upperBoundary && pPoint.y <= lowerBoundary) {

                    let clickedValue = (i - Math.floor(VISIBLE_LABELS / 2) + selected)

                    let event = {
                        point: pPoint,
                        parent: thisObject,
                        selectedNode: optionsList[clickedValue]
                    }

                    thisObject.payload.uiObject.container.eventHandler.raiseEvent('listSelectorClicked', event)

                    deactivate()
                }
            }
        }
    }

    function getContainer(point) {

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

        thisObject.container.frame.position.x = -thisObject.container.frame.radius
        thisObject.container.frame.position.y = -thisObject.container.frame.radius

        thisObject.container.frame.width = thisObject.container.frame.radius * 2 * SIZE_FACTOR
        thisObject.container.frame.height = thisObject.container.frame.radius * 2 * SIZE_FACTOR


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
                browserCanvasContext.arc(position.x + thisObject.container.frame.radius, position.y + thisObject.container.frame.radius, radius + 3, 0, Math.PI * 2, true)
                browserCanvasContext.closePath()
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + 1 + ')'
                browserCanvasContext.fill()

                browserCanvasContext.beginPath()
                browserCanvasContext.arc(position.x + thisObject.container.frame.radius, position.y + thisObject.container.frame.radius, radius , 0, Math.PI * 2, true)
                browserCanvasContext.closePath()
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.MIDNIGHT_GREEN + ', ' + 1 + ')'
                browserCanvasContext.fill()
            }
        }
    }
    function drawForeground() {

        if (thisObject.visible === true) {

            let fontSize
            let fontColor
            let opacity

            for (let i = 0; i < VISIBLE_LABELS; i++) {

                let index = i - Math.floor(VISIBLE_LABELS / 2) + selected
                let label = ''
                if (index >= 0 && index < optionsList.length) {
                    label = optionsList[index]
                }
                fontColor = UI_COLOR.BLACK
                fontSize = FONT_SIZE
                opacity = 1

                let offset = thisObject.container.frame.radius / ( 8 / 5 )
                let listSquare = offset * 2
                let rowOffset = listSquare * ( i / VISIBLE_LABELS )
                let rowHeight = listSquare / VISIBLE_LABELS

                let rowPosition = {
                    x: thisObject.container.frame.radius,
                    y: (thisObject.container.frame.radius - offset) + rowOffset + (rowHeight / 2)
                }

                rowPosition = thisObject.container.frame.frameThisPoint(rowPosition)

                browserCanvasContext.beginPath()
                browserCanvasContext.moveTo(rowPosition.x - offset, rowPosition.y - rowHeight / 2);
                browserCanvasContext.lineTo(rowPosition.x + offset, rowPosition.y - rowHeight / 2);
                browserCanvasContext.lineTo(rowPosition.x + offset, rowPosition.y + rowHeight / 2);
                browserCanvasContext.lineTo(rowPosition.x - offset, rowPosition.y + rowHeight / 2);
                browserCanvasContext.closePath()
                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.MIDNIGHT_GREEN + ', 1)';
                browserCanvasContext.lineWidth = 3
                browserCanvasContext.stroke()

                if (index % 2) {
                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.OCEAN_GREEN + ', 0.2)';
                } else {
                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.OCEAN_GREEN + ', 0.4)';
                }

                browserCanvasContext.fill();

                let middleValue = Math.floor(VISIBLE_LABELS / 2)

                UI.projects.foundations.utilities.drawPrint.drawIcon(icon, 1 / 2, 1 / 2, - offset + SIZE, (i - middleValue) * rowHeight, SIZE, thisObject.container)
                UI.projects.foundations.utilities.drawPrint.drawLabel(label, 1 / 2, 1 / 2, 0, (SIZE - fontSize) / 2 + (i - middleValue) * rowHeight, fontSize, thisObject.container, fontColor, undefined, undefined, opacity)
            }
        }
    }
}

