
function newViewport() {
    const MODULE_NAME = 'Viewport'

    const MIN_ZOOM_LEVEL = 0
    const MAX_ZOOM_LEVEL = 500

    let ANIMATION_INCREMENT = 0.25
    let ANIMATION_STEPS = 5
    let MARGIN_AMOUNT = 40

    let TOP_MARGIN = TOP_SPACE_HEIGHT
    let BOTTOM_MARGIN = COCKPIT_SPACE_HEIGHT + MARGIN_AMOUNT
    let LEFT_MARGIN = 0
    let RIGHT_MARGIN = 0
    let MARGINS = {
        TOP: TOP_MARGIN,
        BOTTOM: BOTTOM_MARGIN,
        LEFT: LEFT_MARGIN,
        RIGHT: RIGHT_MARGIN
    }

    let thisObject = {
        visible: false,
        visibleArea: undefined,
        width: undefined,
        height: undefined,
        eventHandler: undefined,
        zoomTargetLevel: undefined,
        zoomLevel: undefined,
        mousePosition: undefined,
        marginAmount: MARGIN_AMOUNT,
        margins: MARGINS,
        payload: undefined,
        zoomAtCenter: zoomAtCenter,
        changeZoom: changeZoom,
        onMouseWheel: onMouseWheel,
        transformThisPoint: transformThisPoint,
        unTransformThisPoint: unTransformThisPoint,
        isThisPointVisible: isThisPointVisible,
        isThisPointInViewport: isThisPointInViewport,
        fitIntoVisibleArea: fitIntoVisibleArea,
        fitIntoViewport: fitIntoViewport,
        displace: displace,
        displaceToContainer: displaceToContainer,
        physics: physics,
        raiseEvents: raiseEvents,
        resize: resize,
        initialize: initialize,
        finalize: finalize
    }

    let position = {
        x: 0,
        y: 0
    }

    thisObject.mousePosition = {
        x: 0,
        y: 0
    }
    thisObject.eventHandler = newEventHandler()

    /* Initial default value */
    thisObject.zoomLevel = MIN_ZOOM_LEVEL
    thisObject.zoomTargetLevel = Math.round(MIN_ZOOM_LEVEL)
    INITIAL_TIME_PERIOD = recalculatePeriod(thisObject.zoomLevel)

    let overrideMousePositionCounter = 0

    let wheelDeltaDirection
    let wheelDeltaCounter = 0

    return thisObject

    function finalize() {
        thisObject.eventHandler.finalize()
        thisObject.payload = undefined
        thisObject = undefined
    }

    function initialize() {
        if (thisObject.payload !== undefined) {
            /* Read the position from the frame structure */

            let frame = {
                position: {
                    x: 0,
                    y: 0
                }
            }
            UI.projects.visualScripting.utilities.loadSaveFrame.loadFrame(thisObject.payload, frame)
            if (!isNaN(frame.position.x)) {
                position.x = frame.position.x
            }
            if (!isNaN(frame.position.y)) {
                position.y = frame.position.y
            }
        }

        resize()
        readObjectState()
    }

    function resize() {
        TOP_MARGIN = TOP_SPACE_HEIGHT + MARGIN_AMOUNT
        BOTTOM_MARGIN = browserCanvas.height - COCKPIT_SPACE_POSITION + MARGIN_AMOUNT
        LEFT_MARGIN = 0
        RIGHT_MARGIN = 0
        MARGINS = {
            TOP: TOP_MARGIN,
            BOTTOM: BOTTOM_MARGIN,
            LEFT: LEFT_MARGIN,
            RIGHT: RIGHT_MARGIN
        }

        thisObject.visibleArea = {
            topLeft: { x: LEFT_MARGIN, y: TOP_MARGIN },
            topRight: { x: browserCanvas.width - RIGHT_MARGIN, y: TOP_MARGIN },
            bottomRight: { x: browserCanvas.width - RIGHT_MARGIN, y: browserCanvas.height - BOTTOM_MARGIN },
            bottomLeft: { x: LEFT_MARGIN, y: browserCanvas.height - BOTTOM_MARGIN }
        }

        thisObject.width = thisObject.visibleArea.topRight.x - thisObject.visibleArea.topLeft.x
        thisObject.height = thisObject.visibleArea.bottomRight.y - thisObject.visibleArea.topLeft.y

        thisObject.center = {
            x: LEFT_MARGIN + thisObject.width / 2,
            y: TOP_MARGIN + thisObject.height / 2
        }
    }

    function raiseEvents() {
        if (thisObject.visible === false) { return }
        let event = {
            newPosition: position
        }

        thisObject.eventHandler.raiseEvent('Position Changed', event)
    }

    function displaceToContainer(container) {
        let targetPoint = {
            x: -container.frame.position.x - container.frame.width / 2,
            y: -container.frame.position.y - container.frame.height / 2
        }
        position.x = targetPoint.x + browserCanvas.width / 2
        position.y = targetPoint.y + (COCKPIT_SPACE_POSITION - TOP_SPACE_HEIGHT) / 2 + TOP_SPACE_HEIGHT
    }

    function zoomAtCenter(level) {
        thisObject.zoomTargetLevel = Math.round(level)
        overrideMousePositionCounter = 50
        ANIMATION_INCREMENT = 0.5
    }

    function mousePositionPhysics() {
        if (overrideMousePositionCounter > 0) {
            thisObject.mousePosition.x = browserCanvas.width / 2
            thisObject.mousePosition.y = (COCKPIT_SPACE_POSITION - TOP_SPACE_HEIGHT) / 2 + TOP_SPACE_HEIGHT

            overrideMousePositionCounter--
            if (overrideMousePositionCounter < 0) {
                overrideMousePositionCounter = 0
            }
        }
    }

    function physics() {
        if (thisObject.visible === false) { return }
        mousePositionPhysics()
        animationPhysics()
        positioningPhysics()
        readObjectState()
    }

    function positioningPhysics() {
        if (thisObject.visible === false) { return }
        if (thisObject.payload === undefined) { return }
        /* Save the position at the frame level */
        let frame = {}
        frame.position = position
        UI.projects.visualScripting.utilities.loadSaveFrame.saveFrame(thisObject.payload, frame)
    }

    function animationPhysics() {
        if (thisObject.zoomLevel < thisObject.zoomTargetLevel) {
            if (thisObject.zoomTargetLevel - thisObject.zoomLevel < ANIMATION_INCREMENT) {
                ANIMATION_INCREMENT = Math.round(Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel) * 100) / 100
            }
            thisObject.zoomLevel = Math.round((thisObject.zoomLevel + ANIMATION_INCREMENT) * 100) / 100
            changeZoom(thisObject.zoomLevel - ANIMATION_INCREMENT, thisObject.zoomLevel)
        }

        if (thisObject.zoomLevel > thisObject.zoomTargetLevel) {
            if (thisObject.zoomLevel - thisObject.zoomTargetLevel < ANIMATION_INCREMENT) {
                ANIMATION_INCREMENT = Math.round(Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel) * 100) / 100
            }
            thisObject.zoomLevel = Math.round((thisObject.zoomLevel - ANIMATION_INCREMENT) * 100) / 100
            changeZoom(thisObject.zoomLevel + ANIMATION_INCREMENT, thisObject.zoomLevel)
        }
    }

    function onMouseWheel(event) {
        if (thisObject.visible === false) { return }
        if ((event.ctrlKey === true || event.metaKey === true)) { return }
        let morePower = 1

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
        }

        let amount = event.delta
        
        if (event.buttons === 4) { morePower = 2 } // Mouse wheel pressed.
        /* We adjust the sensitivity for Mac Users */

        if (thisObject.zoomTargetLevel > 10) {
            amount = amount * 2
        }
        if (thisObject.zoomTargetLevel > 25) {
            amount = amount * 3
        }
        if (thisObject.zoomTargetLevel > 50) {
            amount = amount * 3.5
        }

        if (thisObject.zoomTargetLevel + amount * morePower > MAX_ZOOM_LEVEL) {
            return false
        }
        if (thisObject.zoomTargetLevel + amount * morePower < MIN_ZOOM_LEVEL) {
            return false
        }
        thisObject.zoomTargetLevel = Math.round(thisObject.zoomTargetLevel + amount * morePower)

        ANIMATION_INCREMENT = Math.round(Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel) / ANIMATION_STEPS * 100) / 100

        let newEvent = {
            newLevel: thisObject.zoomTargetLevel,
            newPosition: position,
            type: undefined,
            shiftKey: event.shiftKey
        }

        if (amount > 0) {
            newEvent.type = 'Zoom In'
        } else {
            newEvent.type = 'Zoom Out'
        }

        thisObject.eventHandler.raiseEvent('Zoom Changed', newEvent)
        return true
    }

    function fitIntoVisibleArea(point) {
        let pointCopy = {
            x: point.x,
            y: point.y
        }

        /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */
        if (pointCopy.x > thisObject.visibleArea.bottomRight.x + 1) {
            pointCopy.x = thisObject.visibleArea.bottomRight.x + 1
        }

        if (pointCopy.x < thisObject.visibleArea.topLeft.x - 1) {
            pointCopy.x = thisObject.visibleArea.topLeft.x - 1
        }

        if (pointCopy.y > thisObject.visibleArea.bottomRight.y + 1) {
            pointCopy.y = thisObject.visibleArea.bottomRight.y + 1
        }

        if (pointCopy.y < thisObject.visibleArea.topLeft.y - 1) {
            pointCopy.y = thisObject.visibleArea.topLeft.y - 1
        }

        return pointCopy
    }

    function fitIntoViewport(point) {
        let pointCopy = {
            x: point.x,
            y: point.y
        }
        if (pointCopy.y > COCKPIT_SPACE_POSITION) {
            pointCopy.y = COCKPIT_SPACE_POSITION
        }
        return pointCopy
    }

    function displace(displaceVector, recalculate) {
        if (thisObject.visible === false) { return }
        position.x = position.x + displaceVector.x
        position.y = position.y + displaceVector.y

        saveObjectState()

        let event = {
            newPosition: position,
            recalculate: recalculate
        }

        thisObject.eventHandler.raiseEvent('Position Changed', event)
    }

    function changeZoom(oldLevel, newLevel) {
        if (thisObject.visible === false) { return }
        let oldMouse = unTransformThisPoint(thisObject.mousePosition, oldLevel)
        let newMouse = transformThisPoint(oldMouse, newLevel)

        position.x = position.x - newMouse.x + thisObject.mousePosition.x
        position.y = position.y - newMouse.y + thisObject.mousePosition.y

        saveObjectState()

        thisObject.eventHandler.raiseEvent('Zoom Changed')
    }

    function transformThisPoint(point, level) {
        if (thisObject.visible === false) { return }
        let transformedPoint = {
            x: 0,
            y: 0
        }

        if (level === undefined) {
            transformedPoint.x = point.x * (1 + thisObject.zoomLevel) + position.x
            transformedPoint.y = point.y * (1 + thisObject.zoomLevel) + position.y
        } else {
            transformedPoint.x = point.x * (1 + level) + position.x
            transformedPoint.y = point.y * (1 + level) + position.y
        }

        return transformedPoint
    }

    function unTransformThisPoint(point, level) {
        let pointWithoutZoom = {
            x: 0,
            y: 0
        }
        if (level === undefined) {
            pointWithoutZoom.x = (point.x - position.x) / (1 + thisObject.zoomLevel)
            pointWithoutZoom.y = (point.y - position.y) / (1 + thisObject.zoomLevel)
        } else {
            pointWithoutZoom.x = (point.x - position.x) / (1 + level)
            pointWithoutZoom.y = (point.y - position.y) / (1 + level)
        }

        return pointWithoutZoom
    }

    function isThisPointVisible(point) {
        if (thisObject.visible === false) { return }
        if (point.x < thisObject.visibleArea.topLeft.x || point.x > thisObject.visibleArea.bottomRight.x || point.y < thisObject.visibleArea.topLeft.y || point.y > thisObject.visibleArea.bottomRight.y) {
            return false
        } else {
            return true
        }
    }

    function isThisPointInViewport(point) {
        if (thisObject.visible === false) { return }
        if (point.y > COCKPIT_SPACE_POSITION) {
            return false
        } else {
            return true
        }
    }

    function saveObjectState() {
        if (thisObject.payload === undefined) { return }

        /* Save the zoom at the node config, so that the user can change it if he wishes to. */
        try {
            let config = JSON.parse(thisObject.payload.node.config)
            config.zoom = (thisObject.zoomTargetLevel - MIN_ZOOM_LEVEL) / (MAX_ZOOM_LEVEL - MIN_ZOOM_LEVEL) * 100
            config.zoom = config.zoom.toFixed(2)
            thisObject.payload.node.config = JSON.stringify(config)
        } catch (err) {
            // we ignore errors here since most likely they will be parsing errors.
        }
    }

    function readObjectState() {
        if (thisObject.payload === undefined) { return }

        /* Read the zoom level from the node config */
        try {
            let config = JSON.parse(thisObject.payload.node.config)

            if (isNaN(config.zoom) || config.zoom === null || config.zoom === undefined) {
                saveObjectState()
                return
            }
            config.zoom = config.zoom / 100 * (MAX_ZOOM_LEVEL - MIN_ZOOM_LEVEL) + MIN_ZOOM_LEVEL
            if (config.zoom < MIN_ZOOM_LEVEL) { config.zoom = MIN_ZOOM_LEVEL }
            if (config.zoom > MAX_ZOOM_LEVEL) { config.zoom = MAX_ZOOM_LEVEL }

            if (config.zoom.toFixed(2) !== thisObject.zoomTargetLevel.toFixed(2)) {
                newZoomLevel(config.zoom)
            } else {
                saveObjectState()
            }
        } catch (err) {
            // we ignore errors here since most likely they will be parsing errors.
        }

        function newZoomLevel(level) {
            thisObject.zoomLevel = Math.round(level)
            thisObject.zoomTargetLevel = Math.round(level)
            INITIAL_TIME_PERIOD = recalculatePeriod(level)
            saveObjectState()
            ANIMATION_INCREMENT = 0

            let event = {
                newLevel: thisObject.zoomTargetLevel,
                newPosition: position,
                type: undefined
            }
            thisObject.eventHandler.raiseEvent('Zoom Changed', event)
            return true
        }
    }
}
