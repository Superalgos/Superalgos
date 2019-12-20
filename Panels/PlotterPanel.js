
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

  let heightFactor = 1
  let currentRecord
  let panelTabButton
  let panelNode

  return thisObject

  function initialize (pPanelNode) {
    panelNode = pPanelNode
    container.frame.containerName = panelNode.name

    thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
    thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL

    thisObject.container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width - thisObject.container.frame.width * Math.random() * 8
    thisObject.container.frame.position.y = viewPort.visibleArea.bottomLeft.y - thisObject.container.frame.height - thisObject.container.frame.height * Math.random() * 1.5

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

    let record = currentRecord.data

    /* First we execute code if provided. */
    if (panelNode.javascriptCode !== undefined) {
      try {
        eval(panelNode.javascriptCode.code)
      } catch (err) {
        if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> err = ' + err.stack) }
        if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> javascriptCode.code = ' + panelNode.javascriptCode.code) }
      }
    }

    /* Second we go through the panel data. */
    if (panelNode.panelData === undefined) { return }
    for (let i = 0; i < panelNode.panelData.length; i++) {
      let panelData = panelNode.panelData[i]

      let labelText = panelData.name
      let labelPosition = i * 10 + 10
      let valuePosition = i * 10 + 15
      let value = 'No value defined.'

      if (valuePosition > 100) {
        heightFactor = 2
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * heightFactor
      }

      if (panelData.dataFormula !== undefined) {
        try {
          value = eval(panelData.dataFormula.code)
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> err = ' + err.stack) }
          if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> dataFormula.code = ' + panelNode.dataFormula.code) }
        }
      }

      if (panelData.code.valueDecimals !== undefined) {
        value = value.toFixed(panelData.code.valueDecimals)
      }

      if (panelData.code.labelText !== undefined) {
        labelText = panelData.code.labelText
      }

      if (panelData.code.labelPosition !== undefined) {
        labelPosition = panelData.code.labelPosition
      }

      if (panelData.code.valuePosition !== undefined) {
        valuePosition = panelData.code.valuePosition
      }

      printLabel(labelText, X_AXIS, PANEL_HEIGHT * labelPosition / 100 / heightFactor, '1')
      printLabel(value, X_AXIS, PANEL_HEIGHT * valuePosition / 100 / heightFactor, '0.50')
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
