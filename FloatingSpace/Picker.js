
function newPicker () {
  const MODULE_NAME = 'Picker'

  let thisObject = {
    container: undefined,
    physics: physics,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0
  thisObject.container.frame.width = 50
  thisObject.container.frame.height = 100

  let optionsList
  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.container = undefined
    optionsList = undefined
  }

  function initialize (pOptionsList, payload) {
    optionsList = pOptionsList
  }

  function getContainer (point) {
    let container

    if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
      return thisObject.container
    }
  }

  function physics () {

  }

  function drawBackground (pFloatingObject) {

  }

  function drawForeground (pFloatingObject) {
    const FONT_SIZE = 15

    for (let i = 0; i < optionsList.length; i++) {
      drawLabel(optionsList[i], 1 / 2, i / optionsList.length, 0, 0, FONT_SIZE, thisObject.container, UI_COLOR.BLACK, undefined, undefined)
    }
  }
}
