
function newCircularProgressBar () {
  const MODULE_NAME = 'Circular Progress Bar'

  let thisObject = {
    container: undefined,
    isDeployed: undefined,
    physics: physics,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME, 'Circle')
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0

  let opacityCounters = []

  let eventSubscriptionIdHeartbeat

  let needToDrawRing = true

  return thisObject

  function finalize () {
    let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
    if (eventSubscriptionIdHeartbeat !== undefined) {
      systemEventHandler.stopListening(key, eventSubscriptionIdHeartbeat)
    }

    thisObject.container = undefined
    thisObject.payload = undefined
    thisObject.fitFunction = undefined
  }

  function initialize (payload) {
    thisObject.payload = payload

    for (let i = 0; i < 60; i++) {
      opacityCounters.push(0)
    }

    let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
    systemEventHandler.listenToEvent(key, 'Heartbeat', undefined, key, onResponse, onHeartBeat)

    function onResponse (message) {
      eventSubscriptionIdHeartbeat = message.eventSubscriptionId
    }
  }

  function onHeartBeat (message) {
    if (thisObject.payload === undefined) { return }
    if (thisObject.payload.uiObject === undefined) { return }
    opacityCounters[message.event.seconds] = 2000
    if (message.event.processingDate !== undefined) {
      thisObject.payload.uiObject.setValue(message.event.processingDate, 2000)
    }
    if (message.event.percentage !== undefined) {
      thisObject.payload.uiObject.setPercentage(message.event.percentage, 2000)
    }
    if (message.event.status !== undefined) {
      needToDrawRing = false
      thisObject.payload.uiObject.setStatus(message.event.status, 200000)
    }

    thisObject.payload.uiObject.heartBeat()
  }

  function getContainer (point) {
    if (canvas.floatingSpace.inMapMode === true) { return }
    let container

    for (let i = 0; i < menuItems.length; i++) {
      let menutItem = menuItems[i]
      container = menutItem.getContainer(point)
      if (container !== undefined) { return container }
    }
  }

  function physics () {
    for (let i = 0; i < 60; i++) {
      opacityCounters[i] = opacityCounters[i] - 2

      if (opacityCounters[i] < 0) {
        opacityCounters[i] = 0
      }
    }
  }

  function drawForeground (pFloatingObject) {

  }

  function drawBackground (pFloatingObject) {
    if (canvas.floatingSpace.inMapMode === true) { return }
    if (needToDrawRing !== true) { return }

    const VISIBLE_RADIUS = thisObject.container.frame.radius * 2

    let visiblePosition = {
      x: thisObject.container.frame.position.x,
      y: thisObject.container.frame.position.y
    }

    visiblePosition = thisObject.container.frame.frameThisPoint(visiblePosition)
    visiblePosition = thisObject.fitFunction(visiblePosition)

    for (let i = 0; i < 60; i++) {
      let OPACITY = opacityCounters[i] / 1000

      if (OPACITY === 0) { continue }

      let initialAngle = Math.PI * 2 / 60 * i - Math.PI / 2
      let finalAngle = Math.PI * 2 / 60 * (i + 1) - Math.PI / 2

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, initialAngle, finalAngle, false)
      browserCanvasContext.closePath()

      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + OPACITY * 2 + ')'
      browserCanvasContext.lineWidth = 6 + opacityCounters[i] / 100 / 2
      browserCanvasContext.setLineDash([3, 4])
      browserCanvasContext.stroke()

      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + OPACITY + ')'
      browserCanvasContext.lineWidth = 0 + opacityCounters[i] / 100 / 2
      browserCanvasContext.setLineDash([3, 4])
      browserCanvasContext.stroke()
    }
  }
}
