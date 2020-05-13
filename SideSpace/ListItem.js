function newListItem () {
  const MODULE_NAME = 'List Item'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    container: undefined,
    fitFunction: undefined,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize()
  thisObject.container.isDraggeable = false
  thisObject.container.isWheelable = false
  thisObject.container.detectMouseOver = true

  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
  }

  function initialize () {

  }

  function getContainer (point) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    }
  }

  function onMouseClick (event) {

  }

  function physics () {

  }

  function draw () {
    let label1 = 'TEST NAME'

    let backgroundColor = UI_COLOR.BLACK

    const RED_LINE_HIGHT = 4
    const OPACITY = 0.75

    let params = {
      cornerRadius: 0,
      lineWidth: 1,
      container: thisObject.container,
      borderColor: UI_COLOR.RUSTED_RED,
      castShadow: false,
      backgroundColor: backgroundColor,
      opacity: OPACITY
    }

    roundedCornersBackground(params)

    drawLabel(label1, 1 / 2, 6 / 10, -5, 0, label1FontSize, thisObject.container)
    drawIcon(thisObject.exchangeIcon, 1 / 8, 2 / 10, 0, 0, 14, thisObject.container)
  }
}
