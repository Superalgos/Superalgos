
function newUiObjectTitle() {
    const MODULE_NAME = 'UI Object Title'

    let thisObject = {
        fitFunction: undefined,
        isVisibleFunction: undefined,
        allwaysVisible: undefined,
        editMode: undefined,
        container: undefined,
        payload: undefined,
        isDefault: undefined,
        enterEditMode: enterEditMode,
        exitEditMode: exitEditMode,
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

    let selfFocusEventSubscriptionId
    let selfNotFocuskEventSubscriptionId
    let selfMouseClickEventSubscriptionId

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(selfFocusEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfNotFocuskEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined
        thisObject.isVisibleFunction = undefined
        thisObject.fitFunction = undefined
    }

    function initialize(payload) {
        thisObject.payload = payload

        thisObject.allwaysVisible = false // Default value
        let schemaDocument = getSchemaDocument(thisObject.payload.node)
        if (schemaDocument !== undefined) {
            if (schemaDocument.isTitleAllwaysVisible === true) {
                thisObject.allwaysVisible = true
            }
        }

        selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
        selfNotFocuskEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
        selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    }

    function getContainer(point) {
        if (AT_FULL_SCREEN_MODE === true) { return } // Fullscreen mode does not allow INPUT elements

        let container

        if (thisObject.editMode === true) {
            if (point.x === VERY_LARGE_NUMBER) {
                /* The the mouse leaves the canvas, and event of mouse over with a ridiculous coordinate is triggered so that
                anyone can react. In our case, this object has an html input element that is not part of the canvas, so the event is
                triggered. We compensate recognizing this coordinate and returning our container. */
                return thisObject.container
            }
        }
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {
        inheritancePhysics()
        defaultPhysics()
    }

    function defaultPhysics() {
        if (thisObject.payload.title !== 'New ' + thisObject.payload.node.type && thisObject.payload.title !== 'My ' + thisObject.payload.node.type) {
            thisObject.isDefault = false
        } else {
            thisObject.isDefault = true
        }
    }

    function inheritancePhysics() {
        if (thisObject.payload.title === undefined) { return }

        /* It is possible to override the default title by setting the APP SCHEMA property 'title' */
        let schemaDocument = getSchemaDocument(thisObject.payload.node)
        if (schemaDocument.title !== undefined) {
            thisObject.payload.title = ''
            thisObject.payload.node.name = ''
            let separator = ''
            for (let i = 0; i < schemaDocument.title.length; i++) {
                let titleReference = schemaDocument.title[i]
                switch (titleReference) {
                    case 'Use Parent': {
                        let nodeToUse = thisObject.payload.parentNode
                        if (nodeToUse !== undefined && nodeToUse.payload !== undefined) {
                            thisObject.payload.title = thisObject.payload.title + separator + nodeToUse.payload.title
                            thisObject.payload.node.name = thisObject.payload.node.name + separator + nodeToUse.payload.node.name
                        }
                        break
                    }
                    case 'Use Reference Parent': {
                        let nodeToUse = thisObject.payload.node.payload.referenceParent
                        if (nodeToUse !== undefined && nodeToUse.payload !== undefined) {
                            thisObject.payload.title = thisObject.payload.title + separator + nodeToUse.payload.title
                            thisObject.payload.node.name = thisObject.payload.node.name + separator + nodeToUse.payload.node.name
                        }
                        break
                    }
                    case 'Use Reference Parent Type': {
                        let nodeToUse = thisObject.payload.node.payload.referenceParent
                        if (nodeToUse !== undefined && nodeToUse.payload !== undefined) {
                            thisObject.payload.title = thisObject.payload.title + separator + nodeToUse.type
                            thisObject.payload.node.name = thisObject.payload.node.name + separator + nodeToUse.type
                        }
                        break
                    }
                    case 'Use Reference Grandparent': {
                        let nodeToUse = thisObject.payload.node.payload.referenceParent
                        if (nodeToUse !== undefined && nodeToUse.payload !== undefined) {
                            nodeToUse = thisObject.payload.node.payload.referenceParent.payload.referenceParent
                            if (nodeToUse !== undefined) {
                                thisObject.payload.title = thisObject.payload.title + separator + nodeToUse.payload.title
                                thisObject.payload.node.name = thisObject.payload.node.name + separator + nodeToUse.payload.node.name
                            }
                        }
                        break
                    }
                    case 'Use Reference Parent Parent': {
                        let nodeToUse = thisObject.payload.node.payload.referenceParent
                        if (nodeToUse !== undefined && nodeToUse.payload !== undefined) {
                            nodeToUse = thisObject.payload.node.payload.referenceParent.payload.parentNode
                            if (nodeToUse !== undefined && nodeToUse.payload !== undefined) {
                                thisObject.payload.title = thisObject.payload.title + separator + nodeToUse.payload.title
                                thisObject.payload.node.name = thisObject.payload.node.name + separator + nodeToUse.payload.node.name
                            }
                        }
                        break
                    }
                    case 'Use Reference Parent Parent Parent': {
                        let nodeToUse = thisObject.payload.node.payload.referenceParent
                        if (nodeToUse !== undefined && nodeToUse.payload !== undefined) {
                            nodeToUse = thisObject.payload.node.payload.referenceParent.payload.parentNode
                            if (nodeToUse !== undefined && nodeToUse.payload !== undefined) {
                                nodeToUse = thisObject.payload.node.payload.referenceParent.payload.parentNode.payload.parentNode
                                if (nodeToUse !== undefined && nodeToUse.payload !== undefined) {
                                    thisObject.payload.title = thisObject.payload.title + separator + nodeToUse.payload.title
                                    thisObject.payload.node.name = thisObject.payload.node.name + separator + nodeToUse.payload.node.name
                                }
                            }
                        }
                        break
                    }
                    default: {
                        if (titleReference.indexOf('Use Child @') === 0) {
                            let propertyName = titleReference.substring(titleReference.indexOf('@') + 1, titleReference.length)
                            let childNode = thisObject.payload.node[propertyName]
                            if (childNode === undefined) { break }
                            thisObject.payload.title = thisObject.payload.title + separator + childNode.name
                            thisObject.payload.node.name = thisObject.payload.node.name + separator + childNode.name
                        }
                    }
                }
                separator = ' '
            }
        }

        /* The name becomes the title. */
        if (thisObject.payload.node.name !== undefined) {
            thisObject.payload.title = thisObject.payload.node.name
        }

        let title = trimTitle(thisObject.payload.title)

        /* Here we set the dimensions and position of this object */
        const FRAME_HEIGHT = 25
        const Y_OFFSET = -20
        const FRAME_WIDTH = (title.length + 2) / 2 * thisObject.payload.floatingObject.currentFontSize * FONT_ASPECT_RATIO * 1.2 * 2

        if (thisObject.isOnFocus === true) {
            thisObject.container.frame.position.x = 0 - FRAME_WIDTH / 2
            thisObject.container.frame.position.y = 0 - thisObject.container.frame.radius * 1 / 2 - thisObject.payload.floatingObject.currentFontSize * FONT_ASPECT_RATIO + Y_OFFSET - FRAME_HEIGHT
        } else {
            thisObject.container.frame.position.x = 0 - FRAME_WIDTH / 2
            thisObject.container.frame.position.y = 0 - thisObject.payload.floatingObject.currentImageSize / 2 - FRAME_HEIGHT
        }

        thisObject.container.frame.width = FRAME_WIDTH
        thisObject.container.frame.height = FRAME_HEIGHT

        if (thisObject.editMode === true) {
            let inputPosition = {
                x: 0,
                y: 0 + CURRENT_TOP_MARGIN + Y_OFFSET
            }

            inputPosition = thisObject.container.frame.frameThisPoint(inputPosition)

            if (inputPosition.y < CURRENT_TOP_MARGIN) { exitEditMode() }

            let inputDiv = document.getElementById('inputDiv')
            inputDiv.style = 'position:absolute; top:' + inputPosition.y + 'px; left:' + inputPosition.x + 'px; z-index:1; '
        }
    }

    function onFocus() {
        thisObject.isOnFocus = true
    }

    function onNotFocus() {
        thisObject.isOnFocus = false
        exitEditMode()
    }

    function onMouseClick(event) {
        let schemaDocument = getSchemaDocument(thisObject.payload.node)
        if (schemaDocument.title !== undefined) { return }

        let checkPoint = {
            x: 0,
            y: 0
        }
        checkPoint = thisObject.container.frame.frameThisPoint(checkPoint)

        if (thisObject.isVisibleFunction(checkPoint) === true) {
            enterEditMode()
        }
    }

    function exitEditMode() {
        if (thisObject.editMode === true) {
            thisObject.editMode = false
            let input = document.getElementById('input')
            input.style.display = 'none'
            if (input.value.length > 2) {
                thisObject.payload.title = input.value
                thisObject.payload.node.name = input.value
            }
        }
        let inputDiv = document.getElementById('inputDiv')
        inputDiv.style = 'position:absolute; top:' + '-100' + 'px; left:' + '-100' + 'px; z-index:1; '
    }

    function enterEditMode() {
        const WIDTH = thisObject.container.frame.width
        const HEIGHT = thisObject.container.frame.height
        let fontSize = thisObject.payload.floatingObject.currentFontSize

        thisObject.editMode = true
        let input = document.getElementById('input')
        input.value = thisObject.payload.title

        let backgroundColor = '0, 0, 0'
        if (thisObject.payload.uiObject.codeEditor !== undefined) {
            if (thisObject.payload.uiObject.codeEditor.visible === true) {
                backgroundColor = '204, 88, 53'
            }
        }

        input.style = 'resize: none; border: none; outline: none; box-shadow: none; overflow:hidden; font-family: Saira Condensed; font-size: ' + fontSize + 'px; background-color: rgb(' + backgroundColor + ');color:rgb(255, 255, 255); width: ' + WIDTH + 'px; height: ' + HEIGHT + 'px'
        input.style.display = 'block'
        input.focus()
    }

    function draw() {
        if (thisObject.isOnFocus === true || thisObject.allwaysVisible === true || thisObject.isDefault === false) {
            if (thisObject.payload.uiObject.codeEditor !== undefined) {
                if (thisObject.payload.uiObject.codeEditor.visible !== true) {
                    drawTitleBackground()
                }
            } else {
                drawTitleBackground()
            }

            drawText()
        }
    }

    function drawTitleBackground() {
        if (thisObject.editMode !== true) {
            let params = {
                cornerRadius: 3,
                lineWidth: 0.1,
                container: thisObject.container,
                borderColor: UI.projects.superalgos.spaces.floatingSpace.style.backgroundColor,
                backgroundColor: UI.projects.superalgos.spaces.floatingSpace.style.backgroundColor,
                castShadow: false,
                opacity: 0.25
            }

            UI.projects.superalgos.utilities.drawPrint.roundedCornersBackground(params)
        }
    }

    function drawText() {
        if (thisObject.editMode !== true) {
            let radius = thisObject.container.frame.radius
            let labelPoint
            let fontSize = thisObject.payload.floatingObject.currentFontSize
            let label

            browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

            if (radius > 6 && (thisObject.isOnFocus === true || thisObject.allwaysVisible === true || thisObject.isDefault === false)) {
                browserCanvasContext.strokeStyle = thisObject.payload.floatingObject.typeStrokeStyle

                browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

                label = thisObject.payload.title

                if (label !== undefined) {
                    label = trimTitle(label)

                    labelPoint = {
                        x: 0,
                        y: thisObject.container.frame.height * 0.8
                    }

                    labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

                    if (UI.projects.superalgos.spaces.floatingSpace.inMapMode === true) {
                        labelPoint = UI.projects.superalgos.spaces.floatingSpace.transformPointToMap(labelPoint)
                        labelPoint.x = labelPoint.x -  getTextWidth(label) / 2,
                        labelPoint.y = labelPoint.y - 35

                        let schemaDocument = getSchemaDocument(thisObject.payload.node)
                        if (schemaDocument !== undefined) {
                            if (schemaDocument.isHierarchyHead !== true && schemaDocument.isProjectHead !== true) {
                                return
                            }
                        }

                        printMessage(label, labelPoint)
                        return
                    }

                    if (thisObject.payload.uiObject.isOnFocus === true) {
                        printMessage(label, labelPoint)
                        return
                    }

                    /* Split the line into Phrases */    
                    const FRAME_WIDTH = (label.length + 2) / 2 * thisObject.payload.floatingObject.currentFontSize * FONT_ASPECT_RATIO * 1.2 * 2 
                    label = thisObject.payload.title               
                    let phrases = splitTextIntoPhrases(label, 2)
                    let lineSeparator = thisObject.payload.floatingObject.currentFontSize * 1.2
                    
                    for (let i = 0; i < phrases.length; i++) {
                        let phrase = phrases[i]
                        let point = {
                            x: labelPoint.x - getTextWidth(phrase) / 2  + FRAME_WIDTH / 2, 
                            y: labelPoint.y - lineSeparator * (phrases.length - 1 - i)
                        }
                         
                        if (UI.projects.superalgos.spaces.floatingSpace.inMapMode === false) {
                            printMessage(phrase, point)
                        }
                    }
                    function printMessage(text, position) {
                        browserCanvasContext.fillStyle = thisObject.payload.floatingObject.nameStrokeStyle
                        browserCanvasContext.fillText(text, position.x, position.y)
                    }
                }
            }
        }
    }

    function trimTitle(title) {
        if (title === undefined) { return }
        const MAX_LABEL_LENGTH = 35
        if (title.length > MAX_LABEL_LENGTH) {
            title = title.substring(0, MAX_LABEL_LENGTH) + '...'
        }
        return title
    }
}

