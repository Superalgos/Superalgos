
function newPicker() {
    const MODULE_NAME = 'Picker'

    let thisObject = {
        container: undefined,
        selectedItem: 0,
        onParentChanged: onParentChanged,
        getSelected: getSelected,
        setSelected: setSelected,
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
    thisObject.container.isWheelable = true
    thisObject.container.detectMouseOver = true
    thisObject.container.frame.radius = 0
    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0
    thisObject.container.frame.width = 150
    thisObject.container.frame.height = 60

    let isMouseOver
    let optionsList
    let parent
    let current
    let parentSelected = 0
    let propertyName
    let selected = 0
    let lastSelected = 0
    let onMouseWheelEventSubscriptionId
    let onMouseOverEventSubscriptionId
    let onMouseNotOverEventSubscriptionId

    let wheelDeltaDirection
    let wheelDeltaCounter = 0

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)
        thisObject.container.finalize()
        thisObject.container = undefined
        optionsList = undefined
        parent = undefined
        current = undefined
    }

    function initialize(pOptionsList, pCurrent, pParent, pPropertyName) {
        optionsList = pOptionsList
        current = pCurrent
        parent = pParent
        propertyName = pPropertyName
        onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
        onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
        onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
    }

    function onMouseOver(event) {
        isMouseOver = true
    }

    function onMouseNotOver() {
        isMouseOver = false
    }

    function setSelected(pOptionsList, pCurrent, pParent, pSelected) {
        if (pOptionsList !== undefined) {
            optionsList = pOptionsList
        }
        if (pCurrent !== undefined) {
            current = pCurrent
        }
        if (pParent !== undefined) {
            parent = pParent
        }
        if (pSelected !== undefined) {
            selected = pSelected
        }
        raiseEventParentChanged()
    }

    function onParentChanged(event) {
        if (event.parent !== undefined) {
            parent = event.parent
        }
        parentSelected = event.selected

        selected = 0
        let parentKeys

        parentKeys = Object.keys(parent)
        checkPropertyName()

        function checkPropertyName() {
            if (propertyName === undefined) {
                current = parent[parentKeys[parentSelected]]
                checkArray()
            } else {
                current = parent[parentKeys[parentSelected]]
                current = current[propertyName]
                checkArray()
            }
        }

        function checkArray() {
            if (Array.isArray(current) === false) {
                optionsList = Object.keys(current)
            } else {
                optionsList = current
            }
        }

        raiseEventParentChanged()
    }

    function getContainer(point) {
        let container

        if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
            return thisObject.container
        }
    }

    function getSelected() {
        return optionsList[selected]
    }

    function onMouseWheel() {

        if (IS_MAC) {
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
        if (selected < 0) { selected = 0 }
        if (selected > optionsList.length - 1) {
            selected = optionsList.length - 1
        }

        if (selected !== lastSelected) {
            lastSelected = selected
            raiseEventParentChanged()
        }
    }

    function raiseEventParentChanged() {
        let event = {
            selected: selected,
            parent: current,
            propertyName: propertyName
        }
        thisObject.container.eventHandler.raiseEvent('onParentChanged', event)
    }

    function physics() {

    }

    function drawBackground() {

    }

    function drawForeground() {
        const FONT_SIZE = 15
        const VISIBLE_LABELS = 5
        let fontSize
        let fontColor
        let opacity

        for (let i = 0; i < VISIBLE_LABELS; i++) {
            let index = i - 2 + selected
            let label = ''
            if (index >= 0 && index < optionsList.length) {
                label = optionsList[index]
            }
            fontColor = UI_COLOR.LIGHT_GREY
            switch (i) {
                case 0:
                    fontSize = FONT_SIZE - 5
                    opacity = 0.4
                    break
                case 1:
                    fontSize = FONT_SIZE - 3
                    opacity = 0.5
                    break
                case 2:
                    fontSize = FONT_SIZE - 0
                    fontColor = UI_COLOR.BLACK
                    opacity = 1
                    break
                case 3:
                    fontSize = FONT_SIZE - 3
                    opacity = 0.5
                    break
                case 4:
                    fontSize = FONT_SIZE - 5
                    opacity = 0.4
                    break
            }

            if (i === 2 || isMouseOver === true) {
                UI.projects.superalgos.utilities.drawPrint.drawLabel(label, 1 / 2, i / VISIBLE_LABELS, 0, 0, fontSize, thisObject.container, fontColor, undefined, undefined, opacity)
            }
        }
    }
}
