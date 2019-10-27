
function newCircularMenuItem () {
  const MODULE_NAME = 'Circular Menu Iem'

  let thisObject = {
    type: undefined,
    isDeployed: undefined,
    askConfirmation: undefined,
    confirmationLabel: undefined,
    iconOn: undefined,
    iconOff: undefined,
    currentIcon: undefined,
    action: undefined,
    actionFunction: undefined,
    actionStatus: undefined,
    label: undefined,
    workingLabel: undefined,
    workDoneLabel: undefined,
    workFailedLabel: undefined,
    secondaryAction: undefined,
    secondaryLabel: undefined,
    secondaryWorkingLabel: undefined,
    secondaryWorkDoneLabel: undefined,
    secondaryWorkFailedLabel: undefined,
    secondaryIcon: undefined,
    nextAction: undefined,
    visible: false,
    iconPathOn: undefined,
    iconPathOff: undefined,
    rawRadius: undefined,
    targetRadius: undefined,
    currentRadius: undefined,
    angle: undefined,
    container: undefined,
    payload: undefined,
    relatedUiObject: undefined,
    dontShowAtFullscreen: undefined,
    internalClick: internalClick,
    physics: physics,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = true
  thisObject.container.isDraggeable = false
  thisObject.container.detectMouseOver = true
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0
  thisObject.container.frame.width = 0
  thisObject.container.frame.height = 30

  let isMouseOver = false

  let selfMouseOverEventSubscriptionId
  let selfMouseClickEventSubscriptionId
  let selfMouseNotOverEventSubscriptionId

  let labelToPrint = ''
  let defaultBackgroudColor = UI_COLOR.RED
  let backgroundColorToUse = UI_COLOR.RED
  let temporaryStatus = 0
  let temporaryStatusCounter = 0

  const EXTRA_MOUSE_OVER_ICON_SIZE = 2

  const STATUS_NO_ACTION_TAKEN_YET = 0
  const STATUS_PRIMARY_ACTION_WORKING = -1
  const STATUS_SECONDARY_ACTION_WORKING = -2
  const STATUS_PRIMARY_WORK_DONE = -3
  const STATUS_PRIMARY_WORK_FAILED = -4
  const STATUS_WAITING_CONFIRMATION = -5
  const STATUS_SECONDARY_WORK_DONE = -6
  const STATUS_SECONDARY_WORK_FAILED = -7

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseNotOverEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.iconOn = undefined
    thisObject.iconOff = undefined
    thisObject.currentIcon = undefined
    thisObject.payload = undefined
    thisObject.actionFunction = undefined
    thisObject.actionStatus = undefined
  }

  function initialize (pPayload) {
    thisObject.payload = pPayload

    iconPhysics()

    selfMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    selfMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)

    if (thisObject.type === 'Icon & Text') {
      thisObject.container.frame.width = 185
    } else {
      thisObject.container.frame.width = 50
    }

    thisObject.nextAction = thisObject.action
  }

  function getContainer (point) {
    if (thisObject.dontShowAtFullscreen === true && AT_FULL_SCREEN_MODE === true) { return }

    let container
    if (thisObject.isDeployed === true) {
      if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
        return thisObject.container
      } else {
        return undefined
      }
    }
  }

  function physics () {
    if (thisObject.dontShowAtFullscreen === true && AT_FULL_SCREEN_MODE === true) { return }

    const INCREASE_STEP = 2

    if (Math.abs(thisObject.currentRadius - thisObject.targetRadius) >= INCREASE_STEP) {
      if (thisObject.currentRadius < thisObject.targetRadius) {
        thisObject.currentRadius = thisObject.currentRadius + INCREASE_STEP
      } else {
        thisObject.currentRadius = thisObject.currentRadius - INCREASE_STEP
      }
    }

    thisObject.container.frame.position.x = thisObject.container.frame.radius * 3 / 7 * Math.cos(toRadians(thisObject.angle)) - thisObject.currentRadius * 1.5
    thisObject.container.frame.position.y = thisObject.container.frame.radius * 3 / 7 * Math.sin(toRadians(thisObject.angle)) - thisObject.container.frame.height / 2

    /* Temporary Status impacts on the label to use and the background of that label */

    if (temporaryStatusCounter > 0) {
      temporaryStatusCounter--
    }

    if (temporaryStatusCounter === 0) {
      temporaryStatus = STATUS_NO_ACTION_TAKEN_YET
      labelToPrint = thisObject.label
      backgroundColorToUse = defaultBackgroudColor
      thisObject.nextAction = thisObject.action
    }

    iconPhysics()
  }

  function iconPhysics () {
    if (
    (
      temporaryStatus === STATUS_PRIMARY_WORK_DONE ||
      temporaryStatus === STATUS_SECONDARY_ACTION_WORKING ||
      temporaryStatus === STATUS_SECONDARY_WORK_DONE ||
      temporaryStatus === STATUS_SECONDARY_WORK_FAILED
    ) && thisObject.secondaryAction !== undefined
      ) {
      thisObject.iconOn = canvas.strategySpace.iconCollection.get(thisObject.secondaryIcon)
      thisObject.iconOff = canvas.strategySpace.iconCollection.get(thisObject.secondaryIcon)
    } else {
      if (thisObject.relatedUiObject !== undefined) {
        thisObject.iconOn = canvas.strategySpace.iconByPartType.get(thisObject.relatedUiObject)
        thisObject.iconOff = canvas.strategySpace.iconByPartType.get(thisObject.relatedUiObject)
      } else {
        thisObject.iconOn = canvas.strategySpace.iconCollection.get(thisObject.iconPathOn)
        thisObject.iconOff = canvas.strategySpace.iconCollection.get(thisObject.iconPathOff)
      }
    }

    /* Current Status might be linked to some other object status */

    if (thisObject.actionStatus !== undefined) {
      thisObject.currentStatus = thisObject.actionStatus()
    }

    /* Current Status sets the icon to be used */

    if (thisObject.currentStatus === true) {
      thisObject.icon = thisObject.iconOn
    } else {
      thisObject.icon = thisObject.iconOff
    }
  }

  function onMouseOver (point) {
    if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
      isMouseOver = true
    } else {
      isMouseOver = false
    }
  }

  function onMouseNotOver (point) {
    isMouseOver = false
  }

  function internalClick () {
    onMouseClick()
  }

  function onMouseClick () {
    if (thisObject.label === undefined) {
  /* This is what we have in the case of menu items that are only Icons. In this situation there is no complex logic, just execute the specified action. */
      thisObject.actionFunction(thisObject.payload, thisObject.action)
      return
    }

    if (thisObject.askConfirmation !== true) { /* No confirmation is needed */
      if (temporaryStatus === STATUS_NO_ACTION_TAKEN_YET || temporaryStatus === STATUS_PRIMARY_WORK_DONE) {
        executeAction()
      } // Any click out of those states is ignored
    } else {
 /* Confirmation is needed */

      /* The first click ask for confirmation. */
      if (temporaryStatus === STATUS_NO_ACTION_TAKEN_YET) {
        setStatus(thisObject.confirmationLabel, UI_COLOR.GREY, 250, STATUS_WAITING_CONFIRMATION)
        return
      }
      /* A Click during confirmation executes the pre-defined action. */
      if (temporaryStatus === STATUS_WAITING_CONFIRMATION || temporaryStatus === STATUS_PRIMARY_WORK_DONE) {
        executeAction()
        return
      }
    }

    function executeAction () {
      if (temporaryStatus === STATUS_NO_ACTION_TAKEN_YET || temporaryStatus === STATUS_WAITING_CONFIRMATION) {
        /* We need to execute the main Action */
        /* If there is a working label defined, we use it here. */
        if (thisObject.workingLabel !== undefined) {
          setStatus(thisObject.workingLabel, UI_COLOR.GREY, undefined, STATUS_PRIMARY_ACTION_WORKING) // Status will not expire, will only change with a callback. Mouse Clicks will be ignored.
        }

        /* Execute the action and wait for callbacks to update our statuus. */
        thisObject.actionFunction(thisObject.payload, thisObject.action, onPrimaryCallBack)
        return
      }
      if (temporaryStatus === STATUS_PRIMARY_WORK_DONE && thisObject.secondaryAction !== undefined) {
        /* We need to execute the secondary action. */
        if (thisObject.secondaryWorkingLabel !== undefined) {
          setStatus(thisObject.secondaryWorkingLabel, UI_COLOR.GREY, undefined, STATUS_SECONDARY_ACTION_WORKING) // Status will not expire, will only change with a callback. Mouse Clicks will be ignored.
        }

        /* Execute the action and wait for callbacks to update our statuus. */
        thisObject.actionFunction(thisObject.payload, thisObject.secondaryAction, onSecondaryCallBack)
        return
      }

      function onPrimaryCallBack (err, event) {
        /* While the primary action is being executed some event might have happen. Following we process the ones we can */

        if (event !== undefined) {
          if (event.type === 'Secondary Action Already Executed') {
            setStatus(thisObject.secondaryWorkDoneLabel, UI_COLOR.PATINATED_TURQUOISE, 250, STATUS_SECONDARY_WORK_DONE)
            return
          }
        }

        /* If there is a secondary action we will act different that if there is not */
        if (thisObject.secondaryAction === undefined) { // This means there are no more possible actions.
          if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
            if (thisObject.workDoneLabel !== undefined) {
              setStatus(thisObject.workDoneLabel, UI_COLOR.PATINATED_TURQUOISE, 250, STATUS_PRIMARY_WORK_DONE)
            }
          } else {
            if (thisObject.workFailedLabel != undefined) {
              setStatus(thisObject.workFailedLabel, UI_COLOR.TITANIUM_YELLOW, 500, STATUS_PRIMARY_WORK_FAILED)
            }
          }
        } else {
          if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
            if (thisObject.workDoneLabel !== undefined) {
              thisObject.nextAction = thisObject.secondaryAction
              setStatus(thisObject.secondaryLabel, defaultBackgroudColor, undefined, STATUS_PRIMARY_WORK_DONE)
            }
          } else {
            if (thisObject.workFailedLabel != undefined) {
              setStatus(thisObject.workFailedLabel, UI_COLOR.TITANIUM_YELLOW, 500, STATUS_PRIMARY_WORK_FAILED)
            }
          }
        }
      }
      function onSecondaryCallBack (err) {
        if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
          if (thisObject.secondaryWorkDoneLabel !== undefined) {
            setStatus(thisObject.secondaryWorkDoneLabel, UI_COLOR.PATINATED_TURQUOISE, 250, STATUS_SECONDARY_WORK_DONE)
          }
        } else {
          if (thisObject.secondaryWorkFailedLabel != undefined) {
            setStatus(thisObject.secondaryWorkFailedLabel, UI_COLOR.TITANIUM_YELLOW, 500, STATUS_SECONDARY_WORK_FAILED)
          }
        }
      }
    }
  }

  function setStatus (text, backgroundColor, waitingCycles, newStatus) {
    labelToPrint = text
    backgroundColorToUse = backgroundColor
    temporaryStatus = newStatus
    temporaryStatusCounter = newStatus // This will often put this into negatives numbers, which will disable the counting back and automatic reseting.
    if (waitingCycles !== undefined) { // This will override the often negative value with a positive one that will tend to zero onto the default state.
      temporaryStatusCounter = waitingCycles
    }
  }

  function drawBackground () {
    if (thisObject.dontShowAtFullscreen === true && AT_FULL_SCREEN_MODE === true) { return }

    if (thisObject.container.frame.position.x > 0 && thisObject.isDeployed === true && thisObject.currentRadius >= thisObject.targetRadius) {
      if (thisObject.type === 'Icon & Text') {
        let params = {
          cornerRadius: 3,
          lineWidth: 0.1,
          container: thisObject.container,
          borderColor: UI_COLOR.DARK,
          backgroundColor: backgroundColorToUse,
          castShadow: false,
          xOffset: 40
        }

        if (isMouseOver === true) {
          params.opacity = 1
        } else {
          params.opacity = 0.8
        }

        roundedCornersBackground(params)
      }
    }
  }

  function drawForeground () {
    if (thisObject.dontShowAtFullscreen === true && AT_FULL_SCREEN_MODE === true) { return }

    let menuPosition = {
      x: thisObject.currentRadius * 1.5,
      y: thisObject.container.frame.height / 2
    }

    menuPosition = thisObject.container.frame.frameThisPoint(menuPosition)

        /* Menu  Item */

    let iconSize
    if (isMouseOver === true) {
      iconSize = thisObject.currentRadius + EXTRA_MOUSE_OVER_ICON_SIZE
    } else {
      iconSize = thisObject.currentRadius
    }

    if (thisObject.icon.canDrawIcon === true && thisObject.currentRadius > 1 && thisObject.isDeployed === true) {
      browserCanvasContext.drawImage(thisObject.icon, menuPosition.x - iconSize, menuPosition.y - iconSize, iconSize * 2, iconSize * 2)

        /* Menu Label */

      if (thisObject.type === 'Icon & Text') {
        let labelPoint
        let fontSize = 10

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

        if (thisObject.currentRadius >= thisObject.targetRadius) {
          labelPoint = {
            x: menuPosition.x + thisObject.currentRadius + 20,
            y: menuPosition.y + fontSize * FONT_ASPECT_RATIO
          }

          browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
          browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
          browserCanvasContext.fillText(labelToPrint, labelPoint.x, labelPoint.y)
        }
      }
    }
  }
}

