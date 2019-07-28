
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
    visible: false,
    iconPathOn: undefined,
    iconPathOff: undefined,
    rawRadius: undefined,
    targetRadius: undefined,
    currentRadius: undefined,
    angle: undefined,
    container: undefined,
    payload: undefined,
    relatedStrategyPart: undefined,
    dontShowAtFullscreen: undefined,
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

  const EXTRA_MOUSE_OVER_ICON_SIZE = 2
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
      thisObject.container.frame.width = 150
    } else {
      thisObject.container.frame.width = 50
    }
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

    temporaryStatus--
    if (temporaryStatus < 0) {
      temporaryStatus = 0
    }
    if (temporaryStatus === 0) {
      labelToPrint = thisObject.label
      backgroundColorToUse = defaultBackgroudColor
    }

    iconPhysics()
  }

  function iconPhysics () {
    if (thisObject.relatedStrategyPart !== undefined) {
      thisObject.iconOn = canvas.strategySpace.iconByPartType.get(thisObject.relatedStrategyPart)
      thisObject.iconOff = canvas.strategySpace.iconByPartType.get(thisObject.relatedStrategyPart)
    } else {
      thisObject.iconOn = canvas.strategySpace.iconCollection.get(thisObject.iconPathOn)
      thisObject.iconOff = canvas.strategySpace.iconCollection.get(thisObject.iconPathOff)
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

  async function onMouseClick (event) {
    if (temporaryStatus === 0 && thisObject.askConfirmation !== true) {
      if (thisObject.workingLabel !== undefined) {
        setTemporaryStatus(thisObject.workingLabel, UI_COLOR.GREY, 500)
      }

      thisObject.currentStatus = await thisObject.actionFunction(thisObject.payload, thisObject.action)

      if (thisObject.currentStatus === true) {
        if (thisObject.workDoneLabel !== undefined) {
          setTemporaryStatus(thisObject.workDoneLabel, UI_COLOR.PATINATED_TURQUOISE, 250)
        }
      } else {
        if (thisObject.workFailedLabel != undefined) {
          setTemporaryStatus(thisObject.workFailedLabel, UI_COLOR.TITANIUM_YELLOW, 500)
        }
      }
    }

    if (temporaryStatus > 0 && thisObject.askConfirmation === true) {
      thisObject.currentStatus = await thisObject.actionFunction(thisObject.payload, thisObject.action)
    }

    if (temporaryStatus === 0 && thisObject.askConfirmation === true) {
      setTemporaryStatus(thisObject.confirmationLabel, UI_COLOR.GREY, 50)
    }
  }

  function setTemporaryStatus (text, backgroundColor, waitingCycles) {
    labelToPrint = text
    backgroundColorToUse = backgroundColor
    temporaryStatus = waitingCycles
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
          castShadow: false
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
            x: menuPosition.x + thisObject.currentRadius + 10,
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

