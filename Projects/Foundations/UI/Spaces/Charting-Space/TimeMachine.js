/*

Markets are a function of time. When watching them, end users must be positioned at one particular point in time. The system currently allows users
to position themselves at any time they like.

In the future, it will be useful to explore markets and compare them at different times simultaneously. Anticipating that future this module exists.
All the timelineCharts that depend on a datetime are children of this object Time Machine. In the future we will allow users to have more than one Time Machine,
each one with it own timelineCharts, and each one positioned at a specific point in time.

*/

function newTimeMachine() {
    const MODULE_NAME = 'Time Machine'
    const logger = newWebDebugLog()


    let timeFrame = INITIAL_TIME_PERIOD

    let thisObject = {
        container: undefined,
        timeScale: undefined,
        rateScale: undefined,
        timeFrameScale: undefined,
        payload: undefined,
        edgeEditor: undefined,
        onFocus: undefined,
        onKeyPressed: onKeyPressed,
        timelineCharts: [],
        fitFunction: fitFunction,
        physics: physics,
        draw: draw,
        drawBackground: drawBackground,
        drawForeground: drawForeground,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize,
        finalize: finalize
    }

    let timeMachineCoordinateSystem = newCoordinateSystem()
    timeMachineCoordinateSystem.name = 'TIME MACHINE'

    let mouse = {
        position: {
            x: 0,
            y: 0
        }
    }

    let tabAnimation = 0
    let tabAnimationStatus = 'Close'
    let tabAnimationCounter = 0
    let wasOnFocus = false
    let drawScales = false
    let syncWithDesignerLoop = 0
    let timelineChartsMap = new Map()

    let onMouseOverEventSuscriptionId
    let onMouseNotOverEventSuscriptionId
    let timeScaleMouseOverEventSuscriptionId
    let rateScaleMouseOverEventSuscriptionId
    let timeFrameScaleEventSuscriptionId
    let timeFrameScaleMouseOverEventSuscriptionId
    let onScaleChangedEventSubscriptionId

    setupContainer()
    return thisObject

    function setupContainer() {
        thisObject.container = newContainer()
        thisObject.container.initialize(MODULE_NAME)
        thisObject.container.fitFunction = thisObject.fitFunction
        thisObject.container.isDraggeable = false
        thisObject.container.insideViewport = true
        thisObject.container.detectMouseOver = true

        thisObject.container.frame.width = browserCanvas.width / TIME_MACHINE_WIDTH
        thisObject.container.frame.height = (browserCanvas.height - TOP_SPACE_HEIGHT - COCKPIT_SPACE_HEIGHT) / TIME_MACHINE_HEIGHT
    }

    function finalize() {
        timeMachineCoordinateSystem.eventHandler.stopListening(onScaleChangedEventSubscriptionId)

        if (thisObject.timeScale !== undefined) {
            finalizeTimeScale()
        }

        if (thisObject.rateScale !== undefined) {
            finalizeRateScale()
        }

        if (thisObject.timeFrameScale !== undefined) {
            finalizeTimeFrameScale()
        }

        thisObject.container.eventHandler.stopListening(onMouseOverEventSuscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseNotOverEventSuscriptionId)

        for (let i = 0; i < thisObject.timelineCharts.length; i++) {
            let timelineChart = thisObject.timelineCharts[i]
            timelineChart.container.eventHandler.stopListening(timelineChart.onChildrenMouseOverEventSuscriptionId)
            timelineChart.finalize()
        }

        thisObject.timelineCharts = undefined
        thisObject.fitFunction = undefined
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined
        thisObject.edgeEditor = undefined

        mouse = undefined
        timelineChartsMap = undefined

        timeMachineCoordinateSystem.finalize()
        timeMachineCoordinateSystem = undefined
    }

    function finalizeTimeScale() {
        if (thisObject.timeScale === undefined) { return }

        thisObject.timeScale.container.eventHandler.stopListening(timeScaleMouseOverEventSuscriptionId)
        thisObject.timeScale.finalize()
        thisObject.timeScale = undefined
    }

    function finalizeRateScale() {
        if (thisObject.rateScale === undefined) { return }

        thisObject.rateScale.container.eventHandler.stopListening(rateScaleMouseOverEventSuscriptionId)
        thisObject.rateScale.finalize()
        thisObject.rateScale = undefined
    }

    function finalizeTimeFrameScale() {
        if (thisObject.timeFrameScale === undefined) { return }

        thisObject.timeFrameScale.container.eventHandler.stopListening(timeFrameScaleEventSuscriptionId)
        thisObject.timeFrameScale.container.eventHandler.stopListening(timeFrameScaleMouseOverEventSuscriptionId)
        thisObject.timeFrameScale.finalize()
        thisObject.timeFrameScale = undefined
    }

    function initialize(callBackFunction) {
        timeFrame = INITIAL_TIME_PERIOD
        UI.projects.visualScripting.utilities.loadSaveFrame.loadFrame(thisObject.payload, thisObject.container.frame)
        setInitialPosition()
        UI.projects.visualScripting.utilities.loadSaveFrame.saveFrame(thisObject.payload, thisObject.container.frame)

        recalculateCoordinateSystem()
        recalculateCurrentDatetime()

        onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
        onMouseNotOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
        onScaleChangedEventSubscriptionId = timeMachineCoordinateSystem.eventHandler.listenToEvent('Scale Changed', onScaleChanged)

        thisObject.edgeEditor = newEdgeEditor()
        thisObject.edgeEditor.initialize(timeMachineCoordinateSystem)
        thisObject.edgeEditor.container.connectToParent(thisObject.container, true, true, false, true, true, true)

        callBackFunction()
    }

    function setInitialPosition() {

        if (thisObject.container.frame.position.x === 0 && thisObject.container.frame.position.y === 0) {
            let timeMachineIndex = UI.projects.visualScripting.utilities.nodeChildren.findChildIndexAtParentNode(thisObject.payload.node)
            let dashboardIndex = UI.projects.visualScripting.utilities.nodeChildren.findChildIndexAtParentNode(thisObject.payload.parentNode)

            thisObject.container.frame.position.x = thisObject.container.frame.width * timeMachineIndex * 2
            thisObject.container.frame.position.y = thisObject.container.frame.height * dashboardIndex * 2
        }
    }

    function onKeyPressed(event) {

        /*
        We are going to pass this event downstream to see if it belongs to any of the
        chart's scales or time machine's scales. If it does not belong to any
        we will apply it to the edge editor.
        */
        let eventTaken = false
        let point = {
            x: event.x,
            y: event.y
        }
        let container

        if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) {
            container = thisObject.rateScale.getContainer(point)
            if (container !== undefined) {
                eventTaken = true
                thisObject.rateScale.onKeyPressed(event)
            }
        }

        if (thisObject.timeScale !== undefined && thisObject.timeScale.isVisible === true) {
            container = thisObject.timeScale.getContainer(point)
            if (container !== undefined) {
                eventTaken = true
                thisObject.timeScale.onKeyPressed(event)
            }
        }

        if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) {
            container = thisObject.timeFrameScale.getContainer(point)
            if (container !== undefined) {
                eventTaken = true
                thisObject.timeFrameScale.onKeyPressed(event)
            }
        }

        for (let i = 0; i < thisObject.timelineCharts.length; i++) {
            container = thisObject.timelineCharts[i].getContainer(point)
            if (container !== undefined) {
                eventTaken = thisObject.timelineCharts[i].onKeyPressed(event)
            }
        }

        if (eventTaken === false) {
            thisObject.edgeEditor.onKeyPressed(event)
        }
    }

    function onMouseOver(event) {
        drawScales = true

        mouse.position.x = event.x
        mouse.position.y = event.y

        if (thisObject.timeScale !== undefined) {
            thisObject.timeScale.onMouseOverSomeTimeMachineContainer(event)
        }
        if (thisObject.rateScale !== undefined) {
            thisObject.rateScale.onMouseOverSomeTimeMachineContainer(event)
        }
        if (thisObject.timeFrameScale !== undefined) {
            thisObject.timeFrameScale.onMouseOverSomeTimeMachineContainer(event)
        }
    }

    function onMouseNotOver(event) {
        drawScales = false

        if (thisObject.timeScale !== undefined) {
            thisObject.timeScale.visible = false
        }
        if (thisObject.rateScale !== undefined) {
            thisObject.rateScale.visible = false
        }
        if (thisObject.timeFrameScale !== undefined) {
            thisObject.timeFrameScale.visible = false
        }
    }

    function initializeTimeScale() {
        thisObject.timeScale = newTimeScale()
        thisObject.timeScale.fitFunction = thisObject.fitFunction
        thisObject.timeScale.payload = thisObject.payload.node.timeScale.payload

        timeScaleMouseOverEventSuscriptionId = thisObject.timeScale.container.eventHandler.listenToEvent('onMouseOverScale', timeScaleMouseOver)
        thisObject.timeScale.initialize(timeMachineCoordinateSystem, thisObject.container)

        function timeScaleMouseOver(event) {
            thisObject.container.eventHandler.raiseEvent('onMouseOver', event)
        }
    }

    function initializeRateScale() {
        thisObject.rateScale = newRateScale()
        thisObject.rateScale.fitFunction = thisObject.fitFunction
        thisObject.rateScale.payload = thisObject.payload.node.rateScale.payload

        rateScaleMouseOverEventSuscriptionId = thisObject.rateScale.container.eventHandler.listenToEvent('onMouseOverScale', rateScaleMouseOver)
        thisObject.rateScale.initialize(timeMachineCoordinateSystem, thisObject.container, thisObject.container)

        function rateScaleMouseOver(event) {
            thisObject.container.eventHandler.raiseEvent('onMouseOver', event)
        }
    }

    function initializeTimeFrameScale() {
        thisObject.timeFrameScale = newTimeFrameScale()
        thisObject.timeFrameScale.fitFunction = thisObject.fitFunction
        thisObject.timeFrameScale.payload = thisObject.payload.node.timeFrameScale.payload

        timeFrameScaleEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('Time Frame Value Changed', timeFrameScaleValueChanged)
        timeFrameScaleMouseOverEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('onMouseOverScale', timeFrameScaleMouseOver)
        thisObject.timeFrameScale.initialize(thisObject.container)

        function timeFrameScaleValueChanged(event) {
            let currentTimeFrame = timeFrame
            timeFrame = event.timeFrame
            if (timeFrame !== currentTimeFrame) {
                for (let i = 0; i < thisObject.timelineCharts.length; i++) {
                    let timelineChart = thisObject.timelineCharts[i]
                    timelineChart.upstreamTimeFrame = timeFrame
                    if (timelineChart.timeFrameScale === undefined) {
                        timelineChart.setTimeFrame(timeFrame)
                    }
                }
            }
        }
        function timeFrameScaleMouseOver(event) {
            thisObject.container.eventHandler.raiseEvent('onMouseOver', event)
        }
    }

    function getContainer(point, purpose) {
        let container

        if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) {
            container = thisObject.rateScale.getContainer(point, purpose)
            if (container !== undefined) {
                if (container.isForThisPurpose(purpose)) {
                    return container
                } else {
                    if (purpose === GET_CONTAINER_PURPOSE.DRAGGING && container.isClickeable === true) {
                        return container
                    }
                }
            }
        }

        if (thisObject.timeScale !== undefined && thisObject.timeScale.isVisible === true) {
            container = thisObject.timeScale.getContainer(point, purpose)
            if (container !== undefined) {
                if (container.isForThisPurpose(purpose)) {
                    return container
                } else {
                    if (purpose === GET_CONTAINER_PURPOSE.DRAGGING && container.isClickeable === true) {
                        return container
                    }
                }
            }
        }

        if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) {
            container = thisObject.timeFrameScale.getContainer(point, purpose)
            if (container !== undefined) {
                if (container.isForThisPurpose(purpose)) {
                    return container
                }
            }
        }

        for (let i = 0; i < thisObject.timelineCharts.length; i++) {
            container = thisObject.timelineCharts[i].getContainer(point, purpose)
            if (container !== undefined) {
                if (container.isForThisPurpose(purpose)) {
                    if (thisObject.container.frame.isThisPointHere(point) === true) {
                        return container
                    }
                } else {
                    if (purpose === GET_CONTAINER_PURPOSE.DRAGGING && container.isClickeable === true) {
                        if (thisObject.container.frame.isThisPointHere(point) === true) {
                            return container
                        }
                    }
                }
            }
        }

        container = thisObject.edgeEditor.getContainer(point, purpose)
        if (container !== undefined) {
            return container
        } else {
            if (thisObject.container.isForThisPurpose(purpose)) {
                if (thisObject.container.frame.isThisPointHere(point) === true) {
                    return thisObject.container
                }
            }
        }
    }

    function onScaleChanged() {
        recalculateCurrentDatetime()
    }

    function recalculateCurrentDatetime() {
        let center = {
            x: thisObject.container.frame.width / 2,
            y: thisObject.container.frame.height / 2
        }

        datetime = new Date(UI.projects.foundations.utilities.dateRateTransformations.getDateFromPointAtContainer(center, thisObject.container, timeMachineCoordinateSystem))

        for (let i = 0; i < thisObject.timelineCharts.length; i++) {
            let timelineChart = thisObject.timelineCharts[i]
            timelineChart.setDatetime(datetime)
        }
    }

    function fitFunction(point, fullVisible, margin, topMargin, bottomMargin) {
        /* We prevent a point to be out of the container AND out of the Charting Space in general */

        let returnPoint = {
            x: point.x,
            y: point.y
        }

        let upCorner = {
            x: 0,
            y: 0
        }

        let bottonCorner = {
            x: thisObject.container.frame.width,
            y: thisObject.container.frame.height
        }

        upCorner = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(upCorner, thisObject.container)
        bottonCorner = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(bottonCorner, thisObject.container)

        /* Checking against the container limits. */
        if (margin === undefined) { margin = 0 }
        if (topMargin === undefined) { topMargin = 0 }
        if (bottomMargin === undefined) { bottomMargin = 0 }

        if (returnPoint.x - margin < upCorner.x) { returnPoint.x = upCorner.x + margin }
        if (returnPoint.x + margin > bottonCorner.x) { returnPoint.x = bottonCorner.x - margin }
        if (returnPoint.y - margin - topMargin < upCorner.y) { returnPoint.y = upCorner.y + margin + topMargin }
        if (returnPoint.y + margin + bottomMargin > bottonCorner.y) { returnPoint.y = bottonCorner.y - margin - bottomMargin }

        returnPoint = UI.projects.foundations.spaces.chartingSpace.fitFunction(returnPoint, fullVisible)

        return returnPoint
    }

    function physics() {
        thisObject.edgeEditor.physics()
        timeMachineCoordinateSystem.physics()

        UI.projects.visualScripting.utilities.loadSaveFrame.saveFrame(thisObject.payload, thisObject.container.frame)
        if (thisObject.container.frame.isInViewPort()) {
            childrenPhysics()
            syncWithDesigner()
        }
        panelPhysics()
        onFocusPhysics()
        tabAnimationPhysics()
    }

    function tabAnimationPhysics() {
        const MAX_COUNTER_VALUE = 40
        const STEP = 10

        if (wasOnFocus === true && thisObject.onFocus === false) {
            tabAnimationStatus = 'Closing'
        }
        if (wasOnFocus === false && thisObject.onFocus === true) {
            tabAnimationStatus = 'Opening'
        }

        if (tabAnimationStatus === 'Closing') {
            tabAnimationCounter = tabAnimationCounter - STEP
            if (tabAnimationCounter <= 0) {
                tabAnimationCounter = 0
                tabAnimationStatus = 'Closed'
            }
        }
        if (tabAnimationStatus === 'Opening') {
            tabAnimationCounter = tabAnimationCounter + STEP
            if (tabAnimationCounter >= MAX_COUNTER_VALUE) {
                tabAnimationCounter = MAX_COUNTER_VALUE
                tabAnimationStatus = 'Open'
            }
        }
    }

    function onFocusPhysics() {
        wasOnFocus = thisObject.onFocus
        if (thisObject.edgeEditor.isMouseOver === true) {
            thisObject.onFocus = true
        } else {
            thisObject.onFocus = false
        }
    }

    function panelPhysics() {
        if (
            thisObject.container.frame.isInViewPort() &&
            UI.projects.foundations.spaces.chartingSpace.viewport.zoomLevel >= UI.projects.foundations.globals.zoom.ZOOM_OUT_THRESHOLD_FOR_NOT_HIDDING_PANELS) {
            UI.projects.foundations.spaces.panelSpace.unHide(thisObject.payload.node.id, 'Layers Panel')
            UI.projects.foundations.spaces.panelSpace.unHide(thisObject.payload.node.id, 'Plotter Panel')
            return
        }

        if (
            thisObject.container.frame.isCenterInViewPort() &&
            UI.projects.foundations.spaces.chartingSpace.viewport.zoomLevel >= UI.projects.foundations.globals.zoom.ZOOM_OUT_THRESHOLD_FOR_HIDDING_PANELS
        ) {
            UI.projects.foundations.spaces.panelSpace.unHide(thisObject.payload.node.id, 'Layers Panel')
            UI.projects.foundations.spaces.panelSpace.unHide(thisObject.payload.node.id, 'Plotter Panel')
        } else {
            UI.projects.foundations.spaces.panelSpace.hide(thisObject.payload.node.id, 'Layers Panel')
            UI.projects.foundations.spaces.panelSpace.hide(thisObject.payload.node.id, 'Plotter Panel')
        }
    }

    function syncWithDesigner() {
        syncWithDesignerTimelineCharts()
        syncWithDesignerScales()
    }

    function syncWithDesignerScales() {
        if (thisObject.payload.node === undefined) {
            finalizeTimeScale()
            finalizeRateScale()
            finalizeTimeFrameScale()
            return
        }
        if (thisObject.payload.node.timeScale === undefined && thisObject.timeScale !== undefined) {
            finalizeTimeScale()
        }
        if (thisObject.payload.node.timeScale !== undefined && thisObject.timeScale === undefined) {
            initializeTimeScale()
        }
        if (thisObject.payload.node.rateScale === undefined && thisObject.rateScale !== undefined) {
            finalizeRateScale()
        }
        if (thisObject.payload.node.rateScale !== undefined && thisObject.rateScale === undefined) {
            initializeRateScale()
        }
        if (thisObject.payload.node.timeFrameScale === undefined && thisObject.timeFrameScale !== undefined) {
            finalizeTimeFrameScale()
        }
        if (thisObject.payload.node.timeFrameScale !== undefined && thisObject.timeFrameScale === undefined) {
            initializeTimeFrameScale()
        }
    }

    function syncWithDesignerTimelineCharts() {
        syncWithDesignerLoop = syncWithDesignerLoop + 0.00000000001

        for (let j = 0; j < thisObject.payload.node.timelineCharts.length; j++) {
            let node = thisObject.payload.node.timelineCharts[j]
            let timelineChart = timelineChartsMap.get(node.id)
            if (timelineChart === undefined) {
                /* The timeline timelineChart node is new, thus we need to initialize a new timelineChart */
                initializeTimelineChart(node, syncWithDesignerLoop)
            } else {
                /* The time machine already exists, we tag it as existing at the current loop. */
                timelineChart.syncWithDesignerLoop = syncWithDesignerLoop
            }
        }

        /* We check all the timeMachines we have to see if we need to remove any of them */
        for (let i = 0; i < thisObject.timelineCharts.length; i++) {
            let timelineChart = thisObject.timelineCharts[i]
            if (timelineChart.syncWithDesignerLoop < syncWithDesignerLoop) {
                /* Must be removed */
                timelineChart.container.eventHandler.stopListening(timelineChart.onChildrenMouseOverEventSuscriptionId)
                timelineChart.finalize()
                timelineChartsMap.delete(timelineChart.nodeId)
                thisObject.timelineCharts.splice(i, 1)
                /* We remove one at the time */
                return
            }
        }

        function initializeTimelineChart(node, syncWithDesignerLoop) {
            let timelineChart = newTimelineChart()
            timelineChart.syncWithDesignerLoop = syncWithDesignerLoop
            timelineChart.payload = node.payload
            timelineChart.nodeId = node.id
            timelineChartsMap.set(node.id, timelineChart)
            timelineChart.payload.uiObject.setValue('Loading...')

            /* Setting up the new timeline timelineChart. */
            timelineChart.container.connectToParent(thisObject.container, true, true, false, true, true, true, false, false, true)
            timelineChart.container.fitFunction = thisObject.container.fitFunction
            timelineChart.fitFunction = thisObject.fitFunction
            timelineChart.container.frame.width = thisObject.container.frame.width
            timelineChart.container.frame.height = thisObject.container.frame.height
            timelineChart.container.frame.position.x = 0
            timelineChart.container.frame.position.y = 0
            timelineChart.initialize(timeMachineCoordinateSystem, timeFrame)

            /* we will store the event subscription id as a property of the timelineChart, to avoid keeping it an a separate array */
            timelineChart.onChildrenMouseOverEventSuscriptionId = timelineChart.container.eventHandler.listenToEvent('onChildrenMouseOver', onChildrenMouseOver)

            thisObject.timelineCharts.push(timelineChart)
            timelineChart.payload.uiObject.setValue('')

            function onChildrenMouseOver(event) {
                thisObject.container.eventHandler.raiseEvent('onMouseOver', event)
            }
        }
    }

    function childrenPhysics() {
        if (thisObject.timeScale !== undefined) {
            thisObject.timeScale.physics()
        }
        if (thisObject.rateScale !== undefined) {
            thisObject.rateScale.physics()
        }
        if (thisObject.timeFrameScale !== undefined) {
            thisObject.timeFrameScale.physics()
        }

        for (let i = 0; i < thisObject.timelineCharts.length; i++) {
            let timelineChart = thisObject.timelineCharts[i]
            timelineChart.physics()
        }
    }

    function drawBackground() {
        drawChartsBackground()
        if (thisObject.container.frame.isInViewPort()) {
            if (drawScales === true) {
                if (thisObject.timeScale !== undefined && thisObject.timeScale.isVisible === true) { thisObject.timeScale.drawBackground() }
                if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) { thisObject.rateScale.drawBackground() }
            }

            let maxElementsPlotted = 0
            for (let i = 0; i < thisObject.timelineCharts.length; i++) {
                let timelineChart = thisObject.timelineCharts[thisObject.timelineCharts.length - i - 1]
                let elementsPlotted = timelineChart.drawBackground()
                if (elementsPlotted !== undefined) {
                    if (elementsPlotted > maxElementsPlotted) {
                        maxElementsPlotted = elementsPlotted
                    }
                }
            }
            if (thisObject.timeFrameScale !== undefined) {
                thisObject.timeFrameScale.adjustTimeFrame(maxElementsPlotted)
            }
        }
    }

    function drawChartsBackground() {
        UI.projects.foundations.utilities.drawPrint.drawContainerBackground(thisObject.container, UI_COLOR.WHITE, 0.5, thisObject.fitFunction)
    }

    function draw() {
        if (thisObject.payload === undefined) { return }
        if (thisObject.payload.node === undefined) { return }
        if (thisObject.container.frame.isInViewPort()) {
            for (let i = 0; i < thisObject.timelineCharts.length; i++) {
                let timelineChart = thisObject.timelineCharts[thisObject.timelineCharts.length - i - 1]
                timelineChart.draw()
            }

            if (drawScales === true) {
                if (thisObject.timeScale !== undefined && thisObject.timeScale.isVisible === true) { thisObject.timeScale.draw() }
                if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) { thisObject.timeFrameScale.draw() }
                if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) { thisObject.rateScale.draw() }
            }
        } else {
            if (UI.projects.foundations.spaces.chartingSpace.viewport.zoomTargetLevel < UI.projects.foundations.globals.zoom.ZOOM_OUT_THRESHOLD_FOR_DISPLAYING_TIME_MACHINES_ICONIZED) {
                let icon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(thisObject.payload.node.project, thisObject.payload.node.type)
                if (icon !== undefined) {
                    if (icon.canDrawIcon === true) {
                        let imageSize = 40
                        let imagePosition = {
                            x: thisObject.container.frame.width / 2,
                            y: thisObject.container.frame.height / 2
                        }

                        imagePosition = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(imagePosition, thisObject.container)
                        imagePosition = thisObject.fitFunction(imagePosition, true)

                        browserCanvasContext.drawImage(
                            icon,
                            imagePosition.x - imageSize / 2,
                            imagePosition.y - imageSize / 2,
                            imageSize,
                            imageSize)
                    }
                }
            }
        }
    }

    function drawForeground() {
        if (thisObject.container.frame.isInViewPort()) {
            for (let i = 0; i < thisObject.timelineCharts.length; i++) {
                let timelineChart = thisObject.timelineCharts[thisObject.timelineCharts.length - i - 1]
                timelineChart.drawForeground()
            }

            if (drawScales === true) {
                if (thisObject.timeScale !== undefined && thisObject.timeScale.isVisible === true) { thisObject.timeScale.drawForeground() }
                if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) { thisObject.timeFrameScale.drawForeground() }
                if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) { thisObject.rateScale.drawForeground() }
            }

            drawLabel()
            thisObject.edgeEditor.drawForeground()
        }
    }

    function drawLabel() {
        if (thisObject.payload === undefined) { return }
        if (thisObject.payload.node === undefined) { return }
        /* Draw Title Above the Container */
        let position = {
            x: 0,
            y: 0
        }
        let imageSize = 12
        let fontSize = 12
        let opacity = 1
        let icon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(thisObject.payload.node.project, thisObject.payload.node.type)

        position = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(position, thisObject.container)

        let label = thisObject.payload.node.name
        let description = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(thisObject.payload, 'description')

        if (description !== undefined) {
            label = description
        }
        UI.projects.foundations.utilities.drawPrint.printLabel(label, position.x + 20, undefined, undefined, position.y - 10, opacity, fontSize, undefined, 'Left')

        if (icon !== undefined) {
            if (icon.canDrawIcon === true) {
                browserCanvasContext.drawImage(
                    icon, position.x + 5,
                    position.y - 18,
                    imageSize,
                    imageSize)
            }
        }

        imageSize = 13
        fontSize = 15
        let exchangeMarkets = new Map()

        for (let i = 0; i < thisObject.timelineCharts.length; i++) {
            let timelinechart = thisObject.timelineCharts[i]
            if (timelinechart.layerManager !== undefined) {
                let layers = timelinechart.layerManager.layers
                for (let j = 0; j < layers.length; j++) {
                    let layer = layers[j]

                    let exchangeMarket = {
                        exchangeName: layer.exchange.name,
                        marketName: layer.market,
                        exchangeIcon: layer.exchangeIcon,
                        baseAssetIcon: layer.baseAssetIcon,
                        quotedAssetIcon: layer.quotedAssetIcon
                    }
                    exchangeMarkets.set(exchangeMarket.exchangeName + '-' + exchangeMarket.marketName, exchangeMarket)
                }
            }
        }

        drawTab(0, 0, exchangeMarkets.size * tabAnimationCounter, 90, thisObject.container)

        const INTER_EXCHANGE_SPACE = 60
        const INTER_MARKET_SPACE = -100

        if (tabAnimationStatus === 'Open') {
            drawMarketNames()
        }

        function drawMarketNames() {
            exchangeMarkets.forEach((exchangeMarket, i) => {
                browserCanvasContext.save()
                browserCanvasContext.translate(position.x, position.y)
                browserCanvasContext.rotate(-Math.PI / 2)

                let xOffSet = -80

                icon = exchangeMarket.exchangeIcon

                if (icon !== undefined) {
                    if (icon.canDrawIcon === true) {
                        browserCanvasContext.drawImage(
                            icon,
                            -20 + xOffSet,
                            -43,
                            imageSize,
                            imageSize)
                    }
                }

                UI.projects.foundations.utilities.drawPrint.printLabel(exchangeMarket.exchangeName, -5 + xOffSet, undefined, undefined, -30, opacity, fontSize, UI_COLOR.GREY, 'Left')

                position.x = position.x + INTER_EXCHANGE_SPACE

                icon = exchangeMarket.baseAssetIcon
                if (icon !== undefined) {
                    if (icon.canDrawIcon === true) {
                        browserCanvasContext.drawImage(
                            icon,
                            -20 + xOffSet,
                            -22,
                            imageSize,
                            imageSize)
                    }
                }

                UI.projects.foundations.utilities.drawPrint.printLabel(exchangeMarket.marketName, -5 + xOffSet, undefined, undefined, -10, opacity, fontSize, UI_COLOR.GREY, 'Left')

                icon = exchangeMarket.quotedAssetIcon
                if (icon !== undefined) {
                    if (icon.canDrawIcon === true) {
                        browserCanvasContext.drawImage(
                            icon,
                            +50 + xOffSet,
                            -22,
                            imageSize,
                            imageSize)
                    }
                }

                position.x = position.x + INTER_MARKET_SPACE

                browserCanvasContext.restore()
            })
        }

        function drawTab(x, y, width, height, container) {
            const GRADIENT = 0
            const X_OFFSET = -3
            const Y_OFFSET = 13
            const TAB_CORNERS_RADIUS = 5

            let point = {
                x: x,
                y: y
            }
            point = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point, container)

            let point1 = {
                x: point.x + X_OFFSET,
                y: point.y + Y_OFFSET
            }

            let point2 = {
                x: point.x + X_OFFSET,
                y: point.y + height + Y_OFFSET
            }

            let point3 = {
                x: point.x - width + X_OFFSET,
                y: point.y + height - GRADIENT + Y_OFFSET
            }

            let point4 = {
                x: point.x - width + X_OFFSET,
                y: point.y + GRADIENT + Y_OFFSET
            }

            browserCanvasContext.beginPath()
            browserCanvasContext.moveTo(point1.x, point1.y)
            browserCanvasContext.lineTo(point2.x, point2.y)
            browserCanvasContext.lineTo(point3.x, point3.y)
            browserCanvasContext.arc(point3.x, point3.y - TAB_CORNERS_RADIUS, TAB_CORNERS_RADIUS, 0.5 * Math.PI, 1.0 * Math.PI)
            // browserCanvasContext.lineTo(point4.x, point4.y)
            browserCanvasContext.arc(point4.x, point4.y + TAB_CORNERS_RADIUS, TAB_CORNERS_RADIUS, 1.0 * Math.PI, 1.5 * Math.PI)
            browserCanvasContext.closePath()
            browserCanvasContext.lineWidth = 1
            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ''
            browserCanvasContext.stroke()
            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ''
            browserCanvasContext.fill()
        }
    }

    function recalculateCoordinateSystem() {
        let minValue = {
            x: MIN_PLOTABLE_DATE.valueOf(),
            y: 0
        }

        let maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf(),
            y: nextPorwerOf10(MAX_DEFAULT_RATE_SCALE_VALUE) / 4
        }

        timeMachineCoordinateSystem.initialize(
            minValue,
            maxValue,
            thisObject.container.frame.width,
            thisObject.container.frame.height
        )
    }
}
