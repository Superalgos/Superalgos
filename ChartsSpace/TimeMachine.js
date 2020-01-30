/*

Markets are a function of time. When watching them, end users must be positioned at one particular point in time. The system currently allows users
to position themselves at any time they like.

In the future, it will be usefull to explore markets and compare them at different times simultaneously. Anticipating that future this module exists.
All the timelineCharts that depand on a datetime are children of this object Time Machine. In the future we will allow users to have more than one Time Machine,
each one with it own timelineCharts, and each one positioned at an especific point in titme.

*/

function newTimeMachine () {
  const MODULE_NAME = 'Time Machine'
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let timeFrame = INITIAL_TIME_PERIOD

  let thisObject = {
    container: undefined,
    timeScale: undefined,
    rateScale: undefined,
    payload: undefined,
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

  let mouse = {
    position: {
      x: 0,
      y: 0
    }
  }

  let drawScales = false
  let syncWithDesignerLoop = 0
  let timelineChartsMap = new Map()

  let onViewportPositionChangedEventSuscriptionId
  let onViewportZoomChangedEventSuscriptionId
  let onMouseOverEventSuscriptionId
  let onMouseNotOverEventSuscriptionId
  let timeScaleValueEventSuscriptionId
  let timeScaleMouseOverEventSuscriptionId
  let rateScaleValueEventSuscriptionId
  let rateScaleMouseOverEventSuscriptionId
  let timeFrameScaleEventSuscriptionId
  let timeFrameScaleMouseOverEventSuscriptionId

  setupContainer()
  return thisObject

  function setupContainer () {
    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.fitFunction = thisObject.fitFunction
    thisObject.container.isDraggeable = true
    thisObject.container.insideViewport = true
    thisObject.container.detectMouseOver = true

    thisObject.container.frame.width = TIME_MACHINE_WIDTH
    thisObject.container.frame.height = TIME_MACHINE_HEIGHT
  }

  function finalize () {
    canvas.chartSpace.viewport.eventHandler.stopListening(onViewportPositionChangedEventSuscriptionId)
    canvas.chartSpace.viewport.eventHandler.stopListening(onViewportZoomChangedEventSuscriptionId)

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

    mouse = undefined
    timelineChartsMap = undefined
    timeMachineCoordinateSystem = undefined
  }

  function finalizeTimeScale () {
    if (thisObject.timeScale === undefined) { return }

    thisObject.timeScale.container.eventHandler.stopListening(timeScaleValueEventSuscriptionId)
    thisObject.timeScale.container.eventHandler.stopListening(timeScaleMouseOverEventSuscriptionId)
    thisObject.timeScale.finalize()
    thisObject.timeScale = undefined
  }

  function finalizeRateScale () {
    if (thisObject.rateScale === undefined) { return }

    thisObject.rateScale.container.eventHandler.stopListening(rateScaleValueEventSuscriptionId)
    thisObject.rateScale.container.eventHandler.stopListening(rateScaleMouseOverEventSuscriptionId)
    thisObject.rateScale.finalize()
    thisObject.rateScale = undefined
  }

  function finalizeTimeFrameScale () {
    if (thisObject.timeFrameScale === undefined) { return }

    thisObject.timeFrameScale.container.eventHandler.stopListening(timeFrameScaleEventSuscriptionId)
    thisObject.timeFrameScale.container.eventHandler.stopListening(timeFrameScaleMouseOverEventSuscriptionId)
    thisObject.timeFrameScale.finalize()
    thisObject.timeFrameScale = undefined
  }

  function initialize (callBackFunction) {
    timeFrame = INITIAL_TIME_PERIOD
    loadFrame(thisObject.payload, thisObject.container.frame)

    recalculateCoordinateSystem()
    recalculateCurrentDatetime()

    onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    onMouseNotOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)

    onViewportPositionChangedEventSuscriptionId = canvas.chartSpace.viewport.eventHandler.listenToEvent('Position Changed', onViewportPositionChanged)
    onViewportZoomChangedEventSuscriptionId = canvas.chartSpace.viewport.eventHandler.listenToEvent('Zoom Changed', onViewportZoomChanged)

    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
  }

  function onMouseOver (event) {
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

  function onMouseNotOver (event) {
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

  function initializeTimeScale () {
    thisObject.timeScale = newTimeScale()
    thisObject.timeScale.fitFunction = thisObject.fitFunction
    thisObject.timeScale.payload = thisObject.payload.node.timeScale.payload

    timeScaleValueEventSuscriptionId = thisObject.timeScale.container.eventHandler.listenToEvent('Time Scale Value Changed', timeScaleValueChanged)
    timeScaleMouseOverEventSuscriptionId = thisObject.timeScale.container.eventHandler.listenToEvent('onMouseOverScale', timeScaleMouseOver)
    thisObject.timeScale.initialize(timeMachineCoordinateSystem, thisObject.container)

    function timeScaleValueChanged (event) {
      if (event.isUserAction === true) {
        let currentDate = getDateFromPoint(event.mousePosition, thisObject.container, timeMachineCoordinateSystem)
        let currentRate = getRateFromPoint(event.mousePosition, thisObject.container, timeMachineCoordinateSystem)
        thisObject.container.frame.width = TIME_MACHINE_WIDTH + TIME_MACHINE_WIDTH * event.scale
        recalculateCoordinateSystem()
        moveToUserPosition(thisObject.container, currentDate, currentRate, timeMachineCoordinateSystem, false, true, event.mousePosition)
      } else {
        thisObject.container.frame.width = TIME_MACHINE_WIDTH + TIME_MACHINE_WIDTH * event.scale
        recalculateCoordinateSystem()
      }
      thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
    }
    function timeScaleMouseOver (event) {
      thisObject.container.eventHandler.raiseEvent('onMouseOver', event)
    }
  }

  function initializeRateScale () {
    thisObject.rateScale = newRateScale()
    thisObject.rateScale.fitFunction = thisObject.fitFunction
    thisObject.rateScale.payload = thisObject.payload.node.rateScale.payload

    rateScaleValueEventSuscriptionId = thisObject.rateScale.container.eventHandler.listenToEvent('Rate Scale Value Changed', rateScaleValueChanged)
    rateScaleMouseOverEventSuscriptionId = thisObject.rateScale.container.eventHandler.listenToEvent('onMouseOverScale', rateScaleMouseOver)
    thisObject.rateScale.initialize(timeMachineCoordinateSystem, thisObject.container, thisObject.container)

    function rateScaleValueChanged (event) {
      if (event.isUserAction === true) {
        let currentDate = getDateFromPoint(event.mousePosition, thisObject.container, timeMachineCoordinateSystem)
        let currentRate = getRateFromPoint(event.mousePosition, thisObject.container, timeMachineCoordinateSystem)

        thisObject.container.frame.height = TIME_MACHINE_HEIGHT + TIME_MACHINE_HEIGHT * event.scale
        recalculateCoordinateSystem()
        moveToUserPosition(thisObject.container, currentDate, currentRate, timeMachineCoordinateSystem, true, false, event.mousePosition)
      } else {
        thisObject.container.frame.height = TIME_MACHINE_HEIGHT + TIME_MACHINE_HEIGHT * event.scale
        recalculateCoordinateSystem()
      }
      thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
      thisObject.container.eventHandler.raiseEvent('Upstream Rate Scale Value Changed', event)
    }
    function rateScaleMouseOver (event) {
      thisObject.container.eventHandler.raiseEvent('onMouseOver', event)
    }
  }

  function initializeTimeFrameScale () {
    thisObject.timeFrameScale = newTimeFrameScale()
    thisObject.timeFrameScale.fitFunction = thisObject.fitFunction
    thisObject.timeFrameScale.payload = thisObject.payload.node.timeFrameScale.payload

    timeFrameScaleEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('Time Frame Value Changed', timeFrameScaleValueChanged)
    timeFrameScaleMouseOverEventSuscriptionId = thisObject.timeFrameScale.container.eventHandler.listenToEvent('onMouseOverScale', timeFrameScaleMouseOver)
    thisObject.timeFrameScale.initialize(thisObject.container)

    function timeFrameScaleValueChanged (event) {
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
    function timeFrameScaleMouseOver (event) {
      thisObject.container.eventHandler.raiseEvent('onMouseOver', event)
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

    if (thisObject.timeScale !== undefined && thisObject.timeScale.isVisible === true) {
      container = thisObject.timeScale.getContainer(point)
      if (container !== undefined) {
        if (container.isForThisPurpose(purpose)) {
          return container
        }
      }
    }

    if (thisObject.timeFrameScale !== undefined && thisObject.rateScale.isVisible === true) {
      container = thisObject.timeFrameScale.getContainer(point)
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
        }
      }
    }

    if (thisObject.container.frame.isThisPointHere(point) === true) {
      return thisObject.container
    }
  }

  function onViewportZoomChanged (event) {
    if (thisObject.container.frame.isInViewPort()) {
      recalculateCurrentDatetime()
    }
  }

  function onViewportPositionChanged () {
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
      x: (canvas.chartSpace.viewport.visibleArea.bottomRight.x - canvas.chartSpace.viewport.visibleArea.bottomLeft.x) / 2,
      y: (canvas.chartSpace.viewport.visibleArea.bottomRight.y - canvas.chartSpace.viewport.visibleArea.topRight.y) / 2
    }

    center = unTransformThisPoint(center, thisObject.container)
    center = timeMachineCoordinateSystem.unInverseTransform(center, thisObject.container.frame.height)

    datetime = new Date(center.x)

    for (let i = 0; i < thisObject.timelineCharts.length; i++) {
      let timelineChart = thisObject.timelineCharts[i]
      timelineChart.setDatetime(datetime)
    }
  }

  function fitFunction (point, fullVisible, margin, topMargin, bottomMargin) {
     /* We prevent a point to be out of the container AND out of the Chart Space in general */

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

    upCorner = transformThisPoint(upCorner, thisObject.container)
    bottonCorner = transformThisPoint(bottonCorner, thisObject.container)

    /* Checking against the container limits. */
    if (margin === undefined) { margin = 0 }
    if (topMargin === undefined) { topMargin = 0 }
    if (bottomMargin === undefined) { bottomMargin = 0 }

    if (returnPoint.x - margin < upCorner.x) { returnPoint.x = upCorner.x + margin }
    if (returnPoint.x + margin > bottonCorner.x) { returnPoint.x = bottonCorner.x - margin }
    if (returnPoint.y - margin - topMargin < upCorner.y) { returnPoint.y = upCorner.y + margin + topMargin }
    if (returnPoint.y + margin + bottomMargin > bottonCorner.y) { returnPoint.y = bottonCorner.y - margin - bottomMargin }

    returnPoint = canvas.chartSpace.fitFunction(returnPoint, fullVisible)

    return returnPoint
  }

  function physics () {
    if (thisObject.container.frame.isInViewPort()) {
      thisObjectPhysics()
      childrenPhysics()
      syncWithDesigner()
      saveFrame(thisObject.payload, thisObject.container.frame)
    }
    panelPhysics()
  }

  function panelPhysics () {
    if (thisObject.container.frame.isInViewPort()) {
      canvas.panelsSpace.makeVisible(thisObject.payload.node.id, 'Layers Panel')
    } else {
      canvas.panelsSpace.makeInvisible(thisObject.payload.node.id, 'Layers Panel')
    }
  }

  function syncWithDesigner () {
    syncWithDesignerTimelineCharts()
    syncWithDesignerScales()
  }

  function syncWithDesignerScales () {
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

  function syncWithDesignerTimelineCharts () {
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

    function initializeTimelineChart (node, syncWithDesignerLoop) {
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
      timelineChart.initialize(timeMachineCoordinateSystem)

      /* we will store the event suscription id as a property of the timelineChart, to avoid keeping it an a separate array */
      timelineChart.onChildrenMouseOverEventSuscriptionId = timelineChart.container.eventHandler.listenToEvent('onChildrenMouseOver', onChildrenMouseOver)

      thisObject.timelineCharts.push(timelineChart)
      timelineChart.payload.uiObject.setValue('')

      function onChildrenMouseOver (event) {
        thisObject.container.eventHandler.raiseEvent('onMouseOver', event)
      }
    }
  }

  function thisObjectPhysics () {
    /* Screen Corner Date Calculation */

    let point = {
      x: 0,
      y: 0
    }

    let cornerDate = getDateFromPoint(point, thisObject.container, timeMachineCoordinateSystem)
    cornerDate = new Date(cornerDate)
    window.localStorage.setItem('Date @ Screen Corner', cornerDate.toUTCString())
  }

  function childrenPhysics () {
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

  function drawBackground () {
    drawChartsBackground()
    if (thisObject.container.frame.isInViewPort()) {
      for (let i = 0; i < thisObject.timelineCharts.length; i++) {
        let timelineChart = thisObject.timelineCharts[thisObject.timelineCharts.length - i - 1]
        timelineChart.drawBackground()
      }
    }
  }

  function drawChartsBackground () {
    drawContainerBackground(thisObject.container, UI_COLOR.WHITE, 0.5, thisObject.fitFunction)
  }

  function draw () {
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
      let icon = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.type)
      if (icon !== undefined) {
        if (icon.canDrawIcon === true) {
          let imageSize = 40
          let imagePosition = {
            x: thisObject.container.frame.width / 2,
            y: thisObject.container.frame.height / 2
          }

          imagePosition = transformThisPoint(imagePosition, thisObject.container)
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

  function drawForeground () {
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

      let style = {
        color: UI_COLOR.BLACK,
        opacity: 1,
        lineWidth: 1,
        lineDash: [1, 3]
      }
      thisObject.container.frame.draw(false, true, false, thisObject.fitFunction, style)
    }
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

    timeMachineCoordinateSystem.initialize(
          minValue,
          maxValue,
          thisObject.container.frame.width,
          thisObject.container.frame.height
      )
  }
}
