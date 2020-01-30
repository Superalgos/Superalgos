function newTimelineChart () {
  const MODULE_NAME = 'Timeline Chart'
  const INFO_LOG = false
  const INTENSIVE_LOG = false
  const ERROR_LOG = true
  let logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let timeFrame = INITIAL_TIME_PERIOD
  let datetime = NEW_SESSION_INITIAL_DATE

  let thisObject = {
    container: undefined,
    fitFunction: undefined,
    rateScale: undefined,
    timeFrameScale: undefined,
    payload: undefined,
    layersManager: undefined,
    plotterManager: undefined,
    upstreamTimeFrame: undefined,
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
  let coordinateSystem

  let layersPanel
  let layersPanelHandle

  let onMouseOverEventSuscriptionId
  let onMouseNotOverEventSuscriptionId
  let rateScaleValueEventSuscriptionId
  let rateScaleUpstreamEventSuscriptionId
  let rateScaleMouseOverEventSuscriptionId
  let rateScaleOffsetEventSuscriptionId
  let rateScaleUpstreamDimensionsEventSuscriptionId
  let timeFrameScaleEventSuscriptionId
  let timeFrameScaleMouseOverEventSuscriptionId

  let drawScales = false
  let mouse = {
    position: {
      x: 0,
      y: 0
    }
  }

  setupContainer()
  return thisObject

  function setupContainer () {
    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.detectMouseOver = true
  }

  function finalize () {
    if (thisObject.layersManager !== undefined) {
      finalizeLayersManager()
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
    timelineChartCoordinateSystem = undefined
    coordinateSystem = undefined
    layersPanel = undefined
    layersPanelHandle = undefined
  }

  function finalizeLayersManager () {
    if (thisObject.plotterManager !== undefined) {
      thisObject.plotterManager.finalize()
    }
    thisObject.plotterManager = undefined
    thisObject.layersManager = undefined

    canvas.panelsSpace.destroyPanel(layersPanelHandle)
  }

  function finalizeTimeFrameScale () {
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

  function finalizeRateScale () {
    if (thisObject.rateScale === undefined) { return }

    thisObject.rateScale.container.eventHandler.stopListening(rateScaleOffsetEventSuscriptionId)
    thisObject.rateScale.container.eventHandler.stopListening(rateScaleValueEventSuscriptionId)
    thisObject.rateScale.container.eventHandler.stopListening(rateScaleMouseOverEventSuscriptionId)
    thisObject.container.parentContainer.eventHandler.stopListening(rateScaleUpstreamEventSuscriptionId)
    thisObject.container.parentContainer.eventHandler.stopListening(rateScaleUpstreamDimensionsEventSuscriptionId)
    thisObject.rateScale.finalize()
    thisObject.rateScale = undefined

    /* Resets the local container with the dimessions of its parent, the Time Machine */
    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0
    thisObject.container.frame.height = TIME_MACHINE_HEIGHT
    thisObject.container.frame.width = TIME_MACHINE_WIDTH
  }

  function initialize (pTimeMachineCoordinateSystem) {
     /* We load the logow we will need for the background. */

    timeMachineCoordinateSystem = pTimeMachineCoordinateSystem
    coordinateSystem = timeMachineCoordinateSystem

    timeFrame = INITIAL_TIME_PERIOD

    onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    onMouseNotOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
  }

  function initializeLayersManager () {
    let owner = thisObject.payload.node.payload.parentNode.id // The real owner is the Time Machine
    layersPanelHandle = canvas.panelsSpace.createNewPanel('Layers Panel', undefined, owner)
    thisObject.layersManager = canvas.panelsSpace.getPanel(layersPanelHandle)
    thisObject.layersManager.payload = thisObject.payload.node.layersManager.payload
    thisObject.layersManager.initialize()

    /* Initialize the Plotter Manager */
    thisObject.plotterManager = newPlottersManager()

    thisObject.plotterManager.container.connectToParent(thisObject.container, true, true, false, true, true, true, false, false, true)

    thisObject.plotterManager.container.frame.position.x = 0
    thisObject.plotterManager.container.frame.position.y = 0

    thisObject.plotterManager.fitFunction = thisObject.fitFunction
    thisObject.plotterManager.payload = thisObject.payload
    thisObject.plotterManager.initialize(thisObject.layersManager)
    thisObject.plotterManager.setTimeFrame(timeFrame)
    thisObject.plotterManager.setDatetime(datetime)
    thisObject.plotterManager.setCoordinateSystem(coordinateSystem)
  }

  function initializeRateScale () {
    thisObject.rateScale = newRateScale()
    thisObject.rateScale.fitFunction = thisObject.fitFunction
    thisObject.rateScale.payload = thisObject.payload.node.rateScale.payload

    rateScaleOffsetEventSuscriptionId = thisObject.rateScale.container.eventHandler.listenToEvent('Rate Scale Offset Changed', rateScaleOffsetChanged)
    rateScaleValueEventSuscriptionId = thisObject.rateScale.container.eventHandler.listenToEvent('Rate Scale Value Changed', rateScaleValueChanged)
    rateScaleMouseOverEventSuscriptionId = thisObject.rateScale.container.eventHandler.listenToEvent('onMouseOverScale', rateScaleMouseOver)
    rateScaleUpstreamEventSuscriptionId = thisObject.container.parentContainer.eventHandler.listenToEvent('Upstream Rate Scale Value Changed', rateScaleUpstreamChanged)
    rateScaleUpstreamDimensionsEventSuscriptionId = thisObject.container.parentContainer.eventHandler.listenToEvent('Dimmensions Changed', rateScaleUpstreamDimensioinsChanged)
    thisObject.rateScale.initialize(timelineChartCoordinateSystem, thisObject.container.parentContainer, thisObject.container)

    function rateScaleUpstreamDimensioinsChanged () {
      thisObject.container.frame.height = TIME_MACHINE_HEIGHT + TIME_MACHINE_HEIGHT * thisObject.rateScale.scale
      recalculateCoordinateSystem()
      thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
    }

    function rateScaleUpstreamChanged (event) {
      thisObject.rateScale.setScale(event.scale)
    }

    function rateScaleOffsetChanged (event) {
      thisObject.container.frame.offset.y = event.offset
    }

    function rateScaleValueChanged (event) {
      thisObject.container.frame.height = TIME_MACHINE_HEIGHT + TIME_MACHINE_HEIGHT * event.scale
      recalculateCoordinateSystem()
      thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
    }

    function rateScaleMouseOver (event) {
      thisObject.container.eventHandler.raiseEvent('onChildrenMouseOver', event)
    }
  }

  function initializeTimeFrameScale () {
    thisObject.timeFrameScale = newTimeFrameScale()
    thisObject.timeFrameScale.fitFunction = thisObject.fitFunction
    thisObject.timeFrameScale.payload = thisObject.payload.node.timeFrameScale.payload

    timeFrameScaleEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('Time Frame Value Changed', timeFrameScaleValueChanged)
    timeFrameScaleMouseOverEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('onMouseOverScale', timeFrameScaleMouseOver)
    thisObject.timeFrameScale.initialize(thisObject.container.parentContainer)

    function timeFrameScaleValueChanged (event) {
      let currentTimeFrame = timeFrame
      timeFrame = event.timeFrame
      if (timeFrame !== currentTimeFrame) {
        if (thisObject.plotterManager !== undefined) {
          thisObject.plotterManager.setTimeFrame(timeFrame)
        }
      }
    }

    function timeFrameScaleMouseOver (event) {
      thisObject.container.eventHandler.raiseEvent('onChildrenMouseOver', event)
    }
  }

  function setTimeFrame (pTimeFrame) {
    timeFrame = pTimeFrame
    if (thisObject.plotterManager !== undefined) {
      thisObject.plotterManager.setTimeFrame(timeFrame)
    }
  }

  function setDatetime (pDatetime) {
    datetime = pDatetime
    if (thisObject.plotterManager !== undefined) {
      thisObject.plotterManager.setDatetime(datetime)
    }
  }

  function onMouseOver (event) {
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

  function onMouseNotOver (event) {
    /* This event is inherited from the Time Machine */
    drawScales = false

    if (thisObject.rateScale !== undefined) {
      thisObject.rateScale.visible = false
    }
    if (thisObject.timeFrameScale !== undefined) {
      thisObject.timeFrameScale.visible = false
    }
  }

  function getContainer (point, purpose) {
    let container

    if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) {
      container = thisObject.rateScale.getContainer(point)
      if (container !== undefined) {
        if (container.isForThisPurpose(purpose)) {
          return container
        }
      }
    }

    if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) {
      container = thisObject.timeFrameScale.getContainer(point)
      if (container !== undefined) {
        if (container.isForThisPurpose(purpose)) {
          return container
        }
      }
    }

    return container
  }

  function physics () {
    thisObjectPhysics()
    childrenPhysics()
    syncWithDesignerScales()
    syncWithDesignerLayersManager()
  }

  function thisObjectPhysics () {

  }

  function syncWithDesignerLayersManager () {
    if (thisObject.payload.node === undefined) {
      finalizeLayersManager()
      return
    }

    if (thisObject.payload.node.layersManager === undefined && thisObject.layersManager !== undefined) {
      finalizeLayersManager()
    }
    if (thisObject.payload.node.layersManager !== undefined && thisObject.layersManager === undefined) {
      initializeLayersManager()
    }
  }

  function syncWithDesignerScales () {
    if (thisObject.payload.node === undefined) {
      finalizeRateScale()
      finalizeTimeFrameScale()
      return
    }
    if (thisObject.payload.node.rateScale === undefined && thisObject.rateScale !== undefined) {
      finalizeRateScale()
      coordinateSystem = timeMachineCoordinateSystem
    }
    if (thisObject.payload.node.rateScale !== undefined && thisObject.rateScale === undefined) {
      initializeRateScale()
      coordinateSystem = timelineChartCoordinateSystem
    }
    if (thisObject.payload.node.timeFrameScale === undefined && thisObject.timeFrameScale !== undefined) {
      finalizeTimeFrameScale()
    }
    if (thisObject.payload.node.timeFrameScale !== undefined && thisObject.timeFrameScale === undefined) {
      initializeTimeFrameScale()
    }
  }

  function childrenPhysics () {
    if (thisObject.rateScale !== undefined) {
      thisObject.rateScale.physics()
    }
    if (thisObject.timeFrameScale !== undefined) {
      thisObject.timeFrameScale.physics()
    }
  }

  function drawBackground () {
    if (thisObject.container.frame.isInViewPort()) {
      drawChartsBackground()
      if (thisObject.plotterManager !== undefined) {
        thisObject.plotterManager.draw()
      }
    }
  }

  function draw () {
    if (thisObject.container.frame.isInViewPort()) {
      if (drawScales === true) {
        if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) { thisObject.timeFrameScale.draw() }
        if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) { thisObject.rateScale.draw() }
      }
    }
  }

  function drawForeground () {
    if (thisObject.container.frame.isInViewPort()) {
      if (drawScales === true) {
        if (thisObject.timeFrameScale !== undefined && thisObject.timeFrameScale.isVisible === true) { thisObject.timeFrameScale.drawForeground() }
        if (thisObject.rateScale !== undefined && thisObject.rateScale.isVisible === true) { thisObject.rateScale.drawForeground() }
      }
    }
  }

  function drawChartsBackground () {
    drawContainerBackground(thisObject.container, UI_COLOR.WHITE, 0, thisObject.fitFunction)
  }

  function recalculateCoordinateSystem () {
    let minValue = {
      x: MIN_PLOTABLE_DATE.valueOf(),
      y: 0
    }

    let maxValue = {
      x: MAX_PLOTABLE_DATE.valueOf(),
      y: nextPorwerOf10(MAX_DEFAULT_RATE_SCALE_VALUE) / 4
    }

    timelineChartCoordinateSystem.initialize(
          minValue,
          maxValue,
          thisObject.container.frame.width,
          thisObject.container.frame.height
      )
  }
}
