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
  let axis
  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseClickEventSuscriptionId)
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
    thisObject.parentContainer = undefined
    thisObject.panels = undefined

    coordinateSystem = undefined
    axis = undefined
  }

  function initialize (pAxis, pCoordinateSystem) {
    axis = pAxis
    coordinateSystem = pCoordinateSystem
    thisObject.autoMinScale = coordinateSystem.autoMinYScale
    thisObject.autoMaxScale = coordinateSystem.autoMaxYScale

    switch (axis) {
      case 'X': {
        thisObject.container.frame.width = 20
        thisObject.container.frame.height = 20

        let position = {
          x: thisObject.container.parentContainer.frame.width / 2 - thisObject.container.frame.width / 2,
          y: thisObject.container.parentContainer.frame.height / 2 - thisObject.container.frame.height / 2
        }

        thisObject.container.frame.position = position
        break
      }
      case 'Y': {
        thisObject.container.frame.width = 20
        thisObject.container.frame.height = 20

        let position = {
          x: thisObject.container.parentContainer.frame.width / 2 - thisObject.container.frame.width / 2,
          y: thisObject.container.parentContainer.frame.height / 2 - thisObject.container.frame.height / 2
        }

        thisObject.container.frame.position = position
        break
      }
    }

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
      switch (axis) {
        case 'X': {
          coordinateSystem.autoMinXScale = thisObject.autoMinScale
          coordinateSystem.autoMaxXScale = thisObject.autoMaxScale
          break
        }
        case 'Y': {
          coordinateSystem.autoMinYScale = thisObject.autoMinScale
          coordinateSystem.autoMaxYScale = thisObject.autoMaxScale
          break
        }
      }

      coordinateSystem.recalculateScale()
    }
  }

  function getContainer (point, purpose) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    }
  }

  function draw () {
    let icon
    switch (axis) {
      case 'X': {
        if (thisObject.autoMinScale === false && thisObject.autoMaxScale === false) {
          icon = canvas.designSpace.iconCollection.get('toggle-auto-time-scale-manual')
        }
        if (thisObject.autoMinScale === true && thisObject.autoMaxScale === false) {
          icon = canvas.designSpace.iconCollection.get('toggle-auto-time-scale-auto-min')
        }
        if (thisObject.autoMinScale === false && thisObject.autoMaxScale === true) {
          icon = canvas.designSpace.iconCollection.get('toggle-auto-time-scale-auto-max')
        }
        if (thisObject.autoMinScale === true && thisObject.autoMaxScale === true) {
          icon = canvas.designSpace.iconCollection.get('toggle-auto-time-scale-auto-min-max')
        }
        drawIcon(icon, 6 / 8, 0, 0, 28, 12, thisObject.container.parentContainer)
        break
      }
      case 'Y': {
        if (thisObject.autoMinScale === false && thisObject.autoMaxScale === false) {
          icon = canvas.designSpace.iconCollection.get('toggle-auto-scale-manual')
        }
        if (thisObject.autoMinScale === true && thisObject.autoMaxScale === false) {
          icon = canvas.designSpace.iconCollection.get('toggle-auto-scale-auto-min')
        }
        if (thisObject.autoMinScale === false && thisObject.autoMaxScale === true) {
          icon = canvas.designSpace.iconCollection.get('toggle-auto-scale-auto-max')
        }
        if (thisObject.autoMinScale === true && thisObject.autoMaxScale === true) {
          icon = canvas.designSpace.iconCollection.get('toggle-auto-scale-auto-min-max')
        }
        drawIcon(icon, 6 / 8, 0, 0, 28, 12, thisObject.container.parentContainer)
        break
      }
    }
  }
}
