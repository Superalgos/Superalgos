 ﻿/*

Markets are a function of time. When watching them, end users must be positioned at one particular point in time. The system currently allows users
to position themselves at any time they like.

In the future, it will be usefull to explore markets and compare them at different times simultaneously. Anticipating that future this module exists.
All the charts that depand on a datetime are children of this object Time Machine. In the future we will allow users to have more than one Time Machine,
each one with it own charts, and each one positioned at an especific point in titme.

*/

function newTimeMachine () {
  const MODULE_NAME = 'Time Machine'
  const INFO_LOG = false
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    container: undefined,
    drawBackground: drawBackground,
    draw: draw,
    charts: [],
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isDraggeable = false
  thisObject.container.detectMouseOver = true

  thisObject.container.frame.width = TIME_MACHINE_WIDTH
  thisObject.container.frame.height = TIME_MACHINE_HEIGHT * canvas.bottomSpace.chartAspectRatio.aspectRatio.y

  thisObject.container.frame.position.x = browserCanvas.width / 2 - TIME_MACHINE_WIDTH / 2
  thisObject.container.frame.position.y = browserCanvas.height / 2 - TIME_MACHINE_HEIGHT / 2

  let controlPanelHandle             // We need this to destroy the Panel when this object is itself destroyed or no longer needs it...
                                    // ... also to request a reference to the object for the cases we need it.
  const SEPARATION_BETWEEN_TIMELINE_CHARTS = 1.5

  let timeScale
  let rigthScale

  return thisObject

  function finalize () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }

      for (let i = 0; i < thisObject.charts.length; i++) {
        let chart = thisObject.charts[i]
        chart.finalize()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize (callBackFunction) {
    if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }

      /* Each Time Machine has a Control Panel. */

    let panelOwner = 'Global'
    controlPanelHandle = canvas.panelsSpace.createNewPanel('Time Control Panel', undefined, panelOwner)
    let controlPanel = canvas.panelsSpace.getPanel(controlPanelHandle, panelOwner)

       /* Each Time Machine has a Time Scale. */

    timeScale = newTimeScale()
    timeScale.initialize()

    timeScale.container.eventHandler.listenToEvent('Lenght Percentage Changed', function (event) {
      thisObject.container.frame.width = TIME_MACHINE_WIDTH * event.lenghtPercentage / 100
      thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
    })

    rigthScale = newRigthScale()
    rigthScale.initialize()

    rigthScale.container.eventHandler.listenToEvent('Height Percentage Changed', function (event) {
      thisObject.container.frame.height = TIME_MACHINE_HEIGHT * event.heightPercentage / 100
      thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
    })

      /* First, we initialize the market that we are going to show first on screen. Later all the other markets will be initialized on the background. */

    let position = 0 // This defines the position of each chart respect to each other.

    let timelineChart = newTimelineChart()

    timelineChart.container.connectToParent(thisObject.container, true, true)

    timelineChart.container.frame.height = thisObject.container.frame.height

    timelineChart.container.frame.position.x = thisObject.container.frame.width / 2 - timelineChart.container.frame.width / 2
    timelineChart.container.frame.position.y = timelineChart.container.frame.height * SEPARATION_BETWEEN_TIMELINE_CHARTS * position

    position++

    timelineChart.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, onDefaultInitialized)

    function onDefaultInitialized (err) {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> onDefaultInitialized -> Entering function.') }

      if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
        if (INFO_LOG === true) { logger.write('[INFO] initialize -> onDefaultInitialized -> Initialization of the only market failed.') }

        callBackFunction(err)
        return
      }

      thisObject.charts.push(timelineChart)

      controlPanel.container.eventHandler.listenToEvent('Datetime Changed', timelineChart.setDatetime, undefined)
      timelineChart.container.eventHandler.listenToEvent('Datetime Changed', controlPanel.setDatetime)

      initializeTheRest()
    }

    function initializeTheRest () {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> initializeTheRest -> Entering function.') }

      let leftToInitialize = SUPPORTED_EXCHANGES.length * SUPPORTED_MARKETS.length - 1 // The default exchange and market was already initialized.
      let alreadyInitialized = 0

      if (alreadyInitialized === leftToInitialize) {
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
        return
      }

      for (let i = 0; i < SUPPORTED_EXCHANGES.length; i++) {
        for (let j = 0; j < SUPPORTED_MARKETS.length; j++) {
          let exchange = SUPPORTED_EXCHANGES[i]
          let market = SUPPORTED_MARKETS[j]

          if (
            exchange === DEFAULT_EXCHANGE &&
            market.assetA === DEFAULT_MARKET.assetA &&
            market.assetB === DEFAULT_MARKET.assetB
          ) { continue }

          initializeTimelineChart(exchange, market)
        }
      }

      function initializeTimelineChart (exchange, market) {
        if (INFO_LOG === true) { logger.write('[INFO] initialize -> initializeTheRest -> initializeTimelineChart -> Entering function.') }

        let timelineChart = newTimelineChart()

        timelineChart.container.connectToParent(thisObject.container, true, true)

        timelineChart.container.frame.height = thisObject.container.frame.height

        timelineChart.container.frame.position.x = thisObject.container.frame.width / 2 - timelineChart.container.frame.width / 2
        timelineChart.container.frame.position.y = timelineChart.container.frame.height * SEPARATION_BETWEEN_TIMELINE_CHARTS * position

        position++

        timelineChart.initialize(exchange, market, finalSteps)

        function finalSteps () {
          if (INFO_LOG === true) { logger.write('[INFO] initialize -> initializeTheRest -> initializeTimelineChart -> finalSteps -> Entering function.') }

          thisObject.charts.push(timelineChart)

          controlPanel.container.eventHandler.listenToEvent('Datetime Changed', timelineChart.setDatetime, undefined)
          timelineChart.container.eventHandler.listenToEvent('Datetime Changed', controlPanel.setDatetime)

          alreadyInitialized++

          if (alreadyInitialized === leftToInitialize) {
            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
          }
        }
      }
    }
  }

  function drawBackground () {
    for (let i = 0; i < this.charts.length; i++) {
      let chart = this.charts[i]
      chart.drawBackground()
    }
  }

  function draw () {
    // this.container.frame.draw(false, false)

    for (let i = 0; i < this.charts.length; i++) {
      let chart = this.charts[i]
      chart.draw()
    }

    timeScale.draw()
    rigthScale.draw()
  }

  function getContainer (point, purpose) {
    let container

    container = timeScale.getContainer(point)
    if (container !== undefined) {
      if (container.isForThisPurpose(purpose)) {
        return container
      }
    }

    container = rigthScale.getContainer(point)
    if (container !== undefined) {
      if (container.isForThisPurpose(purpose)) {
        return container
      }
    }

    for (let i = 0; i < this.charts.length; i++) {
      container = this.charts[i].getContainer(point)
      if (container !== undefined) {
        if (container.isForThisPurpose(purpose)) {
          return container
        }
      }
    }
    return this.container
  }
}
