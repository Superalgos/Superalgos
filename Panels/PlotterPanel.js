
function newPlotterPanel () {
  const MODULE_NAME = 'Plotter Panel'
  const ERROR_LOG = true
  const INTENSIVE_LOG = false
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    fitFunction: undefined,
    onRecordChange: onRecordChange,
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  container.frame.containerName = 'Plotter Panel'

  let currentRecord
  let panelTabButton
  let panelNode

  return thisObject

  function initialize (pPanelNode) {
    panelNode = pPanelNode
    container.frame.containerName = panelNode.name

    thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
    thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL

    thisObject.container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 5
    thisObject.container.frame.position.y = viewPort.visibleArea.bottomLeft.y - thisObject.container.frame.height

    panelTabButton = newPanelTabButton()
    panelTabButton.parentContainer = thisObject.container
    panelTabButton.container.frame.parentFrame = thisObject.container.frame
    panelTabButton.fitFunction = thisObject.fitFunction
    panelTabButton.initialize()
  }

  function getContainer (point) {
    let container

    container = panelTabButton.getContainer(point)
    if (container !== undefined) { return container }

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      let checkPoint = {
        x: point.x,
        y: point.y
      }

      checkPoint = thisObject.fitFunction(checkPoint)

      if (point.x === checkPoint.x && point.y === checkPoint.y) {
        return thisObject.container
      }
    }
  }

  function onRecordChange (pCurrentRecord) {
    currentRecord = pCurrentRecord
  }

  function draw () {
    thisObject.container.frame.draw(false, false, true, thisObject.fitFunction)

    plotCurrentRecordData()

    panelTabButton.draw()
  }

  function plotCurrentRecordData () {
    const frameBodyHeight = thisObject.container.frame.getBodyHeight()
    const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight

    const X_AXIS = thisObject.container.frame.width / 2
    const Y_AXIS = frameTitleHeight + frameBodyHeight / 2
    const PANEL_HEIGHT = frameTitleHeight + frameBodyHeight

    if (currentRecord === undefined) { return }
    if (currentRecord.data === undefined) { return }

    try {
      eval(panelNode.code.code)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }

    function printLabel (labelToPrint, x, y, opacity) {
      let labelPoint
      let fontSize = 10

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY

      let label = '' + labelToPrint

      let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO

      labelPoint = {
        x: x - xOffset,
        y: y
      }

      labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)
      labelPoint = thisObject.fitFunction(labelPoint)

      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')'
      browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
    }

    browserCanvasContext.closePath()
    browserCanvasContext.fill()
  }
}

