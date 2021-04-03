function newTimelineChart() {
    const MODULE_NAME = 'Timeline Chart'

    let logger = newWebDebugLog()


    let timeFrame = INITIAL_TIME_PERIOD
    let datetime = NEW_SESSION_INITIAL_DATE

    let thisObject = {
        container: undefined,
        fitFunction: undefined,
        rateScale: undefined,
        timeFrameScale: undefined,
        payload: undefined,
        layerManager: undefined,
        plotterManager: undefined,
        upstreamTimeFrame: undefined,
        onKeyPressed: onKeyPressed,
        setDatetime: setDatetime,
        setTimeFrame: setTimeFrame,
        physics: physics,
        draw: draw,
        drawBackground: drawBackground,
        drawForeground: drawForeground,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    let timeMachineCoordinateSystem
    let timelineChartCoordinateSystem = newCoordinateSystem()
    timelineChartCoordinateSystem.name = 'TIMELINE CHART'

    let coordinateSystem

    let layersPanel
    let layersPanelHandle

    let onMouseOverEventSuscriptionId
    let onMouseNotOverEventSuscriptionId
    let rateScaleUpstreamEventSuscriptionId
    let rateScaleMouseOverEventSuscriptionId
    let timeFrameScaleEventSuscriptionId
    let timeFrameScaleMouseOverEventSuscriptionId
    let scaleChangedEventSubscriptionId

    let drawScales = false
    let mouse = {
        position: {
            x: 0,
            y: 0
        }
    }

    setupContainer()
    return thisObject

    function setupContainer() {
        thisObject.container = newContainer()
        thisObject.container.initialize(MODULE_NAME)
        thisObject.container.detectMouseOver = true
    }

    function finalize() {
        timeMachineCoordinateSystem.eventHandler.stopListening(scaleChangedEventSubscriptionId)

        if (thisObject.layerManager !== undefined) {
            finalizeLayerManager()
        }

        if (thisObject.rateScale !== undefined) {
            finalizeRateScale()
        }

        if (thisObject.timeFrameScale !== undefined) {
            finalizeTimeFrameScale()
        }

        thisObject.container.eventHandler.stopListening(onMouseOverEventSuscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseNotOverEventSuscriptionId)
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined

        mouse = undefined
        logger = undefined

        timeMachineCoordinateSystem = undefined
        timelineChartCoordinateSystem.finalize()
        timelineChartCoordinateSystem = undefined
        coordinateSystem = undefined
        layersPanel = undefined
        layersPanelHandle = undefined
    }

    function finalizeLayerManager() {
        if (thisObject.plotterManager !== undefined) {
            thisObject.plotterManager.finalize()
        }
        thisObject.plotterManager = undefined
        thisObject.layerManager = undefined

        UI.projects.superalgos.spaces.panelSpace.destroyPanel(layersPanelHandle)
    }

    function finalizeTimeFrameScale() {
        if (thisObject.timeFrameScale === undefined) { return }

        thisObject.timeFrameScale.container.eventHandler.stopListening(timeFrameScaleEventSuscriptionId)
        thisObject.timeFrameScale.container.eventHandler.stopListening(timeFrameScaleMouseOverEventSuscriptionId)
        thisObject.timeFrameScale.finalize()
        thisObject.timeFrameScale = undefined
        if (thisObject.upstreamTimeFrame !== undefined) {
            timeFrame = thisObject.upstreamTimeFrame
            if (thisObject.plotterManager !== undefined) {
                thisObject.plotterManager.setTimeFrame(timeFrame)
            }
        }
    }

    function finalizeRateScale() {
        if (thisObject.rateScale === undefined) { return }

        thisObject.rateScale.container.eventHandler.stopListening(rateScaleMouseOverEventSuscriptionId)
        thisObject.container.parentContainer.eventHandler.stopListening(rateScaleUpstreamEventSuscriptionId)
        thisObject.rateScale.finalize()
        thisObject.rateScale = undefined

        /* Resets the local container with the dimessions of its parent, the Time Machine */
        thisObject.container.frame.position.x = 0
        thisObject.container.frame.position.y = 0
        thisObject.container.frame.height = thisObject.container.parentContainer.frame.height
        thisObject.container.frame.width = thisObject.container.parentContainer.frame.width
    }

    function initialize(pTimeMachineCoordinateSystem, pTimeFrame) {
        /* We load the logow we will need for the background. */

        timeMachineCoordinateSystem = pTimeMachineCoordinateSystem
        coordinateSystem = timeMachineCoordinateSystem
        initializeCoordinateSystem()

        timeFrame = pTimeFrame

        onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
        onMouseNotOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
        scaleChangedEventSubscriptionId = timeMachineCoordinateSystem.eventHandler.listenToEvent('Scale Changed', onScaleChanged)
    }

    function initializeCoordinateSystem() {
        let minValue = {
            x: timeMachineCoordinateSystem.min.x,
            y: 0
        }

        let maxValue = {
            x: timeMachineCoordinateSystem.max.x,
            y: nextPorwerOf10(MAX_DEFAULT_RATE_SCALE_VALUE) / 4
        }

        if (thisObject.rateScale !== undefined) {
            minValue.y = thisObject.rateScale.minValue
            maxValue.y = thisObject.rateScale.maxValue
        }

        timelineChartCoordinateSystem.initialize(
            minValue,
            maxValue,
            thisObject.container.frame.width,
            thisObject.container.frame.heigh
        )
    }

    function initializeLayerManager() {
        let owner = thisObject.payload.node.payload.parentNode.id // The real owner is the Time Machine
        layersPanelHandle = UI.projects.superalgos.spaces.panelSpace.createNewPanel('Layers Panel', undefined, owner)
        thisObject.layerManager = UI.projects.superalgos.spaces.panelSpace.getPanel(layersPanelHandle)
        thisObject.layerManager.payload = thisObject.payload.node.layerManager.payload
        thisObject.layerManager.initialize()

        /* Initialize the Plotter Manager */
        thisObject.plotterManager = newPlottersManager()

        thisObject.plotterManager.container.connectToParent(thisObject.container, true, true, false, true, true, true, false, false, true)

        thisObject.plotterManager.container.frame.position.x = 0
        thisObject.plotterManager.container.frame.position.y = 0

        thisObject.plotterManager.fitFunction = thisObject.fitFunction
        thisObject.plotterManager.payload = thisObject.payload
        thisObject.plotterManager.initialize(thisObject.layerManager)
        thisObject.plotterManager.setTimeFrame(timeFrame)
        thisObject.plotterManager.setDatetime(datetime)
        thisObject.plotterManager.setCoordinateSystem(coordinateSystem)
    }

    function initializeRateScale() {
        thisObject.rateScale = newRateScale()
        thisObject.rateScale.fitFunction = thisObject.fitFunction
        thisObject.rateScale.payload = thisObject.payload.node.rateScale.payload

        rateScaleMouseOverEventSuscriptionId = thisObject.rateScale.container.eventHandler.listenToEvent('onMouseOverScale', rateScaleMouseOver)
        thisObject.rateScale.initialize(timelineChartCoordinateSystem, thisObject.container.parentContainer, thisObject.container)

        function rateScaleMouseOver(event) {
            thisObject.container.eventHandler.raiseEvent('onChildrenMouseOver', event)
        }
    }

    function initializeTimeFrameScale() {
        thisObject.timeFrameScale = newTimeFrameScale()
        thisObject.timeFrameScale.fitFunction = thisObject.fitFunction
        thisObject.timeFrameScale.payload = thisObject.payload.node.timeFrameScale.payload

        timeFrameScaleEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('Time Frame Value Changed', timeFrameScaleValueChanged)
        timeFrameScaleMouseOverEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('onMouseOverScale', timeFrameScaleMouseOver)
        thisObject.timeFrameScale.initialize(thisObject.container.parentContainer)

        function timeFrameScaleValueChanged(event) {
            let currentTimeFrame = timeFrame
            timeFrame = event.timeFrame
            if (timeFrame !== currentTimeFrame) {
                if (thisObject.plotterManager !== undefined) {
                    thisObject.plotterManager.setTimeFrame(timeFrame)
                }
            }
        }

        function timeFrameScaleMouseOver(event) {
            thisObject.container.eventHandler.raiseEvent('onChildrenMouseOver', event)
        }
    }

    function onKeyPressed(event) {

        /*
        We are going to pass this event to the scales and if they take it return true.
        */

        let point = {
            x: event.x,
            y: event.y
        }
        let container

        if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) {
            container = thisObject.rateScale.getContainer(point)
            if (container !== undefined) {
                thisObject.rateScale.onKeyPressed(event)
                return true
            }
        }

        if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) {
            container = thisObject.timeFrameScale.getContainer(point)
            if (container !== undefined) {
                thisObject.timeFrameScale.onKeyPressed(event)
                return true
            }
        }

        return false
    }

    function onScaleChanged(event) {
        if (thisObject.rateScale !== undefined) {
            thisObject.rateScale.onUpstreamScaleChanged(event)
        }
        timelineChartCoordinateSystem.min.x = timeMachineCoordinateSystem.min.x
        timelineChartCoordinateSystem.max.x = timeMachineCoordinateSystem.max.x
        timelineChartCoordinateSystem.maxHeight = timeMachineCoordinateSystem.maxHeight
        timelineChartCoordinateSystem.maxWidth = timeMachineCoordinateSystem.maxWidth
        timelineChartCoordinateSystem.autoMinXScale = timeMachineCoordinateSystem.autoMinXScale
        timelineChartCoordinateSystem.autoMaxXScale = timeMachineCoordinateSystem.autoMaxXScale
        timelineChartCoordinateSystem.recalculateScale()
    }

    function setTimeFrame(pTimeFrame) {
        timeFrame = pTimeFrame
        if (thisObject.plotterManager !== undefined) {
            thisObject.plotterManager.setTimeFrame(timeFrame)
        }
    }

    function setDatetime(pDatetime) {
        datetime = pDatetime
        if (thisObject.plotterManager !== undefined) {
            thisObject.plotterManager.setDatetime(datetime)
        }
    }

    function onMouseOver(event) {
        /* This event gets to the timelinechart container because it inherits it from the time machine container, which is the one raising Mouse Over and Mouse not Over Events to its children. */
        drawScales = true

        if (thisObject.rateScale !== undefined) {
            thisObject.rateScale.onMouseOverSomeTimeMachineContainer(event)
        }

        if (thisObject.timeFrameScale !== undefined) {
            thisObject.timeFrameScale.onMouseOverSomeTimeMachineContainer(event)
        }

        mouse.position.x = event.x
        mouse.position.y = event.y
    }

    function onMouseNotOver(event) {
        /* This event is inherited from the Time Machine */
        drawScales = false

        if (thisObject.rateScale !== undefined) {
            thisObject.rateScale.visible = false
        }
        if (thisObject.timeFrameScale !== undefined) {
            thisObject.timeFrameScale.visible = false
        }
    }

    function getContainer(point, purpose) {
        let container

        if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) {
            container = thisObject.rateScale.getContainer(point, purpose)
            if (container !== undefined) {
                if (purpose === undefined) {
                    return container
                } else {
                    if (container.isForThisPurpose(purpose)) {
                        return container
                    }
                }
            }
        }

        if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) {
            container = thisObject.timeFrameScale.getContainer(point, purpose)
            if (container !== undefined) {
                if (purpose === undefined) {
                    return container
                } else {
                    if (container.isForThisPurpose(purpose)) {
                        return container
                    }
                }
            }
        }

        return container
    }

    function physics() {
        plotterManagerPhysics()
        thisObjectPhysics()
        childrenPhysics()
        syncWithDesignerScales()
        syncWithDesignerLayerManager()
    }

    function plotterManagerPhysics() {
        if (thisObject.plotterManager !== undefined) {
            thisObject.plotterManager.physics()
        }
    }

    function thisObjectPhysics() {
        /* Only if the plotter manager has some layer turned on, we will pass the min and max upstream. */
        if (thisObject.plotterManager !== undefined && thisObject.plotterManager.connectors.length > 0) {
            timelineChartCoordinateSystem.reportParentXValue(timeMachineCoordinateSystem.min.x, timeMachineCoordinateSystem.max.x)
            timelineChartCoordinateSystem.physics()

            timeMachineCoordinateSystem.reportXValue(timelineChartCoordinateSystem.childrenMin.x)
            timeMachineCoordinateSystem.reportXValue(timelineChartCoordinateSystem.childrenMax.x)
        }
    }

    function syncWithDesignerLayerManager() {
        if (thisObject.payload.node === undefined) {
            finalizeLayerManager()
            return
        }

        if (thisObject.payload.node.layerManager === undefined && thisObject.layerManager !== undefined) {
            finalizeLayerManager()
        }
        if (thisObject.payload.node.layerManager !== undefined && thisObject.layerManager === undefined) {
            initializeLayerManager()
        }
    }

    function syncWithDesignerScales() {
        if (thisObject.payload.node === undefined) {
            finalizeRateScale()
            finalizeTimeFrameScale()
            return
        }
        if (thisObject.payload.node.rateScale === undefined && thisObject.rateScale !== undefined) {
            finalizeRateScale()
            coordinateSystem = timeMachineCoordinateSystem
            if (thisObject.plotterManager !== undefined) {
                thisObject.plotterManager.setCoordinateSystem(coordinateSystem)
            }
        }
        if (thisObject.payload.node.rateScale !== undefined && thisObject.rateScale === undefined) {
            initializeRateScale()
            coordinateSystem = timelineChartCoordinateSystem
            if (thisObject.plotterManager !== undefined) {
                thisObject.plotterManager.setCoordinateSystem(coordinateSystem)
            }
        }
        if (thisObject.payload.node.timeFrameScale === undefined && thisObject.timeFrameScale !== undefined) {
            finalizeTimeFrameScale()
        }
        if (thisObject.payload.node.timeFrameScale !== undefined && thisObject.timeFrameScale === undefined) {
            initializeTimeFrameScale()
        }
    }

    function childrenPhysics() {
        if (thisObject.rateScale !== undefined) {
            thisObject.rateScale.layersOn = thisObject.plotterManager.connectors.length
            thisObject.rateScale.physics()
        }
        if (thisObject.timeFrameScale !== undefined) {
            thisObject.timeFrameScale.layersOn = thisObject.plotterManager.connectors.length
            thisObject.timeFrameScale.physics()
        }
    }

    function drawBackground() {
        if (thisObject.container.frame.isInViewPort()) {
            if (drawScales === true) {
                if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) { thisObject.rateScale.drawBackground() }
            }
            drawChartsBackground()
            if (thisObject.plotterManager !== undefined) {
                let elementsPlotted = thisObject.plotterManager.draw()
                if (thisObject.timeFrameScale !== undefined) {
                    thisObject.timeFrameScale.adjustTimeFrame(elementsPlotted)
                } else {
                    return elementsPlotted
                }
            }
        }
    }

    function draw() {
        if (thisObject.container.frame.isInViewPort()) {
            if (drawScales === true) {
                if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) { thisObject.timeFrameScale.draw() }
                if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) { thisObject.rateScale.draw() }
            }
        }
    }

    function drawForeground() {
        if (thisObject.container.frame.isInViewPort()) {
            if (drawScales === true) {
                if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) { thisObject.timeFrameScale.drawForeground() }
                if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) { thisObject.rateScale.drawForeground() }
            }
        }
    }

    function drawChartsBackground() {
        UI.projects.superalgos.utilities.drawPrint.drawContainerBackground(thisObject.container, UI_COLOR.WHITE, 0, thisObject.fitFunction)
    }
}
