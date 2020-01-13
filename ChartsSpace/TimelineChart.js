function newTimelineChart () {
  const MODULE_NAME = 'Timeline Chart'
  const INFO_LOG = false
  const INTENSIVE_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let timeFrame = INITIAL_TIME_PERIOD
  let datetime = NEW_SESSION_INITIAL_DATE

  let thisObject = {
    container: undefined,
    fitFunction: undefined,
    rateScale: undefined,
    timeFrameScale: undefined,
    payload: undefined,
    plotterManager: undefined,
    upstreamTimeFrame: undefined,
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

  let productsPanel

  let exchange = DEFAULT_EXCHANGE
  let market = DEFAULT_MARKET

  let productsPanelHandle

  let onOffsetChangedEventSuscriptionId
  let onZoomChangedEventSuscriptionId
  let onMouseOverEventSuscriptionId
  let onMouseNotOverEventSuscriptionId
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

    viewPort.eventHandler.stopListening(onOffsetChangedEventSuscriptionId)
    viewPort.eventHandler.stopListening(onZoomChangedEventSuscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseOverEventSuscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseNotOverEventSuscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined

    thisObject.payload = undefined
    mouse = undefined
  }

  function finalizeLayersManager () {
    if (thisObject.plotterManager !== undefined) {
      thisObject.plotterManager.finalize()
    }
    thisObject.plotterManager = undefined
    thisObject.layersManager = undefined

    canvas.panelsSpace.destroyPanel(productsPanelHandle)
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

    thisObject.rateScale.container.eventHandler.stopListening(rateScaleEventSuscriptionId)
    thisObject.rateScale.container.eventHandler.stopListening(rateScaleMouseOverEventSuscriptionId)
    thisObject.rateScale.finalize()
    thisObject.rateScale = undefined

    /* Resets the local container with the dimessions of its parent, the Time Machine */
    thisObject.container.frame.position.position.y = 0
    thisObject.container.frame.position.height = thisObject.container.parentContainer.frame.height
  }

  function initialize (pTimeMachineCoordinateSystem) {
     /* We load the logow we will need for the background. */

    timeMachineCoordinateSystem = pTimeMachineCoordinateSystem

    timeFrame = INITIAL_TIME_PERIOD
    datetime = NEW_SESSION_INITIAL_DATE

     /* Event Subscriptions - we need this events to be fired first here and then in active Plotters. */
    onOffsetChangedEventSuscriptionId = viewPort.eventHandler.listenToEvent('Offset Changed', onOffsetChanged)
    onZoomChangedEventSuscriptionId = viewPort.eventHandler.listenToEvent('Zoom Changed', onZoomChanged)

    onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    onMouseNotOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
  }

  function initializeLayersManager () {
    let panelOwner = exchange + ' ' + market.quotedAsset + '/' + market.baseAsset
    productsPanelHandle = canvas.panelsSpace.createNewPanel('Products Panel', undefined, panelOwner)
    thisObject.layersManager = canvas.panelsSpace.getPanel(productsPanelHandle, panelOwner)
    thisObject.layersManager.initialize(exchange, market)
    thisObject.layersManager.payload = thisObject.payload.node.layersManager.payload

    /* Initialize the Plotter Manager */
    thisObject.plotterManager = newPlottersManager()

    thisObject.plotterManager.container.connectToParent(thisObject.container, true, true, false, true, true, true, false, false, true)

    thisObject.plotterManager.container.frame.position.x = 0
    thisObject.plotterManager.container.frame.position.y = 0

    thisObject.plotterManager.fitFunction = thisObject.fitFunction
    thisObject.plotterManager.initialize(thisObject.layersManager, DEFAULT_EXCHANGE, DEFAULT_MARKET)
    thisObject.plotterManager.setTimeFrame(timeFrame)
  }

  function initializeRateScale () {
    thisObject.rateScale = newRateScale()
    thisObject.rateScale.fitFunction = thisObject.fitFunction
    thisObject.rateScale.payload = thisObject.payload.node.rateScale.payload

    rateScaleEventSuscriptionId = thisObject.rateScale.container.eventHandler.listenToEvent('Height Percentage Changed', function (event) {
      thisObject.container.frame.height = TIME_MACHINE_HEIGHT * event.heightPercentage / 100
      recalculateCoordinateSystem()
      moveToUserPosition(thisObject.container, timelineChartCoordinateSystem, true, false, event.mousePosition, false, true)
      thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
    })

    thisObject.rateScale.initialize(timelineChartCoordinateSystem, thisObject.container.parentContainer)

    rateScaleMouseOverEventSuscriptionId = thisObject.rateScale.container.eventHandler.listenToEvent('onMouseOverScale', rateScaleMouseOver)

    function rateScaleMouseOver (event) {
      thisObject.container.eventHandler.raiseEvent('onChildrenMouseOver', event)
    }
  }

  function initializeTimeFrameScale () {
    thisObject.timeFrameScale = newTimeFrameScale()
    thisObject.timeFrameScale.fitFunction = thisObject.fitFunction
    thisObject.timeFrameScale.payload = thisObject.payload.node.timeFrameScale.payload

    timeFrameScaleEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('Time Frame Changed', function (event) {
      let currentTimeFrame = timeFrame
      timeFrame = event.timeFrame
      if (timeFrame !== currentTimeFrame) {
        if (thisObject.plotterManager !== undefined) {
          thisObject.plotterManager.setTimeFrame(timeFrame)
        }
      }
    })

    thisObject.timeFrameScale.initialize(timeMachineCoordinateSystem, thisObject.container.parentContainer)

    timeFrameScaleMouseOverEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('onMouseOverScale', timeFrameScaleMouseOver)

    function timeFrameScaleMouseOver (event) {
      thisObject.container.eventHandler.raiseEvent('onChildrenMouseOver', event)

      saveUserPosition(thisObject.container, timeMachineCoordinateSystem, event)
    }
  }

  function setTimeFrame (pTimeFrame) {
    timeFrame = pTimeFrame
    if (thisObject.plotterManager !== undefined) {
      thisObject.plotterManager.setTimeFrame(timeFrame)
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

    saveUserPosition(thisObject.container, timeMachineCoordinateSystem, event)
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

  function onZoomChanged (event) {
    recalculateCurrentDatetime()
  }

  function onOffsetChanged () {
    if (thisObject.container.frame.isInViewPort()) {
      recalculateCurrentDatetime()
    }
  }

  function recalculateCurrentDatetime () {
       /*

       The view port was moved or the view port zoom level was changed and the center of the screen points to a different datetime that we
       must calculate.

       */

    let center = {
      x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / 2,
      y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) / 2
    }

    center = unTransformThisPoint(center, thisObject.container)
    if (thisObject.rateScale === undefined) {
      center = timeMachineCoordinateSystem.unInverseTransform(center, thisObject.container.frame.height)
    } else {
      center = timelineChartCoordinateSystem.unInverseTransform(center, thisObject.container.frame.height)
    }

    let newDate = new Date(0)
    newDate.setUTCSeconds(center.x / 1000)

    datetime = newDate

    thisObject.plotterManager.setDatetime(datetime)
  }

  function getContainer (point, purpose) {
    let container

    if (thisObject.rateScale !== undefined) {
      container = thisObject.rateScale.getContainer(point)
      if (container !== undefined) {
        if (container.isForThisPurpose(purpose)) {
          return container
        }
      }
    }

    if (thisObject.timeFrameScale !== undefined) {
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

  function childrenPhysics () {
    if (thisObject.rateScale !== undefined) {
      thisObject.rateScale.physics()
    }
    if (thisObject.timeFrameScale !== undefined) {
      thisObject.timeFrameScale.physics()
    }
  }

  function tooTiny () {
    if (viewPort.zoomLevel < Math.trunc(-28.25 * 100) / 100) {
      return true
    } else {
      return false
    }
  }

  function tooSmall () {
    if (viewPort.zoomLevel < Math.trunc(-27.25 * 100) / 100) {
      return true
    } else {
      return false
    }
  }

  function drawBackground () {
    if (thisObject.container.frame.isInViewPort()) {
      if (window.CHART_ON_FOCUS === '') {
        window.CHART_ON_FOCUS = exchange + ' ' + market.quotedAsset + '/' + market.baseAsset
      }
      drawChartsBackground()
      if (thisObject.plotterManager !== undefined) {
        thisObject.plotterManager.draw()
      }
    }
  }

  function draw () {
    if (thisObject.container.frame.isInViewPort()) {
      if (drawScales === true) {
        if (thisObject.timeFrameScale !== undefined) { thisObject.timeFrameScale.draw() }
        if (thisObject.rateScale !== undefined) { thisObject.rateScale.draw() }
      }
    }
  }

  function drawForeground () {
    if (thisObject.container.frame.isInViewPort()) {
      if (drawScales === true) {
        if (thisObject.timeFrameScale !== undefined) { thisObject.timeFrameScale.drawForeground() }
        if (thisObject.rateScale !== undefined) { thisObject.rateScale.drawForeground() }
      }
    }
  }

  function drawChartsBackground () {
       /* We will paint some transparent background here. */

    let opacity = '0.1'

    let fromPoint = {
      x: 0,
      y: 0
    }

    let toPoint = {
      x: thisObject.container.frame.width,
      y: thisObject.container.frame.height
    }

    fromPoint = transformThisPoint(fromPoint, thisObject.container)
    toPoint = transformThisPoint(toPoint, thisObject.container)

    fromPoint = thisObject.fitFunction(fromPoint)
    toPoint = thisObject.fitFunction(toPoint)

    browserCanvasContext.beginPath()

    browserCanvasContext.rect(fromPoint.x, fromPoint.y, toPoint.x - fromPoint.x, toPoint.y - fromPoint.y)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')'

    browserCanvasContext.closePath()

    browserCanvasContext.fill()
  }

  function recalculateCoordinateSystem () {
    let minValue = {
      x: MIN_PLOTABLE_DATE.valueOf(),
      y: 0
    }

    let maxValue = {
      x: MAX_PLOTABLE_DATE.valueOf(),
      y: nextPorwerOf10(USDT_BTC_HTH) / 4
    }

    timelineChartCoordinateSystem.initialize(
          minValue,
          maxValue,
          thisObject.container.frame.width,
          thisObject.container.frame.height
      )
  }
}
