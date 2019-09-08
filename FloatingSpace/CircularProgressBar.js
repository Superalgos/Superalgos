
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

  return thisObject

  function finalize () {
    thisObject.container = undefined

    thisObject.payload = undefined
    thisObject.fitFunction = undefined
  }

  function initialize (payload) {
    thisObject.payload = payload

    for (let i = 0; i < 60; i++) {
      opacityCounters.push(0)
    }

    let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type
    systemEventHandler.createEventHandler(key)
    systemEventHandler.listenToEvent(key, 'Heartbeat', undefined, key, undefined, onHeartBeat)
  }

  function onHeartBeat (message) {
    opacityCounters[message.event.seconds] = 2000
  }

  function getContainer (point) {
    let container

    for (let i = 0; i < menuItems.length; i++) {
      let menutItem = menuItems[i]
      container = menutItem.getContainer(point)
      if (container !== undefined) { return container }
    }
  }

  function physics () {
    for (let i = 0; i < 60; i++) {
      opacityCounters[i]--

      if (opacityCounters[i] < 0) {
        opacityCounters[i] = 0
      }
    }
  }

  function drawBackground (pFloatingObject) {
    const VISIBLE_RADIUS = thisObject.container.frame.radius * 2

    let visiblePosition = {
      x: thisObject.container.frame.position.x,
      y: thisObject.container.frame.position.y
    }

    visiblePosition = thisObject.container.frame.frameThisPoint(visiblePosition)
    visiblePosition = thisObject.fitFunction(visiblePosition)

    for (let i = 0; i < 60; i++) {
      let OPACITY = opacityCounters[i] / 1000

      let initialAngle = Math.PI * 2 / 60 * i - Math.PI / 2
      let finalAngle = Math.PI * 2 / 60 * (i + 1) - Math.PI / 2

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, initialAngle, finalAngle, false)
      browserCanvasContext.closePath()

      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + OPACITY * 2 + ')'
      browserCanvasContext.lineWidth = 6 + opacityCounters[i] / 100
      browserCanvasContext.setLineDash([3, 4])
      browserCanvasContext.stroke()

      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + OPACITY + ')'
      browserCanvasContext.lineWidth = 0 + opacityCounters[i] / 100
      browserCanvasContext.setLineDash([3, 4])
      browserCanvasContext.stroke()
    }
  }

  function drawForeground (pFloatingObject) {

  }
}
