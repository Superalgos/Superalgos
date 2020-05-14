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
  thisObject.container.frame.width = SIDE_PANEL_WIDTH * 0.75
  thisObject.container.frame.height = SIDE_PANEL_WIDTH * 0.75

  let name
  let type

  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
  }

  function initialize (pName, pType) {
    name = pName
    type = pType
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
    let icon = canvas.designSpace.iconByUiObjectType.get(type)
    let backgroundColor = UI_COLOR.BLACK

    const RED_LINE_HIGHT = 4
    const OPACITY = 1

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

    drawLabel(name, 1 / 2, 3.0 / 10, -5, 0, 15, thisObject.container)
    drawLabel(type, 1 / 2, 7.2 / 10, -5, 0, 15, thisObject.container)
    drawIcon(icon, 1 / 2, 1 / 2, 0, 0, 80, thisObject.container)
  }
}
