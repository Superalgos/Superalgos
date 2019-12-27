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
  let logoAssetA
  let logoAssetB
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
  let timeFrameScale

  setupContainer()
  return thisObject

  function setupContainer () {
    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.detectMouseOver = true
  }

  function finalize () {
    plotterManager.finalize()
    plotterManager = undefined
    timeFrameScale.finalize()
    timeFrameScale = undefined
    canvas.panelsSpace.destroyPanel(productsPanelHandle)

    thisObject.container.finalize()
    thisObject.container = undefined
    setupContainer()
  }

  function initialize (pExchange, pMarket, pTimeLineCoordinateSystem, callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }

           /* We load the logow we will need for the background. */
      exchange = pExchange
      market = pMarket
      timeLineCoordinateSystem = pTimeLineCoordinateSystem

      thisObject.container.eventHandler.listenToEvent('onMouseOver', function (event) {
        saveUserPosition(thisObject.container, timeLineCoordinateSystem, event)
      })

      let panelOwner = exchange + ' ' + market.assetB + '/' + market.assetA
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

      viewPort.eventHandler.listenToEvent('Offset Changed', onOffsetChanged)
      viewPort.eventHandler.listenToEvent('Zoom Changed', onZoomChanged)

           /* Initialize the Plotter Manager */

      plotterManager = newPlottersManager()

      plotterManager.container.connectToParent(thisObject.container, true, true, false, true, true, true)

      plotterManager.container.frame.position.x = 0
      plotterManager.container.frame.position.y = 0

      plotterManager.fitFunction = thisObject.fitFunction
      plotterManager.initialize(productsPanel, pExchange, pMarket, onPlotterManagerReady)

      function onPlotterManagerReady (err) {
        if (INFO_LOG === true) { logger.write('[INFO] initialize -> onPlotterManagerReady -> Entering function.') }

        if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onPlotterManagerReady -> Plotter Manager Initialization Failed. ') }
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onPlotterManagerReady -> err= ' + err.stack) }

          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
          return
        }

        timeFrameScale = newTimeFrameScale()
        timeFrameScale.container.connectToParent(thisObject.container, false, false, false, true, true, true)
        timeFrameScale.container.eventHandler.listenToEvent('Time Frame Changed', function (event) {
          let currentTimeFrame = timeFrame
          timeFrame = event.timeFrame
          if (timeFrame !== currentTimeFrame) {
            plotterManager.setTimeFrame(timeFrame)
          }
        })

        timeFrameScale.initialize(timeLineCoordinateSystem)

        initializationReady = true
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
        return
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function onZoomChanged (event) {
    if (INFO_LOG === true) { logger.write('[INFO] onZoomChanged -> Entering function.') }

    if (initializationReady === true) {
      recalculateCurrentDatetime()

      // saveUserPosition(thisObject.container, timeLineCoordinateSystem)
    }
  }

  function setDatetime (pDatetime) {
    if (INFO_LOG === true) { logger.write('[INFO] setDatetime -> Entering function.') }

       /* This function is used when the time is changed through the user interface, but without zooming or panning. */
       /* No matter if the day changed or not, we need to inform all visible Plotters. */

    if (thisObject.container.frame.isInViewPort()) {
      plotterManager.setDatetime(pDatetime)
      plotterManager.positionAtDatetime(pDatetime)
    }
  }

  function onOffsetChanged () {
    if (INFO_LOG === true) { logger.write('[INFO] onOffsetChanged -> Entering function.') }

    if (initializationReady === true) {
      if (thisObject.container.frame.isInViewPort()) {
        recalculateCurrentDatetime()
        // saveUserPosition(thisObject.container, timeLineCoordinateSystem)
      }
    }
  }

  function recalculateCurrentDatetime () {
    if (INFO_LOG === true) { logger.write('[INFO] recalculateCurrentDatetime -> Entering function.') }

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

    thisObject.container.eventHandler.raiseEvent('Datetime Changed', datetime)
  }

  function getContainer (point) {
    if (INFO_LOG === true) { logger.write('[INFO] getContainer -> Entering function.') }

    let container

    container = timeFrameScale.getContainer(point)

    if (container !== undefined) { return container }

    return container
  }

  function physics () {
    thisObjectPhysics()
    childrenPhysics()
  }

  function thisObjectPhysics () {

  }

  function childrenPhysics () {

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
        window.CHART_ON_FOCUS = exchange + ' ' + market.assetB + '/' + market.assetA

        drawChartsBackgroundImages()
      }
    }
  }

  function draw () {
    if (thisObject.container.frame.isInViewPort()) {
      drawChartsBackground()
      plotterManager.draw()
      timeFrameScale.draw()
    }
  }

  function drawChartsBackground () {
       /* We will paint some transparent background here. */

    let opacity = '0.9'

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

  function drawChartsBackgroundImages () {
    if (canDrawLogoA === false || canDrawLogoB === false || canDrawLogoExchange === false || canDrawLogoAA === false) { return }

    /* Fist we calculate the corners of the current frame so as not to draw imaages ourside of it */

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

    /* Second we calculate the points for the images themselves */

    let backgroundLogoPoint1
    let backgroundLogoPoint2

    let imageHeight = 42
    let imageWidth = 150

    const MAX_COLUMNS = 32
    const MAX_ROWS = 5
    const Y_TOP_MARGIN = 30
    const MIN_ROW_HIGHT = 100

    let point1 = {
      x: viewPort.visibleArea.topLeft.x,
      y: viewPort.visibleArea.topLeft.y
    }

    backgroundLogoPoint1 = {
      x: getDateFromPoint(point1, thisObject.container, timeLineCoordinateSystem).valueOf(),
      y: getRateFromPoint(point1, thisObject.container, timeLineCoordinateSystem)
    }

    let point2 = {
      x: viewPort.visibleArea.topLeft.x + imageWidth * 8,
      y: viewPort.visibleArea.topLeft.y
    }

    backgroundLogoPoint2 = {
      x: getDateFromPoint(point2, thisObject.container, timeLineCoordinateSystem).valueOf(),
      y: getRateFromPoint(point2, thisObject.container, timeLineCoordinateSystem)
    }

    let currentCorner = {
      x: getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem).valueOf(),
      y: getRateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem)
    }

    currentCorner.x = Math.trunc(currentCorner.x / (backgroundLogoPoint2.x - backgroundLogoPoint1.x)) * (backgroundLogoPoint2.x - backgroundLogoPoint1.x)

    let rowHight = (viewPort.visibleArea.bottomLeft.y - viewPort.visibleArea.topLeft.y) / 4.5
    if (rowHight < MIN_ROW_HIGHT) { rowHight = MIN_ROW_HIGHT }

    imagePoint = timeLineCoordinateSystem.transformThisPoint(currentCorner)
    imagePoint = transformThisPoint(imagePoint, thisObject.container)

    let offSet = 0
    let imagePosition = {
      x: 0,
      y: 0
    }

    for (let j = 0; j < MAX_ROWS; j++) {
      if (offSet === -imageWidth * 8) {
        offSet = -imageWidth * 4 - imageWidth
      } else {
        offSet = -imageWidth * 8
      }

      for (let i = 0; i < MAX_COLUMNS; i = i + 4) {
        let logo = logoA

        imagePosition.x = imagePoint.x + i * imageWidth * 2 + offSet
        imagePosition.y = imagePoint.y + j * rowHight + Y_TOP_MARGIN

        if (
          imagePosition.x > fromPoint.x &&
          imagePosition.x + imageWidth < toPoint.x &&
          imagePosition.y > fromPoint.y &&
          imagePosition.y + imageHeight < toPoint.y
        ) {
          let checkPoint = {
            x: imagePosition.x,
            y: imagePosition.y + imageHeight
          }

          checkPoint = thisObject.fitFunction(checkPoint)
          if (checkPoint.y === imagePosition.y + imageHeight) {
            browserCanvasContext.drawImage(logo, imagePosition.x, imagePosition.y, imageWidth, imageHeight)
          }
        }
      }
    }

    offSet = 0

    for (let j = 0; j < MAX_ROWS; j++) {
      if (offSet === -imageWidth * 8) {
        offSet = -imageWidth * 4 - imageWidth
      } else {
        offSet = -imageWidth * 8
      }

      for (let i = 1; i < MAX_COLUMNS; i = i + 4) {
        let logo = logoB

        imagePosition.x = imagePoint.x + i * imageWidth * 2 + offSet
        imagePosition.y = imagePoint.y + j * rowHight + Y_TOP_MARGIN

        if (
          imagePosition.x > fromPoint.x &&
          imagePosition.x + imageWidth < toPoint.x &&
          imagePosition.y > fromPoint.y &&
          imagePosition.y + imageHeight < toPoint.y
        ) {
          let checkPoint = {
            x: imagePosition.x,
            y: imagePosition.y + imageHeight
          }

          checkPoint = thisObject.fitFunction(checkPoint)
          if (checkPoint.y === imagePosition.y + imageHeight) {
            browserCanvasContext.drawImage(logo, imagePosition.x, imagePosition.y, imageWidth, imageHeight)
          }
        }
      }
    }

    offSet = 0

    for (let j = 0; j < MAX_ROWS; j++) {
      if (offSet === -imageWidth * 8) {
        offSet = -imageWidth * 4 - imageWidth
      } else {
        offSet = -imageWidth * 8
      }

      for (let i = 2; i < MAX_COLUMNS; i = i + 4) {
        let logo = logoExchange

        imagePosition.x = imagePoint.x + i * imageWidth * 2 + offSet
        imagePosition.y = imagePoint.y + j * rowHight + Y_TOP_MARGIN

        if (
          imagePosition.x > fromPoint.x &&
          imagePosition.x + imageWidth < toPoint.x &&
          imagePosition.y > fromPoint.y &&
          imagePosition.y + imageHeight < toPoint.y
        ) {
          let checkPoint = {
            x: imagePosition.x,
            y: imagePosition.y + imageHeight
          }

          checkPoint = thisObject.fitFunction(checkPoint)
          if (checkPoint.y === imagePosition.y + imageHeight) {
            browserCanvasContext.drawImage(logo, imagePosition.x, imagePosition.y, imageWidth, imageHeight)
          }
        }
      }
    }

    offSet = 0

    for (let j = 0; j < MAX_ROWS; j++) {
      if (offSet === -imageWidth * 8) {
        offSet = -imageWidth * 4 - imageWidth
      } else {
        offSet = -imageWidth * 8
      }

      for (let i = 3; i < MAX_COLUMNS; i = i + 4) {
        let logo = logoAA

        imagePosition.x = imagePoint.x + i * imageWidth * 2 + offSet
        imagePosition.y = imagePoint.y + j * rowHight + Y_TOP_MARGIN

        if (
          imagePosition.x > fromPoint.x &&
          imagePosition.x + imageWidth < toPoint.x &&
          imagePosition.y > fromPoint.y &&
          imagePosition.y + imageHeight < toPoint.y
        ) {
          let checkPoint = {
            x: imagePosition.x,
            y: imagePosition.y + imageHeight
          }

          checkPoint = thisObject.fitFunction(checkPoint)
          if (checkPoint.y === imagePosition.y + imageHeight) {
            browserCanvasContext.drawImage(logo, imagePosition.x, imagePosition.y, imageWidth, imageHeight)
          }
        }
      }
    }
  }
}
