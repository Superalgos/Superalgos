
function newCircularMenu() {
    const MODULE_NAME = 'Circular Menu'

    let thisObject = {
        container: undefined,
        isDeployed: undefined,
        internalClick: internalClick,
        physics: physics,
        invisiblePhysics: invisiblePhysics,
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

    function finalize() {
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

    function initialize(menuItemsInitialValues, payload) {
        /* Create the array of Menu Items */

        let iconAndTextArray = []
        let iconOnlyArray
        let ringsArray = [[], [], [], []]

        for (let i = 0; i < menuItemsInitialValues.length; i++) {
            let menuItem = newCircularMenuItem()
            let menuItemInitialValue = menuItemsInitialValues[i]

            menuItem.action = menuItemInitialValue.action
            menuItem.actionProject = menuItemInitialValue.actionProject
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
            menuItem.ring = menuItemInitialValue.ring
            menuItem.icons = menuItemInitialValue.icons

            if (menuItem.label === undefined) {
                menuItem.type = 'Icon Only'

                if (menuItem.ring === undefined) {
                    menutItem.ring = 1
                }
                iconOnlyArray = ringsArray[menuItem.ring - 1]
                iconOnlyArray.push(menuItem)
            } else {
                menuItem.type = 'Icon & Text'
                iconAndTextArray.push(menuItem)
            }

            menuItem.initialize(payload)
            menuItem.container.connectToParent(thisObject.container, false, false, true, true, false, false, true, true)
            menuItems.push(menuItem)
        }

        /* There are 4 possible rings of icons, we will go through each of them here. */
        let amplitudeArray = [80, 50, 40, 80]
        let initialAngleArray = [220, 205, 200, 180]
        for (let j = 1; j < ringsArray.length + 1; j++) {
            let iconOnlyArray = ringsArray[j - 1]
            /* Here we calculate the angles for each menu item, and then apply it if it was not previously defined. */
            let amplitude = amplitudeArray[j - 1]
            let initialAngle = initialAngleArray[j - 1]
            let step = amplitude / (iconOnlyArray.length - 1)
            if (iconOnlyArray.length === 1) {
                step = 0
            }

            for (let i = 0; i < iconOnlyArray.length; i++) {
                let menuItem = iconOnlyArray[i]
                let angle = initialAngle - step * i
                if (menuItem.angle === undefined) {
                    menuItem.angle = angle
                }
            }
        }
        /* Text and Icon */
        let amplitude = 60
        let initialAngle = -30
        step = amplitude / 7
        let currentItem = (7 - iconAndTextArray.length) / 2 + 1
        for (let i = 0; i < iconAndTextArray.length; i++) {
            let menuItem = iconAndTextArray[i]
            let angle = initialAngle + step * (currentItem - 0.5)
            currentItem++
            if (menuItem.angle === undefined) {
                menuItem.angle = angle
            }
        }

        iconOnlyArray = undefined
        iconAndTextArray = undefined

        /* Listen to events */
        selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
        selfNotFocuskEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
    }

    function getContainer(point) {
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

    function internalClick(action) {
        for (let i = 0; i < menuItems.length; i++) {
            let menuItem = menuItems[i]
            if (menuItem.visible === true) {
                if (menuItem.nextAction === action) {
                    menuItem.internalClick()
                    if (menuItems === undefined) { return } // It might happen that the action executed is to delete the node that has this menu.
                }
            }
        }
    }

    function invisiblePhysics() {
        for (let i = 0; i < menuItems.length; i++) {
            let menuItem = menuItems[i]
            menuItem.invisiblePhysics()
        }
    }

    function physics() {
        for (let i = 0; i < menuItems.length; i++) {
            let menuItem = menuItems[i]
            menuItem.physics()
        }
    }

    function onFocus() {
        for (let i = 0; i < menuItems.length; i++) {
            let menuItem = menuItems[i]
            menuItem.targetRadius = Math.trunc(menuItem.rawRadius * 1.5)
            menuItem.isDeployed = true
        }
        thisObject.isDeployed = true
    }

    function onNotFocus() {
        for (let i = 0; i < menuItems.length; i++) {
            let menuItem = menuItems[i]
            menuItem.targetRadius = menuItem.rawRadius * 0 - i * 1.5
            menuItem.isDeployed = false
        }
        thisObject.isDeployed = false
    }

    function drawBackground(pFloatingObject) {
        for (let i = 0; i < menuItems.length; i++) {
            let menuItem = menuItems[i]
            if (menuItem.visible === true) {
                menuItem.drawBackground()
            }
        }
    }

    function drawForeground(pFloatingObject) {
        for (let i = 0; i < menuItems.length; i++) {
            let menuItem = menuItems[i]
            if (menuItem.visible === true) {
                menuItem.drawForeground()
            }
        }
    }
}
