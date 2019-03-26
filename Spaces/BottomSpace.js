 ﻿
function newBottomSpace () {
  var thisObject = {
    deleteTradingHistory: undefined,
    chartAspectRatio: undefined,
    container: undefined,
    draw: draw,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize
  }

  var container = newContainer()
  container.initialize()
  thisObject.container = container

  container.isDraggeable = false

  resize()

  return thisObject

  function initialize () {
    thisObject.deleteTradingHistory = newDeleteTradingHistory()
    thisObject.deleteTradingHistory.initialize()

    thisObject.chartAspectRatio = newChartAspectRatio()
    thisObject.chartAspectRatio.initialize()

    window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
  }

  function resize () {
    container.frame.position.x = 0
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y

    thisObject.container.frame.width = browserCanvas.width
    thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT
  }

  function getContainer (point) {
    let container

    container = thisObject.deleteTradingHistory.getContainer(point)
    if (container !== undefined) { return container }

    container = thisObject.chartAspectRatio.getContainer(point)
    if (container !== undefined) { return container }

        /* The point does not belong to any inner container, so we return the current container. */

    return thisObject.container
  }

  function draw () {
    thisObject.container.frame.draw(false, false)

    drawBackground()
    thisObject.deleteTradingHistory.draw()
    thisObject.chartAspectRatio.draw()
  }

  function drawBackground () {
    let opacity = 1

    let zeroPoint = {
      x: 0,
      y: 0
    }

    zeroPoint = thisObject.container.frame.frameThisPoint(zeroPoint)

    let breakpointsHeight = 15
    const RED_LINE_HIGHT = 5

    browserCanvasContext.beginPath()
    browserCanvasContext.rect(zeroPoint.x, zeroPoint.y + breakpointsHeight, thisObject.container.frame.width, thisObject.container.frame.height)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')'
    browserCanvasContext.closePath()
    browserCanvasContext.fill()

    browserCanvasContext.beginPath()
    browserCanvasContext.rect(zeroPoint.x, zeroPoint.y + breakpointsHeight, thisObject.container.frame.width, RED_LINE_HIGHT)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')'
    browserCanvasContext.closePath()
    browserCanvasContext.fill()
  }
}
