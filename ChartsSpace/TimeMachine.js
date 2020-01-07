/*

Markets are a function of time. When watching them, end users must be positioned at one particular point in time. The system currently allows users
to position themselves at any time they like.

In the future, it will be usefull to explore markets and compare them at different times simultaneously. Anticipating that future this module exists.
All the charts that depand on a datetime are children of this object Time Machine. In the future we will allow users to have more than one Time Machine,
each one with it own charts, and each one positioned at an especific point in titme.

*/

function newTimeMachine () {
  const MODULE_NAME = 'Time Machine'
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    container: undefined,
    timeScale: undefined,
    rateScale: undefined,
    fitFunction: undefined,
    charts: [],
    physics: physics,
    drawBackground: drawBackground,
    draw: draw,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize,
    finalize: finalize
  }

  const SEPARATION_BETWEEN_TIMELINE_CHARTS = 1.5

  let timeLineCoordinateSystem = newTimeLineCoordinateSystem()

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
    thisObject.container.isDraggeable = false
    thisObject.container.detectMouseOver = true

    thisObject.container.frame.width = TIME_MACHINE_WIDTH
    thisObject.container.frame.height = TIME_MACHINE_HEIGHT

    thisObject.container.frame.position.x = browserCanvas.width / 2 - TIME_MACHINE_WIDTH / 2
    thisObject.container.frame.position.y = browserCanvas.height / 2 - TIME_MACHINE_HEIGHT / 2
  }

  function finalize () {
    for (let i = 0; i < thisObject.charts.length; i++) {
      let chart = thisObject.charts[i]
      chart.finalize()
    }

    thisObject.charts = []

    if (thisObject.timeScale !== undefined) {
      thisObject.timeScale.finalize()
      thisObject.timeScale = undefined
    }
    if (thisObject.rateScale !== undefined) {
      thisObject.rateScale.finalize()
      thisObject.rateScale = undefined
    }

    thisObject.fitFunction = undefined

    thisObject.container.finalize()
    thisObject.container = undefined
    setupContainer()
  }

  function initialize (callBackFunction) {
    recalculateScale()

     /* First, we initialize the market that we are going to show first on screen. Later all the other markets will be initialized on the background. */

    let position = 0 // This defines the position of each chart respect to each other.

    let timelineChart = newTimelineChart()

    timelineChart.container.connectToParent(thisObject.container, true, true, false, true, true, true)
    timelineChart.container.frame.height = thisObject.container.frame.height

    timelineChart.container.frame.position.x = thisObject.container.frame.width / 2 - timelineChart.container.frame.width / 2
    timelineChart.container.frame.position.y = timelineChart.container.frame.height * SEPARATION_BETWEEN_TIMELINE_CHARTS * position

    position++

    timelineChart.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, timeLineCoordinateSystem, onDefaultInitialized)

    function onDefaultInitialized (err) {
      if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
        callBackFunction(err)
        return
      }

      thisObject.charts.push(timelineChart)

     /* Each Time Machine has a Time Scale and a Right Scale. */

      thisObject.timeScale = newTimeScale()
      thisObject.timeScale.fitFunction = thisObject.fitFunction

      thisObject.timeScale.container.eventHandler.listenToEvent('Lenght Percentage Changed', function (event) {
        thisObject.container.frame.width = TIME_MACHINE_WIDTH * event.lenghtPercentage / 100
        recalculateScale()
        moveToUserPosition(thisObject.container, timeLineCoordinateSystem, false, true, event.mousePosition)
        thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
      })

      thisObject.timeScale.initialize()

      thisObject.rateScale = newRateScale()
      thisObject.rateScale.fitFunction = thisObject.fitFunction

      thisObject.rateScale.container.eventHandler.listenToEvent('Height Percentage Changed', function (event) {
        thisObject.container.frame.height = TIME_MACHINE_HEIGHT * event.heightPercentage / 100
        recalculateScale()
        moveToUserPosition(thisObject.container, timeLineCoordinateSystem, true, false, event.mousePosition)
        thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
      })

      thisObject.rateScale.initialize()

      thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)

      initializeTheRest()
    }

    function onMouseOver (event) {
      thisObject.timeScale.visible = true
      thisObject.rateScale.visible = true

      mouse.position.x = event.x
      mouse.position.y = event.y
    }

    function initializeTheRest () {
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
           market.baseAsset === DEFAULT_MARKET.baseAsset &&
           market.quotedAsset === DEFAULT_MARKET.quotedAsset
         ) { continue }

          initializeTimelineChart(exchange, market)
        }
      }

      function initializeTimelineChart (exchange, market) {
        let timelineChart = newTimelineChart()

        timelineChart.container.connectToParent(thisObject.container, true, true, false, true, true, true)

        timelineChart.container.frame.height = thisObject.container.frame.height

        timelineChart.container.frame.position.x = thisObject.container.frame.width / 2 - timelineChart.container.frame.width / 2
        timelineChart.container.frame.position.y = timelineChart.container.frame.height * SEPARATION_BETWEEN_TIMELINE_CHARTS * position

        position++

        timelineChart.initialize(exchange, market, timeLineCoordinateSystem, finalSteps)

        function finalSteps () {
          thisObject.charts.push(timelineChart)

          alreadyInitialized++

          if (alreadyInitialized === leftToInitialize) {
            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
          }
        }
      }
    }
  }

  function getContainer (point, purpose) {
    let container

    if (thisObject.timeScale !== undefined) {
      container = thisObject.timeScale.getContainer(point)
      if (container !== undefined) {
        if (container.isForThisPurpose(purpose)) {
          return container
        }
      }
    }

    if (thisObject.rateScale !== undefined) {
      container = thisObject.rateScale.getContainer(point)
      if (container !== undefined) {
        if (container.isForThisPurpose(purpose)) {
          return container
        }
      }
    }

    for (let i = 0; i < this.charts.length; i++) {
      container = this.charts[i].getContainer(point)
      if (container !== undefined) {
        if (container.isForThisPurpose(purpose)) {
          if (thisObject.container.frame.isThisPointHere(point) === true) {
            return container
          }
        }
      }
    }

    if (thisObject.container.frame.isThisPointHere(point) === true) {
      return thisObject.container
    } else {
      if (purpose === GET_CONTAINER_PURPOSE.MOUSE_OVER) {
        thisObject.container.eventHandler.raiseEvent('onMouseNotOver')
        if (thisObject.timeScale !== undefined) {
          thisObject.timeScale.visible = false
        }
        if (thisObject.rateScale !== undefined) {
          thisObject.rateScale.visible = false
        }
      }
      return
    }
  }

  function physics () {
    thisObjectPhysics()
    childrenPhysics()
  }

  function thisObjectPhysics () {
    /* Screen Corner Date Calculation */

    let point = {
      x: 0,
      y: 0
    }

    let cornerDate = getDateFromPoint(point, thisObject.container, timeLineCoordinateSystem)
    cornerDate = new Date(cornerDate)
    window.localStorage.setItem('Date @ Screen Corner', cornerDate.toUTCString())
  }

  function childrenPhysics () {
    if (thisObject.timeScale === undefined) { return }
    if (thisObject.rateScale === undefined) { return }

    thisObject.timeScale.physics()
    thisObject.rateScale.physics()

    for (let i = 0; i < thisObject.charts.length; i++) {
      let chart = thisObject.charts[i]
      chart.physics()
    }

    /* Mouse Position Date Calculation */

    let timePoint = {
      x: mouse.position.x,
      y: 0
    }

    let mouseDate = getDateFromPoint(timePoint, thisObject.container, timeLineCoordinateSystem)

    thisObject.timeScale.date = new Date(mouseDate)

    /* Mouse Position Rate Calculation */

    let ratePoint = {
      x: 0,
      y: mouse.position.y
    }

    let mouseRate = getRateFromPoint(ratePoint, thisObject.container, timeLineCoordinateSystem)

    thisObject.rateScale.rate = mouseRate

    /* timeScale Positioning */

    thisObject.timeScale.container.frame.position.x = mouse.position.x - thisObject.timeScale.container.frame.width / 2

    timePoint = {
      x: 0,
      y: 0
    }

    timePoint = transformThisPoint(timePoint, thisObject.container.frame.container)
    timePoint = thisObject.container.fitFunction(timePoint)

    thisObject.timeScale.container.frame.position.y = timePoint.y

    /* rateScale Positioning */

    thisObject.rateScale.container.frame.position.y = mouse.position.y - thisObject.rateScale.container.frame.height / 2

    ratePoint = {
      x: 10000000000000,
      y: 0
    }

    ratePoint = transformThisPoint(ratePoint, thisObject.container.frame.container)
    ratePoint = thisObject.container.fitFunction(ratePoint)

    thisObject.rateScale.container.frame.position.x = ratePoint.x - thisObject.rateScale.container.frame.width
  }

  function drawBackground () {
    thisBackground()

    if (thisObject.container.frame.isInViewPort()) {
      for (let i = 0; i < this.charts.length; i++) {
        let chart = this.charts[i]
        chart.drawBackground()
      }
    }
  }

  function draw () {
    if (thisObject.container.frame.isInViewPort()) {
      for (let i = 0; i < this.charts.length; i++) {
        let chart = this.charts[i]
        chart.draw()
      }

      if (thisObject.timeScale !== undefined) { thisObject.timeScale.draw() }
      if (thisObject.rateScale !== undefined) { thisObject.rateScale.draw() }

     // thisObject.container.frame.draw(false, true, false)
    }
  }

  function thisBackground () {
    return
    let params = {
      cornerRadius: 15,
      lineWidth: 5,
      opacity: 1,
      container: thisObject.container,
      borderColor: UI_COLOR.RUSTED_RED,
      backgroundColor: UI_COLOR.WHITE,
      fitFunction: thisObject.fitFunction,
      coordinateSystem: timeLineCoordinateSystem
    }

    roundedCornersBackground(params)
  }

  function recalculateScale () {
    let minValue = {
      x: MIN_PLOTABLE_DATE.valueOf(),
      y: 0
    }

    let maxValue = {
      x: MAX_PLOTABLE_DATE.valueOf(),
      y: nextPorwerOf10(USDT_BTC_HTH) / 4
    }

    timeLineCoordinateSystem.initialize(
          minValue,
          maxValue,
          thisObject.container.frame.width,
          thisObject.container.frame.height
      )
  }
}
