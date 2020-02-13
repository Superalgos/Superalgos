function newEdgeEditor () {
  const MODULE_NAME = 'Edge Editor'

  let thisObject = {
    container: undefined,
    fitFunction: undefined,
    isVisible: true,
    physics: physics,
    drawForeground: drawForeground,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  const EDGE_SIZE = 6

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = true
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = false
  thisObject.container.detectMouseOver = true

  let buttonUsedForDragging
  let isMouseOver
  let whereIsMouseOver = 'outside'

  let coordinateSystem

  let onMouseOverEventSubscriptionId
  let onMouseNotOverEventSubscriptionId
  let onDragStartedEventSubscriptionId

  let mouse = {
    position: {
      x: 0,
      y: 0
    }
  }
  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onDragStartedEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
    mouse = undefined
  }

  function initialize (pCoordinateSystem) {
    coordinateSystem = pCoordinateSystem

    onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
    onDragStartedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragStarted', onDragStarted)
  }

  function onMouseOver (event) {
    isMouseOver = true
    mouse = {
      position: {
        x: event.x,
        y: event.y
      }
    }
  }

  function onMouseNotOver () {
    isMouseOver = false
  }

  function onDragStarted (event) {
    switch (event.buttons) {
      case 1: {
        buttonUsedForDragging = 'left mouse button'
        break
      }
      case 2: {
        buttonUsedForDragging = 'right mouse button'
        break
      }
    }
  }

  function getContainer (event, purpose) {
    if (thisObject.container.frame.isThisPointHere(event, undefined, undefined, -EDGE_SIZE) === true && event.shiftKey !== true) {
      let point = {
        x: event.x,
        y: event.y
      }
      point = unTransformThisPoint(point, thisObject.container)

      if (point.x <= 0) {
        whereIsMouseOver = 'left'
        return thisObject.container
      }

      if (point.x >= thisObject.container.frame.width) {
        whereIsMouseOver = 'right'
        return thisObject.container
      }

      if (point.y <= 0) {
        whereIsMouseOver = 'top'
        return thisObject.container
      }

      if (point.y >= thisObject.container.frame.height) {
        whereIsMouseOver = 'bottom'
        return thisObject.container
      }

      whereIsMouseOver = 'center'
      switch (purpose) {
        case GET_CONTAINER_PURPOSE.MOUSE_OVER:
          return // We will let the Time Machine to handle this situation.
          break
        case GET_CONTAINER_PURPOSE.DRAGGING:
          return thisObject.container
          break
      }
    }
  }

  function physics () {
    if (thisObject.container.frame.position.x === 0 && thisObject.container.frame.position.y === 0) { return }

    let dragVector = {
      x: thisObject.container.frame.position.x,
      y: thisObject.container.frame.position.y
    }

    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0

    const MIN_WIDTH = 100
    const MIN_HEIGHT = 50

    switch (whereIsMouseOver) {
      case 'center': {
        switch (buttonUsedForDragging) {
          case 'left mouse button': {
            /* This is equivalent to drag the whole Time Machine, so we will apply the translation received onto the Time Machine container. */
            thisObject.container.parentContainer.frame.position.x = thisObject.container.parentContainer.frame.position.x + dragVector.x
            thisObject.container.parentContainer.frame.position.y = thisObject.container.parentContainer.frame.position.y + dragVector.y
            thisObject.container.parentContainer.eventHandler.raiseEvent('onDisplace')
            break
          }
          case 'right mouse button': {
            let point = {
              x: -dragVector.x,
              y: -dragVector.y
            }
            let newMinDate = getDateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystem)
            let newMaxRate = getRateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystem)
            let xDifferenceMaxMin = coordinateSystem.max.x - coordinateSystem.min.x
            let yDifferenceMaxMin = coordinateSystem.max.y - coordinateSystem.min.y
            coordinateSystem.min.x = newMinDate.valueOf()
            coordinateSystem.max.x = newMinDate.valueOf() + xDifferenceMaxMin
            coordinateSystem.min.y = newMaxRate - yDifferenceMaxMin
            coordinateSystem.max.y = newMaxRate
            coordinateSystem.recalculateScale()
          }
        }
        thisObject.container.parentContainer.eventHandler.raiseEvent('onMouseOver', mouse.position)
        break
      }
      case 'top' : {
        if (thisObject.container.parentContainer.frame.height - dragVector.y < MIN_HEIGHT && dragVector.y > 0) {
          return
        }

        let point = {
          x: dragVector.x,
          y: dragVector.y
        }
        let newMaxRate = getRateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystem)

        thisObject.container.parentContainer.frame.position.y = thisObject.container.parentContainer.frame.position.y + dragVector.y
        thisObject.container.parentContainer.frame.height = thisObject.container.parentContainer.frame.height - dragVector.y

        switch (buttonUsedForDragging) {
          case 'left mouse button': {
            coordinateSystem.max.y = newMaxRate
            coordinateSystem.maxHeight = thisObject.container.parentContainer.frame.height
            coordinateSystem.recalculateScale()
            break
          }
          case 'right mouse button': {
            coordinateSystem.maxHeight = thisObject.container.parentContainer.frame.height
            coordinateSystem.recalculateScale()
            break
          }
        }
        thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
        break
      }
      case 'bottom' : {
        if (thisObject.container.parentContainer.frame.height + dragVector.y < MIN_HEIGHT && dragVector.y < 0) {
          return
        }

        let point = {
          x: dragVector.x,
          y: dragVector.y + thisObject.container.frame.height
        }
        let newMinRate = getRateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystem)

        thisObject.container.parentContainer.frame.height = thisObject.container.parentContainer.frame.height + dragVector.y

        switch (buttonUsedForDragging) {
          case 'left mouse button': {
            coordinateSystem.min.y = newMinRate
            coordinateSystem.maxHeight = thisObject.container.parentContainer.frame.height
            coordinateSystem.recalculateScale()
            break
          }
          case 'right mouse button': {
            coordinateSystem.maxHeight = thisObject.container.parentContainer.frame.height
            coordinateSystem.recalculateScale()
            break
          }
        }
        thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
        break
      }
      case 'left' : {
        if (thisObject.container.parentContainer.frame.width - dragVector.x < MIN_WIDTH && dragVector.x > 0) {
          return
        }
        let point = {
          x: dragVector.x,
          y: dragVector.y
        }
        let newMinDate = getDateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystem)

        thisObject.container.parentContainer.frame.position.x = thisObject.container.parentContainer.frame.position.x + dragVector.x
        thisObject.container.parentContainer.frame.width = thisObject.container.parentContainer.frame.width - dragVector.x

        switch (buttonUsedForDragging) {
          case 'left mouse button': {
            coordinateSystem.min.x = newMinDate.valueOf()
            coordinateSystem.maxWidth = thisObject.container.parentContainer.frame.width
            coordinateSystem.recalculateScale()
            break
          }
          case 'right mouse button': {
            coordinateSystem.maxWidth = thisObject.container.parentContainer.frame.width
            coordinateSystem.recalculateScale()
            break
          }
        }
        thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
        break
      }
      case 'right' : {
        if (thisObject.container.parentContainer.frame.width + dragVector.x < MIN_WIDTH && dragVector.x < 0) {
          return
        }

        let point = {
          x: dragVector.x + thisObject.container.frame.width,
          y: dragVector.y
        }
        let newMaxDate = getDateFromPointAtContainer(point, thisObject.container.parentContainer, coordinateSystem)

        thisObject.container.parentContainer.frame.width = thisObject.container.parentContainer.frame.width + dragVector.x

        switch (buttonUsedForDragging) {
          case 'left mouse button': {
            coordinateSystem.max.x = newMaxDate.valueOf()
            coordinateSystem.maxWidth = thisObject.container.parentContainer.frame.width
            coordinateSystem.recalculateScale()
            break
          }
          case 'right mouse button': {
            coordinateSystem.maxWidth = thisObject.container.parentContainer.frame.width
            coordinateSystem.recalculateScale()
            break
          }
        }
        thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
        break
      }
    }
  }

  function drawForeground () {
    let MARGIN = 1
    let edgeSize
    let lineWidth

    if (whereIsMouseOver === 'outside' || isMouseOver === false) {
      edgeSize = EDGE_SIZE / 2
      lineWidth = 0.1
    } else {
      edgeSize = EDGE_SIZE
      lineWidth = 0.5
    }

    const OPACITY = 1

    pointA1 = {
      x: 0,
      y: 0
    }

    pointA2 = {
      x: thisObject.container.frame.width,
      y: 0
    }

    pointA3 = {
      x: thisObject.container.frame.width,
      y: thisObject.container.frame.height
    }

    pointA4 = {
      x: 0,
      y: thisObject.container.frame.height
    }

    pointB1 = {
      x: 0,
      y: 0
    }

    pointB2 = {
      x: thisObject.container.frame.width,
      y: 0
    }

    pointB3 = {
      x: thisObject.container.frame.width,
      y: thisObject.container.frame.height
    }

    pointB4 = {
      x: 0,
      y: thisObject.container.frame.height
    }

    pointA1 = transformThisPoint(pointA1, thisObject.container)
    pointA2 = transformThisPoint(pointA2, thisObject.container)
    pointA3 = transformThisPoint(pointA3, thisObject.container)
    pointA4 = transformThisPoint(pointA4, thisObject.container)

    pointB1 = transformThisPoint(pointB1, thisObject.container)
    pointB2 = transformThisPoint(pointB2, thisObject.container)
    pointB3 = transformThisPoint(pointB3, thisObject.container)
    pointB4 = transformThisPoint(pointB4, thisObject.container)

    pointA1 = {
      x: pointA1.x - MARGIN,
      y: pointA1.y - MARGIN
    }

    pointA2 = {
      x: pointA2.x + MARGIN,
      y: pointA2.y - MARGIN
    }

    pointA3 = {
      x: pointA3.x + MARGIN,
      y: pointA3.y + MARGIN
    }

    pointA4 = {
      x: pointA4.x - MARGIN,
      y: pointA4.y + MARGIN
    }

    pointB1 = {
      x: pointB1.x - edgeSize,
      y: pointB1.y - edgeSize
    }

    pointB2 = {
      x: pointB2.x + edgeSize,
      y: pointB2.y - edgeSize
    }

    pointB3 = {
      x: pointB3.x + edgeSize,
      y: pointB3.y + edgeSize
    }

    pointB4 = {
      x: pointB4.x - edgeSize,
      y: pointB4.y + edgeSize
    }

    pointA1 = canvas.chartSpace.viewport.fitIntoViewport(pointA1)
    pointA2 = canvas.chartSpace.viewport.fitIntoViewport(pointA2)
    pointA3 = canvas.chartSpace.viewport.fitIntoViewport(pointA3)
    pointA4 = canvas.chartSpace.viewport.fitIntoViewport(pointA4)

    pointB1 = canvas.chartSpace.viewport.fitIntoViewport(pointB1)
    pointB2 = canvas.chartSpace.viewport.fitIntoViewport(pointB2)
    pointB3 = canvas.chartSpace.viewport.fitIntoViewport(pointB3)
    pointB4 = canvas.chartSpace.viewport.fitIntoViewport(pointB4)

    browserCanvasContext.setLineDash([0, 0])

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(pointA1.x, pointA1.y)
    browserCanvasContext.lineTo(pointA2.x, pointA2.y)
    browserCanvasContext.lineTo(pointB2.x, pointB2.y)
    browserCanvasContext.lineTo(pointB1.x, pointB1.y)
    browserCanvasContext.lineTo(pointA1.x, pointA1.y)
    browserCanvasContext.closePath()

    drawEdge('top')

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(pointA2.x, pointA2.y)
    browserCanvasContext.lineTo(pointA3.x, pointA3.y)
    browserCanvasContext.lineTo(pointB3.x, pointB3.y)
    browserCanvasContext.lineTo(pointB2.x, pointB2.y)
    browserCanvasContext.lineTo(pointA2.x, pointA2.y)
    browserCanvasContext.closePath()

    drawEdge('right')

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(pointA3.x, pointA3.y)
    browserCanvasContext.lineTo(pointA4.x, pointA4.y)
    browserCanvasContext.lineTo(pointB4.x, pointB4.y)
    browserCanvasContext.lineTo(pointB3.x, pointB3.y)
    browserCanvasContext.lineTo(pointA3.x, pointA3.y)
    browserCanvasContext.closePath()

    drawEdge('bottom')

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(pointA4.x, pointA4.y)
    browserCanvasContext.lineTo(pointA1.x, pointA1.y)
    browserCanvasContext.lineTo(pointB1.x, pointB1.y)
    browserCanvasContext.lineTo(pointB4.x, pointB4.y)
    browserCanvasContext.lineTo(pointA4.x, pointA4.y)
    browserCanvasContext.closePath()

    drawEdge('left')

    function drawEdge (edgeType) {
      if (whereIsMouseOver === edgeType && isMouseOver === true) {
        browserCanvasContext.lineWidth = lineWidth
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + OPACITY + ')'
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
      } else {
        browserCanvasContext.lineWidth = lineWidth
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + OPACITY + ')'
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + OPACITY + ')'
      }
      browserCanvasContext.fill()
      browserCanvasContext.stroke()
    }
  }
}
