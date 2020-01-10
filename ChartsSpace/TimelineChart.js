function newTimelineChart () {
  const MODULE_NAME = 'Timeline Chart'
  const INFO_LOG = false
  const INTENSIVE_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let timeLineCoordinateSystem

  let timeFrame = INITIAL_TIME_PERIOD
  let datetime = NEW_SESSION_INITIAL_DATE

  let thisObject = {
    container: undefined,
    fitFunction: undefined,
    timeFrameScale: undefined,
    payload: undefined,
    physics: physics,
    setDatetime: setDatetime,
    drawBackground: drawBackground,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.fitFunction = canvas.chartSpace.fitIntoVisibleArea

  let initializationReady = false

  let productsPanel

   /* Background */
  let logoBaseAsset
  let logoQuotedAsset
  let logoExchange
  let logoAA
  let canDrawLogoA = false
  let canDrawLogoB = false
  let canDrawLogoExchange = false
  let canDrawLogoAA = false

  let plotterManager
  let exchange
  let market

  let productsPanelHandle

  let onOffsetChangedEventSuscriptionId
  let onZoomChangedEventSuscriptionId
  let onMouseOverEventSuscriptionId
  let onMouseNotOverEventSuscriptionId
  let timeFrameScaleEventSuscriptionId
  let timeFrameScaleMouseOverEventSuscriptionId

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
    if (thisObject.timeFrameScale !== undefined) {
      finalizeTimeFrameScale()
    }

    viewPort.eventHandler.stopListening(onOffsetChangedEventSuscriptionId)
    viewPort.eventHandler.stopListening(onZoomChangedEventSuscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseOverEventSuscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseNotOverEventSuscriptionId)

    plotterManager.finalize()
    plotterManager = undefined

    canvas.panelsSpace.destroyPanel(productsPanelHandle)

    thisObject.container.finalize()
    thisObject.container = undefined

    thisObject.payload = undefined
    mouse = undefined
  }

  function finalizeTimeFrameScale () {
    thisObject.timeFrameScale.container.eventHandler.stopListening(timeFrameScaleEventSuscriptionId)
    thisObject.timeFrameScale.container.eventHandler.stopListening(timeFrameScaleMouseOverEventSuscriptionId)
    thisObject.timeFrameScale.finalize()
    thisObject.timeFrameScale = undefined
  }

  function initialize (pExchange, pMarket, pTimeLineCoordinateSystem, callBackFunction) {
    try {
           /* We load the logow we will need for the background. */
      exchange = pExchange
      market = pMarket
      timeLineCoordinateSystem = pTimeLineCoordinateSystem

      let panelOwner = exchange + ' ' + market.quotedAsset + '/' + market.baseAsset
      productsPanelHandle = canvas.panelsSpace.createNewPanel('Products Panel', undefined, panelOwner)
      let productsPanel = canvas.panelsSpace.getPanel(productsPanelHandle, panelOwner)
      productsPanel.initialize(exchange, market)

      logoA = new Image()
      logoB = new Image()
      logoExchange = new Image()
      logoAA = new Image()

      logoA.onload = onImageALoaded

      function onImageALoaded () {
        canDrawLogoA = true
      }

      logoB.onload = onImageBLoaded

      function onImageBLoaded () {
        canDrawLogoB = true
      }

      logoExchange.onload = onImageExchangeLoaded

      function onImageExchangeLoaded () {
        canDrawLogoExchange = true
      }

      logoAA.onload = onImageAALoaded

      function onImageAALoaded () {
        canDrawLogoAA = true
      }

      logoA.src = window.canvasApp.urlPrefix + 'Images/tether-logo-background.png'
      logoB.src = window.canvasApp.urlPrefix + 'Images/bitcoin-logo-background.png'
      logoExchange.src = window.canvasApp.urlPrefix + 'Images/' + exchange + '-logo-background.png'
      logoAA.src = window.canvasApp.urlPrefix + 'Images/sa-logo-background.png'

      // moveToUserPosition(thisObject.container, timeLineCoordinateSystem, undefined, undefined, undefined, true)
      timeFrame = INITIAL_TIME_PERIOD
      datetime = NEW_SESSION_INITIAL_DATE

           /* Event Subscriptions - we need this events to be fired first here and then in active Plotters. */

      onOffsetChangedEventSuscriptionId = viewPort.eventHandler.listenToEvent('Offset Changed', onOffsetChanged)
      onZoomChangedEventSuscriptionId = viewPort.eventHandler.listenToEvent('Zoom Changed', onZoomChanged)

           /* Initialize the Plotter Manager */

      plotterManager = newPlottersManager()

      plotterManager.container.connectToParent(thisObject.container, true, true, false, true, true, true, false, false, true)

      plotterManager.container.frame.position.x = 0
      plotterManager.container.frame.position.y = 0

      plotterManager.fitFunction = thisObject.fitFunction
      plotterManager.initialize(productsPanel, pExchange, pMarket, onPlotterManagerReady)

      function onPlotterManagerReady (err) {
        if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onPlotterManagerReady -> Plotter Manager Initialization Failed. ') }
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onPlotterManagerReady -> err= ' + err.stack) }

          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
          return
        }

        onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)

        function onMouseOver (event) {
          /* This event gets to the timelinechart container because it inherits it from the time machine container, which is the one raising Mouse Over and Mouse not Over Events to its children. */
          if (thisObject.timeFrameScale !== undefined) {
            thisObject.timeFrameScale.visible = true
            thisObject.timeFrameScale.onMouseOverSomeTimeMachineContainer(event)
          }

          mouse.position.x = event.x
          mouse.position.y = event.y

          saveUserPosition(thisObject.container, timeLineCoordinateSystem, event)
        }

        onMouseNotOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)

        function onMouseNotOver (event) {
          /* This event is inherited from the Time Machine */
          if (thisObject.timeFrameScale !== undefined) {
            thisObject.timeFrameScale.visible = false
          }
        }

        initializationReady = true
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
        return
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
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
        plotterManager.setTimeFrame(timeFrame)
      }
    })

    thisObject.timeFrameScale.initialize(timeLineCoordinateSystem, thisObject.container)

    timeFrameScaleMouseOverEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('onMouseOver', timeFrameScaleMouseOver)

    function timeFrameScaleMouseOver (event) {
      thisObject.container.eventHandler.raiseEvent('onChildrenMouseOver', event)

      saveUserPosition(thisObject.container, timeLineCoordinateSystem, event)
    }
  }

  function onZoomChanged (event) {
    if (initializationReady === true) {
      recalculateCurrentDatetime()

      // saveUserPosition(thisObject.container, timeLineCoordinateSystem)
    }
  }

  function setDatetime (pDatetime) {
       /* This function is used when the time is changed through the user interface, but without zooming or panning. */
       /* No matter if the day changed or not, we need to inform all visible Plotters. */

    if (thisObject.container.frame.isInViewPort()) {
      plotterManager.setDatetime(pDatetime)
      plotterManager.positionAtDatetime(pDatetime)
    }
  }

  function onOffsetChanged () {
    if (initializationReady === true) {
      if (thisObject.container.frame.isInViewPort()) {
        recalculateCurrentDatetime()
        // saveUserPosition(thisObject.container, timeLineCoordinateSystem)
      }
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
    center = timeLineCoordinateSystem.unInverseTransform(center, thisObject.container.frame.height)

    let newDate = new Date(0)
    newDate.setUTCSeconds(center.x / 1000)

    datetime = newDate

    plotterManager.setDatetime(datetime)
  }

  function getContainer (point) {
    let container

    if (thisObject.timeFrameScale !== undefined) {
      container = thisObject.timeFrameScale.getContainer(point)
    }

    return container
  }

  function physics () {
    thisObjectPhysics()
    childrenPhysics()
    syncWithDesignerScales()
  }

  function thisObjectPhysics () {

  }

  function syncWithDesignerScales () {
    if (thisObject.payload.node.timeFrameScale === undefined && thisObject.timeFrameScale !== undefined) {
      finalizeTimeFrameScale()
    }
    if (thisObject.payload.node.timeFrameScale !== undefined && thisObject.timeFrameScale === undefined) {
      initializeTimeFrameScale()
    }
  }

  function childrenPhysics () {
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
      plotterManager.draw()
    }
  }

  function draw () {
    if (thisObject.container.frame.isInViewPort()) {
      if (thisObject.timeFrameScale !== undefined) {
        thisObject.timeFrameScale.draw()
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

    fromPoint = canvas.chartSpace.fitIntoVisibleArea(fromPoint)
    toPoint = canvas.chartSpace.fitIntoVisibleArea(toPoint)

    browserCanvasContext.beginPath()

    browserCanvasContext.rect(fromPoint.x, fromPoint.y, toPoint.x - fromPoint.x, toPoint.y - fromPoint.y)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')'

    browserCanvasContext.closePath()

    browserCanvasContext.fill()
  }
}
