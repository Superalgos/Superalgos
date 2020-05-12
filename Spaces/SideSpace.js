function newSideSpace () {
  const MODULE_NAME = 'Side Space'
  let thisObject = {
    areas: [],
    sidePanelTab: undefined,
    container: undefined,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  let isInitialized = false

  thisObject.container = newContainer()
  thisObject.container.name = MODULE_NAME
  thisObject.container.initialize()
  thisObject.container.isClickeable = true
  thisObject.container.isDraggeable = false
  thisObject.container.status = 'hidden'

  resize()
  return thisObject

  function initialize () {
    thisObject.sidePanelTab = newSidePanelTab()
    thisObject.sidePanelTab.container.connectToParent(thisObject.container, false, false)
    thisObject.sidePanelTab.initialize()

    canvas.eventHandler.listenToEvent('Browser Resized', resize)
    isInitialized = true
  }

  function resize () {
    thisObject.container.frame.width = SIDE_PANEL_WIDTH
    thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
    thisObject.container.frame.position.x = -SIDE_PANEL_WIDTH
    thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT
  }

  function getContainer (point) {
    let container

    container = thisObject.sidePanelTab.getContainer(point)
    if (container !== undefined) { return container }

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function physics () {

  }

  function draw () {
    if (isInitialized === false) { return }
    borders()
    thisObject.sidePanelTab.draw()

    for (let i = 0; i < thisObject.areas.length; i++) {
      let area = thisObject.areas[i]
      area.draw()
    }
  }

  function borders () {
    let point1
    let point2
    let point3
    let point4

    point1 = {
      x: 0,
      y: 0
    }

    point2 = {
      x: thisObject.container.frame.width,
      y: 0
    }

    point3 = {
      x: thisObject.container.frame.width,
      y: thisObject.container.frame.height
    }

    point4 = {
      x: 0,
      y: thisObject.container.frame.height
    }

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)
    point3 = thisObject.container.frame.frameThisPoint(point3)
    point4 = thisObject.container.frame.frameThisPoint(point4)

    browserCanvasContext.setLineDash([0, 0])
    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.lineTo(point3.x, point3.y)
    browserCanvasContext.lineTo(point4.x, point4.y)
    browserCanvasContext.lineTo(point1.x, point1.y)
    browserCanvasContext.closePath()

    let opacity = 1

    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + opacity + ''
    browserCanvasContext.fill()

    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + opacity + ''
    browserCanvasContext.lineWidth = 0.3
    browserCanvasContext.stroke()

    /* Shadow */

    if (thisObject.container.status !== 'hidden') {
      for (let i = 0; i <= 30; i++) {
        opacity = 1 - (i / 300) - 0.95

        browserCanvasContext.setLineDash([0, 0])
        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point2.x + i, point2.y)
        browserCanvasContext.lineTo(point3.x + i, point3.y)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + opacity + ''
        browserCanvasContext.lineWidth = 1
        browserCanvasContext.stroke()
      }
    }
  }
}
