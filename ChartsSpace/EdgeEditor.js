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

  let isMouseOver
  let whereIsMouseOver = 'outside'

  let onMouseOverEventSubscriptionId
  let onMouseNotOverEventSubscriptionId

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
  }

  function initialize () {
    onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
  }

  function onMouseOver (event) {
    isMouseOver = true
  }

  function onMouseNotOver () {
    isMouseOver = false
  }

  function getContainer (mousePoint) {
    if (thisObject.container.frame.isThisPointHere(mousePoint, undefined, undefined, -EDGE_SIZE) === true) {
      console.log('isThisPointHere ', true)

      let point = {
        x: mousePoint.x,
        y: mousePoint.y
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
    } else {
      isMouseOver = false
      whereIsMouseOver = 'outside'
    }
  }

  function physics () {
    if (thisObject.container.frame.position.x === 0 && thisObject.container.frame.position.y === 0) { return }
    switch (whereIsMouseOver) {
      case 'top' : {
        thisObject.container.parentContainer.frame.position.y = thisObject.container.parentContainer.frame.position.y + thisObject.container.frame.position.y
        thisObject.container.parentContainer.frame.height = thisObject.container.parentContainer.frame.height - thisObject.container.frame.position.y
        thisObject.container.frame.position.x = 0
        thisObject.container.frame.position.y = 0
        thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
        break
      }
      case 'bottom' : {
        thisObject.container.parentContainer.frame.height = thisObject.container.parentContainer.frame.height + thisObject.container.frame.position.y
        thisObject.container.frame.position.x = 0
        thisObject.container.frame.position.y = 0
        thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
        break
      }
      case 'left' : {
        thisObject.container.parentContainer.frame.position.x = thisObject.container.parentContainer.frame.position.x + thisObject.container.frame.position.x
        thisObject.container.parentContainer.frame.width = thisObject.container.parentContainer.frame.width - thisObject.container.frame.position.x
        thisObject.container.frame.position.x = 0
        thisObject.container.frame.position.y = 0
        thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
        break
      }
      case 'right' : {
        thisObject.container.parentContainer.frame.width = thisObject.container.parentContainer.frame.width + thisObject.container.frame.position.x
        thisObject.container.frame.position.x = 0
        thisObject.container.frame.position.y = 0
        thisObject.container.parentContainer.eventHandler.raiseEvent('Dimmensions Changed', event)
        break
      }
    }
  }

  function drawForeground () {
    let edgeSize
    let lineWidth

    if (whereIsMouseOver === 'outside') {
      edgeSize = EDGE_SIZE / 2
      lineWidth = 0.1
    } else {
      edgeSize = EDGE_SIZE
      lineWidth = 0.5
    }

    const OPACITY = 1

    console.log('whereIsMouseOver ', whereIsMouseOver, 'isMouseOver ' + isMouseOver)

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
