
function newPicker () {
  const MODULE_NAME = 'Picker'

  let thisObject = {
    container: undefined,
    selectedItem: 0,
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
  thisObject.container.isWheelable = true
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0
  thisObject.container.frame.width = 50
  thisObject.container.frame.height = 200

  let optionsList
  let selected = 0
  let onMouseWheelEventSubscriptionId

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
    thisObject.container.finalize()
    thisObject.container = undefined
    optionsList = undefined
  }

  function initialize (pOptionsList) {
    optionsList = pOptionsList
    onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
  }

  function getContainer (point) {
    let container

    if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
      return thisObject.container
    }
  }

  function onMouseWheel () {
    delta = event.wheelDelta
    if (delta > 0) {
      delta = -1
    } else {
      delta = 1
    }

    selected = selected + delta
    if (selected < 0) { selected = 0 }
    if (selected > optionsList.length - 1) {
      selected = optionsList.length - 1
    }
  }

  function physics () {

  }

  function drawBackground () {

  }

  function drawForeground () {
    const FONT_SIZE = 25
    const VISIBLE_LABELS = 5
    let fontSize
    let fontColor

    for (let i = 0; i < VISIBLE_LABELS; i++) {
      let index = i - 2 + selected
      let label = ''
      if (index >= 0 && index < VISIBLE_LABELS) {
        label = optionsList[index]
      }
      fontColor = UI_COLOR.WHITE
      switch (i) {
        case 0: fontSize = FONT_SIZE - 15
          break
        case 1: fontSize = FONT_SIZE - 8
          break
        case 2: fontSize = FONT_SIZE - 0
          fontColor = UI_COLOR.BLACK
          break
        case 3: fontSize = FONT_SIZE - 8
          break
        case 4: fontSize = FONT_SIZE - 15
          break
      }
      drawLabel(label, 1 / 2, i / VISIBLE_LABELS, 0, 0, fontSize, thisObject.container, fontColor, undefined, undefined)
    }
  }
}

