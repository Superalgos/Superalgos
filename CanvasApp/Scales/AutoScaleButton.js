function newAutoScaleButton () {
  let thisObject = {
    container: undefined,
    fitFunction: undefined,
    parentContainer: undefined,
    autoMinScale: undefined,
    autoMaxScale: undefined,
    draw: draw,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize,
    finalize: finalize
  }

   /* Cointainer stuff */
  thisObject.container = newContainer()
  thisObject.container.name = 'Auto Scale Button'
  thisObject.container.initialize()
  thisObject.container.isClickeable = true
  thisObject.container.isDraggeable = false
  thisObject.container.frame.containerName = 'Auto Scale Button'

  let onMouseClickEventSuscriptionId
  let coordinateSystem

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseClickEventSuscriptionId)
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
    thisObject.parentContainer = undefined
    thisObject.panels = undefined

    coordinateSystem = undefined
  }

  function initialize (pCoordinateSystem) {
    coordinateSystem = pCoordinateSystem
    thisObject.autoMinScale = coordinateSystem.autoMinScale
    thisObject.autoMaxScale = coordinateSystem.autoMaxScale

    thisObject.container.frame.width = 25
    thisObject.container.frame.height = 25

    let position = {
      x: thisObject.container.parentContainer.frame.width * 5 / 8,
      y: thisObject.container.parentContainer.frame.height / 2 - thisObject.container.frame.height / 2
    }

    thisObject.container.frame.position = position

    /* Lets listen to our own events to react when we have a Mouse Click */
    onMouseClickEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
  }

  function onMouseClick (event) {
    if (thisObject.autoMinScale === false && thisObject.autoMaxScale === false) {
      thisObject.autoMinScale = true
      thisObject.autoMaxScale = false
      update()
      return
    }
    if (thisObject.autoMinScale === true && thisObject.autoMaxScale === false) {
      thisObject.autoMinScale = false
      thisObject.autoMaxScale = true
      update()
      return
    }
    if (thisObject.autoMinScale === false && thisObject.autoMaxScale === true) {
      thisObject.autoMinScale = true
      thisObject.autoMaxScale = true
      update()
      return
    }
    if (thisObject.autoMinScale === true && thisObject.autoMaxScale === true) {
      thisObject.autoMinScale = false
      thisObject.autoMaxScale = false
      update()
      return
    }

    function update () {
      coordinateSystem.autoMinScale = thisObject.autoMinScale
      coordinateSystem.autoMaxScale = thisObject.autoMaxScale
      coordinateSystem.recalculateScale()
    }
  }

  function getContainer (point, purpose) {
    console.log('INSIDE BUTTON')
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      console.log('RETURNING BUTTON FROM BUTTON')
      return thisObject.container
    }
  }

  function draw () {
    let icon
    if (thisObject.autoMinScale === false && thisObject.autoMaxScale === false) {
      icon = canvas.designerSpace.iconCollection.get('plotter-panel')
    }
    if (thisObject.autoMinScale === true && thisObject.autoMaxScale === false) {
      icon = canvas.designerSpace.iconCollection.get('shapes-polygon-body')
    }
    if (thisObject.autoMinScale === false && thisObject.autoMaxScale === true) {
      icon = canvas.designerSpace.iconCollection.get('social-bot')
    }
    if (thisObject.autoMinScale === true && thisObject.autoMaxScale === true) {
      icon = canvas.designerSpace.iconCollection.get('startup')
    }

    drawIcon(icon, 1 / 2, 1 / 2, 0, 0, 14, thisObject.container)
  }
}
