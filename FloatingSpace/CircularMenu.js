
function newCircularMenu () {
  const MODULE_NAME = 'Circular Menu'

  let thisObject = {
    container: undefined,
    isDeployed: undefined,
    internalClick: internalClick,
    physics: physics,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME, 'Circle')
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0

  let menuItems = []

  let selfFocusEventSubscriptionId
  let selfNotFocuskEventSubscriptionId

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfFocusEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfNotFocuskEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined

    for (let i = 0; i < menuItems.length; i++) {
      let menuItem = menuItems[i]
      menuItem.finalize()
    }

    menuItems = undefined
  }

  function initialize (menuItemsInitialValues, payload) {
/* Create the array of Menu Items */

    for (let i = 0; i < menuItemsInitialValues.length; i++) {
      let menuItem = newCircularMenuItem()
      let menuItemInitialValue = menuItemsInitialValues[i]

      menuItem.action = menuItemInitialValue.action
      menuItem.actionFunction = menuItemInitialValue.actionFunction
      menuItem.actionStatus = menuItemInitialValue.actionStatus
      menuItem.label = menuItemInitialValue.label
      menuItem.workingLabel = menuItemInitialValue.workingLabel
      menuItem.workDoneLabel = menuItemInitialValue.workDoneLabel
      menuItem.workFailedLabel = menuItemInitialValue.workFailedLabel
      menuItem.secondaryAction = menuItemInitialValue.secondaryAction
      menuItem.secondaryLabel = menuItemInitialValue.secondaryLabel
      menuItem.secondaryWorkingLabel = menuItemInitialValue.secondaryWorkingLabel
      menuItem.secondaryWorkDoneLabel = menuItemInitialValue.secondaryWorkDoneLabel
      menuItem.secondaryWorkFailedLabel = menuItemInitialValue.secondaryWorkFailedLabel
      menuItem.secondaryIcon = menuItemInitialValue.secondaryIcon
      menuItem.visible = menuItemInitialValue.visible
      menuItem.iconPathOn = menuItemInitialValue.iconPathOn
      menuItem.iconPathOff = menuItemInitialValue.iconPathOff
      menuItem.rawRadius = menuItemInitialValue.rawRadius
      menuItem.targetRadius = menuItemInitialValue.label
      menuItem.currentRadius = menuItemInitialValue.currentRadius
      menuItem.angle = menuItemInitialValue.angle
      menuItem.currentStatus = menuItemInitialValue.currentStatus
      menuItem.relatedUiObject = menuItemInitialValue.relatedUiObject
      menuItem.dontShowAtFullscreen = menuItemInitialValue.dontShowAtFullscreen
      menuItem.askConfirmation = menuItemInitialValue.askConfirmation
      menuItem.confirmationLabel = menuItemInitialValue.confirmationLabel
      menuItem.disableIfPropertyIsDefined = menuItemInitialValue.disableIfPropertyIsDefined
      menuItem.propertyToCheckFor = menuItemInitialValue.propertyToCheckFor

      if (menuItem.label === undefined) {
        menuItem.type = 'Icon Only'
      } else {
        menuItem.type = 'Icon & Text'
      }

      menuItem.initialize(payload)
      menuItem.container.connectToParent(thisObject.container, false, false, true, true, false, false, true, true)
      menuItems.push(menuItem)
    }

    selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
    selfNotFocuskEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
  }

  function getContainer (point) {
    let container

    if (thisObject.isDeployed === true) {
      for (let i = 0; i < menuItems.length; i++) {
        let menuItem = menuItems[i]
        if (menuItem.visible === true) {
          container = menuItem.getContainer(point)
        }
        if (container !== undefined) { return container }
      }
    }
  }

  function internalClick (action) {
    for (let i = 0; i < menuItems.length; i++) {
      let menuItem = menuItems[i]
      if (menuItem.visible === true) {
        if (menuItem.nextAction === action) {
          menuItem.internalClick()
        }
      }
    }
  }

  function physics () {
    for (let i = 0; i < menuItems.length; i++) {
      let menuItem = menuItems[i]
      menuItem.physics()
    }
  }

  function onFocus () {
    for (let i = 0; i < menuItems.length; i++) {
      let menuItem = menuItems[i]
      menuItem.targetRadius = menuItem.rawRadius * 1.5
      menuItem.isDeployed = true
    }
    thisObject.isDeployed = true
  }

  function onNotFocus () {
    for (let i = 0; i < menuItems.length; i++) {
      let menuItem = menuItems[i]
      menuItem.targetRadius = menuItem.rawRadius * 0 - i * 4
      menuItem.isDeployed = false
    }
    thisObject.isDeployed = false
  }

  function drawBackground (pFloatingObject) {
    for (let i = 0; i < menuItems.length; i++) {
      let menuItem = menuItems[i]
      if (menuItem.visible === true) {
        menuItem.drawBackground()
      }
    }
  }

  function drawForeground (pFloatingObject) {
    for (let i = 0; i < menuItems.length; i++) {
      let menuItem = menuItems[i]
      if (menuItem.visible === true) {
        menuItem.drawForeground()
      }
    }
  }
}
