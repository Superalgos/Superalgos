function newRateScale() {
    const MODULE_NAME = 'Right Scale'

    let thisObject = {
        container: undefined,
        rate: undefined,
        fitFunction: undefined,
        payload: undefined,
        minValue: undefined,
        maxValue: undefined,
        isVisible: true,
        layersOn: undefined,
        onKeyPressed: onKeyPressed, 
        onUpstreamScaleChanged: onUpstreamScaleChanged,
        onMouseOverSomeTimeMachineContainer: onMouseOverSomeTimeMachineContainer,
        physics: physics,
        draw: draw,
        drawBackground: drawBackground,
        drawForeground: drawForeground,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    thisObject.container.isDraggeable = false
    thisObject.container.isClickeable = false
    thisObject.container.isWheelable = true
    thisObject.container.detectMouseOver = true

    thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
    thisObject.container.frame.height = 40

    let draggeableContainer = newContainer()
    draggeableContainer.initialize(MODULE_NAME + ' Draggeable')
    draggeableContainer.isDraggeable = true

    let visible = true
    let isMouseOver

    let onMouseWheelEventSubscriptionId
    let onMouseOverEventSubscriptionId
    let onMouseNotOverEventSubscriptionId
    let onScaleChangedEventSubscriptionId
    let onDragStartedEventSubscriptionId

    let coordinateSystem
    let coordinateSystemWhenDragStarted

    let limitingContainer
    let rateCalculationsContainer

    mouseWhenDragStarted = {
        position: {
            x: 0,
            y: 0
        }
    }

    parentFrameWhenDragStarted = {
        position: {
            x: 0,
            y: 0
        },
        width: 0,
        height: 0
    }

    let scaleDisplayTimer = 0
    let autoScaleButton

    let wheelDeltaDirection
    let wheelDeltaCounter = 0

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)
        coordinateSystem.eventHandler.stopListening(onScaleChangedEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onDragStartedEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        thisObject.payload = undefined

        if (coordinateSystemWhenDragStarted !== undefined) {
            coordinateSystemWhenDragStarted.finalize()
        }

        coordinateSystemWhenDragStarted = undefined

        coordinateSystem = undefined
        limitingContainer = undefined
        rateCalculationsContainer = undefined

        mouseWhenDragStarted = undefined
        parentFrameWhenDragStarted = undefined

        autoScaleButton.finalize()
        autoScaleButton = undefined
    }

    function initialize(pCoordinateSystem, pLimitingContainer, pRateCalculationsContainer) {
        coordinateSystem = pCoordinateSystem
        limitingContainer = pLimitingContainer
        rateCalculationsContainer = pRateCalculationsContainer

        thisObject.minValue = coordinateSystem.min.y
        thisObject.maxValue = coordinateSystem.max.y

        onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
        onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
        onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
        onScaleChangedEventSubscriptionId = coordinateSystem.eventHandler.listenToEvent('Scale Changed', onScaleChanged)
        onDragStartedEventSubscriptionId = draggeableContainer.eventHandler.listenToEvent('onDragStarted', onDragStarted)

        autoScaleButton = newAutoScaleButton()
        autoScaleButton.container.connectToParent(thisObject.container)
        autoScaleButton.initialize('Y', coordinateSystem)

        readObjectState()
    }

    function onKeyPressed(event) {
        if (event.code === "ArrowUp") {
            event.delta = 1
            onMouseWheel(event, false)
        }
        if (event.code === "ArrowDown") {
            event.delta = -1
            onMouseWheel(event, false)
        }
        if (event.code === "ArrowLeft") {
            event.delta = 1
            onMouseWheel(event, true)
        }
        if (event.code === "ArrowRight") {
            event.delta = -1
            onMouseWheel(event, true)
        }
    }

    function onMouseOverSomeTimeMachineContainer(event) {
        if (event.containerId === undefined) {
            /* This happens when the mouse over was not at the instance of a certain scale, but anywhere else. */
            visible = true
        } else {
            if (event.containerId === thisObject.container.id) {
                visible = true
            } else {
                visible = false
                turnOnCounter = 0
            }
        }
    }

    function onScaleChanged() {
        saveObjectState()
    }

    function onMouseOver(event) {
        isMouseOver = true
        event.containerId = thisObject.container.id
        thisObject.container.eventHandler.raiseEvent('onMouseOverScale', event)
    }

    function onMouseNotOver() {
        isMouseOver = false
        scaleDisplayTimer = 0
    }

    function onMouseWheel(event, autoScale) {
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
        }

        if (event.shiftKey === true || autoScale === true ) {
            autoScaleButton.container.eventHandler.raiseEvent('onMouseWheel', event)
            return
        }

        let factor
        let morePower = 10
        if (event.buttons === 4) { morePower = 1 } // Mouse wheel pressed.

        if (event.delta < 0) {
            factor = -0.01 * morePower
        } else {
            factor = 0.01 * morePower
        }

        coordinateSystem.zoomY(factor, event, limitingContainer)
        scaleDisplayTimer = 100
    }

    function onDragStarted(event) {
        mouseWhenDragStarted = {
            position: {
                x: event.x,
                y: event.y
            }
        }

        parentFrameWhenDragStarted = {
            position: {
                x: limitingContainer.frame.position.x,
                y: limitingContainer.frame.position.y
            },
            width: limitingContainer.frame.width,
            height: limitingContainer.frame.height
        }

        coordinateSystemWhenDragStarted = newCoordinateSystem()

        let minValue = {
            x: coordinateSystem.min.x,
            y: coordinateSystem.min.y
        }

        let maxValue = {
            x: coordinateSystem.max.x,
            y: coordinateSystem.max.y
        }

        coordinateSystemWhenDragStarted.initialize(minValue, maxValue, coordinateSystem.maxWidth, coordinateSystem.maxHeight)
    }

    function getContainer(point, purpose) {
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            if (purpose === GET_CONTAINER_PURPOSE.DRAGGING) {
                return draggeableContainer
            }

            return thisObject.container
        }
    }

    function saveObjectState() {
        try {
            let config = JSON.parse(thisObject.payload.node.config)
            config.minValue = coordinateSystem.min.y
            config.maxValue = coordinateSystem.max.y
            config.autoMinScale = coordinateSystem.autoMinYScale
            config.autoMaxScale = coordinateSystem.autoMaxYScale
            thisObject.payload.node.config = JSON.stringify(config, null, 4)
        } catch (err) {
            // we ignore errors here since most likely they will be parsing errors.
        }
    }

    function readObjectState() {
        try {
            let config = JSON.parse(thisObject.payload.node.config)

            if (
                (isNaN(config.minValue) || config.minValue === null || config.minValue === undefined) ||
                (isNaN(config.maxValue) || config.maxValue === null || config.maxValue === undefined)
            ) {
                // not using this value
            } else {
                if (
                    thisObject.minValue !== config.minValue ||
                    thisObject.maxValue !== config.maxValue ||
                    coordinateSystem.autoMinYScale !== config.autoMinScale ||
                    coordinateSystem.autoMaxYScale !== config.autoMaxScale
                ) {
                    thisObject.minValue = config.minValue
                    thisObject.maxValue = config.maxValue
                    coordinateSystem.min.y = thisObject.minValue
                    coordinateSystem.max.y = thisObject.maxValue

                    if (config.autoMinScale !== undefined && (config.autoMinScale === true || config.autoMinScale === false) && config.autoMaxScale !== undefined && (config.autoMaxScale === true || config.autoMaxScale === false)) {
                        coordinateSystem.autoMinYScale = config.autoMinScale
                        coordinateSystem.autoMaxYScale = config.autoMaxScale
                        autoScaleButton.setStatus(config.autoMinScale, config.autoMaxScale)
                    }

                    coordinateSystem.recalculateScale()
                }
            }
            saveObjectState() // this overrides any invalid value at the config.
        } catch (err) {
            // we ignore errors here since most likely they will be parsing errors.
        }
    }

    function physics() {
        scaleDisplayTimer--
        readObjectState()
        positioningPhysics()
        draggingPhysics()
    }

    function draggingPhysics() {
        if (coordinateSystemWhenDragStarted === undefined) { return }
        if (draggeableContainer.frame.position.y === 0) { return }

        let mouseNoZoom = UI.projects.superalgos.spaces.chartingSpace.viewport.unTransformThisPoint(canvas.mouse.position)
        let mouseWhenDragStartedNoZoom = UI.projects.superalgos.spaces.chartingSpace.viewport.unTransformThisPoint(mouseWhenDragStarted.position)

        let dragVectorWhenDragStarted = {
            x: 0,
            y: mouseNoZoom.y - mouseWhenDragStartedNoZoom.y
        }

        let dragVector = {
            x: 0,
            y: draggeableContainer.frame.position.y
        }

        draggeableContainer.frame.position.y = 0

        let point = {
            x: 0,
            y: (-dragVectorWhenDragStarted.y)
        }

        let newMaxRate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtContainer(point, limitingContainer, coordinateSystemWhenDragStarted)
        let yDifferenceMaxMin = coordinateSystemWhenDragStarted.max.y - coordinateSystemWhenDragStarted.min.y

        coordinateSystem.min.y = newMaxRate - yDifferenceMaxMin
        coordinateSystem.max.y = newMaxRate
        let event = {
            type: 'center dragged',
            dragVector: dragVector
        }
        coordinateSystem.recalculateScale()
    }

    function onUpstreamScaleChanged(event) {
        if (event === undefined) { return }
        if (event.dragVector.y === 0) { return }
        if (event.type === 'center dragged') {
            let point = {
                x: event.dragVector.x,
                y: -event.dragVector.y
            }
            let newMaxRate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtContainer(point, rateCalculationsContainer, coordinateSystem)
            let yDifferenceMaxMin = coordinateSystem.max.y - coordinateSystem.min.y
            coordinateSystem.min.y = newMaxRate - yDifferenceMaxMin
            coordinateSystem.max.y = newMaxRate

            coordinateSystem.recalculateScale()
        }
        if (event.type === 'top dragged') {
            let point = {
                x: event.dragVector.x,
                y: event.dragVector.y
            }
            let newMaxRate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtContainer(point, rateCalculationsContainer, coordinateSystem)

            coordinateSystem.max.y = newMaxRate
            coordinateSystem.maxHeight = rateCalculationsContainer.frame.height
            coordinateSystem.recalculateScale()
        }
        if (event.type === 'bottom dragged') {
            let point = {
                x: event.dragVector.x,
                y: event.dragVector.y + rateCalculationsContainer.frame.height
            }
            let newMinRate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtContainer(point, rateCalculationsContainer, coordinateSystem)

            coordinateSystem.min.y = newMinRate
            coordinateSystem.maxHeight = rateCalculationsContainer.frame.height
            coordinateSystem.recalculateScale()
        }
    }

    function positioningPhysics() {
        /* Container Limits */

        let upCorner = {
            x: 0,
            y: 0
        }

        let bottonCorner = {
            x: limitingContainer.frame.width,
            y: limitingContainer.frame.height
        }

        upCorner = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(upCorner, limitingContainer)
        bottonCorner = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(bottonCorner, limitingContainer)

        upCorner = limitingContainer.fitFunction(upCorner, true)
        bottonCorner = limitingContainer.fitFunction(bottonCorner, true)

        /* We will check if we need to change the bottom because of being one of many scales of the same type */
        let displaceFactor = 0
        if (thisObject.payload.parentNode === undefined) { return } // This happens when in the process of deleting the scale, timeline chart or time machine.
        if (thisObject.payload.parentNode.type === 'Timeline Chart') {
            if (thisObject.payload.parentNode.payload.parentNode !== undefined) {
                if (thisObject.payload.parentNode.payload.parentNode.rateScale !== undefined) {
                    if (thisObject.payload.parentNode.payload.parentNode.rateScale.payload.isVisible === true) {
                        displaceFactor++
                    }
                }
                for (let i = 0; i < thisObject.payload.parentNode.payload.parentNode.timelineCharts.length; i++) {
                    let timelineChart = thisObject.payload.parentNode.payload.parentNode.timelineCharts[i]
                    if (timelineChart.rateScale !== undefined) {
                        if (thisObject.payload.node.id !== timelineChart.rateScale.id) {
                            if (timelineChart.rateScale.payload.isVisible === true) {
                                displaceFactor++
                            }
                        } else {
                            break
                        }
                    }
                }
            }
        }
        bottonCorner.x = bottonCorner.x - thisObject.container.frame.width * displaceFactor

        /* Mouse Position Rate Calculation */
        let ratePoint = {
            x: 0,
            y: canvas.mouse.position.y
        }

        thisObject.rate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtBrowserCanvas(ratePoint, rateCalculationsContainer, coordinateSystem)

        /* rateScale Positioning */
        ratePoint = {
            x: limitingContainer.frame.width,
            y: 0
        }

        ratePoint = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(ratePoint, limitingContainer.frame.container)
        ratePoint.y = canvas.mouse.position.y - thisObject.container.frame.height / 2 + thisObject.container.frame.height

        /* Checking against the container limits. */
        if (ratePoint.x < upCorner.x) { ratePoint.x = upCorner.x }
        if (ratePoint.x + thisObject.container.frame.width > bottonCorner.x) { ratePoint.x = bottonCorner.x }
        if (ratePoint.y < upCorner.y + thisObject.container.frame.height) { ratePoint.y = upCorner.y + thisObject.container.frame.height }
        if (ratePoint.y > bottonCorner.y) { ratePoint.y = bottonCorner.y }

        thisObject.container.frame.position.y = ratePoint.y - thisObject.container.frame.height
        thisObject.container.frame.position.x = ratePoint.x - thisObject.container.frame.width

        thisObject.isVisible = true
        thisObject.payload.isVisible = true
        if (thisObject.container.frame.position.y + thisObject.container.frame.height * 2 > bottonCorner.y ||
            thisObject.container.frame.position.y - thisObject.container.frame.height * 1 < upCorner.y ||
            thisObject.container.frame.position.x < upCorner.x
        ) {
            thisObject.isVisible = false
            thisObject.payload.isVisible = false
        }
        if (thisObject.layersOn === 0) {
            thisObject.isVisible = false
            thisObject.payload.isVisible = false
        }

        if (UI.projects.superalgos.spaces.chartingSpace.viewport.zoomTargetLevel < UI.projects.superalgos.globals.zoom.ZOOM_OUT_THRESHOLD_FOR_DISPLAYING_SCALES) {
            thisObject.isVisible = false
        }
    }

    function draw() {
        drawScaleBox()
        autoScaleButton.draw()
        if (visible === false) {
            drawScaleDisplayCover(thisObject.container)
        }
    }

    function drawForeground() {
        if (isMouseOver === true) {
            drawScaleBox()
            autoScaleButton.draw()
        }
    }

    function drawBackground() {
        drawScale()
    }

    function drawScale() {
        const SEPARATION = 50
        const NUMBER_OF_LABELS = Math.trunc(UI.projects.superalgos.spaces.chartingSpace.viewport.height / SEPARATION)
        const FONT_SIZE = 15

        for (let i = 0; i <= NUMBER_OF_LABELS; i++) {
            let ratePoint1 = {
                x: 0,
                y: TOP_SPACE_HEIGHT + SEPARATION * (i + 1)
            }
            let ratePoint2 = {
                x: 0,
                y: TOP_SPACE_HEIGHT + SEPARATION * (i + 0)
            }

            let rate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtBrowserCanvas(ratePoint1, rateCalculationsContainer, coordinateSystem)
            let labels = scaleLabels(rate, false)
            let decimalsDisplace = labels[1].length * FONT_SIZE * FONT_ASPECT_RATIO

            let fitPoint1 = thisObject.fitFunction(ratePoint1)
            let fitPoint2 = thisObject.fitFunction(ratePoint2)

            if (fitPoint1.y === ratePoint1.y && fitPoint2.y === ratePoint2.y) {
                UI.projects.superalgos.utilities.drawPrint.drawLabel(labels[1], 1 / 2, 0, 0, 0, FONT_SIZE, thisObject.container, UI_COLOR.GREY, undefined, ratePoint1.y)
                UI.projects.superalgos.utilities.drawPrint.drawLabel(labels[2], 1 / 2, 0, decimalsDisplace, -5, 9, thisObject.container, UI_COLOR.GREY, undefined, ratePoint1.y)
            }
        }
    }

    function drawScaleBox() {
        if (thisObject.rate === undefined) { return }
        if (thisObject.payload === undefined) { return }
        if (thisObject.payload.node === undefined) { return }

        let icon1 = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(thisObject.payload.node.payload.parentNode.project, thisObject.payload.node.payload.parentNode.type)
        let icon2 = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(thisObject.payload.node.project, thisObject.payload.node.type)

        let backgroundColor = UI_COLOR.BLACK
        let labels = scaleLabels(thisObject.rate, true)

        drawScaleDisplay(labels[0], labels[1], labels[2], 0, 0, 0, icon1, icon2, thisObject.container, backgroundColor)
    }

    function scaleLabels(rate, fixDecimals) {
        if (rate < coordinateSystem.min.y) {
            rate = coordinateSystem.min.y
        }
        if (rate > coordinateSystem.max.y) {
            rate = coordinateSystem.max.y
        }

        let label 
        
        if (fixDecimals === true) {
            label = rate.toFixed(10)
        } else {
            label = dynamicDecimals(rate)
        }

        let labelArray = label.split('.')
        let label1 = thisObject.payload.node.payload.parentNode.name
        let label2 = (Math.trunc(rate)).toLocaleString()
        let label3 = labelArray[1]
        if (label3 === undefined) { label3 = '00' }

        if (rate < 1) {
            label2 = label
            label3 = ''
        }

        if (scaleDisplayTimer > 0) {
            label2 = (coordinateSystem.scale.y * 10000).toFixed(2)
            label3 = 'SCALE'
        }

        return [label1, label2, label3]
    }
}
