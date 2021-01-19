function newEdgeEditor() {
    const MODULE_NAME = 'Edge Editor'

    let thisObject = {
        container: undefined,
        fitFunction: undefined,
        isVisible: true,
        isMouseOver: undefined,
        resetAspectRatio: resetAspectRatio,
        onKeyPressed: onKeyPressed,
        physics: physics,
        drawForeground: drawForeground,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    const EDGE_SIZE = 6

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    thisObject.container.isDraggeable = true
    thisObject.container.isClickeable = false
    thisObject.container.isWheelable = false
    thisObject.container.detectMouseOver = true

    let whatHappened
    let whereIsMouseOver = 'outside'

    let coordinateSystem
    let coordinateSystemWhenDragStarted

    let onMouseOverEventSubscriptionId
    let onMouseNotOverEventSubscriptionId
    let onDragStartedEventSubscriptionId

    let mouse = {
        position: {
            x: 0,
            y: 0
        }
    }

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

    let doubleClickCounter = 0

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onDragStartedEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        mouse = undefined
        mouseWhenDragStarted = undefined
        parentFrameWhenDragStarted = undefined

        coordinateSystem = undefined

        if (coordinateSystemWhenDragStarted !== undefined) {
            coordinateSystemWhenDragStarted.finalize()
        }

        coordinateSystemWhenDragStarted = undefined
    }

    function initialize(pCoordinateSystem) {
        coordinateSystem = pCoordinateSystem

        onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
        onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
        onDragStartedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragStarted', onDragStarted)
    }

    function onMouseOver(event) {
        thisObject.isMouseOver = true
        mouse = {
            position: {
                x: event.x,
                y: event.y
            }
        }
    }

    function onMouseNotOver() {
        thisObject.isMouseOver = false
    }

    function resetAspectRatio() {
        /* Resize the Time Machine to match the current screen aspect ration */

        thisObject.container.parentContainer.frame.width = browserCanvas.width / TIME_MACHINE_WIDTH
        thisObject.container.parentContainer.frame.height = (COCKPIT_SPACE_POSITION - TOP_SPACE_HEIGHT) / TIME_MACHINE_HEIGHT
        coordinateSystem.maxHeight = thisObject.container.parentContainer.frame.height
        coordinateSystem.maxWidth = thisObject.container.parentContainer.frame.width
        coordinateSystem.recalculateScale()
        thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
    }

    function onDoubleClick(event) {
        doubleClickCounter = 0
        if (UI.projects.superalgos.spaces.chartingSpace.viewport.zoomLevel === UI.projects.superalgos.globals.zoom.DOUBLE_CLICK_ZOOM_OUT_LEVEL) {
            UI.projects.superalgos.spaces.chartingSpace.viewport.displaceToContainer(thisObject.container.parentContainer)
            UI.projects.superalgos.spaces.chartingSpace.viewport.zoomAtCenter(UI.projects.superalgos.globals.zoom.DOUBLE_CLICK_ZOOM_IN_LEVEL)
            return
        }
        if (UI.projects.superalgos.spaces.chartingSpace.viewport.zoomLevel === UI.projects.superalgos.globals.zoom.DOUBLE_CLICK_ZOOM_IN_LEVEL) {
            UI.projects.superalgos.spaces.chartingSpace.viewport.zoomAtCenter(UI.projects.superalgos.globals.zoom.DOUBLE_CLICK_ZOOM_IN_IN_LEVEL)
            return
        }
    }

    function onDragStarted(event) {
        if (event.buttons === 1) {
            if (doubleClickCounter > 0) {
                onDoubleClick(event)
                return
            } else {
                doubleClickCounter = 50
            }
        }

        mouseWhenDragStarted = {
            position: {
                x: event.x,
                y: event.y
            }
        }

        parentFrameWhenDragStarted = {
            position: {
                x: thisObject.container.parentContainer.frame.position.x,
                y: thisObject.container.parentContainer.frame.position.y
            },
            width: thisObject.container.parentContainer.frame.width,
            height: thisObject.container.parentContainer.frame.height
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

        switch (event.buttons) {
            case 1: {
                whatHappened = 'left mouse button'
                if (event.shiftKey === true) {
                    whatHappened = 'left mouse button + SHIFT'
                }
                break
            }
            case 2: {
                whatHappened = 'right mouse button' // this will never happen as of today
                break
            }
        }
    }

    function onKeyPressed(event, forceExecution) {
        if (forceExecution !== true) {
            if (whereIsMouseOver !== 'center' ) {return}
        }
        
        const STEP = 10

        if (event.shiftKey === false && event.ctrlKey === false && event.code === 'ArrowLeft') {
            onDragStarted(event)
            thisObject.container.frame.position.x = thisObject.container.frame.position.x + STEP
            whatHappened = 'left or right arrow key pressed'
            return
        }

        if (event.shiftKey === false && event.ctrlKey === false && event.code === 'ArrowRight') {
            if (ARE_WE_RECORDING_A_MARKET_PANORAMA === true) {
                if (PANORAMA_WAS_PANNED === false) {
                    PANORAMA_WAS_PANNED = true
                    onDragStarted(event)
                    thisObject.container.frame.position.x = thisObject.container.frame.position.x - STEP * 2
                    whatHappened = 'left or right arrow key pressed'
                }
            } else {
                onDragStarted(event)
                thisObject.container.frame.position.x = thisObject.container.frame.position.x - STEP
                whatHappened = 'left or right arrow key pressed'
            }
            return
        }

        if (event.shiftKey === false && event.ctrlKey === false && event.code === 'ArrowUp') {
            onDragStarted(event)
            thisObject.container.frame.position.y = thisObject.container.frame.position.y + STEP
            whatHappened = 'up or down arrow key pressed'
            return
        }

        if (event.shiftKey === false && event.ctrlKey === false && event.code === 'ArrowDown') {
            onDragStarted(event)
            thisObject.container.frame.position.y = thisObject.container.frame.position.y - STEP
            whatHappened = 'up or down arrow key pressed'
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && (event.key === 'A' || event.key === 'a')) {
            resetAspectRatio()
            return
        }
    }

    function getContainer(event, purpose) {
        if (thisObject.container.frame.isThisPointHere(event, undefined, undefined, -EDGE_SIZE) === true && event.buttons !== 2) {
            let point = {
                x: event.x,
                y: event.y
            }
            point = UI.projects.superalgos.utilities.coordinateTransformations.unTransformThisPoint(point, thisObject.container)

            if (point.x <= 0) {
                whereIsMouseOver = 'left'
                return thisObject.container
            }

            if (point.x >= thisObject.container.frame.width) {
                whereIsMouseOver = 'right'
                return thisObject.container
            }

            if (point.y <= 0) {
                whereIsMouseOver = 'top'
                return thisObject.container
            }

            if (point.y >= thisObject.container.frame.height) {
                whereIsMouseOver = 'bottom'
                return thisObject.container
            }

            whereIsMouseOver = 'center'
            switch (purpose) {
                case GET_CONTAINER_PURPOSE.MOUSE_OVER:
                    return // We will let the Time Machine to handle this situation.
                    break
                case GET_CONTAINER_PURPOSE.DRAGGING:
                    return thisObject.container
                    break
            }
        }
    }

    function physics() {
        draggingPhysics()
        doubleClickPhysics()
    }

    function doubleClickPhysics() {
        doubleClickCounter--
        if (doubleClickCounter < 0) {
            doubleClickCounter = 0
        }
    }

    function draggingPhysics() {
        if (coordinateSystemWhenDragStarted === undefined) { return }
        if (thisObject.container.frame.position.x === 0 && thisObject.container.frame.position.y === 0) { return }

        let mouseNoZoom = UI.projects.superalgos.spaces.chartingSpace.viewport.unTransformThisPoint(mouse.position)
        let mouseWhenDragStartedNoZoom = UI.projects.superalgos.spaces.chartingSpace.viewport.unTransformThisPoint(mouseWhenDragStarted.position)

        let dragVectorWhenDragStarted = {
            x: mouseNoZoom.x - mouseWhenDragStartedNoZoom.x,
            y: mouseNoZoom.y - mouseWhenDragStartedNoZoom.y
        }

        let dragVector = {
            x: thisObject.container.frame.position.x,
            y: thisObject.container.frame.position.y
        }

        thisObject.container.frame.position.x = 0
        thisObject.container.frame.position.y = 0

        const MIN_WIDTH = 200
        const MIN_HEIGHT = 100

        switch (whereIsMouseOver) {
            case 'center': {
                switch (whatHappened) {
                    case 'left mouse button + SHIFT': {
                        /* This is equivalent to drag the whole Time Machine, so we will apply the translation received onto the Time Machine container. */
                        thisObject.container.parentContainer.frame.position.x = parentFrameWhenDragStarted.position.x + dragVectorWhenDragStarted.x
                        thisObject.container.parentContainer.frame.position.y = parentFrameWhenDragStarted.position.y + dragVectorWhenDragStarted.y
                        snapPointToGrid(thisObject.container.parentContainer.frame.position)
                        thisObject.container.parentContainer.eventHandler.raiseEvent('onDisplace')
                        break
                    }
                    case 'left mouse button': {
                        let point = {
                            x: (-dragVectorWhenDragStarted.x),
                            y: (-dragVectorWhenDragStarted.y)
                        }

                        let newMinDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystemWhenDragStarted)
                        let newMaxRate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystemWhenDragStarted)

                        let xDifferenceMaxMin = coordinateSystemWhenDragStarted.max.x - coordinateSystemWhenDragStarted.min.x
                        let yDifferenceMaxMin = coordinateSystemWhenDragStarted.max.y - coordinateSystemWhenDragStarted.min.y
                        coordinateSystem.min.x = newMinDate.valueOf()
                        coordinateSystem.max.x = newMinDate.valueOf() + xDifferenceMaxMin
                        coordinateSystem.min.y = newMaxRate - yDifferenceMaxMin
                        coordinateSystem.max.y = newMaxRate
                        let event = {
                            type: 'center dragged',
                            dragVector: dragVector
                        }
                        coordinateSystem.recalculateScale(event)
                    }
                        break
                    case 'left or right arrow key pressed': {
                        let point = {
                            x: -dragVector.x + thisObject.container.frame.width * coordinateSystem.HORIZONTAL_MARGIN_INVERSE_FACTOR / 2,
                            y: 0
                        }

                        let newMinDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystem)
                        let xDifferenceMaxMin = coordinateSystem.max.x - coordinateSystem.min.x
                        coordinateSystem.min.x = newMinDate.valueOf()
                        coordinateSystem.max.x = newMinDate.valueOf() + xDifferenceMaxMin
                        let event = {
                            type: 'center dragged',
                            dragVector: dragVector
                        }
                        coordinateSystem.recalculateScale(event)
                    }
                        break
                    case 'up or down arrow key pressed': {
                        let point = {
                            x: 0,
                            y: -dragVector.y + thisObject.container.frame.height * coordinateSystem.VERTICAL_MARGIN_INVERSE_FACTOR / 2
                        }

                        let newMaxRate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystem)
                        let yDifferenceMaxMin = coordinateSystem.max.y - coordinateSystem.min.y
                        coordinateSystem.min.y = newMaxRate - yDifferenceMaxMin
                        coordinateSystem.max.y = newMaxRate
                        let event = {
                            type: 'center dragged',
                            dragVector: dragVector
                        }
                        coordinateSystem.recalculateScale(event)
                    }
                        break
                }
                thisObject.container.parentContainer.eventHandler.raiseEvent('onMouseOver', mouse.position)
                break
            }
            case 'top': {
                dragVectorWhenDragStarted.x = 0

                let newHight = parentFrameWhenDragStarted.height - dragVectorWhenDragStarted.y
                if (newHight < MIN_HEIGHT && dragVectorWhenDragStarted.y > 0) {
                    dragVectorWhenDragStarted.y = parentFrameWhenDragStarted.height - MIN_HEIGHT
                }

                thisObject.container.parentContainer.frame.position.y = parentFrameWhenDragStarted.position.y + dragVectorWhenDragStarted.y
                snapPointToGrid(thisObject.container.parentContainer.frame.position)
                thisObject.container.parentContainer.frame.height = parentFrameWhenDragStarted.height + (parentFrameWhenDragStarted.position.y - thisObject.container.parentContainer.frame.position.y)

                let point = {
                    x: 0,
                    y: (thisObject.container.parentContainer.frame.position.y - parentFrameWhenDragStarted.position.y)
                }

                /* This is equivalent to UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtContainer, but as we do not have a container anymore because we already change it, we do it like this. */
                point = coordinateSystemWhenDragStarted.unInverseTransform(point, parentFrameWhenDragStarted.height)
                let newMaxRate = point.y

                switch (whatHappened) {
                    case 'left mouse button': {
                        coordinateSystem.max.y = newMaxRate
                        coordinateSystem.maxHeight = thisObject.container.parentContainer.frame.height
                        let event = {
                            type: 'top dragged',
                            dragVector: dragVector
                        }
                        coordinateSystem.recalculateScale(event)
                        break
                    }
                    case 'left mouse button + SHIFT': {
                        coordinateSystem.maxHeight = thisObject.container.parentContainer.frame.height
                        coordinateSystem.recalculateScale()
                        break
                    }
                }
                thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
                break
            }
            case 'bottom': {
                dragVectorWhenDragStarted.x = 0

                let newHight = dragVectorWhenDragStarted.y + parentFrameWhenDragStarted.height
                if (newHight < MIN_HEIGHT && dragVectorWhenDragStarted.y < 0) {
                    dragVectorWhenDragStarted.y = MIN_HEIGHT - parentFrameWhenDragStarted.height
                }

                let point = {
                    x: 0,
                    y: dragVectorWhenDragStarted.y + parentFrameWhenDragStarted.height + parentFrameWhenDragStarted.position.y
                }
                snapPointToGrid(point)
                point.y = point.y - parentFrameWhenDragStarted.position.y

                thisObject.container.parentContainer.frame.height = point.y

                /* This is equivalent to UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtContainer, but as we do not have a container anymore because we already change it, we do it like this. */
                point = coordinateSystemWhenDragStarted.unInverseTransform(point, parentFrameWhenDragStarted.height)
                let newMinRate = point.y

                switch (whatHappened) {
                    case 'left mouse button': {
                        coordinateSystem.min.y = newMinRate
                        coordinateSystem.maxHeight = thisObject.container.parentContainer.frame.height
                        let event = {
                            type: 'bottom dragged',
                            dragVector: dragVector
                        }
                        coordinateSystem.recalculateScale(event)
                        break
                    }
                    case 'left mouse button + SHIFT': {
                        coordinateSystem.maxHeight = thisObject.container.parentContainer.frame.height
                        coordinateSystem.recalculateScale()
                        break
                    }
                }
                thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
                break
            }
            case 'left': {
                dragVectorWhenDragStarted.y = 0

                let newWidth = parentFrameWhenDragStarted.width - dragVectorWhenDragStarted.x
                if (newWidth < MIN_WIDTH && dragVectorWhenDragStarted.x > 0) {
                    dragVectorWhenDragStarted.x = parentFrameWhenDragStarted.width - MIN_WIDTH
                }

                thisObject.container.parentContainer.frame.position.x = parentFrameWhenDragStarted.position.x + dragVectorWhenDragStarted.x
                snapPointToGrid(thisObject.container.parentContainer.frame.position)
                thisObject.container.parentContainer.frame.width = parentFrameWhenDragStarted.width + (parentFrameWhenDragStarted.position.x - thisObject.container.parentContainer.frame.position.x)

                let point = {
                    x: (thisObject.container.parentContainer.frame.position.x - parentFrameWhenDragStarted.position.x),
                    y: 0
                }

                /* This is equivalent to UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtContainer, but as we do not have a container anymore because we already change it, we do it like this. */
                point = coordinateSystemWhenDragStarted.unInverseTransform(point, parentFrameWhenDragStarted.width)
                let newMinDate = point.x

                switch (whatHappened) {
                    case 'left mouse button': {
                        coordinateSystem.min.x = newMinDate.valueOf()
                        coordinateSystem.maxWidth = thisObject.container.parentContainer.frame.width
                        coordinateSystem.recalculateScale()
                        break
                    }
                    case 'left mouse button + SHIFT': {
                        coordinateSystem.maxWidth = thisObject.container.parentContainer.frame.width
                        coordinateSystem.recalculateScale()
                        break
                    }
                }
                thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
                break
            }
            case 'right': {
                dragVectorWhenDragStarted.y = 0

                let newWidth = dragVectorWhenDragStarted.x + parentFrameWhenDragStarted.width
                if (newWidth < MIN_WIDTH && dragVectorWhenDragStarted.x < 0) {
                    dragVectorWhenDragStarted.x = MIN_WIDTH - parentFrameWhenDragStarted.width
                }

                let point = {
                    x: dragVectorWhenDragStarted.x + parentFrameWhenDragStarted.width + parentFrameWhenDragStarted.position.x,
                    y: 0
                }
                snapPointToGrid(point)
                point.x = point.x - parentFrameWhenDragStarted.position.x

                thisObject.container.parentContainer.frame.width = point.x

                /* This is equivalent to UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtContainer, but as we do not have a container anymore because we already change it, we do it like this. */
                point = coordinateSystemWhenDragStarted.unInverseTransform(point, parentFrameWhenDragStarted.width)
                let newMaxDate = point.x

                switch (whatHappened) {
                    case 'left mouse button': {
                        coordinateSystem.max.x = newMaxDate.valueOf()
                        coordinateSystem.maxWidth = thisObject.container.parentContainer.frame.width
                        coordinateSystem.recalculateScale()
                        break
                    }
                    case 'left mouse button + SHIFT': {
                        coordinateSystem.maxWidth = thisObject.container.parentContainer.frame.width
                        coordinateSystem.recalculateScale()
                        break
                    }
                }
                thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
                break
            }
        }

        function snapPointToGrid(point) {
            point.x = snapScalarToGrid(point.x)
            point.y = snapScalarToGrid(point.y)
        }

        function snapScalarToGrid(scalar) {
            let sign
            if (scalar < 0) {
                sign = -1
            } else {
                sign = 1
            }
            const GRID_SIZE = 10
            return Math.trunc(scalar / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2 * sign
        }
    }

    function drawForeground() {
        let MARGIN = 1
        let edgeSize
        let lineWidth

        if (whereIsMouseOver === 'outside' || thisObject.isMouseOver === false) {
            edgeSize = 2
            lineWidth = 0.1
        } else {
            edgeSize = EDGE_SIZE
            lineWidth = 0.5
        }

        const OPACITY = 1

        pointA1 = {
            x: 0,
            y: 0
        }

        pointA2 = {
            x: thisObject.container.frame.width,
            y: 0
        }

        pointA3 = {
            x: thisObject.container.frame.width,
            y: thisObject.container.frame.height
        }

        pointA4 = {
            x: 0,
            y: thisObject.container.frame.height
        }

        pointB1 = {
            x: 0,
            y: 0
        }

        pointB2 = {
            x: thisObject.container.frame.width,
            y: 0
        }

        pointB3 = {
            x: thisObject.container.frame.width,
            y: thisObject.container.frame.height
        }

        pointB4 = {
            x: 0,
            y: thisObject.container.frame.height
        }

        pointA1 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(pointA1, thisObject.container)
        pointA2 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(pointA2, thisObject.container)
        pointA3 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(pointA3, thisObject.container)
        pointA4 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(pointA4, thisObject.container)

        pointB1 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(pointB1, thisObject.container)
        pointB2 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(pointB2, thisObject.container)
        pointB3 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(pointB3, thisObject.container)
        pointB4 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(pointB4, thisObject.container)

        pointA1 = {
            x: pointA1.x - MARGIN,
            y: pointA1.y - MARGIN
        }

        pointA2 = {
            x: pointA2.x + MARGIN,
            y: pointA2.y - MARGIN
        }

        pointA3 = {
            x: pointA3.x + MARGIN,
            y: pointA3.y + MARGIN
        }

        pointA4 = {
            x: pointA4.x - MARGIN,
            y: pointA4.y + MARGIN
        }

        pointB1 = {
            x: pointB1.x - edgeSize,
            y: pointB1.y - edgeSize
        }

        pointB2 = {
            x: pointB2.x + edgeSize,
            y: pointB2.y - edgeSize
        }

        pointB3 = {
            x: pointB3.x + edgeSize,
            y: pointB3.y + edgeSize
        }

        pointB4 = {
            x: pointB4.x - edgeSize,
            y: pointB4.y + edgeSize
        }

        pointA1 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoViewport(pointA1)
        pointA2 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoViewport(pointA2)
        pointA3 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoViewport(pointA3)
        pointA4 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoViewport(pointA4)

        pointB1 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoViewport(pointB1)
        pointB2 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoViewport(pointB2)
        pointB3 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoViewport(pointB3)
        pointB4 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoViewport(pointB4)

        browserCanvasContext.setLineDash([]) // Resets Line Dash

        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(pointA1.x, pointA1.y)
        browserCanvasContext.lineTo(pointA2.x, pointA2.y)
        browserCanvasContext.lineTo(pointB2.x, pointB2.y)
        browserCanvasContext.lineTo(pointB1.x, pointB1.y)
        browserCanvasContext.lineTo(pointA1.x, pointA1.y)
        browserCanvasContext.closePath()

        drawEdge('top')

        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(pointA2.x, pointA2.y)
        browserCanvasContext.lineTo(pointA3.x, pointA3.y)
        browserCanvasContext.lineTo(pointB3.x, pointB3.y)
        browserCanvasContext.lineTo(pointB2.x, pointB2.y)
        browserCanvasContext.lineTo(pointA2.x, pointA2.y)
        browserCanvasContext.closePath()

        drawEdge('right')

        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(pointA3.x, pointA3.y)
        browserCanvasContext.lineTo(pointA4.x, pointA4.y)
        browserCanvasContext.lineTo(pointB4.x, pointB4.y)
        browserCanvasContext.lineTo(pointB3.x, pointB3.y)
        browserCanvasContext.lineTo(pointA3.x, pointA3.y)
        browserCanvasContext.closePath()

        drawEdge('bottom')

        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(pointA4.x, pointA4.y)
        browserCanvasContext.lineTo(pointA1.x, pointA1.y)
        browserCanvasContext.lineTo(pointB1.x, pointB1.y)
        browserCanvasContext.lineTo(pointB4.x, pointB4.y)
        browserCanvasContext.lineTo(pointA4.x, pointA4.y)
        browserCanvasContext.closePath()

        drawEdge('left')

        function drawEdge(edgeType) {
            if (whereIsMouseOver === edgeType && thisObject.isMouseOver === true) {
                browserCanvasContext.lineWidth = lineWidth
                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + OPACITY + ')'
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
            } else {
                browserCanvasContext.lineWidth = lineWidth
                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + OPACITY + ')'
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + OPACITY + ')'
            }
            browserCanvasContext.fill()
            browserCanvasContext.stroke()
        }
    }
}
