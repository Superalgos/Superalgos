
function newCircularMenu () {
  const MODULE_NAME = 'Circular Menu'

  let thisObject = {
    container: undefined,
    physics: physics,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    getContainer: getContainer,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME, 'Circle')
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0

  let menuItemsInitialValues = []
  let menuItems = []

  let isMouseOver = false

  return thisObject

  function initialize (menuItemsInitialValues) {
/* Create the array of Menu Items */

    for (let i = 0; i < menuItemsInitialValues.length; i++) {
      let menuItem = newCircularMenuItem()
      let menuItemInitialValue = menuItemsInitialValues[i]

      menuItem.label = menuItemInitialValue.label
      menuItem.visible = menuItemInitialValue.visible
      menuItem.imagePathOn = menuItemInitialValue.imagePathOn
      menuItem.imagePathOff = menuItemInitialValue.imagePathOff
      menuItem.rawRadius = menuItemInitialValue.rawRadius
      menuItem.targetRadius = menuItemInitialValue.label
      menuItem.currentRadius = menuItemInitialValue.currentRadius
      menuItem.angle = menuItemInitialValue.angle

      menuItem.initialize()
      menuItems.push(menuItem)
    }

    thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
  }

  function getContainer (point) {
    let container

    for (let i = 0; i < menuItems.length; i++) {
      let menutItem = menuItems[i]
      container = menutItem.getContainer(point)
      if (container !== undefined) { return container }
    }
  }

  function physics () {
    for (let i = 0; i < menuItems.length; i++) {
      let menutItem = menuItems[i]
      menutItem.physics()
    }
  }

  function onMouseOver () {
    for (let i = 0; i < menuItems.length; i++) {
      let menutItem = menuItems[i]
      menutItem.targetRadius = menutItem.rawRadius * 1.5
    }
    isMouseOver = true
  }

  function onMouseNotOver () {
    for (let i = 0; i < menuItems.length; i++) {
      let menutItem = menuItems[i]
      menutItem.targetRadius = menutItem.rawRadius * 1 - i * 5
    }
    isMouseOver = false
  }

  function drawBackground (pFloatingObject) {
    for (let i = 0; i < menuItems.length; i++) {
      let menutItem = menuItems[i]
      menutItem.drawBackground()
    }
  }

  function drawForeground (pFloatingObject) {
    for (let i = 0; i < menuItems.length; i++) {
      let menutItem = menuItems[i]
      menutItem.drawForeground()
    }
  }
}
